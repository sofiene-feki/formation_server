module.exports = (req, res, next) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin")
    return res.status(403).json({ error: "Instructor only" });

  next();
};
