import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';
import type { WeaponClass, WeaponProfile } from '../weapons/WeaponCatalog';

type FxMode = 'BURST' | 'FUSE';

interface FxSlot {
  entity: Entity;
  ttl: number;
  duration: number;
  baseScale: number;
  mode: FxMode;
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

  public constructor(
    private readonly app: AppBase,
    canvas: HTMLCanvasElement
  ) {
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
      if (slot.mode === 'FUSE') {
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
    active: boolean
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
        this.updateChargerCharge(origin, forward, right, up, t);
        break;
      case 'SPLATLING':
        this.updateSplatlingCharge(origin, forward, right, up, t, firstRing);
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
    this.spawnFx(team, position, 0.09 * profile.fxScale, 0.085);
    this.playTone(
      210 * profile.audioPitch,
      localPlayer ? 0.034 : 0.018,
      0.045,
      'square',
      0.55
    );
  }

  public impact(
    team: Team.A | Team.B,
    position: Vec3,
    profile: WeaponProfile
  ): void {
    this.spawnFx(team, position, 0.11 * profile.fxScale, 0.14);
    this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72);
  }

  public stringerFuse(
    team: Team.A | Team.B,
    position: Vec3,
    duration: number
  ): void {
    this.spawnFx(team, position, 0.11, Math.max(0.12, duration), 'FUSE');
    this.playTone(510, 0.014, 0.035, 'sine', 1.12);
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
    this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52);
  }

  public subThrow(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.12, 0.11);
    this.playTone(280, 0.022, 0.055, 'triangle', 1.35);
  }

  public subFuse(
    team: Team.A | Team.B,
    position: Vec3,
    duration: number
  ): void {
    this.spawnFx(team, position, 0.14, Math.max(0.2, duration), 'FUSE');
    this.playTone(430, 0.018, 0.045, 'sine', 1.18);
  }

  public subBurst(
    team: Team.A | Team.B,
    position: Vec3,
    radius: number
  ): void {
    const base = Math.max(0.30, radius * 0.22);
    this.spawnFx(team, position, base, 0.32);
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI * 0.5;
      this.spawnFx(
        team,
        position.clone().add(new Vec3(Math.cos(angle) * radius * 0.34, 0, Math.sin(angle) * radius * 0.34)),
        base * 0.72,
        0.24
      );
    }
    this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44);
  }

  public specialReady(): void {
    this.playTone(760, 0.030, 0.10, 'sine', 1.50);
  }

  public specialBurst(
    team: Team.A | Team.B,
    position: Vec3,
    radius: number
  ): void {
    this.spawnFx(team, position, Math.max(0.42, radius * 0.20), 0.38);
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI * 2 / 8;
      this.spawnFx(
        team,
        position.clone().add(new Vec3(Math.cos(angle) * radius * 0.58, 0.08, Math.sin(angle) * radius * 0.58)),
        0.24,
        0.30
      );
    }
    this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72);
  }

  public splat(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.36, 0.32);
    this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42);
  }

  public respawn(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.22, 0.24);
    this.playTone(430, 0.035, 0.11, 'sine', 1.35);
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
    this.playTone(720 * profile.audioPitch, 0.028, 0.07, 'sawtooth', 0.74);
  }

  public melee(
    team: Team.A | Team.B,
    center: Vec3,
    profile: WeaponProfile,
    scale = 1
  ): void {
    this.spawnFx(team, center, 0.20 * profile.fxScale * scale, 0.12);
    this.playTone(150 * profile.audioPitch, 0.026, 0.065, 'triangle', 0.58);
  }

  private updateChargerCharge(
    origin: Vec3,
    forward: Vec3,
    right: Vec3,
    up: Vec3,
    charge: number
  ): void {
    const corePoint = origin.clone().add(forward.clone().mulScalar(0.22));
    this.chargeCore.setPosition(corePoint);
    const coreScale = 0.08 + charge * 0.13;
    this.chargeCore.setLocalScale(coreScale, coreScale, coreScale);

    const guide = this.chargeBars[0]!;
    guide.enabled = true;
    const guideLength = 4 + charge * 14;
    placeBarAlong(guide, origin, forward, guideLength, 0.018 + charge * 0.008);

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
    firstRing: number
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
    guide.enabled = true;
    const guideLength = 3.2 + firstProgress * 10.8;
    placeBarAlong(
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

  private spawnFx(
    team: Team.A | Team.B,
    position: Vec3,
    baseScale: number,
    duration: number,
    mode: FxMode = 'BURST'
  ): void {
    const slot = this.fx.find((candidate) => candidate.ttl <= 0);
    if (!slot) return;

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) {
      meshInstance.material = team === Team.A ? this.materialA : this.materialB;
    }

    slot.ttl = duration;
    slot.duration = duration;
    slot.baseScale = baseScale;
    slot.mode = mode;
    slot.entity.setPosition(position);
    slot.entity.setLocalScale(baseScale, baseScale, baseScale);
    slot.entity.enabled = true;
  }

  private unlockAudio(): void {
    if (!this.audio) {
      const Context = window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      this.audio = new Context();
    }
    if (this.audio.state === 'suspended') void this.audio.resume();
  }

  private playTone(
    frequency: number,
    gainValue: number,
    duration: number,
    type: OscillatorType,
    endFrequencyMultiplier: number
  ): void {
    const audio = this.audio;
    if (!audio || audio.state !== 'running') return;

    const wallNow = performance.now();
    if (wallNow - this.lastAudioEventMs < 12) return;
    this.lastAudioEventMs = wallNow;

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
