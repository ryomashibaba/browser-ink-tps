export class PerformanceStats {
  private frameCounter = 0;
  private frameTimeSum = 0;
  private windowStart = performance.now();
  private paintEventCounter = 0;
  private paintCellCounter = 0;

  public fps = 0;
  public averageFrameMs = 0;
  public paintEventsPerSecond = 0;
  public paintCellsPerSecond = 0;
  public simulationTicksLastFrame = 0;
  public droppedSimulationSeconds = 0;
  public gpuPaintBacklog = 0;
  public gpuEventsLastFrame = 0;
  public gpuPaintBuildMs = 0;
  public dirtyTiles = 0;

  public playerMode = 'HUMAN';
  public playerLocomotionState = 'HUMAN';
  public playerGrounded = false;
  public playerSpeedMetersPerSecond = 0;
  public playerInkRelation = 'NONE';
  public playerCollider = 'CAPSULE';
  public playerWallSurface = '-';
  public playerSurgeCharge = 0;
  public playerSquidRollReady = false;
  public playerWorldX = 0;
  public playerWorldY = 0;
  public playerWorldZ = 0;
  public playerSampleSurface = '-';
  public playerSampleU = Number.NaN;
  public playerSampleV = Number.NaN;
  public lastPaintSurface = '-';
  public lastPaintU = Number.NaN;
  public lastPaintV = Number.NaN;
  public lastPaintWorldX = Number.NaN;
  public lastPaintWorldY = Number.NaN;
  public lastPaintWorldZ = Number.NaN;
  public coordinateAudit = 'PENDING';

  public playerInk = 100;
  public playerInkPercent = 100;
  public playerHp = 100;
  public playerInkRecoveryState = 'READY';
  public playerHpRecoveryState = 'READY';
  public playerDamageTaken = 0;
  public shotsFired = 0;
  public inkDryFireAttempts = 0;
  public combatHits = 0;
  public combatTargetDowns = 0;
  public targetAHp = 100;
  public targetBHp = 100;

  public matchState = 'COUNTDOWN';
  public matchCountdownSeconds = 3;
  public matchTimeRemainingSeconds = 180;
  public matchResult = '-';
  public playerLifeState = 'ACTIVE';
  public playerRespawnSeconds = 0;
  public playerSplats = 0;
  public playerRespawns = 0;

  public cpuNavigationStatus = 'PENDING';
  public cpuNavigationBuildMs = 0;
  public cpuAgents = 0;
  public cpuTeamA = 0;
  public cpuTeamB = 0;
  public cpuRoles = '-';
  public cpuTacticalRetargets = 0;
  public cpuPaintRequests = 0;

  public activeProjectiles = 0;
  public projectileImpacts = 0;
  public projectilePoolDrops = 0;

  public recordPaint(events: number, changedCells: number): void {
    this.paintEventCounter += events;
    this.paintCellCounter += changedCells;
  }

  public frame(frameMs: number): void {
    this.frameCounter += 1;
    this.frameTimeSum += frameMs;
    const now = performance.now();
    const elapsed = now - this.windowStart;

    if (elapsed >= 500) {
      const seconds = elapsed / 1000;
      this.fps = this.frameCounter / seconds;
      this.averageFrameMs = this.frameTimeSum / this.frameCounter;
      this.paintEventsPerSecond = this.paintEventCounter / seconds;
      this.paintCellsPerSecond = this.paintCellCounter / seconds;

      this.frameCounter = 0;
      this.frameTimeSum = 0;
      this.paintEventCounter = 0;
      this.paintCellCounter = 0;
      this.windowStart = now;
    }
  }
}
