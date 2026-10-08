import type { StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY } from './UndertowSpillwayMacroCoverage';
import { UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES } from './UndertowSpillwaySourceNativeReviewGeometry';
import { UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES } from './UndertowSpillwaySourceNativeSupplementGeometry';

type Side = 'POSITIVE_Z' | 'NEGATIVE_Z';
type Packed = readonly [string, Side, number, readonly [number,number], readonly StageVector3[], readonly number[]];

/**
 * Phase 1: exact 8 Temple01 Pass18C triangle components (four audited pairs).
 * The compact indexed source payload is expanded to the original triangle list;
 * no interpolation, smoothing, XZ clipping, guessed floor, or Y change occurs.
 * Source identity and exact full-double source coordinates are retained.
 * Review renderer only; NEVER referenced by StageDefinition/runtime paths.
 */
const SOURCE: readonly Packed[] = [["Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c4","POSITIVE_Z",343.6097879378984,[7.5,7.5],[[-14.226398120022276,7.5,54.484583930355996],[-4.958866879534381,7.5,73.38860508035647],[-6.310921283815182,7.5,50.60409055379702],[-1.7456349584516875,7.5,59.916416243452424],[2.466936570086191,7.5,60.96985255554308],[7.114655573532067,7.5,77.51852932729044],[1.7364907580280304,7.5,59.479880445198205],[4.329401708017272,7.5,60.056795290470376],[3.8417604553415567,7.5,57.177244448234326],[12.515804473532205,7.5,74.87066325857961],[3.598955895959112,7.5,58.56682318012551]],[0,1,2,2,1,3,3,1,4,4,1,5,6,3,4,7,4,5,3,6,8,5,9,7,9,8,7,6,10,8,8,10,7]],["Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c5","NEGATIVE_Z",343.60978793789815,[7.5,7.5],[[14.455766408550444,7.5,-54.290019634899174],[5.188235168062548,7.5,-73.19404078489964],[6.540289572343346,7.5,-50.4095262583402],[1.9750032469798475,7.5,-59.7218519479956],[-2.237568281558024,7.5,-60.77528826008625],[-6.8852872850038995,7.5,-77.3239650318336],[-1.507122469499863,7.5,-59.28531614974138],[-4.1000334194891055,7.5,-59.862230995013554],[-3.6123921668133967,7.5,-56.982680152777505],[-12.286436185004037,7.5,-74.67609896312278],[-3.3695876074309448,7.5,-58.37225888466868]],[0,1,2,2,1,3,3,1,4,4,1,5,6,3,4,7,4,5,3,6,8,5,9,7,9,8,7,6,10,8,8,10,7]],["Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c6","POSITIVE_Z",66.4190712468586,[0,0],[[-0.6337223681653872,0,6.81691149091611],[-3.60115847965166,0,0.7638997926400953],[-9.480431773338022,0,11.153933500011432],[-12.447867884824296,0,5.100921801735416]],[0,1,2,1,3,2]],["Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c10","NEGATIVE_Z",66.41907124685862,[0,0],[[0.8630906566935517,0,-6.622347195459286],[3.8305267681798245,0,-0.5693354971832709],[9.70980006186619,0,-10.959369204554607],[12.677236173352462,0,-4.906357506278592]],[0,1,2,1,3,2]],["Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c4","POSITIVE_Z",35.21297144698233,[0,0],[[-9.946048057820795,0,11.382197816279607],[-12.456955536770717,0,6.260418686969133],[-10.877280626786334,0,11.838726448815956],[-13.388188105736258,0,6.716947319505482],[-12.517739920276032,0,12.64294728789199],[-17.017161527357175,0,11.094863762359697],[-18.044350950563963,0,8.99959048218723],[-18.50087958310031,0,8.068357913221691],[-13.84471673827261,0,5.785714750539941]],[0,1,2,1,3,2,3,4,2,5,4,3,6,5,3,6,3,7,3,8,7]],["Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c14","NEGATIVE_Z",35.21297144698233,[0,0],[[10.175416346348959,0,-11.187633520822782],[12.686323825298883,0,-6.065854391512308],[11.1066489153145,0,-11.644162153359131],[13.617556394264422,0,-6.522383024048658],[12.747108208804198,0,-12.448382992435166],[17.24652981588534,0,-10.900299466902872],[18.273719239092127,0,-8.805026186730405],[18.730247871628475,0,-7.873793617764864],[14.074085026800772,0,-5.591150455083117]],[0,1,2,1,3,2,3,4,2,5,4,3,6,5,3,6,3,7,3,8,7]],["Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c4","POSITIVE_Z",27.61286711658311,[-1.5,0],[[-13.967682919278284,-0.46709999999999985,3.650032484393576],[-14.012331419540338,-0.4996999999999998,3.5589579391487454],[-14.526422460657608,-0.46709999999999985,3.9239496639153857],[-14.571070960919664,-0.4996999999999998,3.832875118670555],[-15.382373845781922,-1.5,0.7643289996831582],[-13.826084905747232,-0.4996999999999998,3.4676522126414757],[-15.196127331988816,-1.5,0.6730232731758885],[-15.941113387161248,-1.5,1.038246179204968],[-14.664194217816217,-0.4996999999999998,3.8785279819241905],[-16.034236644057803,-1.5,1.0838990424586032],[-14.757317474712771,-0.4996999999999998,3.924180845177825],[-16.127359900954357,-1.5,1.1295519057122376],[-18.947864035057705,-0.4996999999999998,5.978559691591399],[-20.31790646129929,-1.5,3.183930752125812],[-14.712668974450716,-0.46709999999999985,4.015255390422655],[-19.590744540462904,-0.46709999999999985,6.406689326237816],[-14.48463292249881,-0.3006000000000002,4.480406058620943],[-19.362708488510997,-0.3006000000000002,6.871839994436104],[-14.116953345994894,-0.10009999999999986,4.994796462343185],[-14.391509665602255,-0.3006000000000002,4.434753195367308],[-14.210076602891448,-0.10009999999999986,5.040449325596819],[-19.088152168903637,-0.10009999999999986,7.431883261411978],[-18.951056620552972,0,7.711532401872331],[-14.072981054540783,0,5.32009846605717]],[0,1,2,1,3,2,1,4,3,4,1,5,6,4,5,4,7,3,3,7,8,7,9,8,8,9,10,9,11,10,10,11,12,11,13,12,14,10,12,15,14,12,16,14,15,17,16,15,18,19,16,20,18,16,20,16,17,21,20,17,20,21,22,23,20,22]],["Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c25","NEGATIVE_Z",27.612867116583114,[-1.5,0],[[14.197051207806446,-0.46709999999999985,-3.455468188936751],[14.241699708068502,-0.4996999999999998,-3.364393643691921],[14.755790749185772,-0.46709999999999985,-3.7293853684585616],[14.800439249447827,-0.4996999999999998,-3.6383108232137316],[15.611742134310088,-1.5,-0.569764704226333],[14.055453194275394,-0.4996999999999998,-3.273087917184651],[15.42549562051698,-1.5,-0.4784589777190633],[16.170481675689413,-1.5,-0.8436818837481437],[14.89356250634438,-0.4996999999999998,-3.683963686467366],[16.263604932585967,-1.5,-0.8893347470017781],[14.986685763240935,-0.4996999999999998,-3.729616549721001],[16.35672818948252,-1.5,-0.9349876102554133],[19.17723232358587,-0.4996999999999998,-5.783995396134574],[20.54727474982745,-1.5,-2.989366456668986],[14.942037262978879,-0.46709999999999985,-3.8206910949658313],[19.82011282899107,-0.46709999999999985,-6.212125030780991],[14.714001211026973,-0.3006000000000002,-4.285841763164119],[19.592076777039164,-0.3006000000000002,-6.67727569897928],[14.346321634523058,-0.10009999999999986,-4.800232166886359],[14.62087795413042,-0.3006000000000002,-4.240188899910484],[14.439444891419612,-0.10009999999999986,-4.845885030139995],[19.317520457431804,-0.10009999999999986,-7.237318965955155],[19.18042490908114,0,-7.516968106415507],[14.302349343068947,0,-5.125534170600346]],[0,1,2,1,3,2,1,4,3,4,1,5,6,4,5,4,7,3,3,7,8,7,9,8,8,9,10,9,11,10,10,11,12,11,13,12,14,10,12,15,14,12,16,14,15,17,16,15,18,19,16,20,18,16,20,16,17,21,20,17,20,21,22,23,20,22]]];

