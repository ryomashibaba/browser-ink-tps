export interface F4Texture {volume:number;lowpassHz:number;}
export interface F4Voice {frequency:number;end:number;duration:number;volume:number;wave:OscillatorType;priority:number;pan?:number;texture?:F4Texture;key?:string;cooldown?:number;}
export function priorityFor(cue:string):number;
export function weaponTexture(kind:string):F4Texture;
export function voiceAdmission(active:number,priority:number):boolean;
export class F4AudioBus {constructor(makeContext:()=>AudioContext|null); unlock():AudioContext|null; setMuted(muted:boolean):void; reset():void; play(v:F4Voice):boolean;}
export function f4AudioBus(canvas:HTMLCanvasElement):F4AudioBus;
