#!/usr/bin/env python3
"""F4 source-only Phive inspection: NEVER mutate or authorize gameplay.

Inputs: pre-existing B239 exact FloorLine00 numeric report plus user-owned
PhiveConverter OBJ and material JSON from an independently verified matching
Splatoon 3 v7.2.0 Turf collision asset. No game binaries are bundled.

A matching spatial triangle proves only a POSSIBLE collider in the supplied
file, NOT its provenance, collision enablement for players, 0.30m Recast path,
continuous KCC support or authorized promotion to any gameplay stage.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path

EXPECTED_SHA = "a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046"
EXPECTED_OBJECT = "Fld_Temple01_group21600_1__FloorLine00"
SOURCE_STAGE = "25/17/26/0"
EXPECTED_IDS = {
    "POSITIVE_Z": (37118, 37119),
    "NEGATIVE_Z": (37112, 37113),
}
# The actual original OBJ vertex IDs are pinned by the prior B239 extractor.
# A face index alone is insufficient evidence of the right original triangle.
EXPECTED_VERTICES = {
    "POSITIVE_Z": ((320413, 320414, 320415),
                   (320414, 320416, 320415)),
    "NEGATIVE_Z": ((320401, 320402, 320403),
                   (320402, 320404, 320403)),
}
EXPECTED_SIDE_AREA_M2 = 1.52523399523421
# Negative-only gate: explicit native-layer disable means NOT human support.
# Absence of these strings is not a positive walking/collision certificate.
HUMAN_COLLISION_DISABLED = frozenset({
    "SplPlayer", "SplPlayerHuman", "SplPlayerSquid_Visible",
    "SplPlayerSquid_Invisible", "SplPlayerSquid_NoThroughFence",
})
UNRIDABLE_MATERIAL = frozenset({"Unridable", "GameUnridable"})


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def pinned_original_faces(data: dict) -> dict[str, list[tuple]]:
    if (data.get("version") != "B239_EXACT_FLOORLINE_ONLY_SOURCE_FACES_V1"
        or data.get("sourceSHA256") != EXPECTED_SHA
        or data.get("sourceOnly") is not True
        or data.get("productionAuthorized") is not False
        or data.get("originalStage") != SOURCE_STAGE
        or data.get("opponentRoutesCertified") != "0/12"
        or data.get("originalActiveFaceCount") != 70396):
        raise ValueError("B239_PINNED_ORIGINAL_SOURCE_GATE_FAILED")
    out = {}
    for side, ids in EXPECTED_IDS.items():
        row = data.get("sides", {}).get(side)
        if not isinstance(row, dict) or row.get("sourceObject") != EXPECTED_OBJECT \
                or row.get("realCpuTraversalsCertified") != 0 \
                or row.get("actualRapierSupportCertified") is not False \
                or not isinstance(row.get("sourceAreaSquareMeters"), (int, float)) \
                or not math.isfinite(row["sourceAreaSquareMeters"]) \
                or abs(row["sourceAreaSquareMeters"] - EXPECTED_SIDE_AREA_M2) > 1e-5:
            raise ValueError("B239_FLOORLINE_PROVENANCE_MISSING_" + side)
        faces = row.get("triangles", [])
        if len(faces) != 2 or tuple(f.get("originalFaceIndex") for f in faces) != ids:
            raise ValueError("B239_ORIGINAL_FACE_IDS_DRIFT_" + side)
        triangles = []
        if not isinstance(row.get("sourceMaterial"), str) or not row["sourceMaterial"]:
            raise ValueError("B239_MISSING_ORIGINAL_SOURCE_MATERIAL_" + side)
        for face_index, face in enumerate(faces):
            if (not isinstance(face, dict)
                or tuple(face.get("originalOBJVertexIDs", ())) != EXPECTED_VERTICES[side][face_index]
                or face.get("sourceMaterial") != row["sourceMaterial"]
                or not isinstance(face.get("sourceAreaSquareMeters"), (int, float))
                or not math.isfinite(face["sourceAreaSquareMeters"])):
                raise ValueError("B239_ORIGINAL_MATERIAL_VERTEX_OR_AREA_DRIFT_" + side)
            raw = face.get("vertices")
            if not isinstance(raw, list) or len(raw) != 3 or any(
                not isinstance(v, list) or len(v) != 3 or
                any(not isinstance(x, (int, float)) or not math.isfinite(x) for x in v)
                for v in raw
            ):
                raise ValueError("B239_INVALID_SOURCE_TRIANGLE_" + side)
            tri = tuple(tuple(float(x) for x in v) for v in raw)
            a, b, c = tri
            ab = tuple(b[i] - a[i] for i in range(3))
            ac = tuple(c[i] - a[i] for i in range(3))
            normal = (ab[1]*ac[2]-ab[2]*ac[1],
                      ab[2]*ac[0]-ab[0]*ac[2],
                      ab[0]*ac[1]-ab[1]*ac[0])
            magnitude = math.sqrt(sum(x*x for x in normal))
            area = magnitude / 2
            if (magnitude < 1e-9 or abs(normal[1])/magnitude < .5
                or abs(area - face["sourceAreaSquareMeters"]) > 1e-6):
                raise ValueError("B239_ORIGINAL_TRIANGLE_AREA_OR_NORMAL_DRIFT_" + side)
            triangles.append(tri)
        if abs(sum(f["sourceAreaSquareMeters"] for f in faces) -
               EXPECTED_SIDE_AREA_M2) > 1e-5:
            raise ValueError("B239_SIDE_SUM_AREA_DRIFT_" + side)
        out[side] = triangles
    return out


def original_frame(point: tuple[float, float, float]) -> tuple:
    """Inverse of B238 registered model->project transform, not a new stage transform."""
    x, y, z = point
    scale, theta, tx, tz = .964211, math.radians(26.1160), -.0580, -.1329
    return (tx + scale * (math.cos(theta)*x - math.sin(theta)*z),
            y + 3.0,
            tz + scale * (math.sin(theta)*x + math.cos(theta)*z))


def sample_points(triangle: tuple) -> list[tuple]:
    a, b, c = triangle
    centroid = tuple((a[k] + b[k] + c[k]) / 3 for k in range(3))
    # Center and 3 inner points; avoid unstable exact edge coincidence.
    return [centroid] + [tuple(.8 * p[k] + .2 * centroid[k] for k in range(3))
                         for p in (a, b, c)]


def projected_y(px: float, pz: float, a: tuple, b: tuple, c: tuple) -> float | None:
    ax, az = a[0], a[2]
    ux, uz = b[0] - ax, b[2] - az
    vx, vz = c[0] - ax, c[2] - az
    dx, dz = px - ax, pz - az
    denom = ux * vz - uz * vx
    if abs(denom) < 1e-10:
        return None  # wall / degenerate XZ projection is NOT floor support
    u = (dx * vz - dz * vx) / denom
    v = (ux * dz - uz * dx) / denom
    if u < -1e-6 or v < -1e-6 or u + v > 1 + 1e-6:
        return None
    # Require a floor-ish normal, not a decorative vertical strip.
    aa = (b[0]-a[0], b[1]-a[1], b[2]-a[2])
    bb = (c[0]-a[0], c[1]-a[1], c[2]-a[2])
    ny = aa[2]*bb[0]-aa[0]*bb[2]
    nx = aa[1]*bb[2]-aa[2]*bb[1]
    nz = aa[0]*bb[1]-aa[1]*bb[0]
    norm = math.sqrt(nx*nx+ny*ny+nz*nz)
    if norm < 1e-10 or abs(ny)/norm < .55:
        return None
    return a[1] + u*(b[1]-a[1]) + v*(c[1]-a[1])


def parse_collision_obj(path: Path, target_bounds: list[tuple], margin: float = .18):
    """Stream faces; only retain those near the 4 original target triangles."""
    vertices = [None]
    material = "(unassigned)"
    selected = []
    faces_total = 0
    skipped_nontriangular = 0
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if line.startswith("v "):
                vals = line.split()
                if len(vals) < 4:
                    raise ValueError("INVALID_PHIVE_OBJ_VERTEX")
                vertex = tuple(float(v) for v in vals[1:4])
                if not all(math.isfinite(v) for v in vertex):
                    raise ValueError("NONFINITE_PHIVE_OBJ_VERTEX")
                vertices.append(vertex)
            elif line.startswith("usemtl "):
                material = line[7:].strip()
            elif line.startswith("f "):
                faces_total += 1
                vals = line.split()[1:]
                if len(vals) != 3:
                    skipped_nontriangular += 1
                    continue
                inds = []
                for part in vals:
                    ix = int(part.split("/")[0])
                    if ix < 0:
                        ix += len(vertices)
                    if ix <= 0 or ix >= len(vertices):
                        raise ValueError("PHIVE_OBJ_INVALID_FACE_VERTEX")
                    inds.append(ix)
                tri = tuple(vertices[ix] for ix in inds)
                if not any(all(min(p[k] for p in tri) <= hi[k] + margin and
                                   max(p[k] for p in tri) >= lo[k] - margin
                                   for k in range(3))
                           for lo,hi in target_bounds):
                    continue
                selected.append((material, tri))
    return {"vertices": len(vertices)-1, "faces": faces_total,
            "skippedNontriangular": skipped_nontriangular, "selected": selected}


def parse_materials(materials: object) -> dict:
    """Strictly parse PhiveConverter's documented per-usemtl JSON structure.

    Flags are kept as raw names, not interpreted as positive stage authority.
    """
    if not isinstance(materials, dict) or not materials:
        raise ValueError("PHIVE_MATERIAL_TABLE_MISSING")
    for key, value in materials.items():
        if not isinstance(key, str) or not key or not isinstance(value, dict):
            raise ValueError("PHIVE_MATERIAL_ROW_NOT_OBJECT")
        if "mat_name" in value and not isinstance(value["mat_name"], str):
            raise ValueError("PHIVE_MATERIAL_NAME_INVALID")
        for prop in ("mat_flags", "col_disable_flags"):
            flags = value.get(prop, [])
            if (not isinstance(flags, list) or
                any(not isinstance(flag, str) or not flag for flag in flags)):
                raise ValueError("PHIVE_MATERIAL_FLAGS_INVALID_" + prop)
    return materials


def run(b239: Path, collision_obj: Path, materials_json: Path) -> dict:
    src = json.loads(b239.read_text(encoding="utf-8"))
    faces = pinned_original_faces(src)
    materials = parse_materials(json.loads(materials_json.read_text(encoding="utf-8")))
    prepared = {}
    bounds = []
    for frame in ("stageProject", "originalObj"):
        for side, triangles in faces.items():
            for k, tri in enumerate(triangles):
                pts = tri if frame == "stageProject" else tuple(original_frame(p) for p in tri)
                prepared[(frame, side, k)] = sample_points(pts)
                bounds.append((tuple(min(p[c] for p in pts) for c in range(3)),
                               tuple(max(p[c] for p in pts) for c in range(3))))
    scanned = parse_collision_obj(collision_obj, bounds)
    # A skipped n-gon in an independently converted collision mesh is a
    # completeness gap, never silent evidence that there is no floor there.
    # Only referenced materials near the target are checked; other materials
    # may legitimately belong to far-away objects.
    unknown = {name for name, _ in scanned["selected"] if name not in materials}
    if unknown:
        raise ValueError("PHIVE_TARGET_COLLIDER_MATERIAL_MISSING_" +
                         ",".join(sorted(unknown)))
    out = {}
    for (frame,side,k), points in prepared.items():
        hits = defaultdict(set)
        for material, tri in scanned["selected"]:
            for idx, p in enumerate(points):
                yp = projected_y(p[0], p[2], *tri)
                if yp is not None and abs(yp - p[1]) <= .10:
                    hits[material].add(idx)
        out.setdefault(frame, {}).setdefault(side, []).append({
            "originalFaceIndex": EXPECTED_IDS[side][k],
            "samplePoints": len(points),
            "coveredSamplePoints": len(set().union(*hits.values())) if hits else 0,
            "materialCandidates": [{
                "name": name,
                "samplePoints": len(indices),
                "materialMetadataPresent": True,
                "materialName": materials[name].get("mat_name"),
                "materialFlags": materials[name].get("mat_flags", []),
                "collisionDisableFlags": materials[name].get("col_disable_flags", []),
                "explicitHumanCollisionLayerDisabled": bool(
                    HUMAN_COLLISION_DISABLED.intersection(
                        materials[name].get("col_disable_flags", []))),
                "explicitUnridableMaterial": bool(
                    UNRIDABLE_MATERIAL.intersection(
                        materials[name].get("mat_flags", []))),
                # Four inner probes are not continuous contact, so this
                # flag must never be named a confirmed walkable surface.
                "allFourInteriorSamplesOnThisMaterial": len(indices) == 4,
            } for name, indices in sorted(hits.items())]
        })
    return {
        "schema": "T21_F4_PHIVE_COLLISION_CANDIDATE_READONLY_V1",
        "source": SOURCE_STAGE,
        "originalVisualObject": EXPECTED_OBJECT,
        "visualOriginalSHA256": EXPECTED_SHA,
        "b239ReportSHA256": digest(b239),
        "candidateCollisionObjSHA256": digest(collision_obj),
        "candidateMaterialJsonSHA256": digest(materials_json),
        "candidateCollisionObjVertices": scanned["vertices"],
        "candidateCollisionObjFaces": scanned["faces"],
        "candidateNontriangularObjFacesSkipped": scanned["skippedNontriangular"],
        "collisionObjTriangulationComplete": scanned["skippedNontriangular"] == 0,
        "comparisonCoordinateFrames": out,
        "explicitHumanCollisionLayerDisableIsVetoOnly": True,
        "originalFaceCoverageIsNotContinuousKccSupport": True,
        "collisionAssetSourceVersion": "UNVERIFIED_EXTERNAL_PROVENANCE_REQUIRED",
        "original7_2_0TurfCollisionFlagsVerified": False,
        "floorlinePlayerCollisionAuthorized": False,
        "cpuCapsuleContinuousKccAndNativeRecastCertified": False,
        "naturalCrossTeamRoutesCertified": 0,
        "sourceGeometryOrNavModified": False,
        "runtimePromotionAuthorized": False,
        "officialScoreable": 0,
        "verdict": "HOLD_ONLY_CANDIDATE_GEOMETRY_NO_SOURCE_COLLISION_AUTHORITY",
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--b239", type=Path, required=True,
                   help="Existing B239 numeric-only pin-verified original source report")
    p.add_argument("--phive-obj", type=Path, required=True,
                   help="Independently sourced converted original Phive .bphsh geometry")
    p.add_argument("--phive-materials", type=Path, required=True,
                   help="Matching PhiveConverter material JSON, not guessed flags")
    p.add_argument("--output", type=Path, help="Optional private numeric JSON evidence")
    args = p.parse_args()
    report = run(args.b239, args.phive_obj, args.phive_materials)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"verdict": report["verdict"],
          "collisionObjFaces":report["candidateCollisionObjFaces"],
          "candidateMatchingSamples":sum(row["coveredSamplePoints"]
              for frame in report["comparisonCoordinateFrames"].values()
              for rows in frame.values() for row in rows),
          "runtimePromotionAuthorized": False}, ensure_ascii=False))


if __name__ == "__main__":
    main()
