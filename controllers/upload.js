//登录ctrl
const Config = require('../config');
const rp = require('request-promise');
const Utils = require('../utils/common');
const _ = require('lodash');
const DataInterface = require('../dataopt/interface');
const Logger = require('../utils/logger');
const Province = require('../utils/province');
const Uuidv1 = require('uuid/v1')
const MsgType = require('../common/msgtype');
const GmConfig = require('../common/gm');
const UserInterface = require('../dataopt/user');

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
    'POST /api/uploadGroup': async (ctx, next) => {
        let industry = ctx.request.body.industry;
        let location =  ctx.request.body.location;
        let groupname = ctx.request.body.groupname;
        let abstract = ctx.request.body.abstract;
        let grouptag = ctx.request.body.grouptag;
        let masterwx = ctx.request.body.masterwx;
        let type = parseInt(ctx.request.body.type);
        let source = MsgType.QRSource.EUpload;
        let groupavatar = ctx.request.body.groupavatar;
        let groupQR = ctx.request.body.groupQR;
        let masterQR = ctx.request.body.masterQR;
        let gender = parseInt(ctx.request.body.gender);
        let birthday = ctx.request.body.birthday;
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'Please login first1.'});
        }
        let uploader = user._id;
        let query = {uploader,abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx,type,source};
        if(grouptag&&grouptag!==''){
            query.grouptag = grouptag.split(',');
        }
        if(location){
            if(!Utils.validLocationId(location)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidLocation});
            }
            query.location = location;
        }
        if(gender){
            if(!Utils.validGender(gender)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidGender});
            }
            query.gender = gender;
        }
        if(birthday){
            if(!Utils.validBirthday(birthday)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidAge});
            }
            query.birthday = new Date(birthday.replace(/-/g,"/"));
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(userdoc.weibi < GmConfig.weibi.updateqr){
            return ctx.rest({status:MsgType.EErrorType.ENoWeibi});
        }
        let tmpuserdoc = await UserInterface.addWeiBi(user._id,GmConfig.weibi.f5qr);
        if(tmpuserdoc){
            Logger.debug('dec wb success.',tmpuserdoc);
            await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.uploadqr,change:GmConfig.weibi.updateqr,name:groupname,after:tmpuserdoc.weibi});
            Logger.debug('viewqr : new wb log success:');
        }
        let qrdoc = await DataInterface.newQR(query);
        ctx.rest({status:MsgType.EErrorType.EOK,data:qrdoc});
    },
    'POST /api/updateGroup': async (ctx, next) => {
        let industry = ctx.request.body.industry;
        let location =  ctx.request.body.location;
        let groupname = ctx.request.body.groupname;
        let abstract = ctx.request.body.abstract;
        let grouptag = ctx.request.body.grouptag;
        let masterwx = ctx.request.body.masterwx;
        //let type = ctx.request.body.type;
        //let source = MsgType.QRSource.EUpload;
        let groupavatar = ctx.request.body.groupavatar;
        let groupQR = ctx.request.body.groupQR;
        let masterQR = ctx.request.body.masterQR;
        let gender = ctx.request.body.gender;
        let birthday = ctx.request.body.birthday;
        let qrid = ctx.request.body.qrid;
        if(!qrid || qrid.length < 2){
            return ctx.rest({status:MsgType.EErrorType.EInvalidQrid});
        }
        let oldqrdoc = await DataInterface.getQR(qrid);

        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'Please login first1.'});
        }
        if(!oldqrdoc ){
            return  ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(oldqrdoc.uploader.toString() !== user._id){
            return  ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        let uploader = user._id;
        let updatestr = {abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx};
        if(location){
            if(!Utils.validLocationId(location)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidLocation});
            }
            updatestr.location = location;
        }
        if(grouptag&&grouptag!==''){
            updatestr.grouptag = grouptag.split(',');
        }
        if(gender){
            if(!Utils.validGender(gender)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidGender});
            }
            updatestr.gender = gender;
        }
        if(birthday){
            if(!Utils.validBirthday(birthday)){
                return ctx.rest({status:MsgType.EErrorType.EInvalidAge});
            }
            updatestr.birthday = new Date(birthday.replace(/-/g,"/"));
        }
        let userdoc = await DataInterface.getAccountById(user._id);
        if(userdoc.weibi < GmConfig.weibi.updateqr){
            return ctx.rest({status:MsgType.EErrorType.ENoWeibi});
        }
        let res = await DataInterface.updateQR({_id:qrid},updatestr);
        let tmpuserdoc = await UserInterface.addWeiBi(user._id,GmConfig.weibi.f5qr);
        if(tmpuserdoc){
            Logger.debug('dec wb success.',tmpuserdoc);
            await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.updateqr,change:GmConfig.weibi.updateqr,name:groupname,after:tmpuserdoc.weibi});
            Logger.debug('viewqr : new wb log success:');
        }
        if(res.nModified){
            return  ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return  ctx.rest({status:MsgType.EErrorType.EUpdateFail});
        }
    },
};
