import {kit720,resolveF4Sub720,predictF4Lead} from "./f4Combat720.mjs";
function checks(kit720,resolveF4Sub720,predictF4Lead){let n=0;function ok(x,m){if(!x)throw Error(m);n++;}
 const ids=["pulse-sprayer","needle-smg","twin-comets","rail-charger","arc-blaster","metro-roller","dash-brush","wave-slosher","rotor-splatling","canopy-guard","chord-stringer","ink-saber"];
 ok(ids.every(id=>kit720(id)),"12 rows");
 ok(ids.filter(id=>resolveF4Sub720(id,["pulse-bomb","snap-bomb","anchor-bomb"])).length===7,"7 compatible existing subs");
 ok(kit720("pulse-sprayer").points===210&&resolveF4Sub720("pulse-sprayer",["anchor-bomb"])==="anchor-bomb","Pulse kit");
 ok(kit720("rotor-splatling").sub==="Sprinkler"&&resolveF4Sub720("rotor-splatling",["anchor-bomb"])===null,"no fake substitute");
 ok(kit720("unknown")===null&&resolveF4Sub720("needle-smg",[])===null,"unknown/unavailable");
 const x={muzzle:{x:0,y:1,z:0},body:{x:10,y:1,z:0},previousBody:{x:10,y:1,z:-.1},deltaTicks:1,maxRangeMeters:15,sameLife:true,grounded:true};
 const f=p=>Math.hypot(p.x,p.z)*2;
 const clear=()=>true;
 let p=predictF4Lead(x,f,clear);
 ok(p&&p.aim.z>2&&p.aim.z<2.1&&p.aim.y===1,"flight time iterative lead");
 ok(predictF4Lead({...x,sameLife:false},f,clear)===null,"stale life");
 ok(predictF4Lead({...x,grounded:false},f,clear)===null,"airborne");
 ok(predictF4Lead({...x,previousBody:x.body},f,clear)===null,"stationary");
 ok(predictF4Lead({...x,previousBody:{x:10,y:1,z:-3}},f,clear)===null,"teleport");
 ok(predictF4Lead(x,()=>0,clear)===null&&predictF4Lead(x,()=>null,clear)===null,"no valid flight");
 ok(predictF4Lead(x,f,(_,p)=>p.z===0)===null,"predicted cover");
 ok(predictF4Lead({...x,maxRangeMeters:10},f,clear)===null,"out of range");
 ok(predictF4Lead(x,()=>40,clear)===null,"excess extrapolation");
 ok(predictF4Lead(x,()=>4,()=>false)===null,"actual cover");
 ok(predictF4Lead({...x,deltaTicks:4},f,clear)===null,"stale sample");
 return n;}
console.log("checks passed:",checks(kit720,resolveF4Sub720,predictF4Lead));
