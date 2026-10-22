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
