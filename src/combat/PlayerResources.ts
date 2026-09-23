import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { InkRelation, PlayerMode } from '../player/PlayerController';

export class PlayerResources {
  private ink = GAME_CONFIG.inkEconomy.capacity;
  private hp = GAME_CONFIG.combat.playerMaxHp;
  private inkRecoveryLockSeconds = 0;
  private hpRecoveryDelaySeconds = 0;

  public constructor(private readonly stats: PerformanceStats) {
    this.syncStats('READY', 'READY');
  }

  public fixedUpdate(dt: number, mode: PlayerMode, relation: InkRelation): void {
    this.inkRecoveryLockSeconds = Math.max(0, this.inkRecoveryLockSeconds - dt);
    this.hpRecoveryDelaySeconds = Math.max(0, this.hpRecoveryDelaySeconds - dt);

    let inkState = 'LOCKED';
    if (this.inkRecoveryLockSeconds <= 0) {
      let inkRate = 0;
      if (mode === 'SQUID' && relation === 'OWN') {
        inkRate = GAME_CONFIG.inkEconomy.squidOwnRecoveryPerSecond;
        inkState = 'SQUID_OWN';
      } else if (mode === 'HUMAN') {
        inkRate = GAME_CONFIG.inkEconomy.humanRecoveryPerSecond;
        inkState = 'HUMAN';
      } else {
        inkState = 'NONE';
      }
      this.ink = Math.min(
        GAME_CONFIG.inkEconomy.capacity,
        this.ink + inkRate * dt
      );
    }

    let hpState = 'WAIT';
    if (relation === 'ENEMY' && this.hp > GAME_CONFIG.combat.enemyInkMinimumHp) {
      const damage = Math.min(
        GAME_CONFIG.combat.enemyInkDamagePerSecond * dt,
        this.hp - GAME_CONFIG.combat.enemyInkMinimumHp
      );
      if (damage > 0) {
        this.hp -= damage;
        this.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
        this.stats.playerDamageTaken += damage;
      }
      hpState = 'ENEMY_INK';
    } else if (this.hp > 0 && this.hpRecoveryDelaySeconds <= 0) {
      const recoveryRate =
        mode === 'SQUID' && relation === 'OWN'
          ? GAME_CONFIG.combat.squidOwnHpRecoveryPerSecond
          : GAME_CONFIG.combat.humanHpRecoveryPerSecond;
      this.hp = Math.min(
        GAME_CONFIG.combat.playerMaxHp,
        this.hp + recoveryRate * dt
      );
      hpState = recoveryRate > 0 ? (
        mode === 'SQUID' && relation === 'OWN' ? 'SQUID_OWN' : 'HUMAN'
      ) : 'NONE';
    }

    this.syncStats(inkState, hpState);
  }

  public tryConsumeShotInk(): boolean {
    const cost = GAME_CONFIG.inkEconomy.inkPerShot;
    if (this.ink + 1e-6 < cost) {
      this.stats.inkDryFireAttempts += 1;
      return false;
    }

    this.ink = Math.max(0, this.ink - cost);
    this.inkRecoveryLockSeconds = GAME_CONFIG.inkEconomy.recoveryLockSeconds;
    this.stats.shotsFired += 1;
    this.syncStats('LOCKED', this.stats.playerHpRecoveryState);
    return true;
  }

  public applyDamage(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0 || this.hp <= 0) return 0;
    const previous = this.hp;
    this.hp = Math.max(0, this.hp - amount);
    this.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
    const applied = previous - this.hp;
    this.stats.playerDamageTaken += applied;
    this.syncStats(this.stats.playerInkRecoveryState, 'WAIT');
    return applied;
  }

  public reset(): void {
    this.ink = GAME_CONFIG.inkEconomy.capacity;
    this.hp = GAME_CONFIG.combat.playerMaxHp;
    this.inkRecoveryLockSeconds = 0;
    this.hpRecoveryDelaySeconds = 0;
    this.syncStats('READY', 'READY');
  }

  private syncStats(inkState: string, hpState: string): void {
    this.stats.playerInk = this.ink;
    this.stats.playerInkPercent =
      this.ink / GAME_CONFIG.inkEconomy.capacity * 100;
    this.stats.playerHp = this.hp;
    this.stats.playerInkRecoveryState = inkState;
    this.stats.playerHpRecoveryState = hpState;
  }
}
