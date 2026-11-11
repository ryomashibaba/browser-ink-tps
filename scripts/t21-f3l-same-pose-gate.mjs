/**
 * B490 local-only SOURCE F3L/registered-ground picture pair.
 * Confirms frame consistency, NOT optical alignment or production.
 */
export const B490_CAPTURE_AUTHORITY=Object.freeze({
 originalStage:'25/17/26/0',sourceOnly:true,localOnly:true,
 geometryWrites:0,actorWrites:0,scoreWrites:0,
 visualAlignmentCertified:false,official4v4Certified:false
});
const HOLD=reason=>Object.freeze({status:'HOLD',reason,visualAlignmentCertified:false});
function near(a,b,tolerance){
 return Array.isArray(a)&&Array.isArray(b)&&a.length===3&&b.length===3&&
  a.every((v,i)=>Number.isFinite(v)&&Number.isFinite(b[i])&&
   Math.abs(v-b[i])<=tolerance);
}
const camera=n=>n?.b399NativeCameraClearance?.cameraOpticalWitness;
export function b490ValidateSamePoseFrames(on,off){
 if(!on||!off)return HOLD('MISSING_REAL_SOURCE_SNAPSHOT');
 for(const frame of [on,off]){
  if(frame.originalSourceSolids!==25||frame.originalPaintSurfaces!==17||
     frame.originalSourceNavigationLinks!==26||
     frame.sourceScoreablePromotions!==0||
     frame.productionAuthorized!==false||
     frame.unrestricted4v4Certified!==false)
   return HOLD('ORIGINAL_STAGE_AUTHORITY_DRIFT');
  if(frame.paused!==true||frame.stopReason!==null||
     frame.matchState!=='PLAYING'||frame.player?.mode!=='HUMAN'||
     frame.cpu?.physicalRejoins?.length!==7||
     frame.nativeKccGrounded!==true)
   return HOLD('NOT_FROZEN_LIVE_SEVEN_CPU_WORLD');
  // Read-only foot ledger must correspond to this actual native physics
  // frame, not an earlier successful ground sample in the same session.
  const sampleTick=frame.b112OriginalHumanGround?.lastNativeTick;
  if(!Number.isSafeInteger(sampleTick)||
     sampleTick<frame.tick-1||sampleTick>frame.tick)
   return HOLD('STALE_NATIVE_GROUNDED_FOOT_WITNESS');
  // Use true native KCC foot, not the prior milestone or F3L optical face.
  const foot=frame.b112OriginalHumanGround;
  if(foot?.genuineKccGrounded!==true||
     foot.lastOriginalSourceHitId!==
      'UndertowT21D:right-low-route-ramp-positive-z'||
     !Number.isFinite(foot.lastOriginalSourceGapMeters)||
     Math.abs(foot.lastOriginalSourceGapMeters)>.10)
   return HOLD('REAL_REGISTERED_RAMP_FOOT_NOT_PRESENT');
  if(frame.originalSourceStudyVisible!==false||
     frame.sourceOpticalStructuresVisible!==false||
     frame.fullSource?.enabled!==false||
     frame.environmentF3i?.visible!==false)
   return HOLD('UNREGISTERED_REFERENCE_OVERLAY_VISIBLE');
 }
 if(on.texturedSourceF3l?.status!=='READY'||
    on.texturedSourceF3l?.enabled!==true||
    on.texturedSourceF3l.totalOriginalTriangles!==57578||
    !Number.isSafeInteger(on.texturedSourceF3l.verifiedTextures)||
    on.texturedSourceF3l.verifiedTextures<8||
    on.b29VerifiedSourcePresentation?.selected!=='F3L_ORIGINAL_UV')
  return HOLD('REAL_ORIGINAL_UV_PACK_NOT_VERIFIED_OR_VISIBLE');
 if(off.texturedSourceF3l?.enabled!==false||
    off.b29VerifiedSourcePresentation?.selected!=='F3E_REFERENCE')
  return HOLD('REGISTERED_ONLY_VIEW_NOT_SELECTED');
 if(!Number.isSafeInteger(on.tick)||on.tick<1||on.tick!==off.tick||
    !near(on.player.position,off.player.position,.0001))
  return HOLD('REAL_PLAYER_OR_CLOCK_MOVED');
 // The previous B490 gate checked just 7/7 CPU presence. The same
 // frozen scene requires seven real actor feet at unchanged coordinates.
 const cpuOn=on.cpu?.cpu,cpuOff=off.cpu?.cpu;
 if(!Array.isArray(cpuOn)||!Array.isArray(cpuOff)||
    cpuOn.length!==7||cpuOff.length!==7||
    cpuOn.some((a,i)=>typeof a?.id!=='string'||!a.id||
     a.id!==cpuOff[i]?.id||
     !near(a.physicalFoot,cpuOff[i]?.physicalFoot,.0001)))
  return HOLD('REAL_SEVEN_CPU_PHYSICAL_POSE_CHANGED');
 if(!near(camera(on)?.realCameraEye,camera(off)?.realCameraEye,.001)||
    !near(camera(on)?.realCameraForward,camera(off)?.realCameraForward,.0001))
  return HOLD('ACTUAL_CAMERA_MOVED');
 return Object.freeze({
  status:'PASS_SAME_POSE_CAPTURE_READY',reason:null,
  nativeTick:on.tick,realPlayerBody:[...on.player.position],
  realCameraEye:[...camera(on).realCameraEye],
  realCameraForward:[...camera(on).realCameraForward],
  genuineCpuCount:7,source:'25/17/26/0',
  unchangedNativeWorld:true,verifiedF3lTriangles:57578,
  visualAlignmentCertified:false,normalWindowsRenderingCertified:false,
  physicalFullRouteCertified:false,officialWinner:'NONE',
  screenshotPairRequiresIndependentVisualReview:true
 });
}

