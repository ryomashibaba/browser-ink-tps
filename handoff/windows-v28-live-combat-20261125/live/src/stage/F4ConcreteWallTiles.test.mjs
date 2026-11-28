import {describe,expect,it} from 'vitest';
import {extractF4ConcreteWallTiles} from './F4ConcreteWallTiles.mjs';
import {f4SharedWallSeam} from './F4WallContinuity.mjs';

const inv=Math.SQRT1_2;
function wallVertices(width){
 const n=[inv,0,inv],u=[inv,0,-inv],d=4.25;
 const point=(s,y)=>[n[0]*d+u[0]*s,y,n[2]*d+u[2]*s];
 const a=point(0,0),b=point(width,0),c=point(width,2),e=point(0,2);
 return new Float32Array([...a,...b,...c,...a,...c,...e]);
}

describe('F4 concrete wall tiles',()=>{
 it('extracts an exact oblique vertical source wall with its own plane basis',()=>{
  const rows=extractF4ConcreteWallTiles(wallVertices(2),64);
  expect(rows).toHaveLength(1);
  const row=rows[0];
  expect(row.axis).toBe(3);
  expect(row.cells).toBeGreaterThanOrEqual(64);
  expect(row.normal[0]).toBeCloseTo(inv,3);
  expect(row.normal[2]).toBeCloseTo(inv,3);
  expect(row.positions).toHaveLength(18);
  for(let i=0;i<row.positions.length;i+=3){
   expect(row.normal[0]*row.positions[i]+row.normal[1]*row.positions[i+1]+
    row.normal[2]*row.positions[i+2]).toBeCloseTo(row.plane,2);
  }
 });

 it('clips a continuous diagonal wall at tile seams and preserves adjacency',()=>{
  const rows=extractF4ConcreteWallTiles(wallVertices(8),64);
  expect(rows).toHaveLength(2);
  const left=rows.find(row=>row.minU===0),right=rows.find(row=>row.minU===6);
  expect(left.positions.length).toBeGreaterThanOrEqual(18);
  expect(left.positions.length%9).toBe(0);
  expect(right.positions.length).toBeGreaterThan(0);
  expect(f4SharedWallSeam(left,right)).toBe(true);
  for(let i=0;i<right.positions.length;i+=3){
   const u=right.positions[i]*right.uAxis[0]+right.positions[i+1]*right.uAxis[1]+
    right.positions[i+2]*right.uAxis[2];
   expect(u).toBeGreaterThanOrEqual(right.minU-.002);
   expect(u).toBeLessThanOrEqual(right.minU+right.width+.002);
  }
 });

 it('rejects degenerate and horizontal triangles',()=>{
  expect(extractF4ConcreteWallTiles(new Float32Array([
   0,0,0,1,0,0,2,0,0,
   0,0,0,1,0,0,0,0,1
  ]),64)).toEqual([]);
 });
});
