const Utils = require('./utils/common');
const mongoose = require('mongoose');
const fs = require('fs');
const promisemap = require('./utils/promisemap')
const Province = require('./utils/province');
let ObjectID = mongoose.Schema.ObjectId;
let ObjectId = mongoose.Schema.ObjectId;

let masterdb = mongoose.createConnection('mongodb://47.98.136.138:20005/wcgroup',{	user : "lovegnep",
    pass : "liuyang15",
    auth : {authMechanism: 'MONGODB-CR'}},function(err){
    if(err){
        console.log(err);
        process.exit(1);
    }else{
        console.log('mongodb connect success：mongodb://47.98.136.138:20005/wcgroup');
    }
});
let slavedb = mongoose.createConnection('mongodb://47.105.36.1:20005/wcgroup',{	user : "lovegnep",
    pass : "liuyang15",
    auth : {authMechanism: 'MONGODB-CR'}},function(err){
    if(err){
        console.log(err);
        process.exit(1);
    }else{
        console.log('mongodb connect success：mongodb://47.105.36.1:20005/wcgroup');
    }
});

let qrmodel = new mongoose.Schema({
    uploader:ObjectId,//上传者ID
    type:Number,//类型，1群，2个人，3公众号
    source:Number,//来源：1用户上传，2爬虫,3测试数据
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
let Qrmodelm = masterdb.model('Qrmodel', qrmodel);
let Qrmodels = slavedb.model('Qrmodel', qrmodel);
let n = 6;
let tmp = 0;
let test = async()=>{
    /*let groupQR = await Qrmodelo.distinct('groupQR',{source:{$ne:3}}).exec();
    let masterQR = await Qrmodelo.distinct('masterQR',{source:{$ne:3}}).exec();
    let groupavatar = await Qrmodelo.distinct('groupavatar',{source:{$ne:3}}).exec();
    let masterqr = await Qrmodelo.distinct('masterQR',{source:{$ne:3}}).exec();
    let grouptag = await Qrmodelo.distinct('grouptag',{source:{$ne:3}}).exec();
    let abstract = await Qrmodelo.distinct('abstract',{source:{$ne:3}}).exec();
    let groupname = await Qrmodelo.distinct('groupname',{source:{$ne:3}}).exec();
    let location = await Qrmodelo.distinct('location',{source:{$ne:3}}).exec();
    let industry = await Qrmodelo.distinct('industry',{source:{$ne:3}}).exec();
    let masterwx = await Qrmodelo.distinct('masterwx',{source:{$ne:3}}).exec();
    let userids = await UserModelo.distinct('_id').exec();*/
    let tmparr = [];
    let limit = 10000;
    let asn = async(doc)=>{
        await doc.save();
    }
    let dirarr = fs.readdirSync('./tool');
    let head = 'https://www.5min8.com/uploads/';
    for(let i = 0; i < 100000; i++){
        let llen = Province.GetRandomNum(1,10);
        let mydate1 = new Date();
        mydate1.setHours(mydate1.getHours()-Utils.GetRandomNum(0,2000));
        let mydate2 = new Date();
        mydate2.setHours(mydate2.getHours()-Utils.GetRandomNum(0,2000));
        let mydate3 = new Date();
        mydate3.setHours(mydate3.getHours()-Utils.GetRandomNum(0,2000));
        let mydate4 = new Date();
        mydate4.setDate(mydate4.getDate()-Utils.GetRandomNum(0,10000));
        let tmpobj = {
            type:Utils.GetRandomNum(1,3),
            source:3,
            industry:Province.getRandomIndustry(),
            location:Province.getRandPosition(),
            groupname:Province.getRandomChinese(3,9),
            abstract:Province.getRandomChinese(0,100),
            grouptag:Province.getRCArr(llen,2,3),
            masterwx:Province.getRandomStr(5,10),
            groupavatar:head+dirarr[Province.GetRandomNum(0,dirarr.length)],
            groupQR:head+dirarr[Province.GetRandomNum(0,dirarr.length)],
            masterQR:head+dirarr[Province.GetRandomNum(0,dirarr.length)],
            createTime:mydate1,
            updateTime:mydate2,
            viewCount:Utils.GetRandomNum(0,9999),
            likeCount:Utils.GetRandomNum(0,9999),
            commentCount:Utils.GetRandomNum(0,9999),
            gender:Utils.GetRandomNum(1,3),
            birthday:mydate4,
            f5Time:mydate3,
        };
        tmparr.push(tmpobj);
    }
    promisemap(tmparr,function(cur,index,tmparr){
        let tmpdoc = new Qrmodelm(cur);
        return tmpdoc.save();
    },1000).then(function(){
        tmp++;
        if(tmp < n){
            test();
        }
    })
    console.log('done');
}
test();

/*Model.Qrmodel.aggregate([{$match:{delete:false}}]).sort('-createTime').skip(2).limit(2).exec(function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
})*/
/*
Model.Qrmodel.find({delete:false,secret:false},{},{limit:2,sort:'-createTime'},function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
})

*/

/*
let date1 = new Date();
let date2 = new Date();
date2 = date2.setHours(date2.getHours()-2);
console.log(date1 < date2)
/*
let num = 0;
docs = Model.Qrmodel.aggregate([
    {
        $project:{
            uploader:1,
            type:1,
            source:1,
            industry:1,
            location:1,
            groupname:1,
            abstract:1,
            grouptag:1,
            masterwx:1,
            groupavatar:1,
            groupQR:1,
            masterQR:1,
            createTime:1,
            updateTime:1,
            viewCount:1,
            commentCount:1,
            gender:1,
            birthday:1,
            likeCount:1,
            multiplyCount:{
                "$add":["$viewCount",{
                    "$add":["$commentCount",{
                        "$multiply":[2,"$likeCount"]
                    }]
                }]
        }
    }}

]).sort('-multiplyCount -createTime').limit(5).exec(function(err,data){
if(err){
    console.log(err);
}else{
    console.log(data);
}
});
/*
*             multiplyCount:{
            "$add":["$viewCount",{
                "$add":["$commentCount",{
                    "$multiply":[2,"$likeCount"]
                }]
            }]
        }
* */
/*
docs = Model.Qrmodel.aggregate([
    {
        $project: {
            uploader:1,
            type:1,
            source:1,
            industry:1,
            location:1,
            groupname:1,
            abstract:1,
            grouptag:1,
            masterwx:1,
            groupavatar:1,
            groupQR:1,
            masterQR:1,
            createTime:1,
            updateTime:1,
            viewCount:1,
            commentCount:1,
            gender:1,
            birthday:1,
            likeCount:1,
            multiplyCount:{
                "$multiply":[2,"$likeCount"]
            }
        }
    },
    {
        $project: {
            uploader:1,
            type:1,
            source:1,
            industry:1,
            location:1,
            groupname:1,
            abstract:1,
            grouptag:1,
            masterwx:1,
            groupavatar:1,
            groupQR:1,
            masterQR:1,
            createTime:1,
            updateTime:1,
            viewCount:1,
            commentCount:1,
            gender:1,
            birthday:1,
            likeCount:1,
            multiplyCount1:{
                "$add":["$multiplyCount","$viewCount"]
            }
        }
    },
    /*{
        $project: {
            uploader:1,
            type:1,
            source:1,
            industry:1,
            location:1,
            groupname:1,
            abstract:1,
            grouptag:1,
            masterwx:1,
            groupavatar:1,
            groupQR:1,
            masterQR:1,
            createTime:1,
            updateTime:1,
            viewCount:1,
            commentCount:1,
            gender:1,
            birthday:1,
            likeCount:1,
            multiplyCount2:{
                "$add":["$multiplyCount1","$commentCount"]
            }
        }
    }
]).sort('-multiplyCount1 -createTime').limit(5).exec(function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
});
/*
let res = [];
for(let i = 100; i< 150; i++){
    res.push(i+1);
}
console.log(res);
/*
let ff = function () {
    Model.RecordRank.update({record: "哈哈"}, {$inc: {num: 1}}, {upsert: true}, function (err, data) {
        console.log('done:', num++);
    });
};
Model.Qrmodel.findById('5aea8149aaf0bf2d5c480bfa',function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data.createTime);
    }
})
console.log(Date.parse('2018-05-03T03:26:01.648Z'))
/*
let nbfore = Utils.getnBefore(1);

    Model.Qrmodel.find({
        delete:false,
        secret:false,
        f5Time:{$gt:nbfore}
    },{},{
        limit:20,
        sort:'-createTime'
    },function(err,data){
        if(err){
            console.log(err);
        }
        if(data){
            console.log(data);
        }
    })
    /*
Model.Qrmodel.find({
    delete:false,
    secret:false,
    $or:[
        {
            f5Time:{$exists:false}
        },
        {
            f5Time:{$lt:nbfore}
        }
    ]
},{},{
    limit:20,
    sort:'-createTime'
},function(err,data){
    if(err){
        console.log(err);
    }
    if(data){
        console.log(data);
    }
})
/*
Model.Qrmodel.find({},{},{limit:5,sort:'-createTime'},function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
})
/*
var myDate = new Date(); //获取今天日期
myDate.setDate(myDate.getDate() - 7);
console.log(myDate);
/*
Model.Qrmodel.aggregate([
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
]).sort('-count').limit(10).exec(function (err, data) {
    console.log(err,data);
})
/*
Model.Record.aggregate([
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
]).sort('-count').exec(function (err, data) {
    console.log(err,data);
})
/*
Model.Record.aggregate([
    {
        $match: {
            userid: mongoose.Types.ObjectId('5ae2f502c1603d5f6b5504f2')
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
]).sort('-time').skip(3).limit(20).exec(function (err, data) {
    console.log(data);
})
/*
 Model.RecordRank.aggregate([
 {
 $group:{
 _id:"$record",
 count:{
 $sum:1
 }
 }
 }
 ]).exec(function(err,data){
 console.log(data);
 })
 /*
 Model.RecordRank.aggregate([
 {
 $group:{
 _id:"$record",
 total:{
 $sum:"$num"
 }
 }
 }
 ]).sort('-total').exec(function(err,data){
 console.log(data);
 })
 /*let doc1 = new Model.RecordRank({record:'哈哈',num:1});
 doc1.save();
 let doc2 = new Model.RecordRank({record:'哈哈',num:1});
 doc2.save();
 let doc3 = new Model.RecordRank({record:'等等',num:1});
 doc3.save();
 let doc4 = new Model.RecordRank({record:'等等',num:1});
 doc4.save();
 let doc5 = new Model.RecordRank({record:'一一',num:1});
 doc5.save();
 function findThePhoneWithMostAppsInstalled() {
 Phone.aggregate([{
 $project: {
 apps_count: {
 $size: {
 "$ifNull": ["$apps", []]
 }
 },
 device: 1,
 manufacturer: 1,
 apps: 1
 }
 },
 {$sort: {"apps_count": -1}}
 ])
 // .limit(1) // 可加可不加.取结果的phones[0]即可了
 .exec((err, phones) => {
 console.log('---findThePhoneWithMostAppsInstalled()---------------------------------');
 if (err) {
 console.log(err);
 } else {
 var phone = phones[0];
 console.log(phone);
 }
 });
 }
 //setTimeout(ff,2000);
 /*let isShareSameGroup = async(data)=>{
 //userid,openid
 let now0 = Utils.getDate00();
 //Logger.debug('isShareSameGroup:',data,now0);
 let doc = await Model.Share.find({userid:data.userid,targetid:data.openid,createTime:{$gt:now0}});
 if(!doc||doc.length < 1){
 return true;
 }
 return false;
 }
 isShareSameGroup({userid:'5ae2f502c1603d5f6b5504f2',targetid:'tGKYN65fd4OUA13yodH9WqOPg4zfU',}).then(function(res){
 let aa = res;
 }).catch(function(err){
 let b = err;
 })
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

