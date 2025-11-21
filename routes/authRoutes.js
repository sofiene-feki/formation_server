const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");
const requireAuth = require("../middlewares/requireAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser); // <-- new endpoint

module.exports = router;
