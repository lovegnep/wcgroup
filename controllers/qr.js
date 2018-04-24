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
    'GET /api/getallqrlist': async (ctx, next) => {
        let limit = ctx.query.limit || 20;
        let skip = ctx.query.skip;
        let sorttype = ctx.query.sorttype;
        let basedon = parseInt(ctx.query.basedon);
        let baseparam = ctx.query.baseparam;
        let options = { skip: skip, limit: limit, sort: sorttype};
        let query = {};
        if(basedon === 1){
            query.location = new RegExp('^'+baseparam,'i');
        }else if(basedon === 2){
            query.industry = baseparam;
        }
        let qrlist = await DataInterface.getAllQRList(query,options);
        ctx.rest({data:qrlist, status:1});
    },
    'GET /api/getqrlist': async (ctx, next) => {
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user_id = ctx.session.user._id;
        let qrlist = await DataInterface.getQRList(user_id);
        ctx.rest({data:qrlist, status:1});
    },

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

    'POST /api/upqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        if(qrdoc.downs && qrdoc.downs.indexOf(user._id) !== -1){
            await DataInterface.cDownQR(qrid,user._id);
        }
        if(qrdoc.ups && qrdoc.ups.indexOf(user._id) !== -1){
            return ctx.rest({status:0,message:'have up the qr.'});
        }
        await DataInterface.upQR(qrid, user._id);
        Logger.debug('POST /api/upqr: up success.');
        ctx.rest({status:1,message:'up success.'});
    },
    'POST /api/cupqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        if(qrdoc.ups && qrdoc.ups.indexOf(user._id) === -1){
            return ctx.rest({status:0,message:'have not up the qr.'});
        }
        await DataInterface.cUpQR(qrid, user._id);
        Logger.debug('POST /api/cupqr: cup success.');
        ctx.rest({status:1,message:'cup success.'});
    },
    'POST /api/downqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        if(qrdoc.ups && qrdoc.ups.indexOf(user._id) !== -1){
            await DataInterface.cUpQR(qrid,user._id);
        }
        if(qrdoc.downs && qrdoc.downs.indexOf(user._id) !== -1){
            return ctx.rest({status:0,message:'have down the qr.'});
        }
        await DataInterface.downQR(qrid, user._id);
        Logger.debug('POST /api/downqr: downqr success.');
        ctx.rest({status:1,message:'down success.'});
    },
    'POST /api/cdownqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        if(qrdoc.downs && qrdoc.downs.indexOf(user._id) === -1){
            return ctx.rest({status:0,message:'have not down the qr.'});
        }
        await DataInterface.cDownQR(qrid, user._id);
        Logger.debug('POST /api/cdownqr: cdown success.');
        ctx.rest({status:1,message:'cdown success.'});
    },
    'POST /api/collectqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(!userdoc){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        if(userdoc.collections && userdoc.collections.indexOf(qrid) !== -1){
            return ctx.rest({status:0,message:'have collect the qr.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        await DataInterface.collectQR(qrid,userdoc._id);
        await DataInterface.addLikeCount(qrid);
        Logger.debug('POST /api/collectqr: collect success.');
        ctx.rest({status:1,message:'collect success.'});
    },
    'POST /api/ccollectqr': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(!userdoc){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        if(userdoc.collections && userdoc.collections.indexOf(qrid) === -1){
            return ctx.rest({status:0,message:'have not collect the qr.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:0,message:'the qr not exist.'});
        }
        await DataInterface.cCollectQR(qrid,userdoc._id);
        await DataInterface.cAddLikeCount(qrid);
        Logger.debug('POST /api/ccollectqr: ccollect success.');
        ctx.rest({status:1,message:'ccollect success.'});
    },

    'POST /api/getqrcommentnum': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let num = await DataInterface.getQRCommentNum(qrid);

        Logger.debug('POST /api/getqrcommentnum:  success.');
        ctx.rest({status:1,message:' success.',data:num});
    },
    'POST /api/getqrcomment': async (ctx,next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let query = {};
        query.qrid = qrid;
        query.delete = false;
        let sorttype = ctx.request.body.sorttype || '-createTime';
        let skip = ctx.request.body.skip || 0;
        let limit = ctx.request.body.limit || Config.qr.limit;
        let comments = await DataInterface.getQRComment(query,{sorttype,skip,limit});

        Logger.debug('POST /api/getqrcomment:  success.');
        ctx.rest({status:1,message:' success.',data:comments||[]});
    },
};
