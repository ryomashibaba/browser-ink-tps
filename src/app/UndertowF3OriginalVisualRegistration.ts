/** Exact existing Temple01 model -> physical-project pose, DISPLAY ONLY.
 * The source registration is local, not full-stage collision certification.
 */
import type {Entity} from 'playcanvas';
import {sourceCanonicalPlayableMode} from './SourcePlayPortal';
import {UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT as audit}
 from '../stage/undertow/UndertowSpillwayRemodelGeometryAudit';
export type OriginalVisualPose=Readonly<{
 position:readonly[number,number,number];
 rotationYDegrees:number;
 scale:readonly[number,number,number];
 collidersAdded:0;wholeMapAlignedCertified:false;
}>;
/** The explicit optical review gate remains unchanged and cannot authorize
 * a real source collider or any game collision / navigation / score. */
export function originalVisualRegistration(q:URLSearchParams):OriginalVisualPose|null{
 if(q.get('t21Play')!=='preview'||q.get('t21FullSource')!=='review'||
    q.get('t21F3Registration')!=='project'||
    q.getAll('t21F3Registration').length!==1||
    q.has('production')||q.has('scoreable')||q.has('t21QaInput')||
    q.has('t21B257')||q.has('t21B264')||q.has('t21B271'))return null;
 return modelToProjectVisualPose();
}
/** Genuine 4-mode SOURCE player: the same local pose can be used on an
 * already installed, individually verified LOCAL visual pack. Do not add
 * review query flags to the live URL (which would break native game/replay).
 * This permits no assets, KCC, FloorLine, collision or production authority.
 */
export function originalCanonicalSourceVisualRegistration(href:string):
 OriginalVisualPose|null{
 if(sourceCanonicalPlayableMode(href)===null)return null;
 return modelToProjectVisualPose();
}
function modelToProjectVisualPose():OriginalVisualPose{
 const {pdfToModelScale:k,rotationDegrees,translateX:x,translateZ:z}=audit.registration;
 if(!(k>0))throw Error('T21_F3_BAD_SOURCE_SCALE');
 const rad=rotationDegrees*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad);
 return {
  position:[(-c*x-s*z)/k,
   audit.projectNormalization.modelToProjectYOffset,(s*x-c*z)/k],
  rotationYDegrees:rotationDegrees,scale:[1/k,1,1/k],
  collidersAdded:0,wholeMapAlignedCertified:false};
}
export function applyOriginalVisualRegistration(e:Entity,p:OriginalVisualPose){
 e.setLocalScale(...p.scale);
 e.setLocalEulerAngles(0,p.rotationYDegrees,0);
 e.setLocalPosition(...p.position);
}
