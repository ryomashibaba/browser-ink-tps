import {F4PatrolNavigation} from './F4PatrolNavigation.mjs';
function runTests(N){
 const n=new N(), p=(x,y=0,z=0)=>({x,y,z}), row=(x,ink,order=0,y=0)=>({point:p(x,y),ink,order,index:order});
 const checks=[];const check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
 n.noteStalled("A",10,p(0),p(2));
 check("stalled endpoint rejected",n.avoids("A",11,p(.2),p(2.5)));
 check("different actor unaffected",!n.avoids("B",11,p(0),p(2)));
 check("other floor unaffected",!n.avoids("A",11,p(0,3),p(2,3)));
 check("different origin unaffected",!n.avoids("A",11,p(4),p(2)));
 check("expiry exact",!n.avoids("A",190,p(0),p(2))&&n.avoids("A",189,p(0),p(2)));
 check("clock rewind ignored",!n.avoids("A",9,p(0),p(2)));
 check("rank excludes stalled",n.rank("A",11,p(0),[row(2,"NEUTRAL"),row(-2,"OWN")],[])[0].point.x===-2);
 check("neutral favored over own",n.rank("B",11,p(0),[row(2,"OWN"),row(-2,"NEUTRAL",1)],[])[0].point.x===-2);
 check("unknown not neutral",n.rank("B",11,p(0),[row(2,"UNKNOWN"),row(-2,"NEUTRAL",1)],[])[0].point.x===-2);
 check("ally spread",n.rank("B",11,p(0),[row(2,"NEUTRAL"),row(-2,"NEUTRAL",1)],[p(2)])[0].point.x===-2);
 check("vertical ally ignored",n.rank("B",11,p(0),[row(2,"NEUTRAL"),row(-2,"NEUTRAL",1)],[p(2,3)])[0].point.x===2);
 check("invalid candidate and zero motion rejected",n.rank("B",11,p(0),[row(NaN,"NEUTRAL"),row(0,"NEUTRAL")],[]).length===0);
 n.clear("A");check("respawn reset",!n.avoids("A",11,p(0),p(2)));
 for(let i=0;i<10;i++)n.noteStalled("A",20+i,p(0),p(i*3+2));
 check("history bounded",!n.avoids("A",30,p(0),p(2))&&n.avoids("A",30,p(0),p(29)));
 return checks;
}
console.log(runTests(F4PatrolNavigation));
