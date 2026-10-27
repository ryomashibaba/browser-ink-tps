import { Entity, Vec3 } from 'playcanvas';
import {UndertowF3SmartOcclusion} from './UndertowF3SmartOcclusion';
import {b258Pose,type B258CameraProfile}
 from '../app/B258OriginalCameraComposition';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';

export interface DebugInkClick {
  hit: SurfaceRayHit;
  clientX: number;
  clientY: number;
}

/** Read-only intersection with the same live hit volumes used by projectiles. */
export type CombatAimQuery = (from: Vec3, to: Vec3) =>
  { distance: number; point: Vec3 } | null;

export class ThirdPersonCamera {
  private yaw = 0;
  private pitch = -12;
  private distance = 6.4;
  private shoulder = 0.72;
  private currentCameraDistance = Number.NaN;
  /** Gameplay options are opt-in for the T21 source practice preview only. */
  private sourcePracticeControls = false;
  private sourceSmartOcclusionEnabled = false;
  private readonly sourceSmartOcclusion=new UndertowF3SmartOcclusion();
  private readonly alternateCameraPosition=new Vec3();
  // B258: one opt-in paused, certified physics-clipped camera study.
  private b258ResearchEnabled=false;
  private b258ResearchProfile:B258CameraProfile='BASELINE';
  private b258OriginalCamera:{
   pitch:number;distance:number;shoulder:number;
   offset:number;physicalDistance:number;side:'RIGHT'|'LEFT'
  }|null=null;
  private sourceShoulderSide: 'RIGHT' | 'LEFT' = 'RIGHT';
  private currentShoulderOffset = 0.72;
  private sourcePracticeCameraCasts = 0;
  private sourcePracticeLastFrameClipped = false;
  private sourcePracticeLastFrameDistance = 0;
  private readonly target = new Vec3();
  private readonly forward = new Vec3();
  private readonly right = new Vec3();
  private readonly desiredCameraPosition = new Vec3();
  private readonly cameraDirection = new Vec3();
  // Reuse vector storage for the high-frequency source camera path.
  // Equivalent world direction; removes transient per-tick clones.
  private readonly lookAtPoint = new Vec3();
  private readonly rayEnd = new Vec3();
  private sourceCombatAimQuery: CombatAimQuery | null = null;

  public enableSourceCombatAim(query: CombatAimQuery): void {
    if (!this.sourcePracticeControls) throw Error('SOURCE_PRACTICE_REQUIRED');
    this.sourceCombatAimQuery = query;
  }

  /** Never enabled by the normal T20 camera or other stages. */
  public enableSourcePracticeControls(): void {
    this.sourcePracticeControls = true;
  }

