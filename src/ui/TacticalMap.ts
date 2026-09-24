import { Vec3 } from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { SurfaceFlags, Team } from '../ink/types';
import type { SuperJumpTarget } from '../mobility/SuperJumpSystem';
import type { StageDefinition } from '../stage/StageDefinition';
import { weaponProfile } from '../weapons/WeaponCatalog';

interface MapJumpCandidate {
  target: SuperJumpTarget;
  mapX: number;
  mapY: number;
}

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
    private readonly getTeam: () => Team.A | Team.B,
    private readonly canSuperJump: () => boolean,
    private readonly requestSuperJump: (target: SuperJumpTarget) => boolean
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
      this.setExpanded(!this.expanded);
    });

    this.canvas.addEventListener('click', (event) => this.handleMapClick(event));
    this.render();
  }

  public update(now = performance.now()): void {
    if (now - this.lastRender < 120) return;
    this.lastRender = now;
    this.render();
  }

  private setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.shell.classList.toggle('expanded', this.expanded);
    if (expanded && document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.render();
  }

  private handleMapClick(event: MouseEvent): void {
    if (!this.expanded || !this.canSuperJump()) return;

    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const py = (event.clientY - rect.top) * this.canvas.height / rect.height;
    const candidates = this.jumpCandidates();

    let best: MapJumpCandidate | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
      const distance = Math.hypot(candidate.mapX - px, candidate.mapY - py);
      if (distance >= bestDistance) continue;
      bestDistance = distance;
      best = candidate;
    }

    if (
      !best ||
      bestDistance > GAME_CONFIG.superJump.mapSelectionRadiusPixels
    ) {
      return;
    }

    if (this.requestSuperJump(best.target)) {
      this.setExpanded(false);
    }
  }

  private render(): void {
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(5, 10, 15, 0.92)';
    ctx.fillRect(0, 0, width, height);

    this.drawStageSolids();
    this.drawSplatZones();
    this.drawInk();
    this.drawSpawnPoint(this.stage.metadata.teamASpawn, 'rgba(32,220,240,.95)');
    this.drawSpawnPoint(this.stage.metadata.teamBSpawn, 'rgba(255,52,156,.95)');
    this.drawAgents();
    this.drawSuperJumpCandidates();
    this.drawSelectedLanding();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(
      `${this.stats.matchModeLabel} · ${this.stats.matchState} · ${this.stats.matchOvertime ? 'OT' : formatClock(this.stats.matchTimeRemainingSeconds)}`,
      width * 0.5,
      24
    );

    if (this.expanded) {
      ctx.fillStyle = this.canSuperJump()
        ? 'rgba(235,247,255,.88)'
        : 'rgba(255,210,210,.72)';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.fillText(
        this.canSuperJump()
          ? 'CLICK YOUR SPAWN OR A FRIENDLY ALIVE CPU TO SUPER JUMP'
          : 'SUPER JUMP UNAVAILABLE',
        width * 0.5,
        height - 13
      );
    }
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

  private drawSplatZones(): void {
    if (this.stats.matchMode !== 'SPLAT_ZONES') return;
    const zone = this.stage.metadata.splatZones[0];
    if (!zone) return;
    const surface = this.gameplayInk.getSurface(zone.surfaceId);
    if (!surface) return;

    const minU = zone.centerU - zone.widthMeters * 0.5;
    const maxU = zone.centerU + zone.widthMeters * 0.5;
    const minV = zone.centerV - zone.heightMeters * 0.5;
    const maxV = zone.centerV + zone.heightMeters * 0.5;
    const corners = [
      surface.localToWorld(minU, minV),
      surface.localToWorld(maxU, minV),
      surface.localToWorld(maxU, maxV),
      surface.localToWorld(minU, maxV)
    ].map((point) => this.worldToMap(point.x, point.z));

    const ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(corners[0]!.x, corners[0]!.y);
    for (let i = 1; i < corners.length; i += 1) {
      ctx.lineTo(corners[i]!.x, corners[i]!.y);
    }
    ctx.closePath();
    ctx.fillStyle = this.stats.zonesControl === 'TEAM A'
      ? 'rgba(40,221,240,.16)'
      : this.stats.zonesControl === 'TEAM B'
        ? 'rgba(255,60,160,.16)'
        : 'rgba(255,255,255,.08)';
    ctx.strokeStyle = this.stats.zonesControl === 'TEAM A'
      ? 'rgba(40,221,240,.95)'
      : this.stats.zonesControl === 'TEAM B'
        ? 'rgba(255,60,160,.95)'
        : 'rgba(255,255,255,.72)';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
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
    this.cpuAgents.forEachMapAgent((id, team, position, active, weaponId) => {
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
      ctx.fillText(
        `${id}·${weaponProfile(weaponId).shortName}`,
        point.x,
        point.y + 0.5
      );
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

  private drawSuperJumpCandidates(): void {
    if (!this.expanded) return;

    const ctx = this.context;
    const team = this.getTeam();
    ctx.strokeStyle = team === Team.A
      ? 'rgba(185,251,255,.96)'
      : 'rgba(255,209,232,.96)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);

    for (const candidate of this.jumpCandidates()) {
      ctx.beginPath();
      ctx.arc(candidate.mapX, candidate.mapY, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  private drawSelectedLanding(): void {
    if (
      this.stats.playerSuperJumpState === 'IDLE' ||
      !Number.isFinite(this.stats.playerSuperJumpTargetX) ||
      !Number.isFinite(this.stats.playerSuperJumpTargetZ)
    ) {
      return;
    }

    const point = this.worldToMap(
      this.stats.playerSuperJumpTargetX,
      this.stats.playerSuperJumpTargetZ
    );
    const ctx = this.context;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('JUMP', point.x, point.y - 21);
  }

  private jumpCandidates(): MapJumpCandidate[] {
    const candidates: MapJumpCandidate[] = [];
    const team = this.getTeam();
    const spawn = team === Team.A
      ? this.stage.metadata.teamASpawn
      : this.stage.metadata.teamBSpawn;
    const spawnPoint = this.worldToMap(spawn[0], spawn[2]);
    candidates.push({
      target: {
        kind: 'SPAWN',
        id: team === Team.A ? 'spawn-a' : 'spawn-b',
        label: 'SPAWN',
        position: new Vec3(spawn[0], spawn[1], spawn[2])
      },
      mapX: spawnPoint.x,
      mapY: spawnPoint.y
    });

    this.cpuAgents.forEachMapAgent((id, agentTeam, position, active) => {
      if (!active || agentTeam !== team) return;
      const point = this.worldToMap(position.x, position.z);
      candidates.push({
        target: {
          kind: 'ALLY',
          id,
          label: id,
          position: position.clone()
        },
        mapX: point.x,
        mapY: point.y
      });
    });

    return candidates;
  }

  private worldToMap(x: number, z: number): { x: number; y: number } {
    const bounds = this.stage.metadata.worldBounds;
    const nx = (x - bounds.minX) / Math.max(1e-6, bounds.maxX - bounds.minX);
    const nz = (z - bounds.minZ) / Math.max(1e-6, bounds.maxZ - bounds.minZ);
    return {
      x: 10 + nx * (this.canvas.width - 20),
      // Screen Y follows world +Z for the canonical tactical-map orientation.
      y: 10 + nz * (this.canvas.height - 20)
    };
  }
}

function formatClock(seconds: number): string {
  const value = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
}
