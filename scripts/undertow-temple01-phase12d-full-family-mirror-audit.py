#!/usr/bin/env python3
"""Phase12D: find actual same-object/material original OBJ mirror components.

Unlike the Phase12C selected 16-only search, this inspects ALL original
vertex-ID-connected FloorLine02 components from the SHA-pinned 43MB Temple01
OBJ. Exact symmetric membership is independent of name, face index, XZ
proximity, and other meshes. No new renderer/game geometry is emitted.
"""
from __future__ import annotations
from pathlib import Path
from collections import defaultdict
import hashlib,json,math,runpy,sys

B=runpy.run_path(str(Path(__file__).with_name(
    'undertow-temple01-phase12b-component-graph.py')))
SHA=B['PIN']
MIRROR_X_SUM=0.229368288528164
MIRROR_Z_SUM=0.194564295456822
MATCH_LIMIT_METERS=0.0002
TARGETS=(60006,61516)
SOURCE_GROUP=('Fld_Temple01_mesh05_low57_1__FloorLine02',
              'Fld_Temple01_FloorLine02')
def component_bounds(points):
    return [min(q[i] for q in points) for i in range(3)]+[
        max(q[i] for q in points) for i in range(3)]
def mirror_quality(a,b):
    """Return a strict multiset bijection, not set-membership under duplicates."""
    if len(a)!=len(b):return None
    remaining=list(range(len(b)));worst=0.0;total=0.0
    for p in a:
        best=min(remaining,key=lambda j:math.dist(
            (MIRROR_X_SUM-p[0],p[1],MIRROR_Z_SUM-p[2]),b[j]))
        d=math.dist((MIRROR_X_SUM-p[0],p[1],MIRROR_Z_SUM-p[2]),b[best])
        if d>=MATCH_LIMIT_METERS:return None
        worst=max(worst,d);total+=d
        remaining.remove(best)
    return {'maxMirroredVertexErrorMeters':worst,
            'meanMirroredVertexErrorMeters':total/len(a)}
