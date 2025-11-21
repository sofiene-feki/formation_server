const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

const requireAuth = require("../middlewares/requireAuth");
const requireInstructor = require("../middlewares/requireInstructor");
const requireAdmin = require("../middlewares/requireAdmin");

// ---------------------
// Instructor routes
// ---------------------

// Get all courses created by the logged-in instructor
router.get(
  "/courses/instructor",
  requireAuth,
  requireInstructor,
  courseController.getCoursesByInstructor
);

// Create a new course (instructor or admin)
router.post(
  "/courses",
  requireAuth,
  requireInstructor,
  courseController.createCourse
);

// ---------------------
// Public routes
// ---------------------

// Get all courses (public)
router.get("/courses", courseController.getCourses);

// Get single course (public)
router.get("/courses/:id", courseController.getCourseById);

// ---------------------
// Protected update/delete
// ---------------------

// Update course (only course owner or admin)
router.put("/courses/:id", requireAuth, courseController.updateCourse);

// Delete course (only course owner or admin)
router.delete("/courses/:id", requireAuth, courseController.deleteCourse);

module.exports = router;
