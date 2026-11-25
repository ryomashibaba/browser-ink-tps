/** B379 native source player weapon mobility: existing real weapon class,
 * actual pointer lock and true human life to already implemented Rapier KCC.
 * The game alone resolves movement, dodge costs and post-roll acceptance.
 */
type PhysicalInput={readonly fireHeld:boolean;readonly secondaryHeld:boolean;
 consumeSecondaryPressed():boolean;};
type PhysicalPlayer={setWeaponMoveMultiplier(v:number):void;
 requestWeaponDodge(payInk?:()=>boolean):boolean;};
type PhysicalWeaponRuntime={readonly currentPlayerWeapon:{readonly weaponClass:string};
 getMovementMultiplier(fire:boolean,secondary:boolean):number;};
export function applyB379NativePlayerWeaponMobility(input:{
 readonly input:PhysicalInput;readonly player:PhysicalPlayer;
 readonly weapons:PhysicalWeaponRuntime;readonly humanAlive:boolean;
 readonly realPointerLocked:boolean;readonly sourceRoundPhase:string;
 readonly stopped:boolean;
 /** Only the user-selected genuine 180-second original SOURCE round. */
 readonly canonicalSourceRound?:boolean;
 readonly payTwinCometsDodgeInk?:()=>boolean;
}):{readonly movementMultiplier:number;readonly realDodgeAccepted:boolean;
 readonly realBrellaGuardTap:boolean}{
 // Consume a queued right-click even during death/timeout; no stale dodge.
 const secondaryPress=input.input.consumeSecondaryPressed();
 const eligible=input.humanAlive&&input.realPointerLocked&&!input.stopped&&
  (input.sourceRoundPhase==='STAGING'||input.sourceRoundPhase==='PLAYING');
 // A physical right-click can start AND finish between two 60Hz
 // ticks. B379 already consumes that edge for DUALIES, so the actual
 // BRELLA shield otherwise never sees a sub-frame tap. Respect one
 // native tick ONLY in genuine SOURCE, without synthesizing a hold,
 // carrying input across pause/splat, or changing frozen T20/QA.
 const realBrellaGuardTap=Boolean(
  eligible&&input.canonicalSourceRound&&secondaryPress&&
  !input.input.secondaryHeld&&
  input.weapons.currentPlayerWeapon.weaponClass==='BRELLA');
 const movementMultiplier=eligible?
  input.weapons.getMovementMultiplier(input.input.fireHeld,
   input.input.secondaryHeld||realBrellaGuardTap):1;
 input.player.setWeaponMoveMultiplier(movementMultiplier);
 const realDodgeAccepted=Boolean(eligible&&secondaryPress&&
  input.weapons.currentPlayerWeapon.weaponClass==='DUALIES'&&
  (!input.payTwinCometsDodgeInk||input.sourceRoundPhase==='PLAYING')&&
  input.player.requestWeaponDodge(input.payTwinCometsDodgeInk));
 return {movementMultiplier,realDodgeAccepted,realBrellaGuardTap};
}
