import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';
import type { WeaponProfile } from '../weapons/WeaponCatalog';

interface FxSlot {
  entity: Entity;
  ttl: number;
  duration: number;
  baseScale: number;
}

export class GameFeedback {
  private readonly fx: FxSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly neutralMaterial: StandardMaterial;
  private audio: AudioContext | null = null;

  public constructor(
    private readonly app: AppBase,
    canvas: HTMLCanvasElement
  ) {
    this.materialA = makeFxMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeFxMaterial(GAME_CONFIG.visual.teamB);
    this.neutralMaterial = makeFxMaterial([1, 0.92, 0.62]);

    for (let i = 0; i < 48; i += 1) {
      const entity = new Entity(`T14Fx:${i}`);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.neutralMaterial,
        castShadows: false,
        receiveShadows: false
      });
      entity.enabled = false;
      app.root.addChild(entity);
      this.fx.push({ entity, ttl: 0, duration: 0, baseScale: 0 });
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
      const scale = slot.baseScale * (1 + progress * 1.8);
      slot.entity.setLocalScale(scale, scale, scale);
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

  public splat(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.36, 0.32);
    this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42);
  }

  public respawn(team: Team.A | Team.B, position: Vec3): void {
    this.spawnFx(team, position, 0.22, 0.24);
    this.playTone(430, 0.035, 0.11, 'sine', 1.35);
  }

  public weaponSwitch(): void {
    this.playTone(660, 0.022, 0.06, 'sine', 1.22);
  }

  private spawnFx(
    team: Team.A | Team.B,
    position: Vec3,
    baseScale: number,
    duration: number
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

function makeFxMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.95, rgb[1] * 0.95, rgb[2] * 0.95);
  material.useMetalness = false;
  material.gloss = 0.55;
  material.update();
  return material;
}
