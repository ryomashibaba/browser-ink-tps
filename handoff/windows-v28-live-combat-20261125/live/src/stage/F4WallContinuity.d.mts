import type {F4ConcreteWallTile} from './F4ConcreteWallTiles.mjs';
export function f4SharedWallSeam(a:F4ConcreteWallTile,b:F4ConcreteWallTile,minRun?:number):boolean;
export function selectF4ConnectedWallTiles<T extends F4ConcreteWallTile>(rows:readonly T[],isSeed:(row:T)=>boolean,prepare:(row:T)=>T|null,limit?:number):T[];
export function f4CarryCrestMomentum(gap:number,normalY:number|undefined,verticalSpeed:number,toward:number,gravity:number,clear:boolean):boolean;
