const Qrdecode = require('./utils/qrdecode');
const Fs = require('fs');
const Path = require('path');

let exec = require(  'child_process').exec;
let garr = Fs.readdirSync('./images/group');
let parr = Fs.readdirSync('./images/person');
let oarr = Fs.readdirSync('./images/public');

process.on(  'uncaughtException'  , function (  err)   {
    console.log(  'uncaughtException:',err);
})

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
    let out = '';
    let outerr = '';
    for(let i = 0; i < garr.length; i++){
        let res = '';
        try{
            console.log(garr[i]);
            res = await Qrdecode.decode(garr[i]);
        }catch(err){
            console.log(err,garr[i]);
        }
        count++;
        if(!res||res.length < 2){
            fail++;
            outerr+=garr[i]+'\n'
        }else{
            out+=res+'\n';
            success++;
        }

    }
    console.log('garr count:%d, success:%d, fail:%d',count, success, fail);
    Fs.writeFileSync(file, out);
    Fs.writeFileSync('group_error.txt', outerr);
}
let f2 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'person.txt';
    let out = '';
    let outerr = '';
    for(let i = 0; i < parr.length; i++){
        let res = '';
        try{
            console.log(parr[i]);
            res = await Qrdecode.decode(parr[i]);
        }catch(err){
            console.log(err,parr[i]);
        }
        count++;
        if(!res||res.length < 2){
            fail++;
            outerr+=parr[i]+'\n'
        }else{
            out+=res+'\n';
            success++;
        }
    }
    console.log('parr count:%d, success:%d, fail:%d',count, success, fail);
    Fs.writeFileSync(file, out);
    Fs.writeFileSync('person_error.txt', outerr);
}
let f3 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'public.txt';
    let out = '';
    let outerr = '';
    for(let i = 0; i < oarr.length; i++){
        let res = '';
        try{
            console.log(oarr[i]);
            res = await Qrdecode.decode(oarr[i]);
        }catch(err){
            console.log(err,oarr[i]);
        }
        count++;
        if(!res||res.length < 2){
            fail++;
            outerr+=oarr[i]+'\n'
        }else{
            out+=res+'\n';
            success++;
        }
    }
    console.log('oarr count:%d, success:%d, fail:%d',count, success, fail);
    Fs.writeFileSync(file, out);
    Fs.writeFileSync('public_error.txt', outerr);
}
f1();
f2();
f3();