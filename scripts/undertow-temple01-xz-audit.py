#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
import math
import json
import sys

OBJ = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/kitrix-lfs/Vss_Temple01.obj")
STEP = 0.125
Y_TOL = 0.08

WALK_TOKENS = (
    "FloorConcrete", "FloorLine", "FloorSlope", "FloorGrass",
    "GrassFloor", "FloorMetal", "FloorRubber", "BridgeMetal", "FloorFence"
)
OVERHEAD_TOKENS = WALK_TOKENS + (
    "Glass", "Pillar", "Object", "Wall", "Fence"
)

vertices=[None]
faces=[]
obj="(none)"
mat="(none)"

def active(name:str)->bool:
    return name.startswith("Fld_Temple01_") or name.startswith("FldObj_Temple01_PntSet_")

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

def tri_normal(tri):
    a,b,c=tri
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy; ny=uz*vx-ux*vz; nz=ux*vy-uy*vx
    n=math.sqrt(nx*nx+ny*ny+nz*nz)
    return (nx/n,ny/n,nz/n) if n>1e-12 else (0,0,0)

def contains_xz(x,z,tri):
    (x1,_,z1),(x2,_,z2),(x3,_,z3)=tri
    den=(z2-z3)*(x1-x3)+(x3-x2)*(z1-z3)
    if abs(den)<1e-12: return False
    a=((z2-z3)*(x-x3)+(x3-x2)*(z-z3))/den
    b=((z3-z1)*(x-x3)+(x1-x3)*(z-z3))/den
    c=1-a-b
    return min(a,b,c)>=-1e-7

def interp_y(x,z,tri):
    (x1,y1,z1),(x2,y2,z2),(x3,y3,z3)=tri
    den=(z2-z3)*(x1-x3)+(x3-x2)*(z1-z3)
    a=((z2-z3)*(x-x3)+(x3-x2)*(z-z3))/den
    b=((z3-z1)*(x-x3)+(x1-x3)*(z-z3))/den
    c=1-a-b
    return a*y1+b*y2+c*y3

# Spatial bins over all active faces.
BIN=2.0
bins=defaultdict(list)
for fi,f in enumerate(faces):
    tri=[vertices[i] for i in f[:3]]
    xs=[p[0] for p in tri]; zs=[p[2] for p in tri]
    for ix in range(math.floor(min(xs)/BIN),math.floor(max(xs)/BIN)+1):
        for iz in range(math.floor(min(zs)/BIN),math.floor(max(zs)/BIN)+1):
            bins[(ix,iz)].append(fi)

def face_candidates(x,z):
    return bins.get((math.floor(x/BIN),math.floor(z/BIN)),())

def has_walk_surface(x,z,target_y):
    hits=[]
    for fi in face_candidates(x,z):
        ia,ib,ic,o,m=faces[fi]
        if not any(t in m for t in WALK_TOKENS):
            continue
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        n=tri_normal(tri)
        if abs(n[1])<0.75:
            continue
        if not contains_xz(x,z,tri):
            continue
        y=interp_y(x,z,tri)
        if abs(y-target_y)<=Y_TOL:
            hits.append((y,o,m))
    return hits

def overhead_hits(x,z,base_y):
    out=[]
    for fi in face_candidates(x,z):
        ia,ib,ic,o,m=faces[fi]
        if not any(t in m for t in OVERHEAD_TOKENS):
            continue
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        n=tri_normal(tri)
        if abs(n[1])<0.20:
            continue
        if not contains_xz(x,z,tri):
            continue
        y=interp_y(x,z,tri)
        if y>base_y+0.45:
            out.append((y,o,m))
    out.sort()
    return out

def qcell(x,z):
    return (round(x/STEP),round(z/STEP))

def cell_xy(c):
    return (c[0]*STEP,c[1]*STEP)

def flood_component(target_y,seed,bounds):
    xmin,xmax,zmin,zmax=bounds
    seed_cell=qcell(*seed)
    candidates=set()
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if has_walk_surface(x,z,target_y):
                candidates.add((ix,iz))
    if seed_cell not in candidates:
        # Choose nearest occupied cell within 3m.
        ranked=sorted(candidates,key=lambda c:(cell_xy(c)[0]-seed[0])**2+(cell_xy(c)[1]-seed[1])**2)
        if not ranked:
            return set(),None,set()
        seed_cell=ranked[0]
    comp={seed_cell}
    q=deque([seed_cell])
    while q:
        c=q.popleft()
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(c[0]+d[0],c[1]+d[1])
            if n in candidates and n not in comp:
                comp.add(n); q.append(n)
    covered={c for c in comp if overhead_hits(*cell_xy(c),target_y)}
    return comp,seed_cell,covered

def boundary_loops(cells):
    # Directed boundary edges around occupied square cells.
    edges={}
    def add(a,b):
        edges[a]=b
    for ix,iz in cells:
        x0=(ix-0.5)*STEP; x1=(ix+0.5)*STEP
        z0=(iz-0.5)*STEP; z1=(iz+0.5)*STEP
        if (ix,iz-1) not in cells: add((x0,z0),(x1,z0))
        if (ix+1,iz) not in cells: add((x1,z0),(x1,z1))
        if (ix,iz+1) not in cells: add((x1,z1),(x0,z1))
        if (ix-1,iz) not in cells: add((x0,z1),(x0,z0))
    loops=[]
    while edges:
        start=next(iter(edges))
        cur=start; loop=[start]
        guard=0
        while cur in edges and guard<100000:
            nxt=edges.pop(cur)
            loop.append(nxt); cur=nxt; guard+=1
            if cur==start: break
        if len(loop)>=4 and loop[-1]==loop[0]:
            loops.append(loop[:-1])
    return loops

def simplify_axis(loop):
    if len(loop)<3: return loop
    pts=loop[:]
    changed=True
    while changed and len(pts)>3:
        changed=False; out=[]
        n=len(pts)
        for i,p in enumerate(pts):
            a=pts[i-1]; b=p; c=pts[(i+1)%n]
            if (abs(a[0]-b[0])<1e-9 and abs(b[0]-c[0])<1e-9) or (abs(a[1]-b[1])<1e-9 and abs(b[1]-c[1])<1e-9):
                changed=True
            else:
                out.append(b)
        pts=out
    return pts

def polygon_area(loop):
    return 0.5*sum(loop[i][0]*loop[(i+1)%len(loop)][1]-loop[(i+1)%len(loop)][0]*loop[i][1] for i in range(len(loop)))

def point_seg_dist(p,a,b):
    px,pz=p; ax,az=a; bx,bz=b
    dx=bx-ax; dz=bz-az
    den=dx*dx+dz*dz
    if den<=1e-15:
        return math.hypot(px-ax,pz-az)
    t=max(0.0,min(1.0,((px-ax)*dx+(pz-az)*dz)/den))
    q=(ax+t*dx,az+t*dz)
    return math.hypot(px-q[0],pz-q[1])

def rdp_open(points,eps):
    if len(points)<=2:
        return points
    a=points[0]; b=points[-1]
    best_i=-1; best_d=-1.0
    for i in range(1,len(points)-1):
        d=point_seg_dist(points[i],a,b)
        if d>best_d:
            best_d=d; best_i=i
    if best_d>eps:
        left=rdp_open(points[:best_i+1],eps)
        right=rdp_open(points[best_i:],eps)
        return left[:-1]+right
    return [a,b]

def rdp_closed(loop,eps):
    if len(loop)<=4:
        return loop
    # Split the ring at a point roughly opposite the lexicographically smallest
    # vertex so RDP never shortcuts the closure across the whole polygon.
    i0=min(range(len(loop)),key=lambda i:(loop[i][0],loop[i][1]))
    p0=loop[i0]
    i1=max(range(len(loop)),key=lambda i:(loop[i][0]-p0[0])**2+(loop[i][1]-p0[1])**2)
    def ring_slice(a,b):
        out=[loop[a]]
        i=a
        while i!=b:
            i=(i+1)%len(loop); out.append(loop[i])
        return out
    a=rdp_open(ring_slice(i0,i1),eps)
    b=rdp_open(ring_slice(i1,i0),eps)
    return a[:-1]+b[:-1]

