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

## Exact runtime SHA acceptance — 2026-10-21 JST

- B69 [two-job GitHub Actions run 39537444758](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39537444758) completed **SUCCESS / SUCCESS at runtime SHA `3c19077bdbb5cf19d60a4b2f6bfe710332bf3c6b`**. Preflight: actual Node 24 source build and Vitest guard regressions all pass; actual Chrome/WebGL2 review button workflow: 2 genuine CDP browser mouse clicks, 2 real full page reloads, mode progression **FIXED → SWEEP → FIXED** with no source actor/CPU movement mutation mid-session.
- Real Chrome initial baseline `?t21Play=preview` mode FIXED, b64SourceInkSweep.enabled=false, graphics NATIVE; first real click navigates `?t21Play=preview&t21W10B68=previewSweep` mode SWEEP, source ink sweep enabled=true; second real click returns exactly `?t21Play=preview`, FIXED source ink sweep disabled. Each phase original 25 solids/17 Paintable/26 source links/0 Scoreable, original4v4Certified=false, productionAuthorized=false, defaultPromoted=false, stopReason=null. Three genuine UI 1600×900 screenshots captured. The test establishes opt-in UI, real reloads, rollback and hard source gate, not a complete owner's Windows/RTX human gameplay session.
- Exact B69 real browser action log: `T21_W10B69_REAL_PREVIEW_OPT_IN_AND_RETURN` with verdict `B69_REAL_NORMAL_PREVIEW_OPT_IN_AND_RETURN_SUCCESS`. Evidence kept in the Actions artifact.
- Separate full B69 SHA 130s/180s and previous UI/source integration regression workflows were still running at this checkpoint. Historic B68 whole 180s improvement was already [fully confirmed on its own exact SHA](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39506926374); **do not use an earlier B68 SHA to claim those long sessions passed again at B69 SHA**. Ordinary CPU default remains FIXED, owner Windows session and authentic original 4v4 still HOLD.
