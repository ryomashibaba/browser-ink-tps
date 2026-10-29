# Browser Ink TPS — B339 native CPU activity root-cause frontier

**2026-10-30 JST.** QA-only, no gameplay/collision changes.

## Proven before B339

B335 genuine [180-second CI #40878994476](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40878994476), exact saved original B336 SHA-verified.
Real cumulative CPU changed-paint deltas per successive 30s:
**10,692 / 427 / 493 / 14 / 83 / 64**.
Total changed cells 11,773; first 30s comprise **90.82%** of this sum.
Repainting is included; the data do NOT identify unique area, a score or official winner.

**The cause cannot be deduced from these seven stored B335 checkpoints.**
B335 did not save 30s CPU shot counts, per-CPU ammo/rest,
exact change target selection, surface saturation or continuous trajectories.
It is incorrect to declare "CPU stops shooting" from paint count alone.

## B339 delivered bounded measurement

The B337 short *actual Chromium* native player+7CPU runner now samples,
in the SAME source-only world, the real `cpuSourceTurfShots`,
`cpuSourceTurfShotsByActor`, `cpuImpactInkCellsChanged` and the
B154 `PaintCoordinator` accepted original-owner changes for A1–A3/B1–B4.
No additional native physics ticks, artificial shots, ink, collision or teleport.
The B339 independent auditor requires the already-PASS B337 real input
witness, original source invariant 25/17/26/0, immutable seven actor IDs,
safe owner counters, monotonic real per-actor shot/change counters,
and separately reports early native metrics and the saved late 180s baseline.
It never upgrades short-run early evidence into late-run causal evidence.

## Next experiment gates

If CPU source shots continue but changed ink approaches zero, distinguish
original paint saturation/repaint versus blocked target/actual collision.
If source shots also decline, investigate genuine CPU resources, weapon
cooldowns, sight checks, physically accessible opportunities and Native
Recast-backed foot mobility. For either path, record native 30s time
windows and 17 original ownerGrid occupancy before applying any CPU policy.
Experiment with already-authored source B214/B216 mechanisms only in an
explicit research-only mode; never make experimental SWEEP the default
or fabricate a bridging route. No scoreable or official match promotion.

HOLD: late-life battle quality, actual enemy confrontation,
underpass source route 0/12, ART, 4v4, public release.
No main/T20/PR#5/Pages changes.
