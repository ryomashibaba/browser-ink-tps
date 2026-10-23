# W10-B129 — In-play original-source floor edge guidance (F2/F3 quality)

Date 2026-10-23 JST. Implementation on QA branch only. Do not merge or deploy.

## Why this advances real play

W10-B127 repeatedly moved a real human KCC along existing Team A Y4.5 raised source, but the true original polygon edge approached dangerously (0.471m on CI #39942307098 and 0.592m on subsequent #39943003186). Repeating blind W12 probes has diminishing player value. B129 introduces an unobtrusive, **read-only in-game original edge warning** so a person steering the nonproduction playable preview can tell when the current original raised floor boundary is close. No auto-steer, force, invisible barriers, artificial floor or score.

## Source of truth

`UndertowF3PlayablePreviewApp.snapshot()` checks actual 60Hz player KCC grounded, human alive/mode, physical Y=4.5 layer and **real Rapier `castCharacterFootSupport` source solid identity**. Only when physical support is the named `UndertowT21D:right-low-team-a` does it call the frozen B124 polygon/holes edge-distance inspector. A matching XZ and height without KCC/source support never activates the warning. The pure `originalRaisedSourceEdgeStatus` rejects stale native tick, original source counts drifting from 25/17/26/0, outside polygon, paused, safe-stopped, splatted or completed gameplay. It distinguishes:

- edge less than 0.65m: `EDGE_RISK` visible caution (NOT a collision or falling prediction)
- 0.65m to less than 1.20m: `NEAR_EDGE` visible caution
- at least 1.20m: `CLEAR`, no clutter
- any other source or unverified KCC: `UNAVAILABLE`, no invented warning

HUD overlay is normal F3 source preview only, absent from protected production/T19C/T20, and hides during survey/gallery. UI and snapshot explicitly keep original scoreable=0 and 4v4 certification=false.

## Acceptance

Automated static tests exercise *exact recorded B126/B127 original geometry positions*, read-only behavior, unverified original support, invalid stage authority, paused/splatted/time-up and same-XZ wrong-Y. Build and actual Chrome input/screenshot require CI confirmation on the exact SHA. These tests **do not certify that real players can safely traverse or finish the map**.

The priorities remain F1-F5: original connectivity 0/12 and unrestricted 4v4 HOLD; next work should unify source-ledger practice and true enemy CPU/actor routes instead of more micro-length W-key experiments.
