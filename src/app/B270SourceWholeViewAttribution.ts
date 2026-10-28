/** B270: independent, genuine same-tick WebGL2 ROI audit of B268/B269.
 * Scope limitation matters: optical background and actual painted pixels are
 * NOT fixed by changing only an actor's render children.
 * Evidence derived from exact A/B/A original-frame SHA256 screenshots; no
 * inference that distinct-run B248 baselines are the same rendered frame.
 */
export const B270_SOURCE='25/17/26/0';
export const B270_VIEWPORT_PIXELS=1600*900;
export const B270_ACTOR_NEARFIELD_PIXELS=(1050-560)*(780-395);
export const B270_BACKGROUND_REGION_PIXELS=(1300-360)*(390-145);
type PixelRegion={pixels:number;atLeast8:number;atLeast24:number};
type ViewEvidence={metadata:{
 source:string;realInkOwnedCells:number;artAccepted:boolean;
 frameSize:number[];nativeAsha:string;nativeBsha:string
};roi:{entire_native_frame:PixelRegion;actor_nearfield:PixelRegion;
 upper_stage_without_hud:PixelRegion;reticle_and_ink:PixelRegion}};
export type B270InputEvidence={B268:ViewEvidence;B269:ViewEvidence;
 crossrunSameBaseline:boolean};
function check(ok:unknown,code:string){if(!ok)throw Error('B270_'+code);}
function int(x:number){return Number.isSafeInteger(x)&&x>=0;}
function roi(x:PixelRegion,size:number){
 check(x&&int(x.pixels)&&int(x.atLeast8)&&int(x.atLeast24)&&
  x.pixels<=size&&x.atLeast8<=x.pixels&&x.atLeast24<=x.atLeast8,
  'NATIVE_ROI_INVALID');
 return x;
}
export function b270ActorOnlyArtScopeAudit(data:B270InputEvidence){
 check(data&&data.B268&&data.B269&&
  data.crossrunSameBaseline===false,'DISTINCT_RUN_BASELINES_REQUIRED');
 const actors=[];
 for(const version of ['B268','B269']){
  const obj=data[version],m=obj.metadata,region=obj.roi;
  check(m&&m.source==='25/17/26/0'&&
   m.realInkOwnedCells===115&&m.artAccepted===false&&
   Array.isArray(m.frameSize)&&m.frameSize.join(',')==='1600,900'&&
   /^[a-f0-9]{64}$/.test(m.nativeAsha)&&
   /^[a-f0-9]{64}$/.test(m.nativeBsha)&&m.nativeAsha!==m.nativeBsha,
   'PINNED_GENUINE_SOURCE_PROVENANCE');
  const entire=roi(region.entire_native_frame,B270_VIEWPORT_PIXELS);
  const foreground=roi(region.actor_nearfield,B270_ACTOR_NEARFIELD_PIXELS);
  const background=roi(region.upper_stage_without_hud,B270_BACKGROUND_REGION_PIXELS);
  const reticle=roi(region.reticle_and_ink,(900-700)*(520-385));
  const outside=entire.pixels-foreground.pixels;
  check(outside>=0,'ACTOR_ROI_EXCEEDS_WHOLE_FRAME');
  // The measured actor-only region must explain >99.9% of the change.
  // If it does not, the whole-view hypothesis is invalid and this audit
  // MUST NOT emit the same narrow-scoped recommendation.
  check(foreground.pixels*1000>=entire.pixels*999,
   'ACTOR_ONLY_ATTRIBUTION_NOT_SUPPORTED');
  check(background.pixels<=5,'UPPER_STAGE_ALTERED');
  check(reticle.pixels<=entire.pixels,
   'CROSSHAIR_PIXEL_ACCOUNTING');
  actors.push({version,
   fullFrameChangedPixels:entire.pixels,
   nearfieldActorChangedPixels:foreground.pixels,
   outsideNearfieldChangedPixels:outside,
   nearfieldShareOfChange:foreground.pixels/entire.pixels,
   upperStageChangedPixels:background.pixels,
   reticleRegionChangedPixels:reticle.pixels,
   nativeActorDisplayOnly:true,
   sourcePaintCellsClaimedVisible:0,
   artAccepted:false
  });
 }
 check(data.B268.metadata.nativeAsha!==data.B269.metadata.nativeAsha,
  'ILLEGAL_CROSS_RUN_PIXEL_CAUSALITY');
 return {
  schema:'B270_INDEPENDENT_NATIVE_ACTOR_ONLY_ART_SCOPE',
  originalSource:B270_SOURCE,
  genuineFrameSize:[1600,900],
  humanAndCpuEntitiesUnchanged:8,
  originalSolids:25,paintSurfaces:17,navLinks:26,scoreable:0,
  exactly115OriginalOwnedCells:true,
  separateRealWebgl2Runs:true,
  crossRunPixelSuperiorityClaimForbidden:true,
  actors,
  opticalStageRemainsUnresolved:true,
  originalUvVsPaintableRegistrationStillUnverified:true,
  betterGameArtCertified:false,
  nextStage:'B271_READ_ONLY_SOURCE_OPTICAL_TO_PLAYABLE_REGISTRATION',
  artAccepted:false,unrestricted4v4Certified:false,
  productionAuthorized:false
 };
}
