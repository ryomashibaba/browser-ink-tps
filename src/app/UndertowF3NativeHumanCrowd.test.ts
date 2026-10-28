import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../core/PerformanceStats';
import {RecastStageNavigation,initializeRecastNavigation}
 from '../navigation/RecastStageNavigation';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';
import {UndertowF3NativeHumanCrowd} from './UndertowF3NativeHumanCrowd';

beforeAll(async()=>{await initializeRecastNavigation();});
describe('F3C live human native Crowd life cycle',()=>{
 it('uses only actual grounded original-source human navigation, removes the passive agent midair and reattaches after landing',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const native=nav.closestPoint(new Vec3(...stage.metadata.teamASpawn));
  const human={x:native.x,y:native.y,z:native.z};
  const steering=new UndertowF3NativeHumanCrowd(nav,stage);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(()=>new UndertowF3NativeHumanCrowd(nav,PRODUCTION_STAGE_DEFINITION))
   .toThrow('T21_F3C_HUMAN_NATIVE_CROWD_NONPRODUCTION_ONLY');
  steering.syncActualPlayerFoot(human);
  expect(steering.snapshot.active).toBe(true);
  expect(steering.snapshot.attaches).toBe(1);
  // Genuine airborne Rapier feet are not a made-up grounded NavMesh slot.
  steering.syncActualPlayerFoot({...human,y:human.y+1.6});
  expect(steering.snapshot.active).toBe(false);
  expect(steering.snapshot.detaches).toBe(1);
  // Large landing displacement cannot be retroactively misclassified as
  // a sub-60Hz grounded stride: revalidate on the following fixed tick.
  steering.syncActualPlayerFoot(human);
  expect(steering.snapshot.active).toBe(false);
  steering.syncActualPlayerFoot(human);
  expect(steering.snapshot.active).toBe(true);
  expect(steering.snapshot.attaches).toBe(2);
  expect(steering.snapshot.playerFootMoved).toBe(false);
  expect(steering.snapshot.sourceNavmeshChanged).toBe(false);
  expect(steering.snapshot.fakeHumanPhysicalActors).toBe(0);
  // B280 reproduces the genuine B279 unsafe mid-descent physical HUMAN foot.
  // A matching Recast projection must NEVER substitute for actual Rapier
  // grounded authority; withhold only the eighth passive Crowd proxy.
  const realAirborneFoot={x:0.01658373326063156,
   y:6.200106029510498,z:55.496639251708984};
  steering.syncActualPlayerFoot(realAirborneFoot,false);
  expect(steering.snapshot.active).toBe(false);
  expect(steering.snapshot.detaches).toBe(2);
  expect(steering.snapshot.airborneOrUnverifiableTicks).toBeGreaterThanOrEqual(2);
  expect(steering.snapshot.playerFootMoved).toBe(false);
  expect(steering.snapshot.sourceNavmeshChanged).toBe(false);
  // Re-acquisition requires real stable grounded native KCC across steps,
  // not an immediate synthetic snap to a new original source location.
  steering.syncActualPlayerFoot(human,true);
  expect(steering.snapshot.active).toBe(false);
  steering.syncActualPlayerFoot(human,true);
  expect(steering.snapshot.active).toBe(true);
  expect(steering.snapshot.attaches).toBe(3);
  expect(steering.snapshot.productionAuthorized).toBe(false);
  steering.dispose();
  expect(steering.snapshot.active).toBe(false);
  expect(steering.snapshot.productionAuthorized).toBe(false);
 });
});
