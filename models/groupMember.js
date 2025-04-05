const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class GroupMember extends Model {
  static associate(models) {
    GroupMember.belongsTo(models.Group, { foreignKey: "groupId" }),
      GroupMember.belongsTo(models.User, { foreignKey: "userId" });
  }
}

const GroupMember = sequelize.define("GroupMember", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Groups",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = GroupMember;
