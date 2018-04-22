const EMessageStatus = {
    ENoRead:1,//未读
    ERead:2//已读
};

const EMessageType = {
    ENormal:1,//普通
    ESystem:2,//系统
    EGlobal:3,//全局
};

exports = {
    EMessageStatus:EMessageStatus,
    EMessageType:EMessageType
};
Object.assign(module.exports, exports);