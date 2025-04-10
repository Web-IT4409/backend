const { User, UserFriend } = require("../models/initModels");
const { Op } = require("sequelize");
const { Post: PostEnums } = require("../utils/enum");

// Get posts from friends then arrange by time
const friendPosts = async (userId, posts) => {
  try {
    // Lấy danh sách bạn bè từ bảng user_friends
    const userFriends = await UserFriend.findAll({
      where: {
        [Op.or]: [{ user_id_1: userId }, { user_id_2: userId }],
      },
    });

    // Lấy danh sách ID của bạn bè
    const friendIds = userFriends.map((friend) =>
      friend.user_id_1 === userId ? friend.user_id_2 : friend.user_id_1
    );

    // Nếu user không có bạn bè, trả về tất cả posts
    if (friendIds.length === 0) {
      return posts;
    }

    // Lọc posts của bạn bè và posts của chính user
    const friendPosts = posts.filter((post) => {
      // Nếu là post của chính user, hiển thị tất cả
      if (post.userId === userId) {
        return true;
      }
      // Nếu là post của bạn bè, chỉ hiển thị posts public
      if (friendIds.includes(post.userId)) {
        return post.visibility === PostEnums.VISIBILITY.PUBLIC;
      }
      return false;
    });

    return friendPosts;
  } catch (error) {
    console.error("Error in friendPosts:", error);
    throw error;
  }
};

const groupPosts = async (userId, posts) => {
  try {
    const groupId = await User.findByPk(userId, { 
      attributes: ["groupId"],
    });
    const groupPosts = posts.filter((post) => post.groupId === groupId);
    return groupPosts;
  } catch (error) {
    console.error("Error in groupPosts:", error);
    throw error;
  }
};
// Recommend posts based on hashtags
const recommendPosts = async (friendPosts,groupPosts, userId, posts) => {
  const user = await User.findByPk(userId);
  const userHashtags = user.hashtags;

  if (userHashtags.length === 0) {
    return posts;
  }

  try {
    // Lấy danh sách ID của friend posts
    const friendPostIds = friendPosts.map((post) => post.id);

    // Lọc posts không phải của bạn bè và chỉ lấy posts public
    const nonFriendPosts = posts.filter(
      (post) =>
        !friendPostIds.includes(post.id) &&
        post.visibility === PostEnums.VISIBILITY.PUBLIC
    );

    // Filter posts from groups
    const groupPostIds = groupPosts.map((post) => post.id);
    const nonGroupPosts = posts.filter(
      (post) => !groupPostIds.includes(post.id)
    );

    // Combine posts from friends and groups
    const combinedPosts = [...nonFriendPosts, ...nonGroupPosts];

    // Tính điểm tương đồng cho mỗi bài viết
    const postsWithScores = combinedPosts.map((post) => {
      const commonHashtags = userHashtags.filter((tag) =>
        post.hashtags.includes(tag)
      );

      // Tính điểm dựa trên số hashtags trùng khớp
      const score = commonHashtags.length;

      return {
        post,
        score,
        commonHashtags,
      };
    });

    // Sắp xếp theo điểm số giảm dần
    postsWithScores.sort((a, b) => b.score - a.score);

    // Lấy top 20 bài viết có điểm cao nhất
    const recommendedPosts = postsWithScores
      .slice(0, 20)
      .map((item) => item.post);

    return recommendedPosts;
  } catch (error) {
    console.error("Error in recommendPosts:", error);
    throw error;
  }
};

module.exports = {  
  friendPosts,
  groupPosts,
  recommendPosts,
};
