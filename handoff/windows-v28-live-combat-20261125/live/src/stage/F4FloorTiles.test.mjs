import {describe,expect,it} from 'vitest';
import {extractF4FloorTiles} from './F4FloorTiles.mjs';

describe('F4 original floor masks',()=>{
 it('keeps only actual horizontal source triangles and clips their real cells',()=>{
  const vertices=new Float32Array([
   0,0,0, 2,0,0, 2,0,2,
   0,0,0, 2,0,2, 0,0,2
  ]);
  const rows=extractF4FloorTiles(vertices,Math.PI/4);
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.reduce((n,row)=>n+row.cells,0)).toBeGreaterThanOrEqual(240);
  expect(rows.every(row=>row.mask.every(value=>value===1))).toBe(true);
  for(const row of rows)for(let i=0;i<row.positions.length;i+=3){
   const d=row.normal[0]*row.positions[i]+row.normal[1]*row.positions[i+1]+
    row.normal[2]*row.positions[i+2];
   expect(d).toBeCloseTo(row.offset,2);
  }
 });
 it('rejects vertical faces as paintable floor candidates',()=>{
  const wall=new Float32Array([0,0,0,0,0,2,0,2,2, 0,0,0,0,2,2,0,2,0]);
  expect(extractF4FloorTiles(wall,Math.PI/4)).toEqual([]);
 });
});
