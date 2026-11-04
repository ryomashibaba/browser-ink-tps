import {describe,it,expect} from 'vitest';
import {B454NativeSourceFootRecorder} from './B454NativeSourceFootTrace';
const row=(tick:number,id:'B2'|'B4'='B2',
 y=3.1,hit=3)=>({tick,id,foot:[1,y,-50] as
 [number,number,number],mode:'GROUND',life:'ACTIVE',rejoined:true,
 originalRapierSolidId:'UndertowT21D:first-drop-landing-negative-z',
 originalRapierHitY:hit,registeredOriginalHit:true});
describe('B454 real 60Hz foot recorder cannot grant original 4v4',()=>{
 it('retains real raw foot Y, original static ray Y and strict 0.25m',()=>{
  const r=new B454NativeSourceFootRecorder();
  r.append(row(100));r.append(row(101,'B4',3.28,3));
  const s=r.snapshot();
  expect(s.rows.B2[0]?.withinUnchanged025m).toBe(true);
  expect(s.rows.B4[0]?.withinUnchanged025m).toBe(false);
  expect(s.rows.B4[0]?.absFootToRapierY).toBeCloseTo(.28);
  expect(s.continuousCapsuleContactCertified).toBe(false);
  expect(s.originalPathAuthorizationChanged).toBe(false);
 });
 it('refuses nonfinite, duplicate, unknown ray, fake registered hit',()=>{
  const r=new B454NativeSourceFootRecorder();
  r.append(row(100));
  expect(()=>r.append(row(100))).toThrow('NONINCREASING');
  expect(()=>r.append({...row(101),foot:[NaN,3,-50]})).toThrow();
  expect(()=>r.append({...row(101),originalRapierHitY:null})).toThrow();
  expect(()=>r.append({...row(101),registeredOriginalHit:true,
   originalRapierSolidId:null,originalRapierHitY:null})).toThrow();
 });
 it('bounds memory and marks dropped frames, no hidden 60Hz claim',()=>{
  const r=new B454NativeSourceFootRecorder(2);
  for(let i=0;i<3;i++)r.append(row(i));
  const s=r.snapshot();
  expect(s.rows.B2).toHaveLength(2);
  expect(s.dropped.B2).toBe(1);
  expect(s.rows.B2[0]?.tick).toBe(1);
  s.rows.B2[0]!.foot[0]=999;
  expect(r.snapshot().rows.B2[0]?.foot[0]).toBe(1);
 });
});
