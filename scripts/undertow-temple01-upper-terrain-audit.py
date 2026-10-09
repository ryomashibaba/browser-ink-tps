#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
import json
import math
import sys

OBJ = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/kitrix-lfs/Vss_Temple01.obj")
OUTPUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/t21-pass18c-upper-terrain.json")
MAX_SLOPE_DEG = 50.0
MIN_UP_Y = math.cos(math.radians(MAX_SLOPE_DEG))
LOCAL_MARGIN = 3.0

WALK_TOKENS = (
    "FloorConcrete", "FloorSlope", "FloorGrass", "GrassFloor",
    "FloorMetal", "FloorRubber", "BridgeMetal", "FloorFence"
)
OVERLAY_TOKENS = ("FloorLine",)
PASS18G_THRESHOLDS = (0.03, 0.08, 0.18, 0.30)
PASS18G_RELAXED_DISCOVERY_METERS = 2.0
PASS18G_LOCAL_MARGIN_METERS = 12.0
PASS18G_CONTINUATION_EXCLUDED_TOKENS = ("FloorLine", "FloorFence")
GLASS_OBJECT = "FldObj_Temple01_PntSet_pCube21560_1__Glass01"
GLASS_MATERIAL = "FldObj_Temple01_PntSet_Glass01"
GRATE_OBJECT = "Fld_Temple01_pPlane157_1__FloorFence00"
GRATE_MATERIAL = "Fld_Temple01_FloorFence00"

# Frozen Sunfish vector->project and locally-audited project->Temple01 registration.
ORIGIN=(420.96,297.66)
NEG=(131.82,155.58)
POS=(709.98,439.5)
ddx=POS[0]-NEG[0]
ddy=POS[1]-NEG[1]
dll=math.hypot(ddx,ddy)
zdir=(ddx/dll,ddy/dll)
xdir=(zdir[1],-zdir[0])
REG_SCALE=0.964211
REG_TH=math.radians(26.1160)
REG_C=math.cos(REG_TH)
REG_S=math.sin(REG_TH)
REG_TX=-0.0580
REG_TZ=-0.1329

GRATE_PDF = {
    "NEGATIVE_Z": [(340.56,119.88),(363.48,119.88),(363.48,150.48),(340.56,150.48)],
    "POSITIVE_Z": [(478.44,444.72),(501.36,444.72),(501.36,475.32),(478.44,475.32)],
}
GLASS_PDF = {
    "NEGATIVE_Z": [(382.44,230.28),(420.96,230.28),(420.96,267.84),(382.44,267.84)],
    "POSITIVE_Z": [(420.96,327.36),(459.48,327.36),(459.48,364.92),(420.96,364.92)],
}
GLASS_ROUTE_PROJECT_XZ = {
    "POSITIVE_Z": [(-9.831115,8.149488),(-7.038142,6.780257),(-4.888742,5.726533)],
    "NEGATIVE_Z": [(10.060483,-7.954924),(7.26751,-6.585693),(5.11811,-5.531968)],
}

def active(name: str) -> bool:
    return name.startswith("Fld_Temple01_") or name.startswith("FldObj_Temple01_PntSet_")

def pdf_to_project(pt):
    dx=pt[0]-ORIGIN[0]
    dy=pt[1]-ORIGIN[1]
    return ((dx*xdir[0]+dy*xdir[1])/4.8,(dx*zdir[0]+dy*zdir[1])/4.8)

def project_to_model(pt):
    x,z=pt
    return (
        REG_SCALE*(REG_C*x-REG_S*z)+REG_TX,
        REG_SCALE*(REG_S*x+REG_C*z)+REG_TZ,
    )

def model_to_project(pt):
    mx=pt[0]-REG_TX
    mz=pt[1]-REG_TZ
    return (
        (REG_C*mx+REG_S*mz)/REG_SCALE,
        (-REG_S*mx+REG_C*mz)/REG_SCALE,
    )

def pdf_to_model(pt):
    return project_to_model(pdf_to_project(pt))

vertices=[None]
faces=[]
obj="(none)"
mat="(none)"
with OBJ.open("r",encoding="utf-8",errors="replace") as fh:
    for line in fh:
        if line.startswith("o "):
            obj=line[2:].strip()
        elif line.startswith("usemtl "):
            mat=line[7:].strip()
        elif line.startswith("v "):
            q=line.split()
            vertices.append(tuple(map(float,q[1:4])))
        elif line.startswith("f ") and active(obj):
            ids=[int(tok.split("/")[0]) for tok in line.split()[1:]]
            for i in range(1,len(ids)-1):
                faces.append((ids[0],ids[i],ids[i+1],obj,mat))

def tri_points(face):
    return (vertices[face[0]],vertices[face[1]],vertices[face[2]])

def tri_normal(face):
    a,b,c=tri_points(face)
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy
    ny=uz*vx-ux*vz
    nz=ux*vy-uy*vx
    n=math.sqrt(nx*nx+ny*ny+nz*nz)
    return (nx/n,ny/n,nz/n) if n>1e-12 else (0.0,0.0,0.0)

def tri_area(face):
    a,b,c=tri_points(face)
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy
    ny=uz*vx-ux*vz
    nz=ux*vy-uy*vx
    return 0.5*math.sqrt(nx*nx+ny*ny+nz*nz)

def centroid(face):
    p=tri_points(face)
    return tuple(sum(v[i] for v in p)/3.0 for i in range(3))

def bbox3(face_indices):
    pts=[vertices[vi] for fi in face_indices for vi in faces[fi][:3]]
    return (
        min(p[0] for p in pts), min(p[1] for p in pts), min(p[2] for p in pts),
        max(p[0] for p in pts), max(p[1] for p in pts), max(p[2] for p in pts),
    )

def bbox_expand(b,m):
    return (b[0]-m,b[1]-m,b[2]-m,b[3]+m,b[4]+m,b[5]+m)

def bbox_intersects(a,b):
    return not (
        a[3] < b[0] or b[3] < a[0] or
        a[4] < b[1] or b[4] < a[1] or
        a[5] < b[2] or b[5] < a[2]
    )

def face_bbox(fi):
    p=tri_points(faces[fi])
    return (
        min(v[0] for v in p), min(v[1] for v in p), min(v[2] for v in p),
        max(v[0] for v in p), max(v[1] for v in p), max(v[2] for v in p),
    )

def point_seg_dist_2d(p,a,b):
    dx=b[0]-a[0]
    dz=b[1]-a[1]
    den=dx*dx+dz*dz
    if den<=1e-15:
        return math.hypot(p[0]-a[0],p[1]-a[1])
    t=max(0.0,min(1.0,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/den))
    q=(a[0]+t*dx,a[1]+t*dz)
    return math.hypot(p[0]-q[0],p[1]-q[1])

def inside_poly(x,z,poly):
    inside=False
    j=len(poly)-1
    for i in range(len(poly)):
        xi,zi=poly[i]
        xj,zj=poly[j]
        if ((zi>z)!=(zj>z)) and x < (xj-xi)*(z-zi)/(zj-zi+1e-30)+xi:
            inside=not inside
        j=i
    return inside

def poly_boundary_dist(x,z,poly):
    return min(
        point_seg_dist_2d((x,z),poly[i],poly[(i+1)%len(poly)])
        for i in range(len(poly))
    )

def componentize(face_indices):
    by_vertex=defaultdict(list)
    for fi in face_indices:
        for vi in faces[fi][:3]:
            by_vertex[vi].append(fi)
    remaining=set(face_indices)
    out=[]
    while remaining:
        seed=remaining.pop()
        comp={seed}
        q=deque([seed])
        while q:
            cur=q.popleft()
            for vi in faces[cur][:3]:
                for nxt in by_vertex[vi]:
                    if nxt in remaining:
                        remaining.remove(nxt)
                        comp.add(nxt)
                        q.append(nxt)
        out.append(sorted(comp))
    return out

def component_summary(comp):
    b=bbox3(comp)
    area=sum(tri_area(faces[fi]) for fi in comp)
    nys=[tri_normal(faces[fi])[1] for fi in comp]
    objs=defaultdict(int)
    for fi in comp:
        objs[(faces[fi][3],faces[fi][4])]+=1
    top=sorted(objs.items(),key=lambda kv:-kv[1])[:4]
    return {
        "faces":len(comp),
        "verts":len({vi for fi in comp for vi in faces[fi][:3]}),
        "area":area,
        "bbox":b,
        "ny_min":min(nys),
        "ny_max":max(nys),
        "top":top,
    }

def point_triangle_distance(p,a,b,c):
    # Ericson, Real-Time Collision Detection.
    ab=tuple(b[i]-a[i] for i in range(3))
    ac=tuple(c[i]-a[i] for i in range(3))
    ap=tuple(p[i]-a[i] for i in range(3))
    d1=sum(ab[i]*ap[i] for i in range(3))
    d2=sum(ac[i]*ap[i] for i in range(3))
    if d1<=0 and d2<=0:
        return math.dist(p,a)
    bp=tuple(p[i]-b[i] for i in range(3))
    d3=sum(ab[i]*bp[i] for i in range(3))
    d4=sum(ac[i]*bp[i] for i in range(3))
    if d3>=0 and d4<=d3:
        return math.dist(p,b)
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:
        v=d1/(d1-d3)
        q=tuple(a[i]+v*ab[i] for i in range(3))
        return math.dist(p,q)
    cp=tuple(p[i]-c[i] for i in range(3))
    d5=sum(ab[i]*cp[i] for i in range(3))
    d6=sum(ac[i]*cp[i] for i in range(3))
    if d6>=0 and d5<=d6:
        return math.dist(p,c)
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:
        w=d2/(d2-d6)
        q=tuple(a[i]+w*ac[i] for i in range(3))
        return math.dist(p,q)
    va=d3*d6-d5*d4
    if va<=0 and (d4-d3)>=0 and (d5-d6)>=0:
        w=(d4-d3)/((d4-d3)+(d5-d6))
        bc=tuple(c[i]-b[i] for i in range(3))
        q=tuple(b[i]+w*bc[i] for i in range(3))
        return math.dist(p,q)
    denom=1.0/(va+vb+vc)
    v=vb*denom
    w=vc*denom
    q=tuple(a[i]+ab[i]*v+ac[i]*w for i in range(3))
    return math.dist(p,q)

def vsub(a,b):
    return tuple(a[i]-b[i] for i in range(3))

def vadd(a,b):
    return tuple(a[i]+b[i] for i in range(3))

def vmul(a,s):
    return tuple(a[i]*s for i in range(3))

def vdot(a,b):
    return sum(a[i]*b[i] for i in range(3))

def segment_segment_distance(p1,q1,p2,q2):
    # Exact closest distance between two finite 3D segments.
    d1=vsub(q1,p1)
    d2=vsub(q2,p2)
    r=vsub(p1,p2)
    a=vdot(d1,d1)
    e=vdot(d2,d2)
    f=vdot(d2,r)
    eps=1e-15
    if a<=eps and e<=eps:
        return math.dist(p1,p2)
    if a<=eps:
        ss=0.0
        tt=max(0.0,min(1.0,f/e))
    else:
        c=vdot(d1,r)
        if e<=eps:
            tt=0.0
            ss=max(0.0,min(1.0,-c/a))
        else:
            b=vdot(d1,d2)
            denom=a*e-b*b
            ss=0.0 if abs(denom)<=eps else max(0.0,min(1.0,(b*f-c*e)/denom))
            tt=(b*ss+f)/e
            if tt<0.0:
                tt=0.0
                ss=max(0.0,min(1.0,-c/a))
            elif tt>1.0:
                tt=1.0
                ss=max(0.0,min(1.0,(b-c)/a))
    c1=vadd(p1,vmul(d1,ss))
    c2=vadd(p2,vmul(d2,tt))
    return math.dist(c1,c2)

def triangle_distance(fa,fb):
    ta=tri_points(fa)
    tb=tri_points(fb)
    best=min(
        [point_triangle_distance(p,*tb) for p in ta] +
        [point_triangle_distance(p,*ta) for p in tb]
    )
    ea=((ta[0],ta[1]),(ta[1],ta[2]),(ta[2],ta[0]))
    eb=((tb[0],tb[1]),(tb[1],tb[2]),(tb[2],tb[0]))
    for a0,a1 in ea:
        for b0,b1 in eb:
            best=min(best,segment_segment_distance(a0,a1,b0,b1))
    return best

def contains_xz_triangle(x,z,face,epsilon=1e-7):
    a,b,c=tri_points(face)
    den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2])
    if abs(den)<=1e-15:
        return False
    l1=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den
    l2=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den
    l3=1.0-l1-l2
    return min(l1,l2,l3)>=-epsilon

def component_distance(a,b,limit=5.0):
    ba=bbox_expand(bbox3(a),limit)
    candidate_b=[fi for fi in b if bbox_intersects(face_bbox(fi),ba)]
    if not candidate_b:
        return math.inf
    best=math.inf
    for fa in a:
        ea=bbox_expand(face_bbox(fa),min(limit,best if math.isfinite(best) else limit))
        for fb in candidate_b:
            if not bbox_intersects(face_bbox(fb),ea):
                continue
            d=triangle_distance(faces[fa],faces[fb])
            if d<best:
                best=d
                if best<1e-7:
                    return 0.0
    return best

def project_point3(p):
    x,z=model_to_project((p[0],p[2]))
    return (x,p[1]-3.0,z)

def mesh_payload(face_indices):
    verts=[]
    inds=[]
    for fi in face_indices:
        for p in tri_points(faces[fi]):
            inds.append(len(verts))
            verts.append(list(project_point3(p)))
    return {"vertices":verts,"indices":inds}

def project_bbox3(face_indices):
    pts=[project_point3(vertices[vi]) for fi in face_indices for vi in faces[fi][:3]]
    return (
        min(p[0] for p in pts), min(p[1] for p in pts), min(p[2] for p in pts),
        max(p[0] for p in pts), max(p[1] for p in pts), max(p[2] for p in pts),
    )

def triangle_area_points(points):
    a,b,c=points
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy
    ny=uz*vx-ux*vz
    nz=ux*vy-uy*vx
    return 0.5*math.sqrt(nx*nx+ny*ny+nz*nz)

