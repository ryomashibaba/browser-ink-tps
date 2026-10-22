/**
 * W10-B118: source-only observational record for an ACTUAL Recast Crowd
 * 8th-player proxy before and after ONE native 60Hz Crowd update.
 * The original 2m unbounded-drift fence is NEVER relaxed.
 * A passive Crowd proxy is not a verified physical Rapier actor or CPU.
 */
export type B118PhysicalFoot=Readonly<{x:number;y:number;z:number}>;
export type B118NativeCrowdDriftWitness={
 schema:'T21_W10_B118_REAL_ORIGINAL_CROWD_DRIFT_V1';
 actualRapierPlayerFoot:B118PhysicalFoot;
 originalSourceNavmeshProjectedFoot:B118PhysicalFoot;
 preCrowdSyncedPassiveProxyFoot:B118PhysicalFoot;
 postRecastCrowdPassiveProxyFoot:B118PhysicalFoot;
 originalSourceProjection3dMeters:number;
 preCrowdSyncResidual3dMeters:number;
 postCrowdVsProjected3dMeters:number;
 postCrowdVsPhysicalHorizontalMeters:number;
 recastIntraTickPassiveProxyDisplacement3dMeters:number;
 recastIntraTickPassiveProxyDisplacementHorizontalMeters:number;
 postCrowdVerticalDisplacementMeters:number;
 originalProjectionWithin26cm:boolean;
 beforeCrowdProjectionResidualWithin65mm:boolean;
 unboundedOriginalCrowdDrift:boolean;
 unsafeClassification:'UNBOUNDED_CROWD_DRIFT_NOT_AUTHORIZED'|
  'BOUNDED_CROWD_PROXY_WITNESS_ONLY';
 existingUnboundedHorizontalFenceMeters:2;
 sourceProjectionFenceMeters:.26;
 originalSourceSolids:25;
 originalPaintSurfaces:17;
 originalNavLinks:26;
 sourceScoreable:0;
 rapierPlayerMovedByWitness:false;
 originalCpuCrowdPositionMutatedByWitness:false;
 crowdProxyPositionMutatedByWitness:false;
 sourceNavmeshModified:false;
 cpuHumanCollisionCertified:false;
 official4v4Certified:false;
 productionAuthorized:false;
};
/** Both true original NavMesh and the true Recast proxy are required. */
export function diagnoseB118RealOriginalCrowdDrift(args:{
 physicalHumanFoot:B118PhysicalFoot;
 originalNavmeshProjectedFoot:B118PhysicalFoot;
 synchronizedProxyBeforeCrowd:B118PhysicalFoot;
 actualProxyAfterRecast:B118PhysicalFoot;
}):B118NativeCrowdDriftWitness{
 const {physicalHumanFoot:p,originalNavmeshProjectedFoot:s,
  synchronizedProxyBeforeCrowd:a,actualProxyAfterRecast:b}=args;
 if(![p.x,p.y,p.z,s.x,s.y,s.z,a.x,a.y,a.z,b.x,b.y,b.z]
  .every(Number.isFinite))
  throw Error('T21_W10B118_NONFINITE_REAL_CROWD_WITNESS');
 const sourceDistance=Math.hypot(p.x-s.x,p.y-s.y,p.z-s.z);
 const syncResidual=Math.hypot(a.x-s.x,a.y-s.y,a.z-s.z);
 const physicalDrift=Math.hypot(p.x-b.x,p.z-b.z);
 const between=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 const betweenHorizontal=Math.hypot(a.x-b.x,a.z-b.z);
 const bad=physicalDrift>2;
 return {
  schema:'T21_W10_B118_REAL_ORIGINAL_CROWD_DRIFT_V1',
  actualRapierPlayerFoot:{...p},
  originalSourceNavmeshProjectedFoot:{...s},
  preCrowdSyncedPassiveProxyFoot:{...a},
  postRecastCrowdPassiveProxyFoot:{...b},
  originalSourceProjection3dMeters:sourceDistance,
  preCrowdSyncResidual3dMeters:syncResidual,
  postCrowdVsProjected3dMeters:Math.hypot(b.x-s.x,b.y-s.y,b.z-s.z),
  postCrowdVsPhysicalHorizontalMeters:physicalDrift,
  recastIntraTickPassiveProxyDisplacement3dMeters:between,
  recastIntraTickPassiveProxyDisplacementHorizontalMeters:betweenHorizontal,
  postCrowdVerticalDisplacementMeters:b.y-a.y,
  originalProjectionWithin26cm:sourceDistance<=.26,
  beforeCrowdProjectionResidualWithin65mm:syncResidual<=.065,
  unboundedOriginalCrowdDrift:bad,
  unsafeClassification:bad?'UNBOUNDED_CROWD_DRIFT_NOT_AUTHORIZED':
   'BOUNDED_CROWD_PROXY_WITNESS_ONLY',
  existingUnboundedHorizontalFenceMeters:2,
  sourceProjectionFenceMeters:.26,
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalNavLinks:26,sourceScoreable:0,
  rapierPlayerMovedByWitness:false,
  originalCpuCrowdPositionMutatedByWitness:false,
  crowdProxyPositionMutatedByWitness:false,
  sourceNavmeshModified:false,
  cpuHumanCollisionCertified:false,official4v4Certified:false,
  productionAuthorized:false
 };
}
