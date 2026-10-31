/** B379 native source player weapon mobility: existing real weapon class,
 * actual pointer lock and true human life to already implemented Rapier KCC.
 * The game alone resolves movement, dodge costs and post-roll acceptance.
 */
type PhysicalInput={readonly fireHeld:boolean;readonly secondaryHeld:boolean;
 consumeSecondaryPressed():boolean;};
type PhysicalPlayer={setWeaponMoveMultiplier(v:number):void;
 requestWeaponDodge():boolean;};
type PhysicalWeaponRuntime={readonly currentPlayerWeapon:{readonly weaponClass:string};
 getMovementMultiplier(fire:boolean,secondary:boolean):number;};
export function applyB379NativePlayerWeaponMobility(input:{
 readonly input:PhysicalInput;readonly player:PhysicalPlayer;
 readonly weapons:PhysicalWeaponRuntime;readonly humanAlive:boolean;
 readonly realPointerLocked:boolean;readonly sourceRoundPhase:string;
 readonly stopped:boolean;
}):{readonly movementMultiplier:number;readonly realDodgeAccepted:boolean}{
 // Consume a queued right-click even during death/timeout; no stale dodge.
 const secondaryPress=input.input.consumeSecondaryPressed();
 const eligible=input.humanAlive&&input.realPointerLocked&&!input.stopped&&
  (input.sourceRoundPhase==='STAGING'||input.sourceRoundPhase==='PLAYING');
 const movementMultiplier=eligible?
  input.weapons.getMovementMultiplier(input.input.fireHeld,
   input.input.secondaryHeld):1;
 input.player.setWeaponMoveMultiplier(movementMultiplier);
 const realDodgeAccepted=Boolean(eligible&&secondaryPress&&
  input.weapons.currentPlayerWeapon.weaponClass==='DUALIES'&&
  input.player.requestWeaponDodge());
 return {movementMultiplier,realDodgeAccepted};
}
