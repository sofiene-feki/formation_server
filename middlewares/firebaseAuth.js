const admin = require("../config/firebaseAdmin");

// Middleware pour vérifier le token Firebase et injecter `req.user`
module.exports = async function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Firebase auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
