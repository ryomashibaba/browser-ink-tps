import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../src/core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../src/navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageNavigationLinkDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  undertowPass18bTraversableQaAnchors,
  vec3
} from '../src/stage/undertow/UndertowSpillwayConnectivityQa';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
interface ChainComponent{
  id:string;
  sourceMaterial?:string;
  yRange?:[number,number];
  mesh:StageTriangleMeshGeometry;
}
interface Fixture{
  version:'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly:true;
  runtimePromotionAuthorized:false;
  glass:Record<Side,{
    bridgeMesh:StageTriangleMeshGeometry;
    nearestNonBridgeMesh:StageTriangleMeshGeometry|null;
  }>;
  pass18g:{
    routes:{
      glass:Record<Side,{
        relaxedReachableComponentIds:string[];
        components:ChainComponent[];
      }>;
    };
  };
}
interface Pair{
  a:StageVector3;
  b:StageVector3;
  distanceMeters:number;
}
interface MatrixRow{from:string;reached:string[];}
interface MatrixSummary{
  reached:number;
  weak:number;
  strong:number;
  isolated:string[];
  rows:MatrixRow[];
}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const UPSTREAM_FIXED_RETREAT_METERS=0.130;
const UPSTREAM_RADIUS_METERS=0.995;
const FLOOR_SLOPE_RADIUS_METERS=0.80;
const SLOPE_FLOOR00_RADIUS_METERS=0.669;
const TRUSTED_SNAP_METERS=0.30;
const DIRECTIONAL_RADII_METERS=[
  0.700,0.701,0.702,0.703,0.704,0.705
] as const;
const MAX_RETREAT_METERS=0.654737328492778;
const UPSTREAM_SUCCESS_POINTS:Record<Side,StageVector3>={
  POSITIVE_Z:[-10.67826430970341,6,12.118397071136153],
  NEGATIVE_Z:[10.907632598231574,6,-11.92383277567933]
};
const IDS:Record<Side,{floor02:string;slope:string;floor00:string;lowerFloor02:string}>={
  POSITIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2',
    lowerFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c2'
  },
  NEGATIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9',
    lowerFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c17'
  }
};

function distance(a:StageVector3,b:StageVector3):number{
  return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
}
function add(a:StageVector3,b:StageVector3):StageVector3{
  return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
}
function sub(a:StageVector3,b:StageVector3):StageVector3{
  return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}
function mul(a:StageVector3,s:number):StageVector3{
  return [a[0]*s,a[1]*s,a[2]*s];
}
function dot(a:StageVector3,b:StageVector3):number{
  return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}
