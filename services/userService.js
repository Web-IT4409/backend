const mysqlConnection = require("../config/database/index");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/authMiddleware");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const getUsers = (req, res) => {
  mysqlConnection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("fetching users err: ", err);
      res.status(500).json({ error: "internal err" });
      return;
    }
    res.json(results);
  });
};

const createUser = (req, res) => {
  const { name, email } = req.body;
  mysqlConnection.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err, results) => {
      if (err) {
        console.error("insert user err: ", err);
        res.status(500).json({ error: "internal err" });
        return;
      }
      res.status(201).json({ message: "user created successfully" });
    }
  );
};

// 🔹 API Đăng Nhập (Login User)
const loginUser = (req, res) => {
  const { email, password } = req.body;

  mysqlConnection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Fetching user error: ", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];

      // Kiểm tra password
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Tạo JWT token
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      res.json({
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email },
      });
    }
  );
};

module.exports = {
  loginUser,
  getUsers,
  createUser,
};
