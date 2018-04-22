const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');
const MsgType = require('../common/msgtype');

//发送消息
let newMessage = async (data) =>{
    let message = new Model.Message({...data});
    let messagedoc = await message.save();
    return messagedoc;
}

//查询用户消息
let getMessage = async(query, options) =>{
    let mess = null;
    try{
        mess = await Model.Message.find(query,{},options).exec();
        Logger.debug('getMessage: getmessage success:', JSON.stringify(mess));
    }catch(err){
        Logger.error('getMessage:err:',err);
    }
    return mess;
}

//阅读消息
let readMessage = async (_id) => {
    let mes = null;
    try{
        mes = await Model.Message.findByIdAndUpdate(_id,{status:MsgType.EMessageStatus.ERead},{new:true}).exec();
        Logger.debug("readMessage: updated doc:", JSON.stringify(mes));
    }catch(err){
        Logger.error('readMessage:err:',err);
    }
    return mes;
}

//删除消息
let delMessage = async (_id) => {
    let mes = null;
    try{
        mes = await Model.Message.findByIdAndUpdate(_id,{delete:true},{new:true}).exec();
        Logger.debug("delMessage: updated doc:", JSON.stringify(mes));
    }catch(err){
        Logger.error('delMessage:err:',err);
    }
    return mes;
}

exports = {
    newMessage:newMessage,
    readMessage:readMessage,
    delMessage:delMessage,
    getMessage:getMessage,
};
Object.assign(module.exports, exports);