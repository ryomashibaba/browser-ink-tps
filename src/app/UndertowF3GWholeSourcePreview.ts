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
import {GAME_CONFIG} from '../config/game/gameConfig';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {PLAYER_CHARACTER_PHYSICS,
 createConfiguredPlayerCharacterController} from '../player/PlayerCharacterPhysics';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {originalVisualRegistration} from './UndertowF3OriginalVisualRegistration';
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
/** Expensive original-source Rapier replay is a separate research action.
 * Merely opening the correctly registered full-source visual stage must not
 * allocate six extra physics worlds or run simulated KCC ticks on startup.
 * Never grants original-version collision, floor, paint, nav or scoring.
 */
export function v23ExplicitPhysicsReviewRequested(q:URLSearchParams):boolean{
 return originalVisualRegistration(q)!==null&&
  q.getAll('t21V23Physics').length===1&&
  q.get('t21V23Physics')==='isolated';
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
 let v23Evidence:unknown={
  status:'NOT_RUN_EXPLICIT_ISOLATED_PHYSICS_REVIEW_REQUIRED',
  liveOriginalStageModified:false,physicalFloorCertified:false
 };
 const q=new URL(location.href).searchParams;
 // The visual model pose remains enabled independently. The isolated physics
 // replay is opt-in only, keeping normal screenshot/preview startup lightweight.
 if(v23ExplicitPhysicsReviewRequested(q)){
  try{
   const stage=undertowT21dConnectivityQaStage();
   const syntheticFallHeight=auditV23WindowsFallStaticHeightSection(verifiedTriangles);
   const real=new RapierStagePhysics(1/60,stage);
   try{
    real.step();
    const alignment=auditF3gOriginalFloorAgainstRapier(
     verifiedTriangles,stage,real);
    const isolated=buildIsolatedFirstDropOriginalTriangleStage(
     verifiedTriangles,stage);
    const originalLow=buildIsolatedV23LowOriginalFloor(
     verifiedTriangles,stage,real);
    let originalLowContact:ReturnType<typeof inspectV23IsolatedLowFloorContact>|null=null;
    let originalLowKcc:ReturnType<typeof probeV23IsolatedLowHumanKcc>|null=null;
    let originalLowNativeAirKcc:
     ReturnType<typeof probeV23PredictedOriginalLowLandingKcc>|null=null;
    let originalLowReleasedAirKcc:
     ReturnType<typeof probeV23PredictedOriginalLowLandingKcc>|null=null;
    if(originalLow.stage){
     const lowWorld=new RapierStagePhysics(1/60,originalLow.stage);
     try{
      lowWorld.step();
      originalLowContact=inspectV23IsolatedLowFloorContact(
       lowWorld,'recordedWitnessBoundaryClearanceMeters' in originalLow
        ? originalLow.recordedWitnessBoundaryClearanceMeters:null);
     }finally{lowWorld.world.free();}
     const lowKccWorld=new RapierStagePhysics(1/60,originalLow.stage);
     try{
      lowKccWorld.step();
      originalLowKcc=probeV23IsolatedLowHumanKcc(lowKccWorld);
     }finally{lowKccWorld.world.free();}
     const lowNativeAirWorld=new RapierStagePhysics(1/60,originalLow.stage);
     try{
      lowNativeAirWorld.step();
      originalLowNativeAirKcc=probeV23PredictedOriginalLowLandingKcc(
       lowNativeAirWorld);
     }finally{lowNativeAirWorld.world.free();}
     // Separate temporary world: no leftover capsule or controller from the
     // continued-input case can influence the zero-input native trajectory.
     const lowReleasedWorld=new RapierStagePhysics(1/60,originalLow.stage);
     try{
      lowReleasedWorld.step();
      originalLowReleasedAirKcc=probeV23PredictedOriginalLowLandingKcc(
       lowReleasedWorld,'RELEASE');
     }finally{lowReleasedWorld.world.free();}
    }
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
    v23Evidence={alignment,syntheticFallHeight,registeredWalk,registeredRampWalk,
     originalLowFloor:{status:originalLow.status,sourceTriangles:originalLow.triangles,
      physicalContactAtOriginalY0:originalLowContact,
      nativeAirExtrapolation:predictV23OriginalY0LandingFromNativeAir(),
      isolatedHumanKcc:originalLowKcc,
      hypotheticalNativeAirLandingKcc:originalLowNativeAirKcc,
      hypotheticalReleasedInputLandingKcc:originalLowReleasedAirKcc,
      originalCollisionFlags:'UNKNOWN',normalGameModified:false,
      realHumanLandingCertified:false},
     isolation:{status:isolated.status,
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
 // K1 genuine same-run starting body (-.079,3.896,50.582), recorded
 // to millimetres; subtract the unchanged native HUMAN capsule foot offset.
 {id:'RAMP_APPROACH_K1',x:-.079,z:50.582,
  footY:3.896-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
  provenance:'CHROMIUM_K1'},
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

/** Two witnessed Windows tick positions, 21 SYNTHETIC straight-line XZ
 * samples between them. Not a witnessed walk, original version-7.2 collision
 * map, actor placement, or a globally authenticated source transform.
 */
export function auditV23WindowsFallStaticHeightSection(bins:OriginalF3gBins){
 const base={witnesses:['LOW_SUPPORTED_1355','LOW_UNSUPPORTED_1390'] as const,
  syntheticIntermediateSamples:true as const,actualRouteCertified:false as const,
  actorPlacementsCertified:false as const,globalTransformCertified:false as const,
  originalCollisionFlagsCertified:false as const};
 if(ORIGINAL_F3G_KINDS.some(k=>!bins.has(k)))return {
  ...base,status:'HOLD_INCOMPLETE_PINNED_SOURCE' as const,
  sampledPoints:0,nearRecordedFootSamples:null as number|null};
 const start=WINDOWS.find(p=>p.id==='LOW_SUPPORTED_1355')!;
 const end=WINDOWS.find(p=>p.id==='LOW_UNSUPPORTED_1390')!;
 let nearRecordedFootSamples=0,pointsWithAnyStaticPlane=0;
 const nearestOriginalPlaneGapMeters:Array<number|null>=[];
 for(let step=0;step<=20;step++){
  const t=step/20;
  const x=start.x+(end.x-start.x)*t,z=start.z+(end.z-start.z)*t;
  const footY=start.footY+(end.footY-start.footY)*t;
  const [mx,mz]=undertowProjectXZToTemple01ModelXZ([x,z]);
  let near=false,nearest:number|null=null;
  for(const kind of ORIGINAL_F3G_KINDS){
   const a=bins.get(kind)!;
   if(a.length%9!==0)throw Error('T21_V23_BAD_STATIC_SOURCE_BIN');
   for(let i=0;i<a.length;i+=9){
    const sourceY=sourceHeightAtXZ(a,i,mx,mz);
    if(sourceY===null)continue;
    const delta=sourceY-3-footY;
    if(nearest===null||Math.abs(delta)<Math.abs(nearest))nearest=delta;
    if(Math.abs(delta)<=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters)near=true;
   }
  }
  if(near)nearRecordedFootSamples++;
  if(nearest!==null)pointsWithAnyStaticPlane++;
  nearestOriginalPlaneGapMeters.push(nearest);
 }
 return {...base,status:'SOURCE_HEIGHT_SECTION_INSPECTED_ONLY' as const,
  sampledPoints:21,nearRecordedFootSamples,pointsWithAnyStaticPlane,
  nearestOriginalPlaneGapMeters,
  originalY0SourceDoesNotCertifyY3Support:true as const};
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
   let opticalFloor:{kind:'FLOOR'|'SLOPE';y:number;delta:number}|null=null;
   let opticalFloorPlanes=0;
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
     // Names are source MATERIAL hints, never original collision flags.
     // Keep glass/roof/decorative planes out of the floor-only comparison.
     if(kind==='FLOOR'||kind==='SLOPE'){
      opticalFloorPlanes++;
      if(!opticalFloor||Math.abs(delta)<Math.abs(opticalFloor.delta))
       opticalFloor={kind,y:y-3,delta};
     }
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
    // Floor MATERIAL is only a candidate; physical walkability remains HOLD.
    sourceOpticalFloorPlanesAtXZ:opticalFloorPlanes,
    nearestSourceOpticalFloorKind:opticalFloor?.kind??null,
    nearestSourceOpticalFloorY:opticalFloor?.y??null,
    sourceOpticalFloorMinusRecordedFootMeters:opticalFloor?.delta??null,
    sourceOpticalFloorMinusRegisteredRapierMeters:opticalFloor!==null&&
     rapier.originalRapierHitFootGapMeters!==null?
      opticalFloor.delta+rapier.originalRapierHitFootGapMeters:null,
    actualFootWitness:p.provenance!=='REGISTERED_MODEL_REGION',
    sourceOpticalMaterialConfersCollisionAuthority:false as const,
    // Unlike foot-to-visual error, this compares actual near-height Rapier.
    // Missing registered support is UNKNOWN (null), never a claimed 0m gap.
    sourceMinusRegisteredRapierMeters:nearest!==null&&
     rapier.originalRapierHitFootGapMeters!==null?
      nearest.delta+rapier.originalRapierHitFootGapMeters:null,
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

/** Entire ORIGINAL face must stay within the registered landing outline.
 * Checking seven discrete edge points can jump a narrow source-owned notch.
 * No triangle clipping, fabricated vertices or live SOURCE collision.
 */
function triangleInsideRegisteredLanding(
 tri:readonly StageVector3[],
 solid:StageDefinition['solids'][number],
 footprint:NonNullable<StageDefinition['solids'][number]['footprint']>
):boolean{
 type XZ=readonly [number,number];
 const x0=solid.center[0]-solid.size[0]/2;
 const z0=solid.center[2]-solid.size[2]/2;
 const pts=tri.map(p=>[p[0]-x0,p[2]-z0] as const);
 if(pts.length!==3)return false;
 const cross=(a:XZ,b:XZ,c:XZ)=>
  (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const rings=[footprint.outer,...(footprint.holes??[])];
 const insideTri=(p:XZ)=>{
  const a=cross(pts[0]!,pts[1]!,p);
  const b=cross(pts[1]!,pts[2]!,p);
  const c=cross(pts[2]!,pts[0]!,p);
  return (a>1e-9&&b>1e-9&&c>1e-9)||
   (a< -1e-9&&b< -1e-9&&c< -1e-9);
 };
 // Reject any boundary/concavity or full hole swallowed by a source face.
 if(rings.some(r=>r.some(insideTri)))return false;
 for(let edge=0;edge<3;edge++){
  const a=pts[edge]!,b=pts[(edge+1)%3]!;
  const vx=b[0]-a[0],vz=b[1]-a[1],lenSq=vx*vx+vz*vz;
  if(lenSq<1e-12)return false;
  const cuts=[0,1];
  for(const ring of rings)for(let j=0;j<ring.length;j++){
   const c=ring[j]!,d=ring[(j+1)%ring.length]!;
   const wx=c[0]-a[0],wz=c[1]-a[1];
   const ux=d[0]-c[0],uz=d[1]-c[1],den=vx*uz-vz*ux;
   if(Math.abs(den)>1e-10){
    const t=(wx*uz-wz*ux)/den;
    const u=(wx*vz-wz*vx)/den;
    if(t>=0&&t<=1&&u>=0&&u<=1)cuts.push(t);
   }else if(Math.abs(wx*vz-wz*vx)<1e-8){
    for(const p of [c,d]){
     const t=((p[0]-a[0])*vx+(p[1]-a[1])*vz)/lenSq;
     if(t>0&&t<1)cuts.push(t);
    }
   }
  }
  cuts.sort((x,y)=>x-y);
  for(let j=0;j+1<cuts.length;j++){
   const lo=cuts[j]!,hi=cuts[j+1]!;
   if(hi-lo<=1e-10)continue;
   const t=(lo+hi)/2;
   if(!pointInStageFootprint(a[0]+vx*t,a[1]+vz*t,footprint))
    return false;
  }
 }
 return true;
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
  // Exact boundary crossings, not seven approximate samples.
  if(!triangleInsideRegisteredLanding(tri,registered,footprint))continue;
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


/** Only three genuine Windows/native 60Hz samples, from the saved 1498-tick
 * floor trace. They are NOT observed native frames after tick 1390.
 * No guessed gameplay floor, input, version-specific flags or transport.
 */
const V23_OBSERVED_NATIVE_AIR_1388_TO_1390=[
 {tick:1388,body:[0.7357593774795532,4.013314723968506,44.241920471191406]},
 {tick:1389,body:[0.7781197428703308,3.8855369091033936,44.16631317138672]},
 {tick:1390,body:[0.8204801082611084,3.74998140335083,44.09070587158203]}
] as const;

/** Hypothetical ballistic continuation, not proof that the user actually
 * kept holding the same movement or that source-Y0 has original collision.
 * Uses the game's 60Hz/28m/s2 physics constants without guessing a jump.
 */
export function predictV23OriginalY0LandingFromNativeAir(){
 const [f0,f1,f2]=V23_OBSERVED_NATIVE_AIR_1388_TO_1390;
 const perTickY=f2.body[1]-f1.body[1];
 const observedSecondDelta=f2.body[1]-2*f1.body[1]+f0.body[1];
 const expectedSecondDelta=-GAME_CONFIG.player.gravityMetersPerSecond2/
  (GAME_CONFIG.simulation.tickRate**2);
 if(Math.abs(observedSecondDelta-expectedSecondDelta)>5e-5||
    !Number.isFinite(perTickY)||perTickY>=0)
  throw Error('T21_V23_NATIVE_AIR_TRAJECTORY_UNVERIFIED');
 const footY=f2.body[1]-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const predictedY=(n:number)=>footY+n*perTickY+
  observedSecondDelta*n*(n+1)/2;
 let crossingWholeTick=0;
 for(let n=1;n<=60;n++){
  if(predictedY(n)<=0){crossingWholeTick=n;break;}
 }
 if(!crossingWholeTick)throw Error('T21_V23_NATIVE_AIR_NO_Y0_CROSSING');
 const n=crossingWholeTick;
 const fraction=predictedY(n-1)/(predictedY(n-1)-predictedY(n));
 const t=n-1+fraction;
 return {
  status:'EXTRAPOLATED_Y0_CROSSING_NOT_ACTUAL_LANDING' as const,
  recordedNativeTicks:[1388,1389,1390] as const,
  predictedNativeTick:1390+t,
  firstWholeNativeTickAtOrBelowY0:1390+n,
  projectedXZ:[
   f2.body[0]+(f2.body[0]-f1.body[0])*t,
   f2.body[2]+(f2.body[2]-f1.body[2])*t
  ] as readonly [number,number],
  lastRecordedFootY:footY,
  perTickY,observedSecondDelta,
  observedGravityConsistent:true as const,
  horizontalInputContinuedAssumption:true as const,
  actualPost1390PlayerPathObserved:false as const,
  originalCollisionFlagsCertified:false as const,
  sourceY0IsGameplayFloorCertified:false as const,
  normalStageModified:false as const
 };
}

/** Both post-1390 horizontal-input cases use the same recorded 1389->1390
 * velocity and actual PlayerController's 60Hz per-axis zero-input braking.
 * No post-1390 user input is observed; this never certifies actual landing.
 */
export type V23AirInputCase='CONTINUE'|'RELEASE';
export function v23HypotheticalAirXZDeltaAtTick(
 tickAfter1390:number,scenario:V23AirInputCase
):readonly[number,number]{
 if(!Number.isSafeInteger(tickAfter1390)||tickAfter1390<1||
    tickAfter1390>40||!(scenario==='CONTINUE'||scenario==='RELEASE'))
  throw Error('T21_V23_AIR_INPUT_SCENARIO_INVALID');
 const [,previous,recorded]=V23_OBSERVED_NATIVE_AIR_1388_TO_1390;
 const dx=recorded.body[0]-previous.body[0];
 const dz=recorded.body[2]-previous.body[2];
 if(scenario==='CONTINUE')return [dx,dz];
 const rate=GAME_CONFIG.simulation.tickRate;
 const decrease=GAME_CONFIG.player.decelerationMetersPerSecond2/rate;
 const axis=(perTick:number)=>{
  const originalVelocity=perTick*rate;
  const speed=Math.max(0,Math.abs(originalVelocity)-
   decrease*tickAfter1390);
  // A stopped Z axis must be +0, not JS -0. Preserve native movement
  // distance; avoid treating signed-zero artifacts as different input cases.
  return speed===0?0:Math.sign(originalVelocity)*speed/rate;
 };
 return [axis(dx),axis(dz)];
}

/** Counterfactual release of human movement input AFTER recorded native
 * tick1390. Replicates PlayerController.applyHorizontalTarget's zero-input
 * PER-AXIS moveToward(v,0,34/60); gravity and KCC remain unmodified.
 * Never treat this as observed post1390 input or as original floor authority.
 */
export function predictV23ReleasedInputY0Position(){
 const baseline=predictV23OriginalY0LandingFromNativeAir();
 const [, ,recorded]=V23_OBSERVED_NATIVE_AIR_1388_TO_1390;
 let x=recorded.body[0],z=recorded.body[2];
 // The final fraction of a tick has zero horizontal velocity for this
 // recorded speed after release. Tick-1405 and fractional XZ therefore agree.
 const count=baseline.firstWholeNativeTickAtOrBelowY0-1390;
 for(let n=1;n<=count;n++){
  const [stepX,stepZ]=v23HypotheticalAirXZDeltaAtTick(n,'RELEASE');
  x+=stepX;z+=stepZ;
 }
 return {
  source:'SIMULATED_NO_INPUT_PER_AXIS_DECELERATION' as const,
  projectedXZ:[x,z] as readonly[number,number],
  fixedSourceY0CrossingNativeTick:baseline.predictedNativeTick,
  actualPlayerInputAfter1390Observed:false as const,
  originalVersion72CollisionCertified:false as const,
  rapierContactCertified:false as const,
  liveStageModified:false as const
 };
}

/** Strict original-source FLO0R candidate in an ISOLATED Rapier world.
 * The retained source Face ledger's SHA-verified gzip describes exactly 11
 * edge-connected static FLOOR triangles at native Y=3 (project Y=0), near
 * the Windows 1390 FALL XZ. Neither original collision flags nor human
 * ability to reach the lower floor are known. No OBJ vertices are embedded.
 */
export const V23_LOW_ISOLATED_SOLID_ID=
 'T21_V23_ISOLATED_EXACT_STATIC_Y0_COMPONENT_NOT_AUTHORIZED';
/** Source-origin triangle orientation in native X/Y/Z. Only for the
 * already pinned F3G FLOOR bin, not an assertion of playable collision.
 * A reversed face can have exactly the same triangle area, bounding box,
 * connectivity and optical look, but an unreliable Rapier contact normal.
 */
export function v23HasSourceUpwardFloorWinding(
 p:readonly [StageVector3,StageVector3,StageVector3]
):boolean{
 const [a,b,c]=p;
 if(![...a,...b,...c].every(Number.isFinite)||
    [a[1],b[1],c[1]].some(y=>Math.abs(y-3)>.0001))
  return false;
 const normalY=(b[2]-a[2])*(c[0]-a[0])-
  (b[0]-a[0])*(c[2]-a[2]);
 return normalY>1e-7;
}
export function buildIsolatedV23LowOriginalFloor(
 bins:OriginalF3gBins,stage:StageDefinition,native:RapierStagePhysics
){
 requireFrozenSource(stage);
 const hold=(status:string,count=0)=>({
  status,triangles:count,stage:null as StageDefinition|null,
  collisionFlags:'UNKNOWN' as const,realWalkabilityCertified:false as const});
 const source=bins.get('FLOOR');
 if(!source||source.length%9!==0)return hold('HOLD_NO_PINNED_FLOOR_BIN');
 type Tri={p:readonly[StageVector3,StageVector3,StageVector3];edges:readonly string[]};
 const all:Tri[]=[];
 // F3G contains already-verified Float32 coordinates. Do NOT round them
 // again: 4-decimal joins could fabricate connections across tiny source
 // cracks. Equality here means binary-Float32 coordinate agreement only;
 // it is NOT recovered original OBJ vertex-ID topology.
 const vkey=(p:StageVector3)=>p.map(v=>String(v)).join(',');
 const ekey=(a:StageVector3,b:StageVector3)=>[vkey(a),vkey(b)].sort().join('|');
 for(let i=0;i<source.length;i+=9){
  const a=[source[i]!,source[i+1]!,source[i+2]!] as const;
  const b=[source[i+3]!,source[i+4]!,source[i+5]!] as const;
  const c=[source[i+6]!,source[i+7]!,source[i+8]!] as const;
  if(![...a,...b,...c].every(Number.isFinite)||
   [a[1],b[1],c[1]].some(y=>Math.abs(y-3)>.0001))continue;
  const signed=(b[0]-a[0])*(c[2]-a[2])-(c[0]-a[0])*(b[2]-a[2]);
  if(Math.abs(signed)<1e-7)continue;
  all.push({p:[a,b,c],edges:[ekey(a,b),ekey(b,c),ekey(c,a)]});
 }
 const witness=WINDOWS.find(p=>p.id==='LOW_UNSUPPORTED_1390')!;
 const [mx,mz]=undertowProjectXZToTemple01ModelXZ([witness.x,witness.z]);
 const seeds=all.map((t,i)=>sourceHeightAtXZ(
  Float32Array.from(t.p.flatMap(p=>[...p])),0,mx,mz)!==null?i:-1).filter(i=>i>=0);
 if(seeds.length!==1)return hold('HOLD_LOW_FLOOR_ANCHOR_AMBIGUOUS',seeds.length);
 const edges=new Map<string,number[]>();
 all.forEach((t,i)=>t.edges.forEach(e=>{
  const ids=edges.get(e)??[];ids.push(i);edges.set(e,ids);
 }));
 const seen=new Set<number>([seeds[0]!]),q=[seeds[0]!];
 for(let i=0;i<q.length;i++){
  for(const e of all[q[i]!]!.edges)for(const n of edges.get(e)??[]){
   if(!seen.has(n)){seen.add(n);q.push(n);}
  }
  if(seen.size>256)return hold('HOLD_LOW_FLOOR_COMPONENT_UNBOUNDED',seen.size);
 }
 const selected=[...seen].map(i=>all[i]!);
 if(selected.some(t=>!v23HasSourceUpwardFloorWinding(t.p)))
  return hold('HOLD_LOW_FLOOR_SOURCE_WINDING_NOT_UP',selected.length);
 let area=0,minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
 for(const t of selected){
  const [a,b,c]=t.p;
  area+=Math.abs((b[0]-a[0])*(c[2]-a[2])-
   (c[0]-a[0])*(b[2]-a[2]))/2;
  for(const p of t.p){
   minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);
   minZ=Math.min(minZ,p[2]);maxZ=Math.max(maxZ,p[2]);
  }
 }
 // These measurements come from the independent, retained source ledger.
 // A nonmatching optical pack cannot quietly create a new physical floor.
 if(selected.length!==11||Math.abs(area-296.5)>.02||
    Math.abs(minX+29.5)>.001||Math.abs(maxX+4.25)>.001||
    Math.abs(minZ-21.5)>.001||Math.abs(maxZ-38.5)>.001)
  return hold('HOLD_LOW_FLOOR_PROVENANCE_GEOMETRY_DRIFT',selected.length);
 // Only source boundary edges that occur once are physical outer edges.
 // Reject nonmanifold connectivity instead of treating a ray as a full capsule.
 const border=new Map<string,{a:StageVector3;b:StageVector3;count:number}>();
 for(const t of selected)for(let i=0;i<3;i++){
  const a=t.p[i]!,b=t.p[(i+1)%3]!,key=ekey(a,b),known=border.get(key);
  if(known)known.count++;
  else border.set(key,{a,b,count:1});
 }
 if([...border.values()].some(e=>e.count>2))
  return hold('HOLD_LOW_FLOOR_NONMANIFOLD_BOUNDARY',selected.length);
 const exposed=[...border.values()].filter(e=>e.count===1);
 if(exposed.length<3)return hold('HOLD_LOW_FLOOR_NO_BOUNDARY',selected.length);
 const segments=exposed.map(e=>({
  a:undertowTemple01ModelXZToProjectXZ([e.a[0],e.a[2]]),
  b:undertowTemple01ModelXZToProjectXZ([e.b[0],e.b[2]])
 }));
 const clearance=(x:number,z:number)=>Math.min(...segments.map(({a,b})=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],lengthSq=dx*dx+dz*dz;
  if(lengthSq<1e-12)return Infinity;
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/lengthSq));
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
 }));
 const witnessClearance=clearance(witness.x,witness.z);
 const humanRadius=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters;
 const witnessFullCapsuleFits=witnessClearance>=humanRadius;
 // A forty-step source-Y0 test corridor must remain on exact source faces
 // with the frozen 0.32m HUMAN capsule fully inside the real edge polygon.
 const faceBuffers=selected.map(t=>Float32Array.from(t.p.flatMap(p=>[...p])));
 const margins:number[]=[];
 for(let i=0;i<=40;i++){
  const testZ=mz-.6-i/40;
  const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,testZ]);
  if(!faceBuffers.some(a=>sourceHeightAtXZ(a,0,mx,testZ)!==null))
   return hold('HOLD_LOW_KCC_PATH_OUTSIDE_ORIGINAL_TRIANGLES',selected.length);
  margins.push(clearance(x,z));
 }
 const pathMinClearance=Math.min(...margins);
 if(!Number.isFinite(pathMinClearance)||pathMinClearance<humanRadius)
  return hold('HOLD_LOW_KCC_PATH_CAPSULE_TOO_CLOSE_TO_EDGE',selected.length);
 // Unlike the tick-1390 witness at Y2.88, the extrapolated Y0 crossing
 // must fit the complete HUMAN capsule strictly inside the original faces.
 const predictedLanding=predictV23OriginalY0LandingFromNativeAir();
 const [lx,lz]=predictedLanding.projectedXZ;
 const [lmx,lmz]=undertowProjectXZToTemple01ModelXZ([lx,lz]);
 if(!faceBuffers.some(a=>sourceHeightAtXZ(a,0,lmx,lmz)!==null))
  return hold('HOLD_EXTRAPOLATED_Y0_NOT_ON_ORIGINAL_FACE',selected.length);
 const predictedLandingClearance=clearance(lx,lz);
 if(!Number.isFinite(predictedLandingClearance)||
    predictedLandingClearance<humanRadius)
  return hold('HOLD_EXTRAPOLATED_Y0_NO_FULL_CAPSULE_CLEARANCE',selected.length);
 // Read-only uncertainty comparison. A continued-input success cannot
 // certify a landing if the human may have released movement at tick1390.
 const releasedInput=predictV23ReleasedInputY0Position();
 const [rx,rz]=releasedInput.projectedXZ;
 const [rmx,rmz]=undertowProjectXZToTemple01ModelXZ([rx,rz]);
 const releasedOnFace=faceBuffers.some(a=>
  sourceHeightAtXZ(a,0,rmx,rmz)!==null);
 const releaseBoundaryClearance= releasedOnFace?clearance(rx,rz):null;
 const conservativeControllerClearanceMeters=humanRadius+
  PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters;
 // A valid endpoint disk is not enough: the *same* extrapolated native
 // trajectory must enter the original source capsule-safe interior BEFORE
 // its falling feet pass source Y0. No native input after tick1390 is known.
 const [,observedPrevious,observedAt1390]=
  V23_OBSERVED_NATIVE_AIR_1388_TO_1390;
 let firstCapsuleClearNativeTick:number|null=null;
 for(let tick=1390;tick<predictedLanding.firstWholeNativeTickAtOrBelowY0;tick++){
  const steps=tick-1390;
  const px=observedAt1390.body[0]+
   (observedAt1390.body[0]-observedPrevious.body[0])*steps;
  const pz=observedAt1390.body[2]+
   (observedAt1390.body[2]-observedPrevious.body[2])*steps;
  const [mmx,mmz]=undertowProjectXZToTemple01ModelXZ([px,pz]);
  if(!faceBuffers.some(a=>sourceHeightAtXZ(a,0,mmx,mmz)!==null))
   continue;
  if(clearance(px,pz)>=humanRadius){
   firstCapsuleClearNativeTick=tick;break;
  }
 }
 if(firstCapsuleClearNativeTick===null)
  return hold('HOLD_EXTRAPOLATED_CAPSULE_NOT_INSIDE_BEFORE_Y0',selected.length);
 const points=selected.flatMap(t=>t.p).map(p=>{
  const [x,z]=undertowTemple01ModelXZToProjectXZ([p[0],p[2]]);
  return [x,p[1]-3,z] as StageVector3;
 });
 const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 for(let i=0;i<points.length;i+=3){
  const a=points[i]!,b=points[i+1]!,c=points[i+2]!;
  const probes:StageVector3[]=[a,b,c,
   [(a[0]+b[0])/2,0,(a[2]+b[2])/2],
   [(b[0]+c[0])/2,0,(b[2]+c[2])/2],
   [(c[0]+a[0])/2,0,(c[2]+a[2])/2],
   [(a[0]+b[0]+c[0])/3,0,(a[2]+b[2]+c[2])/3]];
  for(const p of probes){
   const hit=native.castCharacterFootSupport(
    new Vec3(p[0],p[1]+offset,p[2]),offset,'HUMAN');
   if(hit&&Math.abs(p[1]-hit.point.y)<=.22)
    return hold('HOLD_LOW_FLOOR_DUPLICATES_REGISTERED_RAPIER',selected.length);
  }
 }
 const minPx=Math.min(...points.map(p=>p[0]));
 const maxPx=Math.max(...points.map(p=>p[0]));
 const minPz=Math.min(...points.map(p=>p[2]));
 const maxPz=Math.max(...points.map(p=>p[2]));
 const cx=(minPx+maxPx)/2,cz=(minPz+maxPz)/2;
 const candidate={
  id:V23_LOW_ISOLATED_SOLID_ID,center:[cx,0,cz] as const,
  size:[maxPx-minPx,.01,maxPz-minPz] as const,
  material:'medium' as const,render:false,
  projectileBlocker:false,cameraBlocker:false,
  collisionEnabled:true,navigationEnabled:false,
  triangleMesh:{vertices:points.map(p=>[p[0]-cx,p[1],p[2]-cz] as StageVector3),
   indices:points.map((_,i)=>i)}
 };
 const isolated:StageDefinition={
  metadata:stage.metadata,solids:[...stage.solids,candidate],
  paintSurfaces:[],navigationLinks:[]
 };
 return {status:'ISOLATED_ORIGINAL_Y0_GEOMETRIC_CANDIDATE' as const,
  triangles:selected.length,stage:isolated as StageDefinition|null,
  areaSquareMeters:area,
  recordedWitnessBoundaryClearanceMeters:witnessClearance,
  recordedWitnessFullCapsuleFits:witnessFullCapsuleFits,
  extrapolatedY0Landing:{...predictedLanding,
   exactOriginalFloorFaceAtXZ:true as const,
   planarBoundaryClearanceMeters:predictedLandingClearance,
   releasedInputSensitivity:{
    ...releasedInput,
    onExactOriginalSourceFace:releasedOnFace,
    boundaryClearanceMeters:releaseBoundaryClearance,
    humanRadiusMeters:humanRadius,
    conservativeControllerClearanceMeters,
    fullCapsuleRadiusFits:releasedOnFace&&
     releaseBoundaryClearance!==null&&
     releaseBoundaryClearance>=humanRadius,
    radiusPlusControllerOffsetFits:releasedOnFace&&
     releaseBoundaryClearance!==null&&
     releaseBoundaryClearance>=conservativeControllerClearanceMeters,
    offsetIsOnlyConservativeGeometryHeuristic:true as const
   },
   firstCapsuleClearNativeTick,
   fullCapsuleEnteredBeforePredictedY0Crossing:true as const,
   fullCapsuleFitsWithinExactOriginalSource:true as const},
  isolatedCorridorMinBoundaryClearanceMeters:pathMinClearance,
  isolatedCorridorCapsuleFullyInsideSource:true as const,
  recordedWindowsLandingCertified:false as const,
  sourceVersionCollisionFlags:'UNKNOWN' as const,
  realWalkabilityCertified:false as const,liveGameModified:false as const};
}

/** A source-Y0 ray contact and a human capsule footprint are distinct.
 * The historical human fell at Y=3, so this intentionally hypothetical ray
 * at Y=0 is never a recorded landfall or original collision proof.
 */
export function classifyV23LowOriginalFootprintContact(
 sourceRaySolidId:string|null,boundaryClearanceMeters:number|null
){
 const capsuleRadiusMeters=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters;
 const exactSourceRayHit=sourceRaySolidId===V23_LOW_ISOLATED_SOLID_ID;
 const edgeClear=boundaryClearanceMeters!==null&&
  Number.isFinite(boundaryClearanceMeters)&&
  boundaryClearanceMeters>=capsuleRadiusMeters;
 return {
  exactSourceRayHit,
  capsuleRadiusMeters,
  boundaryClearanceMeters,
  fullCapsulePlanarClearancePass:exactSourceRayHit&&edgeClear,
  sourceVersion72CollisionFlagsCertified:false as const,
  playerReachedOrLandedAtY0:false as const,
  sourcePlaneRayIsRealGameplaySupport:false as const
 };
}
export function inspectV23IsolatedLowFloorContact(
 world:RapierStagePhysics,boundaryClearanceMeters:number|null
){
 const p=WINDOWS.find(p=>p.id==='LOW_UNSUPPORTED_1390')!;
 const o=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const hit=world.castCharacterFootSupport(new Vec3(p.x,o,p.z),o,'HUMAN');
 return {...classifyV23LowOriginalFootprintContact(
   hit?.solidId??null,boundaryClearanceMeters),
  recordedHumanFootY:p.footY,hypotheticalSourceRayFootY:0 as const,
  originalWindowsXZ:[p.x,p.z] as const,
  hitSolidId:hit?.solidId??null,
  hypotheticalSourceHeightGapMeters:hit?-hit.point.y:null,
  actualHumanReachedThisFloor:false as const,
  gameCollisionFlagsCertified:false as const};
}
/** Real HUMAN production-profile Rapier KCC in the independent candidate.
 * Source-native path is a one-metre capsule-clear segment on the retained
 * 11-triangle component. It is NOT a witnessed human drop or gameplay route.
 */
export function probeV23IsolatedLowHumanKcc(physics:RapierStagePhysics){
 const observed=WINDOWS.find(p=>p.id==='LOW_UNSUPPORTED_1390')!;
 const [mx,mz]=undertowProjectXZToTemple01ModelXZ([observed.x,observed.z]);
 const [sx,sz]=undertowTemple01ModelXZToProjectXZ([mx,mz-.6]);
 const [tx,tz]=undertowTemple01ModelXZToProjectXZ([mx,mz-1.6]);
 const footOffset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const initial=physics.castCharacterFootSupport(
  new Vec3(sx,footOffset,sz),footOffset,'HUMAN');
 const finalSupport=physics.castCharacterFootSupport(
  new Vec3(tx,footOffset,tz),footOffset,'HUMAN');
 const scope={nativeSourceY:3 as const,projectFootY:0 as const,
  originalWitnessHorizontalOnly:true as const,
  actualPlayerLandfallObserved:false as const,
  originalCollisionFlagsCertified:false as const,
  cpuRecastCertified:false as const,normalGameModified:false as const};
 if(initial?.solidId!==V23_LOW_ISOLATED_SOLID_ID||
    finalSupport?.solidId!==V23_LOW_ISOLATED_SOLID_ID)
  return {...scope,status:'HOLD_ISOLATED_KCC_ENDPOINT_SOURCE_UNSUPPORTED' as const,
   startSupportId:initial?.solidId??null,
   endSupportId:finalSupport?.solidId??null,
   supportedSteps:0,firstUnsupportedStep:0,endpointErrorMeters:null};
 const rigid=physics.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   sx,footOffset+.06,sz));
 const capsule=physics.world.createCollider(RAPIER.ColliderDesc.capsule(
  PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
  PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),rigid);
 const controller=createConfiguredPlayerCharacterController(physics.world);
 const steps=40,dx=(tx-sx)/steps,dz=(tz-sz)/steps;
 let supportedSteps=0,firstUnsupportedStep:number|null=null;
 for(let tick=1;tick<=steps;tick++){
  const before=rigid.translation();
  controller.computeColliderMovement(capsule,new Vec3(dx,-.075,dz),
   undefined,undefined,
   candidate=>candidate.handle!==capsule.handle&&
     physics.shouldCharacterCollide(candidate,'HUMAN'));
  const mv=controller.computedMovement();
  rigid.setNextKinematicTranslation({
   x:before.x+mv.x,y:before.y+mv.y,z:before.z+mv.z});
  physics.step();
  const after=rigid.translation();
  const ray=physics.castCharacterFootSupport(
   new Vec3(after.x,after.y,after.z),footOffset,'HUMAN');
  const supported=controller.computedGrounded()&&
   ray?.solidId===V23_LOW_ISOLATED_SOLID_ID&&
   Math.abs(after.y-footOffset-ray.point.y)<=.22;
  if(supported)supportedSteps++;
  else if(firstUnsupportedStep===null)firstUnsupportedStep=tick;
 }
 const last=rigid.translation();
 const error=Math.hypot(last.x-tx,last.z-tz);
 return {...scope,
  status:firstUnsupportedStep!==null?'OBSERVED_ISOLATED_KCC_SUPPORT_LOSS' as const:
   error>.12?'HOLD_ISOLATED_KCC_TARGET_NOT_REACHED' as const:
   'ISOLATED_Y0_HUMAN_KCC_SUPPORT_ONLY' as const,
  startSupportId:initial.solidId,endSupportId:finalSupport.solidId,
  supportedSteps,firstUnsupportedStep,
  endpointErrorMeters:error,sourceRunTicks:steps};
}


