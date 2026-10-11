import type {StageVector3} from '../StageDefinition';

/** T21 Phase12H: four exact original source-only metal/glass crossings.
 * Original 3D vertices (unshifted) from SHA-pinned Temple01 Phase12G,
 * original minfaces 60006 and 61728, original boundary #2 (Y 5.5).
 *
 * These are CONTACTS, not welded original OBJ-ID edges and NOT gameplay
 * walkability, collision, navigation, glass penetration, paint, or scoring.
 */
export const UNDERTOW_T21_PHASE12H_SOURCE_CONTACT_EVIDENCE=[
 {
  originalSourceMinFace:60006,
  sourceBoundaryEdgeIndex:2,
  side:'NEGATIVE_Z',
  sourceOriginalProjectEndpointXYZ:[
   [9.410674967725067,5.5,-13.580667773556655],
   [8.919962606873996,5.5,-13.74852308547802]
  ],
  originalSourceBoundaryLengthMeters:0.5186270594871131,
  sourceContactEvidence:[
   {kind:'WALL_METAL',originalFaceIndex:35412,
    originalSourceMaterial:'Fld_Temple01_WallMetal00',
    sourceContactFraction:0.43438914027149556,
    originalContactProjectXYZ:[9.197514847174375,5.5,-13.65358229819218]},
   {kind:'GLASS_BODY',originalFaceIndex:35648,
    originalSourceMaterial:'Fld_Temple01_Glass01',
    sourceContactFraction:0.7171945701357494,
    originalContactProjectXYZ:[9.058738727024185,5.5,-13.7010526918351]}
  ]
 },
 {
  originalSourceMinFace:61728,
  sourceBoundaryEdgeIndex:2,
  side:'POSITIVE_Z',
  sourceOriginalProjectEndpointXYZ:[
   [-9.181306679196902,5.5,13.775232069013482],
   [-8.690594318345834,5.5,13.943087380934843]
  ],
  originalSourceBoundaryLengthMeters:0.5186270594871102,
  sourceContactEvidence:[
   {kind:'WALL_METAL',originalFaceIndex:35414,
    originalSourceMaterial:'Fld_Temple01_WallMetal00',
    sourceContactFraction:0.4343891402714977,
    originalContactProjectXYZ:[-8.96814655864621,5.5,13.848146593649005]},
   {kind:'GLASS_BODY',originalFaceIndex:35650,
    originalSourceMaterial:'Fld_Temple01_Glass01',
    sourceContactFraction:0.7171945701357494,
    originalContactProjectXYZ:[-8.829370438496023,5.5,13.895616987291925]}
  ]
 }
] as const;

export const UNDERTOW_T21_PHASE12H_CONTACT_SUMMARY=Object.freeze({
 sourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
 sourceOriginalFullPieces:2,sourceBoundaryEdges:2,originalMetalContactPoints:2,
 originalGlassContactPoints:2,totalOriginalSourceContactsRendered:4,
 phase12GAllTriangleContactRecords:47,
 allOtherRegistered124SourceMeshesRemainUnchanged:true,
 defaultVisible:false as const,sourceOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});

export function undertowT21Phase12HOriginalContactErrors():readonly string[]{
 const errors:string[]=[];
 const pairs=UNDERTOW_T21_PHASE12H_SOURCE_CONTACT_EVIDENCE;
 if(pairs.length!==2||pairs[0].originalSourceMinFace!==60006||
    pairs[1].originalSourceMinFace!==61728)errors.push('Wrong Phase12H source pair identity');
 for(const e of pairs){
   const [a,b]=e.sourceOriginalProjectEndpointXYZ;
   const length=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
   if(Math.abs(length-e.originalSourceBoundaryLengthMeters)>1e-11||e.sourceContactEvidence.length!==2)
     errors.push('Phase12H wrong original short boundary');
   const seen=new Set<string>();
   for(const c of e.sourceContactEvidence){
     if(seen.has(c.kind))errors.push('Duplicated source contact family');
     seen.add(c.kind);
     if(c.sourceContactFraction<=0||c.sourceContactFraction>=1)
       errors.push('Phase12H source contact is not in original segment interior');
     const interp=a.map((x,i)=>x+c.sourceContactFraction*(b[i]!-x));
     if(interp.some((x,i)=>Math.abs(x-c.originalContactProjectXYZ[i]!)>1e-10))
       errors.push('Phase12H source contact moved from original OBJ segment');
   }
   if(!seen.has('WALL_METAL')||!seen.has('GLASS_BODY'))
     errors.push('Phase12H both original material groups required');
 }
 if(Math.abs(pairs[0].sourceContactEvidence[0].sourceContactFraction-
             pairs[1].sourceContactEvidence[0].sourceContactFraction)>1e-10||
    Math.abs(pairs[0].sourceContactEvidence[1].sourceContactFraction-
             pairs[1].sourceContactEvidence[1].sourceContactFraction)>1e-10)
   errors.push('Phase12H original mirrored source contact percentages drifted');
 return errors;
}

export type UndertowT21Phase12HOriginalContact =
  typeof UNDERTOW_T21_PHASE12H_SOURCE_CONTACT_EVIDENCE[number];
