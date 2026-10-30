# B345 — Original SOURCE player SHOOTER opening cadence

Real B344 Chromium CI #40997586801 PASS showed 7,2,2,2,2
accepted human shot requests in successive 12 native-tick windows,
15 over a genuine 60Hz second, and 91 changed original paint cells.

The SHOOTER countdown idles to -0.5s in ProjectileSystem, and the
existing `fireCooldown += profile.fireIntervalSeconds` preserves that
negative debt on first click, creating a source-level opening shot flood.

Only the frozen-source original 25/17/26/0 QA full-round with
`t21W10B343=sourceVolleyAtomic&t21W10B345=sourceShooterOpening`
may bound the SHOOTER's negative cooldown to one genuine native dt
on the actual mouse press transition. It does NOT change standard
T20/T21 play, other weapon families, continuous SHOOTER cadence, CPU
aim/foot, Rapier, original paint, NavLinks, scoreable or production.

Unit and build PASS do not certify Nintendo-original rate, hit, accuracy,
model, sound or art. A separate genuine Chromium 60Hz comparative run
must prove first 12-tick requests drop from the B344 observed 7 toward
the subsequent real 2-shot-per-12-tick cadence before TECH PASS.
Source opponent routes 0/12, Art and full 4v4 remain HOLD.