def component_project_area(face_indices):
    return sum(
        triangle_area_points(tuple(project_point3(p) for p in tri_points(faces[fi])))
        for fi in face_indices
    )

def triangle_distance_points(ta,tb):
    best=min(
        [point_triangle_distance(p,*tb) for p in ta] +
        [point_triangle_distance(p,*ta) for p in tb]
    )
    ea=((ta[0],ta[1]),(ta[1],ta[2]),(ta[2],ta[0]))
    eb=((tb[0],tb[1]),(tb[1],tb[2]),(tb[2],tb[0]))
    for a0,a1 in ea:
        for b0,b1 in eb:
            best=min(best,segment_segment_distance(a0,a1,b0,b1))
    return best

def component_distance_project(a,b,limit=5.0):
    ba=bbox_expand(project_bbox3(a),limit)
    candidate_b=[
        fi for fi in b
        if bbox_intersects(
            (
                min(project_point3(p)[0] for p in tri_points(faces[fi])),
                min(project_point3(p)[1] for p in tri_points(faces[fi])),
                min(project_point3(p)[2] for p in tri_points(faces[fi])),
                max(project_point3(p)[0] for p in tri_points(faces[fi])),
                max(project_point3(p)[1] for p in tri_points(faces[fi])),
                max(project_point3(p)[2] for p in tri_points(faces[fi])),
            ),
            ba
        )
    ]
    if not candidate_b:
        return math.inf
    best=math.inf
    for fa in a:
        ta=tuple(project_point3(p) for p in tri_points(faces[fa]))
        fba=(
            min(p[0] for p in ta),min(p[1] for p in ta),min(p[2] for p in ta),
            max(p[0] for p in ta),max(p[1] for p in ta),max(p[2] for p in ta),
        )
        ea=bbox_expand(fba,min(limit,best if math.isfinite(best) else limit))
        for fb in candidate_b:
            tb=tuple(project_point3(p) for p in tri_points(faces[fb]))
            fbb=(
                min(p[0] for p in tb),min(p[1] for p in tb),min(p[2] for p in tb),
                max(p[0] for p in tb),max(p[1] for p in tb),max(p[2] for p in tb),
            )
            if not bbox_intersects(fbb,ea):
                continue
            d=triangle_distance_points(ta,tb)
            if d<best:
                best=d
                if best<1e-7:
                    return 0.0
    return best

def component_anchor(comp):
    # Largest upward source component interior centroid, suitable only for QA
    # nearest-poly probing; it is not promoted as an authored gameplay point.
    unique=sorted({vi for fi in comp for vi in faces[fi][:3]})
    return [
        sum(model_to_project((vertices[vi][0],vertices[vi][2]))[0] for vi in unique)/len(unique),
        sum(vertices[vi][1]-3.0 for vi in unique)/len(unique),
        sum(model_to_project((vertices[vi][0],vertices[vi][2]))[1] for vi in unique)/len(unique),
    ]

def is_walk_face(fi, exclude_overlay=False):
    f=faces[fi]
    m=f[4]
    if not any(tok in m for tok in WALK_TOKENS):
        return False
    if exclude_overlay and any(tok in m for tok in OVERLAY_TOKENS):
        return False
    return tri_normal(f)[1] >= MIN_UP_Y

def local_walk_components(target_bbox, exclude_objects=(), exclude_overlay=False):
    local=[
        fi for fi in range(len(faces))
        if faces[fi][3] not in exclude_objects
        and is_walk_face(fi,exclude_overlay)
        and bbox_intersects(face_bbox(fi),bbox_expand(target_bbox,LOCAL_MARGIN))
    ]
    return componentize(local)

def component_graph_reachable(seed_faces,candidates,threshold=0.30):
    initial=[]
    for i,comp in enumerate(candidates):
        d=component_distance(seed_faces,comp,limit=threshold)
        if d<=threshold+1e-9:
            initial.append((i,d))
    seen={i for i,_ in initial}
    q=deque(i for i,_ in initial)
    edge_count=0
    while q:
        i=q.popleft()
        for j,other in enumerate(candidates):
            if j in seen:
                continue
            if not bbox_intersects(
                bbox_expand(bbox3(candidates[i]),threshold),
                bbox_expand(bbox3(other),0.0)
            ):
                continue
            d=component_distance(candidates[i],other,limit=threshold)
            if d<=threshold+1e-9:
                seen.add(j)
                q.append(j)
                edge_count+=1
    return initial,seen,edge_count

def print_reachable_summary(prefix,seed_faces,candidates,threshold=0.30):
    initial,seen,edge_count=component_graph_reachable(seed_faces,candidates,threshold)
    groups=defaultdict(lambda: {"components":0,"faces":0,"area":0.0,"nearest":math.inf})
    for i in sorted(seen):
        comp=candidates[i]
        sm=component_summary(comp)
        key=sm["top"][0][0]
        g=groups[key]
        g["components"]+=1
        g["faces"]+=sm["faces"]
        g["area"]+=sm["area"]
        g["nearest"]=min(g["nearest"],component_distance(seed_faces,comp,limit=LOCAL_MARGIN))
    print(
        f"{prefix} GRAPH threshold={threshold:.2f} initial={len(initial)} "
        f"reachable_components={len(seen)} discovered_edges={edge_count}"
    )
    for rank,(key,g) in enumerate(sorted(
        groups.items(), key=lambda kv:(-kv[1]["area"],kv[0])
    )[:20]):
        print(
            f"{prefix} REACHABLE rank={rank} obj={key[0]} mat={key[1]} "
            f"components={g['components']} faces={g['faces']} "
            f"area={g['area']:.6f} nearest_seed={g['nearest']:.6f}"
        )
    return initial,seen,groups

def print_neighbor_rows(prefix,target_comp,candidates,max_rows=18):
    rows=[]
    for comp in candidates:
        d=component_distance(target_comp,comp,limit=LOCAL_MARGIN)
        if not math.isfinite(d) or d>LOCAL_MARGIN:
            continue
        s=component_summary(comp)
        rows.append((d,comp,s))
    rows.sort(key=lambda row:(row[0],-row[2]["area"]))
    for rank,(d,comp,s) in enumerate(rows[:max_rows]):
        (o,m),count=s["top"][0]
        print(
            f"{prefix} NEIGHBOR rank={rank} dist={d:.6f} "
            f"obj={o} mat={m} faces={s['faces']} verts={s['verts']} "
            f"area={s['area']:.6f} ny=({s['ny_min']:.6f},{s['ny_max']:.6f}) "
            f"bbox={[round(v,6) for v in s['bbox']]}"
        )
    return rows

print(
    f"T21UPPER CONFIG max_slope_deg={MAX_SLOPE_DEG:.1f} "
    f"min_up_y={MIN_UP_Y:.9f} local_margin={LOCAL_MARGIN:.1f}"
)
audit_output={
    "version":"PASS18C_SOURCE_NATIVE_V1",
    "diagnosticOnly":True,
    "runtimePromotionAuthorized":False,
    "grates":{},
    "glass":{},
}
pass18g_starts={"grate":{},"glass":{}}
pass18g_backtrack_faces={"grate":{},"glass":{}}

# Grate: use the union of every local upward FloorFence00 component whose
# centroid is actually inside the transformed grate search footprint. The
# transform is only a local selector; the emitted candidate geometry is the
# exact Temple01 source mesh.
grate_unions={}
for side,pdfpoly in GRATE_PDF.items():
    poly=[pdf_to_model(p) for p in pdfpoly]
    x0=min(p[0] for p in poly)-1.5
    x1=max(p[0] for p in poly)+1.5
    z0=min(p[1] for p in poly)-1.5
    z1=max(p[1] for p in poly)+1.5
    candidate_faces=[]
    for fi,f in enumerate(faces):
        if f[3]!=GRATE_OBJECT or f[4]!=GRATE_MATERIAL:
            continue
        n=tri_normal(f)
        if n[1] < MIN_UP_Y:
            continue
        p=tri_points(f)
        ys=[v[1] for v in p]
        if max(ys)<10.15 or min(ys)>10.60:
            continue
        cx,cy,cz=centroid(f)
        if cx<x0 or cx>x1 or cz<z0 or cz>z1:
            continue
        candidate_faces.append(fi)
    comps=componentize(candidate_faces)
    rows=[]
    qualified=[]
    for comp in comps:
        inside=sum(
            1 for fi in comp
            if inside_poly(centroid(faces[fi])[0],centroid(faces[fi])[2],poly)
        )
        mind=min(
            poly_boundary_dist(centroid(faces[fi])[0],centroid(faces[fi])[2],poly)
            for fi in comp
        )
        sm=component_summary(comp)
        rows.append((-inside,mind,-sm["area"],comp,sm))
        if inside>0:
            qualified.append(comp)
    rows.sort()
    union=sorted({fi for comp in qualified for fi in comp})
    grate_unions[side]=union
    us=component_summary(union)
    print(
        f"T21UPPER GRATE_REGION side={side} "
        f"model_poly={[tuple(round(v,6) for v in p) for p in poly]} "
        f"faces={len(candidate_faces)} components={len(comps)} "
        f"qualified_components={len(qualified)}"
    )
    for rank,row in enumerate(rows[:12]):
        neg_inside,mind,neg_area,comp,sm=row
        print(
            f"T21UPPER GRATE_CANDIDATE side={side} rank={rank} "
            f"inside_centroids={-neg_inside} boundary_d={mind:.6f} "
            f"faces={sm['faces']} verts={sm['verts']} area={sm['area']:.6f} "
            f"ny=({sm['ny_min']:.6f},{sm['ny_max']:.6f}) "
            f"bbox={[round(v,6) for v in sm['bbox']]}"
        )
    print(
        f"T21UPPER GRATE_UNION side={side} faces={us['faces']} verts={us['verts']} "
        f"area={us['area']:.6f} ny=({us['ny_min']:.6f},{us['ny_max']:.6f}) "
        f"bbox={[round(v,6) for v in us['bbox']]}"
    )
    neighbors=local_walk_components(
        bbox3(union),
        exclude_objects=(GRATE_OBJECT,),
        exclude_overlay=True
    )
    nrows=print_neighbor_rows(f"T21UPPER GRATE_{side}",union,neighbors,30)
    nearest_comp=None
    nearest_distance=None
    nearest_object=None
    nearest_material=None
    if nrows:
        nearest_distance=nrows[0][0]
        nearest_comp=nrows[0][1]
        nearest_object=nrows[0][2]['top'][0][0][0]
        nearest_material=nrows[0][2]['top'][0][0][1]
        pass18g_starts["grate"][side]=nearest_comp
        pass18g_backtrack_faces["grate"][side]=union
        print(
            f"T21UPPER GRATE_NEAREST side={side} "
            f"dist={nearest_distance:.6f} "
            f"obj={nearest_object} "
            f"mat={nearest_material}"
        )
    for threshold in (0.30,0.40,0.50,0.75):
        initial,seen,groups=print_reachable_summary(
            f"T21UPPER GRATE_{side}_T{threshold:.2f}",union,neighbors,threshold
        )
    largest_comp=max(qualified,key=lambda comp:component_summary(comp)["area"])
    audit_output["grates"][side]={
        "sourceObject":GRATE_OBJECT,
        "sourceMaterial":GRATE_MATERIAL,
        "qualifiedComponentCount":len(qualified),
        "triangleCount":len(union),
        "areaSquareMeters":us["area"],
        "anchor":component_anchor(largest_comp),
        "mesh":mesh_payload(union),
        "nearestWalkDistanceMeters":nearest_distance,
        "nearestWalkObject":nearest_object,
        "nearestWalkMaterial":nearest_material,
        "nearestWalkMesh":None if nearest_comp is None else mesh_payload(nearest_comp),
    }

if set(grate_unions)=={"POSITIVE_Z","NEGATIVE_Z"}:
    def mirrored_vertex_set(comp):
        return {
            (round(-vertices[vi][0],3),round(vertices[vi][1],3),round(-vertices[vi][2],3))
            for fi in comp for vi in faces[fi][:3]
        }
    pos={
        (round(vertices[vi][0],3),round(vertices[vi][1],3),round(vertices[vi][2],3))
        for fi in grate_unions["POSITIVE_Z"] for vi in faces[fi][:3]
    }
    neg_mirror=mirrored_vertex_set(grate_unions["NEGATIVE_Z"])
    print(
        f"T21UPPER GRATE_SYMMETRY pos_vertices={len(pos)} "
        f"mirrored_neg_vertices={len(neg_mirror)} xor={len(pos ^ neg_mirror)}"
    )


# Glass: seed exact source components from the three previously verified Pass
# 13A project-XZ route points. This avoids selecting components by material name
# or area rank. Neighbor candidates are still geometry-only diagnostics.
glass_faces=[
    fi for fi,f in enumerate(faces)
    if f[3]==GLASS_OBJECT and f[4]==GLASS_MATERIAL and tri_normal(f)[1]>=MIN_UP_Y
]
glass_components=componentize(glass_faces)
face_to_glass_component={}
for ci,comp in enumerate(glass_components):
    for fi in comp:
        face_to_glass_component[fi]=ci

