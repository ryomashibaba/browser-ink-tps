export interface F4ConcreteWallTile {axis:0|2;plane:number;minU:number;minV:number;width:number;height:number;mask:Uint8Array;positions:number[];cells:number;lowest:number}
export function extractF4ConcreteWallTiles(vertices:Float32Array|number[],limit?:number):F4ConcreteWallTile[];
