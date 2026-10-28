# Browser Ink TPS — B270 fixture repair and B271 genuine 17-PaintSurface registration

Date: 2026-10-28 JST. Protected QA branch only.

## Correct B270 failed test before further development
[Run 40655004317](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40655004317) reported an **invalid test fixture**, not successful art adoption or changed original geometry. When a deliberately falsified B269 foreground `pixels` count was reduced to 35,000, its `atLeast8` still held the old 41,448 (>35,000), so the input validator correctly rejected `B270_NATIVE_ROI_INVALID` before the intended actor-only attribution assertion. The source-specific repair changes **all three** dependent ROI counts to a valid, deliberately insufficient actor-only region (35,000 changed, 31,000 >=8, 19,000 >=24). The test must then reach and reject `B270_ACTOR_ONLY_ATTRIBUTION_NOT_SUPPORTED`. No metric, source art acceptance, or actual screenshot altered.

## B271 real authored gameplay paint footprints vs exact original optical UV
Existing B263 owns 115 actual A-team cells on **one** original source PaintSurface and measures 58 viewport-projected samples. This does not prove the other 16 original paint surfaces are accessible, visible, painted, collidable, or navigable. B264/B266 studied only 20 source optical ray groups to that one surface. Source optical geometry can sit in front of the painted area with no certified Rapier solid; an original Glass intersection does NOT imply occlusion.

B271 directly audits **all 17 existing runtime PaintSurface instances** at the existing F3L native camera from one real frozen tick. For each original surface, iterate the actual active-cell mask, take at most three unique active cell centers (nearest center, first active, last active), and compute:
- Surface ID, actual active footprint cell count, real authoritative ownerGrid counts A/B/Neutral. No injected ownership, no surface substitution, no center chosen in a masked-out cell.
- The actual `PaintSurface.localToWorld` world center and `camera.worldToScreen` screen point, with viewport and camera origin saved; this is a projection, NOT proof of a colored framebuffer pixel.
- Nearest original SHA-pinned UV optical triangle hit groups (including original glass/metal/detail), and separate certified Rapier stage camera cast. Never give optical geometry collision authority.
- Nearest Euclidean endpoint distance among the original 26 NavLinks (52 endpoints), plus Euclidean player-to-probe distance. Neither proximity is a path or evidence of legal actor movement. No speculative route approval, link promotion, ramp invention, or source-mesh repositioning.
- Original 25 solids / 17 PaintSurfaces / 26 links / 0 scoreable; 57,578 pinned UV triangles and 19 textures. A fixed max of **51 probes**. No changes to actors, original camera, ownership, original UV material, stage or physics.

The original F3G genuine Chromium WebGL2 smoke captures **FROZEN** before input and **REAL_INK** after actual keyboard/mouse firing, both while staging is paused, with B263 camera/ownerGrid evidence intact and exact before/after state checks. Evidence files saved into the *existing*, already protected F3G artifact:
- `b271-frozen-original-seventeen-surface-registration.json`
- `b271-real_ink-original-seventeen-surface-registration.json`

No synthetic heatmap or new image art is substituted for the actual stage. The 16 unpainted surfaces are explicitly reported as **unpainted in this short session**; this does not prove they cannot be painted. The next decision is to distinguish **source optical registration**, **genuine authoritative walk route/real coverage**, and **rendered ink visibility** using separate evidence; never promote a result because a static sample is near a NavLink endpoint.

## QA criteria
- B270 corrected Vitest must PASS. B271 pure source-mask/ray separation tests must PASS.
- Genuine B271 F3G Chrome/WebGL2 must prove exact 17 source surfaces and <=51 actual active samples, no state drift, no colored ink pixel claim, with real post-input ownerGrid proof. Existing B210 full 180-second, B75, A1 co-op and other QA should not regress.
- Technical audit PASS alone does not mean 17 navigable surfaces or actual original 4v4. **ART HOLD, unrestricted 4v4 HOLD, production forbidden**, formal art admissions 0.
- Avoid repeated low-value actor variants and optical transparency experiments. Prioritize verified source-space spatial mismatch and independently witnessed real route/paint behavior next.
