// Provisional geometry safety. No collider writes.
export function f4MeshBottom(original,retained){
  let min=Infinity;
  for(const vertices of [original,retained]){
    if(vertices.length%9!==0)throw Error('F4_INVALID_TRIANGLE_BUFFER');
    for(let i=0;i<vertices.length;i++){
      const v=vertices[i];
      if(!Number.isFinite(v))throw Error('F4_NONFINITE_STAGE_VERTEX');
      if(i%3===1&&v<min)min=v;
    }
  }
  if(!Number.isFinite(min))throw Error('F4_EMPTY_STAGE_GEOMETRY');
  return min;
}

export function f4BelowInstalledGeometry(bottom,actorTop,grounded){
  return !grounded&&Number.isFinite(bottom)&&Number.isFinite(actorTop)&&actorTop<bottom-0.25;
}

export function f4WalkableSupportNormal(normalY,maxSlopeRadians){
  return Number.isFinite(normalY)&&Number.isFinite(maxSlopeRadians)&&normalY>=Math.cos(maxSlopeRadians)-1e-6;
}
