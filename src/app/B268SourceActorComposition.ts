/** B268: optional, ORIGINAL-SOURCE-only actual 3D actor render study.
 * Purpose: compare whole-view identity and gameplay ink readability with
 * compact, dark readable silhouettes, not replace source 3D/physics assets.
 * No colliders, actors, source geometry, score or projectile surfaces added. */
export const B268_RENDER_VARIANTS=['B248_ORIGINAL','B268_COMPACT'] as const;
export type B268RenderVariant=typeof B268_RENDER_VARIANTS[number];
export type B268Primitive='box'|'sphere'|'capsule'|'cylinder';
export type B268Tone='ARMOR'|'TRIM'|'VISOR'|'INK'|'FABRIC'|'METAL';
export type B268Part=Readonly<{
 name:string;primitive:B268Primitive;surface:B268Tone;
 pos:readonly [number,number,number];
 size:readonly [number,number,number];
}>;
/** Same native character transform; different only in already-rendered geometry.
 * Deliberately reduce large uniform luminous shapes and keep team recognition. */
export const B268_COMPACT_HUMAN_PARTS:readonly B268Part[]=Object.freeze([
 {name:'shell-torso',primitive:'box',surface:'ARMOR',pos:[0,-.07,0],size:[.72,.73,.43]},
 {name:'chest-shell',primitive:'box',surface:'METAL',pos:[0,-.02,-.24],size:[.55,.43,.09]},
 {name:'chest-ink-id',primitive:'box',surface:'INK',pos:[0,.13,-.299],size:[.28,.075,.038]},
 {name:'neck-gasket',primitive:'cylinder',surface:'FABRIC',pos:[0,.33,0],size:[.32,.14,.32]},
 {name:'helmet-shell',primitive:'sphere',surface:'ARMOR',pos:[0,.53,0],size:[.61,.47,.55]},
 {name:'helmet-brow',primitive:'box',surface:'METAL',pos:[0,.65,-.29],size:[.49,.09,.08]},
 {name:'slit-visor',primitive:'box',surface:'VISOR',pos:[0,.53,-.305],size:[.43,.12,.065]},
 {name:'shoulder-left',primitive:'box',surface:'METAL',pos:[-.43,.18,0],size:[.29,.20,.42]},
 {name:'shoulder-right',primitive:'box',surface:'METAL',pos:[.43,.18,0],size:[.29,.20,.42]},
 {name:'arm-left',primitive:'capsule',surface:'ARMOR',pos:[-.45,-.20,0],size:[.20,.57,.23]},
 {name:'arm-right',primitive:'capsule',surface:'ARMOR',pos:[.45,-.20,0],size:[.20,.57,.23]},
 {name:'wrist-left',primitive:'box',surface:'INK',pos:[-.46,-.47,-.10],size:[.12,.045,.18]},
 {name:'wrist-right',primitive:'box',surface:'INK',pos:[.46,-.47,-.10],size:[.12,.045,.18]},
 {name:'leg-left',primitive:'box',surface:'FABRIC',pos:[-.18,-.61,.02],size:[.24,.53,.27]},
 {name:'leg-right',primitive:'box',surface:'FABRIC',pos:[.18,-.61,.02],size:[.24,.53,.27]},
 {name:'boot-left',primitive:'box',surface:'METAL',pos:[-.18,-.9,-.08],size:[.30,.19,.38]},
 {name:'boot-right',primitive:'box',surface:'METAL',pos:[.18,-.9,-.08],size:[.30,.19,.38]},
 {name:'tank-shell',primitive:'cylinder',surface:'METAL',pos:[0,-.06,.31],size:[.37,.55,.29]},
 {name:'tank-status',primitive:'box',surface:'INK',pos:[0,.05,.49],size:[.21,.075,.035]},
 {name:'carbine',primitive:'box',surface:'METAL',pos:[.49,-.31,-.33],size:[.18,.19,.55]},
 {name:'carbine-nozzle',primitive:'cylinder',surface:'INK',pos:[.49,-.31,-.66],size:[.11,.14,.11]}
] as const);
/** Exactly zero physical/gameplay authority, even with eight visual kits. */
export const B268_VISUAL_AUTHORITY=Object.freeze({
 existingRealActors:8 as const,realCpuActors:7 as const,
 originalStage:'25/17/26/0' as const,originalUvTriangles:57578 as const,
 paintOwnershipModified:0 as const,renderOnly:true as const,
 physicsActorsAdded:0 as const,solidsAdded:0 as const,
 paintSurfacesAdded:0 as const,navLinksAdded:0 as const,
 scoreableSurfacesAdded:0 as const,actorPositionsModified:0 as const,
 sourceOpticalMeshesModified:0 as const,artAccepted:false as const,
 unrestricted4v4Certified:false as const,productionAuthorized:false as const
});
export function b268VariantAccepted(mode:string):mode is B268RenderVariant{
 return B268_RENDER_VARIANTS.includes(mode as B268RenderVariant);
}
export function b268RenderResearchGate(p:URLSearchParams,e:{
 paused:boolean;staging:boolean;stopped:boolean;fullRound:boolean;
 pointerLocked:boolean;verifiedUv:boolean;inkSafe:boolean;
 humanoid:boolean;surveyActive:boolean;cameraBaseline:boolean;
 qaFocusOff:boolean;b256Off:boolean;solidCount:number;
 paintSurfaceCount:number;navCount:number;scoreableCount:number;
 triangles:number;textureCount:number;cpuCount:number;
 rasterBaseline:boolean;metalRestored:boolean
}):boolean{
 return p.get('t21Play')==='preview'&&
 p.get('t21FullSource')==='review'&&
 p.get('t21B253')==='liveInk'&&
 p.get('t21B255')==='actorStudy'&&
 p.get('t21B263')==='paintProjection'&&
 p.get('t21B268')==='actorComposition'&&
 p.get('t21QaInput')!=='deterministic'&&
 e.paused&&e.staging&&!e.stopped&&!e.fullRound&&!e.pointerLocked&&
 e.verifiedUv&&e.inkSafe&&e.humanoid&&!e.surveyActive&&
 e.cameraBaseline&&e.qaFocusOff&&e.b256Off&&e.rasterBaseline&&
 e.metalRestored&&e.solidCount===25&&e.paintSurfaceCount===17&&
 e.navCount===26&&e.scoreableCount===0&&e.triangles===57578&&
 e.textureCount===19&&e.cpuCount===7;
}
