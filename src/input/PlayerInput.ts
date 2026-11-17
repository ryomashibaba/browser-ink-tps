/** A native SOURCE pre-round blocks player locomotion until 7/7 true CPU
 * rejoins; no physics/Actor, collision, stage, or game-clock modification. */
const SOURCE_PRESTART_MOVEMENT_CODES=new Set([
 'KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyF','KeyG'
]);
const SOURCE_MOVEMENT_CODES=new Set(['KeyW','KeyA','KeyS','KeyD']);
const SOURCE_OPPOSITE_MOVEMENT:Readonly<Record<string,string>>={
 KeyW:'KeyS',KeyS:'KeyW',KeyA:'KeyD',KeyD:'KeyA'
};
export class PlayerInput {
  private readonly keys = new Set<string>();
  private sourcePrestartBlocked=false;
  // Native SOURCE input: require a fresh keydown after Pointer Lock loss.
  // Inert until genuine SOURCE STAGING; T20/QA behavior is unchanged.
  private sourceNativeRepeatGuard=false;
  // SOURCE-only: a real Shift down/up between 60Hz ticks should still be
  // seen once by the next physics step, never as a persistent held key.
  private sourceSquidTapQueued=false;
  // Genuine SOURCE keydown+keyup entirely between native 60Hz ticks
  // otherwise vanishes, even though the human actually pressed movement.
  private readonly sourceMovementTapCodes=new Set<string>();
  private readonly sourceMoveTickAxes={x:0,y:0};
  private readonly sourcePrestartHeldKeys=new Set<string>();
  // QA-only synthetic axes. Never active during regular Pointer Lock play.
  private qaAxis: Readonly<{x:number;y:number}> | null = null;
  private fire = false;
  // B374: actual human death drops weapon intent, never the real WASD state.
  private combatInputActive = true;
  // Native splat cannot carry Space/jump or squid wall-surge charging into a new life.
  private jumpRequiresRelease = false;
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
      // SOURCE gameplay must not interpret browser/system modifier shortcuts
      // as WASD, squid, Space or weapon intent. T20 stays unchanged.
      if(this.sourceNativeRepeatGuard &&
         (event.altKey||event.ctrlKey||event.metaKey))return;
      // An OS key repeat after STAGING/blur is not a new physical press.
      // Without this guard, focus recovery can revive unwanted movement.
      if(this.sourceNativeRepeatGuard &&
         SOURCE_PRESTART_MOVEMENT_CODES.has(event.code) &&
         event.repeat && !this.keys.has(event.code)){
        if(event.code==='Space')event.preventDefault();
        return;
      }
      // Ignore actual held keys from STAGING even if the OS sends repeats
      // after genuine 7/7. A fresh keyup+keydown is required to walk.
      if(SOURCE_PRESTART_MOVEMENT_CODES.has(event.code)&&
         (this.sourcePrestartBlocked||
          this.sourcePrestartHeldKeys.has(event.code))){
       if(this.sourcePrestartBlocked)
        this.sourcePrestartHeldKeys.add(event.code);
       if(event.code==='Space')event.preventDefault();
       return;
      }
      // Space is one physical jump/charge intent. A held key across death
      // must be released before a new life can arm jump or wall surge.
      if(event.code==='Space' &&
         (!this.combatInputActive||this.jumpRequiresRelease)){
        event.preventDefault();
        return;
      }
      const freshPress=!this.keys.has(event.code);
      this.keys.add(event.code);
      if(this.sourceNativeRepeatGuard&&!this.deterministicQaEnabled&&
         freshPress&&!event.repeat){
        if(event.code==='ShiftLeft'||event.code==='ShiftRight')
          this.sourceSquidTapQueued=true;
        if(SOURCE_MOVEMENT_CODES.has(event.code)){
          // Two genuine opposite key presses may occur before the next
          // fixed 60Hz KCC step. Once the earlier key is physically UP,
          // its queued tap must not cancel the newer held/tapped direction.
          // If opposite is still physically held, keep the normal 0 axis.
          const opposite=SOURCE_OPPOSITE_MOVEMENT[event.code];
          if(opposite&&!this.keys.has(opposite))
            this.sourceMovementTapCodes.delete(opposite);
          this.sourceMovementTapCodes.add(event.code);
        }
      }
      if (event.code === 'Space') {
        if (!event.repeat&&(!this.sourceNativeRepeatGuard||freshPress))
          this.jumpQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyF' && !event.repeat && this.combatInputActive) {
        this.subPressedQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyG' && !event.repeat && this.combatInputActive) {
        this.specialPressedQueued = true;
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      this.sourcePrestartHeldKeys.delete(event.code);
      if(event.code==='Space')this.jumpRequiresRelease=false;
    });

    const clearPointerState = (): void => {
      this.fire = false;
      this.primaryPressedQueued = false;
      this.secondary = false;
      this.secondaryPressedQueued = false;
    };

    const clearGameplayState = (): void => {
      this.keys.clear();
      this.sourcePrestartHeldKeys.clear();
      clearPointerState();
      this.jumpQueued = false;
      this.sourceSquidTapQueued = false;
      this.sourceMovementTapCodes.clear();
      this.subPressedQueued = false;
      this.specialPressedQueued = false;
      this.jumpRequiresRelease = !this.combatInputActive;
    };

    window.addEventListener('blur', clearGameplayState);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearGameplayState();
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) clearGameplayState();
    });

    canvas.addEventListener('pointerdown', (event) => {
      if(this.sourcePrestartBlocked)return;
      // The first left click is reserved for acquiring pointer lock.
      // Fire only once the game already owns the mouse.
      if (
        event.button === 0 &&
        !event.altKey &&
        this.combatInputActive &&
        document.pointerLockElement === this.canvas
      ) {
        if (!this.fire) {
          this.primaryPressedQueued = true;
          this.primaryPressSequence++;
          this.primaryPressAtMs = performance.now();
        }
        this.fire = true;
      }
      if (event.button === 2 && this.combatInputActive &&
        document.pointerLockElement === this.canvas) {
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
    // Cancellation is not a completed click: discard both held buttons
    // and pending taps so the next physics tick cannot execute a stale action.
    // Keyboard movement remains valid while the canvas still owns Pointer Lock.
    canvas.addEventListener('pointercancel', clearPointerState);
  }

  /** Only canonical live SOURCE STAGING may use this. Deterministic/QA
   * input is untouched. No position, velocity, Rapier, Ink or clock write.
   * Pending human inputs cannot leak across 7/7, even from a held key. */
  public setSourcePrestartMovementBlocked(blocked:boolean):void{
    if(this.deterministicQaEnabled||this.sourcePrestartBlocked===blocked)return;
    this.sourcePrestartBlocked=blocked;
    if(blocked){
      this.sourceNativeRepeatGuard=true;
      this.sourceSquidTapQueued=false;
      this.sourceMovementTapCodes.clear();
    }
    if(!blocked)return;
    for(const code of SOURCE_PRESTART_MOVEMENT_CODES){
     if(this.keys.has(code))this.sourcePrestartHeldKeys.add(code);
     this.keys.delete(code);
    }
    this.fire=false;this.secondary=false;
    this.primaryPressedQueued=false;this.secondaryPressedQueued=false;
    this.jumpQueued=false;this.subPressedQueued=false;
    this.specialPressedQueued=false;
  }

  /** Only the actual native human HP=0 and 150-tick life recovery call this.
   * Preserve user movement, mouse lock and actual Rapier pose. */
  public setCombatInputActive(active:boolean):void {
    if(this.combatInputActive===active)return;
    this.combatInputActive=active;
    this.fire=false;
    this.primaryPressedQueued=false;
    this.secondary=false;
    this.secondaryPressedQueued=false;
    this.subPressedQueued=false;
    this.specialPressedQueued=false;
    this.primaryPressAtMs=Number.NaN;
    this.jumpQueued=false;
    this.sourceSquidTapQueued=false;
    this.sourceMovementTapCodes.clear();
    this.keys.delete('Space');
    // A physical Space keyup (not an automatic key repeat) rearms jump
    // after death; no modification to Rapier, movement, CPU or ink.
    if(!active)this.jumpRequiresRelease=true;
    // On native respawn, preserve the release latch until a genuine keyup.
    // Otherwise an OS repeat from Space held through death could rearm it.
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

  /** SOURCE live keyboard/mouse authority is valid only while its canvas
   * actually owns Pointer Lock. Closes the event-order window between native
   * lock loss and the browser's asynchronous pointerlockchange notification.
   * Frozen T20 and deterministic QA are unaffected. */
  public get sourceLiveInputAvailable():boolean{
    return !this.sourcePrestartBlocked&&
      (!this.sourceNativeRepeatGuard||
       document.pointerLockElement===this.canvas);
  }

  /** Native SOURCE input for exactly one real KCC tick. A fast WASD tap
   * is not a new floor, path or movement impulse: it supplies genuine
   * pressed intent to the same existing acceleration and Rapier collision.
   * The queued event never survives STAGING, lock loss or respawn. The
   * returned object is reused to avoid per-frame allocations. */
  public consumeMoveAxesForPlayerTick():Readonly<{x:number;y:number}>{
    const available=this.sourceLiveInputAvailable;
    const taps=this.sourceMovementTapCodes;
    const useTaps=available&&this.sourceNativeRepeatGuard&&
      !this.deterministicQaEnabled;
    const has=(code:string):boolean=>
      this.keys.has(code)||(useTaps&&taps.has(code));
    this.sourceMoveTickAxes.x=available
      ? this.qaAxis?.x??(Number(has('KeyD'))-Number(has('KeyA'))):0;
    this.sourceMoveTickAxes.y=available
      ? this.qaAxis?.y??(Number(has('KeyW'))-Number(has('KeyS'))):0;
    taps.clear();
    return this.sourceMoveTickAxes;
  }

  public get moveX(): number {
    if(!this.sourceLiveInputAvailable)return 0;
    return this.qaAxis?.x ??
      ((this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0));
  }

  public get moveY(): number {
    if(!this.sourceLiveInputAvailable)return 0;
    return this.qaAxis?.y ??
      ((this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0));
  }

  public get squidHeld(): boolean {
    return this.sourceLiveInputAvailable&&
     (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));
  }

  /** SOURCE human fixed step consumes a real, briefly tapped Shift once.
   * No synthetic paint contact or squid-speed grant: PlayerController still
   * requires its existing registered Rapier support for own-ink swimming.
   * Held Shift stays held until physical keyup. Never called by frozen T20. */
  public consumeSquidHeldForPlayerTick():boolean{
    const tap=this.sourceSquidTapQueued;
    this.sourceSquidTapQueued=false;
    return this.squidHeld||
      (!this.deterministicQaEnabled&&this.sourceNativeRepeatGuard&&
       this.sourceLiveInputAvailable&&tap);
  }

  public get fireHeld(): boolean {
    return this.sourceLiveInputAvailable&&this.combatInputActive&&this.fire;
  }

  /** Consume once per physics tick, including short real pointer taps. */
  public consumePrimaryPressed(): boolean {
    const queued = this.primaryPressedQueued;
    this.primaryPressedQueued = false;
    return this.sourceLiveInputAvailable&&queued;
  }

  public get secondaryHeld(): boolean {
    return this.sourceLiveInputAvailable&&this.combatInputActive&&this.secondary;
  }

  public consumeSecondaryPressed(): boolean {
    const queued = this.secondaryPressedQueued;
    this.secondaryPressedQueued = false;
    return this.sourceLiveInputAvailable&&queued;
  }

  public consumeSubPressed(): boolean {
    const queued = this.subPressedQueued;
    this.subPressedQueued = false;
    return this.sourceLiveInputAvailable&&queued;
  }

  public consumeSpecialPressed(): boolean {
    const queued = this.specialPressedQueued;
    this.specialPressedQueued = false;
    return this.sourceLiveInputAvailable&&queued;
  }

  public get jumpHeld(): boolean {
    return this.sourceLiveInputAvailable&&this.keys.has('Space');
  }

  public consumeJump(): boolean {
    if(!this.sourceLiveInputAvailable){this.jumpQueued=false;return false;}
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }
}
