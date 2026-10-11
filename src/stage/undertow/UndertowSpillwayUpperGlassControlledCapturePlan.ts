import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT } from './UndertowSpillwayUpperGlassMeshGeometry';

export type UndertowUpperGlassControlledCaptureId =
  | 'PLAYER_SUPPORT_COMPONENT_ROUTE'
  | 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
  | 'CAMERA_GLASS_EDGE_DIFFERENTIAL';

export type UndertowUpperGlassControlledCaptureStatus =
  | 'REQUEST_READY'
  | 'RESOLVED'
  | 'DEFERRED_UNTIL_PLAYER_SUPPORT_BINDING'
  | 'DEFERRED_UNTIL_PROJECTILE_BINDING';

export type UndertowUpperGlassComponentId =
  | 'CONNECTOR_SURFACE'
  | 'LOWER_PANEL'
  | 'UPPER_PANEL'
  | 'THIN_EDGE_STRIP';

export interface UndertowUpperGlassComponentProbe {
  id: UndertowUpperGlassComponentId;
  sourceComponentIndex: 0 | 1 | 2 | 3;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  areaSquareMeters: number;
  routePointProjectXZ: readonly [number, number];
  minRoutePointBoundaryClearanceMeters: number;
  directSupportProbe: boolean;
  notes: string;
}

export interface UndertowUpperGlassControlledCapture {
  id: UndertowUpperGlassControlledCaptureId;
  priority: 1 | 2 | 3;
  status: UndertowUpperGlassControlledCaptureStatus;
  blocks: readonly (
    | 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
    | 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
  )[];
  userActionCount: number;
  guidePath: string;
  purpose: string;
  minimumCapture: readonly string[];
  acceptance: readonly string[];
  avoid: readonly string[];
}

export const UNDERTOW_UPPER_GLASS_COMPONENT_PROBES:
  readonly UndertowUpperGlassComponentProbe[] = [
  {
    id: 'CONNECTOR_SURFACE',
    sourceComponentIndex: 0,
    side: 'POSITIVE_Z',
    areaSquareMeters: 33.509603,
    routePointProjectXZ: [-7.038142, 6.780257],
    minRoutePointBoundaryClearanceMeters: 1.577254,
    directSupportProbe: true,
    notes:
      'Largest connected upward-facing Glass01 component. The route point is well inside the component and away from the visible edge/frame.'
  },
  {
    id: 'LOWER_PANEL',
    sourceComponentIndex: 1,
    side: 'POSITIVE_Z',
    areaSquareMeters: 27.06649,
    routePointProjectXZ: [-9.831115, 8.149488],
    minRoutePointBoundaryClearanceMeters: 1.422493,
    directSupportProbe: true,
    notes:
      'Lower near-flat Glass01 panel. It approaches the connector component to about 0.104m at the audited visual seam.'
  },
  {
    id: 'UPPER_PANEL',
    sourceComponentIndex: 2,
    side: 'POSITIVE_Z',
    areaSquareMeters: 12.602506,
    routePointProjectXZ: [-4.888742, 5.726533],
    minRoutePointBoundaryClearanceMeters: 0.644124,
    directSupportProbe: true,
    notes:
      'Upper near-flat Glass01 panel. It approaches the connector component to about 0.104m at the audited visual seam.'
  },
  {
    id: 'THIN_EDGE_STRIP',
    sourceComponentIndex: 3,
    side: 'POSITIVE_Z',
    areaSquareMeters: 1.248464,
    routePointProjectXZ: [-4.259322, 5.417965],
    minRoutePointBoundaryClearanceMeters: 0.046493,
    directSupportProbe: false,
    notes:
      'Narrow upward-facing strip close to the upper panel. The available interior clearance is too small for a robust standalone player-footprint probe, so it is explicitly excluded from the first capture request.'
  },
  {
    id: 'CONNECTOR_SURFACE',
    sourceComponentIndex: 0,
    side: 'NEGATIVE_Z',
    areaSquareMeters: 33.509606,
    routePointProjectXZ: [7.26751, -6.585693],
    minRoutePointBoundaryClearanceMeters: 1.577254,
    directSupportProbe: true,
    notes:
      'Registered counterpart of the largest Glass01 component; tested independently rather than inferred from symmetry.'
  },
  {
    id: 'LOWER_PANEL',
    sourceComponentIndex: 1,
    side: 'NEGATIVE_Z',
    areaSquareMeters: 27.066488,
    routePointProjectXZ: [10.060483, -7.954924],
    minRoutePointBoundaryClearanceMeters: 1.422493,
    directSupportProbe: true,
    notes:
      'Registered counterpart lower panel; tested independently rather than inferred from symmetry.'
  },
  {
    id: 'UPPER_PANEL',
    sourceComponentIndex: 2,
    side: 'NEGATIVE_Z',
    areaSquareMeters: 12.602504,
    routePointProjectXZ: [5.11811, -5.531968],
    minRoutePointBoundaryClearanceMeters: 0.644124,
    directSupportProbe: true,
    notes:
      'Registered counterpart upper panel; tested independently rather than inferred from symmetry.'
  },
  {
    id: 'THIN_EDGE_STRIP',
    sourceComponentIndex: 3,
    side: 'NEGATIVE_Z',
    areaSquareMeters: 1.248464,
    routePointProjectXZ: [4.48869, -5.223401],
    minRoutePointBoundaryClearanceMeters: 0.046493,
    directSupportProbe: false,
    notes:
      'Registered counterpart narrow strip; deferred because it does not admit a robust standalone interior support probe.'
  }
] as const;

