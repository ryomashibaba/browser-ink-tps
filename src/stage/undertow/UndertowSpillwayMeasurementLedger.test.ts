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

  it('keeps whole-stage extents provisional in the chosen X/Z orientation', () => {
    expect(assumption('outer-span-x-meters')).toMatchObject({ value: 87, confidence: 'PROVISIONAL' });
    expect(assumption('outer-span-z-meters')).toMatchObject({ value: 146, confidence: 'PROVISIONAL' });
  });

  it('locks both spawn-side first descents as one-way drops only', () => {
    for (const id of ['team-a-first-drop', 'team-b-first-drop']) {
      const drop = entry(id);
      expect(drop.transition.kind).toBe('ONE_WAY_DROP');
      expect(drop.transition.confidence).toBe('CONFIRMED');
      expect(drop.surface.semantics).toContain('ONE_WAY_DROP');
      expect(drop.xz.kind).toBe('POLYLINE');
      expect(drop.xz.confidence).toBe('HIGH');
      expect(drop.xz.polylineMeters).toHaveLength(3);
      expect(drop.y.yMeters).toBeUndefined();
      expect(drop.y.candidatesMeters).toEqual([1.5, 3]);
      expect(drop.y.confidence).toBe('PROVISIONAL');
    }
  });

  it('binds measured spawn centers in XZ while keeping absolute Y unresolved', () => {
    const teamA = entry('team-a-spawn-floor');
    const teamB = entry('team-b-spawn-floor');
    expect(teamA.xz.kind).toBe('POINT');
    expect(teamB.xz.kind).toBe('POINT');
    expect(teamA.xz.confidence).toBe('HIGH');
    expect(teamB.xz.confidence).toBe('HIGH');
    expect(Math.abs(teamA.xz.pointMeters?.[0] ?? 1)).toBeLessThan(0.02);
    expect(Math.abs(teamB.xz.pointMeters?.[0] ?? 1)).toBeLessThan(0.02);
    expect(teamA.xz.pointMeters?.[1]).toBeCloseTo(67.0727, 3);
    expect(teamB.xz.pointMeters?.[1]).toBeCloseTo(-67.1172, 3);

    expect(entry('team-a-spawn-floor').y.confidence).toBe('UNKNOWN');
    expect(entry('team-a-spawn-floor').y.yMeters).toBeUndefined();
    expect(entry('team-b-spawn-floor').y.confidence).toBe('UNKNOWN');
    expect(entry('team-b-spawn-floor').y.yMeters).toBeUndefined();
  });

  it('records the measured Turf map frame instead of hiding calibration constants', () => {
    expect(assumption('turf-rule-map-width-pixels').value).toBe(3508);
    expect(assumption('turf-rule-map-height-pixels').value).toBe(2482);
    expect(assumption('turf-map-origin-pixel-x').value).toBe(1754);
    expect(assumption('turf-map-origin-pixel-y').value).toBe(1241);
    expect(Number(assumption('spawn-distance-meters').value)).toBeCloseTo(134.1899, 3);
    expect(assumption('pdf-points-per-meter')).toMatchObject({
      value: 4.8,
      unit: 'pt/m',
      confidence: 'HIGH'
    });
  });

  it('binds the two mapped cyan water hazards as confirmed polygons', () => {
    for (const id of ['team-a-water-region', 'team-b-water-region']) {
      const water = entry(id);
      expect(water.xz.kind).toBe('POLYGON');
      expect(water.xz.confidence).toBe('CONFIRMED');
      expect(water.xz.polygonMeters?.length).toBe(6);
      expect(water.surface.semantics).toEqual(['WATER', 'KILL', 'UNINKABLE']);
    }
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
