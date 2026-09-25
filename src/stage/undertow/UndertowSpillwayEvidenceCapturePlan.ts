import { UNDERTOW_VOID_AMBIGUITY_AUDIT } from './UndertowSpillwayVoidAmbiguity';

export type UndertowEvidenceCaptureId =
  | 'RIGHT_LOW_PARTITION'
  | 'GLASS_UNDERPASS_CLEARANCE'
  | 'INTERNAL_VOID_CLASSIFICATION';

export type UndertowEvidenceCaptureStatus =
  | 'CAPTURE_RECEIVED'
  | 'NOT_YET_CAPTURED'
  | 'DEFERRED_PENDING_MAP_ENUMERATION';

export interface UndertowEvidenceCapture {
  id: UndertowEvidenceCaptureId;
  priority: 1 | 2 | 3;
  status: UndertowEvidenceCaptureStatus;
  receivedEvidenceIds?: readonly string[];
  blocks: readonly string[];
  existingEvidence: string;
  unresolvedQuestion: string;
  minimumCapture: readonly string[];
  acceptance: readonly string[];
  avoid: readonly string[];
}

export const UNDERTOW_CAPTURE_REQUEST_POLICY = Object.freeze({
  mapAnnotationRequired: true,
  requiredMapAnnotations: [
    'CAPTURE_AREA',
    'START_POSITION',
    'ROUTE_OR_CAMERA_DIRECTION',
    'LOOK_AT_BOUNDARY',
    'SYMMETRIC_COUNTERPART_IF_ALLOWED'
  ] as const,
  notes:
    'Future user capture requests must include a marked stage map; prose-only location instructions are not sufficient.'
});

/**
 * Only the evidence still capable of changing T21-D gameplay geometry belongs
 * here. This is intentionally much narrower than a general stage reshoot.
 */
export const UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN:
  readonly UndertowEvidenceCapture[] = [
    {
      id: 'RIGHT_LOW_PARTITION',
      priority: 1,
      status: 'CAPTURE_RECEIVED',
      receivedEvidenceIds: ['user-right-low-capture-2026-09-25'],
      blocks: [
        'right-low-floor-outline',
        'right-low-floor',
        'right-small-drop-upper'
      ],
      existingEvidence:
        'The PDF fixes the first-drop and second-drop hard edges, while existing gameplay video confirms the low grassy/open area. Both edges border the same connected 2D source faces, so the low-elevation partition does not close in plan.',
      unresolvedQuestion:
        'Where does the right-low constant-height floor end, and which exits are steps versus continuous ramps into adjacent floor levels?',
      minimumCapture: [
        'One continuous slow clip starting on the measured right-small-drop upper edge, dropping into the right-low area, then walking its full perimeter clockwise.',
        'At every exit from the low area, stop and look down across the transition so the floor edge, wall and ramp/step relationship are visible together.',
        'Include the connection back toward center in the same clip; do not need to fire or paint.'
      ],
      acceptance: [
        'Every right-low boundary segment can be classified as wall, drop/step, continuous slope, or same-height open connection.',
        'At least two already-measured PDF landmarks are visible in the clip so the perimeter can be registered to plan coordinates.'
      ],
      avoid: [
        'Fast camera turns that hide the boundary.',
        'Only filming from the middle of the low area.',
        'Inferring a closed rectangle just because the PDF source face is closed elsewhere.'
      ]
    },
    {
      id: 'GLASS_UNDERPASS_CLEARANCE',
      priority: 2,
      status: 'CAPTURE_RECEIVED',
      receivedEvidenceIds: ['user-underpass-capture-2026-09-25'],
      blocks: [
        'glass-underpass-outline',
        'glass-lower-major-floor',
        'glass-overhang-high-reference'
      ],
      existingEvidence:
        'Current gameplay video and post-7.2 references confirm a traversable passage below the raised/glass structure. The PDF fixes the upper footprint but does not encode the lower-layer support-column clearance as an independent polygon.',
      unresolvedQuestion:
        'What is the exact walkable lower-layer footprint under the glass/raised structure, including support-column exclusions and the two entrance/exit widths?',
      minimumCapture: [
        'One continuous slow walk from one underpass entrance through to the opposite exit.',
        'At the entrance, each support column/corner, and the exit, stop briefly and look down so the floor boundary and column footprint are visible.',
        'Then turn around and walk back once, keeping the opposite wall/column side in view.'
      ],
      acceptance: [
        'Both passage sides, support-column exclusions, and entrance/exit openings can be registered against the known upper glass/source hard edges.',
        'No lower passage boundary is inferred solely from the upper glass rectangle.'
      ],
      avoid: [
        'A clip that only looks upward at the glass.',
        'Assuming the entire upper-glass projection is walkable below.',
        'Treating decorative/render geometry as collision without visual confirmation.'
      ]
    },
    {
      id: 'INTERNAL_VOID_CLASSIFICATION',
      priority: 3,
      status: 'DEFERRED_PENDING_MAP_ENUMERATION',
      blocks: ['fall-out-void-kill-boundary'],
      existingEvidence:
        'The exterior hard silhouette and cyan water hazards are exact. The current void audit resolves the central undercut pair and right-low/underpass overlap as traversable lower layers, but does not yet prove an exhaustive internal-void classification.',
      unresolvedQuestion:
        'Which remaining internal blank/open regions are lethal fall voids, and which are valid lower-layer passages or floors?',
      minimumCapture: [
        'Only the ambiguous internal gaps need to be shown; no full-stage reshoot.',
        'For each ambiguous gap, show the surrounding ledges from above and then the space below/behind from a reachable side if it is traversable.',
        'A short separate clip per ambiguous gap is acceptable.'
      ],
      acceptance: [
        'Each ambiguous region is classified as KILL/void or traversable lower-layer space with visible evidence.',
        'Mapped cyan water remains a separate WATER+KILL class rather than being merged with generic void.'
      ],
      avoid: [
        'Re-recording already-confirmed cyan water hazards.',
        'Classifying hidden space as void only because it appears blank on the top-down PDF.'
      ]
    }
  ];

export function undertowRequiredCaptureIds(): readonly UndertowEvidenceCaptureId[] {
  return UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN
    .filter((capture) => capture.status !== 'CAPTURE_RECEIVED')
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((capture) => capture.id);
}

/**
 * Capture IDs that may be requested from the user now. A deferred capture must
 * first have its genuinely ambiguous regions enumerated and marked on a stage
 * map, per UNDERTOW_CAPTURE_REQUEST_POLICY.
 */
export function undertowRequestReadyCaptureIds(): readonly UndertowEvidenceCaptureId[] {
  return UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN
    .filter(
      (capture) =>
        capture.status === 'NOT_YET_CAPTURED' &&
        (capture.id !== 'INTERNAL_VOID_CLASSIFICATION' ||
          UNDERTOW_VOID_AMBIGUITY_AUDIT.requestReady)
    )
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((capture) => capture.id);
}

export function undertowReceivedCaptureIds(): readonly UndertowEvidenceCaptureId[] {
  return UNDERTOW_TARGETED_EVIDENCE_CAPTURE_PLAN
    .filter((capture) => capture.status === 'CAPTURE_RECEIVED')
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((capture) => capture.id);
}
