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
    'GET /api/getTypes': async (ctx, next) => {
        let types = Province.getTypes();
        ctx.rest({data:types, status:1});
    },
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
    /*'POST /api/uploadImg': async (ctx,next) => {
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let filename = ctx.req.imgFile.filename;
        Logger.info('POST /api/uploadImg: filename:', filename);
        ctx.rest({filename: filename, status:1});
    },*/
    'POST /api/uploadGroup': async (ctx, next) => {
        let industry = ctx.request.body.induxtry;
        let location =  ctx.request.body.location;
        let groupname = ctx.request.body.groupname;
        let abstract = ctx.request.body.abstract;
        let grouptag = ctx.request.body.grouptag;
        let masterwx = ctx.request.body.masterwx;

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
        let qrdoc = await DataInterface.newQR({uploader,abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx});
        ctx.rest({status:1,data:qrdoc});
    },
    'POST /api/auth': async (ctx, next) => {
        const code = ctx.request.body.code;
        const fullUserInfo = ctx.request.body.userInfo;
        const userInfo = fullUserInfo.userInfo;
        const clientIp = ''; // 暂时不记录 ip
    
        // 获取openid
        const options = {
          method: 'GET',
          url: 'https://api.weixin.qq.com/sns/jscode2session',
          qs: {
            grant_type: 'authorization_code',
            js_code: code,
            secret: Config.wechat.secret,
            appid: Config.wechat.appid
          }
        };
    
        let sessionData = await rp(options);
        sessionData = JSON.parse(sessionData);
	Logger.debug('post /api/auth: sessionData:',sessionData);
        if (!sessionData.openid) {
	  Logger.error('!sessionData.openid:', sessionData);
          return ctx.rest({status:0,message:"请求微信服务器失败"});
        }
    
        // 验证用户信息完整性
        const crypto = require('crypto');
        const sha1 = crypto.createHash('sha1').update(fullUserInfo.rawData + sessionData.session_key).digest('hex');
	Logger.debug('post /api/auth:sha1:',sha1, fullUserInfo);
        if (fullUserInfo.signature !== sha1) {
            return ctx.rest({status:0,message:"前端与微信服务器用户签名信息不一致"});
        }
    
        // 解释用户数据
        const weixinUserInfo = await Utils.decryptUserInfoData(sessionData.session_key, fullUserInfo.encryptedData, fullUserInfo.iv);
        if (_.isEmpty(weixinUserInfo)) {
          return this.fail('解密用户数据失败');
        }
    
        // 根据openid查找用户是否已经注册
        let userdoc = null, userId;
        userdoc = await DataInterface.getAccountByOpenId(sessionData.openid);
        if (_.isEmpty(userdoc) || _.isEmpty(userdoc._id)) {
          // 注册
          userdoc = await DataInterface.newAccount({
            account: '微信用户' + Uuidv1(),
            passwd: sessionData.openid,
            register_time: Date.now(),
            register_ip: clientIp,
            last_login_time: Date.now(),
            last_login_ip: clientIp,
            mobile: '',
            weixin_openid: sessionData.openid,
            avatar: userInfo.avatarUrl || '',
            gender: userInfo.gender || 1, // 性别 0：未知、1：男、2：女
            nickname: userInfo.nickName
          });
          userId = userdoc._id;
        }
        userId = userdoc._id; 
        sessionData.user_id = userId;
    
        // 查询用户信息
        const newUserInfo = await DataInterface.getAccountById(userId);
   Logger.debug('post: /api/auth: userdoc:',newUserInfo); 
        // 更新登录信息
        newUserInfo.last_login_time = Date.now();
        newUserInfo.last_login_ip = clientIp;
        userdoc = await newUserInfo.save();
    
        if (_.isEmpty(newUserInfo)) {
            return ctx.rest({status:0,message:"查询用户信息失败"});
        }
        //ctx.session.user = newUserInfo;
        let tmpnewUserInfo = newUserInfo.toObject();
        await usermap.newuser(tmpnewUserInfo.weixin_openid, tmpnewUserInfo);
        Logger.debug('add user to map:',tmpnewUserInfo);
        return ctx.rest({userInfo: tmpnewUserInfo, sessionkey:tmpnewUserInfo.weixin_openid});
   },
    
};
