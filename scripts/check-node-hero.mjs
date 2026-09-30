import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9226/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(m.error)p?.reject(m.error);else p?.resolve(m.result);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const run=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='docs/node-integration';await fs.mkdir(out,{recursive:true});
async function ready(){for(let i=0;i<100;i++){if(await run(`!!document.querySelector('canvas[data-node-progress]')`))return;await wait(300);}throw new Error('NODE not ready');}
async function metrics(){return run(`(()=>{const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,opacity:getComputedStyle(e).opacity,inert:e.inert}};return {progress:JSON.parse(document.querySelector('canvas')?.getAttribute('data-node-progress')||'null'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,pins:document.querySelectorAll('.pin-spacer').length,identity:rect('[data-hero-identity]'),stage:rect('[data-node-stage]'),project:rect('[data-project-screen]'),projectGroup:rect('[data-featured-project]'),navbar:rect('nav'),navbarHit:!!document.elementFromPoint(innerWidth/2,40)?.closest('nav'),canvasCount:document.querySelectorAll('canvas').length}})()`);}
async function pose(t){await run(`window.scrollTo({top:${t}*innerHeight*1.5,behavior:'instant'})`);await wait(1400);return metrics();}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));}
function aligned(m){const [a,b]=m.progress.screen;const p=m.project;const error=Math.max(Math.abs(a[0]-p.x),Math.abs(a[1]-p.y),Math.abs(b[0]-p.x-p.w),Math.abs(b[1]-p.y-p.h));assert.ok(error<2,`Screen mismatch ${error}px`);return error;}
const result={states:{},widths:[],errors};
try{
 await call('Page.enable');await call('Page.navigate',{url:'about:blank'});await wait(300);await call('Runtime.discardConsoleEntries');await call('Runtime.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://localhost:3100/'});await ready();
 for(const [name,t] of [['start',0],['centered',1.05],['exploded',1.53],['web-focus',1.80],['handoff',2.04],['project',2.18]]){
   result.states[name]=await pose(t);await shot(name);assert.equal(result.states[name].overflow,0);assert.equal(result.states[name].pins,1);
 }
 result.alignmentErrorPx=aligned(result.states.project);
 for(const [name,t] of [['reverse-exploded',1.53],['reverse-centered',1.05],['reverse-start',0]]){result.states[name]=await pose(t);}
 assert.ok(Number(result.states['reverse-start'].identity.opacity)>.99);assert.equal(result.states['reverse-start'].progress.explode,0);
 result.liveResize=[];
 for(const width of [1280,1440,1728]){
   await pose(2.18);
   await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await wait(1400);
   const m=await pose(1.05);const error=Math.abs(m.stage.x+m.stage.w/2-width/2);result.liveResize.push({width,error,metrics:m});assert.ok(error<2,`Live resize centering ${error}px`);
 }
 for(const width of [1280,1440,1728]){
   await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:'http://localhost:3100/'});await ready();await wait(600);
   const centered=await pose(1.05);assert.ok(Math.abs(centered.stage.x+centered.stage.w/2-width/2)<2);
   const final=await pose(2.18);assert.equal(final.overflow,0);result.widths.push({width,centered,final,alignmentErrorPx:aligned(final)});
 }
 await pose(1.53);await call('Page.reload');await ready();await wait(1400);result.reloadMiddle=await metrics();assert.equal(result.reloadMiddle.pins,1);
 await pose(0);await call('Page.reload');await ready();await wait(1000);result.reloadTop=await metrics();assert.ok(Number(result.reloadTop.identity.opacity)>.99);
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(1000);result.reduced=await metrics();await shot('reduced-motion');assert.equal(result.reduced.canvasCount,0);assert.equal(result.reduced.pins,0);assert.ok(Number(result.reduced.identity.opacity)>.99);assert.equal(result.reduced.projectGroup.inert,false);
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Emulation.setEmulatedMedia',{features:[]});await run('scrollTo(0,0)');await wait(1000);result.mobile=await metrics();await shot('mobile');assert.equal(result.mobile.canvasCount,0);assert.equal(result.mobile.pins,0);assert.equal(result.mobile.overflow,0);
 assert.equal(errors.length,0);
}finally{await fs.writeFile(`${out}/runtime.json`,JSON.stringify(result,null,2));ws.close();}
console.log(JSON.stringify({states:Object.keys(result.states),alignmentErrorPx:result.alignmentErrorPx,widths:result.widths.map(w=>({width:w.width,error:w.alignmentErrorPx})),errors},null,2));
