#!/usr/bin/env python3
"""T21 Phase12I: ALL static original Temple01 component inventory / mirror shortlist.

This creates EVIDENCE, never inferred stage surfaces. Reads pinned original
43 MB OBJ; groups by actual OBJ (object, material) and SHARED ORIGINAL VERTEX IDs.
Lists static source structures not already authored as Phase12C/D candidates.
"""
from __future__ import annotations
from collections import defaultdict,Counter
from pathlib import Path
import hashlib,json,math,runpy,sys

B=runpy.run_path(str(Path(__file__).with_name('undertow-temple01-phase12b-component-graph.py')))
PIN=B['PIN']
MIRROR_X_SUM=0.229368288528164
MIRROR_Z_SUM=0.194564295456822
MIN_TRI=2
MIN_AREA3D=3.
MAX_TRI=450
MAX_SOURCE_FACES_IN_ARTIFACT=1800
MAX_SHORTLIST=36
HELD_IDS={26116,28318,60474,61948,35640,35642}
KNOWN_ID={60006,61516,61728,62086}

def qkey(v):
    return tuple(round(x,4) for x in v)

def mirror_multiset(points):
    return Counter(qkey((MIRROR_X_SUM-p[0],p[1],MIRROR_Z_SUM-p[2])) for p in points)

def source_multiset(points):
    return Counter(qkey(p) for p in points)

