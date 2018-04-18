/**
 * Created by Administrator on 2018/4/18.
 */
const Logger = require('./logger');

let cache = new Map();

function newuser(_id, user){
    Logger.debug('newuser:',{...cache.keys()});
    Logger.debug('newuser:',{...cache.values()});
    cache.set(_id,user);
}
function getuser(_id){
    Logger.debug('getuser:',{...cache.keys()});
    Logger.debug('getuser:',{...cache.values()});
    return cache.get(_id);
}

exports = {
    newuser:newuser,
    getuser:getuser
};
Object.assign(module.exports, exports);