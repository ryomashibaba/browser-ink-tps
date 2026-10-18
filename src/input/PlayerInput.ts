export class PlayerInput {
  private readonly keys = new Set<string>();
  // QA-only synthetic axes. Never active during regular Pointer Lock play.
  private qaAxis: Readonly<{x:number;y:number}> | null = null;
  private fire = false;
  // A press-and-release entirely between 60Hz ticks must still fire once.
  private primaryPressedQueued = false;
  public primaryPressSequence = 0;
  public primaryPressAtMs = Number.NaN;
  private secondary = false;
  private secondaryPressedQueued = false;
  private jumpQueued = false;
  private subPressedQueued = false;
  private specialPressedQueued = false;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly deterministicQaEnabled = false
  ) {
    window.addEventListener('keydown', (event) => {
      if (document.pointerLockElement !== this.canvas) return;
      this.keys.add(event.code);
      if (event.code === 'Space') {
        if (!event.repeat) this.jumpQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyF' && !event.repeat) {
        this.subPressedQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyG' && !event.repeat) {
        this.specialPressedQueued = true;
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));

    const clearGameplayState = (): void => {
      this.keys.clear();
      this.fire = false;
      this.primaryPressedQueued = false;
      this.secondary = false;
      this.secondaryPressedQueued = false;
      this.jumpQueued = false;
      this.subPressedQueued = false;
      this.specialPressedQueued = false;
    };

    window.addEventListener('blur', clearGameplayState);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearGameplayState();
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) clearGameplayState();
    });

    canvas.addEventListener('pointerdown', (event) => {
      // The first left click is reserved for acquiring pointer lock.
      // Fire only once the game already owns the mouse.
      if (
        event.button === 0 &&
        !event.altKey &&
        document.pointerLockElement === this.canvas
      ) {
        if (!this.fire) {
          this.primaryPressedQueued = true;
          this.primaryPressSequence++;
          this.primaryPressAtMs = performance.now();
        }
        this.fire = true;
      }
      if (event.button === 2 && document.pointerLockElement === this.canvas) {
        if (!this.secondary) this.secondaryPressedQueued = true;
        this.secondary = true;
        event.preventDefault();
      }
    });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    const releaseFire = (event: PointerEvent): void => {
      if (event.button === 0) this.fire = false;
      if (event.button === 2) this.secondary = false;
    };
    canvas.addEventListener('pointerup', releaseFire);
    document.addEventListener('pointerup', releaseFire);
    canvas.addEventListener('pointercancel', () => { this.fire = false; });
  }

  /** Applies only for opt-in, paused, nonproduction source QA tick stepping. */
  public setQaAxis(x: number, y: number): void {
    if (!this.deterministicQaEnabled) throw Error('T21_QA_AXIS_NOT_AUTHORIZED');
    if (![x,y].every(Number.isFinite) || Math.abs(x)>1 || Math.abs(y)>1)
      throw Error('T21_QA_AXIS_OUT_OF_RANGE');
    this.qaAxis = {x,y};
  }

  public clearQaAxis(): void {
    this.qaAxis = null;
  }

  public get moveX(): number {
    return this.qaAxis?.x ??
      ((this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0));
  }

  public get moveY(): number {
    return this.qaAxis?.y ??
      ((this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0));
  }

  public get squidHeld(): boolean {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  public get fireHeld(): boolean {
    return this.fire;
  }

  /** Consume once per physics tick, including short real pointer taps. */
  public consumePrimaryPressed(): boolean {
    const queued = this.primaryPressedQueued;
    this.primaryPressedQueued = false;
    return queued;
  }

  public get secondaryHeld(): boolean {
    return this.secondary;
  }

  public consumeSecondaryPressed(): boolean {
    const queued = this.secondaryPressedQueued;
    this.secondaryPressedQueued = false;
    return queued;
  }

  public consumeSubPressed(): boolean {
    const queued = this.subPressedQueued;
    this.subPressedQueued = false;
    return queued;
  }

  public consumeSpecialPressed(): boolean {
    const queued = this.specialPressedQueued;
    this.specialPressedQueued = false;
    return queued;
  }

  public get jumpHeld(): boolean {
    return this.keys.has('Space');
  }

  public consumeJump(): boolean {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }
}
