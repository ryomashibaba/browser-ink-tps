import { describe, expect, it } from 'vitest';
import { validateStageMeasurementLedger } from '../measurement/StageMeasurementLedger';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER as ledger } from './UndertowSpillwayMeasurementLedger';

function assumption(id: string) {
  const found = ledger.assumptions.find((item) => item.id === id);
  if (!found) throw new Error(`missing assumption '${id}'`);
  return found;
}

function entry(id: string) {
  const found = ledger.entries.find((item) => item.id === id);
  if (!found) throw new Error(`missing measurement entry '${id}'`);
  return found;
}

function ruleFact(id: string) {
  const found = ledger.ruleFacts.find((item) => item.id === id);
  if (!found) throw new Error(`missing rule fact '${id}'`);
  return found;
}

describe('T21-A Undertow Spillway measurement ledger', () => {
  it('passes structural/evidence validation', () => {
    expect(validateStageMeasurementLedger(ledger)).toEqual([]);
  });

  it('targets normal PvP Ver.7.2.0+ without promoting old variants', () => {
    expect(ledger.sourceVersion).toContain('Ver.7.2.0+');
    expect(ledger.commonTerrainId).toBe('UndertowCommon');
  });

  it('freezes the central low floor as Y=0 but keeps metric map scale as HIGH', () => {
    expect(ledger.coordinateSystem.centerLowestFloorY).toBe(0);
    expect(ledger.coordinateSystem.centerLowestFloorConfidence).toBe('CONFIRMED');
    expect(assumption('map-pixels-per-meter')).toMatchObject({
      value: 20,
      unit: 'px/m',
      confidence: 'HIGH'
    });
  });

  it('does not promote provisional whole-stage extents to confirmed values', () => {
    expect(assumption('outer-span-x-meters').confidence).toBe('PROVISIONAL');
    expect(assumption('outer-span-z-meters').confidence).toBe('PROVISIONAL');
  });

  it('locks both spawn-side first descents as one-way drops only', () => {
    for (const id of ['team-a-first-drop', 'team-b-first-drop']) {
      const drop = entry(id);
      expect(drop.transition.kind).toBe('ONE_WAY_DROP');
      expect(drop.transition.confidence).toBe('CONFIRMED');
      expect(drop.surface.semantics).toContain('ONE_WAY_DROP');
      expect(drop.y.yMeters).toBeUndefined();
      expect(drop.y.candidatesMeters).toEqual([1.5, 3]);
      expect(drop.y.confidence).toBe('PROVISIONAL');
    }
  });

  it('keeps spawn absolute Y unresolved', () => {
    expect(entry('team-a-spawn-floor').y.confidence).toBe('UNKNOWN');
    expect(entry('team-a-spawn-floor').y.yMeters).toBeUndefined();
    expect(entry('team-b-spawn-floor').y.confidence).toBe('UNKNOWN');
    expect(entry('team-b-spawn-floor').y.yMeters).toBeUndefined();
  });

  it('keeps glass as gameplay geometry with explicit uninkable metadata', () => {
    expect(entry('upper-glass-platform').surface.semantics).toEqual(['UNINKABLE', 'GLASS']);
    expect(entry('upper-glass-platform').surface.confidence).toBe('CONFIRMED');
    expect(entry('upper-glass-underpass').confidence).toBe('CONFIRMED');
  });

  it('records two zones and preserves rule-specific geometry as variants', () => {
    expect(ruleFact('zones-two-objectives').values?.objectiveCount).toBe(2);
    expect(ruleFact('zones-two-objectives').confidence).toBe('CONFIRMED');
    expect(ruleFact('tower-glass-variant').rule).toBe('TOWER');
    expect(ruleFact('rainmaker-left-ramp').rule).toBe('RAINMAKER');
    expect(ruleFact('clams-return-ramp').rule).toBe('CLAMS');
  });
});
