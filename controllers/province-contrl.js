const Province = require('../utils/province');
const _ = require('lodash');
const MsgType = require('../common/msgtype');
const Utils = require('../utils/common');

module.exports = {
    'GET /api/province': async (ctx, next) => {
        let parent = parseInt(ctx.query.parent);
        if(!parent || parent===''){
            let res = Province.getLocations();
            return ctx.rest({data:res, status:MsgType.EErrorType.EOK});
        }
        if(!Utils.validLocationId(parent)){
            return ctx.rest({status:MsgType.EErrorType.EInvalidLocation});
        }
        let res = Province.getLocations(parent);
        return ctx.rest({data:res, status:MsgType.EErrorType.EOK});
    },
};