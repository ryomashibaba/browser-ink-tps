/**
 * W10-B129: truthful player-facing proximity to an already registered
 * ORIGINAL raised source polygon. Live positional feedback only.
 * Never asserts a missing floor, a safe landing, a route or a Turf result.
 */
import type {B124RaisedSourceWitness}
 from './W10B124OriginalRaisedSourceBoundary';
import type {B130FlatWitness} from './W10B130OriginalFlatEdge';

const SOURCE='UndertowT21D:right-low-team-a';
export type F3RaisedEdgeInput={
 nativeTick:number;
 nativeKccGrounded:boolean;
 realOriginalFootSolidId:string|null;
 actualRaisedFootprint:B124RaisedSourceWitness|null;
 actualOriginalFlatFootprint?:B130FlatWitness|null;
 stageAuthority:readonly [number,number,number,number];
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;
 stopReason:string|null;
 activeHuman:boolean;
};
export function originalRaisedSourceEdgeStatus(input:F3RaisedEdgeInput){
 const w=input.actualRaisedFootprint;
 const authority=input.stageAuthority.join(',')==='25,17,26,0';
 const common=authority&&input.matchState==='PLAYING'&&!input.paused&&
  !input.stopReason&&input.activeHuman&&input.nativeKccGrounded===true&&
  Number.isSafeInteger(input.nativeTick)&&input.nativeTick>=0;
 const eligible=common&&input.realOriginalFootSolidId===SOURCE&&
  w?.nativeTick===input.nativeTick&&w.actualNamedOriginalSolidId===SOURCE&&
  w.realFootXZInsideOriginalSlab===true&&
  w.originalRaisedSourceVerticalBandWithin22cm===true&&
  Number.isFinite(w.distanceToOriginalSourcePolygonBoundaryMeters)&&
  w.distanceToOriginalSourcePolygonBoundaryMeters>=0&&
  w.originalAuthority.join(',')==='25,17,26,0'&&
  w.generatedSourceFloor===false&&w.sourceNavmeshModified===false;
 const flat=input.actualOriginalFlatFootprint;
 const verifiedFlat=common&&flat!==null&&flat!==undefined&&
  flat.nativeTick===input.nativeTick&&
  flat.actualNamedOriginalSolidId===input.realOriginalFootSolidId&&
  flat.insideRegisteredOriginalXZFootprint===true&&
  flat.originalFlatVerticalBandWithin22cm===true&&
  Number.isFinite(flat.distanceToOriginalPolygonBoundaryMeters)&&
  flat.distanceToOriginalPolygonBoundaryMeters>=0&&
  flat.originalAuthority.join(',')==='25,17,26,0'&&
  flat.polygonAloneDoesNotCertifyKcc===true&&
  flat.physicsModified===false&&flat.originalGeometryModified===false;
 const distance=verifiedFlat?flat.distanceToOriginalPolygonBoundaryMeters:
  eligible?w!.distanceToOriginalSourcePolygonBoundaryMeters:null;
 const namedSupport=verifiedFlat?flat.actualNamedOriginalSolidId:
  eligible?SOURCE:null;
 const severity=distance===null?'UNAVAILABLE' as const:
  distance<.65?'EDGE_RISK' as const:
  distance<1.20?'NEAR_EDGE' as const:'CLEAR' as const;
 return {
  schema:'W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1' as const,
  severity,
  showCaution:severity==='EDGE_RISK'||severity==='NEAR_EDGE',
  originalRaisedFloorEdgeMeters:distance,
  // Only the currently KCC-grounded real registered flat floor can
  // anchor a screen marker. Neither optical source nor old QA can.
  nearestRegisteredOriginalEdgeWorld:verifiedFlat&&
   (severity==='EDGE_RISK'||severity==='NEAR_EDGE')?
    flat.nearestRegisteredOriginalEdgeWorld:null,
  nativeTick:input.nativeTick,
  authenticNamedOriginalSupport:namedSupport,
  headline:severity==='EDGE_RISK'?'ORIGINAL FLOOR EDGE · CLOSE':
   severity==='NEAR_EDGE'?'ORIGINAL FLOOR EDGE · NEAR':
   'NO EDGE CAUTION',
  originalSourceOnly:authority,
  kccGroundedObserved:input.nativeKccGrounded,
  graphicalFootprintIsNotAnActualKccProof:true as const,
  sourceFloorHoleCertified:false as const,
  nextOriginalFloorReachableCertified:false as const,
  original4v4Certified:false as const,
  officialTurfResult:false as const,
  playerPhysicsModified:false as const,
  originalGeometryModified:false as const
 };
}
/** PlayCanvas 2.22.1 worldToScreen() reports CANVAS CSS pixels even
 * when maxPixelRatio / drawing-buffer resolution differs. These may only
 * be translated by the canvas's viewport origin, never re-scaled by
 * GraphicsDevice.width/height. WorldToScreen.z is clip depth and cannot
 * decide whether the original edge is in front of the actual camera.
 * The signed view-space Z is authoritative for that VISUAL gate only.
 */
