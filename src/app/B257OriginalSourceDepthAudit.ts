/**
 * B257: observational double-sided ray audit of exact, already SHA-verified
 * original F3L static UV triangles. Optical geometry has NO collision,
 * navigation, actor placement or Turf-scoring authority.
 */
export type B257Point=Readonly<{x:number;y:number;z:number}>;
export type B257OpticalMesh=Readonly<{
 name:string;kind:string;vertices:Float32Array
}>;
export type B257OpticalHit=Readonly<{
 name:string;kind:string;distanceMeters:number;point:[number,number,number]
}>;
export type B257ScreenProbe=Readonly<{id:string;x:number;y:number}>;
export const B257_SCREEN_PROBES:readonly B257ScreenProbe[]=[
 {id:'CENTER',x:.5,y:.5},
 {id:'UPPER_AIM',x:.5,y:.34},
 {id:'LOWER_AIM',x:.5,y:.67},
 {id:'LEFT_GROUND',x:.25,y:.74},
 {id:'CENTER_GROUND',x:.5,y:.82},
 {id:'RIGHT_GROUND',x:.75,y:.74},
 {id:'LEFT_MIDDLE',x:.24,y:.52},
 {id:'RIGHT_MIDDLE',x:.76,y:.52},
 {id:'LOWER_CENTER',x:.5,y:.95}
] as const;
const EPS=1e-7;
/** Exactly one closest double-sided triangle per *original material*.
 * Reports physical-ray comparisons elsewhere, not substitute colliders. */
export function traceB257SourceOpticalRays(
 meshes:readonly B257OpticalMesh[],from:B257Point,to:B257Point
):{
 nearest:B257OpticalHit|null;
 nearestGroups:readonly B257OpticalHit[];
 scannedTriangles:number;
}{
 const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
 const max=Math.hypot(dx,dy,dz);
 if(!Number.isFinite(max)||max<=EPS||meshes.length===0)
  return {nearest:null,nearestGroups:[],scannedTriangles:0};
 const ix=dx/max,iy=dy/max,iz=dz/max;
 const groupHits:B257OpticalHit[]=[];
 let scannedTriangles=0;
 for(const mesh of meshes){
  const a=mesh.vertices;
  if(a.length%9!==0)throw Error('B257_NOT_TRIANGLES');
  let shortest=max+1;
  for(let i=0;i<a.length;i+=9){
   scannedTriangles++;
   const ax=a[i]!,ay=a[i+1]!,az=a[i+2]!;
   const e1x=a[i+3]!-ax,e1y=a[i+4]!-ay,e1z=a[i+5]!-az;
   const e2x=a[i+6]!-ax,e2y=a[i+7]!-ay,e2z=a[i+8]!-az;
   const px=iy*e2z-iz*e2y,py=iz*e2x-ix*e2z,pz=ix*e2y-iy*e2x;
   const det=e1x*px+e1y*py+e1z*pz;
   if(Math.abs(det)<EPS)continue;
   const inv=1/det;
   const tx=from.x-ax,ty=from.y-ay,tz=from.z-az;
   const u=(tx*px+ty*py+tz*pz)*inv;
   if(u < -EPS||u > 1+EPS)continue;
   const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;
   const v=(ix*qx+iy*qy+iz*qz)*inv;
   if(v < -EPS||u+v > 1+EPS)continue;
   const t=(e2x*qx+e2y*qy+e2z*qz)*inv;
   if(t > EPS&&t <= max&&t < shortest)shortest=t;
  }
  if(shortest<=max)groupHits.push({
   name:mesh.name,kind:mesh.kind,distanceMeters:shortest,
   point:[from.x+ix*shortest,from.y+iy*shortest,from.z+iz*shortest]
  });
 }
 groupHits.sort((a,b)=>a.distanceMeters-b.distanceMeters);
 return {nearest:groupHits[0]??null,nearestGroups:groupHits.slice(0,6),
  scannedTriangles};
}
export function b257AuditEligible(params:URLSearchParams,e:{
 paused:boolean;staging:boolean;fullRound:boolean;pointerLocked:boolean;
 stopped:boolean;otherStudy:boolean;verifiedUv:boolean;inkSafe:boolean;
 humanoid:boolean;b256Active:boolean;solids:number;paintable:number;
 links:number;scoreable:number;triangles:number;textures:number;
 cpuCount:number
}):boolean{
 return params.get('t21Play')==='preview'&&
  params.get('t21FullSource')==='review'&&
  params.get('t21B253')==='liveInk'&&
  params.get('t21B255')==='actorStudy'&&
  params.get('t21B257')==='depthAudit'&&
  params.get('t21QaInput')!=='deterministic'&&
  e.paused&&e.staging&&!e.fullRound&&!e.pointerLocked&&!e.stopped&&
  !e.otherStudy&&e.verifiedUv&&e.inkSafe&&e.humanoid&&
  !e.b256Active&&e.solids===25&&e.paintable===17&&e.links===26&&
  e.scoreable===0&&e.triangles===57578&&
  e.textures>=8&&e.textures<=20&&e.cpuCount===7;
}
export const B257_AUDIT_AUTHORITY=Object.freeze({
 originalSourceTriangles:57578,sourceStage:'25/17/26/0',
 physicalQueries:'CERTIFIED_RAPIER_STAGE_ONLY',
 originalUvQueries:'OPTICAL_ONLY_NO_AUTHORITY',
 noShaderChange:true,noCameraReposition:true,noActorRelocation:true,
 noNewSolid:true,noNewNavLink:true,noNewPaintSurface:true,
 official4v4:false,productionAuthorized:false
} as const);
