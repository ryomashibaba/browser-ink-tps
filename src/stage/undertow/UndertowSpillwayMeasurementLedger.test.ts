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

  it('keeps central-low Y=0 while reopening its old XZ face binding', () => {
    expect(ledger.coordinateSystem.centerLowestFloorY).toBe(0);
    expect(ledger.coordinateSystem.centerLowestFloorConfidence).toBe('CONFIRMED');
    const centerLow = entry('center-lower-floor');
    expect(centerLow.xz.kind).toBe('UNRESOLVED');
    expect(centerLow.xz.confidence).toBe('UNKNOWN');
    expect(centerLow.y.yMeters).toBe(0);
    expect(centerLow.y.confidence).toBe('CONFIRMED');
    const stepTop = entry('center-origin-step-top-face');
    expect(stepTop.xz.kind).toBe('POLYGON');
    expect(stepTop.xz.polygonMeters).toHaveLength(4);
    expect(stepTop.y).toMatchObject({ yMeters: 1.5, confidence: 'HIGH' });
    expect(assumption('map-pixels-per-meter')).toMatchObject({
      value: 20,
      unit: 'px/m',
      confidence: 'HIGH'
    });
  });

  it('replaces old provisional outer extents with vector hard-silhouette spans', () => {
    expect(assumption('outer-span-x-meters').confidence).toBe('HIGH');
    expect(Number(assumption('outer-span-x-meters').value)).toBeCloseTo(98.79789, 4);
    expect(assumption('outer-span-z-meters').confidence).toBe('HIGH');
    expect(Number(assumption('outer-span-z-meters').value)).toBeCloseTo(156.52791, 4);
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
      expect(drop.y.deltaMeters).toBe(-4.5);
      expect(drop.y.candidatesMeters).toBeUndefined();
      expect(drop.y.confidence).toBe('HIGH');
      expect(drop.transition.deltaYMeters).toBe(-4.5);
    }
  });

  it('binds measured spawn centers in XZ and resolves their HIGH normalized Y from Temple01', () => {
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

    expect(entry('team-a-spawn-floor').y.confidence).toBe('HIGH');
    expect(entry('team-a-spawn-floor').y.yMeters).toBe(7.5);
    expect(entry('team-b-spawn-floor').y.confidence).toBe('HIGH');
    expect(entry('team-b-spawn-floor').y.yMeters).toBe(7.5);
  });

  it('binds the exact spawn-side connected terrain regions without flattening them', () => {
    for (const id of ['team-a-spawn-terrain-region', 'team-b-spawn-terrain-region']) {
      const spawnRegion = entry(id);
      expect(spawnRegion.xz.kind).toBe('POLYGON');
      expect(spawnRegion.xz.confidence).toBe('HIGH');
      expect((spawnRegion.xz.polygonMeters?.length ?? 0)).toBeGreaterThan(20);
      expect(spawnRegion.y.confidence).toBe('UNKNOWN');
      expect(spawnRegion.y.yMeters).toBeUndefined();
      expect(spawnRegion.notes).toContain('not as one flat floor');
    }
  });

  it('binds the two targeted 2026-09-25 captures without pretending their XZ polygons are solved', () => {
    const evidenceIds = ledger.evidence.map((item) => item.id);
    expect(evidenceIds).toContain('user-underpass-capture-2026-09-25');
    expect(evidenceIds).toContain('user-right-low-capture-2026-09-25');

    const rightLow = entry('right-low-floor');
    const underpass = entry('upper-glass-underpass');
    expect(rightLow.evidenceIds).toContain('user-right-low-capture-2026-09-25');
    expect(underpass.evidenceIds).toContain('user-underpass-capture-2026-09-25');
    expect(rightLow.xz.kind).toBe('UNRESOLVED');
    expect(underpass.xz.kind).toBe('UNRESOLVED');
    expect(rightLow.y.yMeters).toBe(4.5);
    expect(rightLow.y.confidence).toBe('HIGH');
    expect(underpass.y).toMatchObject({ yMeters: 0, confidence: 'HIGH' });
  });

  it('records the audited remodeled Temple01 geometry source explicitly', () => {
    const source = ledger.evidence.find((item) => item.id === 'extracted-temple01-geometry');
    expect(source).toMatchObject({
      kind: 'EXTRACTED_GAME_GEOMETRY',
      sourceVersion: 'Fld_Temple01 / remodeled Ver.7.2.0+ model family'
    });
    expect(source?.notes).toContain('43,263,289 bytes');
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

  it('keeps glass as gameplay geometry with exact symmetric XZ but non-flat vertical semantics', () => {
    expect(entry('upper-glass-platform').surface.semantics).toEqual(['UNINKABLE', 'GLASS']);
    expect(entry('upper-glass-platform').surface.confidence).toBe('CONFIRMED');

    for (const id of ['team-a-upper-glass-overhang', 'team-b-upper-glass-overhang']) {
      const glass = entry(id);
      expect(glass.xz.kind).toBe('POLYGON');
      expect(glass.xz.confidence).toBe('HIGH');
      expect(glass.xz.polygonMeters).toHaveLength(4);
      expect(glass.transition.kind).toBe('SLOPE');
      expect(glass.transition.confidence).toBe('HIGH');
      expect(glass.surface.semantics).toEqual(['UNINKABLE', 'GLASS']);
    }

    expect(entry('upper-glass-underpass').confidence).toBe('CONFIRMED');
    expect(entry('upper-glass-underpass').xz.kind).toBe('UNRESOLVED');
  });

  it('binds both central small-step strips while retaining the +1.5m HIGH vertical relation', () => {
    for (const id of ['negative-z-center-small-step', 'positive-z-center-small-step']) {
      const step = entry(id);
      expect(step.xz.kind).toBe('POLYGON');
      expect(step.xz.confidence).toBe('HIGH');
      expect(step.xz.polygonMeters).toHaveLength(4);
      expect(step.transition.kind).toBe('STEP');
      expect(step.transition.deltaYMeters).toBe(1.5);
      expect(step.transition.confidence).toBe('HIGH');
    }
  });

  it('binds both right-side small-drop hard edges with the corrected 3m HIGH vertical relation', () => {
    for (const id of ['team-a-right-small-drop', 'team-b-right-small-drop']) {
      const drop = entry(id);
      expect(drop.xz.kind).toBe('POLYLINE');
      expect(drop.xz.confidence).toBe('HIGH');
      expect(drop.xz.polylineMeters).toHaveLength(3);
      expect(drop.transition.kind).toBe('DROP');
      expect(drop.transition.deltaYMeters).toBe(-3);
      expect(drop.transition.confidence).toBe('HIGH');
    }
    expect(entry('center-small-step').xz.kind).toBe('UNRESOLVED');
  });

  it('binds both central slope hatch footprints to the Temple01 1.5m vertical span', () => {
    for (const id of ['center-left-slope', 'center-right-slope']) {
      const slope = entry(id);
      expect(slope.xz.kind).toBe('POLYGON');
      expect(slope.xz.confidence).toBe('HIGH');
      expect(slope.xz.polygonMeters).toHaveLength(4);
      expect(slope.y).toMatchObject({ deltaMeters: 1.5, confidence: 'HIGH' });
      expect(slope.transition).toMatchObject({
        kind: 'SLOPE',
        deltaYMeters: 1.5,
        confidence: 'HIGH'
      });
    }
  });

  it('binds the symmetric grate pair as exact XZ without mixing in water semantics', () => {
    for (const id of ['negative-z-grate-mesh', 'positive-z-grate-mesh']) {
      const grate = entry(id);
      expect(grate.xz.kind).toBe('POLYGON');
      expect(grate.xz.confidence).toBe('HIGH');
      expect(grate.xz.polygonMeters).toHaveLength(4);
      expect(grate.surface.semantics).toEqual(['GRATE', 'UNINKABLE']);
      expect(grate.surface.semantics).not.toContain('WATER');
      expect(grate.y).toMatchObject({ yMeters: 7.4, confidence: 'HIGH' });
    }
  });

  it('records two zones and preserves rule-specific geometry as variants', () => {
    expect(ruleFact('zones-two-objectives').values?.objectiveCount).toBe(2);
    expect(ruleFact('zones-two-objectives').confidence).toBe('CONFIRMED');
    expect(ruleFact('tower-glass-variant').rule).toBe('TOWER');
    expect(ruleFact('rainmaker-left-ramp').rule).toBe('RAINMAKER');
    expect(ruleFact('clams-return-ramp').rule).toBe('CLAMS');
  });
});
