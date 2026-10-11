#!/usr/bin/env python3
"""Phase12C: regenerate actual pinned Temple01 OBJ source triangles for original-source display gating.
Output source evidence only, not physics, game floors, nav, paint or scene registration.
"""
import hashlib,json,math,runpy,sys
from pathlib import Path
B=runpy.run_path(str(Path(__file__).with_name('undertow-temple01-phase12b-component-graph.py')))
PIN=B['PIN']
def build(objpath,ledgerpath,outpath):
    if objpath.stat().st_size!=43263289 or hashlib.sha256(objpath.read_bytes()).hexdigest()!=PIN:
        raise ValueError('T21_PHASE12C_PINNED_ORIGINAL_OBJ_DRIFT')
    prior=json.loads(ledgerpath.read_text('utf-8'))
    if (prior['originalSourceSHA256']!=PIN or
        prior['version']!='T21_PHASE12B_ORIGINAL_VERTEX_ID_COMPONENT_GRAPH_V1' or
        prior['uniqueOriginalVertexIDConnectedComponents']!=16 or
        prior['trackedOriginalSourceFaces']!=16 or
        prior['originalFullReviewComponentsAdded']!=0 or
        not prior['reviewOnly'] or prior['runtimePromotionAuthorized']):
        raise ValueError('T21_PHASE12C_PHASE12B_LEDGER_DRIFT')
    sources=prior['selectedComponents']
    families={(x['sourceObject'],x['sourceMaterial']) for x in sources}
    if len(families)!=5 or any(
        not obj.startswith('Fld_Temple01_') or 'PntSet' in obj or 'StageSide' in mat
        for obj,mat in families):
        raise ValueError('T21_PHASE12C_NONSTATIC_OR_UNVERIFIED_SOURCE')
    vertices,groups,target,facecount=B['parse_obj'](objpath,families)
    if len(target)!=16 or set(target)!=set(B['FACE_IDS']):
        raise ValueError('T21_PHASE12C_PINNED_SAMPLE_FACE_DRIFT')
    previous={x['sourceComponentKey']:x for x in sources}
    chosen={}
    for (obj,mat),rows in sorted(groups.items()):
        for component in B['componentize'](rows):
            key=f'{obj}|{mat}|original-minface-{component[0][0]}'
            if key not in previous:continue
            expected=previous[key]
            faceids=[fi for fi,ids in component]
            digest=hashlib.sha256(''.join(
                f'{fi}:{ids[0]},{ids[1]},{ids[2]};' for fi,ids in component
            ).encode('ascii')).hexdigest()
            if (digest!=expected['componentFaceAndOBJVertexIDHash'] or
                faceids!=expected['allOriginalFaceIndices'] or
                len(component)!=expected['originalTriangleCount']):
                raise ValueError('T21_PHASE12C_COMPONENT_ID_GRAPH_DRIFT_'+key)
            triangles=[{'originalFaceIndex':fi,'originalOBJVertexIds':list(ids),
                'originalProjectTriangleXYZ':[list(B['project'](vertices[i])) for i in ids]}
                for fi,ids in component]
            area=sum(B['area'](f['originalProjectTriangleXYZ']) for f in triangles)
            if not math.isclose(area,expected['originalSourceTriangle3DAreaSquareMeters'],
                                rel_tol=1e-13,abs_tol=1e-11):
                raise ValueError('T21_PHASE12C_ORIGINAL_3D_AREA_DRIFT')
            chosen[key]={
                'sourceComponentKey':key,'sourceObject':obj,'sourceMaterial':mat,
                'originalTriangleCount':len(triangles),
                'originalSource3DAreaSquareMeters':area,
                'originalComponentFaceAndOBJVertexIDHash':digest,
                'originalYRangeMeters':expected['originalProjectYRangeMeters'],
                'faces':triangles,'gameplayAuthority':'NONE',
                'runtimePromotionAuthorized':False}
    if len(chosen)!=16 or sum(x['originalTriangleCount'] for x in chosen.values())!=162:
        raise ValueError('T21_PHASE12C_16_COMPONENT_162_TRIANGLE_DRIFT')
    allfaces={f['originalFaceIndex']:f for c in chosen.values() for f in c['faces']}
    if len(allfaces)!=162:raise ValueError('T21_PHASE12C_SOURCE_FACE_REUSE')
    for sample in prior['perFace']:
        face=allfaces[sample['originalFaceIndex']]
        if (face['originalOBJVertexIds']!=sample['originalOBJVertexIds'] or
            face['originalProjectTriangleXYZ']!=sample['originalProjectTriangleXYZ']):
            raise ValueError('T21_PHASE12C_SOURCE_SAMPLE_PROJECTED_XYZ_DRIFT')
    doc={
        'version':'T21_PHASE12C_ORIGINAL_162_TRIANGLE_REGISTERED_MESH_PREFLIGHT_V1',
        'originalSourceSHA256':PIN,'sourceSizeBytes':43263289,
        'originalActiveFaceCount':facecount,'sourceComponentCount':len(chosen),
        'originalTriangleCount':162,'staticSourceMaterialFamilies':len(families),
        'original3DAreaSquareMeters':sum(c['originalSource3DAreaSquareMeters'] for c in chosen.values()),
        'components':[chosen[k] for k in sorted(chosen)],
        'existingRegisteredFullSourceMeshes':124,'newRegisteredFullSourceMeshes':0,
        'registered124OverlapStatus':'PENDING_SEPARATE_RUNTIME_IMPORT_COMPARISON',
        'hardSilhouetteAndMirrors':'PENDING_SEPARATE_RUNTIME_IMPORT_COMPARISON',
        'gameplayAuthority':'NONE','reviewOnly':True,'runtimePromotionAuthorized':False
    }
    outpath.parent.mkdir(exist_ok=True,parents=True)
    outpath.write_text(json.dumps(doc,separators=(',',':')),encoding='utf-8')
    print('T21_PHASE12C_PINNED_162_ORIGINAL',len(chosen),len(allfaces),
          'total_area3d',round(doc['original3DAreaSquareMeters'],8),'artifact',outpath)
def selftest():
    assert [len(x) for x in B['componentize']([(0,(1,2,3)),(1,(3,4,5)),(2,(6,7,8))])]==[2,1]
    assert B['area']([(0,0,0),(1,0,0),(0,0,1)])==0.5
    print('T21_PHASE12C_SYNTHETIC_GRAPH_TEST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==4:build(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]))
    else:raise SystemExit('Usage: original.obj phase12b.json output.json or --self-test')
