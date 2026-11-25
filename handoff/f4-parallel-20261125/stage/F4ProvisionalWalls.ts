import {Entity,Mesh,MeshInstance,Vec3,type AppBase} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {GpuInkAtlas} from '../ink/GpuInkAtlas';
import {createInkSurfaceMaterial} from '../ink/InkSurfaceMaterial';
import {PaintSurface} from '../ink/PaintSurface';
import {SurfaceFlags} from '../ink/types';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {extractF4ConcreteWallTiles} from './F4ConcreteWallTiles.mjs';
import {f4WalkableSupportNormal} from './F4PhysicalStageSafety.mjs';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';

export const F4_WALL_PREFIX='F4ProvisionalWall:';

// Prepare a separate small atlas + exact source-triangle renderer before
// publishing any surface. No original StageDefinition or score flags change.
export function prepareF4ProvisionalWalls(app:AppBase,physics:RapierStagePhysics,
 vertices:Float32Array){
 if(!physics.hasF4WholeResearchTrimesh)return null;
 const cell=GAME_CONFIG.ink.cellSizeMeters;
 if(cell!==.125)return null;
 const rows=extractF4ConcreteWallTiles(vertices,16);
 const surfaces:PaintSurface[]=[];
 const positions:number[][]=[];
 for(const row of rows){
  const n=Math.round(row.width/cell);
  const point=(u:number,v:number,offset=0)=>row.axis===0?
   new Vec3(row.plane+offset,v,u):new Vec3(u,v,row.plane+offset);
  // Only walls reachable from existing physical floor near the lower
  // painted edge. Never add an artificial climb start or NavLink.
  let accessible=false;
  for(let x=2;x<n&&!accessible;x+=4){
   let y=0;while(y<n&&!row.mask[y*n+x])y++;
   if(y===n)continue;
   const u=row.minU+(x+.5)*cell,v=row.minV+y*cell;
   for(const side of [-1,1]){
    const probe=point(u,v+.22,side*.48);
    const floor=physics.castCharacterFootSupport(probe,0,'HUMAN');
    if(floor&&Math.abs(floor.point.y-v)<=.36&&
       f4WalkableSupportNormal(floor.normal?.y,PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians)){
     accessible=true;break;
    }
   }
  }
  if(!accessible)continue;
  const surface=new PaintSurface(F4_WALL_PREFIX+[row.axis,row.plane,row.minU,row.minV].join(':'),
   point(row.minU+row.width/2,row.minV+row.height/2),
   row.axis===0?new Vec3(0,0,1):new Vec3(1,0,0),new Vec3(0,1,0),
   row.width,row.height,cell,SurfaceFlags.Paintable|SurfaceFlags.Swimmable|SurfaceFlags.Wall,
   GAME_CONFIG.ink.dirtyTileCells);
  let backed=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const index=surface.index(x,y);
   if(!row.mask[index]){surface.flagsGrid[index]=0;continue;}
   // Center ray here is an initial filter; existing GameplayInk still
   // requires all four corners + center before applying or sampling.
   if(!physics.hasF4PaintBacking(surface,(x+.5)*cell,(y+.5)*cell))
    surface.flagsGrid[index]=0;
   else backed++;
  }
  if(backed<64)continue;
  surfaces.push(surface);positions.push(row.positions);
  if(surfaces.length>=8)break;
 }
 if(!surfaces.length)return null;
 const atlas=new GpuInkAtlas(app,surfaces,Math.min(1024,app.graphicsDevice.maxTextureSize),32,
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
   mat.setParameter('uInkOnly',1);mat.depthBias=-2;
   const entity=new Entity('F4ProvisionalWallInk:'+surface.id);
   entity.addComponent('render',{meshInstances:[new MeshInstance(mesh,mat)],castShadows:false,receiveShadows:false});
   root.addChild(entity);
  }
  app.root.addChild(root);
  return {surfaces,atlas,root};
 }catch(error){root.destroy();atlas.destroy();throw error;}
}
