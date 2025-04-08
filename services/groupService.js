const { QueryTypes } = require("../config/database");
const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const GroupRequest = require("../models/groupRequest");
const PostsToGroupRequest = require("../models/postsToGroupRequest");
const { Post } = require("../models/initModels");
const { Op } = require("sequelize");
const User = require("../models/user");
const Sequelize = require("sequelize");

// Basic group operations
const createGroup = async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const image = req.body.image;
  const visibility = req.body.visibility;
  const userId = req.user.id;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const currentName = await Group.findOne({ 
    where: {
      name,
    },
  });
  if (currentName) {
    return res.status(400).json({ error: "Name already exists" });
  }
  try {
    const group = await Group.create({
      name,
      description,
      image,
      visibility,
      userId
    });
    const groupMember = await GroupMember.create({
      groupId: group.id,
      userId: userId,
    });
    res.status(201).json({ message: "Group created successfully", group, groupMember });
  } catch (error) {
    console.error("Error creating group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: GroupMember,
          as: 'members',
          include: {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        }
      ]
    });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error getting groups: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: GroupMember,
          as: 'members',
          include: {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        }
      ]
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group by id: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (group.userId !== userId) {
      return res.status(403).json({ error: "You are not the creator of this group" });
    }
    await group.destroy();
    await GroupMember.destroy({
      where: {
        groupId: id,
      },
    });
    await GroupRequest.destroy({
      where: {
        groupId: id,
      },
    });
    await Post.destroy({
      where: {
        groupId: id,
      },
    });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User-specific group operations
