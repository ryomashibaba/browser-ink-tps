export interface FixedStepReport {
  ticks: number;
  alpha: number;
  droppedSeconds: number;
}

export class FixedStepClock {
  private accumulator = 0;
  private droppedSeconds = 0;
  public tick = 0;

  public constructor(
    public readonly tickRate: number,
    private readonly maxCatchUpTicksPerFrame: number,
    private readonly maxFrameDeltaSeconds: number
  ) {}

  public get stepSeconds(): number {
    return 1 / this.tickRate;
  }

  /** Most games return void and preserve ordinary catch-up semantics.
   * A terminal native SOURCE round can explicitly return false AFTER its
   * final genuine physics tick. Never invent post-TIME_UP tick numbers,
   * count phantom simulation ticks, or carry unused final-frame time. */
  public advance(frameDt: number, simulateTick: (tick: number, dt: number) => void | boolean): FixedStepReport {
    const safeFrameDt = Number.isFinite(frameDt) ? frameDt : 0;
    const dt = Math.min(Math.max(safeFrameDt, 0), this.maxFrameDeltaSeconds);
    this.accumulator += dt;

    let ticks = 0;
    while (this.accumulator >= this.stepSeconds && ticks < this.maxCatchUpTicksPerFrame) {
      this.tick += 1;
      const keepSimulating = simulateTick(this.tick, this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      ticks += 1;
      if (keepSimulating === false) {
        // Terminal 180s game ended DURING this catch-up batch.
        // This is not dropped simulation time: the match has ended.
        // Historical void callbacks still consume their usual frames.
        this.accumulator = 0;
        break;
      }
    }

    if (this.accumulator >= this.stepSeconds) {
      const retained = this.accumulator % this.stepSeconds;
      const dropped = this.accumulator - retained;
      this.accumulator = retained;
      this.droppedSeconds += dropped;
    }

    return {
      ticks,
      alpha: this.accumulator / this.stepSeconds,
      droppedSeconds: this.droppedSeconds
    };
  }
}
