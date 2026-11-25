# V28 UI/UX — independent F4 presentation
Base reviewed: research 7e10c7bc989f00715ba1e943c2ef717612af8e99; Windows share 175e1a63f4825d28761e57eef9ca2b44aeccb6db; latest batch blob 4cdc430a48a7d00017b28e7fe210e9b82ee024d4. Apply latest batch first, not older patches.
Copy F4PlayerPresentation.mjs and .d.mts into src/app/. No changes to CompactF4Hud, score, player, input, session board, or replay authority.
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
 this.f4PlayerPresentation.render({
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
If App has an actual dispose lifecycle, call this.f4PlayerPresentation?.dispose() there. Existing finish panel remains the pointer/input owner, existing replay and select listeners remain unchanged. UI reads typed provisional score, never parses text or infers winner. Result only after TIME_UP + actual existing FINISHED panel + FINAL authority; HOLD rather than invent. Cyan/orange are presentation-only labels A/B (not calibrated team ink). Existing official result datasets and source stats unchanged; three existing unscored headings are visually suppressed only while provisional result panel is shown, with an explicit official certification disclaimer on final result. No change to other modes or QA.
Pure model: 20/20 executed checks in JS tool runtime, source functions serialized directly from those executed functions. Run node F4PlayerPresentation.test.mjs beside module. Native TypeScript/Vite/browser DOM/Windows visual and input acceptance pending. No claim of integration. Weapon selection remains actual pre-start select; no mid-match changes. No extra timers or listeners. Score panel refreshes on existing full-state render cadence; no independent physics clock.
