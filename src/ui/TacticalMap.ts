import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { SurfaceFlags, Team } from '../ink/types';
import type { StageDefinition } from '../stage/StageDefinition';

export class TacticalMap {
  private readonly shell: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private expanded = false;
  private lastRender = 0;

  public constructor(
    uiRoot: HTMLElement,
    private readonly stage: StageDefinition,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly stats: PerformanceStats,
    private readonly getTeam: () => Team.A | Team.B
  ) {
    this.shell = document.createElement('div');
    this.shell.id = 'tactical-map';
    this.shell.innerHTML = `
      <div class="map-header">
        <span>TACTICAL MAP</span>
        <span class="map-hint">M</span>
      </div>`;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 420;
    this.canvas.height = 320;
    this.shell.appendChild(this.canvas);
    uiRoot.appendChild(this.shell);

    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas2D context unavailable for Tactical Map.');
    this.context = context;

    window.addEventListener('keydown', (event) => {
      if (event.repeat || event.code !== 'KeyM') return;
      this.expanded = !this.expanded;
      this.shell.classList.toggle('expanded', this.expanded);
      this.render();
    });

    this.render();
  }

  public update(now = performance.now()): void {
    if (now - this.lastRender < 120) return;
    this.lastRender = now;
    this.render();
  }

  private render(): void {
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(5, 10, 15, 0.92)';
    ctx.fillRect(0, 0, width, height);

    this.drawStageSolids();
    this.drawInk();
    this.drawSpawnPoint(this.stage.metadata.teamASpawn, 'rgba(32,220,240,.95)');
    this.drawSpawnPoint(this.stage.metadata.teamBSpawn, 'rgba(255,52,156,.95)');
    this.drawAgents();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(
      `${this.stats.matchState} · ${formatClock(this.stats.matchTimeRemainingSeconds)}`,
      width * 0.5,
      24
    );
  }

  private drawStageSolids(): void {
    const ctx = this.context;
    ctx.fillStyle = 'rgba(160, 177, 190, 0.18)';
    ctx.strokeStyle = 'rgba(205, 225, 236, 0.20)';
    ctx.lineWidth = 1;

    for (const solid of this.stage.solids) {
      if (!solid.render) continue;
      const [cx, , cz] = solid.center;
      const [sx, , sz] = solid.size;
      const a = this.worldToMap(cx - sx * 0.5, cz - sz * 0.5);
      const b = this.worldToMap(cx + sx * 0.5, cz + sz * 0.5);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(b.x - a.x);
      const h = Math.abs(b.y - a.y);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    }
  }

  private drawInk(): void {
    const ctx = this.context;
    const stride = 3;
    const bounds = this.stage.metadata.worldBounds;
    const metersPerPixelX = (bounds.maxX - bounds.minX) / this.canvas.width;
    const metersPerPixelZ = (bounds.maxZ - bounds.minZ) / this.canvas.height;

    for (const surface of this.gameplayInk.getSurfaces()) {
      if ((surface.baseFlags & SurfaceFlags.Scoreable) === 0) continue;

      for (let y = 0; y < surface.heightCells; y += stride) {
        for (let x = 0; x < surface.widthCells; x += stride) {
          const owner = surface.ownerGrid[surface.index(x, y)] as Team;
          if (owner === Team.Neutral) continue;

          const u = Math.min(surface.widthMeters, (x + stride * 0.5) * surface.cellSize);
          const v = Math.min(surface.heightMeters, (y + stride * 0.5) * surface.cellSize);
          const world = surface.localToWorld(u, v);
          const point = this.worldToMap(world.x, world.z);
          const sizeX = Math.max(2, surface.cellSize * stride / metersPerPixelX);
          const sizeY = Math.max(2, surface.cellSize * stride / metersPerPixelZ);

          ctx.fillStyle = owner === Team.A
            ? 'rgba(32, 220, 240, 0.72)'
            : 'rgba(255, 52, 156, 0.72)';
          ctx.fillRect(point.x - sizeX * 0.5, point.y - sizeY * 0.5, sizeX, sizeY);
        }
      }
    }
  }

  private drawSpawnPoint(spawn: readonly [number, number, number], color: string): void {
    const point = this.worldToMap(spawn[0], spawn[2]);
    const ctx = this.context;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawAgents(): void {
    const ctx = this.context;
    this.cpuAgents.forEachMapAgent((id, team, position, active) => {
      if (!active) return;
      const point = this.worldToMap(position.x, position.z);
      ctx.fillStyle = team === Team.A ? '#28ddf0' : '#ff3ca0';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.72)';
      ctx.font = '700 8px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, point.x, point.y + 0.5);
    });

    const player = this.worldToMap(this.stats.playerWorldX, this.stats.playerWorldZ);
    const team = this.getTeam();
    ctx.fillStyle = team === Team.A ? '#b9fbff' : '#ffd1e8';
    ctx.strokeStyle = team === Team.A ? '#28ddf0' : '#ff3ca0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private worldToMap(x: number, z: number): { x: number; y: number } {
    const bounds = this.stage.metadata.worldBounds;
    const nx = (x - bounds.minX) / Math.max(1e-6, bounds.maxX - bounds.minX);
    const nz = (z - bounds.minZ) / Math.max(1e-6, bounds.maxZ - bounds.minZ);
    return {
      x: 10 + nx * (this.canvas.width - 20),
      y: 10 + (1 - nz) * (this.canvas.height - 20)
    };
  }
}

function formatClock(seconds: number): string {
  const value = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
}
