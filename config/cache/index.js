const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

redisClient.on('connect', () => {
    console.log('redis connected');
});

redisClient.on('error', (err) => {
    console.error('redis err: ', err);
});

// Initialize connection
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;