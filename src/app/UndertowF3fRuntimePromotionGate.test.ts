import {describe,it,expect} from 'vitest';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {auditF3fRuntimePromotionGate} from './UndertowF3fRuntimePromotionGate';
describe('F3F explicit unbridgeable route gate',()=>{
 it('does not confuse static original OBJ source faces with game-authorized bridges',()=>{
  const g=auditF3fRuntimePromotionGate(undertowT21dConnectivityQaStage());
  expect(g.originalSourceVisualOnlyMeshes).toBeGreaterThan(95);
  expect(g.originalVerifiedStaticRouteStudySegments).toBe(8);
  expect(g.experimentalRecastPointCount).toBe(2);
  expect(g.experimentalRecastEndpointErrorMeters).toBeCloseTo(31.71622721122581,7);
  expect(g.originalNativeWalkableActorBridgeCreated).toBe(false);
  expect(g.sourcePromotionBlocked).toBe(true);
  expect([g.physSolids,g.inkSurfaces,g.sourceNavigationLinks]).toEqual([25,17,26]);
  expect(g.scoreMaskPromoted).toBe(false);
 });
});
