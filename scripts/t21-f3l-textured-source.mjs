/**
 * F3L textured exact-static geometry export. Source OBJ and MTL are independently
 * pinned. UVs come ONLY from OBJ vt indices, not guessed world projections.
 * Texture references are local opt-in review assets, never committed or
 * promoted to stage collision, scoring, navigation or production.
 */
import {createReadStream,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {basename,join,resolve} from 'node:path';
import {PINNED_TEMPLE01_SHA256,classifyStaticMaterial} from './t21-f3g-source-pack.mjs';
export const F3L_MTL_BLOB_SHA='93b6d30ecac396e960058d6c71db80aadca10fef';
export const F3L_KITRIX_COMMIT='0611f51b35c9736ee986fb2218461e2585b7875e';
const LIMIT_VERTICES=5000000,LIMIT_TRIANGLES=450000,LIMIT_MATERIALS=100;
const MAX_COORD=300;
const PRIORITY_MATERIALS=new Set([
 'BridgeMetal00_Alb.png','FloorConcrete00_Alb.png',
 'FloorConcrete01_Alb.png','FloorConcrete02_Alb.png',
 'FloorConcrete03_Alb.png','FloorGrass00_Alb.png',
 'FloorMetal00_Alb.png','FloorSlope00_Alb.png',
 'Pillar00_Alb.png','PillarBase00_Alb.png',
 'PillarBase01_Alb.png','PillarBase02_Alb.png',
 'StageSide00_Alb.png','StageSide01_Alb.png',
 'WallConcrete00_Alb.png','WallMetal00_Alb.png',
 'FloorLine00_Alb.png','FloorLine02_Alb.png',
 'FloorLine03_Alb.png','Ceiling00_Alb.png'
]);
function gitBlobSha(source){
 // Git's blob identity is SHA-1("blob " + UTF-8 length + NUL + bytes).
 const b=Buffer.isBuffer(source)?source:Buffer.from(source);
 return createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
}
export function parseF3lOriginalMtl(source){
 const b=Buffer.isBuffer(source)?source:Buffer.from(source);
 const maps=new Map();let current='';
 for(const line of b.toString('utf-8').split(/\r?\n/)){
  if(line.startsWith('newmtl ')){current=line.slice(7).trim();continue;}
  if(!current.startsWith('Fld_Temple01_')||!line.startsWith('map_Kd '))continue;
  const asset=line.slice(7).trim();
  if(!/^textures\/[A-Za-z0-9_.-]+\.png$/.test(asset))
   throw Error('F3L_UNSAFE_MTL_TEXTURE_REFERENCE');
  const name=asset.slice('textures/'.length);
  maps.set(current,PRIORITY_MATERIALS.has(name)&&name.endsWith('_Alb.png')?name:null);
 }
 return maps;
}
export function createF3lUvCollector(mtl){
 const xyz=[],uv=[],groups=new Map();
 let object='',material='',triangles=0,skippedNoUv=0,ignoredFaces=0,trianglesWithoutUV=0;
 let acceptedFaces=0;
 function vertex(token,list,length){
  const n=Number(token),i=n<0?length+n:n-1;
  if(!Number.isSafeInteger(n)||n===0||i<0||i>=length)
   throw Error('F3L_BAD_SOURCE_OBJ_INDEX');
  return list[i];
 }
 return {
  line(line){
   if(line.startsWith('v ')){
    const p=line.slice(2).trim().split(/\s+/).slice(0,3).map(Number);
    if(p.length!==3||!p.every(Number.isFinite))throw Error('F3L_INVALID_SOURCE_POSITION');
    if(xyz.push(p)>LIMIT_VERTICES)throw Error('F3L_POSITION_LIMIT');
    return;
   }
   if(line.startsWith('vt ')){
    const v=line.slice(3).trim().split(/\s+/).slice(0,2).map(Number);
    if(v.length!==2||!v.every(Number.isFinite))throw Error('F3L_INVALID_SOURCE_UV');
    if(uv.push(v)>LIMIT_VERTICES*2)throw Error('F3L_UV_LIMIT');
    return;
   }
   if(line.startsWith('o ')){object=line.slice(2).trim();return;}
   if(line.startsWith('usemtl ')){material=line.slice(7).trim();return;}
   if(!line.startsWith('f '))return;
   if(!object.startsWith('Fld_Temple01_')||!material.startsWith('Fld_Temple01_')){
    ignoredFaces++;return;
   }
   const tokens=line.slice(2).trim().split(/\s+/);
   if(tokens.length<3)throw Error('F3L_INVALID_STATIC_FACE');
   const vertices=tokens.map(token=>{
    const pieces=token.split('/');
    const p=vertex(pieces[0],xyz,xyz.length);
    const t=pieces[1]?vertex(pieces[1],uv,uv.length):null;
    return {p,t};
   });
   if(vertices.some(({p})=>p.some(v=>Math.abs(v)>MAX_COORD))){
    ignoredFaces++;return;
   }
   if(!mtl.has(material))throw Error('F3L_UNKNOWN_ORIGINAL_STATIC_MATERIAL_'+material);
   if(!groups.has(material)){
    if(groups.size>=LIMIT_MATERIALS)throw Error('F3L_EXCESSIVE_MATERIALS');
    groups.set(material,{material,kind:classifyStaticMaterial(material),
     texture:mtl.get(material),floats:[],triangles:0,missingUvTriangles:0});
   }
   const g=groups.get(material);
   for(let k=1;k<tokens.length-1;k++){
    const triangle=[vertices[0],vertices[k],vertices[k+1]];
    if(triangle.some(v=>v.t===null)){
     trianglesWithoutUV++;g.missingUvTriangles++;
    }
    for(const v of triangle){
     g.floats.push(...v.p,...(v.t??[0,0]));
     if(!v.t)skippedNoUv++;
    }
    if(++triangles>LIMIT_TRIANGLES)throw Error('F3L_STATIC_TRIANGLE_LIMIT');
    g.triangles++;
   }
   acceptedFaces++;
  },
  finish(){return {groups:[...groups.values()].sort((a,b)=>
   a.material.localeCompare(b.material)),triangles,acceptedFaces,
   skippedNoUv,trianglesWithoutUV,ignoredFaces,positionCount:xyz.length,uvCount:uv.length};}
 };
}
export async function convertF3lOriginal({input,mtl,output,allowTestFixture=false}){
 if(!existsSync(input)||!existsSync(mtl))throw Error('F3L_MISSING_SOURCE_INPUT');
 const materialBytes=readFileSync(mtl);
 if(!allowTestFixture&&gitBlobSha(materialBytes)!==F3L_MTL_BLOB_SHA)
  throw Error('F3L_ORIGINAL_MTL_BLOB_MISMATCH');
 const mtlTable=parseF3lOriginalMtl(materialBytes);
 if(!allowTestFixture&&mtlTable.size!==54)throw Error('F3L_STATIC_MTL_LIST_CHANGED');
 const collector=createF3lUvCollector(mtlTable),hash=createHash('sha256');
 const stream=createReadStream(input);
 stream.on('data',chunk=>hash.update(chunk));
 for await(const line of createInterface({input:stream,crlfDelay:Infinity}))
  collector.line(line);
 const originalHash=hash.digest('hex');
 if(!allowTestFixture&&originalHash!==PINNED_TEMPLE01_SHA256)
  throw Error('F3L_ORIGINAL_OBJ_HASH_MISMATCH');
 const result=collector.finish();
 console.log('F3L_SOURCE_PARITY_DIAGNOSTIC',JSON.stringify({
  triangles:result.triangles,sourceVertices:result.positionCount,
  textureVertices:result.uvCount,verticesMissingUV:result.skippedNoUv,
  trianglesWithoutUV:result.trianglesWithoutUV,
  materialGroups:result.groups.length,ignoredFaces:result.ignoredFaces
 }));
 if(!allowTestFixture&&(result.triangles!==57578||result.trianglesWithoutUV>2000))
  throw Error('F3L_GEOMETRY_PARITY_OR_UV_COVERAGE_FAILURE');
 const dest=resolve(output);mkdirSync(dest,{recursive:true});
 const materials=result.groups.map((g,i)=>{
  const bytes=Buffer.from(Float32Array.from(g.floats).buffer);
  const file='f3l-original-uv-'+String(i+1).padStart(2,'0')+'.bin';
  writeFileSync(join(dest,file),bytes);
  return {name:g.material,kind:g.kind,triangles:g.triangles,file,
   bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),
   // Never project missing UVs; disable albedo for entire incomplete group.
   texture:g.missingUvTriangles===0?g.texture:null};
 });
 const textureFiles=[...new Set(materials.map(m=>m.texture).filter(Boolean))].sort();
 const manifest={schema:'T21_F3L_PINNED_ORIGINAL_UV_TEXTURE_REVIEW_V1',
  sourceSHA256:originalHash,sourceMtlBlobSha:gitBlobSha(materialBytes),
  sourceRepositoryCommit:F3L_KITRIX_COMMIT,
  verifiedAgainstPinnedSource:!allowTestFixture,
  originalVertexUVOnly:true,sourceGeometryRegisteredOnlyToOriginalObj:true,
  stagePlayableAuthority:'NONE',productionAuthorization:false,
  actorMatricesRecovered:false,physicsSolidsAdded:0,
  navigationLinksAdded:0,scoreableSurfacesAdded:0,
  totalTriangles:result.triangles,
  triangleCountWithoutSourceUV:result.trianglesWithoutUV,
  missingUVVertices:result.skippedNoUv,
  groupsRequiringFlatFallback:result.groups.filter(g=>g.missingUvTriangles>0).length,
  textureFiles,materials};
 writeFileSync(join(dest,'f3l-original-textured.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&basename(process.argv[1])==='t21-f3l-textured-source.mjs'){
 try{
  if(process.argv.length!==5)
   throw Error('Usage: node scripts/t21-f3l-textured-source.mjs SOURCE.obj ORIGINAL.mtl DEST');
  const m=await convertF3lOriginal({input:process.argv[2],mtl:process.argv[3],output:process.argv[4]});
  console.log('F3L_SOURCE_UV_TEXTURES',JSON.stringify({
   triangles:m.totalTriangles,materialGroups:m.materials.length,
   textures:m.textureFiles.length,sourceUVFallbackTriangles:m.triangleCountWithoutSourceUV,
   physicsSolidsAdded:0,stageAuthority:'NONE'
  }));
 }catch(e){console.error('F3L_FAIL',e);process.exitCode=1;}
}