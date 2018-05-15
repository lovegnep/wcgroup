//登录ctrl
const MsgType = require('../common/msgtype');
const Logger = require('../utils/logger');
let usermap = require('../utils/usercache');

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
let auth = async(ctx, next) => {
    let path = ctx.request.path;
    Logger.debug("path: %s, url: %s", path, ctx.request.url);
    let _id = ctx.req.headers['sessionkey'];
    if(!_id && path !== '/api/auth'){
        return ctx.rest({status:MsgType.EErrorType.ENotLogin,err:"please login first."});
    }
    if(_id){
        let userobj = await getUser(ctx);
        if(!userobj){
            return ctx.rest({status:MsgType.EErrorType.ENeedReLogin,err:'please relogin...'});
        }
        ctx.userobj = userobj;
    }
    await next();
}
exports = {
    auth:auth,
};
Object.assign(module.exports,exports);
