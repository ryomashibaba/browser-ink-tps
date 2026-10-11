#!/usr/bin/env python3
from __future__ import annotations

import base64
import json
import sys
from pathlib import Path

SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/t21-pass18c-upper-terrain.json")

SELECTED_IDS = [
    "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c5",
    "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c5",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c7",
    "Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2",
    "Fld_Temple01_pCube21595_1__FloorConcrete01|Fld_Temple01_FloorConcrete01|c0",
    "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c11",
    "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c24",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c26",
    "Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9",
    "Fld_Temple01_pCube21595_1__FloorConcrete01|Fld_Temple01_FloorConcrete01|c1",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c6",
    "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c22",
]

payload = json.loads(SOURCE.read_text(encoding="utf-8"))
if payload.get("version") != "PASS18C_SOURCE_NATIVE_V1":
    raise SystemExit("unexpected Pass 18C source version")

by_id = {}
membership = {}
for route_name in ("glass", "grate"):
    for side in ("POSITIVE_Z", "NEGATIVE_Z"):
        route = payload["pass18g"]["routes"][route_name][side]
        reachable = set(route["relaxedReachableComponentIds"])
        for component in route["components"]:
            cid = component["id"]
            by_id[cid] = component
            if cid in reachable:
                membership.setdefault(cid, []).append((route_name, side))

records = []
for index, cid in enumerate(SELECTED_IDS, start=1):
    component = by_id.get(cid)
    if component is None:
        raise SystemExit(f"missing selected source component: {cid}")
    evidence = membership.get(cid, [])
    if not evidence:
        raise SystemExit(f"selected component is no longer Pass18G relaxed-reachable: {cid}")
    if component["areaSquareMeters"] < 8:
        raise SystemExit(f"selected component fell below 8m2 gate: {cid}")
    sides = sorted({side for _, side in evidence})
    if len(sides) != 1:
        raise SystemExit(f"selected component side became ambiguous: {cid}")
    records.append({
        "id": f"source-native-review-{index:02d}",
        "sourceComponentId": cid,
        "sourceMaterial": component["sourceMaterial"],
        "side": sides[0],
        "evidenceRoutes": sorted({route for route, _ in evidence}),
        "areaSquareMeters": component["areaSquareMeters"],
        "yRange": component["yRange"],
        "vertices": component["mesh"]["vertices"],
    })


# A second, stricter visual-only batch selected from the Pass18G local
# candidate inventory. Source triangle geometry/Y is retained exactly.
# LOCAL candidate identity does NOT prove gameplay connectivity.
SUPPLEMENT_PAIRS = [
    ("Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c8",
     "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c9"),
    ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15",
     "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13"),
    ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12",
     "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17"),
    ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c14",
     "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c16"),
    ("Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c10",
     "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c19"),
]

import math

def supplement_centroid_xz(c):
    vs = c["mesh"]["vertices"]
    return (sum(v[0] for v in vs)/len(vs), sum(v[2] for v in vs)/len(vs))

supplement_records = []
seen_supplement = set()
for pair_index, (pos_id, neg_id) in enumerate(SUPPLEMENT_PAIRS, start=1):
    pair = []
    for side, cid in (("POSITIVE_Z", pos_id), ("NEGATIVE_Z", neg_id)):
        c = by_id.get(cid)
        if c is None:
            raise SystemExit(f"missing supplemental source candidate {cid}")
        if cid in seen_supplement or cid in SELECTED_IDS:
            raise SystemExit(f"duplicate supplemental source candidate {cid}")
        seen_supplement.add(cid)
        if c["areaSquareMeters"] < 8:
            raise SystemExit(f"supplement candidate below area threshold: {cid}")
        if len(c["mesh"]["vertices"]) % 3:
            raise SystemExit(f"nontriangular supplement: {cid}")
        if any((not math.isfinite(v) for point in c["mesh"]["vertices"] for v in point)):
            raise SystemExit(f"nonfinite supplement: {cid}")
        candidate_routes = sorted({
            route for route in ("glass", "grate")
            if any(
                item["id"] == cid
                for item in payload["pass18g"]["routes"][route][side]["components"]
            )
        })
        if not candidate_routes:
            raise SystemExit(f"supplement candidate missing side-specific Pass18G local inventory: {cid}")
        pair.append(c)
        supplement_records.append({
            "id": f"source-native-supplement-{pair_index:02d}-{side.lower()}",
            "pairId": pair_index,
            "sourceComponentId": cid,
            "sourceMaterial": c["sourceMaterial"],
            "side": side,
            "evidenceRoutes": candidate_routes,
            "areaSquareMeters": c["areaSquareMeters"],
            "yRange": c["yRange"],
            "vertices": c["mesh"]["vertices"],
            "routeMembershipAuthority": (
                "PASS18G_RELAXED_DISCOVERY_ONLY" if cid in membership
                else "PASS18G_LOCAL_CANDIDATE_ONLY"
            )
        })
    p, n = pair
    if abs(p["areaSquareMeters"] - n["areaSquareMeters"]) > 1e-6:
        raise SystemExit(f"area asymmetry in supplement pair {pair_index}")
    if max(abs(a-b) for a,b in zip(p["yRange"],n["yRange"])) > 1e-6:
        raise SystemExit(f"Y asymmetry in supplement pair {pair_index}")
    pcx, pcz = supplement_centroid_xz(p)
    ncx, ncz = supplement_centroid_xz(n)
    if math.hypot(pcx+ncx-0.229368288528164,
                  pcz+ncz-0.194564295456822) > 0.005:
        raise SystemExit(f"geometry centroids do not mirror in supplement pair {pair_index}")

supplement = {
    "sourceAuditVersion": payload["version"],
    "discoveryPass": "18G",
    "reviewOnly": True,
    "runtimePromotionAuthorized": False,
    "selectionRule": "PAIRED_5_LOCAL_SOURCE_CONTOURS_INSIDE_HARD_SILHOUETTE",
    "pairCount": len(SUPPLEMENT_PAIRS),
    "meshCount": len(supplement_records),
    "records": supplement_records,
}
supplement_raw = json.dumps(supplement, separators=(",", ":")).encode("utf-8")
print("T21SOURCE_NATIVE_SUPPLEMENT_B64=" + base64.b64encode(supplement_raw).decode("ascii"))
print(f"T21SOURCE_NATIVE_SUPPLEMENT count={len(supplement_records)} json_bytes={len(supplement_raw)}")

out = {
    "sourceAuditVersion": payload["version"],
    "discoveryPass": "18G",
    "reviewOnly": True,
    "runtimePromotionAuthorized": False,
    "selectionRule": "BALANCED_8_PLUS_8_PASS18G_RELAXED_REACHABLE_AREA_GTE_8_INSIDE_HARD_SILHOUETTE_NONSPAWN",
    "meshCount": len(records),
    "records": records,
}
raw = json.dumps(out, separators=(",", ":")).encode("utf-8")
print("T21SOURCE_NATIVE_EXPORT_B64=" + base64.b64encode(raw).decode("ascii"))
print(f"T21SOURCE_NATIVE_EXPORT count={len(records)} json_bytes={len(raw)}")
