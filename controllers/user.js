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


let UserInterface = require('../dataopt/user');

let usermap = require('../utils/usercache');

module.exports = {
    'GET /api/getTypes': async (ctx, next) => {
        let types = Province.getTypes();
        ctx.rest({data:types, status:1});
    },
    'POST /api/decode' :async (ctx,next) => {//解密分享数据
        let user = ctx.userobj;
        let session_key = user.session_key;
        if(!session_key || session_key.length < 1){
            return ctx.rest({status:MsgType.EErrorType.ENoSessionKey,message:'no session key'});
        }
        let encryptedData = ctx.request.body.encryptedData;
        let iv = ctx.request.body.iv;
        let path = ctx.request.body.path;
        let type = parseInt(ctx.request.body.type);
        let index = ctx.request.body.index;
        if(type === 1){//分享到个人
            await UserInterface.newShare({userid:user._id,path:path,type:1,index:index});
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }
        if(!encryptedData || encryptedData.length < 1){
            return ctx.rest({status:MsgType.EErrorType.ENoEncryptedData,message:'no encryptedData'});
        }
        if(!iv || iv.length < 1){
            return ctx.rest({status:MsgType.EErrorType.ENoIV,message:'no IV'});
        }
        // 解释用户数据
        let decodedata = await Utils.decryptUserInfoData(session_key, encryptedData, iv);
        if (_.isEmpty(decodedata)) {
            return ctx.rest({status:MsgType.EErrorType.EDecodeFail, message:'解密用户数据失败'});
        }
        Logger.debug('POST /api/decode:',decodedata);
        let data = {index:index,type:2,userid:user._id,targetid:decodedata.openGId,createTime:decodedata.watermark.timestamp*1000};
        if(path&&path.length > 0){
            data.path = path;
        }
        let isSame = await UserInterface.isShareSameGroup({userid:user._id,openid:decodedata.openGId});
        Logger.debug('POST /api/decode:isSame:',isSame);
        if(isSame){
            await UserInterface.newShare(data);
            return ctx.rest({status:MsgType.EErrorType.EHasShareTo,data:decodedata});
        }else{
            let resu = await UserInterface.addWeiBi(user._id,GmConfig.weibi.shareToGroup);
            if(resu&&resu._id){
                await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.EShare2Group,change:GmConfig.weibi.shareToGroup,after:resu.weibi});
                Logger.debug('share 2 group : new wblog success.');
            }
        }
        UserInterface.newShare(data);

        return ctx.rest({status:MsgType.EErrorType.EOK,data:decodedata});
    },
    'POST /api/auth': async (ctx, next) => {//登陆
        const code = ctx.request.body.code;
        const fullUserInfo = ctx.request.body.userInfo;
        const userInfo = fullUserInfo.userInfo;
        const clientIp = ctx.req.headers['X-Real-IP']||ctx.req.headers['x-real-ip']||''; //  ip
        Logger.debug('POST /api/auth: ip:',clientIp);
        let shareIndex = ctx.request.body.shareIndex;
        let fatherid = ctx.request.body.fatherid;
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
          return ctx.rest({status:0, message:'解密用户数据失败'});
        }
    
        // 根据openid查找用户是否已经注册
        let userdoc = null, userId;
        userdoc = await DataInterface.getAccountByOpenId(sessionData.openid);
        if (_.isEmpty(userdoc) || _.isEmpty(userdoc._id)) {
          // 注册
            if(shareIndex&&shareIndex.length > 0){//通过分享进入
                Logger.debug('post auth:通过分享进入，',fatherid,userInfo.nickName)
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
                    nickname: userInfo.nickName,
                    shareIndex:shareIndex,
                    weibi:GmConfig.weibi.init,
                    father:fatherid
                });
                if(fatherid&&fatherid.length > 0){
                    UserInterface.addSon(fatherid,userdoc._id,userInfo.nickName);//更新父亲儿子信息，以及增加父亲微币
                }

            }else{
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
                    nickname: userInfo.nickName,
                    weibi:GmConfig.weibi.init
                });
            }
            userId = userdoc._id;
            UserInterface.newWeibiLog({userid:userId,source:MsgType.WeiBiSource.EInit,change:GmConfig.weibi.init,after:userdoc.weibi});
            Logger.debug('auth : new wb log success.');
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
        //sessionmap.set(newUserInfo._id.toString(),sessionData.session_key);
        //ctx.session.user = newUserInfo;
        let tmpnewUserInfo = newUserInfo.toObject();
        tmpnewUserInfo.session_key = sessionData.session_key;
        usermap.newuser(tmpnewUserInfo.weixin_openid, tmpnewUserInfo);
        Logger.debug('add user to map:',tmpnewUserInfo);
        return ctx.rest({userInfo: tmpnewUserInfo, sessionkey:tmpnewUserInfo.weixin_openid});
   },
    'GET /api/sign': async (ctx,next) => {
        let user = ctx.userobj;
        let res = await UserInterface.sign(user._id);
        if(res.err){
            return ctx.rest({status:MsgType.EErrorType.EInterError});
        }else if(res.res && res.res._id){
            let wblog = await UserInterface.newWeibiLog({userid:user._id,source:MsgType.WeiBiSource.ESign,change:GmConfig.weibi.sign,after:res.res.weibi});
            Logger.debug('sign: add wblog success.:',wblog);
            return ctx.rest({status:MsgType.EErrorType.EOK})
        }else{
            return ctx.rest({status:MsgType.EErrorType.EHasSign});
        }
    },
    'POST /api/sharein':async (ctx,next)=>{
        let user = ctx.userobj;
        let index = ctx.request.body.index;
        if(!index || index.length < 1){
            return ctx.rest({status:MsgType.EErrorType.EShareIndexInvalid});
        }
        let res = await UserInterface.shareIn(index,user._id);
        if(res.nModified){
            return ctx.rest({status:MsgType.EErrorType.EOK});
        }else{
            return ctx.rest({status:MsgType.EErrorType.ENoShare});
        }
    },
    'GET /api/getweibi': async (ctx,next) => {
        let user = ctx.userobj;
        let userdoc = await DataInterface.getAccountById(user._id);
        return ctx.rest({status:MsgType.EErrorType.EOK,data:userdoc.weibi});
    },
    'GET /api/getuserinfo': async (ctx,next) => {
        let user = ctx.userobj;
        let userdoc = await DataInterface.getAccountById(user._id);
        return ctx.rest({status:MsgType.EErrorType.EOK,data:userdoc});
    },
    'POST /api/getviews': async (ctx,next) => {
        let user = ctx.userobj;
        let userdoc = await DataInterface.getAccountById(user._id);
        if(!userdoc.views || userdoc.views.length < 1){
            return ctx.rest({status:MsgType.EErrorType.EOK,data:[]});
        }
        let query = {};
        let type = ctx.request.body.type || 1;
        let skip = ctx.request.body.skip || 0;
        let limit = ctx.request.body.limit || 20;
        query._id = {$in: userdoc.views};
        query.type = type;
        let qrdoc = await UserInterface.getviews(query,{limit,skip});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:qrdoc||[]});
    },
    'POST /api/getsearchrecords': async (ctx,next) => {
        let user = ctx.userobj;
        let query = {};
        let limit = ctx.request.body.limit || 20;
        let skip = ctx.request.body.skip||0;
        query.userid = user._id;
        let sort = '-createTime';
        let docs = await UserInterface.getRecord(query,{limit,skip,sort});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:docs||[]});
    },
    'POST /api/gethotrecords': async (ctx,next) => {
        let user = ctx.userobj;
        let limit = ctx.request.body.limit || 10;
        let docs = await UserInterface.getHotRecord({limit});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:docs||[]});
    },
    'POST /api/gethotqr': async (ctx,next) => {
        let user = ctx.userobj;
        let limit = ctx.request.body.limit || 10;
        let tab = parseInt(ctx.request.body.tab) || 1;
        let time = Utils.getDate7days();
        let docs = await UserInterface.getHotQr({tab,time},{limit});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:docs||[]});
    },
    'POST /api/search': async (ctx,next) => {
        let user = ctx.userobj;
        //let query = {};
        let limit = parseInt(ctx.request.body.limit || 20);
        let skip = parseInt(ctx.request.body.skip || 0);
        let content = ctx.request.body.content;
        let sort = ctx.request.body.sort;
        let tab = parseInt(ctx.request.body.tab);
        let location = ctx.request.body.location;
        let industry = ctx.request.body.industry;
        let gender = parseInt(ctx.request.body.gender);
        let agestart = parseInt(ctx.request.body.agestart);
        let ageend = parseInt(ctx.request.body.ageend);
        let query = {
            //'$or':[{groupname: new RegExp(content,'i')},{abstract:new RegExp(content,'i')}]
            tags: {$in:Utils.jieba(content)}
        };

        if(location){
            if(!(/^\d{6}$/.test(location))){
                return ctx.rest({status:MsgType.EErrorType.EInvalidLocation});
            }
            if(location === '000000'){
                return ctx.rest({status:MsgType.EErrorType.EInvalidLocation});
            }
            let tmp = '';
            let sheng = location.substr(0,2);
            let shi = location.substr(2,2);
            let xian = location.substr(4,2);
            if(parseInt(sheng)>0){tmp+=sheng;}
            if(parseInt(shi)>0){tmp+=shi;}
            if(parseInt(xian)>0){tmp+=xian;}
            query.location = new RegExp('^'+tmp);
        }
        if(!content || content.length < 1){
            return ctx.rest({status:MsgType.EErrorType.EInvalidContent});
        }
        if(typeof tab === 'undefined' || (tab !== 0 && tab !== 1 &&tab !== 2 &&tab !== 3)){
            return ctx.rest({status:MsgType.EErrorType.EInvalidTab});
        }
        if(tab === 2){
            if(gender){
                if(parseInt(gender) !== 1 && parseInt(gender) !== 2){
                    return ctx.rest({status:MsgType.EErrorType.EInvalidGender});
                }
                query.gender = parseInt(gender);
            }
            if(agestart||ageend){
                if(agestart&&ageend){
                    if(agestart > ageend){
                        return ctx.rest({status:MsgType.EErrorType.EStartGTEnd});
                    }
                    let datestart = new Date(Date.now()-agestart*365*24*3600*1000);
                    let dateend = new Date(Date.now()-ageend*365*24*3600*1000);
                    query.birthday = {
                        $gt:dateend,
                        $lt:datestart
                    }
                }else if(agestart){
                    let datestart = new Date(Date.now()-agestart*365*24*3600*1000);
                    query.birthday = {
                        $lt:datestart
                    }
                }else if(ageend){
                    let dateend = new Date(Date.now()-ageend*365*24*3600*1000);
                    query.birthday = {
                        $gt:dateend,
                    }
                }
            }
        }
        if(industry&&industry.length > 0){
            query.industry = industry;
        }
        if(tab !== 0){
            query.type = tab;
        }
        let options = {limit,skip};
        if(sort&&sort.length > 0){
            options.sort = sort;
        }
        //query.userid = user._id;
        //query.groupname = new RegExp(content,'i');
        let stime = Date.now();
        if(/*Utils.GetRandomNum(1,2) === */1){
            let docspromise = UserInterface.search(query,options);
            let countpromise = UserInterface.getQRCount(query);
            let locationpromise = UserInterface.getDisting('location',query);
            let industrypromise = UserInterface.getDisting('industry',query);
            let tagpromise = UserInterface.getDisting('grouptag',query);
            let recordpromise = UserInterface.newRecord({userid:user._id,record:content});

            let docs = await docspromise;
            let count = await countpromise;
            let locationsdis = await locationpromise;
            let industrydis = await industrypromise;
            let tagsdis = await tagpromise;
            await recordpromise;
            let etime = Date.now();
            Logger.debug('并行 时间 毫秒:',etime-stime);
            return ctx.rest({count:count,status:MsgType.EErrorType.EOK,data:docs||[],locations:locationsdis||[],industrys:industrydis||[],tags:tagsdis||[]});
        }else{


            let docs = await UserInterface.search(query,options);
            let count = await UserInterface.getQRCount(query);
            let locationsdis = await UserInterface.getDisting('location',query);
            let industrydis = await UserInterface.getDisting('industry',query);
            let tagsdis = await UserInterface.getDisting('grouptag',query);
            UserInterface.newRecord({userid:user._id,record:content});
            let etime = Date.now();
            Logger.debug('串行 时间 毫秒:',etime-stime);

            return ctx.rest({count:count,status:MsgType.EErrorType.EOK,data:docs||[],locations:locationsdis||[],industrys:industrydis||[],tags:tagsdis||[]});
        }

    },
    'POST /api/groupnamesearch': async (ctx,next) => {
        let user = ctx.userobj;
        //let query = {};
        let limit = ctx.request.body.limit || 20;
        let skip = ctx.request.body.skip || 0;
        let content = ctx.request.body.content;
        let tab = parseInt(ctx.request.body.tab);
        if(!content || content.length < 1){
            return ctx.rest({status:MsgType.EErrorType.EInvalidContent});
        }
        if(typeof tab === 'undefined' || (tab !== 0 && tab !== 1 &&tab !== 2 &&tab !== 3)){
            return ctx.rest({status:MsgType.EErrorType.EInvalidTab});
        }
        let query = {groupname: new RegExp(content,'i')};
        let reg = /^[\u4E00-\u9FFF]+$/;
        Logger.debug('gnsearch:',reg,content);
        if(reg.test(content)){
            Logger.debug('here');
            //如果全是中文则不必忽略大小写，这样可以加快查询速度
            query.groupname = new RegExp('^'+content);
        }else{
            Logger.debug('there');
            query.groupname = new RegExp('^'+content,'i');
        }
        if(tab !== 0){
            query.type = tab;
        }
        //query.userid = user._id;
        //query.groupname = new RegExp('^'+content,'i');
        let docs = await UserInterface.searchex(query,{limit,skip});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:docs||[]});
    },
    'POST /api/getcollections': async (ctx,next) => {
        let user = ctx.userobj;
        let userdoc = await DataInterface.getAccountById(user._id);
        if(!userdoc.collections || userdoc.collections.length < 1){
            return ctx.rest({status:MsgType.EErrorType.EOK,data:[]});
        }
        let query = {};
        let type = ctx.request.body.type || 1;
        let skip = ctx.request.body.skip || 0;
        let limit = ctx.request.body.limit || 20;
        query._id = {$in: userdoc.collections};
        query.type = type;
        let qrdoc = await UserInterface.getcollections(query,{limit,skip});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:qrdoc||[]});
    },
    'GET /api/getuploadcount': async (ctx,next) => {
        let user = ctx.userobj;
        let count = await UserInterface.getUploadCount(user._id);
        return ctx.rest({status:MsgType.EErrorType.EOK,data:count||0});
    },
    'POST /api/getweibilog': async (ctx,next) => {
        let user = ctx.userobj;
        let query = {};
        let skip = ctx.request.body.skip || 0;
        let limit = ctx.request.body.limit || 20;
        query.userid = user._id;
        let sort = '-createTime';
        let wbdoc = await UserInterface.getWeibiLog(query,{limit,skip,sort});
        return ctx.rest({status:MsgType.EErrorType.EOK,data:wbdoc||[]});
    },
};
