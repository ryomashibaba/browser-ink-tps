import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';
import { UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES } from './UndertowSpillwaySourceNativeReviewGeometry';

/**
 * Exact Pass18C Temple01 triangle meshes. Five symmetric source-verified
 * midfield pairs; this module is VISUAL REVIEW ONLY. Pass18G local
 * candidate membership does not confer traversability or runtime authority.
 */
export interface UndertowSourceNativeSupplementMesh {
  id: string;
  pairId: number;
  sourceComponentId: string;
  sourceMaterial: string;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  evidenceRoutes: readonly ('glass' | 'grate')[];
  areaSquareMeters: number;
  yRange: readonly [number, number];
  vertices: readonly StageVector3[];
  routeMembershipAuthority: 'PASS18G_RELAXED_DISCOVERY_ONLY' | 'PASS18G_LOCAL_CANDIDATE_ONLY';
  authority: 'EXACT_SOURCE_MESH_REVIEW_ONLY';
  runtimePromotionAuthorized: false;
}

export const UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES:
  readonly UndertowSourceNativeSupplementMesh[] = Object.freeze(
    [
      {
        "id": "source-local-01-positive-z",
        "pairId": 1,
        "sourceComponentId": "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c8",
        "sourceMaterial": "Fld_Temple01_FloorConcrete02",
        "side": "POSITIVE_Z",
        "evidenceRoutes": [
          "glass",
          "grate"
        ],
        "areaSquareMeters": 45.041273011533676,
        "yRange": [
          1.5,
          1.5
        ],
        "vertices": [
          [
            -9.0784290524802,
            1.5,
            19.042147380379262
          ],
          [
            -8.1653717874075,
            1.5,
            20.904612518310344
          ],
          [
            -6.284731345583576,
            1.5,
            17.672561482770217
          ],
          [
            -8.1653717874075,
            1.5,
            20.904612518310344
          ],
          [
            4.1734597513859155,
            1.5,
            14.855608137203715
          ],
          [
            -6.284731345583576,
            1.5,
            17.672561482770217
          ],
          [
            -6.284731345583576,
            1.5,
            17.672561482770217
          ],
          [
            4.1734597513859155,
            1.5,
            14.855608137203715
          ],
          [
            2.575609537508691,
            1.5,
            11.59629414582432
          ],
          [
            -6.9695242943881,
            1.5,
            16.275712629321905
          ],
          [
            -6.284731345583576,
            1.5,
            17.672561482770217
          ],
          [
            2.575609537508691,
            1.5,
            11.59629414582432
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-01-negative-z",
        "pairId": 1,
        "sourceComponentId": "Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c9",
        "sourceMaterial": "Fld_Temple01_FloorConcrete02",
        "side": "NEGATIVE_Z",
        "evidenceRoutes": [
          "glass",
          "grate"
        ],
        "areaSquareMeters": 45.04127301153369,
        "yRange": [
          1.5,
          1.5
        ],
        "vertices": [
          [
            9.307797341008362,
            1.5,
            -18.84758308492244
          ],
          [
            8.394740075935664,
            1.5,
            -20.710048222853523
          ],
          [
            6.514099634111742,
            1.5,
            -17.477997187313395
          ],
          [
            8.394740075935664,
            1.5,
            -20.710048222853523
          ],
          [
            -3.944091462857751,
            1.5,
            -14.66104384174689
          ],
          [
            6.514099634111742,
            1.5,
            -17.477997187313395
          ],
          [
            6.514099634111742,
            1.5,
            -17.477997187313395
          ],
          [
            -3.944091462857751,
            1.5,
            -14.66104384174689
          ],
          [
            -2.3462412489805273,
            1.5,
            -11.401729850367497
          ],
          [
            7.198892582916266,
            1.5,
            -16.08114833386508
          ],
          [
            6.514099634111742,
            1.5,
            -17.477997187313395
          ],
          [
            -2.3462412489805273,
            1.5,
            -11.401729850367497
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-02-positive-z",
        "pairId": 2,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c15",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "POSITIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 22.242995763832454,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            0.9851115713951122,
            0,
            22.193876698182475
          ],
          [
            5.059254060619352,
            0,
            20.196563930835943
          ],
          [
            -1.0692672750184624,
            1.5,
            18.003330137837537
          ],
          [
            5.059254060619352,
            0,
            20.196563930835943
          ],
          [
            3.004875214205778,
            1.5,
            16.00601737049101
          ],
          [
            -1.0692672750184624,
            1.5,
            18.003330137837537
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-02-negative-z",
        "pairId": 2,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c13",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "NEGATIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 22.242995763832436,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            -0.7557432828669485,
            0,
            -21.999312402725646
          ],
          [
            -4.829885772091188,
            0,
            -20.001999635379118
          ],
          [
            1.298635563546626,
            1.5,
            -17.808765842380716
          ],
          [
            -4.829885772091188,
            0,
            -20.001999635379118
          ],
          [
            -2.7755069256776146,
            1.5,
            -15.811453075034185
          ],
          [
            1.298635563546626,
            1.5,
            -17.808765842380716
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-03-positive-z",
        "pairId": 3,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c12",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "POSITIVE_Z",
        "evidenceRoutes": [
          "glass",
          "grate"
        ],
        "areaSquareMeters": 22.242995763832425,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            -5.8827286247257495,
            0,
            25.56077536313805
          ],
          [
            -1.808586135501511,
            0,
            23.56346259579152
          ],
          [
            -7.937107471139324,
            1.5,
            21.370228802793118
          ],
          [
            -1.808586135501511,
            0,
            23.56346259579152
          ],
          [
            -3.8629649819150855,
            1.5,
            19.37291603544659
          ],
          [
            -7.937107471139324,
            1.5,
            21.370228802793118
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-03-negative-z",
        "pairId": 3,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c17",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "NEGATIVE_Z",
        "evidenceRoutes": [
          "glass",
          "grate"
        ],
        "areaSquareMeters": 22.242995763832457,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            6.112096913253915,
            0,
            -25.366211067681228
          ],
          [
            2.0379544240296745,
            0,
            -23.3688983003347
          ],
          [
            8.16647575966749,
            1.5,
            -21.175664507336293
          ],
          [
            2.0379544240296745,
            0,
            -23.3688983003347
          ],
          [
            4.092333270443249,
            1.5,
            -19.17835173998976
          ],
          [
            8.16647575966749,
            1.5,
            -21.175664507336293
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-04-positive-z",
        "pairId": 4,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c14",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "POSITIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 8.89719830553297,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            -3.1991557587938346,
            0,
            8.65211367300793
          ],
          [
            -4.828812754483531,
            0,
            9.451038779946542
          ],
          [
            -1.144776912380262,
            1.5,
            12.842660233352863
          ],
          [
            -4.828812754483531,
            0,
            9.451038779946542
          ],
          [
            -2.774433908069958,
            1.5,
            13.641585340291472
          ],
          [
            -1.144776912380262,
            1.5,
            12.842660233352863
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-04-negative-z",
        "pairId": 4,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c16",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "NEGATIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 8.897198305532985,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            3.4285240473219987,
            0,
            -8.457549377551103
          ],
          [
            5.058181043011696,
            0,
            -9.256474484489717
          ],
          [
            1.3741452009084247,
            1.5,
            -12.64809593789604
          ],
          [
            5.058181043011696,
            0,
            -9.256474484489717
          ],
          [
            3.0038021965981216,
            1.5,
            -13.447021044834651
          ],
          [
            1.3741452009084247,
            1.5,
            -12.64809593789604
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-05-positive-z",
        "pairId": 5,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c10",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "POSITIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 8.897198305532964,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            -7.622510461380154,
            0,
            10.82062467755559
          ],
          [
            -9.252167457069847,
            0,
            11.619549784494202
          ],
          [
            -5.568131614966581,
            1.5,
            15.011171237900522
          ],
          [
            -9.252167457069847,
            0,
            11.619549784494202
          ],
          [
            -7.197788610656276,
            1.5,
            15.810096344839135
          ],
          [
            -5.568131614966581,
            1.5,
            15.011171237900522
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      },
      {
        "id": "source-local-05-negative-z",
        "pairId": 5,
        "sourceComponentId": "Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c19",
        "sourceMaterial": "Fld_Temple01_FloorSlope00",
        "side": "NEGATIVE_Z",
        "evidenceRoutes": [
          "glass"
        ],
        "areaSquareMeters": 8.897198305532983,
        "yRange": [
          0,
          1.5
        ],
        "vertices": [
          [
            7.851878749908318,
            0,
            -10.626060382098766
          ],
          [
            9.481535745598014,
            0,
            -11.424985489037377
          ],
          [
            5.797499903494744,
            1.5,
            -14.8166069424437
          ],
          [
            9.481535745598014,
            0,
            -11.424985489037377
          ],
          [
            7.427156899184441,
            1.5,
            -15.615532049382313
          ],
          [
            5.797499903494744,
            1.5,
            -14.8166069424437
          ]
        ],
        "routeMembershipAuthority": "PASS18G_LOCAL_CANDIDATE_ONLY",
        "authority": "EXACT_SOURCE_MESH_REVIEW_ONLY",
        "runtimePromotionAuthorized": false
      }
    ]
  );

export const UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY = Object.freeze({
  sourceAuditVersion: 'PASS18C_SOURCE_NATIVE_V1' as const,
  discoveryPass: '18G' as const,
  selectionRule: 'PAIRED_5_LOCAL_SOURCE_CONTOURS_INSIDE_HARD_SILHOUETTE' as const,
  reviewOnly: true as const,
  runtimePromotionAuthorized: false as const,
  pairCount: 5,
  meshCount: UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES.length,
  totalSourceAreaSquareMeters: UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES.reduce(
    (sum, mesh) => sum + mesh.areaSquareMeters, 0
  ),
  pendingExteriorRegistrationPairs: 2
});

type XZ = readonly [number, number];
function onSegment(p:XZ,a:XZ,b:XZ):boolean {
  const dx=b[0]-a[0],dz=b[1]-a[1],px=p[0]-a[0],pz=p[1]-a[1];
  const len=Math.hypot(dx,dz);
  const cross=Math.abs(dx*pz-dz*px);
  const dot=px*dx+pz*dz;
  return cross<=1e-6*Math.max(1,len) && dot>=-1e-6 && dot<=dx*dx+dz*dz+1e-6;
}
function insideHardSilhouette(p:XZ):boolean {
  const polygon=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[j]!,b=polygon[i]!;
    if(onSegment(p,a,b))return true;
    if((a[1]>p[1])!==(b[1]>p[1]) &&
       p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
function reflectedDistance(a:StageVector3,b:StageVector3):number {
  return Math.hypot(-a[0]+0.229368288528164-b[0],
    a[1]-b[1],-a[2]+0.194564295456822-b[2]);
}
export function undertowT21SourceNativeSupplementErrors():readonly string[] {
  const errors:string[]=[];
  const meshes=UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES;
  const used=new Set(
    UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES.map(mesh=>mesh.sourceComponentId));
  if(meshes.length!==10 ||
     UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY.pairCount!==5 ||
     UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY.runtimePromotionAuthorized)
    errors.push('supplement inventory must remain five review-only pairs');
  for(const mesh of meshes) {
    if(used.has(mesh.sourceComponentId))
      errors.push(mesh.id+': reused source mesh');
    used.add(mesh.sourceComponentId);
    if(mesh.runtimePromotionAuthorized ||
       mesh.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY' ||
       !['PASS18G_RELAXED_DISCOVERY_ONLY','PASS18G_LOCAL_CANDIDATE_ONLY']
         .includes(mesh.routeMembershipAuthority))
      errors.push(mesh.id+': review authority drifted');
    if(mesh.areaSquareMeters<8 ||
       mesh.vertices.length<3 ||
       mesh.vertices.length%3!==0 ||
       mesh.vertices.some(v=>v.some(n=>!Number.isFinite(n))))
      errors.push(mesh.id+': invalid triangle payload');
    for(let i=0;i+2<mesh.vertices.length;i+=3) {
      const a=mesh.vertices[i]!,b=mesh.vertices[i+1]!,c=mesh.vertices[i+2]!;
      const samples:XZ[]=[
        [a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
        [(a[0]+b[0])/2,(a[2]+b[2])/2],
        [(b[0]+c[0])/2,(b[2]+c[2])/2],
        [(a[0]+c[0])/2,(a[2]+c[2])/2],
        [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]
      ];
      if(samples.some(p=>!insideHardSilhouette(p))) {
        errors.push(mesh.id+': triangle exceeds hard silhouette');
        break;
      }
    }
    const y=mesh.vertices.map(v=>v[1]);
    if(Math.abs(Math.min(...y)-mesh.yRange[0])>1e-6 ||
       Math.abs(Math.max(...y)-mesh.yRange[1])>1e-6)
      errors.push(mesh.id+': Y source range drifted');
    if(mesh.vertices.some(v=>mesh.side==='POSITIVE_Z'?v[2]<=0:v[2]>=0))
      errors.push(mesh.id+': source side drifted');
  }
  for(let pairId=1;pairId<=5;pairId++){
    const pos=meshes.filter(m=>m.pairId===pairId&&m.side==='POSITIVE_Z');
    const neg=meshes.filter(m=>m.pairId===pairId&&m.side==='NEGATIVE_Z');
    if(pos.length!==1||neg.length!==1){
      errors.push('missing counterpart pair '+pairId);
      continue;
    }
    const a=pos[0]!,b=neg[0]!;
    if(Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6 ||
       a.vertices.length!==b.vertices.length ||
       a.yRange.some((v,i)=>Math.abs(v-b.yRange[i]!)>1e-6))
      errors.push('area/Y mismatch in pair '+pairId);
    for(const v of a.vertices) {
      const nearest=Math.min(...b.vertices.map(w=>reflectedDistance(v,w)));
      if(nearest>0.005){
        errors.push('source mirror mismatch in pair '+pairId);
        break;
      }
    }
  }
  return errors;
}
