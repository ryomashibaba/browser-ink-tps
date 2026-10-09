import type { StageVector3 } from '../StageDefinition';
import {UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES} from './UndertowSpillwayPhase9DownfaceSourceGeometry';
/** Phase12A pinned Temple01 original 16 further 3D source face samples.
 * Source SHA256 a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046.
 * Binary64: [source 3D edge gap, exact original-derived project XYZ x3].
 * NOT full-source component(s), welded topology, collider, floor or nav.
 */
const PACKED='H4sIAAAAAAAC/13SfUzMcRwH8LtTuuU87OIeSrh0v/r1u86dqyXKfV3XUqbU3JFId66pw0oeUh4KKRnSJu2i2dR2G4pLVCRfc0ZkeljkYVJZjsY63dKDMPL9/jbfP1/77Pd5/z57MxiT7+DaiImwdi8QoPjzXMD143GRq0kKIp+c4mEnvRq1zi9F2GvfjBiX51CQwWFRBTyT8lHYIU9gVIC/n1Nwwd2huECDTQhbPdxbP4jk2AnlkmpCTcDK5BxZahw9L9UdL6lsEEKGj5x9dW6ZUr131MU2w+/fPi6wNJGvv8XzocHxZafoHYldKmaMzvfjw6yeowO2URH2izsyz2pJCawJvxd8TtqunB2T9rawwB/nr2wKI/XDThD5ZA437HXAL+nyuBQ7J1rBLTExcL4llhsHc5cp8L63ncC5I9kDks9CasysUOzyrCuPAiN9YAnnfknrInreEB3SIH3oAakHQQXm+RuUr6sFcQE2lJ8N1IPFR7ItFDymu6TSTJdjlwq2Oub5EP85DzvKd5OVqq1pl+F9pbn2+C0FBNzYeLvL/QntLtvXq3w0BOyNFY+cd3hhT9AFVbWdoqBsqzo1bbAN368s88KlhcH0nQqjx/rH90uw5zezxxNtrtBs9xRs09Hzxl310YV6J/ivfgzuCrVj7Kg/xDlMOkurfiZAXmb689ywG/s3pMvMFJ7vE58O7LozDaD+TfF+/FXyUQZRn1p8Ky9YzQToCW9map/Tntfd1GI4Q4CuHf4xFr4Ce3ZAUsb7XHeA7leVrwnfZyLxvh/FzDqpSABanKKuWVJozxp52Zlg54Mee7dvVp4Iu3pd3xHHSQlA/Tuw+anQnYv+lweCk4d6X+VNBchRz5AviM0vX5ovxV7h6H3K8WXhfJ4XM0bmyUPxvgwrxan7JQbZYzmz0sS038ol+w2LCFD4bvhNRKIC++cPISr5YiFA/VPd211kzUD52cD2aiJdMEcCGlLX6MrbZdg7mB29jSeI/5yHHeX75MrfM1Yqw/tCjZtWMgcIUGxN+a4vor1KY5U9rCdAlP5woCTHCztzVcX5NDsFUP/QnVCf0J3siVrvk1Ml2D3T62tf7OWAmaxszfgA7T+FKWym3Rn8BggDjA0ABQAA';
const FACE=[60006,60160,60474,34848,28318,35641,69626,69776,
  61516,61422,61948,34876,26116,35643,69634,69810] as const;
const EDGE=[1,2,1,3,2,0,0,3,1,0,0,3,2,0,0,3] as const;
const IDS=[
 [359405,359406,359407],[359713,359714,359715],[360277,360278,360279],
 [316080,316082,316085],[307319,307320,307321],[317566,317568,317567],
 [374669,374670,374671],[374951,374952,374953],
 [362310,362311,362312],[362122,362123,362124],[363024,363025,363026],
 [316112,316114,316117],[304977,304978,304979],[317570,317572,317571],
 [374685,374686,374687],[374993,374994,374995]
] as const;
const FAMILY=['FloorLine02','FloorLine02','FloorLine02','WallMetal00',
 'PillarBase02','Glass01','GlassEdge00','GlassEdge00','FloorLine02',
 'FloorLine02','FloorLine02','WallMetal00','PillarBase02','Glass01',
 'GlassEdge00','GlassEdge00'] as const;
const ORIENTATION=['ORIGINAL_NEAR_VERTICAL','ORIGINAL_UP_FACING',
 'ORIGINAL_DOWN_FACING','ORIGINAL_NEAR_VERTICAL','ORIGINAL_UP_FACING',
 'ORIGINAL_NEAR_VERTICAL','ORIGINAL_DOWN_FACING','ORIGINAL_UP_FACING',
 'ORIGINAL_NEAR_VERTICAL','ORIGINAL_UP_FACING','ORIGINAL_DOWN_FACING',
 'ORIGINAL_NEAR_VERTICAL','ORIGINAL_UP_FACING','ORIGINAL_NEAR_VERTICAL',
 'ORIGINAL_DOWN_FACING','ORIGINAL_UP_FACING'] as const;
