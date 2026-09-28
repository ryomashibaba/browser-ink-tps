export type UndertowUserCaptureEvidenceId =
  | 'user-underpass-capture-2026-09-25'
  | 'user-right-low-capture-2026-09-25'
  | 'user-first-drop-height-stills-2026-09-26'
  | 'user-underpass-outside-zone-paint-stills-2026-09-27'
  | 'user-upper-glass-support-route-videos-2026-09-27'
  | 'user-upper-glass-ordinary-projectile-knowledge-2026-09-28'
  | 'user-upper-glass-camera-blocking-knowledge-2026-09-28'
  | 'user-upper-glass-thrown-sub-solid-collision-knowledge-2026-09-28'
  | 'user-upper-glass-sub-effect-and-placement-knowledge-2026-09-28'
  | 'user-upper-glass-player-underside-side-collision-knowledge-2026-09-28'
  | 'user-water-surface-contact-death-knowledge-2026-09-28'
  | 'user-water-pair-equivalence-knowledge-2026-09-28'
  | 'user-water-exterior-fallout-qualitative-relation-knowledge-2026-09-28'
  | 'user-internal-water-premise-correction-still-2026-09-28';

export interface UndertowUserCaptureEvidence {
  id: UndertowUserCaptureEvidenceId;
  filename?: string;
  filenames?: readonly string[];
  durationSeconds?: number;
  durationsSeconds?: readonly number[];
  region:
    | 'GLASS_UNDERPASS'
    | 'RIGHT_LOW'
    | 'GUIDE_LINE_SIDE_HEIGHT_ORDER'
    | 'GLASS_UNDERPASS_PAINT_OUTSIDE_ZONES'
    | 'UPPER_GLASS_PLAYER_SUPPORT_ROUTE'
    | 'UPPER_GLASS_ORDINARY_PROJECTILE_BLOCKING'
    | 'UPPER_GLASS_CAMERA_BLOCKING'
    | 'UPPER_GLASS_THROWN_SUB_SOLID_COLLISION'
    | 'UPPER_GLASS_SUB_EFFECT_AND_PLACEMENT'
    | 'UPPER_GLASS_PLAYER_UNDERSIDE_SIDE_COLLISION'
    | 'WATER_SURFACE_CONTACT_DEATH_RELATION'
    | 'WATER_PAIR_QUALITATIVE_EQUIVALENCE'
    | 'WATER_EXTERIOR_FALLOUT_QUALITATIVE_RELATION'
    | 'INTERNAL_WATER_PREMISE_CORRECTION';
  confidence: 'CONFIRMED';
  facts: readonly string[];
}

