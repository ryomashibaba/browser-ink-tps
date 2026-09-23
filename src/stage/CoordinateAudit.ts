import { Quat, Vec3 } from 'playcanvas';
import type { PaintSurface } from '../ink/PaintSurface';
import type { StageDefinition, StageSolidDefinition, StageVector3 } from './StageDefinition';

export interface CoordinateAuditResult {
  passed: boolean;
  checkedSurfaces: number;
  maxRoundTripErrorMeters: number;
  maxBackingGapMeters: number;
  summary: string;
}

export function auditStageCoordinates(
  surfaces: readonly PaintSurface[],
  definition: StageDefinition,
  backingGapToleranceMeters = 0.08
): CoordinateAuditResult {
  let maxRoundTripErrorMeters = 0;
  let maxBackingGapMeters = 0;

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

    const gap = backingFaceGap(surface, solid);
    maxBackingGapMeters = Math.max(maxBackingGapMeters, gap);
    if (gap > backingGapToleranceMeters) {
      throw new Error(
        `Coordinate audit: ${surface.id} is ${gap.toFixed(4)}m from ${solid.id} face.`
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
    summary:
      `PASS ${surfaces.length}/${surfaces.length} · round ${maxRoundTripErrorMeters.toExponential(1)}m · solid ${maxBackingGapMeters.toFixed(3)}m`
  };
}

function backingFaceGap(surface: PaintSurface, solid: StageSolidDefinition): number {
  const solidCenter = vec3(solid.center);
  const inverse = inverseRotation(solid);
  const localCenter = rotate(surface.center.clone().sub(solidCenter), inverse);
  const localNormal = rotate(surface.normal.clone(), inverse);
  const ax = Math.abs(localNormal.x);
  const ay = Math.abs(localNormal.y);
  const az = Math.abs(localNormal.z);

  let planeCoord: number;
  let halfExtent: number;
  if (ay >= ax && ay >= az) {
    planeCoord = Math.abs(localCenter.y);
    halfExtent = solid.size[1] * 0.5;
  } else if (az >= ax && az >= ay) {
    planeCoord = Math.abs(localCenter.z);
    halfExtent = solid.size[2] * 0.5;
  } else {
    planeCoord = Math.abs(localCenter.x);
    halfExtent = solid.size[0] * 0.5;
  }
  return Math.abs(planeCoord - halfExtent);
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
