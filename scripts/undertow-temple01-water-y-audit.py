#!/usr/bin/env python3
from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import math
import sys

OBJ = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/kitrix-lfs/Vss_Temple01.obj")
STEP = 0.125
BIN = 2.0
HORIZONTAL_NY = 0.85
PROJECT_Y_OFFSET = -3.0

# Exact Sunfish Turf vector polygons already frozen in UndertowSpillwayVectorBlueprint.ts.
WATER_PDF = {
    "TEAM_A": [
        (556.8, 444.72),
        (598.8, 444.72),
        (598.8, 426.12),
        (561.36, 426.12),
        (561.36, 430.68),
        (556.8, 430.68),
    ],
    "TEAM_B": [
        (243.12, 150.48),
        (243.12, 169.08),
        (280.56, 169.08),
        (280.56, 164.52),
        (285.12, 164.52),
        (285.12, 150.48),
    ],
}

# Frozen vector->project calibration + HIGH local Temple01 registration.
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

def pdf_to_project(pt):
    dx=pt[0]-ORIGIN[0]
    dy=pt[1]-ORIGIN[1]
    return (
        (dx*xdir[0]+dy*xdir[1])/4.8,
        (dx*zdir[0]+dy*zdir[1])/4.8,
    )

def project_to_model(pt):
    x,z=pt
    return (
        REG_SCALE*(REG_C*x-REG_S*z)+REG_TX,
        REG_SCALE*(REG_S*x+REG_C*z)+REG_TZ,
    )

def inside_poly(x,z,poly):
    inside=False
    j=len(poly)-1
    for i in range(len(poly)):
        xi,zi=poly[i]
        xj,zj=poly[j]
        if ((zi>z)!=(zj>z)) and (
            x < (xj-xi)*(z-zi)/(zj-zi+1e-30)+xi
        ):
            inside=not inside
        j=i
    return inside

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
        elif line.startswith("f "):
            ids=[int(tok.split("/")[0]) for tok in line.split()[1:]]
            for i in range(1,len(ids)-1):
                faces.append((ids[0],ids[i],ids[i+1],obj,mat))

def tri_normal(tri):
    a,b,c=tri
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy
    ny=uz*vx-ux*vz
    nz=ux*vy-uy*vx
    n=math.sqrt(nx*nx+ny*ny+nz*nz)
    return (nx/n,ny/n,nz/n) if n>1e-12 else (0.0,0.0,0.0)

def contains_xz(x,z,tri):
    (x1,_,z1),(x2,_,z2),(x3,_,z3)=tri
    den=(z2-z3)*(x1-x3)+(x3-x2)*(z1-z3)
    if abs(den)<1e-12:
        return False
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

def source_class(name):
    if name.startswith("Fld_Temple01_"):
        return "COMMON"
    if name.startswith("FldObj_Temple01_PntSet_"):
        return "TURF_PNTSET"
    return "OTHER"

bins=defaultdict(list)
for fi,f in enumerate(faces):
    tri=[vertices[i] for i in f[:3]]
    xs=[p[0] for p in tri]
    zs=[p[2] for p in tri]
    for ix in range(math.floor(min(xs)/BIN),math.floor(max(xs)/BIN)+1):
        for iz in range(math.floor(min(zs)/BIN),math.floor(max(zs)/BIN)+1):
            bins[(ix,iz)].append(fi)

def candidates(x,z):
    return bins.get((math.floor(x/BIN),math.floor(z/BIN)),())

def y_bucket(y):
    # 5 cm buckets are much tighter than the 1.5 m authored vertical grid
    # but tolerant of tiny export noise.
    return round(y/0.05)*0.05

results={}
for side,pdfpoly in WATER_PDF.items():
    poly=[project_to_model(pdf_to_project(p)) for p in pdfpoly]
    xmin=min(p[0] for p in poly)
    xmax=max(p[0] for p in poly)
    zmin=min(p[1] for p in poly)
    zmax=max(p[1] for p in poly)

    sample_cells=[]
    bucket_cells=defaultdict(set)
    bucket_sources=defaultdict(lambda: defaultdict(set))
    bucket_objects=defaultdict(lambda: defaultdict(int))
    exact_hits=[]

    for ix in range(math.floor(xmin/STEP),math.ceil(xmax/STEP)+1):
        x=ix*STEP
        for iz in range(math.floor(zmin/STEP),math.ceil(zmax/STEP)+1):
            z=iz*STEP
            if not inside_poly(x,z,poly):
                continue
            cell=(ix,iz)
            sample_cells.append(cell)
            seen_face=set()
            for fi in candidates(x,z):
                if fi in seen_face:
                    continue
                seen_face.add(fi)
                ia,ib,ic,o,m=faces[fi]
                tri=[vertices[ia],vertices[ib],vertices[ic]]
                n=tri_normal(tri)
                if abs(n[1]) < HORIZONTAL_NY or not contains_xz(x,z,tri):
                    continue
                y=interp_y(x,z,tri)
                b=y_bucket(y)
                bucket_cells[b].add(cell)
                bucket_sources[b][source_class(o)].add(cell)
                bucket_objects[b][(o,m)]+=1
                exact_hits.append((cell,y,o,m,source_class(o)))

    total=len(sample_cells)
    rows=[]
    for b,cells in bucket_cells.items():
        coverage=len(cells)/total if total else 0.0
        rows.append((coverage,b,len(cells)))
    rows.sort(reverse=True)

    print(
        f"T21WATERY REGION {side} cells={total} "
        f"model_poly={[tuple(round(v,4) for v in p) for p in poly]} "
        f"bbox=({xmin:.4f},{zmin:.4f})..({xmax:.4f},{zmax:.4f})"
    )
    for coverage,b,count in rows[:20]:
        source_cov={
            k:len(v)/total if total else 0.0
            for k,v in bucket_sources[b].items()
        }
        top_objects=sorted(
            bucket_objects[b].items(),
            key=lambda kv:-kv[1]
        )[:8]
        print(
            f"T21WATERY Y {side} model_y={b:.3f} project_y={b+PROJECT_Y_OFFSET:.3f} "
            f"cells={count} coverage={coverage:.6f} "
            f"source_coverage={{{', '.join(f'{k}:{v:.6f}' for k,v in sorted(source_cov.items()))}}} "
            f"top={[(o,m,n) for (o,m),n in top_objects]}"
        )
    results[side]={"total":total,"rows":rows,"bucket_cells":bucket_cells}

# Identify only geometry candidates that independently cover most of BOTH exact
# mapped water polygons at the same model Y. This is candidate discovery, not
# automatic visual-water authority: object/material semantics are still required.
a=results["TEAM_A"]
b=results["TEAM_B"]
shared=[]
for cov_a,y,count_a in a["rows"]:
    count_b=len(b["bucket_cells"].get(y,set()))
    cov_b=count_b/b["total"] if b["total"] else 0.0
    if cov_a>=0.80 and cov_b>=0.80:
        shared.append((min(cov_a,cov_b),y,cov_a,cov_b,count_a,count_b))
shared.sort(reverse=True)
print(
    "T21WATERY SHARED_CANDIDATES "
    + (
        str([
            {
                "model_y":round(y,3),
                "project_y":round(y+PROJECT_Y_OFFSET,3),
                "coverage_a":round(ca,6),
                "coverage_b":round(cb,6),
            }
            for _,y,ca,cb,_,_ in shared[:12]
        ])
        if shared else "[]"
    )
)
print(
    "T21WATERY AUTHORITY candidate_discovery_only=true "
    "exact_visual_water_y_promoted=false reason=geometry_without_water_render_semantics_is_insufficient"
)
