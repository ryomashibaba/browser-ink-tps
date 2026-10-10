import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
import {UNDERTOW_T21_PHASE12H_SOURCE_CONTACT_EVIDENCE as CONTACTS,
 UNDERTOW_T21_PHASE12H_CONTACT_SUMMARY as SUMMARY,
 undertowT21Phase12HOriginalContactErrors} from '../src/stage/undertow/UndertowSpillwayPhase12HSourceContactEvidence';
type Point=readonly [number,number,number];
type SourceHit={originalFaceIndex:number;sourceMaterial:string;
 sourceContactXYZ:[Point,Point];sourceSegmentParameters:[number,number];
 contactClass:string};
type Boundary={sourceOriginalMinFace:number;sourceBoundaryEdgeIndex:number;
 originalProjectEndpointXYZ:[Point,Point];edgeLengthMeters:number;
 firstEightExactGeometrySourceContacts:{originalFaceIndex:number;sourceMaterial:string;
 contact:SourceHit|null}[]};
type Ledger={version:string;originalSourceSHA256:string;perBoundary:Boundary[];
 reviewOnly:true;runtimePromotionAuthorized:false};
function sameBits(a:readonly number[],b:readonly number[]):boolean{
 if(a.length!==b.length)return false;
 const x=Buffer.alloc(8*a.length),y=Buffer.alloc(8*b.length);
 for(let i=0;i<a.length;i++){x.writeDoubleLE(a[i]!,i*8);y.writeDoubleLE(b[i]!,i*8);}
 return x.equals(y);
}
describe('T21 Phase12H exact original metal/glass source intersection 3D review',()=>{
 it('keeps T20/T21 authority and original source inventory frozen',()=>{
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
   expect(UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES).toHaveLength(4);
   expect(SUMMARY).toMatchObject({sourceOriginalFullPieces:2,sourceBoundaryEdges:2,
     originalMetalContactPoints:2,originalGlassContactPoints:2,
     totalOriginalSourceContactsRendered:4,phase12GAllTriangleContactRecords:47,
     defaultVisible:false,sourceOnly:true,runtimePromotionAuthorized:false,gameplayAuthority:'NONE'});
   expect(undertowT21Phase12HOriginalContactErrors()).toEqual([]);
 });
 it('matches four exact original Face ID, t, projected XYZ and both source-edge endpoints with pinned Phase12G report',()=>{
   const path=process.env.T21_PHASE12G_CONTACT_JSON;
   if(!path)return;
   if(!existsSync(path))throw Error('Mandatory original 43MB pinned Phase12G result missing');
   const s=JSON.parse(readFileSync(path,'utf8')) as Ledger;
   expect(s.version).toBe('T21_PHASE12G_EXACT_SOURCE_SEGMENT_TRIANGLE_CONTACT_V1');
   expect(s.originalSourceSHA256).toBe(SUMMARY.sourceSHA256);
   expect(s.reviewOnly).toBe(true);expect(s.runtimePromotionAuthorized).toBe(false);
   expect(CONTACTS).toHaveLength(2);
   for(const [i,contact] of CONTACTS.entries()){
     const ref=s.perBoundary.find(x=>
       x.sourceOriginalMinFace===contact.originalSourceMinFace&&
       x.sourceBoundaryEdgeIndex===contact.sourceBoundaryEdgeIndex);
     expect(ref).toBeDefined();
     expect(ref!.edgeLengthMeters).toBeCloseTo(contact.originalSourceBoundaryLengthMeters,12);
     for(let j=0;j<2;j++)expect(sameBits(ref!.originalProjectEndpointXYZ[j]!,
       contact.sourceOriginalProjectEndpointXYZ[j]!)).toBe(true);
     const originalPiece=UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES.find(
       x=>x.originalMinFace===contact.originalSourceMinFace);
     expect(originalPiece).toBeDefined();
     const originalVertices=new Set(originalPiece!.vertices.map(x=>x.join(',')));
     expect(contact.sourceOriginalProjectEndpointXYZ.every(x=>
       originalVertices.has(x.join(',')))).toBe(true);
     expect(contact.side).toBe(i===0?'NEGATIVE_Z':'POSITIVE_Z');
     expect(contact.sourceContactEvidence).toHaveLength(2);
     for(const originalHit of contact.sourceContactEvidence){
       const exact=ref!.firstEightExactGeometrySourceContacts.find(x=>
         x.originalFaceIndex===originalHit.originalFaceIndex);
       expect(exact).toBeDefined();expect(exact!.contact).not.toBeNull();
       expect(exact!.sourceMaterial).toBe(originalHit.originalSourceMaterial);
       expect(exact!.contact!.contactClass).toBe('SOURCE_POINT_PLANE_INTERSECTION');
       expect(sameBits(exact!.contact!.sourceContactXYZ[0]!,
         originalHit.originalContactProjectXYZ)).toBe(true);
       expect(sameBits(exact!.contact!.sourceContactXYZ[1]!,
         originalHit.originalContactProjectXYZ)).toBe(true);
       expect(sameBits(exact!.contact!.sourceSegmentParameters,
          [originalHit.sourceContactFraction,originalHit.sourceContactFraction])).toBe(true);
     }
   }
 });
 it('review marker root defaults OFF and optional two Chrome captures cannot approve gameplay',()=>{
   const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
   const cap=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
   expect(app).toContain("this.phase12HContactRoot.enabled=false;");
   expect(app).toContain("this.canvas.dataset.t21ReviewPhase12HContacts='off';");
   expect(app).toContain("private focusPhase12HSourceContacts(face:number):void");
   expect(app).toContain("this.canvas.dataset.t21ReviewPreset='PHASE12H_SOURCE_CONTACTS_ONLY';");
   expect(cap).toContain('phase12HOriginalContactDiagnostics=[]');
   expect(cap).toContain("for(const face of [60006,61728])");
   expect(cap).toContain("authorizesVisualFreeze:false,gameplayAuthority:'NONE'");
 });
});
