import { BLEND_NORMAL, Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
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
import { F4_SUB, F4_SUB_REPEAT, advanceF4BombFuse, curlingPlan, f4SubRecovery } from './F4SubRules';
import { segmentSphereDistance, type ProjectileSystem } from '../projectile/ProjectileSystem';
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
 contactKind:'NONE'|'PAINT_SURFACE_SEGMENT'|'RAPIER_STAGE_SOLID'|'NATIVE_SOURCE_CPU_BODY'|'F4_CANOPY';
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
  f4?: { actor?: string; elapsed: number; attached: boolean; gaugeLaunchLife?: string|null };
  curling?: { plan: ReturnType<typeof curlingPlan>; lastContact: Map<string,number>; trail: number };
  device?: { normal: Vec3; hp: number; age: number; emitted: number };
  mist?: { age:number };
  torpedo?: { mode:'THROWN'|'ROLL'|'CHASE'; target?:string; supportTicks:number; hp:number };
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
  private f4Runtime?: ProjectileSystem;
  private f4GaugeLifeAtLaunch?: (actorId:string)=>string|null;
  public useF4GaugeLaunchLife(query:(actorId:string)=>string|null):void {this.f4GaugeLifeAtLaunch=query;}
  private f4HumanRepeat = 0;
  private mistTick = 0;
  private mistMaterial?: StandardMaterial;
  private mistExposure = new Map<string,{tick:number;phase:number;pulse:number;count:number;drained:number}>();

  public sampleF4Mist(id:string,team:Team.A|Team.B,body:Vec3|null,ink:number) {
    if (!body || !this.bombs.some(slot=>slot.active && slot.mist && slot.team!==team &&
        slot.position.distance(body)<=2.35)) {
      this.mistExposure.delete(id);
      return undefined;
    }
    const old=this.mistExposure.get(id);
    if (old?.tick===this.mistTick) return {speedScale:.65,drain:0};
    const s=old && old.tick===this.mistTick-1 ? old : {tick:0,phase:0,pulse:0,count:0,drained:0};
    s.tick=this.mistTick;
    let drain=0;
    const interval=[60,30,15][s.phase]!;
    if (++s.pulse>=interval) {
      s.pulse=0;
      drain=Math.min(ink,Math.max(0,40-s.drained),[4,5,6][s.phase]!);
      s.drained+=drain;
      if (++s.count>=[3,4,Infinity][s.phase]!) {s.phase++;s.count=0;}
    }
    this.mistExposure.set(id,s);
    return {speedScale:.65,drain};
  }

  public enableF4Bombs(runtime: ProjectileSystem): void {
    this.f4Runtime = runtime;
    runtime.useF4DeviceContact((from,to,team)=>this.findF4Device(from,to,team));
    this.cpuAgents.useF4Mist((id,team,body,ink)=>this.sampleF4Mist(id,team,body,ink));
  }

  public tryLaunchF4CpuBomb(id: SubWeaponId, team: Team.A | Team.B, origin: Vec3,
    direction: Vec3, actor: string): boolean {
    if (!this.f4Runtime || !this.physics.hasF4WholeResearchTrimesh) return false;
    return this.tryThrow(id, team, origin, direction, actor);
  }
  private readonly bombs: BombSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();
  private nativeSourceHumanSubBodyContactEnabled=false;
  private nextLaunchId=0;
  private currentEnqueuedStampSurfaceIds:string[]|null=null;
  private f4Canopies?: Pick<ProjectileSystem,'findF4CanopyHit'|'createF4CanopyCover'>;

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
    private readonly onNativeExplosion?: (w:SubWeaponNativeExplosionWitness)=>void
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

  public useF4CanopyCover(runtime: Pick<ProjectileSystem,'findF4CanopyHit'|'createF4CanopyCover'>): void {
    this.f4Canopies = runtime;
  }

  public canStartF4HumanSub(subId: SubWeaponId): boolean {
    return Boolean(this.f4Runtime) && this.physics.hasF4WholeResearchTrimesh &&
      this.stats.playerInk + 1e-6 >= subWeaponProfile(subId).inkCost &&
      this.f4HumanRepeat <= 0 && this.bombs.some(slot => !slot.active) &&
      (subId !== 'torpedo' || !this.bombs.some(slot =>
        slot.active && slot.torpedo && slot.f4?.actor === undefined));
  }

  public tryThrow(
    subId: SubWeaponId,
    team: Team.A | Team.B,
    origin: Vec3,
    direction: Vec3,
    cpuActor?: string,
    heldFrames = 0
  ): boolean {
    const profile = subWeaponProfile(subId);
    const f4 = !!this.f4Runtime && this.physics.hasF4WholeResearchTrimesh;
    if (!f4 && (subId==='curling-bomb'||subId==='sprinkler'||subId==='poison-mist'||subId==='torpedo')) return false;
    if (subId==='torpedo' && this.bombs.some(slot=>slot.active&&slot.torpedo&&slot.f4?.actor===cpuActor))
      return false;
    const curling = subId==='curling-bomb' ? curlingPlan(heldFrames) : undefined;
    if (f4 && !cpuActor && this.f4HumanRepeat > 0) return false;
    if (f4 && (!Number.isFinite(direction.lengthSq()) || direction.lengthSq() <= 1e-8 ||
        !Number.isFinite(origin.x) || !Number.isFinite(origin.y) || !Number.isFinite(origin.z))) return false;
    const slot = this.bombs.find((candidate) => !candidate.active);
    if (!slot) return false;
    if (!cpuActor && !(f4 ? this.resources.tryConsumeF4SubInk(profile.inkCost,curling?.recovery??f4SubRecovery(subId))
      : this.resources.tryConsumeSubInk(profile.inkCost))) return false;
    if (f4 && !cpuActor) this.f4HumanRepeat = F4_SUB_REPEAT;
    slot.f4 = f4 ? { actor: cpuActor, elapsed: 0, attached: false,
      gaugeLaunchLife:this.f4GaugeLifeAtLaunch?.(cpuActor??'human') } : undefined;
    slot.curling = curling ? {plan:curling,lastContact:new Map(),trail:0} : undefined;
    slot.device = undefined;
    slot.mist = undefined;
    slot.torpedo = subId==='torpedo' ? {mode:'THROWN',supportTicks:0,hp:20} : undefined;

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
    if (curling && Math.hypot(aim.x,aim.z)>1e-5) {
      aim.y=0;
      aim.normalize();
    }
    slot.velocity.copy(aim).mulScalar(profile.throwSpeedMetersPerSecond);
    if (curling) slot.velocity.y=-2;
    slot.velocity.y += profile.upwardBoostMetersPerSecond;
    if(this.onNativeExplosion)
     slot.initialNativeVelocity.copy(slot.velocity);

    const mesh = slot.entity.render?.meshInstances[0];
    if (mesh) mesh.material = team === Team.A ? this.materialA : this.materialB;
    const d = profile.visualDiameterMeters;
    slot.entity.setLocalScale(d, d, d);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;

    if (cpuActor) this.stats.cpuSubProjectilesLaunched++;
    else {
      this.stats.playerSubThrows++;
      this.stats.playerSubWeaponName = profile.displayName;
    }
    this.feedback.subThrow(team, origin);
    return true;
  }

  public fixedUpdate(dt: number): void {
    this.mistTick++;
    this.f4HumanRepeat = Math.max(0,(this.f4HumanRepeat ?? 0) - dt - 1e-9);
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      const profile = subWeaponProfile(slot.subId);

      slot.previousPosition.copy(slot.position);
      if (slot.f4) {
        this.stepF4Bomb(slot, profile, dt);
        continue;
      }

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

      const blockerHit = this.physics.castStageSegment(slot.position, next, 'thrown-sub');
      const paintHit = this.physics.hasF4WholeResearchTrimesh
        ? this.physics.f4PaintAtStageHit(blockerHit,this.surfaces)
        : this.findNearestSurfaceHit(slot.position, next);
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
      const canopy=this.f4Canopies?.findF4CanopyHit(slot.position,next,slot.team);
      if(this.nativeSourceHumanSubBodyContactEnabled||canopy){
        const opponent=this.cpuAgents.findNearestCombatHit(
          slot.position,next,slot.team);
        // Paint-plane priority only selects a visual/ink impact. An actor
        // can never be struck beyond an earlier genuine Rapier blocker.
        const sourceCoverDistance=Math.min(
          paintHit?.distance??Infinity,
          blockerHit?.distance??Infinity);
        if(canopy&&canopy.distance<sourceCoverDistance&&canopy.distance<=(opponent?.distance??Infinity)){
          this.onContact(slot,profile,canopy.point,'F4_CANOPY',canopy.canopy.owner);
          continue;
        }
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
    this.f4HumanRepeat = 0;
    this.mistExposure.clear();
    this.mistTick=0;
    for (const slot of this.bombs) this.deactivate(slot);
  }

  private findF4Device(from: Vec3,to: Vec3,team: Team.A|Team.B) {
    let hit: BombSlot | undefined;
    let distance = Infinity;
    for (const slot of this.bombs) {
      if (!slot.active || slot.team===team ||
          !(slot.device && this.deviceOwnerAlive(slot) || slot.torpedo?.mode==='CHASE')) continue;
      const contact = segmentSphereDistance(from,to,slot.position,slot.device?.hp ? .27 : .19);
      if (contact!==null && contact<distance) {hit=slot;distance=contact;}
    }
    if (!hit) return null;
    const target = hit;
    return {distance,damage:(hp:number)=>{
      const object = target.device ?? target.torpedo;
      if (!target.active || !object || hp<=0) return;
      object.hp-=hp;
      if (object.hp<=0) this.deactivate(target);
    }};
  }

  private deviceOwnerAlive(slot: BombSlot): boolean {
    const actor = slot.f4?.actor;
    return actor ? this.cpuAgents.isF4DeviceOwnerAlive(actor) : this.resources.currentHp>0;
  }

  private stepF4Sprinkler(slot: BombSlot, profile: SubWeaponProfile, dt: number): void {
    if (!this.deviceOwnerAlive(slot)) {
      this.deactivate(slot);
      return;
    }
    const device = slot.device;
    if (!device) {
      const delta = slot.velocity.clone().mulScalar(dt);
      delta.y -= profile.gravityMetersPerSecond2 * dt*dt/2;
      slot.velocity.y -= profile.gravityMetersPerSecond2 * dt;
      const next = slot.position.clone().add(delta);
      const hit = this.physics.castStageSegment(slot.position,next,'thrown-sub');
      const shield = this.f4Runtime!.findF4CanopyHit(slot.position,next,slot.team,.12);
      slot.ttl -= dt;
      if (shield && shield.distance < (hit?.distance??Infinity)) {
        const back = delta.normalize().mulScalar(.045);
        slot.position.copy(shield.point).sub(back);
        slot.velocity.mulScalar(-.35);
      } else if (hit?.normal) {
        for (const old of this.bombs) {
          if (old!==slot && old.active && old.device && old.f4?.actor===slot.f4?.actor)
            this.deactivate(old);
        }
        slot.device = {normal:hit.normal.clone(),hp:120,age:0,emitted:0};
        slot.position.copy(hit.point).add(hit.normal.clone().mulScalar(.28));
        this.paintF4SubContact(slot,hit,profile.paintRadiusMeters,PaintEventType.Bomb);
      } else slot.position.copy(next);
      if (!slot.device && (slot.ttl<=0 || slot.position.y < -35)) this.deactivate(slot);
      slot.entity.setPosition(slot.position);
      return;
    }
    device.age++;
    // Local phase tuning: second raw threshold is treated as absolute.
    const interval = device.age < 480 ? 7 : device.age < 900 ? 11 : 17;
    if (device.age%interval!==0) return;
    const axis = device.normal;
    const side = new Vec3().cross(axis,Math.abs(axis.y)<.9?Vec3.UP:Vec3.RIGHT).normalize();
    const around = new Vec3().cross(axis,side);
    const angle = device.emitted*2.399963229728653;
    const speed = device.age<480 ? 5.8 : device.age<900 ? 4.9 : 3.8;
    const velocity = side.mulScalar(Math.cos(angle)*speed).add(around.mulScalar(Math.sin(angle)*speed))
      .add(axis.clone().mulScalar(4.8));
    if (this.f4Runtime!.launchF4SprinklerDrop(slot.position,velocity,slot.team,slot.f4?.actor,
      undefined,undefined,slot.f4?.gaugeLaunchLife))
      device.emitted++;
  }

  private paintF4SubContact(slot:BombSlot, stage:ReturnType<RapierStagePhysics['castStageSegment']>,
    radius:number, type:PaintEventType):void {
    const hit = this.physics.f4PaintAtStageHit(stage,this.surfaces);
    if (!hit || !(hit.surface.baseFlags&SurfaceFlags.Paintable)) return;
    const actor = slot.f4?.actor;
    this.coordinator.enqueue({source:actor?PaintSource.Cpu:PaintSource.Human,actorId:actor,
      ...(slot.f4?.gaugeLaunchLife!==undefined?{f4GaugeLaunchLife:slot.f4.gaugeLaunchLife}:{}),
      team:slot.team,surfaceId:hit.surface.id,centerU:hit.u,centerV:hit.v,
      radiusU:radius,radiusV:radius,angle:0,strength:1,type});
  }

  private stepF4Curling(slot: BombSlot, profile: SubWeaponProfile, dt: number): void {
    const curling = slot.curling!;
    const state = slot.f4!;
    const from = slot.position.clone();
    const down = new Vec3(0,-.18,0);
    const support = this.physics.castStageSegment(from,from.clone().add(down),'thrown-sub');
    const ground = support?.normal && support.normal.y>=.55 && slot.velocity.y<=.4 ? support : null;
    if (ground?.normal) {
      slot.velocity.sub(ground.normal.clone().mulScalar(slot.velocity.dot(ground.normal)));
    } else slot.velocity.y -= profile.gravityMetersPerSecond2*dt;
    const next = from.clone().add(slot.velocity.clone().mulScalar(dt));
    const stage = this.physics.castStageSegment(from,next,'thrown-sub');
    const shield = this.f4Runtime!.findF4CanopyHit(from,next,slot.team);
    const blocker = Math.min(stage?.distance??Infinity,shield?.distance??Infinity);
    const cpu = this.cpuAgents.findNearestCombatHit(from,next,slot.team,{radius:.14,resolvedTargets:new Set()});
    const human = state.actor ? this.f4Runtime!.findNativeSourceHumanPhysicalHit(from,next,slot.team,.14) : null;
    const cpuClear = cpu && (!cpu.targetPoint || !this.physics.castStageSegment(cpu.point,cpu.targetPoint,'thrown-sub'));
    const enemy = cpuClear && cpu && cpu.distance<=(human?.distance??Infinity) ? cpu : null;
    if (enemy && enemy.distance+1e-5<blocker) {
      if (state.elapsed-(curling.lastContact.get(enemy.botId)??-40)>=40) {
        this.cpuAgents.applyProjectileHit(enemy,20,state.actor?'CPU':'HUMAN',state.actor);
        curling.lastContact.set(enemy.botId,state.elapsed);
      }
    } else if (!enemy && human && human.distance+1e-5<blocker &&
        state.elapsed-(curling.lastContact.get('human')??-40)>=40) {
      this.f4Runtime!.applyF4SubDirectToHuman(human.point,slot.team,20);
      curling.lastContact.set('human',state.elapsed);
    }
    if (shield && shield.distance<(stage?.distance??Infinity)) {
      slot.position.copy(shield.point).sub(slot.velocity.clone().normalize().mulScalar(.04));
      slot.velocity.mulScalar(-.75);
      this.f4Runtime!.damageF4Canopy(shield,20);
    } else if (stage?.normal) {
      const normal = stage.normal;
      slot.position.copy(stage.point).add(normal.clone().mulScalar(.055));
      if (normal.y<.55) {
        const flat = new Vec3(normal.x,0,normal.z).normalize();
        const speed = slot.velocity.dot(flat);
        if (speed<0) slot.velocity.sub(flat.mulScalar(2*speed));
      } else {
        slot.velocity.sub(normal.clone().mulScalar(Math.min(0,slot.velocity.dot(normal))));
      }
      this.paintF4SubContact(slot,stage,.20,PaintEventType.Bomb);
    } else slot.position.copy(next);
    const floor = this.physics.castStageSegment(slot.position.clone().add(new Vec3(0,.025,0)),
      slot.position.clone().add(down),'thrown-sub');
    if (floor?.normal && floor.normal.y>=.55 && slot.velocity.y<=.4) {
      slot.position.y = floor.point.y+.055;
      slot.velocity.y = 0;
      if (ground) curling.trail+=Math.hypot(slot.position.x-from.x,slot.position.z-from.z);
      if (curling.trail>=.24) {
        curling.trail%=.24;
        this.paintF4SubContact(slot,floor,.20,PaintEventType.Bomb);
      }
    }
    if (!Number.isFinite(slot.position.lengthSq()) || slot.position.y< -35) this.deactivate(slot);
    else if (++state.elapsed>=curling.plan.fuse)
      this.explodeF4Bomb(slot,{...profile,outerDamageRadiusMeters:curling.plan.outer,
        paintRadiusMeters:curling.plan.paint},curling.plan.inner);
    else slot.entity.setPosition(slot.position);
  }

  private stepF4Mist(slot:BombSlot,profile:SubWeaponProfile,dt:number):void {
    if (slot.mist) {
      if (++slot.mist.age>=300) this.deactivate(slot);
      return;
    }
    slot.velocity.y-=profile.gravityMetersPerSecond2*dt;
    const next=slot.position.clone().add(slot.velocity.clone().mulScalar(dt));
    const hit=this.physics.castStageSegment(slot.position,next,'thrown-sub');
    if (hit) {
      slot.position.copy(hit.point);
      slot.mist={age:0};
      if (!this.mistMaterial) {
        const material=makeBombMaterial([.44,.53,.38]);
        material.opacity=.23;
        material.blendType=BLEND_NORMAL;
        material.depthWrite=false;
        material.update();
        this.mistMaterial=material;
      }
      const mesh=slot.entity.render?.meshInstances[0];
      if (mesh) mesh.material=this.mistMaterial;
      slot.entity.setLocalScale(4.7,4.7,4.7);
    } else {
      slot.position.copy(next);
      slot.ttl-=dt;
      if (slot.ttl<=0||slot.position.y < -35) this.deactivate(slot);
    }
    slot.entity.setPosition(slot.position);
  }

  private stepF4Torpedo(slot:BombSlot,profile:SubWeaponProfile,dt:number):void {
    const state=slot.torpedo!;
    const runtime=this.f4Runtime!;
    slot.ttl-=dt;
    if (slot.ttl<=0||slot.position.y < -35) {this.deactivate(slot);return;}
    if (state.mode==='CHASE') {
      const target=runtime.findF4SubOpponent(slot.position,slot.team,12,state.target);
      if (!target) {this.deactivate(slot);return;}
      const desired=target.point.sub(slot.position).normalize().mulScalar(12.5);
      slot.velocity.lerp(slot.velocity,desired,.28);
    } else {
      slot.velocity.y-=profile.gravityMetersPerSecond2*dt;
    }

    const next=slot.position.clone().add(slot.velocity.clone().mulScalar(dt));
    const stage=this.physics.castStageSegment(slot.position,next,'thrown-sub');
    if (state.mode==='CHASE') {
      const shield=runtime.findF4CanopyHit(slot.position,next,slot.team,.14);
      const cpu=this.cpuAgents.findNearestCombatHit(slot.position,next,slot.team,
        {radius:.14,resolvedTargets:new Set()});
      const human=slot.f4?.actor?runtime.findNativeSourceHumanPhysicalHit(slot.position,next,slot.team,.14):null;
      const cpuClear=cpu&&(!cpu.targetPoint||!this.physics.castStageSegment(cpu.point,cpu.targetPoint,'thrown-sub'));
      const body=cpuClear&&cpu&&cpu.distance<=(human?.distance??Infinity)?cpu:human;
      if (shield&&shield.distance<Math.min(stage?.distance??Infinity,body?.distance??Infinity)) {
        slot.position.copy(shield.point).sub(slot.velocity.clone().normalize().mulScalar(.035));
        this.burstF4Torpedo(slot,profile,null,true);
        return;
      }
      if (body&&body.distance+1e-5<(stage?.distance??Infinity)) {
        slot.position.copy(body.point);
        this.burstF4Torpedo(slot,profile,null,true);
        return;
      }
      if (stage?.normal) {
        slot.position.copy(stage.point).add(stage.normal.clone().mulScalar(.065));
        this.burstF4Torpedo(slot,profile,stage,true);
        return;
      }
    }

    if (stage?.normal) {
      slot.position.copy(stage.point).add(stage.normal.clone().mulScalar(.07));
      if (stage.normal.y>=.55) {
        if (state.mode==='THROWN') slot.velocity.mulScalar(.60);
        state.mode='ROLL';
        slot.velocity.y=0;
      } else {
        const speed=slot.velocity.dot(stage.normal);
        if (speed<0) slot.velocity.sub(stage.normal.clone().mulScalar(1.5*speed));
      }
    } else slot.position.copy(next);

    if (state.mode==='ROLL') {
      const floor=this.physics.castStageSegment(slot.position,
        slot.position.clone().add(new Vec3(0,-.16,0)),'thrown-sub');
      if (floor?.normal && floor.normal.y>=.55) {
        slot.position.y=floor.point.y+.07;
        slot.velocity.y=0;
        if (++state.supportTicks>=30) {this.burstF4Torpedo(slot,profile,floor,false);return;}
      }
    } else if (state.mode==='THROWN') {
      const target=runtime.findF4SubOpponent(slot.position,slot.team,6);
      if (target) {state.mode='CHASE';state.target=target.id;}
    }
    slot.entity.setPosition(slot.position);
  }

  private burstF4Torpedo(slot:BombSlot,profile:SubWeaponProfile,
    stage:ReturnType<RapierStagePhysics['castStageSegment']>, chase:boolean):void {
    const origin=slot.position;
    const actor=slot.f4?.actor;
    const rule=F4_SUB.torpedo;
    this.f4Runtime!.applyF4SubBlast(origin,slot.team,profile.outerDamageRadiusMeters,rule.far,
      {radius:profile.outerDamageRadiusMeters*rule.ratio,damage:rule.near});
    if (stage) this.paintF4SubContact(slot,stage,profile.paintRadiusMeters,PaintEventType.Bomb);
    if (chase) for (let i=0;i<8;i++) {
      const angle=i*Math.PI/4;
      const velocity=new Vec3(Math.cos(angle)*5,4.2,Math.sin(angle)*5);
      this.f4Runtime!.launchF4SprinklerDrop(origin,velocity,slot.team,actor,12,.35,slot.f4?.gaugeLaunchLife);
    }
    this.feedback.subBurst(slot.team,origin,profile.paintRadiusMeters);
    if (actor) this.stats.cpuSubExplosions++;
    else this.stats.playerSubExplosions++;
    this.deactivate(slot);
  }

  private stepF4Bomb(slot: BombSlot, profile: SubWeaponProfile, dt: number): void {
    if (slot.subId==='poison-mist') return this.stepF4Mist(slot,profile,dt);
    if (slot.torpedo) return this.stepF4Torpedo(slot,profile,dt);
    if (slot.curling) return this.stepF4Curling(slot,profile,dt);
    if (slot.subId==='sprinkler') return this.stepF4Sprinkler(slot,profile,dt);
    const state = slot.f4!;
    const rule = F4_SUB[slot.subId];
    let supported = false;
    if (!state.attached) {
      const step = Math.min(dt, slot.ttl);
      if (step <= 1e-8) {
        this.deactivate(slot);
        return;
      }
      const from = slot.position;
      const next = from.clone().add(slot.velocity.clone().mulScalar(step));
      next.y -= profile.gravityMetersPerSecond2 * step * step / 2;
      slot.velocity.y -= profile.gravityMetersPerSecond2 * step;
      const stage = this.physics.castStageSegment(from, next, 'thrown-sub');
      const shield = this.f4Runtime!.findF4CanopyHit(from, next, slot.team);
      if (rule.mode !== 'IMPACT' && shield && shield.distance < (stage?.distance ?? Infinity)) {
        const incoming = next.clone().sub(from).normalize();
        slot.position.copy(shield.point).sub(incoming.mulScalar(.025));
        slot.velocity.mulScalar(-.35);
        slot.ttl -= dt;
        slot.entity.setPosition(slot.position);
        return;
      }
      if (rule.mode === 'IMPACT') {
        const cpu = this.cpuAgents.findNearestCombatHit(from, next, slot.team,
          { radius:0,resolvedTargets:new Set() });
        const cpuCovered = cpu?.targetPoint && this.physics.castStageSegment(
          cpu.point,cpu.targetPoint,'thrown-sub');
        const human = state.actor ? this.f4Runtime!.findNativeSourceHumanPhysicalHit(from, next, slot.team) : null;
        const stageDistance = stage?.distance ?? Infinity;
        const actorDistance = Math.min(cpuCovered ? Infinity : cpu?.distance ?? Infinity, human?.distance ?? Infinity);
        if (shield && shield.distance <= actorDistance && shield.distance < stageDistance) {
          const incoming = next.clone().sub(from).normalize();
          slot.position.copy(shield.point).sub(incoming.mulScalar(.025));
          // Resolve one blast against the intact canopy snapshot before
          // applying direct shield contact, so a break cannot leak this blast.
          this.explodeF4Bomb(slot, profile);
          this.f4Runtime!.damageF4Canopy(shield, rule.direct);
          return;
        }
        if (actorDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < stageDistance) {
          if (cpu && !cpuCovered && cpu.distance === actorDistance) {
            this.cpuAgents.applyProjectileHit(cpu,rule.direct,state.actor?'CPU':'HUMAN',state.actor);
            slot.position.copy(cpu.point);
          } else if (human) {
            this.f4Runtime!.applyF4SubDirectToHuman(human.point,slot.team,rule.direct);
            slot.position.copy(human.point);
          }
          this.explodeF4Bomb(slot, profile);
          return;
        }
      }
      if (stage?.normal) {
        const normal = stage.normal;
        slot.position.copy(stage.point).add(normal.clone().mulScalar(.035));
        if (rule.mode === 'IMPACT') {
          this.explodeF4Bomb(slot, profile);
          return;
        }
        if (rule.mode === 'ATTACHED') {
          state.attached = true;
          slot.velocity.set(0,0,0);
          this.feedback.subFuse(slot.team,slot.position,rule.frames/60);
        } else {
          // Keep only the physical tangent on walkable support. Vertical
          // faces bounce and never qualify as ground fuse ticks.
          const incoming = Math.min(0, slot.velocity.dot(normal));
          slot.velocity.sub(normal.clone().mulScalar(incoming * (normal.y >= .5 ? 1 : 1.45)));
          slot.velocity.mulScalar(normal.y >= .5 ? .89 : .75);
        }
      } else {
        slot.position.copy(next);
      }
      if (rule.mode === 'GROUND') {
        const support = this.physics.castStageSegment(slot.position,slot.position.clone().add(new Vec3(0,-.085,0)),'thrown-sub');
        supported = (support?.normal?.y ?? 0) >= .5 && slot.velocity.y <= .35;
        if (supported) slot.velocity.y = Math.min(0,slot.velocity.y);
      }
      if (!supported && !state.attached) slot.ttl -= dt;
      if (state.attached) {
        slot.entity.setPosition(slot.position);
        return;
      }
    }
    state.elapsed = advanceF4BombFuse(slot.subId,state.elapsed,supported,state.attached);
    if (rule.frames > 0 && state.elapsed === rule.frames) this.explodeF4Bomb(slot,profile);
    else slot.entity.setPosition(slot.position);
  }

  private explodeF4Bomb(slot: BombSlot, profile: SubWeaponProfile, inner?:number): void {
    const rule = F4_SUB[slot.subId];
    const origin = slot.position;
    this.f4Runtime!.applyF4SubBlast(origin,slot.team,profile.outerDamageRadiusMeters,rule.far,
      { radius: inner??profile.outerDamageRadiusMeters * rule.ratio, damage: rule.near });
    const actor = slot.f4!.actor;
    // A burst ray must hit actual stage before it can paint a backed cell.
    for (let i = 0; i <= rule.splashes; i++) {
      const a = i * 2.399963229728653;
      const r = profile.paintRadiusMeters * Math.sqrt(i / rule.splashes) * .8;
      const end = origin.clone().add(new Vec3(Math.cos(a) * r,-1.6,Math.sin(a) * r));
      const hit = this.physics.f4PaintAtStageHit(this.physics.castStageSegment(origin,end,'ink-projectile'),this.surfaces);
      if (!hit || (hit.surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      const radius = profile.paintRadiusMeters * (i === 0 ? .42 : .23);
      this.coordinator.enqueue({ source: actor ? PaintSource.Cpu : PaintSource.Human,
        actorId:actor, team:slot.team, surfaceId:hit.surface.id, centerU:hit.u,centerV:hit.v,
        ...(slot.f4?.gaugeLaunchLife!==undefined?{f4GaugeLaunchLife:slot.f4.gaugeLaunchLife}:{}),
        radiusU:radius,radiusV:radius,angle:a,strength:1,type:PaintEventType.Bomb });
    }
    this.feedback.subBurst(slot.team,origin,profile.paintRadiusMeters);
    if (actor) this.stats.cpuSubExplosions++;
    else this.stats.playerSubExplosions++;
    this.deactivate(slot);
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
    const cover=this.f4Canopies?.createF4CanopyCover(slot.position,slot.team,profile.outerDamage);
    const originalSourceBlastClear=this.nativeSourceHumanSubBodyContactEnabled||cover?
      (body:Vec3)=>{
       const span=slot.position.distance(body);
       if(!Number.isFinite(span))return false;
       if(span<=1e-8)return true;
       const hit=this.physics.castStageSegment(
         slot.position,body,'ink-projectile');
       return (!hit||Number.isFinite(hit.distance)&&
        hit.distance>=Math.max(0,span-.025))&&(cover?.(body)??true);
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
      if ((surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      const projected = surface.projectWorldPoint(worldPoint);
      if (!projected.inside || projected.planeDistance > maxPlaneDistance ||
          (this.physics.hasF4WholeResearchTrimesh&&
           !this.physics.hasF4PaintBacking(surface,projected.u,projected.v))||
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
