var timeoutFunMap = new Map();
const Logger = require('../utils/logger');

module.exports = {
    timeoutFunMap: timeoutFunMap,
    APIError: function (code, message) {
        this.code = code || 'internal:unknown_error';
        this.message = message || '';
    },
    restify: (pathPrefix) => {
        return async (ctx, next) => {
            //Logger.debug('rest midwarre.');
            ctx.rest = (data, httpCode) => {
                //Logger.debug('send json:',JSON.stringify(data));
                ctx.response.type = 'application/json';
                ctx.response.body = data;
                if (httpCode) {
                    ctx.response.status = httpCode;
                }else{
                    ctx.response.status = 200;
                }
            }
            return next();
        };
    }
};
