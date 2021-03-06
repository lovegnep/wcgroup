const mongoose = require('mongoose');
const Logger = require('./utils/logger');
const Config = require('./config');
const ObjectId  = mongoose.Schema.ObjectId;
const fs = require('fs');
const Uuidv1 = require('uuid/v1')
const Utils = require('./utils/common');
const Province = require('./utils/province')
let cb = null;
let conn = false;
mongoose.connect(Config.db, function(err){
    if(err){
        Logger.error('mongoose connect failed.');
        process.exit(1);//进程退出
    }else{
        Logger.info('mongoose connect success.');
        conn = true;
        if(cb){
            cb();
        }
    }
});
//群二维码表,个人微信，公众号
let qrmodel = new mongoose.Schema({
    uploader:ObjectId,//上传者ID
    type:Number,//类型，1群，2个人，3公众号
    source:Number,//来源：1用户上传，2爬虫
    industry:String,
    location:String,
    groupname:String,
    abstract:String,
    grouptag:[String],//标签
    masterwx:String,//,上传者微信，个人微信，公众号ID
    groupavatar:String,//微信群头像，个人头像，公众号头像
    groupQR:String,//微信群二维码，个人二维码，公众号二维码
    masterQR:String,//上传者二维码
    createTime:{type: Date, default: Date.now},
    updateTime:{type: Date, default: Date.now},
    viewCount:{type:Number, default:0},
    likeCount:{type:Number, default:0},
    commentCount:{type:Number, default:0},
    gender:Number,//1男，2女，3保密， 当类型为个人时才会有
    birthday:Date,// 生日， 当类型为个人时才会有
    downs:[ObjectId],//点赞的用户，里面存储用户
    ups:[ObjectId],//踩的用户，里面存储用户
    delete:{type: Boolean, default: false},//是否删除
    secret:{type: Boolean, default: false},//是否下架
    f5Time:Date//刷新时间
});
let Qrmodel = mongoose.model('Qrmodel', qrmodel);
let dir = fs.readdirSync('./tool');
let location = ['河南','河北','山西'];
let tmp = function(){
    dir.forEach(function(item){
        let fileall = item.split('.');
        let filename = fileall[0];
        let prefix = '.'+fileall[1];
        let newname = Uuidv1();
        let rand = Utils.GetRandomNum(0,location.length-1);
        fs.renameSync('./tool/'+item, './tool/'+newname+prefix);
        let bir = Utils.stringToDate('1989-09-08');
        let doc = new Qrmodel({
            grouptag:'徽商，赚钱',
            masterwx:'abcdefg',
            groupQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupavatar:'https://www.5min8.com/uploads/'+newname+prefix,
            masterQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupname:filename,
            abstract:filename+filename,
            industry:filename,
            location:Province.getRandPosition(),
            birthday:bir,
            gender:Utils.GetRandomNum(1,3),
            source:2,
            type:1
        });
        doc.save();

        doc = new Qrmodel({
            grouptag:'徽商，赚钱',
            masterwx:'abcdefg',
            groupQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupavatar:'https://www.5min8.com/uploads/'+newname+prefix,
            masterQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupname:filename,
            abstract:filename+filename,
            industry:filename,
            location:Province.getRandPosition(),
            birthday:bir,
            gender:Utils.GetRandomNum(1,3),
            source:2,
            type:2
        });
        doc.save();
        doc = new Qrmodel({
            grouptag:'徽商，赚钱',
            masterwx:'abcdefg',
            groupQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupavatar:'https://www.5min8.com/uploads/'+newname+prefix,
            masterQR:'https://www.5min8.com/uploads/'+newname+prefix,
            groupname:filename,
            abstract:filename+filename,
            industry:filename,
            location:Province.getRandPosition(),
            birthday:bir,
            gender:Utils.GetRandomNum(1,3),
            source:2,
            type:3
        });
        doc.save();
    });
}

if(conn){
    tmp();
}else{
    cb = tmp;
}
    /*

let doc1 = new Uds({
    uid:'111',
    coords:[1,1]
});
doc1.save();
let doc2 = new Uds({
    uid:'222',
    coords:[2,2]
});
doc2.save();
let doc3 = new Uds({
    uid:'333',
    coords:[3,3]
});
doc3.save();*/
/*let point = {
    type: "Point",
    coordinates: [1, 1]
};
Uds.aggregate(
    [{
        '$geoNear': {
            'near': point,
            'spherical': true,
            'distanceField': 'dist',
        }
    },
        { "$skip": 0 },
        { "$limit": 3 }],
    function(err, results) {
        console.log('err:',err,results);
    }
)*/

