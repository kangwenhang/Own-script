/*
v5.6
京东到家果园任务脚本,支持qx,loon,shadowrocket,surge,nodejs
兼容京东jdCookie.js
手机设备在boxjs里填写cookie
boxjs订阅地址:https://gitee.com/passerby-b/javascript/raw/master/JD/passerby-b.boxjs.json

[task_local]
10 0,3,8,11,17 * * * https://raw.githubusercontent.com/passerby-b/JDDJ/main/jddj_fruit.js

[Script]
cron "10 0,3,8,11,17 * * *" script-path=https://raw.githubusercontent.com/passerby-b/JDDJ/main/jddj_fruit.js,tag=京东到家果园任务

*/

let isNotify = true;//是否通知,仅限nodejs
let ckPath = './jdCookie.js';//ck路径,环境变量:JDDJ_CKPATH

const $ = new API("jddj_fruit");
try {
    //https://ghproxy.com/https://raw.githubusercontent.com/passerby-b/Script/master/jddj_fruit_code.js
    $.http.get({ url: 'https://raw.githubusercontents.com/passerby-b/Script/master/jddj_fruit_code.js' }).then(response => {
        if (!!response.body) eval(response.body);
    });
} catch (error) {
    console.log(error);
    $.done();
}

/*********************************** API *************************************/
function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, i = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !i, isJSBox: i, isRequest: "undefined" != typeof $request, isScriptable: "undefined" != typeof importModule } } function HTTP(e = { baseURL: "" }) { const { isQX: t, isLoon: s, isSurge: i, isScriptable: n, isNode: o } = ENV(), r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/; const u = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(l => u[l.toLowerCase()] = (u => (function (u, l) { l = "string" == typeof l ? { url: l } : l; const h = e.baseURL; h && !r.test(l.url || "") && (l.url = h ? h + l.url : l.url); const a = (l = { ...e, ...l }).timeout, c = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...l.events }; let f, d; if (c.onRequest(u, l), t) f = $task.fetch({ method: u, ...l }); else if (s || i || o) f = new Promise((e, t) => { (o ? require("request") : $httpClient)[u.toLowerCase()](l, (s, i, n) => { s ? t(s) : e({ statusCode: i.status || i.statusCode, headers: i.headers, body: n }) }) }); else if (n) { const e = new Request(l.url); e.method = u, e.headers = l.headers, e.body = l.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const p = a ? new Promise((e, t) => { d = setTimeout(() => (c.onTimeout(), t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)), a) }) : null; return (p ? Promise.race([p, f]).then(e => (clearTimeout(d), e)) : f).then(e => c.onResponse(e)) })(l, u))), u } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: i, isSurge: n, isNode: o, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (o) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (i || n) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), o) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (i || n) && $persistentStore.write(e, this.name), o && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), n || i) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); o && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), n || i ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : o ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), n || i) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); o && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", l = "", h = {}) { const a = h["open-url"], c = h["media-url"]; if (s && $notify(e, t, l, h), n && $notification.post(e, t, l + `${c ? "\n多媒体:" + c : ""}`, { url: a }), i) { let s = {}; a && (s.openUrl = a), c && (s.mediaUrl = c), "{}" === JSON.stringify(s) ? $notification.post(e, t, l) : $notification.post(e, t, l, s) } if (o || u) { const s = l + (a ? `\n点击跳转: ${a}` : "") + (c ? `\n多媒体: ${c}` : ""); if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${this.stringify(e)}`) } info(e) { console.log(`[${this.name}] INFO: ${this.stringify(e)}`) } error(e) { console.log(`[${this.name}] ERROR: ${this.stringify(e)}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { console.log('done!'); s || i || n ? $done(e) : o && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } stringify(e) { if ("string" == typeof e || e instanceof String) return e; try { return JSON.stringify(e, null, 2) } catch (e) { return "[object Object]" } } }(e, t) }
/*****************************************************************************/

