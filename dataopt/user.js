const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');

let updateViewsAndWeibi = async(qrid, userid) =>{
    let wherestr = {_id:userid};
    let updatestr = {
        $push:{views:qrid},
        $inc: {weibi: -1}
    }
    try{
        await Model.UserModel.update(wherestr,updatestr).exec();
    }catch(err){
        Logger.error('updateviews: err:',err);
    }
}

exports = {
    updateViewsAndWeibi:updateViewsAndWeibi,
};
Object.assign(module.exports, exports);
