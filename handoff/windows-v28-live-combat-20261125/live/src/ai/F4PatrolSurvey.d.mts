export interface F4SurveySurface{
 readonly cellSize:number;readonly widthCells:number;readonly heightCells:number;
 readonly widthMeters:number;readonly heightMeters:number;readonly baseFlags:number;
 readonly normal:{readonly y:number};readonly ownerGrid:ArrayLike<number>;readonly flagsGrid:ArrayLike<number>;
}
export class F4PatrolSurvey{
 clear(id:string):void;
 beginTick(tick:number):void;
 propose(id:string,tick:number,surface:F4SurveySurface,u:number,v:number,team:number,paintable:number,wall:number,neutral:number,recovering:boolean):{u:number;v:number;score:number}[];
}
