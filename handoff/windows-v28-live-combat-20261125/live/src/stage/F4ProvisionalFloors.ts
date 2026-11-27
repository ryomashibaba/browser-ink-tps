import {Entity,Mesh,MeshInstance,Vec3,type AppBase} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {GpuInkAtlas} from '../ink/GpuInkAtlas';
import {createInkSurfaceMaterial,configureF4InkVisual} from '../ink/InkSurfaceMaterial';
import {PaintSurface,F4_PAINT_PLANE_TOLERANCE,sourceRegisteredPaintCellActive} from '../ink/PaintSurface';
import {SurfaceFlags} from '../ink/types';
import type {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {extractF4FloorTiles} from './F4FloorTiles.mjs';

export const F4_FLOOR_PREFIX='F4ProvisionalFloor:';
// Separate from frozen 17 SOURCE surfaces. Exact source triangles are
// rendered; cell masks plus the existing live five-ray backing gate own paint.
export function prepareF4ProvisionalFloors(app:AppBase,ink:GameplayInkSystem,
 vertices:Float32Array,visualPolish=false,light?:Vec3){
 const cell=GAME_CONFIG.ink.cellSizeMeters;
 if(cell!==.125)throw Error('F4 floor raster cell size');
 const rows=extractF4FloorTiles(vertices,PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians);
 const original=ink.getSurfaces();
 const entries:{surface:PaintSurface;positions:number[]}[]=[];
 const point=new Vec3();
 for(const row of rows){
  const n=new Vec3(row.normal[0]!,row.normal[1]!,row.normal[2]!);
  const u=new Vec3(row.u[0]!,row.u[1]!,row.u[2]!);
  const v=new Vec3(row.v[0]!,row.v[1]!,row.v[2]!);
  const center=n.clone().mulScalar(row.offset)
   .add(u.clone().mulScalar(row.minU+row.width/2))
   .add(v.clone().mulScalar(row.minV+row.height/2));
  const surface=new PaintSurface(F4_FLOOR_PREFIX+row.id,center,u,v,row.width,row.height,cell,
   SurfaceFlags.Paintable|SurfaceFlags.Swimmable|(n.y>.999?SurfaceFlags.Floor:SurfaceFlags.Ramp),
   GAME_CONFIG.ink.dirtyTileCells);
  // Do not double count existing SOURCE ownership or nearly coplanar new
  // cells. Restrict candidate checks by a conservative bounding sphere.
  const overlap=original.filter(s=>Math.abs(s.normal.dot(n))>.999&&
   s.center.distance(center)<Math.hypot(s.widthMeters,s.heightMeters)/2+Math.hypot(row.width,row.height)/2+.12);
  const prior=entries.map(e=>e.surface).filter(s=>Math.abs(s.normal.dot(n))>.999&&
   s.center.distance(center)<Math.hypot(row.width,row.height)+.12);
  let active=0;
  for(let y=0;y<surface.heightCells;y++)for(let x=0;x<surface.widthCells;x++){
   const k=surface.index(x,y);
   if(!row.mask[k]){surface.flagsGrid[k]=0;continue;}
   surface.localToWorld((x+.5)*cell,(y+.5)*cell,point);
   const existing=overlap.length&&ink.sampleWorld(point,F4_PAINT_PLANE_TOLERANCE,
    SurfaceFlags.Paintable,SurfaceFlags.Wall,s=>overlap.includes(s));
   const duplicate=prior.some(s=>{const p=s.projectWorldPoint(point);
    return p.inside&&p.planeDistance<=.018&&sourceRegisteredPaintCellActive(s,p.u,p.v);});
   if(existing||duplicate){surface.flagsGrid[k]=0;continue;}
   active++;
  }
  if(active)entries.push({surface,positions:row.positions});
 }
 if(!entries.length)return null;
 if(entries.length>576)throw Error('F4 floor atlas capacity exceeded');
 const root=new Entity('F4ProvisionalFloorInk');
 const pages:{atlas:GpuInkAtlas;surfaces:PaintSurface[]}[]=[];
 try{
  // Four texels per 12.5cm cell, bounded atlas pages; no original atlas repack.
  const size=app.graphicsDevice.maxTextureSize>=4096&&entries.length>36?4096:2048;
  const pageSize=size===4096?144:36;
  for(let start=0;start<entries.length;start+=pageSize){
   const batch=entries.slice(start,start+pageSize),surfaces=batch.map(e=>e.surface);
   const atlas=new GpuInkAtlas(app,surfaces,size,32,GAME_CONFIG.ink.atlasGutterPixels,true);
   pages.push({atlas,surfaces});
   for(const {surface,positions} of batch){
    const uvs:number[]=[];
    for(let j=0;j<positions.length;j+=3){
     const p=surface.projectWorldPoint(point.set(positions[j]!,positions[j+1]!,positions[j+2]!));
     uvs.push(p.u/surface.widthMeters,p.v/surface.heightMeters);
    }
    const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(positions);mesh.setUvs(0,uvs);mesh.update();
    const mat=createInkSurfaceMaterial(surface,atlas.texture,true);
    mat.setParameter('uInkOnly',1);mat.depthBias=-2;configureF4InkVisual(mat,visualPolish,light);
    const entity=new Entity('F4ProvisionalFloorInk:'+surface.id);
    entity.addComponent('render',{meshInstances:[new MeshInstance(mesh,mat)],castShadows:false,receiveShadows:false});
    root.addChild(entity);
   }
  }
  app.root.addChild(root);
  return {root,pages,surfaces:entries.map(e=>e.surface)};
 }catch(error){root.destroy();for(const p of pages)p.atlas.destroy();throw error;}
}
