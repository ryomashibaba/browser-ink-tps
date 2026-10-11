import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT,
  undertowUpperGlassSubEffectPlacementResolutionAuditErrors
} from './UndertowSpillwayUpperGlassSubEffectPlacementResolutionAudit';

describe('T21 Resolution Pass 13E sub-effect / placement knowledge', () => {
  it('states the purpose and freezes the two cross-glass effect exceptions', () => {
    const audit = UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('which sub-weapon effects');
    expect(audit.evidence.crossGlassEffectPassThroughExceptions).toEqual([
      'POISON_MIST',
      'POINT_SENSOR'
    ]);
    expect(audit.evidence.allOtherSubWeaponCrossGlassEffectsBlocked).toBe(true);
    expect(audit.evidence.poisonMistAndPointSensorAreAreaQueryExceptions).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('separates ordinary deployable placement from the Trap paintability exception', () => {
    const audit = UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT;
    expect(audit.evidence.deployableSubPlacementOnGlassGenerallyAllowed).toBe(true);
    expect(audit.evidence.deployablePlacementExamples).toEqual([
      'JUMP_BEACON',
      'SPRINKLER',
      'SPLASH_SHIELD'
    ]);
    expect(audit.evidence.trapPlacementRequiresPaintableFloor).toBe(true);
    expect(audit.evidence.trapPlacementOnTransparentGlassAllowed).toBe(false);
    expect(audit.resolved.deployableSubPlacementSemantics).toBe(true);
  });

  it('keeps exact primitive and unrelated special-weapon semantics unresolved', () => {
    const audit = UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT;
    expect(audit.unresolved.exactOriginalCollisionOrQueryPrimitive).toBe(true);
    expect(audit.unresolved.unrelatedSpecialWeaponPropagation).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
    expect(undertowUpperGlassSubEffectPlacementResolutionAuditErrors()).toEqual([]);
  });
});
