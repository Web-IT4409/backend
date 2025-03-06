const redis = require('redis');

const redisClient = redis.createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('connect', () => {
    console.log('redis connected');
});

redisClient.on('error', (err) => {
    console.error('redis err: ', err);
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;