for side,route_points in GLASS_ROUTE_PROJECT_XZ.items():
    selected_ids=[]
    route_rows=[]
    for project_xz in route_points:
        mx,mz=project_to_model(project_xz)
        hits=[
            fi for fi in glass_faces
            if contains_xz_triangle(mx,mz,faces[fi])
        ]
        if not hits:
            raise SystemExit(
                f"T21UPPER glass route seed missing side={side} project={project_xz} model={(mx,mz)}"
            )
        # Prefer the face whose vertical surface point is closest to the accepted
        # broad route's authored upper-shell range; duplicate projected shell
        # faces are resolved deterministically by component area then index.
        candidate_ids=sorted({
            face_to_glass_component[fi] for fi in hits
        })
        ranked_ids=sorted(
            candidate_ids,
            key=lambda ci:(-component_summary(glass_components[ci])["area"],ci)
        )
        ci=ranked_ids[0]
        selected_ids.append(ci)
        route_rows.append((project_xz,(mx,mz),hits,ci))
    unique_ids=[]
    for ci in selected_ids:
        if ci not in unique_ids:
            unique_ids.append(ci)
    broad_faces=sorted({
        fi for ci in unique_ids for fi in glass_components[ci]
    })
    print(
        f"T21UPPER GLASS_ROUTE_BIND side={side} route_components={unique_ids} "
        f"unique_components={len(unique_ids)} faces={len(broad_faces)} "
        f"area={sum(tri_area(faces[fi]) for fi in broad_faces):.6f}"
    )
    for ri,(project_xz,model_xz,hits,ci) in enumerate(route_rows):
        sm=component_summary(glass_components[ci])
        print(
            f"T21UPPER GLASS_ROUTE side={side} index={ri} "
            f"project={project_xz} model=({model_xz[0]:.6f},{model_xz[1]:.6f}) "
            f"hit_faces={len(hits)} component={ci} area={sm['area']:.6f} "
            f"bbox={[round(v,6) for v in sm['bbox']]}"
        )
    if len(unique_ids)!=3:
        raise SystemExit(
            f"T21UPPER expected three Pass13A source components for {side}, got {unique_ids}"
        )
    neighbors=local_walk_components(
        bbox3(broad_faces),
        exclude_objects=(GLASS_OBJECT,),
        exclude_overlay=True
    )
    nrows=print_neighbor_rows(f"T21UPPER GLASS_{side}",broad_faces,neighbors,40)
    touching=[row for row in nrows if row[0]<=0.30+1e-9]
    print(
        f"T21UPPER GLASS_NEAR side={side} "
        f"within_0_30={len(touching)} nearest="
        f"{None if not nrows else round(nrows[0][0],6)}"
    )
    initial,seen,groups=print_reachable_summary(
        f"T21UPPER GLASS_{side}",broad_faces,neighbors,0.30
    )
    for threshold in (0.40,0.50,0.75,1.00):
        print_reachable_summary(
            f"T21UPPER GLASS_{side}_T{threshold:.2f}",
            broad_faces,
            neighbors,
            threshold
        )
    reachable_faces=sorted({
        fi for i in seen for fi in neighbors[i]
    })
    non_bridge_rows=[
        row for row in nrows
        if row[2]["top"][0][0][1] != "FldObj_Temple01_PntSet_BridgeMetal00"
    ]
    nearest_non_bridge=non_bridge_rows[0] if non_bridge_rows else None
    if nearest_non_bridge is not None:
        pass18g_starts["glass"][side]=nearest_non_bridge[1]
        pass18g_backtrack_faces["glass"][side]=reachable_faces
    audit_output["glass"][side]={
        "sourceObject":GLASS_OBJECT,
        "routeComponentIds":unique_ids,
        "broadSourceTriangleCount":len(broad_faces),
        "broadSourceAreaSquareMeters":sum(tri_area(faces[fi]) for fi in broad_faces),
        "broadMesh":mesh_payload(broad_faces),
        "bridgeReachableComponentCount":len(seen),
        "bridgeReachableTriangleCount":len(reachable_faces),
        "bridgeMesh":mesh_payload(reachable_faces),
        "nearestBridgeDistanceMeters":None if not nrows else nrows[0][0],
        "nearestNonBridgeDistanceMeters":None if nearest_non_bridge is None else nearest_non_bridge[0],
        "nearestNonBridgeObject":None if nearest_non_bridge is None else nearest_non_bridge[2]["top"][0][0][0],
        "nearestNonBridgeMaterial":None if nearest_non_bridge is None else nearest_non_bridge[2]["top"][0][0][1],
        "nearestNonBridgeMesh":None if nearest_non_bridge is None else mesh_payload(nearest_non_bridge[1]),
    }


# Pass 18G: recover the source-native continuation from each Pass 18F
# destination component toward an already-bound runtime anchor. This remains
# diagnostic-only: it emits exact source components and exact project-space
# surface gaps, while the Vitest side determines which components already have
# trusted membership in the current 25-anchor runtime graph.
continuation_groups=defaultdict(list)
for fi,f in enumerate(faces):
    if not active(f[3]) or not is_walk_face(fi,exclude_overlay=True):
        continue
    if any(tok in f[4] for tok in PASS18G_CONTINUATION_EXCLUDED_TOKENS):
        continue
    continuation_groups[(f[3],f[4])].append(fi)

continuation_components=[]
face_to_continuation={}
for (source_object,source_material),group_faces in sorted(continuation_groups.items()):
    comps=componentize(group_faces)
    comps=sorted(
        comps,
        key=lambda comp:(
            tuple(round(v,9) for v in project_bbox3(comp)),
            len(comp),
            min(comp),
        )
    )
    for component_index,comp in enumerate(comps):
        component_id=f"{source_object}|{source_material}|c{component_index}"
        record={
            "id":component_id,
            "sourceObject":source_object,
            "sourceMaterial":source_material,
            "componentIndex":component_index,
            "faces":comp,
            "triangleCount":len(comp),
            "areaSquareMeters":component_project_area(comp),
            "bbox":project_bbox3(comp),
        }
        continuation_components.append(record)
        for fi in comp:
            face_to_continuation[fi]=component_id

continuation_by_id={record["id"]:record for record in continuation_components}

def continuation_ids_for_faces(face_indices):
    counts=defaultdict(int)
    for fi in face_indices:
        component_id=face_to_continuation.get(fi)
        if component_id is not None:
            counts[component_id]+=1
    return [
        component_id for component_id,_ in sorted(
            counts.items(),key=lambda kv:(-kv[1],kv[0])
        )
    ]

def chain_component_payload(record):
    bbox=record["bbox"]
    return {
        "id":record["id"],
        "sourceObject":record["sourceObject"],
        "sourceMaterial":record["sourceMaterial"],
        "componentIndex":record["componentIndex"],
        "triangleCount":record["triangleCount"],
        "areaSquareMeters":record["areaSquareMeters"],
        "yRange":[bbox[1],bbox[4]],
        "bbox":list(bbox),
        "mesh":mesh_payload(record["faces"]),
    }

def build_pass18g_side(route_name,side):
    start_faces=pass18g_starts[route_name].get(side)
    if not start_faces:
        raise SystemExit(f"T21PASS18G missing start route={route_name} side={side}")
    start_ids=continuation_ids_for_faces(start_faces)
    if len(start_ids)!=1:
        raise SystemExit(
            f"T21PASS18G start identity ambiguous route={route_name} side={side} ids={start_ids}"
        )
    start_id=start_ids[0]
    start_record=continuation_by_id[start_id]
    local_bbox=bbox_expand(start_record["bbox"],PASS18G_LOCAL_MARGIN_METERS)

    backtrack_ids=set(
        continuation_ids_for_faces(pass18g_backtrack_faces[route_name].get(side,[]))
    )
    backtrack_ids.discard(start_id)

    candidates=[
        record for record in continuation_components
        if record["id"] not in backtrack_ids
        and bbox_intersects(record["bbox"],local_bbox)
    ]
    candidate_ids={record["id"] for record in candidates}
    if start_id not in candidate_ids:
        candidates.append(start_record)
        candidate_ids.add(start_id)
    candidates=sorted(candidates,key=lambda record:record["id"])

    edges=[]
    for i,a in enumerate(candidates):
        expanded=bbox_expand(a["bbox"],PASS18G_RELAXED_DISCOVERY_METERS)
        for b in candidates[i+1:]:
            if not bbox_intersects(expanded,b["bbox"]):
                continue
            d=component_distance_project(
                a["faces"],b["faces"],PASS18G_RELAXED_DISCOVERY_METERS
            )
            if d<=PASS18G_RELAXED_DISCOVERY_METERS+1e-9:
                edges.append({
                    "a":a["id"],
                    "b":b["id"],
                    "distanceMeters":d,
                })

    adjacency=defaultdict(list)
    for edge in edges:
        adjacency[edge["a"]].append(edge["b"])
        adjacency[edge["b"]].append(edge["a"])
    relaxed_seen={start_id}
    relaxed_queue=deque([start_id])
    while relaxed_queue:
        current=relaxed_queue.popleft()
        for nxt in adjacency[current]:
            if nxt in relaxed_seen:
                continue
            relaxed_seen.add(nxt)
            relaxed_queue.append(nxt)

    frontier_rows=[]
    reachable_records=[
        continuation_by_id[component_id]
        for component_id in sorted(relaxed_seen)
    ]
    unreached_records=[
        record for record in candidates
        if record["id"] not in relaxed_seen
    ]
    for a in reachable_records:
        expanded=bbox_expand(a["bbox"],PASS18G_LOCAL_MARGIN_METERS)
        for b in unreached_records:
            if not bbox_intersects(expanded,b["bbox"]):
                continue
            d=component_distance_project(
                a["faces"],b["faces"],PASS18G_LOCAL_MARGIN_METERS
            )
            if d<=PASS18G_LOCAL_MARGIN_METERS+1e-9:
                frontier_rows.append((d,a,b))
    frontier_rows.sort(key=lambda row:(row[0],row[1]["id"],row[2]["id"]))
    frontier=[
        {
            "distanceMeters":d,
            "fromComponentId":a["id"],
            "toComponentId":b["id"],
        }
        for d,a,b in frontier_rows[:12]
    ]

    print(
        f"T21PASS18G INVENTORY route={route_name} side={side} "
        f"start={start_id} candidates={len(candidates)} edges={len(edges)} "
        f"relaxed_reachable={len(relaxed_seen)} frontier_pairs={len(frontier_rows)} "
        f"backtrack_excluded={len(backtrack_ids)} "
        f"margin={PASS18G_LOCAL_MARGIN_METERS:.2f} relaxed={PASS18G_RELAXED_DISCOVERY_METERS:.2f}"
    )
    nearest=sorted(edges,key=lambda edge:edge["distanceMeters"])[:12]
    for rank,edge in enumerate(nearest):
        print(
            f"T21PASS18G EDGE route={route_name} side={side} rank={rank} "
            f"dist={edge['distanceMeters']:.9f} a={edge['a']} b={edge['b']}"
        )
    for rank,row in enumerate(frontier):
        print(
            f"T21PASS18G FRONTIER route={route_name} side={side} rank={rank} "
            f"dist={row['distanceMeters']:.9f} "
            f"from={row['fromComponentId']} to={row['toComponentId']}"
        )

    return {
        "startComponentId":start_id,
        "excludedBacktrackComponentIds":sorted(backtrack_ids),
        "components":[chain_component_payload(record) for record in candidates],
        "edges":edges,
        "relaxedReachableComponentIds":sorted(relaxed_seen),
        "frontier":frontier,
    }

audit_output["pass18g"]={
    "thresholdsMeters":list(PASS18G_THRESHOLDS),
    "relaxedDiscoveryMeters":PASS18G_RELAXED_DISCOVERY_METERS,
    "localMarginMeters":PASS18G_LOCAL_MARGIN_METERS,
    "routes":{
        "grate":{
            side:build_pass18g_side("grate",side)
            for side in ("POSITIVE_Z","NEGATIVE_Z")
        },
        "glass":{
            side:build_pass18g_side("glass",side)
            for side in ("POSITIVE_Z","NEGATIVE_Z")
        },
    },
}


# Pass 18H: inspect the exact Pass 18G gap/frontier pairs against every nearby
# Temple01 source material, including non-walk/overlay/steep geometry. This is
# diagnostic-only. It must not promote a connector, convenience slab, or any
# runtime geometry from proximity alone.
PASS18H_LOCAL_MARGIN_METERS=3.0
PASS18H_TRUSTED_BRIDGE_METERS=0.30
PASS18H_HUMAN_CONTACT_METERS=0.345
PASS18H_GRATE_GAP_COMPONENT_IDS={
    "POSITIVE_Z":(
        "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c0",
        "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c6",
    ),
    "NEGATIVE_Z":(
        "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c15",
        "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c22",
    ),
}

def pass18h_bbox_union(a,b):
    return (
        min(a[0],b[0]),min(a[1],b[1]),min(a[2],b[2]),
        max(a[3],b[3]),max(a[4],b[4]),max(a[5],b[5]),
    )

def pass18h_axis_gap(amin,amax,bmin,bmax):
    if amax < bmin:
        return bmin-amax
    if bmax < amin:
        return amin-bmax
    return 0.0

def pass18h_face_project_bbox(fi):
    pts=[project_point3(p) for p in tri_points(faces[fi])]
    return (
        min(p[0] for p in pts),min(p[1] for p in pts),min(p[2] for p in pts),
        max(p[0] for p in pts),max(p[1] for p in pts),max(p[2] for p in pts),
    )

pass18h_group_face_cache=defaultdict(list)
for pass18h_fi,pass18h_face in enumerate(faces):
    pass18h_group_face_cache[(pass18h_face[3],pass18h_face[4])].append(pass18h_fi)
pass18h_component_cache={}

def pass18h_components_for_key(key):
    cached=pass18h_component_cache.get(key)
    if cached is not None:
        return cached
    comps=componentize(pass18h_group_face_cache[key])
    comps=sorted(
        comps,
        key=lambda comp:(
            tuple(round(v,9) for v in project_bbox3(comp)),
            len(comp),
            min(comp),
        )
    )
    pass18h_component_cache[key]=comps
    return comps

def pass18h_component_summary(comp,source_object,source_material,component_index):
    bbox=project_bbox3(comp)
    nys=[tri_normal(faces[fi])[1] for fi in comp]
    walk_count=sum(1 for fi in comp if is_walk_face(fi,exclude_overlay=True))
    overlay_count=sum(
        1 for fi in comp
        if any(tok in faces[fi][4] for tok in OVERLAY_TOKENS)
    )
    return {
        "id":f"{source_object}|{source_material}|allc{component_index}",
        "sourceObject":source_object,
        "sourceMaterial":source_material,
        "componentIndex":component_index,
        "triangleCount":len(comp),
        "areaSquareMeters":component_project_area(comp),
        "bbox":list(bbox),
        "yRange":[bbox[1],bbox[4]],
        "normalYRange":[min(nys),max(nys)],
        "walkQualifiedFaceCount":walk_count,
        "overlayFaceCount":overlay_count,
        "steepOrNonUpwardFaceCount":len(comp)-sum(1 for ny in nys if ny>=MIN_UP_Y),
    }

