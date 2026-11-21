/**
 * SOURCE only: classify the ACTUAL Rapier vertical foot-support witness.
 *
 * Genuine B454 60Hz RAW on the registered negative-z ramp measured
 * B2=0.230..0.244m and B4=0.222..0.223m between actual foot and Rapier
 * hit. The existing shared physics authority permits <=0.25m but the CPU
 * tactical target and stall recovery mistakenly required <=0.20m.
 *
 * This is ONLY the original static floor SUPPORT band. It does not widen
 * the original rejoined Recast path start <=0.20m (FIRST_DROP .25m),
 * native endpoint <=0.22m,
 * source goal geometry, actual per-step KCC or offmesh permissions.
 */
export const ORIGINAL_SOURCE_CPU_RAPIER_FOOT_SUPPORT_BAND_METERS=0.25;
export interface OriginalSourceCpuFootPoint{
  readonly x:number;readonly y:number;readonly z:number;
}
export interface OriginalSourceCpuFootSupportWitness{
  readonly point:OriginalSourceCpuFootPoint;
  readonly solidId:string;
}
const finite=(p:OriginalSourceCpuFootPoint):boolean=>
  [p.x,p.y,p.z].every(Number.isFinite);
export function hasRegisteredOriginalSourceCpuRapierFootSupport(
  actualFoot:OriginalSourceCpuFootPoint,
  witness:OriginalSourceCpuFootSupportWitness|null|undefined,
  registeredOriginalSolids:ReadonlyArray<Readonly<{id:string}>>
):boolean{
  return finite(actualFoot)&&witness!==null&&witness!==undefined&&
    !!witness.solidId&&registeredOriginalSolids.some(s=>s.id===witness.solidId)&&
    finite(witness.point)&&
    Math.abs(witness.point.y-actualFoot.y)<=
      ORIGINAL_SOURCE_CPU_RAPIER_FOOT_SUPPORT_BAND_METERS+1e-6;
}

/** A registered F4 CPU center flight physically exists even when its
 * passive Crowd agent has been removed. Only a synchronized real Rapier
 * capsule may receive an actual HUMAN/CPU projectile or area hit. The
 * historical SOURCE GROUND eligibility and all T20 jumps are unchanged.
 */
export function f4PhysicallyPresentCenterTransferTarget(e:Readonly<{
 originalF4:boolean;
 mobilityState:string;
 registeredPhysicalFlight:boolean;
 realFoot:OriginalSourceCpuFootPoint;
 actualCapsule:Readonly<{
  foot:OriginalSourceCpuFootPoint;
  actualSharedRapierBodyAndFootAgree:boolean;
  actualSharedWorld:boolean;
  virtualCrowdProxyUsed:boolean;
 }>|null;
}>):boolean{
 const actor=e.actualCapsule;
 if(!e.originalF4||e.mobilityState!=='F4_CENTER_TRANSFER'||
    !e.registeredPhysicalFlight||!actor||
    !actor.actualSharedRapierBodyAndFootAgree||
    actor.actualSharedWorld!==true||actor.virtualCrowdProxyUsed!==false||
    !finite(e.realFoot)||!finite(actor.foot))return false;
 return Math.hypot(e.realFoot.x-actor.foot.x,
   e.realFoot.y-actor.foot.y,e.realFoot.z-actor.foot.z)<=.025;
}
