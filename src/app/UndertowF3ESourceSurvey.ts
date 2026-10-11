/**
 * F3E: safely inspect original stage VISUAL completeness independent of the
 * KCC/Crowd. These are strictly observation camera coordinates (not world
 * geometry, additional game spawns, death boundaries, or walkable routes).
 */
import {Color,Entity,Vec3,type AppBase} from 'playcanvas';
import type {StageDefinition} from '../stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
export const F3E_SOURCE_SURVEY_VIEWS=Object.freeze([
 {id:'CENTRAL OVERVIEW',camera:[44,49,46],aim:[0,4,0]},
 {id:'TEAM A SOURCE',camera:[34,34,96],aim:[0,4,51]},
 {id:'TEAM B SOURCE',camera:[-34,34,-96],aim:[0,4,-51]},
 {id:'HIGH TOP-DOWN',camera:[0,112,3],aim:[0,2,0]}
] as const);
export class UndertowF3ESourceSurvey{
 private readonly survey:Entity;
 private index=-1;
 constructor(app:AppBase,private readonly playerCamera:Entity,
  worldLayer:number,stage:StageDefinition){
  if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    freeze.activationReady!==false||stage.solids!==freeze.solids||
    stage.paintSurfaces!==freeze.paintSurfaces||
    stage.navigationLinks!==freeze.navigationLinks)
   throw Error('T21_F3E_SURVEY_NEVER_ACTIVATES_PRODUCTION');
  this.survey=new Entity('T21F3E:OPTICAL_SOURCE_SURVEY_CAMERA_NOT_ACTOR');
  this.survey.addComponent('camera',{
   clearColor:new Color(.027,.052,.083,1),nearClip:.15,farClip:450,
   fov:66,layers:[worldLayer]
  });
  app.root.addChild(this.survey);
  this.survey.enabled=false;
 }
 cycle(){
  this.index=this.index>=F3E_SOURCE_SURVEY_VIEWS.length-1?-1:this.index+1;
  const view=F3E_SOURCE_SURVEY_VIEWS[this.index];
  if(view){
   this.survey.setPosition(view.camera[0],view.camera[1],view.camera[2]);
   this.survey.lookAt(new Vec3(...view.aim));
  }
  // Mutually exclusive render cameras: KCC and physical actors remain
  // entirely untouched, and the playable app pauses while surveying.
  this.survey.enabled=!!view;
  this.playerCamera.enabled=!view;
  return this.snapshot();
 }
 snapshot(){
  return {active:this.index>=0,
   view:this.index<0?'PLAYER':F3E_SOURCE_SURVEY_VIEWS[this.index]!.id,
   originalSourceOnly:true,
   physicalActorRelocations:0,stageGeometryAdded:false,
   productionAuthorized:false};
 }
}
