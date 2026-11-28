import RAPIER, { type Collider, type RigidBody, type World } from '@dimforge/rapier3d-compat';
import { f4MeshBottom } from '../stage/F4PhysicalStageSafety.mjs';
import {buildF4PaintHitIndex,queryF4PaintHitIndex,type F4PaintHitIndex} from './F4PaintHitIndex.mjs';
import { Quat, Vec3 } from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import {
  stageSolidCollisionEnabled,
  type StageDefinition,
  type StageSolidDefinition
} from '../stage/StageDefinition';
import { rasterizeStageFootprint } from '../stage/StageFootprint';
import { stageSolidTriangleMeshErrors } from '../stage/StageTriangleMesh';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {
  F4_PAINT_NORMAL_ALIGNMENT, F4_PAINT_PLANE_TOLERANCE,
  sourceRegisteredPaintCellActive, type PaintSurface, type SurfaceRayHit
} from '../ink/PaintSurface';

export async function initializeRapier(): Promise<void> {
  await RAPIER.init();
}

export type StageQueryPurpose = 'ink-projectile' | 'thrown-sub' | 'camera';
export type StageCharacterMode = 'HUMAN' | 'SQUID';

export interface StageRayHit {
  distance: number;
  point: Vec3;
  collider: Collider;
  solidId: string;
  normal?: Vec3;
}

export class RapierStagePhysics {
  public readonly world: World;
  private readonly solidByColliderHandle = new Map<number, StageSolidDefinition>();
  private readonly rayDirection = new Vec3();
  private readonly initialStageSolids: readonly StageSolidDefinition[];
  private f4WholeResearchTrimeshActive = false;
  private f4InstalledBottomY: number|null = null;

  public get f4ResearchBottomY():number|null {
    return this.f4WholeResearchTrimeshActive?this.f4InstalledBottomY:null;
  }
  private readonly cameraSweepBall = new RAPIER.Ball(0);
  private readonly projectileSweepBall = new RAPIER.Ball(0);
  private readonly inkBoxSweep = new RAPIER.Cuboid(0, 0, 0);
  private readonly inkBoxRotation = new Quat();
  private readonly cameraSweepRotation = new Quat();
  // F4 backing is a synchronous, read-only query. The ray owns fresh
  // origin/direction objects; only the temporary world point is reused.
  private readonly paintBackingPoint = new Vec3();
  // Immutable surface geometry only; never cache ownership or backing here.
  private readonly f4PaintBounds=new WeakMap<PaintSurface,number>();
  private f4PaintHitIndex:F4PaintHitIndex<PaintSurface>|null=null;
  private readonly paintBackingCollider = (collider: Collider): boolean =>
    this.solidByColliderHandle.has(collider.handle);
  private readonly paintHitProjection = {u:0,v:0,signedPlaneDistance:0,planeDistance:0,inside:false};

  public constructor(stepSeconds: number, stage: StageDefinition) {
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
    this.world.timestep = stepSeconds;
    this.initialStageSolids = stage.solids;
    this.buildStaticStage(stage.solids);
  }

  public step(): void {
    this.world.step();
  }

  public get hasF4WholeResearchTrimesh(): boolean {
    return this.f4WholeResearchTrimeshActive;
  }

