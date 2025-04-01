const { DataTypes } = require("sequelize");
const { Comment: CommentEnums } = require("../utils/enum");

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
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
        allowNull: false,
      },
      mediaURL: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        max: 63206,
      },
      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(CommentEnums.STATUS)),
        defaultValue: "ACTIVE",
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
      tableName: "comments",
    }
  );

  Comment.associate = (models) => {
    if (models.User) {
      Comment.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
    if (models.Post) {
      Comment.belongsTo(models.Post, {
        foreignKey: "postId",
        onDelete: "CASCADE",
      });
    }
  };

  return Comment;
};
