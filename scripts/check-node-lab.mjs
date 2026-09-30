import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const pages = await (await fetch('http://127.0.0.1:9226/json')).json();
const page = pages.find(p=>p.type==='page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', e => {
  const m=JSON.parse(e.data);
  if(m.id){ const p=pending.get(m.id); if(m.error) p?.reject(m.error); else p?.resolve(m.result); pending.delete(m.id); }
  if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if(m.method==='Runtime.consoleAPICalled' && m.params.type==='error') errors.push(m.params.args);
});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{
  const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){for(let n=0;n<90;n++){if(await evaluate(`Number(document.querySelector('[data-lab-stats]')?.dataset.triangles)>0`))return;await wait(500);}throw new Error('Asset did not become ready');}
const metrics=()=>evaluate(`({state:document.querySelector('[data-lab-state]').textContent,triangles:Number(document.querySelector('[data-lab-stats]').dataset.triangles),calls:Number(document.querySelector('[data-lab-stats]').dataset.calls),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,pins:document.querySelectorAll('.pin-spacer').length})`);
async function click(text){await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(text)}).click()`);await wait(800);}
async function capture(name){const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`assets/node-7388/${name}.png`,Buffer.from(screenshot.data,'base64'));return metrics();}

try {
  await call('Page.enable');
  await call('Page.navigate',{url:'about:blank'}); await wait(500);
  await call('Runtime.discardConsoleEntries');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://localhost:3100/node-lab'}); await ready(); await wait(1200);
  const result={states:{},errors};
  result.states.assembled=await capture('assembled');
  await click('EXPLODED');result.states.exploded=await capture('exploded');
  await click('WEB FOCUS');result.states.web=await capture('web-focus');
  await click('ASSEMBLED');result.reassembled=await metrics();
  for (const state of Object.values(result.states)) {
    assert.ok(state.calls < 50);assert.ok(state.triangles >= 30000 && state.triangles <= 80000);
    assert.equal(state.overflow,0);assert.equal(state.pins,0);
  }
  assert.equal(result.reassembled.triangles,result.states.assembled.triangles);
  assert.equal(result.reassembled.calls,result.states.assembled.calls);
  result.widths=[];
  for(const width of [1280,1440,1728]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await wait(500);
    for (const state of ['ASSEMBLED','EXPLODED','WEB FOCUS']) {
      await click(state);
      const m=await metrics();assert.equal(m.overflow,0);assert.equal(m.pins,0);assert.ok(m.calls<50);result.widths.push({width,...m});
    }
  }
  await call('Page.reload');await ready();result.reload=await metrics();
  await fs.writeFile('assets/node-7388/runtime.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  assert.equal(errors.length,0);
} finally { ws.close(); }
