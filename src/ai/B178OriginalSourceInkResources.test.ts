import {Vec3} from 'playcanvas';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {defineTestSurfaces} from '../stage/TestStage';
import {undertowT21dConnectivityQaStage} from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UndertowPhase14QSharedActorCollision} from '../stage/undertow/UndertowPhase14QSharedActorCollision';
import {beforeAll,describe,it,expect} from 'vitest';
import {b178FootMask,b178FootRelation,b178SampleRegisteredSourceFoot} from './B178OriginalSourceInkResources';
import {CpuAgentSystem} from './CpuAgentSystem';
import {originalSourceRegisteredOwnFoot} from '../app/OriginalSourceCombatRetreat';
import {PaintSource,PaintEventType,SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSample} from '../ink/GameplayInkSystem';
const ink=(owner:Team,flags=SurfaceFlags.Paintable)=>
 ({owner,surface:{isScoreable:(flags&SurfaceFlags.Scoreable)!==0,
  baseFlags:flags}} as unknown as GameplayInkSample);
beforeAll(async()=>{await initializeRapier();});
describe('B178 actual original non-scoring ink resource policy',()=>{
 it('preserves all production Scoreable ownership selectors',()=>{
  expect(b178FootMask(false)).toBe(SurfaceFlags.Scoreable);
  expect(b178FootRelation(ink(Team.A),Team.A,false)).toBe('OWN');
  expect(b178FootRelation(ink(Team.B),Team.A,false)).toBe('ENEMY');
  expect(b178FootRelation(null,Team.A,false)).toBe('NEUTRAL');
 });
 it('explicit source lab accepts genuine original paintable ownership',()=>{
  expect(b178FootMask(true)).toBe(SurfaceFlags.Paintable);
  expect(b178FootRelation(ink(Team.A),Team.A,true)).toBe('OWN');
  expect(b178FootRelation(ink(Team.B),Team.A,true)).toBe('ENEMY');
  expect(b178FootRelation(ink(Team.Neutral),Team.A,true)).toBe('NEUTRAL');
 });
 it('never derives a resource from an unauthorized scored/wall surface',()=>{
  for(const flags of [
   SurfaceFlags.Paintable|SurfaceFlags.Scoreable,
   SurfaceFlags.Paintable|SurfaceFlags.Wall,SurfaceFlags.Floor
  ])expect(()=>b178FootRelation(ink(Team.A,flags),Team.A,true))
   .toThrow('B178_UNTRUSTED_SCOREABLE_OR_NONPAINTABLE_SOURCE_FOOT');
 });
 it('selected original SOURCE walking never creates unpaid CPU foot paint; legacy mode remains unchanged',()=>{
  const requests:{type:PaintEventType;surfaceId:string}[]=[];
  const stage=undertowT21dConnectivityQaStage();
  const p=stage.paintSurfaces[0]!;
  const actor={
   id:'A1',team:Team.A,position:new Vec3(0,3,42)
  };
  const run=(selectedSourceRecovery:boolean)=>{
   const cpu=Object.create(CpuAgentSystem.prototype) as any;
   cpu.b178RealSourceInkRecovery=selectedSourceRecovery;
   cpu.phase14qF2RecoverableSteps=true;
   cpu.stage=stage;
   cpu.samplePoint=new Vec3();
   cpu.stats={cpuPaintRequests:0};
   cpu.coordinator={enqueue:(req:typeof requests[number])=>
    requests.push(req)};
   cpu.sampleRegisteredSourceFoot=()=>({
    surface:{id:p.id},u:.3,v:.3
   });
   cpu.paintAtBot(actor);
   return cpu.stats.cpuPaintRequests as number;
  };
  expect(run(true)).toBe(0);
  expect(requests).toHaveLength(0);
  expect(run(false)).toBe(1);
  expect(requests).toEqual([{type:PaintEventType.Foot,
   surfaceId:p.id}].map(({type,surfaceId})=>expect.objectContaining({
    type,surfaceId
   })));
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
 });
 it.each(['positive-z','negative-z'])(
  'reads the registered %s Rapier ramp cell instead of neighboring OWN ink',
  side=>{
   const stage=undertowT21dConnectivityQaStage();
   const physics=new RapierStagePhysics(1/60,stage);physics.step();
   const gameplay=new GameplayInkSystem();
   const surfaces=defineTestSurfaces(gameplay,stage);
   const collision=new UndertowPhase14QSharedActorCollision(physics,stage,true);
   try{
    const id='UndertowT21D:right-low-route-ramp-'+side;
    const surface=surfaces.find(p=>p.id===id+':paint')!;
    // Unit fixture on the actual frozen source ramp, not a live actor move.
    const point=surface.localToWorld(surface.widthMeters*.5,
     16*surface.cellSize+.005).sub(surface.normal.clone().mulScalar(.002));
    const foot=point.clone().add(new Vec3(0,.1,0));
    collision.syncRealCpuFoot('A1',foot);
    const support=collision.sourceFootSupport('A1',foot);
    expect(support?.solidId).toBe(id);
    const actual=surface.projectWorldPoint(support!.point);
    const raised=surface.projectWorldPoint(foot.clone().add(new Vec3(0,.1,0)));
    const cell=surface.cellSize,x=Math.floor(actual.u/cell);
    const row=Math.floor(actual.v/cell),wrongRow=Math.floor(raised.v/cell);
    expect(wrongRow).not.toBe(row);
    for(const [y,team] of [[row,Team.B],[wrongRow,Team.A]] as const)
     gameplay.apply({tick:1,source:PaintSource.Debug,team,
      surfaceId:surface.id,centerU:(x+.5)*cell,centerV:(y+.5)*cell,
      radiusU:cell*.45,radiusV:cell*.45,angle:0,
      type:PaintEventType.Debug,strength:1});
    expect(gameplay.sampleWorld(foot.clone().add(new Vec3(0,.1,0)),
     .48,SurfaceFlags.Paintable,SurfaceFlags.Wall)?.owner).toBe(Team.A);
    const sampled=b178SampleRegisteredSourceFoot(gameplay,stage.paintSurfaces,support);
    expect(sampled?.surface.id).toBe(surface.id);
    expect(sampled?.owner).toBe(Team.B);
    expect(sampled?.v).toBeCloseTo(actual.v,5);
    expect(b178FootRelation(sampled,Team.A,true)).toBe('ENEMY');
    // The nearest elevated OWN cell is NOT recovery ink for a CPU whose
    // actual Rapier foot is supported by the ENEMY row on this ramp.
    expect(originalSourceRegisteredOwnFoot(
     gameplay,stage,physics,foot,Team.A)).toBe(false);
    expect(originalSourceRegisteredOwnFoot(
     gameplay,stage,physics,foot,Team.B)).toBe(true);
    // Real same-backing ownership may authorize a recovery preference;
    // the test grants no synthetic movement, HP or official score.
    gameplay.apply({tick:2,source:PaintSource.Debug,team:Team.A,
     surfaceId:surface.id,centerU:(x+.5)*cell,centerV:(row+.5)*cell,
     radiusU:cell*.45,radiusV:cell*.45,angle:0,
     type:PaintEventType.Debug,strength:1});
    expect(originalSourceRegisteredOwnFoot(
     gameplay,stage,physics,foot,Team.A)).toBe(true);
    expect(originalSourceRegisteredOwnFoot(
     gameplay,stage,physics,foot.clone().add(new Vec3(0,3,0)),
     Team.A)).toBe(false);
    expect(b178SampleRegisteredSourceFoot(gameplay,[],support)).toBeNull();
    expect(b178SampleRegisteredSourceFoot(gameplay,stage.paintSurfaces,null)).toBeNull();
    expect(collision.sourceFootSupport('B4',foot)).toBeNull();
    expect(collision.sourceFootSupport('A1',foot.clone().add(new Vec3(.1,0,0))))
     .toBeNull();
    collision.removeRealCpuFoot('A1');
    expect(collision.sourceFootSupport('A1',foot)).toBeNull();
    expect(stage.solids).toHaveLength(25);
    expect(stage.paintSurfaces).toHaveLength(17);
    expect(stage.navigationLinks).toHaveLength(26);
    expect(gameplay.snapshot().areaA).toBe(0);
    expect(gameplay.snapshot().areaB).toBe(0);
   }finally{physics.world.free();}
  });

});
