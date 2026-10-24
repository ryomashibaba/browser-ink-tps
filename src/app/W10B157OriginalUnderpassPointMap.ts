/** W10-B157 original source F4 map markers, view-only.
 * Deliberately draws POINTS, never a speculative road/polyline between
 * independent native Recast path terminals and original stage endpoints.
 * All numeric coordinates are from read-only stage/Recast witnesses.
 */
import type {B155SourceConnectivityReview}
 from './W10B155OriginalSourceConnectivityReview';
import type {B157OriginalBidirectionalSourceAudit}
 from './W10B157OriginalBidirectionalSourceAudit';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';

export function renderB157OriginalUnderpassPointMap(
 b155:B155SourceConnectivityReview,
 b157:B157OriginalBidirectionalSourceAudit
):string{
 if(b155.stage!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    b157.originalAuthority!==b155.stage||
    b157.originalFull4v4Certified!==false||
    b157.productionAuthorized!==false||
    b157.addedStageSolids!==0||b157.addedNavigationLinks!==0)
  throw Error('B157_UNAUTHORIZED_SOURCE_MAP');
 const headings=['POSITIVE_Z','NEGATIVE_Z'] as const;
 const panels=headings.map(side=>{
  const id='right-low-to-underpass-'+(side==='POSITIVE_Z'?'positive-z':'negative-z');
  const route=b155.routes.find(q=>q.id===id);
  const outcome=b157.sides.find(q=>q.side===side);
  if(!route||!outcome||route.type!=='DIAGNOSTIC_GAP')
   throw Error('B157_ORIGINAL_ROUTE_MARKER_MISSING');
  const candidates=[
   ['S',route.start,'#77cff2'],
   ['F',outcome.forwardNativeTerminal,'#f8b858'],
   ['E',route.end,'#ef87ba'],
   ['R',outcome.reverseNativeTerminal,'#b4e38e']
  ] as const;
  const good=candidates.flatMap(([tag,p,color])=>
   p!==null&&p.every(Number.isFinite)?[{tag,p,color}]:[]);
  if(good.length<2)throw Error('B157_NO_REGISTERED_ORIGINAL_MAP_POINTS');
  // B158: show only ALREADY documented CI #688 exact source faces,
  // which CI #691 found insufficient to connect Recast. Visuals ONLY;
  // these triangle polygons never enter runtime collision/navigation.
  const originalFaces=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.filter(
   f=>f.side===side);
  if(originalFaces.length!==5||
   UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.runtimePromotionAuthorized!==false||
   UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeInclusionReachedTarget!==false)
   throw Error('B158_EXACT_SOURCE_FACE_VISUAL_AUTHORITY_REQUIRED');
  const originalVertices=originalFaces.flatMap(f=>f.mesh.vertices);
  const xs=[...good.map(v=>v.p[0]),...originalVertices.map(p=>p[0])],
   zs=[...good.map(v=>v.p[2]),...originalVertices.map(p=>p[2])];
  const minX=Math.min(...xs),maxX=Math.max(...xs),
   minZ=Math.min(...zs),maxZ=Math.max(...zs);
  const scale=Math.max(5,maxX-minX,maxZ-minZ);
  const x=(v:number)=> (24+(v-minX)/scale*295).toFixed(1);
  const y=(v:number)=> (152-(v-minZ)/scale*120).toFixed(1);
  const exactSourceFaces=originalFaces.flatMap(f=>{
   const out:string[]=[];
   for(let i=0;i<f.mesh.indices.length;i+=3){
    const vertices=[0,1,2].map(j=>
     f.mesh.vertices[f.mesh.indices[i+j]!]!);
    if(vertices.some(p=>!p))throw Error('B158_BAD_ORIGINAL_FACE_VISUAL');
    out.push('<polygon data-source="CI688_EXACT_FACE_NOT_RUNTIME" points="'+
     vertices.map(p=>x(p[0])+','+y(p[2])).join(' ')+
     '" fill="#4bbdb0" fill-opacity=".24" stroke="#59ab99" '+
     'stroke-width=".65"/>');
   }
   return out;
  }).join('');
  const marker=good.map(({tag,p,color})=>
   '<circle cx="'+x(p[0])+'" cy="'+y(p[2])+'" r="5" fill="'+color+'"/>'+
   '<text x="'+x(p[0]+.9)+'" y="'+y(p[2])+
    '" fill="#e9edf4" font-size="11">'+tag+'</text>'
  ).join('');
  const label=side==='POSITIVE_Z'?'Team A / +Z':'Team B / -Z';
  return '<div style="flex:1 1 270px;min-width:0">'+
   '<div style="font:700 11px system-ui;margin:2px 0">'+label+
   ' · original source only</div>'+
   '<svg role="img" aria-label="'+label+
   ' original endpoints and native Recast terminals, no joined path" '+
   'viewBox="0 0 350 180" style="width:100%;max-height:190px;'+
   'background:#0f1e2b;border:1px solid #526475;border-radius:5px">'+
   '<rect x="7" y="7" width="336" height="166" rx="6" '+
   'fill="none" stroke="#365269" stroke-dasharray="3 4"/>'+
   exactSourceFaces+marker+'</svg></div>';
 });
 return '<div style="font:11px/1.4 system-ui;color:#d7e7f1">'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px">'+panels.join('')+'</div>'+
  '<div>S = original right-low start · F = native Recast forward terminal '+
  '· E = original underpass destination · R = reverse Recast terminal</div>'+
  '<div style="color:#fbd097;font-weight:700">'+
  'OBSERVED POINTS + 42 existing exact CI #688 source triangles only. '+
  'CI #691 inclusion still failed Recast. Teal triangles are NOT runtime floors. '+
  'No invented bridge, player KCC route or Turf score authorized.</div>'+
  '</div>';
}
