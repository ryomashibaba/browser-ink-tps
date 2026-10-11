#!/usr/bin/env python3
"""Phase12B: original static Temple01 shared OBJ-vertex-ID component graph.

Same-XYZ coordinates with different original vertex IDs do not connect.
Components are strictly within (original object, original material).
Output is evidence-only: NEVER runtime floor, collider, paint or nav.
"""
from __future__ import annotations
import hashlib,json,math,struct,sys
from collections import defaultdict
from pathlib import Path

PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046'
FACE_IDS=(60006,60160,60474,34848,28318,35641,69626,69776,
          61516,61422,61948,34876,26116,35643,69634,69810)
SCALE=.964211
TH=math.radians(26.1160)
C=math.cos(TH);S=math.sin(TH)
TX=-.0580;TZ=-.1329

def project(p):
    x=p[0]-TX;z=p[2]-TZ
    return ((C*x+S*z)/SCALE,p[1]-3.0,(-S*x+C*z)/SCALE)

def area(t):
    a,b,c=t
    u=tuple(b[i]-a[i] for i in range(3))
    v=tuple(c[i]-a[i] for i in range(3))
    q=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    return math.sqrt(sum(x*x for x in q))/2.0

def componentize(rows):
    """Undirected graph: shared ORIGINAL OBJ vertex IDs, not matching XYZ."""
    parent=list(range(len(rows)))
    def root(i):
        while parent[i]!=i:
            parent[i]=parent[parent[i]]
            i=parent[i]
        return i
    def merge(a,b):
        a,b=root(a),root(b)
        if a!=b:parent[max(a,b)]=min(a,b)
    first={}
    for i,(_,ids) in enumerate(rows):
        for vid in ids:
            if vid in first:merge(i,first[vid])
            else:first[vid]=i
    out=defaultdict(list)
    for i,row in enumerate(rows):out[root(i)].append(row)
    return sorted((sorted(x) for x in out.values()),key=lambda x:x[0][0])

def parse_obj(path,allowed):
    vertices=[None];groups=defaultdict(list);target={}
    obj='(none)';mat='(none)';faceidx=0
    with path.open('r',encoding='utf-8',errors='replace') as stream:
        for line in stream:
            if line.startswith('o '):obj=line[2:].strip()
            elif line.startswith('usemtl '):mat=line[7:].strip()
            elif line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('f ') and (
                obj.startswith('Fld_Temple01_') or
                obj.startswith('FldObj_Temple01_PntSet_')):
                raw=[int(v.split('/')[0]) for v in line.split()[1:]]
                for k in range(1,len(raw)-1):
                    ids=(raw[0],raw[k],raw[k+1])
                    key=(obj,mat)
                    if key in allowed:groups[key].append((faceidx,ids))
                    if faceidx in FACE_IDS:target[faceidx]=(key,ids)
                    faceidx+=1
    return vertices,groups,target,faceidx

