import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import {sourceRegisteredPaintCellActive,
 sourceRegisteredPaintHitActive,sourceThrownSubPaintBeforeRegisteredSolid,
 sourceOriginalBlastPaintLineClear,
 type PaintSurface,type SurfaceRayHit} from '../ink/PaintSurface';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import {
  subWeaponProfile,
  type SubWeaponId,
  type SubWeaponProfile
} from '../weapons/WeaponKitCatalog';

/** Source-QA read-only observation of native browser code; not original game collision. */
export type SubWeaponNativeExplosionWitness=Readonly<{
 launchId:number;
 launchPoint:readonly [number,number,number];
 initialNativeVelocity:readonly [number,number,number];
 explosionPoint:readonly [number,number,number];
 trigger:'CONTACT_IMPACT'|'LANDED_FUSE'|'FLIGHT_TTL';
 contactKind:'NONE'|'PAINT_SURFACE_SEGMENT'|'RAPIER_STAGE_SOLID'|'NATIVE_SOURCE_CPU_BODY';
 contactSourceId:string|null;
 contactPoint:readonly [number,number,number]|null;
 enqueuedStampSurfaceIds:readonly string[];
 firstContactCandidates:Readonly<{
  paintId:string|null;
  paintDistance:number|null;
  rapierId:string|null;
  rapierDistance:number|null;
  priorityEpsilon:number;
 }> | null;
 flightQueryTicks:number;
 paintCandidateTicks:number;
 rapierCandidateTicks:number;
 dualCandidateTicks:number;
 originalGameCollisionCertified:false;
}>;
interface BombSlot {
 launchId:number;
 launchPoint:Vec3;
 initialNativeVelocity:Vec3;
 contactKind:SubWeaponNativeExplosionWitness['contactKind'];
 contactSourceId:string|null;
 contactPoint:Vec3|null;
 contactCandidates:SubWeaponNativeExplosionWitness['firstContactCandidates'];
 flightQueryTicks:number;
 paintCandidateTicks:number;
 rapierCandidateTicks:number;
 dualCandidateTicks:number;
  active: boolean;
  landed: boolean;
  subId: SubWeaponId;
  team: Team.A | Team.B;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  ttl: number;
  fuseSeconds: number;
  entity: Entity;
}

export class SubWeaponSystem {
  private readonly bombs: BombSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();
  private nativeSourceHumanSubBodyContactEnabled=false;
  private nextLaunchId=0;
  private currentEnqueuedStampSurfaceIds:string[]|null=null;

  public constructor(
    app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly resources: PlayerResources,
    private readonly combatTargets: CombatTargetSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats,
    /** Optional QA observer; default production path supplies none. */
    private readonly onNativeExplosion?: (w:SubWeaponNativeExplosionWitness)=>void,
    /** F4-only physical backing for original SOURCE paint-plane rays. */
    private readonly f4PhysicallyBackedPaint?: (surfaceId:string)=>boolean
  ) {
    this.materialA = makeBombMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeBombMaterial(GAME_CONFIG.visual.teamB);

    for (let i = 0; i < 8; i += 1) {
      const entity = new Entity(`SubWeapon:${i}`);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.materialA,
        castShadows: false,
        receiveShadows: false
      });
      entity.enabled = false;
      app.root.addChild(entity);

