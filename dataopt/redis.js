const Logger = require('../utils/logger');
const Redis = require('redis');
const config = require('../config');
const {promisify} = require('util');

let client = Redis.createClient(config.redis.port, config.redis.host);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const zaddAsync = promisify(client.zadd).bind(client);
const zrangeByScoreAsync = promisify(client.zrangebyscore).bind(client);
const zRemRangeByScoreAsync = promisify(client.zremrangebyscore).bind(client);
client.on('ready', function(){
    Logger.info('redis client connect to server success.');
});
client.on('error',function(err){
    Logger.error('redis error, please check:',err);
});

exports = {
    getAsync:getAsync,
    setAsync: setAsync,
    zaddAsync: zaddAsync,
    zrangeByScoreAsync: zrangeByScoreAsync,
    zRemRangeByScoreAsync:zRemRangeByScoreAsync,
};
Object.assign(module.exports, exports);
