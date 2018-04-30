/**
 * Created by Administrator on 2018/4/12.
 */
const mongoose = require('mongoose');
const Logger = require('../utils/logger');
const Config = require('../config');
const ObjectId  = mongoose.Schema.ObjectId;

mongoose.connect(Config.db, function(err){
    if(err){
        Logger.error('mongoose connect failed.');
        process.exit(1);//进程退出
    }else{
        Logger.info('mongoose connect success.');
    }
});

//用户表
let usermodal = new mongoose.Schema({
    account: String, //帐号
    passwd: String, //密码
    register_time:{type: Date, default: Date.now},
    register_ip: String,
    last_login_time: {type: Date, default: Date.now},
    last_login_ip: String,
    mobile: '',
    weixin_openid: String,//微信号唯一标识符
    avatar: String,//头像
    gender: {type:Number, default:0}, // 性别 0：未知、1：男、2：女
    nickname: String,//昵称
    birthday:String,//生日
    sign:String,//签名
    weixinid:String,//微信号
    location:String,//位置
    collections:[ObjectId],//收藏，指向qrmodel
    views:[ObjectId],//浏览，指向qrmodel
    vipid:{type:ObjectId, ref: 'VipModel'},
    son:[{type:ObjectId, ref: 'UserModel'}],//发展的下线
    father:{type:ObjectId, ref: 'UserModel'},//上线
    weibi:{type:Number, default:100},//微币数量
    lastsigntime:Date,//上次签到时间
    shareIndex:String,//如果用户第一次进来是通过分享进来的则有此字段，
});

let UserModel = mongoose.model('UserModel', usermodal);

let vipmodel = mongoose.Schema({
    userid:{type:ObjectId, ref: 'UserModel'},
    rmb:Number,//待提现
    vipstart:Date,//会员开始时间，如果不是，不存在此字段
    monthstart:Date,//包月开始时间，如果不是，不存在此字段
    groupqr:Number,//
    personqr:Number,//
    publicqr:Number,
    lastReward:Date//上次领取会员专属的每天50个微币的时间
});
let VipModel = mongoose.model('VipModel',vipmodel);

//群二维码表,个人微信，公众号
let qrmodel = new mongoose.Schema({
    uploader:ObjectId,//上传者ID
    type:Number,//类型，1群，2个人，3公众号
    source:Number,//来源：1用户上传，2爬虫
    industry:String,
    location:String,
    groupname:String,
    abstract:String,
    grouptag:String,//标签
    masterwx:String,//,上传者微信，个人微信，公众号ID
    groupavatar:String,//微信群头像，个人头像，公众号头像
    groupQR:String,//微信群二维码，个人二维码，公众号二维码
    masterQR:String,//上传者二维码
    createTime:{type: Date, default: Date.now},
    updateTime:{type: Date, default: Date.now},
    viewCount:{type:Number, default:0},
    likeCount:{type:Number, default:0},
    gender:Number,//1男，2女，3保密， 当类型为个人时才会有
    birthday:String,// 生日， 当类型为个人时才会有
    downs:[ObjectId],//点赞的用户，里面存储用户
    ups:[ObjectId],//踩的用户，里面存储用户
});
let Qrmodel = mongoose.model('Qrmodel', qrmodel);

//评论表
let comment = new mongoose.Schema({
    userid:{type:ObjectId, ref: 'UserModel'},
    qrid:ObjectId,
    targetid:ObjectId,
    content:String,
    imgs:[String],
    downs:[ObjectId],
    ups:[ObjectId],
    delete:{type: Boolean, default: false},
    createTime:{type: Date, default: Date.now},
    updateTime:{type: Date, default: Date.now},
});
let Comment = mongoose.model('Comment', comment);

//消息表
let message = new mongoose.Schema({
    sourceid:{type:ObjectId, ref: 'UserModel'},
    targetid:{type:ObjectId, ref: 'UserModel'},
    content:String,
    createTime:{type: Date, default: Date.now},
    type:{type:Number,default:1},
    status:{type:Number,default:1},
    delete:{type:Boolean, default:false}
});
let Message = mongoose.model('Message', message);

let shareModel = mongoose.Schema({
    index:String,//由前端生成的本次分享唯一标识符
    type:Number,//1分享到个人，2分享到群
    userid:{type:ObjectId, ref: 'UserModel'},
    createTime:{type: Date, default: Date.now},
    targetid:String,//用户分享到的群或个人对当前小程序的唯一openid
    targetname:String,//用户分享到的群名
    path:String,//用户分享的页面路径
    son:[{type:ObjectId,ref:'UserModel'}]//通过此次分享进来的人
});
let Share = mongoose.model('Share',shareModel);

let record = mongoose.Schema({
    userid:{type:ObjectId,ref:'UserModel'},
    record:String,
    createTime:{type: Date, default: Date.now},
});
let Record = mongoose.model('Record',record);

let recordRank = mongoose.Schema({
    record:String,
    num:Number
});
let RecordRank = mongoose.model('RecordRank',recordRank);

exports = {
    UserModel: UserModel,
    VipModel:VipModel,
    Qrmodel:Qrmodel,
    Record:Record,
    Comment:Comment,
    RecordRank:RecordRank,
    Message:Message,
    Share:Share,
};
Object.assign(module.exports, exports);