  /** Only the explicitly source-only F3 preview may opt into auto
   * shoulder recovery. Production/default camera stays fully unchanged. */
  public enableSourcePracticeSmartOcclusion(){
    if(!this.sourcePracticeControls)
      throw Error('T21_B26_SOURCE_PRACTICE_REQUIRED');
    this.sourceSmartOcclusionEnabled=true;
  }
  /** Called exclusively by verified SOURCE QA app after URL opt-in. */
  public enableB258ResearchCamera():void{
   if(!this.sourcePracticeControls)throw Error('B258_SOURCE_PRACTICE_REQUIRED');
   this.b258ResearchEnabled=true;
  }
  /** Replace only camera geometry; retain original real stage clipping. */
  public setB258ResearchCameraProfile(name:B258CameraProfile):void{
   if(!this.b258ResearchEnabled)
    throw Error('B258_NATIVE_SOURCE_CAMERA_UNAUTHORIZED');
   if(!this.b258OriginalCamera){
    this.b258OriginalCamera={
     pitch:this.pitch,distance:this.distance,shoulder:this.shoulder,
     offset:this.currentShoulderOffset,
     physicalDistance:this.currentCameraDistance,side:this.sourceShoulderSide
    };
   }
   const original=this.b258OriginalCamera;
   if(name==='BASELINE'){
    this.pitch=original.pitch;
    this.distance=original.distance;
    this.shoulder=original.shoulder;
    this.currentShoulderOffset=original.offset;
    this.currentCameraDistance=original.physicalDistance;
    this.sourceShoulderSide=original.side;
   }else{
    const pose=b258Pose(name);
    this.pitch=pose.pitchDegrees;
    this.distance=pose.distanceMeters;
    this.shoulder=pose.shoulderMeters;
    this.currentShoulderOffset=pose.shoulderMeters;
    // Each study pose uses the genuine source 25-solid Rapier cast.
    this.currentCameraDistance=Number.NaN;
    this.sourceShoulderSide='RIGHT';
   }
   this.b258ResearchProfile=name;
  }
  public sourcePracticeViewSnapshot(){
    return {
      sourcePracticeOnly:this.sourcePracticeControls,
      b258OriginalCameraResearch:{
       enabled:this.b258ResearchEnabled,
       profile:this.b258ResearchProfile,
       baselineStored:!!this.b258OriginalCamera,
       researchOnly:true,physicalStageUnchanged:true
      },
      b26AdaptiveVisibility:{
       enabled:this.sourceSmartOcclusionEnabled,
       ...this.sourceSmartOcclusion.snapshot()
      },
      shoulderSide:this.sourceShoulderSide,
      shoulderOffsetMeters:this.currentShoulderOffset,
      desiredShoulderOffsetMeters:this.shoulder,
      zoomMeters:this.distance,
      currentCameraDistanceMeters:this.currentCameraDistance,
      yawDegrees:this.yaw,
      pitchDegrees:this.pitch,
      cameraRaycasts:this.sourcePracticeCameraCasts,
      geometryClipped:this.sourcePracticeLastFrameClipped,
      cameraDistanceMeters:this.sourcePracticeLastFrameDistance,
      sourcePhysicsModified:false,
      sourceNavigationModified:false
    };
  }

