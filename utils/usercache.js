/**
 *  * Created by Administrator on 2018/4/18.
 *   */
const Logger = require('./logger');
const MsgType = require('../common/msgtype');
const config = require('../config');
const Redis = require('../dataopt/redis');
const Utils = require('./common');

function combine(_id){
    return config.user_cache.userprefix + _id;
}

let newuser = async (_id, user) => {
    let res = null;
    try {
        res = await Redis.setAsync(combine(_id), JSON.stringify(user));
    } catch (err) {
        Logger.error('newuser: redis set user error:', err);
        return null;
    }
    return res;
};

let getuser = async (_id) => {
    let user = null;
    try {
        let tmpuser = await Redis.getAsync(combine(_id));
        user = JSON.parse(tmpuser);
    } catch (err) {
        Logger.error('getuser: redis get user error:', err);
        return null;
    }
    return user;
}

let setHotQRList = async (type,obj) => {
    type = parseInt(type);
    if(type !== MsgType.QRType.EPublic && type !== MsgType.QRType.EPerson && type !== MsgType.QRType.EGroup){
        Logger.error('setHotQRList: type invalid.');
        return;
    }
    if(!obj || typeof obj !== 'object'){
        Logger.error('setHotQRList: invalid obj.');
        return;
    }
    let tmpobj = {};
    tmpobj.data = obj;
    tmpobj.time = Date.now();
    await Redis.setAsync(MsgType.CacheKey+type, JSON.stringify(tmpobj));
    Logger.debug('setHotQRList: update cache success: key with ',MsgType.CacheKey+type );
}

let getHotQRList = async (type) => {
    type = parseInt(type);
    if(type !== MsgType.QRType.EPublic && type !== MsgType.QRType.EPerson && type !== MsgType.QRType.EGroup){
        Logger.error('getHotQRList: type invalid.');
        return;
    }
    let res = await Redis.getAsync(MsgType.CacheKey+type);
    if(res){
        return JSON.parse(res);
    }else{
        null;
    }
}

let addF5 = async(_id) => {
    let tmpid = typeof _id === 'object' ? _id.toString() : _id;
    let res = await Redis.zaddAsync(config.user_cache.f5key,Utils.getExpireTime(),tmpid);
    return res;
}
let getF5 = async () => {
    let res = await Redis.zrangeByScoreAsync(config.user_cache.f5key,Utils.getTime(),Number.POSITIVE_INFINITY);
    return res||[];
}
exports = {
    newuser: newuser,
    getuser: getuser,
    setHotQRList:setHotQRList,
    getHotQRList:getHotQRList,
    addF5:addF5,
    getF5:getF5,
};
Object.assign(module.exports, exports);
