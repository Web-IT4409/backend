const express = require("express");
const {
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    unfriend,
    getFriends,
    getPendingRequests,
    getSentRequests,
    checkFriendshipStatus
} = require("../services/friendService");
const { tokenVerifier } = require("../middlewares/authMiddleware");
const { activeAccountFilter } = require("../middlewares/statusMiddleware");
const router = express.Router();

// Apply middlewares to all routes
router.use(tokenVerifier, activeAccountFilter);

// Friend requests
router.post("/request", sendFriendRequest);
router.post("/respond", respondToFriendRequest);
router.delete("/request/:receiverId", cancelFriendRequest);
router.delete("/unfriend/:friendId", unfriend);

// Friend lists
router.get("/list", getFriends);
router.get("/requests/pending", getPendingRequests);
router.get("/requests/sent", getSentRequests);
router.get("/status/:otherUserId", checkFriendshipStatus);

module.exports = router; 