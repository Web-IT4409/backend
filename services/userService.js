const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../middlewares/authMiddleware");
const { revokeToken } = require("../services/redisService");
require("dotenv").config();
const User = require("../models/user");
const { Op, Sequelize } = require("sequelize");
const UserFriend = require("../models/userFriend");

const getUser = async (req, res) => {
  const parsedUser = req.user;
  const userId = parsedUser === null ? null : parsedUser.id;
  if (userId === null) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const user = await User.findByPk(userId);

  res.status(200).json(user);
};

const getAll = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

const createUser = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res
      .status(201)
      .json({ message: "user created successfully with id: " + newUser.id });
  } catch (error) {
    console.error("creating user error: ", error);
    res.status(500).json({ error: "internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required" });
  }

  const user = await User.unscoped().findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  if (!user.password) {
    return res.status(500).json({ error: "User password data is corrupted" });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "wrong password" });
    }

    // Remove password from response
    const userWithoutPassword = { ...user.get(), password: undefined };

    const token = generateAccessToken(userWithoutPassword);
    res.status(200).json({ token: token, user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "an error occurred during authentication" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;
    await revokeToken(token);
    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "An error occurred during logout" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { is_friend } = req.body;
    const currentUserId = req.user?.id;
    
    // If not authenticated, return 401
    if (!currentUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let users = [];
    
    // Filter by friendship status if specified
    if (is_friend === true) {
      // Get all friends of the current user
      const friendships = await UserFriend.findAll({
        where: {
          [Op.or]: [
            { user_id_1: currentUserId },
            { user_id_2: currentUserId }
          ]
        }
      });

      // Extract friend IDs
      const friendIds = friendships.map(friendship => 
        friendship.user_id_1 === currentUserId 
          ? friendship.user_id_2 
          : friendship.user_id_1
      );

      // Get user details for all friends
      users = await User.findAll({
        where: {
          id: friendIds
        }
      });
    } 
    else if (is_friend === false) {
      // Get IDs of all friends
      const friendships = await UserFriend.findAll({
        where: {
          [Op.or]: [
            { user_id_1: currentUserId },
            { user_id_2: currentUserId }
          ]
        }
      });

      const friendIds = friendships.map(friendship => 
        friendship.user_id_1 === currentUserId 
          ? friendship.user_id_2 
          : friendship.user_id_1
      );
      
      // Get all users who are not friends with the current user (and not the current user)
      users = await User.findAll({
        where: {
          id: {
            [Op.and]: [
              { [Op.ne]: currentUserId },
              { [Op.notIn]: friendIds }
            ]
          }
        }
      });
    } 
    else {
      // No filter, return all users except current user
      users = await User.findAll({
        where: {
          id: {
            [Op.ne]: currentUserId
          }
        }
      });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

module.exports = {
  login,
  getUser,
  createUser,
  getAll,
  logout,
  getAllUsers,
};
