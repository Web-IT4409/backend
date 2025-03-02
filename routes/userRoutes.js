const express = require("express");
const { loginUser, getUsers, createUser } = require("../services/userService");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.get("/", authenticateToken, getUsers);
router.post("/", createUser);

module.exports = router;