const OBJECT={
 FloorLine02:'Fld_Temple01_mesh05_low57_1__FloorLine02',
 WallMetal00:'Fld_Temple01_group20357_1__WallMetal00',
 PillarBase02:'Fld_Temple01_group20339_10__PillarBase02',
 Glass01:'Fld_Temple01_group20361_1__Glass01',
 GlassEdge00:'Fld_Temple01_pCube21025_1__GlassEdge00'
} as const;
export type Phase12SourceFamily=keyof typeof OBJECT;
export interface UndertowPhase12FamilyFace{
 readonly id:string;readonly vertices:readonly StageVector3[];
 readonly sourceFamily:Phase12SourceFamily;readonly sourceUnderfaceId:string;
 readonly sourceUnderfaceEdgeIndex:number;readonly originalSourceObject:string;
 readonly originalSourceMaterial:string;readonly originalFaceIndex:number;
 readonly originalFaceOBJVertexIds:readonly number[];
 readonly originalOrientation:typeof ORIENTATION[number];
 readonly exactSource3DGapMeters:number;
 readonly fullOriginalConnectedComponent:'UNKNOWN';
 readonly gameplayFloorColliderNavAuthority:'NONE';
 readonly reviewDiagnosticOnly:true;readonly runtimePromotionAuthorized:false;
}
async function decode():Promise<readonly UndertowPhase12FamilyFace[]>{
 if(typeof DecompressionStream==='undefined')throw Error('Phase12 native gzip decoder required');
 const zip=Uint8Array.from(atob(PACKED),c=>c.charCodeAt(0));
 const buffer=new ArrayBuffer(zip.byteLength);new Uint8Array(buffer).set(zip);
 const ab=await new Response(new Blob([buffer]).stream().pipeThrough(
  new DecompressionStream('gzip'))).arrayBuffer();
 if(ab.byteLength!==1280)throw Error('Phase12 original Float64 byte-length drift');
 const dv=new DataView(ab);
 const result:UndertowPhase12FamilyFace[]=[];
 for(let i=0;i<16;i++){
  const gap=dv.getFloat64(i*80,true);
  const vertices:StageVector3[]=Array.from({length:3},(_,j)=>[
    dv.getFloat64(i*80+8+j*24,true),dv.getFloat64(i*80+16+j*24,true),
    dv.getFloat64(i*80+24+j*24,true)]);
  if(!Number.isFinite(gap)||gap<0||gap>0.3||
     vertices.flat().some(x=>!Number.isFinite(x)))
   throw Error('Phase12 nonfinite original data '+i);
  const family=FAMILY[i]!;
  result.push(Object.freeze({
   id:'phase12-original-face-'+FACE[i],vertices,sourceFamily:family,
   sourceUnderfaceId:UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[i<8?0:1]!.sourceComponentId,
   sourceUnderfaceEdgeIndex:EDGE[i]!,originalSourceObject:OBJECT[family],
   originalSourceMaterial:'Fld_Temple01_'+family,originalFaceIndex:FACE[i]!,
   originalFaceOBJVertexIds:IDS[i]!,originalOrientation:ORIENTATION[i]!,
   exactSource3DGapMeters:gap,fullOriginalConnectedComponent:'UNKNOWN' as const,
   gameplayFloorColliderNavAuthority:'NONE' as const,
   reviewDiagnosticOnly:true as const,runtimePromotionAuthorized:false as const
  }));
 }
 return Object.freeze(result);
}
export const UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES=await decode();
export const UNDERTOW_T21_PHASE12_FAMILY_SUMMARY=Object.freeze({
 sourceFaceSamples:16,materialFamilies:5,fullOriginalSourceComponentsAdded:0,
 sourceInventoryFloorsAdded:0,verifiedConnectivity:0,reviewOnly:true as const,
 runtimePromotionAuthorized:false as const
});
export function undertowT21Phase12FamilyErrors():readonly string[]{
 const e:string[]=[];
 const ids=new Set<number>();
 if(UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES.length!==16)e.push('16 source sample count drift');
 for(const f of UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES){
  if(ids.has(f.originalFaceIndex))e.push('duplicate original OBJ face ID');
  ids.add(f.originalFaceIndex);
  if(f.vertices.length!==3||f.originalFaceOBJVertexIds.length!==3||
     f.fullOriginalConnectedComponent!=='UNKNOWN'||f.runtimePromotionAuthorized||
     f.gameplayFloorColliderNavAuthority!=='NONE')e.push('source-only authority drift');
 }
 return e;
}