  /** The full local mesh replaces the frozen paint planes' old backings.
   * Retain only active points with nearby aligned backing on their exposed side. */
  public hasF4PaintBacking(surface:PaintSurface,u:number,v:number):boolean{
    if(!this.f4WholeResearchTrimeshActive)return true;
    if(!sourceRegisteredPaintCellActive(surface,u,v))return false;
    const point=surface.localToWorld(u,v,this.paintBackingPoint);
    // Same original ray, including downward-winding correction. Avoid
    // three temporary normal Vec3 clones and a per-query filter closure.
    const normal=surface.normal;
    const flip=normal.y<-.5;
    const nx=flip?normal.x*-1:normal.x;
    const ny=flip?normal.y*-1:normal.y;
    const nz=flip?normal.z*-1:normal.z;
    const length=F4_PAINT_PLANE_TOLERANCE;
    const ray=new RAPIER.Ray(
      {x:point.x+nx*length,y:point.y+ny*length,z:point.z+nz*length},
      {x:nx*-1,y:ny*-1,z:nz*-1});
    const hit=this.world.castRayAndGetNormal(ray,2*length,false,
      undefined,undefined,undefined,undefined,this.paintBackingCollider);
    if(!hit)return false;
    const aligned=hit.normal.x*nx+hit.normal.y*ny+hit.normal.z*nz;
    // A floor/ramp raster mask plus the real Rapier contact identifies the
    // actual walkable source face. At internal mesh seams Rapier can return
    // a blended neighboring normal; use the same slope limit as the KCC.
    const walkableSurface=(surface.baseFlags&(SurfaceFlags.Floor|SurfaceFlags.Ramp))!==0;
    return walkableSurface?
      Math.abs(hit.normal.y)>=Math.cos(PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians):
      Math.abs(aligned)>=F4_PAINT_NORMAL_ALIGNMENT;
  }

  /** Call only after the complete F4 registration, never for mutable subsets. */
  public prepareF4PaintHitIndex(surfaces:readonly PaintSurface[]):void{
    this.f4PaintHitIndex=this.f4WholeResearchTrimeshActive?
      buildF4PaintHitIndex(surfaces,F4_PAINT_PLANE_TOLERANCE):null;
  }
  public f4PaintAtStageHit(
    hit:StageRayHit|null,surfaces:readonly PaintSurface[]
  ):SurfaceRayHit|null{
    if(!this.f4WholeResearchTrimeshActive||!hit)return null;
    return this.evaluateF4PaintAtStageHit(
      hit,queryF4PaintHitIndex(this.f4PaintHitIndex,surfaces,hit.point));
  }
  /** Read-only oracle using the pre-index exhaustive surface traversal. */
  public f4PaintAtStageHitExhaustive(
    hit:StageRayHit|null,surfaces:readonly PaintSurface[]
  ):SurfaceRayHit|null{
    if(!this.f4WholeResearchTrimeshActive||!hit)return null;
    return this.evaluateF4PaintAtStageHit(hit,surfaces);
  }
  public compareF4PaintAtStageHit(hit:StageRayHit,surfaces:readonly PaintSurface[]){
    const indexed=this.f4PaintAtStageHit(hit,surfaces)?.surface.id??null;
    const exhaustive=this.f4PaintAtStageHitExhaustive(hit,surfaces)?.surface.id??null;
    return {indexed,exhaustive,equal:indexed===exhaustive};
  }
  private evaluateF4PaintAtStageHit(
    hit:StageRayHit,surfaces:readonly PaintSurface[]
  ):SurfaceRayHit|null{
    let best:SurfaceRayHit|null=null;
    let distance=F4_PAINT_PLANE_TOLERANCE;
    for(const surface of surfaces){
      // The caller selects either the conservative index candidates or the
      // full source array. Keep every downstream paint predicate identical.
      // Conservative sphere around the actual rectangular plane envelope.
      // New floor tiles substantially increase the candidate array; reject
      // distant tiles before doing projection and physical backing queries.
      let limitSq=this.f4PaintBounds.get(surface);
      if(limitSq===undefined){
        const radius=Math.hypot(surface.widthMeters*.5,surface.heightMeters*.5,F4_PAINT_PLANE_TOLERANCE)+.001;
        limitSq=radius*radius;this.f4PaintBounds.set(surface,limitSq);
      }
      const dx=hit.point.x-surface.center.x,dy=hit.point.y-surface.center.y,dz=hit.point.z-surface.center.z;
      if(dx*dx+dy*dy+dz*dz>limitSq)continue;
      const p=surface.projectWorldPoint(hit.point,this.paintHitProjection);
      const walkableSurface=(surface.baseFlags&(SurfaceFlags.Floor|SurfaceFlags.Ramp))!==0;
      if(!p.inside||p.planeDistance>distance||
         (hit.normal&&(walkableSurface?
          Math.abs(hit.normal.y)<Math.cos(PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians):
          Math.abs(hit.normal.dot(surface.normal))<F4_PAINT_NORMAL_ALIGNMENT))||
         !this.hasF4PaintBacking(surface,p.u,p.v))continue;
      distance=p.planeDistance;
      best={surface,distance:hit.distance,worldPoint:hit.point,u:p.u,v:p.v};
    }
    return best;
  }

