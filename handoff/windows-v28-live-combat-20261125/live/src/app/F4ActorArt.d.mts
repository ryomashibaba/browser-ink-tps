import type {Entity,StandardMaterial} from 'playcanvas';
import type {WeaponId} from '../weapons/WeaponCatalog';
export function createF4ActorArt(parent:Entity, colors:Record<'SUIT'|'TEAM'|'VISOR'|'DARK'|'GEAR',StandardMaterial>, makeEntity:(name:string)=>Entity,showOwnInkTank?:boolean):{root:Entity;setWeapon(id:WeaponId):boolean;setStride(swing:number):void;setRecoil(value:number):void;setInk(ink:number,capacity:number):void;destroy():void};
