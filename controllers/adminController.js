const User = require("../models/User");
const Course = require("../models/Course");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalCourses,
      recentUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
