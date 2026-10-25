/**
 * B183 genuine original-source HUMAN upper-to-lower playable descent.
 * Reads 60Hz Rapier KCC body/ground + registered source-solid foot probe.
 * No movement command, guessed floor, authored route, score or winner.
 */
export type B183DescentState='SEEK_UPPER'|'UPPER_READY'|'DESCENDING'|
 'SOURCE_LOWER_LANDED'|'WITNESS_INVALID';
export interface B183OriginalDescentInput {
 tick:number;nativePlaying:boolean;alive:boolean;mode:'HUMAN'|'SQUID';
 sourceStage:readonly [number,number,number,number];
 body:readonly [number,number,number];nativeGrounded:boolean;
 originalRapierSupportId:string|null;sourceFootGapMeters:number|null;
}
export class B183OriginalHumanDescent {
 private state:B183DescentState='SEEK_UPPER';
 private lastTick=-1;
 private lastBody:readonly [number,number,number]|null=null;
 private upperBodyY:number|null=null;
 private upperSide=0;
 private upperOriginalSupportId:string|null=null;
 private readonly originalPadPair=(side:number)=>{
  if(side!==1&&side!==-1)return null;
  const suffix=side===1?'positive-z':'negative-z';
  return {upper:'UndertowT21D:spawn-high-'+suffix,
   lower:'UndertowT21D:first-drop-landing-'+suffix};
 };
 private fallingSince:number|null=null;
 private realObservedTicks=0;
 private landingId:string|null=null;
 private landingNativeTick:number|null=null;
 private sourceStageMaintained=true;
 /**
  * Called only by the actual 150-tick native human respawn lifecycle.
  * A landing from the previous life must never arm new local activity.
  */
 public resetForActualNativeHumanRespawn(){
  this.state='SEEK_UPPER';this.lastTick=-1;this.lastBody=null;
  this.upperBodyY=null;this.upperSide=0;
  this.upperOriginalSupportId=null;this.fallingSince=null;
  this.landingId=null;this.landingNativeTick=null;
  this.realObservedTicks=0;this.sourceStageMaintained=true;
 }
 private readonly valid=(p:readonly number[])=>p.length===3&&p.every(Number.isFinite);
 public observe(f:B183OriginalDescentInput):void{
  if(this.state==='SOURCE_LOWER_LANDED'||this.state==='WITNESS_INVALID')return;
  if(f.sourceStage.join(',')!=='25,17,26,0'){
   this.sourceStageMaintained=false;this.state='WITNESS_INVALID';return;
  }
  if(!Number.isSafeInteger(f.tick)||f.tick<=this.lastTick||!this.valid(f.body)){
   this.state='WITNESS_INVALID';return;
  }
  if(this.lastTick>=0&&f.tick!==this.lastTick+1){
   this.state='WITNESS_INVALID';return;
  }
  // Actual death/respawn is a separately recorded native lifecycle.
  // Never mistake the legitimate source-backed spawn for a descent.
  if(!f.nativePlaying||!f.alive||f.mode!=='HUMAN'){
   this.lastTick=f.tick;this.lastBody=null;
   this.state='SEEK_UPPER';this.upperBodyY=null;
   this.upperOriginalSupportId=null;this.upperSide=0;
   this.fallingSince=null;return;
  }
  if(this.lastBody&&Math.hypot(
   f.body[0]-this.lastBody[0],f.body[1]-this.lastBody[1],
   f.body[2]-this.lastBody[2])>.8){
   // Fails closed on artificial or unverified native-body discontinuity.
   this.state='WITNESS_INVALID';return;
  }
  this.lastTick=f.tick;this.lastBody=[...f.body];
  this.realObservedTicks++;
  const supported=f.nativeGrounded&&!!f.originalRapierSupportId&&
   f.sourceFootGapMeters!==null&&Number.isFinite(f.sourceFootGapMeters)&&
   Math.abs(f.sourceFootGapMeters)<=.22;
  const side=Math.sign(f.body[2]);
  const pair=this.originalPadPair(side);
  // Original-source support identity is the authority; body Y is only
  // the verified secondary consistency window, not an arbitrary floor.
  const upper=supported&&pair!==null&&
   f.originalRapierSupportId===pair.upper&&
   f.body[1]>=8.1&&f.body[1]<=9.6;
  const lower=supported&&pair!==null&&
   f.originalRapierSupportId===pair.lower&&
   f.body[1]>=3.2&&f.body[1]<=6.25;
  if(this.state==='SEEK_UPPER'){
   if(upper){
    this.state='UPPER_READY';this.upperBodyY=f.body[1];
    this.upperSide=side;this.upperOriginalSupportId=pair!.upper;
    this.fallingSince=null;
   }
   return;
  }
  if(Math.sign(f.body[2])!==this.upperSide||!this.upperSide){
   this.state='SEEK_UPPER';this.upperBodyY=null;
   this.upperOriginalSupportId=null;this.upperSide=0;
   this.fallingSince=null;return;
  }
  if(this.state==='UPPER_READY'){
   if(upper){this.upperBodyY=f.body[1];return;}
   if(!f.nativeGrounded&&this.upperBodyY!==null&&
      f.body[1]<this.upperBodyY-.35){
    this.state='DESCENDING';this.fallingSince=f.tick;
   }
   return;
  }
  if(this.state==='DESCENDING'){
   if(upper){
    this.state='UPPER_READY';this.upperBodyY=f.body[1];
    this.fallingSince=null;return;
   }
   if(lower&&this.upperBodyY!==null&&pair!==null&&
      this.upperOriginalSupportId===pair.upper&&
      this.upperBodyY-f.body[1]>=2&&this.fallingSince!==null&&
      f.tick-this.fallingSince>=2){
    this.state='SOURCE_LOWER_LANDED';
    this.landingId=f.originalRapierSupportId;
    this.landingNativeTick=f.tick;return;
   }
   if(f.nativeGrounded){
    this.state='SEEK_UPPER';this.fallingSince=null;
    this.upperBodyY=null;this.upperOriginalSupportId=null;
   }
  }
 }
 public snapshot(){
  return {
   enabled:true as const,status:this.state,
   authenticNativeTicksObserved:this.realObservedTicks,
   sourceStageMaintained:this.sourceStageMaintained,
   actualOriginalRapierUpperStartId:this.upperOriginalSupportId,
   actualOriginalRapierLowerLandingId:this.landingId,
   trueNativeLandingTick:this.landingNativeTick,
   originalFirstDropLocalPracticeClear:
    this.state==='SOURCE_LOWER_LANDED',
   actualSourceKccOnly:true as const,
   crossTeamRouteCertified:false as const,
   original4v4Certified:false as const,
   sourceScoreablePromotions:0 as const,
   productionAuthorized:false as const,
   officialWinner:'NONE' as const
  };
 }
}
