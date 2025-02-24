const { promisify } = require('util');

const promisifyRedis = (redisClient) => {
    return {
        getAsync: promisify(redisClient.get).bind(redisClient),
        setAsync: promisify(redisClient.set).bind(redisClient),
    };
};

module.exports = promisifyRedis;