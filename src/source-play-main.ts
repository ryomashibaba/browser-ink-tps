import {readSourceCameraPreferences,writeSourceCameraPreferences,
 type SourceCameraPreferences} from './camera/SourceCameraPreferences';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl} from './app/SourcePlayPortal';
import {WEAPON_ORDER,WEAPON_PROFILES,DEFAULT_WEAPON_ID,
 type WeaponId} from './weapons/WeaponCatalog';
const circuit=document.querySelector<HTMLAnchorElement>('#play-circuit');
const combat=document.querySelector<HTMLAnchorElement>('#play-combat');
const coop=document.querySelector<HTMLAnchorElement>('#play-coop');
const front=document.querySelector<HTMLAnchorElement>('#play-combat-frontline');
const status=document.querySelector<HTMLElement>('#portal-status');
const weaponChoice=document.querySelector<HTMLSelectElement>('#source-weapon-preselect');
if(!circuit||!combat||!coop||!front||!status||!weaponChoice)
 throw Error('T21_SOURCE_PORTAL_REQUIRED_UI_MISSING');
try{
 const targets=sourcePlayPortalDestinations(window.location.href);
 // Use only the 12 real B378/B389 native weapons. The existing SOURCE
 // READY selector remains available; this is a one-click preselection.
 // Never inherit user-supplied QA, scoring or production URL flags.
 weaponChoice.replaceChildren();
 for(const id of WEAPON_ORDER){
  const option=document.createElement('option');
  option.value=id;
  const profile=WEAPON_PROFILES[id];
  option.textContent=profile.classLabel+' · '+profile.displayName;
  weaponChoice.appendChild(option);
 }
 const updateStartWeapon=()=>{
  const choice=WEAPON_ORDER.includes(weaponChoice.value as WeaponId)?
   weaponChoice.value as WeaponId:DEFAULT_WEAPON_ID;
  weaponChoice.value=choice;
  const launch=new URL(targets.circuit);
  if(choice!==DEFAULT_WEAPON_ID)
   launch.searchParams.set('t21W10B389',choice);
  // Native B389 validates the real 12-weapon ID again in STAGING.
  // Only this sanitized circuit URL is changed; CPU modes are untouched.
  if(launch.origin!==window.location.origin||
     launch.pathname!==new URL(targets.circuit).pathname||
     launch.searchParams.has('production')||
     launch.searchParams.has('scoreable')||
     launch.searchParams.has('t21QaInput'))
   throw Error('T21_SOURCE_WEAPON_PRESET_UNSAFE_TARGET');
  circuit.href=launch.href;
  circuit.dataset.t21SourceInitialWeapon=choice;
  circuit.dataset.t21SourceWeaponScoreable='0';
 };
 weaponChoice.value=DEFAULT_WEAPON_ID;
 weaponChoice.addEventListener('change',updateStartWeapon);
 updateStartWeapon();
 combat.href=targets.combat;
 coop.href=targets.coop;
 front.href=sourcePlayFrontlineResearchUrl(window.location.href);
 circuit.dataset.sourceAuthority='25/17/26/0';
 combat.dataset.sourceAuthority='25/17/26/0';
 coop.dataset.sourceAuthority='25/17/26/0';
 front.dataset.sourceAuthority='25/17/26/0';
 circuit.dataset.officialWinner='NONE';
 combat.dataset.officialWinner='NONE';
 coop.dataset.officialWinner='NONE';
 front.dataset.officialWinner='NONE';
 front.dataset.originalOpponentRouteCertified='false';
 circuit.dataset.productionAuthorized='false';
 combat.dataset.productionAuthorized='false';
 coop.dataset.productionAuthorized='false';
 front.dataset.productionAuthorized='false';
 status.dataset.t21PortalReady='SOURCE_ONLY';
}catch(error){
 circuit.removeAttribute('href');combat.removeAttribute('href');
 coop.removeAttribute('href');front.removeAttribute('href');
 status.textContent='安全なSOURCE起動URLを確認できません。';
 status.dataset.t21PortalReady='HOLD';
 console.error(error);
}

/** Real SOURCE-only pre-match camera controls. Uses the same bounded local
 * preference contract loaded by ThirdPersonCamera at the next game boot.
 * Never touches simulation, actor movement, scoring, production or URL flags.
 */
const cameraSensitivity=document.querySelector<HTMLSelectElement>('#source-camera-sensitivity');
const cameraInvert=document.querySelector<HTMLInputElement>('#source-camera-invert');
const cameraShoulder=document.querySelector<HTMLSelectElement>('#source-camera-shoulder');
const cameraReset=document.querySelector<HTMLButtonElement>('#source-camera-reset');
const cameraNotice=document.querySelector<HTMLElement>('#source-camera-message');
if(!cameraSensitivity||!cameraInvert||!cameraShoulder||!cameraReset||!cameraNotice)
 throw Error('T21_SOURCE_CAMERA_SETUP_REQUIRED_UI_MISSING');
const cameraDefaults:SourceCameraPreferences={
 version:1,sensitivity:1,invertY:false,shoulder:'RIGHT'
};
let cameraStore:Storage|null=null;
try{cameraStore=window.localStorage;}catch{/* Private storage can be blocked. */}
let cameraSaved=cameraStore?readSourceCameraPreferences(cameraStore):null;
const showCamera=(p:SourceCameraPreferences)=>{
 cameraSensitivity.value=String(p.sensitivity);
 cameraInvert.checked=p.invertY;
 cameraShoulder.value=p.shoulder;
};
showCamera(cameraSaved??cameraDefaults);
const saveCamera=()=>{
 const candidate:SourceCameraPreferences={
  version:1,sensitivity:Number(cameraSensitivity.value),
  invertY:cameraInvert.checked,
  shoulder:cameraShoulder.value as SourceCameraPreferences['shoulder']
 };
 if(cameraStore&&writeSourceCameraPreferences(cameraStore,candidate)){
  cameraSaved=candidate;
  cameraNotice.textContent='カメラ設定をこのブラウザに保存しました。次のSOURCE試合で適用されます。';
 }else{
  showCamera(cameraSaved??cameraDefaults);
  cameraNotice.textContent='ブラウザに保存できません。ゲーム中の [ / ]、I、Q キーで調整してください。';
 }
};
cameraSensitivity.addEventListener('change',saveCamera);
cameraInvert.addEventListener('change',saveCamera);
cameraShoulder.addEventListener('change',saveCamera);
cameraReset.addEventListener('click',()=>{showCamera(cameraDefaults);saveCamera();});
