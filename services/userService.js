const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../middlewares/authMiddleware");
const { revokeToken } = require("../services/redisService");
require("dotenv").config();
const User = require("../models/user");

const getUser = async (req, res) => {
  const parsedUser = req.user;
  const userId = parsedUser === null ? null : parsedUser.id;
  if (userId === null) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const user = await User.findByPk(userId);

  res.status(200).json(user);
};

const getAll = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

const createUser = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res
      .status(201)
      .json({ message: "user created successfully with id: " + newUser.id });
  } catch (error) {
    console.error("creating user error: ", error);
    res.status(500).json({ error: "internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required" });
  }

  const user = await User.unscoped().findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  if (!user.password) {
    return res.status(500).json({ error: "User password data is corrupted" });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "wrong password" });
    }

    // Remove password from response
    const userWithoutPassword = { ...user.get(), password: undefined };

    const token = generateAccessToken(userWithoutPassword);
    res.status(200).json({ token: token, user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "an error occurred during authentication" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;
    await revokeToken(token);
    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "An error occurred during logout" });
  }
};

module.exports = {
  login,
  getUser,
  createUser,
  getAll,
  logout,
};