function closestPointOnTriangle(
  p:StageVector3,a:StageVector3,b:StageVector3,c:StageVector3
):StageVector3{
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
  const d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
  if(d3>=0&&d4<=d3)return b;
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0)return add(a,mul(ab,d1/(d1-d3)));
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
  if(d6>=0&&d5<=d6)return c;
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0)return add(a,mul(ac,d2/(d2-d6)));
  const va=d3*d6-d5*d4;
  if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){
    return add(b,mul(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
  }
  const denom=1/(va+vb+vc),v=vb*denom,w=vc*denom;
  return add(a,add(mul(ab,v),mul(ac,w)));
}
function closestSegments(
  p1:StageVector3,q1:StageVector3,p2:StageVector3,q2:StageVector3
):Pair{
  const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2);
  const aa=dot(d1,d1),ee=dot(d2,d2),ff=dot(d2,r),eps=1e-15;
  let s=0,t=0;
  if(aa<=eps&&ee<=eps)return {a:p1,b:p2,distanceMeters:distance(p1,p2)};
  if(aa<=eps)t=Math.max(0,Math.min(1,ff/ee));
  else{
    const cc=dot(d1,r);
    if(ee<=eps)s=Math.max(0,Math.min(1,-cc/aa));
    else{
      const bb=dot(d1,d2),den=aa*ee-bb*bb;
      if(Math.abs(den)>eps)s=Math.max(0,Math.min(1,(bb*ff-cc*ee)/den));
      const tn=bb*s+ff;
      if(tn<0){t=0;s=Math.max(0,Math.min(1,-cc/aa));}
      else if(tn>ee){t=1;s=Math.max(0,Math.min(1,(bb-cc)/aa));}
      else t=tn/ee;
    }
  }
  const pa=add(p1,mul(d1,s)),pb=add(p2,mul(d2,t));
  return {a:pa,b:pb,distanceMeters:distance(pa,pb)};
}
function trianglePair(
  a0:StageVector3,a1:StageVector3,a2:StageVector3,
  b0:StageVector3,b1:StageVector3,b2:StageVector3
):Pair{
  let best:Pair|null=null;
  const consider=(candidate:Pair)=>{
    if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;
  };
  for(const p of [a0,a1,a2]){
    const q=closestPointOnTriangle(p,b0,b1,b2);
    consider({a:p,b:q,distanceMeters:distance(p,q)});
  }
  for(const p of [b0,b1,b2]){
    const q=closestPointOnTriangle(p,a0,a1,a2);
    consider({a:q,b:p,distanceMeters:distance(q,p)});
  }
  for(const [ap,aq] of [[a0,a1],[a1,a2],[a2,a0]] as const){
    for(const [bp,bq] of [[b0,b1],[b1,b2],[b2,b0]] as const){
      consider(closestSegments(ap,aq,bp,bq));
    }
  }
  if(!best)throw new Error('Pass 18AT triangle pair missing');
  return best;
}
function closestMeshPair(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry):Pair{
  let best:Pair|null=null;
  for(let ai=0;ai<a.indices.length;ai+=3){
    const a0=a.vertices[a.indices[ai]!]!;
    const a1=a.vertices[a.indices[ai+1]!]!;
    const a2=a.vertices[a.indices[ai+2]!]!;
    for(let bi=0;bi<b.indices.length;bi+=3){
      const b0=b.vertices[b.indices[bi]!]!;
      const b1=b.vertices[b.indices[bi+1]!]!;
      const b2=b.vertices[b.indices[bi+2]!]!;
      const candidate=trianglePair(a0,a1,a2,b0,b1,b2);
      if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;
    }
  }
  if(!best)throw new Error('Pass 18AT empty mesh pair');
  return best;
}
function meshBounds(mesh:StageTriangleMeshGeometry):StageVector3{
  const xs=mesh.vertices.map(v=>v[0]);
  const ys=mesh.vertices.map(v=>v[1]);
  const zs=mesh.vertices.map(v=>v[2]);
  return [
    Math.max(...xs)-Math.min(...xs),
    Math.max(...ys)-Math.min(...ys),
    Math.max(...zs)-Math.min(...zs)
  ];
}
function navOnlySolid(id:string,mesh:StageTriangleMeshGeometry):StageSolidDefinition{
  return {
    id,center:[0,0,0],size:meshBounds(mesh),material:'light',
    render:false,projectileBlocker:false,cameraBlocker:false,
    collisionEnabled:false,navigationEnabled:true,
    collisionBehavior:'SOLID',triangleMesh:mesh
  };
}
function qaStage(
  id:string,
  solids:readonly StageSolidDefinition[],
  links:readonly StageNavigationLinkDefinition[]
):StageDefinition{
  const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata:{
      id,displayName:id,worldBounds:base.worldBounds,
      teamASpawn:base.teamASpawnFloorPoint,
      teamBSpawn:base.teamBSpawnFloorPoint,
      teamASpawnSlots:[base.teamASpawnFloorPoint],
      teamBSpawnSlots:[base.teamBSpawnFloorPoint],
      tacticalNodes:[],splatZones:[]
    },
    solids,paintSurfaces:base.paintSurfaces,navigationLinks:links
  };
}
function matrixSummary(stage:StageDefinition):MatrixSummary{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const anchors=undertowPass18bTraversableQaAnchors();
  const rows=anchors.map(from=>({
    from:from.id,
    reached:anchors
      .filter(to=>nav.auditPath(vec3(from.point),vec3(to.point)).reachedTarget)
      .map(to=>to.id)
  }));
  const ids=rows.map(r=>r.from);
  const reach=new Map(rows.map(r=>[r.from,new Set(r.reached)] as const));
  const weakSeen=new Set<string>();
  let weak=0;
  for(const seed of ids){
    if(weakSeen.has(seed))continue;
    weak++;
    weakSeen.add(seed);
    const stack=[seed];
    while(stack.length){
      const cur=stack.pop()!;
      for(const candidate of ids){
        if(weakSeen.has(candidate))continue;
        if(reach.get(cur)!.has(candidate)||reach.get(candidate)!.has(cur)){
          weakSeen.add(candidate);
          stack.push(candidate);
        }
      }
    }
  }
  const strongSeen=new Set<string>();
  let strong=0;
  for(const seed of ids){
    if(strongSeen.has(seed))continue;
    strong++;
    for(const candidate of ids){
      if(reach.get(seed)!.has(candidate)&&reach.get(candidate)!.has(seed)){
        strongSeen.add(candidate);
      }
    }
  }
  return {
    reached:rows.reduce((n,row)=>n+row.reached.length,0),
    weak,strong,
    isolated:rows
      .filter(row=>row.reached.length===1&&row.reached[0]===row.from)
      .map(row=>row.from),
    rows
  };
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18AT missing component ${id}`);
  return found;
}
function mutualAnchorIds(
  nav:RecastStageNavigation,
  point:StageVector3
):string[]{
  const anchors=undertowPass18bTraversableQaAnchors();
  return anchors.filter(anchor=>
    nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
    nav.auditPath(vec3(anchor.point),vec3(point)).reachedTarget
  ).map(anchor=>anchor.id);
}


function triangleCentroid(
  a:StageVector3,b:StageVector3,c:StageVector3
):StageVector3{
  return [(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
}
function meshSamples(mesh:StageTriangleMeshGeometry):StageVector3[]{
  const samples=[...mesh.vertices];
  for(let i=0;i<mesh.indices.length;i+=3){
    samples.push(triangleCentroid(
      mesh.vertices[mesh.indices[i]!]!,
      mesh.vertices[mesh.indices[i+1]!]!,
      mesh.vertices[mesh.indices[i+2]!]!
    ));
  }
  return samples;
}
function trustedRepresentative(
  nav:RecastStageNavigation,
  mesh:StageTriangleMeshGeometry
):{point:StageVector3;snapMeters:number}|null{
  let best:{point:StageVector3;snapMeters:number}|null=null;
  for(const sample of meshSamples(mesh)){
    const p=nav.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snapMeters=distance(sample,point);
    if(snapMeters>TRUSTED_SNAP_METERS+1e-9)continue;
    if(!best||snapMeters<best.snapMeters)best={point,snapMeters};
  }
  return best;
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18AT QA-only directional terminal-radius diagnostic',()=>{
  it('keeps gameplay authority unresolved while testing exact raw jump-up/drop-down link plumbing over the frozen 18AK+18AF+18AN chain',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideData={} as Record<Side,{
      bridgeFloor:Pair;
      floorSlope:Pair;
      slopeFloor00:Pair;
      floor00LowerFloor02:Pair;
      upstreamFixedEndpoint:StageVector3;
      lowerMesh:StageTriangleMeshGeometry;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AT missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18at-downstream:${side}:${id}`,component.mesh));
      }
      sourceSolids.push(navOnlySolid(`pass18at-predecessor:${side}`,glass.bridgeMesh));

      const floor02=componentById(route.components,IDS[side].floor02);
      const slope=componentById(route.components,IDS[side].slope);
      const floor00=componentById(route.components,IDS[side].floor00);
      const lowerFloor02=componentById(route.components,IDS[side].lowerFloor02);
      const bridgeFloor=closestMeshPair(glass.bridgeMesh,floor02.mesh);
      const floorSlope=closestMeshPair(floor02.mesh,slope.mesh);
      const slopeFloor00=closestMeshPair(slope.mesh,floor00.mesh);
      const floor00LowerFloor02=closestMeshPair(floor00.mesh,lowerFloor02.mesh);

      const target=UPSTREAM_SUCCESS_POINTS[side];
      const delta=sub(target,bridgeFloor.b);
      const length=Math.hypot(delta[0],delta[1],delta[2]);
      expect(length).toBeCloseTo(MAX_RETREAT_METERS,12);
      const direction=[
        delta[0]/length,delta[1]/length,delta[2]/length
      ] as StageVector3;
      const upstreamFixedEndpoint=[
        bridgeFloor.b[0]+direction[0]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloor.b[1]+direction[1]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloor.b[2]+direction[2]*UPSTREAM_FIXED_RETREAT_METERS
      ] as StageVector3;
      sideData[side]={
        bridgeFloor,floorSlope,slopeFloor00,floor00LowerFloor02,
        upstreamFixedEndpoint,lowerMesh:lowerFloor02.mesh
      };
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    let userId=20200;
    const frozenLinks:StageNavigationLinkDefinition[]=[];
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      frozenLinks.push({
        id:`pass18at-upstream-${side.toLowerCase()}`,
        start:sideData[side].bridgeFloor.a,
        end:sideData[side].upstreamFixedEndpoint,
        radiusMeters:UPSTREAM_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18at-floor-slope-${side.toLowerCase()}`,
        start:sideData[side].floorSlope.a,
        end:sideData[side].floorSlope.b,
        radiusMeters:FLOOR_SLOPE_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18at-slope-floor00-${side.toLowerCase()}`,
        start:sideData[side].slopeFloor00.a,
        end:sideData[side].slopeFloor00.b,
        radiusMeters:SLOPE_FLOOR00_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
    }

    const baselineStage=qaStage(
      'pass18at-frozen-chain',
      solids,[...inherited,...frozenLinks]
    );
    const baseline=matrixSummary(baselineStage);
    const baselineNav=new RecastStageNavigation(baselineStage,new PerformanceStats());
    const lowerRepresentatives={} as Record<Side,{point:StageVector3;snapMeters:number}>;
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const rep=trustedRepresentative(baselineNav,sideData[side].lowerMesh);
      if(!rep)throw new Error(`Pass 18AT lower trusted representative missing ${side}`);
      lowerRepresentatives[side]=rep;
    }

    const anchors=undertowPass18bTraversableQaAnchors();
    const classify=(stage:StageDefinition,side:Side)=>{
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
      const lower=lowerRepresentatives[side].point;
      const outbound=anchors.filter(anchor=>
        nav.auditPath(vec3(lower),vec3(anchor.point)).reachedTarget
      ).map(anchor=>anchor.id);
      const inbound=anchors.filter(anchor=>
        nav.auditPath(vec3(anchor.point),vec3(lower)).reachedTarget
      ).map(anchor=>anchor.id);
      return {
        lowerToOwnGlass:outbound.some(id=>id.startsWith(ownPrefix)),
        ownGlassToLower:inbound.some(id=>id.startsWith(ownPrefix)),
        outboundOwnGlassIds:outbound.filter(id=>id.startsWith(ownPrefix)),
        inboundOwnGlassIds:inbound.filter(id=>id.startsWith(ownPrefix)),
        outboundNonGlassIds:outbound.filter(id=>!id.startsWith('glass:')),
        inboundNonGlassIds:inbound.filter(id=>!id.startsWith('glass:'))
      };
    };

    const evaluate=(radiusMeters:number,mode:'JUMP_ONLY'|'DROP_ONLY'|'BOTH')=>{
      const links:StageNavigationLinkDefinition[]=[];
      for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
        const pair=sideData[side].floor00LowerFloor02;
        if(mode==='JUMP_ONLY'||mode==='BOTH'){
          links.push({
            id:`pass18at-jump-${side.toLowerCase()}-${radiusMeters.toFixed(3)}`,
            start:pair.b,
            end:pair.a,
            radiusMeters,
            bidirectional:false,
            userId:userId++
          });
        }
        if(mode==='DROP_ONLY'||mode==='BOTH'){
          links.push({
            id:`pass18at-drop-${side.toLowerCase()}-${radiusMeters.toFixed(3)}`,
            start:pair.a,
            end:pair.b,
            radiusMeters,
            bidirectional:false,
            userId:userId++
          });
        }
      }
      const stage=qaStage(
        `pass18at-${mode.toLowerCase()}-${radiusMeters.toFixed(3)}`,
        solids,[...inherited,...frozenLinks,...links]
      );
      const matrix=matrixSummary(stage);
      const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,classify(stage,side)
      ]));
      return {
        radiusMeters,mode,
        matrix:{reached:matrix.reached,weak:matrix.weak,strong:matrix.strong,isolated:matrix.isolated},
        sides
      };
    };

    const samples=DIRECTIONAL_RADII_METERS.map(radiusMeters=>({
      radiusMeters,
      jumpOnly:evaluate(radiusMeters,'JUMP_ONLY'),
      dropOnly:evaluate(radiusMeters,'DROP_ONLY'),
      both:evaluate(radiusMeters,'BOTH')
    }));

    const summarizeMode=(mode:'jumpOnly'|'dropOnly'|'both')=>{
      const sample=samples.find(row=>{
        const pos=row[mode].sides.POSITIVE_Z as ReturnType<typeof classify>;
        const neg=row[mode].sides.NEGATIVE_Z as ReturnType<typeof classify>;
        if(mode==='jumpOnly')return pos.lowerToOwnGlass&&neg.lowerToOwnGlass;
        if(mode==='dropOnly')return pos.ownGlassToLower&&neg.ownGlassToLower;
        return pos.lowerToOwnGlass&&neg.lowerToOwnGlass&&pos.ownGlassToLower&&neg.ownGlassToLower;
      });
      return sample?sample[mode]:null;
    };

    const firstJumpOnlyCommonAttachment=summarizeMode('jumpOnly');
    const firstDropOnlyCommonAttachment=summarizeMode('dropOnly');
    const firstBothCommonAttachment=summarizeMode('both');

    console.log('T21PASS18AT_DIRECTIONAL_ONE_MM_RADIUS',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18AS',
      terminalBracketMeters:[0.700,0.705],
      qaTraversalClass:'JUMP_UP_DROP_DOWN',
      trustedEndpointsUsedAsLinks:false,
      globalRecastSettingsChanged:false,
      radiiMeters:DIRECTIONAL_RADII_METERS,
      physicalDistances:Object.fromEntries(
        (['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
          side,sideData[side].floor00LowerFloor02.distanceMeters
        ])
      ),
      lowerRepresentatives,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong,isolated:baseline.isolated},
      firstJumpOnlyCommonAttachment,
      firstDropOnlyCommonAttachment,
      firstBothCommonAttachment,
      samples
    }));

    expect(firstJumpOnlyCommonAttachment).not.toBeNull();
    expect(firstDropOnlyCommonAttachment).not.toBeNull();
    expect(firstBothCommonAttachment).not.toBeNull();
    if(firstJumpOnlyCommonAttachment){
      expect(firstJumpOnlyCommonAttachment.radiusMeters).toBeGreaterThan(0.700);
      expect(firstJumpOnlyCommonAttachment.radiusMeters).toBeLessThanOrEqual(0.705);
    }
    if(firstDropOnlyCommonAttachment){
      expect(firstDropOnlyCommonAttachment.radiusMeters).toBeGreaterThan(0.700);
      expect(firstDropOnlyCommonAttachment.radiusMeters).toBeLessThanOrEqual(0.705);
    }
    if(firstBothCommonAttachment){
      expect(firstBothCommonAttachment.radiusMeters).toBeGreaterThan(0.700);
      expect(firstBothCommonAttachment.radiusMeters).toBeLessThanOrEqual(0.705);
    }
    const firstSample=samples[0]!;
    const lastSample=samples[samples.length-1]!;
    {
      const posJump=firstSample.jumpOnly.sides.POSITIVE_Z as ReturnType<typeof classify>;
      const posDrop=firstSample.dropOnly.sides.POSITIVE_Z as ReturnType<typeof classify>;
      const posBoth=firstSample.both.sides.POSITIVE_Z as ReturnType<typeof classify>;
      expect(posJump.lowerToOwnGlass).toBe(false);
      expect(posDrop.ownGlassToLower).toBe(false);
      expect(posBoth.lowerToOwnGlass).toBe(false);
      expect(posBoth.ownGlassToLower).toBe(false);

      const negJump=firstSample.jumpOnly.sides.NEGATIVE_Z as ReturnType<typeof classify>;
      const negDrop=firstSample.dropOnly.sides.NEGATIVE_Z as ReturnType<typeof classify>;
      const negBoth=firstSample.both.sides.NEGATIVE_Z as ReturnType<typeof classify>;
      expect(negJump.lowerToOwnGlass).toBe(true);
      expect(negJump.ownGlassToLower).toBe(false);
      expect(negDrop.lowerToOwnGlass).toBe(false);
      expect(negDrop.ownGlassToLower).toBe(true);
      expect(negBoth.lowerToOwnGlass).toBe(true);
      expect(negBoth.ownGlassToLower).toBe(true);
    }
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const lastJump=lastSample.jumpOnly.sides[side] as ReturnType<typeof classify>;
      const lastDrop=lastSample.dropOnly.sides[side] as ReturnType<typeof classify>;
      const lastBoth=lastSample.both.sides[side] as ReturnType<typeof classify>;
      expect(lastJump.lowerToOwnGlass).toBe(true);
      expect(lastJump.ownGlassToLower).toBe(false);
      expect(lastDrop.lowerToOwnGlass).toBe(false);
      expect(lastDrop.ownGlassToLower).toBe(true);
      expect(lastBoth.lowerToOwnGlass).toBe(true);
      expect(lastBoth.ownGlassToLower).toBe(true);
    }

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(sideData.POSITIVE_Z.floor00LowerFloor02.distanceMeters).toBeCloseTo(
      1.8236261924604125,11
    );
    expect(sideData.NEGATIVE_Z.floor00LowerFloor02.distanceMeters).toBeCloseTo(
      1.8236261924604125,11
    );
    expect(lowerRepresentatives.POSITIVE_Z.snapMeters).toBeLessThanOrEqual(TRUSTED_SNAP_METERS+1e-9);
    expect(lowerRepresentatives.NEGATIVE_Z.snapMeters).toBeLessThanOrEqual(TRUSTED_SNAP_METERS+1e-9);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
