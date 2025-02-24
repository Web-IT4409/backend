const express = require('express');
const userRoutes = require('./userRoutes');
const cacheRoutes = require('./cacheRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/cache', cacheRoutes);
router.use('/health', healthRoutes);

module.exports = router;