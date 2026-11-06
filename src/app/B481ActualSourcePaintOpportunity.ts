/** B481: truthful opportunity under the ACTUAL B243 native muzzle ray.
 * Reads only existing 17 ORIGINAL paint grids; this is a player aiming aid,
 * not projectile prediction, physical collision, added CPU goal, ink writing,
 * Turf area, enemy discovery or certified projectile contact. */
import {SurfaceFlags,Team} from '../ink/types';

export type B481RealPaintOwner='OWN'|'NEUTRAL'|'OPPONENT';
export type B481RealPaintCue=Readonly<{
 owner:B481RealPaintOwner;label:string;tint:string;
 nativeTick:number;originalSurfaceOnly:true;paintImpactCertified:false;
 originalScoreable:0;officialWinner:'NONE';gameplayWrites:0;
}>;
export function b481ActualSourcePaintOpportunity(x:Readonly<{
 selected:boolean;playerView:boolean;
 stage:readonly number[];nativeTick:number;matchState:string;
 paused:boolean;pointerLocked:boolean;stopReason:string|null;
 playerHp:number;paintRayFirst:boolean;raySurfaceId:string|null;
 ownerSurfaceId:string|null;surfaceScoreable:boolean;
 surfaceFlags:number;cellActive:boolean;observedOwner:number|null;
}>):B481RealPaintCue|null{
 if(!x.selected||!x.playerView||x.stage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    x.matchState!=='PLAYING'||x.paused||!x.pointerLocked||
    x.stopReason!==null||!Number.isFinite(x.playerHp)||x.playerHp<=0||
    !x.paintRayFirst||!x.raySurfaceId||
    !x.raySurfaceId.startsWith('UndertowT21D:')||
    x.ownerSurfaceId!==x.raySurfaceId||x.surfaceScoreable||
    (x.surfaceFlags&SurfaceFlags.Paintable)===0||
    (x.surfaceFlags&SurfaceFlags.Scoreable)!==0||
    !x.cellActive||![Team.A,Team.Neutral,Team.B].includes(
     x.observedOwner as Team))return null;
 const owner:B481RealPaintOwner=x.observedOwner===Team.A?'OWN':
  x.observedOwner===Team.B?'OPPONENT':'NEUTRAL';
 const label=owner==='OWN'?'OWN INK · LOOK FOR UNPAINTED GROUND':
  owner==='OPPONENT'?'OPPONENT INK · CAN REPAINT IF SHOT LANDS':
  'NEUTRAL GROUND · CAN PAINT IF SHOT LANDS';
 return {owner,label:label+' · AIM ONLY / UNSCORED',
  tint:owner==='OWN'?'#80e6ff':
   owner==='OPPONENT'?'#ffc57a':'#9bffd6',
  nativeTick:x.nativeTick,originalSurfaceOnly:true,
  paintImpactCertified:false,originalScoreable:0,
  officialWinner:'NONE',gameplayWrites:0};
}
