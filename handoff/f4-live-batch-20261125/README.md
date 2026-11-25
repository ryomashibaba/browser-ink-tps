# V28 F4 consolidated Windows patch batch
Immutable Windows source share 4142f0b41b17ed6afa87b0f95ad5d77ead259daa. Combines the five source patches up through 2ee1b8f40e915de05cf902b27e10529f6312b488; use this combined patch INSTEAD of applying the five individually. No actual Windows files changed by Chat. Never reset/stash or replace dirty work. At the Windows repo root, first inspect current diff and run git apply --check <f4-live-batch.patch>. If it fails because newer local work exists, do not force; selectively reconcile exact hunks. If it passes, git apply <f4-live-batch.patch>. Then run targeted TypeScript/build and a short real Chrome probe: special+normal input exclusivity, barrier shell and wave visual, actual HP-loss cue, local combat candidate telemetry, Zip geometry audit. Run 180s only after integration and relevant short checks; not needed to prove every isolated patch. Score/winner/natural activation and original Zipcaster remain HOLD. No new score surface, collider or HP injection. 
All 5 patches were parsed and old-side contexts verified against 11 exact shared files; 57 edit blocks are disjoint, merged into 44 hunks, with independent in-memory replay equality. This is not native git apply, tsc, Chrome, Rapier or real Windows testing. Source patches:
- handoff/f4-live-input-exclusivity-20261125/f4-live-input-exclusivity.patch
- handoff/f4-zip-live-geometry-20261125/f4-zip-live-geometry.patch
- handoff/f4-certified-raster-20261125/f4-certified-raster.patch
- handoff/f4-live-local-combat-candidates-20261125/f4-live-local-combat-candidates.patch
- handoff/f4-live-feedback-20261125/f4-live-feedback.patch

Shared source blobs and counts:
- src/app/B379NativePlayerWeaponMobility.ts 81beb811fa9d96b0b7813858fe2adc1b97bda6d4 (1 hunks)
- src/app/CompactF4Hud.d.mts 2ae0e412f955da470c8bbe83c44a190a152851a0 (1 hunks)
- src/app/CompactF4Hud.mjs c4d15a1e2a0e7869fb918c0c756b51d7d2d46ee6 (1 hunks)
- src/app/UndertowF3PlayablePreviewApp.ts 22f4dcc8e8d6521ea2e1041aa2a31adc33c3dfcd (7 hunks)
- src/app/UndertowF3SourceTraffic.ts c5ff1c8f8279b727b8781080bbbbb9cf87ca7271 (7 hunks)
- src/ink/GameplayInkSystem.ts 4648b556c3345f8a70149ed7772215be72d443f6 (7 hunks)
- src/physics/RapierStagePhysics.ts fc3bd625a358368486fb8bc8622f77967640c1b3 (1 hunks)
- src/player/PlayerController.ts 26e528a9216f0487fe07ee9b4727ec2daf8befb5 (1 hunks)
- src/projectile/ProjectileSystem.ts 6c2e0ef10e17b7412d2f92bcd2b5f82ca0f59571 (6 hunks)
- src/special/F4SpecialRuntime.ts 1c00f2d366186c98cec5b9cafd55aef600b9d3de (11 hunks)
- src/special/f4/shared-special-score720-20261125/shared-special-score720.d.mts 2a7876bb7374615f7113077d936fb3d58eee3965 (1 hunks)