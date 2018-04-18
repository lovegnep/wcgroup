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
    let doc = await Model.UserModel.findById(_id).exec();
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



exports = {
    newAccount:newAccount,
    getAccountByOpenId:getAccountByOpenId,
    getAccountById:getAccountById,

    newQR:newQR,
    getQRList:getQRList,
    getAllQRList:getAllQRList,
};
Object.assign(module.exports, exports);
