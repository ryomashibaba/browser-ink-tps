# Browser Ink TPS — B334 quality-first development decision after B333

**Date:** 2026-10-29 JST. **Branch:** `dev/t21-f4e103w-qa-infra`. This is a decision/evidence record, not newly certified gameplay, new original source physics, or public release.

## Verified, genuine Chrome evidence — do not repeat a solved proof

- **B331 two independent genuine A1 cooperative clears + THREE actual fresh-world replay interactions:** [Actions 40865251955](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40865251955), actual HEAD `1159b6643124dd2f5cbdfd34325e0cbddff0e6b4`. Both selected cooperative rounds actually returned CLEAR, with real human movement/ink and original A1 tagged impacts. First round 808 human owner cells, 41 A1 changed source cells, 1 A1 event; second round 808, 54, 2. Each actual round used the native resume button after genuine paused ARMED, not synthetic tick/position injection. The game created three distinct fresh STAGING/IDLE, zero-rejoined-CPU worlds through actual mission-card, terminal HUD, and keyboard-R replay.
- **B333 independent validator on the EXACT saved 13-file original run artifact:** [Actions 40867878430](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40867878430), base actual game-run id `40865251955` and exact SHA `1159b6643124dd2f5cbdfd34325e0cbddff0e6b4`. Downloaded, checked and audited five original JSON witnesses and two genuine Chromium screenshots, then wrote `b332-independent-real-replay-verdict.json`. Actual validator returned `PASS_TWO_TRUE_NATIVE_A1_CLEARS_THREE_FRESH_REPLAY_WORLDS`. This **is not merely a synthetic unit-test PASS**. Script and original artifact are inspectable in that Actions run.
- **B331 original upper floor native KCC and true paint:** [Actions 40865252176](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40865252176), original source 25/17/26/0. Actual genuine continuous upper-floor KCC was **5.632950201043635m** (B324 2.0800695727665173m plus B326 3.552880628277118m). B315 genuine THREE original human-owned surface paint IDs and B322 ramp crest were independently verified.
- Claims limited to *observed local source practice*, not a complete 180-second match, all-stage access, score/winner, enemy-side natural CPU routes, art acceptance or production.

## Why the whole original right-low → underpass route remains HOLD

The previous **B224–B241** history is substantive and should not be casually repeated:

1. Real CDP human input did traverse five exact original source components into the existing registered underpass floor on both mirrored sides in **an isolated 30-solid QA** scene, B228 ([source QA](W10-B228-source-to-registered-underpass-real-input.md)). **The live game still registers only 25 original source solids.** Isolated 30/31-solid proof cannot be promoted to live F3 physics or a CPU route.
2. B229–B233 independently found local genuine Rapier CPU-speed jump and QA Recast/Crowd handoff feasibility, but these remain isolated pilots; the first genuine FloorConcrete01→outer Slope00 ~2.074m gap is a *jump*, not a walkable Recast edge.
3. B234–B241 established missing live source faces, a source right-low ingress gap, exact full KiTrix/Temple01 original-source extraction, and a narrow FloorLine00. B240 shows source-specific safe-radius Recast clearance failures; B241 reports intermittent missing exact source foot support even when generic KCC says grounded. The 0.311135m local ribbon is narrower than the real CPU ~0.60m diameter. No native original CPU traverse follows.
4. **B242 source-authority decision expressly HALTED corridor promotion** ([decision](W10-B242-source-authority-hold-playable-round-lifecycle.md)). The original game collision role of candidate FloorLine00/source faces has **not** been authenticated. B284 corrected Temple01 *stage identity*, which does **not** authenticate original collision role. The later B285 flat screen also did not solve native original Recast support.
5. Thus the existing registered original 25 solids, 17 paint surfaces, 26 NavLinks and zero scoreable remain unchanged. **activationReady=false, officialWinner=NONE, productionAuthorized=false, unrestricted4v4Certified=false; opposing 12 natural routes certified=0.** Underpass route is still not a native live crossing.

Do **not** import extra QA source meshes into the main game, relax the safe CPU radius, insert a fake bridge/offmesh link, copy a local QA actuator into the actual 7-bot system, or call endpoint-near-NavMesh a physically traversable path. Do not rerun B224–B241 without new authoritative original-game collision-role evidence or a genuinely different verified 25-solid-native route.

## Next highest-value engineering slice: a genuine *whole 180-second source practice round*

Rather than another isolated two-meter KCC or source component measurement, prioritize a **targeted independent actual Chromium round-lifecycle test** that:
- starts from the actual visible READY 180-second source-only trial with the real user control and seven physical CPU agents, and records the real 60Hz game clock;
- observes continuous native samples (for example 0/30/60/90/120/150/180 seconds) with exact source authority, actual owner-grid deltas, actual Rapier human foot support, actual native CPU physical/crowd presence, and the real browser's frame/performance values; source ink events must not be fabricated;
- demonstrates real clock expiry and actual `TIME_UP` transition with **scoreable=0 and winner NONE** rather than invoking synthetic tick advancement or promoting unrestricted4v4;
- captures actual final HUD/viewport evidence and preserves source-only ART rejection if genuine in-play presentation remains inadequate;
- checks existing true pause/resume and fresh replay controls survive expiry, without conflating A1 objective CLEAR (~13s) with a 180s match completion;
- runs in a *single opt-in bounded QA workflow*, not an automatic 8-workflow fan-out triggered by every edit. No user ZIP/manual operations.

**Fail closed:** native full-round success requires actual wall-clock progress / engine native tick and authentic state transition. A1 objective CLEAR alone, a screenshot, a 180-second timer label, metadata continuity or fixture tests are not enough.

## Next source-connection gate — only after new original source authority

If authentic original-game FloorLine00 collision role (or an alternative genuinely registered 25-solid-native corridor) becomes available, return to exact source provenance, 0.32m Rapier capsule continuous original support, safe nonzero-radius native Recast path and real **same CPU body** Crowd→KCC→Crowd native transition *before* any seven-CPU gameplay claim. Otherwise keep corridor SOURCE_AUTHORITY HOLD and spend implementation time on actual player-facing round completeness, performance and ART.

No changes to main, protected Draft PR #5, production Pages or the 25/17/26/0 frozen original stage.
