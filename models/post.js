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
    },
    {
      timestamps: true,
      tableName: "posts",
    }
  );

  Post.associate = (models) => {
    if (models.User) {
      Post.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
  };

  return Post;
};
