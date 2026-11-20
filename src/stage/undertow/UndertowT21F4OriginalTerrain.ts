import type {StageSolidDefinition,StageVector3} from '../StageDefinition';
import {selectStageTriangleFaces} from '../StageTriangleMesh';
import {undertowTemple01ModelXZToProjectXZ} from './UndertowSpillwayModelXZGeometry';
import {UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT} from './UndertowSpillwayRemodelGeometryAudit';

const SOURCE_SHA='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const FACE_GROUPS={
 'center-floors':[110,111,69150,69151,69152,69153],
 'center-step-sides':[6403,6404,6405,6428,6429,6430,6564,6565,6570,6571],
 'floorline-positive-z':[37118,37119],
 'floorline-negative-z':[37112,37113]
} as const;
const CORRIDOR_FACE_GROUPS={
 'corridor-floors':[
  35982,35983,35996,35997,36024,36025,36030,36031,36036,36037,36052,36053,
  36248,36249,36268,36269,36286,36287,36288,36289,
  36483,36494,36495,36514,36515,36531,36532,36533,36544,36545,
  69239,69240,69241,69243,69244,69245,
  69286,69287,69292,69293,69294,69295,69298,69299,69304,69305,69306,69307
 ],
 'corridor-sides':[
  6340,6341,6342,6356,6357,6358,6396,6418,6421,6443,6524,6530,6531,6537,
  13264,13332,13333,13805,13850,13851,36246,36247,36278,36279,36472,
  36490,36491,36538,36540,36541,36542,36543,36546,36547
 ]
} as const;
const INGRESS_FACE_GROUPS={
 'ingress-floors':[
  1314, 1315, 1320, 1321, 1326, 1327, 1332, 1333, 1758, 1759, 1764, 1765, 1770, 1771, 1776, 1777,
  4098, 4099, 4100, 4101, 4362, 4363, 4368, 4369, 4388, 4389, 4398, 4399, 4408, 4409, 4418, 4419,
  4428, 4429, 4436, 4437, 4444, 4445, 4452, 4453, 4504, 4505, 4512, 4513, 4520, 4521, 4528, 4529,
  4568, 4569, 4572, 4573, 4584, 4585, 4588, 4589, 4592, 4593, 4596, 4597, 4600, 4601, 4604, 4605,
  4608, 4609, 4612, 4613, 4616, 4617, 4620, 4621, 4664, 4665, 4668, 4669, 4680, 4681, 4684, 4685,
  4688, 4689, 4692, 4693, 4696, 4697, 4700, 4701, 4704, 4705, 4708, 4709, 4712, 4713, 4716, 4717,
  7254, 7255, 7258, 7259, 7342, 7343, 7346, 7347,
  35942, 35943, 35948, 35949, 36076, 36077, 36107, 36113, 36120, 36124, 36125, 36150, 36151, 36186,
  36200, 36201, 36848, 36849, 36868, 36869, 36900, 36901, 36906, 36907, 37236, 37237, 37242, 37243,
  44768, 44769, 44770, 44771, 44780, 44781, 44782, 44783,
  62936, 62937,
  69992, 69996, 69997, 69998, 69999, 70011, 70046,
 ],
 'ingress-sides':[
  4070, 4071, 4074, 4075, 4076, 4077, 4080, 4081, 4364, 4365, 4366, 4367, 4370, 4371, 4372, 4373,
  4386, 4387, 4396, 4397, 4415, 4425, 4426, 4427, 4430, 4431, 4432, 4433, 4434, 4435, 4438, 4439,
  4440, 4441, 4442, 4443, 4446, 4447, 4448, 4449, 4450, 4451, 4454, 4455, 4456, 4457, 4502, 4503,
  4506, 4507, 4508, 4509, 4510, 4511, 4514, 4515, 4516, 4517, 4518, 4519, 4522, 4523, 4524, 4525,
  4526, 4527, 4530, 4531, 4532, 4533, 4566, 4567, 4570, 4571, 4582, 4583, 4586, 4587, 4590, 4591,
  4594, 4595, 4598, 4599, 4602, 4603, 4606, 4607, 4610, 4611, 4614, 4615, 4618, 4619, 4662, 4663,
  4666, 4667, 4678, 4679, 4682, 4683, 4686, 4687, 4690, 4691, 4694, 4695, 4698, 4699, 4702, 4703,
  4706, 4707, 4710, 4711, 4714, 4715,
  6836, 6837,
  7558, 7559, 7614, 7615,
  13265, 13316, 13317, 13804, 13866, 13867,
  37070, 37071, 37110, 37111, 37114, 37115, 37116, 37117, 37234, 37235, 37240, 37241,
  38533, 39113,
 ],
} as const;
type Group=keyof typeof FACE_GROUPS;
type CorridorGroup=keyof typeof CORRIDOR_FACE_GROUPS|keyof typeof INGRESS_FACE_GROUPS;
type Terrain=Readonly<Record<Group,StageSolidDefinition>&Partial<Record<CorridorGroup,StageSolidDefinition>>>;

const T21_F4_ORIGINAL_CORRIDOR_ENDPOINTS=[
 [69151,69292],[69153,69304]
] as const;
const checkedTerrain=new WeakSet<Terrain>();

