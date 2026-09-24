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
      <div class="hud-stage">${escapeHtml(this.stage.metadata.displayName)} · ${escapeHtml(this.stats.matchModeLabel)}</div>
      <div class="hud-match-row">
        <span class="hud-turf hud-a">A ${turf.percentA.toFixed(1)}%</span>
        <span class="hud-clock">${this.stats.matchOvertime ? 'OVERTIME' : formatClock(this.stats.matchTimeRemainingSeconds)}</span>
        <span class="hud-turf hud-b">${turf.percentB.toFixed(1)}% B</span>
      </div>
      <div class="hud-turf-track">
        <div class="hud-turf-fill-a" style="width:${clampPercent(turf.percentA)}%"></div>
        <div class="hud-turf-neutral" style="width:${clampPercent(100 - turf.percentA - turf.percentB)}%"></div>
        <div class="hud-turf-fill-b" style="width:${clampPercent(turf.percentB)}%"></div>
      </div>
      ${this.stats.matchMode === 'SPLAT_ZONES' ? `
        <div class="hud-zones">
          <span class="zone-count team-a">A ${this.stats.zonesCountA.toFixed(1)}${this.stats.zonesPenaltyA > 0 ? ` +${this.stats.zonesPenaltyA.toFixed(0)}` : ''}</span>
          <span class="zone-control">${escapeHtml(this.stats.zonesControl)} · ${this.stats.zonesPercentA.toFixed(0)}% / ${this.stats.zonesPercentB.toFixed(0)}%</span>
          <span class="zone-count team-b">${this.stats.zonesCountB.toFixed(1)}${this.stats.zonesPenaltyB > 0 ? ` +${this.stats.zonesPenaltyB.toFixed(0)}` : ''} B</span>
        </div>` : ''}`;

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
      </div>
      <div class="hud-resource-card special ${teamClass} ${this.stats.playerSpecialReady ? 'ready' : ''}">
        <div class="hud-resource-label">SPECIAL</div>
        <div class="hud-meter"><i style="width:${clampPercent(this.stats.playerSpecialPercent)}%"></i></div>
        <div class="hud-resource-value">${this.stats.playerSpecialReady ? 'READY' : this.stats.playerSpecialPoints.toFixed(0)}</div>
      </div>`;

    this.state.innerHTML = `
      <span class="hud-team-chip ${teamClass}">TEAM ${team === Team.A ? 'A' : 'B'}</span>
      <span class="hud-weapon-chip">${escapeHtml(this.stats.playerWeaponClass)} · ${escapeHtml(this.stats.playerWeaponName)} · ${escapeHtml(this.stats.playerWeaponAction)}</span>
      <span class="hud-kit-chip">F ${escapeHtml(this.stats.playerSubWeaponName)} · G ${escapeHtml(this.stats.playerSpecialName)}</span>
      ${this.stats.playerSuperJumpState !== 'IDLE'
        ? `<span class="hud-jump-chip">JUMP ${escapeHtml(this.stats.playerSuperJumpState)} · ${escapeHtml(this.stats.playerSuperJumpTarget)}</span>`
        : ''}
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
    } else if (this.stats.playerSuperJumpState === 'WAIT_GROUND') {
      this.centerMessage.textContent = 'SUPER JUMP · LAND FIRST';
      this.centerMessage.className = 'visible super-jump';
    } else if (this.stats.playerSuperJumpState === 'PREP') {
      this.centerMessage.textContent =
        `SUPER JUMP · PREP ${Math.round(this.stats.playerSuperJumpProgress * 100)}%`;
      this.centerMessage.className = 'visible super-jump';
    } else if (this.stats.playerSuperJumpState === 'TRAVEL') {
      this.centerMessage.textContent =
        `SUPER JUMP → ${this.stats.playerSuperJumpTarget}`;
      this.centerMessage.className = 'visible super-jump';
    } else if (this.stats.playerSuperJumpState === 'LANDING') {
      this.centerMessage.textContent = 'LANDING';
      this.centerMessage.className = 'visible super-jump landing';
    }
  }

  private updateChargeFx(teamClass: string): void {
    const kind = chargeKind(this.stats.playerWeaponClass);
    const percent = clampPercent(this.stats.playerWeaponChargePercent);
    const firstRingPercent = clampPercent(this.stats.playerWeaponFirstRingPercent);
    const twoRing = (kind === 'splatling' || kind === 'stringer') && firstRingPercent > 0;
    const ring1Progress = twoRing
      ? clampPercent(percent / Math.max(firstRingPercent, 0.001) * 100)
      : percent;
    const ring2Progress = twoRing
      ? clampPercent((percent - firstRingPercent) / Math.max(100 - firstRingPercent, 0.001) * 100)
      : 0;
    const active = kind !== null && percent > 0.2;

    if (!active || !kind) {
      this.chargeFx.className = '';
      this.chargeFx.innerHTML = '';
      return;
    }

    this.chargeFx.className =
      `active ${kind} ${teamClass} ${this.stats.playerWeaponChargeRing >= 1 ? 'ring1-ready' : ''} ${this.stats.playerWeaponChargeRing >= 2 ? 'ring2-ready' : ''} ${percent >= 99 ? 'full' : ''}`;
    this.chargeFx.style.setProperty('--charge-deg', `${percent * 3.6}deg`);
    this.chargeFx.style.setProperty('--charge-pct', `${percent}%`);
    this.chargeFx.style.setProperty('--ring1-deg', `${ring1Progress * 3.6}deg`);
    this.chargeFx.style.setProperty('--ring2-deg', `${ring2Progress * 3.6}deg`);
    this.chargeFx.style.setProperty(
      '--stringer-offset',
      `${Math.max(3, 22 * (1 - ring2Progress / 100))}px`
    );

    switch (kind) {
      case 'charger':
        this.chargeFx.innerHTML =
          '<div class="charger-ring"></div><div class="charger-cross h"></div><div class="charger-cross v"></div>';
        break;
      case 'splatling':
        this.chargeFx.innerHTML =
          '<div class="splatling-ring ring-one"></div><div class="splatling-ring ring-two"></div><div class="splatling-cross h"></div><div class="splatling-cross v"></div><i></i><i></i><i></i><i></i>';
        break;
      case 'stringer':
        this.chargeFx.innerHTML =
          '<div class="stringer-ring ring-one"></div><div class="stringer-ring ring-two"></div><div class="stringer-arrow left"></div><div class="stringer-arrow mid"></div><div class="stringer-arrow right"></div>';
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
