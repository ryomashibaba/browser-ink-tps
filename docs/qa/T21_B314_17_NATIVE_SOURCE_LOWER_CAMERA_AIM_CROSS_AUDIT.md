# B314 — independent all-17 source geometry-to-human-camera audit (read-only)

## Source and scope
- Authentic F3G 17 PaintSurface sample points: [run 40704491969](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40704491969), artifact 12824507991, `b271-real_ink-original-seventeen-surface-registration.json`. Each surface supplies at most three **real active original grid cells**. This camera's old optical ray hits must not be treated as the new camera's visibility/character collision.
- B312 genuine native lower KCC and full 17 original ownerGrid snapshots: [run 40798530821](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40798530821), artifact 12864644370, `b312-real-original-lower-second-ink.json`. Actual lower human body (0.136741, 3.895004, 48.735943), camera (0.856741, 5.775539, 54.996086), original foot support on `first-drop-landing-positive-z`.
- Independent cross-check computed the 51 existing source-cell world points relative to that true B312 body/camera. This is a DIFFERENT run from the F3G sample itself; only geometry is cross-referenced, **not camera hits, rendered pixels, legal path, or achieved human impact**. Source boundary 25/17/26/0.

## Priority original surfaces from the lower human body

| Existing source PaintSurface suffix | Nearest of three original samples (planar) | Team A owned at B312 lower frame | Best original sample bearing from B312 camera (+Z=0°) |
|---|---:|---:|---:|
| `right-low-route-ramp-positive-z:paint` | 1.368 m | 730 | +110.891° (second original probe, 8.813 m from body) |
| `first-drop-landing-positive-z:paint` | 2.346 m | 1,249 | -33.048° (third original probe, 9.234 m from body) |
| `spawn-high-positive-z:paint` | 5.343 m | 808 | +15.739° (third original probe, 29.676 m from body) |
| `right-low-team-a:paint` | 15.522 m | 1,333 | +44.688° (third original probe, 15.522 m from body) |

B312 authentic player human ink was **808 changed cells on spawn-high-positive-z**, but the non-spawn Team A cells include A1/CPU and are **not evidence of human's second-surface ink**. Geometry and apparent camera yaw are insufficient to imply projectiles pass static solids or actually paint.

## B313 run acceptance gate
- The test on genuine native original [run 40802070180](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40802070180) must record real CDP camera movement then independent actual human last paint event and exact target original source Team A owner-grid delta.
- Selecting B271's third landing or second ramp sample alone is NOT success; the physical projectile may hit another source solid or miss. B313 must retain HOLD for that case.
- If B313 encounters missed/blocked shots, next candidate should use **actual original physical cast observation** from the live player/camera and an original footprint grid—not invent a ramp, NavLink, camera position, projectile impact, or new raster cells. Observe whether desired target point is sightline-blocked separately from Rapier human KCC floor support. No 4v4/ART/production admission.

All original geometry, ink, actors and player positions are unchanged by this audit. Archive-local derived full 17-surface CSV/JSON was kept outside the repository to avoid bloating QA source history.
