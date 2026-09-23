import type { AppBase } from 'playcanvas';
import type { FixedStepClock } from '../core/FixedStepClock';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { GpuInkAtlas } from '../ink/GpuInkAtlas';

export class DebugOverlay {
  private readonly element: HTMLDivElement;
  private lastRender = 0;

  public constructor(
    root: HTMLElement,
    private readonly app: AppBase,
    private readonly clock: FixedStepClock,
    private readonly stats: PerformanceStats,
    private readonly gameplay: GameplayInkSystem,
    private readonly atlas: GpuInkAtlas,
    private readonly rendererName: string
  ) {
    this.element = document.createElement('div');
    this.element.id = 'debug-panel';
    this.element.className = 'panel';
    root.appendChild(this.element);
  }

  public update(now = performance.now()): void {
    if (now - this.lastRender < 100) return;
    this.lastRender = now;
    const turf = this.gameplay.snapshot();
    const drawCalls = readDrawCalls(this.app);
    const last = this.stats;
    const healthy = last.averageFrameMs === 0 || last.averageFrameMs < 16.8;

    this.element.innerHTML = `
      <div class="title">TECHNICAL VERTICAL SLICE <span class="${healthy ? 'ok' : 'warn'}">T10 STABLE</span></div>
      <div class="grid">
        <span class="muted">Renderer</span><span>${escapeHtml(this.rendererName)}</span>
        <span class="muted">Coord audit</span><span>${escapeHtml(last.coordinateAudit)}</span>
        <span class="muted">FPS</span><span>${last.fps.toFixed(1)}</span>
        <span class="muted">Frame</span><span>${last.averageFrameMs.toFixed(2)} ms</span>
        <span class="muted">Fixed tick</span><span>${this.clock.tick} @ ${this.clock.tickRate} Hz</span>
        <span class="muted">Ticks/frame</span><span>${last.simulationTicksLastFrame}</span>
        <span class="muted">Dropped sim</span><span>${last.droppedSimulationSeconds.toFixed(3)} s</span>
        <span class="muted">Player XYZ</span><span>${last.playerWorldX.toFixed(2)}, ${last.playerWorldY.toFixed(2)}, ${last.playerWorldZ.toFixed(2)}</span>
        <span class="muted">Player form</span><span>${escapeHtml(last.playerMode)}</span>
        <span class="muted">Locomotion</span><span>${escapeHtml(last.playerLocomotionState)}</span>
        <span class="muted">Collider</span><span>${escapeHtml(last.playerCollider)}</span>
        <span class="muted">Grounded</span><span>${last.playerGrounded ? 'yes' : 'no'}</span>
        <span class="muted">Move speed</span><span>${last.playerSpeedMetersPerSecond.toFixed(2)} m/s</span>
        <span class="muted">Ink sample</span><span>${escapeHtml(last.playerInkRelation)}</span>
        <span class="muted">Sample surface</span><span>${escapeHtml(last.playerSampleSurface)}</span>
        <span class="muted">Sample U/V</span><span>${formatUv(last.playerSampleU, last.playerSampleV)}</span>
        <span class="muted">Last paint</span><span>${escapeHtml(last.lastPaintSurface)} · ${formatUv(last.lastPaintU, last.lastPaintV)}</span>
        <span class="muted">Paint world</span><span>${formatXyz(last.lastPaintWorldX, last.lastPaintWorldY, last.lastPaintWorldZ)}</span>
        <span class="muted">Wall surface</span><span>${escapeHtml(last.playerWallSurface)}</span>
        <span class="muted">Surge charge</span><span>${(last.playerSurgeCharge * 100).toFixed(0)}%</span>
        <span class="muted">Roll ready</span><span>${last.playerSquidRollReady ? 'yes' : 'no'}</span>
        <span class="muted">Ink tank</span><span>${last.playerInk.toFixed(1)} / 100 · ${last.playerInkPercent.toFixed(0)}%</span>
        <span class="muted">Ink recovery</span><span>${escapeHtml(last.playerInkRecoveryState)}</span>
        <span class="muted">HP</span><span>${last.playerHp.toFixed(1)} / 100</span>
        <span class="muted">HP recovery</span><span>${escapeHtml(last.playerHpRecoveryState)}</span>
        <span class="muted">Damage taken</span><span>${last.playerDamageTaken.toFixed(1)}</span>
        <span class="muted">Shots / dry</span><span>${last.shotsFired} / ${last.inkDryFireAttempts}</span>
        <span class="muted">Combat hits</span><span>${last.combatHits}</span>
        <span class="muted">Target downs</span><span>${last.combatTargetDowns}</span>
        <span class="muted">Target A HP</span><span>${last.targetAHp.toFixed(0)}</span>
        <span class="muted">Target B HP</span><span>${last.targetBHp.toFixed(0)}</span>
        <span class="muted">Projectiles</span><span>${last.activeProjectiles}</span>
        <span class="muted">Impacts</span><span>${last.projectileImpacts}</span>
        <span class="muted">Pool drops</span><span>${last.projectilePoolDrops}</span>
        <span class="muted">Paint events/s</span><span>${last.paintEventsPerSecond.toFixed(0)}</span>
        <span class="muted">Ink cells/s</span><span>${last.paintCellsPerSecond.toFixed(0)}</span>
        <span class="muted">Dirty tiles</span><span>${last.dirtyTiles}</span>
        <span class="muted">GPU events/frame</span><span>${last.gpuEventsLastFrame}</span>
        <span class="muted">GPU build</span><span>${last.gpuPaintBuildMs.toFixed(2)} ms</span>
        <span class="muted">GPU backlog</span><span>${this.atlas.backlog}</span>
        <span class="muted">Ink atlas</span><span>${this.atlas.atlasSize}² RGBA8</span>
        <span class="muted">Draw calls</span><span>${drawCalls}</span>
        <span class="muted">Team A turf</span><span>${turf.percentA.toFixed(2)}% · ${turf.areaA.toFixed(1)}m²</span>
        <span class="muted">Team B turf</span><span>${turf.percentB.toFixed(2)}% · ${turf.areaB.toFixed(1)}m²</span>
        <span class="muted">Neutral</span><span>${(100 - turf.percentA - turf.percentB).toFixed(2)}%</span>
      </div>`;
  }
}

function readDrawCalls(app: AppBase): string {
  const stats = (app as unknown as { stats?: { drawCalls?: { total?: number } } }).stats;
  const value = stats?.drawCalls?.total;
  return typeof value === 'number' ? String(value) : 'n/a';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char] ?? char));
}

function formatUv(u: number, v: number): string {
  return Number.isFinite(u) && Number.isFinite(v) ? `${u.toFixed(2)}, ${v.toFixed(2)}` : '-';
}

function formatXyz(x: number, y: number, z: number): string {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
    ? `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`
    : '-';
}
