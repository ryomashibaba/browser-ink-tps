#!/usr/bin/env python3
"""Synthetic-only failure and source-boundary unit tests. NEVER asserts real game collision."""
import copy
import importlib.util
import json
import math
import tempfile
import unittest
from pathlib import Path

SCRIPT=Path(__file__).with_name('f4_phive_original_collision_probe.py')
spec=importlib.util.spec_from_file_location('f4probe',SCRIPT)
probe=importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


def fixture():
    side_area=probe.EXPECTED_SIDE_AREA_M2
    half=side_area/2
    sides={}
    for side,z in [('POSITIVE_Z',45),('NEGATIVE_Z',-45)]:
        sign=1 if z>0 else -1
        verts=[[0,3,z],[2,3,z],[0,3,z+sign*half],[2,3,z+sign*half]]
        faces=[]
        for i,ix in enumerate(((0,1,2),(1,3,2))):
            faces.append({'originalFaceIndex':probe.EXPECTED_IDS[side][i],
                          'originalOBJVertexIDs':list(probe.EXPECTED_VERTICES[side][i]),
                          'sourceMaterial':'M_source',
                          'sourceAreaSquareMeters':half,
                          'vertices':[verts[j] for j in ix]})
        sides[side]={'sourceObject':probe.EXPECTED_OBJECT,
                     'sourceMaterial':'M_source','sourceAreaSquareMeters':side_area,
                     'actualRapierSupportCertified':False,
                     'realCpuTraversalsCertified':0,'triangles':faces}
    return {'version':'B239_EXACT_FLOORLINE_ONLY_SOURCE_FACES_V1',
            'sourceSHA256':probe.EXPECTED_SHA,'sourceOnly':True,
            'productionAuthorized':False,'originalStage':'25/17/26/0',
            'opponentRoutesCertified':'0/12','originalActiveFaceCount':70396,
            'sides':sides}


def write_files(path,data=None,material=None,omit_negative=False):
    data=fixture() if data is None else data
    b239=path/'b239.json'; obj=path/'c.obj'; js=path/'c.json'
    b239.write_text(json.dumps(data),encoding='utf-8')
    material={'Stone00': {'mat_name':'Stone','mat_flags':[],
                         'col_disable_flags':[]}} if material is None else material
    js.write_text(json.dumps(material),encoding='utf-8')
    lines=['# SYNTHETIC TEST ONLY - NO ORIGINAL GAME COLLISION']
    n=0
    for side,row in data['sides'].items():
        if omit_negative and side=='NEGATIVE_Z':continue
        for face in row['triangles']:
            lines.extend('v '+ ' '.join(str(x) for x in v) for v in face['vertices'])
            lines.append('usemtl Stone00')
            lines.append('f '+ ' '.join(str(n+i) for i in (1,2,3)))
            n+=3
    obj.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    return b239,obj,js


class SyntheticPhiveProbeTests(unittest.TestCase):
    def test_unverified_source_candidate_has_all_sample_witnesses_no_authority(self):
        with tempfile.TemporaryDirectory() as d:
            x=probe.run(*write_files(Path(d)))
            a=x['comparisonCoordinateFrames']['stageProject']
            self.assertEqual([r['coveredSamplePoints'] for r in a['POSITIVE_Z']],[4,4])
            self.assertEqual([r['coveredSamplePoints'] for r in a['NEGATIVE_Z']],[4,4])
            self.assertTrue(all(row['materialCandidates'][0]['allFourInteriorSamplesOnThisMaterial']
                                for rows in a.values() for row in rows))
            self.assertFalse(x['runtimePromotionAuthorized'])
            self.assertFalse(x['original7_2_0TurfCollisionFlagsVerified'])
            self.assertFalse(x['floorlinePlayerCollisionAuthorized'])
            self.assertEqual(x['naturalCrossTeamRoutesCertified'],0)
            self.assertEqual(x['officialScoreable'],0)
            self.assertTrue(x['originalFaceCoverageIsNotContinuousKccSupport'])

    def test_real_negative_layer_flags_veto_only(self):
        with tempfile.TemporaryDirectory() as d:
            mat={'Stone00': {'mat_name':'Stone','mat_flags':['Unridable'],
                             'col_disable_flags':['SplPlayerHuman']}}
            x=probe.run(*write_files(Path(d),material=mat))
            c=x['comparisonCoordinateFrames']['stageProject']['POSITIVE_Z'][0]['materialCandidates'][0]
            self.assertTrue(c['explicitHumanCollisionLayerDisabled'])
            self.assertTrue(c['explicitUnridableMaterial'])
            self.assertTrue(c['allFourInteriorSamplesOnThisMaterial'])
            self.assertFalse(x['runtimePromotionAuthorized'])

    def test_reject_b239_vertex_id_forgery(self):
        with tempfile.TemporaryDirectory() as d:
            data=fixture();data['sides']['POSITIVE_Z']['triangles'][0]['originalOBJVertexIDs'][0]+=1
            with self.assertRaisesRegex(ValueError,'B239_ORIGINAL_MATERIAL_VERTEX'):
                probe.run(*write_files(Path(d),data))

    def test_reject_b239_area_forgery(self):
        with tempfile.TemporaryDirectory() as d:
            data=fixture();data['sides']['NEGATIVE_Z']['triangles'][0]['sourceAreaSquareMeters']+=.1
            with self.assertRaisesRegex(ValueError,'B239_ORIGINAL_TRIANGLE_AREA'):
                probe.run(*write_files(Path(d),data))

    def test_reject_material_flag_schema_confusion(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaisesRegex(ValueError,'PHIVE_MATERIAL_FLAGS_INVALID'):
                probe.run(*write_files(Path(d),material={'Stone00':{'col_disable_flags':'SplPlayerHuman'}}))

    def test_reject_missing_collision_material(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaisesRegex(ValueError,'PHIVE_TARGET_COLLIDER_MATERIAL_MISSING'):
                probe.run(*write_files(Path(d),material={'Wrong':{}}))

    def test_partial_coverage_not_authority(self):
        with tempfile.TemporaryDirectory() as d:
            x=probe.run(*write_files(Path(d),omit_negative=True))
            self.assertEqual([r['coveredSamplePoints'] for r in
             x['comparisonCoordinateFrames']['stageProject']['NEGATIVE_Z']],[0,0])
            self.assertFalse(x['runtimePromotionAuthorized'])

    def test_invalid_original_stage_denied(self):
        with tempfile.TemporaryDirectory() as d:
            data=fixture();data['originalStage']='25/17/26/1'
            with self.assertRaisesRegex(ValueError,'B239_PINNED_ORIGINAL_SOURCE_GATE_FAILED'):
                probe.run(*write_files(Path(d),data))


if __name__=='__main__':
    unittest.main(verbosity=2)
