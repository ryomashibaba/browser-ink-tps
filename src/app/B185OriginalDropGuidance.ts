/** B185 — truthful original-source first-drop HUD geometry guidance.
 * Draws ONLY observations from B120 original lower registered polygon and
 * B130 actual original-supported upper flat footprint, no proposed route.
 */
import type {B183DescentState} from './B183OriginalHumanDescent';
import type {B120OriginalBoundaryWitness}
 from './W10B120OriginalSourceBoundary';
import type {B130FlatWitness} from './W10B130OriginalFlatEdge';
type Lower=Pick<B120OriginalBoundaryWitness,
 'nativeTick'|'originalFootInsideXZ'|'originalSourceSolidId'|
 'actualHorizontalDistanceToOriginalPolygonEdgeMeters'>;
type Upper=Pick<B130FlatWitness,
 'nativeTick'|'insideRegisteredOriginalXZFootprint'|
 'originalFlatVerticalBandWithin22cm'|
 'distanceToOriginalPolygonBoundaryMeters'>;
export function b185OriginalDropGuidance(
 state:B183DescentState,tick:number,lower:Lower|null,
 upper:Upper|null
){
 const lowerValid=lower!==null&&lower.nativeTick===tick&&
   /^UndertowT21D:first-drop-landing-(positive|negative)-z$/
    .test(lower.originalSourceSolidId)&&
   Number.isFinite(lower.actualHorizontalDistanceToOriginalPolygonEdgeMeters)&&
   lower.actualHorizontalDistanceToOriginalPolygonEdgeMeters>=0;
 const upperValid=upper!==null&&upper.nativeTick===tick&&
   upper.insideRegisteredOriginalXZFootprint&&
   upper.originalFlatVerticalBandWithin22cm&&
   Number.isFinite(upper.distanceToOriginalPolygonBoundaryMeters)&&
   upper.distanceToOriginalPolygonBoundaryMeters>=0;
 const xz=lowerValid?(lower.originalFootInsideXZ?'INSIDE':'OUTSIDE'):'UNKNOWN';
 const edge=upperValid?upper.distanceToOriginalPolygonBoundaryMeters:null;
 const confidence='XZ FOOTPRINT ONLY, NOT A VERIFIED SAFE ROUTE';
 const line=state==='SOURCE_LOWER_LANDED'?
  'REAL REGISTERED LOWER FLOOR LANDING · local practice clear only':
  state==='DESCENDING'?
  ('FALLING ON REAL KCC · lower landing XZ '+xz+
   ' · steer with your camera, real lower-floor collision still required'):
  state==='UPPER_READY'?
  ('REAL UPPER SOURCE FOOT · edge '+(edge===null?'unknown':edge.toFixed(2)+'m')+
   ' · lower landing XZ '+xz+' · position before leaving the edge'):
  state==='WITNESS_INVALID'?
  'HOLD · invalid native source descent; restart manually':
  'REACH REAL SOURCE UPPER SPAWN FLOOR · lower landing XZ '+xz;
 return {
  nativeTick:tick,
  lowerRegisteredFootprintXZ:xz,
  upperOriginalEdgeDistanceMeters:edge,
  label:line+' · '+confidence,
  stageRouteCertification:false as const,
  lowerXZAloneProvesLanding:false as const,
  sourceScoreablePromotions:0 as const,
  fullOriginal4v4Certified:false as const
 };
}
