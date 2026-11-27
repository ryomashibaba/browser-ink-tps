/** A native SOURCE pre-round blocks player locomotion until 7/7 true CPU
 * rejoins; no physics/Actor, collision, stage, or game-clock modification. */
const SOURCE_PRESTART_MOVEMENT_CODES=new Set([
 'KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyF','KeyG'
]);
const SOURCE_MOVEMENT_CODES=new Set(['KeyW','KeyA','KeyS','KeyD']);
const SOURCE_OPPOSITE_MOVEMENT:Readonly<Record<string,string>>={
 KeyW:'KeyS',KeyS:'KeyW',KeyA:'KeyD',KeyD:'KeyA'
};
import {f4MouseHeldAfterMask} from '../player/F4PlayerIntent.mjs';

export class PlayerInput {
  private f4ProvisionalControls=false;
  // bit 1: pointer cancellation; bit 2: keyboard combat cancellation.
  private f4CombatCancellation=0;
  private markF4CombatCancellation(keyboard:boolean):void{
    if(this.f4ProvisionalControls)this.f4CombatCancellation|=keyboard?3:1;
  }
  public consumeF4CombatCancellation():number{
    const value=this.f4CombatCancellation;
    this.f4CombatCancellation=0;
    return value;
  }
  public enableF4ProvisionalControls():void{
    if(!this.deterministicQaEnabled)this.f4ProvisionalControls=true;
  }
  /** Browser state is authoritative even before blur/lock events arrive. */
  public get f4LiveFocusLost():boolean{
    return this.f4ProvisionalControls&&(document.hidden||!document.hasFocus()||
      document.pointerLockElement!==this.canvas);
  }
  public cancelF4FocusInput():void{
    if(!this.f4ProvisionalControls)return;
    this.markF4CombatCancellation(true);
    this.keys.clear();this.sourcePrestartHeldKeys.clear();
    this.fire=false;this.secondary=false;
    this.primaryPressedQueued=false;this.secondaryPressedQueued=false;
    this.jumpQueued=false;this.sourceSquidTapQueued=false;
    this.sourceMovementTapCodes.clear();this.subPressedQueued=false;
    // Focus loss discards all held keys; a fresh non-repeat press can
    // rearm jump, while an OS repeat is still rejected by keydown.
    this.specialPressedQueued=false;this.jumpRequiresRelease=false;
  }

  // Mouse move may be the first event after a missed pointerup. Reconcile
  // releases only; never synthesize a press or discard a real queued tap.
  private reconcileF4MouseReleases(event:PointerEvent):void{
    if(!this.f4ProvisionalControls||event.pointerType!=='mouse'||
       document.pointerLockElement!==this.canvas)return;
    this.fire=f4MouseHeldAfterMask(this.fire,event.buttons,1);
    this.secondary=f4MouseHeldAfterMask(this.secondary,event.buttons,2);
  }
  private readonly keys = new Set<string>();
  private sourcePrestartBlocked=false;
  // Native SOURCE guards apply to live input independently of staging movement.
  private sourceLiveInputGuardsEnabled: boolean;
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

