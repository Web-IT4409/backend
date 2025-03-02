const jwt = require("jsonwebtoken");
require("dotenv").config();
const { isTokenRevoked } = require("../services/redisService");

const tokenVerifier = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Kiểm tra có header Authorization không
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  // Lấy token từ header
  const token = authHeader.split(" ")[1];

  try {
    // Check if token is revoked
    const revoked = await isTokenRevoked(token);
    if (revoked) {
      return res.status(401).json({ error: "token is revoked" });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // If verification is successful, set user and token in request
    req.user = decoded;
    req.token = token;
    next(); // Cho phép tiếp tục request
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

module.exports = {
  tokenVerifier,
  generateAccessToken
};
