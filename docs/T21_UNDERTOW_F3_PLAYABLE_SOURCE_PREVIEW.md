# T21 F3 — Opt-in playable source-grounded preview (NOT released)

URL in local Vite: `/?t21Play=preview`. Requires browser WebGL2.
Default URL still runs frozen T20. Stage review and Phase14I/P QA URLs unchanged.

## Delivered integrated candidate
- Real PlayCanvas scene + directional lighting of the actual **25 frozen T21-D solids**, 17 exact original-source gameplay paint surfaces and 26 unchanged one-way links.
- Rendered GPU ink atlas and the existing `PlayerInput`, `ThirdPersonCamera`, `PlayerController` (Rapier KCC), `ProjectileSystem`, seven authentic `CpuAgentSystem` agents and a shared physical HUMAN/CPU Rapier actor world.
- Eighth actual human occupies the fourth distinct original-source Team-A high-spawn slot. No passive human Crowd proxy in free-jump preview, preventing unsupported airborne NavMesh proxy assertions; CPU↔human physical veto is still active.
- Native original first-drop source links, phased per-side departure, source FloorConcrete03 ramp egress. Real CPU *poses are never teleported* as route fixes.
- Player controls: click to pointer-lock; WASD, mouse look, Space jump, Shift squid, left-click shoot. Esc releases pointer; P pause. Reset reloads F3 sandbox and intentionally restores the original actor state.
- F2 strict recorded evidence at prior HEAD: 7/7 actual CPU falls/rejoins by frame 1056; the F3 interactive branch must be checked separately in Chrome.

## Evidence vs authority
- **NOT** a promoted production Undertow map, approved visual freeze, finalized collision for excluded upper-glass strips, solved full-stage NavMesh, final kill threshold or Turf-scoring map.
- Source 17 paintable surfaces remain **0 scoreable**: visible ink can function without inventing Turf victory rules. An interactive source preview is not equivalent to a normal 4v4 match.
- PlayerController's free movement may expose genuinely unsupported source boundaries. Such a state FAILS CLOSED with a visible stopped session and no automatic fabricated collision/nav patch.
- T20 remains default and PR #5 must stay Draft/unmerged until all authoritative blockers are resolved.

## Next macro integration gate (F3B)
1. Actual Chrome WebGL2 screen and real keyboard/mouse movement/painting.
2. Seven source-drop/rejoin progression under a moving human; physical collision must not be bypassed. Record any safe-stop as failure, not a gameplay PASS.
3. Visual source completeness + 17-floor/ramp paint rendering review. No invented walls, roofs, score regions or offmesh links.
4. Only after gated source proof, extend player combat, CPU tactics, subs and full match flow. No broad bypass of the source authority freeze.

## F3 original reviewed optical-only structure layer
- 38 existing original source components: Phase7 side/glass frames 20, Phase8 central/flank towers/supports 12, Phase12I original large pillar surface components 6. All are static original vertices and triangle winding, with separate translucent materials.
- Source-original optical triangles are NOT invisible physical walls or walkable floor/caps. GPU-only mesh overlay can be turned off by the play HUD. It adds zero collision, paint, navigation or win-score surfaces.
- The original 25 frozen physical solids and 17 source paint surfaces are unchanged.

## Fast-track CI
- Default PR CI checks browser boot, genuine trusted input, player movement, shots, source non-scoring invariants, a PlayCanvas framebuffer and 38 original optical source pieces; it does NOT claim CPU 7/7 in the browser.
- Optional manual Action workflow_dispatch input `long_cpu=true` attempts a real rendered Chrome 7/7 CPU recovery proof (strict pass/fail, reports progress at 120 actual ticks). Previous Chrome long run timed out in heavy headless SwiftShader; it is NOT a successful unrestricted 4v4 proof.

## F3B confirmed 2026-10-11: real browser integration vs obstructed lane
- Native full eight-body isolated F3 director Vitest: 7/7 original first-drops and real Rapier-to-Crowd rejoin, all by 1,056 simulation frames, maximum ground step ~0.073337 m/tick, minimum same-level actor separation ~0.611 m, no overlap, no safety stop, no physical CPU relocation; 600/600 tests.
- Native **Chrome WebGL2** PlayCanvas scene (branch revision `babcba0f907e74dd3e2fbe2b13b0650270b50588`, PR workflow [38104333967](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38104333967)): real keyboard W movement, mouse projectile shooting, real keyboard S retreat, and then precisely the same native per-tick physics code through explicit gated QA clock. 7/7 authentic original Recast offmesh + Rapier first drops and 7/7 lower-layer Crowd rejoins by scene tick 1,121; `freeCombatEnabled=true`, `realSourcePhysicalCpuTeleports=0`, `scoreablePromotions=0`. Three Chrome framebuffer screenshots + full JSON state are stored as workflow artifact.
- Negative human traffic observation, workflow [38104207233](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38104207233): W-only mouse/keyboard QA left the real human stationary in the narrow A3 upper departure lane; authentic Rapier veto prevented A3 and dependent A2 from passing. This was **5/7, NOT a pass**; no collision was bypassed. Source-backed physical player retreat restores 7/7 without fabricating geometry/steering.
- A stationary blocking human can legitimately impede staging. F3B does not claim human-aware free-running dynamic 4v4 avoidance; designing native-NavMesh high-pad CPU diversion around a physically blocking player is F3C follow-up.
- F3B session controller: source-native staged descent then 180-second non-scored combat preview, HP 0 collider exit / same original human source spawn respawn after 150 physics ticks, pausable visible progress. This is **not** authorized Turf score/winner nor unrestricted human/CPU match. T20 production unchanged, PR #5 remains Draft.
- After this one-time full Chrome physical proof, regular PR CI is restored to short real browser keyboard/mouse/renderer smoke (fast). To repeat expensive full F3B browser physical proof manually, dispatch the F3 browser workflow with `long_cpu=true`; never silently conflate short smoke with seven-CPU certification.

