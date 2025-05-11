const express = require('express');
const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostsByUserId
} = require('../services/postService');
const { tokenVerifier } = require('../middlewares/authMiddleware');
const { activeAccountFilter } = require('../middlewares/statusMiddleware');

const router = express.Router();

router.use(tokenVerifier);
router.use(activeAccountFilter);

router.post('/', createPost);

router.get('/all', getPosts);

// Get all posts by a specific user ID
router.get('/user/:userId', getPostsByUserId);

router.get('/:id', getPostById);

router.patch('/:id', updatePost);

router.delete('/:id', deletePost);

module.exports = router;
