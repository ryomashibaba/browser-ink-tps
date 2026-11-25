# Optional match-flow UI (additive to existing UI package)
Reviewed research HEAD d2aff25b6889a4f276d93937bf6d90ff07d6ab3a; chief partial 01 patch blob 40832b8e741b058c4a1b19827dc6c48b547ea96a, manifest excludes UI. Windows share 175e1a63f4825d28761e57eef9ca2b44aeccb6db.
Keep original F4PlayerPresentation.mjs/.d.mts and CompactF4Hud.ui.patch unchanged. Copy F4MatchFlowExtras.mjs/.d.mts into src/app alongside them. In previous INTEGRATION.md connection, change only the import to:
```ts
import {installF4MatchFlowExtras as installF4PlayerPresentation} from './F4MatchFlowExtras.mjs';
```
Add to the existing render frame (no additional App lifecycle or callback):
```ts
matchSummary:state.matchState==='TIME_UP'?{
 directHits:state.humanCpuDirectHits,
 directSplats:state.humanCpuDirectSplats,
 deaths:state.humanSplats,
 respawns:state.humanRespawns,
 changedCells:state.b23HumanInkFeedback.humanChangedCells
}:null,
```
All fields found in Windows App snapshot and existing B59 recap; no inference of total kill count/score. If not passing summary, cards still work. Picker uses actual 12 native select options, existing select listener and B378 authority, no direct weapon setter. Guard pregame STAGING + paused + visible READY_TO_START + enabled select + no pointer lock. Retains native select and existing actions; no automatic start/replay. Data missing => hide affected cards/stat pairs, not zero. New code only in ui-ux folder. 21/21 pure tests executed (including malformed option guard). Previous saved version also passed 15/15 minimal simulated DOM checks with native select acceptance/rejection, mid-round/lock guards, final stats and disposal. Native Chromium/TS/Vite/Windows remain pending. 
