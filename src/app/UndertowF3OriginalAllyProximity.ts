/**
 * W10-B141 opt-in teammate orientation from ACTUAL KCC and Rapier foot.
 * Read-only source presentation; never a route or collision certificate.
 */
export interface B141AllyNativeView{
 matchState:string;
 player:{position:readonly number[];hp:number};
 cpu:{
  physicalRejoins:readonly unknown[];
  cpu:readonly {id:string;physicalFoot?:readonly number[]|null;mobilityState?:string}[];
  sourcePatrol:{b137AllyRallyOptIn:boolean;b137ApprovedNativeRallies:number};
 };
 originalSourceSolids:number;originalPaintSurfaces:number;
 originalSourceNavigationLinks:number|undefined;sourceScoreablePromotions:number;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
}
export function describeB141RealOriginalAlly(n:B141AllyNativeView,footOffset:number){
 const approvals=n.cpu.sourcePatrol.b137ApprovedNativeRallies;
 const make=(code:string,text:string,range:number|null=null,gap:number|null=null)=>({
  code,text,actualHorizontalSeparationMeters:range,actualVerticalFootGapMeters:gap,
  historicalSourceGoalApprovals:approvals,
  currentRouteCertified:false as const,physicalMeetingCertified:false as const
 });
 if(!n.cpu.sourcePatrol.b137AllyRallyOptIn)return make('OFF','');
 if(n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
    n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
    n.productionAuthorized!==false||n.unrestricted4v4Certified!==false)
  return make('SOURCE_HOLD','A1 · original source authority HOLD');
 if(n.matchState!=='PLAYING'||n.cpu.physicalRejoins.length!==7)
  return make('WAITING_7_CPU','A1 · waiting for 7 real CPU returns');
 const a=n.cpu.cpu.find(b=>b.id==='A1'),h=n.player.position,f=a?.physicalFoot;
 if(!f||f.length!==3||h.length!==3||
    ![...h,...f,footOffset].every(Number.isFinite)||n.player.hp<=0)
  return make('MISSING_REAL_FOOT','A1 · actual Rapier/KCC foot not available');
 if(a?.mobilityState!=='GROUND')
  return make('A1_NOT_GROUNDED','A1 · actual Rapier body not on ground');
 const vertical=h[1]!-footOffset-f[1]!;
 const range=Math.hypot(h[0]!-f[0]!,h[2]!-f[2]!);
 const caption='A1 '+range.toFixed(1)+'m horizontally · ';
 if(vertical>.30)
  return make('A1_BELOW',caption+vertical.toFixed(1)+
   'm below you · use only existing original terrain (route unverified)',range,vertical);
 if(vertical<-.30)
  return make('A1_ABOVE',caption+(-vertical).toFixed(1)+
   'm above you · route unverified',range,vertical);
 if(f[2]!<33||h[2]!<33||f[1]!<2.7||f[1]!>5.25||
    h[1]!-footOffset<2.7||h[1]!-footOffset>5.25)
  return make('NOT_ORIGINAL_LOWER_BAND',caption+
   'not in original lower-side source band; route unverified',range,vertical);
 if(range<3)
  return make('CLOSE_XZ',caption+
   'close XZ feet · no certified physical contact',range,vertical);
 if(range>18)
  return make('OUT_OF_RALLY_RANGE',caption+
   'outside native rally range',range,vertical);
 if(approvals>0)
  return make('HISTORICAL_GOAL_REQUEST',caption+
   approvals+' past source goals; current route/arrival NOT certified',range,vertical);
 return make('SAME_LEVEL_UNPROVEN',caption+
  'similar height; Recast/Rapier route not yet verified',range,vertical);
}
