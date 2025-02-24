const redisClient = require('../config/cache/index');
const promisifyRedis = require('../utils/promisify');

const { getAsync: redisGetAsync, setAsync: redisSetAsync } = promisifyRedis(redisClient);

const getCache = async (req, res) => {
    const key = req.params.key;
    try {
        const value = await redisGetAsync(key);
        if (value) {
            res.json({ key, value });
        } else {
            res.status(404).json({ error: 'no keys found' });
        }
    } catch (err) {
        console.error('redis fetching err: ', err);
        res.status(500).json({ error: 'internal err' });
    }
};

const setCache = async (req, res) => {
    const key = req.params.key;
    const value = req.body.value;
    try {
        await redisSetAsync(key, value);
        res.json({ message: 'value set successfully' });
    } catch (err) {
        console.error('redis failed to set values: ', err);
        res.status(500).json({ error: 'internal err' });
    }
};

module.exports = {
    getCache,
    setCache,
};