  /** SOURCE only: a modifier pressed AFTER actual gameplay inputs must also
   * cancel their pending 60Hz taps and held states. Merely rejecting a
   * modified keydown left old WASD, squid, jump and fire intent armed.
   * Latch the formerly held keys until their physical release, to prevent
   * stale OS-repeat or duplicate-down events from rearming the action.
   * T20 and deterministic QA never enable this source-only guard. */
  private cancelSourceShortcutInputs(shortcutCode?:string):void{
    if(!this.sourceLiveInputGuardsEnabled||this.deterministicQaEnabled)return;
    this.markF4CombatCancellation(true);
    for(const code of SOURCE_PRESTART_MOVEMENT_CODES){
      if(this.keys.has(code))this.sourcePrestartHeldKeys.add(code);
      this.keys.delete(code);
    }
    if(shortcutCode&&SOURCE_PRESTART_MOVEMENT_CODES.has(shortcutCode))
      this.sourcePrestartHeldKeys.add(shortcutCode);
    this.sourceMovementTapCodes.clear();
    this.sourceSquidTapQueued=false;
    this.jumpQueued=false;
    this.subPressedQueued=false;
    this.specialPressedQueued=false;
    this.fire=false;
    this.primaryPressedQueued=false;
    this.secondary=false;
    this.secondaryPressedQueued=false;
  }

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly deterministicQaEnabled = false,
    sourceLiveRound = false
  ) {
    this.sourceLiveInputGuardsEnabled = sourceLiveRound && !deterministicQaEnabled;
    window.addEventListener('keydown', (event) => {
      if (document.pointerLockElement !== this.canvas||this.f4LiveFocusLost) return;
      // SOURCE gameplay must not interpret browser/system modifier shortcuts
      // as WASD, squid, Space or weapon intent. T20 stays unchanged.
      if(this.sourceLiveInputGuardsEnabled &&
         (event.altKey||event.ctrlKey||event.metaKey)){
        this.cancelSourceShortcutInputs(event.code);
        return;
      }
      // An OS key repeat after STAGING/blur is not a new physical press.
      // Without this guard, focus recovery can revive unwanted movement.
      if(this.sourceLiveInputGuardsEnabled &&
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
      // A real Space press during a splat must be released before respawn.
      // Do not arm the latch for a death in which Space was never held.
      if(this.f4ProvisionalControls&&event.code==='Space'&&!this.combatInputActive)
        this.jumpRequiresRelease=true;
      if(event.code==='Space' &&
         (!this.combatInputActive||this.jumpRequiresRelease)){
        event.preventDefault();
        return;
      }
      const freshPress=!this.keys.has(event.code);
      this.keys.add(event.code);
      if(this.sourceLiveInputGuardsEnabled&&!this.deterministicQaEnabled&&
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
        if (!event.repeat&&(!this.sourceLiveInputGuardsEnabled||freshPress))
          this.jumpQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyF' && !event.repeat && this.combatInputActive &&
          (!this.sourceLiveInputGuardsEnabled || freshPress)) {
        // Native SOURCE sub is an edge, never another paid throw merely
        // because the OS dispatched a second non-repeat keydown while
        // this physical key remained down. T20 keeps its prior path.
        this.subPressedQueued = true;
        event.preventDefault();
      }
      if (event.code === 'KeyG' && !event.repeat && this.combatInputActive &&
          (!this.sourceLiveInputGuardsEnabled || freshPress)) {
        // The existing SOURCE special resource authority gets just one
        // activation intent per actual keydown/up cycle.
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
      this.markF4CombatCancellation(false);
      this.fire = false;
      this.primaryPressedQueued = false;
      this.secondary = false;
      this.secondaryPressedQueued = false;
    };

    const clearGameplayState = (): void => {
      this.markF4CombatCancellation(true);
      this.keys.clear();
      this.sourcePrestartHeldKeys.clear();
      clearPointerState();
      this.jumpQueued = false;
      this.sourceSquidTapQueued = false;
      this.sourceMovementTapCodes.clear();
      this.subPressedQueued = false;
      this.specialPressedQueued = false;
      this.jumpRequiresRelease = !this.f4ProvisionalControls&&!this.combatInputActive;
    };

    window.addEventListener('blur', clearGameplayState);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearGameplayState();
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) clearGameplayState();
    });

    const pressFire = (event: PointerEvent): void => {
      this.reconcileF4MouseReleases(event);
      if(this.sourcePrestartBlocked||this.f4LiveFocusLost)return;
      // Genuine SOURCE mouse shortcuts are not weapon inputs. Keyboard
      // shortcut-modified WASD/F/G is already ignored above, but modified
      // left/right clicks must likewise never fire, dodge or raise a shield.
      // T20 and explicit deterministic QA preserve their previous behavior.
      if(this.sourceLiveInputGuardsEnabled &&
         (event.altKey||event.ctrlKey||event.metaKey)){
        this.cancelSourceShortcutInputs();
        return;
      }
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
    };
    canvas.addEventListener('pointerdown', pressFire);
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    const releaseFire = (event: PointerEvent): void => {
      this.reconcileF4MouseReleases(event);
      if (event.button === 0) this.fire = false;
      if (event.button === 2) this.secondary = false;
    };
    canvas.addEventListener('pointerup', releaseFire);
    document.addEventListener('pointerup', releaseFire);
    // Mouse chords report intermediate button edges on pointermove.
    canvas.addEventListener('pointermove', (event) => {
      this.reconcileF4MouseReleases(event);
      if (!this.sourceLiveInputGuardsEnabled || event.pointerType !== 'mouse' ||
          (event.button !== 0 && event.button !== 2)) return;
      const buttonMask = event.button === 0 ? 1 : 2;
      if ((event.buttons & buttonMask) !== 0) pressFire(event);
      else releaseFire(event);
    });
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
      this.sourceLiveInputGuardsEnabled=true;
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
    // Capture the real held state before clearing the old life's inputs.
    const spaceWasHeld=this.keys.has('Space');
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
    if(this.sourceLiveInputGuardsEnabled){
      // A dying human may already have held F/G, or pressed them while
      // splatted. A NEW native life must accept a subsequent fresh down,
      // not treat the previous life's key ownership as a held action.
      // OS repeats are independently rejected by the existing guard.
      this.keys.delete('KeyF');
      this.keys.delete('KeyG');
    }
    // Only an actual held Space requires release in whole F4.
    // Older SOURCE/T20 retain their original unconditional death latch.
    if(!active)this.jumpRequiresRelease=!this.f4ProvisionalControls||
      this.jumpRequiresRelease||spaceWasHeld;
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
    return !this.sourcePrestartBlocked&&!this.f4LiveFocusLost&&
      (!this.sourceLiveInputGuardsEnabled||
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
    const useTaps=available&&this.sourceLiveInputGuardsEnabled&&
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
      (!this.deterministicQaEnabled&&this.sourceLiveInputGuardsEnabled&&
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

  public get subHeld(): boolean {
    return this.sourceLiveInputAvailable && this.keys.has('KeyF');
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
