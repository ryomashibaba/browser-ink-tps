type BoundSurface={center:{x:number;z:number};widthMeters:number;heightMeters:number};
export interface F4PaintHitIndex<S extends BoundSurface>{
 surfaces:readonly S[];length:number;bins:Map<string,S[]>;cell:number;
}
export function buildF4PaintHitIndex<S extends BoundSurface>(surfaces:readonly S[],tolerance:number):F4PaintHitIndex<S>|null;
export function queryF4PaintHitIndex<S extends BoundSurface>(index:F4PaintHitIndex<S>|null,surfaces:readonly S[],point:{x:number;y:number;z:number}):readonly S[];
