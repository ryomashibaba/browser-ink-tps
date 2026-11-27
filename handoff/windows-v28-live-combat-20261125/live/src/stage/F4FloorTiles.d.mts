export interface F4FloorTile {id:string;normal:number[];u:number[];v:number[];offset:number;minU:number;minV:number;width:number;height:number;mask:Uint8Array;positions:number[];cells:number}
export function extractF4FloorTiles(vertices:Float32Array|number[],maxSlopeRadians:number):F4FloorTile[];