def build(objpath,phase12c,phase12d,outpath):
    if objpath.stat().st_size!=43263289 or hashlib.sha256(objpath.read_bytes()).hexdigest()!=PIN:
        raise ValueError('T21_PHASE12I_PINNED_43MB_SHA_DRIFT')
    a=json.loads(phase12c.read_text('utf8'));d=json.loads(phase12d.read_text('utf8'))
    if (a['version']!='T21_PHASE12C_ORIGINAL_162_TRIANGLE_REGISTERED_MESH_PREFLIGHT_V1'
        or a['originalSourceSHA256']!=PIN or a['sourceComponentCount']!=16
        or d['version']!='T21_PHASE12D_FOUR_RECOVERED_EXACT_SOURCE_TRIANGLE_SETS_V1'
        or d['sourceSHA256']!=PIN or d['completeOriginalSourceComponentCount']!=4
        or d['runtimePromotionAuthorized'] or not d['reviewOnly']):
        raise ValueError('T21_PHASE12I_PINNED_REVIEW_SOURCE_BASELINE_DRIFT')
    excluded={c['sourceComponentKey'] for c in a['components']}
    excluded.update(c['sourceComponentKey'] for c in d['originalComponents'])
    vertices=[None];groups=defaultdict(list);idx=0;obj='';material=''
    with objpath.open('r',encoding='utf8',errors='replace') as stream:
        for line in stream:
            if line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('o '):obj=line[2:].strip()
            elif line.startswith('usemtl '):material=line[7:].strip()
            elif line.startswith('f ') and (obj.startswith('Fld_Temple01_')
                   or obj.startswith('FldObj_Temple01_PntSet_')):
                raw=[int(t.split('/')[0]) for t in line.split()[1:]]
                for k in range(1,len(raw)-1):
                    # Keep only original *static* Temple01, not point-set actor
                    # placement. Never infer static colliders from material names.
                    if (obj.startswith('Fld_Temple01_') and
                        not material.endswith('StageSide') and
                        'StageSide' not in material and 'PntSet' not in obj):
                        groups[(obj,material)].append((idx,(raw[0],raw[k],raw[k+1])))
                    idx+=1
    if idx!=70396:raise ValueError('T21_PHASE12I_ORIGINAL_70396_FACE_COUNT_DRIFT')
    rows=[];groups_n=0;component_n=0
    for (obj,material),faces in sorted(groups.items()):
        groups_n+=1
        for comp in B['componentize'](faces):
            component_n+=1
            first=comp[0][0];key=f'{obj}|{material}|original-minface-{first}'
            if key in excluded or first in HELD_IDS or first in KNOWN_ID:continue
            if len(comp)<MIN_TRI or len(comp)>MAX_TRI:continue
            ids=sorted({v for _,trip in comp for v in trip})
            points=[B['project'](vertices[v]) for v in ids]
            area=sum(B['area']([B['project'](vertices[v]) for v in trip]) for _,trip in comp)
            if area<MIN_AREA3D:continue
            bounds=[min(p[i] for p in points) for i in range(3)]+[
                max(p[i] for p in points) for i in range(3)]
            widths=[bounds[i+3]-bounds[i] for i in range(3)]
            # Avoid gigantic mesh outskirts; XZ hard silhouette still requires
            # independent exact seven-sample-per-face QA.
            if widths[0]>50 or widths[2]>50:continue
            face_indices=[f for f,_ in comp]
            digest=hashlib.sha256(''.join(
                f'{fi}:{ids[0]},{ids[1]},{ids[2]};' for fi,ids in comp
            ).encode('ascii')).hexdigest()
            centroid=[sum(p[i] for p in points)/len(points) for i in range(3)]
            row={
                'sourceComponentKey':key,'originalMinFace':first,'sourceObject':obj,
                'sourceMaterial':material,'originalTriangleCount':len(comp),
                'originalUniqueOBJVertexCount':len(ids),'original3DAreaSquareMeters':area,
                'originalXYZBounds':bounds,'originalXYZExtents':widths,
                'sourceXYZCentroid':centroid,'componentFaceAndOriginalOBJVertexIDHash':digest,
                'originalFaceIndices':face_indices,
                'originalOBJVertexIds':ids,
                '_pts':points,'_cmp':comp
            }
            rows.append(row)
    # Find mirrors across entire potential inventory, not limited to top area.
    keybyid={r['originalMinFace']:r for r in rows}
    candidates=defaultdict(list)
    for r in rows:
        pts=r['_pts']
        sig=(r['sourceMaterial'],len(r['_cmp']),len(pts),
             round(r['original3DAreaSquareMeters'],3),
             tuple(round(v,3) for v in r['originalXYZExtents'][1:2]))
        candidates[sig].append(r)
    pairable=[]
    for r in rows:
        sig=(r['sourceMaterial'],len(r['_cmp']),len(r['_pts']),
             round(r['original3DAreaSquareMeters'],3),
             tuple(round(v,3) for v in r['originalXYZExtents'][1:2]))
        mirror=mirror_multiset(r['_pts'])
        options=[other for other in candidates[sig]
                 if other is not r and source_multiset(other['_pts'])==mirror]
        if len(options)==1:
            other=options[0]
            r['originalMirrorMinFace']=other['originalMinFace']
            if r['originalMinFace']<other['originalMinFace']:
                # Conservative area and balanced pair ranking, not gameplay.
                importance=min(r['original3DAreaSquareMeters'],other['original3DAreaSquareMeters'])
                pairable.append((importance,r['originalMinFace'],r,other))
    pairable.sort(key=lambda x:(-x[0],x[1]))
    selected=[];face_budget=0
    for importance,_,a,b in pairable:
        pairfaces=len(a['_cmp'])+len(b['_cmp'])
        if len(selected)>=MAX_SHORTLIST//2 or face_budget+pairfaces>MAX_SOURCE_FACES_IN_ARTIFACT:
            continue
        face_budget+=pairfaces
        for r in (a,b):
            record={k:v for k,v in r.items() if not k.startswith('_') and
                    k not in ('originalOBJVertexIds',)}
            record['originalMirrorMinFace']=b['originalMinFace'] if r is a else a['originalMinFace']
            record['faces']=[{
                'originalFaceIndex':fi,'originalOBJVertexIds':list(ids),
                'originalProjectTriangleXYZ':[list(B['project'](vertices[v])) for v in ids]
            } for fi,ids in r['_cmp']]
            record['hardOuter42PointXZStatus']='PENDING_INDEPENDENT_TS_GATE'
            record['registeredOriginal124Plus12Status']='PENDING_INDEPENDENT_TS_GATE'
            record['runtimePromotionAuthorized']=False
            selected.append(record)
    if any(x['sourceComponentKey'] in excluded for x in selected):
        raise ValueError('T21_PHASE12I_PREVIOUSLY_SELECTED_SOURCE_REUSED')
    if len(selected)%2:raise ValueError('T21_PHASE12I_MIRROR_SHORTLIST_ODD')
    artifact={
        'version':'T21_PHASE12I_WHOLE_STATIC_ORIGINAL_COMPONENT_MIRROR_SURVEY_V1',
        'originalSourceSHA256':PIN,'originalSourceBytes':43263289,'originalActiveFaceCount':idx,
        'originalStaticObjectMaterialGroups':groups_n,
        'originalStaticVertexIDConnectedComponents':component_n,
        'areaThresholdSquareMeters':MIN_AREA3D,
        'allPotentialComponentsAtLeast3m2':len(rows),
        'unverifiedOriginalSymmetricPairs':len(pairable),
        'originalCandidateMirrorPairCount':len(selected)//2,
        'originalCandidateComponentCount':len(selected),
        'originalCandidateTriangleCount':face_budget,
        'candidateSourceMirroredComponents':selected,
        'originalRegisteredFullSourceMeshesUnchanged':124,
        'reviewOnly':True,'runtimePromotionAuthorized':False,
        'newRegisteredVisualSourceMeshes':0,'newGameplayCollisionNavPaintScoringAuthority':'NONE',
        'candidateGatingState':'PENDING_REGISTERED_124_PLUS_12_AND_HARD_XZ'
    }
    outpath.parent.mkdir(parents=True,exist_ok=True)
    outpath.write_text(json.dumps(artifact,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12I_WHOLE_STATIC_ORIGINAL_SOURCE_SURVEY',
      'component_groups='+str(groups_n),
      'all_components='+str(component_n),
      'area_candidates='+str(len(rows)),
      'symmetrical_pairs='+str(len(pairable)),
      'selected_pairs='+str(len(selected)//2),
      'selected_triangles='+str(face_budget),
      'top='+json.dumps([{
         'a':x['originalMinFace'],'b':x['originalMirrorMinFace'],
         'area':round(x['original3DAreaSquareMeters'],2),
         'material':x['sourceMaterial']} for x in selected[::2][:8]]))
def selftest():
    a=[(1.,2.,3.),(2.,3.,4.),(1.,2.,3.)]
    b=[(MIRROR_X_SUM-x,y,MIRROR_Z_SUM-z) for x,y,z in a]
    assert mirror_multiset(a)==source_multiset(b)
    assert mirror_multiset(a)!=source_multiset(b[:-1])
    assert len(B['componentize']([(1,(1,2,3)),(2,(3,4,5)),(3,(6,7,8))]))==2
    print('T21_PHASE12I_ORIGINAL_MIRROR_AND_VERTEX_ID_COMPONENT_SELFTEST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==5:build(*map(Path,sys.argv[1:]))
    else:raise SystemExit('Usage: phase12i.py --self-test OR pinned.obj phase12c.json phase12d.json output.json')
