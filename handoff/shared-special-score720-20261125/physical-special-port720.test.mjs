import * as impl from "./physical-special-port720.mjs";
export function verify({PhysicalSpecialPort720}){
 const result=[],check=(n,b)=>{if(!b)throw Error(n);result.push(n)},calls=[],devices=[];
 const config={readyDelayF:0,repeatF:2,armorId:"armor",minRadiusM:1,maxRadiusM:2,radiusM:3,castLimitF:90,pairIntervalF:30,actionLockF:40,capacity:100,firstSwingF:0,throwDelayF:1,returnAnchorId:"anchor",physicalReturnAnchorVerified:true,maxHookM:10,inkCapacity:1,passiveDrainPerTick:.001,hookCost:.1};
 let commit=true,finish=0,abort=0;
 const ops={launchVolley:x=>(calls.push(["volley",x]),true),changeMode:()=>true,launch:x=>(calls.push(["launch",x]),true),physicalMode:()=>"turret",deploy:x=>(devices.push(x.factory({deviceId:"device"+devices.length,physicalPlacementAccepted:true})),true),launchGuide:x=>(calls.push(["guide",x]),true),launchPair:x=>(devices.push(x.factory({physicalLaunchAccepted:true})),true),consume:()=>true,swing:x=>(calls.push(["swing",x]),true),launchThrow:()=>true,queryHook:()=>({physicalContact:true,authorizedAnchor:true,anchorId:"wall",distanceM:5}),beginHook:()=>true,stepHook:()=>"physicalArrival",cancelHook:()=>{},detach:()=>true,beginReturn:()=>true,stepReturn:()=>"supportedArrival"};
 const port=new PhysicalSpecialPort720({roundId:"r",host:{prepare:()=>({config,ops,commit:()=>commit,abort:()=>abort++,finish:()=>finish++})}});
 const q=(special,actorId)=>({special,actorId,roundId:"r",lifeId:"1",team:1,tick:0}),s=(actorId,tick,input={})=>port.step({actorId,roundId:"r",lifeId:"1",tick,input});
 commit=false;check("rollback",!port.begin(q("ultraShot","fail"))&&abort===1);commit=true;
 check("all nine dispatch",["ultraShot","chariot","greatBarrier","waveBreaker","tripleTornado","microLaser","blower","ultraStamp","superHook"].every(n=>port.begin(q(n,n))));
 check("duplicate",!port.begin(q("ultraShot","ultraShot")));
 s("ultraShot",0,{trigger:true});s("ultraShot",15);check("volley",calls.some(x=>x[0]==="volley"&&x[1].count===3));
 s("chariot",20,{rapid:true});check("crab",calls.some(x=>x[0]==="launch"&&x[1].kind==="rapid"));
 check("barrier",s("greatBarrier",1,{trigger:true}).ended&&devices[0].hp===1536);
 check("wave",s("waveBreaker",1,{trigger:true}).ended&&devices[1].fronts(91,"r").length===1);
 let w=devices[1],h={tick:91,roundId:"r",waveIndex:0,targetLifeId:"target",liveEnemy:true,physicalWaveContact:true};
 check("wave contact",w.hit({...h,physicalWaveContact:false})===0&&w.hit(h)===45&&w.hit(h)===0);
 w.destroy(100);check("no later waves",w.fronts(241,"r").every(x=>x.index===0));
 s("tripleTornado",0,{trigger:true});s("tripleTornado",1,{trigger:true});s("tripleTornado",2,{trigger:true});check("three guides",s("tripleTornado",4,{trigger:true}).ended&&calls.filter(x=>x[0]==="guide").length===3);
 s("microLaser",0);s("microLaser",30);s("microLaser",60);check("three pairs",devices.length===5);
 let l=devices[2],lh={tick:36,roundId:"r",beamId:l.beamIds[0],targetLifeId:"target",liveEnemy:true,beamOverlap:true};
 check("beam contact",l.damage({...lh,beamOverlap:false})===0&&l.damage(lh)===3.5&&l.damage(lh)===0);
 check("laser end",s("microLaser",100).ended);
 s("blower",0,{hold:true});check("vac",port.contact({actorId:"blower",roundId:"r",lifeId:"1",tick:1,projectileId:"p",sourceTeam:-1,eligible:true,physicalContact:true,unoccluded:true,chargeValue:100}));
 check("vac fire",s("blower",21,{fire:true}).ended);
 s("ultraStamp",0,{holdStamp:true});let swingId=calls.find(x=>x[0]==="swing")[1].swingId;
 check("stamp",port.contact({actorId:"ultraStamp",roundId:"r",lifeId:"1",tick:0,swingId,targetLifeId:"target",targetTeam:-1,liveTarget:true,physicalContact:true,hitClass:"direct"})===100);
 check("close swing",port.closeSwing({actorId:"ultraStamp",roundId:"r",lifeId:"1",swingId}));
 s("superHook",0,{hookPressed:true});s("superHook",1);check("zip debit",port.spendZipMain({actorId:"superHook",roundId:"r",lifeId:"1",cost:.1},()=>true));
 check("old life",port.contact({actorId:"chariot",roundId:"r",lifeId:"old",tick:21})===null);
 port.cancel({actorId:"chariot",roundId:"r",lifeId:"1",tick:21,reason:"splat"});check("cancel",s("chariot",22).ended);
 port.close(10800);check("close all",finish===9&&!port.begin(q("chariot","new")));
 return result
}

console.log(verify(impl));
