# B291 — Genuine source ink confirmation clear of player reticle

2026-10-28 JST. Protected QA branch only.

B290's actual WebGL2 screenshot at native tick 89 reveals a real B23 ink-confirmation capsule directly beneath the center crosshair, over the crowded actor/paint area. This is one of several serious problems in the same scene: three close player/ally figures dominate the screen, the grey floor looks unfinished, original-source ink is hard to recognize, and optical geometry lacks a coherent stage silhouette. B258 REAR_WIDE and ELEVATED_RIGHT already failed art review; do not recycle them as a solution.

This bounded player-facing B291 correction places the truthful B23 ink/bomb notice just below the top round panel, with CSS `top:clamp(108px,16vh,144px)`, away from the aim center. The unchanged existing B287/B289 genuinely keyboard-and-mouse driven Chromium workflow checks a real paint-positive source frame and a >=60px unobstructed vertical gap between the notice and crosshair, and saves the measured browser DOM geometry. No new workflow is added. This patch does not edit event meaning, paint ownership, camera, actors, original solids, NavMesh, score or clock. Full browser TECH PASS and human visual review are **pending until the new CI and screenshots are inspected**.

B291's major remaining phase is render-only character and original-source stage-foreground redesign with native same-frame comparisons and legitimate in-play ink visibility. Merely moving the notification is not the broader game-art solution. Preserve Rapier25/Paint17/Nav26/Score0, opponent crossing0/12, draft PR#5, ART HOLD, 4v4 HOLD, no production/main/Pages changes.
