const { Emotion, Comment, Post, User } = require("../models/initModels");

// Create a new emotion
const createEmotion = async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.body.emotion;
    let postId = null;
    let commentId = null;

    if (req.body.postId) {
      postId = req.body.postId;
    } else if (req.body.commentId) {
      commentId = req.body.commentId;
    } else {
      return res.status(400).json({ error: "PostId or CommentId is required" });
    }

    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    const emotion = await Emotion.create({
      userId,
      postId,
      commentId,
      type,
    });

    return res.status(201).json({
      success: true,
      data: emotion,
    });
  } catch (error) {
    console.error("Error creating emotion:", error);
    return res.status(500).json({ error: "Internal server error " + error });
  }
};

// Get all emotions
const getAllEmotions = async (req, res) => {
  try {
    let emotions = [];

    if (req.body.postId) {
      const postId = req.body.postId;
      emotions = await Emotion.findAll({
        where: { postId },
      });
    } else if (req.body.commentId) {
      const commentId = req.body.commentId;
      emotions = await Emotion.findAll({
        where: { commentId },
      });
    } else {
      return res.status(400).json({ error: "PostId or CommentId is required" });
    }

    return res.status(200).json({
      success: true,
      data: emotions,
    });
  } catch (error) {
    console.error("Error getting emotions:", error);
    return res.status(500).json({ error: "Internal server error " + error });
  }
};

// Update a emotion
const updateEmotion = async (req, res) => {
  try {
    const { id } = req.params;
    const type = req.body.emotion;
    const userId = req.user.id;

    if (!type) {
      return res.status(400).json({ error: "Emotion type is required" });
    }

    const emotion = await Emotion.findByPk(id);
    if (!emotion) {
      return res.status(404).json({ error: "Emotion not found" });
    }

    if (emotion.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to update this emotion" });
    }

    emotion.type = type;
    await emotion.save();

    return res.status(200).json({
      success: true,
      data: emotion,
    });
  } catch (error) {
    console.error("Error updating emotion:", error);
    return res.status(500).json({ error: "Internal server error " + error });
  }
};

// Delete a emotion
const deleteEmotion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const emotion = await Emotion.findByPk(id);
    if (!emotion) {
      return res.status(401).json({ error: "Comment not found" });
    }

    if (emotion.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this emotion" });
    }

    await emotion.destroy();

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting emotion:", error);
    return res.status(500).json({ error: "Internal server error " + error });
  }
};

module.exports = {
  createEmotion,
  getAllEmotions,
  updateEmotion,
  deleteEmotion,
};
