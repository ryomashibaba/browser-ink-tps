#!/usr/bin/env python3
"""Pinned original Temple01 Phase12F: true OBJ-ID edge vs coordinate seam vs 3D proximity.
Strictly source-only. Never a playable floor, collider, link or stage activation.
"""
from __future__ import annotations
from pathlib import Path
from collections import defaultdict
import hashlib,json,math,runpy,sys
B=runpy.run_path(str(Path(__file__).with_name('undertow-temple01-phase12b-component-graph.py')))
PIN=B['PIN']
TARGETS=(60006,61516,61728,62086)
XYZ_TOLERANCE=1e-7
NEAR_RADIUS=.75

def dot(a,b):return sum(x*y for x,y in zip(a,b))
def dif(a,b):return tuple(x-y for x,y in zip(a,b))
def closest(p,tri):
    """Ericson point-to-triangle 3D closest distance, not centroid distance."""
    a,b,c=tri;ab=dif(b,a);ac=dif(c,a);ap=dif(p,a)
    d1=dot(ab,ap);d2=dot(ac,ap)
    if d1<=0 and d2<=0:return math.dist(p,a)
    bp=dif(p,b);d3=dot(ab,bp);d4=dot(ac,bp)
    if d3>=0 and d4<=d3:return math.dist(p,b)
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:
        v=d1/(d1-d3)
        return math.dist(p,tuple(a[i]+v*ab[i] for i in range(3)))
    cp=dif(p,c);d5=dot(ab,cp);d6=dot(ac,cp)
    if d6>=0 and d5<=d6:return math.dist(p,c)
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:
        w=d2/(d2-d6)
        return math.dist(p,tuple(a[i]+w*ac[i] for i in range(3)))
    va=d3*d6-d5*d4
    if va<=0 and d4-d3>=0 and d5-d6>=0:
        bc=dif(c,b);w=(d4-d3)/((d4-d3)+(d5-d6))
        return math.dist(p,tuple(b[i]+w*bc[i] for i in range(3)))
    total=va+vb+vc
    if abs(total)<1e-20:raise ValueError('degenerate source triangle')
    v=vb/total;w=vc/total
    return math.dist(p,tuple(a[i]+v*ab[i]+w*ac[i] for i in range(3)))

def boundary(comp):
    edges={}
    for face in comp['faces']:
        v=face['originalOBJVertexIds'];xyz=face['originalProjectTriangleXYZ']
        for i,j in ((0,1),(1,2),(2,0)):
            key=tuple(sorted((v[i],v[j])))
            if key not in edges:edges[key]=[0,[xyz[i],xyz[j]]]
            edges[key][0]+=1
    if len(edges)!=5 or sorted(x[0] for x in edges.values())!=[1,1,1,1,2]:
        raise ValueError('PHASE12F_EXPECTED_TWO_TRIANGLES_SHARING_ONE_DIAGONAL')
    return [(ids,v[1]) for ids,v in sorted(edges.items()) if v[0]==1]

def tier(e):
    if e['exactOBJEdgeNeighborCount']:return 'EXACT_TWO_ORIGINAL_OBJ_IDS_STATIC_ONLY'
    if e['coordinateOnlyNeighborCount']:return 'COINCIDENT_XYZ_NOT_WELDED'
    if e['oneOBJIdNeighborCount']:return 'ONE_ORIGINAL_ID_ONLY_NOT_EDGE'
    if e['nearestOriginalTriangles']:return 'NEARBY_TRIANGLE_NOT_CONNECTIVITY'
    return 'NO_SOURCE_TRIANGLE_MIDPOINT_WITHIN_0_75M'

