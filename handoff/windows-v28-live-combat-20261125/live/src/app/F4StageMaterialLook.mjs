// Optical parameters only. No collision, texture bytes or masks.
export function f4StageMaterialLook(kind,matteTerrain=false){
 if(matteTerrain)return {metalness:0,gloss:.18};
 switch(kind){
 case "FLOOR":return {metalness:0,gloss:.20};
 case "SLOPE":return {metalness:0,gloss:.24};
 case "METAL":return {metalness:.32,gloss:.55};
 case "GLASS":return {metalness:0,gloss:.68};
 case "SUPPORT":return {metalness:.03,gloss:.27};
 case "STRUCTURE":return {metalness:.04,gloss:.31};
 case "DETAIL":return {metalness:.08,gloss:.38};
 default:return null;
 }
}
// Stay at 2x on constrained devices. On higher-capability samplers,
 // use at most 4x for the original floor textures (no extra meshes/maps).
 // Capability is not a measured frame-rate guarantee.
 export function f4FloorAnisotropy(maximum){
  return Number.isFinite(maximum)&&maximum>=8?4:
   Number.isFinite(maximum)&&maximum>=2?2:1;
 }
