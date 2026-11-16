/**
 * B216: additional SOURCE-ONLY ink aim PROPOSALS when the real B64
 * native patrol-direction floor patches have been exhausted. A proposal
 * is never a playable floor, projectile hit or path; Rapier validates
 * the actual physical floor and projectile sight in the calling app.
 */
import {Vec3} from 'playcanvas';
import type {PaintSurface} from '../ink/PaintSurface';
import {SurfaceFlags,Team} from '../ink/types';
export interface B216SourcePoint{readonly x:number;readonly y:number;readonly z:number}
export interface B216OriginalCandidate extends B216SourcePoint{
 readonly radiusMeters:number;readonly angleRadians:number;
}
/** Registered original paint FLOOR at a distinct vertical height, not
 * a collision floor, shot authorization or original route. SOURCE dense
 * fallback only; caller must verify Rapier foot+target and shot ray. */
export function b216OriginalRegisteredVerticalFloorAim(
 surface:PaintSurface,point:B216SourcePoint
):B216SourcePoint|null{
 const n=surface.normal,c=surface.center;
 if(!surface.id.startsWith('UndertowT21D:')||surface.isScoreable||
    (surface.baseFlags&SurfaceFlags.Paintable)===0||
    (surface.baseFlags&SurfaceFlags.Floor)===0||
    (surface.baseFlags&SurfaceFlags.Wall)!==0||
    ![point.x,point.y,point.z,c.x,c.y,c.z,n.x,n.y,n.z]
      .every(Number.isFinite)||Math.abs(n.y)<.8)return null;
 // Exact intersection with the EXISTING registered paint plane.
 const y=c.y-(n.x*(point.x-c.x)+n.z*(point.z-c.z))/n.y;
 const heightDelta=Math.abs(y-point.y);
 if(!Number.isFinite(y)||heightDelta<=.35||heightDelta>2)return null;
 const p=surface.projectWorldPoint(new Vec3(point.x,y,point.z));
 if(!p.inside||p.planeDistance>.005)return null;
 const u=Math.min(surface.widthCells-1,Math.floor(
   Math.max(0,p.u)/surface.cellSize));
 const v=Math.min(surface.heightCells-1,Math.floor(
   Math.max(0,p.v)/surface.cellSize));
 if(!surface.isCellActive(u,v))return null;
 const flags=surface.flagsGrid[surface.index(u,v)]??0;
 if((flags&SurfaceFlags.Paintable)===0||
    (flags&(SurfaceFlags.Wall|SurfaceFlags.Scoreable))!==0)return null;
 return {x:point.x,y,z:point.z};
}
export function b216OriginalFootBackfillCandidates(
 foot:B216SourcePoint,realAuditedGoal:B216SourcePoint,
 nativeWeaponFacing?:B216SourcePoint,
 distanceBand:'LOCAL'|'DISTANT_ORIGINAL_ONLY'|'DENSE_ORIGINAL_ONLY'='LOCAL'
):readonly B216OriginalCandidate[]{
 if(distanceBand!=='LOCAL'&&distanceBand!=='DISTANT_ORIGINAL_ONLY'&&
    distanceBand!=='DENSE_ORIGINAL_ONLY')return [];
 if(![foot.x,foot.y,foot.z,realAuditedGoal.x,realAuditedGoal.y,
  realAuditedGoal.z].every(Number.isFinite))return [];
 const dx=realAuditedGoal.x-foot.x,dz=realAuditedGoal.z-foot.z;
 const span=Math.hypot(dx,dz);
 if(!Number.isFinite(span))return [];
 // Once the REAL Recast goal is reached, its foot-to-goal vector no
 // longer supplies a heading. Only the already-live CPU weapon facing
 // may orient local paint proposals. No authored fallback direction,
 // new route, collision, target Actor or unverified ink cell is added.
 // Every proposal still requires the caller's actual original-grid
 // ownership sample and registered Rapier foot/shot-line approval.
 const atGoal=span<.40;
 // Dense SOURCE research is always centered on the current real foot,
 // never on a speculative patrol direction or navigation destination.
 if(distanceBand==='DENSE_ORIGINAL_ONLY'&&!atGoal)return [];
 if(atGoal&&(!nativeWeaponFacing||
  ![nativeWeaponFacing.x,nativeWeaponFacing.y,nativeWeaponFacing.z]
   .every(Number.isFinite)||
  Math.hypot(nativeWeaponFacing.x,nativeWeaponFacing.z)<.05))return [];
 const heading=atGoal?
  Math.atan2(nativeWeaponFacing!.z,nativeWeaponFacing!.x):
  Math.atan2(dz,dx);
 const result:B216OriginalCandidate[]=[];
 // The original B64 frontal sweep runs FIRST. At a REAL reached
 // patrol goal its direction disappears, so search the already-existing
 // B64 1.7m short radius as well as B216's 2.5/3.5m lateral/rear
 // candidates. Every location remains just an untrusted proposal until
 // ORIGINAL ownerGrid, Rapier supports, ray and weapon range approve it.
 // No geometry, nav path, actor relocation or firing bypass is created.
 // Research-only OUTER proposals are not accepted aims, paths, ink or hits.
 // The caller must separately verify the real source grid, actual weapon
 // range and both original Rapier support and first blocking ray.
 const radii=distanceBand==='DENSE_ORIGINAL_ONLY'?
  // True 180s P2 measured >4k late NO-AIM checks for B1/B2/B3
  // while their Rapier feet CONTINUED moving. Their nearby 5.5m grid
  // is often already OWN; try existing farther original floor only
  // after the weapon-ready 120+ no-aim drought trigger.
  // No candidate is fireable until live range, ownerGrid, original
  // foot+target support and first physical projectile ray ALL pass.
  ([1.2,1.7,2.5,3.5,4.5,5.5,7.5,10] as const):
  distanceBand==='DISTANT_ORIGINAL_ONLY'?
  ([4.5,5.5] as const):
  atGoal?([1.7,2.5,3.5] as const):([2.5,3.5] as const);
 // Preserve the proven six offset proposals while en route. At a
 // genuinely reached native goal B64's foot-to-goal forward vector
 // vanishes, so complete all eight 45-degree directions around the
 // ACTUAL finite weapon-facing vector (including forward and its
 // previously omitted diagonal). These remain UNTRUSTED proposals.
 const offsets=distanceBand==='DENSE_ORIGINAL_ONLY'?
  Array.from({length:16},(_,i)=>i*Math.PI/8):
  atGoal?
  ([0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,
    -3*Math.PI/4,-Math.PI/2,-Math.PI/4] as const):
  ([Math.PI/2,-Math.PI/2,Math.PI,-3*Math.PI/4,
    3*Math.PI/4,Math.PI/4] as const);
 for(const distance of radii){
  for(const offset of offsets){
   const angle=heading+offset;
   result.push({x:foot.x+distance*Math.cos(angle),y:foot.y+.1,
    z:foot.z+distance*Math.sin(angle),radiusMeters:distance,
    angleRadians:offset});
  }
 }
 return result;
}

