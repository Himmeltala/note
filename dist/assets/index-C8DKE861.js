function l(t,r){const e=r?new Date(r):new Date,n={YY:String(e.getFullYear()),MM:String(e.getMonth()+1).padStart(2,"0"),DD:String(e.getDate()).padStart(2,"0"),hh:String(e.getHours()).padStart(2,"0"),mm:String(e.getMinutes()).padStart(2,"0"),ss:String(e.getSeconds()).padStart(2,"0")};let o=t;for(const[a,u]of Object.entries(n))o=o.replace(a,u);return o}function s(t,r){const e=r||new Date,n={YY:String(e.getFullYear()).padStart(2,"0"),MM:String(e.getMonth()+1).padStart(2,"0"),DD:String(e.getDate()).padStart(2,"0"),hh:String(e.getHours()).padStart(2,"0"),mm:String(e.getMinutes()).padStart(2,"0"),ss:String(e.getSeconds()).padStart(2,"0")};let o=t;for(const[a,u]of Object.entries(n))typeof u=="string"&&(o=o.replace(a,u));return new Date(o)}const d=Object.freeze(Object.defineProperty({__proto__:null,formatDate:l,nowDate:s},Symbol.toStringTag,{value:"Module"})),g=async(t,r,e)=>{t&&await t.validate(n=>{n?r&&r():e&&e()})},f=(t,r,e)=>{if(!r)return e(new Error("请输入正确格式的金额！"));setTimeout(()=>{const n=r.toString().length;n>=1&&n<=20?e():e(new Error("金额在 1~9 位数！"))},20)};function c(t,r,e){return!(t.getFullYear()===Number(r)&&t.getMonth()===Number(e)-1&&t.getDate()>=1&&t.getDate()<=31)}const S=Object.freeze(Object.defineProperty({__proto__:null,disabledDate:c,formValidator:g,validateMoney:f},Symbol.toStringTag,{value:"Module"}));function p(t){if(typeof t!="object"||t===null)return!1;for(const r in t)if(Object.prototype.hasOwnProperty.call(t,r))return!0;return!1}function M(t){return JSON.parse(JSON.stringify(t))}const h=Object.freeze(Object.defineProperty({__proto__:null,hasProperties:p,raw:M},Symbol.toStringTag,{value:"Module"}));var i;(t=>{t.Dates=d,t.Forms=S,t.Objects=h;function r(n,o){const a=n.indexOf(o);return a!==-1?n.length===1?null:(n.splice(a,1),a===n.length?n[0]:n[a]):null}t.deleteAndReturnNext=r,t.createFilter=n=>o=>o.value.includes(n);function e(n){const o=["K","M","B","T"];let a=-1,u=n;for(;u>=1e3&&a<o.length-1;)u/=1e3,a++;return u=Math.round(u*1e3)/1e3,a===-1?n.toString():u+o[a]}t.formatNumberWithUnits=e})(i||(i={}));export{i as U,c as d};
