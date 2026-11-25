import { f4TurfPresentation,f4Urgency } from './F4PlayerPresentation.mjs';
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
