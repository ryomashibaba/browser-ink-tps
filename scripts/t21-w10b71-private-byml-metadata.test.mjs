import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zstdCompressSync} from 'node:zlib';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readB71BymlData,decodeB71PrivateBancBuffer}
 from './t21-w10b71-private-byml-metadata.mjs';
import {privateBancPreflight}
 from './t21-w10b24-private-banc-preflight.mjs';
function syntheticByml(little){
 const b=Buffer.alloc(4096);
 let end=16;const alloc=n=>{end=(end+3)&~3;const p=end;end+=n;return p;};
 const u32=(p,n)=>little?b.writeUInt32LE(n,p):b.writeUInt32BE(n,p);
 const f32=(p,n)=>little?b.writeFloatLE(n,p):b.writeFloatBE(n,p);
 const c24=(p,n)=>{if(little){
  b[p]=n&255;b[p+1]=(n>>8)&255;b[p+2]=(n>>16)&255;
 }else{b[p]=(n>>16)&255;b[p+1]=(n>>8)&255;b[p+2]=n&255;}};
 const words=(names)=>{
  const sizes=names.map(s=>Buffer.byteLength(s)+1);
  const p=alloc(4+(names.length+1)*4+sizes.reduce((a,v)=>a+v,0));
  b[p]=0xc2;c24(p+1,names.length);
  let at=4+4*(names.length+1);
  names.forEach((s,i)=>{
   u32(p+4+i*4,at);b.write(s,p+at,'utf8');at+=sizes[i];
  });
  u32(p+4+names.length*4,at);return p;
 };
 const kt=words(['Actors','Gyaml','Translate','Rotate','Scale','Layer',
  'Hash','stageRowId']);
 const st=words(['Vss_Temple01','Lft_FldObj_Temple01_PntSet',
  'TOP_SECRET_PRIVATE_LAYER']);
 const vector=ns=>{
  const p=alloc(8+ns.length*4);b[p]=0xc0;c24(p+1,ns.length);
  ns.forEach((n,i)=>{b[p+4+i]=0xd2;f32(p+8+i*4,n);});
  return p;
 };
 const tr=vector([733.125,24.5,-99.25]),
  rot=vector([0,0,0]),scale=vector([1,1,1]);
 const dict=(pairs)=>{
  const p=alloc(4+pairs.length*8);b[p]=0xc1;c24(p+1,pairs.length);
  pairs.forEach(([key,kind,value],i)=>{
   const at=p+4+i*8;c24(at,key);b[at+3]=kind;u32(at+4,value);
  });return p;
 };
 const actor=dict([[1,0xa0,1],[2,0xc0,tr],[3,0xc0,rot],
  [4,0xc0,scale],[5,0xa0,2],[6,0xd3,42]]);
 const actors=alloc(12);b[actors]=0xc0;c24(actors+1,1);
 b[actors+4]=0xc1;u32(actors+8,actor);
 const root=dict([[0,0xc0,actors],[7,0xa0,0]]);
 b.write(little?'YB':'BY',0,'ascii');
 if(little)b.writeUInt16LE(3,2);else b.writeUInt16BE(3,2);
 u32(4,kt);u32(8,st);u32(12,root);
 return b.subarray(0,end);
}
for(const little of [true,false])
 test('B71 in-memory bounded private BYML fixture '+
  (little?'YB little-endian':'BY big-endian'),()=>{
  const data=readB71BymlData(syntheticByml(little));
  assert.equal(data.binaryVersion,3);
  assert.equal(data.data.stageRowId,'Vss_Temple01');
  assert.equal(data.data.Actors.length,1);
  assert.equal(data.data.Actors[0].Gyaml,
   'Lft_FldObj_Temple01_PntSet');
  assert.equal(data.data.Actors[0].Hash,42);
  assert.deepEqual(data.data.Actors[0].Translate,
   [733.125,24.5,-99.25]);
 });
test('B71 local raw and vanilla ZSTD produce same private memory, no export',()=>{
 const raw=syntheticByml(true);
 const uncompressed=decodeB71PrivateBancBuffer(raw,
  'Vss_Temple01_Static.byml');
 const compressed=decodeB71PrivateBancBuffer(zstdCompressSync(raw),
  'Vss_Temple01_Static.byml.zs');
 assert.deepEqual(compressed.data,uncompressed.data);
 assert.equal(compressed.localCompression,'ZSTD_LOCAL_NO_DICTIONARY');
});
test('B71 broken frames, unknown v7 hashed nodes and malformed offsets fail closed',()=>{
 const data=syntheticByml(true);
 const wrongVersion=Buffer.from(data);wrongVersion.writeUInt16LE(9,2);
 assert.throws(()=>readB71BymlData(wrongVersion),/B71_UNSUPPORTED_VERSION/);
 const wrongNode=Buffer.from(data);wrongNode[wrongNode.readUInt32LE(12)]=0x20;
 assert.throws(()=>readB71BymlData(wrongNode),/UNSUPPORTED_CONTAINER/);
 const outOfBounds=Buffer.from(data);
 outOfBounds.writeUInt32LE(0xfffffff0,12);
 assert.throws(()=>readB71BymlData(outOfBounds),/INVALID_BINARY_BOUNDS/);
 assert.throws(()=>readB71BymlData(data.subarray(0,9)),/UNSUPPORTED_FILE_LENGTH/);
 assert.throws(()=>decodeB71PrivateBancBuffer(
  Buffer.from('not Zstd'),'Vss_Temple01.byml.zs'),/COMPRESSED_NOT_ZSTD/);
});
test('B71 offline preflight accepts binary metadata but never authenticates actor or exposes private fields',()=>{
 const dir=mkdtempSync(join(tmpdir(),'b71-temple-source-'));
 try{
  writeFileSync(join(dir,'Vss_Temple01_Static.byml.zs'),
   zstdCompressSync(syntheticByml(true)));
  const report=privateBancPreflight(dir);
  assert.equal(report.hold,'HOLD_BANC_AUTHENTICITY_AND_MESH_BINDING_UNPROVEN');
  assert.equal(report.b71BinaryBymlDecodedPrivateLocalOnly,true);
  assert.equal(report.originalConnectionsPromoted,0);
  assert.equal(report.frozenStageAuthority.scoreable,0);
  const item=report.candidates[0];
  assert.equal(item.decodeState,'B71_LOCAL_BINARY_METADATA_ONLY_UNVERIFIED');
  assert.equal(item.actorCount,1);
  assert.equal(item.validSetActorCount,1);
  assert.equal(item.b60InstanceBindingReadiness.pntSetClassActors,1);
  assert.equal(item.b60InstanceBindingReadiness.exactInstanceToEightUnboundMeshesVerified,false);
  const serialized=JSON.stringify(report);
  for(const secret of ['733.125','-99.25','TOP_SECRET_PRIVATE_LAYER',
   'Lft_FldObj_Temple01_PntSet','42,24.5'])
   if(secret!=='Lft_FldObj_Temple01_PntSet')
    assert.equal(serialized.includes(secret),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
