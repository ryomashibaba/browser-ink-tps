/** B250: registered-source solid MATERIAL and ambient study only.
 * No source positions, triangle meshes, gameplay paint, physics or nav. */
import {Color,Entity,StandardMaterial,type AppBase,type Material,
 type MeshInstance} from 'playcanvas';
import type {StageDefinition,StageMaterialKey,StageSolidDefinition}
 from '../stage/StageDefinition';
export type B250Band='LOWER'|'MIDDLE'|'UPPER';
export function b250SolidTone(
 s:Pick<StageSolidDefinition,'center'|'material'>,min:number,max:number
):{band:B250Band;rgb:readonly [number,number,number]}{
 const y=s.center[1];
 if(![y,min,max].every(Number.isFinite))throw Error('B250_BAD_SOURCE_Y');
 const r=max-min>1e-5?Math.max(0,Math.min(1,(y-min)/(max-min))):.5;
 const band:B250Band=r<.34?'LOWER':r<.68?'MIDDLE':'UPPER';
 const colors:Record<StageMaterialKey,readonly [number,number,number]>={
  dark:[.27,.32,.38],medium:[.36,.42,.47],
  light:[.46,.52,.57],accent:[.31,.60,.68]};
 const lift=band==='UPPER'?.11:band==='MIDDLE'?.055:0;
 const rgb=colors[s.material].map(x=>Math.min(1,x+lift)) as [number,number,number];
 return {band,rgb};
}
export type B250SourceView={
 setEnabled:(on:boolean)=>void;
 snapshot:()=>{enabled:boolean;sourceSolids:25;renderSolids:number;
  materialBindings:number;bands:Record<B250Band,number>;
  authority:'25/17/26/0';productionAuthorized:false};
};
export function installB250SourceView(app:AppBase,camera:Entity,
 stage:StageDefinition):B250SourceView{
 if(stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26)
  throw Error('B250_IMMUTABLE_SOURCE_REQUIRED');
 const root=app.root.findByName('StageRoot');
 if(!root||!camera.camera)throw Error('B250_REGISTERED_RENDER_ROOT_MISSING');
 const visible=stage.solids.filter(s=>s.render);
 const min=Math.min(...visible.map(s=>s.center[1]));
 const max=Math.max(...visible.map(s=>s.center[1]));
 const originalAmbient=app.scene.ambientLight.clone();
 const originalClear=camera.camera.clearColor.clone();
 const bindings:{mesh:MeshInstance;before:Material;after:StandardMaterial}[]=[];
 const bands:Record<B250Band,number>={LOWER:0,MIDDLE:0,UPPER:0};
 function collect(node:Entity):MeshInstance[]{
  return [...(node.render?.meshInstances??[]),
   ...node.children.flatMap(c=>collect(c as Entity))];
 }
 for(const s of visible){
  const entity=root.findByName(s.id) as Entity|null;
  if(!entity)throw Error('B250_MISSING_SOURCE_SOLID_RENDER_'+s.id);
  const meshes=collect(entity);
  if(!meshes.length)throw Error('B250_EMPTY_SOURCE_SOLID_RENDER_'+s.id);
  const tone=b250SolidTone(s,min,max);
  bands[tone.band]++;
  const m=new StandardMaterial();
  m.diffuse=new Color(...tone.rgb);
  m.emissive=new Color(tone.rgb[0]*.07,tone.rgb[1]*.08,tone.rgb[2]*.09);
  m.useMetalness=true;m.metalness=.12;m.gloss=.40;m.update();
  for(const mesh of meshes)bindings.push({mesh,before:mesh.material,after:m});
 }
 let enabled=false;
 const setEnabled=(on:boolean)=>{
  enabled=on;
  for(const b of bindings)b.mesh.material=on?b.after:b.before;
  app.scene.ambientLight=on?new Color(.71,.77,.83):originalAmbient;
  camera.camera!.clearColor=on?new Color(.10,.15,.20,1):originalClear;
 };
 setEnabled(true);
 return {setEnabled,snapshot:()=>({
  enabled,sourceSolids:25 as const,renderSolids:visible.length,
  materialBindings:bindings.length,bands:{...bands},
  authority:'25/17/26/0' as const,productionAuthorized:false as const
 })};
}
