export interface F4ConcreteWallTile {axis:3;plane:number;planeKey:string;normal:readonly number[];uAxis:readonly number[];vAxis:readonly number[];minU:number;minV:number;width:number;height:number;mask:Uint8Array;positions:number[];cells:number;lowest:number}
export function extractF4ConcreteWallTiles(vertices:Float32Array|number[],limit?:number):F4ConcreteWallTile[];
