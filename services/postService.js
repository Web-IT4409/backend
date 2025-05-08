const comment = require("../models/comment");
const { User, Post, Comment } = require("../models/initModels");
const { Post: PostEnums } = require("../utils/enum");
const Sequelize = require("sequelize");
const {
  friendPosts,
  recommendPosts,
  groupPosts,
} = require("../middlewares/recommendPosts");
const { UserFriend } = require("../models/initModels");
const { Op } = require("sequelize");

// Create a new post
const createPost = async (req, res) => {
  try {
    const content = req.body.content;
    const mediaUrl = req.body.mediaUrl;
    const visibility = req.body.visibility;
    const groupId = req.body.groupId;
    const userId = req.user.id; // User ID from token

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Validate visibility if provided
    if (
      visibility &&
      !Object.values(PostEnums.VISIBILITY).includes(visibility)
    ) {
      return res.status(400).json({ error: "Invalid visibility option" });
    }

    // Validate mediaUrl
    let mediaUrlArray = [];
    if (mediaUrl) {
      // Ensure mediaUrl is an array
      if (Array.isArray(mediaUrl)) {
        mediaUrlArray = mediaUrl;
      } else {
        try {
          // Try to parse if it's a JSON string
          mediaUrlArray = JSON.parse(mediaUrl);
          if (!Array.isArray(mediaUrlArray)) {
            mediaUrlArray = [];
          }
        } catch (e) {
          // If not a valid JSON string, use empty array
          mediaUrlArray = [];
        }
      }
    }

    const post = await Post.create({
      userId,
      content,
      mediaUrl: mediaUrlArray,
      visibility: visibility || PostEnums.VISIBILITY.PUBLIC,
      groupId: groupId || null,
    });

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const requestingUserId = req.user.id;
    const targetUserId = req.query.userId || requestingUserId;

    // Lấy danh sách bạn bè
    const userFriends = await UserFriend.findAll({
      where: {
        [Op.or]: [
          { user_id_1: requestingUserId },
          { user_id_2: requestingUserId },
        ],
      },
    });

    // Lấy danh sách ID của bạn bè
    const friendIds = userFriends.map((friend) =>
      friend.user_id_1 === requestingUserId
        ? friend.user_id_2
        : friend.user_id_1
    );

    // Thêm requestingUserId vào danh sách để có thể xem tất cả bài viết của mình
    friendIds.push(requestingUserId);

    // Lấy tất cả bài viết
    const posts = await Post.findAll({
      where: {
        status: PostEnums.STATUS.ACTIVE,
        [Op.or]: [
          // Lấy tất cả bài viết của user đang request
          { userId: requestingUserId },
          // Lấy bài viết public của người khác
          { visibility: PostEnums.VISIBILITY.PUBLIC },
          // Lấy bài viết private của bạn bè
          {
            [Op.and]: [
              { visibility: PostEnums.VISIBILITY.PRIVATE },
              { userId: { [Op.in]: friendIds } },
            ],
          },
        ],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "username"],
        },
        {
          model: Comment,
          attributes: [], // Không lấy dữ liệu comment
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("Comments.id")),
            "countComments",
          ],
        ],
      },
      group: ["Post.id", "User.id"], // Cần group để COUNT() hoạt động đúng
    });

    console.log("posts are :");
    console.log(posts);

    const postsFromFriends = await friendPosts(requestingUserId, posts);

    console.log("posts from friends are :");
    console.log(postsFromFriends);

    const postsFromGroups = await groupPosts(requestingUserId, posts);

    const recommendedPosts = await recommendPosts(
      postsFromFriends,
      postsFromGroups,
      requestingUserId,
      posts
    );

    console.log("recommended posts are :");
    console.log(recommendedPosts);

    const finalPosts = [...postsFromFriends, ...recommendedPosts];

    return res.status(200).json({
      success: true,
      data: finalPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],
    });
    const comments = await Comment.findAll({
      where: { postId: id },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the post is visible to the requesting user
    if (
      post.visibility === PostEnums.VISIBILITY.PRIVATE &&
      post.userId != requestingUserId
    ) {
      return res
        .status(403)
        .json({ error: "You do not have permission to view this post" });
    }

    return res.status(200).json({
      success: true,
      data: { post, comments },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Failed to fetch post" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mediaUrl, visibility } = req.body;
    const userId = req.user.id;

    if (!content && !mediaUrl && !visibility) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId != userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this post" });
    }

    post.content = content;
    post.mediaUrl = mediaUrl;
    post.visibility = visibility;
    await post.save();

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Failed to update post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId != userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this post" });
    }

    await post.destroy();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Failed to delete post" });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
