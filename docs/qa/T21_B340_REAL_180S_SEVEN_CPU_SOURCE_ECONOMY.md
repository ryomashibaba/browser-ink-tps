# T21 B340 — genuine native 180s CPU shot/paint/economy analysis

2026-10-30 JST. Branch: `dev/t21-f4e103w-qa-infra`.
Read-only source telemetry, **no gameplay AI changes**. Existing B335 original
driver and B335/B336 historical evidence remain byte-for-byte unchanged.

## Verified predecessor

B338 and B339 genuine [CI #40975291177](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40975291177):
native real WASD, source floor, player ink and F8/PLAYER QA pass.
Actual B339 early CPU 99 native ticks: 12 CPU source shot requests,
507 actual CPU impact changed cells, six of seven CPUs recorded a shot
request, seven recorded owner-grid changes. Per-actor shot requests and
per-actor changed owner cells need not coincide. No full opponent route pass.

B335 original 180s source accepted CPU changed ink per 30-second interval:
10692, 427, 493, 14, 83, 64; source cause **unknown** because CPU
shot requests, impact changes and individual source owner changes were
not collected for the same late time windows.

## B340 actual native pipeline

A separate full 180s Chromium source round runs unchanged B335
user-selected UI steps, WebGL2, PlayCanvas, 60Hz native clock, 7 actual CPUs,
real pointer lock and source physical stage. Uses distinct ports/output
directory and **preserves existing B335 driver**. Every 30s milestone
records actual per-CPU weapon request counters; actual actor-attributed
accepted `PaintCoordinator` source ink (foot and impact distinguished);
global source CPU impact changed cells, total changed cells, true native
feet and environment sight/resources/aim/backfill signals. The
independent B340 auditor first requires the original B335 native 180s
time/physics/authority proof, then rejects missing or nonmonotonic
counters, extra actors, false owner grid, stage modifications and synthetic
ammo/foot changes.

**Boundary:** A rise or decline in shot requests is not proof of
AI intention, projectile hit, shot→paint causality, or all-stage route.
Impact changes are not unique turf and no official score/winner is
generated. Even if a no-shot or shot-but-no-impact interval is detected,
the root cause remains an experiment target, not a certified diagnosis.

The B340 180s browser job is expensive and is triggered only when
the dedicated B340 scripts/workflow change or explicitly via workflow
dispatch; it is not added to routine B336 short QA.
TIME_UP must genuinely occur; a runner timeout or failure remains HOLD.
CI artifact includes seven actual checkpoint JSON snapshots, independent
verdict and 1600x900 browser screenshots at start/mid/end.

### After measured data

If late requests vanish: inspect native resource/weapon gating, target
selection and real actor feet. If requests remain but painted impacts vanish:
inspect actual original owner saturation, target stage blockers and active
17 surfaces. Only then compare a source-only opt-in policy with unchanged
FIXED baseline on genuinely comparable browser runs.

ART HOLD, GAMEPLAY HOLD, original underpass paths 0/12,
unrestricted 4v4 HOLD, production HOLD. Do not modify main, T20, Pages,
existing Draft PR #5, source colliders, 17 surfaces or NavLinks.
