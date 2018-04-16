const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');

//注册帐号
let newAccount = async (data) => {
    let user = new Model.UserModel({...data});
    let doc = await user.save();
    return doc;
}

//更新登录信息
let updateLoginInfo = async (data) => {

}

//查找帐号
let getAccountByOpenId = async (weixin_openid) => {
    let doc = await Model.UserModel.findOne({weixin_openid}).exec();
    return doc;
}

//查找帐号
let getAccountById = async (_id) => {
    let doc = await Model.UserModel.findById(_d).exec();
    return doc;
}

//
let newQR = async (data) => {
    let qr = new Model.Qrmodel({...data});
    let doc = await qr.save(); 
    return doc;
}

//
let getQRList = async (uploader_id) => {
    let qrlist = await Model.Qrmodel.find({uploader:uploader_id}).exec();
    return qrlist;
}

//
let getAllQRList = async(query,option) => {
    let qrlist = await Model.Qrmodel.find(query,{},option).exec();
    return qrlist;
}



//
function modifyPasswd(old, data, cb){
    old.passwd = data.passwd;
    old.save(function(err, doc){
        if(err){
            Logger.error('modifyPasswd: save err.', old, data);
            cb(err, doc);
        }else{
            Logger.debug('modifyPasswd: save success.', old, data);
            cb(null, doc);
        }
    });
}

//新建收藏
function newCollection(data, cb) {
    if (!data || !data.url) {
        return Logger.error('newCollection !data || !data.url');
    }
    let collection = new Model.Collection({
        url: data.url,
        abstract: data.abstract,
        account: data.account
    });
    collection.save(function (err, doc) {
        if (err) {
            Logger.error('newCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('newCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//修改收藏
function modifyCollection(old, data, cb){
    Object.assign(old, data);
    old.save(function(err, doc){
        if (err) {
            Logger.error('modifyCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('modifyCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//删除收藏
function rmCollection(old, cb){
    old.delete = true;
    old.save(function(err, doc){
        if (err) {
            Logger.error('rmCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('rmCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//查询收藏
function getCollection(query, option, cb){
    Model.Collection.find(query, {}, option, function(err, docs){
        if(err){
            Logger.error('getCollection: error:',err);
            cb(err, docs);
        }else{
            Logger.debug('getCollection: success.');
            cb(null, docs);
        }
    });
}

// 查询某个收藏的信息
function getOneCollection(_id, cb){
    Model.Collection.findById(_id, function(err, doc){
        if(err){
            Logger.error('getOneCollection: error:',err);
            cb(err, doc);
        }else{
            Logger.debug('getOneCollection: success.');
            cb(null, doc);
        }
    });
}


//新建分享
function newShare(data, cb){
    let share = new Model.Share({
        ...data,
    });
    share.save(function(err, doc){
        if(err){
            Logger.error('newShare: save err.', data);
            cb(err, doc);
        }else{
            Logger.debug('newShare: save success.', data);
            cb(null, doc);
        }
    });
}

//查询分享
function getShare(query, option, cb){
    Model.Share.find(query, {}, option, function(err, docs){
        if(err){
            Logger.error('getShare: error:',err);
            cb(err, docs);
        }else{
            Logger.debug('getShare: success.');
            cb(null, docs);
        }
    });
}

//新建完全树状图
function newRoot(account, cb){
    let tree = new Model.Tree({account});
    tree.save(function(err, doc){
        if(err || !doc){
            Logger.error('newRoot:err:',err);
            return cb(err, null);
        }
        cb(null, doc);
    });
}

exports = {
    getAccountByOpenId:getAccountByOpenId,
    getAccountById:getAccountById,

    newQR:newQR,
    getQRList:getQRList,
    getAllQRList:getAllQRList,
};
Object.assign(module.exports, exports);
