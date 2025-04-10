const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  getGroupsByUserId,
  deleteGroup,
  requestToJoinGroup,
  respondToGroupRequest,
  getPendingGroupRequests,
  leaveGroup,
  checkGroupRequestStatus,
  postToGroup,
  respondToPostToGroup,
  getPendingPostRequests,
  getAllMembers,
} = require('../services/groupService');
const { tokenVerifier } = require('../middlewares/authMiddleware');
const { activeAccountFilter } = require('../middlewares/statusMiddleware');

router.use(tokenVerifier);
router.use(activeAccountFilter);


// Group post operations 
router.post('/:id/posts', postToGroup);                
router.get('  /posts/pending', getPendingPostRequests); 
router.post('/:id/posts/respond', respondToPostToGroup); 

// Group membership operations 
router.get('/:id/members', getAllMembers);
router.post('/:id/join', requestToJoinGroup);         
router.post('/:id/leave', leaveGroup);                
router.get('/requests/pending', getPendingGroupRequests); 
router.post('/:groupId/requests/respond', respondToGroupRequest); 

// User-specific group operations
router.get('/user', getGroupsByUserId);  
router.get('/check-status/:groupId', checkGroupRequestStatus); 

// Basic group operations 
router.post('/', createGroup);         
router.get('/', getAllGroups);          
router.get('/:id', getGroupById);       
router.delete('/:id', deleteGroup);     

module.exports = router;
