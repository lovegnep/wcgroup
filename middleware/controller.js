const Logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const Uuidv1 = require('uuid/v1');
const Config = require('../config');
const MsgType = require('../common/msgtype');
const Qrdecode = require('../utils/qrdecode');
const Utils = require('../utils/common');
let config = {
    rootpath:''
};
/*
const multer = require('koa-router-multer');//加载koa-multer模块
//文件上传
//配置
let storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    //修改文件名称
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
})
//加载配置
let upload = multer({ storage: storage });*/
// add url-route in /controllers:

function addMapping(router, mapping) {
    for (var url in mapping) {
        /*if (url.startsWith('POST /api/uploadImg')) {
            var path = config.rootpath + url.substring(5);
            router.post(path, upload.single('imgFile'), mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        }else */if (url.startsWith('GET ')) {
            var path = config.rootpath + url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = config.rootpath + url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            var path = config.rootpath + url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            var path = config.rootpath + url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}
function addUploadFile(router) {  
    //文件上传  
    const multer = require('koa-multer');  
    //配置  
    var storage = multer.diskStorage({  
        //文件保存路径  
        destination:function (req,file,cb) {  
            cb(null,Config.uploadimg.dir)
        },  
        filename:function (req,file,cb){  
            var fileFormat = (file.originalname).split(".");  
            cb(null,Uuidv1() +process.pid+ "." + fileFormat[fileFormat.length - 1]);
        }  
    })  
    var upload = multer({storage:storage});  
    //upload.single('file')这里面的file是上传空间的name<input type="file" name="file"/>    
    router.post('/api/uploadImg',upload.single('imgFile'),async (ctx,next) => {  
        let filename = ctx.req.file.filename;
        let absolutePath = path.join(Config.uploadimg.dir, filename);
        Logger.debug('test: absolutePath:',absolutePath);
        Logger.debug('test:head:',ctx.req.headers);
        let type = parseInt(ctx.req.body.type);
        let res = null;
        if(type === MsgType.ImgType.EGQR || type === MsgType.ImgType.EUploaderQR){//是二维码，则要判断是否是二维码
            let filestates = fs.statSync(absolutePath);
            if(filename.size < 5*1024){
                fs.unlinkSync(absolutePath);
                return ctx.rest({status:MsgType.EErrorType.EQRTooSmall}); 
            }
            try{
                res = await Utils.execpromise('zbarimg '+absolutePath);
                if(res&&res.length > 20&&res.indexOf(':') > -1){
                    res = res.substr(res.indexOf(':')+1);
                    let in1 = res.indexOf('weixin.qq.com');
                    let in2 = res.indexOf('u.wechat.com');
                    if(in1 === -1 && in2 === -1){
                        res = null;
                    }
                }else{
                    res = null;
                }
            }catch(err){
                Logger.error('post /api/uploadImg: zbarimg err:',err);
            }
            if(!res){
                try{
                    res = await Qrdecode.decode(absolutePath);
                }catch(err){
                    Logger.error('post /api/uploadImg: qrdecode err:',err);
                }
                if(!res){
                    fs.unlinkSync(absolutePath);
                    return ctx.rest({status:MsgType.EErrorType.EInvalidQR});
                }
            }

        }
        Logger.info('POST /api/uploadImg: filename:', filename);
	    ctx.rest({filename: '/uploads/'+filename, status:MsgType.EErrorType.EOK});
    });  
    console.log(`register URL mapping: POST /uploadFile`);  
}
function addControllers(router, dir) {
    fs.readdirSync(__dirname + '/' + dir).filter((f) => {
        return f.endsWith('.js');
    }).forEach((f) => {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    });
}

module.exports = function (dir) {
    let
        controllers_dir = dir || '../controllers',
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    addUploadFile(router);
    return router.routes();
};
