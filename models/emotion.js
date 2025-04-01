const { DataTypes } = require("sequelize");
const { Emotion: EmotionEnums } = require("../utils/enum");

module.exports = (sequelize) => {
  const Emotion = sequelize.define(
    "Emotion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      commentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(EmotionEnums.EMOTION)),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: "emotions",
      hooks: {
        beforeValidate: async (emotion) => {
          // Kiểm tra xem có ít nhất một trong hai trường postId hoặc commentId được cung cấp
          if (!emotion.postId && !emotion.commentId) {
            throw new Error("Phải cung cấp postId hoặc commentId");
          }

          // Nếu có postId, kiểm tra xem post có tồn tại không
          if (emotion.postId) {
            const Post = sequelize.models.Post;
            const post = await Post.findByPk(emotion.postId);
            if (!post) {
              throw new Error("Post không tồn tại");
            }
          }

          // Nếu có commentId, kiểm tra xem comment có tồn tại không
          if (emotion.commentId) {
            const Comment = sequelize.models.Comment;
            const comment = await Comment.findByPk(emotion.commentId);
            if (!comment) {
              throw new Error("Comment không tồn tại");
            }
          }
        },
      },
    }
  );

  Emotion.associate = (models) => {
    if (models.User) {
      Emotion.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
    if (models.Post) {
      Emotion.belongsTo(models.Post, {
        foreignKey: "postId",
        onDelete: "CASCADE",
      });
    }
    if (models.Comment) {
      Emotion.belongsTo(models.Comment, {
        foreignKey: "commentId",
        onDelete: "CASCADE",
      });
    }
  };

  return Emotion;
};