  /** F4 opt-in only. Replace the old registered experiment colliders with
   * one static collider using the verified F3L render faces and the local
   * seed's retained render faces, all in the same world coordinates.
   * Does not modify the frozen StageDefinition, Recast, ink or actors. */
  public installF4WholeResearchTrimesh(
    originalStatic: Float32Array, retainedSeed: Float32Array
  ): number {
    if (this.f4WholeResearchTrimeshActive ||
        originalStatic.length !== 57578 * 9 || retainedSeed.length % 9 !== 0)
      throw Error('T21_F4_RESEARCH_INVALID_F3L_TRIANGLE_COUNT');
    const vertices = new Float32Array(originalStatic.length + retainedSeed.length);
    vertices.set(originalStatic);
    vertices.set(retainedSeed, originalStatic.length);
    const bottomY=f4MeshBottom(originalStatic,retainedSeed);
    const indices = new Uint32Array(vertices.length / 3);
    for (let i = 0; i < indices.length; i++) indices[i] = i;
    const originalHandles = [...this.solidByColliderHandle.keys()];
    const collider = this.world.createCollider(
      // Shared vertices let Rapier distinguish internal flat seams from
      // exposed physical edges. No faces are removed or repositioned.
      RAPIER.ColliderDesc.trimesh(vertices, indices, RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES)
    );
    this.solidByColliderHandle.set(collider.handle, {
      id: 'T21_F4_LOCAL_F3L_RESEARCH',
      center: [0, 0, 0], size: [1, 1, 1], material: 'medium',
      render: false, projectileBlocker: true, cameraBlocker: true,
      collisionEnabled: true, navigationEnabled: false
    });
    this.f4InstalledBottomY=bottomY;
    this.f4WholeResearchTrimeshActive = true;
    try {
      for (const handle of originalHandles) {
        const old = this.world.getCollider(handle);
        if (old) this.world.removeCollider(old, true);
        this.solidByColliderHandle.delete(handle);
      }
      // The next input tick queries KCC support before stepping the world.
      // Publish the replacement collider to Rapier's queries before input resumes.
      this.world.step();
      return indices.length / 3;
    } catch (error) {
      this.restoreF4ResearchStaticStage();
      throw error;
    }
  }

  /** Recovery for a failed local install. The original stage remains frozen. */
  public restoreF4ResearchStaticStage(): void {
    this.f4PaintHitIndex=null;
    if (!this.f4WholeResearchTrimeshActive) return;
    for (const handle of [...this.solidByColliderHandle.keys()]) {
      const old = this.world.getCollider(handle);
      if (old) this.world.removeCollider(old, true);
      this.solidByColliderHandle.delete(handle);
    }
    this.buildStaticStage(this.initialStageSolids);
    this.f4WholeResearchTrimeshActive = false;
    this.f4InstalledBottomY=null;
    this.world.step();
  }

  public castF4CameraClearance(from:Vec3,to:Vec3,radius:number):number|null {
    const direction=this.rayDirection.copy(to).sub(from);
    const length=direction.length();
    if(length<=1e-8)return null;
    direction.mulScalar(1/length);
    this.cameraSweepBall.radius=radius;
    const hit=this.world.castShape(from,this.cameraSweepRotation,direction,
      this.cameraSweepBall,0,length,true,undefined,undefined,undefined,undefined,
      collider=>this.solidByColliderHandle.get(collider.handle)?.cameraBlocker===true);
    return hit?.time_of_impact??null;
  }

