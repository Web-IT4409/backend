const { Comment, Post, User } = require("../models/initModels");
const { Comment: CommentEnums } = require("../utils/enum");

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await Comment.create({
      userId,
      postId,
      content,
    });

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Internal server error " + error });
  }
};

// Get all comments for a post
const getAllComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.findAll({
      where: { postId },
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId != userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this comment" });
    }

    comment.content = content;
    comment.mediaUrl = mediaUrl || comment.mediaUrl; // Update mediaUrl only if provided
    await comment.save();

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId != userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this comment" });
    }

    await comment.destroy();

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
};
