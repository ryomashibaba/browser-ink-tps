# T21 Phase14D — Real Rapier CPU physical drop bridge (QA-only)

Phase14C measured real Recast Crowd one-way link discontinuities at 60Hz: +Z five suspect frames, max 0.764m; -Z four, max 1.180m. Recast arrival alone is NOT physically accurate CPU descent.

New reusable UndertowCpuDropBridge builds the real shared Rapier KCC for human-sized CPU with original-source landing collision, project gravity / terminal velocity, and horizontal steering capped to the configured CPU max speed. Emits physical foot positions, frame displacement continuity, grounded state and explicit release authority false. No new bridge, floor, mesh triangle, scoreability or Recast nav link created.

The isolated QA runs actual Recast Crowd agents on both frozen first-drop links, records the first anomalous descending source foot sample, and then starts the Rapier bridge with the original source-masked landing collider. Every physics tick is checked against the Phase14C continuous-motion envelope, and real landing is required. Bad endpoints and a 30Hz step must be rejected.

Scope is intentionally precise: this is a reusable **physics handoff** and a runnable engine proof, not yet wired into production CpuAgentSystem. It does not prove horizontal movement over the spawn edge with the whole original stage nor the live 4v4 animation or match AI. Do not certify CPU descent in the live game until it is connected behind a T21-only opt-in flag and tested with real gameplay inputs. T20 production and T21 activation flag unchanged.

FAST CI includes the integration QA on every PR push. At milestones the entire historical OBJ/Pass18/Phase12/browser FULL suite must also succeed at exact release candidate HEAD. Frozen source visual meshes and HOLDs remain intact.