export const UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES = Object.freeze({
  positiveZ: [
    [-9.831115, 8.149488],
    [-7.038142, 6.780257],
    [-4.888742, 5.726533]
  ] as const,
  negativeZ: [
    [10.060483, -7.954924],
    [7.26751, -6.585693],
    [5.11811, -5.531968]
  ] as const,
  notes:
    'Each route intentionally crosses the lower-panel -> connector -> upper-panel visual seams. The thin edge strip is not used as a direct support probe because its interior clearance is only about 0.046m.'
});

export const UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN:
  readonly UndertowUpperGlassControlledCapture[] = [
  {
    id: 'PLAYER_SUPPORT_COMPONENT_ROUTE',
    priority: 1,
    status: 'RESOLVED',
    blocks: ['UPPER_GLASS_COLLISION_AUTHORITY_PENDING'],
    userActionCount: 2,
    guidePath: 'docs/T21_UNDERTOW_PASS13A_UPPER_GLASS_SUPPORT_CAPTURE_GUIDE.svg',
    purpose:
      'Bind current player support behavior to the three broad registered upward Glass01 components on both sides before any collision/navigation runtime promotion.',
    minimumCapture: [
      'Record one short continuous clip on each mirrored glass structure.',
      'Start on the marked lower-panel point 1, walk slowly through point 2 on the connector, then through point 3 on the upper panel without jumping or using movement specials.',
      'Pause briefly at points 1, 2 and 3 so player support is visually unambiguous, and keep the glass frame plus nearby floor landmarks in view.',
      'Use the full-stage guide for orientation and the zoomed inset for the exact route; both sides must be captured independently.'
    ],
    acceptance: [
      'The player remains supported at all three numbered interior points on each side.',
      'The player crosses both registered Glass01 visual seams continuously, or any loss of support is clearly localized to a seam.',
      'The clip contains enough surrounding geometry to register the observed route to the marked side rather than relying on visual symmetry.',
      'A negative result is equally authoritative if the player cannot enter or remain supported on a marked component.'
    ],
    avoid: [
      'Do not jump across a seam; jumping can hide a non-collidable gap.',
      'Do not treat the thin edge strip as tested by proximity to point 3.',
      'Do not infer projectile or camera-query behavior from player support.',
      'Do not promote the whole Glass01 shell merely because all three broad upward components are walkable.'
    ]
  },
  {
    id: 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL',
    priority: 2,
    status: 'RESOLVED',
    blocks: ['UPPER_GLASS_COLLISION_AUTHORITY_PENDING'],
    userActionCount: 0,
    guidePath: 'docs/T21_UNDERTOW_PASS13B_UPPER_GLASS_PROJECTILE_CAPTURE_GUIDE.svg',
    purpose:
      'Resolve ordinary-main projectile blocking at the proven broad Glass01 connector interior on both mirrored sides without borrowing player-collision or camera-query semantics.',
    minimumCapture: [
      'Use a fresh Recon state, or otherwise keep the lower-floor target directly below marked point 2 completely unpainted before the shot test.',
      'Use an ordinary shooter main weapon, not a roller, bomb, special or thrown sub.',
      'On each side, stand at marked point 2, aim steeply downward through the transparent glass interior and fire a short five-shot burst while keeping the reticle away from the black frame.',
      'Immediately move to the lower underpass and show the same target floor patch for at least three seconds; keep surrounding pillar/frame landmarks visible so the target can be registered.',
      'Repeat independently on the mirrored glass structure.'
    ],
    acceptance: [
      'If the registered lower-floor target stays clean after the five ordinary shots, the tested glass interior blocks that projectile class.',
      'If the registered lower-floor target receives fresh ink, the tested projectile class passes through the glass interior.',
      'Both mirrored sides must produce an independently visible result; do not fill a missing side from symmetry.',
      'The capture establishes ordinary-main projectile behavior only; thrown-sub and camera behavior remain separate.'
    ],
    avoid: [
      'Do not sweep the reticle across the black frame; a frame hit cannot resolve transparent-glass projectile behavior.',
      'Do not pre-paint the lower-floor target patch.',
      'Do not use the thin edge strip as the projectile test point.',
      'Do not infer camera collision from the projectile result.'
    ]
  },
  {
    id: 'CAMERA_GLASS_EDGE_DIFFERENTIAL',
    priority: 3,
    status: 'RESOLVED',
    blocks: ['UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'],
    userActionCount: 0,
    guidePath: 'docs/T21_UNDERTOW_PASS13A_UPPER_GLASS_SUPPORT_CAPTURE_GUIDE.svg',
    purpose:
      'Determine whether the third-person camera treats Undertow transparent glass as a camera-collision/occlusion obstacle, independently from player and projectile collision.',
    minimumCapture: [
      'First ask the user whether they already know the camera behavior from gameplay; accept a clear direct-knowledge answer without requiring a redundant capture.',
      'Only if the behavior is unknown, design a context-rich full-terrain guide and a short controlled camera-boundary capture.'
    ],
    acceptance: [
      'A reliable direct gameplay-knowledge answer clearly states whether the camera is pushed/occluded by transparent glass or can remain/view through it.',
      'If a capture is needed, the observed camera response must be registered to the glass body rather than a black frame or nearby wall.'
    ],
    avoid: [
      'Do not infer camera behavior from ordinary projectile blocking.',
      'Do not require a capture when the user already knows the requested gameplay behavior reliably.'
    ]
  }
] as const;

