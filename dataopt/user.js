const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');
const Utils = require('../utils/common');
const GmConfig = require('../common/gm');
const MsgType = require('../common/msgtype');

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
            $inc:{weibi:GmConfig.weibi.view}
        };
    }
    let res = null;
    try{
        res = await Model.UserModel.findOneAndUpdate(wherestr,updatestr).exec();
    }catch(err){
        Logger.error('updateviews: err:',err);
    }
    return res;
}

let sign = async (_id) => {
    let today0 = Utils.getDay00();
    let query = {
        _id:_id,
        $or:[
            {lastsigntime:{$exists:false}},
            {lastsigntime:{$lt:today0}}
        ]
    };
    let upstr = {
        lastsigntime:Date.now(),
        $inc:{weibi:GmConfig.weibi.sign}
    }
    let res = null;
    try{
        res = await Model.UserModel.findOneAndUpdate(query,upstr,{}).exec();
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

let newShare = async(data) => {
    Logger.debug('newShare:',data);

    let doc = new Model.Share({...data});
    let sharedoc = await doc.save();
    return sharedoc;
}
let isShareSameGroup = async(data)=>{
    //userid,openid
    let now0 = Utils.getDate00();
    Logger.debug('isShareSameGroup:',data,now0);
    let doc = await Model.Share.find({userid:data.userid,targetid:data.openid,createTime:{$gt:now0}});
    //Logger.debug('isShareSameGroup:',doc);
    if(!doc||doc.length < 1){
        return false
    }
    return true;
}
let addWeiBi = async (_id, num) =>{
    let res = await Model.UserModel.findOneAndUpdate({_id:_id},{$inc:{weibi:num}});
    if(res&&res._id){
        Logger.debug('add weibi success:',_id,num);
    }
    return res;
}

let shareIn = async (index,userid)=>{
    //用户userid通过index分享进入
    let res = await Model.Share.update({index:index},{$addToSet:{son:userid}}).exec();
    return res;
}
let getRecord = async (query,options) => {
    let docs = await Model.Record.aggregate([
        {
            $match: {
                userid: Model.ObjectIdFun(query.userid)
            }
        },
        {
            $group: {
                _id: '$record',
                time: {
                    $max: '$createTime'
                },
                count:{
                    $sum:1
                }
            }
        }
    ]).sort('-time').skip(options.skip).limit(options.limit).exec();
    return docs;
}
let getHotRecord = async (options) =>{
    let docs = await Model.Record.aggregate([
        {
            $group: {
                _id: {
                    record:'$record',
                    userid:'$userid'
                },
                count:{
                    $sum:1
                }
            }
        },
        {
            $group: {
                _id: '$_id.record',
                count:{
                    $sum:1
                }
            }
        }
    ]).sort('-count').limit(options.limit).exec();
    return docs;
}
let getHotQr = async (query,options) =>{
    let docs = await Model.Qrmodel.aggregate([
        {
            $match: {
                type:query.tab,
                updateTime:{
                    $gte : query.time
                }
            }
        },
        {
            $project: {
                viewCount:1,
                groupname:1,
                likeCount:{
                    "$multiply": [2, "$likeCount"]
                }
            }
        },
        {
            $project: {
                groupname:1,
                count: {
                    "$add":["$viewCount","$likeCount"]
                }
            }
        }
    ]).sort('-count').limit(options.limit).exec();
    return docs;
}
let newRecord = async (data) => {
    let doc = new Model.Record({...data});
    let sdoc = await doc.save();
    Logger.debug('new search record success:',sdoc);
    return sdoc;
}
let search = async (query,options) => {
    let docs = await Model.Qrmodel.find(query,{},options).exec();
    Logger.debug('searchex:',query,options,docs);
    return docs;
}
let searchex = async (query,options) => {
    let docs = await Model.Qrmodel.find(query,'groupname',options).exec();
    Logger.debug('searchex:',query,options,docs);
    return docs;
}
let newWeibiLog = async(data) => {
    Logger.debug('newShare:',data);

    let doc = new Model.WeibiLog({...data});
    let weibidoc = await doc.save();
    return weibidoc;
}
let getWeibiLog = async(query,options)=>{
    let docs = await Model.WeibiLog.find(query,{},options).exec();
    return docs;
}
exports = {
    updateViewsAndWeibi:updateViewsAndWeibi,
    sign:sign,
    getviews:getviews,
    getcollections:getcollections,
    getUploadCount:getUploadCount,
    newShare:newShare,
    isShareSameGroup:isShareSameGroup,
    addWeiBi:addWeiBi,
    shareIn:shareIn,
    getRecord:getRecord,
    newRecord:newRecord,
    search:search,
    searchex:searchex,
    getHotRecord:getHotRecord,
    getHotQr:getHotQr,

    newWeibiLog:newWeibiLog,
    getWeibiLog:getWeibiLog
};
Object.assign(module.exports, exports);
