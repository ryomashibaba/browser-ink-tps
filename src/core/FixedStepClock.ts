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

  public advance(frameDt: number, simulateTick: (tick: number, dt: number) => void): FixedStepReport {
    const dt = Math.min(Math.max(frameDt, 0), this.maxFrameDeltaSeconds);
    this.accumulator += dt;

    let ticks = 0;
    while (this.accumulator >= this.stepSeconds && ticks < this.maxCatchUpTicksPerFrame) {
      this.tick += 1;
      simulateTick(this.tick, this.stepSeconds);
      this.accumulator -= this.stepSeconds;
      ticks += 1;
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
