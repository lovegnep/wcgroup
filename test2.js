const Utils = require('./utils/common');
const mongoose = require('mongoose');
const nodejieba = require("nodejieba");
const fs = require('fs');
const promisemap = require('./utils/promisemap')
const Province = require('./utils/province');
let ObjectID = mongoose.Schema.ObjectId;
let ObjectId = mongoose.Schema.ObjectId;
let uri = 'mongodb://47.98.136.138:20005,47.105.36.1:20005,39.108.56.116:20005/wcgroup';
let masterdb = mongoose.createConnection(uri,{
        user : "lovegnep_wcgroup",
        pass : "liuyang15",
        auth : {authMechanism: 'SCRAM-SHA-1'},
        replicaSet:'wcgroup',
        readPreference: "secondaryPreferred"
    },
    function(err){
        if(err){
            console.log(err);
            process.exit(1);
        }else{
            console.log('mongodb connect success');
            let s = Date.now();
            //"$or":[{"f5Time":{"$exists":false}},{"f5Time":{"$lt":new Date("2018-05-09T00:34:13.795Z")}}]
            /*Qrmodelm.find({"f5Time":{"$gte":new Date()}},{},{limit:5,sort:'-updateTime'},function(err,res){
                if(err){
                    console.log(err);
                }else{
                    console.log(res.length);
                }
                let e = Date.now();
                console.log('用时：',e-s);
            })*/

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
    tags:[String],//标签
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
let Qrmodel = masterdb.model('Qrmodel', qrmodel);
function gettags(s){
    let strarr = nodejieba.extract(s,s.length);
    let res = [];
    strarr.forEach(function(item){
        res.push(item.word);
    })
    return res;
}
function getrt(arr){
    let len = arr.length;
    if(len < 1){
        return [];
    }
    let tmplen = Province.GetRandomNum(0,len);
    if(tmplen === 0){
        return [];
    }
    let indexs = [];
    while(1){
        let index = Province.GetRandomNum(0,len-1);
        if(indexs.indexOf(index) === -1){
            indexs.push(index);
        }
        if(indexs.length === tmplen){
            break;
        }
    }
    let res = [];
    indexs.forEach(function(item){
        res.push(arr[item])
    })
    return res;
}
let n = 50;
let tmp = 0;
let test = async()=>{
    let tmparr = [];
    let limit = 10000;
    let asn = async(doc)=>{
        await doc.save();
    }
    let dirarr = fs.readdirSync('./tool');
    let head = 'https://www.5min8.com/uploads/';
    for(let i = 0; i < 20000; i++){
        let llen = Province.GetRandomNum(1,10);
        let mydate1 = new Date();
        mydate1.setHours(mydate1.getHours()-Utils.GetRandomNum(0,2000));
        let mydate2 = new Date();
        mydate2.setHours(mydate2.getHours()-Utils.GetRandomNum(0,2000));
        let mydate3 = new Date();
        mydate3.setHours(mydate3.getHours()-Utils.GetRandomNum(0,2000));
        let mydate4 = new Date();
        mydate4.setDate(mydate4.getDate()-Utils.GetRandomNum(0,10000));
        let groupname = Province.getRandomGN();
        let abstract = Province.getRandomAB();
        let tags = gettags(groupname+abstract);
        let grouptag = getrt(tags);
        console.log(i);
        let tmpobj = {
            type:Utils.GetRandomNum(1,3),
            source:3,
            industry:Province.getRandomIndustry(),
            location:Province.getRandPosition(),
            groupname:groupname,
            abstract:abstract,
            grouptag:grouptag,
            tags:tags,
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
        let tmpdoc = new Qrmodel(cur);
        return tmpdoc.save();
    },10000).then(function(){
        tmp++;
        if(tmp < n){
            test();
        }
    }).catch(function(err){
        tmp++;
        if(tmp < n){
            test();
        }
    })
    console.log('done',tmp);
}
test();

/*Model.Qrmodel.aggregate([{$match:{delete:false}}]).sort('-createTime').skip(2).limit(2).exec(function(err,data){
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
})*/