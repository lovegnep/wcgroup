module.exports = {
    port: 443,
    //db: 'mongodb://39.108.56.116:27017/wcgroup',
    db: 'mongodb://47.98.136.138:20005,47.105.36.1:20005,39.108.56.116:20005/wcgroup',
    dboptions:{
        user : "dddd",
        pass : "ddd",
        auth : {authMechanism: 'SCRAM-SHA-1'},
        replicaSet:'wcgroup',
        readPreference: "secondaryPreferred"
    },
    wechat: {
        secret: 'ae1c94aa25218d0922c8a3624fa34672',
        appid: 'wx6466f7c1effe95dd'
    },
    redis: {
        port: 6379,
        host: '127.0.0.1'
    },
    qr:{
        limit:20
    },
    user_cache:{
        userprefix: 'USER_CACHE_',//前缀
        expire: 10*3600//过期时间10小时
    },
    uploadimg:{
        dir:'/var/www/uploads/'
    }
}

