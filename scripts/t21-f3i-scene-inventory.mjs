/**
 * F3I source-exclusive stage-wide environment and unplaced actor inventory.
 * No Nintendo original asset, texture or derived BIN is committed.
 * Original OBJ coordinates are diagnostic; NO instance matrix, stage collision,
 * nav, paint, score, or authoritative environment registration is inferred.
 */
import {createReadStream,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {basename,join,resolve} from 'node:path';
import {PINNED_TEMPLE01_SHA256} from './t21-f3g-source-pack.mjs';
const MAX_COORD=300,MAX_BG_TRIANGLES=180000,MAX_VERTICES=5000000,MAX_OBJECTS=5000;
export function createF3iSceneCollector(){
 const points=[],background=[];
 const actorObjects=new Map(),bgObjects=new Set();
 let object='',material='',bgTriangles=0,bgExcludedFaces=0,bgFaceCount=0;
 let actorFaces=0,actorTriangles=0,sourceVertices=0;
 const indices=words=>words.map(w=>{
  const n=Number(w.split('/')[0]),index=n<0?points.length+n:n-1;
  if(!Number.isSafeInteger(n)||n===0||index<0||index>=points.length)
   throw Error('F3I_BAD_ORIGINAL_OBJ_FACE_INDEX');
  return index;
 });
 const updateActor=(vertexIDs,triangles)=>{
  let a=actorObjects.get(object);
  if(!a){
   if(actorObjects.size>=MAX_OBJECTS)throw Error('F3I_ACTOR_OBJECT_LIMIT');
   a={name:object,faces:0,triangles:0,
    min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
   actorObjects.set(object,a);
  }
  a.faces++;a.triangles+=triangles;
  for(const id of vertexIDs){
   const p=points[id];
   for(let axis=0;axis<3;axis++){
    a.min[axis]=Math.min(a.min[axis],p[axis]);
    a.max[axis]=Math.max(a.max[axis],p[axis]);
   }
  }
 };
 return {
  line(line){
   if(line.startsWith('v ')){
    const xyz=line.trim().split(/\s+/).slice(1,4).map(Number);
    if(xyz.length!==3||!xyz.every(Number.isFinite))
     throw Error('F3I_INVALID_VERTEX');
    if(++sourceVertices>MAX_VERTICES)throw Error('F3I_VERTEX_LIMIT');
    points.push(xyz);
    return;
   }
   if(line.startsWith('o ')){object=line.slice(2).trim();return;}
   if(line.startsWith('usemtl ')){material=line.slice(7).trim();return;}
   if(!line.startsWith('f '))return;
   const isBG=object.startsWith('FldBG_Temple01_')&&material.startsWith('FldBG_Temple01_');
   const isActor=object.startsWith('FldObj_Temple01_');
   if(!isBG&&!isActor)return;
   const words=line.slice(2).trim().split(/\s+/);
   if(words.length<3)throw Error('F3I_INVALID_FACE');
   const ids=indices(words),triangles=ids.length-2;
   if(isActor){
    actorFaces++;actorTriangles+=triangles;updateActor(ids,triangles);
    return;
   }
   bgFaceCount++;bgObjects.add(object);
   const vertices=ids.map(id=>points[id]);
   if(vertices.some(p=>p.some(v=>Math.abs(v)>MAX_COORD))){
    bgExcludedFaces++;return;
   }
   if(bgTriangles+triangles>MAX_BG_TRIANGLES)throw Error('F3I_ENVIRONMENT_TRIANGLE_LIMIT');
   for(let k=1;k<ids.length-1;k++){
    for(const p of [vertices[0],vertices[k],vertices[k+1]])
     background.push(p[0],p[1],p[2]);
    bgTriangles++;
   }
  },
  finish(){
   const actors=[...actorObjects.values()].sort((a,b)=>
    b.triangles-a.triangles||a.name.localeCompare(b.name));
   return {background,backgroundTriangles:bgTriangles,
    backgroundObjects:bgObjects.size,backgroundFaceCount:bgFaceCount,
    backgroundExcludedFaces:bgExcludedFaces,
    actorFaceCount:actorFaces,actorTriangles,actorObjectCount:actors.length,
    largestUnplacedActors:actors.slice(0,24),
    actorPlacementRecovered:false,environmentStageRegistrationRecovered:false,
    traversalAuthorityRecovered:false,sourceVertices};
  }
 };
}
export async function convertF3iSceneInventory({input,output,allowTestFixture=false}){
 const source=resolve(input),dest=resolve(output);
 if(!existsSync(source))throw Error('F3I_SOURCE_NOT_FOUND');
 const hash=createHash('sha256'),collector=createF3iSceneCollector();
 const stream=createReadStream(source);
 stream.on('data',chunk=>hash.update(chunk));
 for await(const line of createInterface({input:stream,crlfDelay:Infinity}))
  collector.line(line);
 const actual=hash.digest('hex');
 if(!allowTestFixture&&actual!==PINNED_TEMPLE01_SHA256)
  throw Error('F3I_ORIGINAL_SHA256_MISMATCH');
 const result=collector.finish();
 mkdirSync(dest,{recursive:true});
 const bin=Buffer.from(Float32Array.from(result.background).buffer);
 const name='f3i-environment-obj-space.bin';
 writeFileSync(join(dest,name),bin);
 const manifest={
  schema:'T21_F3I_ENVIRONMENT_SOURCE_DIAGNOSTIC_V1',
  sourceSHA256:actual,verifiedAgainstPinnedSource:!allowTestFixture,
  coordinateSpace:'ORIGINAL_OBJ_UNREGISTERED',
  stagePlayableAuthority:'NONE',productionAuthorization:false,
  stageCollisionSolidsAdded:0,navigationLinksAdded:0,
  scoreableSurfacesAdded:0,inferredFloorOrRouteAdded:0,
  actorPlacementRecovered:false,environmentStageRegistrationRecovered:false,
  traversalAuthorityRecovered:false,
  backgroundTriangleCount:result.backgroundTriangles,
  backgroundObjectCount:result.backgroundObjects,
  backgroundFaceCount:result.backgroundFaceCount,
  backgroundExcludedFaces:result.backgroundExcludedFaces,
  actorObjectCount:result.actorObjectCount,
  actorFaceCount:result.actorFaceCount,actorTriangles:result.actorTriangles,
  largestUnplacedActors:result.largestUnplacedActors,
  previewBin:{file:name,bytes:bin.byteLength,
   sha256:createHash('sha256').update(bin).digest('hex')}
 };
 writeFileSync(join(dest,'f3i-environment.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&basename(process.argv[1])==='t21-f3i-scene-inventory.mjs'){
 try{
  if(process.argv.length!==4)
   throw Error('Usage: node scripts/t21-f3i-scene-inventory.mjs SOURCE.obj DEST_DIR');
  const m=await convertF3iSceneInventory({input:process.argv[2],output:process.argv[3]});
  console.log('F3I_STAGE_ENV',JSON.stringify({
   bgTriangles:m.backgroundTriangleCount,bgObjects:m.backgroundObjectCount,
   bgExcludedFaces:m.backgroundExcludedFaces,
   actorObjects:m.actorObjectCount,actorFaces:m.actorFaceCount,
   actorPlacementRecovered:false,playableAuthority:'NONE',
   largestActors:m.largestUnplacedActors.slice(0,6).map(x=>({name:x.name,faces:x.faces}))
  }));
 }catch(e){console.error('F3I_FAILED',e);process.exitCode=1;}
}