const EMessageStatus = {
    ENoRead:1,//未读
    ERead:2//已读
};

const EMessageType = {
    ENormal:1,//普通
    ESystem:2,//系统
    EGlobal:3,//全局
};

const EErrorType = {
    EOK:10000,//正常
    ENotLogin:10001,//未登陆
    EInterError:10002,//服务器内部错误
    ENoHandle:10003,//没有对应的请求处理函数
    EInvalidReq:10004,//非法请求，不是从appid过来的请求都是非法请求
    EInvalidQR:11000,//上传的二维码非法
    ENoWeibi:11001,//微币不够
    EHasSign:11002,//已经签到
    ENoSessionKey:11003,//sessionkey不存在
    ENoEncryptedData:11004,//sessionkey不存在
    ENoIV:11005,//sessionkey不存在
    EDecodeFail:11006,//解密用户数据失败
    EHasShareTo:11007,//当天已经分享到该群组,
    EShareIndexInvalid:11008,//shareindex不合法
    ENoShare:11009,//找不到该share

    EInvalidTab:11010,//查询tab非法
    EInvalidContent:11011,//查询内容非法
};

const ImgType = {
    EAvatar:1,//群头像
    EGQR:2,//群二维码
    EUploaderQR:3,//上传者二维码
};

const QRType = {
    EGroup:1,
    EPerson:2,
    EPublic:3
}

const QRSource = {
    EUpload:1,
    EPython:2
}

const WeiBiSource = {
    EShare2Group:1,//每天第一次分享到该群
    EView:2,//看二维码
    ESign:3,//签到
    EVip:4,//会员每天领奖
    EInit:5//新用户初始
}

exports = {
    EMessageStatus:EMessageStatus,
    EMessageType:EMessageType,
    EErrorType:EErrorType,
    ImgType:ImgType,
    QRType:QRType,
    QRSource:QRSource,
    WeiBiSource:WeiBiSource,
};
Object.assign(module.exports, exports);