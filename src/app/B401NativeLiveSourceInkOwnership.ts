/** B401 SOURCE only: bounded native-tick sampling of 17 real owner grids.
 * No actor, paint, geometry, Turf score or simulation writes. */
import type {B400SourceGrid} from './B400RealOriginalSourceGridRecap';
export type B401LiveState=Readonly<{
 status:'WAITING'|'LIVE_REGISTERED_SOURCE_ONLY'|'HOLD';reason:string;
 sampleNativeTick:number;registeredSurfaces:number;
 totalActiveCells:number;teamA:number;teamB:number;neutral:number;
 aPercent:number;bPercent:number;neutralPercent:number;
 originalSourceOnly:true;officialTurfScore:false;winner:'NONE';
 gameplayWrites:0;productionAuthorized:false;
}>;
const make=(status:B401LiveState['status'],reason:string,tick=-1,
 count=0,total=0,a=0,b=0,n=0):B401LiveState=>({
 status,reason,sampleNativeTick:tick,registeredSurfaces:count,
 totalActiveCells:total,teamA:a,teamB:b,neutral:n,
 aPercent:total?100*a/total:0,bPercent:total?100*b/total:0,
 neutralPercent:total?100*n/total:0,originalSourceOnly:true,
 officialTurfScore:false,winner:'NONE',gameplayWrites:0,
 productionAuthorized:false
});
export class B401NativeLiveSourceInkOwnership{
 private lastTick=-1;
 private current:B401LiveState=make('WAITING','NO_NATIVE_SOURCE_TICK');
 get(){return this.current;}
 observe(grids:readonly B400SourceGrid[],stage:readonly number[],
  tick:number,phase:string,full180s:boolean):B401LiveState{
  if(!full180s||!['STAGING','PLAYING'].includes(phase)||
     !Number.isSafeInteger(tick)||tick<1)return this.current;
  if(this.lastTick>=0&&tick-this.lastTick<180)return this.current;
  this.lastTick=tick;
  if(stage.join('/')!=='25/17/26/0'||grids.length!==17)
   return this.current=make('HOLD','ORIGINAL_STAGE_NOT_REGISTERED',tick,grids.length);
  const ids=new Set<string>();let a=0,b=0,n=0;
  for(const g of grids){
   if(!g.id||ids.has(g.id)||g.isScoreable||
      !Number.isSafeInteger(g.widthCells)||!Number.isSafeInteger(g.heightCells)||
      g.widthCells<1||g.heightCells<1||
      g.ownerGrid.length!==g.widthCells*g.heightCells)
    return this.current=make('HOLD','INVALID_OR_SCOREABLE_GRID',tick,grids.length);
   ids.add(g.id);
   for(let y=0;y<g.heightCells;y++)for(let x=0;x<g.widthCells;x++){
    const owner=g.ownerGrid[y*g.widthCells+x];
    if(!g.isCellActive(x,y)){
     if(owner!==0)return this.current=make('HOLD','INK_OUTSIDE_ORIGINAL_FOOTPRINT',tick,17);
     continue;
    }
    if(owner===1)a++;
    else if(owner===-1)b++;
    else if(owner===0)n++;
    else return this.current=make('HOLD','UNRECOGNIZED_ORIGINAL_OWNER',tick,17);
   }
  }
  const total=a+b+n;
  return this.current=total>0?
   make('LIVE_REGISTERED_SOURCE_ONLY','REAL_NATIVE_PAINT_SURFACE_OWNERS',tick,17,total,a,b,n):
   make('HOLD','NO_ACTIVE_ORIGINAL_INK_CELLS',tick,17);
 }
}
