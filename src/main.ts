import './styles.css';
import { InkLabApp } from './app/InkLabApp';

const canvas = document.querySelector<HTMLCanvasElement>('#app-canvas');
const uiRoot = document.querySelector<HTMLElement>('#ui-root');

if (!canvas || !uiRoot) throw new Error('Required DOM roots are missing.');

const appCanvas: HTMLCanvasElement = canvas;
const appUiRoot: HTMLElement = uiRoot;

async function boot(): Promise<void> {
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