/** F3 REAL source-only projectile sight. Two DIFFERENT authentic registered
 * solids may both be valid shooting endpoints: a bullet can cross a
 * physical floor seam even when a CPU has NO certified walkable route.
 * This does NOT certify navigation, target contact, combat damage or scoring.
 * Both supports and first actual original Rapier ray are authoritative. */
export interface B216RegisteredOriginalHit {
 readonly solidId:string;
 readonly point:B216SourcePoint;
}
export function b216RealSourcePaintShotLineClear(x:{
 actualFoot:B216SourcePoint;actualTarget:B216SourcePoint;
 footSupport:B216RegisteredOriginalHit|null;
 targetSupport:B216RegisteredOriginalHit|null;
 firstStageBlock:B216RegisteredOriginalHit|null;
}):boolean{
 const valid=(p:B216SourcePoint)=>[p.x,p.y,p.z].every(Number.isFinite);
 const f=x.footSupport,t=x.targetSupport,b=x.firstStageBlock;
 if(!valid(x.actualFoot)||!valid(x.actualTarget)||
    !f||!t||!f.solidId||!t.solidId||
    !valid(f.point)||!valid(t.point)||
    Math.abs(f.point.y-x.actualFoot.y)>.25||
    Math.abs(t.point.y-x.actualTarget.y)>.25)
   return false;
 // An earlier source collider blocks a real projectile. A hit on the
 // ACTUAL target collider at the requested target is not a wall veto.
 // Registered foot/target solid IDs are deliberately NOT required equal:
 // that condition describes a walking seam, not a physical ink shot.
 return !b||(Boolean(b.solidId)&&b.solidId===t.solidId&&
    valid(b.point)&&Math.hypot(
      b.point.x-x.actualTarget.x,
      b.point.y-x.actualTarget.y,
      b.point.z-x.actualTarget.z)<.22);
}

