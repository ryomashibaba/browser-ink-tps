/** B328: opt-in genuine human KCC approach to physical A1.
 * Key planning is NEVER proof of a route, CPU path, geometry or ink. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const FLOOR='UndertowT21D:first-drop-landing-positive-z',SOURCE='25/17/26/0';
const finite3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const gap=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const ally=n=>n?.cpu?.cpu?.find(a=>a.id==='A1')?.physicalFoot;
function genuine(n,l){
 const p=n?.player?.position;
 return n?.matchState==='PLAYING'&&n.paused===false&&n.stopReason==null&&
  n.cpu?.physicalFootRelocations===0&&
  n.b25SourcePaintRun?.status==='RUNNING'&&
  n.b25SourcePaintRun?.practiceVariant==='ALLY_SYNC'&&
  n.productionAuthorized===false&&n.unrestricted4v4Certified===false&&
  n.sourceScoreablePromotions===0&&finite3(p)&&finite3(ally(n))&&
  p[0]>=-1.2&&p[0]<=4.8&&p[1]>=3.55&&p[1]<=4.65&&
  p[2]>=46.8&&p[2]<=52.5&&ally(n)[1]>=2.7&&ally(n)[1]<=3.7&&
  l?.source===SOURCE&&finite3(l.actualBodyMeters)&&
  gap(p,l.actualBodyMeters)<=.15&&
  Math.abs(p[1]-l.actualBodyMeters[1])<=.15&&
  l.realHumanOriginalFootSupported===true&&
  l.genuineHumanOriginalFootSolid===FLOOR&&
  l.originalRows?.length===17&&l.sourceActorRelocations===0&&
  l.sourceInkRewritten===false&&l.playerPositionRewritten===false;
}
export function b328Plan(n,l){
 const p=n?.player?.position,q=ally(n),d=finite3(p)&&finite3(q)?gap(p,q):null;
 const yaw=n?.cameraSourcePractice?.yawDegrees;
 if(!genuine(n,l)||!Number.isFinite(yaw)||d===null||d<3||d>8)
  return {schema:'B328_ACTUAL_A1_APPROACH_PLAN',eligible:false,
   reason:'HOLD_GENUINE_LOWER_KCC_OR_A1_GAP',gap:d};
 const rad=yaw*Math.PI/180,fx=Math.sin(rad),fz=-Math.cos(rad);
 const choices=[['KeyW',fx,fz],['KeyS',-fx,-fz],
  ['KeyD',-fz,fx],['KeyA',fz,-fx]];
 const [key,dx,dz,align]=choices.map(([k,x,z])=>
  [k,x,z,(x*(q[0]-p[0])+z*(q[2]-p[2]))/d])
  .sort((a,b)=>b[3]-a[3])[0];
 const sample=[p[0]+dx*.20,p[2]+dz*.20];
 const eligible=align>=.70&&sample[0]>=-1.2&&sample[0]<=4.8&&
  sample[1]>=46.8&&sample[1]<=52.5;
 return {schema:'B328_ACTUAL_A1_APPROACH_PLAN',eligible,
  reason:eligible?'REAL_NATIVE_INPUT_CANDIDATE_ONLY':'HOLD_BOUNDED_CANDIDATE',
  key:eligible?key:null,gap:d,alignment:align,
  projectedBoundOnly:sample,sourceRouteCertified:false,
  source:SOURCE,productionAuthorized:false};
}
export function b328AuditStep(before,initial,after,final,plan){
 if(plan?.schema!=='B328_ACTUAL_A1_APPROACH_PLAN'||!plan.eligible||
  !['KeyW','KeyA','KeyS','KeyD'].includes(plan.key))
  throw Error('B328_NOT_GENUINE_PLANNED_INPUT');
 if(!genuine(before,initial)||!finite3(after?.player?.position)||
  !finite3(ally(after))||final?.source!==SOURCE||
  !Number.isSafeInteger(before.tick)||!Number.isSafeInteger(after.tick)||
  after.tick<=before.tick||after.tick-before.tick>24)
  throw Error('B328_MISSING_TRUE_NATIVE_KCC_FRAMES');
 const actual=after.player.position;
 const safe=after.matchState==='PLAYING'&&after.paused===false&&
  after.stopReason==null&&after.cpu?.physicalFootRelocations===0&&
  after.productionAuthorized===false&&
  after.unrestricted4v4Certified===false&&
  after.sourceScoreablePromotions===0&&finite3(final.actualBodyMeters)&&
  gap(actual,final.actualBodyMeters)<=.15&&
  Math.abs(actual[1]-final.actualBodyMeters[1])<=.15&&
  final.realHumanOriginalFootSupported===true&&
  final.genuineHumanOriginalFootSolid===FLOOR&&
  final.originalRows?.length===17&&final.sourceActorRelocations===0&&
  final.sourceInkRewritten===false&&final.playerPositionRewritten===false;
 const distance=gap(before.player.position,actual);
 const reduced=gap(before.player.position,ally(before))-gap(actual,ally(after));
 const passes=safe&&distance>=.035&&distance<=.8&&reduced>=.04&&
  Math.abs(before.player.position[1]-actual[1])<=.22;
 return {schema:'B328_REAL_HUMAN_A1_APPROACH_STEP',
  verdict:passes?'PASS_REAL_GROUNDED_HUMAN_A1_CLOSING':
   'HOLD_NO_REAL_GROUNDED_HUMAN_A1_CLOSING',
  passes,actualHumanMeters:distance,measuredA1GapReductionMeters:reduced,
  cpuA1MotionCanAlsoAffectGap:true,sourceRouteCertified:false,
  actorTeleports:0,productionAuthorized:false,original4v4Certified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];
 if(typeof file!=='string'||!file.endsWith('.json'))
  throw Error('B328_TRUE_CHROMIUM_ARTIFACT_REQUIRED');
 const data=JSON.parse(readFileSync(file,'utf8'));
 if(data.schema!=='B328_TRUE_NATIVE_A1_RECOVERY'||
   data.source!==SOURCE||!Array.isArray(data.steps)||data.steps.length>8)
  throw Error('B328_SOURCE_AUTHORITY_ARTIFACT_MISSING');
 const proof=data.steps.map(t=>
  b328AuditStep(t.before,t.initial,t.after,t.final,
   b328Plan(t.before,t.initial)));
 const result={schema:'B328_INDEPENDENT_REAL_A1',
  realSupportedCloserSteps:proof.filter(p=>p.passes).length,
  firstHoldStep:proof.findIndex(p=>!p.passes)+1||null,
  originalCpuPathCertified:false,original4v4Certified:false,
  officialWinner:'NONE'};
 writeFileSync(resolve(file,'..','b328-independent-a1.json'),
  JSON.stringify(result,null,2));
 console.log('B328_INDEPENDENT_GENUINE_HUMAN_A1',JSON.stringify(result));
}