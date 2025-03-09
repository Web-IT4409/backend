const express = require("express");
const userRoutes = require("./userRoutes");
const healthRoutes = require("./healthRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/health", healthRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);

module.exports = router;
