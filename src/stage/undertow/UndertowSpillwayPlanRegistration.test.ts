import { describe, expect, it } from 'vitest';
import {
  invalidUndertowPlanRegistrationAnchorIds,
  promotableUndertowPlanRegistrationIds,
  UNDERTOW_PLAN_REGISTRATIONS
} from './UndertowSpillwayPlanRegistration';

describe('T21-B Undertow targeted-capture plan registration', () => {
  it('binds both received captures to measured vector-plan landmarks', () => {
    expect(invalidUndertowPlanRegistrationAnchorIds()).toEqual([]);

    expect(
      UNDERTOW_PLAN_REGISTRATIONS.find(
        (item) => item.id === 'right-low-floor-outline'
      )?.planAnchorTraceIds
    ).toEqual(['team-a-right-small-drop-lip']);

    expect(
      UNDERTOW_PLAN_REGISTRATIONS.find(
        (item) => item.id === 'glass-underpass-outline'
      )?.planAnchorTraceIds
    ).toEqual(['positive-z-glass-overhang']);
  });

  it('does not invent a closed polygon from perspective footage', () => {
    expect(promotableUndertowPlanRegistrationIds()).toEqual([]);

    for (const registration of UNDERTOW_PLAN_REGISTRATIONS) {
      expect(registration.status).toBe('PLAN_REGISTERED_POLYGON_UNRESOLVED');
      expect(registration.safeToPromoteTrace).toBe(false);
      expect(registration.unresolvedBecause.length).toBeGreaterThan(0);
    }
  });

  it('records the specific geometric blocker for each capture', () => {
    const rightLow = UNDERTOW_PLAN_REGISTRATIONS.find(
      (item) => item.id === 'right-low-floor-outline'
    );
    const underpass = UNDERTOW_PLAN_REGISTRATIONS.find(
      (item) => item.id === 'glass-underpass-outline'
    );

    expect(rightLow?.unresolvedBecause.join(' ')).toContain(
      'second independent measured plan anchor'
    );
    expect(underpass?.unresolvedBecause.join(' ')).toContain(
      'no independent lower-layer support/clearance outline'
    );
  });
});
