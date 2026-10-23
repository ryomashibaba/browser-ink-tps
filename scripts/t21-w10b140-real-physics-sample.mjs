/**
 * W10-B140: read-only typed-shape inspector of *already-advanced* actual
 * F3 PlayCanvas/Rapier state. This does not create, advance or move actors.
 * Synthetic samples in node:test exercise serialization only, NOT gameplay.
 */
export function sampleB140RealSourcePhysicalTrace(n,phase){
 const c=n?.cpu?.cpu;
 const realHumanBody=n?.player?.position;
 if(!Array.isArray(c)||!Array.isArray(realHumanBody)||realHumanBody.length!==3||
    !realHumanBody.every(Number.isFinite))
  throw Error('B140_MISSING_REAL_HUMAN_KCC_OR_CPU_SNAPSHOT');
 const cpu=c.find(x=>x.id==='A1');
 const realA1RapierFoot=cpu?.physicalFoot??null;
 if(realA1RapierFoot!==null&&
    (!Array.isArray(realA1RapierFoot)||realA1RapierFoot.length!==3||
     !realA1RapierFoot.every(Number.isFinite)))
  throw Error('B140_INVALID_REAL_A1_RAPIER_FOOT');
 const foot=n.b112OriginalHumanGround;
 const patrol=n.cpu.sourcePatrol;
 if(!patrol||typeof patrol.b137ApprovedNativeRallies!=='number')
  throw Error('B140_MISSING_ACTUAL_SOURCE_PATROL');
 return {
  phase,actualTick:n.tick,matchState:n.matchState,
  actualHumanKccBody:[...realHumanBody],
  actualA1RapierFoot:realA1RapierFoot?[...realA1RapierFoot]:null,
  realSeparationXZ:realA1RapierFoot?
   Math.hypot(realA1RapierFoot[0]-realHumanBody[0],
    realA1RapierFoot[2]-realHumanBody[2]):null,
  actualHumanKccGrounded:foot?.genuineKccGrounded??null,
  originalRapierSupportId:foot?.lastOriginalSourceHitId??null,
  originalSourceFootprintClass:foot?.lastOriginalFootprint?.classification??null,
  realCpuA1Mobility:cpu?.mobilityState??null,
  realCpuRejoins:n.cpu.physicalRejoins.length,
  realCpuFootRelocations:n.cpu.physicalFootRelocations,
  sourcePatrol:{
   optIn:patrol.b137AllyRallyOptIn,
   checks:patrol.b137RealCandidateChecks,
   approved:patrol.b137ApprovedNativeRallies,
   denied:patrol.b137UnsafeOrUnsupportedRallies,
   missingSourceFloor:patrol.b137MissingSourceFloorProof
  },
  humanShotCount:n.shotsFired,
  humanChangedOriginalPaintCells:n.b23HumanInkFeedback.humanChangedCells,
  cpuSourceTurfShots:n.cpuSourceTurfShots,
  cpuSourceChangedCells:n.cpuImpactInkCellsChanged,
  officialScoreable:n.sourceScoreablePromotions,
  original4v4Certified:n.unrestricted4v4Certified
 };
}
