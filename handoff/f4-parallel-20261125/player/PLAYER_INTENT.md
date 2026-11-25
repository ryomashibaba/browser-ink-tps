# F4 player: input lifecycle, turn intent, air momentum

Apply the latest provisional batch, f4-stable-camera-aim.patch, then f4-player-intent.patch. Windows shared source 175e1a63f4825d28761e57eef9ca2b44aeccb6db; main batch read at 0fbbebcf0a00cd8e4e4268f28533c235257138c8. Existing-file hunks reconstructed against shared source and against latest main batch plus prior player patch using exact context. 78 executable pure-JS assertions passed (mouse held mask, turn direction, airborne speed). No actual browser/Rapier/TypeScript app build yet.

- Mouse release-only reconciliation on real mouse events while locked. Real down/up handling and queued taps are unchanged; no synthetic press.
- During exclusive Zip KCC traversal discard one-tick locomotion taps and jump/roll buffers, not real held keys. Does not modify Zip travel/return/weapon authority.
- Only OWN ground already eligible for roll: discard stale direction if current input is absent or more than 60 degrees away; new valid reversal may arm normally.
- Airborne squid target cap preserves existing propulsion between human and own-ink speed, with half existing ground directional acceleration (13 m/s²); no OWN relation, floor, vertical impulse, or speed above existing swim max. Real KCC, mist scaling, release brake and ground speeds stay authoritative. This tuning is provisional, not original-certified.
- All changes opt into existing provisional full-round guard; no formal QA/T20 changes. No added App logic other than two enable calls.
