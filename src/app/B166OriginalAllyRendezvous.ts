/** B166: action-oriented but read-only A1 cooperative source hint.
 * Only REAL original Rapier player/CPU foot positions. Straight-line
 * separation cannot establish a walkable route, stage floor or A1 aim.
 */
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';

export interface B166AllyRendezvousInput{
 actualNativeTick:number;
 sourceStage:[number,number,number,number];
 sourceCoopOptIn:boolean;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;
 stopReason:string|null;
 human:{position:readonly number[];grounded:boolean;alive:boolean};
 ally:{id:string;physicalFoot:readonly number[];physicallyRejoined:boolean}|null;
 realNewTaggedA1ImpactCells:number;
 realNewTaggedA1ImpactEvents:number;
}
export type B166AllyHintState=
 'NOT_AVAILABLE'|'A1_NOT_REJOINED'|'HUMAN_NOT_GROUNDED'|
 'DIFFERENT_ORIGINAL_HEIGHT_BAND'|'PHYSICALLY_TOO_CLOSE'|
 'DISTANT_NO_NATIVE_PATH_PROOF'|'NEAR_A1_WAIT_FOR_REAL_INK'|
 'REAL_A1_INK_OBSERVED';
export function getB166OriginalAllyRendezvous(input:B166AllyRendezvousInput){
 const source=input.sourceStage.join(',')==='25,17,26,0'&&
  input.sourceCoopOptIn===true;
 if(!source)return null;
 const validFoot=(p:readonly number[])=>
  p.length===3&&p.every(Number.isFinite);
 if(!Number.isSafeInteger(input.actualNativeTick)||
  input.actualNativeTick<0||
  !Number.isSafeInteger(input.realNewTaggedA1ImpactCells)||
  input.realNewTaggedA1ImpactCells<0||
  !Number.isSafeInteger(input.realNewTaggedA1ImpactEvents)||
  input.realNewTaggedA1ImpactEvents<0||
  !validFoot(input.human.position)||
  input.ally&&(!validFoot(input.ally.physicalFoot)||
   input.ally.id!=='A1'))
  throw Error('B166_REAL_ORIGINAL_ACTOR_PROVENANCE_REQUIRED');
 const a=input.ally;
 const h=input.human.position;
 const distance=a?Math.hypot(
  a.physicalFoot[0]!-h[0]!,a.physicalFoot[2]!-h[2]!):null;
 // Player position is a real Rapier BODY center; A1's field is a FOOT.
 // Compare true same-frame foot elevations, never body vs foot directly.
 const humanFootY=h[1]!-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const diffY=a?Math.abs(a.physicalFoot[1]!-humanFootY):null;
 const active=input.matchState==='PLAYING'&&!input.paused&&!input.stopReason;
 const sourceLowerBand=a&&h[2]!>=33&&a.physicalFoot[2]!>=33&&
  humanFootY>=2.7&&humanFootY<=5.25&&
  a.physicalFoot[1]!>=2.7&&a.physicalFoot[1]!<=5.25;
 let state:B166AllyHintState;
 if(!active)state='NOT_AVAILABLE';
 else if(!a||!a.physicallyRejoined)state='A1_NOT_REJOINED';
 else if(!input.human.grounded||!input.human.alive)
  state='HUMAN_NOT_GROUNDED';
 else if(!sourceLowerBand||diffY===null||diffY>.30)
  state='DIFFERENT_ORIGINAL_HEIGHT_BAND';
 else if(distance!==null&&distance<1.7)
  state='PHYSICALLY_TOO_CLOSE';
 else if(distance===null||distance>2.45)
  state='DISTANT_NO_NATIVE_PATH_PROOF';
 else if(input.realNewTaggedA1ImpactEvents>0&&
  input.realNewTaggedA1ImpactCells>0)
  state='REAL_A1_INK_OBSERVED';
 else state='NEAR_A1_WAIT_FOR_REAL_INK';
 const headline=state==='NOT_AVAILABLE'?
  'ALLY SYNC · original source play not active':
  state==='A1_NOT_REJOINED'?
  'A1 has not rejoined the real original stage':
  state==='HUMAN_NOT_GROUNDED'?
  'Return to certified original grounded play before A1 support':
  state==='DIFFERENT_ORIGINAL_HEIGHT_BAND'?
  'A1 and player are on different source height bands; no route certified':
  state==='PHYSICALLY_TOO_CLOSE'?
  'A1 is very close: keep room on verified original floor':
  state==='DISTANT_NO_NATIVE_PATH_PROOF'?
  'A1 separation outside observed support interval; verify original ground':
  state==='NEAR_A1_WAIT_FOR_REAL_INK'?
  'A1 roughly 2m away · hold a safe original-ground position for real paint':
  'A1 genuine source impact ink observed · cooperative progress earned';
 return {
  state,headline,
  actualNativeTick:input.actualNativeTick,
  actualA1HorizontalSeparationMeters:distance===null?null:
   Number(distance.toFixed(2)),
  actualA1VerticalDifferenceMeters:diffY===null?null:
   Number(diffY.toFixed(2)),
  referenceSafeStandoffMeters:'1.70–2.45' as const,
  directDistanceDoesNotProveWalkableRoute:true as const,
  currentlyApprovedNativeRally:false as const,
  createdPathOrFloor:false as const,
  authorizedSourceScoreable:0 as const,
  officialWinner:'NONE' as const,
  originalUnrestricted4v4Certified:false as const
 };
}
