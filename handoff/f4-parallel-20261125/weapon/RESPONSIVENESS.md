# Weapon responsiveness follow-up
Apply after weapon-input-recovery.patch (6a50c3f5357d35632fc19b38b9304da7943f03dd) and current provisional batch (4cdc430a48a7d00017b28e7fe210e9b82ee024d4). Shared source 175e1a63f4825d28761e57eef9ca2b44aeccb6db; App hunk also matched batch-applied App. Preserve all unrelated Windows changes. No full App replacement.

Saber, contact weapons, canopy: one genuine input buffered for up to 6 ticks (100 ms); no early fire, no automatic repeat; clear on block, pause, reset, switch. Fresh Saber hold takes precedence; aim and ground state sampled at actual admission. Rotor: existing movement scale 0.72 remains during real committed burst; clear stale ring, minimum charge epsilon. Sub: use existing clipped muzzle for human F4 throws, solve from clipped origin, camera fallback, reject nonfinite origins before payment. Existing costs, hit and paint authorities unchanged. Provisional feel choices, not original certification.

Executed extracted actual methods with controlled stubs (16):
- saber immediate tap
- saber waits cooldown
- saber buffered release once
- saber no automatic repeat
- saber full charge
- saber expiry
- new hold cancels buffered release
- dry saber no swing or lock
- contact buffered released click once
- contact expiry
- real hold threshold unchanged
- legacy contact unchanged
- canopy buffered click once
- open canopy no queue
- no duplicate reserved volley
- queued press admitted after pending clears

All three patch roundtrips matched; latest batch App anchor matched; actual camera method returns Vec3. Native TS/Vite/Windows/Chrome/Rapier untested. Chief should apply both weapon patches, then check real clicks, guard, Rotor movement and close-wall throws.
