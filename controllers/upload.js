
const Utils = require('../utils/common');
const DataInterface = require('../dataopt/interface');
const Logger = require('../utils/logger');
const MsgType = require('../common/msgtype');
const GmConfig = require('../common/gm');
const UserInterface = require('../dataopt/user');

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
        let user = ctx.userobj;
        let uploader = user._id;
        if(!uploader||uploader.length < 5){
            return ctx.rest({status:MsgType.EErrorType.EInvalidUploader});
        }
        let query = {uploader,abstract,industry,groupavatar,groupname,groupQR,masterQR,masterwx,type,source};
        if(grouptag&&grouptag!==''){
            query.grouptag = grouptag.split(',');
        }
        if(!groupname||groupname.length < 2){
            return ctx.rest({status:MsgType.EErrorType.EInvalidGroupname});
        }
        query.tags = Utils.getTagsByJieBa(groupname,abstract,grouptag);
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
        let user = ctx.userobj;
        if(!oldqrdoc ){
            return  ctx.rest({status:MsgType.EErrorType.ENotFindQR});
        }
        if(oldqrdoc.uploader.toString() !== user._id){
            return  ctx.rest({status:MsgType.EErrorType.EQRNotUser});
        }
        let uploader = user._id;
        let updatestr = {abstract,industry,location,groupavatar,groupname,groupQR,grouptag,masterQR,masterwx};
        if(grouptag&&grouptag!==''){
            updatestr.grouptag = grouptag.split(',');
        }
        if(!groupname||groupname.length < 2){
            return ctx.rest({status:MsgType.EErrorType.EInvalidGroupname});
        }
        updatestr.tags = Utils.getTagsByJieBa(groupname,abstract,grouptag);
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
