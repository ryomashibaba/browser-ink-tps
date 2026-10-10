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
    zero_source_edges=0;duplicate_id_edges=0
    for fi,(ids,obj,mat) in enumerate(faces):
        p=[project(vertices[v]) for v in ids]
        for k in range(3):
            a,b=ids[k],ids[(k+1)%3]
            # Some other original active OBJ faces contain a zero-length
            # directed edge. They are real pinned source data, not grounds to
            # create or weld an edge. Record and exclude from the *lookup*.
            if a==b:
                duplicate_id_edges+=1
                continue
            if canon(p[k])==canon(p[(k+1)%3]):
                zero_source_edges+=1
                continue
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
      originalDegenerateZeroLengthSourceEdgesIgnored=zero_source_edges,
      originalDuplicateOBJIDSourceEdgesIgnored=duplicate_id_edges,
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

# Phase12V -- bounded original-source diagnostics for 88 boundary edges which have
# NO exact XYZ full edge anywhere else in the pinned original 70,396 triangles.
# This does NOT create a weld, collider, cap, floor, navmesh, paint or runtime authority.
import struct
from bisect import bisect_right
RADIUS=0.5
EPS=1.e-8
def dsub(a,b):return tuple(a[k]-b[k] for k in range(3))
def dadd(a,b):return tuple(a[k]+b[k] for k in range(3))
def dmul(a,t):return tuple(a[k]*t for k in range(3))
def ddot(a,b):return sum(a[k]*b[k] for k in range(3))
def dcross(a,b):return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dnorm(a):return math.sqrt(ddot(a,a))
def clamp(x):return max(0.,min(1.,x))
def segment_distance(p,q,a,b):
    d1=dsub(q,p);d2=dsub(b,a);r=dsub(p,a)
    aa=ddot(d1,d1);ee=ddot(d2,d2);f=ddot(d2,r)
    if aa<1e-24 and ee<1e-24:return dnorm(r)
    if aa<1e-24:s=0.;t=clamp(f/ee)
    else:
        c=ddot(d1,r)
        if ee<1e-24:s=clamp(-c/aa);t=0.
        else:
            bb=ddot(d1,d2);den=aa*ee-bb*bb
            s=clamp((bb*f-c*ee)/den) if den>1e-24 else 0.
            t=(bb*s+f)/ee
            if t<0:s=clamp(-c/aa);t=0.
            elif t>1:s=clamp((bb-c)/aa);t=1.
    return dnorm(dsub(dadd(p,dmul(d1,s)),dadd(a,dmul(d2,t))))
def point_triangle_distance(p,a,b,c):
    ab=dsub(b,a);ac=dsub(c,a);ap=dsub(p,a)
    d1=ddot(ab,ap);d2=ddot(ac,ap)
    if d1<=0 and d2<=0:return dnorm(ap)
    bp=dsub(p,b);d3=ddot(ab,bp);d4=ddot(ac,bp)
    if d3>=0 and d4<=d3:return dnorm(bp)
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:return dnorm(dsub(p,dadd(a,dmul(ab,d1/(d1-d3)))))
    cp=dsub(p,c);d5=ddot(ab,cp);d6=ddot(ac,cp)
    if d6>=0 and d5<=d6:return dnorm(cp)
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:return dnorm(dsub(p,dadd(a,dmul(ac,d2/(d2-d6)))))
    va=d3*d6-d5*d4
    if va<=0 and d4-d3>=0 and d5-d6>=0:
        t=(d4-d3)/(d4-d3+d5-d6)
        return dnorm(dsub(p,dadd(b,dmul(dsub(c,b),t))))
    den=va+vb+vc
    if abs(den)<1e-24:
        return min(segment_distance(p,p,a,b),segment_distance(p,p,b,c),segment_distance(p,p,c,a))
    return dnorm(dsub(p,dadd(dadd(a,dmul(ab,vb/den)),dmul(ac,vc/den))))
def strict_pierce(p,q,triangle):
    a,b,c=triangle;d=dsub(q,p);e1=dsub(b,a);e2=dsub(c,a)
    h=dcross(d,e2);det=ddot(e1,h)
    if abs(det)<1e-12:return False
    inv=1/det;s=dsub(p,a);u=inv*ddot(s,h)
    if u<=1e-9 or u>=1-1e-9:return False
    v=inv*ddot(d,dcross(s,e1))
    if v<=1e-9 or u+v>=1-1e-9:return False
    t=inv*ddot(e2,dcross(s,e1))
    return 1e-9<t<1-1e-9
def segment_triangle_distance(p,q,triangle):
    if strict_pierce(p,q,triangle):return 0.
    a,b,c=triangle
    return min(point_triangle_distance(p,a,b,c),point_triangle_distance(q,a,b,c),
        segment_distance(p,q,a,b),segment_distance(p,q,b,c),segment_distance(p,q,c,a))
