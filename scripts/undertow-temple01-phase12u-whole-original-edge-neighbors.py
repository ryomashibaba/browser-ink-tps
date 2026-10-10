#!/usr/bin/env python3
"""Phase12U full SHA-pinned source edge survey. Diagnostic only; no mesh, collision or gameplay rights."""
from __future__ import annotations
import hashlib,json,math,sys
from collections import Counter,defaultdict
from pathlib import Path

PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046'
SIZE=43263289
SC=.964211
TH=math.radians(26.1160)
C,S=math.cos(TH),math.sin(TH)
def project(p):
    x,z=p[0]+.0580,p[2]+.1329
    return ((C*x+S*z)/SC,p[1]-3.,(-S*x+C*z)/SC)
def canon(p):return tuple(0. if x==0 else x for x in p)
def xyz_edge(a,b):
    x,y=canon(a),canon(b)
    if x==y:raise ValueError('PHASE12U_ZERO_XYZ_EDGE')
    return tuple(sorted((x,y)))
def id_edge(a,b):
    if a==b:raise ValueError('PHASE12U_ZERO_OBJ_ID_EDGE')
    return (a,b) if a<b else (b,a)
def parse(path):
    if path.stat().st_size!=SIZE or hashlib.sha256(path.read_bytes()).hexdigest()!=PIN:
        raise ValueError('PHASE12U_PINNED_ORIGINAL_BINARY_DRIFT')
    vertices=[None];faces=[];obj=mat='(none)'
    with path.open('r',encoding='utf8',errors='replace') as f:
        for line in f:
            if line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('o '):obj=line[2:].strip()
            elif line.startswith('usemtl '):mat=line[7:].strip()
            elif line.startswith('f ') and (obj.startswith('Fld_Temple01_') or obj.startswith('FldObj_Temple01_PntSet_')):
                row=[int(x.split('/')[0]) for x in line.split()[1:]]
                for k in range(1,len(row)-1):
                    ids=(row[0],row[k],row[k+1])
                    if min(ids)<=0 or max(ids)>=len(vertices):raise ValueError('PHASE12U_BAD_ORIGINAL_VERTEX_ID')
                    faces.append((ids,obj,mat))
    if len(faces)!=70396:raise ValueError('PHASE12U_ORIGINAL_FACE_COUNT_DRIFT_'+str(len(faces)))
    return vertices,faces
def components(faces):
    parent=list(range(len(faces)));first={}
    def root(i):
        while parent[i]!=i:
            parent[i]=parent[parent[i]];i=parent[i]
        return i
    def join(a,b):
        a,b=root(a),root(b)
        if a!=b:parent[max(a,b)]=min(a,b)
    for fi,(ids,obj,mat) in enumerate(faces):
        for vid in ids:
            key=(obj,mat,vid)
            if key in first:join(fi,first[key])
            else:first[key]=fi
    groups=defaultdict(list)
    for fi in range(len(faces)):groups[root(fi)].append(fi)
    return groups
def verify_t(faces,groups,t):
    if any([t.get('originalSourceSHA256')!=PIN,t.get('originalComponents')!=22,
            t.get('originalFaces')!=488,t.get('originalBoundaryEdges')!=524,
            t.get('exactXYZSeparateOBJIDMatches')!=176,t.get('noExactEdgeInHeld28')!=348,
            t.get('heldOriginalSourceComponents')!=28,t.get('heldSourceFaces')!=616,
            t.get('runtimePromotionAuthorized') is not False,
            t.get('physicalWeldOrWalkableFloorProven') is not False]):
        raise ValueError('PHASE12U_T_PINNED_AUTHORITY_DRIFT')
    if len(t['reports'])!=22:raise ValueError('PHASE12U_T_22_PARTS_REQUIRED')
    roots={fi:r for r,g in groups.items() for fi in g}
    shown=set()
    for part in t['reports']:
        g=groups[roots[part['minFace']]]
        if min(g)!=part['minFace']:raise ValueError('PHASE12U_T_MINFACE_DRIFT')
        shown.update(g);ids=Counter()
        for fi in g:
            tri=faces[fi][0]
            for i in range(3):ids[id_edge(tri[i],tri[(i+1)%3])]+=1
        boundary={k for k,v in ids.items() if v==1}
        evidence=part['originalBoundaryEvidence']
        listed={id_edge(*e['originalOBJEdge']) for e in evidence}
        if len(listed)!=len(evidence) or listed!=boundary or len(listed)!=part['boundary']:
            raise ValueError('PHASE12U_REBUILT_ORIGINAL_ID_BOUNDARY_DRIFT')
        for e in evidence:
            if e['sourceFace'] not in g or not set(e['originalOBJEdge']).issubset(faces[e['sourceFace']][0]):
                raise ValueError('PHASE12U_PINNED_ORIGINAL_FACE_ID_DRIFT')
    if len(shown)!=488:raise ValueError('PHASE12U_488_SOURCE_FACES_DRIFT')
    return shown
