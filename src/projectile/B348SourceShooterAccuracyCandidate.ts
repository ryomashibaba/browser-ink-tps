/**
 * B348 experimental source-only reference-inspired shooter accuracy
 * candidate. Splatoon 3 Splattershot third-party reference (not official
 * game data): approximate ground 4.86°, airborne 11.66° deviation limit.
 * Initial-shot compensation here is an INDEPENDENT project hypothesis,
 * NOT the original Nintendo probability model.
 * This module computes angles only; it never creates ink, shots or ticks.
 */
export const B348_REFERENCE_LIMITS=Object.freeze({
 groundDegrees:4.86,airborneDegrees:11.66
});
export interface B348AngleSample{
 readonly yawDegrees:number;readonly pitchDegrees:number;
 readonly maxCandidateDegrees:number;
 readonly shotOrdinal:number;readonly grounded:boolean;
 readonly hypothesisOnly:true;
}
function hashedUnit32(ordinal:number,salt:number):number{
 let x=Math.imul(ordinal^salt,0x45d9f3b);
 x=Math.imul((x^(x>>>16)),0x45d9f3b);
 return ((x^(x>>>16))>>>0)/4294967296;
}
export function b348CandidateShooterAngles(
 shotOrdinal:number,grounded:boolean):B348AngleSample{
 if(!Number.isSafeInteger(shotOrdinal)||shotOrdinal<1||
  typeof grounded!=='boolean')
   throw Error('B348_INVALID_NATIVE_SHOT_ORDINAL');
 const max=grounded?B348_REFERENCE_LIMITS.groundDegrees:
  B348_REFERENCE_LIMITS.airborneDegrees;
 // Prototype ONLY: precise first shot, then gradual physical angular
 // error under held fire. Do not describe this as Nintendo's true RNG.
 const maturity=Math.min(1,(shotOrdinal-1)/8);
 const radius=max*maturity*Math.sqrt(
  hashedUnit32(shotOrdinal,0x172c66a7));
 const theta=2*Math.PI*hashedUnit32(shotOrdinal,0x5a49b001);
 const yawDegrees=radius*Math.cos(theta);
 const pitchDegrees=radius*Math.sin(theta);
 return {yawDegrees,pitchDegrees,maxCandidateDegrees:max,
  shotOrdinal,grounded,hypothesisOnly:true};
}
