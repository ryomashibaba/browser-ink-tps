// Provisional human input and steering policy. No physics or ink authority.
export function f4MouseHeldAfterMask(held,buttons,bit){
  return held && (!Number.isSafeInteger(buttons) || buttons<0 || (buttons&bit)!==0);
}

export function f4KeepRollIntent(desired,armedDirection){
  const a=Math.hypot(desired.x,desired.z),b=Math.hypot(armedDirection.x,armedDirection.z);
  return a>=0.5 && b>1e-6 &&
    (desired.x*armedDirection.x+desired.z*armedDirection.z)>=0.5*a*b;
}

export function f4AirborneSquidSpeed(humanSpeed,ownSpeed,vx,vz){
  return Math.max(humanSpeed,Math.min(ownSpeed,Math.hypot(vx,vz)));
}
