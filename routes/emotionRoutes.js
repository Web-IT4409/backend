const express = require("express");
const {
  createEmotion,
  getAllEmotions,
  updateEmotion,
  deleteEmotion,
} = require("../services/emotionService");

const { tokenVerifier } = require("../middlewares/authMiddleware");
const { activeAccountFilter } = require("../middlewares/statusMiddleware");

const router = express.Router();

router.use(tokenVerifier);
router.use(activeAccountFilter);

router.post("/", createEmotion);

router.get("/", getAllEmotions);

router.patch("/:id", updateEmotion);

router.delete("/:id", deleteEmotion);

module.exports = router;