const getGroupsByUserId = async (req, res) => {
  const userId = req.user.id;
  try {
    const groupIds = await GroupMember.findAll({
      where: {
        userId: userId,
      },
      attributes: ['groupId']
    }); 
    const groups = await Group.findAll({
      where: {
        id: {
          [Op.in]: groupIds.map((id) => id.groupId),
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: GroupMember,
          as: 'members',
          include: {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        }
      ]
    }); 
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkGroupRequestStatus = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  try {
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const isMember = await GroupRequest.findOne({
      where: {
        groupId,
        userId,
        status: "accepted",
      },
    });
    if(isMember) {
      return res.status(200).json({ status: "member" });
    }
    const isRequest = await GroupRequest.findOne({
      where: {
        groupId,
        userId,
        status: "pending",
      },
    });
    if(isRequest) {
      return res.status(200).json({ status: "pending" });
    }
    const isAdmin = await Group.findOne({
      where: {
        id: groupId,
        userId: userId,
      },
    });
    if(isAdmin) {
      return res.status(200).json({ status: "admin" });
    }
    const isDeclined = await GroupRequest.findOne({
      where: {
        groupId,
        userId,
        status: "declined",
      },
    });
    if(isDeclined) {
      return res.status(200).json({ status: "declined" });
    }
    return res.status(200).json({ status: "not_member" });
  } catch (error) {
    console.error("Error checking group membership: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Group membership operations
const requestToJoinGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const existingMember = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });
    if (existingMember) {
      return res
      .status(400)
      .json({ error: "User already a member of this group" });
    }
    const existingRequest = await GroupRequest.findOne({
      where: {
        groupId,
        userId: userId,
        status: "pending",
      },
    });
    if (existingRequest) {
      return res
      .status(400)
      .json({ error: "Request already sent" });
    }
    await GroupRequest.create({
      groupId,
      userId: userId,
      adminId: group.userId,
      status: "pending",
    });
    res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error("Error joining group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const existingMember = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });
    if (!existingMember) {
      return res
      .status(400)
      .json({ error: "User is not a member of this group" });
    }
    await GroupMember.destroy({
      where: {
        groupId,
        userId,
      },
    });
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error leaving group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPendingGroupRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    const pendingRequests = await GroupRequest.findAll({
      where: {
        adminId: userId,
        status: "pending",
      },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending group requests: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const respondToGroupRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { requestId, action } = req.body;
    const isAdmin = await Group.findOne({
      where: {
        id: groupId,
        userId: userId,
      },
    });
    if (!isAdmin) {
      return res.status(403).json({ error: "You are not the admin of this group" });
    }
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Allow: 'accept' or 'decline'" });
    }
    const groupRequest = await GroupRequest.findOne({
      where: {
        id: requestId,
        adminId: userId,
        status: "pending",
      },
    });
    if (!groupRequest) {
      return res.status(404).json({ error: "Group request not found" });
    }
    
    //Update status
    const newStatus = action == 'accept' ? 'accepted' : 'declined';
    await GroupRequest.update({
      status: newStatus,
      updatedAt: new Date(),
    }, {
      where: {
        id: requestId,
      },
    });
    if (action == 'accept') {
      await GroupMember.create({
        groupId,
        userId: groupRequest.userId,
      });
    }
    res.status(200).json({ message: `Group request ${newStatus}` });
  } catch (error) {
    console.error("Error responding to group request: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Group post operations
const postToGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const content = req.body.content;
  const mediaUrl = req.body.mediaUrl;
  if(!content) {
    return res.status(400).json({ error: "Content is required" });
  }
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const isMember = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });
    if(!isMember) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }
    const adminId = group.userId;  
    await PostsToGroupRequest.create({
      userId,
      groupId,
      content,
      mediaUrl,
      adminId,
    });
    res.status(200).json({ message: "Post request sent successfully" });
  } catch (error) {
    console.error("Error posting to group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPendingPostRequests = async (req, res) => {
  const adminId = req.user.id;
  try {
    const pendingRequests = await PostsToGroupRequest.findAll({
      where: {
        adminId: adminId,
        status: "pending",
      },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending post requests: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const respondToPostToGroup = async (req, res) => {
  try {
    // Validate required parameters
    const { id: groupId } = req.params;
    const { requestId, action } = req.body;
    const adminId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }
    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Allow: 'accept' or 'decline'" });
    }

    // Check admin permission
    const isAdmin = await Group.findOne({
      where: {
        id: groupId,
        userId: adminId,
      },
    });
    if (!isAdmin) {
      return res.status(403).json({ error: "You are not the admin of this group" });
    }

    // Find post request
    const postRequest = await PostsToGroupRequest.findOne({
      where: {
        id: requestId,
        groupId,
        status: "pending",  // Only process pending requests
      },
    });
    if (!postRequest) {
      return res.status(404).json({ error: "Post request not found or already processed" });
    }

    // Process the request
    if (action === 'accept') {
      // Update request status
      await PostsToGroupRequest.update(
        { status: "approved" },
        { where: { id: requestId } }
      );

      // Create the post using the Post model
      const newPost = await Post.create({
        userId: postRequest.userId,
        content: postRequest.content,
        mediaUrl: postRequest.mediaUrl || [],
        visibility: "public",
        groupId: groupId,
        status: "active"
      });

      res.status(200).json({ 
        message: "Post request accepted successfully",
        post: newPost 
      });
    } else {
      // Decline the request
      await PostsToGroupRequest.update(
        { status: "rejected" },
        { where: { id: requestId } }
      );
      res.status(200).json({ message: "Post request declined successfully" });
    }
  } catch (error) {
    console.error("Error responding to post request: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllMembers = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  try {
    const isMember = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });
    if(!isMember) { 
      return res.status(400).json({ error: "You are not a member of this group" });
    }
    const members = await GroupMember.findAll({
      where: {
        groupId,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching all members: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  // Basic group operations
  createGroup,
  getAllGroups,
  getGroupById,
  deleteGroup,
  
  // User-specific group operations
  getGroupsByUserId,
  checkGroupRequestStatus,
  
  // Group membership operations
  requestToJoinGroup,
  leaveGroup,
  getPendingGroupRequests,
  respondToGroupRequest,
  
  // Group post operations
  postToGroup,
  getPendingPostRequests,
  respondToPostToGroup,

  // Group member operations
  getAllMembers,
};
