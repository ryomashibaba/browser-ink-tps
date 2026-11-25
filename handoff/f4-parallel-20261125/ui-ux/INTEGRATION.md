# V28 UI/UX — independent F4 presentation
Base reviewed: research 0fbbebcf0a00cd8e4e4268f28533c235257138c8; Windows share 175e1a63f4825d28761e57eef9ca2b44aeccb6db; latest batch blob 4cdc430a48a7d00017b28e7fe210e9b82ee024d4. Apply latest batch first, not older patches.
Copy the updated F4PlayerPresentation.mjs and .d.mts into src/app/. Apply CompactF4Hud.ui.patch after the latest batch (only an import and read-only per-native-frame cue). No changes to score, player, input, session board, or replay authority. This replaces the first UI batch, not an additional installation.
Minimal App connection in UndertowF3PlayablePreviewApp.ts:
```ts
import {installF4PlayerPresentation} from './F4PlayerPresentation.mjs';
// class property:
private f4PlayerPresentation:ReturnType<typeof installF4PlayerPresentation>|null=null;
// immediately AFTER this.b58SessionBoard.render(state); in refresh():
const f4UiRoot=document.querySelector<HTMLElement>('#ui-root');
if(this.f4ProvisionalTurfEnabled&&f4UiRoot&&this.compactF4Hud){
 this.f4PlayerPresentation??=installF4PlayerPresentation(
  this.practiceHud.root,this.b58SessionBoard.finish,f4UiRoot);
 const f4Weapon=this.projectiles.currentPlayerWeapon;
 const f4Sub=subWeaponProfile(this.sourceWeaponKit(f4Weapon.id).sub);
 this.f4PlayerPresentation.render({
  roster:nativeB211Roster,
  teamColors:{a:GAME_CONFIG.visual.teamA,b:GAME_CONFIG.visual.teamB},
  kit:{weapon:f4Weapon.displayName,classLabel:f4Weapon.classLabel,
   sub:f4Sub.displayName,subCost:f4Sub.inkCost,special:f4SpecialName(f4Weapon.id)},
  score:this.ink.readF4ProvisionalTurf(),matchState:state.matchState,
  paused:state.paused,stopped:!!state.stopReason,remainingSeconds:state.timeRemainingSeconds,
  playerView:f4UiRoot.dataset.t21B245Presentation==='PLAYER'&&
   f4UiRoot.dataset.t21B245Inspect!=='true'&&this.canvas.dataset.t21B262QaFocus!=='ON'&&
   !this.survey.snapshot().active&&this.galleryIndex<0&&
   !new URLSearchParams(location.search).has('t21QaInput')
 });
}else if(this.f4PlayerPresentation){
 this.f4PlayerPresentation.dispose();this.f4PlayerPresentation=null;
}
```
If App has an actual dispose lifecycle, call this.f4PlayerPresentation?.dispose() there. Existing finish panel remains the pointer/input owner, existing replay and select listeners remain unchanged. UI reads typed provisional score, never parses text or infers winner. Result only after TIME_UP + actual existing FINISHED panel + FINAL authority; HOLD rather than invent. Team colors now read the existing GAME_CONFIG palette (the B302 opt-in diagnostic can override shader color; if intentionally enabled, pass actual active diagnostic palette or leave defaults). Roster uses the existing validated nativeB211Roster, including human and seven actual CPUs; invalid roster falls back to legacy UI. Live duplicate B205/B211/B286 panels are hidden via scoped CSS only while replacements are present. Native selection gate unchanged; kit details read actual selected weapon/sub/special, and original resume/replay buttons are reused. Existing official result datasets and source stats unchanged; three existing unscored headings are visually suppressed only while FINAL result panel is shown, with an explicit official certification disclaimer on final result. No change to other modes or QA.
Pure model: initial 20/20, extension 26/26 and final-mask guard 1/1 executed checks in JS tool runtime, source functions serialized directly from those executed functions. Run node F4PlayerPresentation.test.mjs beside module. The saved module also passed 18 DOM lifecycle checks using a minimal synthetic DOM (not Chromium), and both latest-batch HUD hunks plus the UI cue patch matched the Windows shared HUD source in order. Native TypeScript/Vite/Chromium/Windows visual and input acceptance pending. No claim of integration. Weapon selection remains actual pre-start select; no mid-match changes. No extra timers or listeners. Native cue hook reads the exact same kit/special snapshot already used by CompactF4Hud and never opens an action; marks sub ink cost and only highlights actually ready special. Score panel refreshes on existing full-state render cadence; no independent physics clock.
