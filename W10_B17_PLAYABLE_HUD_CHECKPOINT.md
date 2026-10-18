# W10-B17 — playable source-only HUD and debug input conflict removed

**Branch:** `dev/t21-f4e103w-qa-infra`  
**Runtime / test HEAD:** `ccbdcb354e8dfeff99082e6ea72b49a752f4985d`  
**Verified:** 2026-10-18, isolated GitHub source QA branch only.

## Changes that materially improve the playable interface

- `src/app/UndertowF3PlayableHud.ts` adds a small fixed, source-only upper-center HP / ink / 3-minute timer / seven-CPU progress display backed by the original simulation snapshot, refreshed through normal F3 app updates. The banner **UNSCORED / NO OFFICIAL RESULT** is mandatory. No fabricated winner.
- The left preview diagnostics now starts collapsed in a `details` element; 25+ lines of source-audit telemetry and optical review controls remain available without blocking normal view. `#t21-f3-live` stays readable in DOM and is never removed.
- While the player has actual pointer lock, G/V/H/B/T cannot unexpectedly switch to source-review modes; in particular the genuine `PlayerInput` gameplay G binding no longer opens the gallery/pauses camera if original gallery assets become available. Source controls remain usable when the pointer is released.
- The visual source radar and real stage physics are unchanged; no gameplay actor placement, scoring or collision/nav promotion.

## Real verification

- [Real Chrome integrated gameplay, native B15 input, real CPU respawn PNG-pixel proof, B16 7-CPU paint/patrol and W10-B17 live HUD assertions](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39128960615): SUCCESS on `ccbdcb354e8d`.
- [W10-B14 real WebGL2 CPU render lifecycle regression](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39128960619): SUCCESS on same HEAD.
- [Windows + Ubuntu source QA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39128824211): SUCCESS on latest app runtime changes (`f507e2de24f7`); subsequent changes added only HUD pure tests and browser/CI assertions, did not modify app runtime.
- Pure Vitest tests cover initial 3:00 status, source-local 7/7, HP/ink clamping, time-up without a winner, and fail-closed refusal of any scoring/production promotion.

B16 native browser remained source-only with **all seven real CPU drops/rejoins**, ~703m source-local patrol, 87 autonomous source-floor shots, 92 physical paint hits, 11,064 ink cell changes. No valid native end-to-end cross-team path was found among the 12 actual A/B CPU pairs; **`HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH`** (current partial map only). No natural 4v4 claimed.

## Blockers / next engineering priority

Current repository contains **only** `UndertowW10SetActorBancEvidenceGate.ts` schema-only private data admission gate, not authenticated original `Vss_Temple01` Banc/SetActor payload or verified placed source instances. Uncertified underpass connection, scoreable turf masks, authored placement, and unrestricted human 4v4 all remain HOLD. Do not invent a solid or teleport CPU to manufacture contact.

Next batch **W10-B18** should prioritize a properly playable local-source session or meaningful graphics/interaction/performance improvements that can be verified in actual Chrome *while awaiting source authentication*. When authenticated original-instance data exists, the priority switches immediately to properly reconstructing the original underpass transition via source-only actor/layout validation, followed by actual Recast+Rapier cross-team walking and human/CPU combat.

**No main merge, original source uploads, PR #5 update, Windows file modification, or production deployment.**
