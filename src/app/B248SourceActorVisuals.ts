/** B248 render-only source actor silhouettes. Never add physics actors,
 * attack targets, stage solids, paint surfaces, Recast links or score. */
import {Color,Entity,StandardMaterial} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
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
export type B248Visual={setMode:(mode:'HUMAN'|'SQUID')=>void};
export function decorateB248Actor(parent:Entity,team:'A'|'B',
 role:'PLAYER'|'CPU'):B248Visual{
 if(!parent.render)throw Error('B248_EXISTING_ACTOR_RENDER_REQUIRED');
 const colors=makeColors(team),humanRoot=new Entity('B248:GEAR_VISUAL');
 parent.addChild(humanRoot);
 for(const p of human)piece(humanRoot,p,colors);
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
 parent.render.enabled=false;
 const setMode=(mode:'HUMAN'|'SQUID')=>{
  humanRoot.enabled=mode==='HUMAN';
  squidRoot.enabled=mode==='SQUID'&&role==='PLAYER';
 };
 setMode('HUMAN');
 return {setMode};
}