/** Fully local interactive comparison of the two already-written PNGs.
 * No network calls, image embedding, source asset copying or game writes.
 * The slider is a human visual aid, never an automatic ART certification. */
export function b490LocalComparisonHtml(witness){
 if(witness?.status!=='PASS_SAME_POSE_CAPTURE_READY'||
    !Number.isSafeInteger(witness.nativeTick)||witness.nativeTick<1||
    !near(witness.realPlayerBody,witness.realPlayerBody,0))
  throw Error('B490_NO_PROVEN_LOCAL_COMPARISON_PAIR');
 const tick=witness.nativeTick;
 const position=witness.realPlayerBody.map(x=>x.toFixed(4)).join(', ');
 return String.raw\`<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src file:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; object-src 'none'; form-action 'none'">
<title>Browser Ink TPS | F3L 対 実物理床</title>
<style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#101721;color:#f1f5fb}
*{box-sizing:border-box}body{margin:0;padding:20px;max-width:1600px;margin-inline:auto}
h1{font-size:1.35rem;margin:0 0 10px}.meta{color:#b6c7dc;line-height:1.6;margin:0 0 15px}
.viewer{position:relative;max-width:1200px;aspect-ratio:16/9;background:#283442;overflow:hidden;border-radius:9px}
.viewer img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
#uv{opacity:.5}.controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:15px 0 20px}
input{width:min(75vw,500px)}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.pair img{width:100%;height:auto;display:block;background:#253446}
figure{margin:0}figcaption{padding:8px 0;color:#b6c7dc}
small{color:#d2dfec;display:block;margin:14px 0;line-height:1.7}
@media(max-width:760px){.pair{grid-template-columns:1fr}}
</style></head>
<body><h1>F3L原作表示 / 登録済み物理床　同一視点比較</h1>
<p class="meta">真正SOURCE native tick: \${tick} / 実プレイヤー中心: \${position}<br>
原作地形: 25 / 17 / 26 / 0。CPU 7体の物理位置とカメラを固定して撮影。</p>
<div class="viewer">
<img src="b490-registered-floor-same-pose.png" alt="登録済み物理床のみ">
<img id="uv" src="b490-original-uv-same-pose.png" alt="F3L原作UV表示">
</div>
<label class="controls">F3Lの重ね具合
<input id="mix" aria-label="F3L opacity" type="range" min="0" max="100" value="50">
<output id="amount">50%</output></label>
<div class="pair">
<figure><img src="b490-original-uv-same-pose.png" alt="F3L ON"><figcaption>F3L 原作テクスチャ（ON）</figcaption></figure>
<figure><img src="b490-registered-floor-same-pose.png" alt="登録済み物理床のみ（OFF）"><figcaption>登録済み物理床（F3L OFF）</figcaption></figure>
</div>
<small>局所KCC実接地・同一native tickの記録のみ確認済み。色や外観の不一致はこの画像を実際に比較して判断してください。
この比較ページは外部接続・アップロードを行いません。画像が2枚撮れただけでは床全域の一致、本人Windowsの床抜け解消、正式4v4やARTの承認を意味しません。</small>
<script>
const slider=document.querySelector('#mix'),topImage=document.querySelector('#uv');
const output=document.querySelector('#amount');
slider.addEventListener('input',()=>{const value=Number(slider.value);topImage.style.opacity=String(value/100);output.textContent=value+'%';});
</script></body></html>\`;
}
