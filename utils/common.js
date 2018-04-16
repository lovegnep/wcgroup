const crypto = require('crypto');
const md5 = require('md5');
const Config = require('../config');

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
      }
};
