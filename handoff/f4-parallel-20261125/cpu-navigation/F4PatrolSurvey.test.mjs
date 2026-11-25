import {F4PatrolSurvey} from './F4PatrolSurvey.mjs';
function test(S){
 const s=new S(),w=100,cs=.125,paint=1,wall=4,neutral=0,team=1;
 const surface={cellSize:cs,widthCells:w,heightCells:w,widthMeters:w*cs,heightMeters:w*cs,baseFlags:paint,normal:{y:1},flagsGrid:new Uint16Array(w*w).fill(paint),ownerGrid:new Int8Array(w*w)};
 const out=[];const ok=(n,b)=>{if(!b)throw Error(n);out.push(n);};const propose=(id,t,rec=false)=>s.propose(id,t,surface,6.25,6.25,team,paint,wall,neutral,rec);
 const a=propose("A1",0);ok("unpainted candidate shortlist",a.length===4);ok("within surface",a.every(p=>p.u>=0&&p.u<12.5&&p.v>=0&&p.v<12.5));ok("cadence",propose("A1",89).length===0);ok("expiry",propose("A1",90).length>0);ok("actor independence",propose("B1",90).length>0);
 surface.ownerGrid.fill(team);ok("no redundant own paint patrol",propose("A2",0).length===0);ok("low resources favor own",propose("A3",0,true).length>0);
 surface.ownerGrid.fill(2);ok("enemy paint can be reclaimed",propose("A4",0).length>0);ok("not recovery on enemy ink",propose("A5",0,true).length===0);
 surface.flagsGrid.fill(0);ok("inactive cells excluded",propose("B2",0).length===0);surface.flagsGrid.fill(paint|wall);ok("wall cells excluded",propose("B3",0).length===0);
 surface.flagsGrid.fill(paint);surface.normal.y=.1;ok("vertical surface excluded",propose("B4",0).length===0);surface.normal.y=1;
 s.clear("A1");ok("respawn clears cadence",propose("A1",1).length>0);s.beginTick(100);s.beginTick(0);ok("round rewind clears",propose("A1",0).length>0);
 const edge=s.propose("C",0,surface,.1,.1,team,paint,wall,neutral,false);ok("edge no wrap",edge.every(p=>p.u>=0&&p.v>=0&&p.u<12.5&&p.v<12.5));
 return out;
}
console.log(test(F4PatrolSurvey));
