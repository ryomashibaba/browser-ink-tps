import type { Team } from '../../../ink/types';
import type { WeaponId } from '../../../weapons/WeaponCatalog';
import type { F4SpecialId } from './shared-special-score720.mjs';

type ActorTick = { roundId:string; tick:number; actorId:string; lifeId:string };
export type TornadoPulse = (age:number, radii:{damageRadiusMeters:number;paintRadiusMeters:number;
  damageStartRadiusMeters:number}) => {damageRadiusMeters:number;paintRadiusMeters:number;damageDue:boolean;
  damage:number;paintDue:boolean} | null;
export interface LaserPair {
  beamIds: readonly string[];
  damage(contact:{roundId:string;beamId:string;targetLifeId:string;tick:number;liveEnemy:true;beamOverlap:true}):number;
  finished(tick:number):boolean;
}
type Placement = {deviceId:string;physicalPlacementAccepted:true};
export interface WaveDevice {
  deviceId:string;
  fronts(tick:number,roundId:string):readonly {index:number;previousRadiusMeters:number;radiusMeters:number}[];
  destroy(tick:number):void;
  hit(contact:{tick:number;roundId:string;waveIndex:number;targetLifeId:string;
    liveEnemy:true;physicalWaveContact:true}):number;
  finished(tick:number):boolean;
}
export interface BarrierDevice {
  deviceId:string;
  ended:boolean;
  radius(tick:number,roundId:string):number;
  hit(contact:{tick:number;roundId:string;deviceId:string;eventId:string;sourceTeam:'A'|'B';
    damage:number;objectMultiplier:number;firstPhysicalHit:'field'|'device';enteringFromOutside:boolean}):unknown;
}
export interface SpecialPlan {
  config: Record<string,number|string>;
  ops: {
    launchVolley?(volley:{count:number;directDamage:number;blastDamage:number;
      orbitalOffsets(age:number,radius:number,speed:number):readonly (readonly [number,number])[]}):boolean;
    deploy?(placement:{tick:number;factory(request:Placement):WaveDevice|BarrierDevice}):boolean;
    launchGuide?(guide:{tornadoPulse:TornadoPulse}):boolean;
    launchPair?(pair:{tick:number;factory(request:{physicalLaunchAccepted:true}):LaserPair}):boolean;
    swing?(swing:{swingId:string}):boolean;
    consume?(id:string):boolean;
    physicalMode?():'ball'|'turret';
    changeMode?(event:{mode:'ball'|'turret'}):boolean;
    launch?(event:{damage?:number;radiusM?:number;kind?:'rapid'|'cannon';direct?:number;blast?:number}):boolean;
    launchThrow?(event:{direct:number;near:number;far:number}):boolean;
  };
  commit(): boolean;
  abort(): void;
  finish(reason:string,tick:number,details?:{actionUnlockTick?:number}|null): void;
}
type Begin = ActorTick & {team:Team.A|Team.B;special:F4SpecialId;input:{weapon:WeaponId}};
export class PhysicalSpecialPort720 {
  constructor(options:{roundId:string;host:{prepare(request:Begin):SpecialPlan|null}});
  begin(request:Begin):boolean;
  step(request:ActorTick & {input:Record<string,boolean>}):{ended:boolean};
  contact(request:ActorTick & (
    {swingId:string;targetLifeId:string;targetTeam:Team.A|Team.B;liveTarget:true;physicalContact:true;hitClass:'direct'}
    | {projectileId:string;sourceTeam:Team.A|Team.B;eligible:true;physicalContact:true;unoccluded:true;chargeValue:number}
    | {armorId:string;eventId:string;sourceTeam:Team.A|Team.B;damage:number;objectMultiplier:number;firstPhysicalHit:'armor'}
  )):unknown;
  closeSwing(request:Omit<ActorTick,'tick'> & {swingId:string}):boolean;
  cancel(request:ActorTick & {reason:string}):void;
  close(tick:number):void;
}