/** A REAL isolated Rapier KCC tries landing on the original 11-face Y0
 * candidate using the authentic 1388-1390 ballistic velocity increments.
 * After tick1390 the XZ input is only a documented CONSTANT-input guess.
 * No world teleport, original collision/actor flags, navigation or score.
 */
export function probeV23PredictedOriginalLowLandingKcc(
 physics:RapierStagePhysics,inputCase:V23AirInputCase='CONTINUE'
){
 const prediction=predictV23OriginalY0LandingFromNativeAir();
 const [a,b,c]=V23_OBSERVED_NATIVE_AIR_1388_TO_1390;
 const dy=c.body[1]-b.body[1];
 const secondDy=c.body[1]-2*b.body[1]+a.body[1];
 const footOffset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const body=physics.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   c.body[0],c.body[1],c.body[2]));
 const capsule=physics.world.createCollider(RAPIER.ColliderDesc.capsule(
  PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
  PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
 const controller=createConfiguredPlayerCharacterController(physics.world);
 const scope={
  inputCase,
  modelAfter1390:'UNOBSERVED_COUNTERFACTUAL' as const,
  startedFromActualNativeTick:1390 as const,
  actualSubsequentPlayerInputObserved:false as const,
  ballisticInputExtrapolationOnly:true as const,
  genuineRapierInIsolatedWorld:true as const,
  originalVersion72CollisionFlagsCertified:false as const,
  normalStageModified:false as const,
  navigationAndCpuCertified:false as const,
  expectedY0CrossingNativeTick:prediction.predictedNativeTick
 };
 for(let i=1;i<=40;i++){
  const before=body.translation();
  const [dx,dz]=v23HypotheticalAirXZDeltaAtTick(i,inputCase);
  controller.computeColliderMovement(capsule,
   new Vec3(dx,dy+secondDy*i,dz),undefined,undefined,
   collider=>collider.handle!==capsule.handle&&
    physics.shouldCharacterCollide(collider,'HUMAN'));
  const movement=controller.computedMovement();
  body.setNextKinematicTranslation({
   x:before.x+movement.x,y:before.y+movement.y,z:before.z+movement.z
  });
  physics.step();
  if(!controller.computedGrounded())continue;
  const at=body.translation();
  const support=physics.castCharacterFootSupport(
   new Vec3(at.x,at.y,at.z),footOffset,'HUMAN');
  const gap=support?at.y-footOffset-support.point.y:null;
  const isSource=support?.solidId===V23_LOW_ISOLATED_SOLID_ID&&
   gap!==null&&Math.abs(gap)<=.22;
  return {...scope,
   status:isSource?
    'ISOLATED_NATIVE_AIR_KCC_LANDED_ON_SOURCE_Y0_ONLY' as const:
    'HOLD_ISOLATED_NATIVE_AIR_GROUNDED_OTHER_OR_NO_VALID_FOOT_RAY' as const,
   firstGroundedNativeTick:1390+i,
   actualGroundedXZ:[at.x,at.z] as const,
   actualGroundedFootY:at.y-footOffset,
   actualGroundedSolidId:support?.solidId??null,
   actualFootRayGapMeters:gap,
   originalGameplayLandingCertified:false as const};
 }
 return {...scope,status:'HOLD_ISOLATED_NATIVE_AIR_NO_GROUND_IN_40_TICKS' as const,
  firstGroundedNativeTick:null,actualGroundedSolidId:null,
  originalGameplayLandingCertified:false as const};
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
   sourceTriangleColliderActuallyHit:hit?.solidId===
    'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY',
   otherFrozenSolidSupportedFoot:!!hit&&hit.solidId!==
    'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY',
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
 // Do not splice a Windows fall start into the separate K1 ramp run.
 // Each bounded synthetic KCC comparison uses a single witness family.
 const start=WINDOWS.find(p=>p.id===
  (route==='KNOWN_RAMP'?'RAMP_APPROACH_K1':'LOW_SUPPORTED_1355'))!;
 const target=WINDOWS.find(p=>p.id===
  (route==='KNOWN_RAMP'?'RAMP_CONTACT_K1':'LOW_UNSUPPORTED_1390'))!;
 const footOffset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const supportAtStart=physics.castCharacterFootSupport(
  new Vec3(start.x,start.footY+footOffset,start.z),footOffset,'HUMAN');
 const startGap=supportAtStart?
  start.footY-supportAtStart.point.y:null;
 const scope={
  fromWindowsTick:route==='EDGE_LOSS'?1355:null,
  toWindowsTick:route==='EDGE_LOSS'?1390:null,
  witnessFamily:route==='EDGE_LOSS'?'WINDOWS_NATIVE':'CHROMIUM_K1' as const,
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
 const legitimateLandingIds=[TARGET,
  'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY'];
 if(!supportAtStart||!legitimateLandingIds.includes(supportAtStart.solidId)||
    startGap===null||Math.abs(startGap)>.22){
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
   (candidate)=>candidate.handle!==collider.handle&&
    physics.shouldCharacterCollide(candidate,'HUMAN'));
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
