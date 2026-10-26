#!/usr/bin/env python3
"""B238: full SHA-256 pinned original KiTrix Temple01 OBJ source scan.

Never generates, edits, welds, inserts or authorizes polygons for the game.
Whole selected common + turf source face inventory; exact original OBJ
vertex-ID component grouping, conservative local search, closest 3D
segment/triangle source evidence and explicit gameplay authority denial.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

PIN="a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046"
SIZE=43263289
FACES=70396
VERTICES=375948
REG=(0.964211,26.1160,-.0580,-.1329)
RADIUS=8.0
CONTACT=.35

def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def plus(a,b,k=1.):return tuple(x+k*y for x,y in zip(a,b))
def d(a,b):return math.dist(a,b)
def close_triangle(p,a,b,c):
    ab=sub(b,a);ac=sub(c,a);ap=sub(p,a);d1=dot(ab,ap);d2=dot(ac,ap)
    if d1<=0 and d2<=0:return a
    bp=sub(p,b);d3=dot(ab,bp);d4=dot(ac,bp)
    if d3>=0 and d4<=d3:return b
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:return plus(a,ab,d1/(d1-d3))
    cp=sub(p,c);d5=dot(ab,cp);d6=dot(ac,cp)
    if d6>=0 and d5<=d6:return c
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:return plus(a,ac,d2/(d2-d6))
    va=d3*d6-d5*d4
    if va<=0 and d4-d3>=0 and d5-d6>=0:
        return plus(b,sub(c,b),(d4-d3)/((d4-d3)+(d5-d6)))
    k=va+vb+vc
    if abs(k)<1e-15:return min((a,b,c),key=lambda q:d(p,q))
    v=vb/k;w=vc/k
    return plus(plus(a,ab,v),ac,w)
def closest_segments(a,b,c,d_):
    u=sub(b,a);v=sub(d_,c);w=sub(a,c)
    aa=dot(u,u);bb=dot(u,v);cc=dot(v,v)
    dd=dot(u,w);ee=dot(v,w);D=aa*cc-bb*bb
    if aa<1e-18 or cc<1e-18:
        cand=[(a,close_triangle(a,c,d_,d_)),(b,close_triangle(b,c,d_,d_))]
        if aa<1e-18:return a,c if d(a,c)<d(a,d_) else d_
        if cc<1e-18:return a,c
    if D<1e-15:sn=0.;sd=1.;tn=ee;td=cc
    else:
        sn=bb*ee-cc*dd;tn=aa*ee-bb*dd;sd=D;td=D
        if sn<0:sn=0.;tn=ee;td=cc
        elif sn>sd:sn=sd;tn=ee+bb;td=cc
    if tn<0:
        tn=0.
        if -dd<0:sn=0.
        elif -dd>aa:sn=sd
        else:sn=-dd;sd=aa
    elif tn>td:
        tn=td
        if -dd+bb<0:sn=0.
        elif -dd+bb>aa:sn=sd
        else:sn=-dd+bb;sd=aa
    t=sn/sd if abs(sn)>1e-20 else 0.
    s=tn/td if abs(tn)>1e-20 else 0.
    return plus(a,u,t),plus(c,v,s)
def segment_triangle(a,b,tri):
    x,y,z=tri
    ab=sub(b,a);u=sub(y,x);v=sub(z,x)
    normal=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    norm=math.sqrt(dot(normal,normal))
    if norm>1e-12:
        denom=dot(normal,ab)
        if abs(denom)>1e-15:
            t=dot(normal,sub(x,a))/denom
            if -1e-10<=t<=1+1e-10:
                p=plus(a,ab,max(0.,min(1.,t)))
                q=close_triangle(p,x,y,z)
                if d(p,q)<1e-9:return 0.,p,q
    arr=[(a,close_triangle(a,x,y,z)),(b,close_triangle(b,x,y,z))]
    for e,f in ((x,y),(y,z),(z,x)):
        arr.append(closest_segments(a,b,e,f))
    p,q=min(arr,key=lambda x:d(x[0],x[1]))
    return d(p,q),p,q
def bbox(vertices):
    return ((min(x[0] for x in vertices),max(x[0] for x in vertices)),
            (min(x[1] for x in vertices),max(x[1] for x in vertices)),
            (min(x[2] for x in vertices),max(x[2] for x in vertices)))
def near(a,b,r):
    return all(a[i][0]<=b[i][1]+r and a[i][1]+r>=b[i][0] for i in range(3))
def test():
    tri=((0.,0.,0.),(2.,0.,0.),(0.,0.,2.))
    assert segment_triangle((.25,1.,.25),(.25,-1.,.25),tri)[0]<1e-9
    assert abs(segment_triangle((.5,1.,.5),(.5,1.5,.5),tri)[0]-1)<1e-9
    p,q=closest_segments((0.,0.,0.),(2.,0.,0.),(1.,1.,-1.),(1.,1.,1.))
    assert abs(d(p,q)-1)<1e-9,(p,q)
    print("B238_ORIGINAL_SOURCE_TRIANGLE_GEOMETRY_SELFTEST_PASS")
def read(path):
    if path.stat().st_size!=SIZE:raise ValueError("B238_ORIGINAL_LFS_SIZE_NOT_PINNED")
    sha=hashlib.sha256(path.read_bytes()).hexdigest()
    if sha!=PIN:raise ValueError("B238_ORIGINAL_LFS_SHA256_MISMATCH_"+sha)
    vertices=[None];faces=[];obj=material="(unset)"
    with path.open("r",encoding="utf-8",errors="replace") as f:
        for line in f:
            if line.startswith("v "):vertices.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith("o "):obj=line[2:].strip()
            elif line.startswith("usemtl "):material=line[7:].strip()
            elif line.startswith("f ") and (obj.startswith("Fld_Temple01_") or obj.startswith("FldObj_Temple01_PntSet_")):
                ids=[int(x.split("/")[0]) for x in line.split()[1:]]
                for k in range(1,len(ids)-1):
                    ids3=(ids[0],ids[k],ids[k+1])
                    if min(ids3)<1 or max(ids3)>=len(vertices):raise ValueError("B238_ORIGINAL_OBJ_IDS_INVALID")
                    faces.append((ids3,obj,material))
    if len(vertices)-1!=VERTICES or len(faces)!=FACES:
        raise ValueError(f"B238_ORIGINAL_FACES_VERTICES_DRIFT_{len(faces)}_{len(vertices)-1}")
    return vertices,faces
def main(path,seedpath,output):
    s=json.loads(seedpath.read_text("utf-8"))
    if s["sha256"]!=PIN or s["fileBytes"]!=SIZE or len(s["sides"])!=2:
        raise ValueError("B238_ORIGINAL_SEAM_SOURCE_GATE_FAILED")
    transform=s["transform"]
    if any([abs(transform["pdfToModelScale"]-REG[0])>1e-8,
      abs(transform["rotationDegrees"]-REG[1])>1e-8,
      abs(transform["translateX"]-REG[2])>1e-8,
      abs(transform["translateZ"]-REG[3])>1e-8]):
        raise ValueError("B238_ORIGINAL_REGISTERED_COORD_FRAME_DRIFT")
    vertices,faces=read(path)
    theta=math.radians(transform["rotationDegrees"])
    cos=math.cos(theta);sin=math.sin(theta);scale=transform["pdfToModelScale"]
    def project(p):
        x=p[0]-transform["translateX"];z=p[2]-transform["translateZ"]
        return ((cos*x+sin*z)/scale,p[1]-3.,(-sin*x+cos*z)/scale)
    coords=[None]+[project(v) for v in vertices[1:]]
    parent=list(range(len(faces)))
    rank=[0]*len(faces)
    indexed={}
    def root(i):
        while i!=parent[i]:
            parent[i]=parent[parent[i]];i=parent[i]
        return i
    def union(i,j):
        a=root(i);b=root(j)
        if a==b:return
        if rank[a]<rank[b]:a,b=b,a
        parent[b]=a
        if rank[a]==rank[b]:rank[a]+=1
    for i,(ids,obj,mat) in enumerate(faces):
        for vertex in ids:
            key=(obj,mat,vertex)
            other=indexed.setdefault(key,i)
            if other!=i:union(i,other)
    region=[]
    for side in s["sides"]:
        name=side["side"]
        contour=side["rightLowSourcePolygonProjectXZ"];y=side["registeredRightLowProjectY"]
        edge=side["authenticSlope01UpperSourceEdgeProjectXYZ"]
        if y!=4.5 or len(edge)!=2 or len(contour)<4:
            raise ValueError("B238_REGISTERED_REAL_SOURCE_BOUNDARY_MISSING")
        segments={"registeredRightLow":[((a[0],y,a[1]),(b[0],y,b[1])) for a,b in zip(contour,contour[1:]+contour[:1])],
            "authenticSlope01Top":[(tuple(edge[0]),tuple(edge[1]))]}
        pointset=[p for line in segments.values() for pair in line for p in pair]
        region.append((name,segments,bbox(pointset)))
    records={}
    comps=defaultdict(lambda:dict(sourceFaces=0,objects=set(),materials=set(),sides={}))
    counts=defaultdict(int)
    for i,(ids,obj,mat) in enumerate(faces):
        tri=tuple(coords[v] for v in ids)
        rootid=root(i);record=comps[rootid]
        record["sourceFaces"]+=1
        record["objects"].add(obj);record["materials"].add(mat)
        box=bbox(tri)
        for side,segments,regionbox in region:
            if not near(box,regionbox,RADIUS):continue
            counts[side]+=1
            measured={}
            for label,edges in segments.items():
                best=None
                for a,b in edges:
                    if not near(box,bbox([a,b]),RADIUS):continue
                    dist,p,q=segment_triangle(a,b,tri)
                    if best is None or dist<best[0]:best=(dist,p,q)
                if best is not None:measured[label]=best
            if not measured:continue
            row=record["sides"].setdefault(side,{})
            for label,(dist,p,q) in measured.items():
                if label not in row or dist<row[label]["distanceMeters"]:
                    row[label]={"distanceMeters":dist,"originalActiveFaceIndex":i,
                      "originalOBJVertexIDs":ids,"originalObject":obj,
                      "originalMaterial":mat,"registeredBoundaryWitness":p,
                      "originalTriangleNearestWitness":q}
    result={}
    for side,_,_ in region:
        rankrows=[]
        for key,rec in comps.items():
            anchors=rec["sides"].get(side,{})
            if len(anchors)!=2:continue
            a=anchors["registeredRightLow"];b=anchors["authenticSlope01Top"]
            rankrows.append({
               "originalObjIdComponentRootFaceIndex":key,
               "originalObjMaterialConnectedFaceCount":rec["sourceFaces"],
               "originalSourceObjects":sorted(rec["objects"]),
               "originalMaterials":sorted(rec["materials"]),
               "rightLow":a,"slopeTop":b,
               "sumDistanceMeters":a["distanceMeters"]+b["distanceMeters"],
               "geometricDoubleContactWithin035":
                 a["distanceMeters"]<=CONTACT and b["distanceMeters"]<=CONTACT,
               "physicalKccTraversalProven":False,
               "runtimePromotionAuthorized":False})
        rankrows.sort(key=lambda q:q["sumDistanceMeters"])
        result[side]={"fullyPinnedOriginalSourceFaces":FACES,
          "broadphaseTriangleHits":counts[side],
          "originalObjIdConnectedComponentsWithBothRegionalAnchors":len(rankrows),
          "closestConnectedOriginalComponentCandidates":rankrows[:16],
          "geometricDoubleContactCandidateCount":
            sum(x["geometricDoubleContactWithin035"] for x in rankrows),
          "sourceOnly":True,"noDefaultColliders":True,
          "originalCpuRoutesCertified":"0/12"}
    report={"version":"B238_FULL_PINNED_ORIGINAL_OBJ_SEAM_3D_COMPONENT_SURVEY_V1",
       "sourceRepository":"kirakira-dev/KiTrix",
       "sourceFile":"stages/Vss_Temple01/Vss_Temple01.obj",
       "sha256":PIN,"sourceBytes":SIZE,
       "wholeOriginalSourceActiveTrianglesParsed":FACES,
       "wholeOriginalSourceVerticesParsed":VERTICES,
       "componentScope":"OBJ_VERTEX_ID_SAME_OBJECT_AND_MATERIAL",
       "fullOriginalObjPassed":True,
       "sourceRegionRadiusMeters":RADIUS,
       "exactOriginalRegisteredSeamsFromSourceSeed":True,
       "sides":result,"runtimePromotionAuthorized":False,
       "cpuOrRecastGameplayPathAuthenticated":False,
       "originalStage":"25/17/26/0",
       "originalOpponentPathsCertified":"0/12","officialWinner":"NONE"}
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf8")
    print("B238_FULL_PINNED_70396_FACE_3D_SEAM_SURVEY",json.dumps({
       "sourceSHA256":PIN,
       "originalFaces":FACES,
       "originalVertices":VERTICES,
       "bySide":{name:{
         "nativeRegionTriangleHits":data["broadphaseTriangleHits"],
         "nativeOriginalConnectedCandidateCount":
           data["originalObjIdConnectedComponentsWithBothRegionalAnchors"],
         "geometricDoubleContacts":
           data["geometricDoubleContactCandidateCount"],
         "topOriginalComponentCandidates":[{
           "originalSourceObjects":q["originalSourceObjects"],
           "materials":q["originalMaterials"],
           "connectedFaces":q["originalObjMaterialConnectedFaceCount"],
           "rightLowMeters":q["rightLow"]["distanceMeters"],
           "slopeTopMeters":q["slopeTop"]["distanceMeters"],
           "sumDistanceMeters":q["sumDistanceMeters"]}
           for q in data["closestConnectedOriginalComponentCandidates"][:6]]
       } for name,data in result.items()},
       "productionAuthorized":False,
       "realCpuRouteCertified":"0/12"}))
if __name__=="__main__":
    args=argparse.ArgumentParser()
    args.add_argument("--self-test",action="store_true")
    args.add_argument("--obj",type=Path)
    args.add_argument("--seed",type=Path)
    args.add_argument("--out",type=Path)
    a=args.parse_args()
    if a.self_test:test()
    else:
        if not a.obj or not a.seed or not a.out:args.error("--obj, --seed and --out required")
        main(a.obj,a.seed,a.out)
