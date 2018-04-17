
const fs = require('fs');
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
            cb(null,'public/uploads/')  
        },  
        filename:function (req,file,cb){  
            var fileFormat = (file.originalname).split(".");  
            cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);  
        }  
    })  
    var upload = multer({storage:storage});  
    //upload.single('file')这里面的file是上传空间的name<input type="file" name="file"/>    
    router.post('/api/uploadImg',upload.single('imgFile'),async (ctx,next) => {  
        //ctx.response.body ="<h1>上传成功！</h1>";  
        /*ctx.body = {   
                filename: ctx.req.file.filename//返回文件名   
        } */  
        //ctx.redirect('/index');  
        let filename = ctx.req.imgFile.filename;
        console.log("file upload success.:",ctx.req.imgFile.filename);
        ctx.rest({filename: filename, status:1});
    })  
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
    return router.routes();
};
