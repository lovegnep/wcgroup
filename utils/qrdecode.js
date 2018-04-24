const Qrdecoder = require('./qrcode-decoder');
const Logger = require('./logger');
const fs = require('fs');

//path要求是文件的绝对路径
function decodepro(path){
    if(!path || path.length < 1 ){
        Logger.error('decode: !path.');
        return null;
    }
    if(path[0] !== '/'){
        Logger.error('decode: the path must start with /');
        return null;
    }
    return new Promise(function(resolve,reject){
        fs.readFile(path, function(err, squid){
            if (err) reject(err);
            Qrdecoder.callback = function(data){
                Logger.info('getdata:', data);
                resolve(data);
            }
            Qrdecoder.decode(squid);

        });
    });


}

let decode = async (path) =>{
    let res = await decodepro(path);
    return res;
}

exports = {
    decode:decode
}
Object.assign(module.exports, exports);