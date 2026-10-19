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

## Verification

At checkpoint creation the B38 real-Chrome and CI runs were PENDING. A dedicated step inside existing trusted Chrome workflow sends a browser-native locked F key, proves exactly one human sub throw with genuine ink cost, advances the real existing 60Hz game simulation until actual bomb explosion, and rejects any source authority drift. This is browser/input/physics evidence but NOT a natural human play session, owner Windows GPU benchmark, or original full 4v4.

Frozen source authority: **25 original solids / 17 paintable / 26 NavLinks / zero scoreable / 0/12 certified cross-team paths / activationReady=false**.
B31-B35 native CPU retargeting research stays opt-in; proven FIXED remains default. Missing original Vss_Temple01 Banc/SetActor identities, transforms and active layers remain HOLD.
