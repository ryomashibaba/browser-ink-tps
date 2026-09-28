#!/usr/bin/env python3
from __future__ import annotations
from collections import defaultdict
from pathlib import Path
import math, sys

if len(sys.argv) != 3:
    raise SystemExit("usage: undertow-stage-source-identity-audit.py TEMPLE_OBJ NAGASAKI_OBJ")

WATER_TOKENS=("water","sea","ocean","lakewater","dvwater")

def parse(path: Path):
    vertices=[None]; faces=[]; obj=""; mat=""
    with path.open("r",encoding="utf-8",errors="replace") as fh:
        for line in fh:
            if line.startswith("o "): obj=line[2:].strip()
            elif line.startswith("usemtl "): mat=line[7:].strip()
            elif line.startswith("v "):
                q=line.split(); vertices.append(tuple(map(float,q[1:4])))
            elif line.startswith("f "):
                ids=[int(tok.split("/")[0]) for tok in line.split()[1:]]
                for i in range(1,len(ids)-1):
                    faces.append((ids[0],ids[i],ids[i+1],obj,mat))
    return vertices,faces

def normal(a,b,c):
    ux,uy,uz=b[0]-a[0],b[1]-a[1],b[2]-a[2]
    vx,vy,vz=c[0]-a[0],c[1]-a[1],c[2]-a[2]
    nx=uy*vz-uz*vy; ny=uz*vx-ux*vz; nz=ux*vy-uy*vx
    ln=math.sqrt(nx*nx+ny*ny+nz*nz)
    return (0,0,0) if ln<1e-12 else (nx/ln,ny/ln,nz/ln)

def xz_area(a,b,c):
    return abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))*0.5

def key(p):
    return (round(p[0],4),round(p[1],4),round(p[2],4))

def inspect(label,path):
    vertices,faces=parse(path)
    water=[]
    pairs=defaultdict(int)
    for ia,ib,ic,o,m in faces:
        if not any(t in (o+" "+m).lower() for t in WATER_TOKENS):
            continue
        a,b,c=vertices[ia],vertices[ib],vertices[ic]
        n=normal(a,b,c)
        pairs[(o,m)]+=1
        if abs(n[1])>=0.8:
            water.append((a,b,c,o,m))
    print(f"T21SOURCEID {label} total_faces={len(faces)} explicit_horizontal_water_faces={len(water)}")
    for (o,m),n in sorted(pairs.items(),key=lambda kv:-kv[1])[:30]:
        print(f"T21SOURCEID WATERPAIR {label} faces={n} obj={o} mat={m}")

    edges=defaultdict(list)
    for i,(a,b,c,o,m) in enumerate(water):
        pts=[key(a),key(b),key(c)]
        for u,v in ((pts[0],pts[1]),(pts[1],pts[2]),(pts[2],pts[0])):
            edges[tuple(sorted((u,v)))].append(i)
    adj=[set() for _ in water]
    for owners in edges.values():
        if len(owners)<2: continue
        for i in owners:
            for j in owners:
                if i!=j: adj[i].add(j)

    seen=set(); comps=[]
    for i in range(len(water)):
        if i in seen: continue
        stack=[i]; seen.add(i); cc=[]
        while stack:
            j=stack.pop(); cc.append(j)
            for k in adj[j]:
                if k not in seen:
                    seen.add(k); stack.append(k)
        comps.append(cc)
    comps.sort(key=lambda cc:-sum(xz_area(*water[i][:3]) for i in cc))

    summaries=[]
    for ci,cc in enumerate(comps):
        pts=[p for i in cc for p in water[i][:3]]
        xs=[p[0] for p in pts]; ys=[p[1] for p in pts]; zs=[p[2] for p in pts]
        area=sum(xz_area(*water[i][:3]) for i in cc)
        row=(ci,area,min(xs),max(xs),min(zs),max(zs),min(ys),max(ys))
        summaries.append(row)
        if ci<24:
            print(
                f"T21SOURCEID WATERCOMP {label} id={ci} area={area:.6f} "
                f"x=({row[2]:.3f},{row[3]:.3f}) z=({row[4]:.3f},{row[5]:.3f}) "
                f"y=({row[6]:.3f},{row[7]:.3f}) span=({row[3]-row[2]:.3f},{row[5]-row[4]:.3f})"
            )
    return summaries

temple=inspect("TEMPLE01",Path(sys.argv[1]))
nagasaki=inspect("NAGASAKI03",Path(sys.argv[2]))

# Intrinsic metric dimensions of one frozen 6-vertex Sunfish Undertow water polygon.
pdf=[(556.8,444.72),(598.8,444.72),(598.8,426.12),(561.36,426.12),(561.36,430.68),(556.8,430.68)]
def poly_area(poly):
    return abs(sum(poly[i][0]*poly[(i+1)%len(poly)][1]-poly[(i+1)%len(poly)][0]*poly[i][1] for i in range(len(poly)))*0.5)
vec_area=poly_area(pdf)/(4.8*4.8)
xs=[p[0] for p in pdf]; zs=[p[1] for p in pdf]
vec_span=((max(xs)-min(xs))/4.8,(max(zs)-min(zs))/4.8)
print(f"T21SOURCEID VECTOR_WATER area={vec_area:.6f} span=({vec_span[0]:.6f},{vec_span[1]:.6f})")

ranked=[]
for row in nagasaki:
    ci,area,x0,x1,z0,z1,y0,y1=row
    dims=sorted((x1-x0,z1-z0)); vd=sorted(vec_span)
    de=abs(dims[0]-vd[0])+abs(dims[1]-vd[1])
    ae=abs(area-vec_area)
    ranked.append((de+0.25*ae,ci,de,ae,y0,y1,x1-x0,z1-z0,area))
for score,ci,de,ae,y0,y1,sx,sz,area in sorted(ranked)[:12]:
    print(
        f"T21SOURCEID MATCH NAGASAKI03 id={ci} score={score:.6f} dim_error={de:.6f} "
        f"area_error={ae:.6f} y=({y0:.3f},{y1:.3f}) span=({sx:.3f},{sz:.3f}) area={area:.6f}"
    )

print(
    "T21SOURCEID AUTHORITY "
    f"temple_explicit_water={str(bool(temple)).lower()} "
    f"nagasaki_explicit_water={str(bool(nagasaki)).lower()} "
    "promotion_authorized=false"
)
