# F4 P0 Integration and Live Probe — 2026-11-28

## REAL_GAME_DELTA
- Applied the 16-file chief integration patch under this Windows handoff's `live/src` allowlist. The live snapshot had newer player, CPU and presentation edits at three hunk locations; those were reconciled by preserving the newer behavior and integrating the missing F4 guards/fallbacks. No old standalone patches were reapplied.
- Player main paint: removed the 1.22x hit / 1.35x splash / 0.78x spacing compound. Player shooter hit and splash radii are now 1.20x their authored profile; primary Impact and MidDroplet get only a bounded 1.05x raster allowance capped at 0.06 m. Shot count/cadence, damage and ink cost are unchanged.
- Player sub Bomb brush: 1.80x, capped at +1.20 m. Player Special brush: 2.00x, capped at +0.55 m. CPU brush values remain at the integration values; exact-contact cells bypass growth.

## EVIDENCE
- `npm run build` passed on the Windows canonical tree: `tsc -b`, Vite transformed 1,585 modules and completed. Existing >500 kB chunk warning remains.
- Isolated Chrome 158 CDP opened `http://127.0.0.1:4176/play-f4.html`; WebGL2 on ANGLE/D3D11 AMD 890M initialized, F4 Rapier trimesh READY with 57,840 triangles, 858 provisional floor tiles and 512 walkable triangles.
- Persistent GPU ink atlas primed; pending GPU paint events 0; 833 idle post-render frames. No active-play frame/FPS sample was collected.
- The CDP probe used only read-only `Page`, `Runtime` and `SystemInfo` calls; it sent no input and did not acquire pointer lock. Full sanitized values are in `f4-p0-postfix-cdp-readonly-20261128.json`.
- The owner confirmed completing the requested 10–20 second real Chrome trial. The Chrome extension debugger detached after handoff, so no post-play snapshot was available; the completion signal does not identify weapon or floor outcomes.
- The supplied screenshot reproduces a pointer-lock rejection in the embedded Chromium host (`UnknownError`). The standalone Chrome retry path remains a genuine user click; its visible error now gives a recovery instruction instead of exposing Chromium's raw exception. No pointer lock or input is simulated.
- After that UI-message fix, canonical `npm run build` passed again: TypeScript build and Vite transformed 1,585 modules. The pre-existing large-chunk warning remains.

## HOLD
- The saved CDP capture is startup-only (paused STAGING, tick 0, no pointer lock/input). The owner's short play occurred later, but its weapon-specific balance, locomotion, dry-floor location, active FPS and combat queue drain were not observable after Chrome debugger detachment. The screenshot came from the embedded browser and does not establish that standalone Chrome rejects pointer lock.
- `t21F4ProvisionalWalls=HOLD_NO_ACCESSIBLE_CONCRETE` remains a pre-existing stage finding. No wall or floor authority was fabricated.

## NEXT
- If the owner reports that main remains too strong, sub/special remain too weak, or the same floor cell stays dry, use those outcomes to scope the next fix; do not infer a pass from the completion signal alone.
