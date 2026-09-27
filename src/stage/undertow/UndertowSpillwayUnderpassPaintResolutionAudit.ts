import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_UNDERPASS_NAV_AUDIT
} from './UndertowSpillwayModelXZGeometry';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';

const UNDERPASS_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z'
] as const;

const underpassGeometry = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
  item.id.startsWith('glass-underpass-')
);

export const UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT = Object.freeze({
  round: 6,
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
      'Independent current-layout references agree that two Splat Zones sit beneath the glass/high-platform areas. A Splat Zone must accept ink for objective control. The Sunfish current-layout plan also depicts each objective as a bounded subregion rather than the entire roofed lower floor.'
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
      'The runtime underpass solids are the exact model-Y=3.0/project-Y=0 roofed walkable masks after subtracting floor-level Pillar/Wall exclusions.'
  }),
  registrationBoundary: Object.freeze({
    underGlassFamilyIdentityResolved: true,
    somePaintableSubregionResolved: true,
    exactZoneFootprintRegisteredToMeters: false,
    zoneEqualsWholeUnderpassFloor: false,
    wholeUnderpassPaintAuthorityResolved: false,
    runtimePromotionAuthorized: false,
    notes:
      'Knowing that a paintable objective lies under each glass platform is not enough to mark every cell of the larger roofed underpass floor PAINTABLE. The exact dash-dot zone boundary must be vector-extracted and registered before a partial paint surface can be emitted; separate evidence is still required for floor cells outside that objective.'
  }),
  runtimeState: Object.freeze({
    underpassPaintSurfaceCount:
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
        surface.id.includes('glass-underpass-')
      ).length,
    unresolvedPaintSolidCount: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
    underpassRecordsRemainUnknown: UNDERPASS_RUNTIME_SOLID_IDS.every((id) => {
      const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
        (candidate) => candidate.runtimeSolidId === id
      );
      return record?.authority === 'UNKNOWN';
    })
  }),
  nextEvidenceNeeded: [
    'Vector-extract the two dash-dot Splat-Zone polygons from the current Sunfish Splat Zones PDF and register them to the already calibrated Undertow plan coordinate frame.',
    'Create objective-subregion PaintSurface definitions only if those registered polygons lie on the exact project-Y=0 underpass floor.',
    'Do not promote the remaining underpass cells unless separate current evidence proves their ink acceptance.'
  ] as const,
  activationBlockerCleared: false,
  notes:
    'Resolution Pass 6 confirms partial paintability beneath the glass but intentionally makes no runtime promotion. UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains with six unknown solids because the current runtime inventory is solid-level and the exact Splat-Zone sub-polygons are not yet registered.'
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
    audit.registrationBoundary.exactZoneFootprintRegisteredToMeters ||
    audit.registrationBoundary.zoneEqualsWholeUnderpassFloor ||
    audit.registrationBoundary.wholeUnderpassPaintAuthorityResolved ||
    audit.registrationBoundary.runtimePromotionAuthorized
  ) {
    errors.push('partial zone evidence must not become whole-underpass paint authority');
  }

  if (
    audit.runtimeState.underpassPaintSurfaceCount !== 0 ||
    audit.runtimeState.unresolvedPaintSolidCount !== 6 ||
    !audit.runtimeState.underpassRecordsRemainUnknown
  ) {
    errors.push('runtime underpass paint state must remain unresolved and unpromoted');
  }

  if (audit.nextEvidenceNeeded.length !== 3) {
    errors.push('underpass paint evidence gap is not sufficiently localized');
  }

  if (audit.activationBlockerCleared) {
    errors.push('Resolution Pass 6 must not clear the remaining paint blocker');
  }

  return errors;
}