  public onDebugInkClick: ((click: DebugInkClick) => void) | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly cameraEntity: Entity,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics
  ) {
    this.bind();
  }

  public update(playerPosition: Vec3, recoveryDtSeconds = 0): void {
    const pitchRadians = this.pitch * Math.PI / 180;
    const yawRadians = this.yaw * Math.PI / 180;
    const cosPitch = Math.cos(pitchRadians);

    this.forward.set(
      Math.sin(yawRadians) * cosPitch,
      Math.sin(pitchRadians),
      -Math.cos(yawRadians) * cosPitch
    ).normalize();

    const flatLength = Math.hypot(this.forward.x, this.forward.z);
    if (flatLength > 1e-6) {
      this.right.set(-this.forward.z / flatLength, 0, this.forward.x / flatLength);
    } else {
      this.right.set(1, 0, 0);
    }

    this.target.set(playerPosition.x, playerPosition.y + 0.55, playerPosition.z);
    if(this.sourcePracticeControls&&recoveryDtSeconds>0&&
       Number.isFinite(recoveryDtSeconds)){
      const dt=Math.min(recoveryDtSeconds,.10);
      const blend=1-Math.exp(-14*dt);
      this.currentShoulderOffset+=
        (this.shoulder-this.currentShoulderOffset)*blend;
    }else if(!this.sourcePracticeControls){
      this.currentShoulderOffset=this.shoulder;
    }
    const offset=this.sourcePracticeControls?
      this.currentShoulderOffset:this.shoulder;
    this.desiredCameraPosition.set(
      this.target.x-this.forward.x*this.distance+this.right.x*offset,
      this.target.y-this.forward.y*this.distance+this.right.y*offset,
      this.target.z-this.forward.z*this.distance+this.right.z*offset
    );

    this.cameraDirection.copy(this.desiredCameraPosition).sub(this.target);
    const desiredDistance = this.cameraDirection.length();
    if (desiredDistance <= 1e-8) {
      this.cameraEntity.setPosition(this.target);
      return;
    }
    this.cameraDirection.mulScalar(1 / desiredDistance);

    const blocker = this.physics.castStageSegment(
      this.target,
      this.desiredCameraPosition,
      'camera'
    );
    if(this.sourcePracticeControls)this.sourcePracticeCameraCasts++;
    // On visual updates only, optionally check whether the ACTUAL
    // opposite original-stage shoulder ray offers a clear view. Never
    // cast through unverified optical meshes or move the real human.
    if(this.sourceSmartOcclusionEnabled&&recoveryDtSeconds>0&&
       document.pointerLockElement===this.canvas){
      this.sourceSmartOcclusion.tick(recoveryDtSeconds);
      if(blocker&&
         this.sourceSmartOcclusion.mayProbe(recoveryDtSeconds)){
        const clearance=Math.max(
         GAME_CONFIG.worldInteraction.cameraMinDistanceMeters,
         Math.min(desiredDistance,blocker.distance-
          GAME_CONFIG.worldInteraction.cameraCollisionPaddingMeters));
        if(desiredDistance-clearance>=1){
          // The far-side candidate is a CAMERA ONLY point; no player,
          // actor, Recast foot or collision is relocated.
          const altOffset=this.sourceShoulderSide==='RIGHT'?-.72:.72;
          this.alternateCameraPosition.set(
           this.target.x-this.forward.x*this.distance+this.right.x*altOffset,
           this.target.y-this.forward.y*this.distance+this.right.y*altOffset,
           this.target.z-this.forward.z*this.distance+this.right.z*altOffset);
          const altBlocker=this.physics.castStageSegment(
           this.target,this.alternateCameraPosition,'camera');
          this.sourcePracticeCameraCasts++;
          const altDistance=this.alternateCameraPosition.distance(this.target);
          const altClearance=altBlocker?Math.max(
           GAME_CONFIG.worldInteraction.cameraMinDistanceMeters,
           Math.min(altDistance,altBlocker.distance-
            GAME_CONFIG.worldInteraction.cameraCollisionPaddingMeters)):
           altDistance;
          const selected=this.sourceSmartOcclusion.observe({
            currentClearMeters:clearance,alternateClearMeters:altClearance,
            desiredMeters:desiredDistance,realDeltaSeconds:recoveryDtSeconds
          },this.sourceShoulderSide);
          if(selected!==this.sourceShoulderSide){
            this.sourceShoulderSide=selected;
            this.shoulder=selected==='RIGHT'?.72:-.72;
          }
        }else this.sourceSmartOcclusion.resetCandidate();
      }else this.sourceSmartOcclusion.resetCandidate();
    }
    const targetDistance = blocker
      ? Math.max(
          GAME_CONFIG.worldInteraction.cameraMinDistanceMeters,
          Math.min(
            desiredDistance,
            blocker.distance - GAME_CONFIG.worldInteraction.cameraCollisionPaddingMeters
          )
        )
      : desiredDistance;

    if (!Number.isFinite(this.currentCameraDistance)) {
      this.currentCameraDistance = targetDistance;
    } else if (targetDistance < this.currentCameraDistance) {
      // Retract immediately so the camera never spends a frame inside geometry.
      this.currentCameraDistance = targetDistance;
    } else if (recoveryDtSeconds > 0 && Number.isFinite(recoveryDtSeconds)) {
      // Expansion is intentionally damped so leaving an obstruction does not snap.
      const dt = Math.min(recoveryDtSeconds, GAME_CONFIG.simulation.maxFrameDeltaSeconds);
      const blend = 1 - Math.exp(
        -GAME_CONFIG.worldInteraction.cameraRecoverySharpness * dt
      );
      this.currentCameraDistance +=
        (targetDistance - this.currentCameraDistance) * blend;
    }

    this.currentCameraDistance = Math.min(this.currentCameraDistance, targetDistance);
    if(this.sourcePracticeControls){
      this.sourcePracticeLastFrameClipped=!!blocker;
      this.sourcePracticeLastFrameDistance=this.currentCameraDistance;
    }
    this.cameraEntity.setPosition(
      this.target.x + this.cameraDirection.x * this.currentCameraDistance,
      this.target.y + this.cameraDirection.y * this.currentCameraDistance,
      this.target.z + this.cameraDirection.z * this.currentCameraDistance
    );
    this.lookAtPoint.set(
      this.target.x+this.forward.x*12,
      this.target.y+this.forward.y*12,
      this.target.z+this.forward.z*12
    );
    this.cameraEntity.lookAt(this.lookAtPoint);
  }

  public getAimDirection(out = new Vec3()): Vec3 {
    const camera = this.cameraEntity.camera;
    if (!camera) return out.copy(this.forward).normalize();

    const rect = this.canvas.getBoundingClientRect();
    const from = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.nearClip);
    const to = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.farClip);
    return out.copy(to).sub(from).normalize();
  }

  public getAimTarget(out = new Vec3(), fallbackDistance = 80): Vec3 {
    const camera = this.cameraEntity.camera;
    if (!camera) {
      return out.copy(this.cameraEntity.getPosition()).add(this.forward.clone().mulScalar(fallbackDistance));
    }

    const rect = this.canvas.getBoundingClientRect();
    const from = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.nearClip);
    const to = camera.screenToWorld(rect.width * 0.5, rect.height * 0.5, camera.farClip);
    const direction = to.clone().sub(from).normalize();

    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectRay(from, direction);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }

    const blockerEnd=this.rayEnd.set(
      from.x+direction.x*fallbackDistance,
      from.y+direction.y*fallbackDistance,
      from.z+direction.z*fallbackDistance
    );
    const blocker = this.physics.castStageSegment(from, blockerEnd, 'ink-projectile');
    if (
      best &&
      (!blocker ||
        best.distance <=
          blocker.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters)
    ) {
      out.copy(best.worldPoint);
    } else if (blocker) {
      out.copy(blocker.point);
    } else {
      out.copy(from).add(direction.mulScalar(fallbackDistance));
    }
    // Exact center-ray intersection only: no cone, sticky target, prediction,
    // HP write or hit award. World cover wins ties just as for projectiles.
    // Resolve distance at the actor rather than compensating parallax/gravity
    // for a floor or fallback point far BEHIND the actor.
    const actor = this.sourceCombatAimQuery?.(from, out);
    if (actor && Number.isFinite(actor.distance) && actor.distance >= 0 &&
        actor.distance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < from.distance(out) &&
        [actor.point.x, actor.point.y, actor.point.z].every(Number.isFinite)) {
      out.copy(actor.point);
    }
    return out;
  }

  public getFlatForward(out = new Vec3()): Vec3 {
    out.set(this.forward.x, 0, this.forward.z);
    if (out.lengthSq() < 1e-8) return out.set(0, 0, -1);
    return out.normalize();
  }

  private bind(): void {
    // The Q shoulder button is a VIEW option, never a movement, aim-assist
    // or collision bypass. It is disabled for all non-F3 routes.
    window.addEventListener('keydown', event=>{
      if(!this.sourcePracticeControls||event.code!=='KeyQ'||
         event.repeat||event.altKey||event.ctrlKey||event.metaKey||
         document.pointerLockElement!==this.canvas)return;
      this.sourceShoulderSide=this.sourceShoulderSide==='RIGHT'?'LEFT':'RIGHT';
      this.shoulder=this.sourceShoulderSide==='RIGHT'?.72:-.72;
      this.sourceSmartOcclusion.manual(this.sourceShoulderSide);
      event.preventDefault();
    });
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // Standard browser-TPS mouse look:
    // click the game view once to acquire pointer lock, then camera rotation follows
    // raw mouse movement without requiring any button to remain held.
    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button === 0 && event.altKey) {
        this.tryDebugPick(event.clientX, event.clientY);
        event.preventDefault();
        return;
      }

      if (document.pointerLockElement !== this.canvas) {
        void this.canvas.requestPointerLock().catch(() => {
          // Pointer lock can be denied by browser/user policy; keep normal UI usable.
        });
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== this.canvas) return;
      this.yaw += event.movementX * 0.22;
      this.pitch = Math.max(-55, Math.min(28, this.pitch - event.movementY * 0.18));
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.distance = Math.max(3.6, Math.min(9.5, this.distance * Math.exp(event.deltaY * 0.001)));
    }, { passive: false });
  }

  private tryDebugPick(clientX: number, clientY: number): void {
    const camera = this.cameraEntity.camera;
    if (!camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const locked = document.pointerLockElement === this.canvas;
    const x = locked ? rect.width * 0.5 : Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = locked ? rect.height * 0.5 : Math.max(0, Math.min(rect.height, clientY - rect.top));
    const from = camera.screenToWorld(x, y, camera.nearClip);
    const to = camera.screenToWorld(x, y, camera.farClip);
    const direction = to.clone().sub(from).normalize();

    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectRay(from, direction);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    if (best) this.onDebugInkClick?.({ hit: best, clientX, clientY });
  }
}
