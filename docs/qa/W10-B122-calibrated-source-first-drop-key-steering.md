# W10-B122 — Real source lower-landing turn calibrated against B121 failure

2026-10-23 JST. QA-only branch `dev/t21-f4e103w-qa-infra`.

## Proven previous outcome
[B121 native Chrome #39901153862](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39901153862): **4 files/19 tests + Vite PASS**; actual native steering **FAIL/HOLD**. Its real Chromium artifact 12479415384 was read. Five phases: W200 ended tick210 on original lower landing with **2.5824m** clearance; D12 tick222 KeyD physical X +.56324m still inside 1.8667m clearance; W16 observed tick240 at .99488m clearance; A24 observed tick264 physical X -1.60325m still inside 2.03256m clearance; last W28 observed tick294 **8.3256cm OUTSIDE** original lower slab, despite KCC grounded and edge ray grazing the source. Thus literal CDP W/A/D worked and the observed problem was the trajectory exiting the original registered source—not a missing interior floor.

No separately registered reachable next source, human↔CPU collision, or 4v4 was proven.

## Corrected genuine source test
The **existing** native Chrome script has a new explicit B122 opt-in, preserving B121 and previous 120-tick/240-tick modes. Its 266 expected genuine Rapier physics ticks use five independently measured CDP keyboard segments: **W200 → D12 → W18 → A16 → W20**. The only adjustments are **8 fewer A ticks** and **8 fewer final W ticks**, plus 2 more internal W ticks, based on the actual B121 source XZ positions. These are real key presses, not setPosition, guessed intermediate pose, synthetic physics ticks, new source geometry or moves of the seven CPU bodies.

**Acceptance gate:** full five real keyboard phases and >.2m signed KeyD+X and KeyA-X displacement; each of 4 genuine lower-landing phase endpoints on named original `UndertowT21D:first-drop-landing-positive-z` and genuinely KCC grounded/inside original footprint; final original source registered point and five original Rapier rays with real KCC grounded; **>=.35m inside exact original footprint**; no native stop and only the expected natural one high→low falling suspicion. Preserve actual source array **25 solids / 17 paint / 26 links / 0 score** and frozen main, Pages, PR #5.

Store `b122-real-revised-original-steering.json`, complete real phase start/end poses, actual source edge clearance and earlier missing-floor suspicions, real Chromium screenshot. A PASS is **only** a reproducible bounded steer across the existing first-drop landing; it NEVER implies a physical crossing to the different elevated right-low 4.5m source, safe center road, 0/12 crossing approval, legitimate CPU collision safety or full 4v4. If fail, archive poses and use them for the next safer physically steerable route experiment.

Run: [B122 GitHub Actions](https://github.com/ryomashibaba/browser-ink-tps/actions/workflows/t21-w10b122-native-first-drop-revised-steering.yml).
