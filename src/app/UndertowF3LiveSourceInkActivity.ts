/**
 * W10-B75 — true read-only source CPU ink activity while PLAYING.
 * Reads the EXISTING same-tick native shot/impact-changed-cell counters,
 * not draw calls, guessed raster size, enemy contact, or Turf score.
 * No physics, aim, stage, CPU or official-result mutations.
 */
export interface B75NativeInkFrame{
 tick?:number;
 cpuSourceTurfShots:number;
 cpuImpactInkCellsChanged?:number;
 matchState:string;
 paused:boolean;
 stopReason:string|null;
 originalSourceSolids?:number;
 originalPaintSurfaces?:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified?:boolean;
}
export interface B75NativeInkActivity{
 status:'STAGING'|'REAL_SOURCE_INK'|'SOURCE_SHOTS_NO_NEW_INK'|
  'SOURCE_PATROL_NO_SHOTS'|'STOPPED'|'UNVERIFIED';
 recentNativeSeconds:3;
 newSourceCells:number;
 realCpuShots:number;
 totalChangedSourceCells:number;
 totalRealCpuShots:number;
 originalScoreableCells:0;
 original4v4Certified:false;
 actualObservedTicks:number;
}
type Entry={tick:number;newCells:number;shots:number};
export class B75SourceInkActivity {
 private lastTick=-1;
 private lastCells=-1;
 private lastShots=-1;
 private events:Entry[]=[];
 private readonly span=180;
 observe(f:B75NativeInkFrame):B75NativeInkActivity|null{
  if(f.originalSourceSolids===undefined||
     f.originalPaintSurfaces===undefined||
     f.originalSourceNavigationLinks===undefined||
     f.cpuImpactInkCellsChanged===undefined||
     f.unrestricted4v4Certified===undefined||
     f.tick===undefined)return null;
  // Original source 25/17/26/0 is the ONLY field authority.
  if(f.originalSourceSolids!==25||f.originalPaintSurfaces!==17||
     f.originalSourceNavigationLinks!==26||
     f.sourceScoreablePromotions!==0||
     f.productionAuthorized!==false||
     f.unrestricted4v4Certified!==false)
   return this.invalid(f);
  if(![f.tick,f.cpuSourceTurfShots,f.cpuImpactInkCellsChanged].every(
    n=>Number.isSafeInteger(n)&&n>=0))return this.invalid(f);
  if(this.lastTick>f.tick||this.lastShots>f.cpuSourceTurfShots||
     this.lastCells>f.cpuImpactInkCellsChanged)return this.invalid(f);
  if(this.lastTick<0){
   this.lastTick=f.tick;this.lastShots=f.cpuSourceTurfShots;
   this.lastCells=f.cpuImpactInkCellsChanged;
  }else if(f.tick>this.lastTick){
   const shots=f.cpuSourceTurfShots-this.lastShots;
   const newCells=f.cpuImpactInkCellsChanged-this.lastCells;
   if(shots||newCells)this.events.push({tick:f.tick,shots,newCells});
   this.lastTick=f.tick;this.lastShots=f.cpuSourceTurfShots;
   this.lastCells=f.cpuImpactInkCellsChanged;
  }else {
   // Multiple render snapshots of the same physics tick cannot create
   // duplicated ink; accumulate only the additionally observed delta.
   const shots=f.cpuSourceTurfShots-this.lastShots;
   const newCells=f.cpuImpactInkCellsChanged-this.lastCells;
   if(shots||newCells){
    const previous=this.events.at(-1);
    if(previous?.tick===f.tick){
     previous.shots+=shots;previous.newCells+=newCells;
    }else this.events.push({tick:f.tick,shots,newCells});
    this.lastShots=f.cpuSourceTurfShots;
    this.lastCells=f.cpuImpactInkCellsChanged;
   }
  }
  const cutoff=f.tick-this.span;
  while(this.events.length&&this.events[0]!.tick<=cutoff)
   this.events.shift();
  const newSourceCells=this.events.reduce((n,x)=>n+x.newCells,0);
  const realCpuShots=this.events.reduce((n,x)=>n+x.shots,0);
  const status:B75NativeInkActivity['status']=f.stopReason||
   f.matchState==='TIME_UP'?'STOPPED':
   f.matchState==='STAGING'?'STAGING':
   f.paused?'STOPPED':
   newSourceCells>0?'REAL_SOURCE_INK':
   realCpuShots>0?'SOURCE_SHOTS_NO_NEW_INK':
   'SOURCE_PATROL_NO_SHOTS';
  return {
   status,recentNativeSeconds:3,newSourceCells,realCpuShots,
   totalChangedSourceCells:f.cpuImpactInkCellsChanged,
   totalRealCpuShots:f.cpuSourceTurfShots,
   originalScoreableCells:0,original4v4Certified:false,
   actualObservedTicks:f.tick
  };
 }
 private invalid(f:B75NativeInkFrame):B75NativeInkActivity{
  this.lastTick=-1;this.lastShots=-1;this.lastCells=-1;this.events=[];
  return {
   status:'UNVERIFIED',recentNativeSeconds:3,
   newSourceCells:0,realCpuShots:0,
   totalChangedSourceCells:0,totalRealCpuShots:0,
   originalScoreableCells:0,original4v4Certified:false,
   actualObservedTicks:Number.isSafeInteger(f.tick)?f.tick!:0
  };
 }
}
