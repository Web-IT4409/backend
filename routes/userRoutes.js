const express = require("express");
const { loginUser, getUsers, createUser } = require("../services/userService");

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", loginUser);

module.exports = router;
