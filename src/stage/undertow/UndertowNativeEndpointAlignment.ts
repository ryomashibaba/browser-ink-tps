/**
 * Strict, read-only Undertow SOURCE endpoint alignment.
 *
 * A Recast nearest-poly result can terminate on another floor layer, and
 * auditPath().reachedTarget compares against the PROJECTED target. This gate
 * additionally compares the actual terminal with the requested SOURCE foot,
 * its Rapier witness, and the target's registered source solid identity.
 *
 * An aligned endpoint is NOT a continuous route, KCC, actor or score proof.
 * It never modifies stage geometry, off-mesh links or navigation settings.
 */
export type UndertowNativeEndpointHold =
  | 'NO_NATIVE_PATH'
  | 'INVALID_ENDPOINT_EVIDENCE'
  | 'NO_REQUESTED_SOURCE_SUPPORT'
  | 'RECAST_ENDPOINT_SNAP_TOO_FAR'
  | 'RECAST_PATH_TERMINAL_ERROR'
  | 'NO_TERMINAL_SOURCE_SUPPORT'
  | 'TERMINAL_REQUEST_DISTANCE_TOO_FAR'
  | 'TERMINAL_SOURCE_ID_MISMATCH'
  | 'ENDPOINT_ALIGNED_KCC_UNVERIFIED';

export type NativeSourcePoint = readonly [number, number, number];

export interface UndertowNativeEndpointEvidence {
  readonly requestedTarget: NativeSourcePoint;
  readonly targetRapierSupported: boolean;
  readonly targetSourceSolidId: string | null;
  readonly recastReachedProjectedTarget: boolean;
  readonly startSnapDistanceMeters: number;
  readonly endSnapDistanceMeters: number;
  readonly projectedEndpointErrorMeters: number;
  readonly actualTerminal: NativeSourcePoint | null;
  readonly terminalRapierSupported: boolean;
  readonly terminalSourceSolidId: string | null;
}

export interface UndertowNativeEndpointAlignment {
  readonly endpointAligned: boolean;
  readonly reason: UndertowNativeEndpointHold;
  readonly distanceToRequestedTargetMeters: number | null;
  readonly fullTrajectoryReplayed: false;
  readonly sourceRouteCertified: false;
  readonly runtimePromotionAuthorized: false;
}

const SOURCE_TOLERANCE_METERS = 0.25;

export function auditUndertowNativeEndpointAlignment(
  evidence: UndertowNativeEndpointEvidence
): UndertowNativeEndpointAlignment {
  const terminal = evidence.actualTerminal;
  const measuredDistance = terminal
    ? Math.hypot(
        terminal[0] - evidence.requestedTarget[0],
        terminal[1] - evidence.requestedTarget[1],
        terminal[2] - evidence.requestedTarget[2]
      )
    : null;

  const result = (reason: UndertowNativeEndpointHold):
    UndertowNativeEndpointAlignment => ({
      endpointAligned: reason === 'ENDPOINT_ALIGNED_KCC_UNVERIFIED',
      reason,
      distanceToRequestedTargetMeters:
        measuredDistance !== null && Number.isFinite(measuredDistance)
          ? measuredDistance : null,
      fullTrajectoryReplayed: false,
      sourceRouteCertified: false,
      runtimePromotionAuthorized: false
    });

  const validPoint = (point: NativeSourcePoint): boolean =>
    point.length === 3 && point.every(Number.isFinite);
  if (
    !validPoint(evidence.requestedTarget) ||
    (terminal !== null && !validPoint(terminal)) ||
    ![
      evidence.startSnapDistanceMeters,
      evidence.endSnapDistanceMeters,
      evidence.projectedEndpointErrorMeters
    ].every((value) => Number.isFinite(value) && value >= 0) ||
    (measuredDistance !== null && !Number.isFinite(measuredDistance))
  ) return result('INVALID_ENDPOINT_EVIDENCE');

  if (!evidence.targetRapierSupported || !evidence.targetSourceSolidId)
    return result('NO_REQUESTED_SOURCE_SUPPORT');
  if (!evidence.recastReachedProjectedTarget)
    return result('NO_NATIVE_PATH');
  if (
    evidence.startSnapDistanceMeters > SOURCE_TOLERANCE_METERS ||
    evidence.endSnapDistanceMeters > SOURCE_TOLERANCE_METERS
  ) return result('RECAST_ENDPOINT_SNAP_TOO_FAR');
  if (evidence.projectedEndpointErrorMeters > SOURCE_TOLERANCE_METERS)
    return result('RECAST_PATH_TERMINAL_ERROR');
  if (!terminal || !evidence.terminalRapierSupported ||
      !evidence.terminalSourceSolidId)
    return result('NO_TERMINAL_SOURCE_SUPPORT');
  if (measuredDistance === null || measuredDistance > SOURCE_TOLERANCE_METERS)
    return result('TERMINAL_REQUEST_DISTANCE_TOO_FAR');
  if (evidence.terminalSourceSolidId !== evidence.targetSourceSolidId)
    return result('TERMINAL_SOURCE_ID_MISMATCH');

  return result('ENDPOINT_ALIGNED_KCC_UNVERIFIED');
}
