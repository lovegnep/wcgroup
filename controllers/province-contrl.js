const Province = require('../utils/province');
const _ = require('lodash');

module.exports = {
    'GET /api/province': async (ctx, next) => {
        let index = ctx.request.body.index;
        let first = ctx.request.body.first;
        let res = [];
        if(index === 1){
            res = Province.get1();
        }else if(index === 2){
            if(_.isEmpty(first)){
                return ctx.rest({data:[], status:0});
            }
            res = Province.get2(first);
        }
        ctx.rest({data:res, status:1});
    },
};