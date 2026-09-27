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
  round: '11C' as const,
  scope: 'CURRENT_SPLAT_ZONES_PLUS_PUBLIC_TURF_OCCLUSION_CLOSURE' as const,
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
  publicTurfPlanClosure: Object.freeze({
    pinnedSource: Object.freeze({
      bytes: 100311,
      sha256:
        '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f',
      pageWidthPoints: 841.920044,
      pageHeightPoints: 595.320007
    }),
    positiveZ: Object.freeze({
      pdfBounds: [406.329939, 326.926392, 452.398851, 369.853467] as const,
      medianBrightness: 191,
      nearWhiteFraction: 0.00968,
      darkOrGrayFraction: 0.99032,
      overlappingExplicitFillCount: 12,
      overlappingExplicitFillColors: [[0.752941, 0.752941, 0.752941]] as const,
      knownGlassOverhangOverlapFraction: 0.772975275,
      distinctWhiteFloorVectorFillRecovered: false,
      topViewOccludedByGlassClass: true
    }),
    negativeZ: Object.freeze({
      pdfBounds: [390.844732, 224.889955, 436.913645, 267.817031] as const,
      medianBrightness: 191,
      nearWhiteFraction: 0.005022,
      darkOrGrayFraction: 0.994978,
      overlappingExplicitFillCount: 32,
      overlappingExplicitFillColors: [[0.752941, 0.752941, 0.752941]] as const,
      knownGlassOverhangOverlapFraction: 0.735104264,
      distinctWhiteFloorVectorFillRecovered: false,
      topViewOccludedByGlassClass: true
    }),
    wholeUnderpassPaintAuthorityResolvedFromTurfPlan: false,
    runtimePromotionAuthorized: false,
    semanticConclusion:
      'The current Turf plan is a top-view author drawing in which the registered underpass footprint is visually dominated by the explicit gray Glass overhang class. The gray raster therefore describes the overlying glass, not the hidden floor paint authority. No distinct white underpass-floor fill is recovered, so the plan cannot classify the whole underpass remainder as either PAINTABLE or UNINKABLE.',
    notes:
      'Resolution Pass 11C turns the remaining public-source ambiguity into an explicit negative result. The pinned author plan can validate the bounded Splat-Zone intersections, but it cannot expose the paint semantics of the floor hidden beneath the glass overhang.'
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
    'Controlled current gameplay paint evidence for underpass floor cells outside the registered objective intersections, registered tightly enough to prove ink acceptance or rejection.',
    'Or current Temple01 per-face/per-collider paint metadata / paint-mask data that exposes the hidden under-glass floor independently of the top-view author glass overlay.'
  ] as const,
  activationBlockerCleared: false,
  notes:
    'Resolution Pass 8 promotes only two exact objective-intersection paint subregions. Passes 10A/10C resolve the separate route-ramp and first-drop families. Resolution Pass 11C exhausts the pinned public Turf-plan route for the remaining whole-underpass pair: the exact floor projections are visually occluded by the explicit gray Glass overhang class, so the plan cannot decide the hidden floor remainder. The two whole underpass solids therefore remain UNKNOWN and UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains active.'
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
    audit.round !== '11C' ||
    audit.publicTurfPlanClosure.pinnedSource.bytes !== 100311 ||
    audit.publicTurfPlanClosure.pinnedSource.sha256 !==
      '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f' ||
    audit.publicTurfPlanClosure.positiveZ.medianBrightness !== 191 ||
    audit.publicTurfPlanClosure.negativeZ.medianBrightness !== 191 ||
    audit.publicTurfPlanClosure.positiveZ.darkOrGrayFraction < 0.98 ||
    audit.publicTurfPlanClosure.negativeZ.darkOrGrayFraction < 0.98 ||
    audit.publicTurfPlanClosure.positiveZ.knownGlassOverhangOverlapFraction < 0.70 ||
    audit.publicTurfPlanClosure.negativeZ.knownGlassOverhangOverlapFraction < 0.70 ||
    audit.publicTurfPlanClosure.positiveZ.distinctWhiteFloorVectorFillRecovered ||
    audit.publicTurfPlanClosure.negativeZ.distinctWhiteFloorVectorFillRecovered ||
    !audit.publicTurfPlanClosure.positiveZ.topViewOccludedByGlassClass ||
    !audit.publicTurfPlanClosure.negativeZ.topViewOccludedByGlassClass ||
    audit.publicTurfPlanClosure.wholeUnderpassPaintAuthorityResolvedFromTurfPlan ||
    audit.publicTurfPlanClosure.runtimePromotionAuthorized
  ) {
    errors.push('Pass 11C public Turf-plan underpass closure drifted or overpromoted hidden-floor paint authority');
  }

  if (
    audit.runtimeState.underpassPaintSurfaceCount !== 2 ||
    audit.runtimeState.unresolvedPaintSolidCount !== 2 ||
    !audit.runtimeState.underpassRecordsRemainUnknown ||
    !audit.runtimeState.wholeUnderpassStillNotPaintable
  ) {
    errors.push('runtime underpass paint state drifted from partial-only promotion');
  }

  if (audit.nextEvidenceNeeded.length !== 2) {
    errors.push('remaining underpass paint evidence gap is not sufficiently localized');
  }

  if (audit.activationBlockerCleared) {
    errors.push('Pass 11C must not clear the remaining solid-level paint blocker');
  }

  return errors;
}
