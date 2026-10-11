/**
 * F3G full Temple01 static-source visual mesh converter.
 * Only for an exact, user-supplied/KiTrix-LFS verified Vss_Temple01.obj.
 * Does not output Nintendo textures, collision, nav, paint or score bodies.
 */
import {createReadStream,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {basename,join,resolve} from 'node:path';
export const PINNED_TEMPLE01_SHA256='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
export const F3G_KINDS=['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'];
const LIMITS={triangles:450000,coordinates:300,vertices:5000000};
export function classifyStaticMaterial(mat){
 if(/Glass/i.test(mat))return 'GLASS';
 if(/FloorSlope/i.test(mat))return 'SLOPE';
 if(/FloorConcrete|FloorGrass|FloorMetal|FloorRubber|GrassFloor/i.test(mat))return 'FLOOR';
 if(/Pillar|Megalith/i.test(mat))return 'SUPPORT';
 if(/Wall|BridgeMetal|Fence/i.test(mat))return 'METAL';
 if(/Ceil|Seal|Roof/i.test(mat))return 'STRUCTURE';
 return 'DETAIL';
}
export function createF3gObjCollector({allowTestFixture=false}={}){
 const points=[];const perKind=Object.fromEntries(F3G_KINDS.map(k=>[k,[]]));
 let object='',material='',vertexCount=0,totalFaces=0,ignoredFaces=0;
 const staticObjects=new Set(),regionTriangles={positiveZ:0,core:0,negativeZ:0};
 let unplacedFldObjFaceCount=0,skippedFldBgFaceCount=0;
 const isOriginalStatic=()=>object.startsWith('Fld_Temple01_')&&material.startsWith('Fld_Temple01_');
 return {
  line(line){
   if(line.startsWith('v ')){
    const cols=line.trim().split(/\s+/);
    if(cols.length<4)throw Error('F3G_MALFORMED_VERTEX');
    const xyz=cols.slice(1,4).map(Number);
    if(xyz.some(v=>!Number.isFinite(v)))throw Error('F3G_NONFINITE_SOURCE_VERTEX');
    points.push(xyz);vertexCount++;
    if(vertexCount>LIMITS.vertices)throw Error('F3G_UNBOUNDED_VERTEX_TABLE');
   }else if(line.startsWith('o ')){
    object=line.slice(2).trim();
   }else if(line.startsWith('usemtl ')){
    material=line.slice(7).trim();
   }else if(line.startsWith('f ')){
    totalFaces++;
    if(!isOriginalStatic()){
     ignoredFaces++;
     if(object.startsWith('FldObj_Temple01_'))unplacedFldObjFaceCount++;
     else if(object.startsWith('FldBG_Temple01_'))skippedFldBgFaceCount++;
     return;
    }
    const faces=line.slice(2).trim().split(/\s+/);
    if(faces.length<3)return;
    // OBJ global 1-based indexing; negative relative indices allowed,
    // no authored polygon vertices or smoothing created.
    const ids=faces.map(face=>{
     const n=Number(face.split('/')[0]);
     const id=n<0?points.length+n:n-1;
     if(!Number.isSafeInteger(n)||n===0||id<0||id>=points.length)
      throw Error('F3G_INVALID_ORIGINAL_OBJ_FACE_INDEX');
     return id;
    });
    const kind=classifyStaticMaterial(material),target=perKind[kind];
    for(let i=1;i<ids.length-1;i++){
     const p0=points[ids[0]],p1=points[ids[i]],p2=points[ids[i+1]];
     const all=[p0,p1,p2];
     // Stage geometry only. The far FldBG ceiling/sky are excluded by
     // identity, without inserting any clipping polygons.
     if(all.some(p=>p.some(v=>Math.abs(v)>LIMITS.coordinates))){
      ignoredFaces++;continue;
     }
     staticObjects.add(object);
     for(const p of all)target.push(p[0],p[1],p[2]);
     const centroidZ=(p0[2]+p1[2]+p2[2])/3;
     if(centroidZ>32)regionTriangles.positiveZ++;
     else if(centroidZ< -32)regionTriangles.negativeZ++;
     else regionTriangles.core++;
     const tris=F3G_KINDS.reduce((n,k)=>n+perKind[k].length/9,0);
     if(tris>LIMITS.triangles)throw Error('F3G_UNBOUNDED_TRIANGLE_SOURCE');
    }
   }
  },
  finish(){return {perKind,vertexCount,totalFaces,ignoredFaces,
   coverage:{staticObjectCount:staticObjects.size,unplacedFldObjFaceCount,
    skippedFldBgFaceCount,regionTriangles,actorPlacementRecovered:false,
    traversalAuthorityRecovered:false},
   triangleCount:F3G_KINDS.reduce((n,k)=>n+perKind[k].length/9,0)}}
 };
}
export async function convertF3gOriginal({input,output,allowTestFixture=false}){
 const source=resolve(input),dest=resolve(output);
 if(!existsSync(source))throw Error('F3G_EXACT_ORIGINAL_OBJ_NOT_FOUND');
 const hash=createHash('sha256'),collector=createF3gObjCollector({allowTestFixture});
 const stream=createReadStream(source);
 // Hash exactly the original SOURCE BYTES, not JS decoded floats.
 stream.on('data',chunk=>hash.update(chunk));
 for await(const line of createInterface({input:stream,crlfDelay:Infinity}))
  collector.line(line);
 const actual=hash.digest('hex');
 if(!allowTestFixture&&actual!==PINNED_TEMPLE01_SHA256)
  throw Error('F3G_SOURCE_SHA256_MISMATCH expected='+PINNED_TEMPLE01_SHA256+' actual='+actual);
 const parsed=collector.finish();
 if(!allowTestFixture&&(parsed.triangleCount<1500||parsed.vertexCount<1000))
  throw Error('F3G_SOURCE_UNEXPECTEDLY_SPARSE_OR_POINTER');
 mkdirSync(dest,{recursive:true});
 const groups=[];
 for(const kind of F3G_KINDS){
  const scalars=parsed.perKind[kind];
  if(!scalars.length)continue;
  const floats=Float32Array.from(scalars);
  const buffer=Buffer.from(floats.buffer);
  const file='original-'+kind.toLowerCase()+'.bin';
  const digest=createHash('sha256').update(buffer).digest('hex');
  writeFileSync(join(dest,file),buffer);
  groups.push({kind,file,triangles:floats.length/9,
    bytes:buffer.length,sha256:digest});
 }
 const manifest={
  schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1',
  source:'kirakira-dev/KiTrix/stages/Vss_Temple01/Vss_Temple01.obj',
  sourceSHA256:actual,verifiedAgainstPinnedSource:!allowTestFixture,
  exactOriginalStaticObjectOnly:true,
  originalDoubleSourceCoordinatesToGpuFloat32:true,
  sourceObjVertexCount:parsed.vertexCount,
  sourceObjFaceCount:parsed.totalFaces,
  includedOriginalTriangles:parsed.triangleCount,
  excludedNonStaticOrExteriorFaces:parsed.ignoredFaces,
  groups,coverage:parsed.coverage,
  geometryAuthoritativeOnlyForSourceVisualReview:true,
  stageCollisionSolidsAdded:0,stagePaintSurfacesAdded:0,
  navigationLinksAdded:0,scoreableSurfacesAdded:0,
  inferredFloorOrRouteAdded:0,
  stagePlayableAuthority:'NONE',
  productionAuthorization:false
 };
 writeFileSync(join(dest,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&basename(process.argv[1])==='t21-f3g-source-pack.mjs'){
 try{
  if(process.argv.length!==4)throw Error('Usage: node scripts/t21-f3g-source-pack.mjs SOURCE.obj DEST_DIR');
  const m=await convertF3gOriginal({input:process.argv[2],output:process.argv[3]});
  console.log('T21_F3G_WHOLE_SOURCE_PACK',JSON.stringify(m));
 }catch(e){console.error(e);process.exitCode=1;}
}