export function undertowRequestReadyUpperGlassCaptureIds():
  readonly UndertowUpperGlassControlledCaptureId[] {
  return UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN
    .filter((capture) => capture.status === 'REQUEST_READY')
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((capture) => capture.id);
}

export function undertowUpperGlassControlledCapturePlanErrors():
  readonly string[] {
  const errors: string[] = [];

  if (
    UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.facesPerSide !== 102 ||
    UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.verticesPerSide !== 88 ||
    UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.collisionAuthorityReady
  ) {
    errors.push('Pass 13A must remain anchored to the audited render-only Glass01 source pair');
  }

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.fullTerrainContextRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.outlineOnlyMapForbidden ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.detailInsetRequiredWhenTargetIsSmall
  ) {
    errors.push('Pass 13A capture guide must use the context-rich full-terrain map policy');
  }

  const requestReady = undertowRequestReadyUpperGlassCaptureIds();
  if (requestReady.length !== 0) {
    errors.push('after Pass 13C, no completed upper-glass behavior question may remain request-ready');
  }

  const direct = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
    (probe) => probe.directSupportProbe
  );
  if (
    direct.length !== 6 ||
    direct.some((probe) => probe.minRoutePointBoundaryClearanceMeters < 0.6)
  ) {
    errors.push('direct support probes must remain the three broad, well-interior components per side');
  }

  const thin = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
    (probe) => probe.id === 'THIN_EDGE_STRIP'
  );
  if (
    thin.length !== 2 ||
    thin.some(
      (probe) =>
        probe.directSupportProbe ||
        probe.minRoutePointBoundaryClearanceMeters >= 0.1
    )
  ) {
    errors.push('thin edge strip must remain excluded from standalone support probing');
  }

  if (
    UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.positiveZ.length !== 3 ||
    UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.negativeZ.length !== 3
  ) {
    errors.push('each Pass 13A player-support route must contain exactly three broad Glass01 probes');
  }

  return errors;
}
