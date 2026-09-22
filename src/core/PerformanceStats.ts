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
  public playerGrounded = false;
  public playerSpeedMetersPerSecond = 0;
  public playerInkRelation = 'NONE';

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