## F3C source-correct playable milestone (2026-10-11)

**Exact native Chrome proof:** [Action run 38105747430](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38105747430), F3C code commit `11cfec87189d322932f193ef8e1f082abd881d14`. 7/7 native 60Hz Recast/Rapier CPU first-drops and lower Crowd rejoins while real keyboard W leaves the HUMAN physically stationary in the obstructing positive-Z high lane (human x=0.017, foot Z=65.419), no retreat, no unapproved collision bypass, no CPU physical teleports. All seven rejoined by Chrome tick <=1084; `freeCombatEnabled=true`. This was a genuine reproducible 5/7 regression on F3B without an eighth source-supported human Crowd neighbour; now fixed.

**Source-only human avoidance:** `UndertowF3NativeHumanCrowd` maintains one passive Recast neighbour snapped to the REAL human Rapier foot while within <=0.22 m of original NavMesh and normal fixed-step movement. During jump, unsupportable geometry or after explicit physical respawn it removes the passive agent and revalidates on subsequent ticks. Any Crowd-only teleport is a navigation representation, never human/CPU Rapier relocation. T20 path unchanged.

**Actual CPU paint, zero Turf authority:** CPU previously required `Paintable | Scoreable` before even queuing ink. The frozen Undertow source deliberately has 17 `Paintable` but **0 Scoreable** surfaces. F3C source-only CPU option now accepts `Paintable` while changing NO surface flags, score weights, original mesh/collision or Turf result. Chrome proof records **245 genuine CPU paint requests** within the first ~7.6 s after free combat, `sourceScoreablePromotions=0`, `stopReason=null`, `matchState=PLAYING`. CPU shots were **0** in this distant-spawn scenario; neither enemy-contact combat nor unrestricted physical 4v4 is certified.

**New screen:** F3 source radar shows only genuine 25 original frozen collision-solid **bounding envelopes** (not exact walkable polygon silhouettes), 26 original navigation-link count, original first-drop endpoints and live physical human/CPU coordinates with altitude-aware lower-layer accents. Overlay is purely read-only; it claims no traversal topology or new source authority. Original 38 optical structural meshes and working keyboard/mouse WebGL2 remain.

**Evidence:** Chrome workflow artifact `t21-f3-playable-actual-browser` includes JSON + `F3_0_SOURCE_STAGE.png`, `F3_1_REAL_INPUT_AND_INK.png`, `F3_2_REAL_SEVEN_CPU_FREE_COMBAT.png`. Both the entire integrated TypeScript/Vitest suite and all 7 Chrome/fast-feedback workflows passed at the F3C physical paint commit. Routine PR Chrome check returns to short real keyboard/mouse smoke for development throughput. Expensive full native 7/7 plus 245+ paint proof may be rerun manually via F3 workflow `long_cpu=true` (with `T21_F3_BLOCKED_HUMAN=1` to reproduce obstruction).

**Next macro F3D**: source-supported central travel and encounters using only evidence-backed topology; native CPU paint and fire against actual nearby enemy bodies, CPU close-range target and collision; refine stage lighting/readability from frozen optical structures. Keep unknown central/underpass transitions, exterior kill threshold, score masks, actual 4v4 match validation and production activation on HOLD, not silently completed.

## F3D native lower-source patrol, Chrome WebGL2 verified (2026-10-11)

**Problem addressed:** After real F3C seven-CPU physical first-drop recovery, original `CpuTacticalDirector` had zero authoritative tacticalNodes and the generic anchor/skirmisher goals referred to distant unbound center Y0.12 or an opponent spawn. Native Recast nearest-point could legally hold on a disconnected island indefinitely. A false "combat enabled" indicator did not mean moving or fighting.

