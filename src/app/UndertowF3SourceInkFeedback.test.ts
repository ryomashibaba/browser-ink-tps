import {describe,expect,it} from 'vitest';
import {UndertowF3SourceInkFeedback} from './UndertowF3SourceInkFeedback';
import {PaintEventType,PaintSource,Team,type PaintEvent} from '../ink/types';

const real=(tick:number,source:PaintSource,type:PaintEventType):PaintEvent=>
 Object.freeze({tick,source,type,team:Team.A,surfaceId:'ORIGINAL_SOURCE_FLOOR',
  centerU:1,centerV:1,radiusU:.4,radiusV:.4,angle:0,strength:1});

describe('W10-B23 no fictional human paint or turf scoring',()=>{
 it('rejects CPU paint, dry shots, human footmarks, and zero actual changed cells',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(1,PaintSource.Cpu,PaintEventType.Impact),97);
  m.accept(real(2,PaintSource.Human,PaintEventType.Impact),0);
  m.accept(real(3,PaintSource.Human,PaintEventType.Foot),12);
  m.accept(real(4,PaintSource.Debug,PaintEventType.Impact),25);
  expect(m.snapshot(5)).toMatchObject({
   humanChangedImpactCount:0,humanChangedCells:0,showPaintConfirmation:false,
   lastPaintedSurface:null,scoreablePromotionCount:0
  });
 });
 it('marks only actual changed human original ink cells, not enemy or winner',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(60,PaintSource.Human,PaintEventType.Impact),3);
  m.accept(real(60,PaintSource.Human,PaintEventType.WallImpact),5);
  const data=m.snapshot(60);
  expect(data).toMatchObject({humanChangedImpactCount:2,humanChangedCells:8,
   lastImpactChangedCells:8,lastPaintedSurface:'ORIGINAL_SOURCE_FLOOR',
   originalSourceOnly:true,scoreablePromotionCount:0,showPaintConfirmation:true
  });
  expect(m.snapshot(87).showPaintConfirmation).toBe(true);
  expect(m.snapshot(88).showPaintConfirmation).toBe(false);
 });
 it('leaves counters unchanged for invalid changed-cell counts',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(12,PaintSource.Human,PaintEventType.Impact),-1);
  m.accept(real(12,PaintSource.Human,PaintEventType.Impact),NaN);
  m.accept(real(12,PaintSource.Human,PaintEventType.Impact),0.5);
  expect(m.snapshot(12).humanChangedImpactCount).toBe(0);
 });
});

describe('W10-B39 authentic, non-scoring human bomb raster result',()=>{
 it('counts only real Human Bomb paint events with valid changed cells',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(100,PaintSource.Cpu,PaintEventType.Bomb),89);
  m.accept(real(100,PaintSource.Human,PaintEventType.Bomb),-1);
  m.accept(real(100,PaintSource.Human,PaintEventType.Bomb),0.5);
  m.accept(real(100,PaintSource.Human,PaintEventType.Bomb),0);
  m.accept(real(100,PaintSource.Human,PaintEventType.Bomb),17);
  m.accept(real(100,PaintSource.Human,PaintEventType.Bomb),32);
  const v=m.snapshot(100);
  expect(v).toMatchObject({
   humanBombStampEvents:3,humanBombChangedEvents:2,
   humanBombChangedCells:49,lastBombChangedCells:49,
   lastBombPaintedSurface:'ORIGINAL_SOURCE_FLOOR',
   showBombConfirmation:true,
   humanChangedImpactCount:0,humanChangedCells:0,
   scoreablePromotionCount:0
  });
  expect(m.snapshot(127).showBombConfirmation).toBe(true);
  expect(m.snapshot(128).showBombConfirmation).toBe(false);
 });
 it('never treats an explosion or a GPU-only event as changed ink',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(3,PaintSource.Human,PaintEventType.Bomb),0);
  m.accept(real(4,PaintSource.System,PaintEventType.Bomb),50);
  m.accept(real(4,PaintSource.Human,PaintEventType.Debug),40);
  expect(m.snapshot(5)).toMatchObject({
   humanBombStampEvents:1,humanBombChangedEvents:0,
   humanBombChangedCells:0,lastBombTick:null,
   showBombConfirmation:false,showPaintConfirmation:false
  });
 });
 it('keeps existing B23/B25 projectile-impact accounting unchanged',()=>{
  const m=new UndertowF3SourceInkFeedback();
  m.accept(real(10,PaintSource.Human,PaintEventType.Impact),8);
  m.accept(real(11,PaintSource.Human,PaintEventType.Bomb),72);
  m.accept(real(12,PaintSource.Human,PaintEventType.WallImpact),4);
  expect(m.snapshot(12)).toMatchObject({
   humanChangedImpactCount:2,humanChangedCells:12,
   humanBombChangedEvents:1,humanBombChangedCells:72,
   lastBombTick:11,lastImpactTick:12
  });
 });
});
