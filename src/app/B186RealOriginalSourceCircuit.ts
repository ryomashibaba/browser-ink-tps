/**
 * B186: one actual HUMAN source-local drop -> original raised ramp ->
 * fresh physical-impact ink activity. This is UNSCORED practice, not Turf.
 * Inputs are existing authentic 60Hz Rapier KCC + PaintCoordinator outcomes.
 * Never moves an actor, changes a collider, or invents a stage link.
 */
export type B186CircuitStatus='WAIT_FIRST_DROP'|'MOVE_TO_ORIGINAL_RAISED'|
 'PAINT_ON_RAISED'|'REAL_LOCAL_CIRCUIT_CLEAR'|'INVALID_SOURCE_WITNESS';
export interface B186CircuitFrame{
 nativeTick:number;livePlaying:boolean;alive:boolean;mode:'HUMAN'|'SQUID';
 frozenStage:readonly [number,number,number,number];
 originalDropVerified:boolean;dropLowerColliderId:string|null;
 body:readonly [number,number,number];
 nativeKccGrounded:boolean;actualRapierSupportId:string|null;
 actualFootSupportGapMeters:number|null;
 humanSourceOriginalOnly:boolean;
 actualHumanImpactChangedCells:number;
 actualHumanImpactEvents:number;
 lastActualHumanImpactTick:number|null;
}
const LOWER='UndertowT21D:first-drop-landing-positive-z';
const RAISED='UndertowT21D:right-low-team-a';
const RAMP='UndertowT21D:right-low-route-ramp-positive-z';
const CELLS=60;
const REAL_TRAVEL_METERS=2;
const hypot=(a:readonly number[],b:readonly number[])=>
 Math.hypot(a[0]!-b[0]!,a[1]!-b[1]!,a[2]!-b[2]!);
