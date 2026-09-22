# Validation Report — T0–T3 v0.1.1

Date: 2026-09-22

## Checks completed in the generation environment

### 1. TypeScript syntax / transpile check

Command equivalent:

```bash
tsc --noEmit --noCheck --module ESNext --moduleResolution Bundler --target ES2022 src/main.ts
```

Result: **PASS**.

This checks parsing/transpilation across the source import graph. It is not a substitute for dependency-resolved type checking.

### 2. CPU gameplay-ink behavior check

A temporary Node test compiled and exercised the real `GameplayInkSystem`, `FixedStepClock`, `AtlasAllocator`, and ink type modules with a lightweight surface fixture.

Measured result:

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

- ~1 m radius oriented ellipse changes the expected order of cells at 0.125 m/cell.
- Rasterized score area is close to π m² within grid discretization tolerance.
- Repainting the same cells Team A → Team B removes A area and adds the same B area.
- Painting a non-scoreable wall changes ownership cells but does not alter turf score.
- Dirty tiles are touched on ownership changes.
- A 1/30 s frame produces two 60 Hz simulation ticks.
- The representative 4096 atlas pack preserves the requested 128 px/m scale.

Result: **PASS**.

### 3. PlayCanvas API cross-check

The source was checked against current PlayCanvas Engine 2.22.1 documentation for:

- `AppBase` + `AppOptions` initialization after awaited `createGraphicsDevice`.
- WebGPU-preferred `deviceTypes` behavior and automatic WebGL2 fallback append.
- `CameraComponent.renderTarget`.
- `RenderTarget` with `RENDERTARGET_ORIGIN_TOP` for regular texture sampling.
- `ShaderMaterial` with GLSL and WGSL versions.
- Simplified WGSL attribute/varying/texture+sampler syntax.
- `Mesh.clear`, dynamic mesh updates, UV channels 0–7, typed arrays, `setColors32`, and index updates.

Result: **API DESIGN CROSS-CHECKED**.

### 4. Left-click picking regression check

The click-to-ray conversion was corrected to use canvas CSS coordinates for `CameraComponent.screenToWorld()`. The old path multiplied local pointer coordinates by the drawing-buffer/CSS-size ratio, effectively applying device pixel ratio twice on high-DPI displays and shifting the ray away from the clicked PaintSurface.

The updated source was re-run through the TypeScript syntax/transpile check after the patch.

Result: **PASS (source-level regression check)**.

## Check not available in the generation environment

`npm install` was attempted, but npm registry access timed out. Therefore these checks could not be honestly claimed here:

- dependency-resolved `tsc -b`
- Vite production bundle
- real Chromium WebGPU launch
- real WebGL2 fallback launch
- shader compilation on an actual GPU
- measured 1080p runtime FPS

Run locally:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then use **Stress 2000** while watching the debug overlay, and repeat once with `?inkAtlas=2048` to exercise the fallback atlas size.
