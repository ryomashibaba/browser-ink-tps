#!/usr/bin/env python3
"""Recover vector-path metadata from Sunfish's current Undertow Splat Zones PDF.

This is a research-only T21 audit helper. It does not promote geometry or mutate
runtime stage data. The script downloads the public PDF, extracts PyMuPDF vector
paths, and emits a compact JSON report plus log lines for dashed/closed path
candidates so exact objective paths can be registered without screenshot tracing.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import pathlib
import sys
import urllib.request

import fitz  # PyMuPDF


DEFAULT_URL = (
    "https://note.com/api/v2/attachments/download/"
    "71d47d4e3fe3f2a041aa1af50a6ede14"
)


def point_pair(value):
    if hasattr(value, "x") and hasattr(value, "y"):
        return [round(float(value.x), 6), round(float(value.y), 6)]
    if hasattr(value, "x0") and hasattr(value, "y0"):
        return [
            round(float(value.x0), 6),
            round(float(value.y0), 6),
            round(float(value.x1), 6),
            round(float(value.y1), 6),
        ]
    return value


def json_item(item):
    out = []
    for value in item:
        if isinstance(value, str):
            out.append(value)
        elif hasattr(value, "x") and hasattr(value, "y"):
            out.append(point_pair(value))
        elif hasattr(value, "x0") and hasattr(value, "y0"):
            out.append(point_pair(value))
        else:
            try:
                out.append(round(float(value), 6))
            except (TypeError, ValueError):
                out.append(str(value))
    return out


def color_value(value):
    if value is None:
        return None
    return [round(float(v), 6) for v in value]


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

    sha256 = hashlib.sha256(data).hexdigest()
    pathlib.Path(args.pdf_output).write_bytes(data)

    doc = fitz.open(stream=data, filetype="pdf")
    if doc.page_count != 1:
        raise RuntimeError(f"Expected a single-page PDF, got {doc.page_count}")

    page = doc[0]
    drawings = page.get_drawings(extended=True)

    dash_counts = collections.Counter()
    path_rows = []
    for index, drawing in enumerate(drawings):
        dashes = str(drawing.get("dashes") or "").strip()
        dash_counts[dashes] += 1
        rect = drawing.get("rect")
        row = {
            "index": index,
            "seqno": drawing.get("seqno"),
            "rect": point_pair(rect) if rect is not None else None,
            "width": round(float(drawing.get("width") or 0.0), 6),
            "dashes": dashes,
            "closePath": bool(drawing.get("closePath")),
            "color": color_value(drawing.get("color")),
            "fill": color_value(drawing.get("fill")),
            "stroke_opacity": round(float(drawing.get("stroke_opacity", 1.0)), 6),
            "fill_opacity": round(float(drawing.get("fill_opacity", 1.0)), 6),
            "itemCount": len(drawing.get("items", ())),
            "items": [json_item(item) for item in drawing.get("items", ())],
        }
        path_rows.append(row)

    page_width = float(page.rect.width)
    page_height = float(page.rect.height)

    # Research candidates only: closed stroked paths with a dash pattern, excluding
    # the lower legend/title strip. Do not interpret these as objective authority
    # until common-anchor registration and semantic inspection are complete.
    candidates = []
    for row in path_rows:
        rect = row["rect"]
        if not rect:
            continue
        x0, y0, x1, y1 = rect
        dashed = row["dashes"] not in ("", "[] 0", "[] 0.0")
        in_stage_drawing = y1 < page_height * 0.83
        if dashed and row["closePath"] and in_stage_drawing:
            candidates.append(row)

    report = {
        "source": {
            "url": args.url,
            "finalUrl": final_url,
            "contentType": content_type,
            "bytes": len(data),
            "sha256": sha256,
        },
        "page": {
            "count": doc.page_count,
            "widthPoints": round(page_width, 6),
            "heightPoints": round(page_height, 6),
        },
        "drawingCount": len(path_rows),
        "dashPatternCounts": dict(sorted(dash_counts.items())),
        "closedDashedStageCandidates": candidates,
        "drawings": path_rows,
    }

    pathlib.Path(args.output).write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(
        "T21ZONES_SOURCE "
        f"bytes={len(data)} sha256={sha256} "
        f"page={page_width:.6f}x{page_height:.6f} drawings={len(path_rows)}"
    )
    for dashes, count in sorted(dash_counts.items()):
        print(f"T21ZONES_DASH count={count} pattern={dashes!r}")
    print(f"T21ZONES_CANDIDATE_COUNT {len(candidates)}")
    for row in candidates:
        print(
            "T21ZONES_CANDIDATE "
            f"index={row['index']} seqno={row['seqno']} rect={row['rect']} "
            f"width={row['width']} dashes={row['dashes']!r} "
            f"items={row['itemCount']}"
        )
        print("T21ZONES_ITEMS " + json.dumps(row["items"], ensure_ascii=False))

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"T21ZONES_ERROR {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
