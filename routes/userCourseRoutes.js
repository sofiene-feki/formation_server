const express = require("express");
const router = express.Router();

const {
  assignCourse,
  getProgress,
  updateItemProgress, // ✅ merged endpoint
  getAllForUser,
  getStudentsForCourse,
  deleteUserCourse,
} = require("../controllers/userCourseController");

// If you have auth middleware, add:
// const { protect } = require("../middlewares/auth");

// Get progress for a user/course
router.get("/user-course/:userId/:courseId/progress", getProgress);

// Update progress for any content item (chapter/video/quiz)
router.put(
  "/user-course/:userId/:courseId/update-progress",
  updateItemProgress
);

// --------------------------------------------------
// ENROLLMENT
// --------------------------------------------------

// Assign course to user
router.post("/user-course/assign", assignCourse);
// if protected:
// router.post("/assign", protect, assignCourse);

// --------------------------------------------------
// PROGRESS
// --------------------------------------------------

// --------------------------------------------------
// USERS → THEIR COURSES (My Courses Page)
// --------------------------------------------------
router.get("/user-course/user/:userId", getAllForUser);

// --------------------------------------------------
// INSTRUCTOR → STUDENT LIST FOR A COURSE
// --------------------------------------------------
router.get("/user-course/course/:courseId/students", getStudentsForCourse);

// --------------------------------------------------
// REMOVE ENROLLMENT (Admin)
// --------------------------------------------------
router.delete("/user-course/:id", deleteUserCourse);

module.exports = router;