export interface UndertowSourceNativePhase1Mesh {
  id: string;
  pairId: number;
  sourceComponentId: string;
  sourceMaterial: string;
  side: Side;
  areaSquareMeters: number;
  yRange: readonly [number,number];
  vertices: readonly StageVector3[];
  sourceAuditVersion: 'PASS18C_SOURCE_NATIVE_V1';
  authority: 'EXACT_SOURCE_MESH_REVIEW_ONLY';
  shapeConfidence: 'EXACT_TEMPLE01_SOURCE';
  yConfidence: 'EXACT_TEMPLE01_SOURCE';
  connectivityConfidence: 'UNRESOLVED';
  runtimePromotionAuthorized: false;
}
export const UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES:
  readonly UndertowSourceNativePhase1Mesh[] = Object.freeze(SOURCE.map(
    ([sourceComponentId,side,areaSquareMeters,yRange,uniqueVertices,indices],i)=>Object.freeze({
      id:`source-native-phase1-${String(Math.floor(i/2)+1).padStart(2,'0')}-${side.toLowerCase()}`,
      pairId:Math.floor(i/2)+1,sourceComponentId,
      sourceMaterial:sourceComponentId.split('|')[1]!,
      side,areaSquareMeters,yRange,
      vertices:indices.map(index=>uniqueVertices[index]!),
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1' as const,
      authority:'EXACT_SOURCE_MESH_REVIEW_ONLY' as const,
      shapeConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      yConfidence:'EXACT_TEMPLE01_SOURCE' as const,
      connectivityConfidence:'UNRESOLVED' as const,
      runtimePromotionAuthorized:false as const
    })
  ));
