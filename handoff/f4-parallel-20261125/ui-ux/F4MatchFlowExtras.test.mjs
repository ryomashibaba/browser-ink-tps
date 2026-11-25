import {f4PickerOptions,f4CanPick,f4MatchStats} from './F4MatchFlowExtras.mjs';
function runFlowTests(){
 const opts=Array.from({length:12},(_,i)=>({value:'id'+i,textContent:'分類 · 武器'+i,disabled:false}));
 const frame={playerView:true,matchState:'STAGING',paused:true,stopped:false};
 const gate={menuState:'READY_TO_START',menuVisible:true,selectEnabled:true,pointerLocked:false};
 const summary={directHits:8,directSplats:2,deaths:3,respawns:2,changedCells:123};
 const cases=[
 [f4PickerOptions(opts)?.length===12,'12 real options'],[f4PickerOptions(opts)[0].name==='武器0','real label'],
 [f4PickerOptions(opts.slice(1))===null,'missing option'],
 [f4PickerOptions([...opts.slice(0,11),opts[0]])===null,'duplicate'],
 [f4PickerOptions(opts.map((o,i)=>i===0?{...o,disabled:true}:o))===null,'disabled'],
 [f4CanPick(frame,gate),'ready'],
 [!f4CanPick({...frame,matchState:'PLAYING'},gate),'playing blocked'],
 [!f4CanPick({...frame,paused:false},gate),'unpaused blocked'],
 [!f4CanPick({...frame,stopped:true},gate),'stop blocked'],
 [!f4CanPick({...frame,playerView:false},gate),'inspect blocked'],
 [!f4CanPick(frame,{...gate,pointerLocked:true}),'locked blocked'],
 [!f4CanPick(frame,{...gate,selectEnabled:false}),'disabled select'],
 [!f4CanPick(frame,{...gate,menuVisible:false}),'hidden'],
 [!f4CanPick(frame,{...gate,menuState:'NATIVE_PAUSED'}),'pause blocked'],
 [f4MatchStats(summary).length===5,'real stats'],
 [f4MatchStats({...summary,directSplats:9}).length===3,'invalid combat pair omitted'],
 [f4MatchStats({...summary,deaths:1}).length===3,'invalid life pair omitted'],
 [f4MatchStats({...summary,changedCells:NaN}).length===4,'invalid paint omitted'],
 [f4MatchStats(null).length===0,'unknown'],
 [f4MatchStats({directHits:0,directSplats:0,deaths:0,respawns:0,changedCells:0}).every(x=>x.value===0),'genuine zero'],
 ];
 for(const [ok,name] of cases)if(!ok)throw Error(name);
 return cases.length;
}
console.log('PASS match flow',runFlowTests());

if(f4PickerOptions(Array(12).fill(null))!==null)throw Error('null options');
console.log('PASS invalid options',1);
