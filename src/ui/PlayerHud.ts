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
    this.root.append(this.top, this.resources, this.state, this.centerMessage);
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
      <span class="hud-weapon-chip">WEAPON · ${escapeHtml(this.stats.playerWeaponName)}</span>
      <span>OWN ${ownPercent.toFixed(1)}%</span>
      <span>ENEMY ${enemyPercent.toFixed(1)}%</span>
      <span>${escapeHtml(this.stats.playerLocomotionState)}</span>`;

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
