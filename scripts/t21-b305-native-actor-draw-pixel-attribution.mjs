/** B305 decoded true-Chromium actor visibility contribution;
 * screenshot pixels do NOT in themselves certify team-color visibility. */
import {createHash} from 'node:crypto';
import {b303DecodeRgbPng} from './t21-b303-native-ink-pixel-attribution.mjs';
export function b305AuditRealActorDraw(original,hidden,restored,samples){
 const sha=b=>createHash('sha256').update(b).digest('hex');
 if(sha(original)!==sha(restored))
  throw Error('B305_ORIGINAL_NATIVE_SCREENSHOT_NOT_RESTORED');
 const [a,b,c]=[original,hidden,restored].map(b303DecodeRgbPng);
 if(a.width!==1600||a.height!==900||b.width!==a.width||
    b.height!==a.height||!a.rgb.equals(c.rgb))
  throw Error('B305_GENUINE_SOURCE_NATIVE_FRAME_MISMATCH');
 if(!Array.isArray(samples)||samples.length<1||
    samples.some(s=>!Array.isArray(s.screenPx)||
     !s.screenPx.slice(0,2).every(Number.isFinite)))
  throw Error('B305_MISSING_REAL_PROJECTED_INK_CELLS');
 const mask=new Uint8Array(a.width*a.height);let count=0;
 for(let i=0;i<mask.length;i++){
  const k=i*3;
  if(a.rgb[k]!==b.rgb[k]||a.rgb[k+1]!==b.rgb[k+1]||
     a.rgb[k+2]!==b.rgb[k+2]){mask[i]=1;count++;}
 }
 const near=rad=>samples.filter(s=>{
  const x=Math.round(s.screenPx[0]),y=Math.round(s.screenPx[1]);
  for(let yy=Math.max(0,y-rad);yy<=Math.min(a.height-1,y+rad);yy++)
   for(let xx=Math.max(0,x-rad);xx<=Math.min(a.width-1,x+rad);xx++)
    if(mask[yy*a.width+xx])return true;
  return false;
 }).length;
 return {schema:'B305_TRUE_NATIVE_EXISTING_ACTOR_DRAW_INK_PROJECTION_A_B_A',
  source:'25/17/26/0',actualProjectedOwnerSamples:samples.length,
  actorDrawChangedPixels:count,actorDrawChangedScreenPercent:100*count/mask.length,
  sourceOwnedCenterPixelsChangedWhenActorsHidden:near(0),
  sourceOwnedWithin5pxPixelsChangedWhenActorsHidden:near(5),
  originalSha256:sha(original),exactFramebufferRestored:true,
  actorPhysicalPosesChanged:false,inkOwnershipChanged:false,
  additionalSourceGeometry:false,certifiedVisibleTeamColor:false,
  artAccepted:false,full4v4Certified:false,productionAuthorized:false};
}
