/** T21 F4 adapter candidate, pure geometry only. NOT a paint or collision authority.
 * Integrate with the current Windows code after reviewing actual KCC trace semantics.
 * Each returned contact must come from a real, individually checked Rapier probe.
 * Never expand these point samples into unverified neighboring paint cells.
 */
export type Point = Readonly<{x:number;y:number;z:number}>;
export type Contact = Readonly<{point:Point; surfaceId:string; cellId:string}>;
export type Segment = Readonly<{from:Point;to:Point; continuousGrounded:boolean}>;
export type SupportProbe = (candidate:Point, segment:Segment)=>Contact|null;
const finite=(p:Point)=>[p.x,p.y,p.z].every(Number.isFinite);
/** Input segments must be actual KCC-accepted contact travel, not input intent,
 * a spawn-to-spawn line, or unverified frame-to-frame interpolation.
 * sampleStep is a candidate sampling resolution, not stamp radius.
 * probe must independently establish real backing, eligible cell, local clearance,
 * correct level, and weapon contact footprint. A miss remains a miss.
 */
export function collectContactCells(segments:readonly Segment[], halfWidth:number,
  sampleStep:number, probe:SupportProbe, maxSamples=4096):Contact[] {
  if(!Number.isFinite(halfWidth)||halfWidth<=0||!Number.isFinite(sampleStep)||sampleStep<=0||!Number.isSafeInteger(maxSamples)||maxSamples<1)throw new RangeError('invalid sweep dimensions');
  const out=new Map<string,Contact>();
  let samples=0;
  for(const s of segments){
    if(!s.continuousGrounded||!finite(s.from)||!finite(s.to))continue;
    const dx=s.to.x-s.from.x, dz=s.to.z-s.from.z, dy=s.to.y-s.from.y;
    const h=Math.hypot(dx,dz), len=Math.hypot(h,dy);
    if(h<=1e-9||!Number.isFinite(len))continue; // no stationary or purely vertical trail
    const n=Math.max(1,Math.ceil(len/sampleStep));
    const m=Math.max(1,Math.ceil(halfWidth/sampleStep));
    if((n+1)*(2*m+1)>maxSamples-samples)throw new RangeError('sweep sample budget exceeded');
    for(let i=0;i<=n;i++){
      const t=i/n;
      for(let j=-m;j<=m;j++){
        const lateral=halfWidth*j/m;
        const p={x:s.from.x+dx*t-dz/h*lateral,y:s.from.y+dy*t,z:s.from.z+dz*t+dx/h*lateral};
        samples++;
        const hit=probe(p,s);
        if(!hit||!finite(hit.point)||!hit.surfaceId||!hit.cellId)continue;
        out.set(JSON.stringify([hit.surfaceId,hit.cellId]),hit);
      }
    }
  }
  return [...out.values()];
}
/** Raw 720 ink parameters are fractions of a full tank. T21's tank uses percent.
 * This is not a movement speed conversion. Call only during a valid paid roll tick.
 */
export function inkPercentPerRollTick(speedRaw:number,minSpeedRaw:number,maxSpeedRaw:number,minFraction:number,maxFraction:number):number {
  if(![speedRaw,minSpeedRaw,maxSpeedRaw,minFraction,maxFraction].every(Number.isFinite)||minSpeedRaw<0||maxSpeedRaw<minSpeedRaw||minFraction<0||maxFraction<minFraction||maxFraction>1)throw new RangeError('invalid roll ink inputs');
  if(maxSpeedRaw===minSpeedRaw)return 100*maxFraction;
  const t=Math.max(0,Math.min(1,(speedRaw-minSpeedRaw)/(maxSpeedRaw-minSpeedRaw)));
  return 100*(minFraction+t*(maxFraction-minFraction));
}
/** One-based phase. Advance only on a successfully accepted swing. */
export function brushSwingPhase(acceptedSwingOrdinal:number):{yawSign:-1|1;nearestSplash:boolean}{
  if(!Number.isSafeInteger(acceptedSwingOrdinal)||acceptedSwingOrdinal<1)throw new RangeError('invalid swing ordinal');
  return {yawSign:acceptedSwingOrdinal%2===1?-1:1,nearestSplash:(acceptedSwingOrdinal-1)%6===1};
}
