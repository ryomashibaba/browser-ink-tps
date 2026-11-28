import type {PaintSurface} from '../ink/PaintSurface';
export type F4FloorRadarDot={x:number;y:number;z:number;owner:1|-1};
export function f4FloorRadarSamples(surfaces:readonly PaintSurface[],human:readonly number[],half?:number,limit?:number):F4FloorRadarDot[];
export function f4FloorPaintEvidence(surfaces:readonly PaintSurface[]):{
 registeredTiles:number;ownedTiles:number;teamA:number;teamB:number;invalidOwned:number;
 rows:{id:string;center:number[];candidateCells:number;a:number;b:number;invalidOwned:number}[];
 candidateCellsAreNotScoreDenominator:true;officialCertification:false
};
