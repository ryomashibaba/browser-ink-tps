import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import { Team } from '../ink/types';

export type MatchState = 'COUNTDOWN' | 'PLAYING' | 'ENDED';
export type PlayerLifeState = 'ACTIVE' | 'SPLATTED';

export class MatchController {
  private state: MatchState = 'COUNTDOWN';
  private lifeState: PlayerLifeState = 'ACTIVE';
  private countdownSeconds = GAME_CONFIG.match.countdownSeconds;
  private remainingSeconds = GAME_CONFIG.match.durationSeconds;
  private respawnSeconds = 0;
  private splatStartedPending = false;
  private respawnPending = false;
  private matchEndedPending = false;
  private result = '-';

  public constructor(
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stats: PerformanceStats
  ) {
    this.syncStats();
  }

  public get playerCanAct(): boolean {
    return this.state === 'PLAYING' && this.lifeState === 'ACTIVE';
  }

  public get currentState(): MatchState {
    return this.state;
  }

  public restart(): void {
    this.state = 'COUNTDOWN';
    this.lifeState = 'ACTIVE';
    this.countdownSeconds = GAME_CONFIG.match.countdownSeconds;
    this.remainingSeconds = GAME_CONFIG.match.durationSeconds;
    this.respawnSeconds = 0;
    this.splatStartedPending = false;
    this.respawnPending = false;
    this.matchEndedPending = false;
    this.result = '-';
    this.stats.playerSplats = 0;
    this.stats.playerRespawns = 0;
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

    this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);

    if (this.lifeState === 'ACTIVE' && playerHp <= 0) {
      this.lifeState = 'SPLATTED';
      this.respawnSeconds = GAME_CONFIG.match.respawnSeconds;
      this.splatStartedPending = true;
      this.stats.playerSplats += 1;
    }

    if (this.lifeState === 'SPLATTED') {
      this.respawnSeconds = Math.max(0, this.respawnSeconds - dt);
      if (this.respawnSeconds <= 0 && this.remainingSeconds > 0) {
        this.respawnPending = true;
      }
    }

    if (this.remainingSeconds <= 0) this.finishMatch();
    this.syncStats();
  }

  public forceEnd(): void {
    if (this.state === 'ENDED') return;
    this.remainingSeconds = 0;
    this.finishMatch();
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
      ? GAME_CONFIG.match.teamASpawn
      : GAME_CONFIG.match.teamBSpawn;
    return out.set(spawn[0], spawn[1], spawn[2]);
  }

  private finishMatch(): void {
    if (this.state === 'ENDED') return;
    this.state = 'ENDED';
    this.respawnPending = false;
    this.matchEndedPending = true;

    const turf = this.gameplayInk.snapshot();
    const epsilon = GAME_CONFIG.match.resultTieEpsilonPercent;
    const difference = turf.percentA - turf.percentB;
    this.result = Math.abs(difference) <= epsilon
      ? 'TIE'
      : difference > 0 ? 'TEAM A' : 'TEAM B';
  }

  private syncStats(): void {
    this.stats.matchState = this.state;
    this.stats.matchCountdownSeconds = this.countdownSeconds;
    this.stats.matchTimeRemainingSeconds = this.remainingSeconds;
    this.stats.playerLifeState = this.lifeState;
    this.stats.playerRespawnSeconds = this.respawnSeconds;
    this.stats.matchResult = this.result;
  }
}