def pass18h_nearby_source_components(a_record,b_record):
    region=bbox_expand(
        pass18h_bbox_union(a_record["bbox"],b_record["bbox"]),
        PASS18H_LOCAL_MARGIN_METERS
    )
    local_keys=set()
    for fi,f in enumerate(faces):
        if bbox_intersects(pass18h_face_project_bbox(fi),region):
            local_keys.add((f[3],f[4]))

    rows=[]
    a_faces=a_record["faces"]
    b_faces=b_record["faces"]
    for source_object,source_material in sorted(local_keys):
        comps=pass18h_components_for_key((source_object,source_material))
        for component_index,comp in enumerate(comps):
            pb=project_bbox3(comp)
            if not bbox_intersects(pb,region):
                continue
            if comp==a_faces or comp==b_faces:
                continue
            da=component_distance_project(
                a_faces,comp,PASS18H_LOCAL_MARGIN_METERS
            )
            db=component_distance_project(
                b_faces,comp,PASS18H_LOCAL_MARGIN_METERS
            )
            if not math.isfinite(da) or not math.isfinite(db):
                continue
            if min(da,db)>PASS18H_LOCAL_MARGIN_METERS+1e-9:
                continue
            summary=pass18h_component_summary(
                comp,source_object,source_material,component_index
            )
            summary.update({
                "distanceToA":da,
                "distanceToB":db,
                "bridgeScoreMeters":max(da,db),
                "bridgesAtTrusted030":
                    da<=PASS18H_TRUSTED_BRIDGE_METERS+1e-9
                    and db<=PASS18H_TRUSTED_BRIDGE_METERS+1e-9,
                "bridgesAtHumanContact0345":
                    da<=PASS18H_HUMAN_CONTACT_METERS+1e-9
                    and db<=PASS18H_HUMAN_CONTACT_METERS+1e-9,
            })
            rows.append(summary)
    rows.sort(
        key=lambda row:(
            row["bridgeScoreMeters"],
            row["distanceToA"]+row["distanceToB"],
            row["sourceObject"],
            row["sourceMaterial"],
            row["componentIndex"],
        )
    )
    return rows

def pass18h_endpoint_summary(record):
    bbox=record["bbox"]
    nys=[tri_normal(faces[fi])[1] for fi in record["faces"]]
    return {
        "id":record["id"],
        "sourceObject":record["sourceObject"],
        "sourceMaterial":record["sourceMaterial"],
        "componentIndex":record["componentIndex"],
        "triangleCount":record["triangleCount"],
        "areaSquareMeters":record["areaSquareMeters"],
        "bbox":list(bbox),
        "yRange":[bbox[1],bbox[4]],
        "normalYRange":[min(nys),max(nys)],
    }

def pass18h_gap_payload(a_id,b_id):
    if a_id not in continuation_by_id or b_id not in continuation_by_id:
        raise SystemExit(f"T21PASS18H missing endpoint a={a_id} b={b_id}")
    a=continuation_by_id[a_id]
    b=continuation_by_id[b_id]
    distance_m=component_distance_project(
        a["faces"],b["faces"],PASS18H_LOCAL_MARGIN_METERS
    )
    rows=pass18h_nearby_source_components(a,b)
    bbox_a=a["bbox"]
    bbox_b=b["bbox"]
    trusted=[row for row in rows if row["bridgesAtTrusted030"]]
    human=[row for row in rows if row["bridgesAtHumanContact0345"]]
    return {
        "a":pass18h_endpoint_summary(a),
        "b":pass18h_endpoint_summary(b),
        "distanceMeters":distance_m,
        "bboxAxisGapsMeters":[
            pass18h_axis_gap(bbox_a[0],bbox_a[3],bbox_b[0],bbox_b[3]),
            pass18h_axis_gap(bbox_a[1],bbox_a[4],bbox_b[1],bbox_b[4]),
            pass18h_axis_gap(bbox_a[2],bbox_a[5],bbox_b[2],bbox_b[5]),
        ],
        "verticalRangesOverlap":
            not (bbox_a[4]<bbox_b[1] or bbox_b[4]<bbox_a[1]),
        "nearbySourceComponentCount":len(rows),
        "trusted030BridgeCandidateCount":len(trusted),
        "humanContact0345BridgeCandidateCount":len(human),
        "trusted030BridgeCandidates":trusted[:12],
        "humanContact0345BridgeCandidates":human[:12],
        "nearestNearbySourceComponents":rows[:24],
    }

pass18h_grate={}
for side,(a_id,b_id) in PASS18H_GRATE_GAP_COMPONENT_IDS.items():
    pass18h_grate[side]=pass18h_gap_payload(a_id,b_id)

pass18h_glass={}
for side in ("POSITIVE_Z","NEGATIVE_Z"):
    route=audit_output["pass18g"]["routes"]["glass"][side]
    frontier=route["frontier"]
    if not frontier:
        raise SystemExit(f"T21PASS18H missing glass frontier side={side}")
    min_distance=frontier[0]["distanceMeters"]
    tied=[
        row for row in frontier
        if abs(row["distanceMeters"]-min_distance)<=1e-9
    ]
    pass18h_glass[side]={
        "frontierDistanceMeters":min_distance,
        "tiedFrontierCount":len(tied),
        "gaps":[
            pass18h_gap_payload(
                row["fromComponentId"],row["toComponentId"]
            )
            for row in tied
        ],
    }

audit_output["pass18h"]={
    "diagnosticOnly":True,
    "runtimePromotionAuthorized":False,
    "localMarginMeters":PASS18H_LOCAL_MARGIN_METERS,
    "trustedBridgeMeters":PASS18H_TRUSTED_BRIDGE_METERS,
    "humanContactMeters":PASS18H_HUMAN_CONTACT_METERS,
    "grate":pass18h_grate,
    "glass":pass18h_glass,
}

def pass18h_compact_gap(gap):
    return {
        "a":gap["a"],
        "b":gap["b"],
        "distanceMeters":gap["distanceMeters"],
        "bboxAxisGapsMeters":gap["bboxAxisGapsMeters"],
        "verticalRangesOverlap":gap["verticalRangesOverlap"],
        "nearbySourceComponentCount":gap["nearbySourceComponentCount"],
        "trusted030BridgeCandidateCount":gap["trusted030BridgeCandidateCount"],
        "humanContact0345BridgeCandidateCount":
            gap["humanContact0345BridgeCandidateCount"],
        "trusted030BridgeCandidates":gap["trusted030BridgeCandidates"],
        "humanContact0345BridgeCandidates":
            gap["humanContact0345BridgeCandidates"],
        "nearestNearbySourceComponents":gap["nearestNearbySourceComponents"],
    }

print(
    "T21PASS18H_GAP_SOURCE_AUDIT",
    json.dumps({
        "diagnosticOnly":True,
        "runtimePromotionAuthorized":False,
        "localMarginMeters":PASS18H_LOCAL_MARGIN_METERS,
        "trustedBridgeMeters":PASS18H_TRUSTED_BRIDGE_METERS,
        "humanContactMeters":PASS18H_HUMAN_CONTACT_METERS,
        "grate":{
            side:pass18h_compact_gap(gap)
            for side,gap in pass18h_grate.items()
        },
        "glass":{
            side:{
                "frontierDistanceMeters":record["frontierDistanceMeters"],
                "tiedFrontierCount":record["tiedFrontierCount"],
                "gaps":[pass18h_compact_gap(gap) for gap in record["gaps"]],
            }
            for side,record in pass18h_glass.items()
        },
    },separators=(",",":"))
)


# Pass 18I: exact closest-point vector decomposition for the Pass 18H localized
# gaps. This is geometry-only and diagnostic-only. It does not infer traversal
# semantics or authorize runtime collision/navigation.
def pass18i_closest_point_on_triangle(p,a,b,c):
    ab=vsub(b,a)
    ac=vsub(c,a)
    ap=vsub(p,a)
    d1=vdot(ab,ap)
    d2=vdot(ac,ap)
    if d1<=0 and d2<=0:
        return a
    bp=vsub(p,b)
    d3=vdot(ab,bp)
    d4=vdot(ac,bp)
    if d3>=0 and d4<=d3:
        return b
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:
        v=d1/(d1-d3)
        return vadd(a,vmul(ab,v))
    cp=vsub(p,c)
    d5=vdot(ab,cp)
    d6=vdot(ac,cp)
    if d6>=0 and d5<=d6:
        return c
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:
        w=d2/(d2-d6)
        return vadd(a,vmul(ac,w))
    va=d3*d6-d5*d4
    if va<=0 and (d4-d3)>=0 and (d5-d6)>=0:
        w=(d4-d3)/((d4-d3)+(d5-d6))
        return vadd(b,vmul(vsub(c,b),w))
    denom=1.0/(va+vb+vc)
    v=vb*denom
    w=vc*denom
    return vadd(a,vadd(vmul(ab,v),vmul(ac,w)))

def pass18i_closest_points_on_segments(p1,q1,p2,q2):
    d1=vsub(q1,p1)
    d2=vsub(q2,p2)
    r=vsub(p1,p2)
    a=vdot(d1,d1)
    e=vdot(d2,d2)
    f=vdot(d2,r)
    eps=1e-15
    s=0.0
    t=0.0
    if a<=eps and e<=eps:
        return p1,p2
    if a<=eps:
        t=max(0.0,min(1.0,f/e))
    else:
        cc=vdot(d1,r)
        if e<=eps:
            s=max(0.0,min(1.0,-cc/a))
        else:
            bb=vdot(d1,d2)
            denom=a*e-bb*bb
            if abs(denom)>eps:
                s=max(0.0,min(1.0,(bb*f-cc*e)/denom))
            tnom=bb*s+f
            if tnom<0:
                t=0.0
                s=max(0.0,min(1.0,-cc/a))
            elif tnom>e:
                t=1.0
                s=max(0.0,min(1.0,(bb-cc)/a))
            else:
                t=tnom/e
    return vadd(p1,vmul(d1,s)),vadd(p2,vmul(d2,t))

def pass18i_triangle_closest_pair(ta,tb):
    best=None
    def consider(pa,pb,kind):
        nonlocal best
        d=math.dist(pa,pb)
        if best is None or d<best[0]-1e-12:
            best=(d,pa,pb,kind)
    for idx,p in enumerate(ta):
        q=pass18i_closest_point_on_triangle(p,*tb)
        consider(p,q,f"A_VERTEX_{idx}_TO_B_TRI")
    for idx,p in enumerate(tb):
        q=pass18i_closest_point_on_triangle(p,*ta)
        consider(q,p,f"B_VERTEX_{idx}_TO_A_TRI")
    ea=((ta[0],ta[1]),(ta[1],ta[2]),(ta[2],ta[0]))
    eb=((tb[0],tb[1]),(tb[1],tb[2]),(tb[2],tb[0]))
    for ai,(a0,a1) in enumerate(ea):
        for bi,(b0,b1) in enumerate(eb):
            pa,pb=pass18i_closest_points_on_segments(a0,a1,b0,b1)
            consider(pa,pb,f"EDGE_{ai}_EDGE_{bi}")
    return best

def pass18i_component_closest_pair_project(a_faces,b_faces):
    best=None
    for fa in a_faces:
        ta=tuple(project_point3(p) for p in tri_points(faces[fa]))
        for fb in b_faces:
            tb=tuple(project_point3(p) for p in tri_points(faces[fb]))
            result=pass18i_triangle_closest_pair(ta,tb)
            if best is None or result[0]<best["distanceMeters"]-1e-12:
                best={
                    "distanceMeters":result[0],
                    "aPointProject":list(result[1]),
                    "bPointProject":list(result[2]),
                    "pairKind":result[3],
                    "aFaceIndex":fa,
                    "bFaceIndex":fb,
                }
    if best is None:
        raise SystemExit("T21PASS18I empty component pair")
    return best

def pass18i_project3_to_model3(p):
    mx,mz=project_to_model((p[0],p[2]))
    return [mx,p[1]+3.0,mz]

def pass18i_vector_payload(a_id,b_id):
    if a_id not in continuation_by_id or b_id not in continuation_by_id:
        raise SystemExit(f"T21PASS18I missing endpoint a={a_id} b={b_id}")
    a=continuation_by_id[a_id]
    b=continuation_by_id[b_id]
    pair=pass18i_component_closest_pair_project(a["faces"],b["faces"])
    ap=pair["aPointProject"]
    bp=pair["bPointProject"]
    am=pass18i_project3_to_model3(ap)
    bm=pass18i_project3_to_model3(bp)
    pd=[bp[i]-ap[i] for i in range(3)]
    md=[bm[i]-am[i] for i in range(3)]
    pair.update({
        "aComponentId":a_id,
        "bComponentId":b_id,
        "aPointModel":am,
        "bPointModel":bm,
        "projectDelta":pd,
        "modelDelta":md,
        "projectHorizontalDistanceMeters":math.hypot(pd[0],pd[2]),
        "modelHorizontalDistanceMeters":math.hypot(md[0],md[2]),
        "projectVerticalDeltaMeters":pd[1],
        "modelVerticalDeltaMeters":md[1],
        "modelDistanceMeters":math.dist(am,bm),
    })
    return pair

pass18i_grate={
    side:pass18i_vector_payload(a_id,b_id)
    for side,(a_id,b_id) in PASS18H_GRATE_GAP_COMPONENT_IDS.items()
}
pass18i_glass={}
for side in ("POSITIVE_Z","NEGATIVE_Z"):
    gaps=audit_output["pass18h"]["glass"][side]["gaps"]
    pass18i_glass[side]=[
        pass18i_vector_payload(gap["a"]["id"],gap["b"]["id"])
        for gap in gaps
    ]

audit_output["pass18i"]={
    "diagnosticOnly":True,
    "runtimePromotionAuthorized":False,
    "grate":pass18i_grate,
    "glass":pass18i_glass,
}

print(
    "T21PASS18I_EXACT_GAP_VECTOR",
    json.dumps(audit_output["pass18i"],separators=(",",":"))
)

OUTPUT.write_text(json.dumps(audit_output,separators=(",",":")),encoding="utf-8")
print(
    f"T21UPPER OUTPUT path={OUTPUT} bytes={OUTPUT.stat().st_size} "
    f"version={audit_output['version']}"
)
print("T21UPPER AUTHORITY diagnostic_only=true runtime_promotion_authorized=false")



