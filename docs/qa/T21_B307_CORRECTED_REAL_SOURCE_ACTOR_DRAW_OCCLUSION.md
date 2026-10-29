# B307 — correct falsely hidden B305 actor draws

## Observed genuine native rendering failure
GitHub run 40790248263, B287 artifact 12861758399, tick 85 with 8 true shots, 315 changed owned cells and 79 actual projected owner samples. B305's old setEnabled(false) hid the B248 gear but intentionally **enabled the primitive fallback capsules**, as visible in the actual Chromium PNG. Prior 89,815 changed pixels (6.237%) and 59/79 center samples therefore do NOT measure a completely absent actor rendering. Prior empty-actor occlusion interpretation is rejected.

## Corrective B307
Preserve existing normal source B248 visibility semantics. Add a research-only setAuditDrawHidden option which prevents all primitive fallback, B248 gear, B268/B269/B292 variants and squid visual draw at once. Assert all eight actors originally draw B248 and no primitive; after hide, require all render paths off; restore the exact eight original B248 art trees and no fallback. Fail closed with a restoration attempt on inconsistent post-state. Record proof in true native Chrome A-B-A. Keep actors physically in the same world: do not change original collision, CPU, camera, owned ink, 25/17/26/0 source authority, navigation, scoreable, or production.

Prior B305 success remains a **technical execution** record only, not a certified occlusion result. This corrected scene requires new actual PNG review; ART HOLD and official original 4v4 HOLD.