def build(objpath,priorpath,outpath):
    if objpath.stat().st_size!=43263289 or hashlib.sha256(objpath.read_bytes()).hexdigest()!=SHA:
        raise ValueError('T21_PHASE12D_PINNED_OBJ_SHA_OR_SIZE_CHANGED')
    prior=json.loads(priorpath.read_text('utf8'))
    if (prior['version']!='T21_PHASE12C_ORIGINAL_162_TRIANGLE_REGISTERED_MESH_PREFLIGHT_V1' or
        prior['originalSourceSHA256']!=SHA or
        prior['sourceComponentCount']!=16 or
        prior['originalTriangleCount']!=162 or
        not prior['reviewOnly'] or prior['runtimePromotionAuthorized']):
        raise ValueError('T21_PHASE12D_INDEPENDENT_PHASE12C_INPUT_DRIFT')
    original={c['faces'][0]['originalFaceIndex']:c for c in prior['components']}
    if any(fi not in original or
           (original[fi]['sourceObject'],original[fi]['sourceMaterial'])!=SOURCE_GROUP
           for fi in TARGETS):
        raise ValueError('T21_PHASE12D_UNMATCHED_SOURCE_IDS_DRIFT')
    vertices,grouped,targetfaces,facecount=B['parse_obj'](objpath,{SOURCE_GROUP})
    family=grouped.get(SOURCE_GROUP,[])
    if not family or len(targetfaces)!=2:
        raise ValueError('T21_PHASE12D_ORIGINAL_SOURCE_FAMILY_MISSING')
    connected=B['componentize'](family)
    candidates=[]
    for comp in connected:
        points=[B['project'](vertices[id]) for _,ids in comp for id in ids]
        a=sum(B['area'](points[i:i+3]) for i in range(0,len(points),3))
        box=component_bounds(points)
        candidates.append({
            'sourceComponentKey':f'{SOURCE_GROUP[0]}|{SOURCE_GROUP[1]}|original-minface-{comp[0][0]}',
            'minOriginalFaceIndex':comp[0][0],
            'originalTriangleCount':len(comp),
            'originalFaceIndices':[fi for fi,_ in comp],
            'original3DAreaSquareMeters':a,'originalProjectXYZBounds':box,
            'originalProjectYRangeMeters':[box[1],box[4]],
            '_points':points
        })
    report=[]
    for fi in TARGETS:
        c=original[fi]
        source_id=c['sourceComponentKey']
        source_points=[p for f in c['faces'] for p in f['originalProjectTriangleXYZ']]
        mirrored_center=(MIRROR_X_SUM-sum(p[0] for p in source_points)/len(source_points),
                         sum(p[1] for p in source_points)/len(source_points),
                         MIRROR_Z_SUM-sum(p[2] for p in source_points)/len(source_points))
        passed=[];qualified=[];bydistance=[]
        for candidate in candidates:
            if candidate['sourceComponentKey']==source_id:continue
            if candidate['originalTriangleCount']!=len(c['faces']):continue
            others=candidate['_points']
            center=tuple(sum(p[i] for p in others)/len(others) for i in range(3))
            distance=math.dist(mirrored_center,center)
            y_ok=all(abs(a-b)<=MATCH_LIMIT_METERS for a,b in zip(
                c['originalYRangeMeters'],candidate['originalProjectYRangeMeters']))
            area_delta=abs(c['originalSource3DAreaSquareMeters']-
                candidate['original3DAreaSquareMeters'])
            state={
                'sourceComponentKey':candidate['sourceComponentKey'],
                'minOriginalFaceIndex':candidate['minOriginalFaceIndex'],
                'sameTriangleCount':True,'yRangeWithin0Point2mm':y_ok,
                'original3DAreaDifferenceSquareMeters':area_delta,
                'mirroredCentroidDistanceMeters':distance
            }
            bydistance.append(state)
            if not y_ok or area_delta>0.0001:continue
            qualified.append(state)
            q=mirror_quality(source_points,others)
            if q is not None:
                passed.append({**state,**q,
                    'originalFaceIndices':candidate['originalFaceIndices'],
                    'originalProjectYRangeMeters':candidate['originalProjectYRangeMeters']})
        bydistance.sort(key=lambda x:(x['mirroredCentroidDistanceMeters'],
                                      x['minOriginalFaceIndex']))
        passed.sort(key=lambda x:x['minOriginalFaceIndex'])
        report.append({
            'unpairedOriginalSourceFaceIndex':fi,
            'unpairedSourceComponentKey':source_id,
            'originalSourceTriangleCount':len(c['faces']),
            'originalSource3DAreaSquareMeters':c['originalSource3DAreaSquareMeters'],
            'originalProjectYRangeMeters':c['originalYRangeMeters'],
            'mirrorSearchWithinOriginalSameObjectMaterial':True,
            'distinctOriginalConnectedComponentsInFullFamily':len(connected),
            'sameTriangleCountComponentsConsidered':len(bydistance),
            'areaAndYFilteredComponentCount':len(qualified),
            'exactMirroredOriginalSourceComponents':passed,
            'closestSameTriangleCountAlternatives':bydistance[:5],
            'disposition':('FOUND_ORIGINAL_SOURCE_MIRROR_REQUIRES_NEW_124_AND_HARD_XZ_GATES'
                if passed else 'HOLD_NO_0POINT2MM_SOURCE_MIRROR_IN_FULL_FAMILY'),
            'sourceOnlyNotGameplay':True,'runtimePromotionAuthorized':False
        })
    out={
        'version':'T21_PHASE12D_FULL_SOURCE_FAMILY_MIRROR_SEARCH_V1',
        'originalSourceSHA256':SHA,'sourceSizeBytes':43263289,
        'originalActiveFaceCount':facecount,
        'searchedSourceObject':SOURCE_GROUP[0],
        'searchedSourceMaterial':SOURCE_GROUP[1],
        'originalFamilyTriangleCount':len(family),
        'originalFamilyVertexIDConnectedComponentCount':len(connected),
        'onlyPreviouslyUnpairedOriginalSourceFaceIds':list(TARGETS),
        'mirrorCenterXSum':MIRROR_X_SUM,'mirrorCenterZSum':MIRROR_Z_SUM,
        'maxStrictMirroredVertexErrorMetersExclusive':MATCH_LIMIT_METERS,
        'perUnpairedSource':report,
        'newOriginalSourceComponentsRendered':0,
        'registeredOriginalFullSourceDisplayCount':124,
        'newGameCollisionPaintNavScoringAuthority':'NONE',
        'reviewOnly':True,'runtimePromotionAuthorized':False
    }
    outpath.parent.mkdir(parents=True,exist_ok=True)
    outpath.write_text(json.dumps(out,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12D_FULL_FAMILY_SOURCE_MIRROR',
      'total_family_components='+str(len(connected)),
      'results='+str([(r['unpairedOriginalSourceFaceIndex'],
           len(r['exactMirroredOriginalSourceComponents']),r['disposition'])
           for r in report]),'json='+str(outpath))
def self_test():
    a=[(1.,2.,3.),(1.,4.,3.),(2.,2.,3.)]
    b=[(MIRROR_X_SUM-x,y,MIRROR_Z_SUM-z) for x,y,z in reversed(a)]
    assert mirror_quality(a,b) is not None
    assert mirror_quality(a,b[:-1]) is None
    assert mirror_quality(a,b[:2]+[(999,2,3)]) is None
    assert mirror_quality(a,b[:2]+[b[0]]) is None
    assert B['componentize']([(1,(1,2,3)),(2,(3,4,5)),(3,(11,12,13))])
    print('T21_PHASE12D_STRICT_ORIGINAL_VERTEX_MULTISET_MIRROR_SELFTEST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':self_test()
    elif len(sys.argv)==4:build(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]))
    else:raise SystemExit('usage: phase12d.py --self-test | PINNED.obj phase12c.json out.json')
