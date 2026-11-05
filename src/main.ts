import './styles.css';
import { InkLabApp } from './app/InkLabApp';

const canvas = document.querySelector<HTMLCanvasElement>('#app-canvas');
const uiRoot = document.querySelector<HTMLElement>('#ui-root');

if (!canvas || !uiRoot) throw new Error('Required DOM roots are missing.');

const appCanvas: HTMLCanvasElement = canvas;
const appUiRoot: HTMLElement = uiRoot;

async function boot(): Promise<void> {
  if(new URL(window.location.href).searchParams.get('t21Qa')==='b228UnderpassInput'){
    const {T21B224OriginalGapInputQaApp}=
      await import('./app/T21B224OriginalGapInputQaApp');
    await T21B224OriginalGapInputQaApp.boot(appCanvas,appUiRoot);
    return;
  }
  if(new URL(window.location.href).searchParams.get('t21Qa')==='b226InnerSlopeInput'){
    const {T21B224OriginalGapInputQaApp}=
      await import('./app/T21B224OriginalGapInputQaApp');
    await T21B224OriginalGapInputQaApp.boot(appCanvas,appUiRoot);
    return;
  }
  if(new URL(window.location.href).searchParams.get('t21Qa')==='b225OriginalCorridorInput'){
    const {T21B224OriginalGapInputQaApp}=await import('./app/T21B224OriginalGapInputQaApp');
    await T21B224OriginalGapInputQaApp.boot(appCanvas,appUiRoot);
    return;
  }
  if (new URL(window.location.href).searchParams.get('t21Qa') === 'b224OriginalGapInput') {
    const { T21B224OriginalGapInputQaApp } = await import('./app/T21B224OriginalGapInputQaApp');
    await T21B224OriginalGapInputQaApp.boot(appCanvas, appUiRoot);
    return;
  }
  if (new URL(window.location.href).searchParams.get('t21Play') === 'preview') {
    const { UndertowF3PlayablePreviewApp } = await import('./app/UndertowF3PlayablePreviewApp');
    await UndertowF3PlayablePreviewApp.boot(appCanvas, appUiRoot);
    // B464 is only a read-only overlay for the user's explicit
    // SOURCE combat + strict B441/B448 CPU research selection.
    // The genuine 60Hz game, CPU goals and original score stay untouched.
    const q=new URL(window.location.href).searchParams;
    // Genuine SOURCE full-round R is no longer allowed to reach the
    // legacy F3 in-place cpu.reset()/ink reset() while a match is live.
    // Capture before the legacy bubble listener without modifying
    // native controls, player/CPU state, the clock, or replay thresholds.
    if(q.get('t21QaDrive')==='source'&&q.get('t21W10B203')==='fullRound'){
      const {sourceReplayHotkeyAction,sourceFinishedReplayAction}=
        await import('./app/SourcePlayPortal');
      const liveReplay=()=>{
        const game=(window as unknown as {__t21F3?:{
          snapshot:()=>{matchState?:string;stopReason?:string|null;
            originalSourceSolids?:number;originalPaintSurfaces?:number;
            originalSourceNavigationLinks?:number;
            sourceScoreablePromotions?:number}
        }}).__t21F3;
        const state=game?.snapshot();
        const finish=appUiRoot.querySelector<HTMLElement>(
          '#t21-f3-b59-session-finished');
        const replay=finish?.querySelector<HTMLButtonElement>(
          '#t21-f3-b59-restart');
        return {replay,evidence:{
          href:window.location.href,
          matchState:state?.matchState,stopped:!!state?.stopReason,
          pointerLocked:document.pointerLockElement!==null,
          originalSolids:state?.originalSourceSolids,
          originalPaint:state?.originalPaintSurfaces,
          originalLinks:state?.originalSourceNavigationLinks,
          scoreable:state?.sourceScoreablePromotions,
          finishedVisible:finish?.dataset.t21B59State==='FINISHED'&&
            finish.hidden===false&&finish.style.display!=='none',
          canClick:!!replay&&!replay.hidden&&!replay.disabled&&
            replay.isConnected
        }};
      };
      window.addEventListener('keydown',ev=>{
        if(ev.code!=='KeyR')return;
        const editable=ev.target instanceof HTMLElement&&Boolean(
          ev.target.closest('input,textarea,select,[contenteditable="true"]'));
        if(editable)return; // R in an actual text field stays text input.
        const {replay,evidence}=liveReplay();
        const action=sourceReplayHotkeyAction({
          ...evidence,code:ev.code,repeat:ev.repeat,
          modified:ev.ctrlKey||ev.altKey||ev.metaKey,editing:editable
        });
        if(action==='UNRELATED')return;
        ev.stopImmediatePropagation();
        if(action==='BLOCK')return;
        ev.preventDefault();
        if(action==='CLICK_REAL_REPLAY')replay?.click();
        else if(action==='RELOAD_NATIVE_SOURCE_WORLD')
          window.location.reload();
      },true);
      // The visible real TIME_UP button previously reached a legacy
      // reset() in the opponent research mode. Capture it and perform
      // a fresh browser/Rapier world reload instead. A1/B384 retain
      // their existing fresh-world URL and weapon-selection actions.
      appUiRoot.addEventListener('click',ev=>{
        if(!(ev.target instanceof Element))return;
        const button=ev.target.closest<HTMLButtonElement>(
          '#t21-f3-b59-restart,#t21-f3-b58-restart');
        if(!button||!appUiRoot.contains(button))return;
        const action=sourceFinishedReplayAction(liveReplay().evidence);
        if(action==='CLICK_REAL_REPLAY')return;
        ev.stopImmediatePropagation();
        ev.preventDefault();
        if(action==='RELOAD_NATIVE_SOURCE_WORLD')
          window.location.reload();
      },true);
    }
    if(q.get('t21QaDrive')==='source'&&
       q.get('t21W10B203')==='fullRound'&&
       q.get('t21W10B192')==='humanCombat'&&
       q.get('t21W10B441')==='sourceFrontline'&&
       q.get('t21W10B448')==='realA3Front'){
      const {mountB464SourceFrontlineHud}=
       await import('./app/B464PlayableSourceFrontlineHud');
      mountB464SourceFrontlineHud(appUiRoot,()=>{
       const game=(window as unknown as {
        __t21F3?:{snapshot:()=>unknown}
       }).__t21F3;
       return game?.snapshot();
      });
    }
    return;
  }
  if (['phase14i','phase14k','phase14l','phase14p'].includes(new URL(window.location.href).searchParams.get('t21Qa') ?? '')) {
    const { UndertowPhase14IRealCrowdVisualQaApp } = await import('./app/UndertowPhase14IRealCrowdVisualQaApp');
    await UndertowPhase14IRealCrowdVisualQaApp.boot(appCanvas, appUiRoot);
    return;
  }
  if (new URL(window.location.href).searchParams.get('t21Qa') === 'phase14f') {
    const { UndertowPhase14FVisualQaApp } = await import('./app/UndertowPhase14FVisualQaApp');
    await UndertowPhase14FVisualQaApp.boot(appCanvas, appUiRoot);
    return;
  }
  const review = new URL(window.location.href).searchParams.get('stageReview');
  if (review === 'undertow') {
    const { UndertowVisualReviewApp } = await import('./app/UndertowVisualReviewApp');
    await UndertowVisualReviewApp.boot(appCanvas, appUiRoot);
    return;
  }
  await InkLabApp.boot(appCanvas, appUiRoot);
}

void boot().catch((error: unknown) => {
  console.error(error);
  const panel = document.createElement('pre');
  panel.id = 'boot-error';
  panel.textContent = `Ink TPS boot failed\n\n${error instanceof Error ? `${error.message}\n\n${error.stack ?? ''}` : String(error)}`;
  document.body.appendChild(panel);
});
