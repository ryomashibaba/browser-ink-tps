import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { Team } from '../ink/types';
import type { SplatZonesObjectiveSystem } from '../objective/SplatZonesObjectiveSystem';
import { gameModeLabel, resolveZonesTimeout, zonesResult, type GameModeId } from './GameMode';
import type { StageDefinition } from '../stage/StageDefinition';

export type MatchState = 'COUNTDOWN' | 'PLAYING' | 'ENDED';
export type PlayerLifeState = 'ACTIVE' | 'SPLATTED';

export class MatchController {
  private state: MatchState = 'COUNTDOWN';
  private lifeState: PlayerLifeState = 'ACTIVE';
  private mode: GameModeId = 'TURF_WAR';
  private countdownSeconds: number = GAME_CONFIG.match.countdownSeconds;
  private remainingSeconds: number = GAME_CONFIG.match.durationSeconds;
  private respawnSeconds: number = 0;
  private splatStartedPending = false;
  private respawnPending = false;
  private matchEndedPending = false;
  private overtime = false;
  private overtimeTeam: Team = Team.Neutral;
  private overtimeElapsedSeconds = 0;
  private result = '-';

  public constructor(
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stats: PerformanceStats,
    private readonly stage: StageDefinition,
    private readonly splatZones: SplatZonesObjectiveSystem
  ) {
    this.syncStats();
  }

  public get playerCanAct(): boolean {
    return this.state === 'PLAYING' && this.lifeState === 'ACTIVE';
  }

  public get currentState(): MatchState {
    return this.state;
  }

  public get currentMode(): GameModeId {
    return this.mode;
  }

