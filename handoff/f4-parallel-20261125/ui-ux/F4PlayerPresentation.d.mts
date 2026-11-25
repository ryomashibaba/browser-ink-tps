import type {F4ProvisionalScore} from '../ink/F4ProvisionalTurf.mjs';
type ScoreView={kind:'HOLD'|'BUILDING'|'LIVE'|'FINAL';title:string;detail:string;a:number|null;b:number|null;neutral:number|null};
export function f4TurfPresentation(score:F4ProvisionalScore|null,phase:string,stopped?:boolean):ScoreView;
export function f4Urgency(seconds:number):'normal'|'soon'|'critical'|'unknown';
export function installF4PlayerPresentation(root:HTMLElement,finish:HTMLElement,ui:HTMLElement):{render(frame:{score:F4ProvisionalScore|null;matchState:string;paused:boolean;stopped:boolean;remainingSeconds:number;playerView:boolean}):void;dispose():void};
