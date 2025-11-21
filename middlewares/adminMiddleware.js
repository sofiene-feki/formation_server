const User = require("../models/User");

exports.requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
