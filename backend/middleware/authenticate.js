const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET not configured");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded; // { id, email, full_name }
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticate;