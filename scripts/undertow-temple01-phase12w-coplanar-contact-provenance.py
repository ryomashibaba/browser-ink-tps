#!/usr/bin/env python3
"""Phase12W: original SHA-pinned evidence-only classification of 88 zero-distance
source boundaries. No created triangles, welds, floors, collider, nav or promotion.
Uses all 70,396 original OBJ faces and excludes only each target's own original
object+material+OBJ-ID connected component. Never snaps projected source XYZ.
"""
from __future__ import annotations
import json,math,runpy,sys
from pathlib import Path
from collections import Counter,defaultdict
from bisect import bisect_right

V=runpy.run_path(str(Path(__file__).with_name(
 'undertow-temple01-phase12v-unmatched-boundary-contact.py')))
PIN=V['PIN']
DIST_EPS=1.e-8
PLANE_EPS=1.e-8
BARY_EPS=1.e-9
SPAN_EPS=1.e-6
RADIUS=.5
LABELS=('COPLANAR_FACE_INTERIOR_POSITIVE_SPAN',
 'COPLANAR_FACE_BOUNDARY_POSITIVE_SPAN',
 'NONCOPLANAR_FACE_BOUNDARY_TANGENCY',
 'NONCOPLANAR_ENDPOINT_POINT_TOUCH',
 'COPLANAR_POINT_TANGENCY','NO_ZERO_DISTANCE_WITNESS')
sub=V['dsub'];dot=V['ddot'];cross=V['dcross'];norm=V['dnorm']
def bary(pt,tri):
    a,b,c=tri
    e=sub(b,a);f=sub(c,a);p=sub(pt,a)
    ee=dot(e,e);ef=dot(e,f);ff=dot(f,f);pe=dot(p,e);pf=dot(p,f)
    den=ee*ff-ef*ef
    if den<=1e-16:raise ValueError('PHASE12W_DEGENERATE_BARY_TRIANGLE')
    v=(ff*pe-ef*pf)/den;w=(ee*pf-ef*pe)/den
    return (1.-v-w,v,w)
def clip_interval(lam0,lam1,margin):
    lo=0.;hi=1.
    for a,b in zip(lam0,lam1):
        delta=b-a
        if abs(delta)<1e-15:
            if a<margin:return None
            continue
        boundary=(margin-a)/delta
        if delta>0:lo=max(lo,boundary)
        else:hi=min(hi,boundary)
    if lo>hi+1e-12:return None
    return (max(0.,lo),min(1.,hi))
def evidence(p,q,tri):
    """Geometry predicate with explicit witnesses; no OBJ-ID or physical join."""
    a,b,c=tri
    n=cross(sub(b,a),sub(c,a))
    nn=norm(n)
    if nn<=1e-12:raise ValueError('PHASE12W_ZERO_SOURCE_NORMAL')
    h0=dot(n,sub(p,a))/nn;h1=dot(n,sub(q,a))/nn
    length=norm(sub(q,p))
    if length<SPAN_EPS:raise ValueError('PHASE12W_ZERO_TARGET_EDGE_LENGTH')
    if abs(h0)<=PLANE_EPS and abs(h1)<=PLANE_EPS:
        l0=bary(p,tri);l1=bary(q,tri)
        extent=clip_interval(l0,l1,-BARY_EPS)
        if extent is None:return None
        positive=(extent[1]-extent[0])*length
        if positive>SPAN_EPS:
            inside=clip_interval(l0,l1,BARY_EPS)
            inlength=max(0.,(inside[1]-inside[0])*length) if inside else 0.
            label=LABELS[0] if inlength>SPAN_EPS else LABELS[1]
            return {'kind':label,'spanMeters':round(positive,9),
              'interiorSpanMeters':round(inlength,9),
              'interval':[round(extent[0],12),round(extent[1],12)],
              'sourcePlaneDistanceEndpointsMeters':[round(h0,10),round(h1,10)]}
        return {'kind':'COPLANAR_POINT_TANGENCY','spanMeters':0.,
           'interiorSpanMeters':0.,
           'interval':[round(extent[0],12),round(extent[1],12)],
           'sourcePlaneDistanceEndpointsMeters':[round(h0,10),round(h1,10)]}
    if (h0>PLANE_EPS and h1>PLANE_EPS) or (h0< -PLANE_EPS and h1< -PLANE_EPS):
        return None
    if abs(h0-h1)<1e-15:return None
    alpha=h0/(h0-h1)
    if alpha < -BARY_EPS or alpha>1+BARY_EPS:return None
    at=tuple(p[k]+alpha*(q[k]-p[k]) for k in range(3))
    coords=bary(at,tri)
    if min(coords)<-BARY_EPS:return None
    if BARY_EPS<alpha<1-BARY_EPS:
        label='NONCOPLANAR_FACE_BOUNDARY_TANGENCY' if min(coords)<=BARY_EPS else 'STRICT_NONCOPLANAR_INTERIOR_PIERCING'
    else:label='NONCOPLANAR_ENDPOINT_POINT_TOUCH'
    return {'kind':label,'spanMeters':0.,'interiorSpanMeters':0.,
       'intersectionFraction':round(alpha,12),
       'sourcePlaneDistanceEndpointsMeters':[round(h0,10),round(h1,10)]}
