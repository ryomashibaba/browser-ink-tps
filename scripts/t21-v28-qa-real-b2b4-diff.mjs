#!/usr/bin/env node
/** T21 V28 QA18: compare real old/new 60Hz B2/B4 native Rapier feet.
 * No code-coverage or unit-test-only "movement improved" claims. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const ids=['B2','B4'];
const source='25/17/26/0';
const genuine=p=>p?.schema===
 'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'&&
 p.source===source&&p.originalWinner==='NONE'&&
 p.originalPathAuthorizationChanged===false&&
 p.originalKccOrGameWrites===0&&
 p.continuousCapsuleContactCertified===false&&
 p.b2b4FrontlineGoalCertified===false&&
 p.originalSourceGeometryWrites===0&&p.actorWrites===0&&
 p.nativeClockWrites===0&&p.scoreWrites===0&&
 Number.isFinite(p.browserWorldOrigin)&&p.browserWorldOrigin>0&&
 ids.every(id=>p.dropped?.[id]===0&&Array.isArray(p.rows?.[id]));
const footOk=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const rounded=x=>Math.round(x*1e6)/1e6;
const readRows=(p,id)=>{
 const rows=p.rows[id],map=new Map();
 for(const r of rows){
  if(r.id!==id||!Number.isSafeInteger(r.tick)||r.tick<0||
     !footOk(r.foot)||r.mode!=='GROUND'||r.life!=='ACTIVE'||
     r.rejoined!==true||
     r.registeredOriginalHit!==true||
     !r.originalRapierSolidId?.startsWith('UndertowT21D:')||
     map.has(r.tick))
   throw Error('QA18_UNSUPPORTED_OR_MALFORMED_REAL_NATIVE_FOOT_'+id);
  map.set(r.tick,r);
 }
 for(let i=1;i<rows.length;i++)
  if(rows[i].tick!==rows[i-1].tick+1)
   throw Error('QA18_NOT_TRUE_CONTIGUOUS_60HZ_'+id);
 return map;
};
const maxStill=(rows)=>{
 let maximum=0,start=null;
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i];
  const dt=b.tick-a.tick;
  const length=Math.hypot(...a.foot.map((v,j)=>b.foot[j]-v));
  if(dt===1&&length<=.005){
   if(start===null)start=a.tick;
   maximum=Math.max(maximum,b.tick-start);
  }else start=null;
 }
 return maximum;
};
export function compareRealOriginalB2B4CpuMobility(before,after){
 if(!genuine(before)||!genuine(after))
  throw Error('QA18_REAL_SOURCE_NATIVE_PROVENANCE_REQUIRED');
 const byCpu={};
 for(const id of ids){
  const a=readRows(before,id),b=readRows(after,id);
  const ticks=[...a.keys()].filter(t=>b.has(t)).sort((x,y)=>x-y);
  if(ticks.length<600)throw Error('QA18_NOT_ENOUGH_SHARED_REAL_60HZ_TICKS_'+id);
  for(let i=1;i<ticks.length;i++)
   if(ticks[i]!==ticks[i-1]+1)
    throw Error('QA18_SHARED_NATIVE_TIMELINE_HAS_HOLES_'+id);
  let equal=0,maxDeviation=0,firstDifference=null;
  for(const tick of ticks){
   const old=a.get(tick).foot,newFoot=b.get(tick).foot;
   const distance=Math.hypot(...old.map((v,j)=>newFoot[j]-v));
   maxDeviation=Math.max(maxDeviation,distance);
   if(old.every((v,j)=>v===newFoot[j]))equal++;
   else if(firstDifference===null)firstDifference=tick;
  }
  const oldFrames=ticks.map(t=>a.get(t)),newFrames=ticks.map(t=>b.get(t));
  const priorStill=maxStill(oldFrames),latestStill=maxStill(newFrames);
  byCpu[id]={
   commonNativeTickCount:ticks.length,
   firstTick:ticks[0],lastTick:ticks.at(-1),
   exactlyEqualThreeDimensionalFootTicks:equal,
   maximumThreeDimensionalFootDeviationMeters:rounded(maxDeviation),
   firstChangedTick:firstDifference,
   beforeLongestStationaryNativeTicks:priorStill,
   afterLongestStationaryNativeTicks:latestStill,
   stationaryReductionNativeTicks:priorStill-latestStill,
   stationaryReductionObservedInThisWindow:
    priorStill>latestStill&&firstDifference!==null,
   fullGameplayMovementImprovementCertified:false,
   movementIdenticalThisObservedWindow:equal===ticks.length,
   originalRapierSupportedAtEveryComparedTick:true,
   collisionOrNavAuthorityWrites:0
  };
 }
 const same=ids.every(id=>byCpu[id].movementIdenticalThisObservedWindow);
 return {
  schema:'T21_V28_QA18_REAL_B2_B4_SOURCE_BEFORE_AFTER_MOBILITY_V1',
  source,oldBrowserOrigin:before.browserWorldOrigin,
  newBrowserOrigin:after.browserWorldOrigin,
  byCpu,
  overallVerdict:same?'HOLD_NO_OBSERVED_B2_B4_PHYSICAL_MOBILITY_CHANGE':
   'OBSERVED_REAL_FOOT_DIFFERENCE_REQUIRE_GAMEPLAY_CONFIRMATION',
  originalScoreable:0,originalF4ConnectedCertified:false,
  actualEnemyHpSplatRespawnCertified:false,
  simulatedActorMovement:0,formal4v4Certified:false
 };
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const [a,b]=process.argv.slice(2);
 if(!a||!b){console.error('USAGE: node scripts/t21-v28-qa-real-b2b4-diff.mjs <old-B454-RAW.json> <new-B454-RAW.json>');process.exitCode=2;}
 else{
  try{console.log(JSON.stringify(compareRealOriginalB2B4CpuMobility(
   JSON.parse(readFileSync(resolve(a),'utf8')),
   JSON.parse(readFileSync(resolve(b),'utf8'))),null,2));}
  catch(e){console.error(String(e));process.exitCode=2;}
 }
}
