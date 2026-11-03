/**
 * B415 — real source-only playable ink economy practice, no gameplay writes.
 *
 * After a genuine A1 CLEAR during the native 180s trial, the player may
 * complete shoot -> own squid refill -> shoot. This is a voluntary practice
 * progression, NOT Turf points, hits, real 4v4, or an ART certification.
 * Only consecutive observed 60Hz snapshots can advance a step.
 */
export type B415Stage='SPEND'|'REFILL'|'RESHOOT'|'COMPLETE'|'HOLD';
export type B415NativeFrame=Readonly<{
 tick:number;shots:number;ink:number;mode:string;relation:string;
 recovery:string;source:string;scoreable:number;officialWinner:string;
 playing:boolean;paused:boolean;
}>;
export type B415InkLoop=Readonly<{
 stage:B415Stage;last:B415NativeFrame;firstTick:number;
 shotsSpent:number;inkSpent:number;inkRecovered:number;
 reshotCount:number;reshotInkSpent:number;
 completedTick:number|null;sourceOnly:true;officialTurfResult:false;
}>;

const valid=(f:B415NativeFrame):boolean=>
 f.source==='25/17/26/0'&&f.scoreable===0&&f.officialWinner==='NONE'&&
 f.playing===true&&f.paused===false&&Number.isSafeInteger(f.tick)&&f.tick>=0&&
 Number.isSafeInteger(f.shots)&&f.shots>=0&&
 Number.isFinite(f.ink)&&f.ink>=0&&f.ink<=100.001&&
 ['HUMAN','SQUID'].includes(f.mode)&&
 ['OWN','ENEMY','NEUTRAL','NONE'].includes(f.relation)&&
 typeof f.recovery==='string'&&f.recovery.length>0;

export function b415StartNativeInkLoop(f:B415NativeFrame):B415InkLoop{
 return {stage:valid(f)?'SPEND':'HOLD',last:{...f},firstTick:f.tick,
  shotsSpent:0,inkSpent:0,inkRecovered:0,
  reshotCount:0,reshotInkSpent:0,completedTick:null,
  sourceOnly:true,officialTurfResult:false};
}
export function b415StepNativeInkLoop(
 state:B415InkLoop|null,f:B415NativeFrame
):B415InkLoop{
 if(!state)return b415StartNativeInkLoop(f);
 if(!valid(f))return {...state,stage:'HOLD',last:{...f},completedTick:null};
 if(f.tick<state.last.tick||f.shots<state.last.shots||
    state.stage==='HOLD')return b415StartNativeInkLoop(f);
 if(f.tick===state.last.tick||state.stage==='COMPLETE')return state;
 const prev=state.last;
 const freshShots=f.shots-prev.shots;
 const spent=prev.ink-f.ink;
 let next:B415InkLoop={...state,last:{...f}};
 if(state.stage==='SPEND'&&prev.mode==='HUMAN'&&f.mode==='HUMAN'&&
    freshShots>0&&spent>0){
  next={...next,shotsSpent:state.shotsSpent+freshShots,
   inkSpent:state.inkSpent+spent};
  if(next.shotsSpent>=5&&next.inkSpent>=4)
   next={...next,stage:'REFILL'};
 }else if(state.stage==='REFILL'&&prev.mode==='SQUID'&&
    prev.relation==='OWN'&&prev.recovery==='SQUID_OWN'&&
    f.mode==='SQUID'&&f.relation==='OWN'&&
    f.recovery==='SQUID_OWN'&&f.ink>prev.ink){
  next={...next,inkRecovered:state.inkRecovered+f.ink-prev.ink};
  if(next.inkRecovered>0.25)
   next={...next,stage:'RESHOOT'};
 }else if(state.stage==='RESHOOT'&&prev.mode==='HUMAN'&&
    f.mode==='HUMAN'&&freshShots>0&&spent>0){
  next={...next,reshotCount:state.reshotCount+freshShots,
   reshotInkSpent:state.reshotInkSpent+spent};
  if(next.reshotCount>=5&&next.reshotInkSpent>=4)
   next={...next,stage:'COMPLETE',completedTick:f.tick};
 }
 return next;
}
export function b415ReadableInstruction(stage:B415Stage):string{
 switch(stage){
  case 'SPEND':return '1/3 · FIRE ON REAL GROUND TO SPEND INK';
  case 'REFILL':return '2/3 · SHIFT SQUID IN OWN INK TO REFILL';
  case 'RESHOOT':return '3/3 · HUMAN FORM · FIRE AGAIN';
  case 'COMPLETE':return 'PRACTICE INK LOOP CLEAR · UNSCORED';
  case 'HOLD':return 'PRACTICE PAUSED · NATIVE SOURCE UNVERIFIED';
 }
}
