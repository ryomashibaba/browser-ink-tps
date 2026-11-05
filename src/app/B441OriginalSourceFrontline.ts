/** B441: SOURCE-authoritative candidate proposals for the front of the
 * already REGISTERED right-low paintable floor; never introduces terrain,
 * offmesh links, actor positions, scores or cross-team route authority.
 * Candidate proposal alone is NOT a navigation or capsule certificate. */
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {stageSolidCollisionEnabled,stageSolidNavigationEnabled}
 from '../stage/StageDefinition';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {SurfaceFlags} from '../ink/types';
export type B441Side='A'|'B';
export interface B441OriginalFrontierProposal {
 readonly sourcePaintSurfaceId:string;
 readonly sourceSolidId:string;
 readonly point:StageVector3;
 readonly sourceFootprintOnly:true;
 readonly navigationAndCapsuleCertified:false;
}
const authorized=(stage:StageDefinition)=>
 stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
 stage.solids.length===25&&stage.paintSurfaces.length===17&&
 stage.navigationLinks?.length===26&&
 stage.paintSurfaces.every(s=>(s.flags&SurfaceFlags.Scoreable)===0);
/** B467 genuine late-foot retry gate: B2/B4 must FIRST physically
 * reach the existing B-side low floor after their recorded early denial.
 * No fake link, path correction, endpoint grant or height tolerance change.
 * The caller must still verify current Rapier foot/goal and ALL native
 * Recast path segments under the original <=0.25m support gate. */
export function b467MayRetryOriginalBFrontFromRealFoot(
 stage:StageDefinition, e:{
  id:string;nativeTick:number;firstDeniedNativeTick:number|null;
  lastRetryNativeTick:number|null;actualOriginalSolidId:string|null;
  foot:readonly [number,number,number];rejoined:boolean;
  active:boolean;grounded:boolean;
 }):boolean{
 const [x,y,z]=e.foot;
 return authorized(stage)&&(e.id==='B2'||e.id==='B4')&&
  e.rejoined&&e.active&&e.grounded&&
  Number.isSafeInteger(e.nativeTick)&&
  Number.isSafeInteger(e.firstDeniedNativeTick)&&
  e.firstDeniedNativeTick!==null&&
  e.nativeTick-e.firstDeniedNativeTick>=60&&
  (e.lastRetryNativeTick===null||
   Number.isSafeInteger(e.lastRetryNativeTick)&&
   e.nativeTick-e.lastRetryNativeTick>=90)&&
  e.actualOriginalSolidId==='UndertowT21D:right-low-team-b'&&
  [x,y,z].every(Number.isFinite)&&y>=2.7&&y<=5.25&&
  z<=-33&&z>=-63;
}

/** Returns conservative, interior samples of EXISTING SOURCE cells.
 * A real Rapier foot probe and whole native Recast path are still REQUIRED
 * by the calling CPU goal selector; they are never inferred from this list. */
export function proposeB441OriginalFrontline(
 stage:StageDefinition,side:B441Side
):readonly B441OriginalFrontierProposal[]{
 if(!authorized(stage)||!['A','B'].includes(side))return [];
 const solidId='UndertowT21D:right-low-team-'+(side==='A'?'a':'b');
 const source=stage.paintSurfaces.find(p=>p.backingSolidId===solidId&&
  p.id===solidId+':paint');
 const solid=stage.solids.find(s=>s.id===solidId);
 // The frozen original BLOCKOUT intentionally declares the footprint
 // on the backing SOLID; its PaintSurface inherits that mask at runtime.
 // Never require an optional duplicate source.footprint to exist.
 const footprint=source?.footprint??solid?.footprint;
 if(!source||!solid||!footprint||!solid.footprint||
    !stageSolidCollisionEnabled(solid)||
    !stageSolidNavigationEnabled(solid)||
    solid.triangleMesh||solid.rotationEulerDegrees||
    (source.flags&SurfaceFlags.Paintable)===0)return [];
 const sign=side==='A'?1:-1;
 const selected:B441OriginalFrontierProposal[]=[];
 const viable=(u:number,v:number)=>pointInStageFootprint(u,v,footprint)&&
  pointInStageFootprint(u,v,solid.footprint!);
 const all:StageVector3[]=[];
 // The canonical source footprints (including holes) are authoritative.
 // Sample >=0.75m interior, avoiding edge/capsule incursions. No authored
 // arbitrary node and no narrowing of original AI agent radius.
 for(let v=.85;v<source.heightMeters-.85;v+=1.4)
  for(let u=.85;u<source.widthMeters-.85;u+=1.4){
   if(!viable(u,v)||!viable(u-.75,v)||!viable(u+.75,v)||
      !viable(u,v-.75)||!viable(u,v+.75)||!viable(u-.52,v-.52)||
      !viable(u+.52,v+.52)||!viable(u-.52,v+.52)||
      !viable(u+.52,v-.52))continue;
   const x=u-source.widthMeters/2,z=v-source.heightMeters/2;
   const p:StageVector3=[
    source.center[0]+source.uAxis[0]*x+source.vAxis[0]*z,
    source.center[1]+source.uAxis[1]*x+source.vAxis[1]*z,
    source.center[2]+source.uAxis[2]*x+source.vAxis[2]*z];
   if(!p.every(Number.isFinite)||p[2]*sign<33||p[2]*sign>63||
      p[1]<2.7||p[1]>5.25)continue;
   all.push(p);
  }
 // Prefer candidate points nearer the original midline but diversify
 // across the ORIGINAL polygon, not across a manufactured crossing.
 all.sort((a,b)=>Math.abs(a[2])-Math.abs(b[2])||
  a[0]-b[0]||a[1]-b[1]);
 for(const point of all){
  if(selected.some(x=>Math.hypot(x.point[0]-point[0],
      x.point[2]-point[2])<2.0))continue;
  selected.push({sourcePaintSurfaceId:source.id,
   sourceSolidId:solidId,point,sourceFootprintOnly:true,
   navigationAndCapsuleCertified:false});
  if(selected.length===32)break;
 }
 return selected;
}
