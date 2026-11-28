import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';
import type { WeaponClass, WeaponProfile } from '../weapons/WeaponCatalog';
import {chooseSlot,droplet,pose,particleBudget} from './F4FeedbackMotion.mjs';
import {spatial,eventTone} from './F4SpatialAudio.mjs';
import {sourceShotTone,type SourceCue} from '../audio/SourcePracticeAudio';
import {f4AudioBus,weaponTexture,type F4Texture} from './F4AudioBus.mjs';

type FxMode = 'BURST' | 'FUSE' | 'DROP' | 'FLASH' | 'BEAM';

interface FxSlot {
  entity: Entity;
  ttl: number;
  duration: number;
  baseScale: number;
  mode: FxMode;
  priority?:number;
  beamLength?:number;
  motion?:{x:number;y:number;z:number;vx:number;vy:number;vz:number};
}

export class GameFeedback {
  private readonly fx: FxSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly neutralMaterial: StandardMaterial;

  private readonly chargeCore: Entity;
  private readonly chargeDots: Entity[] = [];
  private readonly chargeBars: Entity[] = [];
  private chargeClass: WeaponClass | null = null;
  private firstChargeLatched = false;
  private fullChargeLatched = false;

  private audio: AudioContext | null = null;
  private lastAudioEventMs = 0;
  private f4Presentation=false;
  private phase=0;
  private voices=0;
  private canvas:HTMLCanvasElement;
  private listener:[number,number,number,number,number]|null=null;
  private readonly handledCues=new Set<SourceCue>();
  public setF4Listener(position:Vec3,forward:Vec3):void {
    if(!this.f4Presentation)return;
    this.listener=[position.x,position.y,position.z,forward.x,forward.z];
    this.handledCues.clear();
  }
  public f4HandledSourceCues():ReadonlySet<SourceCue> {return this.handledCues;}
  public f4SpecialEvent(kind:string,team:Team.A|Team.B,position:Vec3):void {
    if(!this.f4Presentation)return;
    this.spawnFx(team,position,.22,.27,'BURST',3);
    this.spray(team,position,kind==='zipcaster'?4:6,.09,1.9,2.1,.30,2);
    const [frequency,multiplier,duration,wave]=eventTone(kind);
    this.playTone(frequency,.036,duration,wave,multiplier,2,position,undefined,'special-'+kind);
  }
  public f4DevicePulse(kind:string,team:Team.A|Team.B,position:Vec3):void {
    if(!this.f4Presentation)return;
    this.spawnFx(team,position,.23,.23,'BURST',2);
    this.spray(team,position,4,.10,1.8,1.6,.26,2);
    const [frequency,multiplier,duration,wave]=eventTone(kind);
    this.playTone(frequency,.026,duration,wave,multiplier,2,position);
  }
  public enableF4Presentation():void {this.f4Presentation=true;}
  public resetF4Presentation():void {
    if(!this.f4Presentation)return;
    for(const slot of this.fx){slot.ttl=0;slot.entity.enabled=false;slot.motion=undefined;}
    this.disableChargeVisual();this.phase=0;this.listener=null;this.handledCues.clear();f4AudioBus(this.canvas).reset();
  }

