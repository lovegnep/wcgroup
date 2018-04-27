const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');

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

exports = {
    updateViewsAndWeibi:updateViewsAndWeibi,
};
Object.assign(module.exports, exports);
