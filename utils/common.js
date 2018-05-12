const crypto = require('crypto');
const md5 = require('md5');
const Config = require('../config');
const Logger = require('./logger');
const MsgType = require('../common/msgtype');
const Jieba = require('nodejieba');

//refer格式
//https://servicewechat.com/{appid}/{version}/page-frame.html

function jieba(str){
    let res = [];
    let tmparr = Jieba.extract(str,str.length);
    tmparr.forEach(function(item){
        res.push(item.word);
    });
    return res;
}
function getTagsByJieBa(groupname,abstract,grouptag){
    let res = '';
    if(groupname&&groupname.length > 0){
        res += groupname;
    }
    if(abstract&&abstract.length > 0){
        res+=','+abstract;
    }
    if(grouptag&&grouptag.length > 0){
        res += ','+grouptag;
    }
    if(res === ''){
        return [];
    }
    return jieba(res);
}
function validGender(a){
    if(!a || (a!==1 && a !==2 && a!==3)){
        return false;
    }
    return true;
}
function validBirthday(a){
    let reg = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
    return reg.test(a);
}
function validLocationId(id){
    if(!id||id.length !== 6){
        return false;
    }
    if(!(/\d{6}/.test(id))){
        return false;
    }
    let sheng = id.substr(0,2);
    let shi = id.substr(2,2);
    let xian = id.substr(4,2);
    let flag = false;
    if(parseInt(sheng) === 0){
        return false;
    }
    if(parseInt(shi) === 0){
        flag = true;
    }
    if(parseInt(xian) > 0 && flag){
        return false;
    }
    return true;
}
function testappid(ctx,next){
    let refer = ctx.req.headers['referer'];
    if(!refer || refer.length < 30){
        Logger.warn('testappid: can not find refer or refer1 invalid.');
        return ctx.rest({status:MsgType.EErrorType.EInvalidReq});
    }
    if(refer.indexOf(Config.wechat.appid) !== -1){
         return next();
    }
    Logger.warn('testappid: can not find refer or refer2 invalid.');
    return ctx.rest({status:MsgType.EErrorType.EInvalidReq});
}

let getDay00 = function(){//返回当天0点豪秒
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today.getTime();
}
let getDate00 = function(){//返回当天0点DATE
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
}
function isInArray(arr, _id){
    if(!arr || arr.length < 1){
        return false;
    }
    let len = arr.length;
    for(let i = 0; i < len; i++){
        //Logger.debug('isInArray:',typeof arr[i], _id);
        if(arr[i].toString() == _id){
            return true;
        }
    }
    return false;
}
function getDate7days(){//7天前0点的DATE
    let myDate = getDate00();
    myDate.setDate(myDate.getDate() - 7);
    return myDate;
}
function getnBefore(n){//获取n小时之前的date
    let mydate = new Date();
    mydate.setHours(mydate.getHours () - n);
    return mydate;
}
function GetRandomNum(Min,Max)
{
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
function stringToDate (fDate){
    var fullDate = fDate.split("-");

    return new Date(fullDate[0], fullDate[1]-1, fullDate[2], 0, 0, 0);
}
module.exports = {
    sleep: function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('ok');
                //reject('error'); //模拟出错了，返回 ‘error’
            }, time);
        })
    },
    decryptUserInfoData:async (sessionKey, encryptedData, iv) => {
        // base64 decode
        const _sessionKey = Buffer.from(sessionKey, 'base64');
        encryptedData = Buffer.from(encryptedData, 'base64');
        iv = Buffer.from(iv, 'base64');
        let decoded = '';
        try {
          // 解密
          const decipher = crypto.createDecipheriv('aes-128-cbc', _sessionKey, iv);
          // 设置自动 padding 为 true，删除填充补位
          decipher.setAutoPadding(true);
          decoded = decipher.update(encryptedData, 'binary', 'utf8');
          decoded += decipher.final('utf8');
    
          decoded = JSON.parse(decoded);
        } catch (err) {
          return '';
        }
    
        if (decoded.watermark.appid !== Config.wechat.appid) {
          return '';
        }
    
        return decoded;
      },
    testappid:testappid,
    getDay00:getDay00,
    isInArray:isInArray,
    getDate00:getDate00,
    getDate7days:getDate7days,
    getnBefore:getnBefore,
    GetRandomNum:GetRandomNum,
    stringToDate:stringToDate,
    validLocationId:validLocationId,
    validGender:validGender,
    validBirthday:validBirthday,
    jieba:jieba,
    getTagsByJieBa:getTagsByJieBa
};
