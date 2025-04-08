const { DataTypes } = require("sequelize");
const { Post: PostEnums } = require("../utils/enum");

module.exports = (sequelize) => {
  const Post = sequelize.define(
    "Post",
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        max: 63206,
      },
      mediaUrl: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      visibility: {
        type: DataTypes.ENUM(...Object.values(PostEnums.VISIBILITY)),
        defaultValue: PostEnums.VISIBILITY.PUBLIC,
        allowNull: false,
      },
      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(PostEnums.STATUS)),
        defaultValue: PostEnums.STATUS.ACTIVE,
      },
      hashtags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        get() {
          const value = this.getDataValue("hashtags");
          return Array.isArray(value) ? value : [];
        },
        set(value) {
          this.setDataValue("hashtags", Array.isArray(value) ? value : []);
        },
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      tableName: "posts",
      hooks: {
        afterFind: async (posts) => {
          if (!posts) return;

          // Nếu là một mảng posts
          if (Array.isArray(posts)) {
            for (const post of posts) {
              const emotionsCount = await sequelize.models.Emotion.count({
                where: { postId: post.id },
              });
              post.likesCount = emotionsCount;
            }
          }
          // Nếu là một post đơn lẻ
          else {
            const emotionsCount = await sequelize.models.Emotion.count({
              where: { postId: posts.id },
            });
            posts.likesCount = emotionsCount;
          }
        },
      },
    }
  );
  Post.associate = (models) => {
    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      onDelete: "CASCADE",
    });
    Post.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Post.hasMany(models.Emotion, {
      foreignKey: "postId",
      onDelete: "CASCADE",
    });
  };

  return Post;
};

