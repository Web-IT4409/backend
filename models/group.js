const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Group extends Model {
  static associate(models) {
    Group.belongsTo(models.User, {
      foreignKey: "creatorId",
      onDelete: "CASCADE",
    }),
      (Group.associate = (models) => {
        Group.belongsTo(models.User, {
          foreignKey: "creatorId",
          onDelete: "CASCADE",
        });
      }),
      Group.hasMany(models.GroupMember, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
      }),
      Group.hasMany(models.GroupPost, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
      });
  }
}
Group.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM("public", "private"),
    allowNull: false,
    defaultValue: "public",
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

Group.belongsTo(User, { foreignKey: "creatorId" });

module.exports = Group;
