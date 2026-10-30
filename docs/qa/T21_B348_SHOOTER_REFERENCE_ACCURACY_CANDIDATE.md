# T21 B348 — source-only candidate for realistic SHOOTER angular dispersion

**Purpose:** B346 genuine original fixed-aim 10/10 bullets struck exactly
one original source 3D Paintable coordinate; B347 real pointer movement
changed painted cells 149→269, yaw 46.2°, ten genuine hit points spanned
2.18878 m. That proves aiming, *not automatic spread*.

## References and certainty

- Nintendo **official** weapon-category guide:
  https://splatoon.nintendo.com/en/weapons/
  Confirms SHOOTER continuous ink firing, not any exact hidden numeric
  spread.
- Independent community research on Splatoon 3 Splattershot:
  https://wikiwiki.jp/splatoon3mix/ブキ/スプラシューター
  reports observed 4.86° stationary deviation, 11.66° jumping,
  6F shooting and first-shot compensation.
- https://splatoonwiki.org/wiki/Splattershot
  separately describes progressive first-shot accuracy and recovery.
  Weapon data/versions differ by game and patch. These **do not**
  establish that the custom `pulse-sprayer` is Nintendo's weapon.

## B348 scoped implementation

An **opt-in source-only research hypothesis** uses the reported
angular envelopes of 4.86° ground and 11.66° in the air. It is not
Nintendo's exact randomness/distribution, inner/outer reticle
probability, shot recovery or moving-jump recovery. The first physical
shot is centered; later real human-shot ordinals have reproducible
angular candidate offsets from a bounded deterministic hash,
gradually increasing over eight accepted shots.

This experimental world **requires the exact already validated**
B343 source 25/17/26/0, B345 first-press fix, B346 real bullet
witness, real full-round and URL
`t21W10B348=sourceShooterAccuracyCandidate`.
No changes to normal T20/T21, any CPU shot, other shooter IDs,
roller/charger/other classes, ammo cost, damage, physical hit
resolution, source solids/NavLinks, original ownerGrid, Scoreable or
production. Angle only changes which physical path the real human
Pulse Sprayer projectile follows; no synthetic shots/ink.
Pure TypeScript tests validate first-shot accuracy, per-shot bounded
angles, ground/air hypotheses, invalid inputs and repeatability.

## Gates

1. Unit test + TypeScript production build.
2. Dedicated genuine Chromium run with unchanged physical source,
   real mouse held with no mid-fire aim movement, B337 native
   pointer/foot, B344 cadence, B345 opening, B346 real physical
   projectile/paint hit trace.
3. Independent forensic audit: 10 true human shots=10 real physical
   bullets; first physical launch direction matches the original
   B346 baseline; subsequent outgoing vectors differ (not 10
   identical paths), actual original Paintable hits and owner
   changed cells measured. Compare fixed B346 baseline, report
   any real original-owner growth with no fictitious paint.
4. Only after actual original-game reference and moving/jumping
   tests can candidate values be revised and proposed as default.

Retain official winner NONE, original cross-team routes 0/12,
0 Scoreable, ART REJECT/HOLD, full4v4 HOLD, production unauthorized.
