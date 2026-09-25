import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CAPTURED_CONNECTIONS,
  UNDERTOW_CAPTURED_OBSTRUCTIONS
} from './UndertowSpillwayCaptureTopology';

describe('T21 captured layered topology', () => {
  it('records the first-drop-open -> small-drop-upper -> right-low chain', () => {
    const chain = UNDERTOW_CAPTURED_CONNECTIONS.filter(
      (item) =>
        item.from === 'FIRST_DROP_OPEN_AREA' ||
        item.from === 'RIGHT_SMALL_DROP_UPPER'
    );
    expect(chain).toHaveLength(2);
    expect(chain[0]).toMatchObject({
      from: 'FIRST_DROP_OPEN_AREA',
      to: 'RIGHT_SMALL_DROP_UPPER',
      kind: 'SAME_LEVEL',
      deltaYMeters: 0,
      confidence: 'HIGH'
    });
    expect(chain[1]).toMatchObject({
      from: 'RIGHT_SMALL_DROP_UPPER',
      to: 'RIGHT_LOW',
      kind: 'DROP',
      deltaYMeters: -1.5,
      confidence: 'HIGH'
    });
  });

  it('records the same-height right-low -> underpass connection', () => {
    expect(
      UNDERTOW_CAPTURED_CONNECTIONS.find(
        (item) => item.from === 'RIGHT_LOW' && item.to === 'GLASS_UNDERPASS'
      )
    ).toMatchObject({
      kind: 'SAME_LEVEL',
      deltaYMeters: 0,
      confidence: 'HIGH'
    });
  });

  it('keeps the visible right-low ramp without inventing its high-end Y', () => {
    const ramp = UNDERTOW_CAPTURED_CONNECTIONS.find(
      (item) => item.to === 'RIGHT_LOW_RAMP_EXIT'
    );
    expect(ramp?.kind).toBe('SLOPE');
    expect(ramp?.confidence).toBe('CONFIRMED');
    expect(ramp?.deltaYMeters).toBeUndefined();
  });

  it('requires explicit underpass support/wall exclusions', () => {
    expect(UNDERTOW_CAPTURED_OBSTRUCTIONS).toEqual([
      expect.objectContaining({
        region: 'GLASS_UNDERPASS',
        kind: 'SOLID_SUPPORT_OR_WALL',
        confidence: 'CONFIRMED'
      })
    ]);
  });
});
