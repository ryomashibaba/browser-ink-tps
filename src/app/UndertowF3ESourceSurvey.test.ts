import {describe,expect,it} from 'vitest';
import {F3E_SOURCE_SURVEY_VIEWS}
 from './UndertowF3ESourceSurvey';

describe('F3E optical-only stage survey',()=>{
 it('uses finite distant observation positions without inventing any world geometry or a traversal',()=>{
  expect(F3E_SOURCE_SURVEY_VIEWS).toHaveLength(4);
  expect(new Set(F3E_SOURCE_SURVEY_VIEWS.map(x=>x.id)).size).toBe(4);
  expect(F3E_SOURCE_SURVEY_VIEWS.flatMap(x=>[...x.camera,...x.aim])
   .every(Number.isFinite)).toBe(true);
  expect(F3E_SOURCE_SURVEY_VIEWS.every(x=>x.camera[1]>x.aim[1])).toBe(true);
 });
});
