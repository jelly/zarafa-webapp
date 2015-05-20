// Input 0
/*


 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
var core={},gui={},xmldom={},odf={},ops={};
// Input 1
function Runtime(){}Runtime.ByteArray=function(d){};Runtime.prototype.getVariable=function(d){};Runtime.prototype.toJson=function(d){};Runtime.prototype.fromJson=function(d){};Runtime.ByteArray.prototype.slice=function(d,m){};Runtime.ByteArray.prototype.length=0;Runtime.prototype.byteArrayFromArray=function(d){};Runtime.prototype.byteArrayFromString=function(d,m){};Runtime.prototype.byteArrayToString=function(d,m){};Runtime.prototype.concatByteArrays=function(d,m){};
Runtime.prototype.read=function(d,m,n,r){};Runtime.prototype.readFile=function(d,m,n){};Runtime.prototype.readFileSync=function(d,m){};Runtime.prototype.loadXML=function(d,m){};Runtime.prototype.writeFile=function(d,m,n){};Runtime.prototype.isFile=function(d,m){};Runtime.prototype.getFileSize=function(d,m){};Runtime.prototype.deleteFile=function(d,m){};Runtime.prototype.log=function(d,m){};Runtime.prototype.setTimeout=function(d,m){};Runtime.prototype.libraryPaths=function(){};
Runtime.prototype.type=function(){};Runtime.prototype.getDOMImplementation=function(){};Runtime.prototype.parseXML=function(d){};Runtime.prototype.getWindow=function(){};Runtime.prototype.assert=function(d,m,n){};var IS_COMPILED_CODE=!0;
Runtime.byteArrayToString=function(d,m){function n(h){var a="",e,k=h.length;for(e=0;e<k;e+=1)a+=String.fromCharCode(h[e]&255);return a}function r(h){var a="",e,k=h.length,b,l,t,v;for(e=0;e<k;e+=1)b=h[e],128>b?a+=String.fromCharCode(b):(e+=1,l=h[e],194<=b&&224>b?a+=String.fromCharCode((b&31)<<6|l&63):(e+=1,t=h[e],224<=b&&240>b?a+=String.fromCharCode((b&15)<<12|(l&63)<<6|t&63):(e+=1,v=h[e],240<=b&&245>b&&(b=(b&7)<<18|(l&63)<<12|(t&63)<<6|v&63,b-=65536,a+=String.fromCharCode((b>>10)+55296,(b&1023)+56320)))));
return a}var s;"utf8"===m?s=r(d):("binary"!==m&&this.log("Unsupported encoding: "+m),s=n(d));return s};Runtime.getVariable=function(d){try{return eval(d)}catch(m){}};Runtime.toJson=function(d){return JSON.stringify(d)};Runtime.fromJson=function(d){return JSON.parse(d)};Runtime.getFunctionName=function(d){return void 0===d.name?(d=/function\s+(\w+)/.exec(d))&&d[1]:d.name};
function BrowserRuntime(d){function m(h,a){var e,k,b;void 0!==a?b=h:a=h;d?(k=d.ownerDocument,b&&(e=k.createElement("span"),e.className=b,e.appendChild(k.createTextNode(b)),d.appendChild(e),d.appendChild(k.createTextNode(" "))),e=k.createElement("span"),0<a.length&&"<"===a[0]?e.innerHTML=a:e.appendChild(k.createTextNode(a)),d.appendChild(e),d.appendChild(k.createElement("br"))):console&&console.log(a);"alert"===b&&alert(a)}var n=this,r={},s=window.ArrayBuffer&&window.Uint8Array;s&&(Uint8Array.prototype.slice=
function(h,a){void 0===a&&(void 0===h&&(h=0),a=this.length);var e=this.subarray(h,a),k,b;a-=h;k=new Uint8Array(new ArrayBuffer(a));for(b=0;b<a;b+=1)k[b]=e[b];return k});this.ByteArray=s?function(h){return new Uint8Array(new ArrayBuffer(h))}:function(h){var a=[];a.length=h;return a};this.concatByteArrays=s?function(h,a){var e,k=h.length,b=a.length,l=new this.ByteArray(k+b);for(e=0;e<k;e+=1)l[e]=h[e];for(e=0;e<b;e+=1)l[e+k]=a[e];return l}:function(h,a){return h.concat(a)};this.byteArrayFromArray=function(h){return h.slice()};
this.byteArrayFromString=function(h,a){var e;if("utf8"===a){e=h.length;var k,b,l,t=0;for(b=0;b<e;b+=1)l=h.charCodeAt(b),t+=1+(128<l)+(2048<l);k=new n.ByteArray(t);for(b=t=0;b<e;b+=1)l=h.charCodeAt(b),128>l?(k[t]=l,t+=1):2048>l?(k[t]=192|l>>>6,k[t+1]=128|l&63,t+=2):(k[t]=224|l>>>12&15,k[t+1]=128|l>>>6&63,k[t+2]=128|l&63,t+=3)}else for("binary"!==a&&n.log("unknown encoding: "+a),e=h.length,k=new n.ByteArray(e),b=0;b<e;b+=1)k[b]=h.charCodeAt(b)&255;return e=k};this.byteArrayToString=Runtime.byteArrayToString;
this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=function(h,a,e){function k(){var t;4===b.readyState&&(0!==b.status||b.responseText?200===b.status||0===b.status?(t="binary"===a?null!==b.responseBody&&"undefined"!==String(typeof VBArray)?(new VBArray(b.responseBody)).toArray():n.byteArrayFromString(b.responseText,"binary"):b.responseText,r[h]=t,e(null,t)):e(b.responseText||b.statusText):e("File "+h+" is empty."))}if(r.hasOwnProperty(h))e(null,
r[h]);else{var b=new XMLHttpRequest;b.open("GET",h,!0);b.onreadystatechange=k;b.overrideMimeType&&("binary"!==a?b.overrideMimeType("text/plain; charset="+a):b.overrideMimeType("text/plain; charset=x-user-defined"));try{b.send(null)}catch(l){e(l.message)}}};this.read=function(h,a,e,k){function b(){var b;4===l.readyState&&(0!==l.status||l.responseText?200===l.status||0===l.status?(l.response?(b=l.response,b=new Uint8Array(b)):b=null!==l.responseBody&&"undefined"!==String(typeof VBArray)?(new VBArray(l.responseBody)).toArray():
n.byteArrayFromString(l.responseText,"binary"),r[h]=b,k(null,b.slice(a,a+e))):k(l.responseText||l.statusText):k("File "+h+" is empty."))}if(r.hasOwnProperty(h))k(null,r[h].slice(a,a+e));else{var l=new XMLHttpRequest;l.open("GET",h,!0);l.onreadystatechange=b;l.overrideMimeType&&l.overrideMimeType("text/plain; charset=x-user-defined");l.responseType="arraybuffer";try{l.send(null)}catch(t){k(t.message)}}};this.readFileSync=function(h,a){var e=new XMLHttpRequest,k;e.open("GET",h,!1);e.overrideMimeType&&
("binary"!==a?e.overrideMimeType("text/plain; charset="+a):e.overrideMimeType("text/plain; charset=x-user-defined"));try{if(e.send(null),200===e.status||0===e.status)k=e.responseText}catch(b){}return k};this.writeFile=function(h,a,e){r[h]=a;var k=new XMLHttpRequest;k.open("PUT",h,!0);k.onreadystatechange=function(){4===k.readyState&&(0!==k.status||k.responseText?200<=k.status&&300>k.status||0===k.status?e(null):e("Status "+String(k.status)+": "+k.responseText||k.statusText):e("File "+h+" is empty."))};
a=a.buffer&&!k.sendAsBinary?a.buffer:n.byteArrayToString(a,"binary");try{k.sendAsBinary?k.sendAsBinary(a):k.send(a)}catch(b){n.log("HUH? "+b+" "+a),e(b.message)}};this.deleteFile=function(h,a){delete r[h];var e=new XMLHttpRequest;e.open("DELETE",h,!0);e.onreadystatechange=function(){4===e.readyState&&(200>e.status&&300<=e.status?a(e.responseText):a(null))};e.send(null)};this.loadXML=function(h,a){var e=new XMLHttpRequest;e.open("GET",h,!0);e.overrideMimeType&&e.overrideMimeType("text/xml");e.onreadystatechange=
function(){4===e.readyState&&(0!==e.status||e.responseText?200===e.status||0===e.status?a(null,e.responseXML):a(e.responseText):a("File "+h+" is empty."))};try{e.send(null)}catch(k){a(k.message)}};this.isFile=function(h,a){n.getFileSize(h,function(e){a(-1!==e)})};this.getFileSize=function(h,a){var e=new XMLHttpRequest;e.open("HEAD",h,!0);e.onreadystatechange=function(){if(4===e.readyState){var k=e.getResponseHeader("Content-Length");k?a(parseInt(k,10)):a(-1)}};e.send(null)};this.log=m;this.assert=
function(h,a,e){if(!h)throw m("alert","ASSERTION FAILED:\n"+a),e&&e(),a;};this.setTimeout=function(h,a){setTimeout(function(){h()},a)};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(h){};this.type=function(){return"BrowserRuntime"};this.getDOMImplementation=function(){return window.document.implementation};this.parseXML=function(h){return(new DOMParser).parseFromString(h,"text/xml")};this.exit=function(h){m("Calling exit with code "+String(h)+", but exit() is not implemented.")};
this.getWindow=function(){return window};this.getNetwork=function(){var h=this.getVariable("now");return void 0===h?{networkStatus:"unavailable"}:h}}
function NodeJSRuntime(){function d(a,k,b){a=r.resolve(s,a);"binary"!==k?n.readFile(a,k,b):n.readFile(a,null,b)}var m=this,n=require("fs"),r=require("path"),s="",h,a;this.ByteArray=function(a){return new Buffer(a)};this.byteArrayFromArray=function(a){var k=new Buffer(a.length),b,l=a.length;for(b=0;b<l;b+=1)k[b]=a[b];return k};this.concatByteArrays=function(a,k){var b=new Buffer(a.length+k.length);a.copy(b,0,0);k.copy(b,a.length,0);return b};this.byteArrayFromString=function(a,k){return new Buffer(a,
k)};this.byteArrayToString=function(a,k){return a.toString(k)};this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=d;this.loadXML=function(a,k){d(a,"utf-8",function(b,a){if(b)return k(b);k(null,m.parseXML(a))})};this.writeFile=function(a,k,b){a=r.resolve(s,a);n.writeFile(a,k,"binary",function(a){b(a||null)})};this.deleteFile=function(a,k){a=r.resolve(s,a);n.unlink(a,k)};this.read=function(a,k,b,l){a=r.resolve(s,a);n.open(a,"r+",666,function(a,
e){if(a)l(a);else{var c=new Buffer(b);n.read(e,c,0,b,k,function(b,a){n.close(e);l(b,c)})}})};this.readFileSync=function(a,k){return k?"binary"===k?n.readFileSync(a,null):n.readFileSync(a,k):""};this.isFile=function(a,k){a=r.resolve(s,a);n.stat(a,function(b,a){k(!b&&a.isFile())})};this.getFileSize=function(a,k){a=r.resolve(s,a);n.stat(a,function(b,a){b?k(-1):k(a.size)})};this.log=function(a,k){var b;void 0!==k?b=a:k=a;"alert"===b&&process.stderr.write("\n!!!!! ALERT !!!!!\n");process.stderr.write(k+
"\n");"alert"===b&&process.stderr.write("!!!!! ALERT !!!!!\n")};this.assert=function(a,k,b){a||(process.stderr.write("ASSERTION FAILED: "+k),b&&b())};this.setTimeout=function(a,k){setTimeout(function(){a()},k)};this.libraryPaths=function(){return[__dirname]};this.setCurrentDirectory=function(a){s=a};this.currentDirectory=function(){return s};this.type=function(){return"NodeJSRuntime"};this.getDOMImplementation=function(){return a};this.parseXML=function(a){return h.parseFromString(a,"text/xml")};
this.exit=process.exit;this.getWindow=function(){return null};this.getNetwork=function(){return{networkStatus:"unavailable"}};h=new (require("xmldom").DOMParser);a=m.parseXML("<a/>").implementation}
function RhinoRuntime(){function d(a,e){var k;void 0!==e?k=a:e=a;"alert"===k&&print("\n!!!!! ALERT !!!!!");print(e);"alert"===k&&print("!!!!! ALERT !!!!!")}var m=this,n=Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance(),r,s,h="";n.setValidating(!1);n.setNamespaceAware(!0);n.setExpandEntityReferences(!1);n.setSchema(null);s=Packages.org.xml.sax.EntityResolver({resolveEntity:function(a,e){var k=new Packages.java.io.FileReader(e);return new Packages.org.xml.sax.InputSource(k)}});r=n.newDocumentBuilder();
r.setEntityResolver(s);this.ByteArray=function(a){return[a]};this.byteArrayFromArray=function(a){return a};this.byteArrayFromString=function(a,e){var k=[],b,l=a.length;for(b=0;b<l;b+=1)k[b]=a.charCodeAt(b)&255;return k};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.concatByteArrays=function(a,e){return a.concat(e)};this.loadXML=function(a,e){var k=new Packages.java.io.File(a),b;try{b=r.parse(k)}catch(l){print(l);
e(l);return}e(null,b)};this.readFile=function(a,e,k){h&&(a=h+"/"+a);var b=new Packages.java.io.File(a),l="binary"===e?"latin1":e;b.isFile()?(a=readFile(a,l),"binary"===e&&(a=m.byteArrayFromString(a,"binary")),k(null,a)):k(a+" is not a file.")};this.writeFile=function(a,e,k){h&&(a=h+"/"+a);a=new Packages.java.io.FileOutputStream(a);var b,l=e.length;for(b=0;b<l;b+=1)a.write(e[b]);a.close();k(null)};this.deleteFile=function(a,e){h&&(a=h+"/"+a);(new Packages.java.io.File(a))["delete"]()?e(null):e("Could not delete "+
a)};this.read=function(a,e,k,b){h&&(a=h+"/"+a);var l;l=a;var t="binary";(new Packages.java.io.File(l)).isFile()?("binary"===t&&(t="latin1"),l=readFile(l,t)):l=null;l?b(null,this.byteArrayFromString(l.substring(e,e+k),"binary")):b("Cannot read "+a)};this.readFileSync=function(a,e){return e?readFile(a,e):""};this.isFile=function(a,e){h&&(a=h+"/"+a);var k=new Packages.java.io.File(a);e(k.isFile())};this.getFileSize=function(a,e){h&&(a=h+"/"+a);var k=new Packages.java.io.File(a);e(k.length())};this.log=
d;this.assert=function(a,e,k){a||(d("alert","ASSERTION FAILED: "+e),k&&k())};this.setTimeout=function(a,e){a()};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(a){h=a};this.currentDirectory=function(){return h};this.type=function(){return"RhinoRuntime"};this.getDOMImplementation=function(){return r.getDOMImplementation()};this.parseXML=function(a){return r.parse(a)};this.exit=quit;this.getWindow=function(){return null};this.getNetwork=function(){return{networkStatus:"unavailable"}}}
var runtime=function(){return"undefined"!==String(typeof window)?new BrowserRuntime(window.document.getElementById("logoutput")):"undefined"!==String(typeof require)?new NodeJSRuntime:new RhinoRuntime}();
(function(){function d(d){var n=d[0],h;h=eval("if (typeof "+n+" === 'undefined') {eval('"+n+" = {};');}"+n);for(n=1;n<d.length-1;n+=1)h=h.hasOwnProperty(d[n])?h[d[n]]:h[d[n]]={};return h[d[d.length-1]]}var m={},n={};runtime.loadClass=function(r){function s(a){a=a.replace(/\./g,"/")+".js";var b=runtime.libraryPaths(),l,t,e;runtime.currentDirectory&&b.push(runtime.currentDirectory());for(l=0;l<b.length;l+=1){t=b[l];if(!n.hasOwnProperty(t))try{e=runtime.readFileSync(b[l]+"/manifest.js","utf8"),n[t]=
e&&e.length?eval(e):null}catch(c){n[t]=null,runtime.log("Cannot load manifest for "+t+".")}e=null;if((t=n[t])&&t.indexOf&&-1!==t.indexOf(a))return b[l]+"/"+a}return null}function h(a){var b,l;l=s(a);if(!l)throw a+" is not listed in any manifest.js.";try{b=runtime.readFileSync(l,"utf8")}catch(t){throw runtime.log("Error loading "+a+" "+t),t;}if(void 0===b)throw"Cannot load class "+a;b=b+("\n//# sourceURL="+l)+("\n//@ sourceURL="+l);try{b=eval(a+" = eval(code);")}catch(e){throw runtime.log("Error loading "+
a+" "+e),e;}return b}if(!IS_COMPILED_CODE&&!m.hasOwnProperty(r)){var a=r.split("."),e;e=d(a);if(!e&&(e=h(r),!e||Runtime.getFunctionName(e)!==a[a.length-1]))throw runtime.log("Loaded code is not for "+a[a.length-1]),"Loaded code is not for "+a[a.length-1];m[r]=!0}}})();
(function(d){function m(d){if(d.length){var r=d[0];runtime.readFile(r,"utf8",function(m,h){function a(){var b;(b=eval(k))&&runtime.exit(b)}var e="";runtime.libraryPaths();var k=h;-1!==r.indexOf("/")&&(e=r.substring(0,r.indexOf("/")));runtime.setCurrentDirectory(e);m||null===k?(runtime.log(m),runtime.exit(1)):a.apply(null,d)})}}d=d?Array.prototype.slice.call(d):[];"NodeJSRuntime"===runtime.type()?m(process.argv.slice(2)):"RhinoRuntime"===runtime.type()?m(d):m(d.slice(1))})("undefined"!==String(typeof arguments)&&
arguments);
// Input 2
core.Base64=function(){function d(c){var b=[],f,a=c.length;for(f=0;f<a;f+=1)b[f]=c.charCodeAt(f)&255;return b}function m(c){var b,f="",a,p=c.length-2;for(a=0;a<p;a+=3)b=c[a]<<16|c[a+1]<<8|c[a+2],f+=q[b>>>18],f+=q[b>>>12&63],f+=q[b>>>6&63],f+=q[b&63];a===p+1?(b=c[a]<<4,f+=q[b>>>6],f+=q[b&63],f+="=="):a===p&&(b=c[a]<<10|c[a+1]<<2,f+=q[b>>>12],f+=q[b>>>6&63],f+=q[b&63],f+="=");return f}function n(c){c=c.replace(/[^A-Za-z0-9+\/]+/g,"");var b=[],f=c.length%4,a,p=c.length,q;for(a=0;a<p;a+=4)q=(g[c.charAt(a)]||
0)<<18|(g[c.charAt(a+1)]||0)<<12|(g[c.charAt(a+2)]||0)<<6|(g[c.charAt(a+3)]||0),b.push(q>>16,q>>8&255,q&255);b.length-=[0,0,2,1][f];return b}function r(c){var b=[],f,a=c.length,p;for(f=0;f<a;f+=1)p=c[f],128>p?b.push(p):2048>p?b.push(192|p>>>6,128|p&63):b.push(224|p>>>12&15,128|p>>>6&63,128|p&63);return b}function s(c){var b=[],f,a=c.length,p,q,g;for(f=0;f<a;f+=1)p=c[f],128>p?b.push(p):(f+=1,q=c[f],224>p?b.push((p&31)<<6|q&63):(f+=1,g=c[f],b.push((p&15)<<12|(q&63)<<6|g&63)));return b}function h(c){return m(d(c))}
function a(c){return String.fromCharCode.apply(String,n(c))}function e(c){return s(d(c))}function k(c){c=s(c);for(var b="",f=0;f<c.length;)b+=String.fromCharCode.apply(String,c.slice(f,f+45E3)),f+=45E3;return b}function b(c,b,f){var a="",p,q,g;for(g=b;g<f;g+=1)b=c.charCodeAt(g)&255,128>b?a+=String.fromCharCode(b):(g+=1,p=c.charCodeAt(g)&255,224>b?a+=String.fromCharCode((b&31)<<6|p&63):(g+=1,q=c.charCodeAt(g)&255,a+=String.fromCharCode((b&15)<<12|(p&63)<<6|q&63)));return a}function l(c,f){function a(){var t=
q+p;t>c.length&&(t=c.length);g+=b(c,q,t);q=t;t=q===c.length;f(g,t)&&!t&&runtime.setTimeout(a,0)}var p=1E5,g="",q=0;c.length<p?f(b(c,0,c.length),!0):("string"!==typeof c&&(c=c.slice()),a())}function t(c){return r(d(c))}function v(c){return String.fromCharCode.apply(String,r(c))}function c(c){return String.fromCharCode.apply(String,r(d(c)))}var q="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";(function(){var c=[],b;for(b=0;26>b;b+=1)c.push(65+b);for(b=0;26>b;b+=1)c.push(97+b);for(b=
0;10>b;b+=1)c.push(48+b);c.push(43);c.push(47);return c})();var g=function(c){var b={},f,a;f=0;for(a=c.length;f<a;f+=1)b[c.charAt(f)]=f;return b}(q),p,f,y=runtime.getWindow(),w,u;y&&y.btoa?(w=function(c){return y.btoa(c)},p=function(b){return w(c(b))}):(w=h,p=function(c){return m(t(c))});y&&y.atob?(u=function(c){return y.atob(c)},f=function(c){c=u(c);return b(c,0,c.length)}):(u=a,f=function(c){return k(n(c))});return function(){this.convertByteArrayToBase64=this.convertUTF8ArrayToBase64=m;this.convertBase64ToByteArray=
this.convertBase64ToUTF8Array=n;this.convertUTF16ArrayToByteArray=this.convertUTF16ArrayToUTF8Array=r;this.convertByteArrayToUTF16Array=this.convertUTF8ArrayToUTF16Array=s;this.convertUTF8StringToBase64=h;this.convertBase64ToUTF8String=a;this.convertUTF8StringToUTF16Array=e;this.convertByteArrayToUTF16String=this.convertUTF8ArrayToUTF16String=k;this.convertUTF8StringToUTF16String=l;this.convertUTF16StringToByteArray=this.convertUTF16StringToUTF8Array=t;this.convertUTF16ArrayToUTF8String=v;this.convertUTF16StringToUTF8String=
c;this.convertUTF16StringToBase64=p;this.convertBase64ToUTF16String=f;this.fromBase64=a;this.toBase64=h;this.atob=u;this.btoa=w;this.utob=c;this.btou=l;this.encode=p;this.encodeURI=function(c){return p(c).replace(/[+\/]/g,function(c){return"+"===c?"-":"_"}).replace(/\\=+$/,"")};this.decode=function(c){return f(c.replace(/[\-_]/g,function(c){return"-"===c?"+":"/"}))}}}();
// Input 3
core.RawDeflate=function(){function d(){this.dl=this.fc=0}function m(){this.extra_bits=this.static_tree=this.dyn_tree=null;this.max_code=this.max_length=this.elems=this.extra_base=0}function n(c,b,f,a){this.good_length=c;this.max_lazy=b;this.nice_length=f;this.max_chain=a}function r(){this.next=null;this.len=0;this.ptr=[];this.ptr.length=s;this.off=0}var s=8192,h,a,e,k,b=null,l,t,v,c,q,g,p,f,y,w,u,x,F,J,D,O,B,K,G,I,X,$,V,aa,Q,H,T,U,L,M,z,P,N,E,W,R,C,A,ba,ea,S,fa,Y,la,sa,ga,ia,ca,ha,ma,ta,ua=[0,0,
0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ja=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Ka=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ya=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],na;na=[new n(0,0,0,0),new n(4,4,8,4),new n(4,5,16,8),new n(4,6,32,32),new n(4,4,16,16),new n(8,16,32,32),new n(8,16,128,128),new n(8,32,128,256),new n(32,128,258,1024),new n(32,258,258,4096)];var oa=function(c){b[t+l++]=c;if(t+l===s){var f;if(0!==l){null!==h?(c=h,h=h.next):c=new r;
c.next=null;c.len=c.off=0;null===a?a=e=c:e=e.next=c;c.len=l-t;for(f=0;f<c.len;f++)c.ptr[f]=b[t+f];l=t=0}}},pa=function(c){c&=65535;t+l<s-2?(b[t+l++]=c&255,b[t+l++]=c>>>8):(oa(c&255),oa(c>>>8))},qa=function(){u=(u<<5^c[B+3-1]&255)&8191;x=p[32768+u];p[B&32767]=x;p[32768+u]=B},Z=function(c,b){y>16-b?(f|=c<<y,pa(f),f=c>>16-y,y+=b-16):(f|=c<<y,y+=b)},da=function(c,b){Z(b[c].fc,b[c].dl)},za=function(c,b,f){return c[b].fc<c[f].fc||c[b].fc===c[f].fc&&C[b]<=C[f]},Aa=function(c,b,f){var a;for(a=0;a<f&&ta<ma.length;a++)c[b+
a]=ma.charCodeAt(ta++)&255;return a},va=function(){var b,f,a=65536-I-B;if(-1===a)a--;else if(65274<=B){for(b=0;32768>b;b++)c[b]=c[b+32768];K-=32768;B-=32768;w-=32768;for(b=0;8192>b;b++)f=p[32768+b],p[32768+b]=32768<=f?f-32768:0;for(b=0;32768>b;b++)f=p[b],p[b]=32768<=f?f-32768:0;a+=32768}G||(b=Aa(c,B+I,a),0>=b?G=!0:I+=b)},Ba=function(b){var f=X,a=B,g,q=O,t=32506<B?B-32506:0,k=B+258,l=c[a+q-1],e=c[a+q];O>=aa&&(f>>=2);do if(g=b,c[g+q]===e&&c[g+q-1]===l&&c[g]===c[a]&&c[++g]===c[a+1]){a+=2;g++;do++a;while(c[a]===
c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&c[++a]===c[++g]&&a<k);g=258-(k-a);a=k-258;if(g>q){K=b;q=g;if(258<=g)break;l=c[a+q-1];e=c[a+q]}}while((b=p[b&32767])>t&&0!==--f);return q},ka=function(c,b){g[Y++]=b;0===c?Q[b].fc++:(c--,Q[A[b]+256+1].fc++,H[(256>c?ba[c]:ba[256+(c>>7)])&255].fc++,q[la++]=c,ga|=ia);ia<<=1;0===(Y&7)&&(fa[sa++]=ga,ga=0,ia=1);if(2<V&&0===(Y&4095)){var f=8*Y,a=B-w,p;for(p=0;30>p;p++)f+=H[p].fc*(5+ja[p]);f>>=3;if(la<
parseInt(Y/2,10)&&f<parseInt(a/2,10))return!0}return 8191===Y||8192===la},wa=function(c,b){for(var f=E[b],a=b<<1;a<=W;){a<W&&za(c,E[a+1],E[a])&&a++;if(za(c,f,E[a]))break;E[b]=E[a];b=a;a<<=1}E[b]=f},Ca=function(c,b){var f=0;do f|=c&1,c>>=1,f<<=1;while(0<--b);return f>>1},Da=function(c,b){var f=[];f.length=16;var a=0,p;for(p=1;15>=p;p++)a=a+N[p-1]<<1,f[p]=a;for(a=0;a<=b;a++)p=c[a].dl,0!==p&&(c[a].fc=Ca(f[p]++,p))},xa=function(c){var b=c.dyn_tree,f=c.static_tree,a=c.elems,p,g=-1,q=a;W=0;R=573;for(p=
0;p<a;p++)0!==b[p].fc?(E[++W]=g=p,C[p]=0):b[p].dl=0;for(;2>W;)p=E[++W]=2>g?++g:0,b[p].fc=1,C[p]=0,ca--,null!==f&&(ha-=f[p].dl);c.max_code=g;for(p=W>>1;1<=p;p--)wa(b,p);do p=E[1],E[1]=E[W--],wa(b,1),f=E[1],E[--R]=p,E[--R]=f,b[q].fc=b[p].fc+b[f].fc,C[q]=C[p]>C[f]+1?C[p]:C[f]+1,b[p].dl=b[f].dl=q,E[1]=q++,wa(b,1);while(2<=W);E[--R]=E[1];q=c.dyn_tree;p=c.extra_bits;var a=c.extra_base,f=c.max_code,t=c.max_length,k=c.static_tree,l,e,h,v,d=0;for(e=0;15>=e;e++)N[e]=0;q[E[R]].dl=0;for(c=R+1;573>c;c++)l=E[c],
e=q[q[l].dl].dl+1,e>t&&(e=t,d++),q[l].dl=e,l>f||(N[e]++,h=0,l>=a&&(h=p[l-a]),v=q[l].fc,ca+=v*(e+h),null!==k&&(ha+=v*(k[l].dl+h)));if(0!==d){do{for(e=t-1;0===N[e];)e--;N[e]--;N[e+1]+=2;N[t]--;d-=2}while(0<d);for(e=t;0!==e;e--)for(l=N[e];0!==l;)p=E[--c],p>f||(q[p].dl!==e&&(ca+=(e-q[p].dl)*q[p].fc,q[p].fc=e),l--)}Da(b,g)},Ea=function(c,b){var f,a=-1,p,g=c[0].dl,q=0,t=7,k=4;0===g&&(t=138,k=3);c[b+1].dl=65535;for(f=0;f<=b;f++)p=g,g=c[f+1].dl,++q<t&&p===g||(q<k?L[p].fc+=q:0!==p?(p!==a&&L[p].fc++,L[16].fc++):
10>=q?L[17].fc++:L[18].fc++,q=0,a=p,0===g?(t=138,k=3):p===g?(t=6,k=3):(t=7,k=4))},Fa=function(){8<y?pa(f):0<y&&oa(f);y=f=0},Ga=function(c,b){var f,a=0,p=0,t=0,k=0,l,e;if(0!==Y){do 0===(a&7)&&(k=fa[t++]),f=g[a++]&255,0===(k&1)?da(f,c):(l=A[f],da(l+256+1,c),e=ua[l],0!==e&&(f-=ea[l],Z(f,e)),f=q[p++],l=(256>f?ba[f]:ba[256+(f>>7)])&255,da(l,b),e=ja[l],0!==e&&(f-=S[l],Z(f,e))),k>>=1;while(a<Y)}da(256,c)},Ha=function(c,b){var f,a=-1,p,g=c[0].dl,q=0,t=7,k=4;0===g&&(t=138,k=3);for(f=0;f<=b;f++)if(p=g,g=c[f+
1].dl,!(++q<t&&p===g)){if(q<k){do da(p,L);while(0!==--q)}else 0!==p?(p!==a&&(da(p,L),q--),da(16,L),Z(q-3,2)):10>=q?(da(17,L),Z(q-3,3)):(da(18,L),Z(q-11,7));q=0;a=p;0===g?(t=138,k=3):p===g?(t=6,k=3):(t=7,k=4)}},Ia=function(){var c;for(c=0;286>c;c++)Q[c].fc=0;for(c=0;30>c;c++)H[c].fc=0;for(c=0;19>c;c++)L[c].fc=0;Q[256].fc=1;ga=Y=la=sa=ca=ha=0;ia=1},ra=function(b){var f,a,p,q;q=B-w;fa[sa]=ga;xa(M);xa(z);Ea(Q,M.max_code);Ea(H,z.max_code);xa(P);for(p=18;3<=p&&0===L[ya[p]].dl;p--);ca+=3*(p+1)+14;f=ca+3+
7>>3;a=ha+3+7>>3;a<=f&&(f=a);if(q+4<=f&&0<=w)for(Z(0+b,3),Fa(),pa(q),pa(~q),p=0;p<q;p++)oa(c[w+p]);else if(a===f)Z(2+b,3),Ga(T,U);else{Z(4+b,3);q=M.max_code+1;f=z.max_code+1;p+=1;Z(q-257,5);Z(f-1,5);Z(p-4,4);for(a=0;a<p;a++)Z(L[ya[a]].dl,3);Ha(Q,q-1);Ha(H,f-1);Ga(Q,H)}Ia();0!==b&&Fa()},Ja=function(c,f,p){var q,g,k;for(q=0;null!==a&&q<p;){g=p-q;g>a.len&&(g=a.len);for(k=0;k<g;k++)c[f+q+k]=a.ptr[a.off+k];a.off+=g;a.len-=g;q+=g;0===a.len&&(g=a,a=a.next,g.next=h,h=g)}if(q===p)return q;if(t<l){g=p-q;g>
l-t&&(g=l-t);for(k=0;k<g;k++)c[f+q+k]=b[t+k];t+=g;q+=g;l===t&&(l=t=0)}return q},La=function(b,q,g){var e;if(!k){if(!G){y=f=0;var h,d;if(0===U[0].dl){M.dyn_tree=Q;M.static_tree=T;M.extra_bits=ua;M.extra_base=257;M.elems=286;M.max_length=15;M.max_code=0;z.dyn_tree=H;z.static_tree=U;z.extra_bits=ja;z.extra_base=0;z.elems=30;z.max_length=15;z.max_code=0;P.dyn_tree=L;P.static_tree=null;P.extra_bits=Ka;P.extra_base=0;P.elems=19;P.max_length=7;for(d=h=P.max_code=0;28>d;d++)for(ea[d]=h,e=0;e<1<<ua[d];e++)A[h++]=
d;A[h-1]=d;for(d=h=0;16>d;d++)for(S[d]=h,e=0;e<1<<ja[d];e++)ba[h++]=d;for(h>>=7;30>d;d++)for(S[d]=h<<7,e=0;e<1<<ja[d]-7;e++)ba[256+h++]=d;for(e=0;15>=e;e++)N[e]=0;for(e=0;143>=e;)T[e++].dl=8,N[8]++;for(;255>=e;)T[e++].dl=9,N[9]++;for(;279>=e;)T[e++].dl=7,N[7]++;for(;287>=e;)T[e++].dl=8,N[8]++;Da(T,287);for(e=0;30>e;e++)U[e].dl=5,U[e].fc=Ca(e,5);Ia()}for(e=0;8192>e;e++)p[32768+e]=0;$=na[V].max_lazy;aa=na[V].good_length;X=na[V].max_chain;w=B=0;I=Aa(c,0,65536);if(0>=I)G=!0,I=0;else{for(G=!1;262>I&&!G;)va();
for(e=u=0;2>e;e++)u=(u<<5^c[e]&255)&8191}a=null;t=l=0;3>=V?(O=2,D=0):(D=2,J=0);v=!1}k=!0;if(0===I)return v=!0,0}if((e=Ja(b,q,g))===g)return g;if(v)return e;if(3>=V)for(;0!==I&&null===a;){qa();0!==x&&32506>=B-x&&(D=Ba(x),D>I&&(D=I));if(3<=D)if(d=ka(B-K,D-3),I-=D,D<=$){D--;do B++,qa();while(0!==--D);B++}else B+=D,D=0,u=c[B]&255,u=(u<<5^c[B+1]&255)&8191;else d=ka(0,c[B]&255),I--,B++;d&&(ra(0),w=B);for(;262>I&&!G;)va()}else for(;0!==I&&null===a;){qa();O=D;F=K;D=2;0!==x&&(O<$&&32506>=B-x)&&(D=Ba(x),D>
I&&(D=I),3===D&&4096<B-K&&D--);if(3<=O&&D<=O){d=ka(B-1-F,O-3);I-=O-1;O-=2;do B++,qa();while(0!==--O);J=0;D=2;B++;d&&(ra(0),w=B)}else 0!==J?ka(0,c[B-1]&255)&&(ra(0),w=B):J=1,B++,I--;for(;262>I&&!G;)va()}0===I&&(0!==J&&ka(0,c[B-1]&255),ra(1),v=!0);return e+Ja(b,e+q,g-e)};this.deflate=function(f,t){var l,v;ma=f;ta=0;"undefined"===String(typeof t)&&(t=6);(l=t)?1>l?l=1:9<l&&(l=9):l=6;V=l;G=k=!1;if(null===b){h=a=e=null;b=[];b.length=s;c=[];c.length=65536;q=[];q.length=8192;g=[];g.length=32832;p=[];p.length=
65536;Q=[];Q.length=573;for(l=0;573>l;l++)Q[l]=new d;H=[];H.length=61;for(l=0;61>l;l++)H[l]=new d;T=[];T.length=288;for(l=0;288>l;l++)T[l]=new d;U=[];U.length=30;for(l=0;30>l;l++)U[l]=new d;L=[];L.length=39;for(l=0;39>l;l++)L[l]=new d;M=new m;z=new m;P=new m;N=[];N.length=16;E=[];E.length=573;C=[];C.length=573;A=[];A.length=256;ba=[];ba.length=512;ea=[];ea.length=29;S=[];S.length=30;fa=[];fa.length=1024}for(var n=Array(1024),y=[];0<(l=La(n,0,n.length));){var r=[];r.length=l;for(v=0;v<l;v++)r[v]=String.fromCharCode(n[v]);
y[y.length]=r.join("")}ma=null;return y.join("")}};
// Input 4
core.ByteArray=function(d){this.pos=0;this.data=d;this.readUInt32LE=function(){var d=this.data,n=this.pos+=4;return d[--n]<<24|d[--n]<<16|d[--n]<<8|d[--n]};this.readUInt16LE=function(){var d=this.data,n=this.pos+=2;return d[--n]<<8|d[--n]}};
// Input 5
core.ByteArrayWriter=function(d){var m=this,n=new runtime.ByteArray(0);this.appendByteArrayWriter=function(d){n=runtime.concatByteArrays(n,d.getByteArray())};this.appendByteArray=function(d){n=runtime.concatByteArrays(n,d)};this.appendArray=function(d){n=runtime.concatByteArrays(n,runtime.byteArrayFromArray(d))};this.appendUInt16LE=function(d){m.appendArray([d&255,d>>8&255])};this.appendUInt32LE=function(d){m.appendArray([d&255,d>>8&255,d>>16&255,d>>24&255])};this.appendString=function(m){n=runtime.concatByteArrays(n,
runtime.byteArrayFromString(m,d))};this.getLength=function(){return n.length};this.getByteArray=function(){return n}};
// Input 6
core.RawInflate=function(){var d,m,n=null,r,s,h,a,e,k,b,l,t,v,c,q,g,p,f=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],y=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99],u=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],x=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],F=[16,17,18,
0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],J=function(){this.list=this.next=null},D=function(){this.n=this.b=this.e=0;this.t=null},O=function(c,b,f,a,p,q){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var g=Array(this.BMAX+1),t,l,k,e,d,h,v,n=Array(this.BMAX+1),y,m,u,r=new D,s=Array(this.BMAX);e=Array(this.N_MAX);var w,x=Array(this.BMAX+1),K,I,G;G=this.root=null;for(d=0;d<g.length;d++)g[d]=0;for(d=0;d<n.length;d++)n[d]=0;for(d=0;d<s.length;d++)s[d]=null;for(d=0;d<e.length;d++)e[d]=
0;for(d=0;d<x.length;d++)x[d]=0;t=256<b?c[256]:this.BMAX;y=c;m=0;d=b;do g[y[m]]++,m++;while(0<--d);if(g[0]==b)this.root=null,this.status=this.m=0;else{for(h=1;h<=this.BMAX&&0==g[h];h++);v=h;q<h&&(q=h);for(d=this.BMAX;0!=d&&0==g[d];d--);k=d;q>d&&(q=d);for(K=1<<h;h<d;h++,K<<=1)if(0>(K-=g[h])){this.status=2;this.m=q;return}if(0>(K-=g[d]))this.status=2,this.m=q;else{g[d]+=K;x[1]=h=0;y=g;m=1;for(u=2;0<--d;)x[u++]=h+=y[m++];y=c;d=m=0;do 0!=(h=y[m++])&&(e[x[h]++]=d);while(++d<b);b=x[k];x[0]=d=0;y=e;m=0;
e=-1;w=n[0]=0;u=null;for(I=0;v<=k;v++)for(c=g[v];0<c--;){for(;v>w+n[1+e];){w+=n[1+e];e++;I=(I=k-w)>q?q:I;if((l=1<<(h=v-w))>c+1)for(l-=c+1,u=v;++h<I&&!((l<<=1)<=g[++u]);)l-=g[u];w+h>t&&w<t&&(h=t-w);I=1<<h;n[1+e]=h;u=Array(I);for(l=0;l<I;l++)u[l]=new D;G=null==G?this.root=new J:G.next=new J;G.next=null;G.list=u;s[e]=u;0<e&&(x[e]=d,r.b=n[e],r.e=16+h,r.t=u,h=(d&(1<<w)-1)>>w-n[e],s[e-1][h].e=r.e,s[e-1][h].b=r.b,s[e-1][h].n=r.n,s[e-1][h].t=r.t)}r.b=v-w;m>=b?r.e=99:y[m]<f?(r.e=256>y[m]?16:15,r.n=y[m++]):
(r.e=p[y[m]-f],r.n=a[y[m++]-f]);l=1<<v-w;for(h=d>>w;h<I;h+=l)u[h].e=r.e,u[h].b=r.b,u[h].n=r.n,u[h].t=r.t;for(h=1<<v-1;0!=(d&h);h>>=1)d^=h;for(d^=h;(d&(1<<w)-1)!=x[e];)w-=n[e],e--}this.m=n[1];this.status=0!=K&&1!=k?1:0}}},B=function(c){for(;a<c;){var b=h,f;f=g.length==p?-1:g[p++];h=b|f<<a;a+=8}},K=function(c){return h&f[c]},G=function(c){h>>=c;a-=c},I=function(f,a,p){var g,k,h;if(0==p)return 0;for(h=0;;){B(c);k=t.list[K(c)];for(g=k.e;16<g;){if(99==g)return-1;G(k.b);g-=16;B(g);k=k.t[K(g)];g=k.e}G(k.b);
if(16==g)m&=32767,f[a+h++]=d[m++]=k.n;else{if(15==g)break;B(g);b=k.n+K(g);G(g);B(q);k=v.list[K(q)];for(g=k.e;16<g;){if(99==g)return-1;G(k.b);g-=16;B(g);k=k.t[K(g)];g=k.e}G(k.b);B(g);l=m-k.n-K(g);for(G(g);0<b&&h<p;)b--,l&=32767,m&=32767,f[a+h++]=d[m++]=d[l++]}if(h==p)return p}e=-1;return h},X,$=function(b,f,a){var p,g,k,l,e,d,h,n=Array(316);for(p=0;p<n.length;p++)n[p]=0;B(5);d=257+K(5);G(5);B(5);h=1+K(5);G(5);B(4);p=4+K(4);G(4);if(286<d||30<h)return-1;for(g=0;g<p;g++)B(3),n[F[g]]=K(3),G(3);for(;19>
g;g++)n[F[g]]=0;c=7;g=new O(n,19,19,null,null,c);if(0!=g.status)return-1;t=g.root;c=g.m;l=d+h;for(p=k=0;p<l;)if(B(c),e=t.list[K(c)],g=e.b,G(g),g=e.n,16>g)n[p++]=k=g;else if(16==g){B(2);g=3+K(2);G(2);if(p+g>l)return-1;for(;0<g--;)n[p++]=k}else{17==g?(B(3),g=3+K(3),G(3)):(B(7),g=11+K(7),G(7));if(p+g>l)return-1;for(;0<g--;)n[p++]=0;k=0}c=9;g=new O(n,d,257,y,w,c);0==c&&(g.status=1);if(0!=g.status)return-1;t=g.root;c=g.m;for(p=0;p<h;p++)n[p]=n[p+d];q=6;g=new O(n,h,0,u,x,q);v=g.root;q=g.m;return 0==q&&
257<d||0!=g.status?-1:I(b,f,a)};this.inflate=function(f,F){null==d&&(d=Array(65536));a=h=m=0;e=-1;k=!1;b=l=0;t=null;g=f;p=0;var J=new runtime.ByteArray(F);a:{var H,D;for(H=0;H<F&&(!k||-1!=e);){if(0<b){if(0!=e)for(;0<b&&H<F;)b--,l&=32767,m&=32767,J[0+H++]=d[m++]=d[l++];else{for(;0<b&&H<F;)b--,m&=32767,B(8),J[0+H++]=d[m++]=K(8),G(8);0==b&&(e=-1)}if(H==F)break}if(-1==e){if(k)break;B(1);0!=K(1)&&(k=!0);G(1);B(2);e=K(2);G(2);t=null;b=0}switch(e){case 0:D=J;var U=0+H,L=F-H,M=void 0,M=a&7;G(M);B(16);M=K(16);
G(16);B(16);if(M!=(~h&65535))D=-1;else{G(16);b=M;for(M=0;0<b&&M<L;)b--,m&=32767,B(8),D[U+M++]=d[m++]=K(8),G(8);0==b&&(e=-1);D=M}break;case 1:if(null!=t)D=I(J,0+H,F-H);else b:{D=J;U=0+H;L=F-H;if(null==n){for(var z=void 0,M=Array(288),z=void 0,z=0;144>z;z++)M[z]=8;for(;256>z;z++)M[z]=9;for(;280>z;z++)M[z]=7;for(;288>z;z++)M[z]=8;s=7;z=new O(M,288,257,y,w,s);if(0!=z.status){alert("HufBuild error: "+z.status);D=-1;break b}n=z.root;s=z.m;for(z=0;30>z;z++)M[z]=5;X=5;z=new O(M,30,0,u,x,X);if(1<z.status){n=
null;alert("HufBuild error: "+z.status);D=-1;break b}r=z.root;X=z.m}t=n;v=r;c=s;q=X;D=I(D,U,L)}break;case 2:D=null!=t?I(J,0+H,F-H):$(J,0+H,F-H);break;default:D=-1}if(-1==D)break a;H+=D}}g=null;return J}};
// Input 7
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
core.LoopWatchDog=function(d,m){var n=Date.now(),r=0;this.check=function(){var s;if(d&&(s=Date.now(),s-n>d))throw runtime.log("alert","watchdog timeout"),"timeout!";if(0<m&&(r+=1,r>m))throw runtime.log("alert","watchdog loop overflow"),"loop overflow";}};
// Input 8
core.Cursor=function(d,m){function n(a){a.parentNode&&(b.push({prev:a.previousSibling,next:a.nextSibling}),a.parentNode.removeChild(a))}function r(b,c){b.nodeType===Node.TEXT_NODE&&(0===b.length?b.parentNode.removeChild(b):c.nodeType===Node.TEXT_NODE&&(c.insertData(0,b.data),b.parentNode.removeChild(b)))}function s(){b.forEach(function(b){b.prev&&b.prev.nextSibling&&r(b.prev,b.prev.nextSibling);b.next&&b.next.previousSibling&&r(b.next.previousSibling,b.next)});b.length=0}function h(a,c,q){if(c.nodeType===
Node.TEXT_NODE){runtime.assert(Boolean(c),"putCursorIntoTextNode: invalid container");var g=c.parentNode;runtime.assert(Boolean(g),"putCursorIntoTextNode: container without parent");runtime.assert(0<=q&&q<=c.length,"putCursorIntoTextNode: offset is out of bounds");0===q?g.insertBefore(a,c):(q!==c.length&&c.splitText(q),g.insertBefore(a,c.nextSibling))}else if(c.nodeType===Node.ELEMENT_NODE){runtime.assert(Boolean(c),"putCursorIntoContainer: invalid container");for(g=c.firstChild;null!==g&&0<q;)g=
g.nextSibling,q-=1;c.insertBefore(a,g)}b.push({prev:a.previousSibling,next:a.nextSibling})}var a=d.createElementNS("urn:webodf:names:cursor","cursor"),e=d.createElementNS("urn:webodf:names:cursor","anchor"),k,b=[],l,t;this.getNode=function(){return a};this.getAnchorNode=function(){return e.parentNode?e:a};this.getSelectedRange=function(){t?(l.setStartBefore(a),l.collapse(!0)):(l.setStartAfter(k?e:a),l.setEndBefore(k?a:e));return l};this.setSelectedRange=function(b,c){l&&l!==b&&l.detach();l=b;k=!1!==
c;(t=b.collapsed)?(n(e),n(a),h(a,b.startContainer,b.startOffset)):(n(e),n(a),h(k?a:e,b.endContainer,b.endOffset),h(k?e:a,b.startContainer,b.startOffset));s()};this.remove=function(){n(a);s()};a.setAttributeNS("urn:webodf:names:cursor","memberId",m);e.setAttributeNS("urn:webodf:names:cursor","memberId",m)};
// Input 9
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
core.EventNotifier=function(d){var m={};this.emit=function(d,r){var s,h;runtime.assert(m.hasOwnProperty(d),'unknown event fired "'+d+'"');h=m[d];for(s=0;s<h.length;s+=1)h[s](r)};this.subscribe=function(d,r){runtime.assert(m.hasOwnProperty(d),'tried to subscribe to unknown event "'+d+'"');m[d].push(r);runtime.log('event "'+d+'" subscribed.')};(function(){var n;for(n=0;n<d.length;n+=1)m[d[n]]=[]})()};
// Input 10
core.UnitTest=function(){};core.UnitTest.prototype.setUp=function(){};core.UnitTest.prototype.tearDown=function(){};core.UnitTest.prototype.description=function(){};core.UnitTest.prototype.tests=function(){};core.UnitTest.prototype.asyncTests=function(){};
core.UnitTest.provideTestAreaDiv=function(){var d=runtime.getWindow().document,m=d.getElementById("testarea");runtime.assert(!m,'Unclean test environment, found a div with id "testarea".');m=d.createElement("div");m.setAttribute("id","testarea");d.body.appendChild(m);return m};
core.UnitTest.cleanupTestAreaDiv=function(){var d=runtime.getWindow().document,m=d.getElementById("testarea");runtime.assert(!!m&&m.parentNode===d.body,'Test environment broken, found no div with id "testarea" below body.');d.body.removeChild(m)};
core.UnitTestRunner=function(){function d(k){a+=1;runtime.log("fail",k)}function m(a,b){var l;try{if(a.length!==b.length)return d("array of length "+a.length+" should be "+b.length+" long"),!1;for(l=0;l<a.length;l+=1)if(a[l]!==b[l])return d(a[l]+" should be "+b[l]+" at array index "+l),!1}catch(t){return!1}return!0}function n(a,b,l){var t=a.attributes,e=t.length,c,q,g;for(c=0;c<e;c+=1)if(q=t.item(c),"xmlns"!==q.prefix){g=b.getAttributeNS(q.namespaceURI,q.localName);if(!b.hasAttributeNS(q.namespaceURI,
q.localName))return d("Attribute "+q.localName+" with value "+q.value+" was not present"),!1;if(g!==q.value)return d("Attribute "+q.localName+" was "+g+" should be "+q.value),!1}return l?!0:n(b,a,!0)}function r(a,b){if(a.nodeType!==b.nodeType)return d(a.nodeType+" should be "+b.nodeType),!1;if(a.nodeType===Node.TEXT_NODE)return a.data===b.data;runtime.assert(a.nodeType===Node.ELEMENT_NODE,"Only textnodes and elements supported.");if(a.namespaceURI!==b.namespaceURI||a.localName!==b.localName)return d(a.namespaceURI+
" should be "+b.namespaceURI),!1;if(!n(a,b,!1))return!1;for(var l=a.firstChild,t=b.firstChild;l;){if(!t||!r(l,t))return!1;l=l.nextSibling;t=t.nextSibling}return t?!1:!0}function s(a,b){return 0===b?a===b&&1/a===1/b:a===b?!0:"number"===typeof b&&isNaN(b)?"number"===typeof a&&isNaN(a):Object.prototype.toString.call(b)===Object.prototype.toString.call([])?m(a,b):"object"===typeof b&&"object"===typeof a?b.constructor===Element||b.constructor===Node?r(b,a):e(b,a):!1}function h(a,b,l){"string"===typeof b&&
"string"===typeof l||runtime.log("WARN: shouldBe() expects string arguments");var t,e;try{e=eval(b)}catch(c){t=c}a=eval(l);t?d(b+" should be "+a+". Threw exception "+t):s(e,a)?runtime.log("pass",b+" is "+l):String(typeof e)===String(typeof a)?(l=0===e&&0>1/e?"-0":String(e),d(b+" should be "+a+". Was "+l+".")):d(b+" should be "+a+" (of type "+typeof a+"). Was "+e+" (of type "+typeof e+").")}var a=0,e;e=function(a,b){var l=Object.keys(a),t=Object.keys(b);l.sort();t.sort();return m(l,t)&&Object.keys(a).every(function(t){var c=
a[t],q=b[t];return s(c,q)?!0:(d(c+" should be "+q+" for key "+t),!1)})};this.areNodesEqual=r;this.shouldBeNull=function(a,b){h(a,b,"null")};this.shouldBeNonNull=function(a,b){var l,t;try{t=eval(b)}catch(e){l=e}l?d(b+" should be non-null. Threw exception "+l):null!==t?runtime.log("pass",b+" is non-null."):d(b+" should be non-null. Was "+t)};this.shouldBe=h;this.countFailedTests=function(){return a}};
core.UnitTester=function(){function d(d,n){return"<span style='color:blue;cursor:pointer' onclick='"+n+"'>"+d+"</span>"}var m=0,n={};this.runTests=function(r,s,h){function a(c){if(0===c.length)n[e]=l,m+=k.countFailedTests(),s();else{v=c[0];var f=Runtime.getFunctionName(v);runtime.log("Running "+f);q=k.countFailedTests();b.setUp();v(function(){b.tearDown();l[f]=q===k.countFailedTests();a(c.slice(1))})}}var e=Runtime.getFunctionName(r),k=new core.UnitTestRunner,b=new r(k),l={},t,v,c,q,g="BrowserRuntime"===
runtime.type();if(n.hasOwnProperty(e))runtime.log("Test "+e+" has already run.");else{g?runtime.log("<span>Running "+d(e,'runSuite("'+e+'");')+": "+b.description()+"</span>"):runtime.log("Running "+e+": "+b.description);c=b.tests();for(t=0;t<c.length;t+=1)v=c[t],r=Runtime.getFunctionName(v)||v.testName,h.length&&-1===h.indexOf(r)||(g?runtime.log("<span>Running "+d(r,'runTest("'+e+'","'+r+'")')+"</span>"):runtime.log("Running "+r),q=k.countFailedTests(),b.setUp(),v(),b.tearDown(),l[r]=q===k.countFailedTests());
a(b.asyncTests())}};this.countFailedTests=function(){return m};this.results=function(){return n}};
// Input 11
core.PositionIterator=function(d,m,n,r){function s(){this.acceptNode=function(b){return b.nodeType===Node.TEXT_NODE&&0===b.length?2:1}}function h(b){this.acceptNode=function(a){return a.nodeType===Node.TEXT_NODE&&0===a.length?2:b.acceptNode(a)}}function a(){var a=k.currentNode.nodeType;b=a===Node.TEXT_NODE?k.currentNode.length-1:a===Node.ELEMENT_NODE?1:0}var e=this,k,b,l;this.nextPosition=function(){if(k.currentNode===d)return!1;0===b&&k.currentNode.nodeType===Node.ELEMENT_NODE?null===k.firstChild()&&
(b=1):k.currentNode.nodeType===Node.TEXT_NODE&&b+1<k.currentNode.length?b+=1:null!==k.nextSibling()?b=0:(k.parentNode(),b=1);return!0};this.previousPosition=function(){var t=!0;if(0===b)if(null===k.previousSibling()){k.parentNode();if(k.currentNode===d)return k.firstChild(),!1;b=0}else a();else k.currentNode.nodeType===Node.TEXT_NODE?b-=1:null!==k.lastChild()?a():k.currentNode===d?t=!1:b=0;return t};this.container=function(){var a=k.currentNode,l=a.nodeType;return 0===b&&l!==Node.TEXT_NODE?a.parentNode:
a};this.rightNode=function(){var a=k.currentNode,e=a.nodeType;if(e===Node.TEXT_NODE&&b===a.length)for(a=a.nextSibling;a&&1!==l(a);)a=a.nextSibling;else e===Node.ELEMENT_NODE&&1===b&&(a=null);return a};this.leftNode=function(){var a=k.currentNode;if(0===b)for(a=a.previousSibling;a&&1!==l(a);)a=a.previousSibling;else if(a.nodeType===Node.ELEMENT_NODE)for(a=a.lastChild;a&&1!==l(a);)a=a.previousSibling;return a};this.getCurrentNode=function(){return k.currentNode};this.domOffset=function(){if(k.currentNode.nodeType===
Node.TEXT_NODE)return b;var a=0,l=k.currentNode,c;for(c=1===b?k.lastChild():k.previousSibling();c;)a+=1,c=k.previousSibling();k.currentNode=l;return a};this.unfilteredDomOffset=function(){if(k.currentNode.nodeType===Node.TEXT_NODE)return b;for(var a=0,l=k.currentNode,l=1===b?l.lastChild:l.previousSibling;l;)a+=1,l=l.previousSibling;return a};this.textOffset=function(){if(k.currentNode.nodeType!==Node.TEXT_NODE)return 0;for(var a=b,l=k.currentNode;k.previousSibling()&&k.currentNode.nodeType===Node.TEXT_NODE;)a+=
k.currentNode.length;k.currentNode=l;return a};this.getPreviousSibling=function(){var b=k.currentNode,a=k.previousSibling();k.currentNode=b;return a};this.getNextSibling=function(){var b=k.currentNode,a=k.nextSibling();k.currentNode=b;return a};this.text=function(){var b,a="",c=e.textNeighborhood();for(b=0;b<c.length;b+=1)a+=c[b].data;return a};this.textNeighborhood=function(){var b=k.currentNode,a=[];if(b.nodeType!==Node.TEXT_NODE)return a;for(;k.previousSibling();)if(k.currentNode.nodeType!==Node.TEXT_NODE){k.nextSibling();
break}do a.push(k.currentNode);while(k.nextSibling()&&k.currentNode.nodeType===Node.TEXT_NODE);k.currentNode=b;return a};this.substr=function(b,a){return e.text().substr(b,a)};this.setPosition=function(a,l){runtime.assert(null!==a&&void 0!==a,"PositionIterator.setPosition called without container");k.currentNode=a;if(a.nodeType===Node.TEXT_NODE)return b=l,runtime.assert(l<=a.length,"Error in setPosition: "+l+" > "+a.length),runtime.assert(0<=l,"Error in setPosition: "+l+" < 0"),l===a.length&&(b=void 0,
k.nextSibling()?b=0:k.parentNode()&&(b=1),runtime.assert(void 0!==b,"Error in setPosition: position not valid.")),!0;for(var c=l,q=k.firstChild(),g;0<l&&q;)for(l-=1,g=q,q=k.nextSibling();q&&q.nodeType===Node.TEXT_NODE&&g.nodeType===Node.TEXT_NODE&&q.previousSibling===g;)g=q,q=k.nextSibling();runtime.assert(0===l,"Error in setPosition: offset "+c+" is out of range.");null===q?(k.currentNode=a,b=1):b=0;return!0};this.setUnfilteredPosition=function(a,l){runtime.assert(null!==a&&void 0!==a,"PositionIterator.setUnfilteredPosition called without container");
if(a.nodeType===Node.TEXT_NODE)return e.setPosition(a,l);k.currentNode=a;n.acceptNode(a)===NodeFilter.FILTER_ACCEPT?l<a.childNodes.length?(k.currentNode=a.childNodes[l],b=0):b=1:k.nextSibling()?b=0:k.parentNode()&&(b=1);return!0};this.moveToEnd=function(){k.currentNode=d;b=1};this.moveToEndOfNode=function(a){a.nodeType===Node.TEXT_NODE?e.setPosition(a,a.length):(k.currentNode=a,b=1)};this.getNodeFilter=function(){return l};l=(n?new h(n):new s).acceptNode;l.acceptNode=l;k=d.ownerDocument.createTreeWalker(d,
m||4294967295,l,r);b=0;null===k.firstChild()&&(b=1)};
// Input 12
runtime.loadClass("core.PositionIterator");core.PositionFilter=function(){};core.PositionFilter.FilterResult={FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3};core.PositionFilter.prototype.acceptPosition=function(d){};(function(){return core.PositionFilter})();
// Input 13
core.Async=function(){this.forEach=function(d,m,n){function r(e){a!==h&&(e?(a=h,n(e)):(a+=1,a===h&&n(null)))}var s,h=d.length,a=0;for(s=0;s<h;s+=1)m(d[s],r)}};
// Input 14
runtime.loadClass("core.RawInflate");runtime.loadClass("core.ByteArray");runtime.loadClass("core.ByteArrayWriter");runtime.loadClass("core.Base64");
core.Zip=function(d,m){function n(c){var b=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,
853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,
4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,
225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,
2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,
2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],a,f,p=c.length,g=0,g=0;a=-1;for(f=0;f<p;f+=1)g=(a^c[f])&255,g=b[g],a=a>>>8^g;return a^-1}function r(c){return new Date((c>>25&127)+1980,(c>>21&15)-1,c>>16&31,c>>11&15,c>>5&63,(c&31)<<1)}function s(c){var a=c.getFullYear();return 1980>a?0:a-1980<<
25|c.getMonth()+1<<21|c.getDate()<<16|c.getHours()<<11|c.getMinutes()<<5|c.getSeconds()>>1}function h(c,a){var b,f,g,l,e,d,k,h=this;this.load=function(a){if(void 0!==h.data)a(null,h.data);else{var b=e+34+f+g+256;b+k>q&&(b=q-k);runtime.read(c,k,b,function(b,f){if(b||null===f)a(b,f);else a:{var g=f,q=new core.ByteArray(g),k=q.readUInt32LE(),t;if(67324752!==k)a("File entry signature is wrong."+k.toString()+" "+g.length.toString(),null);else{q.pos+=22;k=q.readUInt16LE();t=q.readUInt16LE();q.pos+=k+t;
if(l){g=g.slice(q.pos,q.pos+e);if(e!==g.length){a("The amount of compressed bytes read was "+g.length.toString()+" instead of "+e.toString()+" for "+h.filename+" in "+c+".",null);break a}g=p(g,d)}else g=g.slice(q.pos,q.pos+d);d!==g.length?a("The amount of bytes read was "+g.length.toString()+" instead of "+d.toString()+" for "+h.filename+" in "+c+".",null):(h.data=g,a(null,g))}}})}};this.set=function(c,a,b,f){h.filename=c;h.data=a;h.compressed=b;h.date=f};this.error=null;a&&(b=a.readUInt32LE(),33639248!==
b?this.error="Central directory entry has wrong signature at position "+(a.pos-4).toString()+' for file "'+c+'": '+a.data.length.toString():(a.pos+=6,l=a.readUInt16LE(),this.date=r(a.readUInt32LE()),a.readUInt32LE(),e=a.readUInt32LE(),d=a.readUInt32LE(),f=a.readUInt16LE(),g=a.readUInt16LE(),b=a.readUInt16LE(),a.pos+=8,k=a.readUInt32LE(),this.filename=runtime.byteArrayToString(a.data.slice(a.pos,a.pos+f),"utf8"),a.pos+=f+g+b))}function a(a,b){if(22!==a.length)b("Central directory length should be 22.",
f);else{var p=new core.ByteArray(a),l;l=p.readUInt32LE();101010256!==l?b("Central directory signature is wrong: "+l.toString(),f):(l=p.readUInt16LE(),0!==l?b("Zip files with non-zero disk numbers are not supported.",f):(l=p.readUInt16LE(),0!==l?b("Zip files with non-zero disk numbers are not supported.",f):(l=p.readUInt16LE(),g=p.readUInt16LE(),l!==g?b("Number of entries is inconsistent.",f):(l=p.readUInt32LE(),p=p.readUInt16LE(),p=q-22-l,runtime.read(d,p,q-p,function(a,p){if(a||null===p)b(a,f);else a:{var q=
new core.ByteArray(p),l,e;c=[];for(l=0;l<g;l+=1){e=new h(d,q);if(e.error){b(e.error,f);break a}c[c.length]=e}b(null,f)}})))))}}function e(a,b){var f=null,p,g;for(g=0;g<c.length;g+=1)if(p=c[g],p.filename===a){f=p;break}f?f.data?b(null,f.data):f.load(b):b(a+" not found.",null)}function k(a){var c=new core.ByteArrayWriter("utf8"),b=0;c.appendArray([80,75,3,4,20,0,0,0,0,0]);a.data&&(b=a.data.length);c.appendUInt32LE(s(a.date));c.appendUInt32LE(n(a.data));c.appendUInt32LE(b);c.appendUInt32LE(b);c.appendUInt16LE(a.filename.length);
c.appendUInt16LE(0);c.appendString(a.filename);a.data&&c.appendByteArray(a.data);return c}function b(a,c){var b=new core.ByteArrayWriter("utf8"),f=0;b.appendArray([80,75,1,2,20,0,20,0,0,0,0,0]);a.data&&(f=a.data.length);b.appendUInt32LE(s(a.date));b.appendUInt32LE(n(a.data));b.appendUInt32LE(f);b.appendUInt32LE(f);b.appendUInt16LE(a.filename.length);b.appendArray([0,0,0,0,0,0,0,0,0,0,0,0]);b.appendUInt32LE(c);b.appendString(a.filename);return b}function l(a,b){if(a===c.length)b(null);else{var f=c[a];
void 0!==f.data?l(a+1,b):f.load(function(c){c?b(c):l(a+1,b)})}}function t(a,f){l(0,function(p){if(p)f(p);else{p=new core.ByteArrayWriter("utf8");var g,q,l,e=[0];for(g=0;g<c.length;g+=1)p.appendByteArrayWriter(k(c[g])),e.push(p.getLength());l=p.getLength();for(g=0;g<c.length;g+=1)q=c[g],p.appendByteArrayWriter(b(q,e[g]));g=p.getLength()-l;p.appendArray([80,75,5,6,0,0,0,0]);p.appendUInt16LE(c.length);p.appendUInt16LE(c.length);p.appendUInt32LE(g);p.appendUInt32LE(l);p.appendArray([0,0]);a(p.getByteArray())}})}
function v(a,c){t(function(b){runtime.writeFile(a,b,c)},c)}var c,q,g,p=(new core.RawInflate).inflate,f=this,y=new core.Base64;this.load=e;this.save=function(a,b,f,p){var g,q;for(g=0;g<c.length;g+=1)if(q=c[g],q.filename===a){q.set(a,b,f,p);return}q=new h(d);q.set(a,b,f,p);c.push(q)};this.write=function(a){v(d,a)};this.writeAs=v;this.createByteArray=t;this.loadContentXmlAsFragments=function(a,c){f.loadAsString(a,function(a,b){if(a)return c.rootElementReady(a);c.rootElementReady(null,b,!0)})};this.loadAsString=
function(a,c){e(a,function(a,b){if(a||null===b)return c(a,null);var f=runtime.byteArrayToString(b,"utf8");c(null,f)})};this.loadAsDOM=function(a,c){f.loadAsString(a,function(a,b){if(a||null===b)c(a,null);else{var f=(new DOMParser).parseFromString(b,"text/xml");c(null,f)}})};this.loadAsDataURL=function(a,c,b){e(a,function(a,f){if(a)return b(a,null);var p=0,g;c||(c=80===f[1]&&78===f[2]&&71===f[3]?"image/png":255===f[0]&&216===f[1]&&255===f[2]?"image/jpeg":71===f[0]&&73===f[1]&&70===f[2]?"image/gif":
"");for(g="data:"+c+";base64,";p<f.length;)g+=y.convertUTF8ArrayToBase64(f.slice(p,Math.min(p+45E3,f.length))),p+=45E3;b(null,g)})};this.getEntries=function(){return c.slice()};q=-1;null===m?c=[]:runtime.getFileSize(d,function(c){q=c;0>q?m("File '"+d+"' cannot be read.",f):runtime.read(d,q-22,22,function(c,b){c||null===m||null===b?m(c,f):a(b,m)})})};
// Input 15
core.CSSUnits=function(){var d={"in":1,cm:2.54,mm:25.4,pt:72,pc:12};this.convert=function(m,n,r){return m*d[r]/d[n]};this.convertMeasure=function(d,n){var r,s;d&&n?(r=parseFloat(d),s=d.replace(r.toString(),""),r=this.convert(r,s,n)):r="";return r.toString()};this.getUnits=function(d){return d.substr(d.length-2,d.length)}};
// Input 16
xmldom.LSSerializerFilter=function(){};
// Input 17
"function"!==typeof Object.create&&(Object.create=function(d){var m=function(){};m.prototype=d;return new m});
xmldom.LSSerializer=function(){function d(d){var h=d||{},a=function(a){var b={},e;for(e in a)a.hasOwnProperty(e)&&(b[a[e]]=e);return b}(d),e=[h],k=[a],b=0;this.push=function(){b+=1;h=e[b]=Object.create(h);a=k[b]=Object.create(a)};this.pop=function(){e[b]=void 0;k[b]=void 0;b-=1;h=e[b];a=k[b]};this.getLocalNamespaceDefinitions=function(){return a};this.getQName=function(b){var e=b.namespaceURI,d=0,c;if(!e)return b.localName;if(c=a[e])return c+":"+b.localName;do{c||!b.prefix?(c="ns"+d,d+=1):c=b.prefix;
if(h[c]===e)break;if(!h[c]){h[c]=e;a[e]=c;break}c=null}while(null===c);return c+":"+b.localName}}function m(d){return d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;")}function n(d,h){var a="",e=r.filter?r.filter.acceptNode(h):1,k;if(1===e&&h.nodeType===Node.ELEMENT_NODE){d.push();k=d.getQName(h);var b,l=h.attributes,t,v,c,q="",g;b="<"+k;t=l.length;for(v=0;v<t;v+=1)c=l.item(v),"http://www.w3.org/2000/xmlns/"!==c.namespaceURI&&(g=r.filter?
r.filter.acceptNode(c):1,1===g&&(g=d.getQName(c),c="string"===typeof c.value?m(c.value):c.value,q+=" "+(g+'="'+c+'"')));t=d.getLocalNamespaceDefinitions();for(v in t)t.hasOwnProperty(v)&&((l=t[v])?"xmlns"!==l&&(b+=" xmlns:"+t[v]+'="'+v+'"'):b+=' xmlns="'+v+'"');a+=b+(q+">")}if(1===e||3===e){for(e=h.firstChild;e;)a+=n(d,e),e=e.nextSibling;h.nodeValue&&(a+=m(h.nodeValue))}k&&(a+="</"+k+">",d.pop());return a}var r=this;this.filter=null;this.writeToString=function(r,h){if(!r)return"";var a=new d(h);return n(a,
r)}};
// Input 18
xmldom.RelaxNGParser=function(){function d(a,l){this.message=function(){l&&(a+=1===l.nodeType?" Element ":" Node ",a+=l.nodeName,l.nodeValue&&(a+=" with value '"+l.nodeValue+"'"),a+=".");return a}}function m(a){if(2>=a.e.length)return a;var l={name:a.name,e:a.e.slice(0,2)};return m({name:a.name,e:[l].concat(a.e.slice(2))})}function n(a){a=a.split(":",2);var l="",d;1===a.length?a=["",a[0]]:l=a[0];for(d in e)e[d]===l&&(a[0]=d);return a}function r(a,l){for(var e=0,d,c,q=a.name;a.e&&e<a.e.length;)if(d=
a.e[e],"ref"===d.name){c=l[d.a.name];if(!c)throw d.a.name+" was not defined.";d=a.e.slice(e+1);a.e=a.e.slice(0,e);a.e=a.e.concat(c.e);a.e=a.e.concat(d)}else e+=1,r(d,l);d=a.e;"choice"!==q||d&&d[1]&&"empty"!==d[1].name||(d&&d[0]&&"empty"!==d[0].name?(d[1]=d[0],d[0]={name:"empty"}):(delete a.e,a.name="empty"));if("group"===q||"interleave"===q)"empty"===d[0].name?"empty"===d[1].name?(delete a.e,a.name="empty"):(q=a.name=d[1].name,a.names=d[1].names,d=a.e=d[1].e):"empty"===d[1].name&&(q=a.name=d[0].name,
a.names=d[0].names,d=a.e=d[0].e);"oneOrMore"===q&&"empty"===d[0].name&&(delete a.e,a.name="empty");if("attribute"===q){c=a.names?a.names.length:0;for(var g,p=a.localnames=[c],f=a.namespaces=[c],e=0;e<c;e+=1)g=n(a.names[e]),f[e]=g[0],p[e]=g[1]}"interleave"===q&&("interleave"===d[0].name?a.e="interleave"===d[1].name?d[0].e.concat(d[1].e):[d[1]].concat(d[0].e):"interleave"===d[1].name&&(a.e=[d[0]].concat(d[1].e)))}function s(a,d){for(var e=0,k;a.e&&e<a.e.length;)k=a.e[e],"elementref"===k.name?(k.id=
k.id||0,a.e[e]=d[k.id]):"element"!==k.name&&s(k,d),e+=1}var h=this,a,e={"http://www.w3.org/XML/1998/namespace":"xml"},k;k=function(a,d,h){var r=[],c,q,g=a.localName,p=[];c=a.attributes;var f=g,y=p,s={},u,x;for(u=0;u<c.length;u+=1)if(x=c.item(u),x.namespaceURI)"http://www.w3.org/2000/xmlns/"===x.namespaceURI&&(e[x.value]=x.localName);else{"name"!==x.localName||"element"!==f&&"attribute"!==f||y.push(x.value);if("name"===x.localName||"combine"===x.localName||"type"===x.localName){var F=x,J;J=x.value;
J=J.replace(/^\s\s*/,"");for(var D=/\s/,O=J.length-1;D.test(J.charAt(O));)O-=1;J=J.slice(0,O+1);F.value=J}s[x.localName]=x.value}c=s;c.combine=c.combine||void 0;a=a.firstChild;f=r;y=p;for(s="";a;){if(a.nodeType===Node.ELEMENT_NODE&&"http://relaxng.org/ns/structure/1.0"===a.namespaceURI){if(u=k(a,d,f))"name"===u.name?y.push(e[u.a.ns]+":"+u.text):"choice"===u.name&&(u.names&&u.names.length)&&(y=y.concat(u.names),delete u.names),f.push(u)}else a.nodeType===Node.TEXT_NODE&&(s+=a.nodeValue);a=a.nextSibling}a=
s;"value"!==g&&"param"!==g&&(a=/^\s*([\s\S]*\S)?\s*$/.exec(a)[1]);"value"===g&&void 0===c.type&&(c.type="token",c.datatypeLibrary="");"attribute"!==g&&"element"!==g||void 0===c.name||(q=n(c.name),r=[{name:"name",text:q[1],a:{ns:q[0]}}].concat(r),delete c.name);"name"===g||"nsName"===g||"value"===g?void 0===c.ns&&(c.ns=""):delete c.ns;"name"===g&&(q=n(a),c.ns=q[0],a=q[1]);1<r.length&&("define"===g||"oneOrMore"===g||"zeroOrMore"===g||"optional"===g||"list"===g||"mixed"===g)&&(r=[{name:"group",e:m({name:"group",
e:r}).e}]);2<r.length&&"element"===g&&(r=[r[0]].concat({name:"group",e:m({name:"group",e:r.slice(1)}).e}));1===r.length&&"attribute"===g&&r.push({name:"text",text:a});1!==r.length||"choice"!==g&&"group"!==g&&"interleave"!==g?2<r.length&&("choice"===g||"group"===g||"interleave"===g)&&(r=m({name:g,e:r}).e):(g=r[0].name,p=r[0].names,c=r[0].a,a=r[0].text,r=r[0].e);"mixed"===g&&(g="interleave",r=[r[0],{name:"text"}]);"optional"===g&&(g="choice",r=[r[0],{name:"empty"}]);"zeroOrMore"===g&&(g="choice",r=
[{name:"oneOrMore",e:[r[0]]},{name:"empty"}]);if("define"===g&&c.combine){a:{f=c.combine;y=c.name;s=r;for(u=0;h&&u<h.length;u+=1)if(x=h[u],"define"===x.name&&x.a&&x.a.name===y){x.e=[{name:f,e:x.e.concat(s)}];h=x;break a}h=null}if(h)return}h={name:g};r&&0<r.length&&(h.e=r);for(q in c)if(c.hasOwnProperty(q)){h.a=c;break}void 0!==a&&(h.text=a);p&&0<p.length&&(h.names=p);"element"===g&&(h.id=d.length,d.push(h),h={name:"elementref",id:h.id});return h};this.parseRelaxNGDOM=function(b,l){var t=[],n=k(b&&
b.documentElement,t,void 0),c,q,g={};for(c=0;c<n.e.length;c+=1)q=n.e[c],"define"===q.name?g[q.a.name]=q:"start"===q.name&&(a=q);if(!a)return[new d("No Relax NG start element was found.")];r(a,g);for(c in g)g.hasOwnProperty(c)&&r(g[c],g);for(c=0;c<t.length;c+=1)r(t[c],g);l&&(h.rootPattern=l(a.e[0],t));s(a,t);for(c=0;c<t.length;c+=1)s(t[c],t);h.start=a;h.elements=t;h.nsmap=e;return null}};
// Input 19
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG=function(){function d(a){return function(){var c;return function(){void 0===c&&(c=a());return c}}()}function m(a,c){return function(){var b={},f=0;return function(p){var g=p.hash||p.toString(),q;q=b[g];if(void 0!==q)return q;b[g]=q=c(p);q.hash=a+f.toString();f+=1;return q}}()}function n(a){return function(){var c={};return function(b){var f,p;p=c[b.localName];if(void 0===p)c[b.localName]=p={};else if(f=p[b.namespaceURI],void 0!==f)return f;return p[b.namespaceURI]=f=a(b)}}()}function r(a,
c,b){return function(){var f={},p=0;return function(g,q){var d=c&&c(g,q),e,l;if(void 0!==d)return d;d=g.hash||g.toString();e=q.hash||q.toString();l=f[d];if(void 0===l)f[d]=l={};else if(d=l[e],void 0!==d)return d;l[e]=d=b(g,q);d.hash=a+p.toString();p+=1;return d}}()}function s(a,c){"choice"===c.p1.type?s(a,c.p1):a[c.p1.hash]=c.p1;"choice"===c.p2.type?s(a,c.p2):a[c.p2.hash]=c.p2}function h(a,b){return{type:"element",nc:a,nullable:!1,textDeriv:function(){return u},startTagOpenDeriv:function(f){return a.contains(f)?
c(b,x):u},attDeriv:function(a,c){return u},startTagCloseDeriv:function(){return this}}}function a(){return{type:"list",nullable:!1,hash:"list",textDeriv:function(a,c){return x}}}function e(a,c,f,p){if(c===u)return u;if(p>=f.length)return c;0===p&&(p=0);for(var g=f.item(p);g.namespaceURI===b;){p+=1;if(p>=f.length)return c;g=f.item(p)}return g=e(a,c.attDeriv(a,f.item(p)),f,p+1)}function k(a,c,b){b.e[0].a?(a.push(b.e[0].text),c.push(b.e[0].a.ns)):k(a,c,b.e[0]);b.e[1].a?(a.push(b.e[1].text),c.push(b.e[1].a.ns)):
k(a,c,b.e[1])}var b="http://www.w3.org/2000/xmlns/",l,t,v,c,q,g,p,f,y,w,u={type:"notAllowed",nullable:!1,hash:"notAllowed",textDeriv:function(){return u},startTagOpenDeriv:function(){return u},attDeriv:function(){return u},startTagCloseDeriv:function(){return u},endTagDeriv:function(){return u}},x={type:"empty",nullable:!0,hash:"empty",textDeriv:function(){return u},startTagOpenDeriv:function(){return u},attDeriv:function(a,c){return u},startTagCloseDeriv:function(){return x},endTagDeriv:function(){return u}},
F={type:"text",nullable:!0,hash:"text",textDeriv:function(){return F},startTagOpenDeriv:function(){return u},attDeriv:function(){return u},startTagCloseDeriv:function(){return F},endTagDeriv:function(){return u}},J,D,O;l=r("choice",function(a,c){if(a===u)return c;if(c===u||a===c)return a},function(a,c){var b={},f;s(b,{p1:a,p2:c});c=a=void 0;for(f in b)b.hasOwnProperty(f)&&(void 0===a?a=b[f]:c=void 0===c?b[f]:l(c,b[f]));return function(a,c){return{type:"choice",p1:a,p2:c,nullable:a.nullable||c.nullable,
textDeriv:function(b,f){return l(a.textDeriv(b,f),c.textDeriv(b,f))},startTagOpenDeriv:n(function(b){return l(a.startTagOpenDeriv(b),c.startTagOpenDeriv(b))}),attDeriv:function(b,f){return l(a.attDeriv(b,f),c.attDeriv(b,f))},startTagCloseDeriv:d(function(){return l(a.startTagCloseDeriv(),c.startTagCloseDeriv())}),endTagDeriv:d(function(){return l(a.endTagDeriv(),c.endTagDeriv())})}}(a,c)});t=function(a,c,b){return function(){var f={},p=0;return function(g,q){var d=c&&c(g,q),e,l;if(void 0!==d)return d;
d=g.hash||g.toString();e=q.hash||q.toString();d<e&&(l=d,d=e,e=l,l=g,g=q,q=l);l=f[d];if(void 0===l)f[d]=l={};else if(d=l[e],void 0!==d)return d;l[e]=d=b(g,q);d.hash=a+p.toString();p+=1;return d}}()}("interleave",function(a,c){if(a===u||c===u)return u;if(a===x)return c;if(c===x)return a},function(a,c){return{type:"interleave",p1:a,p2:c,nullable:a.nullable&&c.nullable,textDeriv:function(b,f){return l(t(a.textDeriv(b,f),c),t(a,c.textDeriv(b,f)))},startTagOpenDeriv:n(function(b){return l(J(function(a){return t(a,
c)},a.startTagOpenDeriv(b)),J(function(c){return t(a,c)},c.startTagOpenDeriv(b)))}),attDeriv:function(b,f){return l(t(a.attDeriv(b,f),c),t(a,c.attDeriv(b,f)))},startTagCloseDeriv:d(function(){return t(a.startTagCloseDeriv(),c.startTagCloseDeriv())})}});v=r("group",function(a,c){if(a===u||c===u)return u;if(a===x)return c;if(c===x)return a},function(a,c){return{type:"group",p1:a,p2:c,nullable:a.nullable&&c.nullable,textDeriv:function(b,f){var p=v(a.textDeriv(b,f),c);return a.nullable?l(p,c.textDeriv(b,
f)):p},startTagOpenDeriv:function(b){var f=J(function(a){return v(a,c)},a.startTagOpenDeriv(b));return a.nullable?l(f,c.startTagOpenDeriv(b)):f},attDeriv:function(b,f){return l(v(a.attDeriv(b,f),c),v(a,c.attDeriv(b,f)))},startTagCloseDeriv:d(function(){return v(a.startTagCloseDeriv(),c.startTagCloseDeriv())})}});c=r("after",function(a,c){if(a===u||c===u)return u},function(a,b){return{type:"after",p1:a,p2:b,nullable:!1,textDeriv:function(f,p){return c(a.textDeriv(f,p),b)},startTagOpenDeriv:n(function(f){return J(function(a){return c(a,
b)},a.startTagOpenDeriv(f))}),attDeriv:function(f,p){return c(a.attDeriv(f,p),b)},startTagCloseDeriv:d(function(){return c(a.startTagCloseDeriv(),b)}),endTagDeriv:d(function(){return a.nullable?b:u})}});q=m("oneormore",function(a){return a===u?u:{type:"oneOrMore",p:a,nullable:a.nullable,textDeriv:function(c,b){return v(a.textDeriv(c,b),l(this,x))},startTagOpenDeriv:function(c){var b=this;return J(function(a){return v(a,l(b,x))},a.startTagOpenDeriv(c))},attDeriv:function(c,b){return v(a.attDeriv(c,
b),l(this,x))},startTagCloseDeriv:d(function(){return q(a.startTagCloseDeriv())})}});p=r("attribute",void 0,function(a,c){return{type:"attribute",nullable:!1,nc:a,p:c,attDeriv:function(b,f){return a.contains(f)&&(c.nullable&&/^\s+$/.test(f.nodeValue)||c.textDeriv(b,f.nodeValue).nullable)?x:u},startTagCloseDeriv:function(){return u}}});g=m("value",function(a){return{type:"value",nullable:!1,value:a,textDeriv:function(c,b){return b===a?x:u},attDeriv:function(){return u},startTagCloseDeriv:function(){return this}}});
y=m("data",function(a){return{type:"data",nullable:!1,dataType:a,textDeriv:function(){return x},attDeriv:function(){return u},startTagCloseDeriv:function(){return this}}});J=function K(a,b){return"after"===b.type?c(b.p1,a(b.p2)):"choice"===b.type?l(K(a,b.p1),K(a,b.p2)):b};D=function(a,c,b){var f=b.currentNode;c=c.startTagOpenDeriv(f);c=e(a,c,f.attributes,0);var p=c=c.startTagCloseDeriv(),f=b.currentNode;c=b.firstChild();for(var g=[],q;c;)c.nodeType===Node.ELEMENT_NODE?g.push(c):c.nodeType!==Node.TEXT_NODE||
/^\s*$/.test(c.nodeValue)||g.push(c.nodeValue),c=b.nextSibling();0===g.length&&(g=[""]);q=p;for(p=0;q!==u&&p<g.length;p+=1)c=g[p],"string"===typeof c?q=/^\s*$/.test(c)?l(q,q.textDeriv(a,c)):q.textDeriv(a,c):(b.currentNode=c,q=D(a,q,b));b.currentNode=f;return c=q.endTagDeriv()};f=function(a){var c,b,f;if("name"===a.name)c=a.text,b=a.a.ns,a={name:c,ns:b,hash:"{"+b+"}"+c,contains:function(a){return a.namespaceURI===b&&a.localName===c}};else if("choice"===a.name){c=[];b=[];k(c,b,a);a="";for(f=0;f<c.length;f+=
1)a+="{"+b[f]+"}"+c[f]+",";a={hash:a,contains:function(a){var f;for(f=0;f<c.length;f+=1)if(c[f]===a.localName&&b[f]===a.namespaceURI)return!0;return!1}}}else a={hash:"anyName",contains:function(){return!0}};return a};w=function G(c,b){var d,e;if("elementref"===c.name){d=c.id||0;c=b[d];if(void 0!==c.name){var k=c;d=b[k.id]={hash:"element"+k.id.toString()};k=h(f(k.e[0]),w(k.e[1],b));for(e in k)k.hasOwnProperty(e)&&(d[e]=k[e]);return d}return c}switch(c.name){case "empty":return x;case "notAllowed":return u;
case "text":return F;case "choice":return l(G(c.e[0],b),G(c.e[1],b));case "interleave":d=G(c.e[0],b);for(e=1;e<c.e.length;e+=1)d=t(d,G(c.e[e],b));return d;case "group":return v(G(c.e[0],b),G(c.e[1],b));case "oneOrMore":return q(G(c.e[0],b));case "attribute":return p(f(c.e[0]),G(c.e[1],b));case "value":return g(c.text);case "data":return d=c.a&&c.a.type,void 0===d&&(d=""),y(d);case "list":return a()}throw"No support for "+c.name;};this.makePattern=function(a,c){var b={},f;for(f in c)c.hasOwnProperty(f)&&
(b[f]=c[f]);return f=w(a,b)};this.validate=function(a,c){var b;a.currentNode=a.root;b=D(null,O,a);b.nullable?c(null):(runtime.log("Error in Relax NG validation: "+b),c(["Error in Relax NG validation: "+b]))};this.init=function(a){O=a}};
// Input 20
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG2=function(){function d(a,d){this.message=function(){d&&(a+=d.nodeType===Node.ELEMENT_NODE?" Element ":" Node ",a+=d.nodeName,d.nodeValue&&(a+=" with value '"+d.nodeValue+"'"),a+=".");return a}}function m(a,d,k,b){return"empty"===a.name?null:s(a,d,k,b)}function n(a,e,k){if(2!==a.e.length)throw"Element with wrong # of elements: "+a.e.length;for(var b=(k=e.currentNode)?k.nodeType:0,l=null;b>Node.ELEMENT_NODE;){if(b!==Node.COMMENT_NODE&&(b!==Node.TEXT_NODE||!/^\s+$/.test(e.currentNode.nodeValue)))return[new d("Not allowed node of type "+
b+".")];b=(k=e.nextSibling())?k.nodeType:0}if(!k)return[new d("Missing element "+a.names)];if(a.names&&-1===a.names.indexOf(h[k.namespaceURI]+":"+k.localName))return[new d("Found "+k.nodeName+" instead of "+a.names+".",k)];if(e.firstChild()){for(l=m(a.e[1],e,k);e.nextSibling();)if(b=e.currentNode.nodeType,!(e.currentNode&&e.currentNode.nodeType===Node.TEXT_NODE&&/^\s+$/.test(e.currentNode.nodeValue)||b===Node.COMMENT_NODE))return[new d("Spurious content.",e.currentNode)];if(e.parentNode()!==k)return[new d("Implementation error.")]}else l=
m(a.e[1],e,k);e.nextSibling();return l}var r,s,h;s=function(a,e,k,b){var l=a.name,h=null;if("text"===l)a:{for(var r=(a=e.currentNode)?a.nodeType:0;a!==k&&3!==r;){if(1===r){h=[new d("Element not allowed here.",a)];break a}r=(a=e.nextSibling())?a.nodeType:0}e.nextSibling();h=null}else if("data"===l)h=null;else if("value"===l)b!==a.text&&(h=[new d("Wrong value, should be '"+a.text+"', not '"+b+"'",k)]);else if("list"===l)h=null;else if("attribute"===l)a:{if(2!==a.e.length)throw"Attribute with wrong # of elements: "+
a.e.length;l=a.localnames.length;for(h=0;h<l;h+=1){b=k.getAttributeNS(a.namespaces[h],a.localnames[h]);""!==b||k.hasAttributeNS(a.namespaces[h],a.localnames[h])||(b=void 0);if(void 0!==r&&void 0!==b){h=[new d("Attribute defined too often.",k)];break a}r=b}h=void 0===r?[new d("Attribute not found: "+a.names,k)]:m(a.e[1],e,k,r)}else if("element"===l)h=n(a,e,k);else if("oneOrMore"===l){b=0;do r=e.currentNode,l=s(a.e[0],e,k),b+=1;while(!l&&r!==e.currentNode);1<b?(e.currentNode=r,h=null):h=l}else if("choice"===
l){if(2!==a.e.length)throw"Choice with wrong # of options: "+a.e.length;r=e.currentNode;if("empty"===a.e[0].name){if(l=s(a.e[1],e,k,b))e.currentNode=r;h=null}else{if(l=m(a.e[0],e,k,b))e.currentNode=r,l=s(a.e[1],e,k,b);h=l}}else if("group"===l){if(2!==a.e.length)throw"Group with wrong # of members: "+a.e.length;h=s(a.e[0],e,k)||s(a.e[1],e,k)}else if("interleave"===l)a:{r=a.e.length;b=[r];for(var c=r,q,g,p,f;0<c;){q=0;g=e.currentNode;for(h=0;h<r;h+=1)p=e.currentNode,!0!==b[h]&&b[h]!==p&&(f=a.e[h],(l=
s(f,e,k))?(e.currentNode=p,void 0===b[h]&&(b[h]=!1)):p===e.currentNode||"oneOrMore"===f.name||"choice"===f.name&&("oneOrMore"===f.e[0].name||"oneOrMore"===f.e[1].name)?(q+=1,b[h]=p):(q+=1,b[h]=!0));if(g===e.currentNode&&q===c){h=null;break a}if(0===q){for(h=0;h<r;h+=1)if(!1===b[h]){h=[new d("Interleave does not match.",k)];break a}h=null;break a}for(h=c=0;h<r;h+=1)!0!==b[h]&&(c+=1)}h=null}else throw l+" not allowed in nonEmptyPattern.";return h};this.validate=function(a,d){a.currentNode=a.root;var h=
m(r.e[0],a,a.root);d(h)};this.init=function(a,d){r=a;h=d}};
// Input 21
xmldom.OperationalTransformInterface=function(){};xmldom.OperationalTransformInterface.prototype.retain=function(d){};xmldom.OperationalTransformInterface.prototype.insertCharacters=function(d){};xmldom.OperationalTransformInterface.prototype.insertElementStart=function(d,m){};xmldom.OperationalTransformInterface.prototype.insertElementEnd=function(){};xmldom.OperationalTransformInterface.prototype.deleteCharacters=function(d){};xmldom.OperationalTransformInterface.prototype.deleteElementStart=function(){};
xmldom.OperationalTransformInterface.prototype.deleteElementEnd=function(){};xmldom.OperationalTransformInterface.prototype.replaceAttributes=function(d){};xmldom.OperationalTransformInterface.prototype.updateAttributes=function(d){};
// Input 22
xmldom.OperationalTransformDOM=function(d,m){this.retain=function(d){};this.insertCharacters=function(d){};this.insertElementStart=function(d,r){};this.insertElementEnd=function(){};this.deleteCharacters=function(d){};this.deleteElementStart=function(){};this.deleteElementEnd=function(){};this.replaceAttributes=function(d){};this.updateAttributes=function(d){};this.atEnd=function(){return!0}};
// Input 23
xmldom.XPathIterator=function(){};
xmldom.XPath=function(){function d(a,b,c){return-1!==a&&(a<b||-1===b)&&(a<c||-1===c)}function m(a){for(var b=[],c=0,q=a.length,g;c<q;){var p=a,f=q,e=b,h="",k=[],r=p.indexOf("[",c),n=p.indexOf("/",c),m=p.indexOf("=",c);d(n,r,m)?(h=p.substring(c,n),c=n+1):d(r,n,m)?(h=p.substring(c,r),c=l(p,r,k)):d(m,n,r)?(h=p.substring(c,m),c=m):(h=p.substring(c,f),c=f);e.push({location:h,predicates:k});if(c<q&&"="===a[c]){g=a.substring(c+1,q);if(2<g.length&&("'"===g[0]||'"'===g[0]))g=g.slice(1,g.length-1);else try{g=
parseInt(g,10)}catch(s){}c=q}}return{steps:b,value:g}}function n(){var a,b=!1;this.setNode=function(c){a=c};this.reset=function(){b=!1};this.next=function(){var c=b?null:a;b=!0;return c}}function r(a,b,c){this.reset=function(){a.reset()};this.next=function(){for(var q=a.next();q&&!(q=q.getAttributeNodeNS(b,c));)q=a.next();return q}}function s(a,b){var c=a.next(),q=null;this.reset=function(){a.reset();c=a.next();q=null};this.next=function(){for(;c;){if(q)if(b&&q.firstChild)q=q.firstChild;else{for(;!q.nextSibling&&
q!==c;)q=q.parentNode;q===c?c=a.next():q=q.nextSibling}else{do(q=c.firstChild)||(c=a.next());while(c&&!q)}if(q&&q.nodeType===Node.ELEMENT_NODE)return q}return null}}function h(a,b){this.reset=function(){a.reset()};this.next=function(){for(var c=a.next();c&&!b(c);)c=a.next();return c}}function a(a,b,c){b=b.split(":",2);var q=c(b[0]),g=b[1];return new h(a,function(a){return a.localName===g&&a.namespaceURI===q})}function e(a,d,c){var q=new n,g=b(q,d,c),p=d.value;return void 0===p?new h(a,function(a){q.setNode(a);
g.reset();return g.next()}):new h(a,function(a){q.setNode(a);g.reset();return(a=g.next())&&a.nodeValue===p})}function k(a,d,c){var q=a.ownerDocument,g=[],p=null;if(q&&q.evaluate)for(c=q.evaluate(d,a,c,XPathResult.UNORDERED_NODE_ITERATOR_TYPE,null),p=c.iterateNext();null!==p;)p.nodeType===Node.ELEMENT_NODE&&g.push(p),p=c.iterateNext();else{g=new n;g.setNode(a);a=m(d);g=b(g,a,c);a=[];for(c=g.next();c;)a.push(c),c=g.next();g=a}return g}var b,l;l=function(a,b,c){for(var q=b,g=a.length,p=0;q<g;)"]"===
a[q]?(p-=1,0>=p&&c.push(m(a.substring(b,q)))):"["===a[q]&&(0>=p&&(b=q+1),p+=1),q+=1;return q};xmldom.XPathIterator.prototype.next=function(){};xmldom.XPathIterator.prototype.reset=function(){};b=function(b,d,c){var q,g,p,f;for(q=0;q<d.steps.length;q+=1)for(p=d.steps[q],g=p.location,""===g?b=new s(b,!1):"@"===g[0]?(f=g.slice(1).split(":",2),b=new r(b,c(f[0]),f[1])):"."!==g&&(b=new s(b,!1),-1!==g.indexOf(":")&&(b=a(b,g,c))),g=0;g<p.predicates.length;g+=1)f=p.predicates[g],b=e(b,f,c);return b};xmldom.XPath=
function(){this.getODFElementsWithXPath=k};return xmldom.XPath}();
// Input 24
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
odf.Namespaces=function(){function d(d){return m[d]||null}var m={draw:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",fo:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",office:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",presentation:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",style:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svg:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",table:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",text:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},n;d.lookupNamespaceURI=d;n=function(){};n.forEachPrefix=function(d){for(var n in m)m.hasOwnProperty(n)&&d(n,m[n])};n.resolvePrefix=d;n.namespaceMap=m;n.drawns="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0";n.fons="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0";n.officens="urn:oasis:names:tc:opendocument:xmlns:office:1.0";n.presentationns="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0";n.stylens=
"urn:oasis:names:tc:opendocument:xmlns:style:1.0";n.svgns="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0";n.tablens="urn:oasis:names:tc:opendocument:xmlns:table:1.0";n.textns="urn:oasis:names:tc:opendocument:xmlns:text:1.0";n.xlinkns="http://www.w3.org/1999/xlink";n.xmlns="http://www.w3.org/XML/1998/namespace";return n}();
// Input 25
runtime.loadClass("xmldom.XPath");
odf.StyleInfo=function(){function d(a,c){for(var b=v[a.localName],f=b&&b[a.namespaceURI],e=f?f.length:0,h,b=0;b<e;b+=1)(h=a.getAttributeNS(f[b].ns,f[b].localname))&&a.setAttributeNS(f[b].ns,l[f[b].ns]+f[b].localname,c+h);for(b=a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&(f=b,d(f,c)),b=b.nextSibling}function m(a,c){for(var b=v[a.localName],f=b&&b[a.namespaceURI],d=f?f.length:0,e,b=0;b<d;b+=1)if(e=a.getAttributeNS(f[b].ns,f[b].localname))e=e.replace(c,""),a.setAttributeNS(f[b].ns,l[f[b].ns]+f[b].localname,
e);for(b=a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&(f=b,m(f,c)),b=b.nextSibling}function n(a,c){var b=v[a.localName],f=(b=b&&b[a.namespaceURI])?b.length:0,d,e,l;for(l=0;l<f;l+=1)if(d=a.getAttributeNS(b[l].ns,b[l].localname))c=c||{},e=b[l].keyname,e=c[e]=c[e]||{},e[d]=1;return c}function r(a,c){var b,f;n(a,c);for(b=a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&(f=b,r(f,c)),b=b.nextSibling}function s(a,c,b){this.key=a;this.name=c;this.family=b;this.requires={}}function h(a,c,b){var f=a+'"'+
c,d=b[f];d||(d=b[f]=new s(f,a,c));return d}function a(c,g,p){var f=v[c.localName],d=(f=f&&f[c.namespaceURI])?f.length:0,e=c.getAttributeNS(b,"name"),l=c.getAttributeNS(b,"family"),k;e&&l&&(g=h(e,l,p));if(g)for(e=0;e<d;e+=1)if(l=c.getAttributeNS(f[e].ns,f[e].localname))k=f[e].keyname,l=h(l,k,p),g.requires[l.key]=l;for(e=c.firstChild;e;)e.nodeType===Node.ELEMENT_NODE&&(c=e,a(c,g,p)),e=e.nextSibling;return p}function e(a,c){var b=c[a.family];b||(b=c[a.family]={});b[a.name]=1;Object.keys(a.requires).forEach(function(b){e(a.requires[b],
c)})}function k(c,b){var p=a(c,null,{});Object.keys(p).forEach(function(a){a=p[a];var c=b[a.family];c&&c.hasOwnProperty(a.name)&&e(a,b)})}var b="urn:oasis:names:tc:opendocument:xmlns:style:1.0",l={"urn:oasis:names:tc:opendocument:xmlns:chart:1.0":"chart:","urn:oasis:names:tc:opendocument:xmlns:database:1.0":"db:","urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0":"dr3d:","urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":"draw:","urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0":"fo:","urn:oasis:names:tc:opendocument:xmlns:form:1.0":"form:",
"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0":"number:","urn:oasis:names:tc:opendocument:xmlns:office:1.0":"office:","urn:oasis:names:tc:opendocument:xmlns:presentation:1.0":"presentation:","urn:oasis:names:tc:opendocument:xmlns:style:1.0":"style:","urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0":"svg:","urn:oasis:names:tc:opendocument:xmlns:table:1.0":"table:","urn:oasis:names:tc:opendocument:xmlns:text:1.0":"chart:","http://www.w3.org/XML/1998/namespace":"xml:"},t={text:[{ens:b,
en:"tab-stop",ans:b,a:"leader-text-style"},{ens:b,en:"drop-cap",ans:b,a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"citation-body-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"citation-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"a",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"linenumbering-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-level-style-number",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"ruby-text",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"span",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"a",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"visited-style-name"},{ens:b,en:"text-properties",ans:b,a:"text-line-through-text-style"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index-source",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"main-entry-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-bibliography",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-chapter",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-link-end",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-link-start",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-page-number",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-span",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"index-entry-tab-stop",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-text",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-title-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-level-style-bullet",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"outline-level-style",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"}],paragraph:[{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",a:"text-style-name"},{ens:b,en:"style",ans:b,a:"next-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"body",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"first-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"default-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"alphabetical-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"bibliography-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"h",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"illustration-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-source-style",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"object-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"p",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"table-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-of-content-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-index-entry-template",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:b,en:"page-layout-properties",ans:b,a:"register-truth-ref-style-name"}],chart:[{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"axis",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"chart",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"data-label",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"data-point",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"equation",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"error-indicator",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"floor",
ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"footer",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"grid",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"legend",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
en:"mean-value",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"plot-area",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"regression-curve",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"series",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-gain-marker",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-loss-marker",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-range-line",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"subtitle",
ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"title",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"wall",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"}],section:[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"bibliography",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"illustration-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-title",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"object-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"section",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-of-content",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"}],ruby:[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"ruby",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"}],table:[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"query",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"table-representation",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"background",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],"table-column":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"}],"table-row":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"query",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-row-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"table-representation",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-row-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],"table-cell":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",
en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"body",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"covered-table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"covered-table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],graphic:[{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"cube",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"extrude",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"rotate",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"scene",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"sphere",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"g",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page-thumbnail",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"}],presentation:[{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"cube",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"extrude",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"rotate",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"scene",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"sphere",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"g",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page-thumbnail",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"}],"drawing-page":[{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
en:"notes",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:b,en:"handout-master",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:b,en:"master-page",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"}],"list-style":[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"numbered-paragraph",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-item",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-override"},{ens:b,en:"style",ans:b,a:"list-style-name"},{ens:b,en:"style",ans:b,a:"data-style-name"},{ens:b,en:"style",ans:b,a:"percentage-data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"date-time-decl",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"creation-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"database-display",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"editing-duration",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"expression",
ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"meta-field",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-time",ans:b,
a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-formula",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-defined",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-get",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-input",ans:b,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-get",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-input",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-set",ans:b,a:"data-style-name"}],data:[{ens:b,en:"style",ans:b,a:"data-style-name"},{ens:b,en:"style",ans:b,a:"percentage-data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"date-time-decl",ans:b,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"database-display",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"editing-duration",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"expression",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"meta-field",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-date",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-time",
ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-formula",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"time",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-defined",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-get",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-input",ans:b,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-get",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-input",ans:b,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-set",ans:b,a:"data-style-name"}],"page-layout":[{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"notes",ans:b,a:"page-layout-name"},{ens:b,en:"handout-master",ans:b,a:"page-layout-name"},{ens:b,en:"master-page",ans:b,
a:"page-layout-name"}]},v,c=new xmldom.XPath;this.UsedStyleList=function(a,c){var p={};this.uses=function(a){var c=a.localName,g=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name")||a.getAttributeNS(b,"name");a="style"===c?a.getAttributeNS(b,"family"):"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"===a.namespaceURI?"data":c;return(a=p[a])?0<a[g]:!1};r(a,p);c&&k(c,p)};this.canElementHaveStyle=function(a,c){var b=v[c.localName],b=b&&b[c.namespaceURI];return 0<(b?b.length:
0)};this.hasDerivedStyles=function(a,b,p){var f=b("style"),d=p.getAttributeNS(f,"name");p=p.getAttributeNS(f,"family");return c.getODFElementsWithXPath(a,"//style:*[@style:parent-style-name='"+d+"'][@style:family='"+p+"']",b).length?!0:!1};this.prefixStyleNames=function(a,c,p){var f;if(a){for(f=a.firstChild;f;){if(f.nodeType===Node.ELEMENT_NODE){var e=f,h=c,k=e.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name"),n=void 0;k?n="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":
(k=e.getAttributeNS(b,"name"))&&(n=b);n&&e.setAttributeNS(n,l[n]+"name",h+k)}f=f.nextSibling}d(a,c);p&&d(p,c)}};this.removePrefixFromStyleNames=function(a,c,p){var f=RegExp("^"+c);if(a){for(c=a.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE){var d=c,e=f,h=d.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name"),k=void 0;h?k="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":(h=d.getAttributeNS(b,"name"))&&(k=b);k&&(h=h.replace(e,""),d.setAttributeNS(k,l[k]+"name",h))}c=c.nextSibling}m(a,
f);p&&m(p,f)}};this.determineStylesForNode=n;v=function(a){var c,b,f,d,e,l={},h;for(c in a)if(a.hasOwnProperty(c))for(d=a[c],f=d.length,b=0;b<f;b+=1)e=d[b],h=l[e.en]=l[e.en]||{},h=h[e.ens]=h[e.ens]||[],h.push({ns:e.ans,localname:e.a,keyname:c});return l}(t)};
// Input 26
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
odf.OdfUtils=function(){function d(a){var c=a&&a.localName;return("p"===c||"h"===c)&&a.namespaceURI===q}function m(a){return/^[ \t\r\n]+$/.test(a)}function n(a){var c=a&&a.localName;return("span"===c||"p"===c||"h"===c)&&a.namespaceURI===q}function r(a){var c=a&&a.localName,b,p=!1;c&&(b=a.namespaceURI,b===q?p="s"===c||"tab"===c||"line-break"===c:b===g&&(p="frame"===c&&"as-char"===a.getAttributeNS(q,"anchor-type")));return p}function s(a){for(;null!==a.firstChild&&n(a);)a=a.firstChild;return a}function h(a){for(;null!==
a.lastChild&&n(a);)a=a.lastChild;return a}function a(a){for(;!d(a)&&null===a.previousSibling;)a=a.parentNode;return d(a)?null:h(a.previousSibling)}function e(a){for(;!d(a)&&null===a.nextSibling;)a=a.parentNode;return d(a)?null:s(a.nextSibling)}function k(c){for(var b=!1;c;)if(c.nodeType===Node.TEXT_NODE)if(0===c.length)c=a(c);else return!m(c.data.substr(c.length-1,1));else if(r(c)){b=!0;break}else c=a(c);return b}function b(c){var b=!1;for(c=c&&h(c);c;){if(c.nodeType===Node.TEXT_NODE&&0<c.length&&
!m(c.data)){b=!0;break}else if(r(c)){b=!0;break}c=a(c)}return b}function l(a){var c=!1;for(a=a&&s(a);a;){if(a.nodeType===Node.TEXT_NODE&&0<a.length&&!m(a.data)){c=!0;break}else if(r(a)){c=!0;break}a=e(a)}return c}function t(a,c){return m(a.data.substr(c))?!l(e(a)):!1}function v(a){return(a=/-?([0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px)|(%))/.exec(a))?{value:parseFloat(a[1]),unit:a[3]}:null}function c(a){return(a=v(a))&&"%"!==a.unit?null:a}
var q="urn:oasis:names:tc:opendocument:xmlns:text:1.0",g="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",p=/^\s*$/;this.isParagraph=d;this.isListItem=function(a){return"list-item"===(a&&a.localName)&&a.namespaceURI===q};this.isODFWhitespace=m;this.isGroupingElement=n;this.isCharacterElement=r;this.firstChild=s;this.lastChild=h;this.previousNode=a;this.nextNode=e;this.scanLeftForNonWhitespace=k;this.lookLeftForCharacter=function(c){var b;b=0;c.nodeType===Node.TEXT_NODE&&0<c.length?(b=c.data,b=
m(b.substr(b.length-1,1))?1===b.length?k(a(c))?2:0:m(b.substr(b.length-2,1))?0:2:1):r(c)&&(b=1);return b};this.lookRightForCharacter=function(a){var c=!1;a&&a.nodeType===Node.TEXT_NODE&&0<a.length?c=!m(a.data.substr(0,1)):r(a)&&(c=!0);return c};this.scanLeftForAnyCharacter=b;this.scanRightForAnyCharacter=l;this.isTrailingWhitespace=t;this.isSignificantWhitespace=function(c,p){var g=c.data,d;if(!m(g[p]))return!1;if(0<p){if(!m(g[p-1]))return!0;if(1<p)if(!m(g[p-2]))d=!0;else{if(!m(g.substr(0,p)))return!1}else k(a(c))&&
(d=!0);if(!0===d)return t(c,p)?!1:!0;g=g[p+1];return m(g)?!1:b(a(c))?!1:!0}return!1};this.getFirstNonWhitespaceChild=function(a){for(a=a.firstChild;a&&a.nodeType===Node.TEXT_NODE&&p.test(a.nodeValue);)a=a.nextSibling;return a};this.parseLength=v;this.parseFoFontSize=function(a){var b;b=(b=v(a))&&(0>=b.value||"%"===b.unit)?null:b;return b||c(a)};this.parseFoLineHeight=function(a){var b;b=(b=v(a))&&(0>b.value||"%"===b.unit)?null:b;return b||c(a)};this.getTextNodes=function(a,c){var b=a.startContainer.ownerDocument,
p=b.createRange(),g=[],d;d=b.createTreeWalker(a.commonAncestorContainer.nodeType===Node.TEXT_NODE?a.commonAncestorContainer.parentNode:a.commonAncestorContainer,NodeFilter.SHOW_ALL,function(b){p.selectNodeContents(b);if(!1===c&&b.nodeType===Node.TEXT_NODE){if(0>=a.compareBoundaryPoints(a.START_TO_START,p)&&0<=a.compareBoundaryPoints(a.END_TO_END,p))return NodeFilter.FILTER_ACCEPT}else if(-1===a.compareBoundaryPoints(a.END_TO_START,p)&&1===a.compareBoundaryPoints(a.START_TO_END,p))return b.nodeType===
Node.TEXT_NODE?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_REJECT},!1);d.currentNode=a.startContainer.previousSibling||a.startContainer.parentNode;for(b=d.nextNode();b;)g.push(b),b=d.nextNode();p.detach();return g}};
// Input 27
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.LoopWatchDog");runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");
odf.TextStyleApplicator=function(d,m){function n(a){function b(a,c){return"object"===typeof a&&"object"===typeof c?Object.keys(a).every(function(f){return b(a[f],c[f])}):a===c}this.isStyleApplied=function(g){g=d.getAppliedStylesForElement(g);return b(a,g)}}function r(a){var b={};this.applyStyleToContainer=function(g){var p;p=g.getAttributeNS(l,"style-name");var f=g.ownerDocument;p=p||"";if(!b.hasOwnProperty(p)){var e=p,h=p,k;h?(k=d.getStyleElement(h,"text"),k.parentNode===m?f=k.cloneNode(!0):(f=f.createElementNS(t,
"style:style"),f.setAttributeNS(t,"style:parent-style-name",h),f.setAttributeNS(t,"style:family","text"),f.setAttributeNS(v,"scope","document-content"))):(f=f.createElementNS(t,"style:style"),f.setAttributeNS(t,"style:family","text"),f.setAttributeNS(v,"scope","document-content"));d.updateStyle(f,a,!0);m.appendChild(f);b[e]=f}p=b[p].getAttributeNS(t,"name");g.setAttributeNS(l,"text:style-name",p)}}function s(a,b){var g=b.ownerDocument.createRange(),p=b.nodeType===Node.TEXT_NODE?b.length:b.childNodes.length;
g.setStart(a.startContainer,a.startOffset);g.setEnd(a.endContainer,a.endOffset);p=0===g.comparePoint(b,0)&&0===g.comparePoint(b,p);g.detach();return p}function h(a){var b;0!==a.endOffset&&(a.endContainer.nodeType===Node.TEXT_NODE&&a.endOffset!==a.endContainer.length)&&(k.push(a.endContainer.splitText(a.endOffset)),k.push(a.endContainer));0!==a.startOffset&&(a.startContainer.nodeType===Node.TEXT_NODE&&a.startOffset!==a.startContainer.length)&&(b=a.startContainer.splitText(a.startOffset),k.push(a.startContainer),
k.push(b),a.setStart(b,0))}function a(a,b){if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a.parentNode.removeChild(a);else if(b.nodeType===Node.TEXT_NODE)return b.insertData(0,a.data),a.parentNode.removeChild(a),b;return a}function e(c){c.nextSibling&&(c=a(c,c.nextSibling));c.previousSibling&&a(c.previousSibling,c)}var k,b=new odf.OdfUtils,l=odf.Namespaces.textns,t=odf.Namespaces.stylens,v="urn:webodf:names:scope";this.applyStyle=function(a,d){var g,p,f,m,t;g={};var u;runtime.assert(Boolean(d["style:text-properties"]),
"applyStyle without any text properties");g["style:text-properties"]=d["style:text-properties"];m=new r(g);t=new n(g);k=[];h(a);g=b.getTextNodes(a,!1);u={startContainer:a.startContainer,startOffset:a.startOffset,endContainer:a.endContainer,endOffset:a.endOffset};g.forEach(function(a){p=t.isStyleApplied(a);if(!1===p){var c=a.ownerDocument,g=a.parentNode,d,e=a,h=new core.LoopWatchDog(1E3);b.isParagraph(g)?(c=c.createElementNS(l,"text:span"),g.insertBefore(c,a),d=!1):(a.previousSibling&&!s(u,a.previousSibling)?
(c=g.cloneNode(!1),g.parentNode.insertBefore(c,g.nextSibling)):c=g,d=!0);for(;e&&(e===a||s(u,e));)h.check(),g=e.nextSibling,e.parentNode!==c&&c.appendChild(e),e=g;if(e&&d)for(a=c.cloneNode(!1),c.parentNode.insertBefore(a,c.nextSibling);e;)h.check(),g=e.nextSibling,a.appendChild(e),e=g;f=c;m.applyStyleToContainer(f)}});k.forEach(e);k=null}};
// Input 28
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");runtime.loadClass("xmldom.XPath");runtime.loadClass("core.CSSUnits");
odf.Style2CSS=function(){function d(a){var c={},b,f;if(!a)return c;for(a=a.firstChild;a;){if(f=a.namespaceURI!==q||"style"!==a.localName&&"default-style"!==a.localName?a.namespaceURI===p&&"list-style"===a.localName?"list":a.namespaceURI!==q||"page-layout"!==a.localName&&"default-page-layout"!==a.localName?void 0:"page":a.getAttributeNS(q,"family"))(b=a.getAttributeNS&&a.getAttributeNS(q,"name"))||(b=""),f=c[f]=c[f]||{},f[b]=a;a=a.nextSibling}return c}function m(a,c){if(!c||!a)return null;if(a[c])return a[c];
var b,f;for(b in a)if(a.hasOwnProperty(b)&&(f=m(a[b].derivedStyles,c)))return f;return null}function n(a,c,b){var f=c[a],g,p;f&&(g=f.getAttributeNS(q,"parent-style-name"),p=null,g&&(p=m(b,g),!p&&c[g]&&(n(g,c,b),p=c[g],c[g]=null)),p?(p.derivedStyles||(p.derivedStyles={}),p.derivedStyles[a]=f):b[a]=f)}function r(a,c){for(var b in a)a.hasOwnProperty(b)&&(n(b,a,c),a[b]=null)}function s(a,c){var b=w[a],f;if(null===b)return null;f=c?"["+b+'|style-name="'+c+'"]':"["+b+"|style-name]";"presentation"===b&&
(b="draw",f=c?'[presentation|style-name="'+c+'"]':"[presentation|style-name]");return b+"|"+u[a].join(f+","+b+"|")+f}function h(a,c,b){var f=[],p,g;f.push(s(a,c));for(p in b.derivedStyles)if(b.derivedStyles.hasOwnProperty(p))for(g in c=h(a,p,b.derivedStyles[p]),c)c.hasOwnProperty(g)&&f.push(c[g]);return f}function a(a,c,b){if(!a)return null;for(a=a.firstChild;a;){if(a.namespaceURI===c&&a.localName===b)return c=a;a=a.nextSibling}return null}function e(a,c){var b="",f,p;for(f in c)c.hasOwnProperty(f)&&
(f=c[f],(p=a.getAttributeNS(f[0],f[1]))&&(b+=f[2]+":"+p+";"));return b}function k(b){return(b=a(b,q,"text-properties"))?V.parseFoFontSize(b.getAttributeNS(c,"font-size")):null}function b(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,c,b,f){return c+c+b+b+f+f});return(a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a))?{r:parseInt(a[1],16),g:parseInt(a[2],16),b:parseInt(a[3],16)}:null}function l(a,c,b,f){c='text|list[text|style-name="'+c+'"]';var g=b.getAttributeNS(p,"level"),d;b=
V.getFirstNonWhitespaceChild(b);b=V.getFirstNonWhitespaceChild(b);var e;b&&(d=b.attributes,e=d["fo:text-indent"]?d["fo:text-indent"].value:void 0,d=d["fo:margin-left"]?d["fo:margin-left"].value:void 0);e||(e="-0.6cm");b="-"===e.charAt(0)?e.substring(1):"-"+e;for(g=g&&parseInt(g,10);1<g;)c+=" > text|list-item > text|list",g-=1;g=c+" > text|list-item > *:not(text|list):first-child";void 0!==d&&(d=g+"{margin-left:"+d+";}",a.insertRule(d,a.cssRules.length));f=c+" > text|list-item > *:not(text|list):first-child:before{"+
f+";";f+="counter-increment:list;";f+="margin-left:"+e+";";f+="width:"+b+";";f+="display:inline-block}";try{a.insertRule(f,a.cssRules.length)}catch(l){throw l;}}function t(g,d,n,r){if("list"===d)for(var m=r.firstChild,s,u;m;){if(m.namespaceURI===p)if(s=m,"list-level-style-number"===m.localName){var w=s;u=w.getAttributeNS(q,"num-format");var C=w.getAttributeNS(q,"num-suffix"),A={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},w=w.getAttributeNS(q,"num-prefix")||"",w=A.hasOwnProperty(u)?
w+(" counter(list, "+A[u]+")"):u?w+("'"+u+"';"):w+" ''";C&&(w+=" '"+C+"'");u="content: "+w+";";l(g,n,s,u)}else"list-level-style-image"===m.localName?(u="content: none;",l(g,n,s,u)):"list-level-style-bullet"===m.localName&&(u="content: '"+s.getAttributeNS(p,"bullet-char")+"';",l(g,n,s,u));m=m.nextSibling}else if("page"===d)if(C=s=n="",m=r.getElementsByTagNameNS(q,"page-layout-properties")[0],s=m.parentNode.parentNode.parentNode.masterStyles,C="",n+=e(m,I),u=m.getElementsByTagNameNS(q,"background-image"),
0<u.length&&(C=u.item(0).getAttributeNS(f,"href"))&&(n+="background-image: url('odfkit:"+C+"');",u=u.item(0),n+=e(u,F)),"presentation"===aa){if(s)for(u=s.getElementsByTagNameNS(q,"master-page"),A=0;A<u.length;A+=1)if(u[A].getAttributeNS(q,"page-layout-name")===m.parentNode.getAttributeNS(q,"name")){C=u[A].getAttributeNS(q,"name");s="draw|page[draw|master-page-name="+C+"] {"+n+"}";C="office|body, draw|page[draw|master-page-name="+C+"] {"+e(m,X)+" }";try{g.insertRule(s,g.cssRules.length),g.insertRule(C,
g.cssRules.length)}catch(ba){throw ba;}}}else{if("text"===aa){s="office|text {"+n+"}";C="office|body {width: "+m.getAttributeNS(c,"page-width")+";}";try{g.insertRule(s,g.cssRules.length),g.insertRule(C,g.cssRules.length)}catch(ea){throw ea;}}}else{n=h(d,n,r).join(",");m="";if(s=a(r,q,"text-properties")){var A=s,S;u=S="";C=1;s=""+e(A,x);w=A.getAttributeNS(q,"text-underline-style");"solid"===w&&(S+=" underline");w=A.getAttributeNS(q,"text-line-through-style");"solid"===w&&(S+=" line-through");S.length&&
(s+="text-decoration:"+S+";");if(S=A.getAttributeNS(q,"font-name")||A.getAttributeNS(c,"font-family"))w=$[S],s+="font-family: "+(w||S)+", sans-serif;";w=A.parentNode;if(A=k(w)){for(;w;){if(A=k(w))if("%"!==A.unit){u="font-size: "+A.value*C+A.unit+";";break}else C*=A.value/100;A=w;S=w="";w=null;"default-style"===A.localName?w=null:(w=A.getAttributeNS(q,"parent-style-name"),S=A.getAttributeNS(q,"family"),w=T.getODFElementsWithXPath(Q,w?"//style:*[@style:name='"+w+"'][@style:family='"+S+"']":"//style:default-style[@style:family='"+
S+"']",odf.Namespaces.resolvePrefix)[0])}u||(u="font-size: "+parseFloat(H)*C+U.getUnits(H)+";");s+=u}m+=s}if(s=a(r,q,"paragraph-properties"))u=s,s=""+e(u,J),C=u.getElementsByTagNameNS(q,"background-image"),0<C.length&&(A=C.item(0).getAttributeNS(f,"href"))&&(s+="background-image: url('odfkit:"+A+"');",C=C.item(0),s+=e(C,F)),(u=u.getAttributeNS(c,"line-height"))&&"normal"!==u&&(u=V.parseFoLineHeight(u),s="%"!==u.unit?s+("line-height: "+u.value+";"):s+("line-height: "+u.value/100+";")),m+=s;if(s=a(r,
q,"graphic-properties"))A=s,s=""+e(A,D),u=A.getAttributeNS(v,"opacity"),C=A.getAttributeNS(v,"fill"),A=A.getAttributeNS(v,"fill-color"),"solid"===C||"hatch"===C?A&&"none"!==A?(u=isNaN(parseFloat(u))?1:parseFloat(u)/100,(A=b(A))&&(s+="background-color: rgba("+A.r+","+A.g+","+A.b+","+u+");")):s+="background: none;":"none"===C&&(s+="background: none;"),m+=s;if(s=a(r,q,"drawing-page-properties"))u=""+e(s,D),"true"===s.getAttributeNS(y,"background-visible")&&(u+="background: none;"),m+=u;if(s=a(r,q,"table-cell-properties"))s=
""+e(s,O),m+=s;if(s=a(r,q,"table-row-properties"))s=""+e(s,K),m+=s;if(s=a(r,q,"table-column-properties"))s=""+e(s,B),m+=s;if(s=a(r,q,"table-properties"))s=""+e(s,G),m+=s;if(0!==m.length)try{g.insertRule(n+"{"+m+"}",g.cssRules.length)}catch(fa){throw fa;}}for(var Y in r.derivedStyles)r.derivedStyles.hasOwnProperty(Y)&&t(g,d,Y,r.derivedStyles[Y])}var v=odf.Namespaces.drawns,c=odf.Namespaces.fons,q=odf.Namespaces.stylens,g=odf.Namespaces.svgns,p=odf.Namespaces.textns,f=odf.Namespaces.xlinkns,y=odf.Namespaces.presentationns,
w={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"},u={graphic:"circle connected control custom-shape ellipse frame g line measure page page-thumbnail path polygon polyline rect regular-polygon".split(" "),paragraph:"alphabetical-index-entry-template h illustration-index-entry-template index-source-style object-index-entry-template p table-index-entry-template table-of-content-entry-template user-index-entry-template".split(" "),
presentation:"caption circle connector control custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),"drawing-page":"caption circle connector control page custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),ruby:["ruby","ruby-text"],section:"alphabetical-index bibliography illustration-index index-title object-index section table-of-content table-index user-index".split(" "),table:["background",
"table"],"table-cell":"body covered-table-cell even-columns even-rows first-column first-row last-column last-row odd-columns odd-rows table-cell".split(" "),"table-column":["table-column"],"table-row":["table-row"],text:"a index-entry-chapter index-entry-link-end index-entry-link-start index-entry-page-number index-entry-span index-entry-tab-stop index-entry-text index-title-template linenumbering-configuration list-level-style-number list-level-style-bullet outline-level-style span".split(" "),
list:["list-item"]},x=[[c,"color","color"],[c,"background-color","background-color"],[c,"font-weight","font-weight"],[c,"font-style","font-style"]],F=[[q,"repeat","background-repeat"]],J=[[c,"background-color","background-color"],[c,"text-align","text-align"],[c,"text-indent","text-indent"],[c,"padding","padding"],[c,"padding-left","padding-left"],[c,"padding-right","padding-right"],[c,"padding-top","padding-top"],[c,"padding-bottom","padding-bottom"],[c,"border-left","border-left"],[c,"border-right",
"border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"margin","margin"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"],[c,"border","border"]],D=[[c,"background-color","background-color"],[c,"min-height","min-height"],[v,"stroke","border"],[g,"stroke-color","border-color"],[g,"stroke-width","border-width"]],O=[[c,"background-color","background-color"],[c,"border-left","border-left"],
[c,"border-right","border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"border","border"]],B=[[q,"column-width","width"]],K=[[q,"row-height","height"],[c,"keep-together",null]],G=[[q,"width","width"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"]],I=[[c,"background-color","background-color"],[c,"padding","padding"],[c,"padding-left","padding-left"],[c,"padding-right","padding-right"],
[c,"padding-top","padding-top"],[c,"padding-bottom","padding-bottom"],[c,"border","border"],[c,"border-left","border-left"],[c,"border-right","border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"margin","margin"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"]],X=[[c,"page-width","width"],[c,"page-height","height"]],$={},V=new odf.OdfUtils,aa,Q,H,T=new xmldom.XPath,U=new core.CSSUnits;
this.style2css=function(a,c,b,f,g){for(var p,e,l,h;c.cssRules.length;)c.deleteRule(c.cssRules.length-1);p=null;f&&(p=f.ownerDocument,Q=f.parentNode);g&&(p=g.ownerDocument,Q=g.parentNode);if(p)for(h in odf.Namespaces.forEachPrefix(function(a,b){l="@namespace "+a+" url("+b+");";try{c.insertRule(l,c.cssRules.length)}catch(f){}}),$=b,aa=a,H=window.getComputedStyle(document.body,null).getPropertyValue("font-size")||"12pt",a=d(f),f=d(g),g={},w)if(w.hasOwnProperty(h))for(e in b=g[h]={},r(a[h],b),r(f[h],
b),b)b.hasOwnProperty(e)&&t(c,h,e,b[e])}};
// Input 29
runtime.loadClass("core.Base64");runtime.loadClass("core.Zip");runtime.loadClass("xmldom.LSSerializer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.Namespaces");
odf.OdfContainer=function(){function d(a,c,b){for(a=a?a.firstChild:null;a;){if(a.localName===b&&a.namespaceURI===c)return a;a=a.nextSibling}return null}function m(a){var c,b=t.length;for(c=0;c<b;c+=1)if(a.namespaceURI===k&&a.localName===t[c])return c;return-1}function n(a,c){var b;a&&(b=new e.UsedStyleList(a,c));this.acceptNode=function(a){return"http://www.w3.org/1999/xhtml"===a.namespaceURI?3:a.namespaceURI&&a.namespaceURI.match(/^urn:webodf:/)?2:b&&a.parentNode===c&&a.nodeType===Node.ELEMENT_NODE?
b.uses(a)?1:2:1}}function r(a,c){if(c){var b=m(c),f,d=a.firstChild;if(-1!==b){for(;d;){f=m(d);if(-1!==f&&f>b)break;d=d.nextSibling}a.insertBefore(c,d)}}}function s(a){this.OdfContainer=a}function h(a,c,b,f){var d=this;this.size=0;this.type=null;this.name=a;this.container=b;this.onchange=this.onreadystatechange=this.document=this.mimetype=this.url=null;this.EMPTY=0;this.LOADING=1;this.DONE=2;this.state=this.EMPTY;this.load=function(){null!==f&&(this.mimetype=c,f.loadAsDataURL(a,c,function(a,c){a&&
runtime.log(a);d.url=c;if(d.onchange)d.onchange(d);if(d.onstatereadychange)d.onstatereadychange(d)}))};this.abort=function(){}}function a(a){this.length=0;this.item=function(a){}}var e=new odf.StyleInfo,k="urn:oasis:names:tc:opendocument:xmlns:office:1.0",b="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",l="urn:webodf:names:scope",t="meta settings scripts font-face-decls styles automatic-styles master-styles body".split(" "),v=(new Date).getTime()+"_webodf_",c=new core.Base64;s.prototype=new function(){};
s.prototype.constructor=s;s.namespaceURI=k;s.localName="document";h.prototype.load=function(){};h.prototype.getUrl=function(){return this.data?"data:;base64,"+c.toBase64(this.data):null};odf.OdfContainer=function g(c,f){function m(a){for(var c=a.firstChild,b;c;)b=c.nextSibling,c.nodeType===Node.ELEMENT_NODE?m(c):c.nodeType===Node.PROCESSING_INSTRUCTION_NODE&&a.removeChild(c),c=b}function t(a,c){for(var b=a&&a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&b.setAttributeNS(l,"scope",c),b=b.nextSibling}
function u(a,c){var b=null,f,g,d;if(a)for(b=a.cloneNode(!0),f=b.firstChild;f;)g=f.nextSibling,f.nodeType===Node.ELEMENT_NODE&&(d=f.getAttributeNS(l,"scope"))&&d!==c&&b.removeChild(f),f=g;return b}function x(a){var c=z.rootElement.ownerDocument,b;if(a){m(a.documentElement);try{b=c.importNode(a.documentElement,!0)}catch(f){}}return b}function F(a){z.state=a;if(z.onchange)z.onchange(z);if(z.onstatereadychange)z.onstatereadychange(z)}function J(a){a=x(a);var c=z.rootElement;a&&"document-styles"===a.localName&&
a.namespaceURI===k?(c.fontFaceDecls=d(a,k,"font-face-decls"),r(c,c.fontFaceDecls),c.styles=d(a,k,"styles"),r(c,c.styles),c.automaticStyles=d(a,k,"automatic-styles"),t(c.automaticStyles,"document-styles"),r(c,c.automaticStyles),c.masterStyles=d(a,k,"master-styles"),r(c,c.masterStyles),e.prefixStyleNames(c.automaticStyles,v,c.masterStyles)):F(g.INVALID)}function D(a){a=x(a);var c,b,f;if(a&&"document-content"===a.localName&&a.namespaceURI===k){c=z.rootElement;b=d(a,k,"font-face-decls");if(c.fontFaceDecls&&
b)for(f=b.firstChild;f;)c.fontFaceDecls.appendChild(f),f=b.firstChild;else b&&(c.fontFaceDecls=b,r(c,b));b=d(a,k,"automatic-styles");t(b,"document-content");if(c.automaticStyles&&b)for(f=b.firstChild;f;)c.automaticStyles.appendChild(f),f=b.firstChild;else b&&(c.automaticStyles=b,r(c,b));c.body=d(a,k,"body");r(c,c.body)}else F(g.INVALID)}function O(a){a=x(a);var c;a&&("document-meta"===a.localName&&a.namespaceURI===k)&&(c=z.rootElement,c.meta=d(a,k,"meta"),r(c,c.meta))}function B(a){a=x(a);var c;a&&
("document-settings"===a.localName&&a.namespaceURI===k)&&(c=z.rootElement,c.settings=d(a,k,"settings"),r(c,c.settings))}function K(a,c){P.loadAsDOM(a,c)}function G(){K("styles.xml",function(a,c){J(c);z.state!==g.INVALID&&K("content.xml",function(a,c){D(c);z.state!==g.INVALID&&K("meta.xml",function(a,c){O(c);z.state!==g.INVALID&&K("settings.xml",function(a,c){c&&B(c);K("META-INF/manifest.xml",function(a,c){if(c){var f=x(c),d;if(f&&"manifest"===f.localName&&f.namespaceURI===b)for(d=z.rootElement,d.manifest=
f,f=d.manifest.firstChild;f;)f.nodeType===Node.ELEMENT_NODE&&("file-entry"===f.localName&&f.namespaceURI===b)&&(N[f.getAttributeNS(b,"full-path")]=f.getAttributeNS(b,"media-type")),f=f.nextSibling}z.state!==g.INVALID&&F(g.DONE)})})})})})}function I(a){var c="";odf.Namespaces.forEachPrefix(function(a,b){c+=" xmlns:"+a+'="'+b+'"'});return'<?xml version="1.0" encoding="UTF-8"?><office:'+a+" "+c+' office:version="1.2">'}function X(){var a=new xmldom.LSSerializer,c=I("document-meta");a.filter=new n;c+=
a.writeToString(z.rootElement.meta,odf.Namespaces.namespaceMap);return c+"</office:document-meta>"}function $(a,c){var f=document.createElementNS(b,"manifest:file-entry");f.setAttributeNS(b,"manifest:full-path",a);f.setAttributeNS(b,"manifest:media-type",c);return f}function V(){var a=runtime.parseXML('<manifest:manifest xmlns:manifest="'+b+'"></manifest:manifest>'),c=d(a,b,"manifest"),f=new xmldom.LSSerializer,g;for(g in N)N.hasOwnProperty(g)&&c.appendChild($(g,N[g]));f.filter=new n;return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
f.writeToString(a,odf.Namespaces.namespaceMap)}function aa(){var a=new xmldom.LSSerializer,c=I("document-settings");a.filter=new n;c+=a.writeToString(z.rootElement.settings,odf.Namespaces.namespaceMap);return c+"</office:document-settings>"}function Q(){var a=odf.Namespaces.namespaceMap,c=new xmldom.LSSerializer,b=u(z.rootElement.automaticStyles,"document-styles"),f=z.rootElement.masterStyles&&z.rootElement.masterStyles.cloneNode(!0),g=I("document-styles");e.removePrefixFromStyleNames(b,v,f);c.filter=
new n(f,b);g+=c.writeToString(z.rootElement.fontFaceDecls,a);g+=c.writeToString(z.rootElement.styles,a);g+=c.writeToString(b,a);g+=c.writeToString(f,a);return g+"</office:document-styles>"}function H(){var a=odf.Namespaces.namespaceMap,c=new xmldom.LSSerializer,b=u(z.rootElement.automaticStyles,"document-content"),f=I("document-content");c.filter=new n(z.rootElement.body,b);f+=c.writeToString(b,a);f+=c.writeToString(z.rootElement.body,a);return f+"</office:document-content>"}function T(a,c){runtime.loadXML(a,
function(a,b){if(a)c(a);else{var f=x(b);f&&"document"===f.localName&&f.namespaceURI===k?(z.rootElement=f,f.fontFaceDecls=d(f,k,"font-face-decls"),f.styles=d(f,k,"styles"),f.automaticStyles=d(f,k,"automatic-styles"),f.masterStyles=d(f,k,"master-styles"),f.body=d(f,k,"body"),f.meta=d(f,k,"meta"),F(g.DONE)):F(g.INVALID)}})}function U(){function a(c,b){var g;b||(b=c);g=document.createElementNS(k,b);f[c]=g;f.appendChild(g)}var c=new core.Zip("",null),b=runtime.byteArrayFromString("application/vnd.oasis.opendocument.text",
"utf8"),f=z.rootElement,d=document.createElementNS(k,"text");c.save("mimetype",b,!1,new Date);a("meta");a("settings");a("scripts");a("fontFaceDecls","font-face-decls");a("styles");a("automaticStyles","automatic-styles");a("masterStyles","master-styles");a("body");f.body.appendChild(d);F(g.DONE);return c}function L(){var a,c=new Date;a=runtime.byteArrayFromString(aa(),"utf8");P.save("settings.xml",a,!0,c);a=runtime.byteArrayFromString(X(),"utf8");P.save("meta.xml",a,!0,c);a=runtime.byteArrayFromString(Q(),
"utf8");P.save("styles.xml",a,!0,c);a=runtime.byteArrayFromString(H(),"utf8");P.save("content.xml",a,!0,c);a=runtime.byteArrayFromString(V(),"utf8");P.save("META-INF/manifest.xml",a,!0,c)}function M(a,c){L();P.writeAs(a,function(a){c(a)})}var z=this,P,N={};this.onstatereadychange=f;this.parts=this.rootElement=this.state=this.onchange=null;this.getContentElement=function(){var a=z.rootElement.body;return a.getElementsByTagNameNS(k,"text")[0]||a.getElementsByTagNameNS(k,"presentation")[0]||a.getElementsByTagNameNS(k,
"spreadsheet")[0]};this.getDocumentType=function(){var a=z.getContentElement();return a&&a.localName};this.getPart=function(a){return new h(a,N[a],z,P)};this.getPartData=function(a,c){P.load(a,c)};this.createByteArray=function(a,c){L();P.createByteArray(a,c)};this.saveAs=M;this.save=function(a){M(c,a)};this.getUrl=function(){return c};this.state=g.LOADING;this.rootElement=function(a){var c=document.createElementNS(a.namespaceURI,a.localName),b;a=new a;for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b]);return c}(s);
this.parts=new a(this);P=c?new core.Zip(c,function(a,b){P=b;a?T(c,function(c){a&&(P.error=a+"\n"+c,F(g.INVALID))}):G()}):U()};odf.OdfContainer.EMPTY=0;odf.OdfContainer.LOADING=1;odf.OdfContainer.DONE=2;odf.OdfContainer.INVALID=3;odf.OdfContainer.SAVING=4;odf.OdfContainer.MODIFIED=5;odf.OdfContainer.getContainer=function(a){return new odf.OdfContainer(a,null)};return odf.OdfContainer}();
// Input 30
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.Base64");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.OdfContainer");
odf.FontLoader=function(){function d(n,h,a,e,k){var b,l=0,m;for(m in n)if(n.hasOwnProperty(m)){if(l===a){b=m;break}l+=1}if(!b)return k();h.getPartData(n[b].href,function(l,c){if(l)runtime.log(l);else{var q="@font-face { font-family: '"+(n[b].family||b)+"'; src: url(data:application/x-font-ttf;charset=binary;base64,"+r.convertUTF8ArrayToBase64(c)+') format("truetype"); }';try{e.insertRule(q,e.cssRules.length)}catch(g){runtime.log("Problem inserting rule in CSS: "+runtime.toJson(g)+"\nRule: "+q)}}d(n,
h,a+1,e,k)})}function m(n,h,a){d(n,h,0,a,function(){})}var n=new xmldom.XPath,r=new core.Base64;odf.FontLoader=function(){this.loadFonts=function(d,h){for(var a=d.rootElement.fontFaceDecls;h.cssRules.length;)h.deleteRule(h.cssRules.length-1);if(a){var e={},k,b,l,r;if(a)for(a=n.getODFElementsWithXPath(a,"style:font-face[svg:font-face-src]",odf.Namespaces.resolvePrefix),k=0;k<a.length;k+=1)b=a[k],l=b.getAttributeNS(odf.Namespaces.stylens,"name"),r=b.getAttributeNS(odf.Namespaces.svgns,"font-family"),
b=n.getODFElementsWithXPath(b,"svg:font-face-src/svg:font-face-uri",odf.Namespaces.resolvePrefix),0<b.length&&(b=b[0].getAttributeNS(odf.Namespaces.xlinkns,"href"),e[l]={href:b,family:r});m(e,d,h)}}};return odf.FontLoader}();
// Input 31
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.TextStyleApplicator");
odf.Formatting=function(){function d(a,c){Object.keys(c).forEach(function(b){try{a[b]=c[b].constructor===Object?d(a[b],c[b]):c[b]}catch(e){a[b]=c[b]}});return a}function m(a,d,f){var e;f=f||[b.rootElement.automaticStyles,b.rootElement.styles];for(e=f.shift();e;){for(e=e.firstChild;e;){if(e.nodeType===Node.ELEMENT_NODE&&(e.namespaceURI===v&&"style"===e.localName&&e.getAttributeNS(v,"family")===d&&e.getAttributeNS(v,"name")===a||"list-style"===d&&e.namespaceURI===c&&"list-style"===e.localName&&e.getAttributeNS(v,
"name")===a))return e;e=e.nextSibling}e=f.shift()}return null}function n(a){for(var c={},b=a.firstChild;b;){if(b.nodeType===Node.ELEMENT_NODE&&b.namespaceURI===v)for(c[b.nodeName]={},a=0;a<b.attributes.length;a+=1)c[b.nodeName][b.attributes[a].name]=b.attributes[a].value;b=b.nextSibling}return c}function r(a,c){Object.keys(c).forEach(function(b){var d=b.split(":"),e=d[1],l=odf.Namespaces.resolvePrefix(d[0]),d=c[b];"object"===typeof d&&Object.keys(d).length?(b=a.getElementsByTagNameNS(l,e)[0]||a.ownerDocument.createElementNS(l,
b),a.appendChild(b),r(b,d)):a.setAttributeNS(l,b,d)})}function s(a){var c=b.rootElement.styles,f;f={};for(var e={},l=a;l;)f=n(l),e=d(f,e),l=(f=l.getAttributeNS(v,"parent-style-name"))?m(f,a.getAttributeNS(v,"family"),[c]):null;a:{a=a.getAttributeNS(v,"family");for(c=b.rootElement.styles.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE&&c.namespaceURI===v&&"default-style"===c.localName&&c.getAttributeNS(v,"family")===a){l=c;break a}c=c.nextSibling}l=null}l&&(f=n(l),e=d(f,e));return e}function h(a,
c){for(var b=a.nodeType===Node.TEXT_NODE?a.parentNode:a,d,e=[],h="",k=!1;b;)!k&&q.isGroupingElement(b)&&(k=!0),(d=l.determineStylesForNode(b))&&e.push(d),b=b.parentNode;k&&(e.forEach(function(a){Object.keys(a).forEach(function(c){Object.keys(a[c]).forEach(function(a){h+="|"+c+":"+a+"|"})})}),c&&(c[h]=e));return k?e:void 0}function a(a){var c={orderedStyles:[]};a.forEach(function(a){Object.keys(a).forEach(function(b){var g=Object.keys(a[b])[0],e,l;e=m(g,b);l=s(e);c=d(l,c);c.orderedStyles.push({name:g,
family:b,displayName:e.getAttributeNS(v,"display-name")})})});return c}function e(){var a,d=[];[b.rootElement.automaticStyles,b.rootElement.styles].forEach(function(b){for(a=b.firstChild;a;)a.nodeType===Node.ELEMENT_NODE&&(a.namespaceURI===v&&"style"===a.localName||a.namespaceURI===c&&"list-style"===a.localName)&&d.push(a.getAttributeNS(v,"name")),a=a.nextSibling});return d}var k=this,b,l=new odf.StyleInfo,t=odf.Namespaces.svgns,v=odf.Namespaces.stylens,c=odf.Namespaces.textns,q=new odf.OdfUtils;
this.setOdfContainer=function(a){b=a};this.getFontMap=function(){for(var a=b.rootElement.fontFaceDecls,c={},f,d,a=a&&a.firstChild;a;)a.nodeType===Node.ELEMENT_NODE&&(f=a.getAttributeNS(v,"name"))&&((d=a.getAttributeNS(t,"font-family"))||a.getElementsByTagNameNS(t,"font-face-uri")[0])&&(c[f]=d),a=a.nextSibling;return c};this.getAvailableParagraphStyles=function(){for(var a=b.rootElement.styles&&b.rootElement.styles.firstChild,c,f,d=[];a;)a.nodeType===Node.ELEMENT_NODE&&("style"===a.localName&&a.namespaceURI===
v)&&(f=a,c=f.getAttributeNS(v,"family"),"paragraph"===c&&(c=f.getAttributeNS(v,"name"),f=f.getAttributeNS(v,"display-name")||c,c&&f&&d.push({name:c,displayName:f}))),a=a.nextSibling;return d};this.isStyleUsed=function(a){var c;c=l.hasDerivedStyles(b.rootElement,odf.Namespaces.resolvePrefix,a);a=(new l.UsedStyleList(b.rootElement.styles)).uses(a)||(new l.UsedStyleList(b.rootElement.automaticStyles)).uses(a)||(new l.UsedStyleList(b.rootElement.body)).uses(a);return c||a};this.getStyleElement=m;this.getStyleAttributes=
n;this.getInheritedStyleAttributes=s;this.getFirstNamedParentStyleNameOrSelf=function(a){for(var c=b.rootElement.automaticStyles,f=b.rootElement.styles,d;null!==(d=m(a,"paragraph",[c]));)a=d.getAttributeNS(v,"parent-style-name");return(d=m(a,"paragraph",[f]))?a:null};this.hasParagraphStyle=function(a){return Boolean(m(a,"paragraph"))};this.getAppliedStyles=function(c){var b={},f=[];q.getTextNodes(c).forEach(function(a){h(a,b)});Object.keys(b).forEach(function(c){f.push(a(b[c]))});return f};this.getAppliedStylesForElement=
function(c){return(c=h(c))?a(c):void 0};this.applyStyle=function(a,c){(new odf.TextStyleApplicator(k,b.rootElement.automaticStyles)).applyStyle(a,c)};this.updateStyle=function(a,c,b){var d;r(a,c);c=a.getAttributeNS(v,"name");if(b||!c){b=e();d=Math.floor(1E8*Math.random());do c="auto"+d,d+=1;while(-1!==b.indexOf(c));a.setAttributeNS(v,"style:name",c)}}};
// Input 32
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.Formatting");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.FontLoader");runtime.loadClass("odf.Style2CSS");runtime.loadClass("odf.OdfUtils");
odf.OdfCanvas=function(){function d(){function a(f){b=!0;runtime.setTimeout(function(){try{f()}catch(d){runtime.log(d)}b=!1;0<c.length&&a(c.pop())},10)}var c=[],b=!1;this.clearQueue=function(){c.length=0};this.addToQueue=function(f){if(0===c.length&&!b)return a(f);c.push(f)}}function m(a){function c(){for(;0<b.cssRules.length;)b.deleteRule(0);b.insertRule("#shadowContent draw|page {display:none;}",0);b.insertRule("office|presentation draw|page {display:none;}",1);b.insertRule("#shadowContent draw|page:nth-of-type("+
f+") {display:block;}",2);b.insertRule("office|presentation draw|page:nth-of-type("+f+") {display:block;}",3)}var b=a.sheet,f=1;this.showFirstPage=function(){f=1;c()};this.showNextPage=function(){f+=1;c()};this.showPreviousPage=function(){1<f&&(f-=1,c())};this.showPage=function(a){0<a&&(f=a,c())};this.css=a}function n(a,c,b){a.addEventListener?a.addEventListener(c,b,!1):a.attachEvent?a.attachEvent("on"+c,b):a["on"+c]=b}function r(a){function c(a,b){for(;b;){if(b===a)return!0;b=b.parentNode}return!1}
function b(){var e=[],g=runtime.getWindow().getSelection(),p,l;for(p=0;p<g.rangeCount;p+=1)l=g.getRangeAt(p),null!==l&&(c(a,l.startContainer)&&c(a,l.endContainer))&&e.push(l);if(e.length===f.length){for(g=0;g<e.length&&(p=e[g],l=f[g],p=p===l?!1:null===p||null===l?!0:p.startContainer!==l.startContainer||p.startOffset!==l.startOffset||p.endContainer!==l.endContainer||p.endOffset!==l.endOffset,!p);g+=1);if(g===e.length)return}f=e;var g=[e.length],h,q=a.ownerDocument;for(p=0;p<e.length;p+=1)l=e[p],h=
q.createRange(),h.setStart(l.startContainer,l.startOffset),h.setEnd(l.endContainer,l.endOffset),g[p]=h;f=g;g=d.length;for(e=0;e<g;e+=1)d[e](a,f)}var f=[],d=[];this.addListener=function(a,c){var b,f=d.length;for(b=0;b<f;b+=1)if(d[b]===c)return;d.push(c)};n(a,"mouseup",b);n(a,"keyup",b);n(a,"keydown",b)}function s(a,c,b){(new odf.Style2CSS).style2css(a.getDocumentType(),b.sheet,c.getFontMap(),a.rootElement.styles,a.rootElement.automaticStyles)}function h(a,b,d,e){d.setAttribute("styleid",b);var g,l=
d.getAttributeNS(w,"anchor-type"),k=d.getAttributeNS(f,"x"),n=d.getAttributeNS(f,"y"),r=d.getAttributeNS(f,"width"),m=d.getAttributeNS(f,"height"),s=d.getAttributeNS(q,"min-height"),t=d.getAttributeNS(q,"min-width"),u=d.getAttributeNS(c,"master-page-name"),y=null,v,x;v=0;var D,J=a.rootElement.ownerDocument;if(u){y=a.rootElement.masterStyles.getElementsByTagNameNS(p,"master-page");v=null;for(x=0;x<y.length;x+=1)if(y[x].getAttributeNS(p,"name")===u){v=y[x];break}y=v}else y=null;if(y){u=J.createElementNS(c,
"draw:page");D=y.firstChild;for(v=0;D;)"true"!==D.getAttributeNS(F,"placeholder")&&(x=D.cloneNode(!0),u.appendChild(x),h(a,b+"_"+v,x,e)),D=D.nextSibling,v+=1;B.appendChild(u);v=B.getElementsByTagNameNS(c,"page").length;if(x=u.getElementsByTagNameNS(w,"page-number")[0]){for(;x.firstChild;)x.removeChild(x.firstChild);x.appendChild(J.createTextNode(v))}h(a,b,u,e);u.setAttributeNS(c,"draw:master-page-name",y.getAttributeNS(p,"name"))}if("as-char"===l)g="display: inline-block;";else if(l||k||n)g="position: absolute;";
else if(r||m||s||t)g="display: block;";k&&(g+="left: "+k+";");n&&(g+="top: "+n+";");r&&(g+="width: "+r+";");m&&(g+="height: "+m+";");s&&(g+="min-height: "+s+";");t&&(g+="min-width: "+t+";");g&&(g="draw|"+d.localName+'[styleid="'+b+'"] {'+g+"}",e.insertRule(g,e.cssRules.length))}function a(a){for(a=a.firstChild;a;){if(a.namespaceURI===g&&"binary-data"===a.localName)return"data:image/png;base64,"+a.textContent.replace(/[\r\n\s]/g,"");a=a.nextSibling}return""}function e(c,b,f,d){function e(a){a&&(a=
'draw|image[styleid="'+c+'"] {'+("background-image: url("+a+");")+"}",d.insertRule(a,d.cssRules.length))}f.setAttribute("styleid",c);var g=f.getAttributeNS(u,"href"),p;if(g)try{p=b.getPart(g),p.onchange=function(a){e(a.url)},p.load()}catch(l){runtime.log("slight problem: "+l)}else g=a(f),e(g)}function k(a,c,b){function f(a,b,d){var e;b.hasAttributeNS(u,"href")&&(e=b.getAttributeNS(u,"href"),"#"===e[0]?(e=e.substring(1),a=function(){var a=D.getODFElementsWithXPath(c,"//text:bookmark-start[@text:name='"+
e+"']",odf.Namespaces.resolvePrefix);0===a.length&&(a=D.getODFElementsWithXPath(c,"//text:bookmark[@text:name='"+e+"']",odf.Namespaces.resolvePrefix));0<a.length&&a[0].scrollIntoView(!0);return!1}):a=function(){J.open(e)},b.onclick=a)}var d,e,g;e=c.getElementsByTagNameNS(w,"a");for(d=0;d<e.length;d+=1)g=e.item(d),f(a,g,b)}function b(a){var c=a.ownerDocument;Array.prototype.slice.call(a.getElementsByTagNameNS(w,"s")).forEach(function(a){for(var b,f;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(c.createTextNode(" "));
f=parseInt(a.getAttributeNS(w,"c"),10);if(1<f)for(a.removeAttributeNS(w,"c"),b=1;b<f;b+=1)a.parentNode.insertBefore(a.cloneNode(!0),a)})}function l(c,b,f,d){function e(a,c){var b=l.documentElement.namespaceURI;"video/"===c.substr(0,6)?(g=l.createElementNS(b,"video"),g.setAttribute("controls","controls"),p=l.createElementNS(b,"source"),p.setAttribute("src",a),p.setAttribute("type",c),g.appendChild(p),f.parentNode.appendChild(g)):f.innerHtml="Unrecognised Plugin"}var g,p,l=f.ownerDocument,h;if(c=f.getAttributeNS(u,
"href"))try{h=b.getPart(c),h.onchange=function(a){e(a.url,a.mimetype)},h.load()}catch(k){runtime.log("slight problem: "+k)}else runtime.log("using MP4 data fallback"),c=a(f),e(c,"video/mp4")}function t(a){var c=a.getElementsByTagName("head")[0],b;"undefined"!==String(typeof webodf_css)?(b=a.createElementNS(c.namespaceURI,"style"),b.setAttribute("media","screen, print, handheld, projection"),b.appendChild(a.createTextNode(webodf_css))):(b=a.createElementNS(c.namespaceURI,"link"),a="webodf.css",runtime.currentDirectory&&
(a=runtime.currentDirectory()+"/../"+a),b.setAttribute("href",a),b.setAttribute("rel","stylesheet"));b.setAttribute("type","text/css");c.appendChild(b);return b}function v(a){var c=a.getElementsByTagName("head")[0],b=a.createElementNS(c.namespaceURI,"style"),f="";b.setAttribute("type","text/css");b.setAttribute("media","screen, print, handheld, projection");odf.Namespaces.forEachPrefix(function(a,c){f+="@namespace "+a+" url("+c+");\n"});b.appendChild(a.createTextNode(f));c.appendChild(b);return b}
var c=odf.Namespaces.drawns,q=odf.Namespaces.fons,g=odf.Namespaces.officens,p=odf.Namespaces.stylens,f=odf.Namespaces.svgns,y=odf.Namespaces.tablens,w=odf.Namespaces.textns,u=odf.Namespaces.xlinkns,x=odf.Namespaces.xmlns,F=odf.Namespaces.presentationns,J=runtime.getWindow(),D=new xmldom.XPath,O=new odf.OdfUtils,B;odf.OdfCanvas=function(a){function f(a,b,d){function g(a,c,b,f){C.addToQueue(function(){e(a,c,b,f)})}var p,l;p=b.getElementsByTagNameNS(c,"image");for(b=0;b<p.length;b+=1)l=p.item(b),g("image"+
String(b),a,l,d)}function g(a,b,f){function d(a,c,b,f){C.addToQueue(function(){l(a,c,b,f)})}var e,p;e=b.getElementsByTagNameNS(c,"plugin");for(b=0;b<e.length;b+=1)p=e.item(b),d("video"+String(b),a,p,f)}function q(){var c=a.firstChild;c.firstChild&&(1<E?(c.style.MozTransformOrigin="center top",c.style.WebkitTransformOrigin="center top",c.style.OTransformOrigin="center top",c.style.msTransformOrigin="center top"):(c.style.MozTransformOrigin="left top",c.style.WebkitTransformOrigin="left top",c.style.OTransformOrigin=
"left top",c.style.msTransformOrigin="left top"),c.style.WebkitTransform="scale("+E+")",c.style.MozTransform="scale("+E+")",c.style.OTransform="scale("+E+")",c.style.msTransform="scale("+E+")",a.style.width=Math.round(E*c.offsetWidth)+"px",a.style.height=Math.round(E*c.offsetHeight)+"px")}function u(){function d(){for(var e=a;e.firstChild;)e.removeChild(e.firstChild);a.style.display="inline-block";var l=H.rootElement;a.ownerDocument.importNode(l,!0);T.setOdfContainer(H);var e=H,n=M;(new odf.FontLoader).loadFonts(e,
n.sheet);s(H,T,z);for(var r=H,e=P.sheet,n=a;n.firstChild;)n.removeChild(n.firstChild);n=Q.createElementNS(a.namespaceURI,"div");n.style.display="inline-block";n.style.background="white";n.appendChild(l);a.appendChild(n);B=Q.createElementNS(a.namespaceURI,"div");B.id="shadowContent";B.style.position="absolute";B.style.top=0;B.style.left=0;r.getContentElement().appendChild(B);var m=l.body,t,u,v;u=[];for(t=m.firstChild;t&&t!==m;)if(t.namespaceURI===c&&(u[u.length]=t),t.firstChild)t=t.firstChild;else{for(;t&&
t!==m&&!t.nextSibling;)t=t.parentNode;t&&t.nextSibling&&(t=t.nextSibling)}for(v=0;v<u.length;v+=1)t=u[v],h(r,"frame"+String(v),t,e);u=D.getODFElementsWithXPath(m,".//*[*[@text:anchor-type='paragraph']]",odf.Namespaces.resolvePrefix);for(t=0;t<u.length;t+=1)m=u[t],m.setAttributeNS&&m.setAttributeNS("urn:webodf","containsparagraphanchor",!0);t=l.body.getElementsByTagNameNS(y,"table-cell");for(m=0;m<t.length;m+=1)u=t.item(m),u.hasAttributeNS(y,"number-columns-spanned")&&u.setAttribute("colspan",u.getAttributeNS(y,
"number-columns-spanned")),u.hasAttributeNS(y,"number-rows-spanned")&&u.setAttribute("rowspan",u.getAttributeNS(y,"number-rows-spanned"));k(r,l.body,e);b(l.body);t=l.body.getElementsByTagNameNS(w,"tab");for(m=0;m<t.length;m+=1)t[m].textContent="\t";f(r,l.body,e);g(r,l.body,e);t=l.body;var A,F,E,r={},m={},C;u=J.document.getElementsByTagNameNS(w,"list-style");for(l=0;l<u.length;l+=1)A=u.item(l),(F=A.getAttributeNS(p,"name"))&&(m[F]=A);t=t.getElementsByTagNameNS(w,"list");for(l=0;l<t.length;l+=1)if(A=
t.item(l),u=A.getAttributeNS(x,"id")){v=A.getAttributeNS(w,"continue-list");A.setAttribute("id",u);E="text|list#"+u+" > text|list-item > *:first-child:before {";if(F=A.getAttributeNS(w,"style-name")){A=m[F];C=O.getFirstNonWhitespaceChild(A);A=void 0;if("list-level-style-number"===C.localName){A=C.getAttributeNS(p,"num-format");F=C.getAttributeNS(p,"num-suffix");var L="",L={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},N=void 0,N=C.getAttributeNS(p,"num-prefix")||"",
N=L.hasOwnProperty(A)?N+(" counter(list, "+L[A]+")"):A?N+("'"+A+"';"):N+" ''";F&&(N+=" '"+F+"'");A=L="content: "+N+";"}else"list-level-style-image"===C.localName?A="content: none;":"list-level-style-bullet"===C.localName&&(A="content: '"+C.getAttributeNS(w,"bullet-char")+"';");C=A}if(v){for(A=r[v];A;)v=A,A=r[v];E+="counter-increment:"+v+";";C?(C=C.replace("list",v),E+=C):E+="content:counter("+v+");"}else v="",C?(C=C.replace("list",u),E+=C):E+="content: counter("+u+");",E+="counter-increment:"+u+";",
e.insertRule("text|list#"+u+" {counter-reset:"+u+"}",e.cssRules.length);E+="}";r[u]=v;E&&e.insertRule(E,e.cssRules.length)}n.insertBefore(B,n.firstChild);q();e=[H];if(W.hasOwnProperty("statereadychange"))for(n=W.statereadychange,C=0;C<n.length;C+=1)n[C].apply(null,e)}H.state===odf.OdfContainer.DONE?d():(runtime.log("WARNING: refreshOdf called but ODF was not DONE."),runtime.setTimeout(function ea(){H.state===odf.OdfContainer.DONE?d():(runtime.log("will be back later..."),runtime.setTimeout(ea,500))},
100))}function F(){if(R){for(var a=R.ownerDocument.createDocumentFragment();R.firstChild;)a.insertBefore(R.firstChild,null);R.parentNode.replaceChild(a,R)}}function aa(a){a=a||J.event;for(var c=a.target,b=J.getSelection(),f=0<b.rangeCount?b.getRangeAt(0):null,d=f&&f.startContainer,e=f&&f.startOffset,g=f&&f.endContainer,p=f&&f.endOffset,l,h;c&&("p"!==c.localName&&"h"!==c.localName||c.namespaceURI!==w);)c=c.parentNode;N&&(c&&c.parentNode!==R)&&(l=c.ownerDocument,h=l.documentElement.namespaceURI,R?R.parentNode&&
F():(R=l.createElementNS(h,"p"),R.style.margin="0px",R.style.padding="0px",R.style.border="0px",R.setAttribute("contenteditable",!0)),c.parentNode.replaceChild(R,c),R.appendChild(c),R.focus(),f&&(b.removeAllRanges(),f=c.ownerDocument.createRange(),f.setStart(d,e),f.setEnd(g,p),b.addRange(f)),a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=!1,a.cancelBubble=!0))}runtime.assert(null!==a&&void 0!==a,"odf.OdfCanvas constructor needs DOM element");var Q=a.ownerDocument,H,T=new odf.Formatting,
U=new r(a),L,M,z,P,N=!1,E=1,W={},R,C=new d;t(Q);L=new m(v(Q));M=v(Q);z=v(Q);P=v(Q);this.refreshCSS=function(){s(H,T,z);q()};this.refreshSize=function(){q()};this.odfContainer=function(){return H};this.slidevisibilitycss=function(){return L.css};this.setOdfContainer=function(a){H=a;u()};this.load=this.load=function(c){C.clearQueue();a.innerHTML="loading "+c;a.removeAttribute("style");H=new odf.OdfContainer(c,function(a){H=a;u()})};this.save=function(a){F();H.save(a)};this.setEditable=function(c){n(a,
"click",aa);(N=c)||F()};this.addListener=function(c,b){switch(c){case "selectionchange":U.addListener(c,b);break;case "click":n(a,c,b);break;default:var f=W[c];void 0===f&&(f=W[c]=[]);b&&-1===f.indexOf(b)&&f.push(b)}};this.getFormatting=function(){return T};this.setZoomLevel=function(a){E=a;q()};this.getZoomLevel=function(){return E};this.fitToContainingElement=function(c,b){var f=a.offsetHeight/E;E=c/(a.offsetWidth/E);b/f<E&&(E=b/f);q()};this.fitToWidth=function(c){E=c/(a.offsetWidth/E);q()};this.fitSmart=
function(c,b){var f,d;f=a.offsetWidth/E;d=a.offsetHeight/E;f=c/f;void 0!==b&&b/d<f&&(f=b/d);E=Math.min(1,f);q()};this.fitToHeight=function(c){E=c/(a.offsetHeight/E);q()};this.showFirstPage=function(){L.showFirstPage()};this.showNextPage=function(){L.showNextPage()};this.showPreviousPage=function(){L.showPreviousPage()};this.showPage=function(a){L.showPage(a)};this.showAllPages=function(){};this.getElement=function(){return a}};return odf.OdfCanvas}();
// Input 33
runtime.loadClass("odf.OdfCanvas");
odf.CommandLineTools=function(){this.roundTrip=function(d,m,n){new odf.OdfContainer(d,function(r){if(r.state===odf.OdfContainer.INVALID)return n("Document "+d+" is invalid.");r.state===odf.OdfContainer.DONE?r.saveAs(m,function(d){n(d)}):n("Document was not completely loaded.")})};this.render=function(d,m,n){for(m=m.getElementsByTagName("body")[0];m.firstChild;)m.removeChild(m.firstChild);m=new odf.OdfCanvas(m);m.addListener("statereadychange",function(d){n(d)});m.load(d)}};
// Input 34
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.Operation=function(){};ops.Operation.prototype.init=function(d){};ops.Operation.prototype.execute=function(d){};ops.Operation.prototype.spec=function(){};
// Input 35
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpAddCursor=function(){var d,m;this.init=function(n){d=n.memberid;m=n.timestamp};this.execute=function(n){var r=n.getCursor(d);if(r)return!1;r=new ops.OdtCursor(d,n);n.addCursor(r);n.emit(ops.OdtDocument.signalCursorAdded,r);return!0};this.spec=function(){return{optype:"AddCursor",memberid:d,timestamp:m}}};
// Input 36
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.OdfUtils");
ops.OpApplyStyle=function(){function d(a){var b=0<=h?s+h:s,d=a.getIteratorAtPosition(0<=h?s:s+h),b=h?a.getIteratorAtPosition(b):d;a=a.getDOM().createRange();a.setStart(d.container(),d.unfilteredDomOffset());a.setEnd(b.container(),b.unfilteredDomOffset());return a}function m(a){var b=a.commonAncestorContainer,d;d=Array.prototype.slice.call(b.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","p"));for(d=d.concat(Array.prototype.slice.call(b.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","h")));b&&
!e.isParagraph(b);)b=b.parentNode;b&&d.push(b);return d.filter(function(b){var d=b.nodeType===Node.TEXT_NODE?b.length:b.childNodes.length;return 0>=a.comparePoint(b,0)&&0<=a.comparePoint(b,d)})}var n,r,s,h,a,e=new odf.OdfUtils;this.init=function(d){n=d.memberid;r=d.timestamp;s=d.position;h=d.length;a=d.info};this.execute=function(e){var b=d(e),l=m(b);e.getFormatting().applyStyle(b,a);b.detach();e.getOdfCanvas().refreshCSS();l.forEach(function(a){e.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,
memberId:n,timeStamp:r})});return!0};this.spec=function(){return{optype:"ApplyStyle",memberid:n,timestamp:r,position:s,length:h,info:a}}};
// Input 37
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpRemoveCursor=function(){var d,m;this.init=function(n){d=n.memberid;m=n.timestamp};this.execute=function(n){if(!n.removeCursor(d))return!1;n.emit(ops.OdtDocument.signalCursorRemoved,d);return!0};this.spec=function(){return{optype:"RemoveCursor",memberid:d,timestamp:m}}};
// Input 38
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpMoveCursor=function(){var d,m,n,r;this.init=function(s){d=s.memberid;m=s.timestamp;n=s.position;r=s.length||0};this.execute=function(m){var h=m.getCursor(d),a=m.getCursorPosition(d),e=m.getPositionFilter(),k=n-a;if(!h)return!1;a=h.getStepCounter();k=0<k?a.countForwardSteps(k,e):0>k?-a.countBackwardSteps(-k,e):0;h.move(k);r&&(e=0<r?a.countForwardSteps(r,e):0>r?-a.countBackwardSteps(-r,e):0,h.move(e,!0));m.emit(ops.OdtDocument.signalCursorMoved,h);return!0};this.spec=function(){return{optype:"MoveCursor",
memberid:d,timestamp:m,position:n,length:r}}};
// Input 39
ops.OpInsertTable=function(){function d(a,d){var e;if(1===b.length)e=b[0];else if(3===b.length)switch(a){case 0:e=b[0];break;case r-1:e=b[2];break;default:e=b[1]}else e=b[a];if(1===e.length)return e[0];if(3===e.length)switch(d){case 0:return e[0];case s-1:return e[2];default:return e[1]}return e[d]}var m,n,r,s,h,a,e,k,b;this.init=function(d){m=d.memberid;n=d.timestamp;h=d.position;r=d.initialRows;s=d.initialColumns;a=d.tableName;e=d.tableStyleName;k=d.tableColumnStyleName;b=d.tableCellStyleMatrix};
this.execute=function(b){var t=b.getPositionInTextNode(h),v=b.getRootNode();if(t){var c=b.getDOM(),q=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table"),g=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-column"),p,f,y,w;e&&q.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",e);a&&q.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:name",a);g.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0",
"table:number-columns-repeated",s);k&&g.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",k);q.appendChild(g);for(y=0;y<r;y+=1){g=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-row");for(w=0;w<s;w+=1)p=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-cell"),(f=d(y,w))&&p.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",f),f=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",
"text:p"),p.appendChild(f),g.appendChild(p);q.appendChild(g)}t=b.getParagraphElement(t.textNode);v.insertBefore(q,t?t.nextSibling:void 0);b.getOdfCanvas().refreshSize();b.emit(ops.OdtDocument.signalTableAdded,{tableElement:q,memberId:m,timeStamp:n});return!0}return!1};this.spec=function(){return{optype:"InsertTable",memberid:m,timestamp:n,position:h,initialRows:r,initialColumns:s,tableName:a,tableStyleName:e,tableColumnStyleName:k,tableCellStyleMatrix:b}}};
// Input 40
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpInsertText=function(){function d(d,a){var e=a.parentNode,k=a.nextSibling,b=[];d.getCursors().forEach(function(d){var e=d.getSelectedRange();!e||e.startContainer!==a&&e.endContainer!==a||b.push({cursor:d,startContainer:e.startContainer,startOffset:e.startOffset,endContainer:e.endContainer,endOffset:e.endOffset})});e.removeChild(a);e.insertBefore(a,k);b.forEach(function(a){var b=a.cursor.getSelectedRange();b.setStart(a.startContainer,a.startOffset);b.setEnd(a.endContainer,a.endOffset)})}var m,
n,r,s;this.init=function(d){m=d.memberid;n=d.timestamp;r=d.position;s=d.text};this.execute=function(h){var a,e=s.split(" "),k,b,l,t,v=h.getRootNode().ownerDocument,c;if(a=h.getPositionInTextNode(r,m)){b=a.textNode;l=b.parentNode;t=b.nextSibling;k=a.offset;a=h.getParagraphElement(b);k!==b.length&&(t=b.splitText(k));0<e[0].length&&b.appendData(e[0]);for(c=1;c<e.length;c+=1)k=v.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:s"),k.appendChild(v.createTextNode(" ")),l.insertBefore(k,
t),0<e[c].length&&l.insertBefore(v.createTextNode(e[c]),t);d(h,b);0===b.length&&b.parentNode.removeChild(b);h.getOdfCanvas().refreshSize();h.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:m,timeStamp:n});return!0}return!1};this.spec=function(){return{optype:"InsertText",memberid:m,timestamp:n,position:r,text:s}}};
// Input 41
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpRemoveText=function(){function d(a){var b,d,c,e,g;b=a.getCursors();e=a.getPositionFilter();for(g in b)b.hasOwnProperty(g)&&(d=b[g].getStepCounter(),d.isPositionWalkable(e)||(c=-d.countBackwardSteps(1,e),0===c&&(c=d.countForwardSteps(1,e)),b[g].move(c),g===r&&a.emit(ops.OdtDocument.signalCursorMoved,b[g])))}function m(a){if(!k.isParagraph(a)&&(k.isGroupingElement(a)||k.isCharacterElement(a))&&0===a.textContent.length){for(a=a.firstChild;a;){if(k.isCharacterElement(a))return!1;a=a.nextSibling}return!0}return!1}
function n(a,d,e){var c,h;c=e?d.lastChild:d.firstChild;for(e&&(h=a.getElementsByTagNameNS(b,"editinfo")[0]||a.firstChild);c;){d.removeChild(c);if("editinfo"!==c.localName)if(m(c))for(;c.firstChild;)a.insertBefore(c.firstChild,h);else a.insertBefore(c,h);c=e?d.lastChild:d.firstChild}a=d.parentNode;a.removeChild(d);k.isListItem(a)&&0===a.childNodes.length&&a.parentNode.removeChild(a)}var r,s,h,a,e,k,b="urn:webodf:names:editinfo";this.init=function(b){r=b.memberid;s=b.timestamp;h=b.position;a=b.length;
e=b.text;k=new odf.OdfUtils};this.execute=function(b){a=parseInt(a,10);h=parseInt(h,10);var e=[],k,c,q,g=0>a?-1:1,p=0>a?"backspace":"delete",f=null,y=null,w;c=h;var u=a;b.upgradeWhitespacesAtPosition(c);k=b.getPositionInTextNode(c);var e=k.textNode,x=k.offset,F=e.parentNode;k=b.getParagraphElement(F);q=Math.abs(u);var J=0>u?-1:1,D=0>u?"backspace":"delete";""===e.data?(F.removeChild(e),c=b.getTextNeighborhood(c,u)):0!==x?("delete"===D?(F=q<e.length-x?q:e.length-x,e.deleteData(x,F),b.upgradeWhitespacesAtPosition(c),
c=b.getTextNeighborhood(c,u+F*J)):(F=q<x?q:x,e.deleteData(x-F,F),b.upgradeWhitespacesAtPosition(c-F-1),c=b.getTextNeighborhood(c-F-1,u+F*J)),q-=F,F&&c[0]===e&&c.splice(0,1)):c=b.getTextNeighborhood(c,u);for(e=c;q;)if(e[0]&&(f=e[0],y=f.parentNode,w=f.length),c=b.getParagraphElement(f),k!==c){if(c=b.getNeighboringParagraph(k,g))"delete"===p?1<b.getWalkableParagraphLength(k)?n(k,c,!1):(n(c,k,!0),k=c):1<b.getWalkableParagraphLength(c)?(n(c,k,!1),k=c):n(k,c,!0);q-=1}else if(w<=q){y.removeChild(f);for(d(b);m(y);){for(c=
y.parentNode;y.firstChild;)c.insertBefore(y.firstChild,y);c.removeChild(y);y=c}q-=w;e.splice(0,1)}else"delete"===p?(f.deleteData(0,q),b.upgradeWhitespacesAtPosition(h)):(f.deleteData(w-q,q),b.upgradeWhitespacesAtPosition(h+a-1)),q=0;d(b);b.getOdfCanvas().refreshSize();b.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:k,memberId:r,timeStamp:s});b.emit(ops.OdtDocument.signalCursorMoved,b.getCursor(r));return!0};this.spec=function(){return{optype:"RemoveText",memberid:r,timestamp:s,position:h,
length:a,text:e}}};
// Input 42
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpSplitParagraph=function(){var d,m,n,r;this.init=function(s){d=s.memberid;m=s.timestamp;n=s.position;r=new odf.OdfUtils};this.execute=function(s){var h,a,e,k,b,l;h=s.getPositionInTextNode(n,d);if(!h)return!1;a=s.getParagraphElement(h.textNode);if(!a)return!1;e=r.isListItem(a.parentNode)?a.parentNode:a;0===h.offset?(l=h.textNode.previousSibling,b=null):(l=h.textNode,b=h.offset>=h.textNode.length?null:h.textNode.splitText(h.offset));for(h=h.textNode;h!==e;)if(h=h.parentNode,k=h.cloneNode(!1),l){for(b&&
k.appendChild(b);l.nextSibling;)k.appendChild(l.nextSibling);h.parentNode.insertBefore(k,h.nextSibling);l=h;b=k}else h.parentNode.insertBefore(k,h),l=k,b=h;r.isListItem(b)&&(b=b.childNodes[0]);s.getOdfCanvas().refreshSize();s.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:d,timeStamp:m});s.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:b,memberId:d,timeStamp:m});return!0};this.spec=function(){return{optype:"SplitParagraph",memberid:d,timestamp:m,position:n}}};
// Input 43
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpSetParagraphStyle=function(){var d,m,n,r,s;this.init=function(h){d=h.memberid;m=h.timestamp;n=h.position;r=h.styleNameBefore;s=h.styleNameAfter};this.execute=function(h){var a;if(a=h.getPositionInTextNode(n))if(a=h.getParagraphElement(a.textNode))return a.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:style-name",s),h.getOdfCanvas().refreshSize(),h.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,timeStamp:m,memberId:d}),!0;return!1};this.spec=function(){return{optype:"SetParagraphStyle",
memberid:d,timestamp:m,position:n,styleNameBefore:r,styleNameAfter:s}}};
// Input 44
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpUpdateParagraphStyle=function(){function d(d,a,e,k,b){void 0!==k&&d.setAttributeNS(a,e,void 0!==b?k+b:k)}var m,n,r,s;this.init=function(d){m=d.memberid;n=d.timestamp;r=d.styleName;s=d.info};this.execute=function(h){var a,e,k;return(a=h.getParagraphStyleElement(r))?(e=a.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","paragraph-properties")[0],k=a.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","text-properties")[0],void 0===e&&s.paragraphProperties&&
(e=h.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:paragraph-properties"),a.appendChild(e)),void 0===k&&s.textProperties&&(k=h.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:text-properties"),a.appendChild(k)),s.paragraphProperties&&(d(e,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:margin-top",s.paragraphProperties.topMargin,"mm"),d(e,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:margin-bottom",
s.paragraphProperties.bottomMargin,"mm"),d(e,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:margin-left",s.paragraphProperties.leftMargin,"mm"),d(e,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:margin-right",s.paragraphProperties.rightMargin,"mm"),d(e,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:text-align",s.paragraphProperties.textAlign)),s.textProperties&&(d(k,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:font-size",
s.textProperties.fontSize,"pt"),s.textProperties.fontName&&!h.getOdfCanvas().getFormatting().getFontMap().hasOwnProperty(s.textProperties.fontName)&&(a=h.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:font-face"),a.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:name",s.textProperties.fontName),a.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0","svg:font-family",s.textProperties.fontName),h.getOdfCanvas().odfContainer().rootElement.fontFaceDecls.appendChild(a)),
d(k,"urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:font-name",s.textProperties.fontName),d(k,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:color",s.textProperties.color),d(k,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:background-color",s.textProperties.backgroundColor),d(k,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:font-weight",s.textProperties.fontWeight),d(k,"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0","fo:font-style",
s.textProperties.fontStyle),d(k,"urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:text-underline-style",s.textProperties.underline),d(k,"urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:text-line-through-style",s.textProperties.strikethrough)),h.getOdfCanvas().refreshCSS(),h.emit(ops.OdtDocument.signalParagraphStyleModified,r),!0):!1};this.spec=function(){return{optype:"UpdateParagraphStyle",memberid:m,timestamp:n,styleName:r,info:s}}};
// Input 45
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpCloneParagraphStyle=function(){var d,m,n,r,s;this.init=function(h){d=h.memberid;m=h.timestamp;n=h.styleName;r=h.newStyleName;s=h.newStyleDisplayName};this.execute=function(d){var a=d.getParagraphStyleElement(n),e;if(!a)return!1;e=a.cloneNode(!0);e.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:name",r);s?e.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:display-name",s):e.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","display-name");
a.parentNode.appendChild(e);d.getOdfCanvas().refreshCSS();d.emit(ops.OdtDocument.signalStyleCreated,r);return!0};this.spec=function(){return{optype:"CloneParagraphStyle",memberid:d,timestamp:m,styleName:n,newStyleName:r,newStyleDisplayName:s}}};
// Input 46
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpDeleteParagraphStyle=function(){var d,m,n;this.init=function(r){d=r.memberid;m=r.timestamp;n=r.styleName};this.execute=function(d){var m=d.getParagraphStyleElement(n);if(!m)return!1;m.parentNode.removeChild(m);d.getOdfCanvas().refreshCSS();d.emit(ops.OdtDocument.signalStyleDeleted,n);return!0};this.spec=function(){return{optype:"DeleteParagraphStyle",memberid:d,timestamp:m,styleName:n}}};
// Input 47
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpApplyStyle");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.OpMoveCursor");runtime.loadClass("ops.OpInsertTable");runtime.loadClass("ops.OpInsertText");runtime.loadClass("ops.OpRemoveText");runtime.loadClass("ops.OpSplitParagraph");runtime.loadClass("ops.OpSetParagraphStyle");runtime.loadClass("ops.OpUpdateParagraphStyle");runtime.loadClass("ops.OpCloneParagraphStyle");runtime.loadClass("ops.OpDeleteParagraphStyle");
ops.OperationFactory=function(){this.create=function(d){var m=null;"AddCursor"===d.optype?m=new ops.OpAddCursor:"ApplyStyle"===d.optype?m=new ops.OpApplyStyle:"InsertTable"===d.optype?m=new ops.OpInsertTable:"InsertText"===d.optype?m=new ops.OpInsertText:"RemoveText"===d.optype?m=new ops.OpRemoveText:"SplitParagraph"===d.optype?m=new ops.OpSplitParagraph:"SetParagraphStyle"===d.optype?m=new ops.OpSetParagraphStyle:"UpdateParagraphStyle"===d.optype?m=new ops.OpUpdateParagraphStyle:"CloneParagraphStyle"===
d.optype?m=new ops.OpCloneParagraphStyle:"DeleteParagraphStyle"===d.optype?m=new ops.OpDeleteParagraphStyle:"MoveCursor"===d.optype?m=new ops.OpMoveCursor:"RemoveCursor"===d.optype&&(m=new ops.OpRemoveCursor);m&&m.init(d);return m}};
// Input 48
runtime.loadClass("core.Cursor");runtime.loadClass("core.PositionIterator");runtime.loadClass("core.PositionFilter");runtime.loadClass("core.LoopWatchDog");
gui.SelectionMover=function(d,m){function n(){c.setUnfilteredPosition(d.getNode(),0);return c}function r(a,c,b){var d;b.setStart(a,c);d=b.getClientRects()[0];if(!d)if(d={},a.childNodes[c-1]){b.setStart(a,c-1);b.setEnd(a,c);c=b.getClientRects()[0];if(!c){for(b=c=0;a&&a.nodeType===Node.ELEMENT_NODE;)c+=a.offsetLeft-a.scrollLeft,b+=a.offsetTop-a.scrollTop,a=a.parentNode;c={top:b,left:c}}d.top=c.top;d.left=c.right}else a.nodeType===Node.TEXT_NODE?(a.previousSibling&&(d=a.previousSibling.getClientRects()[0]),
d||(b.setStart(a,0),b.setEnd(a,c),d=b.getClientRects()[0])):d=a.getClientRects()[0];return{top:d.top,left:d.left}}function s(a,c,b){var e=a,l=n(),h,k=m.ownerDocument.createRange(),s=d.getSelectedRange()?d.getSelectedRange().cloneRange():m.ownerDocument.createRange(),t;for(h=r(d.getNode(),0,k);0<e&&b();)e-=1;c?(c=l.container(),l=l.unfilteredDomOffset(),-1===s.comparePoint(c,l)?(s.setStart(c,l),t=!1):s.setEnd(c,l)):(s.setStart(l.container(),l.unfilteredDomOffset()),s.collapse(!0));d.setSelectedRange(s,
t);s=r(d.getNode(),0,k);if(s.top===h.top||void 0===q)q=s.left;window.clearTimeout(g);g=window.setTimeout(function(){q=void 0},2E3);k.detach();return a-e}function h(a){var c=n();return 1===a.acceptPosition(c)?!0:!1}function a(a,c){for(var b=n(),d=new core.LoopWatchDog(1E3),e=0,g=0;0<a&&b.nextPosition();)e+=1,d.check(),1===c.acceptPosition(b)&&(g+=e,e=0,a-=1);return g}function e(a,c){for(var b=n(),d=new core.LoopWatchDog(1E3),e=0,g=0;0<a&&b.previousPosition();)e+=1,d.check(),1===c.acceptPosition(b)&&
(g+=e,e=0,a-=1);return g}function k(a,c,b){var d=b.container(),e=0,g=null,l,h=10,k,n=0,s,t,v,I=m.ownerDocument.createRange(),X=new core.LoopWatchDog(1E3);k=r(d,b.unfilteredDomOffset(),I);s=k.top;t=void 0===q?k.left:q;for(v=s;!0===(0>c?b.previousPosition():b.nextPosition());)if(X.check(),1===a.acceptPosition(b)&&(e+=1,d=b.container(),k=r(d,b.unfilteredDomOffset(),I),k.top!==s)){if(k.top!==v&&v!==s)break;v=k.top;k=Math.abs(t-k.left);if(null===g||k<h)g=d,l=b.unfilteredDomOffset(),h=k,n=e}null!==g?(b.setUnfilteredPosition(g,
l),e=n):e=0;I.detach();return e}function b(a,c){for(var b=n(),d=0,e=0;0<a;){d+=k(c,-1,b);if(0===d)break;e+=d;a-=1}return e}function l(a,c){for(var b=n(),d=0,e=0;0<a;){d+=k(c,1,b);if(0===d)break;e+=d;a-=1}return e}function t(a,c){for(var b=0,d;a.parentNode!==c;)runtime.assert(null!==a.parentNode,"parent is null"),a=a.parentNode;for(d=c.firstChild;d!==a;)b+=1,d=d.nextSibling;return b}function v(a,c,b){runtime.assert(null!==a,"SelectionMover.countStepsToPosition called with element===null");var d=n(),
e=d.container(),g=d.unfilteredDomOffset(),l=0,h=new core.LoopWatchDog(1E3);d.setUnfilteredPosition(a,c);a=d.container();runtime.assert(Boolean(a),"SelectionMover.countStepsToPosition: positionIterator.container() returned null");c=d.unfilteredDomOffset();d.setUnfilteredPosition(e,g);var e=a,g=c,k=d.container(),q=d.unfilteredDomOffset();if(e===k)e=q-g;else{var r=e.compareDocumentPosition(k);2===r?r=-1:4===r?r=1:10===r?(g=t(e,k),r=g<q?1:-1):(q=t(k,e),r=q<g?-1:1);e=r}if(0>e)for(;d.nextPosition()&&(h.check(),
1===b.acceptPosition(d)&&(l+=1),d.container()!==a||d.unfilteredDomOffset()!==c););else if(0<e)for(;d.previousPosition()&&(h.check(),1===b.acceptPosition(d)&&(l-=1),d.container()!==a||d.unfilteredDomOffset()!==c););return l}var c,q,g;this.movePointForward=function(a,b){return s(a,b,c.nextPosition)};this.movePointBackward=function(a,b){return s(a,b,c.previousPosition)};this.getStepCounter=function(){return{countForwardSteps:a,countBackwardSteps:e,countLinesDownSteps:l,countLinesUpSteps:b,countStepsToPosition:v,
isPositionWalkable:h}};(function(){c=gui.SelectionMover.createPositionIterator(m);var a=m.ownerDocument.createRange();a.setStart(c.container(),c.unfilteredDomOffset());a.collapse(!0);d.setSelectedRange(a)})()};gui.SelectionMover.createPositionIterator=function(d){var m=new function(){this.acceptNode=function(d){return"urn:webodf:names:cursor"===d.namespaceURI||"urn:webodf:names:editinfo"===d.namespaceURI?2:1}};return new core.PositionIterator(d,5,m,!1)};(function(){return gui.SelectionMover})();
// Input 49
runtime.loadClass("core.Cursor");runtime.loadClass("gui.SelectionMover");
ops.OdtCursor=function(d,m){var n=this,r,s;this.removeFromOdtDocument=function(){s.remove()};this.move=function(d,a){var e=0;0<d?e=r.movePointForward(d,a):0>=d&&(e=-r.movePointBackward(-d,a));n.handleUpdate();return e};this.handleUpdate=function(){};this.getStepCounter=function(){return r.getStepCounter()};this.getMemberId=function(){return d};this.getNode=function(){return s.getNode()};this.getAnchorNode=function(){return s.getAnchorNode()};this.getSelectedRange=function(){return s.getSelectedRange()};
this.getOdtDocument=function(){return m};s=new core.Cursor(m.getDOM(),d);r=new gui.SelectionMover(s,m.getRootNode())};
// Input 50
/*

 Copyright (C) 2012 KO GmbH <aditya.bhatt@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.EditInfo=function(d,m){function n(){var d=[],a;for(a in s)s.hasOwnProperty(a)&&d.push({memberid:a,time:s[a].time});d.sort(function(a,d){return a.time-d.time});return d}var r,s={};this.getNode=function(){return r};this.getOdtDocument=function(){return m};this.getEdits=function(){return s};this.getSortedEdits=function(){return n()};this.addEdit=function(d,a){var e,k=d.split("___")[0];if(!s[d])for(e in s)if(s.hasOwnProperty(e)&&e.split("___")[0]===k){delete s[e];break}s[d]={time:a}};this.clearEdits=
function(){s={}};r=m.getDOM().createElementNS("urn:webodf:names:editinfo","editinfo");d.insertBefore(r,d.firstChild)};
// Input 51
gui.Avatar=function(d,m){var n=this,r,s,h;this.setColor=function(a){s.style.borderColor=a};this.setImageUrl=function(a){n.isVisible()?s.src=a:h=a};this.isVisible=function(){return"block"===r.style.display};this.show=function(){h&&(s.src=h,h=void 0);r.style.display="block"};this.hide=function(){r.style.display="none"};this.markAsFocussed=function(a){r.className=a?"active":""};(function(){var a=d.ownerDocument,e=a.documentElement.namespaceURI;r=a.createElementNS(e,"div");s=a.createElementNS(e,"img");
s.width=64;s.height=64;r.appendChild(s);r.style.width="64px";r.style.height="70px";r.style.position="absolute";r.style.top="-80px";r.style.left="-34px";r.style.display=m?"block":"none";d.appendChild(r)})()};
// Input 52
runtime.loadClass("gui.Avatar");runtime.loadClass("ops.OdtCursor");
gui.Caret=function(d,m){function n(){e&&a.parentNode&&!k&&(k=!0,s.style.borderColor="transparent"===s.style.borderColor?b:"transparent",runtime.setTimeout(function(){k=!1;n()},500))}function r(a){var b;if("string"===typeof a){if(""===a)return 0;b=/^(\d+)(\.\d+)?px$/.exec(a);runtime.assert(null!==b,"size ["+a+"] does not have unit px.");return parseFloat(b[1])}return a}var s,h,a,e=!1,k=!1,b="";this.setFocus=function(){e=!0;h.markAsFocussed(!0);n()};this.removeFocus=function(){e=!1;h.markAsFocussed(!1);
s.style.borderColor=b};this.setAvatarImageUrl=function(a){h.setImageUrl(a)};this.setColor=function(a){b!==a&&(b=a,"transparent"!==s.style.borderColor&&(s.style.borderColor=b),h.setColor(b))};this.getCursor=function(){return d};this.getFocusElement=function(){return s};this.toggleHandleVisibility=function(){h.isVisible()?h.hide():h.show()};this.showHandle=function(){h.show()};this.hideHandle=function(){h.hide()};this.ensureVisible=function(){var a,b,e,c,h,g,p,f=d.getOdtDocument().getOdfCanvas().getElement().parentNode;
h=p=s;e=runtime.getWindow();runtime.assert(null!==e,"Expected to be run in an environment which has a global window, like a browser.");do{h=h.parentElement;if(!h)break;g=e.getComputedStyle(h,null)}while("block"!==g.display);g=h;h=c=0;if(g&&f){b=!1;do{e=g.offsetParent;for(a=g.parentNode;a!==e;){if(a===f){a=g;var k=f,n=0;b=0;var m=void 0,x=runtime.getWindow();for(runtime.assert(null!==x,"Expected to be run in an environment which has a global window, like a browser.");a&&a!==k;)m=x.getComputedStyle(a,
null),n+=r(m.marginLeft)+r(m.borderLeftWidth)+r(m.paddingLeft),b+=r(m.marginTop)+r(m.borderTopWidth)+r(m.paddingTop),a=a.parentElement;a=n;c+=a;h+=b;b=!0;break}a=a.parentNode}if(b)break;c+=r(g.offsetLeft);h+=r(g.offsetTop);g=e}while(g&&g!==f);e=c;c=h}else c=e=0;e+=p.offsetLeft;c+=p.offsetTop;h=e-5;g=c-5;e=e+p.scrollWidth-1+5;p=c+p.scrollHeight-1+5;g<f.scrollTop?f.scrollTop=g:p>f.scrollTop+f.clientHeight-1&&(f.scrollTop=p-f.clientHeight+1);h<f.scrollLeft?f.scrollLeft=h:e>f.scrollLeft+f.clientWidth-
1&&(f.scrollLeft=e-f.clientWidth+1)};(function(){var b=d.getOdtDocument().getDOM();s=b.createElementNS(b.documentElement.namespaceURI,"span");a=d.getNode();a.appendChild(s);h=new gui.Avatar(a,m)})()};
// Input 53
runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.OpMoveCursor");runtime.loadClass("ops.OpInsertText");runtime.loadClass("ops.OpRemoveText");runtime.loadClass("ops.OpSplitParagraph");runtime.loadClass("ops.OpSetParagraphStyle");
gui.SessionController=function(){gui.SessionController=function(d,m){function n(a,b,d){a.addEventListener?a.addEventListener(b,d,!1):a.attachEvent?a.attachEvent("on"+b,d):a["on"+b]=d}function r(a,b,d){a.removeEventListener?a.removeEventListener(b,d,!1):a.detachEvent?a.detachEvent("on"+b,d):a["on"+b]=null}function s(a){a.preventDefault?a.preventDefault():a.returnValue=!1}function h(a){s(a)}function a(a,b){var e=d.getOdtDocument(),p=gui.SelectionMover.createPositionIterator(e.getRootNode()),f=e.getOdfCanvas().getElement(),
h;if(h=a){for(;h!==f&&!("urn:webodf:names:cursor"===h.namespaceURI&&"cursor"===h.localName||"urn:webodf:names:editinfo"===h.namespaceURI&&"editinfo"===h.localName);)if(h=h.parentNode,!h)return;h!==f&&a!==h&&(a=h.parentNode,b=Array.prototype.indexOf.call(a.childNodes,h));p.setUnfilteredPosition(a,b);return e.getDistanceFromCursor(m,p.container(),p.unfilteredDomOffset())}}function e(c){var b=runtime.getWindow().getSelection();c=d.getOdtDocument().getCursorPosition(m);var e,p;e=a(b.anchorNode,b.anchorOffset);
b=a(b.focusNode,b.focusOffset);if(0!==b||0!==e)p=new ops.OpMoveCursor,p.init({memberid:m,position:c+e,length:b-e}),d.enqueue(p)}function k(a){var b=new ops.OpMoveCursor,e=d.getOdtDocument().getCursorPosition(m);b.init({memberid:m,position:e+a});return b}function b(a){var b=new ops.OpMoveCursor,e=d.getOdtDocument().getCursorSelection(m);b.init({memberid:m,position:e.position,length:e.length+a});return b}function l(a){var e=a.keyCode,g=null,p=!1;if(37===e)g=a.shiftKey?b(-1):k(-1),p=!0;else if(39===
e)g=a.shiftKey?b(1):k(1),p=!0;else if(38===e){var g=d.getOdtDocument(),e=g.getCursorPosition(m),p=g.getCursor(m).getNode(),f=g.getParagraphElement(p),p=null;runtime.assert(Boolean(f),"SessionController: Cursor outside paragraph");g=-g.getCursor(m).getStepCounter().countLinesUpSteps(1,g.getPositionFilter());0!==g&&(p=new ops.OpMoveCursor,p.init({memberid:m,position:e+g}));g=p;p=!0}else if(40===e)g=d.getOdtDocument(),e=g.getCursorPosition(m),p=g.getCursor(m).getNode(),f=g.getParagraphElement(p),p=null,
runtime.assert(Boolean(f),"SessionController: Cursor outside paragraph"),g=g.getCursor(m).getStepCounter().countLinesDownSteps(1,g.getPositionFilter()),0!==g&&(p=new ops.OpMoveCursor,p.init({memberid:m,position:e+g})),g=p,p=!0;else if(36===e)p=d.getOdtDocument(),e=p.getCursorPosition(m),g=null,f=p.getParagraphElement(p.getCursor(m).getNode()),p=p.getDistanceFromCursor(m,f,0),0!==p&&(g=new ops.OpMoveCursor,g.init({memberid:m,position:e+p})),p=!0;else if(35===e){var g=d.getOdtDocument(),p=gui.SelectionMover.createPositionIterator(g.getRootNode()),
e=g.getCursorPosition(m),f=g.getCursor(m).getNode(),h=g.getParagraphElement(f),f=null;runtime.assert(Boolean(h),"SessionController: Cursor outside paragraph");p.moveToEndOfNode(h);g=g.getDistanceFromCursor(m,h,p.unfilteredDomOffset());0!==g&&(f=new ops.OpMoveCursor,f.init({memberid:m,position:e+g}));g=f;p=!0}else 8===e?(p=d.getOdtDocument(),e=p.getCursorSelection(m),g=null,0<e.position&&(p=p.getPositionInTextNode(e.position-1))&&(g=new ops.OpRemoveText,g.init({memberid:m,position:e.position,length:e.length||
-1})),p=!0):46===e&&(e=d.getOdtDocument(),g=e.getCursorSelection(m),p=null,e.getPositionInTextNode(g.position+1)&&(p=new ops.OpRemoveText,p.init({memberid:m,position:g.position,length:g.length||1})),g=p,p=null!==g);g&&d.enqueue(g);p&&s(a)}function t(a){var b,e;e=null===a.which?String.fromCharCode(a.keyCode):0!==a.which&&0!==a.charCode?String.fromCharCode(a.which):null;13===a.keyCode?(b=d.getOdtDocument().getCursorPosition(m),e=new ops.OpSplitParagraph,e.init({memberid:m,position:b}),d.enqueue(e),
s(a)):!e||(a.altKey||a.ctrlKey||a.metaKey)||(b=new ops.OpInsertText,b.init({memberid:m,position:d.getOdtDocument().getCursorPosition(m),text:e}),d.enqueue(b),s(a))}function v(a){var b,e;window.clipboardData&&window.clipboardData.getData?b=window.clipboardData.getData("Text"):a.clipboardData&&a.clipboardData.getData&&(b=a.clipboardData.getData("text/plain"));b&&(e=new ops.OpInsertText,e.init({memberid:m,position:d.getOdtDocument().getCursorPosition(m),text:b}),d.enqueue(e),s(a))}this.startEditing=
function(){var a;a=d.getOdtDocument().getOdfCanvas().getElement();n(a,"keydown",l);n(a,"keypress",t);n(a,"keyup",h);n(a,"copy",h);n(a,"cut",h);n(a,"paste",v);n(a,"mouseup",e);a=new ops.OpAddCursor;a.init({memberid:m});d.enqueue(a)};this.endEditing=function(){var a;a=d.getOdtDocument().getOdfCanvas().getElement();r(a,"keydown",l);r(a,"keypress",t);r(a,"keyup",h);r(a,"copy",h);r(a,"cut",h);r(a,"paste",v);r(a,"mouseup",e);a=new ops.OpRemoveCursor;a.init({memberid:m});d.enqueue(a)};this.getInputMemberId=
function(){return m};this.getSession=function(){return d};d.getOdtDocument().subscribe(ops.OdtDocument.signalOperationExecuted,function(){var a=d.getOdtDocument().getCursor(m),b=runtime.getWindow().getSelection();b.removeAllRanges();b.addRange(a.getSelectedRange().cloneRange())})};return gui.SessionController}();
// Input 54
ops.UserModel=function(){};ops.UserModel.prototype.getUserDetailsAndUpdates=function(d,m){};ops.UserModel.prototype.unsubscribeUserDetailsUpdates=function(d,m){};
// Input 55
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.TrivialUserModel=function(){var d={bob:{memberid:"bob",fullname:"Bob Pigeon",color:"red",imageurl:"avatar-pigeon.png"},alice:{memberid:"alice",fullname:"Alice Bee",color:"green",imageurl:"avatar-flower.png"},you:{memberid:"you",fullname:"I, Robot",color:"blue",imageurl:"avatar-joe.png"}};this.getUserDetailsAndUpdates=function(m,n){var r=m.split("___")[0];n(m,d[r]||null)};this.unsubscribeUserDetailsUpdates=function(d,n){}};
// Input 56
ops.NowjsUserModel=function(){var d={},m={},n=runtime.getNetwork();this.getUserDetailsAndUpdates=function(r,s){var h=r.split("___")[0],a=d[h],e=m[h]=m[h]||[],k;runtime.assert(void 0!==s,"missing callback");for(k=0;k<e.length&&(e[k].subscriber!==s||e[k].memberId!==r);k+=1);k<e.length?runtime.log("double subscription request for "+r+" in NowjsUserModel::getUserDetailsAndUpdates"):(e.push({memberId:r,subscriber:s}),1===e.length&&n.subscribeUserDetailsUpdates(h));a&&s(r,a)};this.unsubscribeUserDetailsUpdates=
function(r,s){var h,a=r.split("___")[0],e=m[a];runtime.assert(void 0!==s,"missing subscriber parameter or null");runtime.assert(e,"tried to unsubscribe when no one is subscribed ('"+r+"')");if(e){for(h=0;h<e.length&&(e[h].subscriber!==s||e[h].memberId!==r);h+=1);runtime.assert(h<e.length,"tried to unsubscribe when not subscribed for memberId '"+r+"'");e.splice(h,1);0===e.length&&(runtime.log("no more subscribers for: "+r),delete m[a],delete d[a],n.unsubscribeUserDetailsUpdates(a))}};n.updateUserDetails=
function(n,s){var h=s?{userid:s.uid,fullname:s.fullname,imageurl:"/user/"+s.avatarId+"/avatar.png",color:s.color}:null,a,e;if(a=m[n])for(d[n]=h,e=0;e<a.length;e+=1)a[e].subscriber(a[e].memberId,h)};runtime.assert("ready"===n.networkStatus,"network not ready")};
// Input 57
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OperationRouter=function(){};ops.OperationRouter.prototype.setOperationFactory=function(d){};ops.OperationRouter.prototype.setPlaybackFunction=function(d){};ops.OperationRouter.prototype.push=function(d){};
// Input 58
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.TrivialOperationRouter=function(){var d,m;this.setOperationFactory=function(n){d=n};this.setPlaybackFunction=function(d){m=d};this.push=function(n){n=n.spec();n.timestamp=(new Date).getTime();n=d.create(n);m(n)}};
// Input 59
ops.NowjsOperationRouter=function(d,m){function n(b){var d;d=r.create(b);runtime.log(" op in: "+runtime.toJson(b));if(null!==d)if(b=Number(b.server_seq),runtime.assert(!isNaN(b),"server seq is not a number"),b===a+1)for(s(d),a=b,k=0,d=a+1;e.hasOwnProperty(d);d+=1)s(e[d]),delete e[d],runtime.log("op with server seq "+b+" taken from hold (reordered)");else runtime.assert(b!==a+1,"received incorrect order from server"),runtime.assert(!e.hasOwnProperty(b),"reorder_queue has incoming op"),runtime.log("op with server seq "+
b+" put on hold"),e[b]=d;else runtime.log("ignoring invalid incoming opspec: "+b)}var r,s,h=runtime.getNetwork(),a=-1,e={},k=0,b=1E3;this.setOperationFactory=function(a){r=a};this.setPlaybackFunction=function(a){s=a};h.ping=function(a){null!==m&&a(m)};h.receiveOp=function(a,b){a===d&&n(b)};this.push=function(e){e=e.spec();runtime.assert(null!==m,"Router sequence N/A without memberid");b+=1;e.client_nonce="C:"+m+":"+b;e.parent_op=a+"+"+k;k+=1;runtime.log("op out: "+runtime.toJson(e));h.deliverOp(d,
e)};this.requestReplay=function(a){h.requestReplay(d,function(a){runtime.log("replaying: "+runtime.toJson(a));n(a)},function(b){runtime.log("replay done ("+b+" ops).");a&&a()})};(function(){h.memberid=m;h.joinSession(d,function(a){runtime.assert(a,"Trying to join a session which does not exists or where we are already in")})})()};
// Input 60
gui.EditInfoHandle=function(d){var m=[],n,r=d.ownerDocument,s=r.documentElement.namespaceURI;this.setEdits=function(d){m=d;var a,e,k,b;n.innerHTML="";for(d=0;d<m.length;d+=1)a=r.createElementNS(s,"div"),a.className="editInfo",e=r.createElementNS(s,"span"),e.className="editInfoColor",e.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",m[d].memberid),k=r.createElementNS(s,"span"),k.className="editInfoAuthor",k.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",m[d].memberid),
b=r.createElementNS(s,"span"),b.className="editInfoTime",b.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",m[d].memberid),b.innerHTML=m[d].time,a.appendChild(e),a.appendChild(k),a.appendChild(b),n.appendChild(a)};this.show=function(){n.style.display="block"};this.hide=function(){n.style.display="none"};n=r.createElementNS(s,"div");n.setAttribute("class","editInfoHandle");n.style.display="none";d.appendChild(n)};
// Input 61
runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoHandle");
gui.EditInfoMarker=function(d,m){function n(b,d){return window.setTimeout(function(){a.style.opacity=b},d)}var r=this,s,h,a,e,k;this.addEdit=function(b,l){var m=Date.now()-l;d.addEdit(b,l);h.setEdits(d.getSortedEdits());a.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",b);e&&window.clearTimeout(e);k&&window.clearTimeout(k);1E4>m?(n(1,0),e=n(0.5,1E4-m),k=n(0.2,2E4-m)):1E4<=m&&2E4>m?(n(0.5,0),k=n(0.2,2E4-m)):n(0.2,0)};this.getEdits=function(){return d.getEdits()};this.clearEdits=function(){d.clearEdits();
h.setEdits([]);a.hasAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")&&a.removeAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")};this.getEditInfo=function(){return d};this.show=function(){a.style.display="block"};this.hide=function(){r.hideHandle();a.style.display="none"};this.showHandle=function(){h.show()};this.hideHandle=function(){h.hide()};(function(){var b=d.getOdtDocument().getDOM();a=b.createElementNS(b.documentElement.namespaceURI,"div");a.setAttribute("class","editInfoMarker");
a.onmouseover=function(){r.showHandle()};a.onmouseout=function(){r.hideHandle()};s=d.getNode();s.appendChild(a);h=new gui.EditInfoHandle(s);m||r.hide()})()};
// Input 62
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("gui.Caret");runtime.loadClass("ops.TrivialUserModel");runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoMarker");
gui.SessionView=function(){return function(d,m,n){function r(a,b,c){c=c.split("___")[0];return a+"."+b+'[editinfo|memberid^="'+c+'"]'}function s(a,b,c){function d(b,c,e){e=r(b,c,a)+e;a:{var f=t.firstChild;for(b=r(b,c,a);f;){if(f.nodeType===Node.TEXT_NODE&&0===f.data.indexOf(b)){b=f;break a}f=f.nextSibling}b=null}b?b.data=e:t.appendChild(document.createTextNode(e))}d("div","editInfoMarker","{ background-color: "+c+"; }");d("span","editInfoColor","{ background-color: "+c+"; }");d("span","editInfoAuthor",
':before { content: "'+b+'"; }')}function h(a){var b,d;for(d in c)c.hasOwnProperty(d)&&(b=c[d],a?b.show():b.hide())}function a(a){var b,c;for(c in l)l.hasOwnProperty(c)&&(b=l[c],a?b.showHandle():b.hideHandle())}function e(a,b){var c=l[a];void 0===b?runtime.log('UserModel sent undefined data for member "'+a+'".'):(null===b&&(b={memberid:a,fullname:"Unknown Identity",color:"black",imageurl:"avatar-joe.png"}),c&&(c.setAvatarImageUrl(b.imageurl),c.setColor(b.color)),v&&s(a,b.fullname,b.color))}function k(a){var b=
n.createCaret(a,g);a=a.getMemberId();var c=m.getUserModel();l[a]=b;e(a,null);c.getUserDetailsAndUpdates(a,e);runtime.log("+++ View here +++ eagerly created an Caret for '"+a+"'! +++")}function b(a){var b=!1,d;delete l[a];for(d in c)if(c.hasOwnProperty(d)&&c[d].getEditInfo().getEdits().hasOwnProperty(a)){b=!0;break}b||m.getUserModel().unsubscribeUserDetailsUpdates(a,e)}var l={},t,v=!0,c={},q=void 0!==d.editInfoMarkersInitiallyVisible?d.editInfoMarkersInitiallyVisible:!0,g=void 0!==d.caretAvatarsInitiallyVisible?
d.caretAvatarsInitiallyVisible:!0;this.enableEditHighlighting=function(){v||(v=!0)};this.disableEditHighlighting=function(){v&&(v=!1)};this.showEditInfoMarkers=function(){q||(q=!0,h(q))};this.hideEditInfoMarkers=function(){q&&(q=!1,h(q))};this.showCaretAvatars=function(){g||(g=!0,a(g))};this.hideCaretAvatars=function(){g&&(g=!1,a(g))};this.getSession=function(){return m};this.getCaret=function(a){return l[a]};(function(){var a=m.getOdtDocument(),d=document.getElementsByTagName("head")[0];a.subscribe(ops.OdtDocument.signalCursorAdded,
k);a.subscribe(ops.OdtDocument.signalCursorRemoved,b);a.subscribe(ops.OdtDocument.signalParagraphChanged,function(a){var b=a.paragraphElement,d=a.memberId;a=a.timeStamp;var e,f="",g=b.getElementsByTagNameNS("urn:webodf:names:editinfo","editinfo")[0];g?(f=g.getAttributeNS("urn:webodf:names:editinfo","id"),e=c[f]):(f=Math.random().toString(),e=new ops.EditInfo(b,m.getOdtDocument()),e=new gui.EditInfoMarker(e,q),g=b.getElementsByTagNameNS("urn:webodf:names:editinfo","editinfo")[0],g.setAttributeNS("urn:webodf:names:editinfo",
"id",f),c[f]=e);e.addEdit(d,new Date(a))});t=document.createElementNS(d.namespaceURI,"style");t.type="text/css";t.media="screen, print, handheld, projection";t.appendChild(document.createTextNode("@namespace editinfo url(urn:webodf:names:editinfo);"));d.appendChild(t)})()}}();
// Input 63
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("gui.Caret");gui.CaretFactory=function(d){this.createCaret=function(m,n){var r=m.getMemberId(),s=d.getSession().getOdtDocument(),h=s.getOdfCanvas().getElement(),a=new gui.Caret(m,n);r===d.getInputMemberId()&&(runtime.log("Starting to track input on new cursor of "+r),s.subscribe(ops.OdtDocument.signalParagraphChanged,function(d){d.memberId===r&&a.ensureVisible()}),m.handleUpdate=a.ensureVisible,h.setAttribute("tabindex",0),h.onfocus=a.setFocus,h.onblur=a.removeFocus,h.focus());return a}};
// Input 64
runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.Namespaces");
gui.PresenterUI=function(){var d=new xmldom.XPath;return function(m){var n=this;n.setInitialSlideMode=function(){n.startSlideMode("single")};n.keyDownHandler=function(d){if(!d.target.isContentEditable&&"input"!==d.target.nodeName)switch(d.keyCode){case 84:n.toggleToolbar();break;case 37:case 8:n.prevSlide();break;case 39:case 32:n.nextSlide();break;case 36:n.firstSlide();break;case 35:n.lastSlide()}};n.root=function(){return n.odf_canvas.odfContainer().rootElement};n.firstSlide=function(){n.slideChange(function(d,
n){return 0})};n.lastSlide=function(){n.slideChange(function(d,n){return n-1})};n.nextSlide=function(){n.slideChange(function(d,n){return d+1<n?d+1:-1})};n.prevSlide=function(){n.slideChange(function(d,n){return 1>d?-1:d-1})};n.slideChange=function(d){var m=n.getPages(n.odf_canvas.odfContainer().rootElement),h=-1,a=0;m.forEach(function(d){d=d[1];d.hasAttribute("slide_current")&&(h=a,d.removeAttribute("slide_current"));a+=1});d=d(h,m.length);-1===d&&(d=h);m[d][1].setAttribute("slide_current","1");
document.getElementById("pagelist").selectedIndex=d;"cont"===n.slide_mode&&window.scrollBy(0,m[d][1].getBoundingClientRect().top-30)};n.selectSlide=function(d){n.slideChange(function(n,h){return d>=h||0>d?-1:d})};n.scrollIntoContView=function(d){var m=n.getPages(n.odf_canvas.odfContainer().rootElement);0!==m.length&&window.scrollBy(0,m[d][1].getBoundingClientRect().top-30)};n.getPages=function(d){d=d.getElementsByTagNameNS(odf.Namespaces.drawns,"page");var n=[],h;for(h=0;h<d.length;h+=1)n.push([d[h].getAttribute("draw:name"),
d[h]]);return n};n.fillPageList=function(m,s){for(var h=n.getPages(m),a,e,k;s.firstChild;)s.removeChild(s.firstChild);for(a=0;a<h.length;a+=1)e=document.createElement("option"),k=d.getODFElementsWithXPath(h[a][1],'./draw:frame[@presentation:class="title"]//draw:text-box/text:p',xmldom.XPath),k=0<k.length?k[0].textContent:h[a][0],e.textContent=a+1+": "+k,s.appendChild(e)};n.startSlideMode=function(d){var m=document.getElementById("pagelist"),h=n.odf_canvas.slidevisibilitycss().sheet;for(n.slide_mode=
d;0<h.cssRules.length;)h.deleteRule(0);n.selectSlide(0);"single"===n.slide_mode?(h.insertRule("draw|page { position:fixed; left:0px;top:30px; z-index:1; }",0),h.insertRule("draw|page[slide_current]  { z-index:2;}",1),h.insertRule("draw|page  { -webkit-transform: scale(1);}",2),n.fitToWindow(),window.addEventListener("resize",n.fitToWindow,!1)):"cont"===n.slide_mode&&window.removeEventListener("resize",n.fitToWindow,!1);n.fillPageList(n.odf_canvas.odfContainer().rootElement,m)};n.toggleToolbar=function(){var d,
m,h;d=n.odf_canvas.slidevisibilitycss().sheet;m=-1;for(h=0;h<d.cssRules.length;h+=1)if(".toolbar"===d.cssRules[h].cssText.substring(0,8)){m=h;break}-1<m?d.deleteRule(m):d.insertRule(".toolbar { position:fixed; left:0px;top:-200px; z-index:0; }",0)};n.fitToWindow=function(){var d=n.getPages(n.root()),m=(window.innerHeight-40)/d[0][1].clientHeight,d=(window.innerWidth-10)/d[0][1].clientWidth,m=m<d?m:d,d=n.odf_canvas.slidevisibilitycss().sheet;d.deleteRule(2);d.insertRule("draw|page { \n-moz-transform: scale("+
m+"); \n-moz-transform-origin: 0% 0%; -webkit-transform-origin: 0% 0%; -webkit-transform: scale("+m+"); -o-transform-origin: 0% 0%; -o-transform: scale("+m+"); -ms-transform-origin: 0% 0%; -ms-transform: scale("+m+"); }",2)};n.load=function(d){n.odf_canvas.load(d)};n.odf_element=m;n.odf_canvas=new odf.OdfCanvas(n.odf_element);n.odf_canvas.addListener("statereadychange",n.setInitialSlideMode);n.slide_mode="undefined";document.addEventListener("keydown",n.keyDownHandler,!1)}}();
// Input 65
runtime.loadClass("core.PositionIterator");runtime.loadClass("core.Cursor");
gui.XMLEdit=function(d,m){function n(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c}function r(a){a.preventDefault?a.preventDefault():a.returnValue=!1}function s(){var a=d.ownerDocument.defaultView.getSelection();!a||(0>=a.rangeCount||!g)||(a=a.getRangeAt(0),g.setPoint(a.startContainer,a.startOffset))}function h(){var a=d.ownerDocument.defaultView.getSelection(),b,c;a.removeAllRanges();g&&g.node()&&(b=g.node(),c=b.ownerDocument.createRange(),
c.setStart(b,g.position()),c.collapse(!0),a.addRange(c))}function a(a){var b=a.charCode||a.keyCode;if(g=null,g&&37===b)s(),g.stepBackward(),h();else if(16<=b&&20>=b||33<=b&&40>=b)return;r(a)}function e(a){}function k(a){d.ownerDocument.defaultView.getSelection().getRangeAt(0);r(a)}function b(a){for(var c=a.firstChild;c&&c!==a;)c.nodeType===Node.ELEMENT_NODE&&b(c),c=c.nextSibling||c.parentNode;var d,e,g,c=a.attributes;d="";for(g=c.length-1;0<=g;g-=1)e=c.item(g),d=d+" "+e.nodeName+'="'+e.nodeValue+
'"';a.setAttribute("customns_name",a.nodeName);a.setAttribute("customns_atts",d);c=a.firstChild;for(e=/^\s*$/;c&&c!==a;)d=c,c=c.nextSibling||c.parentNode,d.nodeType===Node.TEXT_NODE&&e.test(d.nodeValue)&&d.parentNode.removeChild(d)}function l(a,b){for(var c=a.firstChild,d,e,g;c&&c!==a;){if(c.nodeType===Node.ELEMENT_NODE)for(l(c,b),d=c.attributes,g=d.length-1;0<=g;g-=1)e=d.item(g),"http://www.w3.org/2000/xmlns/"!==e.namespaceURI||b[e.nodeValue]||(b[e.nodeValue]=e.localName);c=c.nextSibling||c.parentNode}}
function t(){var a=d.ownerDocument.createElement("style"),b;b={};l(d,b);var c={},e,g,h=0;for(e in b)if(b.hasOwnProperty(e)&&e){g=b[e];if(!g||c.hasOwnProperty(g)||"xmlns"===g){do g="ns"+h,h+=1;while(c.hasOwnProperty(g));b[e]=g}c[g]=!0}a.type="text/css";b="@namespace customns url(customns);\n"+v;a.appendChild(d.ownerDocument.createTextNode(b));m=m.parentNode.replaceChild(a,m)}var v,c,q,g=null;d.id||(d.id="xml"+String(Math.random()).substring(2));c="#"+d.id+" ";v=c+"*,"+c+":visited, "+c+":link {display:block; margin: 0px; margin-left: 10px; font-size: medium; color: black; background: white; font-variant: normal; font-weight: normal; font-style: normal; font-family: sans-serif; text-decoration: none; white-space: pre-wrap; height: auto; width: auto}\n"+
c+":before {color: blue; content: '<' attr(customns_name) attr(customns_atts) '>';}\n"+c+":after {color: blue; content: '</' attr(customns_name) '>';}\n"+c+"{overflow: auto;}\n";(function(b){n(b,"click",k);n(b,"keydown",a);n(b,"keypress",e);n(b,"drop",r);n(b,"dragend",r);n(b,"beforepaste",r);n(b,"paste",r)})(d);this.updateCSS=t;this.setXML=function(a){a=a.documentElement||a;q=a=d.ownerDocument.importNode(a,!0);for(b(a);d.lastChild;)d.removeChild(d.lastChild);d.appendChild(a);t();g=new core.PositionIterator(a)};
this.getXML=function(){return q}};
// Input 66
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.EventNotifier");runtime.loadClass("odf.OdfUtils");
ops.OdtDocument=function(d){function m(a){var b=a&&a.localName;return("p"===b||"h"===b)&&a.namespaceURI===e}function n(a){var d=gui.SelectionMover.createPositionIterator(k);for(a+=1;0<a&&d.nextPosition();)1===b.acceptPosition(d)&&(a-=1);return d}function r(a){for(;a&&!m(a);)a=a.parentNode;return a}function s(a){return d.getFormatting().getStyleElement(a,"paragraph")}function h(a,b){runtime.assert(" "===a.data[b],"upgradeWhitespaceToElement: textNode.data[offset] should be a literal space");var d=
a.ownerDocument.createElementNS(e,"text:s");d.appendChild(a.ownerDocument.createTextNode(" "));a.deleteData(b,1);a.splitText(b);a.parentNode.insertBefore(d,a.nextSibling)}var a=this,e="urn:oasis:names:tc:opendocument:xmlns:text:1.0",k,b,l,t={},v=new core.EventNotifier([ops.OdtDocument.signalCursorAdded,ops.OdtDocument.signalCursorRemoved,ops.OdtDocument.signalCursorMoved,ops.OdtDocument.signalParagraphChanged,ops.OdtDocument.signalParagraphStyleModified,ops.OdtDocument.signalStyleCreated,ops.OdtDocument.signalStyleDeleted,
ops.OdtDocument.signalTableAdded,ops.OdtDocument.signalOperationExecuted]);this.getIteratorAtPosition=n;this.getTextNeighborhood=function(a,b){var d=n(a),e=[],f=[],h=d.container(),k,l=!1,m=!0,r;k=0;do{f=d.textNeighborhood();h=d.container();l=!1;for(r=0;r<e.length;r+=1)if(e[r]===f[0]){l=!0;break}if(!l){0>b&&f.reverse();if(m){for(l=0;l<f.length;l+=1)if(f[l]===h){f.splice(0,l);break}0>b&&f.splice(0,1);m=!1}f.length&&(e=e.concat(f));for(l=0;l<f.length;l+=1)k+=f[l].data.length}}while(!0===(0<b?d.nextPosition():
d.previousPosition())&&k<Math.abs(b));return e};this.upgradeWhitespaceToElement=h;this.upgradeWhitespacesAtPosition=function(a){a=n(a);var b=null,d,e=0;a.previousPosition();a.previousPosition();for(e=-2;2>=e;e+=1)b=a.container(),d=a.unfilteredDomOffset(),b.nodeType===Node.TEXT_NODE&&(" "===b.data[d]&&l.isSignificantWhitespace(b,d))&&h(b,d),a.nextPosition()};this.getParagraphStyleElement=s;this.getParagraphElement=r;this.getParagraphStyleAttributes=function(a){return(a=s(a))?d.getFormatting().getInheritedStyleAttributes(a):
null};this.getPositionInTextNode=function(a,d){var e=gui.SelectionMover.createPositionIterator(k),h=null,f,l=0,m=null;runtime.assert(0<=a,"position must be >= 0");1===b.acceptPosition(e)?(f=e.container(),f.nodeType===Node.TEXT_NODE&&(h=f,l=0)):a+=1;for(;0<a||null===h;){if(!e.nextPosition())return null;if(1===b.acceptPosition(e))if(a-=1,f=e.container(),f.nodeType===Node.TEXT_NODE)f!==h?(h=f,l=e.domOffset()):l+=1;else if(null!==h){if(0===a){l=h.length;break}h=null}else if(0===a){h=k.ownerDocument.createTextNode("");
f.insertBefore(h,e.rightNode());l=0;break}}if(null===h)return null;if(d&&t[d]){for(m=t[d].getNode();0===l&&m.nextSibling&&"cursor"===m.nextSibling.localName;)m.parentNode.insertBefore(m,m.nextSibling.nextSibling);m&&0<h.length&&(h=k.ownerDocument.createTextNode(""),l=0,m.parentNode.insertBefore(h,m.nextSibling))}for(;0===l&&(h.previousSibling&&"cursor"===h.previousSibling.localName)&&(f=h.previousSibling,0<h.length&&(h=k.ownerDocument.createTextNode("")),f.parentNode.insertBefore(h,f),m!==f););for(;h.previousSibling&&
h.previousSibling.nodeType===Node.TEXT_NODE;)h.previousSibling.appendData(h.data),l=h.length+h.previousSibling.length,h=h.previousSibling,h.parentNode.removeChild(h.nextSibling);return{textNode:h,offset:l}};this.getNeighboringParagraph=function(a,d){var e=n(0),h=null;e.setPosition(a,0);do if(1===b.acceptPosition(e)&&(h=r(e.container()),h!==a))return h;while(!0===(0<d?e.nextPosition():e.previousPosition()));if(h===a)return null};this.getWalkableParagraphLength=function(a){var d=n(0),e=0;d.setPosition(a,
0);do{if(r(d.container())!==a)break;1===b.acceptPosition(d)&&(e+=1)}while(d.nextPosition());return e};this.getDistanceFromCursor=function(a,d,e){a=t[a];var h=0;runtime.assert(null!==d&&void 0!==d,"OdtDocument.getDistanceFromCursor called without node");a&&(a=a.getStepCounter().countStepsToPosition,h=a(d,e,b));return h};this.getCursorPosition=function(b){return-a.getDistanceFromCursor(b,k,0)};this.getCursorSelection=function(a){var d;a=t[a];var e=0;d=0;a&&(d=a.getStepCounter().countStepsToPosition,
e=-d(k,0,b),d=d(a.getAnchorNode(),0,b));return{position:e+d,length:-d}};this.getPositionFilter=function(){return b};this.getOdfCanvas=function(){return d};this.getRootNode=function(){return k};this.getDOM=function(){return k.ownerDocument};this.getCursor=function(a){return t[a]};this.getCursors=function(){var a=[],b;for(b in t)t.hasOwnProperty(b)&&a.push(t[b]);return a};this.addCursor=function(a){runtime.assert(Boolean(a),"OdtDocument::addCursor without cursor");var d=a.getStepCounter().countForwardSteps(1,
b),e=a.getMemberId();runtime.assert(Boolean(e),"OdtDocument::addCursor has cursor without memberid");a.move(d);t[e]=a};this.removeCursor=function(a){var b=t[a];return b?(b.removeFromOdtDocument(),delete t[a],!0):!1};this.getMetaData=function(a){for(var b=d.odfContainer().rootElement.firstChild;b&&"meta"!==b.localName;)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.localName!==a;)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.nodeType!==Node.TEXT_NODE;)b=b.nextSibling;return b?b.data:null};this.getFormatting=
function(){return d.getFormatting()};this.emit=function(a,b){v.emit(a,b)};this.subscribe=function(a,b){v.subscribe(a,b)};b=new function(){function a(c,e,h){var k,n;if(e&&(k=l.lookLeftForCharacter(e),1===k||2===k&&(l.scanRightForAnyCharacter(h)||l.scanRightForAnyCharacter(l.nextNode(c)))))return b;k=null===e&&m(c);n=l.lookRightForCharacter(h);if(k)return n?b:l.scanRightForAnyCharacter(h)?d:b;if(!n)return d;e=e||l.previousNode(c);return l.scanLeftForAnyCharacter(e)?d:b}var b=core.PositionFilter.FilterResult.FILTER_ACCEPT,
d=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(e){var f=e.container(),h=f.nodeType,k,m,n;if(h!==Node.ELEMENT_NODE&&h!==Node.TEXT_NODE)return d;if(h===Node.TEXT_NODE){if(!l.isGroupingElement(f.parentNode))return d;h=e.unfilteredDomOffset();k=f.data;runtime.assert(h!==k.length,"Unexpected offset.");if(0<h){e=k.substr(h-1,1);if(!l.isODFWhitespace(e))return b;if(1<h)if(e=k.substr(h-2,1),!l.isODFWhitespace(e))m=b;else{if(!l.isODFWhitespace(k.substr(0,h)))return d}else n=
l.previousNode(f),l.scanLeftForNonWhitespace(n)&&(m=b);if(m===b)return l.isTrailingWhitespace(f,h)?d:b;m=k.substr(h,1);return l.isODFWhitespace(m)?d:l.scanLeftForAnyCharacter(l.previousNode(f))?d:b}n=e.leftNode();m=f;f=f.parentNode;m=a(f,n,m)}else l.isGroupingElement(f)?(n=e.leftNode(),m=e.rightNode(),m=a(f,n,m)):m=d;return m}};k=function(a){for(a=a.rootElement.firstChild;a&&"body"!==a.localName;)a=a.nextSibling;for(a=a&&a.firstChild;a&&"text"!==a.localName;)a=a.nextSibling;return a}(d.odfContainer());
l=new odf.OdfUtils};ops.OdtDocument.signalCursorAdded="cursor/added";ops.OdtDocument.signalCursorRemoved="cursor/removed";ops.OdtDocument.signalCursorMoved="cursor/moved";ops.OdtDocument.signalParagraphChanged="paragraph/changed";ops.OdtDocument.signalTableAdded="table/added";ops.OdtDocument.signalStyleCreated="style/created";ops.OdtDocument.signalStyleDeleted="style/deleted";ops.OdtDocument.signalParagraphStyleModified="paragraphstyle/modified";ops.OdtDocument.signalOperationExecuted="operation/executed";
(function(){return ops.OdtDocument})();
// Input 67
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("ops.TrivialUserModel");runtime.loadClass("ops.TrivialOperationRouter");runtime.loadClass("ops.OperationFactory");runtime.loadClass("ops.OdtDocument");
ops.Session=function(d){var m=new ops.OdtDocument(d),n=new ops.TrivialUserModel,r=null;this.setUserModel=function(d){n=d};this.setOperationRouter=function(d){r=d;d.setPlaybackFunction(function(d){d.execute(m);m.emit(ops.OdtDocument.signalOperationExecuted,d)});d.setOperationFactory(new ops.OperationFactory)};this.getUserModel=function(){return n};this.getOdtDocument=function(){return m};this.enqueue=function(d){r.push(d)};this.setOperationRouter(new ops.TrivialOperationRouter)};
// Input 68
var webodf_css="@namespace draw url(urn:oasis:names:tc:opendocument:xmlns:drawing:1.0);\n@namespace fo url(urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0);\n@namespace office url(urn:oasis:names:tc:opendocument:xmlns:office:1.0);\n@namespace presentation url(urn:oasis:names:tc:opendocument:xmlns:presentation:1.0);\n@namespace style url(urn:oasis:names:tc:opendocument:xmlns:style:1.0);\n@namespace svg url(urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0);\n@namespace table url(urn:oasis:names:tc:opendocument:xmlns:table:1.0);\n@namespace text url(urn:oasis:names:tc:opendocument:xmlns:text:1.0);\n@namespace runtimens url(urn:webodf); /* namespace for runtime only */\n@namespace cursor url(urn:webodf:names:cursor);\n@namespace editinfo url(urn:webodf:names:editinfo);\n\noffice|document > *, office|document-content > * {\n  display: none;\n}\noffice|body, office|document {\n  display: inline-block;\n  position: relative;\n}\n\ntext|p, text|h {\n  display: block;\n  padding: 0;\n  margin: 0;\n  line-height: normal;\n  position: relative;\n  min-height: 1.3em; /* prevent empty paragraphs and headings from collapsing if they are empty */\n}\n*[runtimens|containsparagraphanchor] {\n  position: relative;\n}\ntext|s {\n    white-space: pre;\n}\ntext|tab {\n  display: inline;\n  white-space: pre;\n}\ntext|line-break {\n  content: \" \";\n  display: block;\n}\ntext|tracked-changes {\n  /*Consumers that do not support change tracking, should ignore changes.*/\n  display: none;\n}\noffice|binary-data {\n  display: none;\n}\noffice|text {\n  display: block;\n  text-align: left;\n  overflow: visible;\n  word-wrap: break-word;\n}\noffice|spreadsheet {\n  display: block;\n  border-collapse: collapse;\n  empty-cells: show;\n  font-family: sans-serif;\n  font-size: 10pt;\n  text-align: left;\n  page-break-inside: avoid;\n  overflow: hidden;\n}\noffice|presentation {\n  display: inline-block;\n  text-align: left;\n}\n#shadowContent {\n  display: inline-block;\n  text-align: left;\n}\ndraw|page {\n  display: block;\n  position: relative;\n  overflow: hidden;\n}\npresentation|notes, presentation|footer-decl, presentation|date-time-decl {\n    display: none;\n}\n@media print {\n  draw|page {\n    border: 1pt solid black;\n    page-break-inside: avoid;\n  }\n  presentation|notes {\n    /*TODO*/\n  }\n}\noffice|spreadsheet text|p {\n  border: 0px;\n  padding: 1px;\n  margin: 0px;\n}\noffice|spreadsheet table|table {\n  margin: 3px;\n}\noffice|spreadsheet table|table:after {\n  /* show sheet name the end of the sheet */\n  /*content: attr(table|name);*/ /* gives parsing error in opera */\n}\noffice|spreadsheet table|table-row {\n  counter-increment: row;\n}\noffice|spreadsheet table|table-row:before {\n  width: 3em;\n  background: #cccccc;\n  border: 1px solid black;\n  text-align: center;\n  content: counter(row);\n  display: table-cell;\n}\noffice|spreadsheet table|table-cell {\n  border: 1px solid #cccccc;\n}\ntable|table {\n  display: table;\n}\ndraw|frame table|table {\n  width: 100%;\n  height: 100%;\n  background: white;\n}\ntable|table-header-rows {\n  display: table-header-group;\n}\ntable|table-row {\n  display: table-row;\n}\ntable|table-column {\n  display: table-column;\n}\ntable|table-cell {\n  width: 0.889in;\n  display: table-cell;\n  word-break: break-all; /* prevent long words from extending out the table cell */\n}\ndraw|frame {\n  display: block;\n}\ndraw|image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  top: 0px;\n  left: 0px;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  -moz-background-size: 100% 100%;\n}\n/* only show the first image in frame */\ndraw|frame > draw|image:nth-of-type(n+2) {\n  display: none;\n}\ntext|list:before {\n    display: none;\n    content:\"\";\n}\ntext|list {\n    counter-reset: list;\n}\ntext|list-item {\n    display: block;\n}\ntext|number {\n    display:none;\n}\n\ntext|a {\n    color: blue;\n    text-decoration: underline;\n    cursor: pointer;\n}\ntext|note-citation {\n    vertical-align: super;\n    font-size: smaller;\n}\ntext|note-body {\n    display: none;\n}\ntext|note:hover text|note-citation {\n    background: #dddddd;\n}\ntext|note:hover text|note-body {\n    display: block;\n    left:1em;\n    max-width: 80%;\n    position: absolute;\n    background: #ffffaa;\n}\nsvg|title, svg|desc {\n    display: none;\n}\nvideo {\n    width: 100%;\n    height: 100%\n}\n\n/* below set up the cursor */\ncursor|cursor {\n    display: inline;\n    width: 0px;\n    height: 1em;\n    /* making the position relative enables the avatar to use\n       the cursor as reference for its absolute position */\n    position: relative;\n}\ncursor|cursor > span {\n    display: inline;\n    position: absolute;\n    height: 1em;\n    border-left: 2px solid black;\n    outline: none;\n}\n\ncursor|cursor > div {\n    padding: 3px;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    border: none !important;\n    border-radius: 5px;\n    opacity: 0.3;\n}\n\ncursor|cursor > div > img {\n    border-radius: 5px;\n}\n\ncursor|cursor > div.active {\n    opacity: 0.8;\n}\n\ncursor|cursor > div:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 43%;\n}\n\n\n.editInfoMarker {\n    position: absolute;\n    width: 10px;\n    height: 100%;\n    left: -20px;\n    opacity: 0.8;\n    top: 0;\n    border-radius: 5px;\n    background-color: transparent;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n}\n.editInfoMarker:hover {\n    box-shadow: 0px 0px 8px rgba(0, 0, 0, 1);\n}\n\n.editInfoHandle {\n    position: absolute;\n    background-color: black;\n    padding: 5px;\n    border-radius: 5px;\n    opacity: 0.8;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    bottom: 100%;\n    margin-bottom: 10px;\n    z-index: 3;\n    left: -25px;\n}\n.editInfoHandle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 5px;\n}\n.editInfo {\n    font-family: sans-serif;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    color: white;\n    width: 100%;\n    height: 12pt;\n}\n.editInfoColor {\n    float: left;\n    width: 10pt;\n    height: 10pt;\n    border: 1px solid white;\n}\n.editInfoAuthor {\n    float: left;\n    margin-left: 5pt;\n    font-size: 10pt;\n    text-align: left;\n    height: 12pt;\n    line-height: 12pt;\n}\n.editInfoTime {\n    float: right;\n    margin-left: 30pt;\n    font-size: 8pt;\n    font-style: italic;\n    color: yellow;\n    height: 12pt;\n    line-height: 12pt;\n}\n";
