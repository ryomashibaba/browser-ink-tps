// Provisional AI only. Chooses real controls; never writes HP, geometry, paint or score.
const ranges=Object.freeze({ultraShot:[2,24],chariot:[2,17],blower:[2,12],greatBarrier:[0,7],waveBreaker:[0,7],microLaser:[2,18],tripleTornado:[3,11],ultraStamp:[0,14]});
const minTime=Object.freeze({ultraShot:100,chariot:140,blower:420,greatBarrier:50,waveBreaker:110,microLaser:110,tripleTornado:120,ultraStamp:85});
// Reuse the actual tactical envelope, not the generic 32m kit sight.
export function cpuSpecialSightRange(special){return ranges[special]?.[1]??32;}
export function cpuSpecialDecisionDue(id,tick){
 const phase=[...id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%12;
 return Number.isInteger(tick)&&tick>=0&&tick<10800&&tick%12===phase
}
// Low ballistic arc, solved using the existing launch speed/gravity.
// Null means there is no finite feasible flight in the executor's lifetime.
export function cpuSpecialLob(direction,distance,speed,gravity,lifetime){
 if(!direction||![...direction,distance,speed,gravity,lifetime].every(Number.isFinite)||distance<=0||speed<=0||gravity<=0||lifetime<=0)return null;
 const [dx,dy,dz]=direction,h=Math.hypot(dx,dz);
 if(h<1e-5)return null;
 const len=Math.hypot(dx,dy,dz),x=distance*h/len,y=distance*dy/len,v2=speed*speed;
 const disc=v2*v2-gravity*(gravity*x*x+2*y*v2);
 if(disc<0)return null;
 const theta=Math.atan2(v2-Math.sqrt(disc),gravity*x),c=Math.cos(theta);
 if(c<=0||x/(speed*c)>lifetime)return null;
 return [dx/h*c,Math.sin(theta),dz/h*c]
}
export class F4CpuSpecialTactics {
 #state=new Map();
 reset(){this.#state.clear()}
 cancel(id){this.#state.delete(id)}
 accepted(id,lifeId,special,tick){
  this.#state.set(id,{lifeId,special,start:tick,rollUntil:-1,nextRoll:tick,throwAt:null,released:false})
 }
 choose({id,lifeId,special,tick,active,ready,canStart,grounded,hp,ink,recentHit,distance,direction}){
  const neutral={request:false,trigger:false,cannon:false,holdThrow:false,releaseThrow:false,lob:null,reason:'WAIT'};
  const range=ranges[special];
  if(!range||!Number.isInteger(tick)||tick<0||tick>=10800||!Number.isFinite(hp)||hp<=0)return neutral;
  const visible=Number.isFinite(distance)&&distance>=0;
  const near=visible&&distance<=range[1]&&distance>=range[0];
  const low=hp<=40,threat=recentHit===true,remaining=10800-tick;
  const lob=(speed,g,life)=>visible?cpuSpecialLob(direction,distance,speed,g,life):null;
  let row=this.#state.get(id);
  if(row&&(row.lifeId!==lifeId||row.special!==special||!active)){this.#state.delete(id);row=null}
  let request=false;
  if(!active){
   // A genuine recent HP hit may justify a defensive deployment even
   // after the enemy has gone behind cover. Existing physical placement
   // still has to succeed before gauge consumption; no unseen attack aim.
   const defensive=!visible&&low&&threat&&(special==='greatBarrier'||special==='waveBreaker');
   if(!ready||!canStart||!grounded||(!visible&&!defensive)||remaining<minTime[special])return neutral;
   switch(special){
    case 'greatBarrier':request=defensive||near&&(low||threat||distance<=3.5);break;
    case 'waveBreaker':request=defensive||near;break;
    case 'blower':request=near&&(threat||distance<=7);break;
    case 'tripleTornado':request=near&&lob(12,12,2.1)!==null;break;
    case 'chariot':request=near&&(distance>=4||low||ink<25);break;
    case 'ultraStamp':request=near&&(distance<=2.2||lob(23,8,1.45)!==null);break;
    default:request=near;
   }
   if(!request)return neutral;
  }
  if(active&&!row)return {...neutral,reason:'ACTIVE_WITHOUT_CPU_ADMISSION'};
  const age=row?tick-row.start:0;
  const out={...neutral,request,reason:request?'ADMIT':'ACTIVE'};
  switch(special){
   case 'ultraShot':out.trigger=near;break;
   case 'chariot':{
    if(row&&tick>=row.nextRoll&&low&&threat&&visible&&distance<3){
     row.rollUntil=tick+24;row.nextRoll=tick+90;
    }
    const roll=!!row&&tick<row.rollUntil;
    out.holdThrow=roll;
    if(!roll&&near){
     const arc=distance>=8?lob(21,4,1.15):null;
     out.cannon=arc!==null;out.lob=arc;out.trigger=!out.cannon;
    }
    break
   }
   case 'blower':out.trigger=age<380||near;break;
   case 'greatBarrier':case 'waveBreaker':out.trigger=grounded;break;
   case 'microLaser':out.trigger=near;break;
   case 'tripleTornado':out.lob=near?lob(12,12,2.1):null;out.trigger=out.lob!==null;break;
   case 'ultraStamp':{
    if(row&&row.throwAt!==null){
     // The physical throw is delayed after release; keep supplying only fresh feasible aim.
     out.lob=near?lob(23,8,1.45):null;
     if(!row.released&&tick>=row.throwAt&&out.lob){row.released=true;out.releaseThrow=true}
     else if(!row.released)out.holdThrow=true;
    }else if(row&&near&&distance>2.2&&age>=18&&age<410&&lob(23,8,1.45)){
     row.throwAt=tick+18;out.holdThrow=true;out.lob=lob(23,8,1.45);
    }else out.trigger=near&&distance<=2.2;
    break
   }
  }
  return out
 }
}
