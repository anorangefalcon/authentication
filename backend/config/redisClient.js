const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

module.exports = redisClient;