  public castStageSegment(
    from: Vec3,
    to: Vec3,
    purpose: StageQueryPurpose
  ): StageRayHit | null {
    this.rayDirection.copy(to).sub(from);
    const length = this.rayDirection.length();
    if (length <= 1e-8) return null;
    this.rayDirection.mulScalar(1 / length);

    const ray = new RAPIER.Ray(
      { x: from.x, y: from.y, z: from.z },
      { x: this.rayDirection.x, y: this.rayDirection.y, z: this.rayDirection.z }
    );
    const permits=(collider:Collider)=>{
      const solid=this.solidByColliderHandle.get(collider.handle);
      return !!solid&&stageSolidBlocksQuery(solid,purpose);
    };
    const hit=this.f4WholeResearchTrimeshActive
      ?this.world.castRayAndGetNormal(ray,length,true,undefined,
        undefined,undefined,undefined,permits)
      :this.world.castRay(ray,length,true,undefined,
        undefined,undefined,undefined,permits);
    if (!hit) return null;

    const solid = this.solidByColliderHandle.get(hit.collider.handle);
    if (!solid) return null;

    return {
      distance: hit.timeOfImpact,
      point: new Vec3(
        from.x + this.rayDirection.x * hit.timeOfImpact,
        from.y + this.rayDirection.y * hit.timeOfImpact,
        from.z + this.rayDirection.z * hit.timeOfImpact
      ),
      collider: hit.collider,
      solidId: solid.id,
      ...('normal' in hit?{normal:new Vec3(hit.normal.x,hit.normal.y,hit.normal.z)}:{})
    };
  }

  /** Exact prospective human capsule overlap; no movement or collider writes. */
  public f4HumanFormClear(center:{x:number;y:number;z:number},halfHeight:number,radius:number,body:RigidBody):boolean{
    if(!this.f4WholeResearchTrimeshActive||
       ![center.x,center.y,center.z,halfHeight,radius].every(Number.isFinite)||halfHeight<=0||radius<=0)return false;
    return !this.world.intersectionWithShape(center,this.cameraSweepRotation,
      new RAPIER.Capsule(halfHeight,radius),undefined,undefined,undefined,body,
      collider=>this.shouldCharacterCollide(collider,'HUMAN'));
  }

  /** Read-only Zipcaster candidate clearance. This does not authorize a grapple or move the KCC. */
  public auditF4HumanCapsuleSegment(
    from:Vec3,to:Vec3,halfHeight:number,radius:number,ownCollider:Collider
  ) {
    if(!this.f4WholeResearchTrimeshActive||
       ![from.x,from.y,from.z,to.x,to.y,to.z,halfHeight,radius].every(Number.isFinite)||
       halfHeight<=0||radius<=0)
      return {clear:false,reason:'INVALID_OR_UNAVAILABLE',distance:null,solidId:null,colliderHandle:null};
    const direction=to.clone().sub(from);
    const length=direction.length();
    if(length<=1e-6)
      return {clear:false,reason:'DEGENERATE_SEGMENT',distance:null,solidId:null,colliderHandle:null};
    direction.mulScalar(1/length);
    const hit=this.world.castShape(from,this.cameraSweepRotation,direction,
      new RAPIER.Capsule(halfHeight,radius),0,length,false,
      undefined,undefined,ownCollider,undefined,
      collider=>this.shouldCharacterCollide(collider,'HUMAN'));
    return hit?{clear:false,reason:'CAPSULE_CONTACT',distance:hit.time_of_impact,
      solidId:this.sourceSolidIdForCollider(hit.collider),colliderHandle:hit.collider.handle}:
      {clear:true,reason:'NO_SWEEP_CONTACT',distance:null,solidId:null,colliderHandle:null};
  }

  public castStageInkSphere(from: Vec3, to: Vec3, radius: number): StageRayHit | null {
    const direction = this.rayDirection.copy(to).sub(from);
    const length = direction.length();
    if (length <= 1e-8) return null;
    direction.mulScalar(1 / length);
    this.projectileSweepBall.radius = radius;
    const hit = this.world.castShape(from, this.cameraSweepRotation, direction,
      this.projectileSweepBall, 0, length, true, undefined, undefined, undefined, undefined,
      collider => {
        const solid = this.solidByColliderHandle.get(collider.handle);
        return !!solid && stageSolidBlocksQuery(solid, 'ink-projectile');
      });
    if (!hit) return null;
    // In a world query Rapier's first witness is the world-space contact
    // on the stage collider, while TOI measures center travel.
    return {
      distance: hit.time_of_impact,
      point: new Vec3(hit.witness1.x, hit.witness1.y, hit.witness1.z),
      normal: new Vec3(hit.normal1.x, hit.normal1.y, hit.normal1.z),
      collider: hit.collider,
      solidId: this.solidByColliderHandle.get(hit.collider.handle)!.id
    };
  }

