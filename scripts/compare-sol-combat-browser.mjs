// Local Chromium acceptance; native input/ticks only. No actor or HP writes.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
const label=process.argv[2]||'after';
const output=resolve('artifacts',label);mkdirSync(output,{recursive:true});
const children=[],pending=new Map();let socket,id=0;
const root='http://127.0.0.1:4197/browser-ink-tps/';
async function until(fn,ms=60000){const end=Date.now()+ms;while(Date.now()<end){const v=await fn();if(v)return v;await sleep(500);}throw Error('TIMEOUT');}
async function cmd(method,params={}){const n=++id;return new Promise((yes,no)=>{const timer=setTimeout(()=>{pending.delete(n);no(Error(method+' timeout'));},20000);pending.set(n,{yes:r=>{clearTimeout(timer);yes(r);},no});socket.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
const snapshot=()=>evaluate('window.__t21F3.snapshot()');
async function screenshot(name){const r=await cmd('Page.captureScreenshot',{format:'png'});writeFileSync(resolve(output,name+'.png'),Buffer.from(r.data,'base64'));}
async function key(type,key,code,n){await cmd('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n});}
async function clickButton(){await cmd('Page.bringToFront');const p=await evaluate(`(()=>{const r=document.querySelector('#t21-f3-b202-resume').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'none'});for(const type of ['mousePressed','mouseReleased'])await cmd('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});}
const samples=[];
try{
 children.push(spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore',windowsHide:true}));
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}});
 children.push(spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--disable-extensions','--enable-unsafe-swiftshader','--use-angle=swiftshader','--window-size=1600,900','--remote-debugging-port=9257','--remote-allow-origins=*','--user-data-dir='+resolve(output,'chrome-profile'),'about:blank'],{stdio:'ignore',windowsHide:true}));
 const tab=await until(async()=>{try{return (await(await fetch('http://127.0.0.1:9257/json')).json()).find(x=>x.type==='page');}catch{return null;}});
 socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((yes,no)=>{socket.addEventListener('open',yes,{once:true});socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',event=>{const r=JSON.parse(String(event.data)),p=pending.get(r.id);if(!p)return;pending.delete(r.id);r.error?p.no(Error(JSON.stringify(r.error))):p.yes(r.result||{});});
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 const url=root+'?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B192=humanCombat&t21W10B112=humanGround&t21W10B203=fullRound';
 await cmd('Page.navigate',{url});await until(()=>evaluate('!!window.__t21F3 && document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"'),120000);
 const boot=await snapshot();writeFileSync(resolve(output,'boot.json'),JSON.stringify(boot,null,2));await screenshot('ready');
 await sleep(1000);const ready=await snapshot();if(ready.tick!==0||ready.timeRemainingSeconds!==180||!ready.paused)throw Error('READY drift');
 await clickButton();await until(async()=>{const state=await evaluate('({locked:document.pointerLockElement===document.querySelector("#app-canvas"),focus:document.hasFocus(),hidden:document.hidden,paused:window.__t21F3.snapshot().paused,tick:window.__t21F3.snapshot().tick})');console.log('LOCK',state);return state.locked;},15000);
 await key('keyDown','w','KeyW',87);await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
 const start=await snapshot();await until(async()=>{const s=await snapshot();if(s.stopReason)throw Error(s.stopReason);return s.tick>=start.tick+42&&s.shotsFired>start.shotsFired;},90000);
 await key('keyUp','w','KeyW',87);await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
 const moved=await snapshot();await screenshot('play');
 await key('keyDown','p','KeyP',80);await key('keyUp','p','KeyP',80);await until(async()=> (await snapshot()).paused);const paused=await snapshot();await sleep(1200);const still=await snapshot();if(paused.tick!==still.tick)throw Error('PAUSE drift');await clickButton();await until(async()=>!(await snapshot()).paused);
 const begin=Date.now();let lastLog=0;
 while(Date.now()-begin<900000){
  const s=await snapshot();samples.push(s);writeFileSync(resolve(output,'latest.json'),JSON.stringify(s,null,2));
  if(s.stopReason)throw Error(s.stopReason);
  if(s.paused)throw Error('Unexpected pause');
  if(Date.now()-lastLog>20000){lastLog=Date.now();console.log(label,JSON.stringify({tick:s.tick,phase:s.matchState,seconds:s.timeRemainingSeconds,rejoins:s.cpu.physicalRejoins.length,hp:s.player.hp,shots:s.cpuShots,paint:s.cpuImpactInkCellsChanged,sight:s.b181OriginalCombatSight}));}
  if(s.matchState==='TIME_UP'){await screenshot('time-up');break;}
  await sleep(3000);
 }
 const final=await snapshot();writeFileSync(resolve(output,'samples.json'),JSON.stringify(samples,null,2));
 writeFileSync(resolve(output,'result.json'),JSON.stringify({url,label,boot,ready,moved,paused,still,final,wallSeconds:(Date.now()-begin)/1000},null,2));
 if(final.matchState!=='TIME_UP')throw Error('180 seconds not completed');
 console.log('NATIVE_ROUND_COMPLETE',label);
}catch(e){writeFileSync(resolve(output,'error.txt'),String(e));if(socket?.readyState===1)try{await screenshot('failure');}catch{}console.error(e);process.exitCode=1;}
finally{socket?.close();for(const child of children)child.kill();}
