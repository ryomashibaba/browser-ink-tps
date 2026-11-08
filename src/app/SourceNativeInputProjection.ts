/** Actual SOURCE camera/input projection, read-only. Not Rapier motion proof. */
export function sourceNativeInputProjection(f:{
 nativeTick:number;axes:readonly [number,number];yawDegrees:number;
 pointerLocked:boolean
}){
 if(!Number.isSafeInteger(f.nativeTick)||f.nativeTick<0||
    !Number.isFinite(f.yawDegrees)||
    !f.axes.every(v=>Number.isFinite(v)&&Math.abs(v)<=1))
  throw Error('SOURCE_NATIVE_INPUT_PROJECTION_INVALID');
 const r=f.yawDegrees*Math.PI/180;
 const forwardX=Math.sin(r),forwardZ=-Math.cos(r);
 const [x,y]=f.axes;
 let worldX=-forwardZ*x+forwardX*y;
 let worldZ=forwardX*x+forwardZ*y;
 const mag=Math.hypot(worldX,worldZ);
 if(mag>1){worldX/=mag;worldZ/=mag}
 return {
  schema:'T21_ACTUAL_NATIVE_INPUT_CAMERA_PROJECTION_V1' as const,
  nativeTick:f.nativeTick,
  realPointerLockAtSampling:f.pointerLocked,
  nativeInputAxes:[x,y] as const,
  yawDegrees:f.yawDegrees,
  worldForward:[forwardX,forwardZ] as const,
  projectedWorldIntent:[worldX,worldZ] as const,
  nonzeroNativeAxes:x!==0||y!==0,
  inputEventProvenBySnapshotAlone:false as const,
  desiredMotionProvesPhysicalMove:false as const,
  underlyingStageOrCameraWritten:false as const
 };
}
