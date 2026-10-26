#!/usr/bin/env python3
"""Pinned B238 native original OBJ contact verdict. SOURCE ONLY.
A near-vertical decorative face is not a CPU platform. A small floorline
triangle is still NOT a certified KCC entry without real collision trial.
"""
import json,sys
from pathlib import Path
PIN="a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046"
if len(sys.argv)!=2:raise SystemExit("B238 strict checker needs numeric JSON report")
r=json.loads(Path(sys.argv[1]).read_text("utf8"))
if (r["sha256"]!=PIN or r["wholeOriginalSourceActiveTrianglesParsed"]!=70396
 or r["wholeOriginalSourceVerticesParsed"]!=375948
 or r["componentScope"]!="EXACT_ORIGINAL_OBJ_EDGE_IDS_SAME_OBJECT_AND_MATERIAL_NOT_VERTEX_ONLY"
 or r["originalStage"]!="25/17/26/0"
 or r["originalOpponentPathsCertified"]!="0/12"
 or r["runtimePromotionAuthorized"] or r["cpuOrRecastGameplayPathAuthenticated"]):
 raise ValueError("B238_PINNED_SOURCE_OR_STAGE_AUTHORITY_DRIFT")
findings={}
for side in ("POSITIVE_Z","NEGATIVE_Z"):
 data=r["sides"][side]
 matches=[x for x in data["closestConnectedOriginalComponentCandidates"]
   if x["geometricDoubleContactWithin035"]]
 if data["geometricDoubleContactCandidateCount"]!=3 or len(matches)!=3:
  raise ValueError("B238_EXPECTED_THREE_EXACT_SOURCE_CONTACTS_"+side)
 horizontal=[x for x in matches if x["sourceFloorFacingTriangleCount"]>0]
 vertical=[x for x in matches if x["sourceFloorFacingTriangleCount"]==0]
 if len(horizontal)!=1 or len(vertical)!=2:
  raise ValueError("B238_FLOOR_AND_VERTICAL_SOURCE_CLASSIFICATION_"+side)
 floor=horizontal[0]
 if (floor["originalSourceObjects"]!=["Fld_Temple01_group21600_1__FloorLine00"]
  or floor["originalObjMaterialEdgeConnectedFaceCount"]!=2
  or abs(floor["originalOriginalTriangleAreaSquareMeters"]-1.52523399523421)>.00001
  or any(x["sourceNearVerticalTriangleCount"]==0 for x in vertical)
  or any(len(x.get("completeExactOriginalCandidateFaceEvidence",[]))!=
    x["originalObjMaterialEdgeConnectedFaceCount"] for x in matches)):
  raise ValueError("B238_SOURCE_COMPONENT_OR_PINNED_ORIGINAL_FACE_DRIFT_"+side)
 findings[side]={
  "authenticOriginal3DSourceContacts":3,
  "nearVerticalNonwalkingSourceComponents":2,
  "originalFloorlineTwoFaceCandidateButNotCertified":1,
  "floorlineOriginalFaceIDs":[v["originalActiveSourceFaceIndex"] for v in
    floor["completeExactOriginalCandidateFaceEvidence"]],
  "floorlineOriginalOBJVertexIDs":[v["originalOBJVertexIDs"] for v in
    floor["completeExactOriginalCandidateFaceEvidence"]],
  "sourceAreaSquareMeters":floor["originalOriginalTriangleAreaSquareMeters"],
  "actualPhysicalActorTraversalsCertified":0}
print("B238_STRICT_EXACT_SOURCE_FLOORLINE_GROUNDED_CANDIDATE_NOT_YET_CERTIFIED",
 json.dumps({"sides":findings,"actualCpuRouteCertification":"0/12",
 "productionAuthorized":False}))
