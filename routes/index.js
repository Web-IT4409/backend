const express = require("express");
const userRoutes = require("./userRoutes");
const healthRoutes = require("./healthRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const friendRoutes = require("./friendRoutes");
const emotionRoutes = require("./emotionRoutes");
const groupRoutes = require("./groupRoutes");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/health", healthRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/friends", friendRoutes);
router.use("/emotions", emotionRoutes);
router.use("/groups", groupRoutes);
module.exports = router;
