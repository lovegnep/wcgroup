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
        let industry = ctx.request.body.induxtry;
        let location =  ctx.request.body.location;
        let groupname = ctx.request.body.groupname;
        let abstract = ctx.request.body.abstract;
        let grouptag = ctx.request.body.grouptag;
        let masterwx = ctx.request.body.masterwx;
        let type = ctx.request.body.type;
        let source = MsgType.QRSource.EUpload;
        let groupavatar = ctx.request.body.groupavatar;
        let groupQR = ctx.request.body.groupQR;
        let masterQR = ctx.request.body.masterQR;
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'Please login first1.'});
        }
        let uploader = user._id;
        let qrdoc = await DataInterface.newQR({uploader,abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx,type,source});
        ctx.rest({status:1,data:qrdoc});
    },
};
