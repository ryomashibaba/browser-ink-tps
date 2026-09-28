#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
import math
import sys

OBJ = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/kitrix-lfs/Vss_Temple01.obj")
MAX_SLOPE_DEG = 50.0
MIN_UP_Y = math.cos(math.radians(MAX_SLOPE_DEG))
LOCAL_MARGIN = 3.0

WALK_TOKENS = (
    "FloorConcrete", "FloorSlope", "FloorGrass", "GrassFloor",
    "FloorMetal", "FloorRubber", "BridgeMetal", "FloorFence"
)
OVERLAY_TOKENS = ("FloorLine",)
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
    if nrows:
        print(
            f"T21UPPER GRATE_NEAREST side={side} "
            f"dist={nrows[0][0]:.6f} "
            f"obj={nrows[0][2]['top'][0][0][0]} "
            f"mat={nrows[0][2]['top'][0][0][1]}"
        )
    print_reachable_summary(f"T21UPPER GRATE_{side}",union,neighbors)

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
    print_reachable_summary(f"T21UPPER GLASS_{side}",broad_faces,neighbors)

print("T21UPPER AUTHORITY diagnostic_only=true runtime_promotion_authorized=false")

