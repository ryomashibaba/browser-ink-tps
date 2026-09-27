import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT } from './UndertowSpillwayUpperGlassMeshGeometry';

export type UndertowUpperGlassControlledCaptureId =
  | 'PLAYER_SUPPORT_COMPONENT_ROUTE'
  | 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
  | 'CAMERA_GLASS_EDGE_DIFFERENTIAL';

export type UndertowUpperGlassControlledCaptureStatus =
  | 'REQUEST_READY'
  | 'DEFERRED_UNTIL_PLAYER_SUPPORT_BINDING';

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
    status: 'REQUEST_READY',
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
    status: 'DEFERRED_UNTIL_PLAYER_SUPPORT_BINDING',
    blocks: ['UPPER_GLASS_COLLISION_AUTHORITY_PENDING'],
    userActionCount: 0,
    guidePath: 'docs/T21_UNDERTOW_PASS13A_UPPER_GLASS_SUPPORT_CAPTURE_GUIDE.svg',
    purpose:
      'Later isolate ordinary projectile blocking through proven glass interior versus an adjacent edge/grate control without reusing player-collision assumptions.',
    minimumCapture: [],
    acceptance: [],
    avoid: [
      'Do not request this until Pass 13A identifies a proven player-supporting Glass01 interior and a geometrically distinct edge/grate control.'
    ]
  },
  {
    id: 'CAMERA_GLASS_EDGE_DIFFERENTIAL',
    priority: 3,
    status: 'DEFERRED_UNTIL_PLAYER_SUPPORT_BINDING',
    blocks: ['UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'],
    userActionCount: 0,
    guidePath: 'docs/T21_UNDERTOW_PASS13A_UPPER_GLASS_SUPPORT_CAPTURE_GUIDE.svg',
    purpose:
      'Later isolate camera push-in/occlusion behavior at a proven Glass01 boundary without borrowing player/projectile query semantics.',
    minimumCapture: [],
    acceptance: [],
    avoid: [
      'Do not request this until the player-support route establishes which broad glass component and boundary can be registered reliably in current gameplay.'
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
  if (
    requestReady.length !== 1 ||
    requestReady[0] !== 'PLAYER_SUPPORT_COMPONENT_ROUTE'
  ) {
    errors.push('Pass 13A must request only the player-support route first');
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
