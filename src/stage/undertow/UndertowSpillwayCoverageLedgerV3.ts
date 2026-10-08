import type { StageSolidDefinition, StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_MACRO_OUTER_BOUNDARY, UNDERTOW_T21_MACRO_REVIEW_SURFACES } from './UndertowSpillwayMacroCoverage';
import { UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES } from './UndertowSpillwaySourceNativeReviewGeometry';
import { UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES } from './UndertowSpillwaySourceNativeSupplementGeometry';

/**
 * Coverage Ledger v3: a plan-projection DISPLAY inventory, not a terrain/floor
 * reconstruction. A covered cell says that at least one visible reviewed solid
 * or exact source triangle projects onto its XZ sample. It says NOTHING about
 * traversability, vacant air above/below it, scoreability, or vertical links.
 */
export type CoverageZone = 'CENTER' | 'POS' | 'NEG' | 'LEFT_SIDE' | 'RIGHT_SIDE';
export type CoverageBucket = 'REVIEWED_ONLY' | 'SOURCE_ONLY' | 'OVERLAP' | 'UNDISPLAYED';
export type CoverageXZ = readonly [number, number];

export interface CoverageZoneRecord {
  zone: CoverageZone;
  cells: number;
  reviewedOnly: number;
  sourceOnly: number;
  overlap: number;
  undisplayed: number;
  /** Square meters of CELL-CENTER samples, NOT exact surface area. */
  approximateUndisplayedXZSquareMeters: number;
}
export interface CoverageGapCluster {
  zone: CoverageZone;
  cells: number;
  approximateAreaSquareMeters: number;
  centroidXZ: CoverageXZ;
  boundsXZ: readonly [number, number, number, number];
  reason: 'NO_DISPLAYED_REVIEWED_SOLID_OR_SOURCE_TRIANGLE_AT_XZ';
  shapeConfidence: 'UNRESOLVED';
  yConfidence: 'UNRESOLVED';
  connectivityConfidence: 'UNRESOLVED';
}
export interface CoverageSourceRecord {
  id: string;
  sourceComponentId: string;
  sourceMaterial: string;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  yRange: readonly [number, number];
  sourceTriangleAreaSquareMeters: number;
  shapeConfidence: 'EXACT_TEMPLE01_SOURCE';
  yConfidence: 'EXACT_TEMPLE01_SOURCE';
  connectivityConfidence: 'UNRESOLVED';
  authority: 'EXACT_SOURCE_MESH_REVIEW_ONLY';
}

const CELL_METERS = 0.5;
const ZONES: readonly CoverageZone[] = ['CENTER', 'POS', 'NEG', 'LEFT_SIDE', 'RIGHT_SIDE'];
type TriXZ = readonly [CoverageXZ, CoverageXZ, CoverageXZ];
type ProjectedShape = { outer?: readonly CoverageXZ[]; holes?: readonly (readonly CoverageXZ[])[]; triangles?: readonly TriXZ[] };