def main(objpath,fixturepath,output):
    size=objpath.stat().st_size
    sha=hashlib.sha256(objpath.read_bytes()).hexdigest()
    if size!=43263289 or sha!=PIN:
        raise ValueError('PHASE12B_PINNED_ORIGINAL_SIZE_OR_SHA_DRIFT')
    fixture=json.loads(fixturepath.read_text('utf-8'))
    if fixture['originalSourceSHA256']!=sha or not fixture['reviewOnly'] or (
      fixture['runtimePromotionAuthorized']) or len(fixture['perEdge'])!=16:
        raise ValueError('PHASE12B_PHASE11_FIXTURE_AUTHORITY_DRIFT')
    candidates={};locations={}
    for e in fixture['perEdge']:
        for c in e['closestOriginalSourceCandidates']:
            fi=c['originalFaceIndex']
            if fi not in FACE_IDS:continue
            if fi in candidates and candidates[fi]!=c:
                raise ValueError('PHASE12B_SAME_FACE_CONFLICTING_SOURCE_RECORD')
            candidates[fi]=c
            locations[fi]=(e['sourceComponentId'],e['boundaryEdgeIndex'])
    if len(candidates)!=16:
        raise ValueError('PHASE12B_ALL_16_ORIGINAL_FACE_IDS_REQUIRED')
    allowed={(c['sourceObject'],c['sourceMaterial']) for c in candidates.values()}
    if len(allowed)!=5 or any(
        not obj.startswith('Fld_Temple01_') or
        'PntSet' in obj or 'StageSide' in mat for obj,mat in allowed):
        raise ValueError('PHASE12B_ACTOR_STAGESIDE_OR_FAMILY_SCOPE_DRIFT')
    vertices,groups,targets,all_count=parse_obj(objpath,allowed)
    if set(targets)!=set(FACE_IDS) or set(groups)!=allowed:
        raise ValueError('PHASE12B_SELECTED_ORIGINAL_FACE_GROUPS_MISSING')
    selected=[];lookup={};family_summary=[]
    for (obj,mat),rows in sorted(groups.items()):
        groups_by_ids=componentize(rows)
        selected_count=0
        for comp in groups_by_ids:
            tracked=[fi for fi,ids in comp if fi in targets]
            if not tracked:continue
            selected_count+=1
            vids=sorted({vid for fi,ids in comp for vid in ids})
            coords=[project(vertices[vid]) for vid in vids]
            bound=[min(p[i] for p in coords) for i in range(3)]+[
                max(p[i] for p in coords) for i in range(3)]
            key=f'{obj}|{mat}|original-minface-{comp[0][0]}'
            record={
              'sourceComponentKey':key,'sourceObject':obj,'sourceMaterial':mat,
              'minOriginalFaceIndex':comp[0][0],
              'originalTriangleCount':len(comp),
              'originalVertexIdCount':len(vids),
              'sampledOriginalFaceIndices':tracked,
              'allOriginalFaceIndices':[fi for fi,ids in comp],
              'componentFaceAndOBJVertexIDHash':hashlib.sha256(''.join(
                 f'{fi}:{ids[0]},{ids[1]},{ids[2]};' for fi,ids in comp
                 ).encode('ascii')).hexdigest(),
              'originalSourceTriangle3DAreaSquareMeters':sum(area([
                  project(vertices[vid]) for vid in ids]) for fi,ids in comp),
              'bboxProjectXYZ':bound,
              'originalProjectYRangeMeters':[bound[1],bound[4]],
              'sourceTopologyAuthority':'SAME_OBJ_AND_MATERIAL_SHARED_ORIGINAL_VERTEX_IDS',
              'fullComponentAlreadyDisplayedIn124':'NOT_ESTABLISHED',
              'gameplayFloorCollisionPaintNavAuthority':'NONE',
              'reviewOnly':True,'runtimePromotionAuthorized':False
            }
            selected.append(record)
            for fi in tracked:lookup[fi]=key
        family_summary.append({
          'sourceObject':obj,'sourceMaterial':mat,
          'originalTriangleCount':len(rows),
          'originalVertexIDConnectedComponentCount':len(groups_by_ids),
          'trackedComponentCount':selected_count})
    if set(lookup)!=set(FACE_IDS):
        raise ValueError('PHASE12B_TARGET_FACE_NOT_COMPONENTIZED')
    per_face=[]
    for fi in FACE_IDS:
        (obj,mat),ids=targets[fi]
        candidate=candidates[fi]
        if (obj!=candidate['sourceObject'] or
            mat!=candidate['sourceMaterial'] or
            list(ids)!=candidate['originalFaceOBJVertexIds']):
            raise ValueError('PHASE12B_PINNED_OBJ_FACE_OR_IDS_MISMATCH_'+str(fi))
        xyz=[list(project(vertices[vid])) for vid in ids]
        for point_expected,point_original in zip(xyz,candidate['originalSourceTriangleXYZ']):
            for expected,original in zip(point_expected,point_original):
                if struct.pack('<d',expected)!=struct.pack('<d',original):
                    raise ValueError('PHASE12B_PINNED_FLOAT64_XYZ_MISMATCH_'+str(fi))
        per_face.append({
          'originalFaceIndex':fi,'originalOBJVertexIds':list(ids),
          'sourceObject':obj,'sourceMaterial':mat,'sourceComponentKey':lookup[fi],
          'underfaceSourceComponentId':locations[fi][0],
          'underfaceBoundaryEdgeIndex':locations[fi][1],
          'originalProjectTriangleXYZ':xyz,
          'source3DDistanceFromUnderfaceMeters':candidate['closest3DDistanceMeters']
        })
    ledger={
      'version':'T21_PHASE12B_ORIGINAL_VERTEX_ID_COMPONENT_GRAPH_V1',
      'originalSourceSHA256':sha,'sourceSizeBytes':size,
      'originalActiveFaceCount':all_count,
      'componentAlgorithm':'UNDIRECTED_SHARED_ORIGINAL_VERTEX_IDS_WITHIN_SAME_OBJ_AND_MATERIAL',
      'componentConnectedness':'SOURCE_OBJ_TOPOLOGY_ONLY_NOT_GAMEPLAY',
      'sourceScope':'STATIC_FLD_TEMPLE01_EXCLUDES_PNTSET_STAGESIDE',
      'trackedOriginalSourceFaces':len(per_face),
      'trackedSourceObjectMaterialGroups':len(allowed),
      'uniqueOriginalVertexIDConnectedComponents':len(selected),
      'groupSummary':family_summary,'selectedComponents':selected,'perFace':per_face,
      'originalFullReviewComponentsAdded':0,'currentFullReviewComponents':124,
      'currentWalkSourceComponents':64,'gameplayCollisionPaintNavAuthority':'NONE',
      'reviewOnly':True,'runtimePromotionAuthorized':False
    }
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(ledger,separators=(',',':')),encoding='utf-8')
    print('T21_PHASE12B_ORIGINAL_VERTEX_GRAPH',
      'tracked=16','families=5','connected_source_components='+str(len(selected)),
      'by_family='+str([(g['sourceMaterial'],g['trackedComponentCount']) for g in family_summary]),
      'artifact='+str(output))

def self_test():
    # Vertex 3 / 12 welds link faces; separate-vertex same XYZ never links.
    rows=[(1,(1,2,3)),(2,(3,4,5)),(3,(10,11,12)),
          (4,(12,13,14)),(5,(25,26,27))]
    found=componentize(rows)
    assert [len(c) for c in found]==[2,2,1],found
    assert [c[0][0] for c in found]==[1,3,5],found
    assert area([(0,0,0),(1,0,0),(0,0,1)])==0.5
    print('T21_PHASE12B_SYNTHETIC_TEST_PASS vertex-graph=2+2+1')

if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':self_test()
    elif len(sys.argv)==4:main(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]))
    else:raise SystemExit('Usage: phase12b.py ORIGINAL.obj phase11.json output.json | --self-test')
