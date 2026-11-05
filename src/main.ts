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
