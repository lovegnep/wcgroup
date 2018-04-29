const Model = require('./models/model');
const Utils = require('./utils/common');

let ff = function(){
    Model.UserModel.find({_id:"5ae2f502c1603d5f6b5504f2"},null,null,function(err,data){

        let aa = data[0].views[0].toString();
        let bb = 0;
    });
}
//setTimeout(ff,2000);
let isShareSameGroup = async(data)=>{
    //userid,openid
    let now0 = Utils.getDate00();
    //Logger.debug('isShareSameGroup:',data,now0);
    let doc = await Model.Share.find({userid:data.userid,targetid:data.openid,createTime:{$gt:now0}});
    if(!doc||doc.length < 1){
        return true;
    }
    return false;
}
isShareSameGroup({userid:'5ae2f502c1603d5f6b5504f2',targetid:'tGKYN65fd4OUA13yodH9WqOPg4zfU',}).then(function(res){
    let aa = res;
}).catch(function(err){
    let b = err;
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

