# W10-B118 — Real native Crowd proxy before/after drift witness at original first-drop landing

Date: 2026-10-23 JST. QA branch `dev/t21-f4e103w-qa-infra`.

## Verified precursor: B117 actual browser execution — HOLD
- [B117 run #39856772443](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39856772443) **FAIL/HOLD** in actual 480-tick Chrome source trial; syntax, Vitest **18 tests**, Vite build all PASS. Artifact ID **12460630172** retained actual JSON+PNG.
- Genuine physically KeyW moved 13.761806m from tick 6 to 175; original stage solids transitioned `spawn-high-positive-z` to `first-drop-landing-positive-z`. Tick 143–150 unsupported descent observed midair; **re-grounding on original landing at tick 174** means this event is NOT proof of missing floor.
- Native fail-closed `T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT` at tick 175. The previous B116 false post-seal .065m direct-to-physical-foot comparison was corrected in B117, but the independent strict >2m Recast passive-human drift guard tripped. **Never waive its >2m fence.**

## This step changes evidence quality, not crowd authority
1. New pure helper `UndertowPhase14QRealCrowdDriftWitness.ts` computes actual original 60Hz **physical Rapier human foot**, actual original Recast `closestPoint` projection, passive HUMAN proxy position immediately **before Crowd update** (after genuine sync/teleport), and actual passive proxy **after Recast Crowd update** (before safety seal). It separates 3D and XZ displacement, original layer delta and source projection residual.
2. `UndertowPhase14QHumanCrowdAnchor.ts` records the true pre-Recast projected and proxy pose from its already-existing `syncActualPlayerFoot` and computes the witness at `sealAfterCrowdUpdate`, **before** the unchanged `postCrowdVsPhysicalHorizontalMeters > 2` fail-closed condition. When unsafe, throw the same original `T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT` error *with read-only JSON evidence attached*. Do not re-anchor, teleport a CPU, edit original NavMesh or bypass the original guard after failure.
3. `UndertowF3NativeHumanCrowd` preserves this finite witness in its read-only snapshot even when the native abort throws. The existing B116 real Chrome script saves that witness in the actual retained source-path evidence JSON and prints the measured intra-tick proxy movement.
4. 5 new unit tests distinguish actual >2m XZ drift from benign original .1m source projection, vertical 3D layer change, invalid/non-finite foot data and false collision certification. Existing 480-native-tick Chrome run remains the actual QA; **not** fake ticks or scripted position changes.
5. The dedicated existing [B116/B117/B118 GitHub Actions workflow](https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b116-genuine-forward-original-floor.yml) reruns actual Chrome KeyW and retains its screenshot/JSON with strict original 25 solids/17 Paintable/26 NavLinks/0 scoreable authority.

## Acceptance
B118 instrumentation is not fully verified until Vitest, TypeScript/Vite build, and real Chrome have executed. A run **may still legitimately fail** for true unsafe >2m Crowd drift; its bounded evidence is then the success of the diagnostic subgoal, *not* PASS for the original long route. No 4v4, CPU-contact or user-reported central-path floor certification. Keep main/Pages/PR #5 untouched.

## Verified real Chrome result — diagnosis PASS, forward traversal HOLD

- [B118 actual original-60Hz run #39858039978](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39858039978), source SHA `b182f00bcebb5e192236257c3ad0025ce1a48e62`: **completed FAILURE**, by design when the original safety fence detects genuine unsafe Crowd displacement. **5 test files / 23 Vitest tests PASS**, TypeScript + Vite build PASS.
- [B118 original evidence artifact 12459404371](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39858039978) contains actual `b116-real-forward-original-support-traverse.json`, earlier `b112-real-source-foot-walk.json`, and a real Chromium screenshot. Readback of the JSON confirms the witness was captured on the actual stopped native tick; not hypothetical unit-test values.
- Genuine KeyW, first tick 6 → actual stop tick **175**, **13.761806488m** forward. Real Rapier HUMAN is **grounded** on original `UndertowT21D:first-drop-landing-positive-z` at tick 174 and the last observed tick 175. Original high-lip → first-drop transition recorded. One midair 8+ tick unsupported-descent suspicion occurred during the physical first drop, **not proof of a missing original floor**.
- Physical Rapier HUMAN foot at failure (XYZ): `[-0.1737196147441864, 3.0249975967407225, 54.13089370727539]`.
- Original Recast closest-point projection: `[-0.1737196147441864, 3.0999999046325684, 54.13089370727539]`. Original source-projection 3D distance **0.0750023m**, below the unchanged **0.26m** limit.
- The passive HUMAN proxy **before Crowd update** was exactly the projected original source foot (`preCrowdSyncResidual3dMeters = 0`).
- **Immediately after ONE native Recast Crowd update**, the SAME passive HUMAN proxy was at **[3.1154751777648926, 6.058530330657959, -53.997154235839844]**. This is **108.1780641m horizontal** and **108.2185125m in 3D** from the pre-update passive proxy, with **+2.9585304m** vertical shift. The post-update position is on the opposite sign of the map's Z axis.
- Existing post-Crowd physical-player-to-proxy XZ **>2m** guard properly raised `T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT`, and the B116 strict native route acceptance correctly remained **HOLD**.
- [Independent B112–B115 regression run #39858039783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39858039783) at the same B118 code SHA: **completed SUCCESS**, confirming the 120 native-tick real player walk, original source authority and actual browser JSON capture are not regressed.

### Interpretation / next engineering priority

**Confirmed:** original Recast Crowd update, rather than original NavMesh projection or the physical Rapier player, displaces the passive eighth HUMAN steering proxy across the map in a single tick during/after the first-drop landing. The exact Recast cause (e.g. internal offmesh transition, cross-tile/layer binding, agent initialization or avoidance) is **not proven**; do not claim it is specifically a certain offmesh link or original missing floor. This is not permitted CPU/player teleport and is a **QA safety failure**, not a floor-hole repair.

**B119 candidate:** isolate the passive proxy's original Recast poly ref, target/path/corridor/layer and post-update transition at the moment of the real first-drop. Prefer a source-backed lifecycle safeguard **before** Recast applies any cross-map passive-agent transition, with explicit player/CPU contact limitations. Never relax 2m, 0.26m or 0.065m bounds, add guessed original geometry, or approve 4v4. Prove any corrective change with actual native Chrome and exact-source tests.

**Final B118 verdict:** Diagnostic evidence collection **PASS**, safe >2m fence **preserved and triggered**, extended 480-tick source traversal **HOLD/FAIL**, user-reported central roadway and official 4v4 **NOT certified**.
