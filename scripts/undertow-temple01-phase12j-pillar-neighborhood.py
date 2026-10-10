#!/usr/bin/env python3
"""T21 Phase12J: pinned complete ORIGINAL Temple01 pillar-adjacent static parts.

Inspect ORIGINAL vertex-ID components around all six approved Phase12I tall
pillars, never add inferred caps, closed walls, collision, nav or playable floor.
No original-source vertices are fabricated or simplified.
"""
from __future__ import annotations
from collections import Counter,defaultdict
from pathlib import Path
import hashlib,json,math,runpy,sys

B=runpy.run_path(str(Path(__file__).with_name(
    'undertow-temple01-phase12b-component-graph.py')))
PIN=B['PIN']
IDS=(12934,12956,13110,13132,13176,13220)
OBJECT='Fld_Temple01_CellingBase_1__PillarOld00'
MATERIAL='Fld_Temple01_PillarOld00'
MX=.229368288528164
MZ=.194564295456822
RADIUS=.85
MAX_TRIANGLES_PER_PART=160
MAX_PAIRS=22
MAX_ARTIFACT_TRIANGLES=2000

def q(v):
    return tuple(round(x,4) for x in v)

def signature(points):
    return Counter(q(p) for p in points)

def reflected(points):
    return Counter(q((MX-p[0],p[1],MZ-p[2])) for p in points)

def bounds(points):
    return [min(p[k] for p in points) for k in range(3)]+[
        max(p[k] for p in points) for k in range(3)]

def bounds_gap(a,b):
    return math.sqrt(sum(max(0.,a[k]-b[k+3],b[k]-a[k+3])**2
        for k in range(3)))

def nearest_vertices(a,b):
    return min(math.dist(p,r) for p in a for r in b)

