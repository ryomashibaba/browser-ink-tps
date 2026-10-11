/**
 * F3K: extract representative top-eight ORIGINAL FldObj source definitions
 * for an isolated geometry gallery. Source parts are NOT placed actors.
 * Source OBJ and all derived mesh binaries remain local to opt-in review.
 */
import {createReadStream,mkdirSync,writeFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {PINNED_TEMPLE01_SHA256} from './t21-f3g-source-pack.mjs';
const MAX_VERTICES=5000000,MAX_TRIANGLES=100000,MAX_COMPONENTS=8;
export function createF3kFamilyCollector(families){
 if(!Array.isArray(families)||families.length<1||families.length>MAX_COMPONENTS)
  throw Error('F3K_FAMILY_COUNT_UNTRUSTED');
 const vertices=[],byObject=new Map(),seen=new Set();
 for(const a of families){
  if(!/^[A-Za-z0-9_.-]{1,128}$/.test(a.family)||
     !/^FldObj_Temple01_[A-Za-z0-9_.-]+$/.test(a.representativeObject)||
     seen.has(a.representativeObject)||
     !Number.isSafeInteger(a.representativeTriangles)||a.representativeTriangles<1)
   throw Error('F3K_INVALID_REPRESENTATIVE_SOURCE');
  seen.add(a.representativeObject);
  byObject.set(a.representativeObject,{family:a.family,object:a.representativeObject,
   expectedTriangles:a.representativeTriangles,positions:[],triangles:0,
   min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]});
 }
 let current='',vertexCount=0,totalTriangles=0;
 function vertexIndex(token){
  const n=Number(token.split('/')[0]);
  const i=n<0?vertices.length+n:n-1;
  if(!Number.isSafeInteger(n)||n===0||i<0||i>=vertices.length)
   throw Error('F3K_INVALID_ORIGINAL_FACE_INDEX');
  return i;
 }
 return {
  line(line){
   if(line.startsWith('v ')){
    const p=line.trim().split(/\s+/).slice(1,4).map(Number);
    if(p.length!==3||!p.every(Number.isFinite))
     throw Error('F3K_BAD_SOURCE_VERTEX');
    if(++vertexCount>MAX_VERTICES)throw Error('F3K_VERTEX_LIMIT');
    vertices.push(p);return;
   }
   if(line.startsWith('o ')){current=line.slice(2).trim();return;}
   if(!line.startsWith('f '))return;
   const component=byObject.get(current);
   if(!component)return;
   const ids=line.slice(2).trim().split(/\s+/).map(vertexIndex);
   if(ids.length<3)throw Error('F3K_INVALID_SOURCE_FACE');
   const triangles=ids.length-2;
   if(totalTriangles+triangles>MAX_TRIANGLES)throw Error('F3K_GALLERY_TRIANGLE_LIMIT');
   totalTriangles+=triangles;component.triangles+=triangles;
   for(let k=1;k<ids.length-1;k++){
    for(const id of [ids[0],ids[k],ids[k+1]]){
     const p=vertices[id];
     for(let d=0;d<3;d++){
      component.positions.push(p[d]);
      component.min[d]=Math.min(component.min[d],p[d]);
      component.max[d]=Math.max(component.max[d],p[d]);
     }
    }
   }
  },
  finish(){
   const parts=[...byObject.values()];
   for(const a of parts){
    if(a.triangles!==a.expectedTriangles||a.positions.length!==a.triangles*9||
       a.min.some((v,i)=>!Number.isFinite(v)||v>a.max[i])||
       a.max.some(Number.isNaN))
     throw Error('F3K_REPRESENTATIVE_TRIANGLE_OR_BOUNDS_DRIFT_'+a.family);
   }
   return parts;
  }
 };
}
export async function convertF3kGallery({input,output,families,allowTestFixture=false}){
 const collector=createF3kFamilyCollector(families);
 const digest=createHash('sha256'),stream=createReadStream(input);
 stream.on('data',chunk=>digest.update(chunk));
 for await(const line of createInterface({input:stream,crlfDelay:Infinity}))
  collector.line(line);
 const sourceSHA256=digest.digest('hex');
 if(!allowTestFixture&&sourceSHA256!==PINNED_TEMPLE01_SHA256)
  throw Error('F3K_PINNED_ORIGINAL_SHA_MISMATCH');
 const parts=collector.finish();
 mkdirSync(output,{recursive:true});
 const components=parts.map((a,index)=>{
  const file='f3k-family-'+String(index+1).padStart(2,'0')+'.bin';
  const data=Buffer.from(Float32Array.from(a.positions).buffer);
  writeFileSync(join(output,file),data);
  return {family:a.family,representativeObject:a.object,
   originalTriangles:a.triangles,min:a.min,max:a.max,
   file,bytes:data.byteLength,
   sha256:createHash('sha256').update(data).digest('hex')};
 });
 const manifest={
  schema:'T21_F3K_ISOLATED_SOURCE_FAMILY_GALLERY_V1',
  sourceSHA256,verifiedAgainstPinnedSource:!allowTestFixture,
  sourceGeometrySpace:'ORIGINAL_OBJ_LOCAL_UNPLACED',
  viewerPlacement:'ISOLATED_NORMALIZED_SHOWCASE',
  stagePlayableAuthority:'NONE',productionAuthorization:false,
  instanceMatricesRecovered:false,actorPlacementRecovered:false,
  stageCollisionSolidsAdded:0,navigationLinksAdded:0,
  scoreableSurfacesAdded:0,inferredFloorOrRouteAdded:0,
  components
 };
 writeFileSync(join(output,'f3k-family-gallery.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}