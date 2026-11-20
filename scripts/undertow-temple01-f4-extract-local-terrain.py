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
    # The two FloorSlope00 approaches around the central step. FloorLine
    # faces here span the physical seams between the concrete and slopes.
    "corridor-floors": {
        "Fld_Temple01_group21600_1__FloorLine00": (
            35982, 35983, 35996, 35997, 36024, 36025, 36030, 36031, 36036, 36037, 36052, 36053,
            36248, 36249, 36268, 36269, 36286, 36287, 36288, 36289,
            36483, 36494, 36495, 36514, 36515, 36531, 36532, 36533, 36544, 36545,
        ),
        "Fld_Temple01_pCube20989_1__FloorConcrete02": (
            69239, 69240, 69241, 69243, 69244, 69245,
        ),
        "Fld_Temple01_pCube21000_1__FloorSlope00": (
            69286, 69287, 69292, 69293, 69294, 69295,
            69298, 69299, 69304, 69305, 69306, 69307,
        ),
    },
    "corridor-sides": {
        "FldObj_Temple01_PntSet_mesh02_low159_1__PillarBase01": (
            6340, 6341, 6342, 6356, 6357, 6358, 6396, 6418, 6421, 6443, 6524, 6530, 6531, 6537,
        ),
        "Fld_Temple01_GrassSet00_1__GrassFloor00": (13264, 13332, 13333, 13805, 13850, 13851),
        "Fld_Temple01_group21600_1__FloorLine00": (
            36246, 36247, 36278, 36279, 36472, 36490, 36491,
            36538, 36540, 36541, 36542, 36543, 36546, 36547,
        ),
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
