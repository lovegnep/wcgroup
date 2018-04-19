/**
 *  * Created by Administrator on 2018/4/18.
 *   */
const Logger = require('./logger');
const Redis = require('redis');

const config = require('../config');

let cache = new Map();
let client = Redis.createClient(config.redis.port, config.redis.host);
client.on('connect', function(){
    Logger.info('redis client connect to server success.');
});
client.on('error',function(err){
    Logger.error('redis error:',err);
});
function newuserpro(_id, user) {
    return new Promise(function (resolve, reject) {
        client.set(_id, user, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });
}
function getuserpro(_id) {
    return new Promise(function (resolve, reject) {
        client.get(_id, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });
}
let newuser = async (_id, user) => {
    try {
        user = await newuserpro(_id, user);
    } catch (err) {
        Logger.error('newuser: redis set user error:', err);
        return null;
    }
    return user;
};

let getuser = async (_id) => {
    let user = null;
    try {
        user = await getuserpro(_id);
    } catch (err) {
        Logger.error('getuser: redis get user error:', err);
        return null;
    }
    return user;
}

function newuserold(_id, user) {
    Logger.debug('newuser:', [...cache.keys()]);
    Logger.debug('newuser:', [...cache.values()]);
    cache.set(_id, user);
    Logger.debug('newuser:', [...cache.keys()]);
    Logger.debug('newuser:', [...cache.values()]);
}
function getuserold(_id) {
    Logger.debug('getuser:', [...cache.keys()]);
    Logger.debug('getuser:', [...cache.values()]);
    return cache.get(_id);
}

exports = {
    newuser: newuser,
    getuser: getuser
};
Object.assign(module.exports, exports);