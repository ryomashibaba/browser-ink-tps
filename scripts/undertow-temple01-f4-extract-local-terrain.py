#!/usr/bin/env python3
"""Extract the reviewed F4 terrain slice locally from the B238-pinned OBJ."""
import argparse
import importlib
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
source = importlib.import_module("undertow-temple01-b238-pinned-full-seam-scan")

FACE_GROUPS = {
    "center-floors": {
        "FldObj_Temple01_PntSet_A4_1__FloorConcrete00": (110, 111),
        "Fld_Temple01_pCube20989_1__FloorConcrete02": (69150, 69151, 69152, 69153),
    },
    "center-step-sides": {
        "FldObj_Temple01_PntSet_mesh02_low159_1__PillarBase01": (
            6403, 6404, 6405, 6428, 6429, 6430, 6564, 6565, 6570, 6571
        ),
    },
    "floorline-positive-z": {
        "Fld_Temple01_group21600_1__FloorLine00": (37118, 37119),
    },
    "floorline-negative-z": {
        "Fld_Temple01_group21600_1__FloorLine00": (37112, 37113),
    },
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--obj", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True,
                        help="Local JSON path outside the repository and public directory")
    args = parser.parse_args()
    output = args.out.resolve()
    if output.is_relative_to(Path(__file__).resolve().parent.parent):
        parser.error("--out must stay outside the repository")

    vertices, faces = source.read(args.obj)
    groups = {}
    for name, expected in FACE_GROUPS.items():
        groups[name] = []
        for source_object, face_ids in expected.items():
            for face_id in face_ids:
                vertex_ids, actual_object, _ = faces[face_id]
                if actual_object != source_object:
                    raise ValueError(f"Unexpected owner of Temple01 face {face_id}")
                groups[name].append([face_id, [[vertex_id, vertices[vertex_id]]
                                               for vertex_id in vertex_ids]])
    output.write_text(json.dumps({"sourceSHA256": source.PIN, "groups": groups}), encoding="utf8")


if __name__ == "__main__":
    main()