export function isT21F4OriginalTerrain(terrain:Terrain):boolean{
 return checkedTerrain.has(terrain);
}

/** Input comes from the local extractor, which checks the entire OBJ before parsing. */
export function parseT21F4OriginalTerrain(input:unknown):Terrain{
 const seed=input as {sourceSHA256?:unknown;groups?:Partial<Record<Group|CorridorGroup,unknown>>}|null;
 if(seed?.sourceSHA256!==SOURCE_SHA||!seed.groups)
  throw Error('F4_ORIGINAL_TERRAIN_REQUIRES_PINNED_LOCAL_SOURCE');
 const expanded=Object.hasOwn(seed.groups,'corridor-floors')||Object.hasOwn(seed.groups,'corridor-sides');
 const ingress=Object.hasOwn(seed.groups,'ingress-floors')||Object.hasOwn(seed.groups,'ingress-sides');
 if(ingress&&!expanded)throw Error('F4_ORIGINAL_INGRESS_REQUIRES_CORRIDORS');
 const groups=ingress?{...FACE_GROUPS,...CORRIDOR_FACE_GROUPS,...INGRESS_FACE_GROUPS}:
  expanded?{...FACE_GROUPS,...CORRIDOR_FACE_GROUPS}:FACE_GROUPS;
 const terrain={} as Record<Group|CorridorGroup,StageSolidDefinition>;
 const modelVertices=new Map<number,StageVector3>();
 const yOffset=UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectNormalization.modelToProjectYOffset;
 for(const [group,faceIds] of Object.entries(groups) as [Group|CorridorGroup,readonly number[]][]){
  const rows=seed.groups[group];
  if(!Array.isArray(rows)||rows.length!==faceIds.length)
   throw Error('F4_ORIGINAL_TERRAIN_FACE_COUNT_'+group);
  const vertices:StageVector3[]=[];
  const indices:number[]=[];
  const localIndices=new Map<number,number>();
  for(const [i,row] of rows.entries()){
   if(!Array.isArray(row)||row[0]!==faceIds[i]||
      !Array.isArray(row[1])||row[1].length!==3)
    throw Error('F4_ORIGINAL_TERRAIN_FACE_ID_'+group);
   for(const corner of row[1]){
    if(!Array.isArray(corner)||!Number.isSafeInteger(corner[0])||
       corner[0]<1||corner[0]>375948||
       !Array.isArray(corner[1])||corner[1].length!==3||
       !corner[1].every(Number.isFinite))
     throw Error('F4_ORIGINAL_TERRAIN_VERTEX_'+group);
    const [id,[mx,my,mz]]=corner;
    const previous=modelVertices.get(id);
    if(previous&&(previous[0]!==mx||previous[1]!==my||previous[2]!==mz))
     throw Error('F4_ORIGINAL_TERRAIN_INCONSISTENT_VERTEX_ID');
    modelVertices.set(id,[mx,my,mz]);
    let index=localIndices.get(id);
    if(index===undefined){
     index=vertices.length;
     const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
     vertices.push([x,my+yOffset,z]);
     localIndices.set(id,index);
    }
    indices.push(index);
   }
  }
  const mesh=selectStageTriangleFaces({vertices,indices},faceIds.map((_,i)=>i));
  const ranges=([0,1,2] as const).map(axis=>
   Math.max(...mesh.vertices.map(v=>v[axis]))-Math.min(...mesh.vertices.map(v=>v[axis])));
  for(const vertex of mesh.vertices)Object.freeze(vertex);
  Object.freeze(mesh.vertices);
  Object.freeze(mesh.indices);
  terrain[group]=Object.freeze({
   id:'T21V28:F4-local-original:'+group,
   center:Object.freeze([0,0,0] as const),
   size:Object.freeze([ranges[0]!,ranges[1]!,ranges[2]!] as const),
   material:'medium',render:true,projectileBlocker:true,cameraBlocker:true,
   collisionEnabled:true,navigationEnabled:true,triangleMesh:Object.freeze(mesh)
  });
 }
 Object.freeze(terrain);
 checkedTerrain.add(terrain);
 return terrain;
}

/** Derive local waypoint candidates directly from the verified mesh faces. */
export function t21F4OriginalCorridorEndpoints(terrain:Terrain):readonly (readonly [StageVector3,StageVector3])[]{
 const corridor=terrain['corridor-floors'];
 if(!corridor)return [];
 const centroid=(solid:StageSolidDefinition,face:number):StageVector3=>{
  const mesh=solid.triangleMesh!;
  const [a,b,c]=mesh.indices.slice(face*3,face*3+3).map(i=>mesh.vertices[i]!);
  return Object.freeze([
   (a![0]+b![0]+c![0])/3,(a![1]+b![1]+c![1])/3,(a![2]+b![2]+c![2])/3
  ] as const);
 };
 return Object.freeze(T21_F4_ORIGINAL_CORRIDOR_ENDPOINTS.map(([low,slope])=>Object.freeze([
  centroid(terrain['center-floors'],FACE_GROUPS['center-floors'].indexOf(low)),
  centroid(corridor,CORRIDOR_FACE_GROUPS['corridor-floors'].indexOf(slope))
 ] as const)));
}

export type T21F4OriginalTerrain=Terrain;
