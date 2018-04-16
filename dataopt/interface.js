const Config = require('../config');
const Logger = require('../utils/logger');
const Model = require('../models/model');

//注册帐号
let newAccount = async (data) => {
    let user = new Model.UserModel({...data});
    let doc = await user.save();
    return doc;
}

//更新登录信息
let updateLoginInfo = async (data) => {

}

//查找帐号
let getAccountByOpenId = async (weixin_openid) => {
    let doc = await Model.UserModel.findOne({weixin_openid}).exec();
    return doc;
}

//查找帐号
let getAccountById = async (_id) => {
    let doc = await Model.UserModel.findById(_d).exec();
    return doc;
}

//
let newQR = async (data) => {
    let qr = new Model.Qrmodel({...data});
    let doc = await qr.save(); 
    return doc;
}

//
let getQRList = async (uploader_id) => {
    let qrlist = await Model.Qrmodel.find({uploader:uploader_id}).exec();
    return qrlist;
}

//修改密码
function modifyPasswd(old, data, cb){
    old.passwd = data.passwd;
    old.save(function(err, doc){
        if(err){
            Logger.error('modifyPasswd: save err.', old, data);
            cb(err, doc);
        }else{
            Logger.debug('modifyPasswd: save success.', old, data);
            cb(null, doc);
        }
    });
}

