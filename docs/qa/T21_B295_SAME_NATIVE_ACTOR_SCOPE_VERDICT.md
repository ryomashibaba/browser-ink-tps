# B295 — genuine native B292 art-region attribution and development priority
**2026-10-28 JST · B295 evidence-only postmortem, not a new actor variant or gameplay feature**

B292 genuine Chromium [B75 run 40704492050](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40704492050), evidence artifact [12823203308](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40704492050/artifacts/12823203308). The actual native 1600×900 fixed post-input frame was at tick85, with 8 genuine shots and 315 actual human-changed cells. A=B248 original, D=B292 flow, then A returned after true native world stayed frozen. Byte-identical baseline restoration is independently confirmed by SHA256 `cff7fbca874e710fbd0bd0e3c9d218d9dd7c4af28a2bea3ef94a923869459072`. Flow screenshot `2ab020d9fbf3d61ef205d52a35c2015691173206398dd792b0b3a57ef80cabb8`. No new physics/UV/ink/world action from the visual toggle.

## Matched-native-frame quantitative evidence
Using Pillow RGB and NumPy, count any pixel whose maximum RGB absolute channel differs from matched A as `changed`. Per-run only; never cross-reference a different native tick as a pixel-perfect baseline.

| Crop in 1600x900 | Changed / crop pixels | Fraction of crop |
|---|---:|---:|
| Full screen | 81,270 / 1,440,000 | 5.6437% |
| Near-field actors x560..1049, y395..779 | 75,477 / 188,650 | 40.0090% |
| Aim and paint neighborhood x700..899, y385..519 | 14,622 / 27,000 | 54.1556% |
| Upper stage x360..1299, y145..389 | 154 / 230,300 | 0.0669% |
| Floor left beyond actors x0..529, y490..889 | 218 / 212,000 | 0.1028% |
| Floor right beyond actors x1060..1279, y490..789 | 0 / 66,000 | 0% |

**92.8719%** (75,477 / 81,270) of changed pixels lie inside the near-field actor crop; 5,793 outside. This does **not** mean the 5,793 outside pixels are original stage improvements: a moving silhouette may extend beyond the chosen crop, and antialiasing/microdifferences can change nearby regions. The upper original source stage differs by only 154 pixels; there is no measurable wholesale stage-art upgrade. Exact baseline restoration eliminates leftover visual state as an explanation.

## Verdict and next discriminating work
B292 is **TECH PASS / ART REJECT**; no adoption, no return to primitive character-style iteration as primary strategy. This independent actual-frame evidence agrees with B268/B269/B270 failures: actor-only work cannot repair unregistered original architecture/gray foreground or the tiny visible owned-ink region.

B293 genuine read-only owner projection and B294 actual shader uniform/texture-binding checks are now the prerequisite to determining the next visual fault. Unlike the previous invalid gate, B293 permits real native play with **no optional F3L source UV overlay**. Even after B294 passes, correct uniform references do not prove actual colored pixels or overcome the GLASS/METAL/DETAIL optical stack previously observed by B263/B264. Next visual proof should compare source registration and projected real ink against actual raster in a same-camera source research context, without fake paint, extra score or reauthored source geometry.

**Safety:** main, T20, Pages and PR5 unchanged; original Rapier25/Paint17/Nav26/Score0; CPU source path natural opponent crossings0/12; ART HOLD, unrestricted 4v4 HOLD, production forbidden. See sibling JSON for reproducible ROIs and SHA.
