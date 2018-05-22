const Qrdecode = require('./utils/qrdecode');
const Fs = require('fs');
const Path = require('path');

let garr = Fs.readdirSync('./images/group');
let parr = Fs.readdirSync('./images/person');
let oarr = Fs.readdirSync('./images/public');

for(let i = 0; i < garr.length; i++){
    garr[i] = Path.join('/home/wcgroup/images/group', garr[i]);
}
for(let i = 0; i < parr.length; i++){
    parr[i] = Path.join('/home/wcgroup/images/person', parr[i]);
}
for(let i = 0; i < oarr.length; i++){
    oarr[i] = Path.join('/home/wcgroup/images/public', oarr[i]);
}
let f1 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'group.txt';
    for(let i = 0; i < garr.length; i++){
        let res = await Qrdecode.decode(garr[i]);
        count++;
        if(res){
            success++;
            Fs.write(file, res);
        }else{
            fail++;
        }
    }
    console.log('count:%d, success:%d, fail:%d',count, success, fail);
}
let f2 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'person.txt';
    for(let i = 0; i < parr.length; i++){
        let res = await Qrdecode.decode(parr[i]);
        count++;
        if(res){
            success++;
            Fs.write(file, res);
        }else{
            fail++;
        }
    }
    console.log('count:%d, success:%d, fail:%d',count, success, fail);
}
let f3 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'public.txt';
    for(let i = 0; i < oarr.length; i++){
        let res = await Qrdecode.decode(oarr[i]);
        count++;
        if(res){
            success++;
            Fs.write(file, res);
        }else{
            fail++;
        }
    }
    console.log('count:%d, success:%d, fail:%d',count, success, fail);
}
f1();
f2();
f3();