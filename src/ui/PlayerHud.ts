import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { Team } from '../ink/types';
import type { StageDefinition } from '../stage/StageDefinition';

export class PlayerHud {
  private readonly root: HTMLDivElement;
  private readonly top: HTMLDivElement;
  private readonly resources: HTMLDivElement;
  private readonly state: HTMLDivElement;
  private readonly centerMessage: HTMLDivElement;
  private readonly chargeFx: HTMLDivElement;
  private lastUpdate = 0;

  public constructor(
    uiRoot: HTMLElement,
    private readonly stats: PerformanceStats,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stage: StageDefinition,
    private readonly getTeam: () => Team.A | Team.B
  ) {
    this.root = document.createElement('div');
    this.root.id = 'player-hud';
    this.top = document.createElement('div');
    this.top.id = 'hud-top';
    this.resources = document.createElement('div');
    this.resources.id = 'hud-resources';
    this.state = document.createElement('div');
    this.state.id = 'hud-state';
    this.centerMessage = document.createElement('div');
    this.centerMessage.id = 'hud-center-message';
    this.chargeFx = document.createElement('div');
    this.chargeFx.id = 'weapon-charge-vfx';
    this.root.append(
      this.top,
      this.resources,
      this.state,
      this.centerMessage,
      this.chargeFx
    );
    uiRoot.appendChild(this.root);
    this.update(0, true);
  }

  public update(now = performance.now(), force = false): void {
    if (!force && now - this.lastUpdate < 50) return;
    this.lastUpdate = now;

    const turf = this.gameplayInk.snapshot();
    const team = this.getTeam();
    const ownPercent = team === Team.A ? turf.percentA : turf.percentB;
    const enemyPercent = team === Team.A ? turf.percentB : turf.percentA;
    const teamClass = team === Team.A ? 'team-a' : 'team-b';

    this.top.innerHTML = `
      <div class="hud-stage">${escapeHtml(this.stage.metadata.displayName)}</div>
      <div class="hud-match-row">
        <span class="hud-turf hud-a">A ${turf.percentA.toFixed(1)}%</span>
        <span class="hud-clock">${formatClock(this.stats.matchTimeRemainingSeconds)}</span>
        <span class="hud-turf hud-b">${turf.percentB.toFixed(1)}% B</span>
      </div>
      <div class="hud-turf-track">
        <div class="hud-turf-fill-a" style="width:${clampPercent(turf.percentA)}%"></div>
        <div class="hud-turf-neutral" style="width:${clampPercent(100 - turf.percentA - turf.percentB)}%"></div>
        <div class="hud-turf-fill-b" style="width:${clampPercent(turf.percentB)}%"></div>
      </div>`;

    this.resources.innerHTML = `
      <div class="hud-resource-card ${teamClass}">
        <div class="hud-resource-label">INK</div>
        <div class="hud-meter"><i style="width:${clampPercent(this.stats.playerInkPercent)}%"></i></div>
        <div class="hud-resource-value">${this.stats.playerInk.toFixed(0)}</div>
      </div>
      <div class="hud-resource-card hp">
        <div class="hud-resource-label">HP</div>
        <div class="hud-meter"><i style="width:${clampPercent(this.stats.playerHp)}%"></i></div>
        <div class="hud-resource-value">${this.stats.playerHp.toFixed(0)}</div>
      </div>`;

    this.state.innerHTML = `
      <span class="hud-team-chip ${teamClass}">TEAM ${team === Team.A ? 'A' : 'B'}</span>
      <span class="hud-weapon-chip">${escapeHtml(this.stats.playerWeaponClass)} · ${escapeHtml(this.stats.playerWeaponName)} · ${escapeHtml(this.stats.playerWeaponAction)}</span>
      <span>OWN ${ownPercent.toFixed(1)}%</span>
      <span>ENEMY ${enemyPercent.toFixed(1)}%</span>
      <span>${escapeHtml(this.stats.playerLocomotionState)}</span>`;

    this.updateChargeFx(teamClass);

    this.centerMessage.className = '';
    if (this.stats.matchState === 'COUNTDOWN') {
      this.centerMessage.textContent = Math.max(1, Math.ceil(this.stats.matchCountdownSeconds)).toString();
      this.centerMessage.className = 'visible countdown';
    } else if (this.stats.playerLifeState === 'SPLATTED') {
      this.centerMessage.textContent = `SPLATTED · ${this.stats.playerRespawnSeconds.toFixed(1)}`;
      this.centerMessage.className = 'visible splatted';
    } else if (this.stats.matchState === 'ENDED') {
      this.centerMessage.textContent = this.stats.matchResult === 'TIE'
        ? 'DRAW'
        : `${this.stats.matchResult} WINS`;
      this.centerMessage.className = 'visible result';
    }
  }

  private updateChargeFx(teamClass: string): void {
    const kind = chargeKind(this.stats.playerWeaponClass);
    const percent = clampPercent(this.stats.playerWeaponChargePercent);
    const active = kind !== null && percent > 0.2;

    if (!active || !kind) {
      this.chargeFx.className = '';
      this.chargeFx.innerHTML = '';
      return;
    }

    this.chargeFx.className =
      `active ${kind} ${teamClass} ${percent >= 99 ? 'full' : ''}`;
    this.chargeFx.style.setProperty('--charge-deg', `${percent * 3.6}deg`);
    this.chargeFx.style.setProperty('--charge-pct', `${percent}%`);
    this.chargeFx.style.setProperty(
      '--stringer-offset',
      `${Math.max(3, 22 * (1 - percent / 100))}px`
    );

    switch (kind) {
      case 'charger':
        this.chargeFx.innerHTML =
          '<div class="charger-ring"></div><div class="charger-cross h"></div><div class="charger-cross v"></div>';
        break;
      case 'splatling':
        this.chargeFx.innerHTML =
          '<div class="splatling-ring"></div><div class="splatling-cross h"></div><div class="splatling-cross v"></div><i></i><i></i><i></i><i></i>';
        break;
      case 'stringer':
        this.chargeFx.innerHTML =
          '<div class="stringer-arrow left"></div><div class="stringer-arrow mid"></div><div class="stringer-arrow right"></div>';
        break;
      case 'splatana':
        this.chargeFx.innerHTML =
          '<div class="splatana-blade"><i></i></div><div class="splatana-spark"></div>';
        break;
    }
  }
}

function chargeKind(label: string): 'charger' | 'splatling' | 'stringer' | 'splatana' | null {
  if (label === 'チャージャー') return 'charger';
  if (label === 'スピナー') return 'splatling';
  if (label === 'ストリンガー') return 'stringer';
  if (label === 'ワイパー') return 'splatana';
  return null;
}

function formatClock(seconds: number): string {
  const value = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value % 60).toString().padStart(2, '0')}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char] ?? char
  ));
}
