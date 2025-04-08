const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const GroupRequest = require("./groupRequest");

class GroupMember extends Model {
  static associate(models) {
    GroupMember.belongsTo(models.Group, { 
      foreignKey: "groupId",
      references: {
        model: "groups",
        key: "id"
      }
    });
    GroupMember.belongsTo(models.User, { 
      foreignKey: "userId",
      references: {
        model: "users",
        key: "id"
      }
    });
  }
}

GroupMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "id"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

  },
  {
    sequelize,
    modelName: "GroupMember",
    tableName: "group_members",
    timestamps: false,
  }
);

module.exports = GroupMember;
