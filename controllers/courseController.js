const Course = require("../models/Course");

// Create a new course
// controllers/courseController.js
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      level = "Beginner",
      difficulty = "Easy",
      price = 0,
      discountPrice = 0,
      duration = "",
      language = "",
      category = "",
      prerequisites = "",
      thumbnail = null,
      promoVideo = null,
      contentItems = [], // <- correctly use contentItems
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Instructor info from JWT
    const instructorId = req.user._id;
    const instructorName =
      req.user.firstName && req.user.lastName
        ? `${req.user.firstName} ${req.user.lastName}`.trim()
        : "Unknown Instructor";

    const course = new Course({
      title,
      description,
      level,
      difficulty,
      price,
      discountPrice,
      duration,
      language,
      category,
      prerequisites,
      thumbnail,
      promoVideo,
      contentItems, // save chapters and quizzes correctly
      instructorId,
      Instructeur: instructorName,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Only instructor or admin can update
    if (
      course.instructorId.toString() !== req.user._id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(course, req.body);
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      course.instructorId.toString() !== req.user._id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await course.remove();
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all courses by logged-in instructor
exports.getCoursesByInstructor = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user._id });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