def collinear_overlap(p,q,a,b):
    d=dsub(q,p);length=dnorm(d);e=dsub(b,a);length2=dnorm(e)
    if length<=EPS:raise ValueError('PHASE12V_ZERO_TARGET_ORIGINAL_EDGE')
    if length2<=EPS:return 0.
    if dnorm(dcross(d,e))>EPS*length*length2:return 0.
    if dnorm(dcross(d,dsub(a,p)))>EPS*length:return 0.
    if dnorm(dcross(d,dsub(b,p)))>EPS*length:return 0.
    lo,hi=sorted((ddot(dsub(a,p),d)/(length*length),
                  ddot(dsub(b,p),d)/(length*length)))
    return max(0.,min(1.,hi)-max(0.,lo))*length
def bbox(t):
    return tuple(min(v[k] for v in t) for k in range(3))+tuple(max(v[k] for v in t) for k in range(3))
def nearby_box(a,b,r):
    return all(a[k]<=b[k+3]+r and b[k]<=a[k+3]+r for k in range(3))
def verify_88(source,vertices,faces,groups):
    if (source.get('originalSourceSHA256')!=PIN or
        source.get('originalActiveFacesParsed')!=70396 or
        source.get('sourceOriginalBoundaryEdges')!=524 or
        source.get('runtimePromotionAuthorized') is not False or
        source.get('physicalWeldOrWalkableFloorProven') is not False):
        raise ValueError('PHASE12V_PHASE12U_EVIDENCE_AUTHORITY_DRIFT')
    target=[r for r in source['rows'] if
        r['wholeOriginalClassification']=='NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES']
    if len(target)!=88 or len({r['sourcePartMinFace'] for r in target})!=8:
        raise ValueError('PHASE12V_EIGHT_PARTS_88_TARGETS_REQUIRED')
    owners={min(g):set(g) for g in groups.values()}
    seen=set()
    for r in target:
        fi=r['sourceFace'];ids=r['originalOBJVertexIds']
        if r['sourcePartMinFace'] not in owners or fi not in owners[r['sourcePartMinFace']]:
            raise ValueError('PHASE12V_SOURCE_OWNER_COMPONENT_MISMATCH')
        if len(ids)!=2 or not set(ids).issubset(faces[fi][0]):
            raise ValueError('PHASE12V_SOURCE_IDS_NOT_ON_FACE')
        key=(r['sourcePartMinFace'],fi,id_edge(*ids))
        if key in seen:raise ValueError('PHASE12V_DUPLICATE_BOUNDARY_EDGE')
        seen.add(key)
        for v,p in zip(ids,r['originalProjectedXYZ']):
            if any(struct.pack('<d',x)!=struct.pack('<d',y) for x,y in zip(project(vertices[v]),p)):
                raise ValueError('PHASE12V_PINNED_FLOAT64_VERTEX_MISMATCH')
    return target,owners
