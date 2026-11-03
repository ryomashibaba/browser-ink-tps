# Browser Ink TPS B403 — 実敵CPU距離の原作証拠再検証

B340 genuine Chromium 180-second run: https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40988204871
Original artifact ID: 12949234359. Original b340-real-round.json SHA256: 13f68447daca35330959a5eabefc621a3a7a4b19c8766d0a2c48e7dc514e4ab8 (matches fixed B341 reference).

| Real remaining time | Native tick | Nearest B enemy | Horizontal distance |
|---|---:|---|---:|
| 180s | 1056 | B1 | 120.494m |
| 150s | 2857 | B4 | 118.701m |
| 120s | 4655 | B2 | 116.824m |
| 90s | 6459 | B2 | 117.006m |
| 60s | 8260 | B1 | 116.958m |
| 30s | 10060 | B2 | 117.025m |
| 0s | 11860 | B2 | 116.984m |

At these seven ACTUAL frames: one human on original positive-z high floor, 7/7 genuine CPU foot records, no CPU relocations, 25 source solids, 17 PaintSurfaces, 26 original NavLinks, 0 Scoreable. All nearest enemies are >116m, far beyond B181 maximum 32m optical-candidate range (not an assertion of actual weapon range). No extrapolation across 180 seconds; no LOS, projectile, HP, splat, respawn or full 4v4 certification.

This isolated B403 workflow downloads the original GitHub Actions artifact, verifies raw SHA256, audits all seven source CPU bodies with independent JavaScript and preserves a report. No new heavy Chromium run. Next native combat work must find real, naturally reachable positions inside actual weapon range with real Rapier line of fire, not fake a bridge, warp, score, projectile or HP.

Fixed QA branch, main, T20, Draft PR #5, Pages unchanged; 25/17/26/0 and opponent route 0/12; formal 4v4/ART/production HOLD.
