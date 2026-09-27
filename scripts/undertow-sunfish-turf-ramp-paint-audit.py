#!/usr/bin/env python3
"""Diagnostic exact-vector audit for Undertow Turf route-ramp paint semantics.

Downloads Sunfish's current post-remodel Turf PDF and inspects native vector
fragments around the already-audited FloorConcrete03 route-ramp quads.
Research-only: this script does not promote paint authority by itself.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import math
import pathlib
import sys
import urllib.request

import fitz

DEFAULT_URL = (
    "https://note.com/api/v2/attachments/download/"
    "5548e6518463d4988bad02d72d9c5d24"
)

PDF_ORIGIN = (420.96, 297.66)
NEG_SPAWN = (131.82, 155.58)
POS_SPAWN = (709.98, 439.5)
POINTS_PER_METER = 4.8

KNOWN_PAINTABLE_SLOPE_MARKERS = {
    "center-left": [393.6, 312.36, 409.44, 369.84],
    "center-right": [432.48, 225.36, 448.32, 282.84],
}

KNOWN_UNINKABLE_SLOPE_MARKERS = {
    "glass-negative-z": [382.44, 244.92, 420.96, 261.24],
    "glass-positive-z": [420.96, 333.96, 459.48, 350.28],
}

RAMPS = {
    "positive-z": [
        (8.333487, 52.203114),
        (5.046481, 45.49824),
        (4.142941, 54.257493),
        (0.855934, 47.552619),
    ],
    "negative-z": [
        (-8.104119, -52.00855),
        (-4.817113, -45.303676),
        (-3.913572, -54.062929),
        (-0.626566, -47.358055),
    ],
}


def normalized(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dy)
    return dx / length, dy / length


Z_DIR = normalized(NEG_SPAWN, POS_SPAWN)
X_DIR = (Z_DIR[1], -Z_DIR[0])


def project_to_pdf(point):
    x, z = point
    return (
        PDF_ORIGIN[0] + POINTS_PER_METER * (x * X_DIR[0] + z * Z_DIR[0]),
        PDF_ORIGIN[1] + POINTS_PER_METER * (x * X_DIR[1] + z * Z_DIR[1]),
    )


def intersects(a, b):
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])


def rect_of_points(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return [min(xs), min(ys), max(xs), max(ys)]


def color_json(value):
    if value is None:
        return None
    return [round(float(v), 6) for v in value]


def item_points(item):
    points = []
    for value in item[1:]:
        if hasattr(value, "x") and hasattr(value, "y"):
            points.append((float(value.x), float(value.y)))
        elif hasattr(value, "x0") and hasattr(value, "y0"):
            points.extend([
                (float(value.x0), float(value.y0)),
                (float(value.x1), float(value.y1)),
            ])
    return points



def analyze_region(drawings, bbox, pad=0.0):
    query = [bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad]
    line_rows = []
    fill_rows = []
    signature_counts = collections.Counter()

    for di, drawing in enumerate(drawings):
        width = float(drawing.get("width") or 0.0)
        color = color_json(drawing.get("color"))
        fill = color_json(drawing.get("fill"))
        for item in drawing.get("items", ()):
            pts = item_points(item)
            if not pts:
                continue
            ibox = rect_of_points(pts)
            if not intersects(ibox, query):
                continue

            if item[0] == "l" and len(pts) >= 2:
                a, b = pts[0], pts[1]
                dx, dy = b[0] - a[0], b[1] - a[1]
                length = math.hypot(dx, dy)
                if abs(dx) < 0.001:
                    orientation = "VERTICAL"
                elif abs(dy) < 0.001:
                    orientation = "HORIZONTAL"
                else:
                    orientation = "DIAGONAL"
                row = {
                    "drawing": di,
                    "a": [round(a[0], 6), round(a[1], 6)],
                    "b": [round(b[0], 6), round(b[1], 6)],
                    "width": round(width, 6),
                    "color": color,
                    "length": round(length, 6),
                    "orientation": orientation,
                }
                line_rows.append(row)
                signature_counts[
                    (
                        round(width, 3),
                        tuple(color) if color is not None else None,
                        orientation,
                        round(length, 3),
                    )
                ] += 1

            if fill is not None:
                fill_rows.append({
                    "drawing": di,
                    "itemType": item[0],
                    "bbox": [round(v, 6) for v in ibox],
                    "fill": fill,
                    "stroke": color,
                    "width": round(width, 6),
                })

    line_rows.sort(key=lambda row: (row["a"][0], row["a"][1], row["b"][0], row["b"][1]))
    fill_rows.sort(key=lambda row: (row["bbox"][0], row["bbox"][1], row["drawing"]))
    return query, line_rows, fill_rows, signature_counts


def signature_rows(signature_counts):
    return [
        {
            "width": sig[0],
            "color": list(sig[1]) if sig[1] is not None else None,
            "orientation": sig[2],
            "length": sig[3],
            "count": count,
        }
        for sig, count in signature_counts.most_common()
    ]


def canonical_dash_count(signature_counts):
    return sum(
        count
        for (width, color, orientation, length), count in signature_counts.items()
        if (
            width == 0.24
            and color == (0.0, 0.0, 0.0)
            and orientation in ("HORIZONTAL", "VERTICAL")
            and length == 0.96
        )
    )


def point_in_polygon(x, y, polygon):
    inside = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)):
            x_cross = (xj - xi) * (y - yi) / (yj - yi + 1e-30) + xi
            if x < x_cross:
                inside = not inside
        j = i
    return inside


def percentile(sorted_values, fraction):
    if not sorted_values:
        return None
    pos = fraction * (len(sorted_values) - 1)
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return sorted_values[lo]
    t = pos - lo
    return sorted_values[lo] * (1 - t) + sorted_values[hi] * t


def raster_brightness_stats(page, polygon, scale=3.0):
    bbox = rect_of_points(polygon)
    clip = fitz.Rect(*bbox)
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
    values = []
    step = 2
    width_pdf = bbox[2] - bbox[0]
    height_pdf = bbox[3] - bbox[1]
    for iy in range(0, pix.height, step):
        py = bbox[1] + (iy + 0.5) * height_pdf / max(1, pix.height)
        for ix in range(0, pix.width, step):
            px = bbox[0] + (ix + 0.5) * width_pdf / max(1, pix.width)
            if not point_in_polygon(px, py, polygon):
                continue
            off = iy * pix.stride + ix * pix.n
            rgb = pix.samples[off:off + 3]
            if len(rgb) < 3:
                continue
            values.append(sum(rgb) / 3.0)
    values.sort()
    if not values:
        raise RuntimeError("Raster brightness sampler produced no interior samples")
    return {
        "sampleCount": len(values),
        "p10": round(percentile(values, 0.10), 3),
        "p50": round(percentile(values, 0.50), 3),
        "p90": round(percentile(values, 0.90), 3),
        "nearWhiteFraction": round(sum(v >= 245 for v in values) / len(values), 6),
        "darkOrGrayFraction": round(sum(v < 235 for v in values) / len(values), 6),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--output", default="/tmp/undertow-turf-ramp-paint-audit.json")
    parser.add_argument("--pdf-output", default="/tmp/undertow-turf-sunfish.pdf")
    args = parser.parse_args()

    request = urllib.request.Request(
        args.url,
        headers={
            "User-Agent": "Mozilla/5.0 (T21 Undertow Turf vector audit)",
            "Referer": "https://note.com/sunfish3/n/n0afc08f03791",
            "Accept": "application/pdf,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
        content_type = response.headers.get("content-type", "")
        final_url = response.geturl()

    if not data.startswith(b"%PDF-"):
        raise RuntimeError(
            f"Turf attachment did not return PDF: type={content_type!r} "
            f"bytes={len(data)} prefix={data[:16]!r}"
        )

    digest = hashlib.sha256(data).hexdigest()
    pathlib.Path(args.pdf_output).write_bytes(data)
    doc = fitz.open(stream=data, filetype="pdf")
    if doc.page_count != 1:
        raise RuntimeError(f"Expected one page, got {doc.page_count}")

    page = doc[0]
    drawings = page.get_drawings(extended=True)
    result = {
        "source": {
            "url": args.url,
            "finalUrl": final_url,
            "bytes": len(data),
            "sha256": digest,
            "contentType": content_type,
        },
        "page": {
            "widthPoints": float(page.rect.width),
            "heightPoints": float(page.rect.height),
        },
        "regions": {},
    }

    print(
        "T21TURF_SOURCE "
        f"bytes={len(data)} sha256={digest} "
        f"page={page.rect.width:.6f}x{page.rect.height:.6f}"
    )

    known_marker_dash_counts = {}
    known_marker_signatures = {}
    known_marker_fill_counts = {}
    for marker_name, marker_bbox in KNOWN_PAINTABLE_SLOPE_MARKERS.items():
        _, marker_lines, marker_fills, marker_counts = analyze_region(
            drawings, marker_bbox, pad=0.5
        )
        rows = signature_rows(marker_counts)
        dash_count = canonical_dash_count(marker_counts)
        known_marker_dash_counts[marker_name] = dash_count
        known_marker_fill_counts[marker_name] = len(marker_fills)
        marker_polygon = [
            (marker_bbox[0], marker_bbox[1]),
            (marker_bbox[2], marker_bbox[1]),
            (marker_bbox[2], marker_bbox[3]),
            (marker_bbox[0], marker_bbox[3]),
        ]
        brightness = raster_brightness_stats(page, marker_polygon)
        print(
            "T21TURF_KNOWN_PAINTABLE_SLOPE "
            f"name={marker_name} bbox={json.dumps(marker_bbox)} "
            f"lines={len(marker_lines)} fills={len(marker_fills)} "
            f"canonical_dash_count={dash_count} "
            f"brightness={json.dumps(brightness, separators=(',', ':'))} "
            f"signatures={json.dumps(rows[:12], separators=(',', ':'))}"
        )
        known_marker_signatures[marker_name] = {
            "lineSignatures": rows,
            "brightness": brightness,
        }

    if any(count <= 0 for count in known_marker_dash_counts.values()):
        raise RuntimeError(
            "Known central paintable slope marker failed to expose canonical 0.24pt/0.96pt dash signature"
        )
    known_uninkable = {}
    for marker_name, marker_bbox in KNOWN_UNINKABLE_SLOPE_MARKERS.items():
        _, marker_lines, marker_fills, marker_counts = analyze_region(
            drawings, marker_bbox, pad=0.5
        )
        fill_colors = sorted({
            tuple(row["fill"]) for row in marker_fills
            if row["fill"] is not None
        })
        marker_polygon = [
            (marker_bbox[0], marker_bbox[1]),
            (marker_bbox[2], marker_bbox[1]),
            (marker_bbox[2], marker_bbox[3]),
            (marker_bbox[0], marker_bbox[3]),
        ]
        brightness = raster_brightness_stats(page, marker_polygon)
        known_uninkable[marker_name] = {
            "bbox": marker_bbox,
            "canonicalDashCount": canonical_dash_count(marker_counts),
            "fillCount": len(marker_fills),
            "fillColors": [list(color) for color in fill_colors],
            "lineSignatureCounts": signature_rows(marker_counts),
            "brightness": brightness,
        }
        print(
            "T21TURF_KNOWN_UNINKABLE_SLOPE "
            f"name={marker_name} bbox={json.dumps(marker_bbox)} "
            f"lines={len(marker_lines)} fills={len(marker_fills)} "
            f"canonical_dash_count={canonical_dash_count(marker_counts)} "
            f"brightness={json.dumps(brightness, separators=(',', ':'))} "
            f"fill_colors={json.dumps([list(color) for color in fill_colors])}"
        )

    if any(rec["canonicalDashCount"] <= 0 for rec in known_uninkable.values()):
        raise RuntimeError("Known gray glass slope marker lost the canonical dash signature")
    result["knownPaintableSlopeMarkers"] = {
        name: {
            "bbox": KNOWN_PAINTABLE_SLOPE_MARKERS[name],
            "canonicalDashCount": known_marker_dash_counts[name],
            "fillCount": known_marker_fill_counts[name],
            "lineSignatureCounts": known_marker_signatures[name]["lineSignatures"],
            "brightness": known_marker_signatures[name]["brightness"],
        }
        for name in KNOWN_PAINTABLE_SLOPE_MARKERS
    }
    result["knownUninkableSlopeMarkers"] = known_uninkable

    for side, project_points in RAMPS.items():
        pdf_points = [project_to_pdf(point) for point in project_points]
        bbox = rect_of_points(pdf_points)
        query = [bbox[0] - 3, bbox[1] - 3, bbox[2] + 3, bbox[3] + 3]

        query, line_rows, fill_rows, signature_counts = analyze_region(
            drawings, bbox, pad=3.0
        )

        region = {
            "projectPoints": [list(p) for p in project_points],
            "pdfPoints": [[round(x, 9), round(y, 9)] for x, y in pdf_points],
            "rampPdfBounds": [round(v, 9) for v in bbox],
            "queryBounds": [round(v, 9) for v in query],
            "lineCount": len(line_rows),
            "fillCount": len(fill_rows),
            "lineSignatureCounts": signature_rows(signature_counts),
            "canonicalDashCount": canonical_dash_count(signature_counts),
            "lines": line_rows,
            "fills": fill_rows,
        }
        region["matchesKnownSlopeDashSignature"] = (
            region["canonicalDashCount"] > 0 and
            all(count > 0 for count in known_marker_dash_counts.values())
        )
        ramp_polygon = [pdf_points[0], pdf_points[1], pdf_points[3], pdf_points[2]]
        region["brightness"] = raster_brightness_stats(page, ramp_polygon)
        paintable_p50 = [
            rec["brightness"]["p50"] for rec in known_marker_signatures.values()
        ]
        uninkable_p50 = [
            rec["brightness"]["p50"] for rec in known_uninkable.values()
        ]
        region["brightnessDistanceToPaintableP50"] = round(
            min(abs(region["brightness"]["p50"] - v) for v in paintable_p50), 3
        )
        region["brightnessDistanceToUninkableP50"] = round(
            min(abs(region["brightness"]["p50"] - v) for v in uninkable_p50), 3
        )
        region["matchesKnownPaintableWhiteBackgroundClass"] = (
            region["brightnessDistanceToPaintableP50"]
            < region["brightnessDistanceToUninkableP50"]
        )
        result["regions"][side] = region

        if not region["matchesKnownSlopeDashSignature"]:
            raise RuntimeError(
                f"{side} route-ramp region does not contain the known slope dash signature"
            )
        # Keep this as a measured diagnostic until the paintable-vs-uninkable
        # raster classes are observed from this exact PDF. The next pass may
        # promote only if both mirrored ramps land decisively with the known
        # paintable class.

        print(
            "T21TURFRAMP_REGION "
            f"side={side} ramp_bbox={json.dumps(region['rampPdfBounds'])} "
            f"lines={len(line_rows)} fills={len(fill_rows)} "
            f"canonical_dash_count={region['canonicalDashCount']} "
            f"matches_known={region['matchesKnownSlopeDashSignature']} "
            f"matches_white={region['matchesKnownPaintableWhiteBackgroundClass']} "
            f"brightness={json.dumps(region['brightness'], separators=(',', ':'))} "
            f"d_paint={region['brightnessDistanceToPaintableP50']} "
            f"d_unink={region['brightnessDistanceToUninkableP50']}"
        )
        print(
            "T21TURFRAMP_SIGNATURES "
            f"side={side} "
            + json.dumps(region["lineSignatureCounts"][:20], separators=(",", ":"))
        )
        print(
            "T21TURFRAMP_FILLS "
            f"side={side} "
            + json.dumps(fill_rows[:30], separators=(",", ":"))
        )

    pathlib.Path(args.output).write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"T21TURFRAMP_ERROR {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
