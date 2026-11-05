import {sourcePlayPortalDestinations} from './app/SourcePlayPortal';
const circuit=document.querySelector<HTMLAnchorElement>('#play-circuit');
const combat=document.querySelector<HTMLAnchorElement>('#play-combat');
const coop=document.querySelector<HTMLAnchorElement>('#play-coop');
const status=document.querySelector<HTMLElement>('#portal-status');
if(!circuit||!combat||!coop||!status)
 throw Error('T21_SOURCE_PORTAL_REQUIRED_UI_MISSING');
try{
 const targets=sourcePlayPortalDestinations(window.location.href);
 circuit.href=targets.circuit;
 combat.href=targets.combat;
 coop.href=targets.coop;
 circuit.dataset.sourceAuthority='25/17/26/0';
 combat.dataset.sourceAuthority='25/17/26/0';
 coop.dataset.sourceAuthority='25/17/26/0';
 circuit.dataset.officialWinner='NONE';
 combat.dataset.officialWinner='NONE';
 coop.dataset.officialWinner='NONE';
 circuit.dataset.productionAuthorized='false';
 combat.dataset.productionAuthorized='false';
 coop.dataset.productionAuthorized='false';
 status.dataset.t21PortalReady='SOURCE_ONLY';
}catch(error){
 circuit.removeAttribute('href');combat.removeAttribute('href');
 coop.removeAttribute('href');
 status.textContent='安全なSOURCE起動URLを確認できません。';
 status.dataset.t21PortalReady='HOLD';
 console.error(error);
}