  public setGameMode(mode: GameModeId): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.restart();
  }

  public restart(): void {
    this.state = 'COUNTDOWN';
    this.lifeState = 'ACTIVE';
    this.countdownSeconds = GAME_CONFIG.match.countdownSeconds;
    this.remainingSeconds = this.mode === 'SPLAT_ZONES'
      ? GAME_CONFIG.match.splatZones.durationSeconds
      : GAME_CONFIG.match.durationSeconds;
    this.respawnSeconds = 0;
    this.splatStartedPending = false;
    this.respawnPending = false;
    this.matchEndedPending = false;
    this.overtime = false;
    this.overtimeTeam = Team.Neutral;
    this.overtimeElapsedSeconds = 0;
    this.result = '-';
    this.stats.playerSplats = 0;
    this.stats.playerRespawns = 0;
    this.splatZones.reset();
    this.syncStats();
  }

  public fixedUpdate(dt: number, playerHp: number): void {
    if (this.state === 'COUNTDOWN') {
      this.countdownSeconds = Math.max(0, this.countdownSeconds - dt);
      if (this.countdownSeconds <= 0) this.state = 'PLAYING';
      this.syncStats();
      return;
    }

    if (this.state !== 'PLAYING') {
      this.syncStats();
      return;
    }

    if (!this.overtime) {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
    } else {
      this.overtimeElapsedSeconds += dt;
    }

    if (this.lifeState === 'ACTIVE' && playerHp <= 0) {
      this.lifeState = 'SPLATTED';
      this.respawnSeconds = GAME_CONFIG.match.respawnSeconds;
      this.splatStartedPending = true;
      this.stats.playerSplats += 1;
    }

    if (this.lifeState === 'SPLATTED') {
      this.respawnSeconds = Math.max(0, this.respawnSeconds - dt);
      if (this.respawnSeconds <= 0 && (this.remainingSeconds > 0 || this.overtime)) {
        this.respawnPending = true;
      }
    }

    if (this.mode === 'SPLAT_ZONES') {
      const knockout = this.splatZones.knockoutWinner();
      if (knockout !== Team.Neutral) {
        this.finishMatch(knockout === Team.A ? 'TEAM A' : 'TEAM B');
      } else if (this.remainingSeconds <= 0) {
        this.resolveZonesTimeExpired();
      }
    } else if (this.remainingSeconds <= 0) {
      this.finishTurfMatch();
    }

    this.syncStats();
  }

  public forceEnd(): void {
    if (this.state === 'ENDED') return;
    this.remainingSeconds = 0;
    this.overtime = false;
    this.overtimeTeam = Team.Neutral;
    this.overtimeElapsedSeconds = 0;
    if (this.mode === 'SPLAT_ZONES') {
      this.finishMatch(zonesResult(this.splatZones.snapshot()));
    } else {
      this.finishTurfMatch();
    }
    this.syncStats();
  }

  public consumeSplatStarted(): boolean {
    const pending = this.splatStartedPending;
    this.splatStartedPending = false;
    return pending;
  }

  public consumeRespawnRequest(): boolean {
    if (!this.respawnPending) return false;
    this.respawnPending = false;
    return true;
  }

  public completeRespawn(): void {
    if (this.state !== 'PLAYING') return;
    this.lifeState = 'ACTIVE';
    this.respawnSeconds = 0;
    this.stats.playerRespawns += 1;
    this.syncStats();
  }

  public consumeMatchEnded(): boolean {
    const pending = this.matchEndedPending;
    this.matchEndedPending = false;
    return pending;
  }

  public getSpawnPosition(team: Team.A | Team.B, out = new Vec3()): Vec3 {
    const spawn = team === Team.A
      ? this.stage.metadata.teamASpawn
      : this.stage.metadata.teamBSpawn;
    return out.set(spawn[0], spawn[1], spawn[2]);
  }

  private resolveZonesTimeExpired(): void {
    const decision = resolveZonesTimeout(
      this.splatZones.snapshot(),
      this.overtime,
      this.overtimeTeam,
      this.overtimeElapsedSeconds
    );
    if (decision.kind === 'START_OVERTIME') {
      this.overtime = true;
      this.overtimeTeam = decision.team;
      this.overtimeElapsedSeconds = 0;
      return;
    }
    if (decision.kind === 'FINISH') {
      this.finishMatch(decision.result);
    }
  }

  private finishTurfMatch(): void {
    const turf = this.gameplayInk.snapshot();
    const epsilon = GAME_CONFIG.match.resultTieEpsilonPercent;
    const difference = turf.percentA - turf.percentB;
    this.finishMatch(
      Math.abs(difference) <= epsilon
        ? 'TIE'
        : difference > 0 ? 'TEAM A' : 'TEAM B'
    );
  }

  private finishMatch(result: 'TEAM A' | 'TEAM B' | 'TIE'): void {
    if (this.state === 'ENDED') return;
    this.state = 'ENDED';
    this.overtime = false;
    this.overtimeTeam = Team.Neutral;
    this.overtimeElapsedSeconds = 0;
    this.respawnPending = false;
    this.matchEndedPending = true;
    this.result = result;
  }

  private syncStats(): void {
    this.stats.matchState = this.state;
    this.stats.matchMode = this.mode;
    this.stats.matchModeLabel = gameModeLabel(this.mode);
    this.stats.matchCountdownSeconds = this.countdownSeconds;
    this.stats.matchTimeRemainingSeconds = this.remainingSeconds;
    this.stats.matchOvertime = this.overtime;
    this.stats.matchOvertimeElapsedSeconds = this.overtimeElapsedSeconds;
    const zones = this.splatZones.snapshot();
    if (this.overtime && (this.overtimeTeam === Team.A || this.overtimeTeam === Team.B)) {
      const lossAge = this.overtimeTeam === Team.A ? zones.lossAgeA : zones.lossAgeB;
      this.stats.matchOvertimeGraceSeconds =
        zones.control === this.overtimeTeam
          ? GAME_CONFIG.match.splatZones.overtimeGraceSeconds
          : Math.max(
              0,
              GAME_CONFIG.match.splatZones.overtimeGraceSeconds -
                (Number.isFinite(lossAge) ? lossAge : GAME_CONFIG.match.splatZones.overtimeGraceSeconds)
            );
    } else {
      this.stats.matchOvertimeGraceSeconds = 0;
    }
    this.stats.playerLifeState = this.lifeState;
    this.stats.playerRespawnSeconds = this.respawnSeconds;
    this.stats.matchResult = this.result;
  }
}
