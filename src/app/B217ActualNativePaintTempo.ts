/**
 * B217 original-source actual native 5s CPU shot/paint activity.
 * Read-only: samples existing 60Hz clock and genuine accepted source
 * CPU weapon requests + paint-changed cells. A paint change need not
 * have been caused by the simultaneous weapon request, so these remain
 * separate, non-causal telemetry values; NEVER a Turf score.
 */
export interface B217ActualNativeSample {
 readonly tick:number;readonly cpuSourceShots:number;
 readonly cpuImpactPaintChanges:number;readonly humanShots:number;
 readonly sourceScoreable:number;
}
export interface B217SourceWindow {
 readonly nativeTicks:number;
 readonly genuineCpuSourceShots:number;
 readonly actualCpuChangedPaintCells:number;
 readonly realHumanShots:number;
 readonly fromTick:number;readonly toTick:number;
 readonly sourceScoreable:0;
}
export class B217ActualNativePaintTempo {
 private anchor:B217ActualNativeSample|null=null;
 private last:B217SourceWindow|null=null;
 public snapshot():B217SourceWindow|null{return this.last;}
 public reset():void{this.anchor=null;this.last=null;}
 public observe(sample:B217ActualNativeSample):B217SourceWindow|null{
  const valid=Number.isSafeInteger(sample.tick)&&sample.tick>=0&&
   Number.isSafeInteger(sample.cpuSourceShots)&&sample.cpuSourceShots>=0&&
   Number.isSafeInteger(sample.cpuImpactPaintChanges)&&
     sample.cpuImpactPaintChanges>=0&&
   Number.isSafeInteger(sample.humanShots)&&sample.humanShots>=0&&
   sample.sourceScoreable===0;
  if(!valid){this.reset();return null;}
  const p=this.anchor;
  if(!p||sample.tick<p.tick||
     sample.cpuSourceShots<p.cpuSourceShots||
     sample.cpuImpactPaintChanges<p.cpuImpactPaintChanges||
     sample.humanShots<p.humanShots){
   this.anchor={...sample};this.last=null;return null;
  }
  const ticks=sample.tick-p.tick;
  if(ticks<300)return this.last;
  this.last={
   nativeTicks:ticks,fromTick:p.tick,toTick:sample.tick,
   genuineCpuSourceShots:sample.cpuSourceShots-p.cpuSourceShots,
   actualCpuChangedPaintCells:
     sample.cpuImpactPaintChanges-p.cpuImpactPaintChanges,
   realHumanShots:sample.humanShots-p.humanShots,
   sourceScoreable:0
  };
  this.anchor={...sample};
  return this.last;
 }
}
