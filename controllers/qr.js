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
const GmConfig = require('../common/gm');
const moment = require('moment');

let usermap = require('../utils/usercache');

let isLogin = async(ctx) => {
    let _id = ctx.req.headers['sessionkey'];
    //Logger.debug('isLogin:head:',ctx.req.headers);
    //Logger.debug('isLogin:sessionkey:',_id);
    if(!_id){
        return false;
    }
    let user = await usermap.getuser(_id);
    if(user){
        //Logger.debug("isLogin: true.",user);
        return true;
    }else{
        //Logger.debug("isLogin: false.",user);
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
        let limit = parseInt(ctx.query.limit || 20);
        let skip = parseInt(ctx.query.skip || 0);
        let type = parseInt(ctx.query.type || 1);
        //let sorttype = ctx.query.sorttype;
        //let basedon = parseInt(ctx.query.basedon);
        //let baseparam = ctx.query.baseparam;
        let options = { limit: limit, sort:'-updateTime'};
        let query = {delete:false,secret:false};
        query.type = type;
        let nbfore = Utils.getnBefore(GmConfig.comconfig.f5time);
        if(userdoc.views && userdoc.views.length > 0){
            query._id = {
                $nin:userdoc.views
            }
        }
        query.f5Time = {
            $gte:nbfore
        };
        let f5qrlist = await DataInterface.getAllQRList(query,options);
        if(f5qrlist&&f5qrlist.length === limit){
            return ctx.rest({data:f5qrlist, status:MsgType.EErrorType.EOK});
        }else{
            delete query.f5Time;
            /*query.f5Time = {
                $or:[
                    {$exists:false},
                    {$lt:nbfore}
                ]
            };*/
            query['$or'] = [
                {f5Time:{$exists:false}},
                {f5Time:{$lt:nbfore}}
            ];
            options.limit -= (f5qrlist.length || 0)
        }
        let qrlist = await DataInterface.getAllQRList(query,options);
        //Logger.debug('qrlist:',f5qrlist, qrlist);
        ctx.rest({data:[...f5qrlist,...qrlist], status:MsgType.EErrorType.EOK});
    },
    'GET /api/getqrlist': async (ctx, next) => {
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let type = parseInt(ctx.query.type) || MsgType.QRType.EGroup;
        let userid = user._id;
        let limit = parseInt(ctx.query.limit || 20);
        let skip = parseInt(ctx.query.skip || 0);
        Logger.debug('GET /api/getqrlist:',type,userid);
        let qrlist = await DataInterface.getQRListofUser({type,uploader:userid},{skip,limit});
        ctx.rest({data:qrlist, status:MsgType.EErrorType.EOK});
    },
    'GET /api/getqr': async (ctx, next) => {
        let qr = await DataInterface.getQR(ctx.query._id);
        ctx.rest({data:qr, status:MsgType.EErrorType.EOK});
    },
    'POST /api/deleteqr': async (ctx, next) => {//删除
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(qrdoc.uploader.toString() !== user._id){
            return ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        if(qrdoc.delete){
            return ctx.rest({status:MsgType.EErrorType.EQRHasDel});
        }
        let res = await DataInterface.deleterQR({uploader:user._id,delete:false},{delete:true});
        if(res.nModified){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.EDelQrFail});
        }
    },
    'POST /api/cdeleteqr': async (ctx, next) => {//取消删除
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(qrdoc.uploader.toString() !== user._id){
            return ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        if(!qrdoc.delete){
            return ctx.rest({status:MsgType.EErrorType.EHasUnDel});
        }
        let res = await DataInterface.deleterQR({uploader:user._id,delete:true},{delete:false});
        if(res.nModified){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.ECDelQrFail});
        }
    },
    'POST /api/qrup': async (ctx, next) => {//上架
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(qrdoc.uploader.toString() !== user._id){
            return ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        if(!qrdoc.secret){
            return ctx.rest({status:MsgType.EErrorType.EUnDown});
        }
        let res = await DataInterface.findAndUpdateQR({uploader:user._id,secret:true},{secret:false});
        Logger.debug('qrup:',res);
        if(res){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.EQrUpFail});
        }
    },
    'POST /api/qrdown': async (ctx, next) => {//下架
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(qrdoc.uploader.toString() !== user._id){
            return ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        if(qrdoc.secret){
            return ctx.rest({status:MsgType.EErrorType.EUnUp});
        }
        let res = await DataInterface.findAndUpdateQR({uploader:user._id,secret:false},{secret:true});
        Logger.debug('qrdown:',res);
        if(res){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.EQrDownFail});
        }
    },
    'POST /api/f5qr': async (ctx, next) => {//刷新
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
        let qrid = ctx.request.body._id;
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let qrdoc = await DataInterface.getQR(qrid);
        if(!qrdoc){
            return ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(qrdoc.uploader.toString() !== user._id){
            return ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        if(qrdoc.secret){
            return ctx.rest({status:MsgType.EErrorType.EUnUp});
        }
        /*if(moment(qrdoc.f5Time) > Utils.getnBefore(GmConfig.comconfig)){
            return ctx.rest({status:MsgType.EErrorType.EHasF5});
        } */
        Logger.debug('ftqr : ',qrdoc.f5Time,Utils.getnBefore(GmConfig.comconfig.f5time))
        if(qrdoc.f5Time && qrdoc.f5Time > Utils.getnBefore(GmConfig.comconfig.f5time)){
            return ctx.rest({status:MsgType.EErrorType.EHasF5});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(userdoc.weibi < GmConfig.weibi.f5qr){
            return ctx.rest({status:MsgType.EErrorType.ENoWeibi});
        }
        let tmpuserdoc = await UserInterface.addWeiBi(user._id,GmConfig.weibi.f5qr);
        if(tmpuserdoc){
            Logger.debug('dec wb success.',tmpuserdoc);
            await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.F5qr,change:GmConfig.weibi.f5qr,name:qrdoc.groupname,after:tmpuserdoc.weibi});
            Logger.debug('viewqr : new wb log success:');
        }
        let res = await DataInterface.updateQR({_id:qrid},{f5Time:new Date()});
        if(res.nModified){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.EF5Fail});
        }
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
        if(!qrid || qrid.length < 2 || typeof qrid !== "string"){
            return ctx.rest({status:0,message:'invalid id.'});
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(Utils.isInArray(userdoc.views,qrid)){
            Logger.debug('POST /api/viewqr:已经浏览过， 不收费,qrid:',qrid);
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            Logger.debug('POST /api/viewqr:未浏览过， 收费,qrid:',qrid);
        }
        if(userdoc.vipid.monthstart && parseInt(Date.now()/1000) - userdoc.vipid.monthstart <= 30*24*3600){//月卡用户
            UserInterface.updateViewsAndWeibi(qrid,user._id,true);//将qr放入用户已浏览列表中
            DataInterface.updateQR({_id:qrid},{$inc:{viewCount:1}});//更新QR浏览量
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else if(userdoc.weibi < 1){
            return ctx.rest({status:MsgType.EErrorType.ENoWeibi,message:'not enough weibi'});
        }
        ctx.rest({status:MsgType.EErrorType.EOK});
        let res = await UserInterface.updateViewsAndWeibi(qrid,user._id,false);
        DataInterface.updateQR({_id:qrid},{$inc:{viewCount:1}});
        if(res && res._id){
            let qrdoc = await DataInterface.getQR(qrid);
            await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.EView,change:GmConfig.weibi.view,name:qrdoc.groupname,after:res.weibi});
            Logger.debug('viewqr : new wb log success:');
        }

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
        ctx.rest({status:MsgType.EErrorType.EOK,message:' success.',data:comments||[]});
    },
};
