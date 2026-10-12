/** Synthetic, public-only regression: this is NOT F4E27 source geometry QA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {createOwnedPreview,chooseUnoccupiedPort,playableUrlAt,assertCdpPageOrigin} from './t21-f4e29-owned-preview.mjs';
const html='<html><script type="module" src="/assets/test-123.js"></script></html>';
const fixture=async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'f4e29-ci-'));await mkdir(path.join(root,'dist'));await writeFile(path.join(root,'dist','index.html'),html);return root;};
const server=async(handler,port)=>{const s=createServer(handler);await new Promise(r=>s.listen(port,'127.0.0.1',r));return s;};
const close=s=>new Promise((r,j)=>s.close(e=>e?j(e):r()));
test('fail closed when a different process is listening on the selected port',async()=>{
 const p=await chooseUnoccupiedPort();
 const imposter=await server((req,res)=>res.end('<script src="/@vite/client"></script>'),p);
 const root=await fixture();let owned;
 try{owned=await createOwnedPreview(root,{choosePort:async()=>p});await assert.rejects(()=>owned.verify(),/IDENTITY_MISMATCH/);}
 finally{await owned?.dispose();await close(imposter);await rm(root,{recursive:true,force:true});}
});
test('exact owner marker and source-matched production HTML are required',async()=>{
 const root=await fixture(),owned=await createOwnedPreview(root);
 const srv=await server(async(req,res)=>{
  if(req.url==='/'){res.end(html);return;}
  try{res.end(await readFile(path.join(root,'dist',req.url.slice(1))));}catch{res.statusCode=404;res.end('not found');}
 },owned.port);
 try{
  assert.equal(await owned.verify(),true);
  const url=playableUrlAt(owned.baseUrl,'http://127.0.0.1:5173/?t21Play=preview');
  assert.equal(new URL(url).origin,owned.baseUrl);
  assert.equal(assertCdpPageOrigin({url},owned.baseUrl),true);
  assert.throws(()=>assertCdpPageOrigin({url},'http://127.0.0.1:5173'),/OTHER_SERVER/);
 }finally{await close(srv);await owned.dispose();await rm(root,{recursive:true,force:true});}
});