  public constructor(
    private readonly app: AppBase,
    canvas: HTMLCanvasElement
  ) {
    this.canvas=canvas;
    this.materialA = makeFxMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeFxMaterial(GAME_CONFIG.visual.teamB);
    this.neutralMaterial = makeFxMaterial([1, 0.92, 0.62]);

    for (let i = 0; i < 56; i += 1) {
      const entity = new Entity(`T14Fx:${i}`);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.neutralMaterial,
        castShadows: false,
        receiveShadows: false
      });
      entity.enabled = false;
      app.root.addChild(entity);
      this.fx.push({
        entity,
        ttl: 0,
        duration: 0,
        baseScale: 0,
        mode: 'BURST'
      });
    }

    this.chargeCore = makeChargeEntity(app, 'ChargeCore', 'sphere', this.neutralMaterial);
    for (let i = 0; i < 4; i += 1) {
      this.chargeDots.push(
        makeChargeEntity(app, `ChargeDot:${i}`, 'sphere', this.neutralMaterial)
      );
    }
    for (let i = 0; i < 3; i += 1) {
      this.chargeBars.push(
        makeChargeEntity(app, `ChargeBar:${i}`, 'box', this.neutralMaterial)
      );
    }

    const unlock = (): void => this.unlockAudio();
    canvas.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public update(dt: number): void {
    const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.05) : 0;
    for (const slot of this.fx) {
      if (slot.ttl <= 0) continue;
      slot.ttl = Math.max(0, slot.ttl - safeDt);
      if (slot.ttl <= 0) {
        slot.entity.enabled = false;
        continue;
      }

      const progress = 1 - slot.ttl / Math.max(slot.duration, 1e-5);
      if(slot.mode==='DROP'&&slot.motion){
        const m=slot.motion;
        const [x,y,z,s]=pose(m.x,m.y,m.z,m.vx,m.vy,m.vz,slot.duration-slot.ttl,slot.duration,slot.baseScale);
        slot.entity.setPosition(x,y,z);slot.entity.setLocalScale(s,s*1.25,s);
      } else if(slot.mode==='FLASH'){
        const scale=slot.baseScale*Math.max(0,1-progress)*(.85+.15*(1-progress));
        slot.entity.setLocalScale(scale,scale,scale);
      } else if(slot.mode==='BEAM'){
        const width=slot.baseScale*Math.max(0,1-progress);
        slot.entity.setLocalScale(width,width,(slot.beamLength??0)*Math.max(0,1-progress*.25));
      } else if (slot.mode === 'FUSE') {
        const pulse = 0.74 + Math.abs(Math.sin(progress * Math.PI * 9)) * 0.7;
        const grow = 1 + progress * 0.75;
        const scale = slot.baseScale * pulse * grow;
        slot.entity.setLocalScale(scale, scale, scale);
      } else {
        const scale = slot.baseScale * (1 + progress * 1.8);
        slot.entity.setLocalScale(scale, scale, scale);
      }
    }
  }

  public updateChargeVisual(
    profile: WeaponProfile,
    team: Team.A | Team.B,
    origin: Vec3,
    direction: Vec3,
    charge: number,
    active: boolean,
    guideLimit?:number
  ): void {
    const chargeClass = isChargeClass(profile.weaponClass)
      ? profile.weaponClass
      : null;

    if (!active || !chargeClass) {
      this.disableChargeVisual();
      return;
    }

    const t = clamp01(charge);
    if (this.chargeClass !== chargeClass) {
      this.firstChargeLatched = false;
      this.fullChargeLatched = false;
      this.chargeClass = chargeClass;
    }

    const firstRing = profile.firstChargeSeconds > 0 && profile.chargeSeconds > 0
      ? clamp01(profile.firstChargeSeconds / profile.chargeSeconds)
      : 0;

    const material = team === Team.A ? this.materialA : this.materialB;
    assignMaterial(this.chargeCore, material);
    for (const entity of this.chargeDots) assignMaterial(entity, material);
    for (const entity of this.chargeBars) assignMaterial(entity, material);

    this.chargeCore.enabled = true;
    const forward = direction.clone().normalize();
    const right = new Vec3(forward.z, 0, -forward.x);
    if (right.lengthSq() <= 1e-6) right.set(1, 0, 0);
    else right.normalize();
    const up = new Vec3().cross(right, forward).normalize();

    this.disableChargeParts();

    switch (chargeClass) {
      case 'CHARGER':
        this.updateChargerCharge(origin, forward, right, up, t,guideLimit);
        break;
      case 'SPLATLING':
        this.updateSplatlingCharge(origin, forward, right, up, t, firstRing,guideLimit);
        break;
      case 'STRINGER':
        this.updateStringerCharge(origin, forward, right, up, t, firstRing);
        break;
      case 'SPLATANA':
        this.updateSplatanaCharge(origin, forward, right, up, t);
        break;
    }

    if (
      firstRing > 0 &&
      t >= firstRing &&
      !this.firstChargeLatched
    ) {
      this.firstChargeLatched = true;
      this.spawnFx(team, origin, 0.16 * profile.fxScale, 0.16);
      this.playTone(620 * profile.audioPitch, 0.025, 0.075, 'sine', 1.24);
    } else if (firstRing > 0 && t < firstRing * 0.92) {
      this.firstChargeLatched = false;
    }

    if (t >= 0.995 && !this.fullChargeLatched) {
      this.fullChargeLatched = true;
      this.spawnFx(team, origin, 0.22 * profile.fxScale, 0.22);
      this.playTone(820 * profile.audioPitch, 0.032, 0.10, 'sine', 1.42);
    } else if (t < 0.94) {
      this.fullChargeLatched = false;
    }
  }

  public shot(
    team: Team.A | Team.B,
    position: Vec3,
    profile: WeaponProfile,
    localPlayer: boolean
  ): void {
    // Brief shrinking muzzle flash, rather than an expanding impact sphere.
    if(this.f4Presentation){
      const scale=Math.min(.18,.09*profile.fxScale*(localPlayer?1.35:1));
      this.spawnFx(team,position,scale,.065,'FLASH',localPlayer?1:0);
    }else this.spawnFx(team, position, 0.09 * profile.fxScale, 0.085);
    if(this.f4Presentation){
      const tone=sourceShotTone(profile.id);
      if(this.playTone(245*profile.audioPitch,(localPlayer?.025:.014)*tone.volume,.065*tone.length,tone.wave,130/245,localPlayer?1:0,localPlayer?undefined:position,weaponTexture(profile.weaponClass),localPlayer?'local-shot':'remote-shot')&&localPlayer)this.handledCues.add('SHOT');
      return;
    }
    if(this.playTone(
      210 * profile.audioPitch,
      localPlayer ? 0.034 : 0.018,
      0.045,
      'square',
      0.55,0,position,this.f4Presentation?weaponTexture(profile.weaponClass):undefined,localPlayer?'local-shot':'remote-shot'
    )&&this.f4Presentation&&localPlayer)this.handledCues.add('SHOT');
  }

  public impact(
    team: Team.A | Team.B,
    position: Vec3,
    profile: WeaponProfile
  ): void {
    this.spawnFx(team, position, 0.11 * profile.fxScale, 0.14);
    this.spray(team,position,3,.065*profile.fxScale,1.15,.85,.19,0);
    this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72,0,position,{volume:.022,lowpassHz:950},'impact');
  }

  /** B351 feedback is only invoked following genuine enemy CPU HP loss. */
  public confirmedHumanCpuDamage(
    team:Team.A|Team.B,at:Vec3,profile:WeaponProfile
  ):void {
    // Confirmed HP loss outranks decorative particles. Keep the central cue
    // visible even when a preceding explosion filled the shared FX pool.
    this.spawnFx(team,at,0.18*profile.fxScale,0.19,'BURST',4);
    this.spawnFx(team,at.clone().add(new Vec3(0,0.19,0)),
      0.085*profile.fxScale,0.13,'BURST',2,true);
    this.spray(team,at,4,.075,1.7,1.3,.23,2);
    if(this.playTone(660*profile.audioPitch,0.024,0.06,'sine',1.05,2,this.f4Presentation?undefined:at,undefined,'local-hit')&&this.f4Presentation)this.handledCues.add('CPU_HIT');
  }

  /** SOURCE: physical enemy hit response only, no fake damage or HUD.
   * Reuses the existing capped FX pool and audio channel. */
  public confirmedNativeHumanDamage(
    attacker:Team.A|Team.B,contact:Vec3,actualHpLoss:number
  ):void{
    if(!Number.isFinite(actualHpLoss)||actualHpLoss<=0)return;
    const intensity=Math.min(1,actualHpLoss/65);
    this.spawnFx(attacker,contact,0.15+intensity*0.09,0.18,'BURST',4);
    this.spawnFx(attacker,contact.clone().add(new Vec3(0,0.26,0)),
      0.07+intensity*0.06,0.13,'BURST',2,true);
    if(this.playTone(260-intensity*75,0.024,0.075,'triangle',0.88,2,this.f4Presentation?undefined:contact,undefined,'local-hurt')&&this.f4Presentation)this.handledCues.add('HURT');
  }

  public stringerFuse(
    team: Team.A | Team.B,
    position: Vec3,
    duration: number
  ): void {
    this.spawnFx(team, position, 0.11, Math.max(0.12, duration), 'FUSE');
    this.playTone(510, 0.014, 0.035, 'sine', 1.12,0,position);
  }

  public stringerBurst(
    team: Team.A | Team.B,
    position: Vec3,
    profile: WeaponProfile,
    radius: number
  ): void {
    const base = Math.max(0.22, radius * 0.26);
    this.spawnFx(team, position, base, 0.26);
    this.spawnFx(team, position.clone().add(new Vec3(radius * 0.28, 0, 0)), base * 0.68, 0.20);
    this.spawnFx(team, position.clone().add(new Vec3(-radius * 0.28, 0, 0)), base * 0.68, 0.20);
    this.spawnFx(team, position.clone().add(new Vec3(0, 0, radius * 0.28)), base * 0.68, 0.20);
    this.spray(team,position,7,.12,Math.min(4,radius*2),2.1,.34,2);
    this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52,2,position);
  }

  public subThrow(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.12, 0.11);
    this.playTone(280, 0.022, 0.055, 'triangle', 1.35,0,position);
  }

  public subFuse(
    team: Team.A | Team.B,
    position: Vec3,
    duration: number
  ): void {
    this.spawnFx(team, position, 0.14, Math.max(0.2, duration), 'FUSE');
    this.playTone(430, 0.018, 0.045, 'sine', 1.18,0,position);
  }

  public subBurst(
    team: Team.A | Team.B,
    position: Vec3,
    radius: number
  ): void {
    const base = Math.max(0.30, radius * 0.22);
    this.spawnFx(team, position, base, 0.32,'BURST',3);
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI * 0.5;
      this.spawnFx(
        team,
        position.clone().add(new Vec3(Math.cos(angle) * radius * 0.34, 0, Math.sin(angle) * radius * 0.34)),
        base * 0.72,
        0.24
      );
    }
    this.spray(team,position,8,.13,Math.min(5,radius*2),2.4,.38,2);
    this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2,position,{volume:.05,lowpassHz:450},'blast');
  }

  public specialReady(): void {
    if(this.f4Presentation)this.playTone(760,.042,.15,'sine',1.50,3,undefined,undefined,'special-ready');
    else this.playTone(760, 0.030, 0.10, 'sine', 1.50);
  }

  public specialBurst(
    team: Team.A | Team.B,
    position: Vec3,
    radius: number
  ): void {
    this.spawnFx(team, position, Math.max(0.42, radius * 0.20), 0.38,'BURST',3);
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI * 2 / 8;
      this.spawnFx(
        team,
        position.clone().add(new Vec3(Math.cos(angle) * radius * 0.58, 0.08, Math.sin(angle) * radius * 0.58)),
        0.24,
        0.30
      );
    }
    this.spray(team,position,9,.16,Math.min(5,radius*2.4),3,.40,2);
    this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,2,position,{volume:.055,lowpassHz:600},'special-blast');
  }

  public superJumpLaunch(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.24, 0.30);
    this.spawnFx(team, position.clone().add(new Vec3(0, 0.35, 0)), 0.16, 0.26);
    this.playTone(520, 0.032, 0.11, 'sine', 1.72,0,position);
  }

  public superJumpLand(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.32, 0.34);
    for (let i = 0; i < 6; i += 1) {
      const angle = i * Math.PI * 2 / 6;
      this.spawnFx(
        team,
        position.clone().add(new Vec3(Math.cos(angle) * 0.55, 0.06, Math.sin(angle) * 0.55)),
        0.13,
        0.22
      );
    }
    this.playTone(170, 0.045, 0.13, 'triangle', 1.48,0,position);
  }

  public splat(team: Team.A | Team.B, position: Vec3,local=false): void {
    this.spawnFx(team, position, 0.36, 0.32,'BURST',local?4:3);
    this.spray(team,position,10,.14,3.4,2.7,.42,2);
    if(this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,local?3:2,local?undefined:position,{volume:.04,lowpassHz:820},local?'local-splat':'remote-splat')&&this.f4Presentation&&local)this.handledCues.add('SPLAT');
  }

  public respawn(team: Team.A | Team.B, position: Vec3,local=false): void {
    this.spawnFx(team, position, 0.22, 0.24,'BURST',local?4:3);
    this.spray(team,position,6,.10,.7,3.1,.40,2);
    if(this.playTone(430, 0.035, 0.11, 'sine', 1.35,local?3:2,local?undefined:position,undefined,local?'local-respawn':'remote-respawn')&&this.f4Presentation&&local)this.handledCues.add('RESPAWN');
  }

  public weaponSwitch(): void {
    this.disableChargeVisual();
    this.playTone(660, 0.022, 0.06, 'sine', 1.22);
  }

  public beam(
    team: Team.A | Team.B,
    from: Vec3,
    to: Vec3,
    profile: WeaponProfile
  ): void {
    if(this.f4Presentation){
      // Reuse the capped sphere pool as short connected beam segments.
      // The endpoints come from the resolved physical ray, never nominal range.
      const length=from.distance(to);
      if(Number.isFinite(length)&&length>.015){
        const count=Math.min(8,Math.max(1,Math.ceil(length/1.8)));
        const step=length/count;
        const axis=to.clone().sub(from).mulScalar(1/length);
        for(let i=0;i<count;i++){
          const center=from.clone().add(axis.clone().mulScalar((i+.5)*step));
          const slot=this.spawnFx(team,center,Math.min(.10,.055*profile.fxScale),.095,'BEAM',1);
          if(!slot)break;
          slot.beamLength=step;
          slot.entity.lookAt(center.clone().add(axis));
          slot.entity.setLocalScale(slot.baseScale,slot.baseScale,step);
        }
      }
      this.playTone(720*profile.audioPitch,.028,.07,'sawtooth',.74,0,from);
      return;
    }
    const samples = 11;
    for (let i = 0; i < samples; i += 1) {
      const t = samples <= 1 ? 0 : i / (samples - 1);
      const point = new Vec3(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        from.z + (to.z - from.z) * t
      );
      this.spawnFx(team, point, 0.045 * profile.fxScale, 0.075);
    }
    this.playTone(720 * profile.audioPitch, 0.028, 0.07, 'sawtooth', 0.74,0,from);
  }

  public melee(
    team: Team.A | Team.B,
    center: Vec3,
    profile: WeaponProfile,
    scale = 1
  ): void {
    this.spawnFx(team, center, 0.20 * profile.fxScale * scale, 0.12);
    this.playTone(150 * profile.audioPitch, 0.026, 0.065, 'triangle', 0.58,0,center);
  }

  private updateChargerCharge(
    origin: Vec3,
    forward: Vec3,
    right: Vec3,
    up: Vec3,
    charge: number,
    guideLimit?:number
  ): void {
    const corePoint = origin.clone().add(forward.clone().mulScalar(0.22));
    this.chargeCore.setPosition(corePoint);
    const coreScale = 0.08 + charge * 0.13;
    this.chargeCore.setLocalScale(coreScale, coreScale, coreScale);

    const guide = this.chargeBars[0]!;
    const guideLength = guideLimit===undefined?4+charge*14:Math.min(4+charge*14,guideLimit);
    guide.enabled = guideLength>.02;
    if(guide.enabled)placeBarAlong(guide, origin, forward, guideLength, 0.018 + charge * 0.008);

    for (let i = 0; i < 3; i += 1) {
      const dot = this.chargeDots[i]!;
      dot.enabled = true;
      const angle = performance.now() * 0.008 + i * Math.PI * 2 / 3;
      const radius = 0.23 * (1 - charge) + 0.035;
      const point = corePoint.clone()
        .add(right.clone().mulScalar(Math.cos(angle) * radius))
        .add(up.clone().mulScalar(Math.sin(angle) * radius));
      dot.setPosition(point);
      const scale = 0.045 + charge * 0.025;
      dot.setLocalScale(scale, scale, scale);
    }
  }

  private updateSplatlingCharge(
    origin: Vec3,
    forward: Vec3,
    right: Vec3,
    up: Vec3,
    charge: number,
    firstRing: number,
    guideLimit?:number
  ): void {
    const firstProgress = firstRing > 0
      ? clamp01(charge / firstRing)
      : charge;
    const secondProgress = firstRing > 0 && firstRing < 1
      ? clamp01((charge - firstRing) / (1 - firstRing))
      : 0;

    // Ring 1 establishes maximum effective range; ring 2 mainly stores fire duration.
    const corePoint = origin.clone().add(forward.clone().mulScalar(0.20));
    this.chargeCore.setPosition(corePoint);
    const pulse = 0.075 + firstProgress * 0.075 + secondProgress * 0.055 +
      Math.abs(Math.sin(performance.now() * 0.014)) * 0.018;
    this.chargeCore.setLocalScale(pulse, pulse, pulse);

    const guide = this.chargeBars[0]!;
    const guideLength = guideLimit===undefined?3.2+firstProgress*10.8:Math.min(3.2+firstProgress*10.8,guideLimit);
    guide.enabled = guideLength>.02;
    if(guide.enabled)placeBarAlong(
      guide,
      origin,
      forward,
      guideLength,
      0.022 + firstProgress * 0.008 + secondProgress * 0.004
    );

    const spin = performance.now() * (0.004 + firstProgress * 0.007 + secondProgress * 0.006);
    const radius = 0.24 * (1 - firstProgress * 0.68) + 0.055;
    for (let i = 0; i < 4; i += 1) {
      const dot = this.chargeDots[i]!;
      dot.enabled = true;
      const angle = spin + i * Math.PI * 0.5;
      const point = corePoint.clone()
        .add(right.clone().mulScalar(Math.cos(angle) * radius))
        .add(up.clone().mulScalar(Math.sin(angle) * radius));
      dot.setPosition(point);
      const scale = 0.038 + firstProgress * 0.020 + secondProgress * 0.018;
      dot.setLocalScale(scale, scale, scale);
    }
  }

  private updateStringerCharge(
    origin: Vec3,
    forward: Vec3,
    right: Vec3,
    up: Vec3,
    charge: number,
    firstRing: number
  ): void {
    const firstProgress = firstRing > 0
      ? clamp01(charge / firstRing)
      : charge;
    const secondProgress = firstRing > 0 && firstRing < 1
      ? clamp01((charge - firstRing) / (1 - firstRing))
      : 0;

    const corePoint = origin.clone().add(forward.clone().mulScalar(0.20));
    this.chargeCore.setPosition(corePoint);
    const coreScale = 0.055 + firstProgress * 0.040 + secondProgress * 0.050;
    this.chargeCore.setLocalScale(coreScale, coreScale, coreScale);

    // Tri-Stringer-style: the first ring keeps the three-arrow spread;
    // convergence only starts through the second ring.
    const lateral = 0.30 * (1 - secondProgress * 0.85) + 0.045;
    const offsets = [-lateral, 0, lateral];
    for (let i = 0; i < 3; i += 1) {
      const bar = this.chargeBars[i]!;
      bar.enabled = true;
      const start = origin.clone()
        .add(right.clone().mulScalar(offsets[i]!))
        .add(up.clone().mulScalar((i - 1) * 0.03));
      const length = 0.55 + firstProgress * 0.18 + secondProgress * 0.28;
      placeBarAlong(
        bar,
        start,
        forward,
        length,
        0.026 + firstProgress * 0.006 + secondProgress * 0.010
      );
    }
  }

  private updateSplatanaCharge(
    origin: Vec3,
    forward: Vec3,
    right: Vec3,
    up: Vec3,
    charge: number
  ): void {
    const corePoint = origin.clone()
      .add(right.clone().mulScalar(0.14))
      .add(up.clone().mulScalar(0.04));
    this.chargeCore.setPosition(corePoint);
    const coreScale = 0.07 + charge * 0.10;
    this.chargeCore.setLocalScale(coreScale, coreScale, coreScale);

    const blade = this.chargeBars[0]!;
    blade.enabled = true;
    const bladeDirection = forward.clone()
      .add(up.clone().mulScalar(0.55))
      .normalize();
    placeBarAlong(blade, origin.clone().add(right.clone().mulScalar(0.17)), bladeDirection, 0.65 + charge * 0.85, 0.045 + charge * 0.035);

    if (charge > 0.55) {
      const spark = this.chargeDots[0]!;
      spark.enabled = true;
      const point = origin.clone()
        .add(bladeDirection.clone().mulScalar(0.65 + charge * 0.7));
      spark.setPosition(point);
      const scale = 0.05 + charge * 0.05;
      spark.setLocalScale(scale, scale, scale);
    }
  }

  private disableChargeVisual(): void {
    this.chargeClass = null;
    this.firstChargeLatched = false;
    this.fullChargeLatched = false;
    this.chargeCore.enabled = false;
    this.disableChargeParts();
  }

  private disableChargeParts(): void {
    for (const entity of this.chargeDots) entity.enabled = false;
    for (const entity of this.chargeBars) entity.enabled = false;
  }

  private spray(team:Team.A|Team.B,at:Vec3,count:number,size:number,speed:number,up:number,ttl:number,priority:number):void {
    if(!this.f4Presentation||![at.x,at.y,at.z,size,speed,up,ttl].every(Number.isFinite))return;
    if(this.listener){
      const [x,y,z]=this.listener;
      const dx=at.x-x,dy=at.y-y,dz=at.z-z;
      count=particleBudget(count,dx*dx+dy*dy+dz*dz);
    }
    if(count<=0)return;
    this.phase=(this.phase+2.399963229728653)%(2*Math.PI);
    for(let i=0;i<count;i++){
      const [vx,vy,vz]=droplet(i,count,this.phase,speed,up);
      const slot=this.spawnFx(team,at,size,ttl,'DROP',priority);
      if(!slot)break;
      slot.motion={x:at.x,y:at.y,z:at.z,vx,vy,vz};
    }
  }

  private spawnFx(
    team: Team.A | Team.B,
    position: Vec3,
    baseScale: number,
    duration: number,
    mode: FxMode = 'BURST',priority=0,confirmedAccent=false
  ): FxSlot|undefined {
    const slot = this.f4Presentation?this.fx[chooseSlot(this.fx,mode==='FUSE'?2:priority)]:this.fx.find((candidate) => candidate.ttl <= 0);
    if (!slot) return;

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) {
      // Only genuine HP-loss cues use the neutral accent; reused slots reset.
      meshInstance.material = this.f4Presentation&&confirmedAccent?this.neutralMaterial:
        team === Team.A ? this.materialA : this.materialB;
    }

    slot.ttl = duration;
    slot.duration = duration;
    slot.baseScale = baseScale;
    slot.mode = mode;
    slot.priority=mode==='FUSE'?2:priority;
    slot.motion=undefined;
    slot.beamLength=undefined;
    if(this.f4Presentation)slot.entity.setLocalEulerAngles(0,0,0);
    slot.entity.setPosition(position);
    slot.entity.setLocalScale(baseScale, baseScale, baseScale);
    slot.entity.enabled = true;
    return slot;
  }

  private unlockAudio(): void {
    if(this.f4Presentation){if(this.canvas.dataset.t21SourceAudio!=='MUTED')f4AudioBus(this.canvas).unlock();return;}
    if (!this.audio) {
      const Context = window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      try{this.audio = new Context();}catch{return;}
    }
    if (this.audio.state === 'suspended') void this.audio.resume().catch(()=>{});
  }

  private playTone(
    frequency: number,
    gainValue: number,
    duration: number,
    type: OscillatorType,
    endFrequencyMultiplier: number,priority=0,position?:Vec3,texture?:F4Texture,key?:string
  ): boolean {
    if(this.f4Presentation){
      if(document.pointerLockElement!==this.canvas||this.canvas.dataset.t21SourceAudio==='MUTED')return false;
      let attenuation=1,pan=0;
      if(position&&this.listener)[attenuation,pan]=spatial(...this.listener,position.x,position.y,position.z);
      if(attenuation<.015)return false;
      return f4AudioBus(this.canvas).play({frequency,end:Math.max(20,frequency*endFrequencyMultiplier),duration,volume:gainValue*attenuation,wave:type,priority,pan,texture:texture?{...texture,volume:texture.volume*attenuation}:undefined,key,cooldown:priority>=2?.025:.018});
    }
    const audio = this.audio;
    if (!audio || audio.state !== 'running') return false;
    const wallNow = performance.now();
    if (wallNow - this.lastAudioEventMs < 12) return false;
    this.lastAudioEventMs = wallNow;

    try{
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, frequency * endFrequencyMultiplier),
      now + duration
    );
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    this.voices++;
    oscillator.onended=()=>{this.voices=Math.max(0,this.voices-1);oscillator.disconnect();gain.disconnect();};
    return true;
    }catch{return false;}
  }
}