export function b130EdgeCanvasToViewport(
 canvas:Readonly<{left:number;top:number}>,
 projectedCss:Readonly<{x:number;y:number}>,
 cameraViewSpaceZ:number,
 viewport:Readonly<{width:number;height:number}>
){
 return {
  x:canvas.left+projectedCss.x,y:canvas.top+projectedCss.y,
  depth:-cameraViewSpaceZ,
  viewportWidth:viewport.width,viewportHeight:viewport.height
 };
}
/** Screen-space view gate; never grants a traversable floor or KCC step. */
export function b130SourceEdgePin(
 edge:ReturnType<typeof originalRaisedSourceEdgeStatus>,
 screen:Readonly<{x:number;y:number;depth:number;
  viewportWidth:number;viewportHeight:number}>|null,
 suppressed:boolean
){
 if(suppressed||!edge.showCaution||
    edge.nearestRegisteredOriginalEdgeWorld===null||!screen||
    ![screen.x,screen.y,screen.depth,screen.viewportWidth,
      screen.viewportHeight].every(Number.isFinite)||
    screen.depth<=0||screen.viewportWidth<320||screen.viewportHeight<240||
    screen.x<24||screen.x>screen.viewportWidth-24||
    screen.y<24||screen.y>screen.viewportHeight-24||
    Math.hypot(screen.x-screen.viewportWidth*.5,
     screen.y-screen.viewportHeight*.5)<65)return null;
 return {x:screen.x,y:screen.y,severity:edge.severity,
  world:edge.nearestRegisteredOriginalEdgeWorld};
}
export function createF3OriginalRaisedEdgeCoach(
 ui:HTMLElement,
 project?:(world:readonly [number,number,number])=>
  {x:number;y:number;depth:number;
   viewportWidth:number;viewportHeight:number}|null
){
 const root=document.createElement('aside');
 root.id='t21-f3-b129-original-edge-coach';
 root.hidden=true;
 root.dataset.originalScoreable='0';
 root.dataset.original4v4Certified='false';
 root.dataset.originalFloorHoleCertified='false';
 root.setAttribute('role','status');
 root.setAttribute('aria-live','off');
 root.style.cssText='position:fixed;right:16px;top:152px;'+
  'z-index:39;pointer-events:none;'+
  'box-sizing:border-box;width:min(248px,calc(100vw - 32px));'+
  'padding:9px 12px;border:1px solid #efb67f;border-radius:10px;'+
  'background:rgba(47,30,18,.94);color:#fff1d8;'+
  'font:800 11px/1.4 system-ui;box-shadow:0 8px 24px #0009';
 ui.appendChild(root);
 const pin=document.createElement('div');
 pin.id='t21-f3-b130-registered-edge-pin';
 pin.hidden=true;
 pin.dataset.sourceOnly='true';
 pin.dataset.originalCollisionChanged='false';
 pin.dataset.nextStepKccCertified='false';
 pin.setAttribute('aria-label','Actual registered original floor polygon boundary; next step not certified');
 pin.style.cssText='position:fixed;z-index:19;pointer-events:none;display:none;'+
  'width:22px;height:22px;box-sizing:border-box;'+
  'border:2px solid #ffb974;border-radius:50%;'+
  'background:rgba(35,19,12,.24);'+
  'box-shadow:0 0 0 3px #0a1829a0,0 0 12px #ffa8689a;'+
  'transform:translate(-50%,-50%)';
 const caption=document.createElement('span');
 caption.textContent='FLOOR EDGE';
 caption.style.cssText='position:absolute;left:50%;top:22px;'+
  'transform:translateX(-50%);white-space:nowrap;'+
  'color:#fff4dc;font:800 9px/1.3 system-ui;'+
  'text-shadow:0 1px 4px #000,0 0 4px #000';
 pin.append(caption);ui.appendChild(pin);
 function render(value:ReturnType<typeof originalRaisedSourceEdgeStatus>,
  overlaySuppressed:boolean){
  root.hidden=!value.showCaution||overlaySuppressed;
  root.style.display=root.hidden?'none':'block';
  root.dataset.state=value.severity;
  root.dataset.nativeTick=String(value.nativeTick);
  root.dataset.sourceEdgeMeters=value.originalRaisedFloorEdgeMeters===null?
   'UNVERIFIED':value.originalRaisedFloorEdgeMeters.toFixed(3);
  const target=value.nearestRegisteredOriginalEdgeWorld;
  const projected=target&&project&&!root.hidden?project(target):null;
  const view=b130SourceEdgePin(value,projected,root.hidden);
  pin.hidden=view===null;pin.style.display=pin.hidden?'none':'block';
  pin.dataset.nativeTick=String(value.nativeTick);
  if(view){
   pin.style.left=view.x.toFixed(1)+'px';
   pin.style.top=view.y.toFixed(1)+'px';
   pin.style.borderColor=view.severity==='EDGE_RISK'?'#ff8174':'#ffbf78';
  }
  if(!root.hidden){
   root.style.borderColor=value.severity==='EDGE_RISK'?'#ff8679':'#efb67f';
   root.textContent=value.headline+' · '+
    value.originalRaisedFloorEdgeMeters!.toFixed(2)+
    'm from foot center to source boundary · WATCH YOUR STEP';
  }
 }
 return {root,pin,render};
}
