import {Entity,Mesh,MeshInstance,Vec3,type AppBase} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {GpuInkAtlas} from '../ink/GpuInkAtlas';
import {createInkSurfaceMaterial,configureF4InkVisual} from '../ink/InkSurfaceMaterial';
import {PaintSurface} from '../ink/PaintSurface';
import {SurfaceFlags} from '../ink/types';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {extractF4ConcreteWallTiles,type F4ConcreteWallTile} from './F4ConcreteWallTiles.mjs';
import {selectF4ConnectedWallTiles} from './F4WallContinuity.mjs';
import {f4WalkableSupportNormal} from './F4PhysicalStageSafety.mjs';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';

export const F4_WALL_PREFIX='F4ProvisionalWall:';

// Prepare a separate small atlas + exact source-triangle renderer before
// publishing any surface. No original StageDefinition or score flags change.
export function prepareF4ProvisionalWalls(app:AppBase,physics:RapierStagePhysics,
 vertices:Float32Array,visualPolish=false,visualLightDirection?:Vec3,
 report?:(probe:Readonly<{sourceTriangles:number;verticalTriangles:number;axisAlignedVerticalTriangles:number;
  rapierBackedTriangles:number;nearbySupportedBases:number;axisWallCandidates:number;accessibleRoots:number;
  physicallyBackedCandidates:number;maxBackedCells:number;
  selectedTiles:number;registeredSurfaces:number}>)=>void){
 if(!physics.hasF4WholeResearchTrimesh)return null;
 const cell=GAME_CONFIG.ink.cellSizeMeters;
 if(cell!==.125)return null;
 let verticalTriangles=0,axisAlignedVerticalTriangles=0,rapierBackedTriangles=0,nearbySupportedBases=0;
 const wallNormal=new Vec3(),face=new Vec3(),from=new Vec3(),to=new Vec3(),low=new Vec3(),probe=new Vec3();
 for(let i=0;i<vertices.length;i+=9){
  const ax=vertices[i+3]!-vertices[i]!,ay=vertices[i+4]!-vertices[i+1]!,az=vertices[i+5]!-vertices[i+2]!;
  const bx=vertices[i+6]!-vertices[i]!,by=vertices[i+7]!-vertices[i+1]!,bz=vertices[i+8]!-vertices[i+2]!;
  const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx,mag=Math.hypot(nx,ny,nz);
  if(mag<1e-7||Math.abs(ny)/mag>=.1)continue;
  verticalTriangles++;
  wallNormal.set(nx/mag,ny/mag,nz/mag);
  const ax0=vertices[i]!,ay0=vertices[i+1]!,az0=vertices[i+2]!;
  const bx0=vertices[i+3]!,by0=vertices[i+4]!,bz0=vertices[i+5]!;
  const cx0=vertices[i+6]!,cy0=vertices[i+7]!,cz0=vertices[i+8]!;
  face.set((ax0+bx0+cx0)/3,(ay0+by0+cy0)/3,(az0+bz0+cz0)/3);
  from.copy(face).add(wallNormal.clone().mulScalar(.08));
  to.copy(face).add(wallNormal.clone().mulScalar(-.08));
  const hit=physics.castStageSegment(from,to,'ink-projectile');
  if(hit&&hit.point.distance(face)<.025&&hit.normal&&Math.abs(hit.normal.dot(wallNormal))>=.95)
   rapierBackedTriangles++;
  const floorY=Math.min(ay0,by0,cy0),baseX=(ax0+bx0+cx0)/3,baseZ=(az0+bz0+cz0)/3;
  low.set(baseX,floorY,baseZ);
  for(const side of [-1,1]){
   probe.copy(low).add(wallNormal.clone().mulScalar(side*.48));probe.y+=.22;
   const floor=physics.castCharacterFootSupport(probe,0,'HUMAN');
   if(floor&&Math.abs(floor.point.y-floorY)<=.36&&
      f4WalkableSupportNormal(floor.normal?.y,PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians)){
    nearbySupportedBases++;break;
   }
  }
  const axis=Math.abs(nx)>Math.abs(nz)?0:2,normalAxis=axis===0?Math.abs(nx):Math.abs(nz);
  const a=vertices[i+axis]!,b=vertices[i+3+axis]!,c=vertices[i+6+axis]!;
  const plane=Math.round(a*1000)/1000;
  if(normalAxis/mag>=.9999&&Math.abs(a-plane)<=.002&&Math.abs(b-plane)<=.002&&Math.abs(c-plane)<=.002)
   axisAlignedVerticalTriangles++;
 }
 const rows=extractF4ConcreteWallTiles(vertices,64);
 const surfaces:PaintSurface[]=[];
 const positions:number[][]=[];
 type Prepared=F4ConcreteWallTile&{surface?:PaintSurface};
 const candidates:Prepared[]=rows;
 const point=(row:F4ConcreteWallTile,u:number,v:number,offset=0)=>
  new Vec3(row.normal[0]!*row.plane,row.normal[1]!*row.plane,row.normal[2]!*row.plane)
   .add(new Vec3(row.uAxis[0]!,row.uAxis[1]!,row.uAxis[2]!).mulScalar(u))
   .add(new Vec3(row.vAxis[0]!,row.vAxis[1]!,row.vAxis[2]!).mulScalar(v))
   .add(new Vec3(row.normal[0]!,row.normal[1]!,row.normal[2]!).mulScalar(offset));
 const isSeed=(row:Prepared)=>{
  const n=Math.round(row.width/cell);
  for(let x=2;x<n;x+=4){
   let y=0;while(y<n&&!row.mask[y*n+x])y++;
   if(y===n)continue;
   const u=row.minU+(x+.5)*cell,v=row.minV+y*cell;
   // Local wall V is not world Y for a slightly inclined source plane.
   const baseY=point(row,u,v).y;
   for(const side of [-1,1]){
    const probe=point(row,u,v+.22,side*.48);
    const floor=physics.castCharacterFootSupport(probe,0,'HUMAN');
    if(floor&&Math.abs(floor.point.y-baseY)<=.36&&
       f4WalkableSupportNormal(floor.normal?.y,PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians))return true;
   }
  }
  return false;
 };
 const seedCache=new WeakMap<Prepared,boolean>();
 let accessibleRoots=0;
 const isCachedSeed=(row:Prepared)=>{
  const cached=seedCache.get(row);if(cached!==undefined)return cached;
  const value=isSeed(row);seedCache.set(row,value);return value;
 };
 for(const row of candidates)if(isCachedSeed(row))accessibleRoots++;
 // Paintable walls do not need a walkable floor immediately beside them.
 // Their exact source triangles are already part of the stage, and every
 // accepted cell is still checked against Rapier in prepare(). Keep nearby
 // walkable bases as diagnostics rather than as an ink admission gate.
 let preparedCount=0,physicallyBackedCandidates=0,maxBackedCells=0;
 const prepare=(row:Prepared):Prepared|null=>{
  if(preparedCount++>=32)return null;
  const n=Math.round(row.width/cell),mask=row.mask.slice();
  const surface=new PaintSurface(F4_WALL_PREFIX+[row.planeKey,row.minU,row.minV].join(':'),
   point(row,row.minU+row.width/2,row.minV+row.height/2),
   new Vec3(row.uAxis[0]!,row.uAxis[1]!,row.uAxis[2]!),
   new Vec3(row.vAxis[0]!,row.vAxis[1]!,row.vAxis[2]!),
   row.width,row.height,cell,SurfaceFlags.Paintable|SurfaceFlags.Swimmable|SurfaceFlags.Wall,
   GAME_CONFIG.ink.dirtyTileCells);
  let backed=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const index=surface.index(x,y);
   if(!mask[index]||!physics.hasF4PaintBacking(surface,(x+.5)*cell,(y+.5)*cell)){
    surface.flagsGrid[index]=0;mask[index]=0;
   }else backed++;
  }
  maxBackedCells=Math.max(maxBackedCells,backed);
  if(backed<64)return null;
  physicallyBackedCandidates++;
  return {...row,mask,surface};
 };
 const selected=selectF4ConnectedWallTiles(candidates,()=>true,prepare,24);
 for(const row of selected){if(row.surface){surfaces.push(row.surface);positions.push(row.positions);}}
 report?.({sourceTriangles:vertices.length/9,verticalTriangles,axisAlignedVerticalTriangles,
  rapierBackedTriangles,nearbySupportedBases,
  axisWallCandidates:candidates.length,
  accessibleRoots,physicallyBackedCandidates,maxBackedCells,
  selectedTiles:selected.length,registeredSurfaces:surfaces.length});
 if(!surfaces.length)return null;
 const atlas=new GpuInkAtlas(app,surfaces,Math.min(2048,app.graphicsDevice.maxTextureSize),32,
  GAME_CONFIG.ink.atlasGutterPixels,true);
 const root=new Entity('F4ProvisionalWallInk');
 try{
  for(let i=0;i<surfaces.length;i++){
   const surface=surfaces[i]!,vertices=positions[i]!;
   const uvs:number[]=[];
   for(let j=0;j<vertices.length;j+=3){
    const p=surface.projectWorldPoint(new Vec3(vertices[j]!,vertices[j+1]!,vertices[j+2]!));
    uvs.push(p.u/surface.widthMeters,p.v/surface.heightMeters);
   }
   const mesh=new Mesh(app.graphicsDevice);
   mesh.setPositions(vertices);mesh.setUvs(0,uvs);mesh.update();
   const mat=createInkSurfaceMaterial(surface,atlas.texture,true);
   mat.setParameter('uInkOnly',1);mat.depthBias=-4;mat.slopeDepthBias=-1;
   configureF4InkVisual(mat,visualPolish,visualLightDirection);
   const entity=new Entity('F4ProvisionalWallInk:'+surface.id);
   entity.addComponent('render',{meshInstances:[new MeshInstance(mesh,mat)],castShadows:false,receiveShadows:false});
   root.addChild(entity);
  }
  app.root.addChild(root);
  return {surfaces,atlas,root};
 }catch(error){root.destroy();atlas.destroy();throw error;}
}