# T21 Coverage v3.1 WHOLE-STAGE SOURCE DISCOVERY, not runtime / stage-authority.
# Unlike Pass18G's locally cropped source routes, continuation_components already
# enumerates ALL active Temple01 walk-token source components in this original OBJ.
# Keep its exclusions (FloorLine/FloorFence overlays) and walk-orientation filter.
# The full report supplies independent macro-topology evidence for zone work.
import re as _t21_re
_t21_vector_source=Path("src/stage/undertow/UndertowSpillwayVectorBlueprint.ts").read_text(encoding="utf-8")
_t21_outer_part=_t21_vector_source.split("commonPlayableOuterBoundary: vectorTrace(",1)[1].split("'HARD_EDGE'",1)[0]
_t21_outer_pdf=[
    (float(ax),float(az)) for ax,az in _t21_re.findall(
      r"\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]",_t21_outer_part)
]
if len(_t21_outer_pdf)!=42:
    raise SystemExit(f"T21FULL_SOURCE expected 42 frozen boundary points; found {len(_t21_outer_pdf)}")
_t21_outer_project=[pdf_to_project(x) for x in _t21_outer_pdf]
def _t21_hard_inside(p):
    x,z=p; inside=False
    for i in range(len(_t21_outer_project)):
        a=_t21_outer_project[i-1];b=_t21_outer_project[i]
        cross=(x-a[0])*(b[1]-a[1])-(z-a[1])*(b[0]-a[0])
        dot=(x-a[0])*(x-b[0])+(z-a[1])*(z-b[1])
        if abs(cross)<=1e-8 and dot<=1e-8:return True
        if (a[1]>z)!=(b[1]>z) and x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]:
            inside=not inside
    return inside
def _t21_source_zone(cx,cz):
    if abs(cz)<=15:return "CENTER"
    if cx<=-14:return "LEFT_SIDE"
    if cx>=14:return "RIGHT_SIDE"
    return "POS" if cz>0 else "NEG"
_t21_global_rows=[]
for _t21_component in continuation_components:
    _t21_bbox=_t21_component["bbox"]
    _t21_cx=(_t21_bbox[0]+_t21_bbox[3])/2
    _t21_cz=(_t21_bbox[2]+_t21_bbox[5])/2
    _t21_inside=0;_t21_outside=0
    for _t21_fi in _t21_component["faces"]:
        _t21_tri=[project_point3(v) for v in tri_points(faces[_t21_fi])]
        _t21_a,_t21_b,_t21_c=_t21_tri
        _t21_samples=[
            (_t21_a[0],_t21_a[2]),(_t21_b[0],_t21_b[2]),(_t21_c[0],_t21_c[2]),
            ((_t21_a[0]+_t21_b[0])/2,(_t21_a[2]+_t21_b[2])/2),
            ((_t21_a[0]+_t21_c[0])/2,(_t21_a[2]+_t21_c[2])/2),
            ((_t21_b[0]+_t21_c[0])/2,(_t21_b[2]+_t21_c[2])/2),
            ((_t21_a[0]+_t21_b[0]+_t21_c[0])/3,(_t21_a[2]+_t21_b[2]+_t21_c[2])/3)
        ]
        for _t21_sample in _t21_samples:
            if _t21_hard_inside(_t21_sample):_t21_inside+=1
            else:_t21_outside+=1
    _t21_global_rows.append({
        "sourceComponentId":_t21_component["id"],
        "sourceObject":_t21_component["sourceObject"],
        "sourceMaterial":_t21_component["sourceMaterial"],
        "sourceAreaSquareMeters":_t21_component["areaSquareMeters"],
        "triangleCount":_t21_component["triangleCount"],
        "bboxProjectXYZ":list(_t21_bbox),
        "yRangeProjectMeters":[_t21_bbox[1],_t21_bbox[4]],
        "bboxCentroidXZ":[_t21_cx,_t21_cz],
        "planZoneDiagnostic":_t21_source_zone(_t21_cx,_t21_cz),
        "withinFrozenBoundarySampleCount":_t21_inside,
        "outsideFrozenBoundarySampleCount":_t21_outside,
        "boundarySampleDisposition":"ALL_7_PER_TRIANGLE_INSIDE" if _t21_outside==0 else "REQUIRES_BOUNDARY_RECONCILIATION",
        "placementAuthority":"SET_ACTOR_PLACEMENT_UNRESOLVED" if _t21_component["sourceObject"].startswith("FldObj_") else "STATIC_SOURCE_IDENTITY_ONLY",
        "runtimePromotionAuthorized":False,
    })
_t21_global_rows.sort(key=lambda item:(-item["sourceAreaSquareMeters"],item["sourceComponentId"]))
_t21_zone_stats={}
for _t21_zone in ("CENTER","POS","NEG","LEFT_SIDE","RIGHT_SIDE"):
    _t21_part=[row for row in _t21_global_rows if row["planZoneDiagnostic"]==_t21_zone]
    _t21_zone_stats[_t21_zone]={
        "componentCount":len(_t21_part),
        "summedSourceTriangleAreaSquareMeters":sum(v["sourceAreaSquareMeters"] for v in _t21_part),
        "allSamplesInsideCount":sum(v["outsideFrozenBoundarySampleCount"]==0 for v in _t21_part),
        "boundaryConflictCount":sum(v["outsideFrozenBoundarySampleCount"]>0 for v in _t21_part),
    }
_t21_full={
    "version":"T21_WHOLE_STAGE_WALK_SOURCE_INVENTORY_V1",
    "sourceAuditVersion":audit_output["version"],
    "sourceGeometry":"PINNED_KITRIX_VSS_TEMPLE01_OBJ",
    "sourceScope":"ALL_ACTIVE_TEMPLE01_UPWARD_WALK_TOKEN_COMPONENTS_NOT_ALL_MATERIALS",
    "sourceWalkTokens":list(WALK_TOKENS),
    "sourceOverlayExcludedTokens":list(PASS18G_CONTINUATION_EXCLUDED_TOKENS),
    "sourceOrientationMaxSlopeDegrees":MAX_SLOPE_DEG,
    "frozenHardSilhouetteVertices":len(_t21_outer_project),
    "boundaryAuthority":"7_XZ_SAMPLES_PER_SOURCE_TRIANGLE_NOT_EXACT_POLYGON_CLIPPING",
    "planZoneAuthority":"DIAGNOSTIC_BINS_NOT_GAMEPLAY_ROUTE_BORDERS",
    "stagePlacementAuthority":"UNVERIFIED_FOR_SET_ACTORS",
    "reviewOnly":True,"runtimePromotionAuthorized":False,
    "sourceComponentsTotal":len(_t21_global_rows),
    "zoneStats":_t21_zone_stats,
    "components":_t21_global_rows,
}
_t21_global_output=Path("/tmp/t21-whole-stage-source-inventory.json")
_t21_global_output.write_text(json.dumps(_t21_full,separators=(",",":")),encoding="utf-8")
print(
    "T21_WHOLE_STAGE_SOURCE",
    f"components={len(_t21_global_rows)}",
    f"source_area_sum={sum(v['sourceAreaSquareMeters'] for v in _t21_global_rows):.2f}",
    f"inside_sampled={sum(v['outsideFrozenBoundarySampleCount']==0 for v in _t21_global_rows)}",
    f"boundary_pending={sum(v['outsideFrozenBoundarySampleCount']>0 for v in _t21_global_rows)}",
    f"output={_t21_global_output}",
)


# Deliberately small, PRE-SELECTED broad terrain source group: static Fld_Temple01
# only. It is NOT an indiscriminate all-source promotion. Every component is
# a high-area original Temple01 walk-source with two fully-inside mirror members.
# The export records byte-exact float64 triples as artifact for later pinning.
import struct as _t21_struct
import base64 as _t21_base64
_t21_batch3_pairs=[
  ("Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c12",
   "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c1"),
  ("Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c8",
   "Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c3"),
  ("Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c11",
   "Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c0"),
  ("Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9",
   "Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2"),
]
_t21_full_by_id={row["sourceComponentId"]:row for row in _t21_global_rows}
_t21_batch3_records=[]
_t21_batch3_bytes=bytearray()
for _t21_pair_id,_t21_pair in enumerate(_t21_batch3_pairs,1):
    _t21_pair_records=[]
    for _t21_id in _t21_pair:
        if _t21_id not in continuation_by_id or _t21_id not in _t21_full_by_id:
            raise SystemExit("T21BATCH3 missing whole-model source "+_t21_id)
        _t21_original=continuation_by_id[_t21_id]
        _t21_audit=_t21_full_by_id[_t21_id]
        if _t21_audit["outsideFrozenBoundarySampleCount"] != 0:
            raise SystemExit("T21BATCH3 source hard-silhouette disagreement "+_t21_id)
        if not _t21_id.startswith("Fld_Temple01_"):
            raise SystemExit("T21BATCH3 requires static source identity "+_t21_id)
        _t21_mesh=mesh_payload(_t21_original["faces"])
        _t21_verts=_t21_mesh["vertices"]
        if len(_t21_verts)!=len(_t21_mesh["indices"]) or _t21_mesh["indices"]!=list(range(len(_t21_verts))):
            raise SystemExit("T21BATCH3 expected original expanded triangle list "+_t21_id)
        if len(_t21_verts)<3 or len(_t21_verts)%3:
            raise SystemExit("T21BATCH3 malformed original triangles "+_t21_id)
        _t21_record={
            "pairId":_t21_pair_id,
            "sourceComponentId":_t21_id,
            "sourceMaterial":_t21_original["sourceMaterial"],
            "areaSquareMeters":_t21_original["areaSquareMeters"],
            "yRange":_t21_audit["yRangeProjectMeters"],
            "vertexCount":len(_t21_verts),
            "placementAuthority":"STATIC_SOURCE_IDENTITY_ONLY",
            "runtimePromotionAuthorized":False,
        }
        _t21_pair_records.append((_t21_record,_t21_verts))
    (_t21_a,_t21_av),(_t21_b,_t21_bv)=_t21_pair_records
    if abs(_t21_a["areaSquareMeters"]-_t21_b["areaSquareMeters"])>1e-6 or _t21_a["yRange"]!=_t21_b["yRange"]:
        raise SystemExit("T21BATCH3 mirror area/Y mismatch pair "+str(_t21_pair_id))
    for _t21_point in _t21_av:
        _t21_match=min(
           math.hypot(_t21_point[0]+v[0]-0.229368288528164,
                      _t21_point[1]-v[1],
                      _t21_point[2]+v[2]-0.194564295456822)
           for v in _t21_bv)
        if _t21_match>1e-6:
            raise SystemExit("T21BATCH3 source mirror XYZ mismatch pair "+str(_t21_pair_id))
    for _t21_record,_t21_verts in _t21_pair_records:
        _t21_batch3_records.append(_t21_record)
        _t21_batch3_bytes.extend(_t21_struct.pack("<H",len(_t21_verts)))
        for _t21_point in _t21_verts:
            _t21_batch3_bytes.extend(_t21_struct.pack("<ddd",*_t21_point))
_t21_batch3_output=Path("/tmp/t21-broad-source-batch3.json")
_t21_batch3_output.write_text(json.dumps({
   "version":"T21_LARGE_TERRAIN_BATCH3_V1",
   "sourceAuditVersion":audit_output["version"],
   "reviewOnly":True,"runtimePromotionAuthorized":False,
   "pairCount":len(_t21_batch3_pairs),
   "meshCount":len(_t21_batch3_records),
   "records":_t21_batch3_records,
   "packedFloat64LEBase64":_t21_base64.b64encode(_t21_batch3_bytes).decode("ascii"),
   "packedByteLength":len(_t21_batch3_bytes),
   "sourceGeometry":"EXACT_TEMPLE01_SOURCE_NO_REPROJECTION_OR_CLIPPING",
   "note":"Source visual only; 7-point outer gate and mirror/source exactness verified. Not gameplay collision/paint/nav."
 },separators=(",",":")),encoding="utf-8")
print("T21BATCH3 SOURCE_CANDIDATES",
      f"pairs={len(_t21_batch3_pairs)} meshes={len(_t21_batch3_records)}",
      f"triangle_area={sum(c['areaSquareMeters'] for c in _t21_batch3_records):.3f}",
      f"packed_bytes={len(_t21_batch3_bytes)}",
      f"output={_t21_batch3_output}")


