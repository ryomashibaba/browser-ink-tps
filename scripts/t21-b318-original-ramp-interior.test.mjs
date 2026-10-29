import test from 'node:test';
import assert from 'node:assert/strict';
import {b318NativeOriginalRampInterior,b318OriginalQuadPlanarSignedMargin}
 from './t21-b318-original-ramp-interior.mjs';
const quad={id:'right-low-route-ramp-positive-z',
 sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
 vertices:[
 [8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
 [4.142941,3,54.257493],[.855934,3,47.552619]]};
const first=[.1367405802,3.8948045,48.73594284];
test('B318 original quadrilateral interior target is not corner, camera-guided only',()=>{
 const p=b318NativeOriginalRampInterior({quad,body:first,yaw:104.94});
 assert.equal(p.candidate?.safe,true);
 assert.ok(Math.abs(p.candidate.targetSourceInteriorPoint[0]-1.932)<.01);
 assert.ok(Math.abs(p.candidate.targetSourceInteriorPoint[2]-48.688)<.01);
 assert.equal(p.candidate.physicallyCertified,false);
 const inside=b318OriginalQuadPlanarSignedMargin(quad,p.candidate.targetSourceInteriorPoint);
 assert.equal(inside.originalQuadInsideXZ,true);
 assert.ok(inside.signedOriginalRampMarginMeters>.3);
});
test('B318 B317 recorded physical KCC route was only tangent then outside ramp polygon',()=>{
 const poses=[
 [.5666424036,3.8951232,48.1925316],
 [.844697833,3.8952798,47.7532501],
 [.90251249,3.9297812,47.5287933],
 [1.0137733221,3.9442794,47.2753983]];
 const checks=poses.map(p=>b318OriginalQuadPlanarSignedMargin(quad,p));
 assert.ok(checks.every(x=>x.originalQuadInsideXZ===false));
 assert.ok(checks[2].signedOriginalRampMarginMeters>-.005);
 assert.ok(checks[3].signedOriginalRampMarginMeters<-.17);
 assert.ok(checks.every(x=>!x.certifiedWalkRoute));
});
test('reject source identity mismatch and unseen fake mesh',()=>{
 assert.throws(()=>b318NativeOriginalRampInterior({
  quad:{...quad,id:'invented-ramp'},body:first,yaw:104.94}));
 assert.throws(()=>b318NativeOriginalRampInterior({
  quad:{...quad,vertices:quad.vertices.slice(1)},body:first,yaw:104.94}));
});
