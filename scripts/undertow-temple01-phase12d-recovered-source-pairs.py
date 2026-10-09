#!/usr/bin/env python3
"""T21 Phase12D: original full four pieces recovered from full-family mirror search.

Only SHA-pinned original OBJ triangles, exact vertex-ID components, source
identity and Y. No runtime floor or visual registration. Next CI Vitest tests
real registered 124 + 12C 8 meshes and strict hard-XZ geometry.
"""
from pathlib import Path
import hashlib,json,math,runpy,sys
B=runpy.run_path(str(Path(__file__).with_name(
    'undertow-temple01-phase12b-component-graph.py')))
PIN=B['PIN']
ORIGINAL='Fld_Temple01_mesh05_low57_1__FloorLine02'
MATERIAL='Fld_Temple01_FloorLine02'
PAIRS=(60006,61516)
def recover(objpath,mirrorpath,phase12cpath,outpath):
    if objpath.stat().st_size!=43263289 or hashlib.sha256(objpath.read_bytes()).hexdigest()!=PIN:
        raise ValueError('T21_PHASE12D_RECOVER_PINNED_ORIGINAL_SHA_DRIFT')
    audit=json.loads(mirrorpath.read_text('utf8'))
    prior=json.loads(phase12cpath.read_text('utf8'))
    if (audit['version']!='T21_PHASE12D_FULL_SOURCE_FAMILY_MIRROR_SEARCH_V1' or
        audit['originalSourceSHA256']!=PIN or
        audit['onlyPreviouslyUnpairedOriginalSourceFaceIds']!=list(PAIRS) or
        prior['originalSourceSHA256']!=PIN or prior['originalTriangleCount']!=162 or
        not audit['reviewOnly'] or audit['runtimePromotionAuthorized']):
        raise ValueError('T21_PHASE12D_RECOVER_SOURCE_AUDIT_NOT_PINNED')
    original={x['sourceComponentKey'].split('|')[-1]:x for x in prior['components']}
    recovered=[];pairs=[]
    for target in audit['perUnpairedSource']:
        fi=target['unpairedOriginalSourceFaceIndex']
        if fi not in PAIRS or not target['sourceOnlyNotGameplay'] or target['runtimePromotionAuthorized']:
            raise ValueError('T21_PHASE12D_RECOVER_UNAPPROVED_TARGET')
        matches=target['exactMirroredOriginalSourceComponents']
        if len(matches)!=1:
            raise ValueError('T21_PHASE12D_RECOVER_REQUIRES_ONE_PINNED_ORIGINAL_MIRROR')
        match=matches[0]
        if match['maxMirroredVertexErrorMeters']>=0.0002:
            raise ValueError('T21_PHASE12D_RECOVER_MIRROR_GEOMETRY_DRIFT')
        pairs.append((fi,match['minOriginalFaceIndex']))
    if len(pairs)!=2 or len(set(sum(([a,b] for a,b in pairs),[])))!=4:
        raise ValueError('T21_PHASE12D_RECOVER_PAIRS_ARE_NOT_DISTINCT')
    vertex,groups,targetfaces,faceCount=B['parse_obj'](objpath,{(ORIGINAL,MATERIAL)})
    targetIds={f for pair in pairs for f in pair}
    for comp in B['componentize'](groups[(ORIGINAL,MATERIAL)]):
        minface=comp[0][0]
        if minface not in targetIds:continue
        allFaces=[];pts=[]
        for fi,ids in comp:
            xyz=[list(B['project'](vertex[v])) for v in ids]
            allFaces.append({
                'originalFaceIndex':fi,
                'originalOBJVertexIds':list(ids),
                'originalProjectTriangleXYZ':xyz
            })
            pts.extend(xyz)
        area=sum(B['area'](f['originalProjectTriangleXYZ']) for f in allFaces)
        digest=hashlib.sha256(''.join(
          f'{fi}:{ids[0]},{ids[1]},{ids[2]};' for fi,ids in comp
        ).encode('ascii')).hexdigest()
        record={'sourceComponentKey':f'{ORIGINAL}|{MATERIAL}|original-minface-{minface}',
         'sourceObject':ORIGINAL,'sourceMaterial':MATERIAL,
         'minOriginalFaceIndex':minface,'originalSourceTriangleCount':len(comp),
         'originalSource3DAreaSquareMeters':area,
         'originalProjectYRangeMeters':[min(x[1] for x in pts),max(x[1] for x in pts)],
         'originalComponentFaceAndOBJVertexIDHash':digest,
         'faces':allFaces,'gameplayAuthority':'NONE','runtimePromotionAuthorized':False}
        old=original.get('original-minface-'+str(minface))
        if old:
            if (old['originalComponentFaceAndOBJVertexIDHash']!=digest or
               old['faces']!=allFaces):
                raise ValueError('T21_PHASE12D_RECOVER_UNPAIRED_ORIGINAL_3D_CHANGED')
        recovered.append(record)
    if len(recovered)!=4 or any(c['originalSourceTriangleCount']!=2 for c in recovered):
        raise ValueError('T21_PHASE12D_RECOVER_EXACT_FOUR_TWO_TRIANGLE_ORIGINALS_REQUIRED')
    lookup={r['minOriginalFaceIndex']:r for r in recovered}
    for a,b in pairs:
        if a not in lookup or b not in lookup:
            raise ValueError('T21_PHASE12D_RECOVER_ORIGINAL_MIRROR_COMPONENT_MISSING')
        p=lookup[a];q=lookup[b]
        if (abs(p['originalSource3DAreaSquareMeters']-q['originalSource3DAreaSquareMeters'])>1e-6 or
            p['originalProjectYRangeMeters']!=q['originalProjectYRangeMeters']):
            raise ValueError('T21_PHASE12D_RECOVER_PAIR_AREA_OR_Y_NOT_EQUAL')
    out={
      'version':'T21_PHASE12D_FOUR_RECOVERED_EXACT_SOURCE_TRIANGLE_SETS_V1',
      'sourceSHA256':PIN,'sourceSizeBytes':43263289,
      'sourceMaterial':MATERIAL,'sourceObject':ORIGINAL,
      'mirrorPairs':[{'originalFaceIndexA':a,'originalFaceIndexB':b} for a,b in pairs],
      'completeOriginalSourceComponentCount':4,'originalTriangleCount':8,
      'source3DAreaSquareMeters':sum(c['originalSource3DAreaSquareMeters'] for c in recovered),
      'originalComponents':recovered,
      'displayOverlapAndHardXZGate':'PENDING_INDEPENDENT_TS_QA',
      'displaySourceInventoryBeforePotentialOptIn':124,
      'addedSceneSourceMeshes':0,'gameplayAuthority':'NONE',
      'reviewOnly':True,'runtimePromotionAuthorized':False
    }
    outpath.parent.mkdir(parents=True,exist_ok=True)
    outpath.write_text(json.dumps(out,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12D_RECOVERED_ORIGINAL_SOURCE_PAIRS',pairs,
          'faces='+str(sum(len(c['faces']) for c in recovered)),
          'area3D='+str(out['source3DAreaSquareMeters']),'path='+str(outpath))
def selftest():
    assert sorted({60006,61728,61516,62086})==[60006,61516,61728,62086]
    assert B['componentize']([(1,(1,2,3)),(2,(3,4,5)),(3,(6,7,8))])
    print('T21_PHASE12D_RECOVERED_DISTINCT_PAIR_SELFTEST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==5:recover(*map(Path,sys.argv[1:]))
    else:raise SystemExit('usage: recovered.py pinned.obj mirror.json phase12c.json output.json')
