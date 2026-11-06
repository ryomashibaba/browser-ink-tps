/** B487 — current seven-CPU native opponent route audit on the exact
 * frozen 25-solid/17-paint/26-link unscored original SOURCE.
 * Distinguishes an off-mesh link (NONE joining teams) from natural
 * continuous walkability (NOT inferred from the link count).
 * Never creates an off-mesh link, stage solid, bot goal, hit or score.
 */
export interface B487SourceLink{
 readonly id:string;readonly start:readonly number[];
 readonly end:readonly number[];readonly bidirectional:boolean;
}
export interface B487NativePathPair{
 readonly actors:readonly [string,string];
 readonly nativePathReported:boolean;
 readonly credibleNativeEndpoints:boolean;
 readonly nativeStartSnapMeters:number;
 readonly nativeEndSnapMeters:number;
 readonly nativePointCount:number;
}
const teamsA=['A1','A2','A3'] as const;
const teamsB=['B1','B2','B3','B4'] as const;
export function b487ActualOriginalCrossTeamTopology(input:Readonly<{
 originalStage:readonly number[];
 nativeTick:number;
 authenticSevenCpu:boolean;
 nativeHumanGrounded:boolean;
 links:readonly B487SourceLink[];
 pairs:readonly B487NativePathPair[];
 nearestHumanEnemy3dMeters:number;
 nearestAllyEnemy3dMeters:number;
}>){
 if(input.originalStage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(input.nativeTick)||input.nativeTick<1||
    !input.authenticSevenCpu||!input.nativeHumanGrounded||
    input.links.length!==26||input.pairs.length!==16||
    ![input.nearestHumanEnemy3dMeters,
      input.nearestAllyEnemy3dMeters].every(x=>
      Number.isFinite(x)&&x>=0))return null;
 const used=new Set<string>();
 let firstDrop=0,smallDrop=0,oneWay=0,crossSide=0;
 for(const l of input.links){
  if(used.has(l.id)||!l.start||!l.end||
     l.start.length!==3||l.end.length!==3||
     ![...l.start,...l.end].every(Number.isFinite))return null;
  // noUncheckedIndexedAccess: these are 3-element finite arrays above.
  const sx=l.start[2]!,ex=l.end[2]!;
  if(sx===0||ex===0||sx*ex<0||
     l.bidirectional!==false||l.start[1]!<=l.end[1]!)return null;
  used.add(l.id);oneWay++;
  if(/^first-drop-(positive-z|negative-z)-\d+$/.test(l.id))firstDrop++;
  else if(/^right-small-drop-(positive-z|negative-z)-\d+$/.test(l.id))
   smallDrop++;
  else return null;
  if(Math.sign(sx)!==Math.sign(ex))crossSide++;
 }
 if(firstDrop!==12||smallDrop!==14||oneWay!==26)return null;
 const order=[
  ...teamsA.flatMap(a=>teamsB.map(b=>[a,b] as const)),
  ...teamsB.map(b=>['HUMAN',b] as const)
 ];
 let nativeEndpointPairs=0,nativeReportedPairs=0;
 const detail=[];
 for(let i=0;i<order.length;i++){
  const r=input.pairs[i],expected=order[i]!;
  if(!r||r.actors[0]!==expected[0]||
     r.actors[1]!==expected[1]||
     !Number.isSafeInteger(r.nativePointCount)||
     r.nativePointCount<0||
     Number.isNaN(r.nativeStartSnapMeters)||
     Number.isNaN(r.nativeEndSnapMeters)||
     (r.credibleNativeEndpoints&&
      (!r.nativePathReported||r.nativePointCount===0||
       r.nativeStartSnapMeters>.20||r.nativeEndSnapMeters>.20)))
   return null;
  if(r.nativePathReported)nativeReportedPairs++;
  if(r.credibleNativeEndpoints)nativeEndpointPairs++;
  detail.push({actors:[...r.actors],nativePathReported:r.nativePathReported,
   credibleNativeEndpoints:r.credibleNativeEndpoints,
   nativeStartSnapMeters:r.nativeStartSnapMeters,
   nativeEndSnapMeters:r.nativeEndSnapMeters,
   nativePointCount:r.nativePointCount,
   physicalCapsuleRouteCertified:false as const});
 }
 return {
  schema:'B487_TRUE_ORIGINAL_NATIVE_CROSS_TEAM_TOPOLOGY_V1' as const,
  source:'25/17/26/0' as const,
  nativeTick:input.nativeTick,originalOneWayDropLinks:oneWay,
  originalFirstDropLinks:firstDrop,originalRightSmallDropLinks:smallDrop,
  originalExplicitCrossSideLinks:crossSide,
  liveOriginalCpuOpposingPairs:12 as const,
  liveHumanOpponentPairs:4 as const,
  totalOriginalNativePathQueries:16 as const,
  nativePathReportedPairs:nativeReportedPairs,
  nativeCredibleEndpointPairs:nativeEndpointPairs,
  nearestHumanEnemy3dMeters:input.nearestHumanEnemy3dMeters,
  nearestAllyEnemy3dMeters:input.nearestAllyEnemy3dMeters,
  archivedCentralFloorGapRepairAuthorized:false as const,
  naturalCrossTeamPathCertified:false as const,
  physicalCapsuleRouteCertified:false as const,
  full4v4Certified:false as const,
  sourceGeometryOrNavMutations:0 as const,
  botGoalOrActorWrites:0 as const,
  inkHitScoreOrClockWrites:0 as const,
  officialWinner:'NONE' as const,
  verdict:'HOLD_CENTRAL_LINKS_AND_PHYSICAL_WALK_NOT_AUTHORIZED' as const,
  pairs:detail
 };
}
