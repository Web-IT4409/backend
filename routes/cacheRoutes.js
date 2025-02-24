const express = require('express');
const { getCache, setCache } = require('../services/cacheService');

const router = express.Router();

router.get('/:key', getCache);
router.post('/:key', setCache);

module.exports = router;