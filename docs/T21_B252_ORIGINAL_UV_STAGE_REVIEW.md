# T21 B252 — Six-view original Temple01 source fidelity review

2026-10-27 JST. Nonproduction candidate only. Regular SOURCE preview, main, T20, public Pages and Draft PR #5 remain unchanged.

[Real Chromium/WebGL2 source CI run](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40495107504), artifact ID `12730378159`: `b252-six-view-source-fidelity.json` plus 18 captured 1600×900 screenshots.

SHA-pinned original static Temple01 model: **57,578 triangles, 54 material groups, 19 original albedo images**. The source OBJ, MTL, original texture PNGs and generated binary assets are temporary CI inputs and are not distributed.

Six views captured as original UV → same-view flat → original UV restored: Central 49.33% changed pixels; Team A 23.73%; Team B 23.78%; top-down 26.30%; Gap A 73.63%; Gap B 73.42%. All six original UV restorations passed. These percentages measure appearance difference, **not** a numerical artistic-quality score.

Original UV significantly improves floor paving, metallic surfaces, cladding and stage readability over earlier arbitrary B250/B251 material adjustments. However, massive untextured pillars, background discontinuity and original actor instances with unknown Banc/BYML placement persist. The static geometry does not certify any collision or playable original actor.

Security/authority: **25 physical solids / 17 paintable / 26 links / 0 scoreable**, actor relocation 0, certified opposite routes 0/12, original official 4v4 HOLD, no original winner. Large central unverified route gap remains ~31.716 m. The Linux CI browser screenshot is not an RTX FPS benchmark.

**B252 decision:** genuine 3D+UV visual-review technical PASS; playable game art acceptance HOLD. B253 should prioritize source-proven actor placement inventory, then opt-in genuine gameplay co-rendering with verified static UV textures when the local asset package is available. Never infer collision, teleport enemies, upload raw game assets or default to occluding the certified gameplay world.
