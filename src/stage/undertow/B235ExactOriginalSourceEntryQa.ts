/**
 * B235: source-provenance preserved QA geometry ONLY.
 * Nothing here registers a polygon in the real F3 CpuAgentSystem,
 * modifies a frozen stage object, or invents a Recast offmesh link.
 */
import type {StageDefinition,StageSolidDefinition,StageVector3} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as ORIGINAL}
 from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {SurfaceFlags} from '../../ink/types';

export type B235Side='POSITIVE_Z'|'NEGATIVE_Z';
const ids=[
 'floor-concrete01','slope00-outer','floor-concrete02',
 'slope00-inner','slope01'
] as const;
export const B235_QA_PREFIX='B235_EXACT_CI688_QA:';
export function b235ExactSourceSideQaStage(side:B235Side):StageDefinition{
 if(ORIGINAL.activationReady!==false||ORIGINAL.solids.length!==25||
   ORIGINAL.paintSurfaces.length!==17||
   ORIGINAL.navigationLinks.length!==26||
   ORIGINAL.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
  throw Error('B235_FROZEN_ORIGINAL_STAGE_AUTHORITY_REQUIRED');
 const suffix=side==='POSITIVE_Z'?'-positive-z':'-negative-z';
 const originals=ids.map(name=>FACES.find(face=>
   face.side===side&&face.id==='underpass-route-'+name+suffix));
 if(originals.some(f=>!f)||
    new Set(originals.map(f=>f!.id)).size!==5)
  throw Error('B235_EXACT_FIVE_CI688_SOURCE_FACES_MISSING');
 const additions:StageSolidDefinition[]=originals.map(original=>{
  const face=original!;
  const v=face.mesh.vertices;
  const size:StageVector3=[
   Math.max(...v.map(p=>p[0]))-Math.min(...v.map(p=>p[0])),
   Math.max(...v.map(p=>p[1]))-Math.min(...v.map(p=>p[1])),
   Math.max(...v.map(p=>p[2]))-Math.min(...v.map(p=>p[2]))
  ];
  return {id:B235_QA_PREFIX+face.id,center:[0,0,0],
   size,material:'medium',render:false,cameraBlocker:false,
   projectileBlocker:false,collisionEnabled:true,
   navigationEnabled:true,triangleMesh:face.mesh};
 });
 const qa:StageDefinition={
  metadata:{
   id:'b235-native-original-cpu-to-ci688-entry-qa-'+side,
   displayName:'B235 original source only - explicit missing face entry QA',
   worldBounds:ORIGINAL.worldBounds,
   teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
   teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
   tacticalNodes:[],splatZones:[]
  },
  solids:[...ORIGINAL.solids,...additions],
  paintSurfaces:ORIGINAL.paintSurfaces,
  navigationLinks:ORIGINAL.navigationLinks
 };
 b235AssertIsolatedSourceStage(qa,side);
 return qa;
}
export function b235AssertIsolatedSourceStage(s:StageDefinition,side:B235Side):void{
 const suffix=side==='POSITIVE_Z'?'-positive-z':'-negative-z';
 if(s.metadata.id!=='b235-native-original-cpu-to-ci688-entry-qa-'+side||
  s.solids.length!==30||
  s.paintSurfaces!==ORIGINAL.paintSurfaces||
  s.navigationLinks!==ORIGINAL.navigationLinks||
  s.solids.slice(0,25).some((v,i)=>v!==ORIGINAL.solids[i])||
  s.paintSurfaces.length!==17||s.navigationLinks?.length!==26||
  s.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
  throw Error('B235_SOURCE_QA_25_17_26_FROZEN_AUTHORITY_VIOLATION');
 for(let i=0;i<ids.length;i++){
  const face=FACES.find(f=>f.side===side&&
   f.id==='underpass-route-'+ids[i]+suffix);
  const solid=s.solids[25+i];
  if(!face||!solid||solid.id!==B235_QA_PREFIX+face.id||
    solid.triangleMesh!==face.mesh||solid.navigationEnabled!==true||
    solid.collisionEnabled!==true||solid.render!==false)
   throw Error('B235_FORGED_OR_UNTRUSTED_CI688_NAV_COLLIDER');
 }
}
