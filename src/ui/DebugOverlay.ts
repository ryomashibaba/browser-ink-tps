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
      <div class="title">TECHNICAL VERTICAL SLICE <span class="${healthy ? 'ok' : 'warn'}">T19B STABLE</span></div>
      <div class="grid">
        <span class="muted">Renderer</span><span>${escapeHtml(this.rendererName)}</span>
        <span class="muted">Coord audit</span><span>${escapeHtml(last.coordinateAudit)}</span>
        <span class="muted">Match</span><span>${escapeHtml(last.matchState)}</span>
        <span class="muted">Countdown</span><span>${last.matchCountdownSeconds.toFixed(1)} s</span>
        <span class="muted">Match time</span><span>${formatClock(last.matchTimeRemainingSeconds)}</span>
        <span class="muted">Result</span><span>${escapeHtml(last.matchResult)}</span>
        <span class="muted">Life state</span><span>${escapeHtml(last.playerLifeState)}</span>
        <span class="muted">Respawn</span><span>${last.playerRespawnSeconds.toFixed(1)} s</span>
        <span class="muted">Splats / respawns</span><span>${last.playerSplats} / ${last.playerRespawns}</span>
        <span class="muted">Super Jump</span><span>${escapeHtml(last.playerSuperJumpState)} · ${escapeHtml(last.playerSuperJumpTarget)}</span>
        <span class="muted">Jump progress / uses</span><span>${(last.playerSuperJumpProgress * 100).toFixed(0)}% / ${last.playerSuperJumps}</span>
        <span class="muted">Jump target XYZ</span><span>${formatXyz(last.playerSuperJumpTargetX, last.playerSuperJumpTargetY, last.playerSuperJumpTargetZ)}</span>
        <span class="muted">Recast</span><span>${escapeHtml(last.cpuNavigationStatus)}</span>
        <span class="muted">Nav build</span><span>${last.cpuNavigationBuildMs.toFixed(1)} ms</span>
        <span class="muted">CPU agents</span><span>${last.cpuAgents} · A${last.cpuTeamA}/B${last.cpuTeamB}</span>
        <span class="muted">CPU roles</span><span>${escapeHtml(last.cpuRoles)}</span>
        <span class="muted">CPU loadouts</span><span>${escapeHtml(last.cpuLoadouts)}</span>
        <span class="muted">CPU charge / burst</span><span>${last.cpuWeaponCharging} / ${last.cpuWeaponBursting}</span>
        <span class="muted">CPU guard / blocks</span><span>${last.cpuWeaponGuarding} / ${last.cpuWeaponGuardBlocks}</span>
        <span class="muted">CPU advanced QA</span><span>${escapeHtml(last.cpuAdvancedQa)}</span>
        <span class="muted">CPU retargets</span><span>${last.cpuTacticalRetargets}</span>
        <span class="muted">CPU paint req</span><span>${last.cpuPaintRequests}</span>
        <span class="muted">CPU alive</span><span>${last.cpuAlive} / ${last.cpuAgents}</span>
        <span class="muted">CPU avg HP/Ink</span><span>${last.cpuAverageHp.toFixed(0)} / ${last.cpuAverageInk.toFixed(0)}</span>
        <span class="muted">CPU shots</span><span>${last.cpuShots}</span>
        <span class="muted">CPU combat hits</span><span>${last.cpuCombatHits}</span>
        <span class="muted">CPU splats/respawns</span><span>${last.cpuSplats} / ${last.cpuRespawns}</span>
        <span class="muted">CPU jump prep / air</span><span>${last.cpuSuperJumpPrep} / ${last.cpuSuperJumpAirborne}</span>
        <span class="muted">CPU jumps / landings</span><span>${last.cpuSuperJumps} / ${last.cpuSuperJumpLandings}</span>
        <span class="muted">CPU jump cancels</span><span>${last.cpuSuperJumpCancels}</span>
        <span class="muted">CPU last jump</span><span>${escapeHtml(last.cpuSuperJumpLast)}</span>
        <span class="muted">CPU→Player hits</span><span>${last.cpuPlayerHits}</span>
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
        <span class="muted">Weapon</span><span>${escapeHtml(last.playerWeaponClass)} · ${escapeHtml(last.playerWeaponName)}</span>
        <span class="muted">Weapon action</span><span>${escapeHtml(last.playerWeaponAction)}</span>
        <span class="muted">Weapon charge</span><span>${last.playerWeaponChargePercent.toFixed(0)}% · ring ${last.playerWeaponChargeRing}/2</span>
        <span class="muted">Guard / HP / blocks</span><span>${last.playerWeaponGuarding ? 'yes' : 'no'} / ${last.playerWeaponGuardHp.toFixed(0)} / ${last.playerWeaponGuardBlocks}</span>
        <span class="muted">Dualie rolls / charges</span><span>${last.playerWeaponDodges} / ${last.playerWeaponDodgeCharges}</span>
        <span class="muted">Stringer fuses / bursts</span><span>${last.stringerFuses} / ${last.stringerBursts}</span>
        <span class="muted">Sub</span><span>${escapeHtml(last.playerSubWeaponName)}</span>
        <span class="muted">Sub throws / bursts</span><span>${last.playerSubThrows} / ${last.playerSubExplosions}</span>
        <span class="muted">Special</span><span>${escapeHtml(last.playerSpecialName)} · ${last.playerSpecialPoints.toFixed(1)}p · ${last.playerSpecialPercent.toFixed(0)}% · ${last.playerSpecialReady ? 'READY' : 'charging'}</span>
        <span class="muted">Special uses</span><span>${last.playerSpecialActivations}</span>
        <span class="muted">Human scoreable paint</span><span>${last.playerHumanScoreablePaintMeters2.toFixed(2)} m²</span>
        <span class="muted">Weapon switches</span><span>${last.playerWeaponSwitches}</span>
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

function formatClock(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function formatUv(u: number, v: number): string {
  return Number.isFinite(u) && Number.isFinite(v) ? `${u.toFixed(2)}, ${v.toFixed(2)}` : '-';
}

function formatXyz(x: number, y: number, z: number): string {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
    ? `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`
    : '-';
}
