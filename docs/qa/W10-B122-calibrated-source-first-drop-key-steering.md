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

## Final exact-source actual Chrome result — B122 limited PASS

[Actions #39903255933](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39903255933) on source SHA `df842fc7847f12b1fa9d8e234244a8b213eef636` **COMPLETED SUCCESS**. 4 test files / **19/19 Vitest PASS**, TypeScript/Vite build PASS, real headless Chromium + original native Rapier keyboard trajectory PASS; no real stop.

[Actual archived CI artifact 12479417616](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39903255933): `b122-real-revised-original-steering.json`, `b116-real-forward-original-support-traverse.json`, `b112-real-source-foot-walk.json`, real Chrome screenshot. Direct readback confirms the following original native 60Hz observations:
- True native first tick **6** → final tick **282** (266 nominal KeyW/D/A frame requests, native polling phase overshoot preserved). Real forward progress **20.21392822265625m**, original `spawn-high-positive-z` then named real `first-drop-landing-positive-z`.
- **W200** phase real ticks 6→210, last body `[-.17362274,3.89661169,51.17302322]`, landing polygon inside, source clearance **2.5824m**.
- **D12** phase tick 210→222, body `[.38961589,3.89510107,50.69601822]`, true horizontal X delta **+.5632386m**; clearance **1.8667m**, original KCC grounded.
- **W18** phase tick 222→240, body `[.86075509,3.89499950,49.67649841]`, clearance **.99488m**, KCC grounded.
- **A16** phase tick 240→258, body `[-.22254458,3.89490724,49.19999695]`, true horizontal X delta **−1.0832997m**, clearance **1.7578m**, original KCC grounded.
- **W20** phase tick 258→282, final original body `[-.69904470,3.89819384,47.67877197]`, inside registered original first-drop XZ slab by **.6857736m**, KCC genuinely grounded on the **same** original named lower landing.
- All four phase endpoints AFTER first landing remained grounded and on registered original lower floor; no recurrent native Recast 108m jump, no native safety stop. Existing natural high→low midair unsupported-descent suspicion **1** retained, not certified as a floor hole.
- Passive extra eighth HUMAN Crowd avoidance agent was conservatively withheld on the original lower landing for **109 measured native ticks**; CPU↔HUMAN avoidance interaction at this landing is therefore NOT certified. Existing 7 CPU physical agents, collision veto, immutable 25/17/26/0 and main/Pages remain unchanged by the B122 test.

**B122 CERTIFIED only as limited original lower-landing genuine keyboard steering, not next separate original source, original central lane, first/last floor continuity, unrestricted 4v4 or legitimate human–CPU contact.** No new source solid, ramp, NavLink, scoreable mask or teleport added. Next B123 should compare an actually reachable neighbouring source height/geometry and genuine W+D steering without assuming the elevated `right-low-team-a` floor (Y=4.5) is directly walkable from lower landing Y=3.0.
