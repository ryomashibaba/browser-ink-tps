import {F4PatrolNavigation} from './F4PatrolNavigation.mjs';
function tests(N){
 const n=new N(),p=(x,y=0,z=0)=>({x,y,z}),row=(x,ink,order=0,y=0)=>({point:p(x,y),ink,order,index:order}),out=[];
 const ok=(name,v)=>{if(!v)throw Error(name);out.push(name);};
 n.beginTick(10);n.noteStalled("A",10,p(0),p(2));
 ok("stall",n.avoids("A",11,p(.2),p(2.5)));ok("actor",!n.avoids("B",11,p(0),p(2)));ok("floor",!n.avoids("A",11,p(0,3),p(2,3)));ok("origin",!n.avoids("A",11,p(4),p(2)));ok("expiry",n.avoids("A",189,p(0),p(2))&&!n.avoids("A",190,p(0),p(2)));
 ok("filter",n.rank("A",11,p(0),[row(2,"NEUTRAL"),row(-2,"OWN")],[])[0].point.x===-2);
 const equal=[row(2,"NEUTRAL"),row(-2,"NEUTRAL",1)],rank=(opts={},allies=[],rows=[row(2,"OWN"),row(-2,"NEUTRAL",1)])=>n.rank("B",11,p(0),rows,allies,opts)[0]?.point.x;
 ok("paint",rank()===-2);ok("recovery",rank({recovering:true})===2);ok("unknown",rank({},[],[row(2,"UNKNOWN"),row(-2,"NEUTRAL",1)])===-2);ok("ally",rank({},[p(2)],equal)===-2);ok("ally floor",rank({},[p(2,3)],equal)===2);ok("intent",rank({reservations:[p(2)]},[],equal)===-2);ok("invalid",n.rank("B",11,p(0),[row(NaN,"NEUTRAL"),row(0,"NEUTRAL")],[]).length===0);
 n.noteReached("B",10,p(2));ok("visit",rank({},[],equal)===-2);ok("visit expiry",n.rank("B",250,p(0),equal,[])[0].point.x===2);
 n.clear("A");ok("respawn",!n.avoids("A",11,p(0),p(2)));
 ok("first veto",!n.noteKccReject("A",20,p(0),p(2)));ok("same tick",!n.noteKccReject("A",20,p(0),p(2)));ok("second veto",!n.noteKccReject("A",22,p(.05),p(2)));ok("third veto",n.noteKccReject("A",24,p(.1),p(2))&&n.avoids("A",25,p(0),p(2)));
 n.clear("A");n.noteKccReject("A",20,p(0),p(2));n.noteKccReject("A",22,p(.3),p(2));ok("movement resets",!n.noteKccReject("A",24,p(.3),p(2)));
 n.clear("A");n.noteKccReject("A",20,p(0),p(2));n.noteKccReject("A",22,p(0),p(2));n.newGoal("A");ok("new route",!n.noteKccReject("A",24,p(0),p(2)));
 n.clear("A");n.noteKccReject("A",20,p(0),p(2));n.noteKccReject("A",22,p(0),p(2));ok("stale veto",!n.noteKccReject("A",68,p(0),p(2)));
 for(let i=0;i<10;i++)n.noteStalled("A",70+i,p(0),p(i*3+2));ok("bounded",!n.avoids("A",80,p(0),p(2))&&n.avoids("A",80,p(0),p(29)));
 n.beginTick(80);n.beginTick(0);ok("round rewind",!n.avoids("A",80,p(0),p(29))&&n.rank("B",11,p(0),equal,[])[0].point.x===2);return out;
}
console.log(tests(F4PatrolNavigation));