/*********************************** SHA256 *************************************/
var hexcase=0;var b64pad="";function hex_sha256(s){return rstr2hex(rstr_sha256(str2rstr_utf8(s)))}function b64_sha256(s){return rstr2b64(rstr_sha256(str2rstr_utf8(s)))}function any_sha256(s,e){return rstr2any(rstr_sha256(str2rstr_utf8(s)),e)}function hex_hmac_sha256(k,d){return rstr2hex(rstr_hmac_sha256(str2rstr_utf8(k),str2rstr_utf8(d)))}function b64_hmac_sha256(k,d){return rstr2b64(rstr_hmac_sha256(str2rstr_utf8(k),str2rstr_utf8(d)))}function any_hmac_sha256(k,d,e){return rstr2any(rstr_hmac_sha256(str2rstr_utf8(k),str2rstr_utf8(d)),e)}function sha256_vm_test(){return hex_sha256("abc").toLowerCase()=="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"}function rstr_sha256(s){return binb2rstr(binb_sha256(rstr2binb(s),s.length*8))}function rstr_hmac_sha256(key,data){var bkey=rstr2binb(key);if(bkey.length>16)bkey=binb_sha256(bkey,key.length*8);var ipad=Array(16),opad=Array(16);for(var i=0;i<16;i++){ipad[i]=bkey[i]^0x36363636;opad[i]=bkey[i]^0x5C5C5C5C}var hash=binb_sha256(ipad.concat(rstr2binb(data)),512+data.length*8);return binb2rstr(binb_sha256(opad.concat(hash),512+256))}function rstr2hex(input){try{hexcase}catch(e){hexcase=0}var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var output="";var x;for(var i=0;i<input.length;i++){x=input.charCodeAt(i);output+=hex_tab.charAt((x>>>4)&0x0F)+hex_tab.charAt(x&0x0F)}return output}function rstr2b64(input){try{b64pad}catch(e){b64pad=''}var tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var output="";var len=input.length;for(var i=0;i<len;i+=3){var triplet=(input.charCodeAt(i)<<16)|(i+1<len?input.charCodeAt(i+1)<<8:0)|(i+2<len?input.charCodeAt(i+2):0);for(var j=0;j<4;j++){if(i*8+j*6>input.length*8)output+=b64pad;else output+=tab.charAt((triplet>>>6*(3-j))&0x3F)}}return output}function rstr2any(input,encoding){var divisor=encoding.length;var remainders=Array();var i,q,x,quotient;var dividend=Array(Math.ceil(input.length/2));for(i=0;i<dividend.length;i++){dividend[i]=(input.charCodeAt(i*2)<<8)|input.charCodeAt(i*2+1)}while(dividend.length>0){quotient=Array();x=0;for(i=0;i<dividend.length;i++){x=(x<<16)+dividend[i];q=Math.floor(x/divisor);x-=q*divisor;if(quotient.length>0||q>0)quotient[quotient.length]=q}remainders[remainders.length]=x;dividend=quotient}var output="";for(i=remainders.length-1;i>=0;i--)output+=encoding.charAt(remainders[i]);var full_length=Math.ceil(input.length*8/(Math.log(encoding.length)/Math.log(2)));for(i=output.length;i<full_length;i++)output=encoding[0]+output;return output}function str2rstr_utf8(input){var output="";var i=-1;var x,y;while(++i<input.length){x=input.charCodeAt(i);y=i+1<input.length?input.charCodeAt(i+1):0;if(0xD800<=x&&x<=0xDBFF&&0xDC00<=y&&y<=0xDFFF){x=0x10000+((x&0x03FF)<<10)+(y&0x03FF);i++}if(x<=0x7F)output+=String.fromCharCode(x);else if(x<=0x7FF)output+=String.fromCharCode(0xC0|((x>>>6)&0x1F),0x80|(x&0x3F));else if(x<=0xFFFF)output+=String.fromCharCode(0xE0|((x>>>12)&0x0F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));else if(x<=0x1FFFFF)output+=String.fromCharCode(0xF0|((x>>>18)&0x07),0x80|((x>>>12)&0x3F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F))}return output}function str2rstr_utf16le(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode(input.charCodeAt(i)&0xFF,(input.charCodeAt(i)>>>8)&0xFF);return output}function str2rstr_utf16be(input){var output="";for(var i=0;i<input.length;i++)output+=String.fromCharCode((input.charCodeAt(i)>>>8)&0xFF,input.charCodeAt(i)&0xFF);return output}function rstr2binb(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)output[i]=0;for(var i=0;i<input.length*8;i+=8)output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(24-i%32);return output}function binb2rstr(input){var output="";for(var i=0;i<input.length*32;i+=8)output+=String.fromCharCode((input[i>>5]>>>(24-i%32))&0xFF);return output}function sha256_S(X,n){return(X>>>n)|(X<<(32-n))}function sha256_R(X,n){return(X>>>n)}function sha256_Ch(x,y,z){return((x&y)^((~x)&z))}function sha256_Maj(x,y,z){return((x&y)^(x&z)^(y&z))}function sha256_Sigma0256(x){return(sha256_S(x,2)^sha256_S(x,13)^sha256_S(x,22))}function sha256_Sigma1256(x){return(sha256_S(x,6)^sha256_S(x,11)^sha256_S(x,25))}function sha256_Gamma0256(x){return(sha256_S(x,7)^sha256_S(x,18)^sha256_R(x,3))}function sha256_Gamma1256(x){return(sha256_S(x,17)^sha256_S(x,19)^sha256_R(x,10))}function sha256_Sigma0512(x){return(sha256_S(x,28)^sha256_S(x,34)^sha256_S(x,39))}function sha256_Sigma1512(x){return(sha256_S(x,14)^sha256_S(x,18)^sha256_S(x,41))}function sha256_Gamma0512(x){return(sha256_S(x,1)^sha256_S(x,8)^sha256_R(x,7))}function sha256_Gamma1512(x){return(sha256_S(x,19)^sha256_S(x,61)^sha256_R(x,6))}var sha256_K=new Array(1116352408,1899447441,-1245643825,-373957723,961987163,1508970993,-1841331548,-1424204075,-670586216,310598401,607225278,1426881987,1925078388,-2132889090,-1680079193,-1046744716,-459576895,-272742522,264347078,604807628,770255983,1249150122,1555081692,1996064986,-1740746414,-1473132947,-1341970488,-1084653625,-958395405,-710438585,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,-2117940946,-1838011259,-1564481375,-1474664885,-1035236496,-949202525,-778901479,-694614492,-200395387,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,-2067236844,-1933114872,-1866530822,-1538233109,-1090935817,-965641998);function binb_sha256(m,l){var HASH=new Array(1779033703,-1150833019,1013904242,-1521486534,1359893119,-1694144372,528734635,1541459225);var W=new Array(64);var a,b,c,d,e,f,g,h;var i,j,T1,T2;m[l>>5]|=0x80<<(24-l%32);m[((l+64>>9)<<4)+15]=l;for(i=0;i<m.length;i+=16){a=HASH[0];b=HASH[1];c=HASH[2];d=HASH[3];e=HASH[4];f=HASH[5];g=HASH[6];h=HASH[7];for(j=0;j<64;j++){if(j<16)W[j]=m[j+i];else W[j]=safe_add(safe_add(safe_add(sha256_Gamma1256(W[j-2]),W[j-7]),sha256_Gamma0256(W[j-15])),W[j-16]);T1=safe_add(safe_add(safe_add(safe_add(h,sha256_Sigma1256(e)),sha256_Ch(e,f,g)),sha256_K[j]),W[j]);T2=safe_add(sha256_Sigma0256(a),sha256_Maj(a,b,c));h=g;g=f;f=e;e=safe_add(d,T1);d=c;c=b;b=a;a=safe_add(T1,T2)}HASH[0]=safe_add(a,HASH[0]);HASH[1]=safe_add(b,HASH[1]);HASH[2]=safe_add(c,HASH[2]);HASH[3]=safe_add(d,HASH[3]);HASH[4]=safe_add(e,HASH[4]);HASH[5]=safe_add(f,HASH[5]);HASH[6]=safe_add(g,HASH[6]);HASH[7]=safe_add(h,HASH[7])}return HASH}function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF)}
/*********************************** SHA256 *************************************/