export class B186RealOriginalSourceCircuit{
 private status:B186CircuitStatus='WAIT_FIRST_DROP';
 private lastTick=-1;
 private lastBody:readonly [number,number,number]|null=null;
 private lastWasGenuineGrounded=false;
 private dropStartTick:number|null=null;
 private baselineCells=0;
 private baselineImpacts=0;
 private freshCells=0;
 private realGroundTravelMeters=0;
 private originalRampPhysicalContactObserved=false;
 private originalRaisedConfirmedTick:number|null=null;
 private rejectedUnphysicalSteps=0;
 observe(f:B186CircuitFrame){
  if(this.status==='REAL_LOCAL_CIRCUIT_CLEAR'||
     this.status==='INVALID_SOURCE_WITNESS')return this.snapshot();
  if(!Number.isSafeInteger(f.nativeTick)||f.nativeTick<=this.lastTick||
     this.lastTick>=0&&f.nativeTick!==this.lastTick+1||
     f.body.length!==3||!f.body.every(Number.isFinite)||
     f.frozenStage.join(',')!=='25,17,26,0'||
     !f.humanSourceOriginalOnly||
     !Number.isSafeInteger(f.actualHumanImpactChangedCells)||
     f.actualHumanImpactChangedCells<0||
     !Number.isSafeInteger(f.actualHumanImpactEvents)||
     f.actualHumanImpactEvents<0){
   this.status='INVALID_SOURCE_WITNESS';return this.snapshot();
  }
  const alive=f.alive&&f.livePlaying;
  const support=f.nativeKccGrounded&&f.actualRapierSupportId!==null&&
    f.actualFootSupportGapMeters!==null&&
    Number.isFinite(f.actualFootSupportGapMeters)&&
    Math.abs(f.actualFootSupportGapMeters)<=.22;
  // Death/respawn or source-offline mode never awards a circuit.
  // A real native respawn may teleport to the documented source spawn,
  // but that cannot be credited as grounded travel.
  if(!alive){
   this.status='WAIT_FIRST_DROP';this.dropStartTick=null;
   this.lastWasGenuineGrounded=false;this.lastBody=null;
   this.realGroundTravelMeters=0;this.freshCells=0;
   this.originalRaisedConfirmedTick=null;
   this.originalRampPhysicalContactObserved=false;
   this.lastTick=f.nativeTick;
   return this.snapshot();
  }
  // Genuine squid mode is part of normal gameplay; it suspends human
  // circuit observations without abandoning earned real native progress.
  // Do not count a morph as walking or as a fabricated physical warp.
  if(f.mode==='SQUID'){
   this.lastTick=f.nativeTick;this.lastBody=null;
   this.lastWasGenuineGrounded=false;return this.snapshot();
  }
  if(this.lastBody&&hypot(f.body,this.lastBody)>.8){
   this.rejectedUnphysicalSteps++;
   this.status='INVALID_SOURCE_WITNESS';return this.snapshot();
  }
  if(this.status==='WAIT_FIRST_DROP'){
   this.lastTick=f.nativeTick;this.lastBody=[...f.body];
   this.lastWasGenuineGrounded=support;
   // Trust only the sibling B184 registered-source pair proof, plus
   // actual native landing support on exact source positive-side solid.
   if(!f.originalDropVerified||f.dropLowerColliderId!==LOWER||
      !support||f.actualRapierSupportId!==LOWER)return this.snapshot();
   this.dropStartTick=f.nativeTick;
   this.baselineCells=f.actualHumanImpactChangedCells;
   this.baselineImpacts=f.actualHumanImpactEvents;
   this.status='MOVE_TO_ORIGINAL_RAISED';
   return this.snapshot();
  }
  if(f.actualHumanImpactChangedCells<this.baselineCells||
     f.actualHumanImpactEvents<this.baselineImpacts){
   this.status='INVALID_SOURCE_WITNESS';return this.snapshot();
  }
  this.freshCells=f.actualHumanImpactChangedCells-this.baselineCells;
  if(this.lastBody&&this.lastWasGenuineGrounded&&support){
   const xz=Math.hypot(f.body[0]-this.lastBody[0],
    f.body[2]-this.lastBody[2]);
   const dy=Math.abs(f.body[1]-this.lastBody[1]);
   if(xz>0&&xz<=.38&&dy<=.32)
    this.realGroundTravelMeters+=xz;
  }
  this.lastTick=f.nativeTick;
  this.lastBody=[...f.body];
  this.lastWasGenuineGrounded=support;
  if(support&&f.actualRapierSupportId===RAMP)
   this.originalRampPhysicalContactObserved=true;
  const raised=support&&f.actualRapierSupportId===RAISED&&
    f.body[1]>=5.0&&f.body[1]<=6.15&&
    this.realGroundTravelMeters>=REAL_TRAVEL_METERS&&
    this.originalRampPhysicalContactObserved;
  if(raised){
   this.originalRaisedConfirmedTick??=f.nativeTick;
   this.status='PAINT_ON_RAISED';
  }else this.status='MOVE_TO_ORIGINAL_RAISED';
  if(raised&&this.freshCells>=CELLS&&
    f.actualHumanImpactEvents>this.baselineImpacts&&
    f.lastActualHumanImpactTick!==null&&
    f.lastActualHumanImpactTick>this.dropStartTick!&&
    f.lastActualHumanImpactTick<=f.nativeTick)
   this.status='REAL_LOCAL_CIRCUIT_CLEAR';
  return this.snapshot();
 }
 snapshot(){
  return {
   enabled:true as const,status:this.status,
   originalDropStartNativeTick:this.dropStartTick,
   actualOriginalRampTouched:
    this.originalRampPhysicalContactObserved,
   actualOriginalRampColliderId:
    this.originalRampPhysicalContactObserved?RAMP:null,
   actualOriginalRaisedFootColliderId:
    this.originalRaisedConfirmedTick!==null?RAISED:null,
   firstActualRaisedGroundedTick:this.originalRaisedConfirmedTick,
   genuineGroundedTravelMeters:Number(this.realGroundTravelMeters.toFixed(4)),
   realPostDropHumanImpactChangedCells:this.freshCells,
   requiredHumanImpactChangedCells:CELLS,
   requiredNativeGroundTravelMeters:REAL_TRAVEL_METERS,
   physicallyRejectedSteps:this.rejectedUnphysicalSteps,
   sourceLocalPlayClear:this.status==='REAL_LOCAL_CIRCUIT_CLEAR',
   naturalCrossTeamRouteProven:false as const,
   actualOpponentCombatCertified:false as const,
   productionAuthorized:false as const,
   sourceScoreablePromotions:0 as const,
   officialWinner:'NONE' as const
  };
 }
}
