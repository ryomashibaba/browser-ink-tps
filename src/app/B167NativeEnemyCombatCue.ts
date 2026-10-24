/**
 * W10-B167: native opponent-foot/camera context, read-only.
 * Original Rapier STAGE line-ray is neither path nor bullet certification.
 */
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
type Foot=readonly [number,number,number];
export interface B167SourceOpponent{
 id:string;rejoined:boolean;physicalFoot:readonly number[];
 lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';hp:number|null;
}
export interface B167NativeCombatCueInput{
 nativeTick:number;sourceStage:readonly number[];
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;stopReason:string|null;
 human:{body:readonly number[];grounded:boolean;alive:boolean};
 aim:readonly number[];cpu:readonly B167SourceOpponent[];
 stageRayBlocked:(from:Foot,to:Foot)=>boolean;
}
export type B167CombatContactState=
 'STAGE_RAY_CLEAR'|'ORIGINAL_STAGE_COVER'|'DIFFERENT_HEIGHT';
const enemyIds=new Set(['B1','B2','B3','B4']);
const finite3=(v:readonly number[])=>v.length===3&&v.every(Number.isFinite);
export function sourceB167EnemyCombatCue(input:B167NativeCombatCueInput){
 if(input.sourceStage.join(',')!=='25,17,26,0'||
  input.matchState!=='PLAYING'||input.paused||input.stopReason||
  !input.human.alive||!input.human.grounded||
  !Number.isSafeInteger(input.nativeTick)||input.nativeTick<0||
  !finite3(input.human.body)||!finite3(input.aim))return null;
 const footY=input.human.body[1]!-
  PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const possible=input.cpu.filter(c=>enemyIds.has(c.id)&&c.rejoined&&
  c.lifeState==='ACTIVE'&&c.hp!==null&&Number.isFinite(c.hp)&&
  c.hp>0&&c.hp<=100&&finite3(c.physicalFoot))
  .map(c=>({c,d:Math.hypot(c.physicalFoot[0]!-input.human.body[0]!,
   c.physicalFoot[2]!-input.human.body[2]!)}))
  .filter(v=>v.d<=32)
  .sort((a,b)=>a.d-b.d||a.c.id.localeCompare(b.c.id));
 const nearest=possible[0];if(!nearest)return null;
 const {c,d}=nearest;
 const dx=c.physicalFoot[0]!-input.human.body[0]!;
 const dz=c.physicalFoot[2]!-input.human.body[2]!;
 const ax=input.aim[0]!,az=input.aim[2]!;
 const horizontalAim=Math.hypot(ax,az);
 const forward=horizontalAim>.0001&&d>.0001?
  (dx*ax+dz*az)/(horizontalAim*d):0;
 const side=ax*dz-az*dx;
 const direction=horizontalAim<=.0001?'DIRECTION UNKNOWN':
  forward>.92?'AHEAD':forward<-.4?'BEHIND':
  side>=0?'RIGHT':'LEFT';
 const gap=Math.abs(c.physicalFoot[1]!-footY);
 let state:B167CombatContactState='DIFFERENT_HEIGHT';
 if(gap<=1.3){
  const from:Foot=[input.human.body[0]!,
   input.human.body[1]!+.18,input.human.body[2]!];
  const to:Foot=[c.physicalFoot[0]!,
   c.physicalFoot[1]!+.90,c.physicalFoot[2]!];
  state=input.stageRayBlocked(from,to)?
   'ORIGINAL_STAGE_COVER':'STAGE_RAY_CLEAR';
 }
 const cover=state==='STAGE_RAY_CLEAR'?
  'STAGE RAY CLEAR · NOT A SHOT GUARANTEE':
  state==='ORIGINAL_STAGE_COVER'?'ORIGINAL STAGE COVER':
  'DIFFERENT HEIGHT · NO RAY CLAIM';
 return {
  state,actorId:c.id,nativeTick:input.nativeTick,
  horizontalMeters:Number(d.toFixed(1)),realOpponentHp:c.hp,
  actualFootHeightDifferenceMeters:Number(gap.toFixed(2)),direction,
  label:'REAL CPU '+c.id+' · '+direction+' · '+d.toFixed(1)+
   'm · HP '+Math.round(c.hp!)+' · '+cover+' · NO PATH CERTIFIED',
  staticSourceRayOnly:true as const,
  nativeProjectileHitCertified:false as const,
  originalCrossMapRouteCertified:false as const,
  officialWinner:'NONE' as const,sourceScoreablePromotions:0 as const,
  gameplayWrites:0 as const
 };
}
