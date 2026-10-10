#!/usr/bin/env python3
"""Phase12G: original OBJ segment/triangle contact audit for four open FloorLine seams.
Read-only SHA-pinned original; source geometry is NOT game collision or connectivity.
"""
from __future__ import annotations
from pathlib import Path
from collections import defaultdict
import hashlib,json,math,runpy,sys

F=runpy.run_path(str(Path(__file__).with_name('undertow-temple01-phase12f-original-edge-contact.py')))
B=F['B']; PIN=B['PIN']
TARGETS=((60006,1),(60006,2),(61728,1),(61728,2))
NEAR=.75
EPS=1e-9

def sub(x,y):return tuple(a-b for a,b in zip(x,y))
def dot(x,y):return sum(a*b for a,b in zip(x,y))
def cross(x,y):return (x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0])
def point_at(a,b,t):return tuple(a[i]+t*(b[i]-a[i]) for i in range(3))
def scalar2(a,b):return a[0]*b[1]-a[1]*b[0]
def segment_segment_distance(p0,p1,q0,q1):
    """True shortest 3D distance of two finite segments, including endpoints."""
    u=sub(p1,p0);v=sub(q1,q0);w=sub(p0,q0)
    aa=dot(u,u);bb=dot(u,v);cc=dot(v,v);dd=dot(u,w);ee=dot(v,w)
    D=aa*cc-bb*bb;sN=0.0;sD=D;tN=0.0;tD=D
    if aa<EPS*EPS:return math.sqrt(min(dot(sub(p0,point_at(q0,q1,i)),sub(p0,point_at(q0,q1,i))) for i in (0,1)))
    if cc<EPS*EPS:return math.sqrt(min(dot(sub(q0,point_at(p0,p1,i)),sub(q0,point_at(p0,p1,i))) for i in (0,1)))
    if D<1e-20:sN=0.0;sD=1.0;tN=ee;tD=cc
    else:
        sN=bb*ee-cc*dd;tN=aa*ee-bb*dd
        if sN<0:sN=0;tN=ee;tD=cc
        elif sN>sD:sN=sD;tN=ee+bb;tD=cc
    if tN<0:
        tN=0
        if -dd<0:sN=0
        elif -dd>aa:sN=sD
        else:sN=-dd;sD=aa
    elif tN>tD:
        tN=tD
        if (-dd+bb)<0:sN=0
        elif (-dd+bb)>aa:sN=sD
        else:sN=-dd+bb;sD=aa
    s=sN/sD if abs(sN)>1e-20 else 0.
    t=tN/tD if abs(tN)>1e-20 else 0.
    return math.dist(point_at(p0,p1,s),point_at(q0,q1,t))

def tri_contact(p0,p1,tri):
    """Classify actual 3D intersection, including coplanar intervals.
    Return source-only evidence: no collider or navigable topology inference.
    """
    a,b,c=tri;n=cross(sub(b,a),sub(c,a));norm=math.sqrt(dot(n,n))
    if norm<1e-12:return None
    axis=max(range(3),key=lambda i:abs(n[i]))
    two=lambda p:tuple(p[i] for i in range(3) if i!=axis)
    t2=[two(p) for p in tri];s0=two(p0);s1=two(p1)
    direction=1 if scalar2(sub(t2[1],t2[0]),sub(t2[2],t2[0]))>0 else -1
    def inside(q):
        return all(direction*scalar2(sub(t2[(i+1)%3],t2[i]),sub(q,t2[i]))>=-1e-9
                   for i in range(3))
    d0=dot(n,sub(p0,a))/norm;d1=dot(n,sub(p1,a))/norm
    if abs(d0)<=EPS and abs(d1)<=EPS:
        lo=0.;hi=1.
        for i in range(3):
            va=t2[i];vb=t2[(i+1)%3]
            f0=direction*scalar2(sub(vb,va),sub(s0,va))
            f1=direction*scalar2(sub(vb,va),sub(s1,va))
            if f0<-1e-9 and f1<-1e-9:return None
            delta=f1-f0
            if abs(delta)<=1e-15:continue
            cut=-f0/delta
            if delta>0:lo=max(lo,cut)
            else:hi=min(hi,cut)
            if hi<lo-1e-9:return None
        lo=max(0.,lo);hi=min(1.,hi)
        if hi<lo-1e-9:return None
        a3=point_at(p0,p1,lo);b3=point_at(p0,p1,hi)
        return {'contactClass':'COPLANAR_SOURCE_SEGMENT_OVERLAP' if math.dist(a3,b3)>1e-7 else 'COPLANAR_SOURCE_POINT_ONLY',
                'sourceSegmentParameters':[lo,hi],
                'sourceContactXYZ':[list(a3),list(b3)],
                'overlapLengthMeters':math.dist(a3,b3),
                'sourceNormalPlaneDistancesMeters':[d0,d1]}
    if d0*d1>0 or abs(d0-d1)<1e-14:return None
    t=d0/(d0-d1)
    if t<-1e-9 or t>1+1e-9:return None
    t=max(0.,min(1.,t));q=point_at(p0,p1,t)
    if not inside(two(q)):return None
    return {'contactClass':'SOURCE_POINT_PLANE_INTERSECTION',
            'sourceSegmentParameters':[t,t],
            'sourceContactXYZ':[list(q),list(q)],
            'overlapLengthMeters':0.,
            'sourceNormalPlaneDistancesMeters':[d0,d1]}

