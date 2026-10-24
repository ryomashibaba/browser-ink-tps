import {describe,it,expect} from 'vitest';
import {PaintEventType,PaintSource} from '../ink/types';
import {isB152ExactAllySupportInkImpact as exact}
 from './W10B152AllyPaintProvenance';

const base=()=>({source:PaintSource.Cpu,actorId:'A1',
 type:PaintEventType.Impact,
 qaSourceAim:'A1_ORIGINAL_ALLY_SUPPORT_INK' as const});
describe('B152 original ally ink request-to-impact provenance',()=>{
 it('accepts only tagged CPU A1 actual Impact or WallImpact',()=>{
  expect(exact(base())).toBe(true);
  expect(exact({...base(),type:PaintEventType.WallImpact})).toBe(true);
 });
 it('rejects fake telemetry, unrelated paint and non-impact events',()=>{
  expect(exact({...base(),qaSourceAim:undefined})).toBe(false);
  expect(exact({...base(),actorId:'B1'})).toBe(false);
  expect(exact({...base(),source:PaintSource.Human})).toBe(false);
  expect(exact({...base(),type:PaintEventType.Foot})).toBe(false);
  expect(exact({...base(),type:PaintEventType.MidDroplet})).toBe(false);
  expect(exact({...base(),type:PaintEventType.Bomb})).toBe(false);
  expect(exact({...base(),type:PaintEventType.Debug})).toBe(false);
 });
});
