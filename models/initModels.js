// models/initModels.js
const sequelize = require("../config/database");
const User = require("./user");
const PostModel = require("./post");
const CommentModel = require("./comment");
const FriendRequest = require("./friendRequest");
const UserFriend = require("./userFriend");

// Initialize Post model
const Post = PostModel(sequelize);
const Comment = CommentModel(sequelize);

// Set up associations
const models = { User, Post, Comment, FriendRequest, UserFriend };
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
