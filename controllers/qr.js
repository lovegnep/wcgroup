//登录ctrl
const Config = require('../config');
const rp = require('request-promise');
const Utils = require('../utils/common');
const _ = require('lodash');
const DataInterface = require('../dataopt/interface');
const UserInterface = require('../dataopt/user');
const Logger = require('../utils/logger');
const Province = require('../utils/province');
const Uuidv1 = require('uuid/v1')
const MsgType = require('../common/msgtype');

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
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        let limit = ctx.query.limit || 20;
        let skip = ctx.query.skip || 0;
        let type = ctx.query.type || 1;
        //let sorttype = ctx.query.sorttype;
        //let basedon = parseInt(ctx.query.basedon);
        //let baseparam = ctx.query.baseparam;
        let options = { skip: skip, limit: limit};
        let query = {};
        query.type = type;
        if(userdoc.views && userdoc.views.length > 0){
            query._id = {
                $nin:userdoc.views
            }
        }
        let qrlist = await DataInterface.getAllQRList(query,options);
        ctx.rest({data:qrlist, status:MsgType.EErrorType.EOK});
    },
    'GET /api/getqrlist': async (ctx, next) => {
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user_id = ctx.session.user._id;
        let qrlist = await DataInterface.getQRList(user_id);
        ctx.rest({data:qrlist, status:1});
    },
    'GET /api/getqr': async (ctx, next) => {
        let qr = await DataInterface.getQR(ctx.query._id);
        ctx.rest({data:qr, status:1});
    },

    'POST /api/viewqr': async (ctx, next) => {
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
        let userdoc = await DataInterface.getAccountById(user._id);
        if(userdoc.weibi < 1){
            return ctx.rest({status:MsgType.EErrorType.ENoWeibi,message:'not enough weibi'});
        }
        await UserInterface.updateViewsAndWeibi(qrid,user._id);
        return ctx.rest({status:MsgType.EErrorType.EOK});
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
