/** B294 render-binding inspection of 17 actual source PaintSurface meshes.
 * Pure validation. A correct binding does not prove the atlas contains
 * colored GPU texels or certify that the pixels survive original optical
 * transparency or native camera occlusion. */
/** PlayCanvas 2.22.1 returns {data, scopeId} from Material.getParameter.
 * Never confuse the descriptor with its texture/uniform payload. */
export function b294ParameterData(param:unknown):unknown{
 if(!param||typeof param!=='object'||!('data' in param))return undefined;
 return (param as {data:unknown}).data;
}
export type B294SourceAtlasRow=Readonly<{
 surfaceId:string;existingSourceMesh:boolean;visible:boolean;
 atlasSameTexture:boolean;atlasRectMatches:boolean;
 teamAUniformMatches:boolean;teamBUniformMatches:boolean;
 neutralUniformMatches:boolean;
}>;
export function b294ClassifySourceAtlasBindings(
 rows:readonly B294SourceAtlasRow[],nativeSourceCount:number){
 if(nativeSourceCount!==17||rows.length!==17||
   new Set(rows.map(x=>x.surfaceId)).size!==17||
   rows.some(x=>!x.surfaceId))
  throw Error('B294_NOT_SEVENTEEN_ORIGINAL_SOURCE_SHADER_IDENTITIES');
 const missing=rows.filter(x=>!x.existingSourceMesh||!x.visible).map(x=>x.surfaceId);
 const tex=rows.filter(x=>!x.atlasSameTexture).map(x=>x.surfaceId);
 const rect=rows.filter(x=>!x.atlasRectMatches).map(x=>x.surfaceId);
 const colors=rows.filter(x=>!x.teamAUniformMatches||!x.teamBUniformMatches||
   !x.neutralUniformMatches).map(x=>x.surfaceId);
 return {schema:'B294_GENUINE_SOURCE_INK_MATERIAL_UNIFORM_BINDINGS' as const,
  source:'25/17/26/0' as const,registeredOriginalPaintMeshes:17 as const,
  atlasTextureIdentityMatched:17-tex.length,
  atlasUvRectsMatched:17-rect.length,
  teamAndNeutralColorUniformsMatched:17-colors.length,
  visibleSourcePaintMeshes:17-missing.length,
  missingOrHiddenMeshIds:missing,wrongAtlasIds:tex,wrongUvRectIds:rect,
  wrongColorUniformIds:colors,allBindingsConsistent:
   !missing.length&&!tex.length&&!rect.length&&!colors.length,
  actualGPUAtlasTexelReadbackDone:false as const,
  actualFramebufferInkVisibilityCertified:false as const,
  originalUvOverlayNecessaryForInk:false as const,
  originalGamePhysicsChanged:false as const,
  nativeSourcePaintOwnershipChanged:false as const,
  scoreablePromotions:0 as const,productionAuthorized:false as const,
  artAccepted:false as const};
}
