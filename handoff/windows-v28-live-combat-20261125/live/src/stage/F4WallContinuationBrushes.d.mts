import type {PaintSurface} from '../ink/PaintSurface';
import type {PaintRasterRun} from '../ink/GameplayInkSystem';
import type {PaintEvent} from '../ink/types';
export function f4WallContinuationBrushes(source:PaintSurface,neighbors:readonly PaintSurface[],event:Pick<PaintEvent,'centerU'|'centerV'|'radiusU'|'radiusV'|'angle'>,runs:readonly PaintRasterRun[],backed:(surface:PaintSurface,x:number,y:number)=>boolean):{surfaceId:string;centerU:number;centerV:number}[];
