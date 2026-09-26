export type StageFootprintPoint = readonly [number, number];

export interface StageFootprint {
  outer: readonly StageFootprintPoint[];
  holes?: readonly (readonly StageFootprintPoint[])[];
  /**
   * Raster resolution used by render/collision/navigation/CPU ink for this
   * BLOCKOUT footprint. Keep this source-owned instead of silently choosing
   * a different convenience grid in each subsystem.
   */
  cellSizeMeters: number;
}

export interface StageFootprintRect {
  minU: number;
  minV: number;
  maxU: number;
  maxV: number;
  centerU: number;
  centerV: number;
  widthMeters: number;
  depthMeters: number;
}

export interface StageFootprintRaster {
  widthCells: number;
  depthCells: number;
  active: Uint8Array;
  rectangles: readonly StageFootprintRect[];
}

export function validateStageFootprint(
  footprint: StageFootprint,
  widthMeters: number,
  depthMeters: number
): readonly string[] {
  const errors: string[] = [];
  if (!(Number.isFinite(widthMeters) && widthMeters > 0)) {
    errors.push('footprint width must be finite and positive');
  }
  if (!(Number.isFinite(depthMeters) && depthMeters > 0)) {
    errors.push('footprint depth must be finite and positive');
  }
  if (!(Number.isFinite(footprint.cellSizeMeters) && footprint.cellSizeMeters > 0)) {
    errors.push('footprint cellSizeMeters must be finite and positive');
  }

  validateRing('outer', footprint.outer, widthMeters, depthMeters, errors);
  (footprint.holes ?? []).forEach((hole, index) => {
    validateRing(`hole ${index}`, hole, widthMeters, depthMeters, errors);
  });
  return errors;
}

export function pointInStageFootprint(
  u: number,
  v: number,
  footprint: StageFootprint
): boolean {
  if (!pointInRing(u, v, footprint.outer)) return false;
  for (const hole of footprint.holes ?? []) {
    if (pointInRing(u, v, hole)) return false;
  }
  return true;
}

export function rasterizeStageFootprint(
  widthMeters: number,
  depthMeters: number,
  footprint: StageFootprint
): StageFootprintRaster {
  const errors = validateStageFootprint(footprint, widthMeters, depthMeters);
  if (errors.length > 0) throw new Error(errors.join('; '));

  const cell = footprint.cellSizeMeters;
  const widthCells = Math.ceil(widthMeters / cell);
  const depthCells = Math.ceil(depthMeters / cell);
  const active = new Uint8Array(widthCells * depthCells);

  for (let z = 0; z < depthCells; z += 1) {
    const v = Math.min(depthMeters, (z + 0.5) * cell);
    for (let x = 0; x < widthCells; x += 1) {
      const u = Math.min(widthMeters, (x + 0.5) * cell);
      if (pointInStageFootprint(u, v, footprint)) {
        active[z * widthCells + x] = 1;
      }
    }
  }

  return {
    widthCells,
    depthCells,
    active,
    rectangles: mergeActiveCells(
      widthMeters,
      depthMeters,
      cell,
      widthCells,
      depthCells,
      active
    )
  };
}

function validateRing(
  label: string,
  ring: readonly StageFootprintPoint[],
  widthMeters: number,
  depthMeters: number,
  errors: string[]
): void {
  if (ring.length < 3) {
    errors.push(`${label} footprint ring requires at least three vertices`);
    return;
  }

  for (const [u, v] of ring) {
    if (!Number.isFinite(u) || !Number.isFinite(v)) {
      errors.push(`${label} footprint ring contains non-finite coordinates`);
      continue;
    }
    const epsilon = 1e-6;
    if (
      u < -epsilon ||
      v < -epsilon ||
      u > widthMeters + epsilon ||
      v > depthMeters + epsilon
    ) {
      errors.push(
        `${label} footprint vertex (${u}, ${v}) exceeds 0..${widthMeters} / 0..${depthMeters}`
      );
    }
  }
}

function pointInRing(
  u: number,
  v: number,
  ring: readonly StageFootprintPoint[]
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [ui, vi] = ring[i]!;
    const [uj, vj] = ring[j]!;
    if (pointOnSegment(u, v, ui, vi, uj, vj)) return true;
    const crosses =
      (vi > v) !== (vj > v) &&
      u < (uj - ui) * (v - vi) / (vj - vi) + ui;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  const cross = (px - ax) * dy - (py - ay) * dx;
  if (Math.abs(cross) > 1e-8) return false;
  const dot = (px - ax) * dx + (py - ay) * dy;
  if (dot < -1e-8) return false;
  const lenSq = dx * dx + dy * dy;
  return dot <= lenSq + 1e-8;
}

function mergeActiveCells(
  widthMeters: number,
  depthMeters: number,
  cell: number,
  widthCells: number,
  depthCells: number,
  active: Uint8Array
): readonly StageFootprintRect[] {
  interface OpenRect {
    startX: number;
    endX: number;
    startZ: number;
    endZExclusive: number;
  }

  const completed: OpenRect[] = [];
  let open = new Map<string, OpenRect>();

  for (let z = 0; z < depthCells; z += 1) {
    const runs: Array<readonly [number, number]> = [];
    let x = 0;
    while (x < widthCells) {
      while (x < widthCells && active[z * widthCells + x] === 0) x += 1;
      if (x >= widthCells) break;
      const start = x;
      while (x < widthCells && active[z * widthCells + x] !== 0) x += 1;
      runs.push([start, x]);
    }

    const next = new Map<string, OpenRect>();
    for (const [startX, endX] of runs) {
      const key = `${startX}:${endX}`;
      const existing = open.get(key);
      if (existing) {
        existing.endZExclusive = z + 1;
        next.set(key, existing);
      } else {
        next.set(key, {
          startX,
          endX,
          startZ: z,
          endZExclusive: z + 1
        });
      }
    }
    for (const [key, rect] of open) {
      if (!next.has(key)) completed.push(rect);
    }
    open = next;
  }
  completed.push(...open.values());

  return completed.map((rect) => {
    const minU = rect.startX * cell;
    const maxU = Math.min(widthMeters, rect.endX * cell);
    const minV = rect.startZ * cell;
    const maxV = Math.min(depthMeters, rect.endZExclusive * cell);
    return {
      minU,
      minV,
      maxU,
      maxV,
      centerU: (minU + maxU) * 0.5,
      centerV: (minV + maxV) * 0.5,
      widthMeters: maxU - minU,
      depthMeters: maxV - minV
    };
  });
}
