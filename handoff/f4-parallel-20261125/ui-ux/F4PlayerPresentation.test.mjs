import { f4TurfPresentation,f4Urgency,f4RosterView,f4TeamColor,f4KitPreview,f4CombatCue } from './F4PlayerPresentation.mjs';
function runTests() {
 const assert=(b,msg)=>{if(!b)throw Error(msg);};
 const live={status:'LIVE',winner:'NONE',percentA:42,percentB:35,neutralArea:23,totalProjectedM2:100};
 const final={...live,status:'FINAL',winner:'A'};
 const checks=[
 [f4TurfPresentation(live,'PLAYING').kind==='LIVE','live'],
 [f4TurfPresentation(live,'PLAYING').neutral===23,'neutral actual area'],
 [f4TurfPresentation(live,'TIME_UP').kind==='HOLD','no inferred winner'],
 [f4TurfPresentation(final,'TIME_UP').title==='勝利！','A winner'],
 [f4TurfPresentation({...final,winner:'B'},'TIME_UP').title==='敗北','B winner authority'],
 [f4TurfPresentation({...final,winner:'DRAW'},'TIME_UP').title==='引き分け','draw authority'],
 [f4TurfPresentation({...final,winner:'NONE'},'TIME_UP').kind==='HOLD','missing winner'],
 [f4TurfPresentation(final,'PLAYING').kind==='HOLD','stale final'],
 [f4TurfPresentation(final,'TIME_UP',true).kind==='HOLD','stop'],
 [f4TurfPresentation(null,'PLAYING').a===null,'missing score'],
 [f4TurfPresentation({status:'BUILDING',progress:.513},'PLAYING').detail==='51% 完了','mask progress'],
 [f4TurfPresentation({status:'HOLD'},'TIME_UP').a===null,'mask hold'],
 [f4TurfPresentation({...live,percentA:NaN},'PLAYING').kind==='HOLD','nan'],
 [f4TurfPresentation({...live,percentB:70},'PLAYING').kind==='HOLD','invalid total'],
 [f4TurfPresentation({...live,neutralArea:1},'PLAYING').kind==='HOLD','area mismatch'],
 [f4TurfPresentation({...live,neutralArea:undefined},'PLAYING').neutral===null,'unknown neutral'],
 [f4TurfPresentation({...live,percentA:0,percentB:0,neutralArea:100},'PLAYING').a===0,'zero known'],
 [f4Urgency(31)==='normal'&&f4Urgency(30)==='soon','30 second threshold'],
 [f4Urgency(11)==='soon'&&f4Urgency(10)==='critical'&&f4Urgency(0)==='critical','10 second threshold'],
 [f4Urgency(-1)==='unknown'&&f4Urgency(NaN)==='unknown','invalid clock'],
 ];
 for(const [ok,name] of checks)assert(ok,name);
 return checks.length;
}
console.log('PASS',runTests());

function runExtensionTests(){
 const rows=['A1','A2','A3','B1','B2','B3','B4'].map((id,i)=>({id,team:i<3?'ALLY':'ENEMY',status:'ACTIVE',hp:100}));
 const roster={sourceScoreable:0,officialWinner:'NONE',naturalEnemyEncounterCertified:false,humanHp:100,rows};
 const gauge={provisional:true,required:200,points:200,executorReady:true,ready:true,active:false};
 const base={hp:100,ink:70,subCost:70,special:gauge};
 const cases=[
 [f4RosterView(roster)?.length===8,'eight actual actors'],
 [f4RosterView({...roster,humanHp:0})[0].status==='SPLAT','human death'],
 [f4RosterView({...roster,rows:rows.map((r,i)=>i===2?{...r,status:'SPLAT',hp:null}:r)})[3].status==='SPLAT','cpu death'],
 [f4RosterView({...roster,rows:rows.map((r,i)=>i===6?{...r,status:'REJOINING'}:r)})[7].status==='REJOINING','rejoining'],
 [f4RosterView({...roster,rows:rows.map((r,i)=>i===5?{...r,status:'UNKNOWN',hp:null}:r)})[6].status==='UNKNOWN','unknown'],
 [f4RosterView({...roster,rows:rows.slice(1)})===null,'missing cpu'],
 [f4RosterView({...roster,rows:[rows[1],...rows.slice(1)]})===null,'duplicate actor'],
 [f4RosterView({...roster,rows:rows.map((r,i)=>i===1?{...r,hp:0}:r)})===null,'invalid live hp'],
 [f4RosterView({...roster,officialWinner:'A'})===null,'official boundary'],
 [f4RosterView({...roster,humanHp:NaN})===null,'invalid human hp'],
 [f4TeamColor([.02,.84,.96])==='#05d6f5','configured cyan'],
 [f4TeamColor(new Float32Array([1,.1,.58]))==='#ff1a94','typed array'],
 [f4TeamColor([1,2,0])===null&&f4TeamColor(null)===null,'invalid color'],
 [f4KitPreview({weapon:'Pulse',classLabel:'シューター',sub:'Anchor',special:'Ultra',subCost:70})?.sub.includes('70%'),'real kit'],
 [f4KitPreview({weapon:'Pulse',classLabel:'シューター',sub:'Anchor',special:'Ultra'})?.sub==='サブ · Anchor','unknown cost'],
 [f4KitPreview({weapon:'Pulse'})===null,'incomplete kit'],
 [f4CombatCue(base).ready&&!f4CombatCue(base).lowInk,'exact cost full ready'],
 [f4CombatCue({...base,ink:69.999}).lowInk,'below cost'],
 [!f4CombatCue({...base,hp:0}).ready,'dead full gauge'],
 [!f4CombatCue({...base,special:{...gauge,ready:false}}).ready,'full not actionable'],
 [!f4CombatCue({...base,special:{...gauge,active:true}}).ready,'already active'],
 [!f4CombatCue({...base,special:{...gauge,executorReady:false}}).ready,'executor hold'],
 [!f4CombatCue({...base,special:{...gauge,provisional:false}}).ready,'untrusted gauge'],
 [f4CombatCue({...base,hp:35}).lowHp&&!f4CombatCue({...base,hp:36}).lowHp,'HP threshold'],
 [f4CombatCue({...base,subCost:NaN}).threshold===null,'bad sub cost'],
 [!f4CombatCue({...base,special:{...gauge,points:201}}).ready,'invalid gauge'],
 ];
 for(const [ok,name] of cases)if(!ok)throw Error(name);
 return cases.length;
}
console.log('PASS extension',runExtensionTests());

if(f4TurfPresentation({status:'BUILDING',progress:.99},'TIME_UP').kind!=='HOLD')throw Error('unfinished final mask');
console.log('PASS final mask guard',1);
