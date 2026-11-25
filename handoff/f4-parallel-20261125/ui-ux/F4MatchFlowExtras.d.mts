import {installF4PlayerPresentation} from './F4PlayerPresentation.mjs';
type Base=ReturnType<typeof installF4PlayerPresentation>;
type Frame=Parameters<Base['render']>[0];
type Summary={directHits?:number;directSplats?:number;deaths?:number;respawns?:number;changedCells?:number};
export function f4PickerOptions(options:ArrayLike<{value:string;textContent:string|null;disabled:boolean}>|null|undefined):{id:string;category:string;name:string}[]|null;
export function f4CanPick(frame:Pick<Frame,'playerView'|'matchState'|'paused'|'stopped'>|null,gate:{menuState?:string;menuVisible:boolean;selectEnabled:boolean;pointerLocked:boolean}):boolean;
export function f4MatchStats(summary:Summary|null|undefined):{label:string;value:number}[];
export function installF4MatchFlowExtras(root:HTMLElement,finish:HTMLElement,ui:HTMLElement):{render(frame:Frame&{matchSummary?:Summary|null}):void;dispose():void};