  public castInkSegmentAtBall(from:Vec3,to:Vec3,center:Vec3,radius:number): number|null {
    const direction=this.rayDirection.copy(to).sub(from);
    const length=direction.length();
    if(length<=1e-8)return null;
    direction.mulScalar(1/length);
    this.projectileSweepBall.radius=radius;
    const time=this.projectileSweepBall.castRay(
      new RAPIER.Ray(from,direction),center,this.cameraSweepRotation,length,true);
    return time>=0 && time<=length ? time : null;
  }

  public castStageInkBox(from: Vec3, to: Vec3, half: Vec3, forward: Vec3): number | null {
    const direction = this.rayDirection.copy(to).sub(from);
    const length = direction.length();
    if (length <= 1e-8) return null;
    direction.mulScalar(1 / length);
    this.inkBoxSweep.halfExtents = half;
    this.inkBoxRotation.setFromEulerAngles(0, Math.atan2(forward.x, forward.z) * 180 / Math.PI, 0);
    const hit = this.world.castShape(from, this.inkBoxRotation, direction, this.inkBoxSweep, 0, length, true,
      undefined, undefined, undefined, undefined, collider => {
        const solid = this.solidByColliderHandle.get(collider.handle);
        return !!solid && stageSolidBlocksQuery(solid, 'ink-projectile');
      });
    return hit?.time_of_impact ?? null;
  }

  public castInkSphereAtBox(from: Vec3, to: Vec3, radius: number,
    center: Vec3, half: Vec3, forward: Vec3
  ): number | null {
    const direction = this.rayDirection.copy(to).sub(from);
    const length = direction.length();
    if (length <= 1e-8) return null;
    direction.mulScalar(1 / length);
    this.projectileSweepBall.radius = radius;
    this.inkBoxSweep.halfExtents = half;
    this.inkBoxRotation.setFromEulerAngles(0, Math.atan2(forward.x, forward.z) * 180 / Math.PI, 0);
    const hit = this.inkBoxSweep.castShape(center,this.inkBoxRotation,Vec3.ZERO,this.projectileSweepBall,
      from,this.cameraSweepRotation,direction,0,length,true);
    return hit?.time_of_impact ?? null;
  }

  /**
   * B112 observational ray to a genuine existing static Rapier stage solid.
   * Unlike projectile casts, this filters by original character collision
   * behavior (including grates for human but not squid). This is NOT a
   * character collision response and cannot authorize additional floor.
   */
  public castCharacterFootSupport(
    bodyCenter:Vec3,bodyToFootMeters:number,mode:StageCharacterMode
  ):StageRayHit|null{
    const footY=bodyCenter.y-bodyToFootMeters;
    const fromY=footY+.34;
    const ray=new RAPIER.Ray(
      {x:bodyCenter.x,y:fromY,z:bodyCenter.z},
      {x:0,y:-1,z:0}
    );
    const permits=(collider:Collider)=>{
      const solid=this.solidByColliderHandle.get(collider.handle);
      return !!solid&&stageSolidAllowsCharacterMode(solid,mode);
    };
    const hit=this.f4WholeResearchTrimeshActive
      ?this.world.castRayAndGetNormal(ray,1.45,true,undefined,
        undefined,undefined,undefined,permits)
      :this.world.castRay(ray,1.45,true,undefined,
        undefined,undefined,undefined,permits);
    if(!hit)return null;
    const solid=this.solidByColliderHandle.get(hit.collider.handle);
    if(!solid)return null;
    return {
      distance:hit.timeOfImpact,
      point:new Vec3(bodyCenter.x,fromY-hit.timeOfImpact,bodyCenter.z),
      collider:hit.collider,solidId:solid.id,
      ...('normal' in hit?{normal:new Vec3(hit.normal.x,hit.normal.y,hit.normal.z)}:{})
    };
  }

