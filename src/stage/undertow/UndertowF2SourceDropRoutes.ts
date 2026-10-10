import {Vec3} from 'playcanvas';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {StageDefinition,StageNavigationLinkDefinition,StageVector3} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import type {SourceSpawnPlan} from './UndertowPhase14QSourceSpawnPlan';

export interface T21F2ActorRoute {
 readonly actorId:'A1'|'A2'|'A3'|'HUMAN'|'B1'|'B2'|'B3'|'B4';
 readonly start:StageVector3;
 readonly linkId:string;
 readonly sourceGoal:StageVector3;
 readonly originalLanding:StageVector3;
 readonly reachabilityConfirmed:true;
 readonly qaOnly:true;
}
export interface T21F2RoutePlan {
 readonly routes:readonly T21F2ActorRoute[];
 readonly distinctFirstDropLinks:number;
 readonly originalSourceLinksPreserved:true;
 readonly releaseAuthorized:false;
}

/**
 * Assign the real 4+4 high-pad QA actors to existing (never fabricated)
 * one-way first-drop links. The HUMAN is the fourth Team A actor.
 * Every route is audited from that actor's own separate source-supported
 * Recast spawn foot to the selected original link's lower endpoint.
 * This does not assert the subsequent physical fall/rejoin succeeded.
 */
export function planT21F2SourceDropRoutes(
 stage:StageDefinition,nav:RecastStageNavigation,spawns:SourceSpawnPlan
):T21F2RoutePlan{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    frozen.activationReady!==false||
    stage.solids!==frozen.solids||
    stage.paintSurfaces!==frozen.paintSurfaces||
    stage.navigationLinks!==frozen.navigationLinks||
    !spawns.qaOnly||spawns.releaseAuthorized)
   throw Error('T21_F2_SOURCE_ROUTE_AUTHORITY_REJECTED');

 const routes:T21F2ActorRoute[]=[];
 const assignments:readonly {
  id:T21F2ActorRoute['actorId'];foot:StageVector3;side:string
 }[]=[
  ...(['A1','A2','A3','HUMAN'] as const).map((id,i)=>({
    id,foot:spawns.teamASlots[i]!,side:'positive-z'
  })),
  ...(['B1','B2','B3','B4'] as const).map((id,i)=>({
    id,foot:spawns.teamBSlots[i]!,side:'negative-z'
  }))
 ];
 const used=new Set<string>();
 const distance=(a:StageVector3,b:StageVector3)=>
   Math.hypot(a[0]-b[0],a[2]-b[2]);
 const links=stage.navigationLinks!;
 for(const actor of assignments){
   const reachable: {link:StageNavigationLinkDefinition;score:number}[]=[];
   for(const link of links){
     if(!link.id.startsWith('first-drop-'+actor.side+'-')||
        link.bidirectional!==false||link.start[1]!==7.5||
        link.end[1]!==3)continue;
     const path=nav.auditPath(new Vec3(...actor.foot),new Vec3(...link.end));
     if(!path.reachedTarget)continue;
     // Distinct authored drop cells avoid concentrating all seven CPUs
     // on one exit; no new waypoints or physical pads are introduced.
     const nearestLanding=Math.min(100,...routes
       .filter(r=>r.linkId.includes(actor.side))
       .map(r=>distance(r.originalLanding,link.end)));
     const crowding=Math.max(0,1.2-nearestLanding)*20;
     const score=distance(actor.foot,link.start)+crowding+
        (used.has(link.id)?1000:0);
     reachable.push({link,score});
   }
   reachable.sort((a,b)=>a.score-b.score||
     a.link.id.localeCompare(b.link.id));
   const selected=reachable[0]?.link;
   if(!selected)
     throw Error('T21_F2_NO_SOURCE_REACHABLE_FIRST_DROP_'+actor.id);
   used.add(selected.id);
   routes.push({
     actorId:actor.id,start:actor.foot,linkId:selected.id,
     sourceGoal:selected.end,originalLanding:selected.end,
     reachabilityConfirmed:true,qaOnly:true
   });
 }
 if(routes.length!==8)
   throw Error('T21_F2_ROUTE_ACTOR_COUNT_INVALID');
 return {
  routes,distinctFirstDropLinks:used.size,
  originalSourceLinksPreserved:true,releaseAuthorized:false
 };
}
