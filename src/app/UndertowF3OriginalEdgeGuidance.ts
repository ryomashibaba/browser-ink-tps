/**
 * W10-B129: truthful player-facing proximity to an already registered
 * ORIGINAL raised source polygon. Live positional feedback only.
 * Never asserts a missing floor, a safe landing, a route or a Turf result.
 */
import type {B124RaisedSourceWitness}
 from './W10B124OriginalRaisedSourceBoundary';

const SOURCE='UndertowT21D:right-low-team-a';
export type F3RaisedEdgeInput={
 nativeTick:number;
 nativeKccGrounded:boolean;
 realOriginalFootSolidId:string|null;
 actualRaisedFootprint:B124RaisedSourceWitness|null;
 stageAuthority:readonly [number,number,number,number];
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;
 stopReason:string|null;
 activeHuman:boolean;
};
export function originalRaisedSourceEdgeStatus(input:F3RaisedEdgeInput){
 const w=input.actualRaisedFootprint;
 const authority=input.stageAuthority.join(',')==='25,17,26,0';
 const eligible=authority&&input.matchState==='PLAYING'&&!input.paused&&
  !input.stopReason&&input.activeHuman&&
  input.nativeKccGrounded===true&&
  input.realOriginalFootSolidId===SOURCE&&
  Number.isSafeInteger(input.nativeTick)&&input.nativeTick>=0&&
  w?.nativeTick===input.nativeTick&&
  w.actualNamedOriginalSolidId===SOURCE&&
  w.realFootXZInsideOriginalSlab===true&&
  w.originalRaisedSourceVerticalBandWithin22cm===true&&
  Number.isFinite(w.distanceToOriginalSourcePolygonBoundaryMeters)&&
  w.distanceToOriginalSourcePolygonBoundaryMeters>=0&&
  w.originalAuthority.join(',')==='25,17,26,0'&&
  w.generatedSourceFloor===false&&w.sourceNavmeshModified===false;
 const distance=eligible?w!.distanceToOriginalSourcePolygonBoundaryMeters:null;
 const severity=distance===null?'UNAVAILABLE' as const:
  distance<.65?'EDGE_RISK' as const:
  distance<1.20?'NEAR_EDGE' as const:'CLEAR' as const;
 return {
  schema:'W10_B129_NATIVE_ORIGINAL_RAISED_EDGE_HUD_V1' as const,
  severity,
  showCaution:severity==='EDGE_RISK'||severity==='NEAR_EDGE',
  originalRaisedFloorEdgeMeters:distance,
  nativeTick:input.nativeTick,
  authenticNamedOriginalSupport:eligible?SOURCE:null,
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
export function createF3OriginalRaisedEdgeCoach(ui:HTMLElement){
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
 function render(value:ReturnType<typeof originalRaisedSourceEdgeStatus>,
  overlaySuppressed:boolean){
  root.hidden=!value.showCaution||overlaySuppressed;
  root.style.display=root.hidden?'none':'block';
  root.dataset.state=value.severity;
  root.dataset.nativeTick=String(value.nativeTick);
  root.dataset.sourceEdgeMeters=value.originalRaisedFloorEdgeMeters===null?
   'UNVERIFIED':value.originalRaisedFloorEdgeMeters.toFixed(3);
  if(!root.hidden){
   root.style.borderColor=value.severity==='EDGE_RISK'?'#ff8679':'#efb67f';
   root.textContent=value.headline+' · '+
    value.originalRaisedFloorEdgeMeters!.toFixed(2)+
    'm to source boundary · WATCH YOUR STEP';
  }
 }
 return {root,render};
}