export const UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY = Object.freeze({
  reviewOnly:true as const,runtimePromotionAuthorized:false as const,
  sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1' as const,
  meshCount:UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES.length,
  pairCount:4,
  totalSourceTriangleAreaSquareMeters:UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES.reduce((sum,m)=>sum+m.areaSquareMeters,0)
});

type XZ = readonly [number,number];
function insideHard(p:XZ):boolean {
  const ring=UNDERTOW_T21_MACRO_OUTER_BOUNDARY;
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[j]!,b=ring[i]!;
    const cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
    const dot=(p[0]-a[0])*(p[0]-b[0])+(p[1]-a[1])*(p[1]-b[1]);
    if(Math.abs(cross)<1e-8&&dot<=1e-8)return true;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function undertowT21SourceNativePhase1Errors():readonly string[] {
  const errors:string[]=[];
  const existing=new Set([...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
    ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES].map(m=>m.sourceComponentId));
  if(UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES.length!==8 ||
    UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.pairCount!==4 ||
    UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.runtimePromotionAuthorized)errors.push('Phase1 source mesh inventory or authority drift');
  for(const mesh of UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES) {
    if(existing.has(mesh.sourceComponentId))errors.push('source ID collision '+mesh.sourceComponentId);
    existing.add(mesh.sourceComponentId);
    if(mesh.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY'||mesh.runtimePromotionAuthorized||
      mesh.vertices.length<3||mesh.vertices.length%3!==0)errors.push('review-only triangle authority drift '+mesh.id);
    const ys=mesh.vertices.map(v=>v[1]);
    if(Math.abs(Math.min(...ys)-mesh.yRange[0])>1e-9 ||
      Math.abs(Math.max(...ys)-mesh.yRange[1])>1e-9)errors.push('source Y drift '+mesh.id);
    for(let i=0;i+2<mesh.vertices.length;i+=3) {
      const [a,b,c]=mesh.vertices.slice(i,i+3) as StageVector3[];
      if(!a||!b||!c)continue;
      const samples:XZ[]=[[a[0],a[2]],[b[0],b[2]],[c[0],c[2]],
        [(a[0]+b[0])/2,(a[2]+b[2])/2],[(b[0]+c[0])/2,(b[2]+c[2])/2],
        [(c[0]+a[0])/2,(c[2]+a[2])/2],
        [(a[0]+b[0]+c[0])/3,(a[2]+b[2]+c[2])/3]];
      if(samples.some(p=>!insideHard(p))){errors.push('outside hard silhouette '+mesh.id);break;}
    }
  }
  for(let pair=1;pair<=4;pair++) {
    const a=UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES[(pair-1)*2]!;
    const b=UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES[(pair-1)*2+1]!;
    if(a.side!=='POSITIVE_Z'||b.side!=='NEGATIVE_Z'||a.vertices.length!==b.vertices.length||
      Math.abs(a.areaSquareMeters-b.areaSquareMeters)>1e-6)errors.push('pair mismatch '+pair);
    for(const v of a.vertices) {
      if(!b.vertices.some(w=>Math.abs(w[0]+v[0]-0.229368288528164)<0.000001 &&
        Math.abs(w[2]+v[2]-0.194564295456822)<0.000001 &&Math.abs(w[1]-v[1])<0.000001)){
        errors.push('source mirror mismatch '+pair);break;
      }
    }
  }
  return errors;
}
