#!/usr/bin/env python3
"""Verify and extract the exact current Sunfish Undertow Splat Zones vectors.

Research-only T21 audit helper. It downloads the public current PDF, pins its
byte identity, verifies common anchors against the existing Turf coordinate
frame, and verifies the two dash-dot objective rings from native vector
fragments. It never traces raster pixels and never mutates runtime geometry.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import pathlib
import sys
import urllib.request

import fitz  # PyMuPDF

DEFAULT_URL = (
    "https://note.com/api/v2/attachments/download/"
    "71d47d4e3fe3f2a041aa1af50a6ede14"
)
EXPECTED_BYTES = 112898
EXPECTED_SHA256 = "ae2c24c3cc0ed09d5711e229deb7fb6535c3ef6505ea7dead1aca5e69c4d1596"
EXPECTED_PAGE = (841.92, 595.32)
POINTS_PER_PROJECT_METER = 4.8

TURF_OUTER_ANCHORS = [
    (340.56,119.88),(285.12,119.88),(285.12,89.28),(258.36,89.28),
    (243.12,104.64),(243.12,119.88),(109.44,119.88),(70.68,158.64),
    (70.68,362.28),(109.8,408.96),(259.8,408.96),(259.8,444.72),
    (336.0,444.72),(336.0,414.84),(345.36,414.84),(345.36,444.72),
    (393.6,444.72),(393.6,408.96),(406.08,408.96),(406.08,444.72),
    (501.36,444.72),(501.36,475.32),(556.8,475.32),(556.8,505.92),
    (583.56,505.92),(598.8,490.56),(598.8,475.32),(732.48,475.32),
    (771.24,436.56),(771.24,232.92),(732.12,186.24),(582.12,186.24),
    (582.12,150.48),(505.92,150.48),(505.92,180.36),(496.56,180.36),
    (496.56,150.48),(448.32,150.48),(448.32,186.24),(435.84,186.24),
    (435.84,150.48),(340.56,150.48),
]
MODE_SPECIFIC_OUTER_ANCHOR_INDICES = {9, 30}

NEGATIVE_Z_ZONE = [
    (368.52,230.28),(426.24,230.28),(426.24,282.84),
    (390.6,282.84),(390.6,267.84),(368.52,267.84),
]
POSITIVE_Z_ZONE = [
    (415.68,312.36),(451.32,312.36),(451.32,327.36),
    (473.4,327.36),(473.4,364.92),(415.68,364.92),
]


def polygon_area(points):
    return abs(sum(
        points[i][0] * points[(i + 1) % len(points)][1]
        - points[(i + 1) % len(points)][0] * points[i][1]
        for i in range(len(points))
    )) * 0.5


def close(a, b, tolerance=1e-3):
    return abs(a - b) <= tolerance


def is_black(color):
    if color is None:
        return False
    return all(abs(float(v)) <= 1e-6 for v in color)


def collect_geometry(page):
    endpoints = []
    segments = []
    for drawing_index, drawing in enumerate(page.get_drawings(extended=True)):
        width = float(drawing.get("width") or 0.0)
        color = drawing.get("color")
        for item in drawing.get("items", ()):
            if item[0] == "l":
                a = (float(item[1].x), float(item[1].y))
                b = (float(item[2].x), float(item[2].y))
                endpoints.extend((a, b))
                segments.append({
                    "drawing": drawing_index,
                    "a": a,
                    "b": b,
                    "width": width,
                    "color": color,
                })
            elif item[0] == "re":
                rect = item[1]
                endpoints.extend((
                    (float(rect.x0), float(rect.y0)),
                    (float(rect.x1), float(rect.y0)),
                    (float(rect.x1), float(rect.y1)),
                    (float(rect.x0), float(rect.y1)),
                ))
    return endpoints, segments


def verify_common_anchors(endpoints):
    rows = []
    for index, anchor in enumerate(TURF_OUTER_ANCHORS):
        residual = min(math.hypot(anchor[0] - x, anchor[1] - y) for x, y in endpoints)
        rows.append({
            "index": index,
            "anchor": list(anchor),
            "residualPoints": residual,
            "residualMeters": residual / POINTS_PER_PROJECT_METER,
            "modeSpecific": index in MODE_SPECIFIC_OUTER_ANCHOR_INDICES,
        })

    shared = [row for row in rows if not row["modeSpecific"]]
    changed = [row for row in rows if row["modeSpecific"]]
    max_shared = max(row["residualPoints"] for row in shared)

    if len(shared) != 40 or max_shared > 0.001:
        raise RuntimeError(
            f"Expected 40 shared outer anchors <=0.001pt; "
            f"count={len(shared)} max={max_shared}"
        )
    if any(row["residualPoints"] < 1.0 for row in changed):
        raise RuntimeError("Mode-specific outer anchors unexpectedly match Turf geometry")

    return {
        "compared": len(rows),
        "shared": len(shared),
        "modeSpecificChanged": len(changed),
        "maxSharedResidualPoints": max_shared,
        "maxSharedResidualMeters": max_shared / POINTS_PER_PROJECT_METER,
        "changedResidualPoints": [row["residualPoints"] for row in changed],
    }


def verify_zone_ring(name, ring, segments):
    edge_rows = []
    for i, a in enumerate(ring):
        b = ring[(i + 1) % len(ring)]
        horizontal = close(a[1], b[1])
        vertical = close(a[0], b[0])
        if horizontal == vertical:
            raise RuntimeError(f"{name} edge {i} is not axis-aligned: {a}->{b}")

        support = []
        lo = min(a[0], b[0]) if horizontal else min(a[1], b[1])
        hi = max(a[0], b[0]) if horizontal else max(a[1], b[1])
        axis = a[1] if horizontal else a[0]

        for segment in segments:
            if abs(segment["width"] - 0.72) > 0.001 or not is_black(segment["color"]):
                continue
            p, q = segment["a"], segment["b"]
            if horizontal:
                if not close(p[1], axis) or not close(q[1], axis):
                    continue
                s0, s1 = sorted((p[0], q[0]))
            else:
                if not close(p[0], axis) or not close(q[0], axis):
                    continue
                s0, s1 = sorted((p[1], q[1]))
            if s1 < lo - 0.001 or s0 > hi + 0.001:
                continue
            if math.hypot(q[0] - p[0], q[1] - p[1]) <= 1e-6:
                continue
            support.append((max(s0, lo), min(s1, hi), segment["drawing"]))

        if not support:
            raise RuntimeError(f"{name} edge {i} has no 0.72pt vector support")

        min_support = min(row[0] for row in support)
        max_support = max(row[1] for row in support)
        if abs(min_support - lo) > 0.001 or abs(max_support - hi) > 0.001:
            raise RuntimeError(
                f"{name} edge {i} endpoint support drifted: "
                f"expected={lo}..{hi} got={min_support}..{max_support}"
            )

        edge_rows.append({
            "edge": i,
            "from": list(a),
            "to": list(b),
            "supportFragmentCount": len(support),
            "supportSpan": [min_support, max_support],
        })

    return {
        "name": name,
        "pdfPoints": [list(p) for p in ring],
        "vertexCount": len(ring),
        "areaSquarePoints": polygon_area(ring),
        "areaSquareMeters": polygon_area(ring) / (POINTS_PER_PROJECT_METER ** 2),
        "edges": edge_rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--output", default="/tmp/undertow-zones-vector-audit.json")
    parser.add_argument("--pdf-output", default="/tmp/undertow-zones-sunfish.pdf")
    args = parser.parse_args()

    request = urllib.request.Request(
        args.url,
        headers={
            "User-Agent": "Mozilla/5.0 (T21 Undertow vector audit)",
            "Referer": "https://note.com/sunfish3/n/nf25bcdf0b44c",
            "Accept": "application/pdf,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
        final_url = response.geturl()
        content_type = response.headers.get("content-type", "")

    if not data.startswith(b"%PDF-"):
        raise RuntimeError(
            f"Sunfish attachment did not return a PDF: content_type={content_type!r} "
            f"bytes={len(data)} prefix={data[:16]!r}"
        )

    digest = hashlib.sha256(data).hexdigest()
    if len(data) != EXPECTED_BYTES or digest != EXPECTED_SHA256:
        raise RuntimeError(
            f"Sunfish Zones source identity changed: bytes={len(data)} sha256={digest}"
        )

    pathlib.Path(args.pdf_output).write_bytes(data)
    doc = fitz.open(stream=data, filetype="pdf")
    if doc.page_count != 1:
        raise RuntimeError(f"Expected a single-page PDF, got {doc.page_count}")

    page = doc[0]
    if (
        abs(float(page.rect.width) - EXPECTED_PAGE[0]) > 0.001
        or abs(float(page.rect.height) - EXPECTED_PAGE[1]) > 0.001
    ):
        raise RuntimeError(
            f"Unexpected PDF page frame: {page.rect.width}x{page.rect.height}"
        )

    endpoints, segments = collect_geometry(page)
    anchor_audit = verify_common_anchors(endpoints)
    negative = verify_zone_ring("negative-z-zone", NEGATIVE_Z_ZONE, segments)
    positive = verify_zone_ring("positive-z-zone", POSITIVE_Z_ZONE, segments)

    if abs(negative["areaSquareMeters"] - positive["areaSquareMeters"]) > 1e-9:
        raise RuntimeError("Mirrored zone source areas differ")

    report = {
        "source": {
            "url": args.url,
            "finalUrl": final_url,
            "contentType": content_type,
            "bytes": len(data),
            "sha256": digest,
        },
        "page": {
            "count": doc.page_count,
            "widthPoints": float(page.rect.width),
            "heightPoints": float(page.rect.height),
        },
        "commonAnchorAudit": anchor_audit,
        "zones": [negative, positive],
        "drawingCount": len(page.get_drawings(extended=True)),
    }
    pathlib.Path(args.output).write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(
        "T21ZONES_SOURCE "
        f"bytes={len(data)} sha256={digest} "
        f"page={page.rect.width:.6f}x{page.rect.height:.6f}"
    )
    print(
        "T21ZONES_ANCHORS "
        f"shared={anchor_audit['shared']}/{anchor_audit['compared']} "
        f"mode_specific={anchor_audit['modeSpecificChanged']} "
        f"max_shared_pt={anchor_audit['maxSharedResidualPoints']:.9f} "
        f"max_shared_m={anchor_audit['maxSharedResidualMeters']:.9f}"
    )
    for zone in (negative, positive):
        print(
            "T21ZONES_EXACT "
            f"id={zone['name']} vertices={zone['vertexCount']} "
            f"area_m2={zone['areaSquareMeters']:.8f} "
            f"pdf_points={json.dumps(zone['pdfPoints'], separators=(',', ':'))}"
        )

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"T21ZONES_ERROR {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
