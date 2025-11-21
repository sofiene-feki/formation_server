const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const protect = require("../middlewares/requireAuth");
const admin = require("../middlewares/requireAdmin");

router.get("/admin/users", protect, admin, getAllUsers); // GET /api/users
router.get("/admin/users/:id", protect, admin, getUserById); // GET /api/users/:id
router.put("/admin/users/:id", protect, admin, updateUser); // PUT /api/users/:id
router.delete("/admin/users/:id", protect, admin, deleteUser); // DELETE /api/users/:id

module.exports = router;
