export class PlayerInput {
  private readonly keys = new Set<string>();
  private fire = false;
  private secondary = false;
  private secondaryPressedQueued = false;
  private jumpQueued = false;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (event) => {
      if (document.pointerLockElement !== this.canvas) return;
      this.keys.add(event.code);
      if (event.code === 'Space') {
        if (!event.repeat) this.jumpQueued = true;
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));

    const clearGameplayState = (): void => {
      this.keys.clear();
      this.fire = false;
      this.secondary = false;
      this.secondaryPressedQueued = false;
      this.jumpQueued = false;
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

  public get moveX(): number {
    return (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
  }

  public get moveY(): number {
    return (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
  }

  public get squidHeld(): boolean {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  public get fireHeld(): boolean {
    return this.fire;
  }

  public get secondaryHeld(): boolean {
    return this.secondary;
  }

  public consumeSecondaryPressed(): boolean {
    const queued = this.secondaryPressedQueued;
    this.secondaryPressedQueued = false;
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
