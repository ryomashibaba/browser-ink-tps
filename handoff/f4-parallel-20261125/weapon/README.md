# F4 weapon input / recovery fix

Windows shared source 175e1a63f4825d28761e57eef9ca2b44aeccb6db. ProjectileSystem blob ce40e1ba42c400d4e7e2a32279d845a0f1b283f2; PlayerResources blob 6b9599e72099ec30c29e5b1bfd7c39bd2f7164a0. Latest provisional batch observed 7e10c7bc (patch blob 4cdc430a48a7d00017b28e7fe210e9b82ee024d4), which does not modify ProjectileSystem and only inserts refillF4SpecialInk near reset in PlayerResources. Apply weapon-input-recovery.patch to the actual Windows src tree, not the handoff snapshot; inspect conflicting hunks rather than force. No app, CPU, stage, weapon calibration or physics changes.

- F4 general main weapon update is gated by living physical HUMAN mode; forced trigger drop in SQUID cannot release Rail or Chord. Clear trigger latch while blocked and clear pending Rail/Chord taps at pause/switch/reset/disabled update.
- F4 Rail early release waits through existing minChargeSeconds (0.12s); uses existing ray, cooldown and ink payment; legacy paths unchanged. This is a provisional input convenience, not proof of 7.2.0 charge storage/shot timing.
- F4 sub payment preserves longer outstanding recovery timers. No ink cost changes.

Executed exact extracted modified method bodies and gate with V8 and controlled stubs (16 assertions):
- tap starts real windup without firing
- tap fires exactly once after existing minimum
- no repeat without trigger
- full charge preserved
- partial charge preserved
- legacy tap unchanged
- dry release uses existing payment failure
- no cooldown bypass
- gate SQUID alive=true enabled=true f4=true
- gate HUMAN alive=false enabled=true f4=true
- gate HUMAN alive=true enabled=false f4=true
- gate HUMAN alive=true enabled=true f4=true
- gate SQUID alive=false enabled=true f4=false
- short overlapping sub preserves both timers
- longer sub extends both timers
- rejected sub changes no timer

Not native TS/Vite, Rapier, Chrome, or live gameplay verification. Next: actual Rail taps, Rail/Chord shift cancel, dry ink and overlapping sub recovery in F4 round. Keep official QA and Windows changes protected.
