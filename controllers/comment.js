//登录ctrl
const Config = require('../config');
const rp = require('request-promise');
const Utils = require('../utils/common');
const _ = require('lodash');
const DataInterface = require('../dataopt/interface');
const Logger = require('../utils/logger');
const Province = require('../utils/province');
const Uuidv1 = require('uuid/v1')

let usermap = require('../utils/usercache');

let isLogin = async(ctx) => {
    let _id = ctx.req.headers['sessionkey'];
    Logger.debug('isLogin:head:',ctx.req.headers);
    Logger.debug('isLogin:sessionkey:',_id);
    if(!_id){
        return false;
    }
    let user = await usermap.getuser(_id);
    if(user){
        Logger.debug("isLogin: true.",user);
        return true;
    }else{
        Logger.debug("isLogin: false.",user);
        return false;
    }
}
let getUser = async(ctx) => {
    let _id = ctx.req.headers['sessionkey'];
    if(!_id){
        return null;
    }
    let user = await usermap.getuser(_id);
    if(user){
        return user;
    }else{
        return null;
    }
}
module.exports = {
    'POST /api/newcomment': async (ctx, next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        let targetid = ctx.request.body.targetid;
        let content = ctx.request.body.content;
        let imgs = ctx.request.body.imgs;
        let qrid = ctx.request.body.qrid;
        if(!qrid || qrid === ''){
            return ctx.rest({status:0,message:'target qr not exist.'});
        }
        if(!content || content.length < 2){
            return ctx.rest({status:0,message:'content too little.'});
        }
        let data = {qrid,content,userid:user._id};
        if(targetid && targetid.length > 2){
            data.targetid = targetid;
        }
        if(imgs && imgs.length > 0){
            data.imgs = imgs;
        }
        let comment = await DataInterface.newComment(data);
        return ctx.rest({status:1,data:comment});
    },
    'POST /api/deletecomment': async (ctx,next) =>{
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let commentid = ctx.request.body._id;
        if(!commentid || commentid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let commentdoc = await DataInterface.deleteComment(commentid);
        if(!commentdoc){
            return ctx.rest({status:0,message:'the comment nost exist.'});
        }
        commentdoc.delete = true;
        await commentdoc.save();
        Logger.info('POST /api/deletecomment: delete comment success.',user._id,commentdoc._id);
        ctx.rest({status:1,message:'delete success.'});
    },
    'POST /api/upcomment': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let commentid = ctx.request.body._id;
        if(!commentid || commentid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let commentdoc = await DataInterface.getComment(commentid);
        if(!commentdoc){
            return ctx.rest({status:0,message:'the comment nost exist.'});
        }
        if(commentdoc.downs && commentdoc.downs.indexOf(user._id) !== -1){
            await DataInterface.cDownComment(commentid,user._id);
        }
        if(commentdoc.ups && commentdoc.ups.indexOf(user._id) !== -1){
            return ctx.rest({status:0,message:'have up the comment.'});
        }
        await DataInterface.upComment(commentid, user._id);
        Logger.debug('POST /api/upcomment: up success.');
        ctx.rest({status:1,message:'up success.'});
    },
    'POST /api/cupcomment': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let commentid = ctx.request.body._id;
        if(!commentid || commentid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let commentdoc = await DataInterface.getComment(commentid);
        if(!commentdoc){
            return ctx.rest({status:0,message:'the comment nost exist.'});
        }
        if(!commentdoc.ups || commentdoc.ups.indexOf(user._id) === -1){
            return ctx.rest({status:0,message:'havn`t up the comment.'});
        }
        commentdoc = await DataInterface.cUpComment(commentid,user._id);
        Logger.debug('POST /api/cupcomment: cup success.');
        ctx.rest({status:1,message:'cup success.'});
    },
    'POST /api/cdowncomment': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let commentid = ctx.request.body._id;
        if(!commentid || commentid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let commentdoc = await DataInterface.getComment(commentid);
        if(!commentdoc){
            return ctx.rest({status:0,message:'the comment nost exist.'});
        }
        if(commentdoc.downs && commentdoc.downs.indexOf(user._id) === -1){
            return ctx.rest({status:0,message:'havnt down the comment.'});
        }
        commentdoc = await DataInterface.cDownComment(commentid,user._id);
        Logger.debug('POST /api/cdowncomment: cdown success.');
        ctx.rest({status:1,message:'cdown success.'});
    },
    'POST /api/downcomment': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let commentid = ctx.request.body._id;
        if(!commentid || commentid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let commentdoc = await DataInterface.getComment(commentid);
        if(!commentdoc){
            return ctx.rest({status:0,message:'the comment nost exist.'});
        }
        if(commentdoc.ups && commentdoc.ups.indexOf(user._id) !== -1){
            await DataInterface.cUpComment(commentid,user._id);
        }
        if(commentdoc.downs && commentdoc.downs.indexOf(user._id) !== -1){
            return ctx.rest({status:0,message:'have down the comment.'});
        }
        await DataInterface.downComment(commentid,user._id);
        Logger.debug('POST /api/downcomment: down success.');
        ctx.rest({status:1,message:'down success.'});
    },
};
