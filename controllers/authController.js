const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already used." });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      user,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res.json({
      user: safeUser,
      token: generateToken(safeUser), // ✔ FIXED
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCurrentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const user = {
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    role: req.user.role,
  };

  res.json(user);
};
