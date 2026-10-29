/** B310: genuine 3 original active footprint probes per native paint surface.
 * Recast path & original human-filtered Rapier foot rays cannot certify KCC. */
export type B310Probe={
 grid:readonly [number,number];world:readonly [number,number,number];
 owner:number;navCandidate:boolean;startSnap:number|null;endSnap:number|null;
 pathPointCount:number;endError:number|null;
 footSolidId:string|null;footGapMeters:number|null;footObserved:boolean;
};
export type B310Row={surfaceId:string;owned:number;active:number;probes:readonly B310Probe[]};
export function b310CheckOriginalTripleRoutes(rows:readonly B310Row[],ownedTotal:number){
 if(rows.length!==17||new Set(rows.map(r=>r.surfaceId)).size!==17||
  rows.reduce((a,r)=>a+r.owned,0)!==ownedTotal||ownedTotal<1)
  throw Error('B310_ORIGINAL_17_SURFACE_OWNER_GRID_INVALID');
 let checked=0;
 for(const r of rows){
  if(!r.surfaceId||r.owned<0||r.owned>r.active||
   !Number.isSafeInteger(r.active)||r.active<1||
   r.probes.length<1||r.probes.length>3||
   new Set(r.probes.map(p=>p.grid.join('/'))).size!==r.probes.length)
   throw Error('B310_NATIVE_ACTIVE_FOOTPRINT_PROBES_INVALID');
  for(const p of r.probes){
   if(p.grid.length!==2||!p.grid.every(Number.isSafeInteger)||
    p.world.length!==3||!p.world.every(Number.isFinite)||
    ![0,1,-1].includes(p.owner)||p.pathPointCount<0||
    (p.footSolidId===null)!==(p.footGapMeters===null)||
    (p.footGapMeters!==null&&
     (!Number.isFinite(p.footGapMeters)||p.footGapMeters<0))||
    p.footObserved!==(p.footSolidId!==null&&
     p.footGapMeters!==null&&p.footGapMeters<=.4))
    throw Error('B310_NONAUTHENTIC_NAV_OR_RAPIER_FOOT_OBSERVATION');
  }
  checked+=r.probes.length;
 }
 if(checked>51)throw Error('B310_NATIVE_RECAST_BUDGET_EXCEEDED');
 const unpainted=rows.filter(r=>r.owned===0);
 return {schema:'B310_REAL_NATIVE_TRIPLE_RECAST_HUMAN_FOOT_CONTACT',
  source:'25/17/26/0',originalPaintSurfaceCount:17,
  actualActiveOriginalCellProbes:checked,
  unpaintedSurfaceCount:unpainted.length,
  navCandidateSources:unpainted.filter(r=>r.probes.some(p=>p.navCandidate))
   .map(r=>r.surfaceId),
  navPlusStaticFootSources:unpainted.filter(r=>r.probes.some(p=>
   p.navCandidate&&p.footObserved)).map(r=>r.surfaceId),
  originalRows:rows,
  truePlayerKccTraversalProven:false,
  sourceCollisionOrInkEdited:false,scoreablePromotions:0,
  artAccepted:false,original4v4Certified:false,productionAuthorized:false};
}
