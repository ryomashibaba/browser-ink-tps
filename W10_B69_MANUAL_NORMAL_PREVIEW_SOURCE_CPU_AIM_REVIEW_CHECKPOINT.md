# Browser Ink TPS — W10-B69 source-only owner-visible CPU paint aim selection

QA branch only. Base `3264f337302e57eea4bde1fcf1f59395c0dbd806`. Date 2026-10-21 JST. No production, main, Draft PR #5 or Pages changes.

## B68 confirmed native owner-preview-compatible candidate, still NOT default

The same-code [W10-B68 real normal-preview 180s FIXED vs optional SWEEP](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39506926374) finished all **4/4 workflow jobs success**. Both 180-second genuine PlayCanvas/Rapier/Recast sessions passed pointer input, seven CPU source-foot ground rejoin, genuine TIME_UP, B62 owner-local evidence readiness, B63 CPU paint-tempo end panel, pointer unlock and RESTART. Actual result: FIXED 112 shots, 3,615 changed original source paint cells, 4,951.404m cumulative patrol; SWEEP 491 shots, 11,779 cells, identical 4,951.404m patrol. +8,164 real original paint cells; ~3.258x; 60–120s actual added source ink FIXED +18 vs SWEEP +809. Seven genuine CPU source-shot contributors. Hosted Chromium p95 render callback (1158ms FIXED vs 465.6ms SWEEP) **cannot** be interpreted as a reliable owner GPU speedup. Comparator declared QUALIFIED_FOR_OWNER_SIDE_SOURCE_PREVIEW_QUALITY_REVIEW; `defaultCpuSwitched=false`.

## B69 actual usability implementation

Expose the already-existing B68 opt-in source ink aiming only to ordinary nonproduction `?t21Play=preview` player, with a visible review area in the existing top-left preview panel: `CPU AIM · FIXED (DEFAULT)`, or `CPU AIM · SWEEP TRIAL (EXPLICIT OPT-IN)`, a concise warning that original 4v4, original source score and owner GPU QA remain unverified, and a SINGLE real button `TRY SWEEP · RESTART SESSION` or `RETURN TO FIXED · RESTART SESSION`. The button reloads a NEW safe source-only preview via a whitelisted path and query; switching cannot occur via silent mid-physics mutation, nor when the pointer is locked or a live GPU A/B is under way. It will erase unsaved session metrics, clearly warned before clicking. No debug query, actor position, score, source URL, or arbitrary QA/survey mode survives the switch.

Default normal preview stays exactly FIXED. A SWEEP user must manually choose it; return to FIXED is one click. Source QA (`t21QaDrive=source`), production and non-preview cannot see or use this UI. The selector never unlocks origin source claims or makes normal source practice an original official match.

New pure TS guard/route model + Vitest tests check default FIXED, explicit SWEEP, return to FIXED, source-only/production isolation and unsafe URL rejection. Genuine Chromium smoke executes real CDP mouse clicks on displayed buttons, witnesses F3 app reload and real state after each reload (FIXED→SWEEP→FIXED), original 25/17/26/0 and zero default promotion, and captures screenshots of all three real browser UI states. The app CPU movement/aim code is unchanged from B68 for both conditions.

## Hard HOLD (unchanged)

Original collision 25 physics solids, 17 paintable original non-scoreable surfaces, 26 source NavLinks, 0 scoreable, activationReady=false; original SetActor/Banc active actor transforms and 8 missing PntSet instance bindings unproven; original inter-team paths 0/12; no official winner, genuine unrestricted 4v4, real owner Windows GPU/feel certification, or publication approval. Source-only SWEEP quality is measured as locally improved paintable ink throughput, not a win or original map completion.

Status at authoring: implementation prepared, exact SHA B69 UI Chrome/Node/TypeScript CI pending. Always check CI before declaring PASS.
