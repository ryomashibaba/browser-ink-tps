import {beforeAll,describe,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {PerformanceStats} from '../../core/PerformanceStats';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';

const R=.285;
const offsets:readonly (readonly [number,number])[]=[
 [0,0],[.82,0],[-.82,0],[0,.82],[0,-.82],
 [.82,.82],[.82,-.82],[-.82,.82],[-.82,-.82],
 [1.64,0],[-1.64,0],[0,1.64],[0,-1.64],
 [1.64,.82],[1.64,-.82],[-1.64,.82],[-1.64,-.82],
 [.82,1.64],[-.82,1.64],[.82,-1.64],[-.82,-1.64],
 [1.64,1.64],[-1.64,1.64],[1.64,-1.64],[-1.64,-1.64]
];
const original=[ [0,0],[R,0],[-R,0],[0,R],[0,-R],
 [R*.72,R*.72],[-R*.72,-R*.72] ] as const;
const ring=[ [0,0] as const,
 ...Array.from({length:16},(_,i)=>{
 const a=i*Math.PI/8;return [R*Math.cos(a),R*Math.sin(a)] as const;
 })] as const;

describe('Issue #13 actual Rapier/Recast spawn false-negative isolation',()=>{
 beforeAll(async()=>await Promise.all([initializeRapier(),initializeRecastNavigation()]));
 it('isolates the gate that rejected 25 original candidate offsets without adding source authority',()=>{
 const stage=undertowT21dConnectivityQaStage(),phys=new RapierStagePhysics(1/60,stage);
 phys.step();
 const nav=new RecastStageNavigation(stage,new PerformanceStats());
 for(const [side,start] of [['positive-z',stage.metadata.teamASpawn],
  ['negative-z',stage.metadata.teamBSpawn]] as const){
 const floorId='UndertowT21D:spawn-high-'+side;
 const origin=nav.auditNavMeshProjection(new Vec3(...start));
 const base=origin.nearestPoint;
 if(!base)throw Error('SOURCE_DIAG_ORIGINAL_NAV_MISSING_'+side);
 let counts={projection:0,old7:0,new17:0,old7and17:0,nativeBoth:0,
  strictAll:0},candidates:unknown[]=[];
 const supported=(x:number,y:number,z:number,kind:'old'|'new')=>{
  const probes=kind==='old'?original:ring;
  const reasons:string[]=[];
  for(let i=0;i<probes.length;i++){
   const [ox,oz]=probes[i]!;
   const hit=kind==='old'
    ?phys.castStageSegment(new Vec3(x+ox,y+.7,z+oz),
      new Vec3(x+ox,y-.7,z+oz),'ink-projectile')
    :phys.castCharacterFootSupport(new Vec3(x+ox,y,z+oz),0,'HUMAN');
   if(hit?.solidId!==floorId||
     kind==='new'&&hit!==null&&Math.abs(hit.point.y-y)>.08)
    reasons.push(i+':'+(hit?.solidId??'MISS')+'@'+(hit?.point.y??'null'));
  }
  return reasons;
 };
 for(let i=0;i<offsets.length;i++){
  const [ox,oz]=offsets[i]!;
  const want=new Vec3(base.x+ox,base.y,base.z+oz);
  const projected=nav.auditNavMeshProjection(want);
  const point=projected.nearestPoint;
  const snapped=projected.success&&point!==null&&projected.distanceMeters!==null&&
    projected.distanceMeters<=.16&&Math.abs(point.y-base.y)<=.11;
  if(!snapped)continue;
  counts.projection++;
  const badOld=supported(point!.x,point!.y,point!.z,'old'),
    badNew=supported(point!.x,point!.y,point!.z,'new');
  if(!badOld.length)counts.old7++;
  if(!badNew.length)counts.new17++;
  if(!badOld.length&&!badNew.length)counts.old7and17++;
  const path1=nav.auditPath(new Vec3(base.x,base.y,base.z),new Vec3(point!.x,point!.y,point!.z),.16);
  const path2=nav.auditPath(new Vec3(point!.x,point!.y,point!.z),new Vec3(base.x,base.y,base.z),.16);
  const valid=(r:typeof path1,to:{x:number;y:number;z:number})=>{
   const t=r.nativePathPoints[r.nativePathPoints.length-1];
   return r.querySuccess&&r.reachedTarget&&t!==undefined&&
    r.startSnapDistanceMeters<=.16&&r.endSnapDistanceMeters<=.16&&
    r.endpointErrorMeters<=.16&&
    Math.hypot(t.x-to.x,t.y-to.y,t.z-to.z)<=.16&&
    r.nativePathPoints.every(p=>Math.abs(p.y-base.y)<=.11);
  };
  const both=valid(path1,point!)&&valid(path2,base);
  if(both)counts.nativeBoth++;
  if(both&&!badNew.length)counts.strictAll++;
  if(i<8||!badOld.length&&candidates.length<18){
    candidates.push({
      i,point:[point!.x,point!.y,point!.z],old7Errors:badOld,
      new17Errors:badNew.slice(0,6),
      firstNative:{query:path1.querySuccess,reached:path1.reachedTarget,
       n:path1.pointCount,startSnap:path1.startSnapDistanceMeters,
       endSnap:path1.endSnapDistanceMeters,error:path1.endpointErrorMeters,
       y:path1.nativePathPoints.map(p=>p.y).slice(0,6)},
      reverseNative:{query:path2.querySuccess,reached:path2.reachedTarget,
       n:path2.pointCount,startSnap:path2.startSnapDistanceMeters,
       endSnap:path2.endSnapDistanceMeters,error:path2.endpointErrorMeters,
       y:path2.nativePathPoints.map(p=>p.y).slice(0,6)}
    });
  }
 }
 console.log('ISSUE13_REAL_SOURCE_GATES',JSON.stringify({side,
  sourceStart:start,nativeOrigin:base,originProjectionDistance:origin.distanceMeters,
  counts,candidates}));
 }
 });
});