**F3D fix:** `CpuQaSourceGoalAuthority` is injected exclusively through `CpuAgentSystem.useF3dOriginalSourceGoals` under the Undertow T21-D immutable stage+real shared Rapier authority. `UndertowF3SourceTraffic` derives **source-only** patrol targets from 17 existing frozen paint-surface origins, the original first-drop landings and the original `right-low-ramp-*` probe endpoints. Every target is gated by the actual generated Recast path from the lower landing, projected within 0.22 m of original surface, source-local physical layer 2.7–5.25 m and same side of the source gap (|Z| >=33 m). The native target is revalidated from the actual current moving CPU foot before each tactical retarget; the real CPU never teleports. An active target persists until a physical foot arrives or a path audit fails. Unbound underpass, void threshold and score mask are unchanged. F3D suppresses otherwise unvalidated tactical Super Jumps only in this QA mode; T20 remains unaffected.

**F3D real browser proof:** [Github Actions #38106485301](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38106485301) on branch commit `d75da90c050a7651f3b6ffdb27d5f9b589db8822` (PR merge SHA in log differs). Native Chrome WebGL2 + real keyboard and mouse + 60 Hz Rapier/Recast QA loop, with HUMAN left at physical departure lane:
- 7/7 original-source first-drop KCC descents and native lower Crowd rejoins, `realSourcePhysicalCpuTeleports=0`; zero unsafe collision/stops.
- 42 original source-grounded patrol candidates, 192 real source-goal requests, aggregate post-rejoin physical CPU travel **190.575 m** (measured in the bounded QA window, not one bot, speed, or path length), seven actual active audited radar goal rings.
- 244 real CPU paint requests in the same session, `sourceScoreablePromotions=0`, no Turf points/winner. Session remains `PLAYING`, about 172.3 seconds on preview clock.
- 0 CPU shots, 0 CPU splats in this scenario. Both teams are STILL separated by source topology gaps. Do NOT claim cross-team fighting, source-authorized unrestricted 4v4, or full-original stage geometry.
- Actual screenshot PNGs and machine-readable state evidence are preserved in the `t21-f3-playable-actual-browser` artifact from the run.

**F3D independent Rapier/Recast integration:** [Actions #38106325266](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38106325266) passed full 602 Vitest and TypeScript checks, including two original-source 8-body scenarios with stationary and briefly moving HUMAN. Both achieve 7/7 at frame 1056 then continue 360 native ticks: 42 candidates, 149 and 152 m aggregate CPU patrol travel, 149 native goal requests, min actor clearance about 0.60 m and no unauthorized cross-underpass target. The camera HUD and cartographic map now display 7 audited native active goals but NEVER draw guessed connecting roads.

**Development speed:** one-time long Chrome source patrol/paint certification has been recorded. PR workflows revert to fast real keyboard/mouse Chrome smoke, with manual `workflow_dispatch` inputs `long_cpu=true`, `blocked_human=true` only when re-proving full 7/7 or route changes. T20 production and PR#5 Draft/open remain frozen.

**F3E macro next:** The only honest path to real midstage 4v4 engagements is gathering *new original source evidence* for the 4 unresolved walk continuity gaps per side. Until that happens, prioritize playable movement, projectile-hit QA inside genuinely connected subregions, high-impact true-source stage visual finish and rapid asset-production, never non-source bridge creation or score-mask promotion.

## F3E structural coverage fast-track: original Temple01 3D architecture

Original T21 partial stage contained only 25 freeze-authorized Rapier solids and the 38 separately displayed F3 original optical structures. The source archive ALREADY held independently audited large original static meshes that had never appeared in the playable WebGL2 view. F3E renders the original source-owned triangle coordinates rather than inventing floor polygons or guessing a full traversable map.

`UndertowF3EOriginalSourceCoverage.ts` collects source-pinned complete original OBJ components in one pass from existing Pass18C and Phases1/4/6/9/12C/12D/12K data: native review/supplement, Phase1 broad ground, static batch2, original flank elevations, broad paired concrete plates, high seal panels, original underfaces and original decorative wall/pillar/detail subsets. Eight FldObj PntSet components are **excluded** because their in-world actor placement was never source-authorized. Exact source IDs are deduplicated. All vertices, triangle windings and Y are unchanged; 7 transparent color-coded source-type GPU batches reduce render overhead versus one draw call per component. A separate panel button toggles reference terrain, which is labeled as **SOURCE STUDY (NO GAME COLLISION)**. This is not a false game-playable connection.

The preview continues to use exactly the same frozen 25 real Rapier collision solids, 17 unscored paint surfaces and 26 native Recast links. Never call these extra rendering-only source fragments walkable floors, collision objects, paint surfaces, score weights or authorized stage completion. T20 production and the Draft T21 PR remain unmodified. Geometry freeze and preview screenshot tests remain enforced.

F3E forward emphasis: seek original evidence to permit genuine floor/collider/navigation promotion, in bulk rather than repetitive microscopic QA. Until then, keep structural overlay as clearly distinct provenance-only optical reference. Avoid pretending enemy teams can cross the still-unbound central source gap.
