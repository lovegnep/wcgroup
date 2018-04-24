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
    EInvalidQR:10004,//上传的二维码非法
};

const ImgType = {
    EAvatar:1,//群头像
    EGQR:2,//群二维码
    EUploaderQR:3,//上传者二维码
};

exports = {
    EMessageStatus:EMessageStatus,
    EMessageType:EMessageType,
    EErrorType:EErrorType,
    ImgType:ImgType,
};
Object.assign(module.exports, exports);