export const UNDERTOW_USER_CAPTURE_EVIDENCE:
  readonly UndertowUserCaptureEvidence[] = [
    {
      id: 'user-underpass-capture-2026-09-25',
      filename:
        '20260925-01M3CC7J9A5C9AE8YTYYE6HSHM-4D9D9F84-E6A2-4AF9-8A4B-D2534454E0B1.mp4',
      durationSeconds: 29.633333,
      region: 'GLASS_UNDERPASS',
      confidence: 'CONFIRMED',
      facts: [
        'The covered lower passage is traversable in current normal-PvP geometry.',
        'The passage has solid support/wall geometry that must be separated from the walkable floor.',
        'The passage is traversably connected to the adjacent low/open route; the perspective clip does not establish an exact canonical floor-to-floor Y delta.'
      ]
    },
    {
      id: 'user-right-low-capture-2026-09-25',
      filename:
        '20260925-01M3CC7W69VA9ZBR9NJWR0KYYG-7AD89BB0-8510-46E3-8C98-A64A14F92CAE.mp4',
      durationSeconds: 29.5,
      region: 'RIGHT_LOW',
      confidence: 'CONFIRMED',
      facts: [
        'The right-low area is a traversable low/open floor with grass and hard-edge boundaries.',
        'The measured small drop descends into this low/open floor.',
        'At least one ramp rises out of the right-low floor.',
        'The right-low route connects into the covered underpass; the perspective clip establishes connectivity, not equal canonical floor Y.'
      ]
    },
    {
      id: 'user-first-drop-height-stills-2026-09-26',
      filenames: ['IMG_6112.jpeg', 'IMG_6111.jpeg'],
      region: 'GUIDE_LINE_SIDE_HEIGHT_ORDER',
      confidence: 'CONFIRMED',
      facts: [
        'The user identifies the floor referred to as below the red guide line as lower than the floor referred to as below the blue guide line.',
        'The guide-line-side comparison does not independently identify either observed floor as a canonical first-drop-landing, right-small-drop-upper, or right-low node.',
        'The still pair establishes only a qualitative guide-line-side ordering; it does not establish canonical floor identities or an exact metric delta.'
      ]
    },
    {
      id: 'user-underpass-outside-zone-paint-stills-2026-09-27',
      filenames: ['IMG_6137.jpeg', 'IMG_6136.jpeg', 'IMG_6135.jpeg', 'IMG_6134.jpeg'],
      region: 'GLASS_UNDERPASS_PAINT_OUTSIDE_ZONES',
      confidence: 'CONFIRMED',
      facts: [
        'The four stills were supplied as the two Pass 12B mirrored-side probe pairs, in before/after order: IMG_6137 to IMG_6136 and IMG_6135 to IMG_6134.',
        'Each before/after pair keeps the local underpass floor and surrounding geometry visible; the after frame shows persistent yellow ordinary-main-weapon ink on the previously bare floor patch.',
        'The submission fulfills both independently registered outside-Zone probes from the Pass 12B capture guide, so both whole-underpass floor solids are authorized PAINTABLE without inferring the second side from symmetry.',
        'This evidence establishes paint acceptance only. It does not authorize Turf Scoreable semantics or any player/projectile/camera/navigation inference.'
      ]
    },
    {
      id: 'user-upper-glass-support-route-videos-2026-09-27',
      filenames: [
        '20260927-01M3HN7Q98CMTAKY4Q8C6065T0-8E9A036A-CC2D-4830-9440-2E47C5CC4217.mp4',
        '20260927-01M3HN7FFKQCWBEGX9Q4RQAR1S-9F48EC89-18C2-4CA7-8D17-73A5B958D977.mp4'
      ],
      durationsSeconds: [29.4, 17.233333],
      region: 'UPPER_GLASS_PLAYER_SUPPORT_ROUTE',
      confidence: 'CONFIRMED',
      facts: [
        'The user supplied two distinct mirrored-side continuous clips for the Pass 13A 1 -> 2 -> 3 support route.',
        'In both clips the player enters the transparent upper-glass platform, remains visibly supported while traversing across the broad glass interior, and reaches the far broad panel without a visible fall at either registered seam.',
        'The recorded support segments are approximately 21.5-29.2s in the 29.4s clip and 10.5-17.2s in the 17.233333s clip; surrounding pillar/frame/floor geometry remains visible for side/structure registration.',
        'No jump-assisted seam crossing is visible in the support segments; the result therefore supports the three broad Glass01 upward-component probe regions on each mirrored side independently.',
        'The narrow THIN_EDGE_STRIP was not independently probed and remains unresolved.',
        'This evidence resolves player-support geometry only. It does not establish projectile blocking, camera-query behavior, Turf Scoreable semantics, or prove that the original game collision primitive is literally the visual Glass01 mesh rather than a coincident hidden primitive.'
      ]
    },
    {
      id: 'user-upper-glass-ordinary-projectile-knowledge-2026-09-28',
      region: 'UPPER_GLASS_ORDINARY_PROJECTILE_BLOCKING',
      confidence: 'CONFIRMED',
      facts: [
        'The user states from direct gameplay knowledge that ordinary shots do not pass through Undertow glass at all.',
        'This resolves the current ordinary-main projectile behavior requested by Pass 13B without requiring a redundant controlled capture.',
        'The statement is scoped to ordinary shots through the glass body; it does not by itself resolve thrown subs, explosions around grate/edge geometry, camera-query behavior, or the identity of the original collision primitive.',
        'Future evidence requests should state their purpose first and should accept direct user gameplay knowledge when the user already knows the requested behavior reliably.'
      ]
    },
    {
      id: 'user-upper-glass-camera-blocking-knowledge-2026-09-28',
      region: 'UPPER_GLASS_CAMERA_BLOCKING',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 13C the user selects behavior A: when transparent Undertow glass lies between the character and third-person camera, the camera is pushed to the near side and does not pass through the glass.',
        'This direct gameplay knowledge resolves transparent-glass camera blocking behavior without requiring a redundant controlled capture.',
        'The answer does not identify whether the original game uses visible Glass01 triangles or a coincident hidden camera-query primitive, and it does not authorize untested thin-edge/frame geometry by itself.',
        'Player, projectile, camera and navigation authorities remain separate even where their observed blocking behavior agrees.'
      ]
    },
    {
      id: 'user-upper-glass-thrown-sub-solid-collision-knowledge-2026-09-28',
      region: 'UPPER_GLASS_THROWN_SUB_SOLID_COLLISION',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 13D the user selects behavior A and adds that Splash Bomb and similar thrown subs treat Undertow transparent glass like an ordinary wall, floor, or ceiling.',
        'The thrown sub body therefore does not pass through the transparent glass and uses ordinary solid-surface contact behavior rather than a glass-specific pass-through rule.',
        'This direct gameplay knowledge resolves thrown-sub body collision behavior without requiring a redundant controlled capture.',
        'The answer does not by itself resolve explosion/damage/ink propagation through or around the glass, exact bounce coefficients, or the identity of the original collision primitive.'
      ]
    },
    {
      id: 'user-upper-glass-sub-effect-and-placement-knowledge-2026-09-28',
      region: 'UPPER_GLASS_SUB_EFFECT_AND_PLACEMENT',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 13E the user states that Poison Mist and Point Sensor are the only sub-weapon exceptions whose area/query effects pass through Undertow transparent glass.',
        'Other sub-weapon cross-glass effects are blocked by the transparent glass; this includes the ordinary explosion/damage/ink side of the sub-weapon family rather than treating the glass as a generic effect-through surface.',
        'Poison Mist and Point Sensor are special non-solid area/query effects and must not be used to infer physical projectile, explosion, paint, player, or camera pass-through.',
        'Deployable subs such as Jump Beacon, Sprinkler, and Splash Shield can be placed on top of transparent glass like other ordinary solid floors.',
        'Trap is the explicit placement exception: it requires a paintable floor, so it cannot be placed on the unpaintable transparent glass surface.',
        'This knowledge resolves sub-weapon effect/placement semantics but still does not identify the original collision/query primitive or authorize unrelated special-weapon behavior.'
      ]
    },
    {
      id: 'user-upper-glass-player-underside-side-collision-knowledge-2026-09-28',
      region: 'UPPER_GLASS_PLAYER_UNDERSIDE_SIDE_COLLISION',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 13F the user states that jumping upward from directly below the transparent glass causes the player head/body to collide with the glass underside and stop; the player does not pass through from below.',
        'The user also states that lateral contact with the thin side/edge of the transparent glass stops the player like an ordinary wall rather than allowing passage through the transparent side.',
        'Together with Pass 13A top-surface support, direct gameplay knowledge now resolves the broad player-facing collision behavior of the transparent glass as solid from above, below, and from the side.',
        'This does not identify whether the original game uses visible Glass01 faces or a coincident hidden collision primitive, and it does not prove every tiny decorative/thin-strip face is represented one-for-one in collision.'
      ]
    },
    {
      id: 'user-water-surface-contact-death-knowledge-2026-09-28',
      region: 'WATER_SURFACE_CONTACT_DEATH_RELATION',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 14A the user selects behavior A: contacting the visible Undertow water surface results in death essentially immediately.',
        'This resolves the qualitative gameplay relationship that the visible surface and water-death trigger are not separated by a large perceptible vertical gap.',
        'The answer does not establish an exact visual-water world Y, an exact kill-threshold world Y, or a metric offset between them.',
        'The answer also does not establish whether exterior fall-out uses the same vertical death trigger as the two mapped internal water hazards.'
      ]
    },
    {
      id: 'user-water-pair-equivalence-knowledge-2026-09-28',
      region: 'WATER_PAIR_QUALITATIVE_EQUIVALENCE',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 14B the user selects behavior A: the two mapped Undertow water hazards appear to share the same visible surface height.',
        'The user also states that contacting either mapped water hazard produces the same essentially-immediate death behavior.',
        'This resolves qualitative pair equivalence for visible height and contact-death behavior, but does not establish an exact shared world Y, an exact zero-meter height delta, or numerically identical kill thresholds.',
        'The answer remains scoped to the two mapped internal water hazards and does not establish the relationship to exterior fall-out.'
      ]
    },
    {
      id: 'user-water-exterior-fallout-qualitative-relation-knowledge-2026-09-28',
      region: 'WATER_EXTERIOR_FALLOUT_QUALITATIVE_RELATION',
      confidence: 'CONFIRMED',
      facts: [
        'For Pass 14C the user selects behavior A: exterior stage fall-out appears to kill the player at roughly the same vertical band as the two mapped internal water hazards.',
        'This resolves a qualitative similarity between internal-water death height and exterior fall-out death height.',
        'The answer does not establish that both hazards literally share one death volume or an exactly identical numeric kill threshold.',
        'No exact world Y, exact threshold delta, or locator-instance binding is inferred from this gameplay recollection.'
      ]
    },
    {
      id: 'user-internal-water-premise-correction-still-2026-09-28',
      filename: 'IMG_6141.jpeg',
      region: 'INTERNAL_WATER_PREMISE_CORRECTION',
      confidence: 'CONFIRMED',
      facts: [
        'The Pass 14D guide marked this current normal-PvP location as an internal water target, but IMG_6141.jpeg shows the requested location as dry playable-stage terrain with grass/solid surfaces and no visible internal waterline.',
        'The user explicitly reports that there is no water at the requested location.',
        'This directly invalidates promotion of the Sunfish cyan source annotation at the observed target into confirmed current-gameplay WATER/KILL semantics.',
        'The user suggests that visible water may exist only outside the stage; that broader stage-wide statement remains a hypothesis and is not promoted from this single still.',
        'Pass 14A through 14D conclusions that depended on the existence of the two assumed internal water targets are superseded for current canonical use.'
      ]
    }
  ];

export function undertowCaptureEvidence(
  id: UndertowUserCaptureEvidenceId
): UndertowUserCaptureEvidence {
  const found = UNDERTOW_USER_CAPTURE_EVIDENCE.find((item) => item.id === id);
  if (!found) throw new Error(`missing Undertow capture evidence '${id}'`);
  return found;
}
