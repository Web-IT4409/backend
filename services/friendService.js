const { Op } = require("sequelize");
const FriendRequest = require("../models/friendRequest");
const UserFriend = require("../models/userFriend");
const User = require("../models/user");

const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ error: "Cannot send friend request to yourself" });
        }

        // check B exists
        const receiver = await User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        // check existing friendship
        const existingFriendship = await UserFriend.findOne({
            where: {
                [Op.or]: [
                    { user_id_1: senderId, user_id_2: receiverId },
                    { user_id_1: receiverId, user_id_2: senderId }
                ]
            }
        });

        if (existingFriendship) {
            return res.status(400).json({ error: "Already friends with this user" });
        }

        // check pending request B->A
        const existingRequestFromReceiver = await FriendRequest.findOne({
            where: {
                sender_id: receiverId,
                receiver_id: senderId,
                status: 'pending'
            }
        });

        if (existingRequestFromReceiver) {
            // auto accept
            await existingRequestFromReceiver.update({ status: 'accepted' });

            // insert friendship
            const userIds = [senderId, receiverId].sort((a, b) => a - b);
            await UserFriend.create({
                user_id_1: userIds[0],
                user_id_2: userIds[1]
            });

            return res.status(200).json({
                message: "Friend request from this user was automatically accepted",
                status: 'accepted'
            });
        }

        // check pending request A->B
        const existingRequest = await FriendRequest.findOne({
            where: {
                sender_id: senderId,
                receiver_id: receiverId,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Friend request already sent" });
        }

        // insert request
        await FriendRequest.create({
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending'
        });

        res.status(201).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Send friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const respondToFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId, action } = req.body;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ error: "Invalid action. Allow: 'accept' or 'decline'" });
        }

        const friendRequest = await FriendRequest.findOne({
            where: {
                id: requestId,
                receiver_id: userId,
                status: 'pending'
            }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        // update status
        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        await friendRequest.update({
            status: newStatus,
            updatedAt: new Date()
        });

        // accept -> insert friendship
        if (action === 'accept') {
            const userIds = [userId, friendRequest.sender_id].sort((a, b) => a - b);
            await UserFriend.create({
                user_id_1: userIds[0],
                user_id_2: userIds[1]
            });
        }

        res.status(200).json({ message: `Friend request ${newStatus}` });
    } catch (error) {
        console.error("Respond to friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const cancelFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findOne({
            where: {
                id: requestId,
                sender_id: senderId,
                status: 'pending'
            }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        await friendRequest.update({
            status: 'canceled',
            updatedAt: new Date()
        });

        res.status(200).json({ message: "Friend request canceled" });
    } catch (error) {
        console.error("Cancel friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const unfriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        const friendship = await UserFriend.findOne({
            where: {
                [Op.or]: [
                    { user_id_1: userId, user_id_2: friendId },
                    { user_id_1: friendId, user_id_2: userId }
                ]
            }
        });

        if (!friendship) {
            return res.status(404).json({ error: "Friendship not found" });
        }

        await friendship.destroy();
        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Unfriend error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        // search all friendships
        const friendships = await UserFriend.findAll({
            where: {
                [Op.or]: [
                    { user_id_1: userId },
                    { user_id_2: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user1',
                    attributes: ['id', 'firstName', 'lastName', 'username']
                },
                {
                    model: User,
                    as: 'user2',
                    attributes: ['id', 'firstName', 'lastName', 'username']
                }
            ]
        });

        // extract friend list
        const friends = friendships.map(friendship => {
            if (friendship.user_id_1 === userId) {
                return friendship.user2;
            } else {
                return friendship.user1;
            }
        });

        res.status(200).json(friends);
    } catch (error) {
        console.error("Get friends error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const pendingRequests = await FriendRequest.findAll({
            where: {
                receiver_id: userId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'username']
            }]
        });

        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error("Get pending requests error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const sentRequests = await FriendRequest.findAll({
            where: {
                sender_id: userId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'receiver',
                attributes: ['id', 'firstName', 'lastName', 'username']
            }]
        });

        res.status(200).json(sentRequests);
    } catch (error) {
        console.error("Get sent requests error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const checkFriendshipStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        // check friendship
        const isFriend = await UserFriend.findOne({
            where: {
                [Op.or]: [
                    { user_id_1: userId, user_id_2: otherUserId },
                    { user_id_1: otherUserId, user_id_2: userId }
                ]
            }
        });

        if (isFriend) {
            return res.status(200).json({ status: 'friends' });
        }

        // check pending requests
        const sentRequest = await FriendRequest.findOne({
            where: {
                sender_id: userId,
                receiver_id: otherUserId,
                status: 'pending'
            }
        });

        if (sentRequest) {
            return res.status(200).json({ status: 'request_sent' });
        }

        const receivedRequest = await FriendRequest.findOne({
            where: {
                sender_id: otherUserId,
                receiver_id: userId,
                status: 'pending'
            }
        });

        if (receivedRequest) {
            return res.status(200).json({ status: 'request_received', requestId: receivedRequest.id });
        }

        res.status(200).json({ status: 'not_friends' });
    } catch (error) {
        console.error("Check friendship status error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    unfriend,
    getFriends,
    getPendingRequests,
    getSentRequests,
    checkFriendshipStatus
}; 