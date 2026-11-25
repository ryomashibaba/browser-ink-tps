// Run from repo root after applying integrated-navigation-fixes.patch.
import {localPatrolProgress,localPatrolCanContinue} from '../../../../src/ai/F4PatrolNavigation.mjs';
function tests(progress,keep){
 const p=(x,y=0,z=0)=>({x,y,z}),trail=[p(0)],out=[];const ok=(n,v)=>{if(!v)throw Error(n);out.push(n);};
 ok("vertical jitter",!progress(trail,p(0,.8)));ok("small horizontal jitter",!progress(trail,p(.1)));ok("actual lateral progress",progress(trail,p(0,0,.3)));ok("no repeated bend",!progress(trail,p(0)));ok("forward progress",progress(trail,p(.4,0,.3)));ok("no old point revisit",!progress(trail,p(0,0,.3)));ok("invalid point",!progress(trail,p(NaN)));
 ok("stationary 47 ticks",keep(47,0,0));ok("stationary 48 ticks stops",!keep(48,0,0));ok("formerly expired moving survey",keep(180,0,160));ok("moving enemy ink long route",keep(359,0,350));ok("hard six second cap",!keep(360,0,359));ok("explicit veto wins",!keep(20,0,19,true));ok("clock rewind",!keep(0,1,1));ok("invalid tick",!keep(NaN,0,0));
 const bounded=[];for(let i=0;i<100;i++)progress(bounded,p(i*.3));ok("bounded trail",bounded.length===96);
 return out;
}
console.log(tests(localPatrolProgress,localPatrolCanContinue));
