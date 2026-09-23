import { Quat, Vec3 } from 'playcanvas';
import type { PaintSurface } from '../ink/PaintSurface';
import type { StageDefinition, StageSolidDefinition, StageVector3 } from './StageDefinition';

export interface CoordinateAuditResult {
  passed: boolean;
  checkedSurfaces: number;
  maxRoundTripErrorMeters: number;
  maxBackingGapMeters: number;
  maxBackingNormalErrorDegrees: number;
  summary: string;
}

export function auditStageCoordinates(
  surfaces: readonly PaintSurface[],
  definition: StageDefinition,
  backingGapToleranceMeters = 0.08
): CoordinateAuditResult {
  let maxRoundTripErrorMeters = 0;
  let maxBackingGapMeters = 0;
  let maxBackingNormalErrorDegrees = 0;

  for (const surface of surfaces) {
    maxRoundTripErrorMeters = Math.max(
      maxRoundTripErrorMeters,
      surface.assertCoordinateRoundTrip()
    );

    const spec = definition.paintSurfaces.find((candidate) => candidate.id === surface.id);
    if (!spec) throw new Error(`Coordinate audit: missing definition for ${surface.id}.`);
    const solid = definition.solids.find((candidate) => candidate.id === spec.backingSolidId);
    if (!solid) {
      throw new Error(
        `Coordinate audit: ${surface.id} references missing backing solid ${spec.backingSolidId}.`
      );
    }

    const backing = auditBackingFit(surface, solid);
    maxBackingGapMeters = Math.max(maxBackingGapMeters, backing.maxFaceGapMeters);
    maxBackingNormalErrorDegrees = Math.max(
      maxBackingNormalErrorDegrees,
      backing.normalErrorDegrees
    );
    if (backing.maxFaceGapMeters > backingGapToleranceMeters) {
      throw new Error(
        `Coordinate audit: ${surface.id} is ${backing.maxFaceGapMeters.toFixed(4)}m from ${solid.id} face.`
      );
    }
    if (backing.normalErrorDegrees > 0.25) {
      throw new Error(
        `Coordinate audit: ${surface.id} normal differs from ${solid.id} face by ${backing.normalErrorDegrees.toFixed(3)} degrees.`
      );
    }

    const rect = surface.atlasRect;
    if (!rect) throw new Error(`Coordinate audit: ${surface.id} has no atlas allocation.`);
    const expectedWidth = Math.ceil(surface.widthMeters * rect.pixelsPerMeter);
    const expectedHeight = Math.ceil(surface.heightMeters * rect.pixelsPerMeter);
    if (rect.width !== expectedWidth || rect.height !== expectedHeight) {
      throw new Error(
        `Coordinate audit: ${surface.id} atlas size mismatch ${rect.width}x${rect.height} vs ${expectedWidth}x${expectedHeight}.`
      );
    }
  }

  return {
    passed: true,
    checkedSurfaces: surfaces.length,
    maxRoundTripErrorMeters,
    maxBackingGapMeters,
    maxBackingNormalErrorDegrees,
    summary:
      `PASS ${surfaces.length}/${surfaces.length} · round ${maxRoundTripErrorMeters.toExponential(1)}m · solid ${maxBackingGapMeters.toFixed(3)}m · angle ${maxBackingNormalErrorDegrees.toFixed(3)}°`
  };
}

function auditBackingFit(
  surface: PaintSurface,
  solid: StageSolidDefinition
): { maxFaceGapMeters: number; normalErrorDegrees: number } {
  const solidCenter = vec3(solid.center);
  const inverse = inverseRotation(solid);
  const localNormal = rotate(surface.normal.clone(), inverse);
  const components = [
    Math.abs(localNormal.x),
    Math.abs(localNormal.y),
    Math.abs(localNormal.z)
  ] as const;
  let normalAxis: 0 | 1 | 2 = 0;
  if (components[1] > components[normalAxis]) normalAxis = 1;
  if (components[2] > components[normalAxis]) normalAxis = 2;

  const dominant = Math.min(1, Math.max(0, components[normalAxis]));
  const normalErrorDegrees = Math.acos(dominant) * 180 / Math.PI;
  const half = [
    solid.size[0] * 0.5,
    solid.size[1] * 0.5,
    solid.size[2] * 0.5
  ] as const;

  let maxFaceGapMeters = 0;
  const tangentialTolerance = 0.10;
  const corners: readonly [number, number][] = [
    [0, 0],
    [surface.widthMeters, 0],
    [surface.widthMeters, surface.heightMeters],
    [0, surface.heightMeters]
  ];

  for (const [u, v] of corners) {
    const local = rotate(
      surface.localToWorld(u, v).sub(solidCenter),
      inverse
    );
    const values = [local.x, local.y, local.z] as const;
    maxFaceGapMeters = Math.max(
      maxFaceGapMeters,
      Math.abs(Math.abs(values[normalAxis]) - half[normalAxis])
    );

    for (const axis of [0, 1, 2] as const) {
      if (axis === normalAxis) continue;
      if (Math.abs(values[axis]) > half[axis] + tangentialTolerance) {
        throw new Error(
          `Coordinate audit: ${surface.id} corner (${u.toFixed(2)}, ${v.toFixed(2)}) exceeds ${solid.id} tangential bounds on axis ${axis}.`
        );
      }
    }
  }

  return { maxFaceGapMeters, normalErrorDegrees };
}

function inverseRotation(solid: StageSolidDefinition): Quat {
  const e = solid.rotationEulerDegrees ?? [0, 0, 0];
  const q = new Quat().setFromEulerAngles(e[0], e[1], e[2]);
  return new Quat(-q.x, -q.y, -q.z, q.w).normalize();
}

function rotate(v: Vec3, q: Quat): Vec3 {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return new Vec3(
    ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
  );
}

function vec3(value: StageVector3): Vec3 {
  return new Vec3(value[0], value[1], value[2]);
}
