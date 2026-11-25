# F4 player camera lifecycle

Apply after chief partial integration 01 (blob 40832b8e741b058c4a1b19827dc6c48b547ea96a; includes stable-camera-aim). Compatible with pending f4-player-intent.patch (exact-context reconstruction tested after both). Do not reapply stable-camera-aim separately over chief.

- Reticle reads actual current rendered camera center ray on active non-twin F4 view; Twin Comets already queries in reticle preview, except roll lock. Reuse scratch Vec3. At most one extra live stage+actor query per active rendered frame. Actual actor poses are fixed-tick authoritative, not interpolated visuals. No aim assist or hit award.
- On existing real player teleport/spawn, reset camera clipping distance, predictive motion history, shoulder smoothing and stale contact. Retain selected yaw/pitch/zoom/shoulder and existing Rapier sweep. Optional method call keeps partial QA camera stubs compatible.
- Ignore zero-motion and hidden/unfocused mouse events in enabled provisional view before decrementing recapture guard. Existing finite checks and valid delta caps unchanged.

19 pure JS method/guard assertions and exact 3-file hunk replays passed including pending player-intent. No native TS/Vite/Rapier/Chrome run. Compare live reticle during flick/respawn and camera casting cost. No original-game certification.
