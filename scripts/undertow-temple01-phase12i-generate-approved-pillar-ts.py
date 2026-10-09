#!/usr/bin/env python3
"""Generate byte-for-byte original 6-pillar source-only TS from independently
approved Phase12I gates. Not a new stage, collider, nav, paint, or gameplay.
"""
from pathlib import Path
import base64,hashlib,json,struct,sys,textwrap,zlib

IDS=(12934,12956,13110,13132,13176,13220)
PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046'
SHA_PACKED='b158e4843e2c9d3afbe45da481e8383ddd5096f5d022fa7e0ca57dc5bbc4c250'
MATERIAL='Fld_Temple01_PillarOld00'
OBJECT='Fld_Temple01_CellingBase_1__PillarOld00'

def generate(source_path,gate_path,out_path):
    s=json.loads(source_path.read_text('utf8'))
    g=json.loads(gate_path.read_text('utf8'))
    if (s['version']!='T21_PHASE12I_WHOLE_STATIC_ORIGINAL_COMPONENT_MIRROR_SURVEY_V1'
        or s['originalSourceSHA256']!=PIN or s['originalActiveFaceCount']!=70396
        or g['version']!='T21_PHASE12I_INDEPENDENT_136_EXISTING_SOURCE_AND_FULL_HARD_XZ_GATE_V1'
        or g['originalSourceSHA256']!=PIN or g['sourceOnlyEligibleComponents']!=6
        or g['sourceOnlyEligibleCompleteMirroredPairs']!=3
        or not s['reviewOnly'] or s['runtimePromotionAuthorized'] or
        g['runtimePromotionAuthorized'] or not g['sourceOnly']):
        raise ValueError('PHASE12I_NEW_VISUAL_ASSET_NOT_FROM_PINNED_INDEPENDENT_GATE')
    approvals={c['originalMinFace']:c for c in g['perComponent']
        if c['decision']=='SOURCE_ONLY_OPTIONAL_REVIEW_CANDIDATE'}
    if set(approvals)!=set(IDS):
        raise ValueError('PHASE12I_SOURCE_APPROVAL_SET_DRIFT')
    comps=sorted((c for c in s['candidateSourceMirroredComponents']
        if c['originalMinFace'] in IDS),key=lambda c:c['originalMinFace'])
    if len(comps)!=6:raise ValueError('PHASE12I_MISSING_ORIGINAL_6_PILLARS')
    data=bytearray()
    rows=[]
    for c in comps:
        minface=c['originalMinFace']
        approved=approvals[minface]
        if (c['sourceObject']!=OBJECT or c['sourceMaterial']!=MATERIAL or
            c['originalTriangleCount']!=22 or len(c['faces'])!=22 or
            c['originalMirrorMinFace']!=approved['originalMirrorMinFace'] or
            not approved['mirrorFullOriginalVertexIDMultisetMatched'] or
            any(approved[x] for x in (
              'originalHardXZOutsideSampleCount','originalHardXZProperEdgeCrossings',
              'originalHardXZBoundaryVerticesEnclosedInTriangleCount',
              'exactDisplayedTriangleDuplicates','nearDisplayedTriangleDuplicates'))):
            raise ValueError('PHASE12I_UNSAFE_SOURCE_PILLAR_'+str(minface))
        for fi,face in enumerate(c['faces']):
            if (face['originalFaceIndex']!=minface+fi or
                len(face['originalOBJVertexIds'])!=3 or
                len(face['originalProjectTriangleXYZ'])!=3):
                raise ValueError('PHASE12I_ORIGINAL_FACE_SOURCE_SEQUENCE_DRIFT')
            flatten=[v for point in face['originalProjectTriangleXYZ'] for v in point]
            data+=struct.pack('<IIII9d',face['originalFaceIndex'],
                *face['originalOBJVertexIds'],*flatten)
        rows.append([minface,c['originalMirrorMinFace'],c['original3DAreaSquareMeters'],
                     c['componentFaceAndOriginalOBJVertexIDHash']])
    if len(data)!=11616 or hashlib.sha256(data).hexdigest()!=SHA_PACKED:
        raise ValueError('PHASE12I_ORIGINAL_BINARY64_VERTEX_AND_FACE_DIGEST_DRIFT')
    b64=base64.b64encode(zlib.compress(data,9)).decode('ascii')
    packed_lines=',\n'.join('  '+json.dumps(chunk) for chunk in textwrap.wrap(b64,120))
    code="""import type {StageVector3} from '../StageDefinition';
/** Six COMPLETE original source-connected 3D PillarOld00 structures; all 132
 * source triangles from SHA-pinned Temple01, after independent 136-mesh,
 * 42-point hard-XZ and source mirror gate. REVIEW ONLY; OFF in all presets.
 * Bytewise exact original XYZ/Face IDs/OBJ vertex IDs, no inferred faces.
 */
const PACKED=[\n"""+packed_lines+"""\n].join('');
const ROWS="""+json.dumps(rows,separators=(',',':'))+""" as const;

export interface UndertowPhase12IOriginalPillarMesh {
 readonly id:string;readonly sourceComponentId:string;
 readonly originalMinFace:number;readonly originalMirrorMinFace:number;
 readonly sourceObject:'Fld_Temple01_CellingBase_1__PillarOld00';
 readonly sourceMaterial:'Fld_Temple01_PillarOld00';
 readonly originalSourceTriangleCount:22;
 readonly originalSource3DAreaSquareMeters:number;
 readonly originalComponentFaceAndOBJVertexIDHash:string;
 readonly originalGlobalFaceIndices:readonly number[];
 readonly originalOBJVertexIdTriples:readonly (readonly number[])[];
 readonly vertices:readonly StageVector3[];
 readonly reviewOnly:true;readonly runtimePromotionAuthorized:false;
 readonly gameplayFloorCollisionPaintNavScoringAuthority:'NONE';
}
async function unpack():Promise<readonly UndertowPhase12IOriginalPillarMesh[]>{
 if(typeof DecompressionStream==='undefined')throw Error('T21 Phase12I native deflate unavailable');
 const compressed=Uint8Array.from(atob(PACKED),x=>x.charCodeAt(0));
 const buff=new ArrayBuffer(compressed.byteLength);
 new Uint8Array(buff).set(compressed);
 const array=await new Response(new Blob([buff]).stream().pipeThrough(
   new DecompressionStream('deflate'))).arrayBuffer();
 if(array.byteLength!==11616)throw Error('T21 Phase12I 132 original triangles byte drift');
 const dv=new DataView(array),result:UndertowPhase12IOriginalPillarMesh[]=[];
 let cursor=0;
 for(const [minFace,mirror,area,digest] of ROWS){
   const faces:number[]=[],ids:number[][]=[],vertices:StageVector3[]=[];
   for(let k=0;k<22;k++){
     const fi=dv.getUint32(cursor,true);
     if(fi!==minFace+k)throw Error('T21 Phase12I pinned source original face ID drift');
     const row=[dv.getUint32(cursor+4,true),dv.getUint32(cursor+8,true),
       dv.getUint32(cursor+12,true)];
     faces.push(fi);ids.push(row);
     for(let n=0;n<3;n++){
       const p:StageVector3=[
         dv.getFloat64(cursor+16+n*24,true),
         dv.getFloat64(cursor+24+n*24,true),
         dv.getFloat64(cursor+32+n*24,true)
       ];
       if(p.some(x=>!Number.isFinite(x)))throw Error('T21 Phase12I nonfinite original XYZ');
       vertices.push(p);
     }
     cursor+=88;
   }
   result.push(Object.freeze({
     id:'t21-phase12i-original-pillar-'+minFace,
     sourceComponentId:'Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|original-minface-'+minFace,
     originalMinFace:minFace,originalMirrorMinFace:mirror,
     sourceObject:'Fld_Temple01_CellingBase_1__PillarOld00' as const,
     sourceMaterial:'Fld_Temple01_PillarOld00' as const,
     originalSourceTriangleCount:22 as const,
     originalSource3DAreaSquareMeters:area,
     originalComponentFaceAndOBJVertexIDHash:digest,
     originalGlobalFaceIndices:faces,originalOBJVertexIdTriples:ids,vertices,
     reviewOnly:true as const,runtimePromotionAuthorized:false as const,
     gameplayFloorCollisionPaintNavScoringAuthority:'NONE' as const
   }));
 }
 if(cursor!==array.byteLength)throw Error('T21 Phase12I original source underread');
 return Object.freeze(result);
}
export const UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS=await unpack();
export const UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS_SUMMARY=Object.freeze({
 sourceSHA256:'""" + PIN + """',
 originalPackedFloat64FaceVertexIDDigest:'""" + SHA_PACKED + """',
 componentCount:6,mirrorPairCount:3,originalTriangleCount:132,
 totalOriginal3DAreaSquareMeters:UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS
   .reduce((s,c)=>s+c.originalSource3DAreaSquareMeters,0),
 sourceOriginalMaterial:'Fld_Temple01_PillarOld00',
 frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:12,
 defaultVisible:false as const,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const,gameplayAuthority:'NONE' as const
});
"""
    out_path.parent.mkdir(parents=True,exist_ok=True)
    out_path.write_text(code,encoding='utf8')
    print('T21_PHASE12I_ORIGINAL_REVIEW_TS_GENERATION_PASS',
          'six_originals=6','triangles=132','binary_sha256='+SHA_PACKED,
          'source_bytes='+str(len(data)),'module_chars='+str(len(code)))
    # Single JSON string CI log line, to promote ONLY exact validated generated
    # original source code to git without manually transcribing 132 triangles.
    print('T21_PHASE12I_GENERATED_REVIEW_TS_JSON='+json.dumps(code,separators=(',',':')))
if __name__=='__main__':
    if len(sys.argv)!=4:raise SystemExit('usage phase12i-generate.py source.json approved-gate.json output.ts')
    generate(*map(Path,sys.argv[1:]))
