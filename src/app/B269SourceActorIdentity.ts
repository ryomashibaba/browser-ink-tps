/** B269: genuine PlayCanvas third-person source actor rear-readability candidate.
 * Design MUST show TEAM identity from behind and break the sphere/tube silhouette.
 * Existing native actor instances only. No colliders, ink, score, actor motions.
 */
export type B269ActorSurface='ARMOR'|'FABRIC'|'PLATE'|'TEAM'|'VISOR'|'STEEL';
export type B269ActorPrimitive='box'|'sphere'|'capsule'|'cylinder';
export type B269ActorPart=Readonly<{name:string;type:B269ActorPrimitive;
 tone:B269ActorSurface;pos:readonly [number,number,number];
 size:readonly [number,number,number];
 euler?:readonly [number,number,number]}>;
export const B269_REAR_IDENTITY_PARTS:readonly B269ActorPart[]=Object.freeze([
 // An angular helmet instead of a single luminous sphere.
 {name:'angular-helmet-core',type:'box',tone:'ARMOR',pos:[0,.53,-.01],size:[.56,.42,.49]},
 {name:'helmet-crown',type:'box',tone:'PLATE',pos:[0,.78,-.01],size:[.47,.075,.43]},
 {name:'helmet-brow',type:'box',tone:'STEEL',pos:[0,.64,-.29],size:[.51,.09,.11]},
 {name:'visor-forward',type:'box',tone:'VISOR',pos:[0,.53,-.31],size:[.45,.13,.07]},
 {name:'helmet-ear-left',type:'cylinder',tone:'PLATE',pos:[-.295,.53,0],size:[.12,.24,.22]},
 {name:'helmet-ear-right',type:'cylinder',tone:'PLATE',pos:[.295,.53,0],size:[.12,.24,.22]},
 // Readable torso shoulder/waist transitions, not a monochrome long tube.
 {name:'torso-armor',type:'box',tone:'ARMOR',pos:[0,-.04,0],size:[.68,.59,.43]},
 {name:'front-breastplate',type:'box',tone:'PLATE',pos:[0,.10,-.26],size:[.52,.33,.06]},
 {name:'waist-belt',type:'box',tone:'STEEL',pos:[0,-.38,0],size:[.50,.15,.39]},
 {name:'pelvis-armor',type:'box',tone:'FABRIC',pos:[0,-.51,0],size:[.44,.16,.35]},
 {name:'left-shoulder-plate',type:'box',tone:'PLATE',pos:[-.43,.23,-.02],size:[.29,.23,.44]},
 {name:'right-shoulder-plate',type:'box',tone:'PLATE',pos:[.43,.23,-.02],size:[.29,.23,.44]},
 {name:'left-arm',type:'capsule',tone:'ARMOR',pos:[-.48,-.16,0],size:[.19,.54,.23]},
 {name:'right-arm',type:'capsule',tone:'ARMOR',pos:[.48,-.16,0],size:[.19,.54,.23]},
 {name:'left-glove',type:'box',tone:'STEEL',pos:[-.48,-.48,-.09],size:[.19,.14,.25]},
 {name:'right-glove',type:'box',tone:'STEEL',pos:[.48,-.48,-.09],size:[.19,.14,.25]},
 {name:'left-thigh',type:'box',tone:'FABRIC',pos:[-.17,-.70,.02],size:[.26,.35,.29]},
 {name:'right-thigh',type:'box',tone:'FABRIC',pos:[.17,-.70,.02],size:[.26,.35,.29]},
 {name:'left-shin',type:'box',tone:'PLATE',pos:[-.17,-.94,-.06],size:[.22,.20,.25]},
 {name:'right-shin',type:'box',tone:'PLATE',pos:[.17,-.94,-.06],size:[.22,.20,.25]},
 {name:'left-boot',type:'box',tone:'STEEL',pos:[-.17,-1.02,-.13],size:[.29,.17,.38]},
 {name:'right-boot',type:'box',tone:'STEEL',pos:[.17,-1.02,-.13],size:[.29,.17,.38]},
 // Visible from the actual native third-person camera (back is +Z).
 // Two diagonal large team strips / off-center dual ink tanks deliberately
 // break up the formerly dark, generic back with an A-vs-B emblem.
 {name:'backpack-steel',type:'box',tone:'STEEL',pos:[0,-.05,.305],size:[.41,.52,.22]},
 {name:'back-team-chevron-left',type:'box',tone:'TEAM',pos:[-.16,.11,.435],
  size:[.13,.40,.065],euler:[0,0,-28]},
 {name:'back-team-chevron-right',type:'box',tone:'TEAM',pos:[.16,.11,.435],
  size:[.13,.40,.065],euler:[0,0,28]},
 {name:'back-ink-meter',type:'box',tone:'VISOR',pos:[0,-.24,.44],size:[.30,.075,.055]},
 {name:'left-tank',type:'cylinder',tone:'PLATE',pos:[-.31,-.12,.37],size:[.15,.47,.16]},
 {name:'right-tank',type:'cylinder',tone:'PLATE',pos:[.31,-.12,.37],size:[.15,.47,.16]},
 {name:'tank-lights-left',type:'box',tone:'TEAM',pos:[-.31,-.02,.47],size:[.08,.25,.045]},
 {name:'tank-lights-right',type:'box',tone:'TEAM',pos:[.31,-.02,.47],size:[.08,.25,.045]},
 // Clear asymmetrical combat silhouette; retains old game weapon authority.
 {name:'right-carbine',type:'box',tone:'STEEL',pos:[.58,-.26,-.28],size:[.22,.22,.55]},
 {name:'right-carbine-barrel',type:'cylinder',tone:'PLATE',pos:[.58,-.26,-.65],size:[.12,.12,.22]},
 {name:'right-carbine-team-mark',type:'box',tone:'TEAM',pos:[.58,-.14,-.3],size:[.13,.06,.22]}
]);
export const B269_RENDER_ONLY_AUTHORITY=Object.freeze({
 physicalSource:'25/17/26/0' as const,existingActors:8 as const,
 originalUvTriangles:57578 as const,originalTextures:19 as const,
 actualActorWorldTransformsChanged:0 as const,collidersAdded:0 as const,
 originalStageMeshesAltered:0 as const,realPaintCellsChanged:0 as const,
 scoreablePromotions:0 as const,navLinksChanged:0 as const,
 candidateIsNotOfficialOriginalActorAsset:true as const,
 artAccepted:false as const,productionAuthorized:false as const
});
export function b269ValidateParts(parts:readonly B269ActorPart[]){
 if(parts.length<24||parts.length>40)
  throw Error('B269_BOUNDED_SOURCE_ACTOR_GEOMETRY');
 const seen=new Set<string>();
 for(const part of parts){
  if(seen.has(part.name)||!part.name||
    !['box','sphere','capsule','cylinder'].includes(part.type)||
    !['ARMOR','FABRIC','PLATE','TEAM','VISOR','STEEL'].includes(part.tone)||
    part.pos.length!==3||!part.pos.every(x=>Number.isFinite(x)&&Math.abs(x)<=1.2)||
    part.size.length!==3||!part.size.every(x=>Number.isFinite(x)&&x>.02&&x<=1)||
    (part.euler&&(!part.euler.every(Number.isFinite)||
      part.euler.some(x=>Math.abs(x)>60))))
   throw Error('B269_INVALID_SOURCE_ACTOR_PART');
  seen.add(part.name);
 }
 if(parts.filter(p=>p.tone==='TEAM').length<4||
    parts.filter(p=>p.name.startsWith('back-team-')).length!==2||
    parts.some(p=>p.type==='sphere'&&Math.max(...p.size)>.46))
  throw Error('B269_REAR_TEAM_RECOGNITION_NOT_DEFINED');
 return {parts:parts.length,teams:['A','B'] as const,
  primitiveSourceOnly:true as const,originalSourceUnchanged:true as const};
}
