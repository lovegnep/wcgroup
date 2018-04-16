//登录ctrl
const Config = require('../config');
const rp = require('request-promise');
const Utils = require('../utils/common');
const _ = require('lodash');
const DataInterface = require('../dataopt/interface');
const Logger = require('../utils/logger');

module.exports = {
    'GET /api/getqrlist': async (ctx, next) => {
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let user_id = ctx.session.user._id;
        let qrlist = await DataInterface.getQRList(user_id);
        ctx.rest({qrlist, status:1});
    },
    'POST /api/uploadImg': async (ctx,next) => {
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let filename = ctx.req.imgFile.filename;
        Logger.info('POST /api/uploadImg: filename:', filename);
        ctx.rest({filename: filename, status:1});
    },
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
        if(!ctx.session.user){
            return ctx.rest({status:0,message:'Please login first.'});
        }
        let uploader = ctx.session.user._id;
        let qrdoc = await DataInterface.newQr({uploader,abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx});
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
        if (!sessionData.openid) {
          return ctx.rest({status:0,message:"登录失败"});
        }
    
        // 验证用户信息完整性
        const crypto = require('crypto');
        const sha1 = crypto.createHash('sha1').update(fullUserInfo.rawData + sessionData.session_key).digest('hex');
        if (fullUserInfo.signature !== sha1) {
            return ctx.rest({status:0,message:"登录失败"});
        }
    
        // 解释用户数据
        const weixinUserInfo = await Utils.decryptUserInfoData(sessionData.session_key, fullUserInfo.encryptedData, fullUserInfo.iv);
        if (think.isEmpty(weixinUserInfo)) {
          return this.fail('登录失败');
        }
    
        // 根据openid查找用户是否已经注册
        let userdoc = null, userId;
        userdoc = await DataInterface.getAccountByOpenId(sessionData.openid);
        userId = userdoc._id;
        if (_.isEmpty(userId)) {
          // 注册
          userdoc = await DataInterface.newAccount({
            account: '微信用户' + think.uuid(6),
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
    
        sessionData.user_id = userId;
    
        // 查询用户信息
        const newUserInfo = await DataInterface.getAccountById(userId);
    
        // 更新登录信息
        newUserInfo.last_login_time = Date.now();
        newUserInfo.last_login_ip = clientIp;
        userdoc = await newUserInfo.save();
    
        if (_.isEmpty(newUserInfo)) {
            return ctx.rest({status:0,message:"登录失败"});
        }
        ctx.session.user = newUserInfo;
        return ctx.rest({userInfo: newUserInfo });
    },
    
};