function insideRing([x, z]: CoverageXZ, ring: readonly CoverageXZ[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j]!, b = ring[i]!;
    const cross = (x - a[0]) * (b[1] - a[1]) - (z - a[1]) * (b[0] - a[0]);
    const dot = (x - a[0]) * (x - b[0]) + (z - a[1]) * (z - b[1]);
    if (Math.abs(cross) <= 1e-8 && dot <= 1e-8) return true;
    if ((a[1] > z) !== (b[1] > z) &&
      x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
function inTriangle([x, z]: CoverageXZ, [a,b,c]: TriXZ): boolean {
  const d = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
  // Vertical walls collapse to zero XZ area; they are not evidence of a floor.
  if (Math.abs(d) <= 1e-8) return false;
  const u = ((x-a[0])*(c[1]-a[1])-(z-a[1])*(c[0]-a[0]))/d;
  const v = ((b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0]))/d;
  return u >= -1e-9 && v >= -1e-9 && u+v <= 1+1e-9;
}
function shown(shape: ProjectedShape, p: CoverageXZ): boolean {
  if (shape.outer && insideRing(p, shape.outer) &&
    !(shape.holes ?? []).some(h => insideRing(p,h))) return true;
  return shape.triangles?.some(t => inTriangle(p,t)) ?? false;
}
function transform(vertex: StageVector3, solid: StageSolidDefinition): CoverageXZ {
  let [x,y,z] = vertex;
  const degrees = solid.rotationEulerDegrees ?? [0,0,0];
  const rx=(degrees[0]??0)*Math.PI/180,ry=(degrees[1]??0)*Math.PI/180,rz=(degrees[2]??0)*Math.PI/180;
  // XYZ local Euler; no arbitrary coordinate snapping or mesh reprojection.
  if (rx) { const ny=y*Math.cos(rx)-z*Math.sin(rx); z=y*Math.sin(rx)+z*Math.cos(rx); y=ny; }
  if (ry) { const nx=x*Math.cos(ry)+z*Math.sin(ry); z=-x*Math.sin(ry)+z*Math.cos(ry); x=nx; }
  if (rz) { const nx=x*Math.cos(rz)-y*Math.sin(rz); y=x*Math.sin(rz)+y*Math.cos(rz); x=nx; }
  return [x+solid.center[0],z+solid.center[2]];
}
function trisFromVertices(vertices: readonly StageVector3[]): readonly TriXZ[] {
  const triangles: TriXZ[] = [];
  for(let i=0;i+2<vertices.length;i+=3) {
    const a=vertices[i]!,b=vertices[i+1]!,c=vertices[i+2]!;
    triangles.push([[a[0],a[2]],[b[0],b[2]],[c[0],c[2]]]);
  }
  return triangles;
}
function solidShape(solid: StageSolidDefinition): ProjectedShape {
  if (solid.triangleMesh) {
    const verts=solid.triangleMesh.vertices;
    return {triangles: Array.from({length: Math.floor(solid.triangleMesh.indices.length/3)},(_,i)=>{
      const ids=solid.triangleMesh!.indices.slice(i*3,i*3+3);
      return ids.map(id=>transform(verts[id]!,solid)) as unknown as TriXZ;
    })};
  }
  if(solid.footprint) {
    const minX=solid.center[0]-solid.size[0]/2, minZ=solid.center[2]-solid.size[2]/2;
    const toWorld=(ring: readonly CoverageXZ[])=>ring.map(([x,z])=>[x+minX,z+minZ] as CoverageXZ);
    return {outer:toWorld(solid.footprint.outer),holes:(solid.footprint.holes??[]).map(toWorld)};
  }
  // Projection of the eight true transformed box corners (rather than pretending
  // a tilted box is an unrotated floor).
  const corners: StageVector3[]=[];
  for(const x of [-0.5,0.5]) for(const y of [-0.5,0.5]) for(const z of [-0.5,0.5])
    corners.push([x*solid.size[0],y*solid.size[1],z*solid.size[2]]);
  const p=corners.map(v=>transform(v,solid));
  // Convex hull of 8 projected corners, using the same source-sized box.
  const sorted=[...p].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(a:CoverageXZ,b:CoverageXZ,c:CoverageXZ)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const low:CoverageXZ[]=[],high:CoverageXZ[]=[];
  for(const v of sorted){while(low.length>1&&cross(low[low.length-2]!,low[low.length-1]!,v)<=0)low.pop();low.push(v);}
  for(const v of [...sorted].reverse()){while(high.length>1&&cross(high[high.length-2]!,high[high.length-1]!,v)<=0)high.pop();high.push(v);}
  return {outer:[...low.slice(0,-1),...high.slice(0,-1)]};
}
function zoneFor([x,z]:CoverageXZ):CoverageZone {
  // Reproducible PLAN bins, NOT claims of gameplay lane boundaries.
  if(Math.abs(z)<=15) return 'CENTER';
  if(x<=-14) return 'LEFT_SIDE';
  if(x>=14) return 'RIGHT_SIDE';
  return z>0?'POS':'NEG';
}
function zoneRecord(zone:CoverageZone): CoverageZoneRecord {
  return {zone,cells:0,reviewedOnly:0,sourceOnly:0,overlap:0,undisplayed:0,
    approximateUndisplayedXZSquareMeters:0};
}

export function buildUndertowCoverageLedgerV3(): {
  version: 3; reviewOnly: true; runtimePromotionAuthorized: false;
  cellSizeMeters: number; gridSampleAuthority: 'XZ_CELL_CENTER_APPROXIMATION';
  occupancyAuthority: 'XZ_OCCUPANCY_ONLY_NOT_FLOOR';
  zones: readonly CoverageZoneRecord[]; clusters: readonly CoverageGapCluster[];
  sourceInventory: readonly CoverageSourceRecord[];
  stageCells: number; undisplayedCells: number;
  /** Review-only sample coordinates for downstream source-candidate matching. */
  undisplayedSampleXZ: readonly CoverageXZ[];
  provisionalEnvelopesExcluded: number;
} {
  const bounds=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds;
  const width=Math.ceil((bounds.maxX-bounds.minX)/CELL_METERS);
  const height=Math.ceil((bounds.maxZ-bounds.minZ)/CELL_METERS);
  const sourceMeshes=[
    ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
    ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES
  ];
  const shapes=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.map(solidShape);
  const sourceShapes=sourceMeshes.map(m=>({triangles:trisFromVertices(m.vertices)}));
  const records=ZONES.map(zoneRecord);
  const state=new Uint8Array(width*height); // 0 = exterior, 1 = displayed, 2 = missing
  const zoneGrid=new Array<CoverageZone>(width*height);
  let stageCells=0,undisplayedCells=0;
  const undisplayedSampleXZ:CoverageXZ[]=[];
  for(let zi=0;zi<height;zi++) for(let xi=0;xi<width;xi++) {
    const p:CoverageXZ=[bounds.minX+(xi+0.5)*CELL_METERS,bounds.minZ+(zi+0.5)*CELL_METERS];
    if(!insideRing(p,UNDERTOW_T21_MACRO_OUTER_BOUNDARY))continue;
    const idx=zi*width+xi,zone=zoneFor(p),rec=records[ZONES.indexOf(zone)]!;
    zoneGrid[idx]=zone;stageCells++;rec.cells++;
    const reviewed=shapes.some(s=>shown(s,p));
    const source=sourceShapes.some(s=>shown(s,p));
    if(reviewed&&source) rec.overlap++;
    else if(reviewed)rec.reviewedOnly++;
    else if(source)rec.sourceOnly++;
    else {rec.undisplayed++;undisplayedCells++;state[idx]=2;undisplayedSampleXZ.push(p);}
    if(reviewed||source)state[idx]=1;
  }
  for(const r of records)r.approximateUndisplayedXZSquareMeters=r.undisplayed*CELL_METERS**2;
  const clusters:CoverageGapCluster[]=[];
  const queue:number[]=[];
  for(let origin=0;origin<state.length;origin++){
    if(state[origin]!==2)continue;
    state[origin]=3;queue.push(origin);
    let head=0,count=0,sumX=0,sumZ=0,minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
    const votes=new Map<CoverageZone,number>();
    while(head<queue.length){
      const idx=queue[head++]!,xi=idx%width,zi=Math.floor(idx/width);
      const x=bounds.minX+(xi+0.5)*CELL_METERS,z=bounds.minZ+(zi+0.5)*CELL_METERS;
      count++;sumX+=x;sumZ+=z;minX=Math.min(minX,x);maxX=Math.max(maxX,x);
      minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);
      const zone=zoneGrid[idx]!;votes.set(zone,(votes.get(zone)??0)+1);
      for(const other of [xi>0?idx-1:-1,xi+1<width?idx+1:-1,zi>0?idx-width:-1,zi+1<height?idx+width:-1]){
        if(other>=0&&state[other]===2){state[other]=3;queue.push(other);}
      }
    }
    queue.length=0;
    const zone=[...votes].sort((a,b)=>b[1]-a[1]||ZONES.indexOf(a[0])-ZONES.indexOf(b[0]))[0]![0];
    clusters.push({zone,cells:count,approximateAreaSquareMeters:count*CELL_METERS**2,
      centroidXZ:[sumX/count,sumZ/count],boundsXZ:[minX,minZ,maxX,maxZ],
      reason:'NO_DISPLAYED_REVIEWED_SOLID_OR_SOURCE_TRIANGLE_AT_XZ',
      shapeConfidence:'UNRESOLVED',yConfidence:'UNRESOLVED',connectivityConfidence:'UNRESOLVED'});
  }
  clusters.sort((a,b)=>b.cells-a.cells||a.centroidXZ[1]-b.centroidXZ[1]);
  const sourceInventory:CoverageSourceRecord[]=sourceMeshes.map(mesh=>({
    id:mesh.id,sourceComponentId:mesh.sourceComponentId,sourceMaterial:mesh.sourceMaterial,
    side:mesh.side,yRange:mesh.yRange,sourceTriangleAreaSquareMeters:mesh.areaSquareMeters,
    shapeConfidence:'EXACT_TEMPLE01_SOURCE',yConfidence:'EXACT_TEMPLE01_SOURCE',
    connectivityConfidence:'UNRESOLVED',authority:'EXACT_SOURCE_MESH_REVIEW_ONLY'
  }));
  return {version:3,reviewOnly:true,runtimePromotionAuthorized:false,cellSizeMeters:CELL_METERS,
    gridSampleAuthority:'XZ_CELL_CENTER_APPROXIMATION',
    occupancyAuthority:'XZ_OCCUPANCY_ONLY_NOT_FLOOR',
    zones:records,clusters,sourceInventory,stageCells,undisplayedCells,undisplayedSampleXZ,
    provisionalEnvelopesExcluded:UNDERTOW_T21_MACRO_REVIEW_SURFACES.length};
}

export const UNDERTOW_T21_COVERAGE_LEDGER_V3 = buildUndertowCoverageLedgerV3();
