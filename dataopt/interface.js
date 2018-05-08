const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');

//注册帐号
let newAccount = async (data) => {
    let user = new Model.UserModel({...data});
    let vip = new Model.VipModel({userid:user._id});
    user.vipid=vip._id;
    let doc = await user.save();
    await vip.save();
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
    let opts = {
        rmb:1,
        vipstart:1,
        monthstart:1,
        groupqr:1,
        personqr:1,
        publicqr:1,
        lastReward:1
    }
    let doc = await Model.UserModel.findById(_id).populate({path:'vipid',select:opts}).exec();
    return doc;
}

//
let newQR = async (data) => {
    let qr = new Model.Qrmodel({...data});
    let doc = await qr.save(); 
    return doc;
}
let getQR = async(_id) => {
    let qrdoc = await Model.Qrmodel.findById(_id).exec();
    return qrdoc;
}
let deleterQR = async (query,updatestr)=>{
    let res = await Model.Qrmodel.update(query,updatestr).exec();
    return res;
}
let updateQR = async (query,updatestr)=>{
    let res = await Model.Qrmodel.update(query,updatestr).exec();
    return res;
}
//
let getQRList = async (uploader_id) => {
    let qrlist = await Model.Qrmodel.find({uploader:uploader_id}).exec();
    return qrlist;
}

let getQRListofUser = async(query,options) => {
    let qrlist = await Model.Qrmodel.find(query,{},options).exec();
    return qrlist;
}

//
let getAllQRList = async(query,option) => {
    Logger.debug('getAllQRList:query(%s),options(%s),:',JSON.stringify(query),JSON.stringify(option));
    let qrlist = null;
    try{
        qrlist = await Model.Qrmodel.find(query,{},option).exec();
    }catch(err){
        Logger.error('getAllQRList:query(%s),options(%s),err:',JSON.stringify(query),JSON.stringify(option),err);
        return [];
    }

    return qrlist;
}
//new comment
let newComment = async(data) => {
    let comment = new Model.Comment({...data});
    let doc = await comment.save();
    return doc;
}

let getComment = async(_id) => {
    let comment = await Model.Comment.findById(_id).exec();
    return comment;
}

let deleteComment = async(_id) => {
    let comment = null;
    try{
        comment = await Model.Comment.findByIdAndUpdate(_id,{delete:true},{new:true}).exec();
        Logger.debug("deleteComment:new comment:", JSON.stringify(comment));
    }catch(err){
        Logger.error('deleteComment:err:',err);
    }
    return comment;
}
let upComment = async(_id,userid) => {
    let comment = null;
    try{
        comment = await Model.Comment.findByIdAndUpdate(_id,{$push:{ups:userid}},{new:true}).exec();
        Logger.debug("upComment:new comment:", JSON.stringify(comment));
    }catch(err){
        Logger.error('upComment:err:',err);
    }
    return comment;
}
let cUpComment = async(_id,userid) => {
    let comment = null;
    try{
        comment = await Model.Comment.findByIdAndUpdate(_id,{$pull:{ups:userid}},{new:true}).exec();
        Logger.debug("cUpComment:new comment:", JSON.stringify(comment));
    }catch(err){
        Logger.error('cUpComment:err:',err);
    }
    return comment;
}
let downComment = async(_id,userid) => {
    let comment = null;
    try{
        comment = await Model.Comment.findByIdAndUpdate(_id,{$push:{downs:userid}},{new:true}).exec();
        Logger.debug("downComment:new comment:", JSON.stringify(comment));
    }catch(err){
        Logger.error('downComment:err:',err);
    }
    return comment;
}
let cDownComment = async(_id,userid) => {
    let comment = null;
    try{
        comment = await Model.Comment.findByIdAndUpdate(_id,{$pull:{downs:userid}},{new:true}).exec();
        Logger.debug("cDownComment:new comment:", JSON.stringify(comment));
    }catch(err){
        Logger.error('cDownComment:err:',err);
    }
    return comment;
}

