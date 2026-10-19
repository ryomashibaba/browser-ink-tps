# Browser Ink TPS — W10-B38 genuine human sub on original-source practice

Date: 2026-10-19 JST. Branch: dev/t21-f4e103w-qa-infra (nonproduction).
Base W10-B37: d72b72cba01d290df5008247e45dfad715e12e8c.
Runtime implementation: d03315431c2f2186431a89d5b8b4e272cdfc0551.

## Why this player-visible change

The existing project already supports human F-key sub throws using PlayerInput, PlayerResources, SubWeaponSystem, genuine ballistics/physical collision, authoritative paint coordinator and GameFeedback in InkLabApp. F3 nonproduction original-source practice had no human sub-weapon pipeline despite accepting and queuing F key input. Adding yet another CPU target heuristic would not address this playable feature gap.

## Gameplay scope

- Ordinary explicit `?t21Play=preview` now uses the unchanged human `SubWeaponSystem` and the default weapon kit's sub: press F while genuinely pointer-locked, alive and able to act. True 60Hz fixed ticks consume real ink, advance the original collision-aware thrown object, explode, damage already-live valid opponents (if physically reached), and enqueue paint on existing genuine original paint surfaces only.
- Original paint events are unscored: there is no official Turf score, 4v4 victory or Actor placement assertion. The existing B23 projectile-impact confirmation intentionally does not count bomb paint as a bullet impact. CPU-kit debug arms/charges remain separate and unchanged.
- Deterministic/benchmark source QA `t21QaDrive=source` leaves human F subs OFF by default so fixed patrol A/B histories remain comparable; explicit `&t21W10B38=humanSub` opts into this QA witness.
- No stage, bot patrol, NavMesh, original Actor transforms, static scoring or production gameplay files changed. `main` and Draft PR #5 remain untouched.

## Completed verification on exact tested code

**Tested complete B38 browser/workflow commit:** `aef0fe08686e0436fbd989448114e1c2b8753a43`. The final checkpoint commit is documentation-only and was not separately tested by those workflows.

- [Trusted original WebGL2 real mouse/keyboard, human sub F, CPU splat/respawn and fixed/B35 aligned comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39241173280) — **SUCCESS** with every step completed. TypeScript + Vite production-grade build PASS; B37 PlayerInput **12/12**, B17 HUD **4/4**, B31/B33/B34/B35 pure regression **11/11**, actual Chrome trusted input and native source physics PASS. No owner Windows GPU was used.
- Actual Chrome log: `T21_W10B38_REAL_CHROME_KEY_F_SOURCE_BOMB_PASS` with `browserKeyEvent=true`, genuine pointer-locked F press, **1** human sub throw with real ink deduction, **1** bomb explosion after **144** further genuine 60Hz source simulation ticks. No method call directly forced a bomb, actor, or ink change. Paused deterministic stepping is *not* a real-time FPS test.
- Chrome regression remained compatible with fixed source CPU patrol: the existing same-source exact ticks **1800–2880** baseline and opt-in B35 research comparison ran successfully; B35 remains below gameplay thresholds and is NOT default.
- [Real Chrome CPU render/respawn](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39241173157) — **SUCCESS**.
- [Original-source render A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39241173311) — **SUCCESS**.
- [Pinned full-original source model browser integration](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39241173231) — **SUCCESS**. Original display asset evidence does not grant collision/Actor identity or official score authority.
- [Ubuntu/Windows hosted QA launcher](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39240798240) — **SUCCESS** on both hosted OS jobs for earlier **runtime implementation commit** `d0331543`; workflow/doc-only B38 `aef0fe08` changes did not edit source runtime. This is not the owner's own PC. Platform-specific skipped steps remain skipped, not PASS.

## Important remaining limits

This browser experiment proves a **human-sub launch and native explosion**. It does not certify a specific amount of human-owned ink cells from the bomb, a naturally occurring opposite-team player hit, an authentic original actor/spawn map, human-sub balance/fun, owner Windows/RTX real-time performance, or a scored Turf winner. The effect may only paint when it intersects the existing authorized paintable surfaces. Practice remains non-scoring. Neither synthetic real-time nor original asset authority should be inferred from test green.

## Frozen project authority and next dependency

- Original certified physical solids **25** / paintable **17** / NavLinks **26** / officially scoreable **0**.
- Opposite-team source-native reachable routes **0/12** (partial currently certified source, not a theorem about the original game); `activationReady=false`.
- B31/B33/B34/B35 CPU retargeting research stays explicit opt-in only. Normal CPU source patrol remains **FIXED**.
- The missing original `Vss_Temple01` Banc/SetActor instance transforms, layers, GUID-to-mesh identity and source-proven natural underpass connections remain **UNKNOWN/HOLD**. No invented floors, spawns, NavMesh links or scoring were inserted; no private source payload was published.
- Protected `main`, production T19C/T20, hosted Pages, separate Draft PR #5 and user Windows originals remained out of scope.
- For further fidelity improvement, use lawful private original actor evidence to unlock true routes before claiming unrestricted natural 4v4. While unavailable, prioritize concrete human playability improvements on the authenticated local source instead of renewed CPU retarget heuristic churn.
