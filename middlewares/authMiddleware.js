const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Kiểm tra có header Authorization không
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  // Lấy token từ header
  const token = authHeader.split(" ")[1];

  try {
    // Giải mã token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Forbidden: Invalid token" });
        }
      }
    );
    req.user = decoded; // Lưu thông tin user vào req để sử dụng sau này
    next(); // Cho phép tiếp tục request
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
};
