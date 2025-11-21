// controllers/userCourseController.js
const mongoose = require("mongoose");
const UserCourse = require("../models/UserCourse");
const Course = require("../models/Course");

// --------------------------------------------------
// 1. Assign course to user
// --------------------------------------------------
exports.assignCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const existing = await UserCourse.findOne({ userId, courseId });
    if (existing) {
      return res.status(409).json({ message: "User already enrolled" });
    }

    const userCourse = await UserCourse.create({
      userId,
      courseId,
      lastVisitedChapter: 0,
      progress: 0,
      completed: false,
      quizResults: [],
    });

    res.status(201).json({ success: true, data: userCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 2. Get user progress for a course
// --------------------------------------------------
exports.getProgress = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const record = await UserCourse.findOne({ userId, courseId });

    if (!record) {
      return res.status(200).json({
        enrolled: false,
        lastVisitedChapter: 0,
        progress: 0,
        completed: false,
        quizResults: [],
      });
    }

    res.json({ enrolled: true, ...record.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 3. Update progression (chapter navigation)
// --------------------------------------------------
exports.updateProgress = async (req, res) => {
  const { userId, courseId } = req.params;
  const { lastVisitedChapter } = req.body;

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const totalChapters = course.chapters?.length || 1; // avoid division by 0

    const record = await UserCourse.findOne({ userId, courseId });
    if (!record)
      return res.status(404).json({ message: "Enrollment not found" });

    const safeIndex = Math.max(0, Math.min(lastVisitedChapter, totalChapters));
    record.lastVisitedChapter = safeIndex;
    record.progress = (safeIndex / totalChapters) * 100;

    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// --------------------------------------------------
// 4. Submit Quiz Result
// --------------------------------------------------
exports.submitQuiz = async (req, res) => {
  const { userId, courseId } = req.params;
  const { chapterIndex, score, passed, totalChapters } = req.body;

  try {
    const record = await UserCourse.findOne({ userId, courseId });

    if (!record) {
      return res.status(404).json({ message: "User is not enrolled" });
    }

    const idx = record.quizResults.findIndex(
      (q) => q.chapterIndex === chapterIndex
    );

    const result = {
      chapterIndex,
      score,
      passed: !!passed,
      takenAt: new Date(),
    };

    // update or add quiz result
    if (idx >= 0) record.quizResults[idx] = result;
    else record.quizResults.push(result);

    // unlock next chapter only if passed
    if (passed) {
      const next = chapterIndex + 1;
      if (next > record.lastVisitedChapter) {
        record.lastVisitedChapter = next;
      }
    }

    // recalc progress %
    if (totalChapters) {
      record.progress = Math.round(
        ((record.lastVisitedChapter + 1) / totalChapters) * 100
      );

      if (record.progress === 100) {
        record.completed = true;
        record.completedAt = new Date();
      }
    }

    await record.save();
    res.json(record);
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 5. List all courses for a user (My Courses page)
// --------------------------------------------------
exports.getAllForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const courses = await UserCourse.find({ userId })
      .populate("courseId", "title description thumbnail instructor chapters")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 6. Retrieve all students enrolled in a course (Instructor Dashboard)
// --------------------------------------------------
exports.getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await UserCourse.find({ courseId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 7. Delete user enrollment (admin action)
// --------------------------------------------------
exports.deleteUserCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await UserCourse.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// --------------------------------------------------
// Update progress for a content item (chapter/video or quiz)
// --------------------------------------------------
exports.updateItemProgress = async (req, res) => {
  const { userId, courseId } = req.params;
  const {
    itemIndex,
    type, // "chapter", "video", or "quiz"
    completed,
    watchedSeconds,
    totalSeconds,
    score,
    passed,
    attempts,
  } = req.body;

  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const record = await UserCourse.findOne({ userId, courseId });
    if (!record)
      return res.status(404).json({ message: "Enrollment not found" });

    // Find existing progress for this item
    const idx = record.itemsProgress.findIndex(
      (item) => item.itemIndex === itemIndex && item.type === type
    );

    // Build progress object
    const itemProgress = {
      itemIndex,
      type,
      completed: completed ?? false,
      completedAt: completed ? new Date() : undefined,
    };

    if (type === "video" || type === "chapter") {
      itemProgress.watchedSeconds = watchedSeconds || 0;
      itemProgress.totalSeconds = totalSeconds || 0;
      itemProgress.videoCompleted = type === "video" ? !!completed : undefined;
    }

    if (type === "quiz") {
      itemProgress.score = score ?? 0;
      itemProgress.passed = !!passed;
      itemProgress.attempts = attempts || 1;
    }

    if (idx >= 0) {
      record.itemsProgress[idx] = {
        ...record.itemsProgress[idx],
        ...itemProgress,
      };
    } else {
      record.itemsProgress.push(itemProgress);
    }

    // Update last visited content index
    record.lastVisitedContent = Math.max(record.lastVisitedContent, itemIndex);

    // Recalculate overall progress based on completed items
    const totalItems = course.contentItems?.length || 1;
    const completedItems = record.itemsProgress.filter(
      (i) => i.completed
    ).length;
    record.progress = Math.round((completedItems / totalItems) * 100);

    // Mark course as completed if all items are done
    if (record.progress === 100) {
      record.completed = true;
      record.completedAt = new Date();
    }

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