def audit(original,phasev):
    verts,faces=V['parse'](Path(original))
    if (phasev.get('originalSourceSHA256')!=PIN or
        phasev.get('originalActiveFacesParsed')!=70396 or
        phasev.get('originalUnmatchedBoundaryEdges')!=88 or
        phasev.get('originalPartsWithUnmatchedBoundary')!=8 or
        phasev.get('runtimePromotionAuthorized') is not False or
        phasev.get('physicalWeldOrWalkableFloorProven') is not False or
        phasev.get('searchRadiusMeters')!=RADIUS):
        raise ValueError('PHASE12W_PHASE12V_PIN_OR_SCOPE_DRIFT')
    groups=V['components'](faces)
    target,owners=V['verify_88']({'originalSourceSHA256':PIN,
        'originalActiveFacesParsed':70396,'sourceOriginalBoundaryEdges':524,
        'rows':[dict(x,wholeOriginalClassification=
            'NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES') for x in phasev['rows']],
        'runtimePromotionAuthorized':False,
        'physicalWeldOrWalkableFloorProven':False},verts,faces,groups)
    if len(target)!=88:raise ValueError('PHASE12W_88_TARGETS_REQUIRED')
    src=[None]+[V['canon'](V['project'](p)) for p in verts[1:]]
    triangles=[];boxes=[];degenerate=0
    for ids,_,_ in faces:
        tri=tuple(src[x] for x in ids)
        area2=norm(cross(sub(tri[1],tri[0]),sub(tri[2],tri[0])))
        if area2<=1e-12:
            triangles.append(None);boxes.append(None);degenerate+=1
        else:triangles.append(tri);boxes.append(V['bbox'](tri))
    sweep=sorted((box[0],i) for i,box in enumerate(boxes) if box is not None)
    sweep_x=[x[0] for x in sweep]
    results=[];totals=Counter();witness_counts=Counter()
    target_ids=set()
    for row in target:
        own=owners[row['sourcePartMinFace']]
        p,q=[src[vid] for vid in row['originalOBJVertexIds']]
        k=(row['sourcePartMinFace'],row['sourceFace'],tuple(sorted(row['originalOBJVertexIds'])))
        if k in target_ids:raise ValueError('PHASE12W_DUPLICATE_TARGET_ID')
        target_ids.add(k)
        bb=V['bbox']((p,q))
        last=bisect_right(sweep_x,bb[3]+RADIUS)
        witnesses=[];min_distance=math.inf;tested=0
        for _,fi in sweep[:last]:
            if fi in own or not V['nearby_box'](bb,boxes[fi],RADIUS):continue
            tri=triangles[fi]
            tested+=1
            dist=V['segment_triangle_distance'](p,q,tri)
            if dist>RADIUS+1e-9:continue
            min_distance=min(min_distance,dist)
            if dist>DIST_EPS:continue
            ev=evidence(p,q,tri)
            if ev is None:
                # Numeric distance-zero without a certified intersection.
                raise ValueError('PHASE12W_UNEXPLAINED_ZERO_DISTANCE_'+str(fi))
            if ev['kind']=='STRICT_NONCOPLANAR_INTERIOR_PIERCING':
                raise ValueError('PHASE12W_UNEXPECTED_STRICT_PIERCING')
            witness_counts[ev['kind']]+=1
            witnesses.append({'originalFaceIndex':fi,
             'originalOBJVertexIds':list(faces[fi][0]),
             'sourceObject':faces[fi][1],'sourceMaterial':faces[fi][2],
             'originalProjectedTriangleXYZ':[list(v) for v in tri],
             'observedFiniteSegmentDistanceMeters':round(dist,9),**ev})
        if min_distance>DIST_EPS or not witnesses:
            raise ValueError('PHASE12W_PHASE12V_ZERO_DISTANCE_LOST')
        priority=LABELS
        label=next((s for s in priority if any(w['kind']==s for w in witnesses)),
            'NO_ZERO_DISTANCE_WITNESS')
        if label=='NO_ZERO_DISTANCE_WITNESS':raise ValueError('PHASE12W_EMPTY_CONTACT_LABEL')
        max_interior=max(w['interiorSpanMeters'] for w in witnesses)
        max_span=max(w['spanMeters'] for w in witnesses)
        totals[label]+=1
        results.append({'sourcePartMinFace':row['sourcePartMinFace'],
          'sourceFace':row['sourceFace'],
          'originalOBJVertexIds':row['originalOBJVertexIds'],
          'originalProjectedXYZ':row['originalProjectedXYZ'],
          'classification':label,'maxPositiveSpanMeters':round(max_span,9),
          'maxInteriorSpanMeters':round(max_interior,9),
          'touchingOriginalFaceCount':len(witnesses),
          'candidateFacesAfterHalfMeterAABB':tested,
          'contactWitnesses':sorted(witnesses,key=lambda w:w['originalFaceIndex']),
          'sourceOnly':True,'physicalConnectionAuthorized':False})
    if (len(results)!=88 or len(totals)!=1 or
        totals.get('COPLANAR_FACE_INTERIOR_POSITIVE_SPAN')!=88):
        raise ValueError('PHASE12W_UNEXPECTED_88_SOURCE_CLASSIFICATION_'+repr(totals))
    mirror_counts=Counter(r['sourcePartMinFace'] for r in results)
    if sorted(mirror_counts.values())!=[11]*8:
        raise ValueError('PHASE12W_SOURCE_PART_DISTRIBUTION_DRIFT')
    return {'version':'T21_PHASE12W_FULL_SOURCE_COPLANAR_PROVENANCE_V1',
      'originalSourceSHA256':PIN,'sourceOnly':True,'reviewOnly':True,
      'runtimePromotionAuthorized':False,'physicalWeldOrWalkableFloorProven':False,
      'gameplayCollisionPaintNavScoringAuthority':'NONE',
      'originalActiveFacesParsed':70396,'originalSourceTrianglesOwned':488,
      'originalBoundaryEdges':524,'phase12VUnresolvedEdges':88,
      'unresolvedSourceComponents':8,'searchRadiusMeters':RADIUS,
      'distanceEpsilonMeters':DIST_EPS,'coplanarityPlaneEpsilonMeters':PLANE_EPS,
      'barycentricEpsilon':BARY_EPS,'positiveSpanEpsilonMeters':SPAN_EPS,
      'originalDegenerateFacesSkipped':degenerate,
      'exclusiveCounters':dict(totals),'contactWitnessTypeCounts':dict(witness_counts),
      'sourceComponentRows':dict(sorted(mirror_counts.items())),
      'rows':results}