  /** Audit-only reverse lookup; does not alter any collision or query authority. */
  public sourceSolidIdForCollider(collider: Collider): string | null {
    return this.solidByColliderHandle.get(collider.handle)?.id ?? null;
  }

  public shouldCharacterCollide(
    collider: Collider,
    mode: StageCharacterMode
  ): boolean {
    const solid = this.solidByColliderHandle.get(collider.handle);
    if (!solid) return true;
    return stageSolidAllowsCharacterMode(solid, mode);
  }

  private buildStaticStage(solids: readonly StageSolidDefinition[]): void {
    for (const solid of solids) {
      if (!stageSolidCollisionEnabled(solid)) continue;
      const meshErrors = stageSolidTriangleMeshErrors(solid);
      if (meshErrors.length > 0) throw new Error(meshErrors.join('; '));

      if (solid.triangleMesh) {
        this.createTriangleMeshCollider(solid);
        continue;
      }
      if (!solid.footprint) {
        this.createBoxCollider(solid, solid.size[0], solid.size[2], 0, 0);
        continue;
      }

      const raster = rasterizeStageFootprint(
        solid.size[0],
        solid.size[2],
        solid.footprint
      );
      for (const rect of raster.rectangles) {
        this.createBoxCollider(
          solid,
          rect.widthMeters,
          rect.depthMeters,
          rect.centerU - solid.size[0] * 0.5,
          rect.centerV - solid.size[2] * 0.5
        );
      }
    }
  }

  private createTriangleMeshCollider(solid: StageSolidDefinition): void {
    const mesh = solid.triangleMesh;
    if (!mesh) return;
    const vertices = new Float32Array(
      mesh.vertices.flatMap((vertex) => [...vertex])
    );
    const indices = new Uint32Array(mesh.indices);
    const desc = RAPIER.ColliderDesc.trimesh(vertices, indices)
      .setTranslation(solid.center[0], solid.center[1], solid.center[2]);

    if (solid.rotationEulerDegrees) {
      const rotation = solid.rotationEulerDegrees;
      const q = new Quat().setFromEulerAngles(rotation[0], rotation[1], rotation[2]);
      desc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }

    const collider = this.world.createCollider(desc);
    this.solidByColliderHandle.set(collider.handle, solid);
  }

  private createBoxCollider(
    solid: StageSolidDefinition,
    widthMeters: number,
    depthMeters: number,
    localOffsetX: number,
    localOffsetZ: number
  ): void {
    const rotation = solid.rotationEulerDegrees ?? [0, 0, 0];
    const q = new Quat().setFromEulerAngles(rotation[0], rotation[1], rotation[2]);
    const offset = rotateVector(
      new Vec3(localOffsetX, 0, localOffsetZ),
      q
    );
    const desc = RAPIER.ColliderDesc.cuboid(
      widthMeters * 0.5,
      solid.size[1] * 0.5,
      depthMeters * 0.5
    )
      .setTranslation(
        solid.center[0] + offset.x,
        solid.center[1] + offset.y,
        solid.center[2] + offset.z
      )
      .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });

    const collider = this.world.createCollider(desc);
    this.solidByColliderHandle.set(collider.handle, solid);
  }
}


function rotateVector(v: Vec3, q: Quat): Vec3 {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return new Vec3(
    ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
  );
}


export function stageSolidBlocksQuery(
  solid: StageSolidDefinition,
  purpose: StageQueryPurpose
): boolean {
  if (purpose === 'camera') return solid.cameraBlocker;
  if (solid.collisionBehavior === 'GRATE') {
    return purpose === 'thrown-sub';
  }
  return solid.projectileBlocker;
}

export function stageSolidAllowsCharacterMode(
  solid: StageSolidDefinition,
  mode: StageCharacterMode
): boolean {
  if (solid.collisionBehavior !== 'GRATE') return true;
  return mode === 'HUMAN';
}
