const Logger = require("./utils/logger");
const uuid = require('node-uuid');
const fs = require('fs');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./middleware/controller');

const compress = require('koa-compress');
const rest = require('./middleware/rest');
const app = new Koa();
const session = require("koa-session2");
const Config = require('./config');
const Cors = require('koa-cors');
const  serve = require("koa-static");
const https = require('https');

let testappid = require('./utils/common').testappid;
const params = process.argv.splice(2);
Logger.debug('params input:',params);
if(!params||params.length !== 1){
    Logger.error('param invalid, please input one param as the port.');
    return process.exit(1);
}

console.log(`process.env.NODE_ENV = [${process.env.NODE_ENV}]`);
const isProduction = process.env.NODE_ENV === 'production';
console.log(`isProduction = [${isProduction}]`);
app.use(Cors());
// log request URL:
app.use(async (ctx, next) => {
    console.log = Logger.info.bind(Logger);
    ctx.logger = Logger;
    //Logger.debug('req in: head:',ctx.req.headers);
    Logger.info(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
        
    await next();

    console.log("ctx.response.status=" + ctx.response.status);
    if (ctx.response.status == 404) {
        ctx.rest({status:0,message:'unknow path'});
    }

    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`); 
});

app.use(compress({
    //filter: function (content_type) {
    //    return /text/i.test(content_type)
    //},
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(session({
    key: "SESSIONID", //default "koa:sess"
    maxAge: 30 * 60 * 1000
}));

// bind .rest() for ctx:
app.use(rest.restify());

//如果是产品阶段要校验appid
if(isProduction){
    app.use(testappid);
}


// static file support:
//if (! isProduction) {
    app.use(serve(__dirname + '/public'));
//}

// parse request body:
app.use(bodyParser());

// add controller:
app.use(controller());
app.listen(  params[0]);
console.log('app started at port ', params[0]);