# T21 Phase 4 — targeted LEFT/RIGHT flank and elevated connector geometry,
# selected from the WHOLE-MODEL source inventory, not guessed slabs or mirrored
# invented vertices. The frozen 54 displayed source IDs are preflight-excluded.
# These components have source XZ triangle samples inside the unchanged hard
# outline; source Y, full XYZ triangle triples and paired symmetry are checked.
_t21_flank_pair_ids=[
  ("Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c0",
   "Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c8"),
  ("Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c1",
   "Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c11"),
  ("Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c2",
   "Fld_Temple01_pCube21569_1__FloorConcrete03|Fld_Temple01_FloorConcrete03|c10"),
  ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c0",
   "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c29"),
  ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c1",
   "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c28"),
]
_t21_flank_records=[]
_t21_flank_bytes=bytearray()
_t21_flank_centers=[]
for _t21_pid,_t21_pair in enumerate(_t21_flank_pair_ids,1):
    _t21_mesh_pair=[]
    for _t21_source_id in _t21_pair:
        if _t21_source_id not in continuation_by_id or _t21_source_id not in _t21_full_by_id:
            raise SystemExit("T21FLANK missing source "+_t21_source_id)
        if not _t21_source_id.startswith("Fld_Temple01_"):
            raise SystemExit("T21FLANK requires uninstanced static source "+_t21_source_id)
        _t21_src=continuation_by_id[_t21_source_id]
        _t21_inv=_t21_full_by_id[_t21_source_id]
        if _t21_inv["outsideFrozenBoundarySampleCount"]:
            raise SystemExit("T21FLANK exterior sample authority conflict "+_t21_source_id)
        _t21_mesh=mesh_payload(_t21_src["faces"])
        _t21_vertices=_t21_mesh["vertices"]
        if _t21_mesh["indices"]!=list(range(len(_t21_vertices))) or len(_t21_vertices)%3 or len(_t21_vertices)<3:
            raise SystemExit("T21FLANK invalid original source triangle order "+_t21_source_id)
        _t21_side="POSITIVE_Z" if sum(v[2] for v in _t21_vertices)>=0 else "NEGATIVE_Z"
        _t21_record={
            "pairId":_t21_pid,
            "sourceComponentId":_t21_source_id,
            "sourceMaterial":_t21_src["sourceMaterial"],
            "sourceAreaSquareMeters":_t21_src["areaSquareMeters"],
            "yRange":_t21_inv["yRangeProjectMeters"],
            "planZoneDiagnostic":_t21_inv["planZoneDiagnostic"],
            "side":_t21_side,
            "vertexCount":len(_t21_vertices),
            "boundarySamplesInside":_t21_inv["withinFrozenBoundarySampleCount"],
            "boundarySamplesOutside":0,
            "placementAuthority":"STATIC_SOURCE_IDENTITY_ONLY",
            "runtimePromotionAuthorized":False,
        }
        _t21_mesh_pair.append((_t21_record,_t21_vertices))
    (_t21_ra,_t21_va),(_t21_rb,_t21_vb)=_t21_mesh_pair
    if abs(_t21_ra["sourceAreaSquareMeters"]-_t21_rb["sourceAreaSquareMeters"])>1e-6 or _t21_ra["yRange"]!=_t21_rb["yRange"]:
        raise SystemExit("T21FLANK mirrored source area/Y disagreement pair "+str(_t21_pid))
    if _t21_ra["side"]==_t21_rb["side"]:
        raise SystemExit("T21FLANK both candidates belong to same source side "+str(_t21_pid))
    for _t21_pt in _t21_va:
        if min(math.hypot(_t21_pt[0]+w[0]-0.229368288528164,
                          _t21_pt[1]-w[1],
                          _t21_pt[2]+w[2]-0.194564295456822)
              for w in _t21_vb)>1e-6:
            raise SystemExit("T21FLANK original source XYZ mirror mismatch pair "+str(_t21_pid))
    for _t21_record,_t21_vertices in _t21_mesh_pair:
        _t21_flank_records.append(_t21_record)
        _t21_flank_bytes.extend(_t21_struct.pack("<H",len(_t21_vertices)))
        for _t21_pt in _t21_vertices:
            _t21_flank_bytes.extend(_t21_struct.pack("<ddd",*_t21_pt))
_t21_flank_output=Path("/tmp/t21-flank-elevation-phase4.json")
_t21_flank_output.write_text(json.dumps({
    "version":"T21_FLANK_ELEVATION_SOURCE_PHASE4_V1",
    "sourceAuditVersion":audit_output["version"],
    "originalModel":"PINNED_KITRIX_VSS_TEMPLE01_OBJ",
    "reviewOnly":True,
    "runtimePromotionAuthorized":False,
    "pairs":len(_t21_flank_pair_ids),
    "records":_t21_flank_records,
    "packedFloat64LEBase64":_t21_base64.b64encode(_t21_flank_bytes).decode("ascii"),
    "packedByteLength":len(_t21_flank_bytes),
    "sourcePrecision":"UNMODIFIED_FLOAT64_XYZ",
    "boundaryAuthority":"7_SAMPLES_PER_TRIANGLE_NOT_EXACT_POLYGON_INTERSECTION",
    "connectivityAuthority":"UNRESOLVED",
    "runtimePropertiesAuthorized":[],
},separators=(",",":")),encoding="utf-8")
print("T21FLANK_EXACT_SOURCE",f"pairs={len(_t21_flank_pair_ids)}",
      f"meshes={len(_t21_flank_records)}",
      f"original_source_triangle_area={sum(r['sourceAreaSquareMeters'] for r in _t21_flank_records):.3f}",
      f"bytes={len(_t21_flank_bytes)}",f"output={_t21_flank_output}")


# Phase 5A: independent ORIGINAL Temple01 vertical source *evidence*.
# This intentionally does not add StageDefinition solids, inferred terrain,
# overhang collision, wall paint or runtime movement authority. Upward walk
# faces are not enough to understand vertical structure; inventory the missing
# walls, sidewall faces, support pillars and undersides by exact source object.
# The object/material grouping deliberately preserves original provenance.
# A component uses shared OBJ vertex IDs within its source object/material.
_T21_VERTICAL_UP_NORMAL_MAX=0.32
_T21_VERTICAL_MIN_AREA_SQM=4.0
_T21_VERTICAL_MIN_HEIGHT_M=0.8
_t21_vertical_groups=defaultdict(list)
for _t21_fi,_t21_face in enumerate(faces):
    _t21_ny=tri_normal(_t21_face)[1]
    if abs(_t21_ny)<=_T21_VERTICAL_UP_NORMAL_MAX:
        _t21_vertical_groups[(_t21_face[3],_t21_face[4])].append(_t21_fi)
_t21_vertical_rows=[]
_t21_vertical_rejected_low_area=0
_t21_vertical_rejected_flat_height=0
for _t21_objmat in sorted(_t21_vertical_groups):
    _t21_vface_indices=_t21_vertical_groups[_t21_objmat]
    # A material/object can contain disconnected walls; preserve that fact.
    _t21_vcomps=componentize(_t21_vface_indices)
    _t21_vcomps.sort(key=lambda ff:(min(ff),len(ff)))
    for _t21_component_index,_t21_vfaces in enumerate(_t21_vcomps):
        _t21_varea=component_project_area(_t21_vfaces)
        if _t21_varea<_T21_VERTICAL_MIN_AREA_SQM:
            _t21_vertical_rejected_low_area+=1
            continue
        _t21_vbounds=project_bbox3(_t21_vfaces)
        _t21_yspan=_t21_vbounds[4]-_t21_vbounds[1]
        if _t21_yspan<_T21_VERTICAL_MIN_HEIGHT_M:
            _t21_vertical_rejected_flat_height+=1
            continue
        _t21_xz_inside=0;_t21_xz_outside=0
        _t21_sampled_xz_bounds=[]
        for _t21_fi in _t21_vfaces:
            _t21_p,_t21_q,_t21_r=[project_point3(v) for v in tri_points(faces[_t21_fi])]
            _t21_pts=[(_t21_p[0],_t21_p[2]),(_t21_q[0],_t21_q[2]),(_t21_r[0],_t21_r[2]),
                 ((_t21_p[0]+_t21_q[0])/2,(_t21_p[2]+_t21_q[2])/2),
                 ((_t21_q[0]+_t21_r[0])/2,(_t21_q[2]+_t21_r[2])/2),
                 ((_t21_p[0]+_t21_r[0])/2,(_t21_p[2]+_t21_r[2])/2),
                 ((_t21_p[0]+_t21_q[0]+_t21_r[0])/3,(_t21_p[2]+_t21_q[2]+_t21_r[2])/3)]
            for _t21_pt in _t21_pts:
                if _t21_hard_inside(_t21_pt):_t21_xz_inside+=1
                else:_t21_xz_outside+=1
        _t21_cx=(_t21_vbounds[0]+_t21_vbounds[3])/2
        _t21_cz=(_t21_vbounds[2]+_t21_vbounds[5])/2
        _t21_vid=_t21_objmat[0]+"|"+_t21_objmat[1]+"|v"+str(_t21_component_index)
        _t21_vertical_rows.append({
            "sourceComponentId":_t21_vid,
            "sourceObject":_t21_objmat[0],
            "sourceMaterial":_t21_objmat[1],
            "sourceAreaSquareMeters":_t21_varea,
            "faceCount":len(_t21_vfaces),
            "minSourceFaceIndex":min(_t21_vfaces),
            "minAbsNormalY":min(abs(tri_normal(faces[k])[1]) for k in _t21_vfaces),
            "maxAbsNormalY":max(abs(tri_normal(faces[k])[1]) for k in _t21_vfaces),
            "bboxProjectXYZ":list(_t21_vbounds),
            "yRangeProjectMeters":[_t21_vbounds[1],_t21_vbounds[4]],
            "diagnosticPlanZone":_t21_source_zone(_t21_cx,_t21_cz),
            "insideHardBoundarySamples":_t21_xz_inside,
            "outsideHardBoundarySamples":_t21_xz_outside,
            "boundarySampleAuthority":"SEVEN_XZ_TRIANGLE_SAMPLES_NOT_EXACT_CONTAINMENT",
            "potentialRole":"VERTICAL_FACING_SOURCE_COMPONENT_ONLY",
            "sourceGeometryAuthority":"ORIGINAL_OBJ_VSS_TEMPLE01",
            "placementAuthority":"SET_ACTOR_PLACEMENT_UNRESOLVED" if _t21_objmat[0].startswith("FldObj_") else "STATIC_SOURCE_IDENTITY_ONLY",
            "connectivityConfidence":"UNRESOLVED",
            "paintCollisionNavAuthority":"NONE",
            "reviewOnly":True,
            "runtimePromotionAuthorized":False,
        })
_t21_vertical_rows.sort(key=lambda row:(-row["sourceAreaSquareMeters"],row["sourceComponentId"]))
_t21_vertical_stats={}
for _t21_zone in ("CENTER","POS","NEG","LEFT_SIDE","RIGHT_SIDE"):
    _t21_zone_rows=[r for r in _t21_vertical_rows if r["diagnosticPlanZone"]==_t21_zone]
    _t21_vertical_stats[_t21_zone]={
       "candidateCount":len(_t21_zone_rows),
       "fullyInside7SamplesCount":sum(r["outsideHardBoundarySamples"]==0 for r in _t21_zone_rows),
       "outOfOutlineCandidateCount":sum(r["outsideHardBoundarySamples"]>0 for r in _t21_zone_rows),
       "sourceTriangleAreaSumSquareMeters":sum(r["sourceAreaSquareMeters"] for r in _t21_zone_rows)
    }
_t21_vertical_output=Path("/tmp/t21-vertical-source-inventory.json")
_t21_vertical_output.write_text(json.dumps({
   "version":"T21_VERTICAL_SOURCE_COMPONENTS_V1",
   "sourceAuditVersion":audit_output["version"],
   "sourceScope":"ACTIVE_TEMPLE01_ORIGINAL_SOURCE_TRIANGLES_WITH_STRONGLY_VERTICAL_NORMAL",
   "sourceVerticalMaxAbsoluteNormalY":_T21_VERTICAL_UP_NORMAL_MAX,
   "minimum3DSourceAreaSquareMeters":_T21_VERTICAL_MIN_AREA_SQM,
   "minimumVerticalSpanMeters":_T21_VERTICAL_MIN_HEIGHT_M,
   "sourceComponentCount":len(_t21_vertical_rows),
   "rejectedTinyAreaCount":_t21_vertical_rejected_low_area,
   "rejectedInsufficientHeightCount":_t21_vertical_rejected_flat_height,
   "zoneStats":_t21_vertical_stats,
   "candidates":_t21_vertical_rows,
   "sourceTextureAndActorLimit":"ORIGINAL MODEL SURFACE; DOES NOT PROVE ACTIVE SCENE OBJECT, MATERIAL, COLLISION OR WALL LOCATION IN GAME",
   "boundaryLimit":"7_SAMPLE_APPROXIMATION_NOT_EXACT_POLYGON_CLIP",
   "noInferredRuntimeAuthority":True,
   "reviewOnly":True,"runtimePromotionAuthorized":False
},separators=(",",":")),encoding="utf-8")
print("T21_VERTICAL_SOURCE",f"candidates={len(_t21_vertical_rows)}",
      f"fully_inside={sum(r['outsideHardBoundarySamples']==0 for r in _t21_vertical_rows)}",
      f"exterior_pending={sum(r['outsideHardBoundarySamples']>0 for r in _t21_vertical_rows)}",
      f"output={_t21_vertical_output}")


# Phase 5B: six INDEPENDENT static Temple01 mirrored vertical candidate pairs.
# Frozen index 'vN' is the connected original OBJ face component in one
# object/material group, with ascending min face index. This source is not
# fabricated wall/collision geometry, and no gameplay activation is possible.
_t21_vpairs=[
 ("Fld_Temple01_group20361_1__Glass01|Fld_Temple01_Glass01|v41",
  "Fld_Temple01_group20361_1__Glass01|Fld_Temple01_Glass01|v21"),
 ("Fld_Temple01_group20357_1__WallMetal00|Fld_Temple01_WallMetal00|v263",
  "Fld_Temple01_group20357_1__WallMetal00|Fld_Temple01_WallMetal00|v264"),
 ("Fld_Temple01_pCube21284_1__Glass02|Fld_Temple01_Glass02|v1",
  "Fld_Temple01_pCube21284_1__Glass02|Fld_Temple01_Glass02|v0"),
 ("Fld_Temple01_group20361_1__Glass01|Fld_Temple01_Glass01|v58",
  "Fld_Temple01_group20361_1__Glass01|Fld_Temple01_Glass01|v59"),
 ("Fld_Temple01_group20357_1__WallMetal00|Fld_Temple01_WallMetal00|v276",
  "Fld_Temple01_group20357_1__WallMetal00|Fld_Temple01_WallMetal00|v277"),
 ("Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v177",
  "Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v176"),
]
_t21_vbyid={x["sourceComponentId"]:x for x in _t21_vertical_rows}
_t21_vcached={}
_t21_vrecords=[]
_t21_vpacked=bytearray()
for _t21_pair_index,_t21_ids in enumerate(_t21_vpairs,1):
    _t21_paired=[]
    for _t21_source_id in _t21_ids:
        if _t21_source_id not in _t21_vbyid:
            raise SystemExit("T21_VERTICAL_5B frozen vertical source ID missing "+_t21_source_id)
        _t21_record=_t21_vbyid[_t21_source_id]
        if _t21_record["outsideHardBoundarySamples"]:
            raise SystemExit("T21_VERTICAL_5B source escapes hard boundary "+_t21_source_id)
        if not _t21_source_id.startswith("Fld_Temple01_"):
            raise SystemExit("T21_VERTICAL_5B only original static source (not PntSet) "+_t21_source_id)
        _t21_object,_t21_material,_t21_suffix=_t21_source_id.split("|")
        _t21_key=(_t21_object,_t21_material)
        if _t21_key not in _t21_vcached:
            _t21_co=componentize(_t21_vertical_groups[_t21_key])
            _t21_co.sort(key=lambda ff:(min(ff),len(ff)))
            _t21_vcached[_t21_key]=_t21_co
        _t21_fidx=_t21_vcached[_t21_key][int(_t21_suffix[1:])]
        _t21_xyz=mesh_payload(_t21_fidx)["vertices"]
        if len(_t21_xyz)!=3*_t21_record["faceCount"] or len(_t21_xyz)<3:
            raise SystemExit("T21_VERTICAL_5B original source triangle count drift "+_t21_source_id)
        _t21_audit_area=component_project_area(_t21_fidx)
        if abs(_t21_audit_area-_t21_record["sourceAreaSquareMeters"])>1e-8:
            raise SystemExit("T21_VERTICAL_5B source area drift "+_t21_source_id)
        _t21_out={
          "pairId":_t21_pair_index,
          "sourceComponentId":_t21_source_id,
          "sourceObject":_t21_object,
          "sourceMaterial":_t21_material,
          "sourceAreaSquareMeters":_t21_audit_area,
          "yRange":_t21_record["yRangeProjectMeters"],
          "side":"POSITIVE_Z" if sum(p[2] for p in _t21_xyz)>=0 else "NEGATIVE_Z",
          "vertexCount":len(_t21_xyz),
          "outsideHardBoundarySamples":0,
          "normalYAbsMax":_t21_record["maxAbsNormalY"],
          "placementAuthority":"STATIC_SOURCE_IDENTITY_ONLY",
          "connectivityAuthority":"PENDING",
          "runtimePromotionAuthorized":False,
        }
        _t21_paired.append((_t21_out,_t21_xyz))
    (_t21_a,_t21_av),(_t21_b,_t21_bv)=_t21_paired
    if _t21_a["side"]==_t21_b["side"] or _t21_a["yRange"]!=_t21_b["yRange"] or abs(_t21_a["sourceAreaSquareMeters"]-_t21_b["sourceAreaSquareMeters"])>1e-8:
        raise SystemExit("T21_VERTICAL_5B original side/Y/area mismatch pair "+str(_t21_pair_index))
    for _t21_point in _t21_av:
        _t21_delta=min(math.hypot(_t21_point[0]+v[0]-0.229368288528164,
                                  _t21_point[1]-v[1],
                                  _t21_point[2]+v[2]-0.194564295456822)
                       for v in _t21_bv)
        if _t21_delta>1e-6:
            raise SystemExit("T21_VERTICAL_5B mirrored source XYZ mismatch "+str(_t21_pair_index))
    for _t21_out,_t21_xyz in _t21_paired:
        _t21_vrecords.append(_t21_out)
        _t21_vpacked.extend(_t21_struct.pack("<H",len(_t21_xyz)))
        for _t21_point in _t21_xyz:
            _t21_vpacked.extend(_t21_struct.pack("<ddd",*_t21_point))
