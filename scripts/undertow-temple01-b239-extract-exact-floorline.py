#!/usr/bin/env python3
"""B239: retain ONLY exact original OBJ source faces from freshly SHA-pinned B238 output.

The upstream B238 scan verifies 43,263,289 bytes / exact SHA256 *before*
creating the input report. No source OBJ, synthetic vertex or inferred bridge
is exported. This output is numerical provenance for isolated native QA.
"""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path

PIN = "a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046"
OBJECT = "Fld_Temple01_group21600_1__FloorLine00"
EXPECTED = {
    "POSITIVE_Z": [(37118, [320413, 320414, 320415]),
                   (37119, [320414, 320416, 320415])],
    "NEGATIVE_Z": [(37112, [320401, 320402, 320403]),
                   (37113, [320402, 320404, 320403])]
}

def extract(report: dict) -> dict:
    if (report.get("sha256") != PIN or not report.get("fullOriginalObjPassed")
        or report.get("sourceBytes") != 43263289
        or report.get("wholeOriginalSourceVerticesParsed") != 375948
        or report.get("wholeOriginalSourceActiveTrianglesParsed") != 70396
        or report.get("componentScope") !=
           "EXACT_ORIGINAL_OBJ_EDGE_IDS_SAME_OBJECT_AND_MATERIAL_NOT_VERTEX_ONLY"
        or report.get("runtimePromotionAuthorized") is not False
        or report.get("cpuOrRecastGameplayPathAuthenticated") is not False
        or report.get("originalStage") != "25/17/26/0"
        or report.get("originalOpponentPathsCertified") != "0/12"):
        raise ValueError("B239_SOURCE_PIN_OR_AUTHORITY_FAILED")
    sides = {}
    for side, expected in EXPECTED.items():
        candidates = [
            c for c in report["sides"][side]["closestConnectedOriginalComponentCandidates"]
            if c.get("geometricDoubleContactWithin035")
            and c.get("originalSourceObjects") == [OBJECT]
            and c.get("sourceFloorFacingTriangleCount") == 2
            and c.get("originalObjMaterialEdgeConnectedFaceCount") == 2
        ]
        if len(candidates) != 1:
            raise ValueError("B239_EXACT_FLOORLINE_COMPONENT_MISSING_" + side)
        c = candidates[0]
        original = c.get("completeExactOriginalCandidateFaceEvidence", [])
        actual = [(f["originalActiveSourceFaceIndex"], f["originalOBJVertexIDs"])
                  for f in original]
        if actual != expected or len({f["sourceMaterial"] for f in original}) != 1:
            raise ValueError("B239_OBJ_FACE_ID_MATERIAL_DRIFT_" + side)
        shared = set(expected[0][1]) & set(expected[1][1])
        if len(shared) != 2:
            raise ValueError("B239_NOT_EXACT_ORIGINAL_SHARED_EDGE_" + side)
        triangles = []
        total_area = 0.
        for f in original:
            v = f["actualOriginalTriangleProjectXYZ"]
            if (len(v) != 3 or any(len(p) != 3 or
                                   any(not math.isfinite(x) for x in p)
                                   for p in v)):
                raise ValueError("B239_NONFINITE_OR_INVALID_SOURCE_FACE_" + side)
            a, b, d = v
            ab = [b[i]-a[i] for i in range(3)]
            ad = [d[i]-a[i] for i in range(3)]
            cross = [ab[1]*ad[2]-ab[2]*ad[1],
                     ab[2]*ad[0]-ab[0]*ad[2],
                     ab[0]*ad[1]-ab[1]*ad[0]]
            n = math.sqrt(sum(x*x for x in cross))
            if (n < 1e-12 or abs(cross[1]/n) < .5
                or abs(n/2-f["triangle3DAreaSquareMeters"]) > 1e-7
                or abs(cross[1]/n-f["unitNormalY"]) > 1e-7
                or f["sourceObject"] != OBJECT):
                raise ValueError("B239_SOURCE_NORMAL_WINDING_OR_AREA_DRIFT_" + side)
            total_area += n/2
            triangles.append(dict(
                originalFaceIndex=f["originalActiveSourceFaceIndex"],
                originalOBJVertexIDs=f["originalOBJVertexIDs"],
                sourceMaterial=f["sourceMaterial"], vertices=v,
                signedUnitNormalY=cross[1]/n, sourceAreaSquareMeters=n/2))
        if abs(total_area-1.52523399523421) > 1e-5:
            raise ValueError("B239_SOURCE_AREA_DRIFT_" + side)
        if (not 0 <= c["rightLow"]["distanceMeters"] <= .035
            or not .30 <= c["slopeTop"]["distanceMeters"] <= .35):
            raise ValueError("B239_SOURCE_BOUNDARY_WITNESS_DRIFT_" + side)
        sides[side] = dict(sourceObject=OBJECT, sourceAreaSquareMeters=total_area,
            sourceMaterial=original[0]["sourceMaterial"], triangles=triangles,
            rightLowWitness=c["rightLow"], slopeTopWitness=c["slopeTop"],
            actualRapierSupportCertified=False, realCpuTraversalsCertified=0)
    return dict(version="B239_EXACT_FLOORLINE_ONLY_SOURCE_FACES_V1",
        sourceSHA256=PIN, originalActiveFaceCount=70396, sides=sides,
        sourceOnly=True, productionAuthorized=False,
        originalStage="25/17/26/0", opponentRoutesCertified="0/12",
        originalSourceObjIncluded=False)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--in-report", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()
    result = extract(json.loads(args.in_report.read_text(encoding="utf8")))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2), encoding="utf8")
    print("B239_AUTHENTIC_SOURCE_FACE_RECONSTRUCTION", json.dumps({
        "sourceSHA256": PIN,
        "sides": {s: {
            "originalFaceIDs": [t["originalFaceIndex"] for t in v["triangles"]],
            "signedUnitNormalY": [t["signedUnitNormalY"] for t in v["triangles"]],
            "sourceArea": v["sourceAreaSquareMeters"]
        } for s, v in result["sides"].items()},
        "sourceOBJIncluded": False, "physicalSupportCertified": False,
        "productionAuthorized": False}))

if __name__ == "__main__":
    main()
