/**
 * B258 optical composition experiment: real native THIRD PERSON camera ONLY.
 * Two intentional, not enumerated or production-tuned, camera alternatives.
 * They use the existing Rapier certified camera clipping implementation.
 * No actor position, simulation yaw, aim target, source mesh, KCC, ink or
 * authoritative stage definition is modified by this module.
 */
export const B258_CAMERA_PROFILES={
 BASELINE:{distanceMeters:6.4,pitchDegrees:-12,shoulderMeters:.72},
 REAR_WIDE:{distanceMeters:8.8,pitchDegrees:-12,shoulderMeters:.72},
 ELEVATED_RIGHT:{distanceMeters:8.0,pitchDegrees:-21,shoulderMeters:1.20}
} as const;
export type B258CameraProfile=keyof typeof B258_CAMERA_PROFILES;
export const B258_CAMERA_NAMES=Object.keys(B258_CAMERA_PROFILES) as B258CameraProfile[];
export function b258Pose(name:B258CameraProfile){
 const out=B258_CAMERA_PROFILES[name];
 if(!out)throw Error('B258_UNKNOWN_RESEARCH_CAMERA_PROFILE');
 return out;
}
export function b258CameraEligible(p:URLSearchParams,c:{
 paused:boolean,staging:boolean,stopped:boolean,fullRound:boolean,
 pointerLocked:boolean,otherStudy:boolean,verifiedUv:boolean,
 inkSafe:boolean,humanoid:boolean,b256Active:boolean,
 solids:number,paintable:number,links:number,scoreable:number,
 triangles:number,textures:number,cpuCount:number
}):boolean{
 return p.get('t21Play')==='preview'&&
  p.get('t21FullSource')==='review'&&
  p.get('t21B253')==='liveInk'&&
  p.get('t21B255')==='actorStudy'&&
  p.get('t21B257')==='depthAudit'&&
  p.get('t21B258')==='cameraStudy'&&
  p.get('t21QaInput')!=='deterministic'&&
  c.paused&&c.staging&&!c.stopped&&!c.fullRound&&!c.pointerLocked&&
  !c.otherStudy&&c.verifiedUv&&c.inkSafe&&c.humanoid&&!c.b256Active&&
  c.solids===25&&c.paintable===17&&c.links===26&&c.scoreable===0&&
  c.triangles===57578&&c.textures>=8&&c.textures<=20&&c.cpuCount===7;
}
export const B258_CAMERA_AUTHORITY=Object.freeze({
 studyOnly:true,sourceStage:'25/17/26/0',
 certifiedRapierCameraClipping:true,existingActorPositionsOnly:true,
 sourceGeometryMoved:false,sourceMeshRayNotCollision:true,
 gameActorsMoved:0,newRapierSolids:0,newNavLinks:0,
 paintableSurfacesAdded:0,scoreableSurfaces:0,
 releaseAuthorized:false,productionAuthorized:false
} as const);
