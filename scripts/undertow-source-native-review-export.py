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
