/**
 * W10-B117: separate truthful source NavMesh projection from a restored
 * HUMAN's passive Recast Crowd proxy after genuine original 60Hz update.
 *
 * Two independent safety gates: original foot→source-projection <= 0.26m
 * (existing fixed bound), and projected source→restored proxy <= 0.065m.
 * Rapier player position and the seven real CPU positions are not changed.
 */
export type OriginalHumanFoot=Readonly<{x:number;y:number;z:number}>;
export const ORIGINAL_CROWD_POSTSEAL_RESIDUAL_LIMIT_METERS=.065;
export type OriginalCrowdPostSealAudit={
 actualHumanToOriginalProjectionMeters:number;
 projectedResidualMeters:number;
 genuineHumanToProxyHorizontalMeters:number;
 originalSourceProjectionWithinExistingBound:true;
 restoredToOriginalProjectedFoot:true;
 physicalHumanKccContactCertified:false;
 originalCpuContactCertified:false;
 actorPhysicalPositionModified:false;
 productionAuthorized:false;
};
export function auditPhase14QSourceProjectedProxySeal(input:{
 physicalHumanFoot:OriginalHumanFoot;
 originalSourceProjectedFoot:OriginalHumanFoot;
 actualSealedCrowdProxy:OriginalHumanFoot;
 maximumOriginalSourceProjectionMeters:number;
}):OriginalCrowdPostSealAudit{
 const {physicalHumanFoot:p,originalSourceProjectedFoot:s,
  actualSealedCrowdProxy:c,maximumOriginalSourceProjectionMeters:max}=input;
 if(![p.x,p.y,p.z,s.x,s.y,s.z,c.x,c.y,c.z,max].every(Number.isFinite)||
    max<=0||max>.26)
  throw Error('T21_PHASE14Q_INVALID_ORIGINAL_SOURCE_PROJECTION_AUDIT');
 const trueProjectionDistance=Math.hypot(s.x-p.x,s.y-p.y,s.z-p.z);
 if(trueProjectionDistance>max)
  throw Error('T21_PHASE14Q_HUMAN_FOOT_OFF_ORIGINAL_NAVMESH');
 const trueSealResidual=Math.hypot(c.x-s.x,c.y-s.y,c.z-s.z);
 if(trueSealResidual>ORIGINAL_CROWD_POSTSEAL_RESIDUAL_LIMIT_METERS)
  throw Error('T21_PHASE14Q_CROWD_PROXY_POSTSEAL_UNSAFE');
 return {
  actualHumanToOriginalProjectionMeters:trueProjectionDistance,
  projectedResidualMeters:trueSealResidual,
  genuineHumanToProxyHorizontalMeters:Math.hypot(c.x-p.x,c.z-p.z),
  originalSourceProjectionWithinExistingBound:true,
  restoredToOriginalProjectedFoot:true,
  physicalHumanKccContactCertified:false,
  originalCpuContactCertified:false,
  actorPhysicalPositionModified:false,
  productionAuthorized:false
 };
}
