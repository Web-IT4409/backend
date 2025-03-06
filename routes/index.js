const express = require("express");
const userRoutes = require("./userRoutes");
const healthRoutes = require("./healthRoutes");
const postRoutes = require("./postRoutes");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/health", healthRoutes);
router.use("/posts", postRoutes);

module.exports = router;
