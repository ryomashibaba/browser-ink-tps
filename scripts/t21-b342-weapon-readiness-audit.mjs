#!/usr/bin/env node
/** B342 source inventory only: never certifies playable original weapon parity. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=load('src/weapons/WeaponCatalog.ts');
const playerFire=load('src/projectile/ProjectileSystem.ts');
const cpu=load('src/ai/CpuAgentSystem.ts');
const classes=['SHOOTER','DUALIES','CHARGER','BLASTER','ROLLER','BRUSH',
 'SLOSHER','SPLATLING','BRELLA','STRINGER','SPLATANA'];
function requireSource(ok,key){if(!ok)throw Error('B342_WEAPON_SOURCE_'+key);}
requireSource(classes.every(c=>catalog.includes("weaponClass: '"+c+"'")),
 'ALL_ELEVEN_MAIN_FAMILIES_IN_CATALOG');
requireSource(classes.every(c=>playerFire.includes("case '"+c+"':")),
 'ALL_ELEVEN_MAIN_PLAYER_DISPATCH');
for(const fn of ['updateShooter','updateRoller','updateCharger',
 'fireChargerRay','fireProjectiles','rollerFlick'])
 requireSource(playerFire.includes('private '+fn+'('),'MISSING_'+fn);
requireSource(playerFire.includes('VERTICAL_FLICK')&&
 playerFire.includes('HORIZONTAL_FLICK'),'ROLLER_DUAL_FLICK');
const shotStart=playerFire.indexOf('  private fireProjectiles(');
const shotEnd=playerFire.indexOf('  private spawnQueuedCpuShots(',shotStart);
requireSource(shotStart>=0&&shotEnd>shotStart,'SHOT_METHOD_RANGE');
const shotBlock=playerFire.slice(shotStart,shotEnd);
const inkIndex=shotBlock.indexOf('this.resources.tryConsumeShotInk(');
const poolIndex=shotBlock.indexOf('const slot = this.slots.find(');
requireSource(inkIndex>=0&&poolIndex>inkIndex,
 'POOL_INK_ORDER_DRIFT_REQUIRES_MANUAL_REAUDIT');
const start=cpu.indexOf('const canTurfPaint =');
const end=cpu.indexOf('const cooldown =',start);
requireSource(start>=0&&end>start,'SOURCE_CPU_ELIGIBILITY');
const sourceTurf=cpu.slice(start,end);
const allowed=classes.filter(c=>sourceTurf.includes("profile.weaponClass === '"+c+"'"));
requireSource([...allowed].sort().join(',')===
 ['SHOOTER','DUALIES','CHARGER','BLASTER','SLOSHER','SPLATLING'].sort().join(','),
 'SOURCE_CPU_SIX_FAMILIES_DRIFT_REAUDIT');
const hazards=[
 {id:'B342-W1',kind:'SHOOTER',evidence:'Both current base shooter profiles inherit BASE spreadDegrees=0; real moving/airborne aiming and repaint accuracy unverified.'},
 {id:'B342-W2',kind:'ROLLER',evidence:'Ground/air horizontal-vertical flick and roll actions are present; no independent original timing/shape/impact certification.'},
 {id:'B342-W3',kind:'CHARGER',evidence:'Charge-and-release ray present; original charge/range/damage/paint calibration not established.'},
 {id:'B342-W4',kind:'RESOURCE',evidence:'Generic fireProjectiles consumes human ink before checking whether any projectile slot can be allocated. Pool-exhaustion conservation requires a real negative test.'},
 {id:'B342-W5',kind:'CPU',evidence:'Original-source CPU turf eligibility is limited to six of eleven weapon families; 11 declared IDs do not certify 11-class source turf gameplay.'},
 {id:'B342-W6',kind:'ART',evidence:'No independent authentic 3D view/model/recoil/audio/impact side-by-side proof. ART remains HOLD.'}
];
export function b342WeaponSourceReadiness(){
 return {schema:'B342_MAIN_WEAPON_SOURCE_READINESS_V1',
  sourceOnly:true,modelledClasses:classes,modeledProjectWeaponCount:12,
  nativeCpuTurfFamilies:allowed,mainVerticalSliceOrder:['SHOOTER','ROLLER','CHARGER'],
  evidenceHazards:hazards,sourceTestsNotActualBrowserWeaponParity:true,
  noSyntheticHitsOrInk:true,originalSolidsWritten:0,
  originalPaintSurfacesWritten:0,originalNavLinksWritten:0,
  scoreablePromotions:0,originalOpponentRoutesCertified:'0/12',
  perfectOriginalWeaponCertified:false,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false,
  verdict:'STRUCTURE_PRESENT_ORIGINAL_MECHANICS_AND_ART_HOLD'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 requireSource(typeof process.argv[2]==='string'&&process.argv[2].length>0,'OUTPUT_REQUIRED');
 const result=b342WeaponSourceReadiness();
 writeFileSync(resolve(process.argv[2]),JSON.stringify(result,null,2)+'\n');
 console.log('B342_MAIN_WEAPON_READINESS',JSON.stringify(result));
}
