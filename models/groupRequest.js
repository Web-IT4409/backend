const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class GroupRequest extends Model {
  static associate(models) {
    GroupRequest.belongsTo(models.User, { 
      foreignKey: "userId",
      as: "user",
      references: {
        model: "users",
        key: "id"
      }
    });
    GroupRequest.belongsTo(models.Group, { 
      foreignKey: "groupId",
      as: "group",
      references: {
        model: "groups",
        key: "id"
      }
    });
  }
}

GroupRequest.init(
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
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "id"
      }
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined"),
      defaultValue: "pending",
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
    sequelize,
    modelName: "GroupRequest",
    tableName: "group_requests",
    indexes: [
      {
        unique: true,
        fields: ["userId", "groupId"],
        where: {
          status: "pending",
        },
      },
    ],
  }
);

module.exports = GroupRequest;
