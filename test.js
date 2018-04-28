const Model = require('./models/model');
const Utils = require('./utils/common');
let today0 = (Utils.getDay00()).getTime();
let query = {
    _id:"5ae2f502c1603d5f6b5504f2",
    $or:[
        {lastsigntime:{$exists:false}},
        {lastsigntime:{$lt:today0}}
    ]
    //lastsigntime:{$exists:true}
};
let upstr = {
    lastsigntime:Date.now()
}
console.log((Utils.getDay00()).getTime());
let ff = function(){
    Model.UserModel.update(query,upstr,null,function(err,data){
        let hehe = 0;
        data={ok: 1,
            nModified: 1,
            n: 1}
    });
}
setTimeout(ff,2000);


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

