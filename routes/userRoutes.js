const express = require("express");
const {
  login,
  getUser,
  createUser,
  getAll,
  logout,
  getAllUsers,
} = require("../services/userService");
const { tokenVerifier } = require("../middlewares/authMiddleware");
const { activeAccountFilter } = require("../middlewares/statusMiddleware");
const router = express.Router();

/**
 * @description: require middleware
 */
// get single user detail
router.get("/detail", tokenVerifier, activeAccountFilter, getUser);
router.post("/logout", tokenVerifier, logout);
// get all users with optional friend filtering
router.post("/all", tokenVerifier, getAllUsers);

/**
 * @description: require no auth
 */
router.post("/register", createUser);
router.post("/login", login);

/**
 * @description: for development
 */
router.get("/getAll", getAll);

module.exports = router;
