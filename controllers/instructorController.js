const UserCourse = require("../models/UserCourse");
const Course = require("../models/Course");
const User = require("../models/User"); // assuming you have a User model

// ----------------------------------
// Get all students for a course
// ----------------------------------
exports.getStudentsForCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const students = await UserCourse.find({ courseId })
      .populate("userId", "name email")
      .lean();

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------
// Get KPI for a course
// ----------------------------------
exports.getCourseKPI = async (req, res) => {
  const { courseId } = req.params;

  try {
    const userCourses = await UserCourse.find({ courseId }).lean();
    const totalStudents = userCourses.length;
    const completedStudents = userCourses.filter(
      (u) => u.progress >= 100
    ).length;
    const averageProgress =
      totalStudents > 0
        ? userCourses.reduce((acc, u) => acc + (u.progress || 0), 0) /
          totalStudents
        : 0;

    res.json({
      totalStudents,
      completedStudents,
      averageProgress: Math.round(averageProgress),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------
// Get detailed progress for a student in a course
// ----------------------------------
exports.getStudentProgress = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const record = await UserCourse.findOne({ userId, courseId }).lean();
    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getInstructorCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id).lean();
    if (!course) return res.status(404).json({ message: "Not found" });

    const students = await UserCourse.find({ courseId: id })
      .populate("userId", "name email")
      .lean();

    const formatted = {
      ...course,
      studentsList: students.map((s) => ({
        _id: s._id,
        userId: s.userId._id,
        name: s.userId.name,
        email: s.userId.email,
        progress: s.progress || 0,
        progressValue: s.progress || 0,
        quizPassed: s.quizResults?.filter((q) => q.passed).length || 0,
        quizFailed: s.quizResults?.filter((q) => !q.passed).length || 0,
        lastActivity: s.lastVisitedChapter || "—",
      })),
      students: students.length,
      avgProgress:
        students.length > 0
          ? Math.round(
              students.reduce((a, s) => a + (s.progress || 0), 0) /
                students.length
            )
          : 0,
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------
// Get all courses for an instructor with student data
// ----------------------------------
exports.getInstructorCourses = async (req, res) => {
  try {
    console.log("Instructor user:", req.user);
    const instructorId = req.user._id;
    const instructorName = `${req.user.firstName} ${req.user.lastName}`.trim();

    const courses = await Course.find({
      instructorId: instructorId, // use ID not name
    }).lean();

    const courseIds = courses.map((c) => c._id);

    const userCourses = await UserCourse.find({
      courseId: { $in: courseIds },
    })
      .populate("userId", "firstName lastName email")
      .lean();

    const coursesWithStudents = courses.map((course) => {
      const students = userCourses
        .filter((uc) => uc.courseId.toString() === course._id.toString())
        .map((uc) => ({
          _id: uc._id,
          userId: uc.userId._id,
          name: `${uc.userId.firstName} ${uc.userId.lastName}`,
          email: uc.userId.email,
          progress: uc.progress || 0,
          lastVisitedChapter: uc.lastVisitedChapter,
          quizResults: uc.quizResults || [],
        }));

      const avgProgress =
        students.length > 0
          ? Math.round(
              students.reduce((a, s) => a + s.progress, 0) / students.length
            )
          : 0;

      return {
        ...course,
        students,
        averageProgress: avgProgress,
        totalStudents: students.length,
      };
    });

    res.json(coursesWithStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------
// Get overall KPI for instructor
// ----------------------------------
exports.getInstructorKPI = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({
      instructorId: instructorId, // use ID not name
    }).lean();

    const courseIds = courses.map((c) => c._id);
    const userCourses = await UserCourse.find({
      courseId: { $in: courseIds },
    }).lean();

    const totalCourses = courses.length;
    const totalStudents = new Set(userCourses.map((s) => s.userId.toString()))
      .size;
    const totalRevenue = courses.reduce((acc, c) => acc + (c.price || 0), 0);
    const averageProgress =
      userCourses.length > 0
        ? userCourses.reduce((acc, s) => acc + (s.progress || 0), 0) /
          userCourses.length
        : 0;

    res.json({
      totalCourses,
      totalStudents,
      totalRevenue,
      averageProgress: Math.round(averageProgress),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
