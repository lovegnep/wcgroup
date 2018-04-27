const mongoose = require('mongoose');
const Logger = require('./utils/logger');
const Config = require('./config');
const ObjectId  = mongoose.Schema.ObjectId;

mongoose.connect(Config.db, function(err){
    if(err){
        Logger.error('mongoose connect failed.');
        process.exit(1);//进程退出
    }else{
        Logger.info('mongoose connect success.');
    }
});
let uds = mongoose.Schema({
    uid: String,
    update_time: Date,
    coords: {
        type: [Number],
        index: '2dsphere'
    }
});
let Uds = mongoose.model('Uds',uds);
let doc = new Uds({uid:'hehe'});
doc.save(function(data){
    let a= 0;
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

