/**
 * Created by Administrator on 2018/4/18.
 */
let cache = new Map();

function newuser(_id, user){
    cache.set(_id,user);
}
function getuser(_id){
    return cache.get(_id);
}

exports = {
    newuser:newuser,
    getuser:getuser
};
Object.assign(module.exports, exports);