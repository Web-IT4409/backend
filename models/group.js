const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Group extends Model {
  static associate(models) {
    // Creator association
    Group.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE"
    });
    
    // Members association
    Group.hasMany(models.GroupMember, {
      foreignKey: "groupId",
      as: "members",
      onDelete: "CASCADE"
    });
    
    // Posts association
    Group.hasMany(models.Post, {
      foreignKey: "groupId",
      as: "posts",
      onDelete: "CASCADE"
    });

    // Group join requests association
    Group.hasMany(models.GroupRequest, {
      foreignKey: "groupId",
      as: "joinRequests",
      onDelete: "CASCADE"
    });

    // Post requests association
    Group.hasMany(models.PostsToGroupRequest, {
      foreignKey: "groupId",
      as: "postRequests",
      onDelete: "CASCADE"
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
    unique: true,
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
},
{
  sequelize,
  modelName: "Group",
  tableName: "groups",
});

module.exports = Group;
