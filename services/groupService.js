const { QueryTypes } = require("../config/database");
const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const GroupRequest = require("../models/groupRequest");

const createGroup = async (req, res) => {
  const { name, visibility, creatorId, description, image } = req.body;
  try {
    const group = await Group.create({
      name,
      visibility,
      creatorId,
      description,
      image,
    });
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group by id: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description, image, visibility } = req.body;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    group.name = name;
    group.description = description;
    group.image = image;
    group.visibility = visibility;
    await group.save();
    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    console.error("Error updating group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    await group.destroy();
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const joinGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
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
    await GroupMember.create({
      groupId,
      userId,
    });
    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {
    console.error("Error joining group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
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
    await existingMember.destroy();
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error leaving group: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendGroupRequest = async (req, res) => {
  const { groupId } = req.params;
  const { senderId, adminId } = req.body;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const existingRequest = await GroupRequest.findOne({
      where: {
        groupId,
        senderId,
      },
    });
    if (existingRequest) {
      return res.status(400).json({ error: "Request already sent" });
    }
    await GroupRequest.create({
      groupId,
      senderId,
      adminId,
    });
    res.status(200).json({ message: "Group request sent successfully" });
  } catch (error) {
    console.error("Error sending group request: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  sendGroupRequest,
};
