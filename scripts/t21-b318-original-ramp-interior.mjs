/** B318 — read only original 4-vertex ramp interior route hypothesis.
 * Source vertices are returned unchanged from native original geometry.
 * Geometry guidance alone NEVER establishes physical KCC traversal. */
export const ORIGINAL_RAMP='right-low-route-ramp-positive-z';
const wrap=x=>((x+540)%360)-180;
const finite3=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
export function b318NativeOriginalRampInterior({quad,body,yaw}){
 if(quad?.id!==ORIGINAL_RAMP||
  quad.sourceObject!=='Fld_Temple01_pCube21569_1__FloorConcrete03'||
  !Array.isArray(quad.vertices)||quad.vertices.length!==4||
  !quad.vertices.every(finite3)||!finite3(body)||
  !Number.isFinite(yaw))
  throw Error('B318_ORIGINAL_SOURCE_RAMP_QUAD_REQUIRED');
 const [hiA,hiB,loA,loB]=quad.vertices;
 // Original four vertex mesh has two low/ two high vertices.
 if(Math.abs(loA[1]-loB[1])>.01||
  Math.abs(hiA[1]-hiB[1])>.01||
  !(loA[1]+.5<hiA[1]))
  throw Error('B318_NONORIGINAL_RAMP_CORNER_ORIENTATION');
 // NOT a generated surface. Only a point INSIDE original quad.
 // Low corner +10% towards far high edge +20% along low edge:
 // avoids B316's low-vertex tangency, no collider or NavLink mutation.
 const target=loB.map((n,i)=>n+.10*(hiB[i]-n)+.20*(loA[i]-n));
 const dx=target[0]-body[0],dz=target[2]-body[2];
 const distance=Math.hypot(dx,dz);
 const forwardYaw=Math.atan2(dx,-dz)*180/Math.PI;
 const mouseX=Math.round(wrap(forwardYaw-yaw)/.22);
 const screenX=800+mouseX;
 const plan={targetSourceInteriorPoint:target,distance,
  targetForwardYaw:forwardYaw,mouseX,screenX,
  originalFourSourceVertices:true,pointOnlyNotFootprintOrRoute:true,
  physicallyCertified:false,safe:distance>=.6&&distance<=4.5&&
   Math.abs(mouseX)<=720&&screenX>=10&&screenX<=1590};
 return {schema:'B318_REAL_ORIGINAL_RAMP_SOURCE_INTERIOR_GUIDE',
  source:'25/17/26/0',candidate:plan.safe?plan:null,
  geometricalCandidate:plan,sourceInkOrPhysicsModified:false,
  productionAuthorized:false};
}
export function b318OriginalQuadPlanarSignedMargin(quad,point){
 if(!finite3(point)||quad?.vertices?.length!==4||
  !quad.vertices.every(finite3))
  throw Error('B318_INVALID_ORIGINAL_MESH_SIGNED_MARGIN');
 // Ramp 4-vertex clockwise boundary [0,1,3,2] in original model.
 const vertices=quad.vertices;
 const poly=[vertices[0],vertices[1],vertices[3],vertices[2]];
 const signs=[],distances=[];
 for(let i=0;i<4;i++){
  const a=poly[i],b=poly[(i+1)%4];
  const dx=b[0]-a[0],dz=b[2]-a[2];
  const cross=dx*(point[2]-a[2])-dz*(point[0]-a[0]);
  const u=Math.max(0,Math.min(1,
   ((point[0]-a[0])*dx+(point[2]-a[2])*dz)/(dx*dx+dz*dz)));
  signs.push(cross);
  distances.push(Math.hypot(
   point[0]-(a[0]+u*dx),point[2]-(a[2]+u*dz)));
 }
 const inside=signs.every(v=>v>=-1e-6)||
  signs.every(v=>v<=1e-6);
 const margin=Math.min(...distances);
 return {source:'25/17/26/0',originalQuadInsideXZ:inside,
  signedOriginalRampMarginMeters:inside?margin:-margin,
  originalQuadPhysicalFootProven:false,
  certifiedWalkRoute:false};
}
