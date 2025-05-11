const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {
  static associate(models) {
    // Friend request associations
    User.hasMany(models.FriendRequest, {
      foreignKey: "sender_id",
      as: "sentRequests",
    });
    User.hasMany(models.FriendRequest, {
      foreignKey: "receiver_id",
      as: "receivedRequests",
    });

    // Friendship associations
    User.hasMany(models.UserFriend, {
      foreignKey: "user_id_1",
      as: "friendships1",
    });
    User.hasMany(models.UserFriend, {
      foreignKey: "user_id_2",
      as: "friendships2",
    });
  }
}

User.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "BANNED", "INACTIVE", "INVESTIGATE"),
      defaultValue: "ACTIVE",
    },
    hashtags: {
      type: DataTypes.JSON(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg",
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
    modelName: "User",
    tableName: "users",
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
  }
);

module.exports = User;
