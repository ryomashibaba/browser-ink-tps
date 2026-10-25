/**
 * B177 native player input stop condition, derived ONLY from actual
 * original source KCC bodies. Never moves any actor or creates a route.
 */
export function b177OriginalKccHomeDecision({sourceUpperHome:h,realKccBody:p,
 realOriginalGrounded:grounded,trueNativeTicks:ticks}){
 const bad=reason=>({status:'UNSAFE',reason});
 if(!Array.isArray(h)||h.length!==3||!h.every(Number.isFinite)||
    !Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)||
    !Number.isSafeInteger(ticks)||ticks<0)
  return bad('INVALID_REAL_NATIVE_RAPIER_OBSERVATION');
 if(!grounded||p[1]<8.1||p[1]>9.6||Math.abs(p[1]-h[1])>.3)
  return bad('UNSUPPORTED_ORIGINAL_UPPER_RAPIER_FOOT');
 const dx=p[0]-h[0],dz=p[2]-h[2];
 if(Math.abs(dx)>1.2||dz<-.8||dz>4)
  return bad('ORIGINAL_UPPER_FOOT_OUTSIDE_SAFE_REAL_HOME');
 if(ticks>105)return bad('TRUE_KEY_W_NEVER_RECOVERED_GROUND');
 if(ticks<34)return {status:'CONTINUE',reason:'MINIMUM_KEY_DURATION'};
 const residual=Math.hypot(dx,dz);
 return residual<=.75?
  {status:'ARRIVED',actualRealKccResidualMeters:Number(residual.toFixed(3))}:
  {status:'CONTINUE',reason:'REAL_KEY_W_STILL_RETURNING'};
}
