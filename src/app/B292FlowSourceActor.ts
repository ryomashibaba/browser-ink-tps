/** B292: genuine PlayCanvas SOURCE actor render-only organic silhouette.
 * Independent experimental character, not a claimed original game asset. */
export type B292Part={name:string;type:'sphere'|'capsule'|'box'|'cylinder';
 tone:'CLOTH'|'SUIT'|'TEAM'|'VISOR'|'GEAR';
 pos:readonly [number,number,number];size:readonly [number,number,number];
 angle?:readonly [number,number,number]};
export const B292_PARTS:readonly B292Part[]=Object.freeze([
 {name:'soft-head',type:'sphere',tone:'CLOTH',pos:[0,.57,0],size:[.47,.45,.45]},
 {name:'soft-cap',type:'sphere',tone:'SUIT',pos:[0,.78,.06],size:[.43,.13,.41]},
 {name:'visor',type:'sphere',tone:'VISOR',pos:[0,.57,-.24],size:[.35,.13,.09]},
 {name:'left-hair-fin',type:'capsule',tone:'TEAM',pos:[-.21,.67,.23],size:[.10,.33,.13],angle:[-25,0,23]},
 {name:'right-hair-fin',type:'capsule',tone:'CLOTH',pos:[.19,.68,.22],size:[.11,.29,.14],angle:[-22,0,-21]},
 {name:'neck',type:'capsule',tone:'SUIT',pos:[0,.31,0],size:[.28,.15,.31]},
 {name:'rounded-jacket',type:'capsule',tone:'CLOTH',pos:[0,-.07,0],size:[.55,.67,.39]},
 {name:'front-layer',type:'sphere',tone:'SUIT',pos:[0,.04,-.22],size:[.41,.39,.12]},
 {name:'left-collar',type:'sphere',tone:'TEAM',pos:[-.21,.23,-.17],size:[.19,.11,.12]},
 {name:'waist',type:'capsule',tone:'SUIT',pos:[0,-.42,.02],size:[.41,.18,.33]},
 {name:'rear-sash',type:'box',tone:'TEAM',pos:[.02,0,.27],size:[.12,.57,.075],angle:[0,0,30]},
 {name:'side-sash-end',type:'capsule',tone:'TEAM',pos:[.32,-.37,.16],size:[.09,.30,.09]},
 {name:'left-arm',type:'capsule',tone:'CLOTH',pos:[-.38,-.17,0],size:[.20,.55,.24],angle:[0,0,-9]},
 {name:'right-arm',type:'capsule',tone:'CLOTH',pos:[.38,-.17,0],size:[.20,.55,.24],angle:[0,0,9]},
 {name:'left-hand',type:'sphere',tone:'SUIT',pos:[-.42,-.47,-.07],size:[.18,.15,.17]},
 {name:'right-hand',type:'sphere',tone:'SUIT',pos:[.42,-.47,-.07],size:[.18,.15,.17]},
 {name:'left-leg',type:'capsule',tone:'SUIT',pos:[-.16,-.68,0],size:[.24,.44,.25]},
 {name:'right-leg',type:'capsule',tone:'SUIT',pos:[.16,-.68,0],size:[.24,.44,.25]},
 {name:'left-cuff',type:'capsule',tone:'CLOTH',pos:[-.16,-.88,-.04],size:[.21,.26,.23]},
 {name:'right-cuff',type:'capsule',tone:'CLOTH',pos:[.16,-.88,-.04],size:[.21,.26,.23]},
 {name:'left-shoe',type:'sphere',tone:'GEAR',pos:[-.16,-1,-.14],size:[.28,.17,.39]},
 {name:'right-shoe',type:'sphere',tone:'GEAR',pos:[.16,-1,-.14],size:[.28,.17,.39]},
 {name:'single-ink-vial',type:'cylinder',tone:'GEAR',pos:[-.22,-.15,.31],size:[.19,.47,.19]},
 {name:'vial-cap',type:'sphere',tone:'TEAM',pos:[-.22,.11,.31],size:[.14,.12,.14]},
 {name:'vial-lit-stripe',type:'box',tone:'TEAM',pos:[-.22,-.16,.41],size:[.08,.19,.04]},
 {name:'blaster',type:'capsule',tone:'GEAR',pos:[.48,-.31,-.34],size:[.15,.20,.37],angle:[66,0,0]},
 {name:'blaster-tip',type:'cylinder',tone:'TEAM',pos:[.48,-.28,-.60],size:[.12,.13,.14],angle:[90,0,0]}
]);
export const B292_AUTHORITY=Object.freeze({renderOnly:true,existingActors:8,
 originalSource:'25/17/26/0',actorRelocations:0,collidersAdded:0,
 paintSurfacesAdded:0,navLinksAdded:0,scoreablePromotions:0,
 artAccepted:false,productionAuthorized:false});
export function b292Validate(parts:readonly B292Part[]=B292_PARTS){
 const names=new Set<string>();let halfWidth=0;
 if(parts.length<25||parts.length>34)throw Error('B292_BAD_PART_COUNT');
 for(const part of parts){
  if(names.has(part.name)||!part.name||
    !['sphere','capsule','box','cylinder'].includes(part.type)||
    !part.pos.every(v=>Number.isFinite(v)&&Math.abs(v)<1.2)||
    !part.size.every(v=>Number.isFinite(v)&&v>.02&&v<=.70)||
    (part.angle&&!part.angle.every(v=>Number.isFinite(v)&&Math.abs(v)<=90)))
    throw Error('B292_BAD_PART');
  names.add(part.name);
  halfWidth=Math.max(halfWidth,Math.abs(part.pos[0])+part.size[0]/2);
 }
 if(halfWidth>.72||!names.has('single-ink-vial')||
   !names.has('rear-sash')||!names.has('soft-head'))
  throw Error('B292_NOT_ORGANIC_SLIM');
 return {count:parts.length,halfWidth};
}
