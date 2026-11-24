import * as impl from "./shared-special-score720.mjs";
export function verify({KIT720,CertifiedTurf720,SharedSpecial720,cpuWantsSpecial}){
 const done=[],check=(n,x)=>{if(!x)throw Error(n);done.push(n)};
 const surf={id:"fixture",baseFlags:5,widthCells:3,heightCells:1,flagsGrid:new Uint16Array([5,5,5]),ownerGrid:new Int8Array(3)};
 const entry={surface:surf,evidenceId:"isolated fixture only",physicalBacked:true,originalScoreAuthorized:true,projectedAreaM2:[.5,1,.25]};
 const ctx=(complete=true,entries=[entry])=>new CertifiedTurf720({roundId:"r",entries,complete});
 const final=t=>t.result({roundId:"r",tick:10800,roundEnded:true});
 check("12 kits 9 specials",Object.keys(KIT720).length===12&&new Set(Object.values(KIT720).map(x=>x.special)).size===9);
 check("zero authority no winner",final(ctx(false,[])).winner==="NONE");
 check("partial authority no winner",final(ctx(false)).status==="HOLD");
 let t=ctx();surf.ownerGrid.set([1,-1,0]);let f=final(t);
 check("authoritative weighted ownership",f.winner==="B"&&f.areaA===.5&&f.areaB===1&&f.neutralArea===.25);
 check("not rounded score",f.percentB===100/1.75);
 check("early finish denied",t.result({roundId:"r",tick:10799,roundEnded:true}).status==="HOLD");
 surf.ownerGrid.set([0,0,0]);check("tie no fake winner",final(t).winner==="NONE");
 surf.ownerGrid[0]=1;check("actual post-write delta",t.changedArea(surf,0,0,1)===.5&&t.changedArea(surf,0,1,1)===0&&t.changedArea(surf,0,0,-1)===0);
 surf.flagsGrid[0]=1;check("changed authority holds",final(t).status==="HOLD"&&t.changedArea(surf,0,0,1)===0);surf.flagsGrid[0]=5;
 let fail=false;try{ctx(true,[{...entry,originalScoreAuthorized:false}])}catch{fail=true}check("unverified geometry rejected",fail);
 let begins=0,steps=0,cancels=0,allow=false;const p={begin:()=>{begins++;return allow},step:()=>{steps++;return {ended:true}},cancel:()=>{cancels++}};
 const make=turf=>{const s=new SharedSpecial720({roundId:"r",turf,pointsPerProjectedM2:100,splatRetention:.5,port:p});s.register({actorId:"h",lifeId:"h1",team:1,weaponId:"pulse-sprayer",source:"HUMAN"});s.register({actorId:"c",lifeId:"c1",team:-1,weaponId:"needle-smg",source:"CPU"});return s};
 let s=make(t),z=make(ctx(false,[]));
 const paint=(tick,sequence,x={})=>({roundId:"r",tick,sequence,lifeId:"h1",projectedChangedM2:1,event:{tick,actorId:"h",source:"HUMAN",team:1,type:"IMPACT"},...x});
 const act=(tick,x={})=>({roundId:"r",tick,actorId:"h",lifeId:"h1",...x});
 check("no formal authority no gain",z.acceptPaint(paint(1,0))===0&&!z.activate(act(1)));
 check("real gauge accrual",s.acceptPaint(paint(1,0))===100&&s.state("h").points===100);
 check("duplicate event denied",s.acceptPaint(paint(1,0))===0);
 check("human gaugeEligible respected",s.acceptPaint(paint(1,1,{event:{...paint(1,1).event,gaugeEligible:false}}))===0);
 check("special paint excluded",s.acceptPaint(paint(1,2,{event:{...paint(1,2).event,type:"SPECIAL"}}))===0);
 check("stale life excluded",s.acceptPaint(paint(1,3,{lifeId:"old"}))===0);
 check("wrong team excluded",s.acceptPaint(paint(1,4,{event:{...paint(1,4).event,team:-1}}))===0);
 check("no activation until ready",!s.activate(act(1))&&begins===0);
 check("CPU separate gauge",s.acceptPaint(paint(2,0,{lifeId:"c1",event:{tick:2,actorId:"c",source:"CPU",team:-1,type:"BOMB"}}))===100&&s.state("h").points===100);
 check("cap",s.acceptPaint(paint(2,1,{projectedChangedM2:2}))===110&&s.state("h").ready);
 check("failed admission preserves gauge",!s.activate(act(2))&&s.state("h").points===210);
 allow=true;check("successful atomic admission",s.activate(act(2))&&s.state("h").points===0&&s.state("h").active);
 check("no double activation",!s.activate(act(2))&&s.state("h").activations===1);
 check("no gain during special",s.acceptPaint(paint(3,0))===0);
 check("shared executor step",s.step(act(3))&&steps===1&&!s.state("h").active&&!s.step(act(3)));
 s.acceptPaint(paint(4,0));check("death retention",s.splat(act(4))&&s.state("h").points===50&&!s.state("h").alive);
 check("respawn identity",s.respawn({roundId:"r",actorId:"h",oldLifeId:"h1",newLifeId:"h2",tick:154})&&s.state("h").alive);
 check("old projectile life rejected",s.acceptPaint(paint(155,0))===0);
 check("CPU policy respects authority",!cpuWantsSpecial({ready:false,special:"chariot"},{canAct:true,executorReady:true,safeToStart:true,visibleEnemy:true}));
 check("CPU placement gate",!cpuWantsSpecial({ready:true,special:"greatBarrier"},{canAct:true,executorReady:true,safeToStart:true,visibleEnemy:true}));
 check("CPU combat gate",cpuWantsSpecial({ready:true,special:"chariot"},{canAct:true,executorReady:true,safeToStart:true,visibleEnemy:true}));
 s.close(10800);check("round close",!s.activate(act(10799))&&!s.state("h").ready);
 return done
}

console.log(verify(impl));