def main(original,phase12i,gate,out):
    if original.stat().st_size!=43263289 or hashlib.sha256(original.read_bytes()).hexdigest()!=PIN:
        raise ValueError('PHASE12J_ORIGINAL_TEMPLE01_BINARY_PIN_DRIFT')
    src=json.loads(phase12i.read_text('utf8'))
    approved=json.loads(gate.read_text('utf8'))
    if (src['version']!='T21_PHASE12I_WHOLE_STATIC_ORIGINAL_COMPONENT_MIRROR_SURVEY_V1'
        or src['originalSourceSHA256']!=PIN or
        approved['version']!='T21_PHASE12I_INDEPENDENT_136_EXISTING_SOURCE_AND_FULL_HARD_XZ_GATE_V1'
        or approved['originalSourceSHA256']!=PIN or
        approved['sourceOnlyEligibleComponents']!=6 or
        approved['sourceOnlyEligibleCompleteMirroredPairs']!=3 or
        not approved['sourceOnly'] or approved['runtimePromotionAuthorized']):
        raise ValueError('PHASE12J_APPROVED_ANCHOR_GATE_DRIFT')
    eligible={x['originalMinFace'] for x in approved['perComponent']
        if x['decision']=='SOURCE_ONLY_OPTIONAL_REVIEW_CANDIDATE'}
    if eligible!=set(IDS):
        raise ValueError('PHASE12J_INCORRECT_SIX_APPROVED_ANCHORS')

    points=[None];obj='';mat='';fi=0;groups=defaultdict(list)
    with original.open('r',encoding='utf8',errors='replace') as lines:
        for line in lines:
            if line.startswith('v '):
                points.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('o '):
                obj=line[2:].strip()
            elif line.startswith('usemtl '):
                mat=line[7:].strip()
            elif line.startswith('f ') and (
                obj.startswith('Fld_Temple01_') or
                obj.startswith('FldObj_Temple01_PntSet_')):
                raw=[int(x.split('/')[0]) for x in line.split()[1:]]
                for k in range(1,len(raw)-1):
                    if (obj.startswith('Fld_Temple01_') and
                        not any(s in obj or s in mat for s in
                                ('PntSet','StageSide'))):
                        groups[(obj,mat)].append((fi,(raw[0],raw[k],raw[k+1])))
                    fi+=1
    if fi!=70396:raise ValueError('PHASE12J_ORIGINAL_FACE_COUNT_DRIFT')
    all_components=[];anchor_comps={}
    for (obj,mat),rows in sorted(groups.items()):
        for comp in B['componentize'](rows):
            first=comp[0][0]
            if first in IDS:
                if (obj!=OBJECT or mat!=MATERIAL or len(comp)!=22):
                    raise ValueError('PHASE12J_SIX_ANCHOR_IDENTITY_DRIFT')
            if first not in IDS and (len(comp)<2 or len(comp)>MAX_TRIANGLES_PER_PART):
                continue
            vids=sorted({v for _,ids in comp for v in ids})
            vec=[B['project'](points[v]) for v in vids]
            bound=bounds(vec)
            item={'minFace':first,'sourceObject':obj,'sourceMaterial':mat,
                  'sourceComponentKey':f'{obj}|{mat}|original-minface-{first}',
                  'sourceTriangleCount':len(comp),'originalOBJUniqueVertexCount':len(vids),
                  'sourceProjectXYZBounds':bound,'_points':vec,'_faces':comp}
            if first in IDS:anchor_comps[first]=item
            else:all_components.append(item)
    if set(anchor_comps)!=set(IDS):raise ValueError('PHASE12J_SIX_ANCHORS_NOT_COMPLETE')
    anchors={key:x for key,x in sorted(anchor_comps.items())}
    for key,a in anchors.items():
        ref=next((c for c in src['candidateSourceMirroredComponents']
                  if c['originalMinFace']==key),None)
        if not ref or len(ref['faces'])!=22:
            raise ValueError('PHASE12J_ANCHOR_SOURCE_MISSING_'+str(key))
        for (idx,ids),face in zip(a['_faces'],ref['faces']):
            if idx!=face['originalFaceIndex'] or list(ids)!=face['originalOBJVertexIds']:
                raise ValueError('PHASE12J_ANCHOR_ORIGINAL_FACE_ID_DRIFT')
            proj=[list(B['project'](points[v])) for v in ids]
            if proj!=face['originalProjectTriangleXYZ']:
                raise ValueError('PHASE12J_ANCHOR_FLOAT64_SOURCE_DRIFT')
    nearby=[]
    for c in all_components:
        rough=[(key,bounds_gap(c['sourceProjectXYZBounds'],a['sourceProjectXYZBounds']))
               for key,a in anchors.items()]
        possible=[key for key,gap in rough if gap<=RADIUS]
        if not possible:continue
        distances=[(key,nearest_vertices(c['_points'],anchors[key]['_points']))
                   for key in possible]
        closest_key,closest=min(distances,key=lambda p:(p[1],p[0]))
        if closest>RADIUS:continue
        area=sum(B['area']([B['project'](points[v]) for v in ids])
             for _,ids in c['_faces'])
        if area<.05:continue
        c['originalTriangleArea3DSquareMeters']=area
        c['closestApprovedPillarMinFace']=closest_key
        c['closestOriginalVertexToPillarMeters']=closest
        c['allNearbyApprovedPillars']=[{'minOriginalFace':k,'minimumVertexDistanceMeters':d}
            for k,d in sorted(distances) if d<=RADIUS]
        nearby.append(c)
    bins=defaultdict(list)
    for c in nearby:
        key=(c['sourceMaterial'],len(c['_faces']),len(c['_points']),
             round(c['originalTriangleArea3DSquareMeters'],3))
        bins[key].append(c)
    exact_pairs=[]
    ambiguous=0
    for a in nearby:
        key=(a['sourceMaterial'],len(a['_faces']),len(a['_points']),
             round(a['originalTriangleArea3DSquareMeters'],3))
        want=reflected(a['_points'])
        mates=[b for b in bins[key] if b is not a and signature(b['_points'])==want]
        if len(mates)>1:ambiguous+=1
        if len(mates)!=1:continue
        b=mates[0]
        rev=reflected(b['_points'])
        back=[c for c in bins[key] if c is not b and signature(c['_points'])==rev]
        if len(back)!=1 or back[0] is not a:continue
        if a['minFace']<b['minFace']:
            exact_pairs.append((min(a['closestOriginalVertexToPillarMeters'],
                                    b['closestOriginalVertexToPillarMeters']),
                                -(a['originalTriangleArea3DSquareMeters']+
                                  b['originalTriangleArea3DSquareMeters']),
                                a['minFace'],a,b))
    exact_pairs.sort(key=lambda x:x[:3])
    selected=[];chosen_pairs=[];used_tri=0
    for _,_,_,a,b in exact_pairs:
        n=len(a['_faces'])+len(b['_faces'])
        if (len(chosen_pairs)>=MAX_PAIRS or
            used_tri+n>MAX_ARTIFACT_TRIANGLES):continue
        used_tri+=n
        chosen_pairs.append([a['minFace'],b['minFace']])
        for c,m in ((a,b),(b,a)):
            z={k:v for k,v in c.items() if not k.startswith('_')}
            z['mirrorOriginalMinFace']=m['minFace']
            z['originalSourceComponentFaceAndOBJVertexIDHash']=hashlib.sha256(''.join(
                f'{fi}:{ids[0]},{ids[1]},{ids[2]};'
                for fi,ids in c['_faces']).encode('ascii')).hexdigest()
            z['faces']=[{'originalFaceIndex':fi,'originalOBJVertexIds':list(ids),
                 'originalProjectTriangleXYZ':[list(B['project'](points[v])) for v in ids]}
                 for fi,ids in c['_faces']]
            z.update({'reviewOnly':True,'runtimePromotionAuthorized':False,
             'hard42PointOuterXZ':'PENDING_INDEPENDENT_GATE',
             'existing142SourceOverlap':'PENDING_INDEPENDENT_GATE',
             'gameplayAuthority':'NONE'})
            selected.append(z)
    report={
        'version':'T21_PHASE12J_SIX_PILLAR_NEARBY_ORIGINAL_STATIC_PARTS_V1',
        'originalSourceSHA256':PIN,'originalSourceBytes':43263289,
        'originalActiveFaceCount':fi,'approvedPillarOriginalMinFaces':list(IDS),
        'approvedPillarComponentCount':6,'frozenDefaultReviewSourceMeshes':124,
        'previousOptionalReviewSourceMeshes':18,
        'searchOriginalVertexRadiusMeters':RADIUS,
        'originalSourceStaticComponentsScreened':len(all_components),
        'originalNearbyComponentCount':len(nearby),
        'originalUniqueMirrorPairsNearPillars':len(exact_pairs),
        'nonUniqueMirrorCandidateComponentCount':ambiguous,
        'selectedMirrorPairIds':chosen_pairs,
        'selectedFullSourceComponentCount':len(selected),
        'selectedOriginalTriangleCount':used_tri,
        'selectedFullOriginalSourceComponents':selected,
        'reviewOnly':True,'runtimePromotionAuthorized':False,
        'newRenderableComponents':0,'sourceDoesNotImplyAttachment':True,
        'sourceDoesNotImplyCappedClosedPillar':True,
        'sourceNotGameplayCollisionPaintNavOrFloor':True,
        'nextGate':'INDEPENDENT_FULL_SOURCE_TRIANGLE_OVERLAP_AND_42_POINT_OUTER_XZ'
    }
    out.parent.mkdir(exist_ok=True,parents=True)
    out.write_text(json.dumps(report,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12J_ORIGINAL_NEARBY_PARTS_PASS',
         'staticScreened='+str(len(all_components)),
         'nearPillar='+str(len(nearby)),
         'mirrored='+str(len(exact_pairs)),
         'selectedPairs='+str(len(chosen_pairs)),
         'selectedOriginalSourceTriangles='+str(used_tri),
         'closest='+json.dumps([{'a':a['minFace'],'b':b['minFace'],
             'material':a['sourceMaterial'],'dist':round(d,5),
             'triangleCounts':[len(a['_faces']),len(b['_faces'])]}
             for d,_,_,a,b in exact_pairs[:8]]))

def selftest():
    a=[(1.,2.,3.),(4.,2.,8.),(1.,2.,3.)]
    b=[(MX-x,y,MZ-z) for x,y,z in a]
    assert reflected(a)==signature(b)
    assert bounds_gap([0,0,0,1,1,1],[2,0,0,3,1,1])==1.
    assert nearest_vertices([(0,0,0),(4,0,0)],[(2,0,0)])==2.
    assert len(B['componentize']([(1,(1,2,3)),(2,(3,4,5)),(3,(6,7,8))]))==2
    print('T21_PHASE12J_ORIGINAL_COMPONENT_PROXIMITY_MIRROR_SELFTEST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==5:main(*map(Path,sys.argv[1:]))
    else:raise SystemExit('usage phase12j.py --self-test OR pinned.obj phase12i.json 12i-approved.json output.json')
