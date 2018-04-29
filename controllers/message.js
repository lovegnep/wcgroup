const MessageInterface = require('../dataopt/message');
const DataInterface = require('../dataopt/interface');
const Config = require('../config');
const Logger = require('../utils/logger');

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

exports = {
    'POST /api/sendmessage': async (ctx, next) =>{
        let islogin = await isLogin(ctx);
        if(!islogin){
            return ctx.rest({status:0,message:'please login first.'});
        }
        let user = await getUser(ctx);
        if(!user){
            return ctx.rest({status:0,message:'unknown err'});
        }
    },
};
Object.assign(module.exports, exports);