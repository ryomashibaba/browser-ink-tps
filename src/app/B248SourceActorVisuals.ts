/** B248 render-only source actor silhouettes. Never add physics actors,
 * attack targets, stage solids, paint surfaces, Recast links or score. */
import {Color,Entity,StandardMaterial} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {B268_COMPACT_HUMAN_PARTS,b268VariantAccepted,
 type B268RenderVariant} from './B268SourceActorComposition';
import {B269_REAR_IDENTITY_PARTS,b269ValidateParts}
 from './B269SourceActorIdentity';
import {B292_PARTS,b292Validate} from './B292FlowSourceActor';
type Primitive='box'|'sphere'|'capsule'|'cylinder';
type MaterialId='SUIT'|'TEAM'|'VISOR'|'DARK'|'GEAR';
type Part={name:string;type:Primitive;tint:MaterialId;
 pos:readonly [number,number,number];size:readonly [number,number,number]};
const human:readonly Part[]=[
 {name:'torso',type:'box',tint:'SUIT',pos:[0,-.02,0],size:[.84,.70,.50]},
 {name:'vest',type:'box',tint:'TEAM',pos:[0,.07,-.285],size:[.55,.40,.08]},
 {name:'helmet',type:'sphere',tint:'TEAM',pos:[0,.58,0],size:[.71,.57,.65]},
 {name:'visor',type:'box',tint:'VISOR',pos:[0,.56,-.33],size:[.54,.20,.10]},
 {name:'arm-left',type:'capsule',tint:'SUIT',pos:[-.53,-.09,0],size:[.23,.66,.27]},
 {name:'arm-right',type:'capsule',tint:'SUIT',pos:[.53,-.09,0],size:[.23,.66,.27]},
 {name:'leg-left',type:'box',tint:'DARK',pos:[-.22,-.57,.01],size:[.30,.56,.32]},
 {name:'leg-right',type:'box',tint:'DARK',pos:[.22,-.57,.01],size:[.30,.56,.32]},
 {name:'boot-left',type:'box',tint:'GEAR',pos:[-.22,-.88,-.12],size:[.35,.18,.46]},
 {name:'boot-right',type:'box',tint:'GEAR',pos:[.22,-.88,-.12],size:[.35,.18,.46]},
 {name:'ink-tank',type:'cylinder',tint:'TEAM',pos:[0,-.01,.36],size:[.46,.68,.35]},
 {name:'tank-neck',type:'box',tint:'VISOR',pos:[0,.32,.36],size:[.44,.11,.36]},
 {name:'weapon',type:'box',tint:'GEAR',pos:[.60,-.24,-.36],size:[.23,.23,.68]},
 {name:'nozzle',type:'box',tint:'TEAM',pos:[.60,-.23,-.72],size:[.19,.18,.20]}
];
export const B248_SOURCE_VISUAL_AUTHORITY=Object.freeze({
 humanParts:human.length,visualOnly:true,solidsAdded:0,paintAdded:0,
 linksAdded:0,scoreableAdded:0,actorBodiesAdded:0,
 physicalActorsMoved:0,productionAuthorized:false
} as const);
export function b248HumanParts():readonly Part[]{return human;}
function make(rgb:readonly [number,number,number],emission=0):StandardMaterial{
 const m=new StandardMaterial();
 m.diffuse=new Color(...rgb);
 m.emissive=new Color(rgb[0]*emission,rgb[1]*emission,rgb[2]*emission);
 m.useMetalness=true;m.metalness=.12;m.gloss=.5;m.update();return m;
}
function makeColors(team:'A'|'B'):Record<MaterialId,StandardMaterial>{
 const pigment=team==='A'?GAME_CONFIG.visual.teamA:GAME_CONFIG.visual.teamB;
 return {SUIT:make([.13,.22,.33]),TEAM:make(pigment,.2),
  VISOR:make([.74,.94,1],.3),DARK:make([.07,.10,.17]),
  GEAR:make([.22,.29,.36])};
}
function piece(parent:Entity,p:Part,colors:Record<MaterialId,StandardMaterial>){
 const e=new Entity('B248:VISUAL_ONLY:'+p.name);
 e.addComponent('render',{type:p.type,material:colors[p.tint],
  castShadows:false,receiveShadows:false});
 e.setLocalPosition(...p.pos);e.setLocalScale(...p.size);
 parent.addChild(e);
}
/** B249: render-only yaw; -Z is the local model's forward axis.
 * No movement => last real facing remains; no synthetic movement. */