_t21_v5b=Path("/tmp/t21-vertical-exact-review-phase5b.json")
_t21_v5b.write_text(json.dumps({
   "version":"T21_VERTICAL_EXACT_REVIEW_PHASE5B_V1",
   "sourceAuditVersion":audit_output["version"],
   "sourceScope":"ORIGINAL_TEMPLE01_STRONGLY_VERTICAL_STATIC_FACE_COMPONENTS",
   "sourcePrimitive":"ORIGINAL_OBJ_TRIANGLES_STRONGLY_VERTICAL_ONLY_NOT_WHOLE_COLLISION_SOLIDS",
   "reviewOnly":True,"runtimePromotionAuthorized":False,
   "pairCount":len(_t21_vpairs),"meshCount":len(_t21_vrecords),
   "records":_t21_vrecords,
   "packedFloat64LEBase64":_t21_base64.b64encode(_t21_vpacked).decode("ascii"),
   "packedByteLength":len(_t21_vpacked),
   "sourceXYZAuthority":"EXACT_FLOAT64_FROM_PINNED_TEMPLE01",
   "sourceHeightAuthority":"EXACT_Y_FROM_PINNED_TEMPLE01",
   "appearanceMaterialAuthority":"ORIGINAL_MODEL_MATERIAL_NAMES_NOT_GAME_INSTANCE_BINDINGS",
   "wallCollisionNavPaintScoringAuthority":"NONE",
   "full3DConnectionAuthority":"UNRESOLVED"
},separators=(",",":")),encoding="utf-8")
print("T21_VERTICAL_5B",f"pairs={len(_t21_vpairs)} meshes={len(_t21_vrecords)}",
      f"sourceArea={sum(r['sourceAreaSquareMeters'] for r in _t21_vrecords):.3f}",
      f"sourceVertices={sum(r['vertexCount'] for r in _t21_vrecords)}",
      f"bytes={len(_t21_vpacked)}",f"output={_t21_v5b}")


# T21 Phase6: high central support/overhead source, not assumed gameplay roof.
# This specifically excludes raw StageSide external abyss walls and any
# unverified PntSet instanced source. Source triangles are preserved exactly.
_t21_high_pairs=[
 ("Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|v11",
  "Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|v3"),
 ("Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|v10",
  "Fld_Temple01_CellingBase_1__PillarOld00|Fld_Temple01_PillarOld00|v2"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v338",
  "Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v100"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v129",
  "Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v337"),
 ("Fld_Temple01_mesh05_low96_1__SealObject00|Fld_Temple01_SealObject00|v3",
  "Fld_Temple01_mesh05_low96_1__SealObject00|Fld_Temple01_SealObject00|v2"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v264",
  "Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v184"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v255",
  "Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v177"),
]
_t21_high_rows=[]
_t21_high_blob=bytearray()
_t21_high_seen=set()
for _t21_pid,_t21_pair in enumerate(_t21_high_pairs,1):
    _t21_pair_members=[]
    for _t21_id in _t21_pair:
        if _t21_id in _t21_high_seen:
            raise SystemExit("T21HIGH accidental duplicate "+_t21_id)
        _t21_high_seen.add(_t21_id)
        if _t21_id not in _t21_vbyid:
            raise SystemExit("T21HIGH source identity missing "+_t21_id)
        _t21_rec=_t21_vbyid[_t21_id]
        if _t21_rec["outsideHardBoundarySamples"]:
            raise SystemExit("T21HIGH out-of-silhouette sample "+_t21_id)
        _t21_obj,_t21_mat,_t21_suffix=_t21_id.split("|")
        if not _t21_obj.startswith("Fld_Temple01_"):
            raise SystemExit("T21HIGH prohibited actor instance "+_t21_id)
        _t21_group=(_t21_obj,_t21_mat)
        if _t21_group not in _t21_vcached:
            _t21_comp=componentize(_t21_vertical_groups[_t21_group])
            _t21_comp.sort(key=lambda ff:(min(ff),len(ff)))
            _t21_vcached[_t21_group]=_t21_comp
        _t21_fi=_t21_vcached[_t21_group][int(_t21_suffix[1:])]
        _t21_source_xyz=mesh_payload(_t21_fi)["vertices"]
        if len(_t21_source_xyz)!=3*_t21_rec["faceCount"]:
            raise SystemExit("T21HIGH original face count drift "+_t21_id)
        _t21_area=component_project_area(_t21_fi)
        if abs(_t21_area-_t21_rec["sourceAreaSquareMeters"])>1e-8:
            raise SystemExit("T21HIGH original triangle source area drift "+_t21_id)
        _t21_side="POSITIVE_Z" if sum(p[2] for p in _t21_source_xyz)>=0 else "NEGATIVE_Z"
        _t21_m={
            "pairId":_t21_pid,"sourceComponentId":_t21_id,
            "sourceMaterial":_t21_mat,
            "sourceAreaSquareMeters":_t21_area,
            "yRange":_t21_rec["yRangeProjectMeters"],
            "sourceVertexCount":len(_t21_source_xyz),
            "side":_t21_side,
            "originalFaceMin":_t21_rec["minSourceFaceIndex"],
            "maxAbsOriginalNormalY":_t21_rec["maxAbsNormalY"],
            "outsideHardBoundarySamples":0,
            "sourcePlacement":"STATIC_MODEL_ONLY",
            "gameRoofOrSupportSemantics":"UNRESOLVED",
            "reviewOnly":True,
            "runtimePromotionAuthorized":False
        }
        _t21_pair_members.append((_t21_m,_t21_source_xyz))
    (_t21_a,_t21_av),(_t21_b,_t21_bv)=_t21_pair_members
    if _t21_a["side"]==_t21_b["side"] or _t21_a["yRange"]!=_t21_b["yRange"] or abs(_t21_a["sourceAreaSquareMeters"]-_t21_b["sourceAreaSquareMeters"])>1e-7:
        raise SystemExit("T21HIGH pair side/area/Y mismatch "+str(_t21_pid))
    for _t21_p in _t21_av:
        if min(math.hypot(_t21_p[0]+q[0]-0.229368288528164,
                          _t21_p[1]-q[1],
                          _t21_p[2]+q[2]-0.194564295456822)
               for q in _t21_bv)>1e-6:
            raise SystemExit("T21HIGH exact reflected original XYZ mismatch pair "+str(_t21_pid))
    for _t21_record,_t21_vertices in _t21_pair_members:
        _t21_high_rows.append(_t21_record)
        _t21_high_blob.extend(_t21_struct.pack("<H",len(_t21_vertices)))
        for _t21_vertex in _t21_vertices:
            _t21_high_blob.extend(_t21_struct.pack("<ddd",*_t21_vertex))
_t21_high_output=Path("/tmp/t21-high-structure-source-phase6.json")
_t21_high_output.write_text(json.dumps({
  "version":"T21_HIGH_STRUCTURE_EXACT_SOURCE_V1",
  "sourceAuditVersion":audit_output["version"],
  "sourceAuthority":"PINNED_ORIGINAL_TEMPLE01_OBJ_FLOAT64_XYZ",
  "sourceType":"STRONGLY_VERTICAL_STATIC_MODEL_FACE_COMPONENTS_ONLY",
  "exclusion":"NO_STAGESIDE_ABYSS_NO_PNTSET_NO_INFERRED_CLOSED_SOLIDS",
  "originalTriangleSourceAreaSquareMeters":sum(r["sourceAreaSquareMeters"] for r in _t21_high_rows),
  "pairs":len(_t21_high_pairs),"meshes":len(_t21_high_rows),
  "records":_t21_high_rows,
  "packedFloat64LEBase64":_t21_base64.b64encode(_t21_high_blob).decode("ascii"),
  "packedByteLength":len(_t21_high_blob),
  "visualReviewOnly":True,
  "runtimePromotionAuthorized":False,
  "connectivityPaintCollisionAndCeilingAuthority":"NONE_UNVERIFIED",
},separators=(",",":")),encoding="utf-8")
print("T21_HIGH_STRUCTURE_SOURCE",f"pairs={len(_t21_high_pairs)}",
    f"meshes={len(_t21_high_rows)}",f"vertices={sum(r['sourceVertexCount'] for r in _t21_high_rows)}",
    f"area={sum(r['sourceAreaSquareMeters'] for r in _t21_high_rows):.4f}",
    f"bytes={len(_t21_high_blob)}")


