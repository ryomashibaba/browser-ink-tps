#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
import math
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

for name,pdfpoly in glass_polys.items():
    comp,roofed,keep,seed=roofed_underpass_cells(pdfpoly)
    print(
        f"T21UNDERPASS COVER {name} seed={seed} floor_comp={len(comp)} "
        f"roofed={len(roofed)} linked={len(keep)} area={len(keep)*STEP*STEP:.3f}"
    )
    if not keep:
        continue
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