      this.bombs.push({
        launchId:0,
        launchPoint:new Vec3(),
        initialNativeVelocity:new Vec3(),
        contactKind:'NONE',
        contactSourceId:null,
        contactPoint:null,
        contactCandidates:null,
        flightQueryTicks:0,
        paintCandidateTicks:0,
        rapierCandidateTicks:0,
        dualCandidateTicks:0,
        active: false,
        landed: false,
        subId: 'pulse-bomb',
        team: Team.A,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        ttl: 0,
        fuseSeconds: 0,
        entity
      });
    }
  }

  /** Native original-SOURCE 180s only: a thrown HUMAN sub may touch the
   * existing real ACTIVE enemy CPU combat body before hitting an original
   * blocker. No character, solid, path, paint or score authority is added.
   * Frozen T20 and opt-in deterministic QA keep their historical contact. */
  public enableNativeSourceHumanSubBodyContact():void{
    this.nativeSourceHumanSubBodyContactEnabled=true;
  }

  public tryThrow(
    subId: SubWeaponId,
    team: Team.A | Team.B,
    origin: Vec3,
    direction: Vec3
  ): boolean {
    const profile = subWeaponProfile(subId);
    const slot = this.bombs.find((candidate) => !candidate.active);
    if (!slot) return false;
    if (!this.resources.tryConsumeSubInk(profile.inkCost)) return false;

    const aim = direction.clone().normalize();
    slot.active = true;
    slot.landed = false;
    slot.launchId=++this.nextLaunchId;
    slot.launchPoint.copy(origin);
    slot.contactKind='NONE';
    slot.contactSourceId=null;
    slot.contactPoint=null;
    slot.contactCandidates=null;
    slot.flightQueryTicks=0;
    slot.paintCandidateTicks=0;
    slot.rapierCandidateTicks=0;
    slot.dualCandidateTicks=0;
    slot.subId = subId;
    slot.team = team;
    slot.ttl = profile.maxFlightSeconds;
    slot.fuseSeconds = profile.fuseSeconds;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(aim).mulScalar(profile.throwSpeedMetersPerSecond);
    slot.velocity.y += profile.upwardBoostMetersPerSecond;
    if(this.onNativeExplosion)
     slot.initialNativeVelocity.copy(slot.velocity);

    const mesh = slot.entity.render?.meshInstances[0];
    if (mesh) mesh.material = team === Team.A ? this.materialA : this.materialB;
    const d = profile.visualDiameterMeters;
    slot.entity.setLocalScale(d, d, d);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;

    this.stats.playerSubThrows += 1;
    this.stats.playerSubWeaponName = profile.displayName;
    this.feedback.subThrow(team, origin);
    return true;
  }

  public fixedUpdate(dt: number): void {
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      const profile = subWeaponProfile(slot.subId);

      slot.previousPosition.copy(slot.position);

      if (slot.landed) {
        slot.fuseSeconds = Math.max(0, slot.fuseSeconds - dt);
        if (slot.fuseSeconds <= 0) this.explode(slot, profile, 'LANDED_FUSE');
        continue;
      }

      // Genuine SOURCE: a TTL shorter than this 60Hz tick still has
      // physical flight time. Query original Rapier/paint/actors over ONLY
      // that remaining fraction before the terminal explosion. Legacy
      // T20 keeps its former immediate expiry at the previous position.
      const terminalSourceFlight=this.nativeSourceHumanSubBodyContactEnabled&&
        slot.ttl>0&&slot.ttl<=dt;
      const flightDt=this.nativeSourceHumanSubBodyContactEnabled?
        Math.min(dt,Math.max(0,slot.ttl)):dt;
      slot.ttl -= dt;
      if (slot.ttl <= 0 && !terminalSourceFlight) {
        this.explode(slot, profile, 'FLIGHT_TTL');
        continue;
      }

      slot.velocity.y -= profile.gravityMetersPerSecond2 * flightDt;
      this.delta.copy(slot.velocity).mulScalar(flightDt);
      const next = slot.position.clone().add(this.delta);

      const paintHit = this.findNearestSurfaceHit(slot.position, next);
      const blockerHit = this.physics.castStageSegment(slot.position, next, 'thrown-sub');
      // Audit-only: observe both ORIGINAL native queries without changing
      // who wins, the contact point, the fuse, or the gameplay ink.
      if(this.onNativeExplosion){
        slot.flightQueryTicks++;
        if(paintHit)slot.paintCandidateTicks++;
        if(blockerHit)slot.rapierCandidateTicks++;
        if(paintHit&&blockerHit)slot.dualCandidateTicks++;
        if(paintHit||blockerHit)slot.contactCandidates={
          paintId:paintHit?.surface.id??null,
          paintDistance:paintHit?.distance??null,
          rapierId:blockerHit?.solidId??null,
          rapierDistance:blockerHit?.distance??null,
          priorityEpsilon:GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
        };
      }

      const paintWins=sourceThrownSubPaintBeforeRegisteredSolid(
        paintHit,blockerHit,this.nativeSourceHumanSubBodyContactEnabled,
        GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
      );

      // The true SOURCE human SUB and true SOURCE CPU SUB must obey the
      // same existing living-opponent contact before real stage cover.
      // A nearest paintable original surface or blocker still wins when
      // it is closer. This uses CpuAgentSystem's actual active bot HP,
      // team, position and combat volume; no synthetic actor is spawned.
      if(this.nativeSourceHumanSubBodyContactEnabled){
        const opponent=this.cpuAgents.findNearestCombatHit(
          slot.position,next,slot.team);
        // Paint-plane priority only selects a visual/ink impact. An actor
        // can never be struck beyond an earlier genuine Rapier blocker.
        const sourceCoverDistance=Math.min(
          paintHit?.distance??Infinity,
          blockerHit?.distance??Infinity);
        if(opponent&&Number.isFinite(opponent.distance)&&
           opponent.distance>=0&&
           opponent.distance+GAME_CONFIG.combat.hitPriorityEpsilonMeters<
            sourceCoverDistance){
          this.onContact(slot,profile,opponent.point,
            'NATIVE_SOURCE_CPU_BODY',opponent.botId);
          continue;
        }
      }
      if (paintWins && paintHit) {
        this.onContact(slot, profile, paintHit.worldPoint,
          'PAINT_SURFACE_SEGMENT', paintHit.surface.id);
        continue;
      }
      if (blockerHit) {
        this.onContact(slot, profile, blockerHit.point,
          'RAPIER_STAGE_SOLID', blockerHit.solidId);
        continue;
      }

      slot.position.copy(next);
      if(terminalSourceFlight){
        this.explode(slot,profile,'FLIGHT_TTL');
        continue;
      }
      slot.entity.setPosition(slot.position);
    }
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      if (slot.landed) {
        slot.entity.setPosition(slot.position);
        continue;
      }
      slot.entity.setPosition(
        slot.previousPosition.x + (slot.position.x - slot.previousPosition.x) * t,
        slot.previousPosition.y + (slot.position.y - slot.previousPosition.y) * t,
        slot.previousPosition.z + (slot.position.z - slot.previousPosition.z) * t
      );
    }
  }

  public reset(): void {
    for (const slot of this.bombs) this.deactivate(slot);
  }

  private onContact(
    slot: BombSlot,
    profile: SubWeaponProfile,
    point: Vec3,
    kind:SubWeaponNativeExplosionWitness['contactKind'],
    sourceId:string
  ): void {
    slot.contactKind=kind;
    slot.contactSourceId=sourceId;
    slot.contactPoint=point.clone();
    slot.position.copy(point);
    slot.previousPosition.copy(point);
    slot.velocity.set(0, 0, 0);

    if (profile.detonateOnImpact) {
      this.explode(slot, profile, 'CONTACT_IMPACT');
      return;
    }
    // A real SOURCE bomb that meets the original wall during its FINAL
    // TTL fraction explodes at that actual contact, never silently
    // starts a new fuse after its genuine flight budget is exhausted.
    if(this.nativeSourceHumanSubBodyContactEnabled&&slot.ttl<=0){
      this.explode(slot,profile,'FLIGHT_TTL');
      return;
    }

    slot.landed = true;
    slot.entity.setPosition(point);
    this.feedback.subFuse(slot.team, point, slot.fuseSeconds);
  }

  private explode(
    slot:BombSlot,profile:SubWeaponProfile,
    trigger:SubWeaponNativeExplosionWitness['trigger']
  ): void {
    // Canonical SOURCE HUMAN bombs already collide with the genuine
    // living CPU physical body. Resolve their blast against the SAME
    // Rapier CPU capsule as SOURCE CPU bombs, not the historical single
    // center point (which misses legitimate edge/crown blast contact).
    // No floor, weapon radius, damage, navigation or stage grant.
    // Human SOURCE bombs use the SAME registered Rapier cover as the
    // physical CPU capsule: radius overlap cannot damage a body through
    // original walls. No new terrain or synthetic line of sight is added.
    // Non-SOURCE T20 bomb damage keeps its original radius-only rule.
    const originalSourceBlastClear=this.nativeSourceHumanSubBodyContactEnabled?
      (body:Vec3)=>{
       const span=slot.position.distance(body);
       if(!Number.isFinite(span))return false;
       if(span<=1e-8)return true;
       const hit=this.physics.castStageSegment(
         slot.position,body,'ink-projectile');
       return !hit||Number.isFinite(hit.distance)&&
        hit.distance>=Math.max(0,span-.025);
      }:undefined;
    this.cpuAgents.applyAreaDamage(
      slot.position,
      profile.outerDamageRadiusMeters,
      profile.outerDamage,
      slot.team,
      originalSourceBlastClear,
      this.nativeSourceHumanSubBodyContactEnabled
    );
    this.combatTargets.applyAreaDamage(
      slot.position,
      profile.outerDamageRadiusMeters,
      profile.outerDamage,
      slot.team
    );
    if (profile.innerExtraDamage > 0 && profile.innerDamageRadiusMeters > 0) {
      this.cpuAgents.applyAreaDamage(
        slot.position,
        profile.innerDamageRadiusMeters,
        profile.innerExtraDamage,
        slot.team,
        originalSourceBlastClear,
        this.nativeSourceHumanSubBodyContactEnabled
      );
      this.combatTargets.applyAreaDamage(
        slot.position,
        profile.innerDamageRadiusMeters,
        profile.innerExtraDamage,
        slot.team
      );
    }

    // Stamp projections precede authoritative ownership change in B41.
    if(this.onNativeExplosion)this.currentEnqueuedStampSurfaceIds=[];
    this.paintExplosion(slot.team, slot.position, profile.paintRadiusMeters);
    this.feedback.subBurst(slot.team, slot.position, profile.paintRadiusMeters);
    this.stats.playerSubExplosions += 1;
    if(this.onNativeExplosion){
      const xyz=(v:Vec3):[number,number,number]=>[v.x,v.y,v.z];
      const witness:SubWeaponNativeExplosionWitness=Object.freeze({
        launchId:slot.launchId,
        launchPoint:Object.freeze(xyz(slot.launchPoint)),
        initialNativeVelocity:Object.freeze(xyz(slot.initialNativeVelocity)),
        explosionPoint:Object.freeze(xyz(slot.position)),
        trigger,contactKind:slot.contactKind,
        contactSourceId:slot.contactSourceId,
        contactPoint:slot.contactPoint?
          Object.freeze(xyz(slot.contactPoint)):null,
        enqueuedStampSurfaceIds:Object.freeze([
          ...(this.currentEnqueuedStampSurfaceIds??[])
        ]),
        firstContactCandidates:slot.contactCandidates?
          Object.freeze({...slot.contactCandidates}):null,
        flightQueryTicks:slot.flightQueryTicks,
        paintCandidateTicks:slot.paintCandidateTicks,
        rapierCandidateTicks:slot.rapierCandidateTicks,
        dualCandidateTicks:slot.dualCandidateTicks,
        originalGameCollisionCertified:false
      });
      this.currentEnqueuedStampSurfaceIds=null;
      this.onNativeExplosion(witness);
    }
    this.deactivate(slot);
  }

  private paintExplosion(
    team: Team.A | Team.B,
    center: Vec3,
    paintRadius: number
  ): void {
    const innerRadius = Math.max(0.42, paintRadius * 0.52);
    this.paintWorldStamp(team, center, innerRadius, 2.0, center);

    const ringRadius = paintRadius * 0.58;
    const count = paintRadius < 1.6 ? 6 : 8;
    for (let i = 0; i < count; i += 1) {
      const angle = i * Math.PI * 2 / count;
      const point = center.clone().add(new Vec3(
        Math.cos(angle) * ringRadius,
        0,
        Math.sin(angle) * ringRadius
      ));
      this.paintWorldStamp(team, point, innerRadius * 0.78, 2.2, center);
    }
  }

  private paintWorldStamp(
    team: Team.A | Team.B,
    worldPoint: Vec3,
    radius: number,
    maxPlaneDistance: number,
    originalBlastCenter?:Vec3
  ): boolean {
    let best:
      | { surface: PaintSurface; u: number; v: number; planeDistance: number }
      | null = null;

    for (const surface of this.surfaces) {
      if (this.f4PhysicallyBackedPaint &&
          !this.f4PhysicallyBackedPaint(surface.id)) continue;
      if ((surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      const projected = surface.projectWorldPoint(worldPoint);
      if (!projected.inside || projected.planeDistance > maxPlaneDistance ||
          (this.nativeSourceHumanSubBodyContactEnabled &&
           !sourceRegisteredPaintCellActive(surface,projected.u,projected.v)))
        continue;
      // Only live SOURCE explosions use registered Rapier line of sight
      // between their physical center and this exact original paint plane.
      // Avoid the legacy plane-distance-only choice through an opaque wall.
      if(this.nativeSourceHumanSubBodyContactEnabled&&originalBlastCenter){
        const backingPoint=surface.localToWorld(projected.u,projected.v);
        const cover=this.physics.castStageSegment(
          originalBlastCenter,backingPoint,'ink-projectile');
        if(!sourceOriginalBlastPaintLineClear(
          originalBlastCenter,backingPoint,surface,cover))continue;
      }
      if (!best || projected.planeDistance < best.planeDistance) {
        best = {
          surface,
          u: projected.u,
          v: projected.v,
          planeDistance: projected.planeDistance
        };
      }
    }

    if (!best) return false;
    this.currentEnqueuedStampSurfaceIds?.push(best.surface.id);

    this.coordinator.enqueue({
      source: PaintSource.Human,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU: radius,
      radiusV: radius,
      angle: 0,
      type: PaintEventType.Bomb,
      strength: 1
    });
    return true;
  }

  private findNearestSurfaceHit(from: Vec3, to: Vec3): SurfaceRayHit | null {
    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      if (this.f4PhysicallyBackedPaint &&
          !this.f4PhysicallyBackedPaint(surface.id)) continue;
      const hit = surface.intersectSegment(from, to);
      // Native SOURCE human SUB must not detonate on a raster hole
      // that its paid ink cannot paint; original solid collision still
      // happens independently. Frozen T20 behavior remains unchanged.
      if(hit&&(!this.nativeSourceHumanSubBodyContactEnabled||
         sourceRegisteredPaintHitActive(surface,hit))&&
         (!best||hit.distance<best.distance))best=hit;
    }
    return best;
  }

  private deactivate(slot: BombSlot): void {
    slot.active = false;
    slot.landed = false;
    slot.entity.enabled = false;
  }
}

function makeBombMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.7, rgb[1] * 0.7, rgb[2] * 0.7);
  material.useMetalness = true;
  material.metalness = 0.15;
  material.gloss = 0.82;
  material.update();
  return material;
}
