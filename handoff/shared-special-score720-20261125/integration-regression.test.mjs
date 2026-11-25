import * as gauge from "./shared-special-score720.mjs";
import * as physical from "./physical-special-port720.mjs";
export function runIntegrated({KIT720,CertifiedTurf720,SharedSpecial720,PhysicalSpecialPort720,cpuWantsSpecial}){
 const results=[],ok=(n,b)=>{if(!b)throw Error(n);results.push(n)};
 const cfg={readyDelayF:0,repeatF:2,minRadiusM:1,maxRadiusM:2,radiusM:3,castLimitF:90,pairIntervalF:30,actionLockF:40,capacity:100,firstSwingF:0,throwDelayF:1,returnAnchorId:"anchor",physicalReturnAnchorVerified:true,maxHookM:10,inkCapacity:1,passiveDrainPerTick:.001,hookCost:.1};
 let calls=[],finished=[],devices=[],deny=false,prepared=0;
 const host={prepare(ctx){prepared++;const record=(route,x)=>(calls.push({...x,route,actor:ctx.actorId}),true);return {config:{...cfg,armorId:"armor:"+ctx.actorId},commit:()=>!deny,abort(){},finish:(reason,tick,details)=>finished.push({actor:ctx.actorId,reason,tick,details}),ops:{launchVolley:x=>record("volley",x),physicalMode:()=>"turret",changeMode:()=>true,launch:x=>record("launch",x),deploy:x=>(devices.push(x.factory({deviceId:ctx.actorId,physicalPlacementAccepted:true})),true),launchGuide:x=>record("guide",x),launchPair:x=>(devices.push(x.factory({physicalLaunchAccepted:true})),true),consume:()=>true,swing:x=>record("swing",x),launchThrow:x=>record("throw",x),queryHook:()=>({physicalContact:true,authorizedAnchor:true,anchorId:"wall",distanceM:5}),beginHook:()=>true,stepHook:()=>"physicalArrival",cancelHook(){},detach:()=>true,beginReturn:()=>true,stepReturn:()=>"supportedArrival"}}}};
 const keys=Object.keys(KIT720);
 const session=(roundId,weapons,complete=true)=>{
 const surf={id:"fixture",baseFlags:5,widthCells:weapons.length,heightCells:1,flagsGrid:new Uint16Array(weapons.length).fill(5),ownerGrid:new Int8Array(weapons.length)};
 const turf=new CertifiedTurf720({roundId,entries:complete?[{surface:surf,evidenceId:"fixture ONLY",physicalBacked:true,originalScoreAuthorized:true,projectedAreaM2:weapons.map(()=>3)}]:[],complete});
 const port=new PhysicalSpecialPort720({roundId,host}),shared=new SharedSpecial720({roundId,turf,pointsPerProjectedM2:100,splatRetention:.5,port});
 const actors=weapons.map((weaponId,i)=>({actorId:"a"+i,lifeId:"l1",team:i<4?1:-1,weaponId,source:i===0?"HUMAN":"CPU"}));actors.forEach(a=>shared.register(a));
 const action=(i,tick,input={})=>({roundId,tick,actorId:actors[i].actorId,lifeId:actors[i].lifeId,input});
 actors.forEach((a,i)=>{const old=surf.ownerGrid[i];surf.ownerGrid[i]=a.team;shared.acceptPaint({roundId,tick:1,sequence:i,lifeId:a.lifeId,projectedChangedM2:turf.changedArea(surf,i,old,a.team),event:{tick:1,actorId:a.actorId,team:a.team,source:a.source,type:"IMPACT"}})});
 return {shared,port,turf,actors,action}
 };
 let r=session("r1",keys.slice(0,8));const S=()=>r.shared,step=(i,t,x={})=>S().step(r.action(i,t,x)),active=i=>S().state("a"+i).active;
 ok("8 separate gauges",r.actors.every(a=>S().state(a.actorId).ready));
 deny=true;ok("rejected start retains gauge",!S().activate(r.action(0,2))&&S().state("a0").points===210);deny=false;
 ok("8 human/CPU starts",r.actors.every((a,i)=>S().activate(r.action(i,2))));
 ok("all debit once",r.actors.every(a=>S().state(a.actorId).points===0));
 ok("stale step/death rejected",!step(0,1)&&!S().splat(r.action(0,1)));
 step(0,2,{trigger:true});step(0,17);ok("human volley",calls.some(x=>x.route==="volley"&&x.actor==="a0"));
 step(1,22,{rapid:true});ok("CPU crab rapid",calls.some(x=>x.actor==="a1"&&x.route==="launch"&&x.kind==="rapid"));
 step(5,3,{trigger:true});ok("barrier persists",!active(5)&&devices.length===1);
 step(6,2);step(6,32);step(6,62);step(6,102);ok("laser three pairs",devices.length===4&&!active(6));
 step(7,2,{trigger:true});step(7,4,{trigger:true});step(7,6,{trigger:true});ok("three tornado guides",calls.filter(x=>x.route==="guide").length===3&&!active(7));
 step(3,2,{hold:true});ok("vac absorb",r.port.contact({...r.action(3,3),projectileId:"enemy",sourceTeam:-1,eligible:true,physicalContact:true,unoccluded:true,chargeValue:100})===true);
 step(3,23,{fire:true});ok("vac exhale",!active(3)&&calls.some(x=>x.actor==="a3"&&x.damage===220));
 step(4,2,{hookPressed:true});step(4,3);ok("zip actual hook cost",r.port.spendZipMain({...r.action(4,3),cost:.1},()=>true));
 ok("actual splat callback",S().splat(r.action(0,30))&&!S().state("a0").alive);
 const resp=(tick,newLifeId)=>S().respawn({roundId:"r1",actorId:"a0",oldLifeId:r.actors[0].lifeId,newLifeId,tick});
 ok("149 tick rejected",!resp(179,"l2"));ok("150 tick accepted",resp(180,"l2"));r.actors[0].lifeId="l2";
 ok("old life rejected",!S().activate({...r.action(0,180),lifeId:"l1"}));ok("second splat",S().splat(r.action(0,181)));
 ok("life ID reuse denied",!resp(331,"l1")&&resp(331,"l3"));
 step(1,482);ok("crab action lock metadata",finished.some(x=>x.actor==="a1"&&x.details?.actionUnlockTick===507));
 S().close(10800);r.port.close(10800);ok("round closed",!S().activate(r.action(2,10799)));
 ok("fixture tie no winner",r.turf.result({roundId:"r1",tick:10800,roundEnded:true}).winner==="NONE");
 r=session("r2",keys.slice(8));ok("fresh kits",r.actors.every((a,i)=>S().state(a.actorId).weaponId===keys[i+8]&&S().state(a.actorId).ready));
 ok("CPU decision gate",cpuWantsSpecial(S().state("a0"),{canAct:true,executorReady:true,safeToStart:true,physicalPlacementCandidate:true,contestedTurf:true}));
 ok("remaining four kit starts",r.actors.every((a,i)=>S().activate(r.action(i,2))));
 step(0,3,{trigger:true});ok("wave placed",devices.length===5);
 step(3,2,{holdStamp:true});ok("stamp",calls.some(x=>x.route==="swing"));
 ok("old round paint",S().acceptPaint({roundId:"r1",tick:4,sequence:0,event:{},projectedChangedM2:100,lifeId:"l1"})===0);
 S().close(10800);r.port.close(10800);ok("fixture raster winner",r.turf.result({roundId:"r2",tick:10800,roundEnded:true}).winner==="A");
 const before=prepared;r=session("r3",keys.slice(0,8),false);ok("unscored no activation",r.actors.every((a,i)=>!S().activate(r.action(i,2)))&&prepared===before);
 ok("unscored no winner",r.turf.result({roundId:"r3",tick:10800,roundEnded:true}).winner==="NONE");
 return results
}
console.log(runIntegrated({...gauge,...physical}));
