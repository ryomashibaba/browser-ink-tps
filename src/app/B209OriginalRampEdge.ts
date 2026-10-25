/**
 * B209: actual source triangle-quad ramp edge proximity, READ ONLY.
 * Not a navigation path, inferred floor, collision substitute or score.
 * Coordinates are the already-registered original FloorConcrete03 faces.
 */
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from '../stage/undertow/UndertowSpillwayRouteRampGeometry';
const ORIGINAL='25,17,26,0';
export type B209RampFrame={
 nativeTick:number;body:readonly [number,number,number];
 stage:readonly [number,number,number,number];
 nativeKccGrounded:boolean;actualOriginalFootSupportId:string|null;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';paused:boolean;stopReason:string|null;
};
/** Actual source projected XZ signed distance; XZ is not KCC safety proof. */
export function b209OriginalRampEdge(f:B209RampFrame){
 const off={state:'OFF' as const,side:null as string|null,
  signedOriginalRampEdgeMeters:null as number|null,
  nearExactSourceFootprint:false,actualSupportWitness:false,
  originalSourceOnly:true as const,certifiedFullRoute:false as const,
  scoreable:0 as const,officialWinner:'NONE' as const};
 if(f.stage.join(',')!==ORIGINAL||!Number.isSafeInteger(f.nativeTick)||
    f.nativeTick<0||f.matchState!=='PLAYING'||f.paused||f.stopReason||
    f.body.length!==3||!f.body.every(Number.isFinite)||
    f.body[1]<2.4||f.body[1]>6.4)return off;
 type RampReadout={
  state:'OFF'|'UNVERIFIED_FOOT_SUPPORT'|'ADJACENT_TO_ORIGINAL_RAMP'|
   'CRITICAL_SOURCE_EDGE'|'NEAR_SOURCE_EDGE';
  side:string|null;signedOriginalRampEdgeMeters:number|null;
  nearExactSourceFootprint:boolean;actualSupportWitness:boolean;
  originalSourceOnly:true;certifiedFullRoute:false;
  scoreable:0;officialWinner:'NONE';
 };
 let chosen:RampReadout|null=null;
 for(const ramp of UNDERTOW_RIGHT_LOW_ROUTE_RAMPS){
  const v=ramp.mesh.vertices;
  // Quad is p0 → p1 → p3 → p2. Use the authoritative source
  // triangles verbatim, never a generated collision approximation.
  const p=[v[0]!,v[1]!,v[3]!,v[2]!];
  let minDistance=Infinity,signs:number[]=[];
  for(let i=0;i<4;i++){
   const a=p[i]!,b=p[(i+1)%4]!,dx=b[0]-a[0],dz=b[2]-a[2];
   const u=Math.max(0,Math.min(1,
    ((f.body[0]-a[0])*dx+(f.body[2]-a[2])*dz)/(dx*dx+dz*dz)));
   const qx=a[0]+u*dx,qz=a[2]+u*dz;
   minDistance=Math.min(minDistance,Math.hypot(f.body[0]-qx,f.body[2]-qz));
   signs.push(dx*(f.body[2]-a[2])-dz*(f.body[0]-a[0]));
  }
  const inside=signs.every(s=>s<=1e-6)||signs.every(s=>s>=-1e-6);
  const signed=inside?minDistance:-minDistance;
  if(minDistance>1.4)continue;
  const trustedSupport=f.nativeKccGrounded===true&&
   f.actualOriginalFootSupportId!==null&&
   f.actualOriginalFootSupportId.startsWith('UndertowT21D:');
  const current={
   ...off,
   side:ramp.side,
   signedOriginalRampEdgeMeters:Number(signed.toFixed(4)),
   nearExactSourceFootprint:true,
   actualSupportWitness:trustedSupport,
   state:!trustedSupport?'UNVERIFIED_FOOT_SUPPORT' as const:
    !inside?'ADJACENT_TO_ORIGINAL_RAMP' as const:
    minDistance<=.20?'CRITICAL_SOURCE_EDGE' as const:
    minDistance<=.65?'NEAR_SOURCE_EDGE' as const:'OFF' as const
  };
  if(!chosen||Math.abs(signed)<Math.abs(chosen.signedOriginalRampEdgeMeters!))
   chosen=current;
 }
 return chosen??off;
}
export function createB209OriginalRampEdgeCoach(ui:HTMLElement){
 const root=document.createElement('aside');
 root.id='t21-f3-b209-original-ramp-edge';
 root.hidden=true;
 root.dataset.sourceScoreable='0';root.dataset.certifiedRoute='false';
 root.dataset.originalCollisionChanged='false';
 root.setAttribute('role','status');
 root.setAttribute('aria-live','off');
 root.style.cssText='position:fixed;top:246px;right:14px;z-index:45;'+
  'max-width:235px;box-sizing:border-box;border:1px solid #f6c68f;'+
  'background:rgba(46,29,18,.95);color:#ffe6cb;border-radius:10px;'+
  'padding:10px;pointer-events:none;font:800 11px/1.4 system-ui';
 ui.appendChild(root);
 const render=(v:ReturnType<typeof b209OriginalRampEdge>,enabled:boolean)=>{
  root.hidden=!enabled||v.state==='OFF';
  root.style.display=root.hidden?'none':'block';
  root.dataset.t21B209State=v.state;
  root.dataset.t21B209OriginalEdgeMeters=
   v.signedOriginalRampEdgeMeters===null?'UNAVAILABLE':
    String(v.signedOriginalRampEdgeMeters);
  root.dataset.t21B209ActualGrounded=String(v.actualSupportWitness);
  if(root.hidden)return;
  const meters=Math.abs(v.signedOriginalRampEdgeMeters!).toFixed(2);
  root.textContent=v.state==='CRITICAL_SOURCE_EDGE'?
   'RAMP EDGE VERY CLOSE · '+meters+'m to original boundary · DO NOT ASSUME NEXT STEP IS SUPPORTED':
   v.state==='NEAR_SOURCE_EDGE'?
   'ORIGINAL RAMP EDGE · '+meters+'m to boundary · WATCH FOOTING':
   v.state==='ADJACENT_TO_ORIGINAL_RAMP'?
   'ALONGSIDE REGISTERED RAMP · '+meters+'m outside its XZ footprint · VERIFY ACTUAL FLOOR':
   'RAMP AREA · ACTUAL FOOT SUPPORT NOT CONFIRMED · STOP ADVANCING';
 };
 return {root,render};
}
