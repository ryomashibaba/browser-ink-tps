#!/usr/bin/env python3
"""Exact-vector/raster audit for Undertow Turf paint semantics.

Downloads Sunfish's current post-remodel Turf PDF and audits the already-bound
right-low route-ramp quads plus the exact model-Y=6.0 first-drop landing
polygons. Research-only: this script never promotes runtime authority itself.
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


MODEL_REGISTRATION_SCALE = 0.964211
MODEL_REGISTRATION_ROTATION_DEGREES = 26.1160
MODEL_REGISTRATION_TRANSLATE_X = -0.0580
MODEL_REGISTRATION_TRANSLATE_Z = -0.1329
LOCAL_REGISTRATION_GATE_METERS = 0.5

FIRST_DROP_POSITIVE_MODEL = [
    (-25.562, 40.188),
    (-25.312, 39.938),
    (-25.188, 40.188),
    (-19.812, 40.188),
    (-19.812, 39.938),
    (-19.438, 40.188),
    (-19.438, 49.562),
    (-25.562, 49.562),
]
FIRST_DROP_NEGATIVE_MODEL = [
    (-x, -z) for x, z in FIRST_DROP_POSITIVE_MODEL
]

FIRST_DROP_LIPS_PDF = {
    "positive-z": [
        (620.4, 423.12),
        (664.68, 423.12),
        (664.68, 394.2),
    ],
    "negative-z": [
        (221.52, 172.08),
        (177.24, 172.08),
        (177.24, 201.0),
    ],
}

FIRST_DROP_ADJACENT_GRAY_RECTS = {
    "positive-z": [582.96, 394.2, 620.4, 423.12],
    "negative-z": [221.52, 172.08, 258.96, 201.0],
}


UNDERPASS_POSITIVE_MODEL = [
    (-14.562, -3.062),
    (-13.438, -3.062),
    (-13.438, -1.938),
    (-12.938, -1.938),
    (-12.938, -1.688),
    (-9.812, -1.688),
    (-9.812, -1.938),
    (-9.312, -1.938),
    (-9.312, -1.438),
    (-7.188, -1.438),
    (-7.188, -1.938),
    (-5.938, -1.688),
    (-6.062, 6.062),
    (-8.312, 6.188),
    (-8.688, 5.938),
    (-10.812, 5.938),
    (-11.188, 6.188),
    (-13.688, 6.188),
    (-13.688, -2.812),
    (-14.312, -2.812),
    (-14.438, -0.438),
]
UNDERPASS_POSITIVE_HOLE_MODEL = [
    (-12.562, -0.188),
    (-12.188, 0.688),
    (-11.438, 0.312),
    (-12.062, -0.312),
]

UNDERPASS_GLASS_OVERHANG_RECTS = {
    "positive-z": [420.96, 327.36, 459.48, 364.92],
    "negative-z": [382.44, 230.28, 420.96, 267.84],
}
AUTHOR_GRAY_FILL = [0.752941, 0.752941, 0.752941]


def normalized(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dy)
    return dx / length, dy / length


Z_DIR = normalized(NEG_SPAWN, POS_SPAWN)
X_DIR = (Z_DIR[1], -Z_DIR[0])
MODEL_THETA = math.radians(MODEL_REGISTRATION_ROTATION_DEGREES)
MODEL_COS = math.cos(MODEL_THETA)
MODEL_SIN = math.sin(MODEL_THETA)


def model_to_project(point):
    x, z = point
    mx = x - MODEL_REGISTRATION_TRANSLATE_X
    mz = z - MODEL_REGISTRATION_TRANSLATE_Z
    return (
        (MODEL_COS * mx + MODEL_SIN * mz) / MODEL_REGISTRATION_SCALE,
        (-MODEL_SIN * mx + MODEL_COS * mz) / MODEL_REGISTRATION_SCALE,
    )


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


def rect_polygon(rect):
    x0, y0, x1, y1 = rect
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def polygon_area(points):
    return abs(sum(
        points[i][0] * points[(i + 1) % len(points)][1]
        - points[(i + 1) % len(points)][0] * points[i][1]
        for i in range(len(points))
    )) * 0.5


def clip_polygon_axis(points, axis, boundary, keep_less_equal):
    output = []
    if not points:
        return output

    def inside(point):
        value = point[axis]
        return (
            value <= boundary + 1e-12
            if keep_less_equal
            else value >= boundary - 1e-12
        )

    def intersect(a, b):
        av = a[axis]
        bv = b[axis]
        if abs(bv - av) <= 1e-30:
            return a
        t = (boundary - av) / (bv - av)
        t = min(1.0, max(0.0, t))
        return (
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
        )

    previous = points[-1]
    previous_inside = inside(previous)
    for current in points:
        current_inside = inside(current)
        if current_inside:
            if not previous_inside:
                output.append(intersect(previous, current))
            output.append(current)
        elif previous_inside:
            output.append(intersect(previous, current))
        previous = current
        previous_inside = current_inside
    return output


def polygon_rect_intersection_area(points, rect):
    x0, y0, x1, y1 = rect
    clipped = list(points)
    clipped = clip_polygon_axis(clipped, 0, x0, False)
    clipped = clip_polygon_axis(clipped, 0, x1, True)
    clipped = clip_polygon_axis(clipped, 1, y0, False)
    clipped = clip_polygon_axis(clipped, 1, y1, True)
    return polygon_area(clipped) if len(clipped) >= 3 else 0.0


def polygon_with_holes_rect_intersection_area(outer, holes, rect):
    area = polygon_rect_intersection_area(outer, rect)
    for hole in holes:
        area -= polygon_rect_intersection_area(hole, rect)
    return max(0.0, area)


def mirror_model_points(points):
    return [(-x, -z) for x, z in points]


def point_segment_distance(point, a, b):
    px, py = point
    ax, ay = a
    bx, by = b
    vx, vy = bx - ax, by - ay
    denom = vx * vx + vy * vy
    if denom <= 1e-30:
        return math.hypot(px - ax, py - ay)
    t = ((px - ax) * vx + (py - ay) * vy) / denom
    t = min(1.0, max(0.0, t))
    qx = ax + t * vx
    qy = ay + t * vy
    return math.hypot(px - qx, py - qy)


def polygon_boundary_distance(point, polygon):
    return min(
        point_segment_distance(
            point,
            polygon[i],
            polygon[(i + 1) % len(polygon)],
        )
        for i in range(len(polygon))
    )


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


def is_canonical_dash_row(row):
    return (
        round(row["width"], 3) == 0.24
        and row["color"] == [0.0, 0.0, 0.0]
        and row["orientation"] in ("HORIZONTAL", "VERTICAL")
        and round(row["length"], 3) == 0.96
    )


def canonical_dash_polygon_stats(line_rows, polygon):
    canonical = [row for row in line_rows if is_canonical_dash_row(row)]
    midpoint_inside = []
    fully_inside = []
    for row in canonical:
        ax, ay = row["a"]
        bx, by = row["b"]
        mx = (ax + bx) * 0.5
        my = (ay + by) * 0.5
        if point_in_polygon(mx, my, polygon):
            midpoint_inside.append(row)
        if (
            point_in_polygon(ax, ay, polygon)
            and point_in_polygon(bx, by, polygon)
        ):
            fully_inside.append(row)
    total = len(canonical)
    return {
        "totalCanonicalInQuery": total,
        "midpointInside": len(midpoint_inside),
        "fullyInside": len(fully_inside),
        "midpointInsideFraction": round(
            len(midpoint_inside) / total if total else 0.0, 6
        ),
        "fullyInsideFraction": round(
            len(fully_inside) / total if total else 0.0, 6
        ),
    }


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


def raster_brightness_stats(page, polygon, scale=3.0, holes=()):
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
            if any(point_in_polygon(px, py, hole) for hole in holes):
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
    if (
        len(data) != 100311
        or digest != "2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f"
    ):
        raise RuntimeError(
            f"Pinned Turf PDF drifted: bytes={len(data)} sha256={digest}"
        )
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
        region["canonicalDashPolygonStats"] = canonical_dash_polygon_stats(
            line_rows, ramp_polygon
        )
        if (
            region["canonicalDashPolygonStats"]["midpointInsideFraction"] < 0.70
            or region["canonicalDashPolygonStats"]["fullyInsideFraction"] < 0.70
        ):
            raise RuntimeError(
                f"{side} canonical slope dashes do not substantially occupy the exact ramp polygon: "
                f"{region['canonicalDashPolygonStats']}"
            )
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
            f"d_unink={region['brightnessDistanceToUninkableP50']} "
            f"dash_poly={json.dumps(region['canonicalDashPolygonStats'], separators=(',', ':'))}"
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

    result["firstDropLandings"] = {}
    first_drop_model = {
        "positive-z": FIRST_DROP_POSITIVE_MODEL,
        "negative-z": FIRST_DROP_NEGATIVE_MODEL,
    }
    for side, model_points in first_drop_model.items():
        project_points = [model_to_project(point) for point in model_points]
        pdf_points = [project_to_pdf(point) for point in project_points]
        brightness = raster_brightness_stats(page, pdf_points)

        gray_rect = FIRST_DROP_ADJACENT_GRAY_RECTS[side]
        gray_brightness = raster_brightness_stats(
            page, rect_polygon(gray_rect)
        )
        landing_area = polygon_area(pdf_points)
        gray_overlap_area = polygon_rect_intersection_area(
            pdf_points, gray_rect
        )
        gray_overlap_fraction = (
            gray_overlap_area / landing_area
            if landing_area > 0
            else 1.0
        )
        lip_residual_points = [
            polygon_boundary_distance(anchor, pdf_points)
            for anchor in FIRST_DROP_LIPS_PDF[side]
        ]
        lip_residual_meters = [
            residual / POINTS_PER_METER
            for residual in lip_residual_points
        ]
        max_lip_residual_meters = max(lip_residual_meters)

        landing = {
            "modelPoints": [list(point) for point in model_points],
            "projectPoints": [
                [round(x, 9), round(z, 9)]
                for x, z in project_points
            ],
            "pdfPoints": [
                [round(x, 9), round(y, 9)]
                for x, y in pdf_points
            ],
            "pdfBounds": [
                round(value, 9)
                for value in rect_of_points(pdf_points)
            ],
            "brightness": brightness,
            "adjacentUninkableGrayRect": gray_rect,
            "adjacentUninkableBrightness": gray_brightness,
            "grayOverlapFraction": round(
                gray_overlap_fraction, 9
            ),
            "firstDropLipBoundaryResidualMeters": [
                round(value, 9)
                for value in lip_residual_meters
            ],
            "maxFirstDropLipBoundaryResidualMeters": round(
                max_lip_residual_meters, 9
            ),
        }
        landing["matchesWhiteFlatPaintClass"] = (
            brightness["p50"] == 255.0
            and brightness["nearWhiteFraction"] >= 0.90
            and gray_brightness["p50"] == 191.0
            and gray_brightness["darkOrGrayFraction"] == 1.0
            and gray_overlap_fraction < 0.01
            and max_lip_residual_meters
            <= LOCAL_REGISTRATION_GATE_METERS
        )
        result["firstDropLandings"][side] = landing

        if not landing["matchesWhiteFlatPaintClass"]:
            raise RuntimeError(
                f"{side} first-drop landing failed exact white-flat registration: "
                f"{json.dumps(landing, separators=(',', ':'))}"
            )

        print(
            "T21FIRSTDROP_REGION "
            f"side={side} "
            f"bbox={json.dumps(landing['pdfBounds'])} "
            f"brightness={json.dumps(brightness, separators=(',', ':'))} "
            f"gray_brightness={json.dumps(gray_brightness, separators=(',', ':'))} "
            f"gray_overlap_fraction={landing['grayOverlapFraction']} "
            f"lip_residual_m={json.dumps(landing['firstDropLipBoundaryResidualMeters'], separators=(',', ':'))} "
            f"max_lip_residual_m={landing['maxFirstDropLipBoundaryResidualMeters']} "
            f"matches_white={landing['matchesWhiteFlatPaintClass']}"
        )

    result["underpassPublicSourceClosure"] = {}
    underpass_model = {
        "positive-z": (
            UNDERPASS_POSITIVE_MODEL,
            [UNDERPASS_POSITIVE_HOLE_MODEL],
        ),
        "negative-z": (
            mirror_model_points(UNDERPASS_POSITIVE_MODEL),
            [mirror_model_points(UNDERPASS_POSITIVE_HOLE_MODEL)],
        ),
    }
    for side, (model_outer, model_holes) in underpass_model.items():
        project_outer = [model_to_project(point) for point in model_outer]
        project_holes = [
            [model_to_project(point) for point in hole]
            for hole in model_holes
        ]
        pdf_outer = [project_to_pdf(point) for point in project_outer]
        pdf_holes = [
            [project_to_pdf(point) for point in hole]
            for hole in project_holes
        ]
        bbox = rect_of_points(pdf_outer)
        brightness = raster_brightness_stats(
            page, pdf_outer, holes=pdf_holes
        )
        _, _, fill_rows, _ = analyze_region(drawings, bbox, pad=0.0)
        overlapping_fills = []
        for row in fill_rows:
            overlap_area = polygon_with_holes_rect_intersection_area(
                pdf_outer, pdf_holes, row["bbox"]
            )
            if overlap_area <= 1e-9:
                continue
            overlapping_fills.append({
                **row,
                "underpassOverlapAreaPoints2": round(overlap_area, 9),
            })

        explicit_fill_colors = sorted({
            tuple(row["fill"])
            for row in overlapping_fills
            if row["fill"] is not None
        })
        glass_rect = UNDERPASS_GLASS_OVERHANG_RECTS[side]
        underpass_area = (
            polygon_area(pdf_outer)
            - sum(polygon_area(hole) for hole in pdf_holes)
        )
        glass_overlap_area = polygon_with_holes_rect_intersection_area(
            pdf_outer, pdf_holes, glass_rect
        )
        glass_overlap_fraction = (
            glass_overlap_area / underpass_area
            if underpass_area > 0
            else 0.0
        )
        distinct_white_floor_fill_recovered = any(
            color == (1.0, 1.0, 1.0)
            for color in explicit_fill_colors
        )
        only_author_gray_explicit_fills_overlap = (
            len(explicit_fill_colors) > 0
            and all(
                list(color) == AUTHOR_GRAY_FILL
                for color in explicit_fill_colors
            )
        )
        top_view_occluded_by_glass_class = (
            brightness["p50"] == 191.0
            and brightness["darkOrGrayFraction"] >= 0.98
            and glass_overlap_fraction >= 0.70
            and only_author_gray_explicit_fills_overlap
            and not distinct_white_floor_fill_recovered
        )
        closure = {
            "modelOuter": [list(point) for point in model_outer],
            "modelHoles": [
                [list(point) for point in hole]
                for hole in model_holes
            ],
            "projectOuter": [
                [round(x, 9), round(z, 9)]
                for x, z in project_outer
            ],
            "pdfBounds": [
                round(value, 9)
                for value in bbox
            ],
            "brightness": brightness,
            "overlappingExplicitFillCount": len(overlapping_fills),
            "overlappingExplicitFillColors": [
                list(color) for color in explicit_fill_colors
            ],
            "knownGlassOverhangOverlapFraction": round(
                glass_overlap_fraction, 9
            ),
            "distinctWhiteFloorVectorFillRecovered":
                distinct_white_floor_fill_recovered,
            "onlyAuthorGrayExplicitFillsOverlap":
                only_author_gray_explicit_fills_overlap,
            "topViewOccludedByGlassClass":
                top_view_occluded_by_glass_class,
            "wholeUnderpassPaintAuthorityResolved": False,
            "runtimePromotionAuthorized": False,
        }
        result["underpassPublicSourceClosure"][side] = closure

        if not top_view_occluded_by_glass_class:
            raise RuntimeError(
                f"{side} underpass no longer demonstrates author-plan glass occlusion: "
                f"{json.dumps(closure, separators=(',', ':'))}"
            )
        if (
            closure["wholeUnderpassPaintAuthorityResolved"]
            or closure["runtimePromotionAuthorized"]
        ):
            raise RuntimeError(
                f"{side} underpass public-source closure overpromoted paint authority"
            )

        print(
            "T21UNDERPASS_PUBLIC_CLOSURE "
            f"side={side} "
            f"bbox={json.dumps(closure['pdfBounds'])} "
            f"brightness={json.dumps(brightness, separators=(',', ':'))} "
            f"explicit_fill_count={closure['overlappingExplicitFillCount']} "
            f"fill_colors={json.dumps(closure['overlappingExplicitFillColors'])} "
            f"glass_overlap_fraction={closure['knownGlassOverhangOverlapFraction']} "
            f"white_floor_fill_recovered={closure['distinctWhiteFloorVectorFillRecovered']} "
            f"occluded={closure['topViewOccludedByGlassClass']} "
            f"promotion={closure['runtimePromotionAuthorized']}"
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
