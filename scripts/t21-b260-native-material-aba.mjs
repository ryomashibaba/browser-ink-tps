/** B260 real Chromium WebGL2 per-original-material framebuffer A/B/A.
 * Invisible render mesh does not imply missing physical collision or ink. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

export async function captureB260OriginalMaterials(label,
 {evaluate,screenshot,inspect,output}){
 const fail=(tag,detail='')=>{throw Error('T21_F3_BROWSER_'+tag+detail);};
 const before=await evaluate('window.__t21F3.snapshot()');
 if(!before.paused||before.matchState!=='STAGING'||
    before.b259RasterLayerAudit.mask!=='BASELINE'||
    !before.b260OriginalSourceMaterialAudit.requested||
    before.b260OriginalSourceMaterialAudit.hiddenMaterial!==null||
    !before.texturedSourceF3l.enabled||
    before.originalSourceSolids!==25||before.originalPaintSurfaces!==17||
    before.originalSourceNavigationLinks!==26||
    before.sourceScoreablePromotions!==0)
  fail('B260_NATIVE_MATERIAL_SOURCE_BASELINE_INVALID_'+label);
 const baselineFrame=await screenshot('B260_'+label+'_A_NATIVE');
 const baseline=readFileSync(resolve(output,baselineFrame.name+'.png'));
 const targets=[
  {name:'Fld_Temple01_FloorLine02',kind:'DETAIL',label:'FLOORLINE'},
  {name:'Fld_Temple01_Glass01',kind:'GLASS',label:'GLASS'}
 ];
 const results=[];
 for(const target of targets){
  const material=await evaluate('window.__t21F3.setB260SourceMaterialHidden('+
   JSON.stringify(target.name)+')');
  if(material.hiddenMaterial!==target.name||
     material.materialKind!==target.kind||
     material.hiddenTriangles<1||
     !material.exactSourceMaterialIdentityVerified||
     material.source!=='25/17/26/0'||material.originalUvTriangles!==57578||
     material.actualPaintDisplayGroups!==17||
     material.materialBytesChanged!==0||
     material.stageSolidsModified!==0||
     material.paintableSurfacesModified!==0||
     material.navLinksModified!==0||material.scoreableSurfacesModified!==0||
     material.actorTransformsModified!==0||
     material.artAccepted!==false||material.productionAuthorized!==false)
   fail('B260_ORIGINAL_MATERIAL_PROVENANCE_DRIFT_'+target.label);
  await sleep(230);
  const changed=await screenshot('B260_'+label+'_B_'+target.label);
  const restored=await evaluate('window.__t21F3.setB260SourceMaterialHidden(null)');
  if(restored.hiddenMaterial!==null||
     restored.originalVisibleGroups!==restored.sourceMaterialGroups||
     !restored.exactSourceMaterialIdentityVerified)
   fail('B260_MATERIAL_RESTORE_API_FAILED_'+target.label);
  await sleep(230);
  const restorationFrame=await screenshot('B260_'+label+'_A2_'+target.label);
  const pixels=inspect(baseline,
   readFileSync(resolve(output,changed.name+'.png')),
   readFileSync(resolve(output,restorationFrame.name+'.png')));
  const after=await evaluate('window.__t21F3.snapshot()');
  if(!pixels.appearanceRestored||
     after.tick!==before.tick||
     JSON.stringify(after.player.position)!==
      JSON.stringify(before.player.position)||
     after.sourceScoreablePromotions!==0||
     after.originalSourceSolids!==25||
     after.originalPaintSurfaces!==17||
     after.originalSourceNavigationLinks!==26||
     after.b260OriginalSourceMaterialAudit.hiddenMaterial!==null||
     after.b259RasterLayerAudit.mask!=='BASELINE')
   fail('B260_ORIGINAL_MATERIAL_FRAME_NOT_RESTORED_'+target.label+
    JSON.stringify(pixels.originalUvRestoration));
  results.push({target,material,frame:changed,restored:restorationFrame,pixels});
 }
 const proof={schema:'B260_NATIVE_SOURCE_MATERIAL_ABA',
  context:label,baseline:baselineFrame,results,unchangedTick:before.tick,
  originalUvTriangles:57578,certifiedSolids:25,realPaintSurfaces:17,
  sourceNavigationLinks:26,sourceScoreablePromotions:0,
  diagnosticVisibilityOnly:true,source:'25/17/26/0',
  artAccepted:false,productionAuthorized:false};
 writeFileSync(resolve(output,'b260-'+label.toLowerCase()+
  '-original-source-material-aba.json'),JSON.stringify(proof,null,2));
 console.log('B260_REAL_WEBGL2_ORIGINAL_MATERIAL_ABA_PASS',JSON.stringify({
  context:label,targets:results.map(x=>({material:x.target.name,
   pixelChange:x.pixels.uvVsFlat.changedPixels,
   ratio:x.pixels.uvVsFlat.ratio,
   restore:x.pixels.appearanceRestored})),
  artAccepted:false,productionAuthorized:false
 }));
 return proof;
}
