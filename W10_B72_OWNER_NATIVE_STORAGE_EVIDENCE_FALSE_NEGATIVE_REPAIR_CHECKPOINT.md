# W10-B72 — B70 actual native 180-second owner storage QA false-negative repair

2026-10-21 JST. QA branch `dev/t21-f4e103w-qa-infra`. Parent `8b88aa31ad25480de7763dc31186931df889b383`. Main, production Pages, frozen source and Draft PR #5 unchanged.

## Actual observed problem — no simulated gameplay failure

The previous [B70 real 180s owner capture run 39538988320](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39538988320) FAILED at its final browser checker, **after real 180-native-second completion** and a genuine browser click. The screenshot was kept, and native 20s observations reached 160s. Final post-click Chrome state in the failure log: `?t21Play=preview&t21W10B68=previewSweep`, native session restarted to `STAGING`, 25 original solids, 0 Scoreable, optional SWEEP enabled; FIXED previous 180s record in same-tab sessionStorage: `nativeSeconds=180, tick=11856, changed source cells=3615, actual CPU source shots=112, no original 4v4, officialWinner=NONE`.

The checker constructed `stored.schema=q.schema` where `q` was the **outer tab document** with schema `T21_B70_SESSION_STORAGE_ONLY_V1`, then incorrectly compared to the nested round `T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1`. This caused `T21_F3_BROWSER_B70_NATIVE_USER_CLICK_STORAGE_OR_RETURN_UNVERIFIED`. It was a **false rejection in QA serialization**, not actual gameplay, original-source 4v4, save click or browser tab navigation failure. Do not claim the prior *workflow* passed; actual outcome was FAILURE.

## B72 engineering correction

- Explicitly read and separately verify **outer sessionStorage document schema** and the nested stored FIXED round schema. Actual browser state includes independent 25 original solids / 17 Paintable / 26 NavLinks / 0 Scoreable, nonproduction flag, original 4v4 false, optional SWEEP flag true, completed FIXED 180s true native tick, seven original-floor CPU rejoin, strictly anonymous stored numeric source ink and accepted shots, no raw source Actor transform and SWEEP slot empty.
- Move the fail-closed acceptance checks to a small pure `scripts/t21-w10b72-stored-round-witness.mjs`, with separate Node24 unit tests including a fixture reconstructed from the actual B70 failed Chrome logs. Negative tests reject schema confusion, time forgery, score/production promotion, source content leak fields and untrusted browser route.
- Reuse the existing genuine 180s B70 Chrome runner for a repeat as CI. No QA time skipping, replay-as-native-run substitution, fake ink, fabricated Actor positions, new weapon, source CPU default change or cross-map synthetic route. Update the B70 preflight to execute the B72 witness-model tests **before** the expensive browser job. No extra practice mode.
- Previous actual full-run evidence still truthfully proves the FIXED native session and user click. But the repaired B72 **exact-SHA** Chrome acceptance test must itself finish before marking the end-to-end B70+B72 CI PASS.

## Original source authority / release HOLD

25 audited Rapier solids, 17 native Paintable, 26 native NavLinks, **0 Scoreable**. Original opponent paths 0/12. Original `Vss_Temple01` Banc SetActor instance transforms / active layer / eight PntSet original source object bindings unverified, `activationReady=false`. No winner, unrestricted original 4v4, CPU source default adoption, Pages production or owner Windows RTX gameplay claim.

Separate B71 local binary BYML/Zstd metadata preflight CI 2/2 PASSED at `8b88aa31`, but **no actual private Banc input** was verified and no physics/nav/scoring was authorized.
