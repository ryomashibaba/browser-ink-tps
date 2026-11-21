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
        "FldObj_Temple01_PntSet_group21602_1__FloorLine00": (1810, 1811, 1816, 1817, 1822, 1823, 1826, 1827),
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
    "ingress-floors": {
        "FldObj_Temple01_PntSet_group21602_1__FloorLine00": (
            1314, 1315, 1320, 1321, 1326, 1327, 1332, 1333, 1758, 1759, 1764, 1765, 1770, 1771,
            1776, 1777,
        ),
        "FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01": (
            4098, 4099, 4100, 4101, 4362, 4363, 4368, 4369, 4388, 4389, 4398, 4399, 4408, 4409,
            4418, 4419, 4428, 4429, 4436, 4437, 4444, 4445, 4452, 4453, 4504, 4505, 4512, 4513,
            4520, 4521, 4528, 4529, 4568, 4569, 4572, 4573, 4584, 4585, 4588, 4589, 4592, 4593,
            4596, 4597, 4600, 4601, 4604, 4605, 4608, 4609, 4612, 4613, 4616, 4617, 4620, 4621,
            4664, 4665, 4668, 4669, 4680, 4681, 4684, 4685, 4688, 4689, 4692, 4693, 4696, 4697,
            4700, 4701, 4704, 4705, 4708, 4709, 4712, 4713, 4716, 4717,
        ),
        "FldObj_Temple01_PntSet_mesh08_low104_10__FloorLine02": (
            7254, 7255, 7258, 7259, 7342, 7343, 7346, 7347,
        ),
        "Fld_Temple01_group21600_1__FloorLine00": (
            35942, 35943, 35948, 35949, 36076, 36077, 36107, 36113, 36120, 36124, 36125, 36150,
            36151, 36186, 36200, 36201, 36848, 36849, 36868, 36869, 36900, 36901, 36906, 36907,
            37236, 37237, 37242, 37243,
        ),
        "Fld_Temple01_mesh01_low104_1__FloorLine03": (
            44768, 44769, 44770, 44771, 44780, 44781, 44782, 44783,
        ),
        "Fld_Temple01_mesh05_low57_1__FloorLine02": (
            62936, 62937,
        ),
        "Fld_Temple01_pCube21569_1__FloorConcrete03": (
            69992, 69996, 69997, 69998, 69999, 70011, 70046,
        ),
    },
    "ingress-sides": {
        "FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01": (
            4070, 4071, 4074, 4075, 4076, 4077, 4080, 4081, 4364, 4365, 4366, 4367, 4370, 4371,
            4372, 4373, 4386, 4387, 4396, 4397, 4415, 4425, 4426, 4427, 4430, 4431, 4432, 4433,
            4434, 4435, 4438, 4439, 4440, 4441, 4442, 4443, 4446, 4447, 4448, 4449, 4450, 4451,
            4454, 4455, 4456, 4457, 4502, 4503, 4506, 4507, 4508, 4509, 4510, 4511, 4514, 4515,
            4516, 4517, 4518, 4519, 4522, 4523, 4524, 4525, 4526, 4527, 4530, 4531, 4532, 4533,
            4566, 4567, 4570, 4571, 4582, 4583, 4586, 4587, 4590, 4591, 4594, 4595, 4598, 4599,
            4602, 4603, 4606, 4607, 4610, 4611, 4614, 4615, 4618, 4619, 4662, 4663, 4666, 4667,
            4678, 4679, 4682, 4683, 4686, 4687, 4690, 4691, 4694, 4695, 4698, 4699, 4702, 4703,
            4706, 4707, 4710, 4711, 4714, 4715,
        ),
        "FldObj_Temple01_PntSet_mesh05_low75_1__FloorLine06": (
            6836, 6837,
        ),
        "FldObj_Temple01_PntSet_mesh08_low104_10__FloorLine02": (
            7558, 7559, 7614, 7615,
        ),
        "Fld_Temple01_GrassSet00_1__GrassFloor00": (
            13265, 13316, 13317, 13804, 13866, 13867,
        ),
        "Fld_Temple01_group21600_1__FloorLine00": (
            37070, 37071, 37110, 37111, 37114, 37115, 37116, 37117, 37234, 37235, 37240, 37241,
        ),
        "Fld_Temple01_group21978_1__FloorLine05": (
            38533, 39113,
        ),
    },
}

# Verified sections of the sloped floor around both central seam openings
# in the previous selection. Append to preserve the original face ordering.
CORRIDOR_SEAM_FLOORS = {
    "Fld_Temple01_group21600_1__FloorLine00": (36482, 36530),
    "Fld_Temple01_mesh02_low127_1__PillarBase01": (55372, 55373, 55462, 55463, 55783, 55784, 55877, 55878),
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
        objects = expected.items()
        if name == "corridor-floors":
            objects = (*objects, *CORRIDOR_SEAM_FLOORS.items())
        for source_object, face_ids in objects:
            for face_id in face_ids:
                vertex_ids, actual_object, _ = faces[face_id]
                if actual_object != source_object:
                    raise ValueError(f"Unexpected owner of Temple01 face {face_id}")
                groups[name].append([face_id, [[vertex_id, vertices[vertex_id]]
                                               for vertex_id in vertex_ids]])
    output.write_text(json.dumps({"sourceSHA256": source.PIN, "groups": groups}), encoding="utf8")


if __name__ == "__main__":
    main()