/**
 * SOURCE P2: when real weapon-ready attempts keep finding NO AIM, look
 * through a bounded sample of ACTUAL registered, active, unowned source
 * ownerGrid cells. The old fixed-angle scan can miss small uncovered
 * patches between its 16 rays. These are untrusted *proposals*, not
 * projectiles, score, actor movement or new stage geometry.
 *
 * One nearest candidate per 16 physical directions and two distance
 * bands bounds downstream genuine Rapier shot-line checks to <=32.
 */
export function b216OriginalUnpaintedGridCandidates(
 surfaces:readonly PaintSurface[],foot:B216SourcePoint,team:Team.A|Team.B,
 weaponRangeMeters:number
):readonly Vec3[]{
 if(![foot.x,foot.y,foot.z,weaponRangeMeters].every(Number.isFinite)||
    weaponRangeMeters<1.3)return [];
 const radius=Math.min(12,weaponRangeMeters);
 const picked=new Map<number,{distanceSq:number;point:Vec3}>();
 for(const surface of surfaces){
  if(!surface.id.startsWith('UndertowT21D:')||
     surface.isScoreable||
     (surface.baseFlags&SurfaceFlags.Paintable)===0||
     (surface.baseFlags&SurfaceFlags.Floor)===0||
     (surface.baseFlags&SurfaceFlags.Wall)!==0)continue;
  const projected=surface.projectWorldPoint(
   new Vec3(foot.x,foot.y,foot.z));
  // Basis projection is used ONLY to limit the iteration region.
  // It grants no floor/support. Leave room for true sloped surfaces.
  // Never skip odd raster cells: the earlier 0.5m stride skipped a
  // single 0.25m neutral cell even when it was physically reachable.
  // This expensive complete scan is called only after the existing
  // 120 real no-aim decisions, then at most once per 30 ready checks.
  const reach=radius+2;
  const lowX=Math.max(0,Math.floor((projected.u-reach)/surface.cellSize));
  const highX=Math.min(surface.widthCells-1,
   Math.ceil((projected.u+reach)/surface.cellSize));
  const lowY=Math.max(0,Math.floor((projected.v-reach)/surface.cellSize));
  const highY=Math.min(surface.heightCells-1,
   Math.ceil((projected.v+reach)/surface.cellSize));
  for(let y=lowY;y<=highY;y++){
   for(let x=lowX;x<=highX;x++){
    if(!surface.isCellActive(x,y))continue;
    const idx=surface.index(x,y),flags=surface.flagsGrid[idx]??0;
    if(surface.ownerGrid[idx]===team||
       (flags&SurfaceFlags.Paintable)===0||
       (flags&(SurfaceFlags.Wall|SurfaceFlags.Scoreable))!==0)
     continue;
    const point=surface.localToWorld(
     Math.min(surface.widthMeters,(x+.5)*surface.cellSize),
     Math.min(surface.heightMeters,(y+.5)*surface.cellSize));
    if(!surface.projectWorldPoint(point).inside||
       Math.abs(point.y-foot.y)>2)continue;
    const dx=point.x-foot.x,dz=point.z-foot.z;
    const distanceSq=dx*dx+dz*dz;
    if(distanceSq<1||distanceSq>radius*radius)continue;
    const angle=(Math.atan2(dz,dx)+Math.PI)/(2*Math.PI);
    const sector=Math.min(15,Math.floor(angle*16));
    const key=sector+(distanceSq>25?16:0);
    const previous=picked.get(key);
    if(!previous||distanceSq<previous.distanceSq)
     picked.set(key,{distanceSq,point});
   }
  }
 }
 return [...picked.values()]
  .sort((x,y)=>x.distanceSq-y.distanceSq)
  .map(x=>x.point);
}
