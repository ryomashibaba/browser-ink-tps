/**
 * F4E29 public-code-only capture preflight.
 * Never contains or loads original graphics, game geometry or BYML/Banc data.
 */
import {createServer} from 'node:net';
import {randomBytes} from 'node:crypto';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
export async function chooseUnoccupiedPort(host='127.0.0.1') {
 return new Promise((resolve,reject)=>{
  const s=createServer();s.once('error',reject);
  s.listen(0,host,()=>{const p=s.address()?.port;s.close(e=>e?reject(e):resolve(p));});
 });
}
export async function createOwnedPreview(root,{choosePort=chooseUnoccupiedPort}={}) {
 const port=await choosePort();
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('F4E29_INVALID_PREVIEW_PORT');
 const nonce=randomBytes(20).toString('hex'),markerName=`t21-f4e29-capture-${nonce}.txt`;
 const markerPath=path.join(root,'dist',markerName);
 const markerValue=`T21_OWNED_PREVIEW_${nonce}\n`;
 const baseUrl=`http://127.0.0.1:${port}`;
 await writeFile(markerPath,markerValue,{flag:'wx'});
 let verified=false;
 return {port,baseUrl,markerPath,markerName,get verified(){return verified;},
  async verify(fetchImpl=fetch){
   const r=await fetchImpl(`${baseUrl}/${markerName}`,{cache:'no-store'});
   if(!r.ok || await r.text()!==markerValue)throw Error('F4E29_PREVIEW_SERVER_IDENTITY_MISMATCH');
   const index=await fetchImpl(`${baseUrl}/`,{cache:'no-store'});
   if(!index.ok)throw Error('F4E29_PREVIEW_INDEX_NOT_READY');
   const html=await index.text();
   if(!html.includes('/assets/') || /node_modules\\/.vite\\/deps|\\/@vite\\/client/i.test(html))throw Error('F4E29_NOT_A_PRODUCTION_VITE_BUILD');
   if(html!==await readFile(path.join(root,'dist','index.html'),'utf8'))throw Error('F4E29_SERVED_INDEX_DIFFERS_FROM_BUILD');
   verified=true;return true;
  },
  async dispose(){await unlink(markerPath).catch(e=>{if(e.code!=='ENOENT')throw e;});}
 };
}
export function playableUrlAt(origin,playUrl){
 const source=new URL(playUrl),base=new URL(origin);
 if(base.hostname!=='127.0.0.1'||base.protocol!=='http:'||base.pathname!=='/')throw Error('F4E29_UNSAFE_PREVIEW_ORIGIN');
 source.host=base.host;return source.toString();
}
export function assertCdpPageOrigin(page,expectedOrigin){
 if(!page||new URL(page.url).origin!==expectedOrigin)throw Error('F4E29_CDP_CONNECTED_TO_OTHER_SERVER');
 return true;
}
