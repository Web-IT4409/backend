const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class GroupRequest extends Model {
  static associate(models) {
    GroupRequest.belongsTo(models.User, { foreignKey: "senderId" });
    GroupRequest.belongsTo(models.Group, { foreignKey: "groupId" });
  }
}

GroupRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Groups",
        key: "id",
      },
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
        fields: ["senderId", "groupId"],
        where: {
          status: "pending",
        },
      },
    ],
  }
);

module.exports = GroupRequest;
