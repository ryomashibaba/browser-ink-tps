import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';

export interface ControlPanelHandlers {
  onTeamChanged(team: Team.A | Team.B): void;
  onBrushChanged(radius: number): void;
  onStress(count: number): void;
  onClear(): void;
}

export class ControlPanel {
  private team: Team.A | Team.B = Team.A;
  private radius = GAME_CONFIG.debug.defaultBrushRadiusMeters;
  private readonly buttonA: HTMLButtonElement;
  private readonly buttonB: HTMLButtonElement;
  private readonly radiusOutput: HTMLOutputElement;

  public constructor(root: HTMLElement, handlers: ControlPanelHandlers) {
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.className = 'panel';
    panel.innerHTML = `
      <h1>Persistent Ink Test Stage</h1>
      <p>CPU gameplay grid (0.125m) and GPU atlas receive the same PaintEvent. Click any paintable floor, ramp, or wall.</p>
      <div class="row">
        <button id="team-a" class="active-a">Team A · Cyan</button>
        <button id="team-b">Team B · Magenta</button>
      </div>
      <label>Brush radius <output id="brush-out">${this.radius.toFixed(2)} m</output>
        <input id="brush" type="range" min="0.30" max="2.60" step="0.05" value="${this.radius}">
      </label>
      <div class="row">
        <button id="stress-small">Stress ${GAME_CONFIG.debug.stressBurstSmall}</button>
        <button id="stress-large">Stress ${GAME_CONFIG.debug.stressBurstLarge}</button>
        <button id="clear" class="danger">Clear Ink</button>
      </div>
    `;
    root.appendChild(panel);

    this.buttonA = panel.querySelector('#team-a') as HTMLButtonElement;
    this.buttonB = panel.querySelector('#team-b') as HTMLButtonElement;
    this.radiusOutput = panel.querySelector('#brush-out') as HTMLOutputElement;
    const slider = panel.querySelector('#brush') as HTMLInputElement;

    this.buttonA.addEventListener('click', () => this.setTeam(Team.A, handlers));
    this.buttonB.addEventListener('click', () => this.setTeam(Team.B, handlers));
    slider.addEventListener('input', () => {
      this.radius = Number(slider.value);
      this.radiusOutput.value = `${this.radius.toFixed(2)} m`;
      handlers.onBrushChanged(this.radius);
    });

    (panel.querySelector('#stress-small') as HTMLButtonElement).addEventListener('click', () => handlers.onStress(GAME_CONFIG.debug.stressBurstSmall));
    (panel.querySelector('#stress-large') as HTMLButtonElement).addEventListener('click', () => handlers.onStress(GAME_CONFIG.debug.stressBurstLarge));
    (panel.querySelector('#clear') as HTMLButtonElement).addEventListener('click', () => handlers.onClear());

    const hint = document.createElement('div');
    hint.id = 'hint';
    hint.textContent = 'Click: paint · Drag: orbit · Wheel: zoom · 1/2: team · R: clear · B: 2000-event stress';
    root.appendChild(hint);

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Digit1') this.setTeam(Team.A, handlers);
      if (event.code === 'Digit2') this.setTeam(Team.B, handlers);
      if (event.code === 'KeyR') handlers.onClear();
      if (event.code === 'KeyB') handlers.onStress(GAME_CONFIG.debug.stressBurstLarge);
    });
  }

  public get selectedTeam(): Team.A | Team.B { return this.team; }
  public get brushRadius(): number { return this.radius; }

  private setTeam(team: Team.A | Team.B, handlers: ControlPanelHandlers): void {
    this.team = team;
    this.buttonA.className = team === Team.A ? 'active-a' : '';
    this.buttonB.className = team === Team.B ? 'active-b' : '';
    handlers.onTeamChanged(team);
  }
}
