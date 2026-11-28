import type {F4ProvisionalScore} from '../ink/F4ProvisionalTurf.mjs';
type ScoreView={kind:'HOLD'|'BUILDING'|'LIVE'|'FINAL';title:string;detail:string;a:number|null;b:number|null;neutral:number|null};
export function f4TurfPresentation(score:F4ProvisionalScore|null,phase:string,stopped?:boolean):ScoreView;
export function f4Urgency(seconds:number):'normal'|'soon'|'critical'|'unknown';
export function installF4PlayerPresentation(root:HTMLElement,finish:HTMLElement,ui:HTMLElement):{render(frame:{score:F4ProvisionalScore|null;matchState:string;paused:boolean;stopped:boolean;remainingSeconds:number;playerView:boolean;roster?:F4Roster|null;teamColors?:{a:ArrayLike<number>;b:ArrayLike<number>}|null;kit?:F4Kit|null;matchSummary?:F4MatchSummary|null;pointerLockState?:string|null}):void;dispose():void};
export type F4MatchSummary={directHits:number;directSplats:number;deaths:number;respawns:number;changedCells:number};
export function f4MatchSummary(summary:F4MatchSummary|null):[string,number][]|null;

type F4Roster={sourceScoreable:number;officialWinner:string;naturalEnemyEncounterCertified:boolean;humanHp:number;rows:readonly {id:string;team:string;status:string;hp:number|null}[]};
type F4Kit={weapon:string;classLabel:string;sub:string;special:string;subCost?:number};
type F4Gauge={authorityComplete?:boolean;provisional?:boolean;required?:number;points?:number;executorReady?:boolean;ready?:boolean;active?:boolean};
export function f4RosterView(roster:F4Roster|null):{id:string;team:string;status:string;description:string}[]|null;
export function f4TeamColor(rgb:ArrayLike<number>|null|undefined):string|null;
export function f4KitPreview(kit:F4Kit|null):{name:string;category:string;sub:string;special:string}|null;
export function f4CombatCue(frame:{hp:number;ink:number;subCost?:number;special?:F4Gauge|null}):{threshold:number|null;lowInk:boolean;ready:boolean;lowHp:boolean};
