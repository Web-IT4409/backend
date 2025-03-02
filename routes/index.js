const express = require("express");
const userRoutes = require("./userRoutes");
const healthRoutes = require("./healthRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/health", healthRoutes);

module.exports = router;
