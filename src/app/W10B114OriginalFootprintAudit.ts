/**
 * W10-B114: five REAL original-Rapier downward rays at the actor's footprint.
 * Read-only observation. Rays do not reproduce Rapier KCC capsule contact,
 * prove a hole, or authorize a new floor / source geometry.
 */
export type B114CharacterMode='HUMAN'|'SQUID';
export type B114RayContact={
 sourceSolidId:string|null;
 /** Measured feet-to-Rapier-hit vertical distance, or null if no ray hit. */
 gapMeters:number|null;
};
export type B114RayName='CENTER'|'FRONT'|'BACK'|'LEFT'|'RIGHT';
export type B114SourceProbe=B114RayContact&{
 name:B114RayName;
 offsetX:number;
 offsetZ:number;
 closeSourceSupport:boolean;
};
export type B114OriginalFootprint={
 status:'READ_ONLY_FIVE_ORIGINAL_RAPIER_RAYS';
 nativeTick:number;
 originalBody:[number,number,number];
 mode:B114CharacterMode;
 radiusMeters:number;
 probes:readonly B114SourceProbe[];
 observedSourceSolidIds:readonly string[];
 nearCenter:boolean;
 nearPerimeter:boolean;
 classification:
  'NO_NEAR_ORIGINAL_SOURCE_RAY'|'CENTER_AND_EDGE_SOURCE_RAYS'|
  'CENTER_ONLY_SOURCE_RAY'|'EDGE_ONLY_SOURCE_RAY';
 noActorMutation:true;
 originalGeometryAdded:0;
 originalFloorHoleCertified:false;
 genuineCapsuleContactCertified:false;
};
const NEAR_SUPPORT_GAP_METERS=.42;
export function auditB114OriginalFootprint(args:{
 tick:number;
 body:[number,number,number];
 mode:B114CharacterMode;
 capsuleRadiusMeters:number;
 center:B114RayContact;
 /** Query MUST come from actual original Rapier stage, not a derived map. */
 originalRapierProbe:(dx:number,dz:number)=>B114RayContact;
}):B114OriginalFootprint{
 const {tick,body,mode,center,capsuleRadiusMeters,originalRapierProbe}=args;
 if(!Number.isSafeInteger(tick)||tick<0||
  !body.every(Number.isFinite)||
  !Number.isFinite(capsuleRadiusMeters)||
  capsuleRadiusMeters<.05||capsuleRadiusMeters>2||
  (mode!=='HUMAN'&&mode!=='SQUID'))
  throw Error('B114_INVALID_GENUINE_SOURCE_FOOTPRINT_INPUT');
 const radius=Number((capsuleRadiusMeters*.8).toFixed(6));
 const offsets:[B114RayName,number,number][]=[
  ['CENTER',0,0],['FRONT',0,-radius],['BACK',0,radius],
  ['LEFT',-radius,0],['RIGHT',radius,0]
 ];
 const probes:B114SourceProbe[]=offsets.map(([name,offsetX,offsetZ])=>{
  const hit=name==='CENTER'?center:originalRapierProbe(offsetX,offsetZ);
  if(hit.sourceSolidId===null&&hit.gapMeters!==null||
    hit.sourceSolidId!==null&&(typeof hit.sourceSolidId!=='string'||
     hit.sourceSolidId.length===0||hit.gapMeters===null||
     !Number.isFinite(hit.gapMeters)))
   throw Error('B114_ORIGINAL_RAPIER_RAY_INVALID_ID_OR_GAP');
  const closeSourceSupport=hit.sourceSolidId!==null&&
   Math.abs(hit.gapMeters!)<=NEAR_SUPPORT_GAP_METERS;
  return {name,offsetX,offsetZ,
   sourceSolidId:hit.sourceSolidId,gapMeters:hit.gapMeters,
   closeSourceSupport};
 });
 const nearCenter=probes[0]!.closeSourceSupport;
 const nearPerimeter=probes.slice(1).some(p=>p.closeSourceSupport);
 const classification=nearCenter?
  (nearPerimeter?'CENTER_AND_EDGE_SOURCE_RAYS':'CENTER_ONLY_SOURCE_RAY'):
  (nearPerimeter?'EDGE_ONLY_SOURCE_RAY':'NO_NEAR_ORIGINAL_SOURCE_RAY');
 return {
  status:'READ_ONLY_FIVE_ORIGINAL_RAPIER_RAYS',
  nativeTick:tick,originalBody:[...body],mode,
  radiusMeters:capsuleRadiusMeters,probes,
  observedSourceSolidIds:[...new Set(probes.map(p=>p.sourceSolidId)
   .filter((id):id is string=>id!==null))],
  nearCenter,nearPerimeter,classification,
  noActorMutation:true,originalGeometryAdded:0,
  originalFloorHoleCertified:false,genuineCapsuleContactCertified:false
 };
}
