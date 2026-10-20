# W10-B51 — Exact original native human S-key physics tick boundary

B45 historical native Chrome failed 1.6m original A3 lane threshold at tick 181, separation 1.489856455m. B50 3/3 fresh Chrome passed at S held 42 physics ticks and separation 1.712617990m. Test whether this difference is caused by asynchronous 38+ tick key release: compare **exactly 38 and 42 native 60Hz Rapier ticks** after the same real Chrome pointer-locked W + actual mouse shot. A real CDP KeyS remains held while source-only paused QA physical clock advances; QA exception explicitly gated `t21W10B51=exactInputTicks&t21W10B16=sourceAutonomy`. No fabricated input axis, teleport, source geometry, CPU heuristics, scoring, or production route. Original gates retreat>=1.5m and separation>=1.6m remain unchanged; valid below-threshold result is experimental data, not CI failure. Original source 25/17/26/0, natural opposing paths 0/12, activationReady=false, main/PR5/owner files untouched. Final results pending actual GitHub CI.

## Verified actual original source real-Chrome results — 2026-10-20 JST

### Controlled native S-key boundary — tested code `899c0f09714e3370b1f6f9292c7101236f72769e`

Two separate [actual Chrome 38 vs 42 tick QA jobs](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349178455) completed **SUCCESS** as experiment executions. Their **original source physical clearance outcomes are different**:

| Real Rapier observation | Exactly 38 S ticks | Exactly 42 S ticks |
|---|---:|---:|
| Actual native tick delta | 38 | 42 |
| Actual source foot before S | (0.017257592,8.395099640,65.419197083) | same |
| Final physical tick | 181 | 185 |
| Final source Z | **68.230255127** | **68.576148987** |
| True native retreat distance | 2.811058080m | 3.156951909m |
| Actual original A3 lane separation | **1.418685353m** | **1.712617990m** |
| Signed margin vs unchanged 1.6m | **−0.181314647m** | **+0.112617990m** |
| **Original 1.6m clearance gate** | **FAIL** | **PASS** |

Both samples were genuine CDP KeyS input while original Rapier advanced in the QA-only paused 60Hz native clock, with real Chrome pointer lock and genuine preceding W + mouse shot. Source remained **25 solids, 17 Paintable, 26 NavLinks, 0 Scoreable**. No virtual movement input, CPU heuristic promotion, teleport or invented geometry. This **isolates actual key-hold physics duration** as sufficient to change the original lane gate from failure to success under these fixed source conditions. The historical B45 failed with separation **1.489856455m** and tick **181**; its slightly different final Z from this 38-tick controlled test means exact old-run input phase alignment is not claimed.

### Actual minimal B51 correction to the Chrome QA setup

The original long-CPU smoke formerly released real S at **first observed >=38 ticks**, then required retreat >=1.5m and A3 separation >=1.6m. This caused an authentic **test-setup false negative**: at 38 ticks the real player had not yet vacated the corridor. B51 changes **only this long-CPU QA input release criterion**: keep holding the genuine CDP S key until all three conditions are true:
1. At least 38 genuine Rapier ticks observed;
2. Actual native source retreat >=**1.5m**;
3. Actual native source A3 lane separation >=**1.6m**.

The QA input fails closed if physical clearance has not happened by 96 ticks (or wall timeout). The exact original threshold is **not relaxed**. The real human player must physically retreat; no collision bypass, no actor teleport, no CPU goal heuristics, no source mesh or navigation edits, and no new scoreable paint. This is a **QA precondition fix**, not an original CPU movement algorithm improvement. The source-only fixed/experimental 1080-tick comparator and standard fixed CPU remain as before.

### Actual full regressions — tested final B51 code SHA `177e3cde3f2e6d9464596b8084ce4f665cec250f`

**All 9 GitHub checks SUCCESS**:
- [Real Chrome trusted input, real CPU 7-agent lifecycle and original fixed vs B35 research sparse comparison](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481715): SUCCESS. Both original-source baseline and B35 research run physically cleared A3 at **exactly 42 held S native ticks**, with retreat **3.156951909m** and separation **1.712617990m**; actual release ticks **183 and 184**, independently logged. B35 opt-in remained research-only; the sparse native request count **248**, suppressed duplicates **511**, no new gameplay authority.
- [Independent original lane trials](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481723): **3/3** SUCCESS; these use unchanged B50 isolated trial mode, separately from the corrected long-CPU test setup.
- [Exact 38 vs 42 real KeyS physics trial](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481716): **2/2 experiment execution SUCCESS**, while 38's original lane **outcome remains FAIL** (as accurately recorded).
- [Original pinned full source visual](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481790): SUCCESS.
- [Original render A-B-A](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481824): SUCCESS.
- [Original Chrome CPU/render lifecycle](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39349481735): SUCCESS.

**Decision: W10-B51 PASS — bounded physical root-cause evidence and minimal QA-only input fix.** Historic failing B45 run remains real and documented, not rewritten. A source original foot lane clearing test now checks *physical clearance* rather than assuming an arbitrary minimum key duration guarantees it. This does not establish 4v4, original actor placements, official stage connectivity or user OMEN GPU frame-rate. Continue with higher-value authentic actor instance provenance, central original navigation, and human-visible playable quality, not repeated AI micro-heuristics.
