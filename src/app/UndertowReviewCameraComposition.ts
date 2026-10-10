/** Source-only camera composition; NEVER a gameplay camera. */
export type UndertowReviewComposition='BASE'|'CENTER_FOCUS';
export type UndertowCameraView='OVERVIEW'|'TOP';
export type ReviewWorldBounds={minX:number;maxX:number;minZ:number;maxZ:number};
export function originalSourceFocusCamera(bounds:ReviewWorldBounds,view:UndertowCameraView){
 const {minX,maxX,minZ,maxZ}=bounds;
 if(![minX,maxX,minZ,maxZ].every(Number.isFinite)||maxX<=minX||maxZ<=minZ)
  throw Error('T21_REVIEW_INVALID_WORLD_BOUNDS');
 if(view!=='OVERVIEW'&&view!=='TOP')throw Error('T21_REVIEW_INVALID_VIEW');
 const span=Math.max(maxX-minX,maxZ-minZ);
 const target:[number,number,number]=[(minX+maxX)/2,8.5,(minZ+maxZ)/2];
 return {target,yawDegrees:view==='TOP'?0:30,
  pitchDegrees:view==='TOP'?80:53,
  distanceMeters:Math.max(32,span*(view==='TOP'?.62:.58)),
  sourceOnly:true as const,gameplayAuthority:'NONE' as const};
}