export function b249FacingDegrees(x:number,z:number,last:number):number{
 if(!Number.isFinite(x)||!Number.isFinite(z)||x*x+z*z<1e-8)return last;
 const yaw=Math.atan2(-x,-z)*180/Math.PI;
 return yaw===0?0:yaw;
}
export function b249StrideDegrees(activity:number,phase:number):number{
 if(!Number.isFinite(activity)||!Number.isFinite(phase))return 0;
 return Math.sin(phase)*24*Math.max(0,Math.min(1,activity));
}
export type B248Visual={
 setMode:(mode:'HUMAN'|'SQUID')=>void;
 setEnabled:(shown:boolean)=>void;
 /** B307 QA: hide every actor draw without enabling primitive fallback. */
 setAuditDrawHidden:(hidden:boolean)=>void;
 setResearchVariant:(mode:B268RenderVariant)=>void;
 setPose:(dx:number,dz:number,activity:number,phase:number)=>void;
};
const b268ActorVisuals=new WeakMap<Entity,B248Visual>();
/** Exact existing native source entities only, not inferred placements. */
export function b248ExistingSourceActorVisual(parent:Entity):B248Visual|null{
 return b268ActorVisuals.get(parent)??null;
}
export function decorateB248Actor(parent:Entity,team:'A'|'B',
 role:'PLAYER'|'CPU'):B248Visual{
 if(!parent.render)throw Error('B248_EXISTING_ACTOR_RENDER_REQUIRED');
 const colors=makeColors(team),humanRoot=new Entity('B248:GEAR_VISUAL');
 parent.addChild(humanRoot);
 const limbs=new Map<string,Entity>();
 for(const p of human){
  const e=new Entity('B248:VISUAL_ONLY:'+p.name);
  e.addComponent('render',{type:p.type,material:colors[p.tint],
   castShadows:false,receiveShadows:false});
  e.setLocalPosition(...p.pos);e.setLocalScale(...p.size);
  humanRoot.addChild(e);limbs.set(p.name,e);
 }
 const squidRoot=new Entity('B248:SQUID_VISUAL');
 parent.addChild(squidRoot);
 if(role==='PLAYER')for(const p of [
  {name:'squid-body',type:'sphere',tint:'TEAM',
   pos:[0,0,0],size:[.95,.66,1.04]},
  {name:'squid-eye-l',type:'sphere',tint:'VISOR',
   pos:[-.22,.18,-.43],size:[.20,.23,.15]},
  {name:'squid-eye-r',type:'sphere',tint:'VISOR',
   pos:[.22,.18,-.43],size:[.20,.23,.15]}
 ] as const)piece(squidRoot,p,colors);
 // B255: reversible display only, retaining the same native actor Entity.
 let requestedMode:'HUMAN'|'SQUID'='HUMAN',shown=true;
 let auditDrawHidden=false;
 let researchVariant:B268RenderVariant='B248_ORIGINAL';
 let compactRoot:Entity|null=null;
 let identityRoot:Entity|null=null;
 let flowRoot:Entity|null=null;
 const flowLimb=new Map<string,Entity>();
 const ensureCompact=()=>{
  if(compactRoot)return;
  const root=new Entity('B268:RESEARCH_ONLY_COMPACT_SILHOUETTE');
  root.enabled=false;
  const originalTeam=team==='A'?GAME_CONFIG.visual.teamA:GAME_CONFIG.visual.teamB;
  const materials={
   ARMOR:make([.075,.115,.165]),TRIM:make([.17,.23,.29]),
   VISOR:make([.38,.8,.92],.35),INK:make(originalTeam,.23),
   FABRIC:make([.06,.085,.115]),METAL:make([.23,.3,.37])
  };
  for(const p of B268_COMPACT_HUMAN_PARTS){
   const part=new Entity('B268:VISUAL_ONLY:'+p.name);
   part.addComponent('render',{type:p.primitive,
    material:materials[p.surface],castShadows:false,receiveShadows:false});
   part.setLocalPosition(...p.pos);part.setLocalScale(...p.size);
   root.addChild(part);
  }
  parent.addChild(root);
  compactRoot=root;
 };
 const ensureIdentity=()=>{
  if(identityRoot)return;
  b269ValidateParts(B269_REAR_IDENTITY_PARTS);
  const root=new Entity('B269:RESEARCH_ONLY_REAR_IDENTITY');
  root.enabled=false;
  const pigment=team==='A'?GAME_CONFIG.visual.teamA:GAME_CONFIG.visual.teamB;
  const materials={
   ARMOR:make([.11,.17,.22]),
   FABRIC:make([.075,.11,.14]),
   PLATE:make([.25,.33,.38]),
   TEAM:make(pigment,.42),
   VISOR:make([.68,.88,.96],.20),
   STEEL:make([.15,.22,.27])
  };
  for(const p of B269_REAR_IDENTITY_PARTS){
   const child=new Entity('B269:VISUAL_ONLY:'+p.name);
   child.addComponent('render',{type:p.type,material:materials[p.tone],
    castShadows:false,receiveShadows:false});
   child.setLocalPosition(...p.pos);
   child.setLocalScale(...p.size);
   if(p.euler)child.setLocalEulerAngles(...p.euler);
   root.addChild(child);
  }
  parent.addChild(root);
  identityRoot=root;
 };
 const ensureFlow=()=>{
  if(flowRoot)return;
  b292Validate();
  const root=new Entity('B292:RESEARCH_ONLY_ORGANIC_SILHOUETTE');
  root.enabled=false;
  const pigment=team==='A'?GAME_CONFIG.visual.teamA:GAME_CONFIG.visual.teamB;
  const materials={
   SUIT:make([.09,.15,.20]),CLOTH:make([.17,.25,.29]),
   TEAM:make(pigment,.18),VISOR:make([.36,.71,.78],.12),
   GEAR:make([.08,.12,.16])
  };
  for(const p of B292_PARTS){
   const e=new Entity('B292:VISUAL_ONLY:'+p.name);
   e.addComponent('render',{type:p.type,material:materials[p.tone],
    castShadows:false,receiveShadows:false});
   e.setLocalPosition(...p.pos);e.setLocalScale(...p.size);
   if(p.angle)e.setLocalEulerAngles(...p.angle);
   root.addChild(e);
   if(['left-arm','right-arm','left-leg','right-leg'].includes(p.name))
    flowLimb.set(p.name,e);
  }
  parent.addChild(root);flowRoot=root;
 };
 const syncVisibility=()=>{
  // B307: setEnabled(false) normally enables the primitive fallback.
  // Research-only optical audit must suppress both outfit AND fallback.
  parent.render!.enabled=!shown&&!auditDrawHidden;
  humanRoot.enabled=shown&&!auditDrawHidden&&requestedMode==='HUMAN'&&
   researchVariant==='B248_ORIGINAL';
  if(compactRoot)compactRoot.enabled=shown&&!auditDrawHidden&&requestedMode==='HUMAN'&&
   researchVariant==='B268_COMPACT';
  if(identityRoot)identityRoot.enabled=shown&&!auditDrawHidden&&requestedMode==='HUMAN'&&
   researchVariant==='B269_REAR_IDENTITY';
  if(flowRoot)flowRoot.enabled=shown&&!auditDrawHidden&&requestedMode==='HUMAN'&&
   researchVariant==='B292_FLOW_SILHOUETTE';
  squidRoot.enabled=shown&&!auditDrawHidden&&requestedMode==='SQUID'&&role==='PLAYER';
 };
 const setMode=(mode:'HUMAN'|'SQUID')=>{
  requestedMode=mode;syncVisibility();
 };
 const setEnabled=(next:boolean)=>{
  shown=next;syncVisibility();
 };
 const setAuditDrawHidden=(hidden:boolean)=>{
  auditDrawHidden=hidden;syncVisibility();
 };
 const setResearchVariant=(mode:B268RenderVariant)=>{
  if(!b268VariantAccepted(mode))throw Error('B268_UNKNOWN_SOURCE_ACTOR_STYLE');
  if(mode==='B268_COMPACT')ensureCompact();
  if(mode==='B269_REAR_IDENTITY')ensureIdentity();
  if(mode==='B292_FLOW_SILHOUETTE')ensureFlow();
  // A frozen study must use the *last real native movement yaw*, not a
  // synthetic forward-facing mannequin pose after the model is spawned.
  if(compactRoot)compactRoot.setLocalEulerAngles(0,facing,0);
  if(identityRoot)identityRoot.setLocalEulerAngles(0,facing,0);
  if(flowRoot)flowRoot.setLocalEulerAngles(0,facing,0);
  researchVariant=mode;syncVisibility();
 };
 let facing=team==='B'?180:0;
 const setPose=(dx:number,dz:number,activity:number,phase:number)=>{
  facing=b249FacingDegrees(dx,dz,facing);
  humanRoot.setLocalEulerAngles(0,facing,0);
  if(compactRoot)compactRoot.setLocalEulerAngles(0,facing,0);
  if(identityRoot)identityRoot.setLocalEulerAngles(0,facing,0);
  if(flowRoot)flowRoot.setLocalEulerAngles(0,facing,0);
  squidRoot.setLocalEulerAngles(0,facing,0);
  const swing=b249StrideDegrees(activity,phase);
  for(const [part,sign] of [
   ['left-arm',-1],['right-arm',1],
   ['left-leg',1],['right-leg',-1]
  ] as const)flowLimb.get(part)?.setLocalEulerAngles(swing*sign,0,0);
  for(const [part,sign] of [
   ['arm-left',-1],['arm-right',1],
   ['leg-left',1],['leg-right',-1],
   ['boot-left',1],['boot-right',-1]
  ] as const)limbs.get(part)?.setLocalEulerAngles(swing*sign,0,0);
 };
 setMode('HUMAN');
 const visual={setMode,setEnabled,setAuditDrawHidden,setPose,setResearchVariant};
 b268ActorVisuals.set(parent,visual);
 return visual;
}
