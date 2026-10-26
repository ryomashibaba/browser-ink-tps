# W10-B227 — correct next step: physical source floor versus actual Recast navigation

Baseline 2026-10-26 JST, previous source HEAD `99ae90900cc3f8ecbdd331c1226aee0d8fd0c127`.

**Previous success:** B224 real keyboard (four mirrored jump landings), B225 consecutive source floor chain with 0 airborne second-leg ticks, and B226 mirrored inner-slope with 0 airborne third-leg ticks all passed real Chromium on **isolated original-source** faces. The actual playable runtime still has **25 solids, 17 paint surfaces, 26 nav links, zero scoreable surfaces**; all five extra CI688 source components per side remain forensic QA-only.

**What we must NOT repeat:** CI #691 inserted all 5+5 source solids and still failed Recast endpoint (31.716227m). Pass 18BH–18CA already investigated Recast grid phase/erosion/proxy and false nearest-poly identities; blanket Recast tuning, source-ground fabrication, or radius-inflated synthetic off-mesh links are not a valid next move.

**New B227 question:** At the *exact positions visited successfully by the genuine human KCC in B226*, compare:
1. Original 25-solid Rapier collider source support;
2. 30-solid isolated native Rapier + five exact CI688 faces per side;
3. Original 25-solid Recast native closest projection / true direct query; and
4. 30-solid isolated native Recast with only the same-side five exact original source faces navigation-enabled.

For each side we inspect original FloorConcrete01 → outer Slope00 → FloorConcrete02 → inner Slope00, plus a candidate nearby original underpass connector point. NavMesh paths are evaluated only if both original endpoints directly snap within 0.30m, and a native path is explicitly **not** physical KCC certification. The original frozen navigation settings and all 26 links are unchanged; the 30-solid experiment exists in Vitest memory only.

**Pass/fail interpretation:** A successful test proves only factual matched instrumentation and unaltered authority. Record any failed Recast build, failed direct projection, distant snap or wrong original physical support as a BLOCKER, not as a fabricated positive. Only after this actual native witness will we select a minimal next integration check for B228. No production/CPU changes or new user steps.
