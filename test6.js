const Qrdecode = require('./utils/qrdecode');
const Fs = require('fs');
const Path = require('path');

let exec = require(  'child_process').exec;
let garr = Fs.readdirSync('./images/group');
let parr = Fs.readdirSync('./images/person');
let oarr = Fs.readdirSync('./images/public');

process.on(  'uncaughtException'  , function (  err)   {
    console.log(  '  uncaughtException');
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
    for(let i = 0; i < garr.length; i++){
        let cmdstr = 'zbarimg '+garr[i];
        exec(cmdstr,function(  err,stdout,stderr){
            count++;
            if(!err){
                success++;
                out+=stdout+'\n';
            }else{
                fail++;
            }
            if(count === garr.length){
                console.log('garr count:%d, success:%d, fail:%d',count, success, fail);
                Fs.writeFileSync(file, out);
            }
        })
    }

}
let f2 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'person.txt';
    let out = '';
    for(let i = 0; i < parr.length; i++){
        let cmdstr = 'zbarimg '+parr[i];
        exec(cmdstr,function(  err,stdout,stderr){
            count++;
            if(!err){
                success++;
                out+=stdout+'\n';
            }else{
                fail++;
            }
            if(count === parr.length){
                console.log('parr count:%d, success:%d, fail:%d',count, success, fail);
                Fs.writeFileSync(file, out);
            }
        })
    }

}
let f3 = async()=>{
    let count = 0, success=0, fail=0;
    let file = 'public.txt';
    let out = '';
    for(let i = 0; i < oarr.length; i++){
        let cmdstr = 'zbarimg '+oarr[i];
        exec(cmdstr,function(  err,stdout,stderr){
            count++;
            if(!err){
                success++;
                out+=stdout+'\n';
            }else{
                fail++;
            }
            if(count === oarr.length){
                console.log('oarr count:%d, success:%d, fail:%d',count, success, fail);
                Fs.writeFileSync(file, out);
            }
        })
    }

}
f1();
f2();
f3();