def search(vertices,faces,t):
    groups=components(faces)
    shown=verify_t(faces,groups,t)
    # Only the current original ID component is excluded for a given boundary;
    # the other 21 opt-in source parts remain valid ORIGINAL neighbor witnesses.
    owners={min(g):set(g) for g in groups.values() if min(g) in {p['minFace'] for p in t['reports']}}
    if len(owners)!=22:raise ValueError('PHASE12U_OWNER_COMPONENTS_DRIFT')
    id_index=defaultdict(list);xyz_index=defaultdict(list)
    for fi,(ids,obj,mat) in enumerate(faces):
        p=[project(vertices[v]) for v in ids]
        for k in range(3):
            a,b=ids[k],ids[(k+1)%3]
            id_index[id_edge(a,b)].append((fi,a,b))
            xyz_index[xyz_edge(p[k],p[(k+1)%3])].append((fi,a,b))
    rows=[];count=Counter();other_faces=set()
    for part in t['reports']:
        own=owners[part['minFace']]
        for e in part['originalBoundaryEvidence']:
            fi=e['sourceFace'];ids=tuple(e['originalOBJEdge'])
            tri=faces[fi][0]
            coords={v:canon(project(vertices[v])) for v in tri}
            if any(v not in coords for v in ids):raise ValueError('PHASE12U_SOURCE_ORIGINAL_IDS_MISSING')
            if any(coords[v]!=canon(p) for v,p in zip(ids,e['originalXYZ'])):
                raise ValueError('PHASE12U_ORIGINAL_FLOAT64_XYZ_DRIFT')
            i=id_edge(*ids);k=xyz_edge(coords[ids[0]],coords[ids[1]])
            im=[x for x in id_index.get(i,()) if x[0] not in own]
            gm=[x for x in xyz_index.get(k,()) if x[0] not in own]
            if im and not gm:raise ValueError('PHASE12U_SHARED_ORIGINAL_ID_BUT_DIFFERENT_XYZ')
            cl=('OTHER_SOURCE_ORIGINAL_OBJ_ID_SHARED_EDGE' if im else
                'OTHER_SOURCE_EXACT_XYZ_EDGE_DISTINCT_OBJ_IDS' if gm else
                'NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES')
            count[cl]+=1
            washeld=e['classification']!='NO_EXACT_SOURCE_EDGE_IN_HELD28'
            count['priorHeld28Matched' if washeld else 'priorHeld28Unmatched']+=1
            if not washeld:count['unmatched348_'+cl]+=1
            if washeld and not gm:raise ValueError('PHASE12U_T_HELD_MATCH_LOST')
            witnesses=[]
            for f,a,b in sorted(set(gm))[:8]:
                witnesses.append(dict(originalFaceIndex=f,originalOBJVertexIds=[a,b],
                  sourceObject=faces[f][1],sourceMaterial=faces[f][2],
                  exactOriginalOBJVertexIDEdge=id_edge(a,b)==i))
            other_faces.update(x[0] for x in gm)
            rows.append(dict(sourcePartMinFace=part['minFace'],sourceFace=fi,
              originalOBJVertexIds=list(ids),originalProjectedXYZ=e['originalXYZ'],
              priorHeld28Classification=e['classification'],wholeOriginalClassification=cl,
              wholeOriginalXYZEdgeWitnessCount=len(gm),wholeOriginalOBJIDEdgeWitnessCount=len(im),
              wholeOriginalWitnessesFirst8=witnesses,sourceOnly=True,gameplayAuthority='NONE'))
    if len(rows)!=524 or count['priorHeld28Matched']!=176 or count['priorHeld28Unmatched']!=348:
        raise ValueError('PHASE12U_524_BOUNDARIES_NOT_CONSERVED')
    per=[]
    for part in t['reports']:
        selected=[r for r in rows if r['sourcePartMinFace']==part['minFace']]
        per.append(dict(minFace=part['minFace'],mirrorMinFace=part['mirrorMinFace'],
         boundary=part['boundary'],counts=dict(Counter(r['wholeOriginalClassification'] for r in selected))))
    return dict(version='T21_PHASE12U_FULL_70396_ORIGINAL_ACTIVE_FACE_EDGE_SURVEY_V1',
      originalSourceSHA256=PIN,originalActiveFacesParsed=70396,sourceOnly=True,
      reviewOnly=True,runtimePromotionAuthorized=False,physicalWeldOrWalkableFloorProven=False,
      closedMeshOrGameplayAuthorized=False,sourceOriginalComponents=22,sourceOriginalFaces=488,
      sourceOriginalBoundaryEdges=524,priorHeld28Unmatched=348,priorHeld28Matched=176,
      searchedFacesBeyondShown=70396-488,otherOptInSourceComponentsSearched=True,
      ownOriginalComponentExcludedPerBoundary=True,
      wholeOriginalExternalSourceFaceWitnessCount=len(other_faces),
      counters=dict(count),perPart=per,rows=rows,
      scope='EXACT projected XYZ and OBJ-ID edges among full 70396 original faces; NOT near/intersecting/collision/walkable evidence')
def selftest():
    v=[None,(0.,0.,0.),(1.,0.,0.),(0.,1.,0.),(0.,0.,0.),(1.,0.,0.),(0.,-1.,0.)]
    a=((1,2,3),'Fld_Temple01_A','mat')
    b=((4,5,6),'Fld_Temple01_B','mat')
    assert len(components([a,b]))==2
    assert xyz_edge(project(v[1]),project(v[2]))==xyz_edge(project(v[4]),project(v[5]))
    assert id_edge(1,2)!=id_edge(4,5)
    print('T21_PHASE12U_SYNTHETIC_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==4:
        v,f=parse(Path(sys.argv[1]))
        data=json.loads(Path(sys.argv[2]).read_text('utf8'))
        result=search(v,f,data)
        Path(sys.argv[3]).write_text(json.dumps(result,separators=(',',':')),encoding='utf8')
        print('T21_PHASE12U_FULL_SOURCE_RESULTS',json.dumps({'counts':result['counters'],
         'originalFaces':70396,'boundaryEdges':524,'artifact':sys.argv[3]}))
    else:raise SystemExit('Usage: script.py --self-test | original.obj Phase12T.json output.json')