# Phase7A: original strongly vertical source faces, not whole closed collision
# volumes. Six 180-degree flank pillar shell tiers and four central glass frame
# tiers, both mirrored. Every XYZ and Y comes from pinned KiTrix Temple01 OBJ.
_t21_p7_pairs=[
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v339","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1597","SIDE_SUPPORT"),
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v337","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1594","SIDE_SUPPORT"),
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v335","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1586","SIDE_SUPPORT"),
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v353","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1596","SIDE_SUPPORT"),
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v352","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1588","SIDE_SUPPORT"),
 ("Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v348","Fld_Temple01_group20339_10__PillarBase02|Fld_Temple01_PillarBase02|v1585","SIDE_SUPPORT"),
 ("Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v258","Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v83","MID_GLASS_FRAME"),
 ("Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v259","Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v85","MID_GLASS_FRAME"),
 ("Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v257","Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v84","MID_GLASS_FRAME"),
 ("Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v260","Fld_Temple01_pCube20802_10__Glass00|Fld_Temple01_Glass00|v86","MID_GLASS_FRAME")
]
_t21_p7_rows=[]
_t21_p7_raw=bytearray()
_t21_p7_seen=set()
_t21_p7_existing=set(x for pair in _t21_vpairs for x in pair)
_t21_p7_dictionary=[]
_t21_p7_dindex={}
_t21_p7_index_data=bytearray()
for _t21_p7_pid,(_t21_aid,_t21_bid,_t21_p7_kind) in enumerate(_t21_p7_pairs,1):
    _t21_pair_data=[]
    for _t21_id in (_t21_aid,_t21_bid):
        if _t21_id in _t21_p7_seen or _t21_id in _t21_high_seen or _t21_id in _t21_p7_existing:
            raise SystemExit("T21_PHASE7 source ID duplicate with earlier vertical/high "+_t21_id)
        _t21_p7_seen.add(_t21_id)
        if _t21_id not in _t21_vbyid:
            raise SystemExit("T21_PHASE7 original source ID missing "+_t21_id)
        _t21_record=_t21_vbyid[_t21_id]
        if _t21_record["outsideHardBoundarySamples"] or not _t21_id.startswith("Fld_Temple01_"):
            raise SystemExit("T21_PHASE7 forbidden external/PntSet source "+_t21_id)
        _t21_obj,_t21_mat,_t21_suffix=_t21_id.split("|")
        _t21_group=(_t21_obj,_t21_mat)
        if _t21_group not in _t21_vcached:
            _t21_components=componentize(_t21_vertical_groups[_t21_group])
            _t21_components.sort(key=lambda ff:(min(ff),len(ff)))
            _t21_vcached[_t21_group]=_t21_components
        _t21_faces=_t21_vcached[_t21_group][int(_t21_suffix[1:])]
        _t21_xyz=mesh_payload(_t21_faces)["vertices"]
        if len(_t21_xyz)!=3*_t21_record["faceCount"]:
            raise SystemExit("T21_PHASE7 source face count mismatch "+_t21_id)
        _t21_area=component_project_area(_t21_faces)
        if abs(_t21_area-_t21_record["sourceAreaSquareMeters"])>1e-8:
            raise SystemExit("T21_PHASE7 source triangle area drift "+_t21_id)
        _t21_side="POSITIVE_Z" if sum(p[2] for p in _t21_xyz)>=0 else "NEGATIVE_Z"
        _t21_meta={
          "pairId":_t21_p7_pid,"kind":_t21_p7_kind,
          "sourceComponentId":_t21_id,"sourceMaterial":_t21_mat,
          "sourceAreaSquareMeters":_t21_area,
          "originalVertexCount":len(_t21_xyz),
          "originalYRange":_t21_record["yRangeProjectMeters"],
          "sourcePlanZone":_t21_record["diagnosticPlanZone"],
          "side":_t21_side,"outsideHardBoundarySamples":0,
          "maxAbsNormalY":_t21_record["maxAbsNormalY"],
          "sourceRole":"NEAR_VERTICAL_SOURCE_TRIANGLES_ONLY",
          "actorPlacement":"STATIC_MODEL_NOT_LIVE_INSTANCE_PROOF",
          "gameplayAuthority":"NONE",
          "reviewOnly":True,"runtimePromotionAuthorized":False
        }
        _t21_pair_data.append((_t21_meta,_t21_xyz))
    (_t21_a,_t21_av),(_t21_b,_t21_bv)=_t21_pair_data
    _t21_area_delta=abs(_t21_a["sourceAreaSquareMeters"]-_t21_b["sourceAreaSquareMeters"])
    if _t21_a["side"]==_t21_b["side"] or _t21_a["originalYRange"]!=_t21_b["originalYRange"] or _t21_area_delta>0.001:
        raise SystemExit("T21_PHASE7 paired source side/Y/area mismatch "+str(_t21_p7_pid)+" areaDelta="+str(_t21_area_delta))
    # Important source detail: mirrored original pillar-shell components 1..3
    # contain ~0.000087m2 native area asymmetry. Preserve exact original XYZ
    # and measure the asymmetry; DO NOT falsely report bit-exact symmetry.
    _t21_reflection_delta=max(min(math.hypot(
        _t21_point[0]+q[0]-0.229368288528164,
        _t21_point[1]-q[1],
        _t21_point[2]+q[2]-0.194564295456822) for q in _t21_bv)
        for _t21_point in _t21_av)
    print("T21_PHASE7_PAIR",_t21_p7_pid,"sourceAreaDelta",_t21_area_delta,"mirrorXYZMaxDelta",_t21_reflection_delta)
    if _t21_reflection_delta>0.03:
        raise SystemExit("T21_PHASE7 source mirror out of 3cm review tolerance "+str(_t21_p7_pid)+" maxDelta="+str(_t21_reflection_delta))
    _t21_a["mirrorMaxDeltaMeters"]=_t21_reflection_delta
    _t21_b["mirrorMaxDeltaMeters"]=_t21_reflection_delta
    _t21_a["pairAreaDeltaSquareMeters"]=_t21_area_delta
    _t21_b["pairAreaDeltaSquareMeters"]=_t21_area_delta
    for _t21_meta,_t21_xyz in _t21_pair_data:
        _t21_p7_rows.append(_t21_meta)
        _t21_p7_raw.extend(_t21_struct.pack("<H",len(_t21_xyz)))
        _t21_p7_index_data.extend(_t21_struct.pack("<H",len(_t21_xyz)))
        for _t21_point in _t21_xyz:
            _t21_p7_raw.extend(_t21_struct.pack("<ddd",*_t21_point))
            for _t21_coord in _t21_point:
                _t21_key=_t21_struct.pack("<d",_t21_coord)
                if _t21_key not in _t21_p7_dindex:
                    _t21_p7_dindex[_t21_key]=len(_t21_p7_dictionary)
                    _t21_p7_dictionary.append(_t21_key)
                if _t21_p7_dindex[_t21_key]>65535:
                    raise SystemExit("T21_PHASE7 dictionary index overflow")
                _t21_p7_index_data.extend(_t21_struct.pack("<H",_t21_p7_dindex[_t21_key]))
_t21_p7_bin=b"".join(_t21_p7_dictionary)
_t21_p7_file=Path("/tmp/t21-structural-frame-phase7-source.json")
_t21_p7_file.write_text(json.dumps({
   "version":"T21_PHASE7_FRAMED_SOURCE_V1",
   "sourceAuditVersion":audit_output["version"],
   "sourceAuthority":"PINNED_TEMPLE01_ORIGINAL_FLOAT64_XYZ",
   "sourceTriangleType":"NEAR_VERTICAL_STATIC_MODEL_FACES_NOT_SOLID_VOLUMES",
   "pairCount":len(_t21_p7_pairs),"meshCount":len(_t21_p7_rows),
   "selectedVerticalSourceAreaSquareMeters":sum(r["sourceAreaSquareMeters"] for r in _t21_p7_rows),
   "originalVertexCount":sum(r["originalVertexCount"] for r in _t21_p7_rows),
   "records":_t21_p7_rows,
   "independentOriginalPackedFloat64Base64":_t21_base64.b64encode(_t21_p7_raw).decode("ascii"),
   "independentOriginalPackedByteLength":len(_t21_p7_raw),
   "dictionaryFloat64LEBase64":_t21_base64.b64encode(_t21_p7_bin).decode("ascii"),
   "indicesUint16LEBase64":_t21_base64.b64encode(_t21_p7_index_data).decode("ascii"),
   "dictionaryCount":len(_t21_p7_dictionary),
   "originalSourceTriangleUVsAndLiveMaterials":"UNVERIFIED",
   "activeObjectInstanceAndPaintCollisionNavAuthority":"NONE",
   "reviewOnly":True,"runtimePromotionAuthorized":False
},separators=(",",":")),encoding="utf-8")
print("T21_PHASE7_SOURCE",f"pairs={len(_t21_p7_pairs)}",
    f"meshes={len(_t21_p7_rows)}",
    f"originalVertices={sum(r['originalVertexCount'] for r in _t21_p7_rows)}",
    f"dictionary={len(_t21_p7_dictionary)}",f"indexedBytes={len(_t21_p7_index_data)}",
    f"area={sum(r['sourceAreaSquareMeters'] for r in _t21_p7_rows):.3f}",
    f"output={_t21_p7_file}")


# T21 Phase8 — source-defined central and flank vertical structural continuity.
# All selected records are STRONGLY NEAR-VERTICAL original OBJ triangle
# components; NOT complete physical solids, traversability or collisions.
_t21_p8_pairs=[
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v338","Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v100","CENTRAL_TOWER"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v129","Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v337","CENTRAL_TOWER"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v264","Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v184","CENTRAL_TOWER"),
 ("Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v255","Fld_Temple01_PillarBase_2__Pillar00|Fld_Temple01_Pillar00|v177","CENTRAL_TOWER"),
 ("Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v172","Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v174","FLANK_HIGH_SUPPORT"),
 ("Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v175","Fld_Temple01_mesh02_low_15__PillarBase04|Fld_Temple01_PillarBase04|v173","FLANK_HIGH_SUPPORT"),
 ("Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|v30","Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|v1061","SIDE_EDGE_LINER"),
 ("Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|v197","Fld_Temple01_mesh05_low57_1__FloorLine02|Fld_Temple01_FloorLine02|v590","SIDE_EDGE_LINER")
]
_t21_p8_records=[]
_t21_p8_raw=bytearray()
_t21_p8_doubles={}
_t21_p8_dictionary=[]
_t21_p8_component_indices=[]
_t21_p8_seen=set()
_t21_p8_existing=set(x for pair in _t21_vpairs for x in pair)
# Phase6 high-source audit includes *undisplayed* central tower candidates.
# Reuse those source IDs as the NEXT DISPLAY cohort; only prohibit the two
# already-rendered SealObject high panels. No review mesh identity duplicates.
_t21_p8_existing.update(x for pair in _t21_high_pairs
                        for x in pair if "SealObject00" in x)
_t21_p8_existing.update(_t21_p7_seen)
for _t21_p8_pid,(_t21_ida,_t21_idb,_t21_kind) in enumerate(_t21_p8_pairs,1):
    _t21_pair=[]
    for _t21_id in (_t21_ida,_t21_idb):
        if _t21_id in _t21_p8_seen or _t21_id in _t21_p8_existing:
            raise SystemExit("T21_PHASE8 duplicate source ID "+_t21_id)
        _t21_p8_seen.add(_t21_id)
        if _t21_id not in _t21_vbyid:
            raise SystemExit("T21_PHASE8 unverified original source ID "+_t21_id)
        _t21_row=_t21_vbyid[_t21_id]
        if _t21_row["outsideHardBoundarySamples"] or not _t21_id.startswith("Fld_Temple01_"):
            raise SystemExit("T21_PHASE8 exterior or unknown actor source "+_t21_id)
        _t21_obj,_t21_mat,_t21_suffix=_t21_id.split("|")
        _t21_group=(_t21_obj,_t21_mat)
        if _t21_group not in _t21_vcached:
            _t21_cc=componentize(_t21_vertical_groups[_t21_group])
            _t21_cc.sort(key=lambda ff:(min(ff),len(ff)))
            _t21_vcached[_t21_group]=_t21_cc
        _t21_faces=_t21_vcached[_t21_group][int(_t21_suffix[1:])]
        _t21_xyz=mesh_payload(_t21_faces)["vertices"]
        if len(_t21_xyz)!=3*_t21_row["faceCount"]:
            raise SystemExit("T21_PHASE8 frozen original triangle count drift "+_t21_id)
        _t21_area=component_project_area(_t21_faces)
        if abs(_t21_area-_t21_row["sourceAreaSquareMeters"])>1e-8:
            raise SystemExit("T21_PHASE8 source triangle area drift "+_t21_id)
        _t21_meta={
          "pairId":_t21_p8_pid,"kind":_t21_kind,
          "sourceComponentId":_t21_id,"sourceObject":_t21_obj,
          "sourceMaterial":_t21_mat,"sourceAreaSquareMeters":_t21_area,
          "originalVertexCount":len(_t21_xyz),
          "originalYRange":_t21_row["yRangeProjectMeters"],
          "diagnosticPlanZone":_t21_row["diagnosticPlanZone"],
          "originalMaxAbsNormalY":_t21_row["maxAbsNormalY"],
          "side":"POSITIVE_Z" if sum(v[2] for v in _t21_xyz)>=0 else "NEGATIVE_Z",
          "outsideHardBoundarySamples":0,
          "sourceFaceOnlyNotWholeObject":True,
          "runtimePromotionAuthorized":False,
          "walkFloorColliderGlassRulesNavAuthority":"NONE"
        }
        _t21_pair.append((_t21_meta,_t21_xyz))
    (_t21_a,_t21_av),(_t21_b,_t21_bv)=_t21_pair
    if _t21_a["side"]==_t21_b["side"] or _t21_a["originalYRange"]!=_t21_b["originalYRange"] or abs(_t21_a["sourceAreaSquareMeters"]-_t21_b["sourceAreaSquareMeters"])>0.001:
        raise SystemExit("T21_PHASE8 pair shape/side/y disagreement "+str(_t21_p8_pid))
    _t21_dist=max(min(math.hypot(p[0]+q[0]-0.229368288528164,
                      p[1]-q[1],p[2]+q[2]-0.194564295456822)
                  for q in _t21_bv) for p in _t21_av)
    if _t21_dist>0.0002:
        raise SystemExit("T21_PHASE8 original reflected XYZ not within measured 0.2mm "+str(_t21_p8_pid)+" "+str(_t21_dist))
    for _t21_meta,_t21_xyz in _t21_pair:
        _t21_meta["measuredSourceMirrorMaxDeltaMeters"]=_t21_dist
        _t21_p8_records.append(_t21_meta)
        _t21_p8_raw.extend(_t21_struct.pack("<H",len(_t21_xyz)))
        _t21_p8_component_indices.append(len(_t21_xyz))
        for _t21_coord in _t21_xyz:
            _t21_p8_raw.extend(_t21_struct.pack("<ddd",*_t21_coord))
            for _t21_axis in _t21_coord:
                _t21_bytes=_t21_struct.pack("<d",_t21_axis)
                if _t21_bytes not in _t21_p8_doubles:
                    _t21_p8_doubles[_t21_bytes]=len(_t21_p8_dictionary)
                    _t21_p8_dictionary.append(_t21_bytes)
                _t21_p8_component_indices.append(_t21_p8_doubles[_t21_bytes])
_t21_p8_dict_bytes=b"".join(_t21_p8_dictionary)
_t21_p8_index_bytes=b"".join(_t21_struct.pack("<H",i) for i in _t21_p8_component_indices)
_t21_p8_fixture=Path("/tmp/t21-phase8-original-support-source.json")
_t21_p8_fixture.write_text(json.dumps({
   "version":"T21_PHASE8_STATIC_SUPPORT_SOURCE_V1",
   "sourceAuthority":"PINNED_TEMPLE01_ORIGINAL_FLOAT64_XYZ",
   "originalNearVerticalFaceComponents":len(_t21_p8_records),
   "pairCount":len(_t21_p8_pairs),
   "originalVertexCount":sum(r["originalVertexCount"] for r in _t21_p8_records),
   "source3DTriangleAreaSquareMeters":sum(r["sourceAreaSquareMeters"] for r in _t21_p8_records),
   "records":_t21_p8_records,
   "originalIndependentLEFloat64Base64":_t21_base64.b64encode(_t21_p8_raw).decode("ascii"),
   "originalIndependentByteLength":len(_t21_p8_raw),
   "float64DictionaryBase64":_t21_base64.b64encode(_t21_p8_dict_bytes).decode("ascii"),
   "uint16IndexedSourceBase64":_t21_base64.b64encode(_t21_p8_index_bytes).decode("ascii"),
   "coordinateDictionaryCount":len(_t21_p8_dictionary),
   "reviewOnly":True,"runtimePromotionAuthorized":False,
   "playableFloorConnectivityColliderPaintNavAuthority":"NONE"
},separators=(",",":")),encoding="utf-8")
print("T21_PHASE8_ORIGINAL_SUPPORT",f"pairs={len(_t21_p8_pairs)}",
    f"components={len(_t21_p8_records)}",
    f"vertices={sum(r['originalVertexCount'] for r in _t21_p8_records)}",
    f"area={sum(r['sourceAreaSquareMeters'] for r in _t21_p8_records):.6f}",
    f"dictionary={len(_t21_p8_dictionary)}",
    f"output={_t21_p8_fixture}")
