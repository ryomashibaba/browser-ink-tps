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
      <div class="title">INK FOUNDATION LAB <span class="${healthy ? 'ok' : 'warn'}">T0–T3</span></div>
      <div class="grid">
        <span class="muted">Renderer</span><span>${escapeHtml(this.rendererName)}</span>
        <span class="muted">FPS</span><span>${last.fps.toFixed(1)}</span>
        <span class="muted">Frame</span><span>${last.averageFrameMs.toFixed(2)} ms</span>
        <span class="muted">Fixed tick</span><span>${this.clock.tick} @ ${this.clock.tickRate} Hz</span>
        <span class="muted">Ticks/frame</span><span>${last.simulationTicksLastFrame}</span>
        <span class="muted">Dropped sim</span><span>${last.droppedSimulationSeconds.toFixed(3)} s</span>
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
