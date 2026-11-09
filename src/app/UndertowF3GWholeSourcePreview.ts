/**
 * F3G: whole pinned static Temple01 architectural source render ONLY.
 *
 * The renderer is explicitly gated ?t21FullSource=review + T21 F3 preview.
 * It reads a *locally generated* exact-SHA pinned binary pack, never
 * downloads game content at page runtime. Missing pack is nonfatal.
 * It has NO Rapier, Recast, ink, collision, paint or stage-authority imports.
 */
import {BLEND_NONE,BLEND_NORMAL,CULLFACE_NONE,Color,Entity,Mesh,MeshInstance,
 StandardMaterial,Vec3,type AppBase} from 'playcanvas';
import RAPIER from '@dimforge/rapier3d-compat';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {PLAYER_CHARACTER_PHYSICS,
 createConfiguredPlayerCharacterController} from '../player/PlayerCharacterPhysics';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {undertowProjectXZToTemple01ModelXZ,
 undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';
import {inspectF4OriginalSourceFloorCorridor}
 from './UndertowF3SourceFloorAuthority';
const KINDS=['FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'] as const;
type Kind=typeof KINDS[number];
export const F3H_SOURCE_VISUAL_MODES=['SOLID','TRAVERSAL','X_RAY'] as const;
export type F3HSourceVisualMode=typeof F3H_SOURCE_VISUAL_MODES[number];
export const T21_F3G_SOURCE_SHA256=
 'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
export type F3GPackManifest={
 schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1';
 sourceSHA256:string;
 verifiedAgainstPinnedSource:boolean;
 includedOriginalTriangles:number;
 groups:readonly {kind:Kind;file:string;triangles:number;bytes:number;sha256:string}[];
 stagePlayableAuthority:'NONE';
 stageCollisionSolidsAdded:0;
 stagePaintSurfacesAdded:0;
 navigationLinksAdded:0;
 scoreableSurfacesAdded:0;
 inferredFloorOrRouteAdded:0;
 productionAuthorization:false;
 // Counts describe only pinned OBJ source triangles, not runtime gameplay.
 coverage?:{staticObjectCount:number;unplacedFldObjFaceCount:number;
  skippedFldBgFaceCount:number;
  regionTriangles:{positiveZ:number;core:number;negativeZ:number};
  actorPlacementRecovered:false;traversalAuthorityRecovered:false};
};
export function auditF3gPackManifest(m:F3GPackManifest){
 if(m.schema!=='T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1'||
    m.sourceSHA256!==T21_F3G_SOURCE_SHA256||
    m.verifiedAgainstPinnedSource!==true||
    !Number.isSafeInteger(m.includedOriginalTriangles)||
    m.includedOriginalTriangles<1500||
    m.stagePlayableAuthority!=='NONE'||
    m.stageCollisionSolidsAdded!==0||m.stagePaintSurfacesAdded!==0||
    m.navigationLinksAdded!==0||m.scoreableSurfacesAdded!==0||
    m.inferredFloorOrRouteAdded!==0||m.productionAuthorization!==false)
  throw Error('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
 const known=new Set<string>();
 let tris=0;
 for(const g of m.groups){
  if(!KINDS.includes(g.kind)||known.has(g.kind)||
     !/^original-(floor|slope|metal|glass|support|structure|detail)\.bin$/.test(g.file)||
     !Number.isSafeInteger(g.triangles)||g.triangles<1||
     !Number.isSafeInteger(g.bytes)||g.bytes!==g.triangles*36||
     !/^[a-f0-9]{64}$/.test(g.sha256))
   throw Error('T21_F3G_UNSAFE_MESH_GROUP');
  known.add(g.kind);tris+=g.triangles;
 }
 if(m.coverage){
  const c=m.coverage;
  if(!Number.isSafeInteger(c.staticObjectCount)||c.staticObjectCount<1||
     !Number.isSafeInteger(c.unplacedFldObjFaceCount)||c.unplacedFldObjFaceCount<0||
     !Number.isSafeInteger(c.skippedFldBgFaceCount)||c.skippedFldBgFaceCount<0||
     ![c.regionTriangles.positiveZ,c.regionTriangles.core,c.regionTriangles.negativeZ]
      .every(v=>Number.isSafeInteger(v)&&v>=0)||
     Object.values(c.regionTriangles).reduce((a,b)=>a+b,0)!==m.includedOriginalTriangles||
     c.actorPlacementRecovered!==false||c.traversalAuthorityRecovered!==false)
   throw Error('T21_F3H_SOURCE_COVERAGE_UNTRUSTED');
 }
 if(tris!==m.includedOriginalTriangles||m.groups.length<3)
  throw Error('T21_F3G_UNVERIFIED_GROUP_TRIANGLE_TOTAL');
 return {sourceTriangles:tris,sourceGroups:m.groups.length,
  renderOnly:true as const,physicalSolidsAdded:0 as const,
  scoreablePromotions:0 as const,productionAuthorized:false as const};
}
const PALETTE:Record<Kind,{rgb:[number,number,number];opacity:number}>={
 FLOOR:{rgb:[.43,.60,.70],opacity:.80},
 SLOPE:{rgb:[.72,.56,.35],opacity:.83},
 METAL:{rgb:[.26,.45,.53],opacity:.86},
 GLASS:{rgb:[.35,.77,.91],opacity:.31},
 SUPPORT:{rgb:[.39,.48,.58],opacity:.92},
 STRUCTURE:{rgb:[.28,.39,.51],opacity:.91},
 DETAIL:{rgb:[.70,.68,.53],opacity:.73}
};
/** Non-authoritative display presets. SOLID fixes the F3G all-transparent
 * no-depth-write appearance. TRAVERSAL highlights source floor but grants no
 * walkability. X_RAY preserves the prior source overlay for comparison. */
export function f3hSourceMaterialStyle(k:Kind,mode:F3HSourceVisualMode){
 const base=PALETTE[k];
 if(mode==='SOLID'){
  const opacity=k==='GLASS' ? .24 : 1;
  return {opacity,depthWrite:k!=='GLASS',opaque:k!=='GLASS'};
 }
 if(mode==='TRAVERSAL'){
  const opacity:Record<Kind,number>={FLOOR:1,SLOPE:1,METAL:.30,
   GLASS:.12,SUPPORT:.16,STRUCTURE:.13,DETAIL:.20};
  return {opacity:opacity[k],depthWrite:k==='FLOOR'||k==='SLOPE',
   opaque:k==='FLOOR'||k==='SLOPE'};
 }
 return {opacity:base.opacity,depthWrite:false,opaque:false};
}
function sourceMaterial(k:Kind){
 const {rgb}=PALETTE[k];
 const m=new StandardMaterial();
 m.diffuse=new Color(...rgb);
 m.emissive=new Color(rgb[0]*.12,rgb[1]*.12,rgb[2]*.12);
 m.cull=CULLFACE_NONE;
 m.useMetalness=true;m.metalness=.22;m.gloss=.27;
 applySourceMaterialStyle(m,k,'SOLID');return m;
}
function applySourceMaterialStyle(m:StandardMaterial,k:Kind,mode:F3HSourceVisualMode){
 const style=f3hSourceMaterialStyle(k,mode);
 m.opacity=style.opacity;
 m.blendType=style.opaque?BLEND_NONE:BLEND_NORMAL;
 m.depthWrite=style.depthWrite;
 m.update();
}
function flatOriginalNormals(pos:Float32Array):Float32Array{
 const normal=new Float32Array(pos.length);
 for(let i=0;i<pos.length;i+=9){
  const ax=pos[i+3]!-pos[i]!,ay=pos[i+4]!-pos[i+1]!,az=pos[i+5]!-pos[i+2]!;
  const bx=pos[i+6]!-pos[i]!,by=pos[i+7]!-pos[i+1]!,bz=pos[i+8]!-pos[i+2]!;
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  const length=Math.hypot(nx,ny,nz)||1;
  nx/=length;ny/=length;nz/=length;
  for(let j=0;j<9;j+=3){
   normal[i+j]=nx;normal[i+j+1]=ny;normal[i+j+2]=nz;
  }
 }
 return normal;
}
export async function loadF3gWholeSource(app:AppBase){
 const base=new URL('t21-f3g-source/',document.baseURI).toString();
 const response=await fetch(base+'manifest.json',{cache:'no-store'});
 if(!response.ok)throw Error('T21_F3G_SOURCE_PACK_NOT_INSTALLED_HTTP_'+response.status);
 const manifest=await response.json() as F3GPackManifest;
 const certification=auditF3gPackManifest(manifest);
 const root=new Entity('T21F3G:WHOLE_ORIGINAL_SOURCE_OPTICAL_ONLY');
 const materials=new Map<Kind,StandardMaterial>();
 const verifiedTriangles=new Map<OriginalF3gKind,Float32Array>();
 root.enabled=false;
 try{
  for(const group of manifest.groups){
   const response=await fetch(base+group.file);
   if(!response.ok)throw Error('T21_F3G_MESH_FILE_MISSING_'+group.kind);
   const bytes=await response.arrayBuffer();
   if(bytes.byteLength!==group.bytes)throw Error('T21_F3G_MESH_BYTE_COUNT_DRIFT');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
    .map(x=>x.toString(16).padStart(2,'0')).join('');
   if(digest!==group.sha256)throw Error('T21_F3G_PINNED_MESH_HASH_MISMATCH');
   const positions=new Float32Array(bytes);
   verifiedTriangles.set(group.kind,positions);
   const mesh=new Mesh(app.graphicsDevice);
   mesh.setPositions(positions);
   mesh.setNormals(flatOriginalNormals(positions));
   const idx=new Uint32Array(positions.length/3);
   for(let i=0;i<idx.length;i++)idx[i]=i;
   mesh.setIndices(idx);mesh.update();
   const entity=new Entity('T21F3G:SOURCE_'+group.kind+'_NOT_WALKABLE');
   const material=sourceMaterial(group.kind);
   materials.set(group.kind,material);
   entity.addComponent('render',{meshInstances:[
    new MeshInstance(mesh,material)
   ],castShadows:false,receiveShadows:false});
   root.addChild(entity);
  }
 }catch(error){root.destroy();throw error;}
 app.root.addChild(root);
 root.enabled=true;
 // Only the explicitly selected locally pinned review can inspect physical
 // mismatch. Never modify the live SOURCE stage, 25 solids, nav or score.
 let v23Evidence:unknown=null;
 const q=new URL(location.href).searchParams;
 if(q.get('t21Play')==='preview'&&q.get('t21FullSource')==='review'&&
    q.get('t21F3Registration')==='project'&&!q.has('production')&&
    !q.has('scoreable')&&!q.has('t21QaInput')){
  try{
   const stage=undertowT21dConnectivityQaStage();
   const real=new RapierStagePhysics(1/60,stage);
   try{
    real.step();
    const alignment=auditF3gOriginalFloorAgainstRapier(
     verifiedTriangles,stage,real);
    const isolated=buildIsolatedFirstDropOriginalTriangleStage(
     verifiedTriangles,stage);
    let isolationHits:ReturnType<typeof probeIsolatedFirstDropRapier>|null=null;
    let isolationWalk:ReturnType<typeof probeV23FirstDropHumanKcc>|null=null;
    let isolationRampWalk:ReturnType<typeof probeV23FirstDropHumanKcc>|null=null;
    if(isolated.stage){
     const lab=new RapierStagePhysics(1/60,isolated.stage);
     try{lab.step();isolationHits=probeIsolatedFirstDropRapier(
      isolated.stage,lab);
      isolationWalk=probeV23FirstDropHumanKcc(lab,'EDGE_LOSS');}
     finally{lab.world.free();}
     const rampLab=new RapierStagePhysics(1/60,isolated.stage);
     try{rampLab.step();isolationRampWalk=probeV23FirstDropHumanKcc(
      rampLab,'KNOWN_RAMP');}
     finally{rampLab.world.free();}
    }
    // Different temporary worlds keep the edge-loss and ramp probes independent.
    const registeredWalk=probeV23FirstDropHumanKcc(real,'EDGE_LOSS');
    const registeredRampWorld=new RapierStagePhysics(1/60,stage);
    let registeredRampWalk:ReturnType<typeof probeV23FirstDropHumanKcc>;
    try{registeredRampWorld.step();registeredRampWalk=probeV23FirstDropHumanKcc(
     registeredRampWorld,'KNOWN_RAMP');}
    finally{registeredRampWorld.world.free();}
    v23Evidence={alignment,registeredWalk,registeredRampWalk,isolation:{status:isolated.status,
     originalSourceTriangles:isolated.triangles,
     originalCollisionFlags:isolated.sourceCollisionFlags,
     isolatedRapierFeet:isolationHits,isolatedHumanKccWalk:isolationWalk,
     isolatedRampKccWalk:isolationRampWalk,
     liveOriginalStageModified:false,
     naturalHumanCpuRouteCertified:false}};
   }finally{real.world.free();}
  }catch(e){
   v23Evidence={status:'HOLD_ORIGINAL_ALIGNMENT_OR_ISOLATION_ERROR',
    reason:String(e).slice(0,300),liveOriginalStageModified:false};
  }
  console.info('T21_V23_ORIGINAL_FLOOR_RAPIER_AUDIT',
   JSON.stringify(v23Evidence));
 }
 return {root,manifest,certification,v23Evidence,
  setVisualMode(mode:F3HSourceVisualMode){
   if(!F3H_SOURCE_VISUAL_MODES.includes(mode))throw Error('T21_F3H_INVALID_REVIEW_MODE');
   for(const [kind,material] of materials)applySourceMaterialStyle(material,kind,mode);
   return mode;
  }};
}

export const ORIGINAL_F3G_KINDS=[
 'FLOOR','SLOPE','METAL','GLASS','SUPPORT','STRUCTURE','DETAIL'
] as const;
export type OriginalF3gKind=typeof ORIGINAL_F3G_KINDS[number];
export type OriginalF3gBins=ReadonlyMap<OriginalF3gKind,Float32Array>;
type Probe={id:string;x:number;z:number;footY:number;
 provenance:'WINDOWS_NATIVE'|'CHROMIUM_K1'|'REGISTERED_MODEL_REGION'};
/** Actual Windows trace 2026-11-09 tick 1270-1390 + K1 ramp witness.
 * Later model-region locations are NOT human observations or collision flags.
 */
const WINDOWS:readonly Probe[]=[
 {id:'HIGH_SUPPORTED_1270',x:-4.770392417907715,z:52.723026275634766,
  footY:7.525381927490234,provenance:'WINDOWS_NATIVE'},
 {id:'HIGH_UNSUPPORTED_1271',x:-4.92443323135376,z:52.41347122192383,
  footY:7.5,provenance:'WINDOWS_NATIVE'},
 {id:'HIGH_DETECTED_1299',x:-3.9042558670043945,z:50.34474563598633,
  footY:7.5,provenance:'WINDOWS_NATIVE'},
 {id:'LOW_SUPPORTED_1355',x:-.9098284840583801,z:46.98916244506836,
  footY:3.0251027393341064,provenance:'WINDOWS_NATIVE'},
 {id:'LOW_UNSUPPORTED_1356',x:-.674686849117279,z:46.629432678222656,
  footY:3,provenance:'WINDOWS_NATIVE'},
 {id:'LOW_APPROACH_1368',x:-.13194848597049713,z:45.74237060546875,
  footY:3,provenance:'WINDOWS_NATIVE'},
 {id:'LOW_UNSUPPORTED_1390',x:.8204801082611084,z:44.09070587158203,
  footY:3,provenance:'WINDOWS_NATIVE'},
 {id:'RAMP_CONTACT_K1',x:2.0517,z:49.8099,
  footY:3.0683,provenance:'CHROMIUM_K1'}
];
const MODEL_SAMPLES:readonly {id:string;mx:number;mz:number;modelY:number}[]=[
 {id:'RIGHT_LOW_REGION',mx:-14,mz:42,modelY:7.5},
 {id:'GLASS_UNDERPASS_REGION',mx:-10,mz:3,modelY:3},
 {id:'CENTER_LOW_REGION',mx:8,mz:0,modelY:3},
 {id:'OPPOSITE_SPAWN_REGION',mx:15,mz:-55,modelY:10.5}
];
export const ORIGINAL_F3G_FLOOR_SAMPLES:readonly Probe[]=[
 ...WINDOWS,
 ...MODEL_SAMPLES.map(({id,mx,mz,modelY})=>{
  const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
  return {id,x,z,footY:modelY-3,
   provenance:'REGISTERED_MODEL_REGION' as const};
 })
];

/** XZ barycentric intersection of an EXACT source triangle (no tessellation).
 * A vertical facade does not acquire "floor" status from its material name.
 */
function sourceHeightAtXZ(a:Float32Array,i:number,mx:number,mz:number):
 number|null{
 const ax=a[i]!,ay=a[i+1]!,az=a[i+2]!;
 const bx=a[i+3]!,by=a[i+4]!,bz=a[i+5]!;
 const cx=a[i+6]!,cy=a[i+7]!,cz=a[i+8]!;
 const den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);
 if(Math.abs(den)<1e-9)return null;
 const u=((bz-cz)*(mx-cx)+(cx-bx)*(mz-cz))/den;
 const v=((cz-az)*(mx-cx)+(ax-cx)*(mz-cz))/den;
 const w=1-u-v;
 if(u< -1e-6||v< -1e-6||w< -1e-6)return null;
 const dx=bx-ax,dy=by-ay,dz=bz-az;
 const ex=cx-ax,ey=cy-ay,ez=cz-az;
 const nx=dy*ez-dz*ey,ny=dz*ex-dx*ez,nz=dx*ey-dy*ex;
 const magnitude=Math.hypot(nx,ny,nz);
 if(magnitude<1e-9||Math.abs(ny)/magnitude<.70)return null;
 const y=u*ay+v*by+w*cy;
 return Number.isFinite(y)?y:null;
}

function requireFrozenSource(stage:StageDefinition){
 if(stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    false)
  throw Error('T21_V23_ORIGINAL_25_17_26_STAGE_REQUIRED');
}
export function auditF3gOriginalFloorAgainstRapier(
 bins:OriginalF3gBins,stage:StageDefinition,physics:RapierStagePhysics
){
 requireFrozenSource(stage);
 const observations=inspectF4OriginalSourceFloorCorridor(
  stage,physics,ORIGINAL_F3G_FLOOR_SAMPLES);
 return {
  source:'PINNED_F3G_STATIC_VISUAL_TRIANGLES_AND_ACTUAL_RAPIER',
  originalStage:'25/17/26/0' as const,
  sourceVersion72TurfCollisionFlags:'UNKNOWN' as const,
  newGameColliders:0 as const,newGameNavigationLinks:0 as const,
  fullStageAlignmentCertified:false as const,
  rows:ORIGINAL_F3G_FLOOR_SAMPLES.map((p,index)=>{
   const [mx,mz]=undertowProjectXZToTemple01ModelXZ([p.x,p.z]);
   let nearest:{kind:OriginalF3gKind;y:number;delta:number}|null=null;
   let intersectionCount=0;
   for(const kind of ORIGINAL_F3G_KINDS){
    const a=bins.get(kind);
    if(!a)continue;
    if(a.length%9!==0)throw Error('T21_V23_BAD_ORIGINAL_TRIANGLE_PACK');
    for(let i=0;i<a.length;i+=9){
     const y=sourceHeightAtXZ(a,i,mx,mz);
     if(y===null)continue;
     intersectionCount++;
     const delta=y-3-p.footY;
     if(!nearest||Math.abs(delta)<Math.abs(nearest.delta))
      nearest={kind,y:y-3,delta};
    }
   }
   const rapier=observations[index]!;
   return {
    id:p.id,provenance:p.provenance,
    projectFoot:[p.x,p.footY,p.z] as const,
    originalModelXZ:[mx,mz] as const,
    originalSourcePlanesAtXZ:intersectionCount,
    closestOriginalVisualKind:nearest?.kind??null,
    closestOriginalVisualY:nearest?.y??null,
    sourceMinusRecordedFootMeters:nearest?.delta??null,
    sourceWithinExistingFootTolerance:nearest!==null&&
     Math.abs(nearest.delta)<=.22,
    rapierSupportId:rapier.originalRapierSupportId,
    rapierFootGapMeters:rapier.originalRapierHitFootGapMeters,
    fullF3gFaceCollisionAuthority:'UNKNOWN' as const,
    connectedWalkableRouteCertified:false as const
   };
  })
 };
}

const TARGET='UndertowT21D:first-drop-landing-positive-z';
/** A genuine Rapier trimesh of exact source FLOOR triangles, limited to an
 * already registered first-drop region. CREATED ONLY IN AN INDEPENDENT STAGE.
 * Material names / visual geometry DO NOT certify original game collision.
 * Never pass this stage to normal SOURCE play or add it to 25 originals.
 */
export function buildIsolatedFirstDropOriginalTriangleStage(
 bins:OriginalF3gBins,original:StageDefinition
){
 requireFrozenSource(original);
 const registered=original.solids.find(s=>s.id===TARGET);
 if(!registered?.footprint||registered.triangleMesh||
    registered.rotationEulerDegrees)
  throw Error('T21_V23_REGISTERED_FIRST_DROP_NOT_FOUND');
 const raw=bins.get('FLOOR');
 if(!raw||raw.length%9!==0)
  return {status:'HOLD_NO_PINNED_FLOOR_BIN' as const,stage:null,
   triangles:0,sourceCollisionFlags:'UNKNOWN' as const};
 const footprint=registered.footprint;
 const inside=(x:number,z:number)=>{
  const u=x-(registered.center[0]-registered.size[0]/2);
  const v=z-(registered.center[2]-registered.size[2]/2);
  return pointInStageFootprint(u,v,footprint);
 };
 const vertices:StageVector3[]=[];
 for(let i=0;i<raw.length;i+=9){
  const tri:StageVector3[]=[];
  let valid=true;
  for(let j=0;j<9;j+=3){
   const mx=raw[i+j]!,my=raw[i+j+1]!,mz=raw[i+j+2]!;
   if(![mx,my,mz].every(Number.isFinite)||Math.abs(my-6)>.015){
    valid=false;break;
   }
   const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
   if(!inside(x,z)){valid=false;break;}
   tri.push([x,my-3,z]);
  }
  if(!valid||tri.length!==3)continue;
  const [a,b,c]=tri;
  const area=Math.abs((b![0]-a![0])*(c![2]-a![2])-
    (b![2]-a![2])*(c![0]-a![0]));
  if(area<1e-6)continue;
  // No clipping across a concave registered boundary or existing hole.
  for(let j=0;j<3;j++){
   const p=tri[j]!,q=tri[(j+1)%3]!;
   for(let t=1;t<=7;t++){
    const f=t/8;
    if(!inside(p[0]+(q[0]-p[0])*f,p[2]+(q[2]-p[2])*f))
     valid=false;
   }
  }
  if(!inside((a![0]+b![0]+c![0])/3,(a![2]+b![2]+c![2])/3))
   valid=false;
  if(!valid)continue;
  vertices.push(...tri);
  if(vertices.length>24000)
   return {status:'HOLD_ISOLATED_TRIANGLE_LIMIT' as const,stage:null,
    triangles:0,sourceCollisionFlags:'UNKNOWN' as const};
 }
 if(vertices.length<3)
  return {status:'HOLD_NO_ENTIRELY_INSIDE_ORIGINAL_TRIANGLES' as const,
   stage:null,triangles:0,sourceCollisionFlags:'UNKNOWN' as const};
 const center=registered.center;
 const local=vertices.map(v=>[v[0]-center[0],v[1]-center[1],
  v[2]-center[2]] as StageVector3);
 const candidate={
  id:'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY',
  center,size:registered.size,material:registered.material,
  render:false,projectileBlocker:false,cameraBlocker:false,
  collisionEnabled:true,navigationEnabled:false,
  triangleMesh:{vertices:local,indices:local.map((_,i)=>i)}
 };
 // Replace ONLY the already registered landing on an isolated full physics
 // clone. Keeping the other 24 source solids makes the REAL ramp junction
 // testable without adding a duplicate collider or granting any new route.
 const stage:StageDefinition={
  metadata:original.metadata,
  solids:original.solids.map(s=>s.id===TARGET?candidate:s),
  paintSurfaces:[],navigationLinks:[]
 };
 return {status:'ISOLATED_24_ORIGINAL_PLUS_SOURCE_TRIANGLE_REPLACEMENT' as const,
  stage,triangles:vertices.length/3,sourceCollisionFlags:'UNKNOWN' as const};
}
export function probeIsolatedFirstDropRapier(
 stage:StageDefinition,physics:RapierStagePhysics
){
 if(stage.solids.length!==25||
    stage.solids.filter(s=>
     s.id==='T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY').length!==1||
    stage.solids.some(s=>s.id===TARGET)||stage.paintSurfaces.length!==0||
    (stage.navigationLinks?.length??0)!==0)
  throw Error('T21_V23_NO_ISOLATED_STAGE');
 return ORIGINAL_F3G_FLOOR_SAMPLES.filter(p=>p.id.startsWith('LOW_')).map(p=>{
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const hit=physics.castCharacterFootSupport(
   new Vec3(p.x,p.footY+offset,p.z),offset,'HUMAN');
  return {id:p.id,originalFoot:[p.x,p.footY,p.z] as const,
   isolatedRapierSupportId:hit?.solidId??null,
   isolatedRapierHeightGapMeters:hit?p.footY-hit.point.y:null,
   actualHumanKccCertified:false as const,
   originalGameCollisionFlagsCertified:false as const};
 });
}

/**
 * Run the EXACT shared production HUMAN capsule/KCC on a temporary Rapier
 * world across the Windows-recorded LOW_SUPPORTED_1355 -> LOW_UNSUPPORTED_1390
 * corridor. Call once on the frozen 25-solid review clone and once on the
 * independent original-triangle candidate, never on a live gameplay world.
 *
 * Both the start and the original material's collision semantics may be
 * unknown. No success result authorizes collision promotion, Recast links,
 * CPU crossing, or final original Turf collision flags.
 */
export function probeV23FirstDropHumanKcc(
 physics:RapierStagePhysics,route:'EDGE_LOSS'|'KNOWN_RAMP'='EDGE_LOSS'
){
 const start=WINDOWS.find(p=>p.id==='LOW_SUPPORTED_1355')!;
 const target=WINDOWS.find(p=>p.id===
  (route==='KNOWN_RAMP'?'RAMP_CONTACT_K1':'LOW_UNSUPPORTED_1390'))!;
 const footOffset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const supportAtStart=physics.castCharacterFootSupport(
  new Vec3(start.x,start.footY+footOffset,start.z),footOffset,'HUMAN');
 const startGap=supportAtStart?
  start.footY-supportAtStart.point.y:null;
 const scope={
  fromWindowsTick:1355 as const,
  toWindowsTick:route==='EDGE_LOSS'?1390:null,
  targetProvenance:target.provenance,route,
  start:[start.x,start.footY,start.z] as const,
  target:[target.x,target.footY,target.z] as const,
  profile:'PRODUCTION_HUMAN_CAPSULE_KCC' as const,
  stageAlteredForLiveGameplay:false as const,
  sourceCollisionFlagsCertified:false as const,
  realPlayerInputCertified:false as const,
  cpuRecastCrossingCertified:false as const
 };
 // An unsupported candidate must NOT be given an artificial starting slab.
 if(!supportAtStart||startGap===null||Math.abs(startGap)>.22){
  return {...scope,status:'HOLD_START_UNSUPPORTED' as const,
   initialSupportId:supportAtStart?.solidId??null,
   initialFootGapMeters:startGap,firstUnsupportedStep:0,
   supportedMovementSteps:0,observedMovementMeters:0,
   observations:[]};
 }
 const world=physics.world;
 const body=world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   start.x,start.footY+footOffset+.06,start.z));
 const collider=world.createCollider(RAPIER.ColliderDesc.capsule(
  PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
  PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
 const character=createConfiguredPlayerCharacterController(world);
 const settleSteps=4,movingSteps=60;
 const dx=(target.x-start.x)/movingSteps;
 const dz=(target.z-start.z)/movingSteps;
 const observations:Array<{
  tick:number;foot:readonly [number,number,number];grounded:boolean;
  nearHeightSupportId:string|null;footGapMeters:number|null
 }>=[];
 let firstUnsupportedStep:number|null=null;
 let supportedMovementSteps=0;
 for(let tick=0;tick<settleSteps+movingSteps;tick++){
  const before=body.translation();
  character.computeColliderMovement(collider,
   new Vec3(tick<settleSteps?0:dx,-.075,tick<settleSteps?0:dz),
   undefined,undefined,
   (candidate)=>physics.shouldCharacterCollide(candidate,'HUMAN'));
  const movement=character.computedMovement();
  const grounded=character.computedGrounded();
  body.setNextKinematicTranslation({
   x:before.x+movement.x,y:before.y+movement.y,z:before.z+movement.z
  });
  physics.step();
  const after=body.translation();
  const footY=after.y-footOffset;
  const hit=physics.castCharacterFootSupport(
   new Vec3(after.x,after.y,after.z),footOffset,'HUMAN');
  const gap=hit?footY-hit.point.y:null;
  const nearHeight=hit!==null&&gap!==null&&Math.abs(gap)<=.22;
  const supported=grounded&&nearHeight;
  if(tick>=settleSteps){
   if(supported)supportedMovementSteps++;
   else if(firstUnsupportedStep===null)firstUnsupportedStep=tick-settleSteps+1;
  }
  if(tick===settleSteps-1||tick===settleSteps+movingSteps-1||
     (tick>=settleSteps&&(tick-settleSteps+1)%10===0)||
     (firstUnsupportedStep!==null&&firstUnsupportedStep===tick-settleSteps+1)){
   observations.push({tick:tick-settleSteps+1,
    foot:[after.x,footY,after.z],grounded,
    nearHeightSupportId:nearHeight?hit!.solidId:null,
    footGapMeters:gap});
  }
 }
 const last=body.translation();
 const observedMovementMeters=Math.hypot(last.x-start.x,last.z-start.z);
 const endpointErrorMeters=Math.hypot(last.x-target.x,last.z-target.z);
 // A capsule that stays grounded because it was BLOCKED before reaching the
 // target must never be recorded as a continuous successful crossing.
 const endpointReached=endpointErrorMeters<=.12;
 return {...scope,
  status:firstUnsupportedStep!==null?
   'OBSERVED_KCC_SUPPORT_LOSS' as const:
   !endpointReached?'HOLD_KCC_TARGET_NOT_REACHED' as const:
   'OBSERVED_KCC_SUPPORTS_THIS_LOCAL_CORRIDOR_ONLY' as const,
  initialSupportId:supportAtStart.solidId,
  initialFootGapMeters:startGap,firstUnsupportedStep,
  supportedMovementSteps,observedMovementMeters,
  endpointErrorMeters,endpointReached,
  observations};
}