let upQR = async(_id,userid) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{$push:{ups:userid}},{new:true}).exec();
        Logger.debug("upQR:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('upQR:err:',err);
    }
    return qr;
}
let cUpQR = async(_id,userid) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{$pull:{ups:userid}},{new:true}).exec();
        Logger.debug("cUpQR:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('cUpQR:err:',err);
    }
    return qr;
}
let downQR = async(_id,userid) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{$push:{downs:userid}},{new:true}).exec();
        Logger.debug("downQR:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('downQR:err:',err);
    }
    return qr;
}
let cDownQR = async(_id,userid) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{$pull:{downs:userid}},{new:true}).exec();
        Logger.debug("cDownQR:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('cDownQR:err:',err);
    }
    return qr;
}
let collectQR = async(_id,userid) => {
    let userdoc = null;
    try{
        userdoc = await Model.UserModel.findByIdAndUpdate(userid,{$push:{collections:_id}},{new:true}).exec();
        Logger.debug("collectQR:new userdoc:", JSON.stringify(userdoc));
    }catch(err){
        Logger.error('collectQR:err:',err);
    }
    return userdoc;
}
let cCollectQR = async(_id,userid) => {
    let userdoc = null;
    try{
        userdoc = await Model.UserModel.findByIdAndUpdate(userid,{$pull:{collections:_id}},{new:true}).exec();
        Logger.debug("cCollectQR:new userdoc:", JSON.stringify(userdoc));
    }catch(err){
        Logger.error('cCollectQR:err:',err);
    }
    return userdoc;
}
let addLikeCount = async(_id) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{ $inc: { likeCount: 1} },{new:true}).exec();
        Logger.debug("addLikeCount:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('addLikeCount:err:',err);
    }
    return qr;
}
let cAddLikeCount = async(_id) => {
    let qr = null;
    try{
        qr = await Model.Qrmodel.findByIdAndUpdate(_id,{ $inc: { likeCount: -1} },{new:true}).exec();
        Logger.debug("cAddLikeCount:new qrdoc:", JSON.stringify(qr));
    }catch(err){
        Logger.error('cAddLikeCount:err:',err);
    }
    return qr;
}

let getQRCommentNum = async(_id) => {
    let comments = 0;
    try{
        comments = await Model.Comment.count({qrid:_id}).exec();
    }catch(err){
        Logger.error('getQRCommentNum:err:',err);
    }
    return comments;
}
//得到某往篇qr的评论
let getQRComment = async(query, options) => {
    let comments = null;
    try{
        //comments = await Model.Comment.find(query,{},options).populate('userid','_id avatar nickname').exec();
        comments = await Model.Comment.find(query,{},options).populate({path:'userid',select:{_id:1,avatar:1,nickname:1}}).exec();
    }catch(err){
        Logger.error('getQRCommentNum:err:',err);
    }
    return comments;
}

exports = {
    newAccount:newAccount,
    getAccountByOpenId:getAccountByOpenId,
    getAccountById:getAccountById,

    newQR:newQR,
    getQR:getQR,
    deleterQR:deleterQR,
    updateQR:updateQR,
    getQRList:getQRList,
    getAllQRList:getAllQRList,
    getQRListofUser:getQRListofUser,

    newComment:newComment,
    getComment:getComment,
    deleteComment:deleteComment,
    upComment:upComment,
    cUpComment:cUpComment,
    downComment:downComment,
    cDownComment:cDownComment,

    upQR:upQR,
    cUpQR:cUpQR,
    downQR:downQR,
    cDownQR:cDownQR,
    collectQR:collectQR,
    cCollectQR:cCollectQR,
    addLikeCount:addLikeCount,
    cAddLikeCount:cAddLikeCount,

    getQRCommentNum:getQRCommentNum,
    getQRComment:getQRComment,
};
Object.assign(module.exports, exports);
