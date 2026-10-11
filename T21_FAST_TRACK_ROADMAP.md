# T21 Undertow Fast Track — source-faithful playable gameplay before micro-QA

**Scope:** `ryomashibaba/browser-ink-tps`, draft PR #5, original Temple01 source-backed T21 Undertow.  
**Mandatory freezes:** T20 production `inkworks-junction` remains live; T21 `activationReady=false`. Do not merge this PR, invent a floor/ramp, assert unproven source geometry, promote scoreable turf or bypass glass/blocker authority.  
**Why this plan exists:** Phase14C–14Q built real Recast→Rapier first drops, seven CPU physical recoveries, eighth PlayerController and genuine CPU→player damage, but repeated *fail-closed checks* and isolated QA micro-fixes were outpacing the playable-map milestone. Test-count growth ≠ game completion.

## Macro-deliverables, in priority order

| Milestone | Work that actually advances the game | Acceptance evidence | Current status |
| --- | --- | --- | --- |
| F1: real original-source 8-player setup | 4 high-ground, **collision-separated** QA spawn positions per team derived only from frozen high-pad colliders and original NavMesh; 7 CPU + human enter play without overlapping spawn feet. Do not replace original source center metadata or claim precise 4v4 authored slots | Native CPU bodies from source-backed 4+4 QA metadata, actual Rapier top-solid probes, 60Hz simultaneous CPU movement, zero fake high pads | Initial 4+4 support and distinct 7 CPU spawn validated; longer simulation in progress |
| F2: continuous movement & descent | Source-backed Recast and Rapier first drop, with physically coherent human/CPU shared collision. Handle route transitions, conflict, stop/repath/resume **once**, not a new one-off test for every numeric jitter | Continuous eight-actor simulation includes all relevant fall frames; no actual capsule intersection; original support; no hidden CPU teleport; no stranded agents | Only independent 7-CPU drops and end-position checks passed; source-first shared contact veto added; *not complete* |
| F3: playable Turf vertical slice | Real 4v4 clock, input, health, weapons, projectiles, respawn, paint and scoreboard on a permitted source-backed QA subset. **Uncertified surfaces remain non-scoreable**; keep a separate diagnostic paint ledger if useful | Browser/Chrome human-controlled session with independently verifiable metrics and stage collision behavior, not just headless bot QA | Real player controller/projectile/B1 hit demonstrated; game-level match/scoreable masks still incomplete |
| F4: finish full-source stage | Close only source-proven two right-low→underpass ±Z gaps; glass thin edge / roof / player/squid/projectile authority; original paint-to-score map, game camera, visual fidelity | Source evidence/provenance and real browser snapshots, all original unproven geometry remains HOLD | Blockers remain |
| F5: review and release gate | Integrate F1–F4, real human playtesting and performance/quality; explicit final activation and merge approval | Real 4v4 human match, all high-level gates green, no factual placeholders, explicit approval | NOT authorized |

## Development operating rule

1. **One coherent vertical slice per work unit**, not one small defensive guard and one extra test. Favor visible, playable capability, grouped changes, and original-source audits.
2. **One short smoke gate while building**, full TypeScript/Vitest and original browser Chrome gates **at the end of the slice**, unless a production regression requires earlier intervention. Group related edits before pushing to avoid six repeated workflows for every typo.
3. Triage every blocker: `BLOCKS_PLAYABLE_MATCH`, `SOURCE_AUTHORITY`, `VISUAL_FIDELITY`, or `POLISH`. Spend time on the first two first. Do not endlessly tune centimeter-level tolerances while the live 4v4 loop is absent.
4. A PASS means exactly its **tested scope**, not implicit completion. E.g. seven CPUs recovered by F342 is not an 8-actor continuous physical match; a scripted real PlayerController is not human-operated gameplay; 17 paintable but **zero scoreable** surfaces are not Turf completion.
5. Maintain checkpoint SHA, actual test count/CI run, explicit blockers and next *playable* artifact in a concise PR comment. Never repeat ZIP handoff packaging per minor commit.
6. Frozen source arrays (25 collision solids / 17 painted surfaces / 26 nav links), original Temple01 OBJ provenance and unfinished right-low underpass are immutable until original-backed approval. All generated spawn slots are **QA candidate player locations**, not newly inferred authored source objects.
7. **Stop condition for Phase14Q collision subproject:** once a bounded 8-actor source-backed session has continuous nonoverlap, stable human/CPU movement and reliable drop/rejoin, transition immediately to Turf loop (F3). Avoid endless follow-up 14Q alphabetic test phases.

## Concrete next implementation batch

- Run 7 authentic CpuAgentSystem bots from source-verified 4+4 original-high-pad QA slots through early Crowd movement and original one-way links, with no hand-placed same-center starts.
- Replace the historical one-slot-per-team QA staging condition in **opt-in** test/browser setup only, preserving original stage center and frozen solids.
- Reclassify isolated pre-offmesh 60Hz overspeed separately from true instant offmesh descent: do not alter CPU global speed; use original physics / Recast agent ownership before authorizing any corrected physical path.
- For 8-body physics, solve actual CPU-Crowd feedback rather than masking overlap by render correction. Record a single diagnostic per failure class, not a new CI lane per incident.
- Then pursue a source-licensed playable match and score/paint authority as the primary completion target.

**What has definitely improved:** real original GPU source geometry, seven Recast/Rapier/Crowd recoveries, real HUMAN PlayerController on source floor, actual CPU-authored projectile damage, source camera alternatives, collision veto, 4+4 original-high-pad QA spawn allocation.  
**What is not done:** full human-played T21 4v4, eight-actor continuous physical collisions, verified source Turf scoring, complete map connectivity, production activation.
