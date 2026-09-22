export class PlayerInput {
  private readonly keys = new Set<string>();
  private fire = false;
  private jumpQueued = false;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
      if (event.code === 'Space') {
        if (!event.repeat) this.jumpQueued = true;
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.fire = false;
      this.jumpQueued = false;
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button === 0 && !event.altKey) this.fire = true;
    });
    canvas.addEventListener('pointerup', (event) => {
      if (event.button === 0) this.fire = false;
    });
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

  public consumeJump(): boolean {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }
}
