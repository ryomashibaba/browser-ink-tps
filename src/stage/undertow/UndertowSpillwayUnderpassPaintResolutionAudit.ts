import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_UNDERPASS_NAV_AUDIT
} from './UndertowSpillwayModelXZGeometry';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';
import { UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION } from './UndertowSpillwayZonesVectorGeometry';

const UNDERPASS_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z'
] as const;

const underpassGeometry = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
  item.id.startsWith('glass-underpass-')
);

export const UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT = Object.freeze({
  round: 8,
  scope: 'CURRENT_SPLAT_ZONES_UNDER_GLASS_REGISTRATION' as const,
  currentModeEvidence: Object.freeze({
    sunfishBlueprintUpdated: '2024-05-06',
    postVer720Layout: true,
    legendDefinesZoneBoundary: true,
    legendZoneBoundaryDescription:
      'Range enclosed by the dash-dot line is the Splat Zone.',
    blueprintShowsTwoBoundedZonesUnderCentralGlass: true,
    inikipediaSaysBothZonesUnderGlassAreas: true,
    currentStrategyGuideSaysZonesAreUnderHighPlatformsAndMustBePainted: true,
    objectiveSubregionPaintabilityConfirmed: true,
    notes:
      'Independent current-layout references agree that two Splat Zones sit beneath the glass/high-platform areas. Resolution Pass 8 now adds exact current vector boundaries rather than inferring the whole roofed floor.'
  }),
  exactUnderpassGeometry: Object.freeze({
    componentCount: underpassGeometry.length,
    modelY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYModelMeters,
    projectY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYProjectMeters,
    roofedFloorCellsPerSide: UNDERTOW_UNDERPASS_NAV_AUDIT.roofedFloorCellsPerSide,
    floorObstacleCellsPerSide: UNDERTOW_UNDERPASS_NAV_AUDIT.floorObstacleCellsPerSide,
    walkableCellsPerSide: UNDERTOW_UNDERPASS_NAV_AUDIT.walkableCellsPerSide,
    walkableAreaSquareMetersPerSide:
      UNDERTOW_UNDERPASS_NAV_AUDIT.walkableAreaSquareMetersPerSide,
    oneSupportHolePerSide: underpassGeometry.every(
      (item) => item.projectHoles.length === 1
    ),
    mirrorXorCells: UNDERTOW_UNDERPASS_NAV_AUDIT.mirrorXorCells,
    notes:
      'The runtime underpass solids remain the audited model-Y=3.0/project-Y=0 roofed walkable masks after subtracting floor-level Pillar/Wall exclusions.'
  }),
  registrationBoundary: Object.freeze({
    underGlassFamilyIdentityResolved: true,
    somePaintableSubregionResolved: true,
    exactZoneFootprintRegisteredToMeters: true,
    exactZoneUnderpassIntersectionRegistered: true,
    negativeZRegisteredPaintAreaSquareMeters:
      UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.negativeZ.areaSquareMeters,
    positiveZRegisteredPaintAreaSquareMeters:
      UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.positiveZ.areaSquareMeters,
    objectiveSubregionPaintSurfaceAuthorized: true,
    zoneEqualsWholeUnderpassFloor: false,
    wholeUnderpassPaintAuthorityResolved: false,
    wholeUnderpassRuntimePromotionAuthorized: false,
    notes:
      'The exact zone rings are intersected with the audited project-Y=0 underpass footprints. Only those intersections receive PaintSurfaces; the remainder of each larger underpass solid stays UNKNOWN.'
  }),
  runtimeState: Object.freeze({
    underpassPaintSurfaceCount:
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
        UNDERPASS_RUNTIME_SOLID_IDS.includes(
          surface.backingSolidId as (typeof UNDERPASS_RUNTIME_SOLID_IDS)[number]
        )
      ).length,
    unresolvedPaintSolidCount: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
    underpassRecordsRemainUnknown: UNDERPASS_RUNTIME_SOLID_IDS.every((id) => {
      const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
        (candidate) => candidate.runtimeSolidId === id
      );
      return record?.authority === 'UNKNOWN';
    }),
    wholeUnderpassStillNotPaintable: UNDERPASS_RUNTIME_SOLID_IDS.every((id) =>
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces
        .filter((surface) => surface.backingSolidId === id)
        .every((surface) => surface.footprint !== undefined)
    )
  }),
  nextEvidenceNeeded: [
    'Separate current evidence for underpass floor cells outside the registered objective intersections before promoting any remainder of either underpass solid.'
  ] as const,
  activationBlockerCleared: false,
  notes:
    'Resolution Pass 8 itself promotes only two exact objective-intersection paint subregions. Resolution Pass 10A later resolves the separate right-low route-ramp pair, and Resolution Pass 10C resolves the separate first-drop landing pair, so the current inventory has two solid-level UNKNOWN records. The two whole underpass solids remain UNKNOWN outside their registered zone intersections, and UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains active.'
});

export function undertowUnderpassPaintResolutionAuditErrors(): readonly string[] {
  const audit = UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT;
  const errors: string[] = [];

  if (
    !audit.currentModeEvidence.postVer720Layout ||
    !audit.currentModeEvidence.legendDefinesZoneBoundary ||
    !audit.currentModeEvidence.blueprintShowsTwoBoundedZonesUnderCentralGlass ||
    !audit.currentModeEvidence.inikipediaSaysBothZonesUnderGlassAreas ||
    !audit.currentModeEvidence.currentStrategyGuideSaysZonesAreUnderHighPlatformsAndMustBePainted ||
    !audit.currentModeEvidence.objectiveSubregionPaintabilityConfirmed
  ) {
    errors.push('current under-glass Splat-Zone paint evidence drifted');
  }

  if (
    audit.exactUnderpassGeometry.componentCount !== 2 ||
    audit.exactUnderpassGeometry.modelY !== 3 ||
    audit.exactUnderpassGeometry.projectY !== 0 ||
    !audit.exactUnderpassGeometry.oneSupportHolePerSide ||
    audit.exactUnderpassGeometry.mirrorXorCells !== 0
  ) {
    errors.push('exact underpass geometry registration drifted');
  }

  if (
    !audit.registrationBoundary.underGlassFamilyIdentityResolved ||
    !audit.registrationBoundary.somePaintableSubregionResolved ||
    !audit.registrationBoundary.exactZoneFootprintRegisteredToMeters ||
    !audit.registrationBoundary.exactZoneUnderpassIntersectionRegistered ||
    !audit.registrationBoundary.objectiveSubregionPaintSurfaceAuthorized ||
    audit.registrationBoundary.zoneEqualsWholeUnderpassFloor ||
    audit.registrationBoundary.wholeUnderpassPaintAuthorityResolved ||
    audit.registrationBoundary.wholeUnderpassRuntimePromotionAuthorized
  ) {
    errors.push('objective subregion registration overpromoted whole-underpass authority');
  }

  if (
    audit.runtimeState.underpassPaintSurfaceCount !== 2 ||
    audit.runtimeState.unresolvedPaintSolidCount !== 2 ||
    !audit.runtimeState.underpassRecordsRemainUnknown ||
    !audit.runtimeState.wholeUnderpassStillNotPaintable
  ) {
    errors.push('runtime underpass paint state drifted from partial-only promotion');
  }

  if (audit.nextEvidenceNeeded.length !== 1) {
    errors.push('remaining underpass paint evidence gap is not sufficiently localized');
  }

  if (audit.activationBlockerCleared) {
    errors.push('Pass 8 must not clear the remaining solid-level paint blocker');
  }

  return errors;
}
