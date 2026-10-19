# Browser Ink TPS — W10-B40 native human bomb condition measurements (VERIFIED)

**Date:** 2026-10-19 JST  
**Branch:** `dev/t21-f4e103w-qa-infra` only.  
**B40 initial implementation SHA:** `f4be722c9cf51361115fb61f9e7a2b95f68d2368`  
**B40 final code/QA SHA:** `084fdac8f9e149c634cf99538e3afdfa54ec2228`  
**Decision:** **B40 controlled Chrome measurement PASS; varied-location gameplay paint quality NOT CERTIFIED.** An exploded bomb with zero newly owned cells is not a positive paint outcome.

## Measured result — one actual Chrome QA sequence

The original WebGL2 source-only QA scene uses **genuine pointer-locked browser KeyF** three times, real player ink consumption / fixed-tick recovery, existing `SubWeaponSystem`, Rapier physical stepping and `GameplayInkSystem.apply()` as ownership truth. No position, aim, ink count or paint event was injected. All three throws exploded, with 144 additional native physics ticks after each accepted repeat throw (NOT 144 realtime rendered frames). Human foot position stayed `[2.7770142555, 3.8950998783, -53.9137496948]` for the three measured conditions.

| Case | Real original paint stamps | Zero-change stamps | Authoritative changed paint events | Newly changed owned cells | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| First original-direction throw (B39 gate) | 9 | 0 | 9 | **830** | Positive source-local paint |
| Repeat same view/aim, after natural ink refill | 9 | 9 | 0 | **0** | Real source stamps, but **no new ownership** |
| Pointer-locked physical mouse pitch change **+14.4°**, after refill | 9 | 2 | 7 | **546** | Positive source-local paint |

All three paint stamp sequences targeted the existing certified original paintable `UndertowT21D:first-drop-landing-negative-z:paint`. The repeat case was **not** a missing paintable-surface projection: it had 9 real paint stamps but zero changed ownership. Overlap with already friendly-owned ink is plausible, but the source contact witness alone does **not** prove the exact causal mechanism or diagnose all future zero-change throws. No unsupported enemy path, Turf victory, or new scoreable surface is inferred.

The third throw changed camera pitch from approximately -24.78° to -10.38° through real browser mouse movement, not a direct write to camera rotation. Each repeat/pitch run showed exactly one accepted throw and one native explosion. The B25 projectile-only training goal remained unchanged.

## New B40 verification code

- Keep **stamp attempts** and **post-raster actual changed cells** separate in source-only `UndertowF3SourceInkFeedback`.
- Record `humanBombZeroChangedEvents`, `lastBombStampedSurface` and `lastBombStampTick` even if an authentic bomb paint stamp changed zero authoritative cells; retain strictly positive-only bomb success confirmation.
- Check stamp accounting `total stamps = changed events + zero-change events` and retain certified stamp surface identity in `w10b40-real-bomb-conditions.json`.
- Add pure regression coverage for already-painted zero-change source stamp attempts. No new runtime geometry, physics, navigation, gameplay score authority or default CPU behavior.

## GitHub Actions — final implementation SHA

All four workflows ran at **`084fdac8f9e149c634cf99538e3afdfa54ec2228`**, not merely at the later documentation-only HEAD.

1. [Trusted input, source-local B40 Chrome throws, original ink and CPU regression — SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39256676309) (includes successful build, feedback unit tests, browser script syntax, real Chrome KeyF/mouse witness, CPU comparison)
2. [Original pinned full Temple01 visual integration — SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39256676366)
3. [Actual Chrome CPU render and respawn — SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39256676455)
4. [Original-source frozen render A-B-A — SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39256676535)

Trusted Chrome log marker: `T21_W10B40_NATIVE_BOMB_CONDITIONS_OBSERVED` and uploaded `w10b40-real-bomb-conditions.json`. The result is a reproducible **controlled observation**, not a benchmark of the owner's OMEN RTX hardware.

## Unchanged source-authority and release HOLD

**25 certified original physical solids / 17 original paintable surfaces / 26 certified original NavLinks / 0 official scoreable surfaces**; observed opposing-team native foot paths **0/12** in the incomplete approved stage; `activationReady=false`. Default **FIXED** CPU patrol retained; B31–B35 experimental modes remain unadopted. Original `Vss_Temple01` Banc/SetActor transforms, authentic middle-underpass connection, genuine spawn and official Turf score masks remain **HOLD/UNKNOWN**. No invented platform, teleport, new collider, new NavLink, raw private source upload, production activation, Pages deployment, `main`, Draft PR #5, or Windows original mutation.

## Next highest-value work

B41 should prioritize player-facing practice credibility and measured bomb/contact behavior on **authentic approved local geometry**, especially separating no-new-ownership feedback from a physically missed throw **without inventing the reason**, while also continuing lawful private original Banc/SetActor evidence discovery. More varied near/far/wall/edge contact cases remain unverified and should only be promoted when the original physical contact is actually witnessed. No general 4v4, GPU FPS, or Turf victory claim.
