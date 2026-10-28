# B303 — genuine native Team A painted-cell framebuffer contribution audit

## B302 result that motivates this gate
The actual B302 Chromium A→DEEP→BRIGHT→A genuine screenshot series, run [40777395864](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40777395864), B287 smoke SUCCESS (artifact 12855619017), at native tick 94, with 9 real shots and 361 original owned cells on original authority 25/17/26/0, showed:
- DEEP changed 2,702 / 1,440,000 actual pixels (0.1876389%), bbox x767..857/y448..517.
- BRIGHT also changed 2,702 / 1,440,000 pixels (0.1876389%), same bbox.
- 44 / 91 genuine B293 source-owner projections have a changed **exact-center pixel** for either candidate, 62 / 91 within 5 screen pixels.
- A restored screenshot SHA256 equals A original `cb8d8636a00938ab3ff5f73db0dc4e1e319c5879bcc6467f7a8c142b69975e41` exactly.
- Therefore there *is* real rendered Team A ink color influence at many source-owned projections, but it occupies <0.2% of the overall framebuffer, invisible at ordinary gameplay composition scale. No demonstrated useful stage-wide improvement, **ART REJECT for B302 color alternatives**. Keep default original.

## The new B303 check
The B303 utility independently decodes actual screenshot PNG IDAT pixels (PNG RGB/RGBA, 8-bit no-interlace, standard PNG filters), checks exact A/A2 SHA256 identity, measures changed pixels and bbox, and counts genuine owner-cell centers and radius-5 samples near changed pixels. This is run by the actual B287 Chromium native renderer against saved genuine A/B/C/A PNG bytes. No ownership, atlas, actor or stage mutations; synthetic decoder-unit fixtures can never count as actual game play. B303's metrics are **not themselves an ART PASS**, since camera depth and accurate player/camera visibility still require visual judgment.

## Subsequent direction
Prioritize actual screen composition and spatial distribution of real playable painted ink, not further small team-color palette changes. Investigate an explicitly isolated *genuine-input camera/framing* comparison to find whether original painted pixels can be made visible without inventing geometry/paint, and separately preserve unverified original F3L optical asset boundaries. Maintain ART HOLD for overall game and FULL MATCH HOLD.