def analyze_v(vertices,faces,source):
    groups=components(faces)
    target,owners=verify_88(source,vertices,faces,groups)
    projected=[None]+[canon(project(v)) for v in vertices[1:]]
    triangles=[];boxes=[];degenerate=0
    for ids,_,_ in faces:
        t=tuple(projected[v] for v in ids)
        if len(set(t))<3 or dnorm(dcross(dsub(t[1],t[0]),dsub(t[2],t[0])))<1e-12:
            degenerate+=1;triangles.append(None);boxes.append(None)
        else:triangles.append(t);boxes.append(bbox(t))
    sweep=sorted((b[0],i) for i,b in enumerate(boxes) if b is not None)
    minimum_x=[s[0] for s in sweep]
    rows=[];counts=Counter();candidate_count=0
    for original in target:
        p,q=(projected[v] for v in original['originalOBJVertexIds'])
        bb=bbox((p,q));own=owners[original['sourcePartMinFace']]
        last=bisect_right(minimum_x,bb[3]+RADIUS)
        observed=[];near=math.inf;has_overlap=False;has_pierce=False;has_contact=False;tested=0
        overlap_proof=None;pierce_proof=None
        for _,fi in sweep[:last]:
            if fi in own:continue
            b=boxes[fi]
            if not nearby_box(bb,b,RADIUS):continue
            tri=triangles[fi];tested+=1
            d=segment_triangle_distance(p,q,tri)
            if d>RADIUS+1e-9:continue
            near=min(near,d)
            overlap=max(collinear_overlap(p,q,tri[k],tri[(k+1)%3]) for k in range(3))
            pierce=strict_pierce(p,q,tri)
            if overlap>EPS:
                has_overlap=True
                if overlap_proof is None:overlap_proof=dict(originalFaceIndex=fi,overlapMeters=round(overlap,9))
            if pierce:
                has_pierce=True
                if pierce_proof is None:pierce_proof=dict(originalFaceIndex=fi)
            if d<=EPS:has_contact=True
            witness=dict(originalFaceIndex=fi,sourceObject=faces[fi][1],
               sourceMaterial=faces[fi][2],originalOBJVertexIds=list(faces[fi][0]),
               originalProjectedTriangleXYZ=[list(v) for v in tri],distanceMeters=round(d,9),
               collinearOverlapMeters=round(overlap,9),strictTriangleInteriorPiercing=pierce)
            observed.append(witness)
            observed.sort(key=lambda item:(item['distanceMeters'],item['originalFaceIndex']))
            if len(observed)>5:observed.pop()
        label=('PARTIAL_COLLINEAR_EDGE_OVERLAP' if has_overlap else
            'STRICT_TRIANGLE_INTERIOR_PIERCE' if has_pierce else
            'ZERO_DISTANCE_POINT_OR_COPLANAR_CONTACT' if has_contact else
            'NEAR_WITHIN_HALF_METER' if near<math.inf else 'NONE_WITHIN_HALF_METER')
        counts[label]+=1;candidate_count+=tested
        rows.append(dict(sourcePartMinFace=original['sourcePartMinFace'],
          sourceFace=original['sourceFace'],originalOBJVertexIds=original['originalOBJVertexIds'],
          originalProjectedXYZ=original['originalProjectedXYZ'],classification=label,
          hasPartialCollinearOverlap=has_overlap,hasStrictTriangleInteriorPiercing=has_pierce,
          nearestDistanceMeters=None if near==math.inf else round(near,9),
          originalTrianglesTestedAfterBBox=tested,witnessesFirst5=observed,
          partialOverlapProof=overlap_proof,interiorPiercingProof=pierce_proof,
          sourceOnly=True,gameplayAuthority='NONE'))
    return dict(version='T21_PHASE12V_PINNED_ORIGINAL_88_PARTIAL_EDGE_AND_TRIANGLE_NEIGHBORS_V1',
      originalSourceSHA256=PIN,sourceOnly=True,reviewOnly=True,
      runtimePromotionAuthorized=False,gameplayCollisionPaintNavScoringAuthority='NONE',
      originalActiveFacesParsed=70396,originalUnmatchedBoundaryEdges=88,
      originalPartsWithUnmatchedBoundary=8,sourceOriginalWholeBoundaryEdges=524,
      searchRadiusMeters=RADIUS,originalDegenerateFacesSkipped=degenerate,
      originalTrianglesTestedAfterBBox=candidate_count,counters=dict(counts),
      perPart=[dict(minFace=f,counts=dict(Counter(r['classification'] for r in rows
         if r['sourcePartMinFace']==f))) for f in sorted({r['sourcePartMinFace'] for r in rows})],
      rows=rows,physicalWeldOrWalkableFloorProven=False,
      note='Evidence only: exact segment partial overlaps, strict crossings, zero-distance contacts and 0.5m nearby; nothing outside radius is proved absent.')
def synthetic_v():
    a=(0.,0.,0.);b=(2.,0.,0.)
    assert abs(collinear_overlap(a,b,(1.,0.,0.),(3.,0.,0.))-1.)<1e-8
    assert collinear_overlap(a,b,(2.,1.,0.),(3.,1.,0.))==0.
    assert abs(segment_distance(a,b,(1.,-1.,0.),(1.,1.,0.)))<1e-8
    t=((-1.,-1.,0.),(1.,-1.,0.),(0.,1.,0.))
    assert strict_pierce((0.,0.,-1.),(0.,0.,1.),t)
    assert not strict_pierce((2.,2.,-1.),(2.,2.,1.),t)
    assert segment_triangle_distance((0.,0.,-.2),(0.,0.,-.1),t)>.09
    print('T21_PHASE12V_SYNTHETIC_GEOMETRY_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':synthetic_v()
    elif len(sys.argv)==4:
        verts,fs=parse(Path(sys.argv[1]))
        data=json.loads(Path(sys.argv[2]).read_text('utf8'))
        out=analyze_v(verts,fs,data)
        Path(sys.argv[3]).write_text(json.dumps(out,separators=(',',':')),encoding='utf8')
        print('T21_PHASE12V_SOURCE_ONLY_CONTACT_EVIDENCE',json.dumps(dict(
         sourceFaces=70396,unmatched=88,counters=out['counters'],artifact=sys.argv[3])))
    else:raise SystemExit('Usage: phase12v.py --self-test | original.obj phase12u.json output.json')