def describe(name,target_y,seed,bounds):
    comp,seed_cell,covered=flood_component(target_y,seed,bounds)
    print(f"T21XZ COMP {name} y={target_y:.2f} cells={len(comp)} area={len(comp)*STEP*STEP:.3f} seed={seed} seed_cell={seed_cell} covered={len(covered)}")
    if not comp: return
    xs=[cell_xy(c)[0] for c in comp]; zs=[cell_xy(c)[1] for c in comp]
    print(f"T21XZ BBOX {name} x=({min(xs):.3f},{max(xs):.3f}) z=({min(zs):.3f},{max(zs):.3f})")
    loops=boundary_loops(comp)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    for i,loop in enumerate(loops[:8]):
        s=simplify_axis(loop)
        rr=rdp_closed(loop,0.20)
        print(f"T21XZ LOOP {name} {i} area={polygon_area(loop):.3f} raw={len(loop)} simple={len(s)} pts={[tuple(round(v,3) for v in p) for p in s]}")
        print(f"T21XZ RDP {name} {i} eps=0.20 n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}")
    if covered:
        # Covered subclusters inside the target-Y component.
        rem=set(covered); clusters=[]
        while rem:
            seedc=rem.pop(); cc={seedc}; q=deque([seedc])
            while q:
                c=q.popleft()
                for d in ((1,0),(-1,0),(0,1),(0,-1)):
                    n=(c[0]+d[0],c[1]+d[1])
                    if n in rem:
                        rem.remove(n); cc.add(n); q.append(n)
            clusters.append(cc)
        clusters.sort(key=len,reverse=True)
        for j,cc in enumerate(clusters[:10]):
            xs=[cell_xy(c)[0] for c in cc]; zs=[cell_xy(c)[1] for c in cc]
            mats=defaultdict(int)
            for c0 in cc[::max(1,len(cc)//150)] if isinstance(cc,list) else list(cc)[::max(1,len(cc)//150)]:
                for _,o,m in overhead_hits(*cell_xy(c0),target_y):
                    mats[m]+=1
            print(f"T21XZ COVER {name} {j} cells={len(cc)} area={len(cc)*STEP*STEP:.3f} x=({min(xs):.3f},{max(xs):.3f}) z=({min(zs):.3f},{max(zs):.3f}) mats={sorted(mats.items(),key=lambda x:-x[1])[:8]}")
            loops2=boundary_loops(cc)
            loops2.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
            if loops2:
                s=simplify_axis(loops2[0])
                print(f"T21XZ COVERLOOP {name} {j} simple={len(s)} pts={[tuple(round(v,3) for v in p) for p in s]}")

# Seeds come from independently verified local registrations in run #555.
describe("CENTER_LOW_A",3.0,(3.67,-0.135),(-18,18,-18,18))
describe("CENTER_LOW_B",3.0,(-3.76,-0.131),(-18,18,-18,18))
describe("RIGHT_LOW_A",7.5,(-15.05,55.40),(-32,8,25,68))
describe("RIGHT_LOW_B",7.5,(14.96,-55.67),(-8,32,-68,-25))


# Registered vector glass-footprint audit. This explicitly tests whether the
# earlier capture-derived right-low == underpass Y relation agrees with Temple01.
ORIGIN=(420.96,297.66)
NEG=(131.82,155.58)
POS=(709.98,439.5)
ddx=POS[0]-NEG[0]; ddy=POS[1]-NEG[1]
dll=math.hypot(ddx,ddy)
zdir=(ddx/dll,ddy/dll)
xdir=(zdir[1],-zdir[0])
REG_SCALE=0.964211
REG_TH=math.radians(26.1160)
REG_C=math.cos(REG_TH); REG_S=math.sin(REG_TH)
REG_TX=-0.0580; REG_TZ=-0.1329

def pdf_to_project(pt):
    dx=pt[0]-ORIGIN[0]; dy=pt[1]-ORIGIN[1]
    return ((dx*xdir[0]+dy*xdir[1])/4.8,(dx*zdir[0]+dy*zdir[1])/4.8)

def project_to_model(p):
    return (
        REG_SCALE*(REG_C*p[0]-REG_S*p[1])+REG_TX,
        REG_SCALE*(REG_S*p[0]+REG_C*p[1])+REG_TZ
    )

def pdf_to_model(pt):
    return project_to_model(pdf_to_project(pt))

def inside_poly(x,z,poly):
    inside=False
    j=len(poly)-1
    for i in range(len(poly)):
        xi,zi=poly[i]; xj,zj=poly[j]
        if ((zi>z)!=(zj>z)) and (x < (xj-xi)*(z-zi)/(zj-zi+1e-30)+xi):
            inside=not inside
        j=i
    return inside

# T21-D construction audit: derive spawn-side flat components only from
# locally verified anchors. Do NOT clip against the globally transformed spawn
# white-face envelope; blanket PDF->OBJ registration remains forbidden.
def distance_point_segment(px,pz,ax,az,bx,bz):
    dx=bx-ax; dz=bz-az
    den=dx*dx+dz*dz
    if den<=1e-12:
        return math.hypot(px-ax,pz-az)
    t=((px-ax)*dx+(pz-az)*dz)/den
    t=max(0.0,min(1.0,t))
    qx=ax+t*dx; qz=az+t*dz
    return math.hypot(px-qx,pz-qz)

def nearest_walk_seed_to_point(target_y,model_point,radius=4.0):
    cx,cz=model_point
    best=None
    for ix in range(math.floor((cx-radius)/STEP),math.ceil((cx+radius)/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor((cz-radius)/STEP),math.ceil((cz+radius)/STEP)+1):
            z=iz*STEP
            if not has_walk_surface(x,z,target_y):
                continue
            d=math.hypot(x-cx,z-cz)
            if best is None or d<best[0]:
                best=(d,(x,z))
    return None if best is None else best[1]

def nearest_walk_seed_to_polyline(target_y,pdf_points,radius=4.0):
    pts=[pdf_to_model(p) for p in pdf_points]
    xmin=min(p[0] for p in pts)-radius; xmax=max(p[0] for p in pts)+radius
    zmin=min(p[1] for p in pts)-radius; zmax=max(p[1] for p in pts)+radius
    best=None
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if not has_walk_surface(x,z,target_y):
                continue
            d=min(
                distance_point_segment(x,z,a[0],a[1],b[0],b[1])
                for a,b in zip(pts,pts[1:])
            )
            if best is None or d<best[0]:
                best=(d,(x,z))
    return None if best is None else best[1]

spawn_anchors={
    "POS_SPAWN_HIGH":(
        10.5,
        nearest_walk_seed_to_point(10.5,pdf_to_model(POS)),
        (-48,18,22,78)
    ),
    "NEG_SPAWN_HIGH":(
        10.5,
        nearest_walk_seed_to_point(10.5,pdf_to_model(NEG)),
        (-18,48,-78,-22)
    ),
    "POS_FIRST_DROP_LANDING":(
        6.0,
        nearest_walk_seed_to_polyline(
            6.0,
            [(620.4,423.12),(664.68,423.12),(664.68,394.2)]
        ),
        (-48,18,22,78)
    ),
    "NEG_FIRST_DROP_LANDING":(
        6.0,
        nearest_walk_seed_to_polyline(
            6.0,
            [(221.52,172.08),(177.24,172.08),(177.24,201.0)]
        ),
        (-18,48,-78,-22)
    ),
}

spawn_components={}
for name,(target_y,seed,bounds) in spawn_anchors.items():
    print(f"T21SPAWN ANCHOR {name} y={target_y:.3f} seed={seed} bounds={bounds}")
    if seed is None:
        raise SystemExit(f"T21 spawn construction audit failed: no local walk seed for {name}")
    comp,seed_cell,covered=flood_component(target_y,seed,bounds)
    if not comp:
        raise SystemExit(f"T21 spawn construction audit failed: empty component for {name}")
    loops=boundary_loops(comp)
    loops.sort(key=lambda loop:abs(polygon_area(loop)),reverse=True)
    if not loops:
        raise SystemExit(f"T21 spawn construction audit failed: no contour for {name}")
    xs=[cell_xy(c)[0] for c in comp]; zs=[cell_xy(c)[1] for c in comp]
    rr=rdp_closed(loops[0],0.20)
    print(
        f"T21SPAWN LOCAL_COMP {name} y={target_y:.3f} cells={len(comp)} "
        f"area={len(comp)*STEP*STEP:.3f} seed_cell={seed_cell} covered={len(covered)} "
        f"bbox=({min(xs):.3f},{min(zs):.3f})..({max(xs):.3f},{max(zs):.3f}) "
        f"outer_area={polygon_area(loops[0]):.3f} n={len(rr)} "
        f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
    )
    holes=[]
    for hi,hole in enumerate(loops[1:12]):
        if polygon_area(hole)>=-0.25:
            continue
        hr=rdp_closed(hole,0.20)
        holes.append(hole)
        print(
            f"T21SPAWN LOCAL_HOLE {name} hole={hi} area={polygon_area(hole):.3f} "
            f"n={len(hr)} pts={[tuple(round(v,3) for v in p) for p in hr]}"
        )
    spawn_components[name]=(comp,loops)

for a,b in (
    ("POS_SPAWN_HIGH","NEG_SPAWN_HIGH"),
    ("POS_FIRST_DROP_LANDING","NEG_FIRST_DROP_LANDING"),
):
    ca=spawn_components[a][0]; cb=spawn_components[b][0]
    mirrored={(-ix,-iz) for ix,iz in ca}
    xor=mirrored ^ cb
    print(
        f"T21SPAWN LOCAL_SYMMETRY {a}->{b} a={len(ca)} b={len(cb)} "
        f"xor={len(xor)} missing={len(mirrored-cb)} extra={len(cb-mirrored)} "
        f"xor_area={len(xor)*STEP*STEP:.6f}"
    )

glass_polys={
    "POS_GLASS":[(420.96,327.36),(459.48,327.36),(459.48,364.92),(420.96,364.92)],
    "NEG_GLASS":[(382.44,230.28),(420.96,230.28),(420.96,267.84),(382.44,267.84)],
}

for name,pdfpoly in glass_polys.items():
    poly=[pdf_to_model(p) for p in pdfpoly]
    xmin=min(p[0] for p in poly); xmax=max(p[0] for p in poly)
    zmin=min(p[1] for p in poly); zmax=max(p[1] for p in poly)
    total=0; y3=0; y75=0; glass_cover=0; any_cover=0
    hist=defaultdict(int)
    support_mats=defaultdict(int)
    cells_y3=set()
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if not inside_poly(x,z,poly):
                continue
            total+=1
            h3=has_walk_surface(x,z,3.0)
            h75=has_walk_surface(x,z,7.5)
            if h3:
                y3+=1; cells_y3.add((ix,iz))
            if h75: y75+=1
            # All horizontal-ish walk hits, grouped by 0.5m band.
            for fi in face_candidates(x,z):
                ia,ib,ic,o,m=faces[fi]
                tri=[vertices[ia],vertices[ib],vertices[ic]]
                n=tri_normal(tri)
                if abs(n[1])<0.75 or not contains_xz(x,z,tri):
                    continue
                yy=interp_y(x,z,tri)
                if any(t in m for t in WALK_TOKENS):
                    hist[round(yy*2)/2]+=1
                if yy>3.45:
                    any_cover+=1
                    if "Glass" in m:
                        glass_cover+=1
                    if any(k in m for k in ("Pillar","Wall","Fence","Object")):
                        support_mats[m]+=1
                    break
    print(
        f"T21GLASS {name} model={[tuple(round(v,4) for v in p) for p in poly]} "
        f"cells={total} y3={y3} y75={y75} any_cover={any_cover} glass_cover={glass_cover} "
        f"height_hist={sorted(hist.items())}"
    )
    print(f"T21GLASS SUPPORT {name} mats={sorted(support_mats.items(),key=lambda x:-x[1])[:15]}")

    overlaps={}
    for ia,ib,ic,o,m in faces:
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if not inside_poly(cx,cz,poly):
            continue
        ys=[v[1] for v in tri]
        if max(ys)<2.8 or min(ys)>14.0:
            continue
        s=overlaps.setdefault((o,m),{"n":0,"xs":[],"zs":[],"ys":[]})
        s["n"]+=1
        s["xs"].extend(v[0] for v in tri)
        s["zs"].extend(v[2] for v in tri)
        s["ys"].extend(ys)
    rows=[]
    for (o,m),s in overlaps.items():
        rows.append((
            s["n"],o,m,min(s["xs"]),max(s["xs"]),
            min(s["zs"]),max(s["zs"]),min(s["ys"]),max(s["ys"])
        ))
    rows.sort(reverse=True)
    for n,o,m,x0,x1,z0,z1,y0,y1 in rows[:35]:
        print(
            f"T21GLASS OBJ {name} n={n} obj={o} mat={m} "
            f"x=({x0:.3f},{x1:.3f}) z=({z0:.3f},{z1:.3f}) y=({y0:.3f},{y1:.3f})"
        )

    loops=boundary_loops(cells_y3)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    for i,loop in enumerate(loops[:8]):
        rr=rdp_closed(loop,0.20)
        print(
            f"T21GLASS Y3LOOP {name} {i} area={polygon_area(loop):.3f} "
            f"n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )


# Floor-level solid exclusion audit for each glass underpass.
obj_ranges={}
for ia,ib,ic,o,m in faces:
    s=obj_ranges.setdefault(o,{"y0":float("inf"),"y1":float("-inf"),"mats":set()})
    for vi in (ia,ib,ic):
        yy=vertices[vi][1]
        s["y0"]=min(s["y0"],yy); s["y1"]=max(s["y1"],yy)
    s["mats"].add(m)

OBSTACLE_TOKENS=("PillarBase","Pillar00","WallConcrete","WallMetal","Megalith","MetalBox")

for name,pdfpoly in glass_polys.items():
    poly=[pdf_to_model(p) for p in pdfpoly]
    xmin=min(p[0] for p in poly); xmax=max(p[0] for p in poly)
    zmin=min(p[1] for p in poly); zmax=max(p[1] for p in poly)
    obstacle_cells=set()
    hit_objects=defaultdict(int)
    y3_floor_cells=set()

    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if not inside_poly(x,z,poly):
                continue
            if has_walk_surface(x,z,3.0):
                y3_floor_cells.add((ix,iz))
            else:
                continue
            occupied=False
            for fi in face_candidates(x,z):
                ia,ib,ic,o,m=faces[fi]
                st=obj_ranges[o]
                if st["y0"]>3.15 or st["y1"]<4.30:
                    continue
                if not any(t in o or t in m for t in OBSTACLE_TOKENS):
                    continue
                tri=[vertices[ia],vertices[ib],vertices[ic]]
                # Horizontal-ish cap triangles provide the filled footprint.
                n=tri_normal(tri)
                if abs(n[1])<0.50 or not contains_xz(x,z,tri):
                    continue
                yy=interp_y(x,z,tri)
                if 3.0-0.15 <= yy <= 6.5:
                    occupied=True
                    hit_objects[(o,m)]+=1
                    break
            if occupied:
                obstacle_cells.add((ix,iz))

    print(
        f"T21UNDERPASS OBST {name} cells={len(obstacle_cells)} "
        f"area={len(obstacle_cells)*STEP*STEP:.3f} objects={sorted(hit_objects.items(),key=lambda x:-x[1])[:12]}"
    )
    rem=set(obstacle_cells); comps=[]
    while rem:
        s=rem.pop(); cc={s}; q=deque([s])
        while q:
            c0=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(c0[0]+d[0],c0[1]+d[1])
                if n in rem:
                    rem.remove(n); cc.add(n); q.append(n)
        comps.append(cc)
    comps.sort(key=len,reverse=True)
    for j,cc in enumerate(comps[:10]):
        loops=boundary_loops(cc)
        loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
        if not loops: continue
        rr=rdp_closed(loops[0],0.15)
        xs=[cell_xy(v)[0] for v in cc]; zs=[cell_xy(v)[1] for v in cc]
        print(
            f"T21UNDERPASS OBSTCOMP {name} {j} cells={len(cc)} "
            f"x=({min(xs):.3f},{max(xs):.3f}) z=({min(zs):.3f},{max(zs):.3f}) "
            f"n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )


# Expanded underpass audit: start from the registered glass footprint, flood the
# connected model-Y=3.0 walkable floor, then retain the portion that is
# physically roofed by the Temple01 bridge/glass structure. This deliberately
# avoids treating the vector glass rectangle itself as the lower-floor outline.
UNDERPASS_ROOF_TOKENS=("BridgeMetal","Glass01","Glass02","GlassEdge")

def roofed_underpass_cells(pdfpoly):
    poly=[pdf_to_model(p) for p in pdfpoly]
    cx=sum(p[0] for p in poly)/len(poly)
    cz=sum(p[1] for p in poly)/len(poly)
    # Pick the nearest Y=3 floor sample inside the registered glass footprint.
    seeds=[]
    xmin=min(p[0] for p in poly); xmax=max(p[0] for p in poly)
    zmin=min(p[1] for p in poly); zmax=max(p[1] for p in poly)
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if inside_poly(x,z,poly) and has_walk_surface(x,z,3.0):
                seeds.append((ix,iz))
    if not seeds:
        return set(),set(),set(),None
    seed=min(seeds,key=lambda q:(cell_xy(q)[0]-cx)**2+(cell_xy(q)[1]-cz)**2)
    sx,sz=cell_xy(seed)
    comp,seed_cell,_=flood_component(
        3.0,(sx,sz),(xmin-14,xmax+14,zmin-14,zmax+14)
    )

    roofed=set()
    for cell in comp:
        x,z=cell_xy(cell)
        hits=overhead_hits(x,z,3.0)
        if any(
            y>=7.0 and any(t in o or t in m for t in UNDERPASS_ROOF_TOKENS)
            for y,o,m in hits
        ):
            roofed.add(cell)

    # Keep only roofed component(s) that actually intersect the registered
    # vector glass projection.
    glass_cells={
        cell for cell in roofed
        if inside_poly(*cell_xy(cell),poly)
    }
    if not glass_cells:
        return comp,roofed,set(),seed_cell

    keep=set()
    unseen=set(roofed)
    while unseen:
        s=unseen.pop(); cc={s}; q=deque([s])
        while q:
            cur=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(cur[0]+d[0],cur[1]+d[1])
                if n in unseen:
                    unseen.remove(n); cc.add(n); q.append(n)
        if cc & glass_cells:
            keep |= cc
    return comp,roofed,keep,seed_cell

def underpass_floor_obstacle_cells(floor_cells):
    obstacle_cells=set()
    for ix,iz in floor_cells:
        x,z=cell_xy((ix,iz))
        for fi in face_candidates(x,z):
            ia,ib,ic,o,m=faces[fi]
            st=obj_ranges[o]
            if st["y0"]>3.15 or st["y1"]<4.30:
                continue
            if not any(t in o or t in m for t in OBSTACLE_TOKENS):
                continue
            tri=[vertices[ia],vertices[ib],vertices[ic]]
            n=tri_normal(tri)
            if abs(n[1])<0.50 or not contains_xz(x,z,tri):
                continue
            yy=interp_y(x,z,tri)
            if 2.85<=yy<=6.5:
                obstacle_cells.add((ix,iz))
                break
    return obstacle_cells


underpass_nav={}
for name,pdfpoly in glass_polys.items():
    comp,roofed,keep,seed=roofed_underpass_cells(pdfpoly)
    print(
        f"T21UNDERPASS COVER {name} seed={seed} floor_comp={len(comp)} "
        f"roofed={len(roofed)} linked={len(keep)} area={len(keep)*STEP*STEP:.3f}"
    )
    if not keep:
        raise SystemExit(f"T21 underpass audit failed: no roof-linked floor for {name}")

    xs=[cell_xy(v)[0] for v in keep]; zs=[cell_xy(v)[1] for v in keep]
    print(
        f"T21UNDERPASS COVERBBOX {name} "
        f"x=({min(xs):.3f},{max(xs):.3f}) z=({min(zs):.3f},{max(zs):.3f})"
    )
    loops=boundary_loops(keep)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    for j,loop in enumerate(loops[:12]):
        rr=rdp_closed(loop,0.15)
        print(
            f"T21UNDERPASS COVERLOOP {name} {j} area={polygon_area(loop):.3f} "
            f"raw={len(loop)} n={len(rr)} pts="
            f"{[tuple(round(v,3) for v in p) for p in rr]}"
        )

    obstacles=underpass_floor_obstacle_cells(keep)
    navigable=keep-obstacles
    if not navigable:
        raise SystemExit(f"T21 underpass audit failed: obstacles removed all floor for {name}")
    if not obstacles:
        raise SystemExit(f"T21 underpass audit failed: expected floor-level exclusions for {name}")

    nav_loops=boundary_loops(navigable)
    nav_loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    if not nav_loops:
        raise SystemExit(f"T21 underpass audit failed: no navigable contour for {name}")

    print(
        f"T21UNDERPASS NAV {name} floor={len(keep)} obstacles={len(obstacles)} "
        f"walkable={len(navigable)} area={len(navigable)*STEP*STEP:.3f}"
    )
    for j,loop in enumerate(nav_loops[:12]):
        rr=rdp_closed(loop,0.15)
        print(
            f"T21UNDERPASS NAVLOOP {name} {j} signed_area={polygon_area(loop):.3f} "
            f"raw={len(loop)} n={len(rr)} pts="
            f"{[tuple(round(v,3) for v in p) for p in rr]}"
        )
    underpass_nav[name]=(navigable,nav_loops)

if set(underpass_nav) != {"POS_GLASS","NEG_GLASS"}:
    raise SystemExit("T21 underpass audit failed: both symmetric underpasses are required")
pos_nav=underpass_nav["POS_GLASS"][0]
neg_nav=underpass_nav["NEG_GLASS"][0]
nav_area_residual=abs(len(pos_nav)-len(neg_nav))*STEP*STEP
mirrored_pos={(-ix,-iz) for ix,iz in pos_nav}
mirror_xor=mirrored_pos ^ neg_nav
mirror_missing=mirrored_pos-neg_nav
mirror_extra=neg_nav-mirrored_pos
print(
    f"T21UNDERPASS SYMMETRY pos_cells={len(pos_nav)} neg_cells={len(neg_nav)} "
    f"area_residual={nav_area_residual:.3f} mirror_xor_cells={len(mirror_xor)} "
    f"missing={len(mirror_missing)} extra={len(mirror_extra)} "
    f"mirror_xor_area={len(mirror_xor)*STEP*STEP:.3f}"
)
if nav_area_residual>0.50:
    raise SystemExit(
        f"T21 underpass audit failed: symmetric navigable area residual {nav_area_residual:.3f}m2 exceeds 0.50m2"
    )


# OBJ-native glass projection: avoid using the globally registered PDF glass
# rectangle as the clipping mask for promotion.
def convex_hull(points):
    pts=sorted(set((round(x,6),round(z,6)) for x,z in points))
    if len(pts)<=1:
        return pts
    def cross(o,a,b):
        return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[]
    for p0 in pts:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p0)<=0:
            lo.pop()
        lo.append(p0)
    hi=[]
    for p0 in reversed(pts):
        while len(hi)>=2 and cross(hi[-2],hi[-1],p0)<=0:
            hi.pop()
        hi.append(p0)
    return lo[:-1]+hi[:-1]

glass_obj="FldObj_Temple01_PntSet_pCube21560_1__Glass01"
glass_faces=[ff for ff in faces if ff[3]==glass_obj]
for side_name,pred in (
    ("POS_NATIVE",lambda x,z:x<0),
    ("NEG_NATIVE",lambda x,z:x>0),
):
    pts=[]
    for ff in glass_faces:
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if pred(cx,cz):
            pts.extend((v[0],v[2]) for v in tri)
    hull=convex_hull(pts)
    print(f"T21NATIVE HULL {side_name} n={len(hull)} pts={[tuple(round(v,3) for v in p) for p in hull]}")
    if not hull:
        continue
    xmin=min(p[0] for p in hull); xmax=max(p[0] for p in hull)
    zmin=min(p[1] for p in hull); zmax=max(p[1] for p in hull)
    floor_cells=set()
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if inside_poly(x,z,hull) and has_walk_surface(x,z,3.0):
                floor_cells.add((ix,iz))
    loops=boundary_loops(floor_cells)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    print(f"T21NATIVE FLOOR {side_name} cells={len(floor_cells)} area={len(floor_cells)*STEP*STEP:.3f}")
    for j,loop in enumerate(loops[:8]):
        rr=rdp_closed(loop,0.20)
        print(
            f"T21NATIVE FLOORLOOP {side_name} {j} area={polygon_area(loop):.3f} "
            f"n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )

    # Solid floor-level exclusions intersected with this actual lower floor.
    obstacle_cells=set()
    for ix,iz in floor_cells:
        x,z=cell_xy((ix,iz))
        for fi in face_candidates(x,z):
            ia,ib,ic,o,m=faces[fi]
            st=obj_ranges[o]
            if st["y0"]>3.15 or st["y1"]<4.30:
                continue
            if not any(t in o or t in m for t in OBSTACLE_TOKENS):
                continue
            tri=[vertices[ia],vertices[ib],vertices[ic]]
            n=tri_normal(tri)
            if abs(n[1])<0.50 or not contains_xz(x,z,tri):
                continue
            yy=interp_y(x,z,tri)
            if 2.85<=yy<=6.5:
                obstacle_cells.add((ix,iz))
                break
    rem=set(obstacle_cells); comps=[]
    while rem:
        seed=rem.pop(); cc={seed}; q=deque([seed])
        while q:
            c0=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                nn=(c0[0]+d[0],c0[1]+d[1])
                if nn in rem:
                    rem.remove(nn); cc.add(nn); q.append(nn)
        comps.append(cc)
    comps.sort(key=len,reverse=True)
    print(f"T21NATIVE OBST {side_name} cells={len(obstacle_cells)} area={len(obstacle_cells)*STEP*STEP:.3f}")
    for j,cc in enumerate(comps[:10]):
        loops2=boundary_loops(cc)
        loops2.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
        if not loops2: continue
        rr=rdp_closed(loops2[0],0.15)
        print(
            f"T21NATIVE OBSTLOOP {side_name} {j} cells={len(cc)} n={len(rr)} "
            f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )


# Split Glass01 into actual disconnected triangle components. The object contains
# several instances across the stage, so sign(x) alone is not a valid instance split.
vertex_to_glass_faces=defaultdict(list)
for j,ff in enumerate(glass_faces):
    for vi in ff[:3]:
        vertex_to_glass_faces[vi].append(j)

unseen=set(range(len(glass_faces)))
glass_components=[]
while unseen:
    seed=unseen.pop()
    comp={seed}; q=deque([seed])
    while q:
        j=q.popleft()
        ff=glass_faces[j]
        for vi in ff[:3]:
            for k in vertex_to_glass_faces[vi]:
                if k in unseen:
                    unseen.remove(k); comp.add(k); q.append(k)
    glass_components.append(comp)

glass_component_rows=[]
for ci,comp in enumerate(glass_components):
    vids=set()
    for j in comp:
        vids.update(glass_faces[j][:3])
    pts3=[vertices[i] for i in vids]
    x0=min(p[0] for p in pts3); x1=max(p[0] for p in pts3)
    z0=min(p[2] for p in pts3); z1=max(p[2] for p in pts3)
    y0=min(p[1] for p in pts3); y1=max(p[1] for p in pts3)
    cx=sum(p[0] for p in pts3)/len(pts3); cz=sum(p[2] for p in pts3)/len(pts3)
    glass_component_rows.append((ci,comp,vids,cx,cz,x0,x1,z0,z1,y0,y1))
    print(
        f"T21GLASSCOMP {ci} faces={len(comp)} verts={len(vids)} "
        f"centroid=({cx:.3f},{cz:.3f}) x=({x0:.3f},{x1:.3f}) "
        f"z=({z0:.3f},{z1:.3f}) y=({y0:.3f},{y1:.3f})"
    )

central=[row for row in glass_component_rows if abs(row[3])<18 and abs(row[4])<18]
central.sort(key=lambda row:(row[3],row[4]))

for idx,row in enumerate(central):
    ci,comp,vids,cx,cz,x0,x1,z0,z1,y0,y1=row
    hull=convex_hull([(vertices[i][0],vertices[i][2]) for i in vids])
    side_name="POS_CENTRAL" if cx<0 else "NEG_CENTRAL"
    print(f"T21CENTRALGLASS HULL {side_name} comp={ci} n={len(hull)} pts={[tuple(round(v,3) for v in p) for p in hull]}")

    floor_cells=set()
    for ix in range(math.floor(min(p[0] for p in hull)/STEP),math.ceil(max(p[0] for p in hull)/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(min(p[1] for p in hull)/STEP),math.ceil(max(p[1] for p in hull)/STEP)+1):
            z=iz*STEP
            if inside_poly(x,z,hull) and has_walk_surface(x,z,3.0):
                floor_cells.add((ix,iz))
    loops=boundary_loops(floor_cells)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    print(f"T21CENTRALGLASS FLOOR {side_name} cells={len(floor_cells)} area={len(floor_cells)*STEP*STEP:.3f}")
    for j,loop in enumerate(loops[:6]):
        rr=rdp_closed(loop,0.20)
        print(
            f"T21CENTRALGLASS FLOORLOOP {side_name} {j} area={polygon_area(loop):.3f} "
            f"n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )

    obstacle_cells=set()
    for ix,iz in floor_cells:
        x,z=cell_xy((ix,iz))
        for fi in face_candidates(x,z):
            ia,ib,ic,o,m=faces[fi]
            st=obj_ranges[o]
            if st["y0"]>3.15 or st["y1"]<4.30:
                continue
            if not any(t in o or t in m for t in OBSTACLE_TOKENS):
                continue
            tri=[vertices[ia],vertices[ib],vertices[ic]]
            n=tri_normal(tri)
            if abs(n[1])<0.50 or not contains_xz(x,z,tri):
                continue
            yy=interp_y(x,z,tri)
            if 2.85<=yy<=6.5:
                obstacle_cells.add((ix,iz)); break
    rem=set(obstacle_cells); comps=[]
    while rem:
        seed=rem.pop(); cc={seed}; q=deque([seed])
        while q:
            c0=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                nn=(c0[0]+d[0],c0[1]+d[1])
                if nn in rem:
                    rem.remove(nn); cc.add(nn); q.append(nn)
        comps.append(cc)
    comps.sort(key=len,reverse=True)
    print(f"T21CENTRALGLASS OBST {side_name} cells={len(obstacle_cells)} area={len(obstacle_cells)*STEP*STEP:.3f}")
    for j,cc in enumerate(comps[:8]):
        loops2=boundary_loops(cc)
        loops2.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
        if not loops2: continue
        rr=rdp_closed(loops2[0],0.15)
        print(
            f"T21CENTRALGLASS OBSTLOOP {side_name} {j} cells={len(cc)} n={len(rr)} "
            f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )


# Spatially regroup the face-split Glass01 triangles into the two central
# structures. OBJ export duplicates vertices per face, so shared-index
# connectivity is not meaningful for this mesh.
central_regions={
    "POS_SPATIAL": lambda cx,cz: (-14.0<=cx<=-5.5 and -2.5<=cz<=7.8),
    "NEG_SPATIAL": lambda cx,cz: (5.5<=cx<=14.0 and -7.8<=cz<=2.5),
}
for side_name,pred in central_regions.items():
    selected=[]
    vids=[]
    for ff in glass_faces:
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3; cz=sum(v[2] for v in tri)/3
        if pred(cx,cz):
            selected.append(ff)
            vids.extend(ff[:3])
    hull=convex_hull([(vertices[i][0],vertices[i][2]) for i in vids])
    print(
        f"T21SPATIALGLASS HULL {side_name} faces={len(selected)} n={len(hull)} "
        f"pts={[tuple(round(v,3) for v in p) for p in hull]}"
    )
    floor_cells=set()
    for ix in range(math.floor(min(p[0] for p in hull)/STEP),math.ceil(max(p[0] for p in hull)/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(min(p[1] for p in hull)/STEP),math.ceil(max(p[1] for p in hull)/STEP)+1):
            z=iz*STEP
            if inside_poly(x,z,hull) and has_walk_surface(x,z,3.0):
                floor_cells.add((ix,iz))
    loops=boundary_loops(floor_cells)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    print(f"T21SPATIALGLASS FLOOR {side_name} cells={len(floor_cells)} area={len(floor_cells)*STEP*STEP:.3f}")
    for j,loop in enumerate(loops[:6]):
        rr=rdp_closed(loop,0.20)
        print(
            f"T21SPATIALGLASS FLOORLOOP {side_name} {j} area={polygon_area(loop):.3f} "
            f"n={len(rr)} pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )

    obstacle_cells=set()
    for ix,iz in floor_cells:
        x,z=cell_xy((ix,iz))
        for fi in face_candidates(x,z):
            ia,ib,ic,o,m=faces[fi]
            st=obj_ranges[o]
            if st["y0"]>3.15 or st["y1"]<4.30:
                continue
            if not any(t in o or t in m for t in OBSTACLE_TOKENS):
                continue
            tri=[vertices[ia],vertices[ib],vertices[ic]]
            n=tri_normal(tri)
            if abs(n[1])<0.50 or not contains_xz(x,z,tri):
                continue
            yy=interp_y(x,z,tri)
            if 2.85<=yy<=6.5:
                obstacle_cells.add((ix,iz)); break
    rem=set(obstacle_cells); comps=[]
    while rem:
        seed=rem.pop(); cc={seed}; q=deque([seed])
        while q:
            c0=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                nn=(c0[0]+d[0],c0[1]+d[1])
                if nn in rem:
                    rem.remove(nn); cc.add(nn); q.append(nn)
        comps.append(cc)
    comps.sort(key=len,reverse=True)
    print(f"T21SPATIALGLASS OBST {side_name} cells={len(obstacle_cells)} area={len(obstacle_cells)*STEP*STEP:.3f}")
    for j,cc in enumerate(comps[:8]):
        loops2=boundary_loops(cc)
        loops2.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
        if not loops2: continue
        rr=rdp_closed(loops2[0],0.15)
        print(
            f"T21SPATIALGLASS OBSTLOOP {side_name} {j} cells={len(cc)} n={len(rr)} "
            f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
        )


# Exploratory internal-void enumeration.
#
# This does NOT promote KILL geometry. It only asks whether the current
# common+Turf Temple01 mesh contains top-down holes in the gameplay surface
# network after obvious solid caps are treated as occupied. Low catcher/base
# geometry is reported separately rather than being assumed survivable.
VOID_STEP=0.5
VOID_MIN_Y=-15.0
VOID_MAX_Y=20.0
VOID_SOLID_TOP_Y=-1.0
WATER_TOKENS=("Water","Sea","River")

def void_column_class(x,z):
    walk=[]
    solid=[]
    water=[]
    for fi in face_candidates(x,z):
        ia,ib,ic,o,m=faces[fi]
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        n=tri_normal(tri)
        if abs(n[1])<0.35 or not contains_xz(x,z,tri):
            continue
        y=interp_y(x,z,tri)
        if not (VOID_MIN_Y<=y<=VOID_MAX_Y):
            continue
        if any(t in o or t in m for t in WATER_TOKENS):
            water.append((y,o,m))
        elif any(t in m for t in WALK_TOKENS):
            walk.append((y,o,m))
        else:
            solid.append((y,o,m))
    walk.sort(reverse=True)
    solid.sort(reverse=True)
    water.sort(reverse=True)
    return walk,solid,water

walk_vertices=[]
for ia,ib,ic,o,m in faces:
    if any(t in m for t in WALK_TOKENS):
        walk_vertices.extend((vertices[ia],vertices[ib],vertices[ic]))

if walk_vertices:
    vx0=min(v[0] for v in walk_vertices)-2.0
    vx1=max(v[0] for v in walk_vertices)+2.0
    vz0=min(v[2] for v in walk_vertices)-2.0
    vz1=max(v[2] for v in walk_vertices)+2.0
    ix0=math.floor(vx0/VOID_STEP); ix1=math.ceil(vx1/VOID_STEP)
    iz0=math.floor(vz0/VOID_STEP); iz1=math.ceil(vz1/VOID_STEP)

    walk_cells=set()
    blocking_cells=set()
    low_only_cells=set()
    empty_cells=set()
    water_cells=set()
    low_top_y={}

    for ix in range(ix0,ix1+1):
        x=ix*VOID_STEP
        for iz in range(iz0,iz1+1):
            z=iz*VOID_STEP
            walk,solid,water=void_column_class(x,z)
            c=(ix,iz)
            if walk:
                walk_cells.add(c)
                blocking_cells.add(c)
            elif water:
                water_cells.add(c)
                blocking_cells.add(c)
            elif solid and solid[0][0] >= VOID_SOLID_TOP_Y:
                blocking_cells.add(c)
            elif solid:
                low_only_cells.add(c)
                low_top_y[c]=solid[0][0]
            else:
                empty_cells.add(c)

    traversable_empty=low_only_cells|empty_cells
    outside=set()
    q=deque()
    for ix in range(ix0,ix1+1):
        for iz in (iz0,iz1):
            c=(ix,iz)
            if c in traversable_empty and c not in outside:
                outside.add(c); q.append(c)
    for iz in range(iz0,iz1+1):
        for ix in (ix0,ix1):
            c=(ix,iz)
            if c in traversable_empty and c not in outside:
                outside.add(c); q.append(c)
    while q:
        c=q.popleft()
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(c[0]+d[0],c[1]+d[1])
            if n in traversable_empty and n not in outside:
                outside.add(n); q.append(n)

    enclosed=traversable_empty-outside
    rem=set(enclosed); void_components=[]
    while rem:
        seed=rem.pop(); cc={seed}; qq=deque([seed])
        while qq:
            c=qq.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(c[0]+d[0],c[1]+d[1])
                if n in rem:
                    rem.remove(n); cc.add(n); qq.append(n)
        void_components.append(cc)
    void_components.sort(key=len,reverse=True)

    print(
        f"T21VOID SUMMARY step={VOID_STEP:.3f} walk={len(walk_cells)} "
        f"water={len(water_cells)} low_only={len(low_only_cells)} "
        f"empty={len(empty_cells)} outside_empty={len(outside)} "
        f"enclosed={len(enclosed)} comps={len(void_components)}"
    )

    significant=[cc for cc in void_components if len(cc)*VOID_STEP*VOID_STEP>=1.0]
    for j,cc in enumerate(significant[:30]):
        xs=[c[0]*VOID_STEP for c in cc]
        zs=[c[1]*VOID_STEP for c in cc]
        lows=[low_top_y[c] for c in cc if c in low_top_y]
        boundary_walk=0; boundary_block=0; boundary_water=0
        for c in cc:
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(c[0]+d[0],c[1]+d[1])
                if n in walk_cells: boundary_walk+=1
                elif n in water_cells: boundary_water+=1
                elif n in blocking_cells: boundary_block+=1
        mirrored={(-c[0],-c[1]) for c in cc}
        best_overlap=0; best_idx=None
        for k,other in enumerate(significant):
            ov=len(mirrored & other)
            if ov>best_overlap:
                best_overlap=ov; best_idx=k
        mirror_ratio=(best_overlap/len(cc)) if cc else 0.0
        print(
            f"T21VOID COMP {j} cells={len(cc)} area={len(cc)*VOID_STEP*VOID_STEP:.3f} "
            f"bbox=({min(xs):.3f},{min(zs):.3f})..({max(xs):.3f},{max(zs):.3f}) "
            f"low_cells={len(lows)} low_top_range="
            f"{(round(min(lows),3),round(max(lows),3)) if lows else None} "
            f"adj_walk={boundary_walk} adj_solid={boundary_block} adj_water={boundary_water} "
            f"mirror_best={best_idx} mirror_overlap={best_overlap} mirror_ratio={mirror_ratio:.3f}"
        )
else:
    print("T21VOID SUMMARY no walkable vertices")


# Context classification for the significant enclosed-empty components.
# Registered vector overlays are comparison hints only: the global PDF->OBJ
# fit is not accurate enough to promote a candidate by overlap alone.
if walk_vertices:
    known_overlay_pdf={
        "WATER_A":[(556.8,444.72),(598.8,444.72),(598.8,426.12),(561.36,426.12),(561.36,430.68),(556.8,430.68)],
        "WATER_B":[(243.12,150.48),(243.12,169.08),(280.56,169.08),(280.56,164.52),(285.12,164.52),(285.12,150.48)],
        "GRATE_NEG":[(340.56,119.88),(363.48,119.88),(363.48,150.48),(340.56,150.48)],
        "GRATE_POS":[(478.44,444.72),(501.36,444.72),(501.36,475.32),(478.44,475.32)],
    }
    known_overlay_model={
        name:[pdf_to_model(pt) for pt in poly]
        for name,poly in known_overlay_pdf.items()
    }

    for j,cc in enumerate(significant[:30]):
        overlay_counts={}
        for name,poly in known_overlay_model.items():
            overlay_counts[name]=sum(
                1 for c in cc
                if inside_poly(c[0]*VOID_STEP,c[1]*VOID_STEP,poly)
            )

        adjacent_walk=defaultdict(int)
        adjacent_stage_side=defaultdict(int)
        seen_neighbor=set()
        for c in cc:
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(c[0]+d[0],c[1]+d[1])
                if n in cc or n in seen_neighbor:
                    continue
                seen_neighbor.add(n)
                x=n[0]*VOID_STEP; z=n[1]*VOID_STEP
                walk,solid,water=void_column_class(x,z)
                if walk:
                    y,o,m=walk[0]
                    adjacent_walk[(o,m,round(y,2))]+=1
                for fi in face_candidates(x,z):
                    ia,ib,ic,o,m=faces[fi]
                    if "StageSide" in o or "StageSide" in m:
                        adjacent_stage_side[(o,m)]+=1

        print(
            f"T21VOID CONTEXT {j} overlays={overlay_counts} "
            f"walk_top={sorted(adjacent_walk.items(),key=lambda kv:-kv[1])[:8]} "
            f"stage_side={sorted(adjacent_stage_side.items(),key=lambda kv:-kv[1])[:8]}"
        )


# Fine 0.125m audit of the four non-water enclosed-empty components found by
# the 0.5m exploratory pass. These remain candidates until this finer pass
# proves they are closed, floorless, and exactly symmetric.
def fine_void_component(name,seed,bounds):
    xmin,xmax,zmin,zmax=bounds
    candidates=set()
    low_floor_cells=set()
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            walk,solid,water=void_column_class(x,z)
            if walk or water or (solid and solid[0][0]>=VOID_SOLID_TOP_Y):
                continue
            c=(ix,iz)
            candidates.add(c)
            if solid:
                low_floor_cells.add(c)

    if not candidates:
        raise SystemExit(f"T21 fine void audit failed: no candidate cells for {name}")
    seed_cell=qcell(*seed)
    if seed_cell not in candidates:
        seed_cell=min(
            candidates,
            key=lambda c:(cell_xy(c)[0]-seed[0])**2+(cell_xy(c)[1]-seed[1])**2
        )

    comp={seed_cell}; q=deque([seed_cell])
    while q:
        c=q.popleft()
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(c[0]+d[0],c[1]+d[1])
            if n in candidates and n not in comp:
                comp.add(n); q.append(n)

    min_ix=math.floor(xmin/STEP); max_ix=math.ceil(xmax/STEP)
    min_iz=math.floor(zmin/STEP); max_iz=math.ceil(zmax/STEP)
    touches=any(
        ix in (min_ix,max_ix) or iz in (min_iz,max_iz)
        for ix,iz in comp
    )
    if touches:
        raise SystemExit(f"T21 fine void audit failed: {name} touches local audit bounds")

    lows=comp & low_floor_cells
    loops=boundary_loops(comp)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    if not loops:
        raise SystemExit(f"T21 fine void audit failed: no boundary loop for {name}")

    xs=[cell_xy(c)[0] for c in comp]; zs=[cell_xy(c)[1] for c in comp]
    print(
        f"T21VOID FINE {name} cells={len(comp)} area={len(comp)*STEP*STEP:.6f} "
        f"bbox=({min(xs):.3f},{min(zs):.3f})..({max(xs):.3f},{max(zs):.3f}) "
        f"low_floor_cells={len(lows)} loops={len(loops)}"
    )
    for j,loop in enumerate(loops[:8]):
        rr=rdp_closed(loop,0.15)
        print(
            f"T21VOID FINELOOP {name} {j} signed_area={polygon_area(loop):.6f} "
            f"raw={len(loop)} n={len(rr)} pts="
            f"{[tuple(round(v,3) for v in p) for p in rr]}"
        )
    return comp,loops,lows

fine_voids={}
fine_voids["LARGE_POS"]=fine_void_component(
    "LARGE_POS",(33.0,9.0),(28.0,38.0,1.0,17.0)
)
fine_voids["LARGE_NEG"]=fine_void_component(
    "LARGE_NEG",(-33.0,-9.0),(-38.0,-28.0,-17.0,-1.0)
)
fine_voids["SMALL_NEG"]=fine_void_component(
    "SMALL_NEG",(-33.0,-18.0),(-36.0,-30.0,-23.0,-13.0)
)
fine_voids["SMALL_POS"]=fine_void_component(
    "SMALL_POS",(33.0,18.0),(30.0,36.0,13.0,23.0)
)

for a,b in (("LARGE_POS","LARGE_NEG"),("SMALL_POS","SMALL_NEG")):
    ca=fine_voids[a][0]; cb=fine_voids[b][0]
    mirrored={(-ix,-iz) for ix,iz in ca}
    xor=mirrored ^ cb
    print(
        f"T21VOID FINESYM {a}->{b} a={len(ca)} b={len(cb)} "
        f"xor={len(xor)} missing={len(mirrored-cb)} extra={len(cb-mirrored)} "
        f"xor_area={len(xor)*STEP*STEP:.6f}"
    )
    if xor:
        raise SystemExit(
            f"T21 fine void audit failed: {a}/{b} are not exact 180-degree counterparts"
        )

for name,(comp,loops,lows) in fine_voids.items():
    if lows:
        raise SystemExit(
            f"T21 fine void audit failed: {name} contains lower horizontal geometry"
        )


# Measure whether the fine floorless-hole contours coincide with actual
# Temple01 StageSide vertical wall geometry. This remains an audit only; the
# name "StageSide" is not itself treated as proof of KILL semantics.
def point_segment_distance_2d(p,a,b):
    px,pz=p; ax,az=a; bx,bz=b
    dx=bx-ax; dz=bz-az
    den=dx*dx+dz*dz
    if den<=1e-12:
        return math.hypot(px-ax,pz-az)
    t=((px-ax)*dx+(pz-az)*dz)/den
    t=max(0.0,min(1.0,t))
    qx=ax+t*dx; qz=az+t*dz
    return math.hypot(px-qx,pz-qz)

stage_side_segments=[]
for ia,ib,ic,o,m in faces:
    if "StageSide" not in o and "StageSide" not in m:
        continue
    tri=[vertices[ia],vertices[ib],vertices[ic]]
    n=tri_normal(tri)
    # Keep wall-like faces. Horizontal caps are not evidence for a hole edge.
    if abs(n[1])>0.45:
        continue
    pts=[(v[0],v[2]) for v in tri]
    pairs=[
        (pts[0],pts[1]),
        (pts[1],pts[2]),
        (pts[2],pts[0]),
    ]
    a,b=max(pairs,key=lambda ab:(ab[0][0]-ab[1][0])**2+(ab[0][1]-ab[1][1])**2)
    seg_len=math.hypot(a[0]-b[0],a[1]-b[1])
    if seg_len<0.05:
        continue
    ys=[v[1] for v in tri]
    if max(ys)-min(ys)<0.50:
        continue
    stage_side_segments.append((a,b,min(ys),max(ys),o,m))

WALL_BIN=1.0
wall_bins=defaultdict(list)
for si,(a,b,y0,y1,o,m) in enumerate(stage_side_segments):
    xmin=min(a[0],b[0])-0.50; xmax=max(a[0],b[0])+0.50
    zmin=min(a[1],b[1])-0.50; zmax=max(a[1],b[1])+0.50
    for ix in range(math.floor(xmin/WALL_BIN),math.floor(xmax/WALL_BIN)+1):
        for iz in range(math.floor(zmin/WALL_BIN),math.floor(zmax/WALL_BIN)+1):
            wall_bins[(ix,iz)].append(si)

def nearest_stage_side_distance(x,z):
    candidates=wall_bins.get((math.floor(x/WALL_BIN),math.floor(z/WALL_BIN)),())
    best=None; best_meta=None
    for si in candidates:
        a,b,y0,y1,o,m=stage_side_segments[si]
        d=point_segment_distance_2d((x,z),a,b)
        if best is None or d<best:
            best=d; best_meta=(y0,y1,o,m)
    return best,best_meta

for name,(comp,loops,lows) in fine_voids.items():
    loop=loops[0]
    distances=[]
    metas=[]
    for i,a in enumerate(loop):
        b=loop[(i+1)%len(loop)]
        mx=(a[0]+b[0])*0.5; mz=(a[1]+b[1])*0.5
        d,meta=nearest_stage_side_distance(mx,mz)
        if d is None:
            d=999.0
        distances.append(d)
        metas.append(meta)
    sd=sorted(distances)
    def pct(q):
        if not sd: return 999.0
        idx=min(len(sd)-1,max(0,round((len(sd)-1)*q)))
        return sd[idx]
    cov15=sum(d<=0.15 for d in distances)/len(distances)
    cov30=sum(d<=0.30 for d in distances)/len(distances)
    cov50=sum(d<=0.50 for d in distances)/len(distances)
    objs=defaultdict(int)
    yranges=[]
    for d,meta in zip(distances,metas):
        if meta is None or d>0.30:
            continue
        y0,y1,o,m=meta
        objs[(o,m)]+=1
        yranges.append((y0,y1))
    ysummary=None
    if yranges:
        ysummary=(
            round(min(v[0] for v in yranges),3),
            round(max(v[1] for v in yranges),3),
        )
    print(
        f"T21VOID WALL {name} edges={len(distances)} "
        f"cov015={cov15:.3f} cov030={cov30:.3f} cov050={cov50:.3f} "
        f"p50={pct(0.50):.3f} p95={pct(0.95):.3f} max={max(distances):.3f} "
        f"near_y_range={ysummary} "
        f"objects={sorted(objs.items(),key=lambda kv:-kv[1])[:6]}"
    )


# Classify every fine void perimeter edge by the immediately adjacent column.
# This distinguishes inaccessible space behind StageSide walls from open
# floor cutouts bordered directly by walkable material.
for name,(comp,loops,lows) in fine_voids.items():
    edge_class=defaultdict(int)
    walk_top=defaultdict(int)
    solid_top=defaultdict(int)
    for c in comp:
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(c[0]+d[0],c[1]+d[1])
            if n in comp:
                continue
            x=n[0]*STEP; z=n[1]*STEP
            walk,solid,water=void_column_class(x,z)
            if walk:
                edge_class["WALK"]+=1
                y,o,m=walk[0]
                walk_top[(o,m,round(y,3))]+=1
            elif water:
                edge_class["WATER"]+=1
            elif solid and solid[0][0]>=VOID_SOLID_TOP_Y:
                edge_class["SOLID_CAP"]+=1
                y,o,m=solid[0]
                solid_top[(o,m,round(y,3))]+=1
            elif solid:
                edge_class["LOW_ONLY"]+=1
            else:
                edge_class["EMPTY"]+=1
    total=sum(edge_class.values())
    print(
        f"T21VOID EDGECLASS {name} total={total} classes={dict(sorted(edge_class.items()))} "
        f"walk_top={sorted(walk_top.items(),key=lambda kv:-kv[1])[:10]} "
        f"solid_top={sorted(solid_top.items(),key=lambda kv:-kv[1])[:10]}"
    )


# Reverse audit from the actual Y=1.5 FloorMetal mesh.
#
# The small enclosed-air candidates touch this object along their only walkable
# perimeter. A genuine open pit cut into that floor should therefore appear as
# an interior (negative-area) boundary loop of the FloorMetal top surface.
FLOOR_METAL_VOID_TARGET="Fld_Temple01_pCube21772_1__FloorMetal00"
floor_metal_faces=[]
for ff in faces:
    ia,ib,ic,o,m=ff
    if o != FLOOR_METAL_VOID_TARGET:
        continue
    tri=[vertices[ia],vertices[ib],vertices[ic]]
    n=tri_normal(tri)
    if abs(n[1])<0.75:
        continue
    cy=sum(v[1] for v in tri)/3
    if abs(cy-1.5)>0.10:
        continue
    floor_metal_faces.append(ff)

if not floor_metal_faces:
    raise SystemExit("T21 floor-metal hole audit failed: target Y=1.5 faces missing")

fm_x=[vertices[i][0] for ff in floor_metal_faces for i in ff[:3]]
fm_z=[vertices[i][2] for ff in floor_metal_faces for i in ff[:3]]
fm_cells=set()
for ix in range(math.floor(min(fm_x)/STEP),math.ceil(max(fm_x)/STEP)+1):
    x=ix*STEP
    for iz in range(math.floor(min(fm_z)/STEP),math.ceil(max(fm_z)/STEP)+1):
        z=iz*STEP
        for ia,ib,ic,o,m in floor_metal_faces:
            tri=[vertices[ia],vertices[ib],vertices[ic]]
            if contains_xz(x,z,tri) and abs(interp_y(x,z,tri)-1.5)<=0.10:
                fm_cells.add((ix,iz))
                break

fm_components=[]
fm_rem=set(fm_cells)
while fm_rem:
    seed=fm_rem.pop(); cc={seed}; q=deque([seed])
    while q:
        c=q.popleft()
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(c[0]+d[0],c[1]+d[1])
            if n in fm_rem:
                fm_rem.remove(n); cc.add(n); q.append(n)
    fm_components.append(cc)
fm_components.sort(key=len,reverse=True)

print(
    f"T21VOID FLOORMETAL object={FLOOR_METAL_VOID_TARGET} "
    f"faces={len(floor_metal_faces)} cells={len(fm_cells)} comps={len(fm_components)} "
    f"bbox=({min(fm_x):.3f},{min(fm_z):.3f})..({max(fm_x):.3f},{max(fm_z):.3f})"
)

fm_loops=[]
for ci,cc in enumerate(fm_components):
    loops=boundary_loops(cc)
    loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
    for li,loop in enumerate(loops):
        area=polygon_area(loop)
        xs=[p[0] for p in loop]; zs=[p[1] for p in loop]
        rr=rdp_closed(loop,0.15)
        fm_loops.append((ci,li,area,loop,rr))
        if li<12:
            print(
                f"T21VOID FLOORMETAL_LOOP comp={ci} loop={li} "
                f"signed_area={area:.6f} raw={len(loop)} n={len(rr)} "
                f"bbox=({min(xs):.3f},{min(zs):.3f})..({max(xs):.3f},{max(zs):.3f}) "
                f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
            )

negative_loops=[item for item in fm_loops if item[2] < -0.25]
print(
    f"T21VOID FLOORMETAL_HOLES count={len(negative_loops)} "
    f"areas={[round(-item[2],6) for item in negative_loops]}"
)

def loop_midpoints(loop):
    out=[]
    for i,a in enumerate(loop):
        b=loop[(i+1)%len(loop)]
        out.append(((a[0]+b[0])*0.5,(a[1]+b[1])*0.5))
    return out

def loop_nearest_stats(source_loop,target_loop):
    target_segments=[
        (target_loop[i],target_loop[(i+1)%len(target_loop)])
        for i in range(len(target_loop))
    ]
    ds=[]
    for p in loop_midpoints(source_loop):
        ds.append(min(point_segment_distance_2d(p,a,b) for a,b in target_segments))
    ds.sort()
    if not ds:
        return (999.0,999.0,999.0)
    p50=ds[min(len(ds)-1,round((len(ds)-1)*0.50))]
    p95=ds[min(len(ds)-1,round((len(ds)-1)*0.95))]
    return (p50,p95,max(ds))

for void_name in ("SMALL_NEG","SMALL_POS"):
    void_loop=fine_voids[void_name][1][0]
    best=None
    for ci,li,area,loop,rr in negative_loops:
        p50,p95,mx=loop_nearest_stats(void_loop,loop)
        candidate=(p95,p50,mx,ci,li,-area)
        if best is None or candidate<best:
            best=candidate
    print(
        f"T21VOID FLOORMETAL_MATCH {void_name} "
        f"best={best}"
    )


# Reverse-audit the dominant Y=1.2 FloorLine05 mesh bordering the large pair.
# As with FloorMetal, a genuine pit cut into this floor must appear as an
# interior negative-area loop of the floor mesh itself.
def audit_floor_object_holes(label,target_object,target_y,compare_void_names):
    target_faces=[]
    for ff in faces:
        ia,ib,ic,o,m=ff
        if o != target_object:
            continue
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        n=tri_normal(tri)
        if abs(n[1])<0.75:
            continue
        cy=sum(v[1] for v in tri)/3
        if abs(cy-target_y)>0.10:
            continue
        target_faces.append(ff)
    if not target_faces:
        raise SystemExit(f"T21 {label} audit failed: target faces missing")

    xs=[vertices[i][0] for ff in target_faces for i in ff[:3]]
    zs=[vertices[i][2] for ff in target_faces for i in ff[:3]]
    cells=set()
    for ix in range(math.floor(min(xs)/STEP),math.ceil(max(xs)/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(min(zs)/STEP),math.ceil(max(zs)/STEP)+1):
            z=iz*STEP
            for ia,ib,ic,o,m in target_faces:
                tri=[vertices[ia],vertices[ib],vertices[ic]]
                if contains_xz(x,z,tri) and abs(interp_y(x,z,tri)-target_y)<=0.10:
                    cells.add((ix,iz)); break

    comps=[]; rem=set(cells)
    while rem:
        seed=rem.pop(); cc={seed}; q=deque([seed])
        while q:
            c=q.popleft()
            for d in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(c[0]+d[0],c[1]+d[1])
                if n in rem:
                    rem.remove(n); cc.add(n); q.append(n)
        comps.append(cc)
    comps.sort(key=len,reverse=True)

    all_loops=[]
    print(
        f"T21VOID FLOOROBJECT {label} object={target_object} y={target_y:.3f} "
        f"faces={len(target_faces)} cells={len(cells)} comps={len(comps)} "
        f"bbox=({min(xs):.3f},{min(zs):.3f})..({max(xs):.3f},{max(zs):.3f})"
    )
    for ci,cc in enumerate(comps):
        loops=boundary_loops(cc)
        loops.sort(key=lambda l:abs(polygon_area(l)),reverse=True)
        for li,loop in enumerate(loops):
            area=polygon_area(loop)
            all_loops.append((ci,li,area,loop))
            if li<12:
                lx=[p[0] for p in loop]; lz=[p[1] for p in loop]
                rr=rdp_closed(loop,0.15)
                print(
                    f"T21VOID FLOOROBJECT_LOOP {label} comp={ci} loop={li} "
                    f"signed_area={area:.6f} raw={len(loop)} n={len(rr)} "
                    f"bbox=({min(lx):.3f},{min(lz):.3f})..({max(lx):.3f},{max(lz):.3f}) "
                    f"pts={[tuple(round(v,3) for v in p) for p in rr]}"
                )
    holes=[item for item in all_loops if item[2] < -0.25]
    print(
        f"T21VOID FLOOROBJECT_HOLES {label} count={len(holes)} "
        f"areas={[round(-item[2],6) for item in holes]}"
    )
    for void_name in compare_void_names:
        void_loop=fine_voids[void_name][1][0]
        best=None
        for ci,li,area,loop in holes:
            p50,p95,mx=loop_nearest_stats(void_loop,loop)
            candidate=(p95,p50,mx,ci,li,-area)
            if best is None or candidate<best:
                best=candidate
        print(f"T21VOID FLOOROBJECT_MATCH {label} {void_name} best={best}")
    return cells,holes

floorline05_cells,floorline05_holes=audit_floor_object_holes(
    "FLOORLINE05",
    "Fld_Temple01_group21978_1__FloorLine05",
    1.2,
    ("LARGE_POS","LARGE_NEG")
)


# T21-D central slope plane audit.
#
# Resolve the actual plane from the locally registered common Temple01
# FloorSlope00 triangles. This does not assume that the long axis of the
# vector hatch rectangle is the slope direction.
CENTER_SLOPE_PDF={
    "LEFT":[
        (393.6,312.36),(409.44,312.36),
        (409.44,369.84),(393.6,369.84)
    ],
    "RIGHT":[
        (432.48,225.36),(448.32,225.36),
        (448.32,282.84),(432.48,282.84)
    ],
}
CENTER_SLOPE_OBJECT="Fld_Temple01_pCube21000_1__FloorSlope00"

def model_to_project(p):
    mx=p[0]-REG_TX
    mz=p[1]-REG_TZ
    return (
        (REG_C*mx+REG_S*mz)/REG_SCALE,
        (-REG_S*mx+REG_C*mz)/REG_SCALE
    )

def plane_from_triangle(points):
    p0,p1,p2=points
    ux,uy,uz=p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]
    vx,vy,vz=p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]
    nx=uy*vz-uz*vy
    ny=uz*vx-ux*vz
    nz=ux*vy-uy*vx
    if abs(ny)<=1e-10:
        raise RuntimeError("central slope triangle has near-vertical plane")
    # y = a*x + b*z + c
    a=-nx/ny
    b=-nz/ny
    c=(nx*p0[0]+ny*p0[1]+nz*p0[2])/ny
    return a,b,c

def slope_project_point(v):
    x,z=model_to_project((v[0],v[2]))
    return (x,v[1]-3.0,z)

slope_planes={}
for name,pdf_poly in CENTER_SLOPE_PDF.items():
    model_poly=[pdf_to_model(p) for p in pdf_poly]
    selected=[]
    for ff in faces:
        ia,ib,ic,o,m=ff
        if o!=CENTER_SLOPE_OBJECT:
            continue
        tri=[vertices[ia],vertices[ib],vertices[ic]]
        ymin=min(v[1] for v in tri); ymax=max(v[1] for v in tri)
        if ymin < 1.40 or ymax > 3.10:
            continue
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if inside_poly(cx,cz,model_poly):
            selected.append(ff)

    if not selected:
        raise SystemExit(f"T21 central slope audit failed: no {name} triangles")

    unique={}
    for ia,ib,ic,o,m in selected:
        for vi in (ia,ib,ic):
            v=vertices[vi]
            unique[(round(v[0],9),round(v[1],9),round(v[2],9))]=v

    first=selected[0]
    tri_project=[slope_project_point(vertices[i]) for i in first[:3]]
    a,b,c=plane_from_triangle(tri_project)

    residuals=[]
    pverts=[]
    for v in unique.values():
        x,y,z=slope_project_point(v)
        pred=a*x+b*z+c
        residuals.append(abs(y-pred))
        pverts.append((x,y,z))
    rms=math.sqrt(sum(r*r for r in residuals)/len(residuals))
    max_res=max(residuals)

    project_poly=[pdf_to_project(p) for p in pdf_poly]
    corners=[(x,z,a*x+b*z+c) for x,z in project_poly]
    ys=[p[1] for p in pverts]

    print(
        f"T21SLOPE PLANE {name} faces={len(selected)} verts={len(unique)} "
        f"a={a:.12f} b={b:.12f} c={c:.12f} "
        f"rms={rms:.12f} max={max_res:.12f} "
        f"vertex_y=({min(ys):.6f},{max(ys):.6f}) "
        f"corners={[(round(x,6),round(z,6),round(y,6)) for x,z,y in corners]}"
    )
    slope_planes[name]=(a,b,c,max_res)

la,lb,lc,lerr=slope_planes["LEFT"]
ra,rb,rc,rerr=slope_planes["RIGHT"]
sym=max(abs(ra+la),abs(rb+lb),abs(rc-lc))
print(
    f"T21SLOPE SYMMETRY coeff_residual={sym:.12f} "
    f"left_max={lerr:.12f} right_max={rerr:.12f}"
)


# T21-D central slope connected-component audit.
#
# The vector dashed footprint is semantic evidence, not a hard collision edge.
# Therefore select the actual Temple01 FloorSlope00 connected mesh component
# touched by each locally registered marker, and audit that source mesh itself.
def face_components_by_shared_vertex(face_list):
    vertex_to_faces=defaultdict(list)
    for local_i,ff in enumerate(face_list):
        for vi in ff[:3]:
            vertex_to_faces[vi].append(local_i)
    remaining=set(range(len(face_list)))
    comps=[]
    while remaining:
        seed=remaining.pop()
        comp={seed}
        q=deque([seed])
        while q:
            fi=q.popleft()
            for vi in face_list[fi][:3]:
                for ni in vertex_to_faces[vi]:
                    if ni in remaining:
                        remaining.remove(ni)
                        comp.add(ni)
                        q.append(ni)
        comps.append(sorted(comp))
    comps.sort(key=len,reverse=True)
    return comps

slope_source_faces=[
    ff for ff in faces
    if ff[3]==CENTER_SLOPE_OBJECT
    and min(vertices[i][1] for i in ff[:3])>=1.40
    and max(vertices[i][1] for i in ff[:3])<=3.10
]
slope_components=face_components_by_shared_vertex(slope_source_faces)
print(
    f"T21SLOPE COMPONENT_SUMMARY source_faces={len(slope_source_faces)} "
    f"components={len(slope_components)} sizes={[len(c) for c in slope_components]}"
)

component_records=[]
for ci,component in enumerate(slope_components):
    comp_faces=[slope_source_faces[i] for i in component]
    unique_indices=sorted({vi for ff in comp_faces for vi in ff[:3]})
    pverts=[slope_project_point(vertices[vi]) for vi in unique_indices]
    xs=[p[0] for p in pverts]; ys=[p[1] for p in pverts]; zs=[p[2] for p in pverts]
    # Detect which semantic marker(s) are touched by triangle centroids.
    touches=[]
    for name,pdf_poly in CENTER_SLOPE_PDF.items():
        model_poly=[pdf_to_model(p) for p in pdf_poly]
        n=0
        for ff in comp_faces:
            tri=[vertices[i] for i in ff[:3]]
            cx=sum(v[0] for v in tri)/3
            cz=sum(v[2] for v in tri)/3
            if inside_poly(cx,cz,model_poly):
                n+=1
        if n:
            touches.append((name,n))

    # Stable local index order + project-space source triangles.
    local_index={vi:i for i,vi in enumerate(unique_indices)}
    indices=[local_index[vi] for ff in comp_faces for vi in ff[:3]]

    # Plane residual over the complete connected component.
    a,b,c=plane_from_triangle([
        pverts[indices[0]],
        pverts[indices[1]],
        pverts[indices[2]],
    ])
    residuals=[
        abs(y-(a*x+b*z+c))
        for x,y,z in pverts
    ]
    print(
        f"T21SLOPE COMPONENT {ci} faces={len(comp_faces)} verts={len(pverts)} "
        f"touches={touches} bbox=({min(xs):.6f},{min(zs):.6f}).."
        f"({max(xs):.6f},{max(zs):.6f}) y=({min(ys):.6f},{max(ys):.6f}) "
        f"plane=({a:.12f},{b:.12f},{c:.12f}) "
        f"rms={math.sqrt(sum(r*r for r in residuals)/len(residuals)):.12f} "
        f"max={max(residuals):.12f} "
        f"vertices={[(round(x,6),round(y,6),round(z,6)) for x,y,z in pverts]} "
        f"indices={indices}"
    )
    component_records.append((ci,touches,pverts,indices,a,b,c,max(residuals)))

central=[]
central_by_marker=defaultdict(list)
for rec in component_records:
    ci,touches,pverts,indices,a,b,c,max_res=rec
    face_count=len(indices)//3
    full_markers=[
        name for name,count in touches
        if name in ("LEFT","RIGHT") and count==face_count
    ]
    if not full_markers:
        continue
    if len(full_markers)!=1:
        raise SystemExit(
            f"T21 central slope component audit failed: component {ci} fully belongs to {full_markers}"
        )
    marker=full_markers[0]
    central.append(rec)
    central_by_marker[marker].append(rec)

print(
    f"T21SLOPE CENTRAL_COMPONENTS count={len(central)} "
    f"ids={[rec[0] for rec in central]} "
    f"left={[rec[0] for rec in central_by_marker['LEFT']]} "
    f"right={[rec[0] for rec in central_by_marker['RIGHT']]}"
)
if len(central)!=4 or any(len(central_by_marker[name])!=2 for name in ("LEFT","RIGHT")):
    raise SystemExit(
        "T21 central slope component audit failed: expected two fully-contained source quads per marker"
    )
if any(len(rec[3])!=6 or len(rec[2])!=4 or rec[7]>1e-9 for rec in central):
    raise SystemExit(
        "T21 central slope component audit failed: selected central components must remain exact planar quads"
    )


# T21-D upper-glass exact source-mesh audit.
#
# Reuse the locally isolated central Glass01 structures instead of flattening
# the slope-marked vector face. The whole selected 3D shell is preserved.
def project_glass_vertex(v):
    x,z=model_to_project((v[0],v[2]))
    return (x,v[1]-3.0,z)

def build_compact_mesh(selected_faces):
    vertex_index={}
    out_vertices=[]
    out_indices=[]
    for ff in selected_faces:
        for vi in ff[:3]:
            pv=project_glass_vertex(vertices[vi])
            key=tuple(round(q,6) for q in pv)
            if key not in vertex_index:
                vertex_index[key]=len(out_vertices)
                out_vertices.append(key)
            out_indices.append(vertex_index[key])
    return out_vertices,out_indices

upper_glass_meshes={}
upper_glass_model_vertices={}
for side_name,pred in (
    ("POS_GLASS_SOURCE",lambda cx,cz: (-14.0<=cx<=-5.5 and -2.5<=cz<=7.8)),
    ("NEG_GLASS_SOURCE",lambda cx,cz: (5.5<=cx<=14.0 and -7.8<=cz<=2.5)),
):
    selected=[]
    model_vertex_set=set()
    for ff in glass_faces:
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if pred(cx,cz):
            selected.append(ff)
            for vi in ff[:3]:
                v=vertices[vi]
                model_vertex_set.add((round(v[0],6),round(v[1],6),round(v[2],6)))
    verts,inds=build_compact_mesh(selected)
    if not selected or len(inds)!=len(selected)*3:
        raise SystemExit(f"T21 upper glass audit failed: invalid mesh for {side_name}")
    ys=[v[1] for v in verts]
    xs=[v[0] for v in verts]
    zs=[v[2] for v in verts]
    print(
        f"T21UPPERGLASS MESH {side_name} faces={len(selected)} verts={len(verts)} "
        f"indices={len(inds)} y=({min(ys):.6f},{max(ys):.6f}) "
        f"x=({min(xs):.6f},{max(xs):.6f}) z=({min(zs):.6f},{max(zs):.6f})"
    )
    # Compact machine-readable payload for deterministic TypeScript promotion.
    print(
        "T21UPPERGLASS JSON "
        + side_name
        + " "
        + json.dumps({"vertices":verts,"indices":inds},separators=(",",":"))
    )
    upper_glass_meshes[side_name]=(verts,inds)
    upper_glass_model_vertices[side_name]=model_vertex_set

if set(upper_glass_meshes)!={"POS_GLASS_SOURCE","NEG_GLASS_SOURCE"}:
    raise SystemExit("T21 upper glass audit failed: both central structures required")

# Symmetry is a Temple01 model-space property. Do not test project-origin
# symmetry after registration, because REG_TX/REG_TZ intentionally introduce a
# small translation and would create a false residual.
pos_model=upper_glass_model_vertices["POS_GLASS_SOURCE"]
neg_model=upper_glass_model_vertices["NEG_GLASS_SOURCE"]
mirrored_pos_model={
    (round(-x,6),round(y,6),round(-z,6))
    for x,y,z in pos_model
}
vertex_xor=mirrored_pos_model ^ neg_model
print(
    f"T21UPPERGLASS SYMMETRY model_space=1 pos_verts={len(pos_model)} neg_verts={len(neg_model)} "
    f"xor={len(vertex_xor)} missing={len(mirrored_pos_model-neg_model)} "
    f"extra={len(neg_model-mirrored_pos_model)}"
)
if vertex_xor:
    raise SystemExit(
        f"T21 upper glass audit failed: model-space 3D vertex mirror XOR {len(vertex_xor)}"
    )


# T21-D water visual-plane audit.
#
# XZ hazard polygons are already CONFIRMED from the vector source. This pass
# asks only whether the locally registered Temple01 mesh supplies an actual
# Water/Sea/River horizontal visual surface and its project-space Y. It does
# not infer a death threshold from that visual plane.
WATER_SOURCE_PDF={
    "TEAM_A":[
        (556.8,444.72),(598.8,444.72),(598.8,426.12),
        (561.36,426.12),(561.36,430.68),(556.8,430.68)
    ],
    "TEAM_B":[
        (243.12,150.48),(243.12,169.08),(280.56,169.08),
        (280.56,164.52),(285.12,164.52),(285.12,150.48)
    ],
}
for water_name,pdf_poly in WATER_SOURCE_PDF.items():
    poly=[pdf_to_model(p) for p in pdf_poly]
    xmin=min(p[0] for p in poly); xmax=max(p[0] for p in poly)
    zmin=min(p[1] for p in poly); zmax=max(p[1] for p in poly)
    total=0
    covered=0
    y_hist=defaultdict(int)
    source_hist=defaultdict(int)
    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if not inside_poly(x,z,poly):
                continue
            total+=1
            hits=[]
            for fi in face_candidates(x,z):
                ia,ib,ic,o,m=faces[fi]
                if not any(t in o or t in m for t in WATER_TOKENS):
                    continue
                tri=[vertices[ia],vertices[ib],vertices[ic]]
                n=tri_normal(tri)
                if abs(n[1])<0.75 or not contains_xz(x,z,tri):
                    continue
                y=interp_y(x,z,tri)
                hits.append((y,o,m))
            if not hits:
                continue
            covered+=1
            y,o,m=max(hits,key=lambda h:h[0])
            py=y-3.0
            y_hist[round(py,4)]+=1
            source_hist[(o,m,round(py,4))]+=1
    print(
        f"T21WATER VISUAL {water_name} cells={total} covered={covered} "
        f"coverage={(covered/total if total else 0):.6f} "
        f"y_hist={sorted(y_hist.items())}"
    )
    print(
        f"T21WATER SOURCE {water_name} "
        f"{sorted(source_hist.items(),key=lambda kv:-kv[1])[:20]}"
    )


# T21-D upper-glass BridgeMetal support/collision-source audit.
#
# Glass01 is the visual shell and is intentionally not collision authority.
# Audit the separate current-Turf BridgeMetal object in the same two central
# regions before deciding what may back player/projectile collision.
BRIDGE_METAL_OBJECT="FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00"
bridge_faces=[ff for ff in faces if ff[3]==BRIDGE_METAL_OBJECT]
bridge_model_vertices={}
for side_name,pred in (
    ("POS_BRIDGE_SOURCE",lambda cx,cz: (-14.0<=cx<=-5.5 and -2.5<=cz<=7.8)),
    ("NEG_BRIDGE_SOURCE",lambda cx,cz: (5.5<=cx<=14.0 and -7.8<=cz<=2.5)),
):
    selected=[]
    model_vertex_set=set()
    normal_hist=defaultdict(int)
    project_y_hist=defaultdict(int)
    for ff in bridge_faces:
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if not pred(cx,cz):
            continue
        selected.append(ff)
        for vi in ff[:3]:
            v=vertices[vi]
            model_vertex_set.add((round(v[0],6),round(v[1],6),round(v[2],6)))
        n=tri_normal(tri)
        verticality=round(abs(n[1]),2)
        normal_hist[verticality]+=1
        cy=sum(v[1] for v in tri)/3 - 3.0
        project_y_hist[round(cy,2)]+=1

    if not selected:
        raise SystemExit(f"T21 bridge audit failed: no source faces for {side_name}")
    xs=[v[0] for v in model_vertex_set]
    ys=[v[1]-3.0 for v in model_vertex_set]
    zs=[v[2] for v in model_vertex_set]
    horizontal=sum(
        count for ny,count in normal_hist.items()
        if ny>=0.75
    )
    print(
        f"T21BRIDGE MESH {side_name} faces={len(selected)} verts={len(model_vertex_set)} "
        f"project_y=({min(ys):.6f},{max(ys):.6f}) "
        f"x=({min(xs):.6f},{max(xs):.6f}) z=({min(zs):.6f},{max(zs):.6f}) "
        f"horizontal_like={horizontal} wall_like={len(selected)-horizontal}"
    )
    print(
        f"T21BRIDGE YHIST {side_name} "
        f"{sorted(project_y_hist.items(),key=lambda kv:(kv[0],kv[1]))}"
    )
    bridge_model_vertices[side_name]=model_vertex_set

pos_bridge=bridge_model_vertices["POS_BRIDGE_SOURCE"]
neg_bridge=bridge_model_vertices["NEG_BRIDGE_SOURCE"]
mirrored_pos_bridge={
    (round(-x,6),round(y,6),round(-z,6))
    for x,y,z in pos_bridge
}
bridge_xor=mirrored_pos_bridge ^ neg_bridge
print(
    f"T21BRIDGE SYMMETRY model_space=1 pos_verts={len(pos_bridge)} "
    f"neg_verts={len(neg_bridge)} xor={len(bridge_xor)} "
    f"missing={len(mirrored_pos_bridge-neg_bridge)} "
    f"extra={len(neg_bridge-mirrored_pos_bridge)}"
)


# T21-D spawn/right-low exact slope-component audit.
#
# Stay inside the already locally verified spawn-side Temple01 bounds and bind
# source slope meshes only by contact with independently extracted flat-floor
# components. No globally transformed white-face clipping is used.
spawn_route_floor_masks={
    "POS_SPAWN_HIGH": (spawn_components["POS_SPAWN_HIGH"][0],10.5),
    "NEG_SPAWN_HIGH": (spawn_components["NEG_SPAWN_HIGH"][0],10.5),
    "POS_FIRST_DROP_LANDING": (spawn_components["POS_FIRST_DROP_LANDING"][0],6.0),
    "NEG_FIRST_DROP_LANDING": (spawn_components["NEG_FIRST_DROP_LANDING"][0],6.0),
}
for name,target_y,seed,bounds in (
    ("POS_RIGHT_LOW",7.5,(-15.05,55.40),(-32,8,25,68)),
    ("NEG_RIGHT_LOW",7.5,(14.96,-55.67),(-8,32,-68,-25)),
):
    comp,_,_=flood_component(target_y,seed,bounds)
    if not comp:
        raise SystemExit(f"T21 route slope audit failed: no floor mask for {name}")
    spawn_route_floor_masks[name]=(comp,target_y)

def near_mask_vertex(v,mask,target_y,radius_cells=2,y_tolerance=0.26):
    if abs(v[1]-target_y)>y_tolerance:
        return False
    ix=round(v[0]/STEP); iz=round(v[2]/STEP)
    for dx in range(-radius_cells,radius_cells+1):
        for dz in range(-radius_cells,radius_cells+1):
            if (ix+dx,iz+dz) in mask:
                return True
    return False

def route_slope_components(region_name,bounds):
    x0,x1,z0,z1=bounds
    by_source=defaultdict(list)
    for ff in faces:
        ia,ib,ic,o,m=ff
        if "FloorSlope" not in o and "FloorSlope" not in m:
            continue
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if not (x0<=cx<=x1 and z0<=cz<=z1):
            continue
        ymin=min(v[1] for v in tri); ymax=max(v[1] for v in tri)
        if ymax<5.5 or ymin>11.0:
            continue
        by_source[(o,m)].append(ff)

    records=[]
    for (o,m),source_faces in sorted(by_source.items()):
        for local_ci,component in enumerate(face_components_by_shared_vertex(source_faces)):
            comp_faces=[source_faces[i] for i in component]
            unique_indices=sorted({vi for ff in comp_faces for vi in ff[:3]})
            model_vertices=[vertices[i] for i in unique_indices]
            project_vertices=[slope_project_point(v) for v in model_vertices]
            local_index={vi:i for i,vi in enumerate(unique_indices)}
            indices=[local_index[vi] for ff in comp_faces for vi in ff[:3]]
            ys=[v[1] for v in model_vertices]
            px=[v[0] for v in project_vertices]; pz=[v[2] for v in project_vertices]
            contacts={}
            for mask_name,(mask,mask_y) in spawn_route_floor_masks.items():
                if not mask_name.startswith(region_name[:3]):
                    continue
                hits=sum(
                    1 for v in model_vertices
                    if near_mask_vertex(v,mask,mask_y)
                )
                if hits:
                    contacts[mask_name]=hits
            # Count exact/near source-Y endpoints separately.
            ybands={
                str(target):sum(1 for y in ys if abs(y-target)<=0.03)
                for target in (6.0,7.5,10.5)
            }
            rec={
                "region":region_name,
                "object":o,
                "material":m,
                "component":local_ci,
                "faces":len(comp_faces),
                "vertices":len(model_vertices),
                "model_y":[round(min(ys),6),round(max(ys),6)],
                "project_bbox":[
                    round(min(px),6),round(min(pz),6),
                    round(max(px),6),round(max(pz),6)
                ],
                "ybands":ybands,
                "contacts":contacts,
                "project_vertices":[
                    [round(x,6),round(y,6),round(z,6)]
                    for x,y,z in project_vertices
                ],
                "indices":indices,
                "model_vertex_set":{
                    (round(v[0],6),round(v[1],6),round(v[2],6))
                    for v in model_vertices
                },
            }
            records.append(rec)
            print(
                f"T21ROUTESLOPE COMPONENT {region_name} obj={o} mat={m} ci={local_ci} "
                f"faces={rec['faces']} verts={rec['vertices']} "
                f"model_y={rec['model_y']} project_bbox={rec['project_bbox']} "
                f"ybands={ybands} contacts={contacts}"
            )
    return records

route_slopes={}
for region_name,bounds in (
    ("POS_ROUTE",(-48,18,22,78)),
    ("NEG_ROUTE",(-18,48,-78,-22)),
):
    route_slopes[region_name]=route_slope_components(region_name,bounds)
    print(
        f"T21ROUTESLOPE SUMMARY {region_name} count={len(route_slopes[region_name])} "
        f"faces={sum(r['faces'] for r in route_slopes[region_name])}"
    )

# Pair exact source components by Temple01 model-space 180-degree symmetry.
pos_records=route_slopes["POS_ROUTE"]
neg_records=route_slopes["NEG_ROUTE"]
used_neg=set()
pair_count=0
for pi,p in enumerate(pos_records):
    mirrored={
        (round(-x,6),round(y,6),round(-z,6))
        for x,y,z in p["model_vertex_set"]
    }
    matches=[
        ni for ni,n in enumerate(neg_records)
        if ni not in used_neg and n["model_vertex_set"]==mirrored
    ]
    if len(matches)==1:
        ni=matches[0]
        used_neg.add(ni)
        pair_count+=1
        print(
            f"T21ROUTESLOPE MIRROR pos={pi} neg={ni} "
            f"pos_obj={p['object']} neg_obj={neg_records[ni]['object']} "
            f"faces={p['faces']} verts={p['vertices']} xor=0"
        )
    elif len(matches)>1:
        raise SystemExit(
            f"T21 route slope audit failed: ambiguous mirror for POS component {pi}: {matches}"
        )
    else:
        print(
            f"T21ROUTESLOPE UNMATCHED_POS pos={pi} obj={p['object']} "
            f"faces={p['faces']} verts={p['vertices']}"
        )

print(
    f"T21ROUTESLOPE MIRROR_SUMMARY pos={len(pos_records)} neg={len(neg_records)} "
    f"paired={pair_count} unmatched_pos={len(pos_records)-pair_count} "
    f"unmatched_neg={len(neg_records)-len(used_neg)}"
)

# Emit compact JSON only for components that actually touch at least two known
# route-floor masks. These are promotion candidates, not automatic promotions.
for side,records in route_slopes.items():
    for ri,rec in enumerate(records):
        if len(rec["contacts"])<2:
            continue
        print(
            "T21ROUTESLOPE CANDIDATE_JSON "
            + side
            + f" {ri} "
            + json.dumps(
                {
                    "object":rec["object"],
                    "material":rec["material"],
                    "vertices":rec["project_vertices"],
                    "indices":rec["indices"],
                    "contacts":rec["contacts"],
                    "model_y":rec["model_y"],
                },
                separators=(",",":")
            )
        )


# T21-D material-agnostic route-connector audit.
#
# FloorSlope material naming did not produce any component that touches two
# known route floors in 3D. Re-audit all common+Turf source triangles in the
# locally verified spawn-side bounds, selecting only non-horizontal,
# non-wall-like components that physically touch at least two known floor masks
# at their measured model-space Y values.
spawn_route_floor_masks["POS_UNDERPASS"]=(underpass_nav["POS_GLASS"][0],3.0)
spawn_route_floor_masks["NEG_UNDERPASS"]=(underpass_nav["NEG_GLASS"][0],3.0)

def component_floor_contacts(model_vertices,region_prefix):
    contacts={}
    for mask_name,(mask,mask_y) in spawn_route_floor_masks.items():
        if not mask_name.startswith(region_prefix):
            continue
        hits=sum(
            1 for v in model_vertices
            if near_mask_vertex(v,mask,mask_y,radius_cells=3,y_tolerance=0.30)
        )
        if hits:
            contacts[mask_name]=hits
    return contacts

def candidate_route_faces(bounds):
    x0,x1,z0,z1=bounds
    grouped=defaultdict(list)
    for ff in faces:
        ia,ib,ic,o,m=ff
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if not (x0<=cx<=x1 and z0<=cz<=z1):
            continue
        ymin=min(v[1] for v in tri); ymax=max(v[1] for v in tri)
        if ymax<2.5 or ymin>12.5:
            continue
        n=tri_normal(tri)
        ny=abs(n[1])
        # Exclude near-horizontal floors and near-vertical walls. Keep a wide
        # band so steep but traversable source ramps are not lost.
        if ny<0.35 or ny>0.985:
            continue
        grouped[(o,m)].append(ff)
    return grouped

agnostic_route_records={}
for region_name,bounds in (
    ("POS_ROUTE",(-48,18,22,78)),
    ("NEG_ROUTE",(-18,48,-78,-22)),
):
    region_prefix=region_name[:3]
    records=[]
    grouped=candidate_route_faces(bounds)
    for (o,m),source_faces in sorted(grouped.items()):
        for local_ci,component in enumerate(face_components_by_shared_vertex(source_faces)):
            comp_faces=[source_faces[i] for i in component]
            unique_indices=sorted({vi for ff in comp_faces for vi in ff[:3]})
            model_vertices=[vertices[i] for i in unique_indices]
            contacts=component_floor_contacts(model_vertices,region_prefix)
            contact_ys={
                spawn_route_floor_masks[name][1]
                for name in contacts
            }
            ys=[v[1] for v in model_vertices]
            if len(contact_ys)<2 or max(ys)-min(ys)<0.50:
                continue
            project_vertices=[slope_project_point(v) for v in model_vertices]
            local_index={vi:i for i,vi in enumerate(unique_indices)}
            indices=[local_index[vi] for ff in comp_faces for vi in ff[:3]]
            normal_ys=[abs(tri_normal([vertices[i] for i in ff[:3]])[1]) for ff in comp_faces]
            xs=[v[0] for v in project_vertices]
            zs=[v[2] for v in project_vertices]
            rec={
                "object":o,
                "material":m,
                "component":local_ci,
                "faces":len(comp_faces),
                "vertices":len(model_vertices),
                "model_y":[round(min(ys),6),round(max(ys),6)],
                "project_bbox":[
                    round(min(xs),6),round(min(zs),6),
                    round(max(xs),6),round(max(zs),6)
                ],
                "normal_y":[
                    round(min(normal_ys),6),
                    round(max(normal_ys),6)
                ],
                "contacts":contacts,
                "model_vertex_set":{
                    (round(v[0],6),round(v[1],6),round(v[2],6))
                    for v in model_vertices
                },
                "project_vertices":[
                    [round(x,6),round(y,6),round(z,6)]
                    for x,y,z in project_vertices
                ],
                "indices":indices,
            }
            records.append(rec)
            print(
                f"T21ROUTECONNECT CANDIDATE {region_name} obj={o} mat={m} "
                f"ci={local_ci} faces={rec['faces']} verts={rec['vertices']} "
                f"model_y={rec['model_y']} normal_y={rec['normal_y']} "
                f"bbox={rec['project_bbox']} contacts={contacts}"
            )
    agnostic_route_records[region_name]=records
    print(
        f"T21ROUTECONNECT SUMMARY {region_name} "
        f"groups={len(grouped)} candidates={len(records)} "
        f"faces={sum(r['faces'] for r in records)}"
    )

pos_connect=agnostic_route_records["POS_ROUTE"]
neg_connect=agnostic_route_records["NEG_ROUTE"]
used_neg=set()
paired=[]
for pi,p in enumerate(pos_connect):
    mirrored={
        (round(-x,6),round(y,6),round(-z,6))
        for x,y,z in p["model_vertex_set"]
    }
    matches=[
        ni for ni,n in enumerate(neg_connect)
        if ni not in used_neg and n["model_vertex_set"]==mirrored
    ]
    if len(matches)==1:
        ni=matches[0]
        used_neg.add(ni)
        paired.append((pi,ni))
        print(
            f"T21ROUTECONNECT MIRROR pos={pi} neg={ni} "
            f"faces={p['faces']} verts={p['vertices']} xor=0 "
            f"pos_obj={p['object']} neg_obj={neg_connect[ni]['object']}"
        )
    elif len(matches)>1:
        raise SystemExit(
            f"T21 route connector audit failed: ambiguous mirror pair for {pi}: {matches}"
        )
    else:
        print(
            f"T21ROUTECONNECT UNMATCHED_POS pos={pi} "
            f"obj={p['object']} faces={p['faces']}"
        )

print(
    f"T21ROUTECONNECT MIRROR_SUMMARY pos={len(pos_connect)} "
    f"neg={len(neg_connect)} paired={len(paired)} "
    f"unmatched_pos={len(pos_connect)-len(paired)} "
    f"unmatched_neg={len(neg_connect)-len(used_neg)}"
)

# Machine-readable payload only for exact mirrored candidates. Promotion still
# requires semantic inspection of object/material and route topology.
for pi,ni in paired:
    for side,idx,rec in (
        ("POS_ROUTE",pi,pos_connect[pi]),
        ("NEG_ROUTE",ni,neg_connect[ni]),
    ):
        print(
            "T21ROUTECONNECT PAIRED_JSON "
            + side
            + f" {idx} "
            + json.dumps(
                {
                    "object":rec["object"],
                    "material":rec["material"],
                    "vertices":rec["project_vertices"],
                    "indices":rec["indices"],
                    "contacts":rec["contacts"],
                    "model_y":rec["model_y"],
                    "normal_y":rec["normal_y"],
                },
                separators=(",",":")
            )
        )


# T21-D first-drop one-way off-mesh-link candidate audit.
#
# Source lips are exact HIGH vector polylines; upper/lower floor masks and Y are
# independently verified Temple01 local geometry. The samples below are
# implementation candidates only. They do not turn the drop into a ramp.
FIRST_DROP_LINK_SAMPLE_SPACING_METERS=2.0
FIRST_DROP_LINK_SEARCH_RADIUS_METERS=1.25
FIRST_DROP_LIPS_PDF={
    "POS":[(620.4,423.12),(664.68,423.12),(664.68,394.2)],
    "NEG":[(221.52,172.08),(177.24,172.08),(177.24,201.0)],
}

def sample_polyline_model(pdf_points,spacing):
    pts=[pdf_to_model(p) for p in pdf_points]
    out=[]
    for a,b in zip(pts,pts[1:]):
        dx=b[0]-a[0]; dz=b[1]-a[1]
        length=math.hypot(dx,dz)
        if length<=1e-9:
            continue
        # Interior samples only: avoid exact corner/end vertices where multiple
        # transition semantics can meet.
        n=max(1,int(math.floor(length/spacing)))
        for i in range(n):
            t=(i+0.5)/n
            out.append((a[0]+dx*t,a[1]+dz*t))
    return out

def nearest_mask_cell(mask,point,max_radius):
    px,pz=point
    r=math.ceil(max_radius/STEP)
    cx=round(px/STEP); cz=round(pz/STEP)
    best=None
    for dx in range(-r,r+1):
        for dz in range(-r,r+1):
            cell=(cx+dx,cz+dz)
            if cell not in mask:
                continue
            x,z=cell_xy(cell)
            d=math.hypot(x-px,z-pz)
            if d<=max_radius and (best is None or d<best[0]):
                best=(d,cell,(x,z))
    return best

first_drop_link_candidates={}
for side in ("POS","NEG"):
    upper_name=f"{side}_SPAWN_HIGH"
    lower_name=f"{side}_FIRST_DROP_LANDING"
    upper_mask,upper_y=spawn_route_floor_masks[upper_name]
    lower_mask,lower_y=spawn_route_floor_masks[lower_name]
    samples=sample_polyline_model(
        FIRST_DROP_LIPS_PDF[side],
        FIRST_DROP_LINK_SAMPLE_SPACING_METERS
    )
    links=[]
    seen=set()
    for si,sample in enumerate(samples):
        upper=nearest_mask_cell(
            upper_mask,sample,FIRST_DROP_LINK_SEARCH_RADIUS_METERS
        )
        lower=nearest_mask_cell(
            lower_mask,sample,FIRST_DROP_LINK_SEARCH_RADIUS_METERS
        )
        if upper is None or lower is None:
            print(
                f"T21FIRSTDROP LINK_REJECT {side} sample={si} "
                f"point=({sample[0]:.6f},{sample[1]:.6f}) "
                f"upper={upper is not None} lower={lower is not None}"
            )
            continue
        key=(upper[1],lower[1])
        if key in seen:
            continue
        seen.add(key)
        ux,uz=upper[2]; lx,lz=lower[2]
        upx,upz=model_to_project((ux,uz))
        lpx,lpz=model_to_project((lx,lz))
        record={
            "sample":si,
            "upper_cell":upper[1],
            "lower_cell":lower[1],
            "upper_distance":upper[0],
            "lower_distance":lower[0],
            "start_project":[round(upx,6),round(upper_y-3.0,6),round(upz,6)],
            "end_project":[round(lpx,6),round(lower_y-3.0,6),round(lpz,6)],
        }
        links.append(record)
        print(
            f"T21FIRSTDROP LINK {side} sample={si} "
            f"upper_cell={upper[1]} lower_cell={lower[1]} "
            f"upper_d={upper[0]:.6f} lower_d={lower[0]:.6f} "
            f"start={record['start_project']} end={record['end_project']}"
        )
    first_drop_link_candidates[side]=links
    print(
        f"T21FIRSTDROP SUMMARY {side} samples={len(samples)} "
        f"accepted={len(links)} rejected={len(samples)-len(links)}"
    )

# The local PDF->model registration is approximate, so independently snapping
# both mirrored lips to nearest 0.125m cells can differ by a few cells even
# though the Temple01 floor masks themselves are exact model-space mirrors.
# Canonicalize the POS links, mirror their cell pairs exactly, and require those
# mirrored cells to exist in the independently extracted NEG masks. Keep the
# independently sampled NEG links as a diagnostic only.
pos_links=first_drop_link_candidates["POS"]
neg_sampled_links=first_drop_link_candidates["NEG"]
if not pos_links or not neg_sampled_links:
    raise SystemExit("T21 first-drop link audit failed: no sampled links")

neg_upper_mask,neg_upper_y=spawn_route_floor_masks["NEG_SPAWN_HIGH"]
neg_lower_mask,neg_lower_y=spawn_route_floor_masks["NEG_FIRST_DROP_LANDING"]
neg_links=[]
missing_mirror=[]
for rec in pos_links:
    upper_cell=(-rec["upper_cell"][0],-rec["upper_cell"][1])
    lower_cell=(-rec["lower_cell"][0],-rec["lower_cell"][1])
    if upper_cell not in neg_upper_mask or lower_cell not in neg_lower_mask:
        missing_mirror.append((upper_cell,lower_cell))
        continue
    ux,uz=cell_xy(upper_cell)
    lx,lz=cell_xy(lower_cell)
    upx,upz=model_to_project((ux,uz))
    lpx,lpz=model_to_project((lx,lz))
    neg_links.append({
        "sample":rec["sample"],
        "upper_cell":upper_cell,
        "lower_cell":lower_cell,
        "upper_distance":None,
        "lower_distance":None,
        "start_project":[round(upx,6),round(neg_upper_y-3.0,6),round(upz,6)],
        "end_project":[round(lpx,6),round(neg_lower_y-3.0,6),round(lpz,6)],
    })

if missing_mirror:
    raise SystemExit(
        f"T21 first-drop link audit failed: mirrored cells absent from NEG masks: {missing_mirror}"
    )

first_drop_link_candidates["NEG_CANONICAL"]=neg_links
pos_pairs={
    (tuple(rec["upper_cell"]),tuple(rec["lower_cell"]))
    for rec in pos_links
}
neg_pairs={
    (tuple(rec["upper_cell"]),tuple(rec["lower_cell"]))
    for rec in neg_links
}
mirrored_pos_pairs={
    ((-u[0],-u[1]),(-l[0],-l[1]))
    for u,l in pos_pairs
}
link_pair_xor=mirrored_pos_pairs ^ neg_pairs
print(
    f"T21FIRSTDROP MIRROR pos={len(pos_pairs)} neg_canonical={len(neg_pairs)} "
    f"neg_sampled={len(neg_sampled_links)} xor={len(link_pair_xor)} "
    f"missing={len(mirrored_pos_pairs-neg_pairs)} "
    f"extra={len(neg_pairs-mirrored_pos_pairs)}"
)
if link_pair_xor:
    raise SystemExit(
        f"T21 first-drop link audit failed: canonical mirrored pair XOR {len(link_pair_xor)}"
    )

for side,links in (
    ("POS",pos_links),
    ("NEG",neg_links),
):
    print(
        "T21FIRSTDROP CANDIDATE_JSON "
        + side
        + " "
        + json.dumps(
            [
                {
                    "start":rec["start_project"],
                    "end":rec["end_project"],
                    "upper_cell":rec["upper_cell"],
                    "lower_cell":rec["lower_cell"],
                }
                for rec in links
            ],
            separators=(",",":")
        )
    )


# T21-D right-small-drop one-way off-mesh-link candidate audit.
#
# Uses the separate HIGH hard edge and independently verified spawn-high /
# right-low masks. POS is canonicalized from the registered source lip; NEG is
# the exact 180-degree model-space mirror and must exist in the NEG masks.
RIGHT_SMALL_DROP_LIPS_PDF={
    "POS":[(664.68,394.2),(702.36,394.2),(702.36,350.76)],
    "NEG":[(177.24,201.0),(139.56,201.0),(139.56,244.44)],
}

right_small_drop_sampled={}
for side in ("POS","NEG"):
    upper_name=f"{side}_SPAWN_HIGH"
    lower_name=f"{side}_RIGHT_LOW"
    upper_mask,upper_y=spawn_route_floor_masks[upper_name]
    lower_mask,lower_y=spawn_route_floor_masks[lower_name]
    samples=sample_polyline_model(
        RIGHT_SMALL_DROP_LIPS_PDF[side],
        FIRST_DROP_LINK_SAMPLE_SPACING_METERS
    )
    links=[]
    seen=set()
    for si,sample in enumerate(samples):
        upper=nearest_mask_cell(
            upper_mask,sample,FIRST_DROP_LINK_SEARCH_RADIUS_METERS
        )
        lower=nearest_mask_cell(
            lower_mask,sample,FIRST_DROP_LINK_SEARCH_RADIUS_METERS
        )
        if upper is None or lower is None:
            print(
                f"T21RIGHTDROP LINK_REJECT {side} sample={si} "
                f"point=({sample[0]:.6f},{sample[1]:.6f}) "
                f"upper={upper is not None} lower={lower is not None}"
            )
            continue
        key=(upper[1],lower[1])
        if key in seen:
            continue
        seen.add(key)
        ux,uz=upper[2]; lx,lz=lower[2]
        upx,upz=model_to_project((ux,uz))
        lpx,lpz=model_to_project((lx,lz))
        record={
            "sample":si,
            "upper_cell":upper[1],
            "lower_cell":lower[1],
            "upper_distance":upper[0],
            "lower_distance":lower[0],
            "start_project":[round(upx,6),round(upper_y-3.0,6),round(upz,6)],
            "end_project":[round(lpx,6),round(lower_y-3.0,6),round(lpz,6)],
        }
        links.append(record)
        print(
            f"T21RIGHTDROP LINK {side} sample={si} "
            f"upper_cell={upper[1]} lower_cell={lower[1]} "
            f"upper_d={upper[0]:.6f} lower_d={lower[0]:.6f} "
            f"start={record['start_project']} end={record['end_project']}"
        )
    right_small_drop_sampled[side]=links
    print(
        f"T21RIGHTDROP SUMMARY {side} samples={len(samples)} "
        f"accepted={len(links)} rejected={len(samples)-len(links)}"
    )

pos_right_links=right_small_drop_sampled["POS"]
neg_right_sampled=right_small_drop_sampled["NEG"]
if not pos_right_links or not neg_right_sampled:
    raise SystemExit("T21 right-small-drop audit failed: no sampled links")

neg_right_upper_mask,neg_right_upper_y=spawn_route_floor_masks["NEG_SPAWN_HIGH"]
neg_right_lower_mask,neg_right_lower_y=spawn_route_floor_masks["NEG_RIGHT_LOW"]
neg_right_links=[]
missing_right_mirror=[]
for rec in pos_right_links:
    upper_cell=(-rec["upper_cell"][0],-rec["upper_cell"][1])
    lower_cell=(-rec["lower_cell"][0],-rec["lower_cell"][1])
    if (
        upper_cell not in neg_right_upper_mask or
        lower_cell not in neg_right_lower_mask
    ):
        missing_right_mirror.append((upper_cell,lower_cell))
        continue
    ux,uz=cell_xy(upper_cell)
    lx,lz=cell_xy(lower_cell)
    upx,upz=model_to_project((ux,uz))
    lpx,lpz=model_to_project((lx,lz))
    neg_right_links.append({
        "sample":rec["sample"],
        "upper_cell":upper_cell,
        "lower_cell":lower_cell,
        "start_project":[
            round(upx,6),round(neg_right_upper_y-3.0,6),round(upz,6)
        ],
        "end_project":[
            round(lpx,6),round(neg_right_lower_y-3.0,6),round(lpz,6)
        ],
    })

if missing_right_mirror:
    raise SystemExit(
        "T21 right-small-drop audit failed: mirrored cells absent from NEG "
        f"masks: {missing_right_mirror}"
    )

pos_right_pairs={
    (tuple(rec["upper_cell"]),tuple(rec["lower_cell"]))
    for rec in pos_right_links
}
neg_right_pairs={
    (tuple(rec["upper_cell"]),tuple(rec["lower_cell"]))
    for rec in neg_right_links
}
mirrored_pos_right_pairs={
    ((-u[0],-u[1]),(-l[0],-l[1]))
    for u,l in pos_right_pairs
}
right_link_pair_xor=mirrored_pos_right_pairs ^ neg_right_pairs
print(
    f"T21RIGHTDROP MIRROR pos={len(pos_right_pairs)} "
    f"neg_canonical={len(neg_right_pairs)} "
    f"neg_sampled={len(neg_right_sampled)} "
    f"xor={len(right_link_pair_xor)}"
)
if right_link_pair_xor:
    raise SystemExit(
        "T21 right-small-drop audit failed: canonical mirrored pair XOR "
        f"{len(right_link_pair_xor)}"
    )

for side,links in (("POS",pos_right_links),("NEG",neg_right_links)):
    print(
        "T21RIGHTDROP CANDIDATE_JSON "
        + side
        + " "
        + json.dumps(
            [
                {
                    "start":rec["start_project"],
                    "end":rec["end_project"],
                    "upper_cell":rec["upper_cell"],
                    "lower_cell":rec["lower_cell"],
                }
                for rec in links
            ],
            separators=(",",":")
        )
    )


# T21-D right-low -> underpass source-native connectivity graph audit.
#
# Recast QA #678 proves the current partial package is disconnected between the
# verified right-low route and the verified glass underpass. Capture evidence
# says the route exists, but does not say it is one ramp. Build a local graph of
# actual Temple01 walkable source components (flat or inclined), excluding
# FloorLine/FloorFence overlays. Adjacency is measured in full model-space 3D.
# This is discovery-only: no node is promoted by this audit alone.
ROUTE_GRAPH_CONNECT_THRESHOLDS=(0.03,0.08,0.18,0.30)
ROUTE_GRAPH_WALK_TOKENS=(
    "FloorConcrete","FloorSlope","FloorGrass","GrassFloor",
    "FloorMetal","FloorRubber","BridgeMetal"
)

def route_graph_nodes(region_name,bounds):
    x0,x1,z0,z1=bounds
    grouped=defaultdict(list)
    for ff in faces:
        ia,ib,ic,o,m=ff
        if not any(t in m for t in ROUTE_GRAPH_WALK_TOKENS):
            continue
        if "FloorLine" in m or "FloorFence" in m:
            continue
        tri=[vertices[i] for i in ff[:3]]
        cx=sum(v[0] for v in tri)/3
        cz=sum(v[2] for v in tri)/3
        if not (x0<=cx<=x1 and z0<=cz<=z1):
            continue
        ys=[v[1] for v in tri]
        if max(ys)<2.5 or min(ys)>8.0:
            continue
        n=tri_normal(tri)
        if abs(n[1])<0.35:
            continue
        grouped[(o,m)].append(ff)

    nodes=[]
    prefix=region_name[:3]
    for (o,m),source_faces in sorted(grouped.items()):
        for local_ci,component in enumerate(face_components_by_shared_vertex(source_faces)):
            comp_faces=[source_faces[i] for i in component]
            unique_indices=sorted({vi for ff in comp_faces for vi in ff[:3]})
            model_vertices=[vertices[i] for i in unique_indices]
            if not model_vertices:
                continue
            xs=[v[0] for v in model_vertices]
            ys=[v[1] for v in model_vertices]
            zs=[v[2] for v in model_vertices]
            contacts={}
            for anchor in (f"{prefix}_RIGHT_LOW",f"{prefix}_UNDERPASS"):
                mask,mask_y=spawn_route_floor_masks[anchor]
                hits=sum(
                    1 for v in model_vertices
                    if near_mask_vertex(
                        v,mask,mask_y,radius_cells=2,y_tolerance=0.22
                    )
                )
                if hits:
                    contacts[anchor]=hits
            node={
                "region":region_name,
                "object":o,
                "material":m,
                "component":local_ci,
                "faces":len(comp_faces),
                "vertices":len(model_vertices),
                "model_vertices":model_vertices,
                "model_triangles":[
                    [vertices[i] for i in ff[:3]] for ff in comp_faces
                ],
                "model_vertex_set":{
                    (round(v[0],6),round(v[1],6),round(v[2],6))
                    for v in model_vertices
                },
                "model_y":[min(ys),max(ys)],
                "bbox":[min(xs),min(zs),max(xs),max(zs)],
                "contacts":contacts,
            }
            nodes.append(node)
    print(
        f"T21ROUTEGRAPH NODES {region_name} groups={len(grouped)} "
        f"nodes={len(nodes)} right_contacts="
        f"{sum(1 for n in nodes if f'{prefix}_RIGHT_LOW' in n['contacts'])} "
        f"underpass_contacts="
        f"{sum(1 for n in nodes if f'{prefix}_UNDERPASS' in n['contacts'])}"
    )
    return nodes

def bbox3_distance(a,b):
    ax0,az0,ax1,az1=a["bbox"]
    bx0,bz0,bx1,bz1=b["bbox"]
    dx=max(0.0,bx0-ax1,ax0-bx1)
    dz=max(0.0,bz0-az1,az0-bz1)
    ay0,ay1=a["model_y"]; by0,by1=b["model_y"]
    dy=max(0.0,by0-ay1,ay0-by1)
    return math.sqrt(dx*dx+dy*dy+dz*dz)

def component_min_vertex_distance(a,b,cutoff):
    if bbox3_distance(a,b)>cutoff:
        return None
    best=None
    # Components are compact after corridor clipping. Early-exit as soon as the
    # threshold is met; exact minimum is only diagnostic.
    for av in a["model_vertices"]:
        for bv in b["model_vertices"]:
            dx=av[0]-bv[0]; dy=av[1]-bv[1]; dz=av[2]-bv[2]
            d=math.sqrt(dx*dx+dy*dy+dz*dz)
            if best is None or d<best:
                best=d
            if d<=cutoff:
                return d
    return best

def route_graph_path(nodes,region_name,threshold):
    prefix=region_name[:3]
    starts=[
        i for i,n in enumerate(nodes)
        if f"{prefix}_RIGHT_LOW" in n["contacts"]
    ]
    goals={
        i for i,n in enumerate(nodes)
        if f"{prefix}_UNDERPASS" in n["contacts"]
    }
    if not starts or not goals:
        return None,{},starts,goals

    adjacency=defaultdict(list)
    edge_distance={}
    for i in range(len(nodes)):
        for j in range(i+1,len(nodes)):
            if bbox3_distance(nodes[i],nodes[j])>threshold:
                continue
            d=component_min_vertex_distance(nodes[i],nodes[j],threshold)
            if d is not None and d<=threshold:
                adjacency[i].append(j)
                adjacency[j].append(i)
                edge_distance[(min(i,j),max(i,j))]=d

    q=deque(starts)
    parent={i:None for i in starts}
    while q:
        cur=q.popleft()
        if cur in goals:
            path=[]
            x=cur
            while x is not None:
                path.append(x)
                x=parent[x]
            path.reverse()
            return path,edge_distance,starts,goals
        for nxt in adjacency[cur]:
            if nxt in parent:
                continue
            parent[nxt]=cur
            q.append(nxt)
    return None,edge_distance,starts,goals

route_graph={}
for region_name,bounds in (
    ("POS_ROUTE_GRAPH",(-30,10,-8,65)),
    ("NEG_ROUTE_GRAPH",(-10,30,-65,8)),
):
    nodes=route_graph_nodes(region_name,bounds)
    route_graph[region_name]=nodes
    for threshold in ROUTE_GRAPH_CONNECT_THRESHOLDS:
        path,edge_distance,starts,goals=route_graph_path(
            nodes,region_name,threshold
        )
        print(
            f"T21ROUTEGRAPH RESULT {region_name} threshold={threshold:.2f} "
            f"starts={len(starts)} goals={len(goals)} "
            f"reachable={path is not None} "
            f"path_nodes={0 if path is None else len(path)}"
        )
        if path is None:
            continue
        for step_i,node_i in enumerate(path):
            node=nodes[node_i]
            prev_d=None
            if step_i>0:
                a=min(path[step_i-1],node_i)
                b=max(path[step_i-1],node_i)
                prev_d=edge_distance.get((a,b))
            print(
                f"T21ROUTEGRAPH PATH {region_name} threshold={threshold:.2f} "
                f"step={step_i} node={node_i} prev_d="
                f"{None if prev_d is None else round(prev_d,6)} "
                f"obj={node['object']} mat={node['material']} "
                f"ci={node['component']} faces={node['faces']} "
                f"verts={node['vertices']} "
                f"y=({node['model_y'][0]:.6f},{node['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in node['bbox']]} "
                f"contacts={node['contacts']}"
            )
        # The tightest successful threshold is the only path needed for
        # promotion analysis.
        break

# Exact model-space symmetry diagnostic for graph nodes. This does not require
# object names to match; it matches source vertex sets.
pos_graph=route_graph["POS_ROUTE_GRAPH"]
neg_graph=route_graph["NEG_ROUTE_GRAPH"]
matched_neg=set()
paired_graph=0
for pi,pnode in enumerate(pos_graph):
    mirrored={
        (round(-x,6),round(y,6),round(-z,6))
        for x,y,z in pnode["model_vertex_set"]
    }
    matches=[
        ni for ni,nnode in enumerate(neg_graph)
        if ni not in matched_neg and nnode["model_vertex_set"]==mirrored
    ]
    if len(matches)==1:
        matched_neg.add(matches[0])
        paired_graph+=1
print(
    f"T21ROUTEGRAPH MIRROR_SUMMARY pos={len(pos_graph)} neg={len(neg_graph)} "
    f"paired={paired_graph} unmatched_pos={len(pos_graph)-paired_graph} "
    f"unmatched_neg={len(neg_graph)-len(matched_neg)}"
)


# T21-D route-graph frontier diagnostics.
#
# The strict graph intentionally stops at 0.30m. If it is disconnected, report
# anchored nodes and the first path found only at larger diagnostic thresholds.
# Such a path is NOT promotable; it exists solely to localize the missing source
# transition or material family.
ROUTE_GRAPH_DIAGNOSTIC_THRESHOLDS=(0.50,0.75,1.00,1.50,2.00,3.00)

for region_name,nodes in route_graph.items():
    prefix=region_name[:3]
    right_anchor=f"{prefix}_RIGHT_LOW"
    under_anchor=f"{prefix}_UNDERPASS"
    for anchor in (right_anchor,under_anchor):
        anchored=[
            (i,n) for i,n in enumerate(nodes)
            if anchor in n["contacts"]
        ]
        print(
            f"T21ROUTEFRONTIER ANCHOR_SUMMARY {region_name} "
            f"anchor={anchor} count={len(anchored)}"
        )
        for i,n in anchored[:30]:
            print(
                f"T21ROUTEFRONTIER ANCHOR {region_name} anchor={anchor} "
                f"node={i} obj={n['object']} mat={n['material']} "
                f"ci={n['component']} faces={n['faces']} verts={n['vertices']} "
                f"y=({n['model_y'][0]:.6f},{n['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in n['bbox']]} "
                f"contacts={n['contacts']}"
            )

    for threshold in ROUTE_GRAPH_DIAGNOSTIC_THRESHOLDS:
        path,edge_distance,starts,goals=route_graph_path(
            nodes,region_name,threshold
        )
        print(
            f"T21ROUTEFRONTIER RELAXED {region_name} threshold={threshold:.2f} "
            f"reachable={path is not None} "
            f"path_nodes={0 if path is None else len(path)}"
        )
        if path is None:
            continue
        for step_i,node_i in enumerate(path):
            n=nodes[node_i]
            prev_d=None
            if step_i>0:
                a=min(path[step_i-1],node_i)
                b=max(path[step_i-1],node_i)
                prev_d=edge_distance.get((a,b))
            print(
                f"T21ROUTEFRONTIER PATH {region_name} threshold={threshold:.2f} "
                f"step={step_i} node={node_i} prev_d="
                f"{None if prev_d is None else round(prev_d,6)} "
                f"obj={n['object']} mat={n['material']} ci={n['component']} "
                f"faces={n['faces']} verts={n['vertices']} "
                f"y=({n['model_y'][0]:.6f},{n['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in n['bbox']]} "
                f"contacts={n['contacts']}"
            )
        break

# Material census for all sufficiently horizontal/inclined active source
# triangles in the positive corridor, independent of the current WALK token
# allow-list. This helps identify a missing walkable material family without
# treating it as walkable automatically.
all_route_materials=defaultdict(lambda: [0,1e30,-1e30,1e30,-1e30,1e30,-1e30])
for ff in faces:
    ia,ib,ic,o,m=ff
    tri=[vertices[i] for i in ff[:3]]
    cx=sum(v[0] for v in tri)/3
    cz=sum(v[2] for v in tri)/3
    if not (-30<=cx<=10 and -8<=cz<=65):
        continue
    ys=[v[1] for v in tri]
    if max(ys)<2.5 or min(ys)>8.0:
        continue
    n=tri_normal(tri)
    if abs(n[1])<0.35:
        continue
    row=all_route_materials[(o,m)]
    row[0]+=1
    row[1]=min(row[1],min(v[0] for v in tri))
    row[2]=max(row[2],max(v[0] for v in tri))
    row[3]=min(row[3],min(ys))
    row[4]=max(row[4],max(ys))
    row[5]=min(row[5],min(v[2] for v in tri))
    row[6]=max(row[6],max(v[2] for v in tri))

for (o,m),row in sorted(
    all_route_materials.items(),
    key=lambda item:(-item[1][0],item[0][1],item[0][0])
)[:120]:
    print(
        f"T21ROUTEMATERIAL faces={row[0]} obj={o} mat={m} "
        f"x=({row[1]:.6f},{row[2]:.6f}) "
        f"y=({row[3]:.6f},{row[4]:.6f}) "
        f"z=({row[5]:.6f},{row[6]:.6f}) "
        f"allowlisted={any(t in m for t in ROUTE_GRAPH_WALK_TOKENS)}"
    )


# Surface-distance cross-check for the right-low -> underpass route graph.
#
# The historical graph above intentionally uses vertex-to-vertex distance. That
# can overstate a gap when a low-poly source component ends on the interior of
# another component's edge/triangle (a T-junction or independently split mesh).
# Keep the old graph for continuity, but independently measure component
# distance against the actual source triangles before deciding that a physical
# gap or off-mesh transition exists.

def route_vsub(a,b):
    return (a[0]-b[0],a[1]-b[1],a[2]-b[2])

def route_vadd(a,b):
    return (a[0]+b[0],a[1]+b[1],a[2]+b[2])

def route_vscale(a,s):
    return (a[0]*s,a[1]*s,a[2]*s)

def route_dot(a,b):
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]

def route_len(a):
    return math.sqrt(route_dot(a,a))

def point_segment_distance_3d(p,a,b):
    ab=route_vsub(b,a)
    den=route_dot(ab,ab)
    if den<=1e-18:
        return route_len(route_vsub(p,a))
    t=max(0.0,min(1.0,route_dot(route_vsub(p,a),ab)/den))
    q=route_vadd(a,route_vscale(ab,t))
    return route_len(route_vsub(p,q))

def point_triangle_distance_3d(p,a,b,c):
    # Closest-point regions from Real-Time Collision Detection.
    ab=route_vsub(b,a); ac=route_vsub(c,a); ap=route_vsub(p,a)
    d1=route_dot(ab,ap); d2=route_dot(ac,ap)
    if d1<=0.0 and d2<=0.0:
        return route_len(ap)

    bp=route_vsub(p,b)
    d3=route_dot(ab,bp); d4=route_dot(ac,bp)
    if d3>=0.0 and d4<=d3:
        return route_len(bp)

    vc=d1*d4-d3*d2
    if vc<=0.0 and d1>=0.0 and d3<=0.0:
        v=d1/(d1-d3)
        q=route_vadd(a,route_vscale(ab,v))
        return route_len(route_vsub(p,q))

    cp=route_vsub(p,c)
    d5=route_dot(ab,cp); d6=route_dot(ac,cp)
    if d6>=0.0 and d5<=d6:
        return route_len(cp)

    vb=d5*d2-d1*d6
    if vb<=0.0 and d2>=0.0 and d6<=0.0:
        w=d2/(d2-d6)
        q=route_vadd(a,route_vscale(ac,w))
        return route_len(route_vsub(p,q))

    va=d3*d6-d5*d4
    if va<=0.0 and (d4-d3)>=0.0 and (d5-d6)>=0.0:
        bc=route_vsub(c,b)
        w=(d4-d3)/((d4-d3)+(d5-d6))
        q=route_vadd(b,route_vscale(bc,w))
        return route_len(route_vsub(p,q))

    denom=va+vb+vc
    if abs(denom)<=1e-18:
        return min(
            point_segment_distance_3d(p,a,b),
            point_segment_distance_3d(p,b,c),
            point_segment_distance_3d(p,c,a),
        )
    v=vb/denom; w=vc/denom
    q=route_vadd(a,route_vadd(route_vscale(ab,v),route_vscale(ac,w)))
    return route_len(route_vsub(p,q))

def segment_segment_distance_3d(p1,q1,p2,q2):
    # Robust closest points on two finite segments.
    eps=1e-15
    d1=route_vsub(q1,p1); d2=route_vsub(q2,p2); r=route_vsub(p1,p2)
    a=route_dot(d1,d1); e=route_dot(d2,d2); f=route_dot(d2,r)
    if a<=eps and e<=eps:
        return route_len(r)
    if a<=eps:
        s=0.0
        t=max(0.0,min(1.0,f/e))
    else:
        c0=route_dot(d1,r)
        if e<=eps:
            t=0.0
            s=max(0.0,min(1.0,-c0/a))
        else:
            b0=route_dot(d1,d2)
            denom=a*e-b0*b0
            s=0.0 if abs(denom)<=eps else max(0.0,min(1.0,(b0*f-c0*e)/denom))
            t=(b0*s+f)/e
            if t<0.0:
                t=0.0
                s=max(0.0,min(1.0,-c0/a))
            elif t>1.0:
                t=1.0
                s=max(0.0,min(1.0,(b0-c0)/a))
    c1=route_vadd(p1,route_vscale(d1,s))
    c2=route_vadd(p2,route_vscale(d2,t))
    return route_len(route_vsub(c1,c2))

def triangle_triangle_distance_3d(ta,tb,cutoff=None):
    best=1e30
    for p in ta:
        best=min(best,point_triangle_distance_3d(p,*tb))
        if cutoff is not None and best<=cutoff:
            return best
    for p in tb:
        best=min(best,point_triangle_distance_3d(p,*ta))
        if cutoff is not None and best<=cutoff:
            return best
    ea=((ta[0],ta[1]),(ta[1],ta[2]),(ta[2],ta[0]))
    eb=((tb[0],tb[1]),(tb[1],tb[2]),(tb[2],tb[0]))
    for a0,a1 in ea:
        for b0,b1 in eb:
            best=min(best,segment_segment_distance_3d(a0,a1,b0,b1))
            if cutoff is not None and best<=cutoff:
                return best
    return best

def component_min_surface_distance(a,b,cutoff):
    if bbox3_distance(a,b)>cutoff:
        return None
    best=1e30
    for ta in a["model_triangles"]:
        for tb in b["model_triangles"]:
            d=triangle_triangle_distance_3d(ta,tb,cutoff)
            if d<best:
                best=d
            if best<=cutoff:
                return best
    return None if best==1e30 else best

def component_min_surface_distance_exact(a,b,search_limit):
    if bbox3_distance(a,b)>search_limit:
        return None
    best=1e30
    for ta in a["model_triangles"]:
        for tb in b["model_triangles"]:
            d=triangle_triangle_distance_3d(ta,tb,None)
            if d<best:
                best=d
    return None if best==1e30 else best

def route_graph_surface_path(nodes,region_name,threshold):
    prefix=region_name[:3]
    starts=[i for i,n in enumerate(nodes) if f"{prefix}_RIGHT_LOW" in n["contacts"]]
    goals={i for i,n in enumerate(nodes) if f"{prefix}_UNDERPASS" in n["contacts"]}
    if not starts or not goals:
        return None,{},starts,goals
    adjacency=defaultdict(list)
    edge_distance={}
    for i in range(len(nodes)):
        for j in range(i+1,len(nodes)):
            if bbox3_distance(nodes[i],nodes[j])>threshold:
                continue
            d=component_min_surface_distance(nodes[i],nodes[j],threshold)
            if d is not None and d<=threshold:
                adjacency[i].append(j); adjacency[j].append(i)
                edge_distance[(i,j)]=d
    q=deque(starts); parent={i:None for i in starts}
    while q:
        cur=q.popleft()
        if cur in goals:
            path=[]; x=cur
            while x is not None:
                path.append(x); x=parent[x]
            path.reverse()
            return path,edge_distance,starts,goals
        for nxt in adjacency[cur]:
            if nxt in parent:
                continue
            parent[nxt]=cur; q.append(nxt)
    return None,edge_distance,starts,goals

for region_name,nodes in route_graph.items():
    for threshold in ROUTE_GRAPH_CONNECT_THRESHOLDS:
        path,edge_distance,starts,goals=route_graph_surface_path(
            nodes,region_name,threshold
        )
        print(
            f"T21ROUTESURFACE RESULT {region_name} threshold={threshold:.2f} "
            f"starts={len(starts)} goals={len(goals)} "
            f"reachable={path is not None} "
            f"path_nodes={0 if path is None else len(path)}"
        )
        if path is None:
            continue
        for step_i,node_i in enumerate(path):
            n=nodes[node_i]
            prev_d=None
            if step_i>0:
                a=min(path[step_i-1],node_i); b=max(path[step_i-1],node_i)
                prev_d=edge_distance.get((a,b))
            print(
                f"T21ROUTESURFACE PATH {region_name} threshold={threshold:.2f} "
                f"step={step_i} node={node_i} prev_d="
                f"{None if prev_d is None else round(prev_d,6)} "
                f"obj={n['object']} mat={n['material']} ci={n['component']} "
                f"faces={n['faces']} verts={n['vertices']} "
                f"y=({n['model_y'][0]:.6f},{n['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in n['bbox']]} "
                f"contacts={n['contacts']}"
            )
        break

    for threshold in ROUTE_GRAPH_DIAGNOSTIC_THRESHOLDS:
        path,edge_distance,starts,goals=route_graph_surface_path(
            nodes,region_name,threshold
        )
        print(
            f"T21ROUTESURFACE RELAXED {region_name} threshold={threshold:.2f} "
            f"reachable={path is not None} "
            f"path_nodes={0 if path is None else len(path)}"
        )
        if path is None:
            continue
        for step_i,node_i in enumerate(path):
            n=nodes[node_i]
            prev_d=None
            if step_i>0:
                a=nodes[path[step_i-1]]; b=n
                prev_d=component_min_surface_distance_exact(
                    a,b,threshold
                )
            print(
                f"T21ROUTESURFACE RELAXED_PATH {region_name} "
                f"threshold={threshold:.2f} step={step_i} node={node_i} "
                f"prev_d={None if prev_d is None else round(prev_d,6)} "
                f"obj={n['object']} mat={n['material']} ci={n['component']} "
                f"faces={n['faces']} verts={n['vertices']} "
                f"y=({n['model_y'][0]:.6f},{n['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in n['bbox']]} "
                f"contacts={n['contacts']}"
            )
        break

    # Cross-check the known relaxed vertex-chain edge-by-edge against source
    # triangle distance. This tells us whether each ~2m vertex gap is a genuine
    # physical separation or only an independently split/T-junction mesh.
    vertex_path,vertex_edges,_,_=route_graph_path(nodes,region_name,2.00)
    if vertex_path is not None:
        for step_i in range(1,len(vertex_path)):
            ai=vertex_path[step_i-1]; bi=vertex_path[step_i]
            a=nodes[ai]; b=nodes[bi]
            vd=vertex_edges.get((min(ai,bi),max(ai,bi)))
            sd=component_min_surface_distance_exact(a,b,3.00)
            print(
                f"T21ROUTESURFACE VERTEX_CHAIN_EDGE {region_name} "
                f"step={step_i-1}->{step_i} "
                f"vertex_d={None if vd is None else round(vd,6)} "
                f"surface_d={None if sd is None else round(sd,6)} "
                f"a={a['object']}::{a['material']}::ci{a['component']} "
                f"b={b['object']}::{b['material']}::ci{b['component']}"
            )


# T21-D excluded-material strict bridge audit.
#
# The surface graph above proves the current walk-material allow-list needs
# 2.00m relaxation before right-low reaches the underpass. Before treating
# those gaps as jumps/off-mesh transitions, inspect only the exact problematic
# edge neighborhoods for source components whose materials were excluded from
# ROUTE_GRAPH_WALK_TOKENS. This remains discovery-only: even a strict geometric
# bridge is not gameplay authority until its material semantics are reviewed.

ROUTE_GAP_STRICT_THRESHOLD=0.30
ROUTE_GAP_LOCAL_MARGIN=2.50
ROUTE_GAP_CANDIDATE_DISTANCE=4.00

def tri_bbox3(tri):
    xs=[p[0] for p in tri]; ys=[p[1] for p in tri]; zs=[p[2] for p in tri]
    return (min(xs),min(ys),min(zs),max(xs),max(ys),max(zs))

def bbox3_expand(box,margin):
    return (
        box[0]-margin,box[1]-margin,box[2]-margin,
        box[3]+margin,box[4]+margin,box[5]+margin
    )

def bbox3_union(a,b):
    return (
        min(a[0],b[0]),min(a[1],b[1]),min(a[2],b[2]),
        max(a[3],b[3]),max(a[4],b[4]),max(a[5],b[5])
    )

def bbox3_intersects(a,b):
    return not (
        a[3]<b[0] or b[3]<a[0] or
        a[4]<b[1] or b[4]<a[1] or
        a[5]<b[2] or b[5]<a[2]
    )

def component_closest_triangle_pair(a,b):
    best=1e30; best_pair=None
    for ta in a["model_triangles"]:
        for tb in b["model_triangles"]:
            d=triangle_triangle_distance_3d(ta,tb,None)
            if d<best:
                best=d; best_pair=(ta,tb)
    return best,best_pair

def route_excluded_semantic(material):
    if "FloorLine" in material:
        return "KNOWN_FLOOR_MARKING_OVERLAY"
    if "FloorFence" in material or "Fence" in material:
        return "KNOWN_FENCE_OR_EDGE"
    if "Glass" in material:
        return "GLASS_OR_GLASS_EDGE"
    if "Pillar" in material:
        return "PILLAR_OR_SUPPORT"
    if "Object" in material or "Megalith" in material or "MetalBox" in material:
        return "OBJECT_OR_PROP"
    if "Floor" in material or "Bridge" in material or "Grass" in material:
        return "FLOOR_NAMED_BUT_NOT_ALLOWLISTED"
    return "NON_FLOOR_MATERIAL"

def local_excluded_nodes(search_box):
    grouped=defaultdict(list)
    for ff in faces:
        ia,ib,ic,o,m=ff
        if any(t in m for t in ROUTE_GRAPH_WALK_TOKENS):
            continue
        tri=[vertices[i] for i in ff[:3]]
        n=tri_normal(tri)
        if abs(n[1])<0.35:
            continue
        if not bbox3_intersects(tri_bbox3(tri),search_box):
            continue
        grouped[(o,m)].append(ff)

    nodes=[]
    for (o,m),source_faces in sorted(grouped.items()):
        for local_ci,component in enumerate(face_components_by_shared_vertex(source_faces)):
            comp_faces=[source_faces[i] for i in component]
            unique_indices=sorted({vi for ff in comp_faces for vi in ff[:3]})
            model_vertices=[vertices[i] for i in unique_indices]
            model_triangles=[
                [vertices[i] for i in ff[:3]] for ff in comp_faces
            ]
            if not model_vertices or not any(
                bbox3_intersects(tri_bbox3(tri),search_box)
                for tri in model_triangles
            ):
                continue
            xs=[v[0] for v in model_vertices]
            ys=[v[1] for v in model_vertices]
            zs=[v[2] for v in model_vertices]
            nodes.append({
                "object":o,
                "material":m,
                "component":local_ci,
                "faces":len(comp_faces),
                "vertices":len(model_vertices),
                "model_vertices":model_vertices,
                "model_triangles":model_triangles,
                "model_y":[min(ys),max(ys)],
                "bbox":[min(xs),min(zs),max(xs),max(zs)],
                "semantic":route_excluded_semantic(m),
            })
    return nodes

def strict_bridge_through_excluded(a,b,candidates,threshold):
    # Search lazily from A rather than precomputing every candidate pair. Most
    # excluded components are nowhere near the 0.30m frontier, so bbox pruning
    # removes them without an expensive triangle-to-triangle comparison.
    graph_nodes=[a,b]+candidates
    edge_distance={}
    q=deque([0]); parent={0:None}
    while q:
        cur=q.popleft()
        if cur==1:
            path=[]; x=cur
            while x is not None:
                path.append(x); x=parent[x]
            path.reverse()
            return path,edge_distance,graph_nodes
        for nxt in range(len(graph_nodes)):
            if nxt==cur or nxt in parent:
                continue
            if {cur,nxt}=={0,1}:
                continue
            if bbox3_distance(graph_nodes[cur],graph_nodes[nxt])>threshold:
                continue
            d=component_min_surface_distance(
                graph_nodes[cur],graph_nodes[nxt],threshold
            )
            if d is None or d>threshold:
                continue
            edge_distance[(min(cur,nxt),max(cur,nxt))]=d
            parent[nxt]=cur
            q.append(nxt)
    return None,edge_distance,graph_nodes

route_gap_excluded_summaries=[]
for region_name,nodes in route_graph.items():
    relaxed_path,_,_,_=route_graph_surface_path(nodes,region_name,2.00)
    if relaxed_path is None:
        print(
            f"T21ROUTEGAPEXCLUDED SUMMARY {region_name} "
            f"relaxed_path_missing=True"
        )
        continue

    for edge_i in range(1,len(relaxed_path)):
        ai=relaxed_path[edge_i-1]; bi=relaxed_path[edge_i]
        a=nodes[ai]; b=nodes[bi]
        gap,best_pair=component_closest_triangle_pair(a,b)
        if gap<=ROUTE_GAP_STRICT_THRESHOLD+1e-9:
            continue
        ta,tb=best_pair
        local_box=bbox3_expand(
            bbox3_union(tri_bbox3(ta),tri_bbox3(tb)),
            ROUTE_GAP_LOCAL_MARGIN
        )
        candidates=local_excluded_nodes(local_box)
        candidates=[
            n for n in candidates
            if (
                bbox3_distance(a,n)<=ROUTE_GAP_CANDIDATE_DISTANCE or
                bbox3_distance(n,b)<=ROUTE_GAP_CANDIDATE_DISTANCE
            )
        ]
        # Candidate ranking is diagnostic only. Use bbox distance here so
        # exhaustive exact triangle distance is reserved for the actual 0.30m
        # strict-bridge BFS below.
        ranked=[]
        for ci,candidate in enumerate(candidates):
            dba=bbox3_distance(a,candidate)
            dbb=bbox3_distance(candidate,b)
            ranked.append((max(dba,dbb),dba+dbb,ci,dba,dbb))
        ranked.sort()

        bridge_path,bridge_edges,bridge_nodes=strict_bridge_through_excluded(
            a,b,candidates,ROUTE_GAP_STRICT_THRESHOLD
        )
        bridge_excluded=(
            [] if bridge_path is None else bridge_path[1:-1]
        )
        summary={
            "region":region_name,
            "edge":edge_i-1,
            "gap":gap,
            "a":a,
            "b":b,
            "candidate_count":len(candidates),
            "bridge_path":bridge_path,
            "bridge_excluded":bridge_excluded,
        }
        route_gap_excluded_summaries.append(summary)
        print(
            f"T21ROUTEGAPEXCLUDED GAP {region_name} edge={edge_i-1} "
            f"gap={gap:.6f} "
            f"a={a['object']}::{a['material']}::ci{a['component']} "
            f"b={b['object']}::{b['material']}::ci{b['component']} "
            f"local_box={[round(v,6) for v in local_box]} "
            f"excluded_candidates={len(candidates)} "
            f"strict_bridge={bridge_path is not None} "
            f"bridge_nodes={0 if bridge_path is None else len(bridge_path)}"
        )
        for rank_i,(_,_,ci,dba,dbb) in enumerate(ranked[:24]):
            n=candidates[ci]
            print(
                f"T21ROUTEGAPEXCLUDED CANDIDATE {region_name} "
                f"edge={edge_i-1} rank={rank_i} "
                f"bbox_da={round(dba,6)} "
                f"bbox_db={round(dbb,6)} "
                f"obj={n['object']} mat={n['material']} ci={n['component']} "
                f"faces={n['faces']} verts={n['vertices']} "
                f"y=({n['model_y'][0]:.6f},{n['model_y'][1]:.6f}) "
                f"bbox={[round(v,6) for v in n['bbox']]} "
                f"semantic={n['semantic']}"
            )
        if bridge_path is not None:
            for pi,node_i in enumerate(bridge_path):
                n=bridge_nodes[node_i]
                if node_i==0:
                    role="ALLOWLIST_A"
                elif node_i==1:
                    role="ALLOWLIST_B"
                else:
                    role="EXCLUDED_SOURCE"
                prev_d=None
                if pi>0:
                    x=min(bridge_path[pi-1],node_i)
                    y=max(bridge_path[pi-1],node_i)
                    prev_d=bridge_edges.get((x,y))
                print(
                    f"T21ROUTEGAPEXCLUDED BRIDGE {region_name} "
                    f"edge={edge_i-1} step={pi} role={role} "
                    f"prev_d={None if prev_d is None else round(prev_d,6)} "
                    f"obj={n['object']} mat={n['material']} "
                    f"ci={n['component']} "
                    f"semantic={n.get('semantic','ALLOWLISTED_WALK')}"
                )

print(
    f"T21ROUTEGAPEXCLUDED SUMMARY gaps={len(route_gap_excluded_summaries)} "
    f"strict_bridges="
    f"{sum(1 for s in route_gap_excluded_summaries if s['bridge_path'] is not None)} "
    f"threshold={ROUTE_GAP_STRICT_THRESHOLD:.2f}"
)


# Conservative second pass: remove only known FloorLine/FloorFence overlays from
# the excluded-material frontier. Keep Glass/Pillar/Object/etc. in the search so
# this audit does not assume their gameplay semantics. If no 0.30m bridge
# survives, the source does not contain an obvious unbound physical walk surface
# in these gap-local neighborhoods.
route_gap_nonoverlay=[]
for region_name,nodes in route_graph.items():
    relaxed_path,_,_,_=route_graph_surface_path(nodes,region_name,2.00)
    if relaxed_path is None:
        continue
    for edge_i in range(1,len(relaxed_path)):
        ai=relaxed_path[edge_i-1]; bi=relaxed_path[edge_i]
        a=nodes[ai]; b=nodes[bi]
        gap,best_pair=component_closest_triangle_pair(a,b)
        if gap<=ROUTE_GAP_STRICT_THRESHOLD+1e-9:
            continue
        ta,tb=best_pair
        local_box=bbox3_expand(
            bbox3_union(tri_bbox3(ta),tri_bbox3(tb)),
            ROUTE_GAP_LOCAL_MARGIN
        )
        candidates=[
            n for n in local_excluded_nodes(local_box)
            if (
                "FloorLine" not in n["material"] and
                "FloorFence" not in n["material"] and
                (
                    bbox3_distance(a,n)<=ROUTE_GAP_CANDIDATE_DISTANCE or
                    bbox3_distance(n,b)<=ROUTE_GAP_CANDIDATE_DISTANCE
                )
            )
        ]
        path,edges,graph_nodes=strict_bridge_through_excluded(
            a,b,candidates,ROUTE_GAP_STRICT_THRESHOLD
        )
        route_gap_nonoverlay.append((region_name,edge_i-1,gap,path))
        print(
            f"T21ROUTEGAPNONOVERLAY GAP {region_name} edge={edge_i-1} "
            f"gap={gap:.6f} candidates={len(candidates)} "
            f"strict_bridge={path is not None} "
            f"bridge_nodes={0 if path is None else len(path)}"
        )
        if path is not None:
            for pi,node_i in enumerate(path):
                n=graph_nodes[node_i]
                role=(
                    "ALLOWLIST_A" if node_i==0 else
                    "ALLOWLIST_B" if node_i==1 else
                    "EXCLUDED_SOURCE"
                )
                prev_d=None
                if pi>0:
                    x=min(path[pi-1],node_i); y=max(path[pi-1],node_i)
                    prev_d=edges.get((x,y))
                print(
                    f"T21ROUTEGAPNONOVERLAY BRIDGE {region_name} "
                    f"edge={edge_i-1} step={pi} role={role} "
                    f"prev_d={None if prev_d is None else round(prev_d,6)} "
                    f"obj={n['object']} mat={n['material']} "
                    f"ci={n['component']} "
                    f"semantic={n.get('semantic','ALLOWLISTED_WALK')}"
                )

print(
    f"T21ROUTEGAPNONOVERLAY SUMMARY gaps={len(route_gap_nonoverlay)} "
    f"strict_bridges={sum(1 for _,_,_,p in route_gap_nonoverlay if p is not None)} "
    f"threshold={ROUTE_GAP_STRICT_THRESHOLD:.2f}"
)
