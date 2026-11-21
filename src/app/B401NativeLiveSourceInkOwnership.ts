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
 // A real 180s TIME_UP needs exactly ONE current owner-grid reading:
 // the previous 120-tick sample can miss paint from the final seconds.
 // The same finished SOURCE world must never rescan on every UI frame.
 private finalNativeTick:number|null=null;
 private current:B401LiveState=make('WAITING','NO_NATIVE_SOURCE_TICK');
 get(){return this.current;}
 observe(grids:readonly B400SourceGrid[],stage:readonly number[],
  tick:number,phase:string,full180s:boolean):B401LiveState{
  if(!full180s||!['STAGING','PLAYING','TIME_UP'].includes(phase)||
     !Number.isSafeInteger(tick)||tick<1)return this.current;
  // Only a complete 180s native timeline can produce the final screen.
  // This authorizes no winner, scoreable cells, stage or physics changes.
  const finished=phase==='TIME_UP';
  if(finished&&tick<10800)return this.current;
  if(this.finalNativeTick!==null||this.lastTick>tick)return this.current;
  if(!finished&&this.lastTick>=0&&tick-this.lastTick<120)
   return this.current;
  this.lastTick=tick;
  if(finished)this.finalNativeTick=tick;
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
   make('LIVE_REGISTERED_SOURCE_ONLY',finished?
    'FINAL_NATIVE_SOURCE_OWNER_GRID':'REAL_NATIVE_PAINT_SURFACE_OWNERS',
    tick,17,total,a,b,n):
   make('HOLD','NO_ACTIVE_ORIGINAL_INK_CELLS',tick,17);
 }
}

/** F4 original-terrain research only. Actual registered painted GRID CELLS
 * are not comparable to full 3D stage area, so never return a winner.
 * No SOURCE turf score is produced or changed.
 */
export function b401F4RegisteredPaintedCellLead(s:B401LiveState):string|null{
 if(s.status!=='LIVE_REGISTERED_SOURCE_ONLY'||s.registeredSurfaces!==17||
    s.originalSourceOnly!==true||s.officialTurfScore!==false||
    s.winner!=='NONE'||s.gameplayWrites!==0||
    s.productionAuthorized!==false||
    ![s.totalActiveCells,s.teamA,s.teamB,s.neutral].every(n=>
      Number.isSafeInteger(n)&&n>=0)||
    s.totalActiveCells<1||
    s.teamA+s.teamB+s.neutral!==s.totalActiveCells)return null;
 const painted=s.teamA+s.teamB;
 if(painted===0)return 'F4 PAINTED GRID · NO PAINT YET · RESEARCH ONLY';
 const diff=Math.abs(s.teamA-s.teamB);
 if(diff===0)return 'F4 PAINTED GRID · EVEN REGISTERED CELLS · RESEARCH ONLY';
 const team=s.teamA>s.teamB?'A':'B';
 return 'F4 PAINTED GRID · TEAM '+team+' +'+diff.toLocaleString('en-US')+
  ' REGISTERED CELLS · RESEARCH ONLY';
}

/** A read-only SOURCE ownership line, explicitly NOT official Turf. */
export function b401SourceHudLine(s:B401LiveState,f4Research=false):string{
 if(s.status==='LIVE_REGISTERED_SOURCE_ONLY'){
  const research=f4Research?b401F4RegisteredPaintedCellLead(s):null;
  return (s.reason==='FINAL_NATIVE_SOURCE_OWNER_GRID'?
   'FINAL SOURCE GRID · A ':'LIVE SOURCE GRID · A ')+s.teamA.toLocaleString()+
   ' / B '+s.teamB.toLocaleString()+
   ' / NEUTRAL '+s.neutral.toLocaleString()+
   ' · TICK '+s.sampleNativeTick+' · NOT TURF SCORE'+
   (research?'\n'+research:'')+'\n';
 }
 return s.status==='HOLD'?'SOURCE GRID HOLD · '+s.reason+'\n':'';
}

/** Replace ONLY the B401 section of an existing real SOURCE round clock.
 * Never forge a newer native tick or change gameplay counts. */
export function b401ReplaceSourceGridFooter(
 text:string,s:B401LiveState,f4Research=false
):string{
 if(!text.endsWith('NO OFFICIAL WINNER'))return text;
 const old=text.replace(
  /(?:(?:LIVE|FINAL) SOURCE GRID ·[^\n]*\n(?:F4 PAINTED GRID ·[^\n]*\n)?|SOURCE GRID HOLD ·[^\n]*\n)(?=NO OFFICIAL WINNER$)/,'');
 return old.replace(/NO OFFICIAL WINNER$/,
  b401SourceHudLine(s,f4Research)+'NO OFFICIAL WINNER');
}
