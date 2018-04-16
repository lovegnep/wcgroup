const Province = require('../utils/province');
const _ = require('lodash');

module.exports = {
    'GET /api/province': async (ctx, next) => {
        let index = parseInt(ctx.query.index);
        let first = ctx.query.first;
        let res = [];
        if(index === 1){
            res = Province.get1();
        }else if(index === 2){
            if(_.isEmpty(first)){
                return ctx.rest({data:[], status:0});
            }
            res = Province.get2(first);
        }else{
            return ctx.rest({data:[], status:0});
        }
        ctx.rest({data:res, status:1});
    },
};