function makeChargeEntity(
  app: AppBase,
  name: string,
  type: 'sphere' | 'box',
  material: StandardMaterial
): Entity {
  const entity = new Entity(name);
  entity.addComponent('render', {
    type,
    material,
    castShadows: false,
    receiveShadows: false
  });
  entity.enabled = false;
  app.root.addChild(entity);
  return entity;
}

function assignMaterial(entity: Entity, material: StandardMaterial): void {
  const meshInstance = entity.render?.meshInstances[0];
  if (meshInstance) meshInstance.material = material;
}

function placeBarAlong(
  entity: Entity,
  origin: Vec3,
  direction: Vec3,
  length: number,
  thickness: number
): void {
  const dir = direction.clone().normalize();
  const end = origin.clone().add(dir.clone().mulScalar(length));
  const center = origin.clone().add(dir.clone().mulScalar(length * 0.5));
  entity.setPosition(center);
  entity.lookAt(end);
  entity.setLocalScale(thickness, thickness, length);
}

function isChargeClass(weaponClass: WeaponClass): boolean {
  return weaponClass === 'CHARGER' ||
    weaponClass === 'SPLATLING' ||
    weaponClass === 'STRINGER' ||
    weaponClass === 'SPLATANA';
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function makeFxMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.95, rgb[1] * 0.95, rgb[2] * 0.95);
  material.useMetalness = false;
  material.gloss = 0.55;
  material.update();
  return material;
}
