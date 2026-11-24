import * as impl from "./crab-barrier720.mjs";
export function runChecks({Crab720,Barrier720,crabRepeat,crabProjectileDamage}){
 const names=[];const check=(n,v)=>{if(!v)throw Error(n);names.push(n)};const close=(a,b)=>Math.abs(a-b)<1e-7;
 const cs=()=>new Crab720({tick:0,roundId:"r",lifeId:"l",team:"a",armorId:"x",physicalArmorInstalled:true});
 const ci=(tick,extra={})=>({tick,roundId:"r",lifeId:"l",alive:true,roll:false,rapid:true,cannon:false,physicalMode:"turret",...extra});
 let shots=[];let p={changeMode:()=>true,launch:s=>(shots.push(s),true)},c=cs();
 check("20F startup",!c.step(ci(19),p).shot&&c.step(ci(20),p).shot==="rapid");
 check("same tick dedup",c.step(ci(20),p).duplicate&&shots.length===1);
 check("12F first interval",!c.step(ci(31),p).shot&&c.step(ci(32),p).muzzle===1);
 check("acceleration endpoints",crabRepeat(0)===12&&crabRepeat(90)===4&&crabProjectileDamage(9)===32&&crabProjectileDamage(25)===16);
 check("roll blocks fire",!c.step(ci(44,{roll:true,physicalMode:"ball"}),p).shot&&c.mode==="ball");
 check("exit cooldown",!c.step(ci(45),p).shot&&!c.step(ci(64),p).shot&&c.step(ci(65),p).shot==="rapid");
 check("cannon 720 damage",c.step(ci(77,{cannon:true}),p).shot==="cannon"&&shots.at(-1).direct===60&&shots.at(-1).blast===30);
 check("cannon cooldown",!c.step(ci(151),p).shot&&c.step(ci(152),p).shot==="rapid");
 c=cs();check("rejected pool does not advance count",c.step(ci(20),{...p,launch:()=>false}).rejected&&c.shotCount===0);
 const ch=(tick,extra={})=>({tick,roundId:"r",armorId:"x",eventId:"e",sourceTeam:"b",damage:100,objectMultiplier:1,firstPhysicalHit:"armor",...extra});
 check("exposed rider not armor",!c.hit(ch(21,{firstPhysicalHit:"rider"})).accepted&&c.hp===500);
 check("friendly no armor damage",!c.hit(ch(21,{sourceTeam:"a"})).accepted);
 check("armor hit dedup",c.hit(ch(21)).hp===400&&!c.hit(ch(21)).accepted);
 check("armor destruction",c.hit(ch(22,{eventId:"e2",damage:500})).ended.reason==="armorDestroyed");
 c=cs();check("death and round cancel",c.step(ci(10,{alive:false}),p).ended.reason==="death"&&cs().step(ci(10,{roundId:"q"}),p).ended.reason==="round");
 check("timeout",cs().step(ci(480),p).ended.actionUnlockTick===505);
 const bs=()=>new Barrier720({tick:0,roundId:"r",deviceId:"b",team:"a",physicalPlacementAccepted:true,minRadiusM:1,maxRadiusM:4});
 const bh=(tick,extra={})=>({tick,roundId:"r",deviceId:"b",eventId:"e",sourceTeam:"b",damage:100,objectMultiplier:1,firstPhysicalHit:"field",enteringFromOutside:true,...extra});
 let b=bs();check("ignition",b.radius(14,"r")===0&&b.radius(15,"r")===4);
 check("friendly passes",!b.hit(bh(15,{sourceTeam:"a"})).accepted);
 check("inside passes",!b.hit(bh(15,{enteringFromOutside:false})).accepted);
 check("characters are not blocked",!b.hit(bh(15,{firstPhysicalHit:"character"})).accepted);
 check("physical field hit",b.hit(bh(15)).applied===64&&b.hp===1472&&!b.hit(bh(15)).accepted);
 check("weak point shares pool",b.hit(bh(15,{eventId:"e2",firstPhysicalHit:"device"})).applied===100&&b.hp===1372);
 check("decay",b.advance(75,"r")&&close(b.hp,1372-92.1));
 check("shrinks",b.radius(75,"r")<4);
 check("round reset",!b.advance(76,"new"));
 b=bs();check("duration ~1001F after ignition",b.advance(1015,"r")&&!b.advance(1016,"r"));
 b=bs();check("break ends interception",b.hit(bh(15,{damage:3000})).destroyed&&!b.hit(bh(15,{eventId:"other"})).accepted);
 let threw=false;try{new Barrier720({tick:0,roundId:"r",deviceId:"b",team:"a",physicalPlacementAccepted:false,minRadiusM:1,maxRadiusM:4})}catch{threw=true}check("no fabricated placement",threw);
 return names
}

console.log(runChecks(impl));
