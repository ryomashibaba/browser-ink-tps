import './styles.css';
import { InkLabApp } from './app/InkLabApp';

const canvas = document.querySelector<HTMLCanvasElement>('#app-canvas');
const uiRoot = document.querySelector<HTMLElement>('#ui-root');

if (!canvas || !uiRoot) throw new Error('Required DOM roots are missing.');

InkLabApp.boot(canvas, uiRoot).catch((error: unknown) => {
  console.error(error);
  const panel = document.createElement('pre');
  panel.id = 'boot-error';
  panel.textContent = `Ink TPS boot failed\n\n${error instanceof Error ? `${error.message}\n\n${error.stack ?? ''}` : String(error)}`;
  document.body.appendChild(panel);
});
