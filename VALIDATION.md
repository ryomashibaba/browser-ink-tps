# Validation Report — T0–T3 v0.1.2

Date: 2026-09-22

## Final stabilization results

### 1. CPU gameplay-ink behavior

Previously measured against the real gameplay-ink/fixed-step/atlas logic:

```json
{
  "ellipseChangedCells": 208,
  "ellipseAreaM2": 3.25,
  "dirtyTiles": 1,
  "fixedTicksFor33ms": 2,
  "atlasPpm": 128
}
```

Assertions passed for:
- ~1 m oriented ellipse at 0.125 m/cell.
- Turf area near π m² within grid discretization.
- Team A → Team B repaint area transfer.
- Non-scoreable wall painting not affecting turf score.
- Dirty-tile marking on ownership changes.
- 1/30 s frame producing two 60 Hz ticks.
- Representative 4096 atlas retaining 128 px/m.

Result: **PASS**.

### 2. Left-click picking regression

High-DPI picking was corrected to pass canvas CSS coordinates to PlayCanvas `CameraComponent.screenToWorld()` rather than multiplying them by drawing-buffer/CSS scale.

The user then verified in the browser that left-click painting works.

Result: **PASS — browser confirmed**.

### 3. Dependency-resolved CI typecheck

GitHub Actions installs dependencies on Node.js 24 and runs:

```bash
npm run typecheck
```

The first real CI run exposed three TypeScript literal-narrowing issues in brush-radius state. They were corrected by explicitly widening the mutable state to `number`.

Final result: **PASS**.

### 4. Production build

GitHub Actions runs:

```bash
npm run build -- --base=/browser-ink-tps/
```

This executes the dependency-resolved TypeScript build and Vite production bundle.

Result: **PASS**.

### 5. GitHub Pages pipeline

Verified stages:
- Configure GitHub Pages: PASS
- Upload Pages artifact: PASS
- Deploy to GitHub Pages: PASS
- Overall workflow conclusion: SUCCESS

Hosted QA URL:
https://ryomashibaba.github.io/browser-ink-tps/

Result: **PASS**.

### 6. Hosted browser verification

The user opened the GitHub Pages deployment successfully in their browser after deployment.

Result: **PASS — user confirmed**.

## Static audit before T4–T7

Reviewed:
- `PaintSurface`
- `GameplayInkSystem`
- `PaintCoordinator`
- `GpuInkAtlas`
- `AtlasAllocator`
- `InkSurfaceMaterial`
- `OrbitInkCamera`
- `FixedStepClock`
- test-stage surface definitions
- debug/performance overlay

No new blocking defect was found in the T0–T3 contracts.

Intentional deferred behavior remains documented in `CURRENT_CANONICAL.md`, including dirty-tile consumption/clearing and all T4+ gameplay systems.

## Remaining verification caveat

The assistant's generic web-fetch environment cannot directly retrieve the GitHub Pages host, so it cannot independently assert pixels-on-screen rendering. The actual hosted page was opened and confirmed by the user, and the complete GitHub Actions build/deploy pipeline succeeded.
