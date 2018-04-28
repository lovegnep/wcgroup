const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');
const Utils = require('../utils/common');

let updateViewsAndWeibi = async(qrid, userid,ismonth) =>{
    let wherestr = {_id:userid};
    let updatestr = null;
    if(ismonth){
        updatestr =     {
            $push:{views:qrid},
        };
    }else{
        updatestr =     {
            $push:{views:qrid},
            $inc:{weibi:-1}
        };
    }

    try{
        await Model.UserModel.update(wherestr,updatestr).exec();
    }catch(err){
        Logger.error('updateviews: err:',err);
    }
}

let sign = async (_id) => {
    let today0 = Utils.getDay00();
    let query = {
        _id:"5ae2f502c1603d5f6b5504f2",
        $or:[
            {lastsigntime:{$exists:false}},
            {lastsigntime:{$lt:today0}}
        ]
    };
    let upstr = {
        lastsigntime:Date.now(),
        $inc:{weibi:50}
    }
    let res = null;
    try{
        res = await Model.UserModel.update(query,upstr,{}).exec();
    }catch(err){
        Logger.error('sign: sign error:',_id);
        return {err:err,res:null};
    }
    return {err:null,res:res};

}
let getviews = async(query,options) => {
    let res = await Model.Qrmodel.find(query,{},options).exec();
    return res;
}
let getcollections = async(query,options) => {
    let res = await Model.Qrmodel.find(query,{},options).exec();
    return res;
}
let getUploadCount = async(_id) => {
    let count = await Model.Qrmodel.count({uploader:_id}).exec();
    return count;
}
exports = {
    updateViewsAndWeibi:updateViewsAndWeibi,
    sign:sign,
    getviews:getviews,
    getcollections:getcollections,
    getUploadCount:getUploadCount,
};
Object.assign(module.exports, exports);
