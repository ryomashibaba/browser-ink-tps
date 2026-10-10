import {Vec3} from 'playcanvas';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {rasterizeStageFootprint} from '../StageFootprint';
import type {StageDefinition,StageSolidDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
import {UndertowCpuDropBridge,type SourceFoot,type T21PhysicalCpuFallFrame} from './UndertowPhase14DPhysicalCpuDrop';
import {auditPhase14JRapierRejoinStep,type Phase14JRejoinResult} from './UndertowPhase14JCollisionRejoinGate';

export interface UndertowPhase14ECpuAdapter {
  observe(cpuId:string,oldPosition:SourceFoot,crowdPosition:SourceFoot,dt:number):boolean;
  advance(cpuId:string,dt:number):T21PhysicalCpuFallFrame|null;
  /** Original-solid Rapier KCC collision authority for QA-only rejoin. */
  validateRejoinStep(from:SourceFoot,to:SourceFoot,dt:number):Phase14JRejoinResult;
  cancel(cpuId:string):void;
  reset():void;
}
interface ActiveDrop {
  bridge:UndertowCpuDropBridge;
  landingSolidId:string;
  side:'positive-z'|'negative-z';
}
const sides=['positive-z','negative-z'] as const;
const kinematicHz=1/60;
const MAX_ORIGINAL_DROP_XZ_METERS=8;
function horizontal(a:SourceFoot,b:SourceFoot):number{
 return Math.hypot(a.x-b.x,a.z-b.z);
}
export function nearestT21SourceSupportedLanding(
 solid:StageSolidDefinition,from:SourceFoot
):SourceFoot{
 if(!solid.footprint||solid.triangleMesh||solid.collisionEnabled===false)
  throw Error('T21_PHASE14E_NO_SOURCE_MASKED_LANDING');
 const fp=solid.footprint;
 const mask=rasterizeStageFootprint(solid.size[0],solid.size[2],fp);
 const radius=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+
  PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters+.02;
 const k=Math.ceil(radius/fp.cellSizeMeters);
 let result:SourceFoot|null=null,min=Number.POSITIVE_INFINITY;
 for(let z=k;z<mask.depthCells-k;z++)for(let x=k;x<mask.widthCells-k;x++){
  if(mask.active[z*mask.widthCells+x]!==1)continue;
  let allActive=true;
  for(let dz=-k;dz<=k&&allActive;dz++)for(let dx=-k;dx<=k;dx++){
   if(Math.hypot(dx,dz)*fp.cellSizeMeters>radius)continue;
   if(mask.active[(z+dz)*mask.widthCells+x+dx]!==1){
    allActive=false;break;
   }
  }
  if(!allActive)continue;
  const p={
   x:solid.center[0]-solid.size[0]/2+(x+.5)*fp.cellSizeMeters,
   y:solid.center[1]+solid.size[1]/2,
   z:solid.center[2]-solid.size[2]/2+(z+.5)*fp.cellSizeMeters
  };
  const d=horizontal(from,p);
  if(d<min){result=p;min=d;}
 }
 if(!result||min>MAX_ORIGINAL_DROP_XZ_METERS)
  throw Error('T21_PHASE14E_SOURCE_LANDING_OUT_OF_RANGE');
 return result;
}
/**
 * T21 ONLY, explicit QA injection. Owns one Rapier stage/world per active CPU.
 * Neither the T20 runtime nor the canonical T21 stage switches automatically.
 */
export class UndertowPhase14ECpuHandoff implements UndertowPhase14ECpuAdapter{
 private readonly active=new Map<string,ActiveDrop>();
 /** Full original geometry for collisions; never the synthetic narrow landing only. */
 private readonly rejoinPhysics:RapierStagePhysics;
 private readonly eligible:ReadonlyArray<{
  side:typeof sides[number];start:SourceFoot;end:SourceFoot;solid:StageSolidDefinition
 }>;
 public constructor(private readonly qaStage:StageDefinition,enabled:boolean){
  if(enabled!==true||
    qaStage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    freeze.activationReady!==false||
    qaStage.solids.length!==25||qaStage.paintSurfaces.length!==17||
    qaStage.navigationLinks?.length!==26)
    throw Error('T21_PHASE14E_NOT_OPTED_IN_TO_INACTIVE_QA_STAGE');
  this.rejoinPhysics=new RapierStagePhysics(kinematicHz,qaStage);
  this.rejoinPhysics.step();
  this.eligible=sides.map(side=>{
   const link=qaStage.navigationLinks?.find(l=>l.id==='first-drop-'+side+'-3');
   const solid=qaStage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-'+side);
   if(!link||link.bidirectional!==false||!solid?.footprint||
     link.start[1]!==7.5||link.end[1]!==3)
     throw Error('T21_PHASE14E_ORIGINAL_LINK_OR_SOLID_CHANGED');
   // Hard-check identity with frozen canonical solids and link endpoints.
   const canonical=freeze.navigationLinks.find(l=>l.id===link.id);
   const frozen=freeze.solids.find(s=>s.id===solid.id);
   if(!canonical||!frozen||
     JSON.stringify([canonical.start,canonical.end])!==
       JSON.stringify([link.start,link.end])||
     solid!==frozen)
     throw Error('T21_PHASE14E_ORIGINAL_SOURCE_IDENTITY_DRIFT');
   return {side,start:{x:link.start[0],y:link.start[1],z:link.start[2]},
     end:{x:link.end[0],y:link.end[1],z:link.end[2]},solid};
  });
 }
 public observe(id:string,from:SourceFoot,to:SourceFoot,dt:number):boolean{
  if(this.active.has(id))return false;
  const frame=auditPhase14CrowdFrame(from,to,dt);
  if(!frame.suspectedInstantTransition||to.y>=from.y-.1)return false;
  // Crowd's NavMesh-snapped off-mesh position need not equal the source
  // link's nominal raster-cell center. The ONLY permitted match is a
  // radius-supported ORIGINAL landing within 2.5m of the live pre-jump foot;
  // this is stricter than trusting a broad off-mesh endpoint distance.
  const match=this.eligible.find(e=>{
    if(Math.abs(from.y-e.start.y)>=1.5||
      Math.sign(from.z)!==Math.sign(e.end.z))return false;
    try{
      return horizontal(from,nearestT21SourceSupportedLanding(e.solid,from))<=2.5;
    }catch{return false;}
  });
  if(!match)return false;
  // Original, unchanged landing footprint + actual collision KCC.
  const target=nearestT21SourceSupportedLanding(match.solid,from);
  const physics=new RapierStagePhysics(kinematicHz,{
    ...this.qaStage,solids:[match.solid],paintSurfaces:[]
  });
  physics.step();
  const bridge=new UndertowCpuDropBridge(physics,from,target);
  this.active.set(id,{bridge,landingSolidId:match.solid.id,side:match.side});
  return true;
 }
 public validateRejoinStep(from:SourceFoot,to:SourceFoot,dt:number):Phase14JRejoinResult{
  return auditPhase14JRapierRejoinStep(this.rejoinPhysics,from,to,dt);
 }
 public advance(id:string,dt:number):T21PhysicalCpuFallFrame|null{
  return this.active.get(id)?.bridge.step(dt)??null;
 }
 public getActiveDrop(id:string):
   {side:'positive-z'|'negative-z';solidId:string}|null{
  const a=this.active.get(id);
  return a?{side:a.side,solidId:a.landingSolidId}:null;
 }
 public cancel(id:string):void{
  const a=this.active.get(id);
  if(a){a.bridge.dispose();this.active.delete(id);}
 }
 public reset():void{
  for(const id of [...this.active.keys()])this.cancel(id);
 }
 public get activeCount():number{return this.active.size;}
}
