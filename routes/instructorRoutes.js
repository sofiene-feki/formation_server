const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");

const {
  getStudentsForCourse,
  getCourseKPI,
  getStudentProgress,
  getInstructorKPI,
  getInstructorCourses,
  getInstructorCourseById,
} = require("../controllers/instructorController");

// Protect all routes

// Course-level info
router.get("/instructor/course/:courseId/students", getStudentsForCourse);
router.get("/instructor/course/:courseId/kpi", requireAuth, getCourseKPI);
router.get("/instructor/course/:courseId/student/:userId", getStudentProgress);

// Instructor-level
router.get("/instructor/kpi", requireAuth, getInstructorKPI);
router.get("/instructor/courses", requireAuth, getInstructorCourses);
router.get("/instructor/course/:id", getInstructorCourseById);

module.exports = router;
