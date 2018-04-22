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
    weixin_openid: String,
    avatar: String,
    gender: {type:Number, default:0}, // 性别 0：未知、1：男、2：女
    nickname: String,//昵称
    collections:[ObjectId]
});

let UserModel = mongoose.model('UserModel', usermodal);

//群二维码表
let qrmodel = new mongoose.Schema({
    uploader:ObjectId,
    industry:String,
    location:String,
    groupname:String,
    abstract:String,
    grouptag:String,
    masterwx:String,
    groupavatar:String,
    groupQR:String,
    masterQR:String,
    createTime:{type: Date, default: Date.now},
    updateTime:{type: Date, default: Date.now},
    viewCount:{type:Number, default:0},
    likeCount:{type:Number, default:0},
    downs:[ObjectId],
    ups:[ObjectId],
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
/*
//完全树状结构图
let tree = new mongoose.Schema({
    name:{type:String, default:'root'},
    account:String,
    children:Array,//{_id,name,children}
    collections:Array,
});
let Tree = mongoose.model('Tree', tree);

//单条分类
let item = new mongoose.Schema({
    name:String,
    createTime:{type:Date, default:Date.now},
    collections:Array,//每个收藏表的ID
    parent:ObjectId,//父节点的ID
    children:Array,//孩子节点
});
let Item = mongoose.model('Item', item);

//收藏表
let collection = new mongoose.Schema({
    url: String, //网址
    abstract: String, //简介
    createTime: { type: Date, default: Date.now }, //创建时间
    account: String, //创建者
    type:ObjectId,//分类
    share: { type:Boolean, default: false}, //是否分享
    delete: { type:Boolean, default: false}, //是否已经删除
});
let Collection = mongoose.model('Collection', collection);

//分享表
let share = new mongoose.Schema({
    collectionId: ObjectId, //针对哪个收藏进行的分享
    createTime: { type: Date, default: Date.now }, //创建时间
    introduction: String, //分享内容
    account: String, //创建者
    viewCount: { type: Number, default: 0 }, //浏览数量
    commentCount: { type: Number, default: 0 }, //评论数量
});
let Share = mongoose.model('Share', share);

//评论表
let comment = new mongoose.Schema({
    shareId: ObjectId, //针对哪个分享进行的评论
    createTime: { type: Date, default: Date.now }, //创建时间
    content: String, //内容
    account: String, //创建者
});
let Comment = mongoose.model('Comment', comment);
*/
exports = {
    UserModel: UserModel,
    Qrmodel:Qrmodel,

    Comment:Comment,

    Message:Message
};
Object.assign(module.exports, exports);
