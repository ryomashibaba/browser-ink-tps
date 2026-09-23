import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';

export interface ControlPanelHandlers {
  onTeamChanged(team: Team.A | Team.B): void;
  onBrushChanged(radius: number): void;
  onStress(count: number): void;
  onRollQaPad(): void;
  onCoordinateQa(): void;
  onRestartMatch(): void;
  onSplatQa(): void;
  onEndMatchQa(): void;
  onClear(): void;
}

export class ControlPanel {
  private team: Team.A | Team.B = Team.A;
  private radius: number = GAME_CONFIG.debug.defaultBrushRadiusMeters;
  private readonly buttonA: HTMLButtonElement;
  private readonly buttonB: HTMLButtonElement;
  private readonly radiusOutput: HTMLOutputElement;

  public constructor(root: HTMLElement, handlers: ControlPanelHandlers) {
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.className = 'panel';
    panel.innerHTML = `
      <h1>Browser Ink TPS · T11 Candidate</h1>
      <p>T0–T10 remains frozen. T11 adds 3s countdown, 180s Turf War flow, player Splat/Respawn, and result freeze.</p>
      <div class="row">
        <button id="team-a" class="active-a">Team A · Cyan</button>
        <button id="team-b">Team B · Magenta</button>
      </div>
      <label>QA brush radius <output id="brush-out">${this.radius.toFixed(2)} m</output>
        <input id="brush" type="range" min="0.30" max="2.60" step="0.05" value="${this.radius}">
      </label>
      <div class="row">
        <button id="restart-match">Restart Match</button>
        <button id="splat-qa">Splat QA</button>
        <button id="end-match-qa">End Match QA</button>
      </div>
      <div class="row">
        <button id="roll-qa">Roll QA Pad</button>
        <button id="coord-qa">Coord QA</button>
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

    (panel.querySelector('#restart-match') as HTMLButtonElement).addEventListener('click', () => handlers.onRestartMatch());
    (panel.querySelector('#splat-qa') as HTMLButtonElement).addEventListener('click', () => handlers.onSplatQa());
    (panel.querySelector('#end-match-qa') as HTMLButtonElement).addEventListener('click', () => handlers.onEndMatchQa());
    (panel.querySelector('#roll-qa') as HTMLButtonElement).addEventListener('click', () => handlers.onRollQaPad());
    (panel.querySelector('#coord-qa') as HTMLButtonElement).addEventListener('click', () => handlers.onCoordinateQa());
    (panel.querySelector('#stress-small') as HTMLButtonElement).addEventListener('click', () => handlers.onStress(GAME_CONFIG.debug.stressBurstSmall));
    (panel.querySelector('#stress-large') as HTMLButtonElement).addEventListener('click', () => handlers.onStress(GAME_CONFIG.debug.stressBurstLarge));
    (panel.querySelector('#clear') as HTMLButtonElement).addEventListener('click', () => handlers.onClear());

    const hint = document.createElement('div');
    hint.id = 'hint';
    hint.textContent = 'T11: 3s countdown → 180s Turf War → result · Splat QA tests 2.5s respawn · Restart Match clears turf/resources · End Match QA resolves turf immediately';
    root.appendChild(hint);

    const crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    crosshair.textContent = '+';
    root.appendChild(crosshair);

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
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