//新建收藏
function newCollection(data, cb) {
    if (!data || !data.url) {
        return Logger.error('newCollection !data || !data.url');
    }
    let collection = new Model.Collection({
        url: data.url,
        abstract: data.abstract,
        account: data.account
    });
    collection.save(function (err, doc) {
        if (err) {
            Logger.error('newCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('newCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//修改收藏
function modifyCollection(old, data, cb){
    Object.assign(old, data);
    old.save(function(err, doc){
        if (err) {
            Logger.error('modifyCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('modifyCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//删除收藏
function rmCollection(old, cb){
    old.delete = true;
    old.save(function(err, doc){
        if (err) {
            Logger.error('rmCollection: save error.', data);
            cb(err, doc);
        } else {
            Logger.debug('rmCollection: save success.', data);
            cb(null, doc);
        }
    });
}

//查询收藏
function getCollection(query, option, cb){
    Model.Collection.find(query, {}, option, function(err, docs){
        if(err){
            Logger.error('getCollection: error:',err);
            cb(err, docs);
        }else{
            Logger.debug('getCollection: success.');
            cb(null, docs);
        }
    });
}

// 查询某个收藏的信息
function getOneCollection(_id, cb){
    Model.Collection.findById(_id, function(err, doc){
        if(err){
            Logger.error('getOneCollection: error:',err);
            cb(err, doc);
        }else{
            Logger.debug('getOneCollection: success.');
            cb(null, doc);
        }
    });
}


//新建分享
function newShare(data, cb){
    let share = new Model.Share({
        ...data,
    });
    share.save(function(err, doc){
        if(err){
            Logger.error('newShare: save err.', data);
            cb(err, doc);
        }else{
            Logger.debug('newShare: save success.', data);
            cb(null, doc);
        }
    });
}

//查询分享
function getShare(query, option, cb){
    Model.Share.find(query, {}, option, function(err, docs){
        if(err){
            Logger.error('getShare: error:',err);
            cb(err, docs);
        }else{
            Logger.debug('getShare: success.');
            cb(null, docs);
        }
    });
}

//新建完全树状图
function newRoot(account, cb){
    let tree = new Model.Tree({account});
    tree.save(function(err, doc){
        if(err || !doc){
            Logger.error('newRoot:err:',err);
            return cb(err, null);
        }
        cb(null, doc);
    });
}

//查询完全树状图
function getRoot(account, cb){
    Model.Tree.findOne({account}, function(err, doc){
        if(err || !doc){
            Logger.error('getRoot:err:',err);
            return cb(err, null);
        }
        cb(null, doc);
    });
}

//递归查找根节点中的某个节点
function findRoot(_id, children){
    if(!children || children.length < 1){
        return null;
    }
    for(let i = 0; i < children.length; i++){
        if(children[i]._id === _id){
            return children[i];
        }else{
            let tmp = findRoot(_id,children[i].children);
            if(tmp){
                return tmp;
            }
        }
    }
    return null;
}

//新建分类
function newItem(data, cb){
    getRoot(data.account, function(err, doc){
        if(err || !doc){
            return cb('查询根结点出错',null);
        }
        _newItem(data, doc, function(err, item1, item2){
            //item1新建的节点，item2前者的父节点
            if(err){
                return cb(err,null);
            }
            if(!item2){
            }else{//修改根节点
                let tmp = findRoot(item2._id, doc.children);
                if(tmp){
                    tmp.children.push({name:item1.name,_id:item1._id,children:item1.children});
                }
            }
            cb(null, item1);
        });
    });
}
function _newItem(data, root, cb){
    if(data.parent){
        getItem(data.parent, function(err, doc){
            if(err || !doc){
                cb('not exist', null);
            }else{
                let item = new Model.Item({name:data.name, parent:data.parent});
                item.save(function(err, res){
                    if(err || !res){
                        Logger.error('newItem error:',err);
                        return cb(1,null);
                    }
                    doc.children.push(res._id);
                    doc.save();
                    return cb(null, item, doc);
                });
            }
        });
    }else{
        let item = new Model.Item({name:data.name});
        item.save(function(err, res){
            if(err || !res){
                Logger.error('newItem error:',err);
                return cb(2,null);
            }
            cb(null, item);
            root.children.push({name:data.name,_id:item._id});
            root.save();
        });
    }
}

//查询分类
function getItem(_id, cb){
    Model.Item.findById(_id, function(err, doc){
        if(err){
            Logger.error('getItem: error:',err);
            cb(err, doc);
        }else{
            Logger.debug('getItem: success.');
            cb(null, doc);
        }
    });
}

//移动分类
function moveItem(account, _id, target_id, cb){
    getRoot(account, function(err, doc){
        if(err || !doc){
            return cb('查询根结点出错',null);
        }
        _moveItem(_id, target_id, doc, function(err, item, oldparent, newparent) {//更新根结点
            if(err){
                return cb(err, null);
            }
            if(oldparent){
                let oldtmp = findRoot(oldparent._id, doc);
                if(oldtmp){
                    if(!oldparent.children || oldparent.children.length < 1){
                        Logger.error('moveItem: root may invalid.', item, oldparent);
                    }else{
                        for(let i = 0; i < oldparent.children.length; i++){
                            if(oldparent.children[i]._id === item._id){
                                oldparent.children.split(i,1);
                                break;
                            }
                        }
                    }
                }else{
                    Logger.error('moveItem: oldparent not exist in Root',doc,oldparent);
                }
            }
            if(newparent){
                let newtmp = findRoot(newparent._id,doc);
                if(newtmp){
                    newtmp.children.push({name:item.name,_id:item._id,children:item.children});
                }else{
                    Logger.error('moveItem: newparent not exist in Root',doc,newparent);
                }

            }
            cb(null, item);
        });

    });
}
function _moveItem(_id, target_id, root, cb){
    let coll = [_id];
    if(target_id){
        coll.push(target_id);
    }
    Async.map(coll, function(callback){
        getItem(_id, function(err, doc){
            if(err){
                callback(err, null);
            }else if(!doc){
                callback("分类不存在", null);
            }else{
                callback(null, doc);
            }
        })
    }, function(err, results){
        if(err){
            Logger.error('moveItem:err:',err);
            cb(err, null);
        }else{
            let item = results[0];
            let target = null;
            if(target_id){
                target = results[1];
            }
            if(!item){
                Logger.error('moveItem: cur item not exist.,', _id, target_id);
                return cb('cur item not exist.', null);
            }
            if(item.parent){
                getItem(item.parent, function(err, doc){
                    if(err){
                        Logger.error('moveItem:unknown err:', err);
                        return cb(err, null);
                    }else if(!doc){
                        Logger.error("moveItem:the parent must do the rm job.", _id,item.parent);
                        if(target_id){
                            target = results[1];
                            if(!target){
                                Logger.error('moveItem:target item not exist:', _id, target_id);
                                return cb("target not exist", null);
                            }
                            item.parent = target_id;
                            target.children.push(_id);
                            target.save();
                        }else{
                            item.parent = undefined;
                            root.children.push({name:item.name,_id:item._id,children:item.children});
                            root.save();
                        }
                        item.save();
                    }else{
                        if(target_id){
                            target = results[1];
                            if(!target){
                                Logger.error('moveItem:target item not exist:', _id, target_id);
                                return cb("target not exist", null);
                            }
                            item.parent = target_id;
                            target.children.push(_id);
                            target.save();
                        }else{
                            item.parent = undefined;
                            root.children.push({name:item.name,_id:item._id,children:item.children});
                            root.save();
                        }
                        item.save();
                        let index = doc.children.indexOf(_id);
                        if(index > -1){
                            doc.children.split(index,1);
                            doc.save();
                        }
                    }
                    return cb(null, item, doc, target);
                });
            }else{
                if(target_id){
                    target = results[1];
                    if(!target){
                        Logger.error('moveItem:target item not exist:', _id, target_id);
                        return cb("target not exist", null);
                    }
                    target.children.push(_id);
                    target.save();
                    item.parent = target_id;
                }else{
                    item.parent = undefined;
                    root.children.push({name:item.name,_id:item._id,children:item.children});
                    root.save();
                }
                item.save();
                cb(null, item, null, target);
            }
        }
    });
}

//插入收藏到分类中
function insert2Item(account, c_id, i_id, cb){
    if(!i_id){
        getRoot(account, function(err, doc){
            if(err){
                Logger.error('insert2Item: find root failed.', err);
                return cb(err, null);
            }
            _insert2Item(c_id, i_id, root, cb);
        });
    }else{
        _insert2Item(c_id, i_id, null, cb);
    }
}
function _insert2Item(c_id, i_id, root, cb){
    Async.parallel([
        function (callback) {
            getOneCollection(c_id, function (err, doc) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, doc);
                }
            })
        },
        function (callback) {
            getItem(i_id, function (err, doc) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, doc);
                }
            })
        }
    ], function (err, res) {
        if (err) {
            Logger.error("insert2Item:", c_id, i_id, err);
            cb(1, null);
        } else {
            let collection = res[0];
            let item = res[1];
            if (!collection) {
                return cb("无法找到该收藏", null);
            }
            if (!item) {
                return cb("分类不存在", null);
            }
            if (collection.type) {//已经有分类
                getItem(collection.type, function (err, doc) {
                    if (err || !doc) {
                        Logger.error('insert2Item:查询%s对应的分类出错。', JSON.stringify(collection), JSON.stringify(doc));
                    }
                    if (doc) {
                        let index = doc.collections.indexOf(collection._id);
                        if (index > -1) {
                            doc.collections.split(index, 1);
                            doc.save();
                        }
                        else {
                            Logger.error('insert2Item: error index')
                        }
                    }
                    if(root){
                        collection.type = undefined;
                        collection.save();
                        root.collections.push(collection._id);
                        root.save();
                        cb(null, collection);
                    }else{
                        collection.type = item._id;
                        collection.save();
                        item.collections.push(collection._id);
                        item.save();
                        Logger.debug("insert2Item success:", collection, item, doc);
                        cb(null, collection);
                    }
                });
            } else {
                if(root){
                    collection.type = undefined;
                    collection.save();
                    root.collections.push(collection._id);
                    root.save();
                    cb(null, collection);
                }else{
                    collection.type = item._id;
                    collection.save();
                    item.collections.push(collection._id);
                    item.save();
                    Logger.debug("insert2Item success:", collection, item, doc);
                    cb(null, collection);
                }
            }
        }
    });
}

exports = {
    getAccountByOpenId:getAccountByOpenId,
    getAccountById:getAccountById,
    modifyPasswd: modifyPasswd,

    modifyCollection: modifyCollection,
    newCollection: newCollection,
    rmCollection: rmCollection,

    newShare: newShare,
    getShare: getShare,

    getRoot:getRoot,
    newRoot:newRoot,
    getItem: getItem,
    newItem: newItem,
    moveItem:moveItem,
    insert2Item: insert2Item,

    newQR:newQR,
    getQRList:getQRList,
};
Object.assign(module.exports, exports);
