/** B330: REAL button arm gate for BOTH independent original 180s rounds.
 * A fresh world starts in STAGING, but playB162GenuineAllySync is entered
 * only AFTER actual native PLAYING and 7/7 physically rejoined. The mission
 * is armed while the real PLAYING round is paused. A center click is never
 * a replacement for the actual visible Resume control. */
export function b330AuditArmedReplayResume(input){
 const i=input??{};
 const genuine=[1,2].includes(i.coopAttempt)&&
  i.matchState==='PLAYING'&&i.practiceStatus==='ARMED'&&
  i.practiceVariant==='ALLY_SYNC'&&i.paused===true&&
  i.stopReason===null&&i.sourceAuthority==='25/17/26/0'&&
  i.originalCpuFootRelocations===0&&
  i.overlayState==='NATIVE_PAUSED'&&i.overlayVisible===true&&
  i.productionAuthorized===false&&i.officialWinner==='NONE';
 return {schema:'B330_REAL_ARMED_REPLAY_RESUME',source:'25/17/26/0',
  coopAttempt:i.coopAttempt??null,
  allowRealButtonClick:genuine,
  requiresVisibleResumeButton:true,
  realCDPInputNotYetProven:true,
  originalCpuPathCertified:false,original4v4Certified:false,
  productionAuthorized:false};
}
