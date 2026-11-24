import * as impl from "./vac-stamp-zip720.mjs";
export function verify({InkVac720,Stamp720,Zip720}){
 const done=[],check=(n,b)=>{if(!b)throw Error(n);done.push(n)},base={tick:0,roundId:"r",lifeId:"l",team:"a"},i=(tick,x={})=>({tick,roundId:"r",lifeId:"l",alive:true,...x});
 const vac=()=>new InkVac720({...base,capacity:1000,minRadiusM:2,maxRadiusM:4});let v=vac(),shots=[],removed=0,p={consume:()=>{removed++;return true},launch:x=>(shots.push(x),true)},h=(t,x={})=>i(t,{projectileId:"p",sourceTeam:"b",eligible:true,physicalContact:true,unoccluded:true,chargeValue:400,...x});
 check("hold required",!v.absorb(h(0),p));v.step(i(1,{hold:true}),p);
 check("no phantom removal",!v.absorb(h(1),{...p,consume:()=>false})&&v.charge===0);
 check("friendly and cover",!v.absorb(h(1,{sourceTeam:"a"}),p)&&!v.absorb(h(1,{unoccluded:false}),p));
 check("dedup",v.absorb(h(1),p)&&!v.absorb(h(1),p)&&removed===1);
 check("full charge",v.absorb(h(2,{projectileId:"q",chargeValue:800}),p)&&v.phase==="transition");
 check("20F transition",v.step(i(21,{fire:true}),p).phase==="transition");
 check("exhale",v.step(i(22,{fire:true}),p).reason==="fired"&&shots[0].radiusM===4);
 v=vac();check("timeout suction",v.step(i(360),p).phase==="transition");check("auto exhale",v.step(i(530),p).reason==="fired"&&shots.at(-1).radiusM===2);
 let s=new Stamp720({...base,firstSwingF:10,repeatF:30,throwDelayF:5}),sp={swing:()=>true,launchThrow:()=>true};
 check("swing delay",!s.step(i(9,{holdStamp:true}),sp).swingId);
 let sid=s.step(i(10,{holdStamp:true}),sp).swingId,hit=i(10,{swingId:sid,targetLifeId:"enemy",targetTeam:"b",liveTarget:true,physicalContact:true,hitClass:"splash"});
 check("true contact",s.contact({...hit,physicalContact:false})===0&&s.contact(hit)===40);
 check("direct upgrades",s.contact({...hit,hitClass:"direct"})===60&&s.contact(hit)===0);
 s.closeSwing(sid);check("closed swing",s.contact(hit)===0);
 s.step(i(20,{holdThrow:true}),sp);s.step(i(21,{releaseThrow:true}),sp);check("throw delay",s.step(i(25),sp).phase==="throwPending"&&s.step(i(26),sp).reason==="thrown");
 const zip=()=>new Zip720({...base,returnAnchorId:"origin",physicalReturnAnchorVerified:true,maxHookM:12,inkCapacity:1,passiveDrainPerTick:.001,hookCost:.04});let z=zip(),zp={queryHook:()=>({physicalContact:true,authorizedAnchor:true,anchorId:"wall",distanceM:8}),beginHook:()=>true,stepHook:()=>"physicalArrival",cancelHook:()=>{},detach:()=>true,beginReturn:()=>true,stepReturn:()=>"supportedArrival"};
 check("no fake hook",z.step(i(1,{hookPressed:true}),{...zp,queryHook:()=>null}).rejected);
 check("failed cooldown",z.step(i(20,{hookPressed:true}),zp).phase==="free");
 check("actual hook",z.step(i(21,{hookPressed:true}),zp).phase==="travel"&&Math.abs(z.ink-.939)<1e-9);
 check("no main while travelling",!z.spendMain(.1,()=>true));
 check("physical arrival",z.step(i(22),zp).phase==="attached");
 check("actual weapon debit",!z.spendMain(.1,()=>false)&&z.spendMain(.1,()=>true));
 check("return hold",z.step(i(540),{...zp,beginReturn:()=>false}).phase==="returnHold");
 check("return admission",z.step(i(541),zp).phase==="returning");
 check("no teleport",z.step(i(542),{...zp,stepReturn:()=>"moving"}).phase==="returning");
 check("supported arrival",z.step(i(543),zp).reason==="returned");
 check("round cancellation",zip().step(i(1,{roundId:"new"}),zp).reason==="lifecycle");
 return done
}

console.log(verify(impl));
