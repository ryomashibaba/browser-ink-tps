import {describe,it,expect} from 'vitest';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {UNDERTOW_MODEL_XZ_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {b236InspectOriginalSlopeEntrance} from '../src/stage/undertow/B236OriginalSlope01IngressAudit';
import {UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT as PIN}
 from '../src/stage/undertow/UndertowSpillwayRemodelGeometryAudit';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
describe('B238 original-source sealed entry seeds',()=>{
 it('exports exact registered right-low polygon and original CI688 source upper edge',()=>{
  expect(ORIGINAL.solids).toHaveLength(25);
  expect(ORIGINAL.paintSurfaces).toHaveLength(17);
  expect(ORIGINAL.navigationLinks).toHaveLength(26);
  expect(ORIGINAL.activationReady).toBe(false);
  expect(PIN.source.fileBytes).toBe(43263289);
  expect(PIN.source.lfsOid).toBe(
   'sha256:a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046');
  const sides=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
   const right=UNDERTOW_MODEL_XZ_GEOMETRY.find(m=>
    m.id==='right-low-team-'+(side==='POSITIVE_Z'?'a':'b'));
   if(!right)throw Error('B238_FROZEN_CONTOUR_NOT_FOUND');
   const slope=b236InspectOriginalSlopeEntrance(side);
   expect(slope.closestRightLowPolygonToSlopeTopEdge.distanceMeters)
    .toBeCloseTo(4.219995886,3);
   expect(slope.originalSlopeTopY).toBeCloseTo(2.93,3);
   expect(right.sourceYProjectMeters).toBe(4.5);
   return {side,rightLowSourcePolygonProjectXZ:right.projectOuter,
    registeredRightLowProjectY:right.sourceYProjectMeters,
    authenticSlope01UpperSourceEdgeProjectXYZ:[
     slope.topOriginalEdgeA,slope.topOriginalEdgeB],
    originalSlopeObject:slope.slopeOriginalSourceObject,
    gapMeters:slope.closestRightLowPolygonToSlopeTopEdge.distanceMeters};
  });
  const payload={version:'B238_NATIVE_EXACT_SOURCE_SEAM_SEED_V1',
   sha256:PIN.source.lfsOid.slice(7),fileBytes:PIN.source.fileBytes,
   expectedOriginalActiveFaceCount:PIN.source.activeCommonPlusTurfFaceCount,
   transform:PIN.registration,sides,
   sourceOnly:true,runtimePromotionAuthorized:false,
   certifiedCrossings:'0/12',originalStage:'25/17/26/0'};
  const path=process.env.T21_B238_SEED_OUTPUT;
  if(path){mkdirSync(dirname(path),{recursive:true});
   writeFileSync(path,JSON.stringify(payload,null,2));}
  console.log('B238_PINNED_ORIGINAL_SEAM_SEEDS',
   JSON.stringify({sha256:payload.sha256,sideCounts:sides.map(s=>({
    side:s.side,polygonVertices:s.rightLowSourcePolygonProjectXZ.length,
    authenticOriginalSeamGapMeters:s.gapMeters})),actualPinnedObjWasRead:false,
    producedSeed:!!path,certifiedCrossings:'0/12',productionAuthorized:false}));
 });
});
