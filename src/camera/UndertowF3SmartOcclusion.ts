/**
 * W10-B26 — visual camera-only occlusion choice for source preview.
 * A candidate is accepted only when the real certified Rapier camera
 * ray reaches much farther than the current one. No stage/world writes.
 * Uses real render dt, not 60Hz synthetic simulation clock.
 */
export type SourceShoulder='LEFT'|'RIGHT';
export interface SourceOcclusionSample{
 currentClearMeters:number;alternateClearMeters:number;
 desiredMeters:number;realDeltaSeconds:number;
}
export class UndertowF3SmartOcclusion{
 private candidateSeconds=0;
 private recoveryCooldown=0;
 private manualOverrideSeconds=0;
 private lastSelected:SourceShoulder='RIGHT';
 private automaticSwitchCount=0;
 private comparisons=0;
 private lastCandidateAdvantageMeters=0;
 /** Source camera ray lengths are clamped by its existing Rapier query. */
 public observe(sample:SourceOcclusionSample,side:SourceShoulder):SourceShoulder{
  const {currentClearMeters:current,alternateClearMeters:alternate,
   desiredMeters:desired,realDeltaSeconds:rawDt}=sample;
  if(![current,alternate,desired,rawDt].every(Number.isFinite)||
     current<0||alternate<0||desired<0||rawDt<0){
   this.candidateSeconds=0;return side;
  }
  const dt=Math.min(.1,rawDt);
  this.recoveryCooldown=Math.max(0,this.recoveryCooldown-dt);
  this.manualOverrideSeconds=Math.max(0,this.manualOverrideSeconds-dt);
  this.comparisons++;
  const advantage=alternate-current;
  this.lastCandidateAdvantageMeters=Number(advantage.toFixed(3));
  // A corridor genuinely must block the original camera side by at least
  // 1.0m relative to target distance. No switch for tiny/intermittent rays.
  if(this.manualOverrideSeconds>0||this.recoveryCooldown>0||
     !(desired-current>1.0&&advantage>=1.35&&alternate>=3.3)){
   this.candidateSeconds=0;return side;
  }
  this.candidateSeconds+=dt;
  if(this.candidateSeconds<.22)return side;
  this.candidateSeconds=0;
  this.recoveryCooldown=2.5;
  this.lastSelected=side==='RIGHT'?'LEFT':'RIGHT';
  this.automaticSwitchCount++;
  return this.lastSelected;
 }
 public manual(side:SourceShoulder){
  this.lastSelected=side;
  this.candidateSeconds=0;
  this.manualOverrideSeconds=8;
  this.recoveryCooldown=2.5;
 }
 public resetCandidate(){this.candidateSeconds=0;}
 public mayProbe(realDeltaSeconds:number){
  return this.manualOverrideSeconds<=0&&this.recoveryCooldown<=0&&
   Number.isFinite(realDeltaSeconds)&&realDeltaSeconds>0;
 }
 public snapshot(){
  return {sourcePreviewOnly:true as const,
   geometryAuthority:'EXISTING_RAPIER_STAGE_CAMERA_COLLIDERS_ONLY' as const,
   automaticSwitchCount:this.automaticSwitchCount,
   alternateRaysCompared:this.comparisons,
   lastCandidateAdvantageMeters:this.lastCandidateAdvantageMeters,
   lastSelected:this.lastSelected,
   manualOverrideSeconds:Number(this.manualOverrideSeconds.toFixed(2)),
   cooldownSeconds:Number(this.recoveryCooldown.toFixed(2)),
   gameplayGeometryModified:false as const,
   physicsCameraBypass:false as const,
   productionAuthorized:false as const};
 }
}
