const redisClient = require("../config/cache");

const tokenListKey = "tokenList";

// Test Redis connection and functionality
const testRedisConnection = async () => {
  try {
    // Test if Redis is connected
    const pingResult = await redisClient.ping();
    console.log("Redis ping result:", pingResult);

    // Test basic operations
    await redisClient.set("test_key", "test_value");
    const testValue = await redisClient.get("test_key");
    console.log("Redis test value:", testValue);

    // Test list operations
    await redisClient.del(tokenListKey);
    await redisClient.lPush(tokenListKey, "test_token");
    const listResult = await redisClient.lRange(tokenListKey, 0, -1);
    console.log("Redis list test:", listResult);

    return true;
  } catch (error) {
    console.error("Redis connection test failed:", error);
    return false;
  }
};

// Run the test when the module is loaded
testRedisConnection();

const isTokenRevoked = async (token) => {
  try {
    const revokedTokens = await redisClient.lRange(tokenListKey, 0, -1);
    console.log("revokedTokens: ", revokedTokens);
    console.log("token: ", token);

    // Check if token is in the revoked list
    return Array.isArray(revokedTokens) && revokedTokens.includes(token);
  } catch (error) {
    console.error("Error checking revoked token:", error);
    return false;
  }
};

const revokeToken = async (token) => {
  try {
    console.log("Revoking token:", token);
    const result = await redisClient.lPush(tokenListKey, token);
    console.log("Token revoked, Redis result:", result);
    return true;
  } catch (error) {
    console.error("Error revoking token:", error);
    return false;
  }
};

module.exports = {
  isTokenRevoked,
  revokeToken,
  testRedisConnection
};