def build(objpath,sourcepath,outpath):
    if objpath.stat().st_size!=43263289 or hashlib.sha256(objpath.read_bytes()).hexdigest()!=PIN:
        raise ValueError('PHASE12F_43MB_SHA256_PIN_MISMATCH')
    source=json.loads(sourcepath.read_text('utf8'))
    if (source['version']!='T21_PHASE12D_FOUR_RECOVERED_EXACT_SOURCE_TRIANGLE_SETS_V1'
        or source['sourceSHA256']!=PIN or source['originalTriangleCount']!=8
        or source['completeOriginalSourceComponentCount']!=4
        or source['runtimePromotionAuthorized'] or not source['reviewOnly']):
        raise ValueError('PHASE12F_RECOVERED_SOURCE_LEDGER_DRIFT')
    components=source['originalComponents']
    if sorted(c['minOriginalFaceIndex'] for c in components)!=list(TARGETS):
        raise ValueError('PHASE12F_TARGET_COMPONENTS_DRIFT')
    tracked={}
    edges=[]
    for comp in components:
        if comp['sourceObject']!='Fld_Temple01_mesh05_low57_1__FloorLine02' or comp['sourceMaterial']!='Fld_Temple01_FloorLine02':
            raise ValueError('PHASE12F_MATERIAL_OBJECT_DRIFT')
        for f in comp['faces']:
            if f['originalFaceIndex'] in tracked:raise ValueError('PHASE12F_FACE_REUSED')
            tracked[f['originalFaceIndex']]=(comp,f)
        for i,(ids,pts) in enumerate(boundary(comp)):
            a,b=pts
            edges.append({'sourceComponentKey':comp['sourceComponentKey'],
                'sourceOriginalMinFace':comp['minOriginalFaceIndex'],
                'edgeNumber':i,'originalOBJVertexIds':list(ids),
                'originalProjectEndpointXYZ':pts,
                'edgeLengthMeters':math.dist(a,b),
                'edgeMidpointXYZ':[(a[k]+b[k])/2 for k in range(3)],
                'exactOBJEdgeNeighborCount':0,'exactOBJEdgeNeighbors':[],
                'coordinateOnlyNeighborCount':0,'coordinateOnlyNeighbors':[],
                'oneOBJIdNeighborCount':0,'oneOBJIdNeighbors':[],
                'nearestOriginalTriangles':[],
                'gameplayConnectivityProof':False,'runtimePromotionAuthorized':False})
    if len(edges)!=16 or len(tracked)!=8:raise ValueError('PHASE12F_NOT_16_EDGES_EIGHT_SOURCE_FACES')
    vertices=[None];obj='';mat='';faceidx=0;checked=set();closest_map=defaultdict(list)
    def add(e,label,info):
        e[label+'Count']+=1
        if len(e[label+'s'])<8:e[label+'s'].append(info)
    with objpath.open('r',encoding='utf8',errors='replace') as handle:
        for line in handle:
            if line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
            elif line.startswith('o '):obj=line[2:].strip()
            elif line.startswith('usemtl '):mat=line[7:].strip()
            elif line.startswith('f ') and (obj.startswith('Fld_Temple01_') or obj.startswith('FldObj_Temple01_PntSet_')):
                raw=[int(x.split('/')[0]) for x in line.split()[1:]]
                for k in range(1,len(raw)-1):
                    ids=(raw[0],raw[k],raw[k+1])
                    pts=[B['project'](vertices[v]) for v in ids]
                    if faceidx in tracked:
                        comp,f=tracked[faceidx]
                        if (obj!=comp['sourceObject'] or mat!=comp['sourceMaterial'] or
                            list(ids)!=f['originalOBJVertexIds'] or
                            [list(p) for p in pts]!=f['originalProjectTriangleXYZ']):
                            raise ValueError('PHASE12F_ORIGINAL_FACE_ID_XYZ_BYTE_DRIFT')
                        checked.add(faceidx)
                    else:
                        info={'originalFaceIndex':faceidx,'sourceObject':obj,
                            'sourceMaterial':mat,'originalOBJVertexIds':list(ids),
                            'sourceIsActorPlacement':obj.startswith('FldObj_Temple01_PntSet_')}
                        minp=[min(p[z] for p in pts) for z in range(3)]
                        maxp=[max(p[z] for p in pts) for z in range(3)]
                        idset=set(ids)
                        for index,e in enumerate(edges):
                            sourceids=e['originalOBJVertexIds']
                            shared=len(idset.intersection(sourceids))
                            if shared==2:add(e,'exactOBJEdgeNeighbor',info)
                            else:
                                if all(any(math.dist(endpoint,p)<XYZ_TOLERANCE for p in pts)
                                       for endpoint in e['originalProjectEndpointXYZ']):
                                    add(e,'coordinateOnlyNeighbor',info)
                            if shared==1:add(e,'oneOBJIdNeighbor',info)
                            mid=e['edgeMidpointXYZ']
                            if any(mid[z]<minp[z]-NEAR_RADIUS or mid[z]>maxp[z]+NEAR_RADIUS for z in range(3)):
                                continue
                            try:distance=closest(mid,pts)
                            except ValueError:continue
                            if distance<=NEAR_RADIUS:
                                closest_map[index].append((distance,faceidx,info))
                    faceidx+=1
    if checked!=set(tracked) or faceidx<70000:raise ValueError('PHASE12F_SOURCE_FACE_INVENTORY_INCOMPLETE')
    tiers=defaultdict(int)
    for i,e in enumerate(edges):
        nearby=sorted(closest_map[i],key=lambda row:(row[0],row[1]))[:5]
        e['nearestOriginalTriangles']=[{**record,
            'midpointToTriangle3DDistanceMeters':dist} for dist,_,record in nearby]
        e['tier']=tier(e);tiers[e['tier']]+=1
    result={
        'version':'T21_PHASE12F_PINNED_16_SOURCE_EDGE_TOPOLOGY_V1',
        'originalSourceSHA256':PIN,'originalSourceBytes':43263289,
        'originalActiveFaceCount':faceidx,'sourceFullComponentCount':4,
        'sourceOriginalTriangleCount':8,'sourceBoundaryEdgeCount':16,
        'allOriginalFacesSearched':True,
        'distanceSampling':'ORIGINAL_BOUNDARY_MIDPOINT_TO_NEAREST_ORIGINAL_TRIANGLE_3D',
        'coordinateToleranceMeters':XYZ_TOLERANCE,
        'midpointSearchRadiusMeters':NEAR_RADIUS,
        'tierCounts':dict(sorted(tiers.items())),'edges':edges,
        'actorGeometryUntrusted':True,'gameplayAuthority':'NONE',
        'reviewOnly':True,'runtimePromotionAuthorized':False,
        'newRegisteredSourceMeshes':0,'defaultOriginalFullSourceMeshes':124,
        'productionStageChanged':False,'t21ActivationReady':False}
    outpath.parent.mkdir(parents=True,exist_ok=True)
    outpath.write_text(json.dumps(result,separators=(',',':')),encoding='utf8')
    print('T21_PHASE12F_ORIGINAL_EDGE_AUDIT_PASS',
        'edges=16','face_count='+str(faceidx),
        'tiers='+json.dumps(result['tierCounts'],sort_keys=True),'artifact='+str(outpath))
def selftest():
    quad={'faces':[
      {'originalOBJVertexIds':[1,2,3],
       'originalProjectTriangleXYZ':[[0,0,0],[1,0,0],[1,0,1]]},
      {'originalOBJVertexIds':[1,3,4],
       'originalProjectTriangleXYZ':[[0,0,0],[1,0,1],[0,0,1]]}]}
    assert len(boundary(quad))==4
    tri=[(0,0,0),(1,0,0),(0,0,1)]
    assert closest((.2,0,.2),tri)<1e-10
    assert abs(closest((.2,.3,.2),tri)-.3)<1e-10
    assert abs(closest((1,0,1),tri)-math.sqrt(.5))<1e-10
    assert tier({'exactOBJEdgeNeighborCount':0,'coordinateOnlyNeighborCount':0,
      'oneOBJIdNeighborCount':0,'nearestOriginalTriangles':[]}).startswith('NO_SOURCE')
    print('T21_PHASE12F_SYNTHETIC_EDGE_GRAPH_AND_TRIANGLE_DIST_PASS')
if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--self-test':selftest()
    elif len(sys.argv)==4:build(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]))
    else:raise SystemExit('Usage: phase12f.py --self-test OR ORIGINAL.obj recovered4.json result.json')