def selftest():
    tri=((-1.,-1.,0.),(2.,-1.,0.),(0.,2.,0.))
    p=(-.2,0.,0.);q=(.2,0.,0.)
    d=evidence(p,q,tri)
    assert d['kind']=='COPLANAR_FACE_INTERIOR_POSITIVE_SPAN' and d['interiorSpanMeters']>.39
    d=evidence((0.,0.,-1.),(0.,0.,1.),tri)
    assert d['kind']=='STRICT_NONCOPLANAR_INTERIOR_PIERCING'
    d=evidence((0.,0.,-1.),(0.,0.,0.),tri)
    assert d['kind']=='NONCOPLANAR_ENDPOINT_POINT_TOUCH'
    d=evidence((-.2,0.,.25),(.2,0.,.25),tri)
    assert d is None
    td=((0.,0.,0.),(1.,0.,0.),(0.,1.,0.))
    d=evidence((0.,0.,0.),(1.,0.,0.),td)
    assert d['kind']=='COPLANAR_FACE_BOUNDARY_POSITIVE_SPAN'
    d=evidence((-1.,0.,0.),(0.,0.,0.),td)
    assert d['kind']=='COPLANAR_POINT_TANGENCY'
    print('T21_PHASE12W_SYNTHETIC_CONTACT_TYPES_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==4:
        original=Path(sys.argv[1]);v=json.loads(Path(sys.argv[2]).read_text('utf8'))
        data=audit(original,v)
        Path(sys.argv[3]).write_text(json.dumps(data,separators=(',',':')),encoding='utf8')
        print('T21_PHASE12W_COPLANAR_SOURCE_ONLY',json.dumps({
         'originalFaces':data['originalActiveFacesParsed'],
         'rows':len(data['rows']),'classes':data['exclusiveCounters'],
         'witnesses':data['contactWitnessTypeCounts'],'artifact':sys.argv[3]}))
    else:raise SystemExit('Usage: script.py --self-test | original.obj phase12v.json output.json')