def segment_triangle_distance(a,b,tri):
    touch=tri_contact(a,b,tri)
    if touch:return 0.,touch
    near=min(F['closest'](a,tri),F['closest'](b,tri))
    for i in range(3):
        near=min(near,segment_segment_distance(a,b,tri[i],tri[(i+1)%3]))
    return near,None

def run(original,phase12f,outpath):
    if original.stat().st_size!=43263289 or hashlib.sha256(original.read_bytes()).hexdigest()!=PIN:
        raise ValueError('PHASE12G_PINNED_43MB_SOURCE_SHA_FAILURE')
    f=json.loads(phase12f.read_text('utf8'))
    if (f['version']!='T21_PHASE12F_PINNED_16_SOURCE_EDGE_TOPOLOGY_V1'
        or f['originalSourceSHA256']!=PIN or f['sourceBoundaryEdgeCount']!=16
        or f['tierCounts']!={'COINCIDENT_XYZ_NOT_WELDED':12,'NEARBY_TRIANGLE_NOT_CONNECTIVITY':4}
        or not f['reviewOnly'] or f['runtimePromotionAuthorized']):
        raise ValueError('PHASE12G_16_EDGE_BASELINE_DRIFT')
    targets={ (e['sourceOriginalMinFace'],e['edgeNumber']):e for e in f['edges']
        if e['tier']=='NEARBY_TRIANGLE_NOT_CONNECTIVITY' }
    if set(targets)!=set(TARGETS):raise ValueError('PHASE12G_ONLY_FOUR_UNRESOLVED_BOUNDARIES_ALLOWED')
    for e in targets.values():
        if e['exactOBJEdgeNeighborCount'] or e['coordinateOnlyNeighborCount'] or e['oneOBJIdNeighborCount']:
            raise ValueError('PHASE12G_NONWELDED_SOURCE_TIER_RECLASSIFICATION_FORBIDDEN')
    points=[None];obj='';material='';face_idx=0
    pairs=sorted(targets)
    seen={key:[] for key in pairs}
    counts={key:defaultdict(int) for key in pairs}
    original_source_faces={60006,60007,61516,61517,61728,61729,62086,62087}
    with original.open('r',encoding='utf8',errors='replace') as lines:
        for line in lines:
            if line.startswith('v '):points.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('o '):obj=line[2:].strip()
            elif line.startswith('usemtl '):material=line[7:].strip()
            elif line.startswith('f ') and (obj.startswith('Fld_Temple01_') or
                  obj.startswith('FldObj_Temple01_PntSet_')):
                ids=[int(n.split('/')[0]) for n in line.split()[1:]]
                for k in range(1,len(ids)-1):
                    fids=(ids[0],ids[k],ids[k+1])
                    if face_idx not in original_source_faces:
                        tri=[B['project'](points[i]) for i in fids]
                        lo=[min(p[i] for p in tri) for i in range(3)]
                        hi=[max(p[i] for p in tri) for i in range(3)]
                        for key,e in targets.items():
                            a,b=e['originalProjectEndpointXYZ']
                            segment_lo=[min(a[i],b[i])-NEAR for i in range(3)]
                            segment_hi=[max(a[i],b[i])+NEAR for i in range(3)]
                            if any(segment_hi[i]<lo[i] or segment_lo[i]>hi[i] for i in range(3)):
                                continue
                            try:dist,contact=segment_triangle_distance(a,b,tri)
                            except ValueError:continue
                            if dist>NEAR:continue
                            kind=contact['contactClass'] if contact else 'SOURCE_SEGMENT_NEAR_TRIANGLE_NO_INTERSECTION'
                            counts[key][kind]+=1
                            seen[key].append({'originalFaceIndex':face_idx,'sourceObject':obj,
                                'sourceMaterial':material,'originalOBJVertexIds':list(fids),
                                'sourceIsActorPntSetUntrusted':obj.startswith('FldObj_Temple01_PntSet_'),
                                'segmentToTriangleDistanceMeters':dist,'contact':contact,
                                'originalSourceTriangleArea3DSquareMeters':B['area'](tri)})
                    face_idx+=1
    if face_idx!=f['originalActiveFaceCount']:raise ValueError('PHASE12G_GLOBAL_SOURCE_FACE_INVENTORY_DRIFT')
    outputs=[]
    for key in pairs:
        e=targets[key];entries=seen[key]
        entries.sort(key=lambda z:(z['segmentToTriangleDistanceMeters'],z['originalFaceIndex']))
        contact=[x for x in entries if x['contact']]
        out={'sourceOriginalMinFace':key[0],'sourceBoundaryEdgeIndex':key[1],
             'originalOBJVertexIds':e['originalOBJVertexIds'],
             'originalProjectEndpointXYZ':e['originalProjectEndpointXYZ'],
             'edgeLengthMeters':e['edgeLengthMeters'],
             'originalStageSourceSeamTier':e['tier'],
             'sourceConfirmedOriginalContactCount':len(contact),
             'sourceContactClassCounts':dict(sorted(counts[key].items())),
             'nearestActualSegmentToOriginalTriangles':entries[:12],
             'firstEightExactGeometrySourceContacts':contact[:8],
             'oneOrMoreSourceContacts':bool(contact),
             'newPlayableSurfaceOrBridgeAuthorized':False}
        outputs.append(out)
    report={'version':'T21_PHASE12G_EXACT_SOURCE_SEGMENT_TRIANGLE_CONTACT_V1',
       'originalSourceSHA256':PIN,'originalSourceBytes':43263289,
       'sourceOriginalActiveFaceCount':face_idx,
       'unresolvedSourceBoundaryCount':4,'originalSourceComponentCount':4,
       'edgeIntersectionsNotWeldedOrGameplayConnectivity':True,
       'checkedEveryOriginalSourceTriangle':True,
       'contactToleranceMeters':EPS,'searchRadiusMeters':NEAR,
       'perBoundary':outputs,
       'totalActualSourceContacts':sum(o['sourceConfirmedOriginalContactCount'] for o in outputs),
       'reviewOnly':True,'runtimePromotionAuthorized':False,
       'existingDefaultOriginalSourceMeshes':124,'newGameCollidersOrWalkablePlatforms':0,
       't20ProductionChanged':False,'t21ActivationReady':False}
    outpath.parent.mkdir(parents=True,exist_ok=True)
    outpath.write_text(json.dumps(report,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12G_ORIGINAL_SEGMENT_TRIANGLE_GATE_PASS',
      'sourceFaces='+str(face_idx),
      'contacts='+str(report['totalActualSourceContacts']),
      'classCounts='+json.dumps({str((o['sourceOriginalMinFace'],o['sourceBoundaryEdgeIndex'])):
                     o['sourceContactClassCounts'] for o in outputs},sort_keys=True))
def self_test():
    horizontal=[(0.,0.,0.),(1.,0.,0.),(0.,0.,1.)]
    cross=tri_contact((.3,-1,.3),(.3,1,.3),horizontal)
    assert cross and cross['contactClass']=='SOURCE_POINT_PLANE_INTERSECTION'
    assert abs(cross['sourceSegmentParameters'][0]-.5)<1e-9
    overlap=tri_contact((-.1,0,.2),(.5,0,.2),horizontal)
    assert overlap and overlap['contactClass']=='COPLANAR_SOURCE_SEGMENT_OVERLAP'
    assert overlap['overlapLengthMeters']>.39
    assert tri_contact((2.,0.,2.),(3.,0.,3.),horizontal) is None
    assert abs(segment_triangle_distance((.3,.4,.3),(.3,.5,.3),horizontal)[0]-.4)<1e-9
    assert segment_triangle_distance((.3,-1,.3),(.3,1,.3),horizontal)[0]==0
    assert abs(segment_segment_distance((0,0,0),(1,0,0),(.5,1,0),(.5,-1,0)))<1e-9
    print('T21_PHASE12G_SYNTHETIC_CROSS_COPLANAR_MISS_AND_3D_DISTANCE_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':self_test()
    elif len(sys.argv)==4:run(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]))
    else:raise SystemExit('Usage: phase12g.py --self-test OR pinned.obj phase12f.json out.json')
