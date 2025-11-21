const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");
const { requireAdmin } = require("../middlewares/adminMiddleware");

router.get("/admin/dashboard", requireAdmin, getDashboardStats);

module.exports = router;
