const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class PostsToGroupRequest extends Model {
  static associate(models) {
    // Group association
    this.belongsTo(models.Group, { 
      foreignKey: "groupId",
      as: "group"
    });

    // User (sender) association
    this.belongsTo(models.User, {
      foreignKey: "userId",
      as: "sender"
    });

    // Admin association
    this.belongsTo(models.User, {
      foreignKey: "adminId",
      as: "admin"
    });
  }
}

PostsToGroupRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaUrl: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "id"
      }
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    }
  },
  {
    sequelize,
    modelName: "PostsToGroupRequest",
    tableName: "posts_to_group_requests",
  }
);

module.exports = PostsToGroupRequest;
