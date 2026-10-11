/**
 * T21 Phase14K — READ-ONLY original-source visual context for the CPU GPU QA.
 * Shares the exact StageSolidDefinition footprint + triangle-mesh geometry
 * with production TestStage; NEVER adds solids, colliders, ink or nav authority.
 * The layer is separate from the gated Phase14I/14J physics scene.
 */
import {
  type AppBase,calculateNormals,Color,Entity,Mesh,MeshInstance,StandardMaterial,Vec3
} from 'playcanvas';
import type {StageDefinition,StageMaterialKey,StageSolidDefinition} from '../stage/StageDefinition';
import {rasterizeStageFootprint} from '../stage/StageFootprint';
import {stageSolidTriangleMeshErrors} from '../stage/StageTriangleMesh';

export type T21Phase14KVisualManifest={
  readonly evidenceOnly:true;
  readonly stageId:string;
  readonly inputSolids:number;
  readonly renderedSolids:number;
  readonly footprintRectangles:number;
  readonly triangleMeshTriangles:number;
  readonly boxSolids:number;
  readonly sourceIds:readonly string[];
  readonly collisionModified:false;
  readonly paintModified:false;
  readonly activationAuthorized:false;
};
export function auditPhase14KSourceVisuals(stage:StageDefinition):T21Phase14KVisualManifest{
  if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     stage.solids.length!==25||stage.paintSurfaces.length!==17||
     stage.navigationLinks?.length!==26)
    throw Error('T21_PHASE14K_SOURCE_FROZEN_STAGE_DRIFT');
  const ids=new Set<string>();let rendered=0,rectangles=0,triangles=0,boxes=0;
  for(const solid of stage.solids){
    if(ids.has(solid.id))throw Error('T21_PHASE14K_DUPLICATE_SOURCE_ID');
    ids.add(solid.id);
    const errors=stageSolidTriangleMeshErrors(solid);
    if(errors.length)throw Error('T21_PHASE14K_INVALID_SOURCE_MESH '+errors.join('; '));
    if(!solid.render)continue;
    rendered++;
    if(solid.triangleMesh)triangles+=solid.triangleMesh.indices.length/3;
    else if(solid.footprint)rectangles+=rasterizeStageFootprint(
      solid.size[0],solid.size[2],solid.footprint).rectangles.length;
    else boxes++;
  }
  return {
    evidenceOnly:true,stageId:stage.metadata.id,inputSolids:stage.solids.length,
    renderedSolids:rendered,footprintRectangles:rectangles,
    triangleMeshTriangles:triangles,boxSolids:boxes,sourceIds:[...ids],
    collisionModified:false,paintModified:false,activationAuthorized:false
  };
}
function simpleMaterial(color:Color):StandardMaterial{
  const m=new StandardMaterial();m.diffuse=color;
  m.emissive=new Color(color.r*.09,color.g*.09,color.b*.09);
  m.gloss=.25;m.update();return m;
}
function appendSolid(app:AppBase,root:Entity,solid:StageSolidDefinition,material:StandardMaterial){
  const entity=new Entity('T21Phase14K:ORIGINAL_SOURCE:'+solid.id);
  entity.setPosition(...solid.center);
  if(solid.rotationEulerDegrees)entity.setEulerAngles(...solid.rotationEulerDegrees);
  if(solid.triangleMesh){
    const positions=solid.triangleMesh.vertices.flatMap(p=>[p[0],p[1],p[2]]);
    const indices=[...solid.triangleMesh.indices];
    const mesh=new Mesh(app.graphicsDevice);
    mesh.setPositions(new Float32Array(positions));
    mesh.setNormals(new Float32Array(calculateNormals(positions,indices)));
    mesh.setIndices(new Uint32Array(indices));mesh.update();
    entity.addComponent('render',{
      meshInstances:[new MeshInstance(mesh,material)],castShadows:false,receiveShadows:false
    });
  }else if(solid.footprint){
    const rectangles=rasterizeStageFootprint(
      solid.size[0],solid.size[2],solid.footprint).rectangles;
    for(const [i,r] of rectangles.entries()){
      const piece=new Entity('T21Phase14K:MASK:'+solid.id+':'+i);
      piece.addComponent('render',{
        type:'box',material,castShadows:false,receiveShadows:false
      });
      piece.setLocalPosition(r.centerU-solid.size[0]/2,0,
        r.centerV-solid.size[2]/2);
      piece.setLocalScale(r.widthMeters,solid.size[1],r.depthMeters);
      entity.addChild(piece);
    }
  }else{
    entity.addComponent('render',{
      type:'box',material,castShadows:false,receiveShadows:false
    });
    entity.setLocalScale(...solid.size);
  }
  root.addChild(entity);
}
export function buildPhase14KSourceVisualLayer(app:AppBase,stage:StageDefinition){
  const manifest=auditPhase14KSourceVisuals(stage);
  const root=new Entity('T21Phase14K:ORIGINAL_SOURCE_RENDER_ONLY');
  app.root.addChild(root);
  const colors:Record<StageMaterialKey,Color>={
    dark:new Color(.09,.13,.18),
    medium:new Color(.20,.27,.32),
    light:new Color(.33,.43,.51),
    accent:new Color(.19,.63,.75)
  };
  const materials:Record<StageMaterialKey,StandardMaterial>={
    dark:simpleMaterial(colors.dark),medium:simpleMaterial(colors.medium),
    light:simpleMaterial(colors.light),accent:simpleMaterial(colors.accent)
  };
  for(const solid of stage.solids)
    if(solid.render)appendSolid(app,root,solid,materials[solid.material]);
  return {root,manifest};
}
