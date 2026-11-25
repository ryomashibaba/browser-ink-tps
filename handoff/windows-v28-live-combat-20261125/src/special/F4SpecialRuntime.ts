import { BLEND_NORMAL, CULLFACE_NONE, Color, Entity, Mesh, MeshInstance, StandardMaterial, TorusGeometry, Vec3, type AppBase } from 'playcanvas';
import { Team } from '../ink/types';
import { crabProjectileDamage } from './f4/crab-barrier720-20261125/crab-barrier720.mjs';
import type { F4SpecialFlight, ProjectileSystem } from '../projectile/ProjectileSystem';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import type { WeaponId } from '../weapons/WeaponCatalog';
import { CertifiedTurf720, KIT720, type F4SpecialId } from './f4/shared-special-score720-20261125/shared-special-score720.mjs';
import { PhysicalSpecialPort720, type SpecialPlan, type LaserPair, type TornadoPulse, type WaveDevice, type BarrierDevice } from './f4/shared-special-score720-20261125/physical-special-port720.mjs';

const HUMAN = 'human';

type Actor = { actorId: string; lifeId: string; team: Team.A|Team.B; weapon: WeaponId };
type Input = {
  origin: Vec3; forward: Vec3; foot: Vec3; trigger: boolean; holdThrow: boolean; cannon: boolean;
  releaseThrow: boolean; airborne: boolean;
};
type Effect = { step(tick: number): boolean; dispose(): void };
type ObjectContact = { distance:number; damage(hp:number):void };
type DeviceQuery = (from:Vec3,to:Vec3,team:Team.A|Team.B) => ObjectContact|null;
type SuctionQuery = (from:Vec3,to:Vec3,shot:{
  id:string;team:Team.A|Team.B;damage:number;consume():boolean;
})=>{distance:number;accept():boolean}|null;

// These dimensions and travel parameters are for the local F4 execution
// probe. No complete turf mask or calibrated gauge has been admitted.
export class F4SpecialRuntime {
  private round = 1;
  private port = this.newPort();
  private turf = new CertifiedTurf720({roundId:this.roundId});
  private readonly effects: Effect[] = [];
  private readonly devices = new Set<DeviceQuery>();
  private deviceSequence = 0;
  private deviceHitSequence = 0;
  private readonly suctionQueries = new Set<SuctionQuery>();
  private readonly actorUnlock = new Map<string,number>();
  private readonly livePose = new Map<string,()=>void>();
  private absorbed = 0;
  private waves = 0;
  private readonly active = new Map<string,string>();
  private readonly completedProbeLives = new Set<string>();
  private input: Input|null = null;
  private paintCells = 0;
  private launches = 0;
  private anchors = 0;
  private sweptHpLoss = 0;
  private special: F4SpecialId|null = null;
  private terminal: string|null = null;
  private score: ReturnType<CertifiedTurf720['result']>|null = null;
  private readonly visualMaterials = new Map<Team.A|Team.B,StandardMaterial>();
  private ringMesh?: Mesh;
  private barrierShellMesh?: Mesh;
  private readonly barrierMaterials = new Map<Team.A|Team.B,StandardMaterial>();
  private frame = 0;
  private lastEffectTick=-1;

  constructor(private readonly app: AppBase, private readonly physics: RapierStagePhysics,
    private readonly projectiles: ProjectileSystem) {
    this.projectiles.useF4SpecialContact((from,to,team)=>{
      let nearest:ObjectContact|null=null;
      for(const query of this.devices){
        const hit=query(from,to,team);
        if(hit&&hit.distance<(nearest?.distance??Infinity))nearest=hit;
      }
      return nearest;
    });
  }

  private querySuction: SuctionQuery = (from,to,shot)=>{
    let nearest:{distance:number;accept():boolean}|null=null;
    for(const query of this.suctionQueries){
      const hit=query(from,to,shot);
      if(hit&&hit.distance<(nearest?.distance??Infinity))nearest=hit;
    }
    return nearest;
  };

  private get roundId(): string {return 'f4-' + this.round;}

  private newPort(): PhysicalSpecialPort720 {
    return new PhysicalSpecialPort720({roundId:this.roundId,host:{
      prepare:query=>this.input && this.prepare(query,this.input)
    }});
  }

  reset(): void {
    this.finish(this.frame);
    this.round++;
    this.port=this.newPort();
    this.turf=new CertifiedTurf720({roundId:this.roundId});
    this.completedProbeLives.clear();
    this.actorUnlock.clear();
    this.livePose.clear();
    this.launches=this.anchors=this.paintCells=this.sweptHpLoss=this.waves=this.absorbed=0;
    this.special=null;
    this.terminal=null;
    this.score=null;
    this.frame=0;
    this.lastEffectTick=-1;
  }

  finish(tick: number, legalRoundEnd = false): void {
    this.port.close(tick);
    this.active.clear();
    this.actorUnlock.clear();
    this.livePose.clear();
    for(const effect of this.effects) effect.dispose();
    this.effects.length=0;
    this.devices.clear();
    this.suctionQueries.clear();
    if (legalRoundEnd) this.score=this.turf.result({roundId:this.roundId,tick,roundEnded:true});
  }

  notePaint(changed: number): void {this.paintCells+=changed;}

  /** Per-life HUD state. Display only; it does not grant gauge or gameplay authority. */
  actorPresentation(actor:Actor) {
    const {actorId,lifeId,weapon}=actor;
    const id=KIT720[weapon].special;
    const controls:Record<F4SpecialId,string>={
      ultraShot:'左クリック 射撃',chariot:'左クリック 連射 · F 砲撃 · 右クリック 球形態',
      blower:'左クリック 吸引／吐き出し',superHook:'物理実行 HOLD',
      greatBarrier:'左クリック 設置',waveBreaker:'左クリック 設置',
      microLaser:'自動発射 · 移動可能',tripleTornado:'左クリック ガイド投擲',
      ultraStamp:'左クリック 振る · 右クリック 長押し→離す 投擲'
    };
    const active=this.active.get(actorId)===lifeId;
    const locked=this.frame<(this.actorUnlock.get(actorId)??0);
    const probeState=active?'ACTIVE' as const:locked?'LOCKED' as const:
      id==='superHook'?'UNSUPPORTED' as const:
      this.completedProbeLives.has(actorId+':'+lifeId)?'USED' as const:'AVAILABLE' as const;
    return {authorityComplete:this.turf.complete,executorReady:false,active,probeState,probeControls:controls[id]};
  }

  snapshot() {
    return {authorityComplete:this.turf.complete,score:this.score,special:this.special,active:this.active.size,
      launches:this.launches,anchors:this.anchors,waves:this.waves,absorbed:this.absorbed,paintCells:this.paintCells,confirmedSweepHpLoss:this.sweptHpLoss,
      castEnd:this.terminal};
  }

  update(tick: number): void {
    if(!Number.isSafeInteger(tick)||tick<0||tick>=10800||tick<this.frame||tick<=this.lastEffectTick)return;
    this.frame=tick;
    this.lastEffectTick=tick;
    for(let i=this.effects.length-1;i>=0;i--){
      const effect=this.effects[i]!;
      if(effect.step(tick))continue;
      effect.dispose();
      this.effects.splice(i,1);
    }
  }

  actorTick(tick: number, actor: Actor, input: Input, open: boolean, isolatedRequest: boolean): boolean {
    this.frame=Math.max(this.frame,tick);
    const {actorId,lifeId,team,weapon}=actor;
    const key={roundId:this.roundId,tick,actorId,lifeId};
    const activeLife=this.active.get(actorId);
    if (activeLife && activeLife!==lifeId)
      this.port.cancel({...key,lifeId:activeLife,reason:'life-ended'});
    if (!open) {
      if(this.active.has(actorId)) this.port.cancel({...key,reason:'actions-closed'});
      return false;
    }
    this.input=input;
    const probeKey=actorId+':'+lifeId;
    try {
      if(isolatedRequest && !this.active.has(actorId) && !this.completedProbeLives.has(probeKey)){
        const special=KIT720[weapon].special;
        if(this.port.begin({...key,team,special,input:{weapon}}))
          this.completedProbeLives.add(probeKey);
      }
      if(!this.active.has(actorId))return this.ownsWeaponInput(actorId,tick);
      this.livePose.get(actorId)?.();
      this.port.step({...key,input:{trigger:input.trigger,holdStamp:input.trigger,
        holdThrow:input.holdThrow,releaseThrow:input.releaseThrow,airborne:input.airborne,
        roll:input.holdThrow,rapid:input.trigger,cannon:input.cannon,hold:input.trigger,fire:input.trigger}});
      return true;
    } finally {this.input=null;}
  }

  /** Read-only ownership gate consumed before normal weapon movement and attacks. */
  ownsWeaponInput(actorId:string,tick:number):boolean {
    return this.active.has(actorId)||tick<(this.actorUnlock.get(actorId)??0);
  }

  cancelActor(actorId:string,tick:number):void {
    const lifeId=this.active.get(actorId);
    if(lifeId)this.port.cancel({roundId:this.roundId,tick,actorId,lifeId,reason:'life-ended'});
    this.actorUnlock.delete(actorId);
  }

  private prepare(query: {actorId:string;lifeId:string;team:Team.A|Team.B;special:F4SpecialId;
    input:{weapon:WeaponId}}, initial: Input): SpecialPlan|null {
    const {actorId,lifeId,team,special}=query;
    const weapon=query.input.weapon;
    if(!this.physics.hasF4WholeResearchTrimesh)return null;
    const launch=(flight:F4SpecialFlight,count=1)=>{
      const input=this.input;
      if(!input)return false;
      if(!this.projectiles.launchF4Special(input.origin,input.forward,team,actorId,weapon,flight,count))return false;
      this.launches+=count;
      return true;
    };
    const reserve=(config: SpecialPlan['config'], ops: SpecialPlan['ops']): SpecialPlan=>({
      config,ops,commit:()=>{
        this.active.set(actorId,lifeId);
        this.special=special;
        this.terminal=null;
        return true;
      },
      abort:()=>{this.active.delete(actorId);},
      finish:(reason,tick,details)=>{
        this.active.delete(actorId);
        this.terminal=reason;
        if(details?.actionUnlockTick && details.actionUnlockTick>tick)
          this.actorUnlock.set(actorId,details.actionUnlockTick);
      }
    });
    switch(special){
      case 'ultraShot':
        return reserve({readyDelayF:18},{launchVolley:volley=>launch({
          speed:28,gravity:0,lifeSeconds:1.45,diameter:.25,directDamage:volley.directDamage,
          armingFrames:18,blast:{radius:1.5,damage:volley.blastDamage,paint:.52},
          offset:(age,index)=>volley.orbitalOffsets(age,.27,.16)[index]!
        },volley.count)});
      case 'tripleTornado':
        return reserve({readyDelayF:20,repeatF:33},{launchGuide:guide=>launch({
          speed:12,gravity:12,lifeSeconds:2.1,diameter:.22,directDamage:0,collisions:'stage',
          onTerrain:hit=>{
            if((hit.normal?.y??0)<.55)return;
            this.anchors++;
            this.tornado(hit.point,team,actorId,guide.tornadoPulse);
          }
        })});
      case 'chariot':
        return this.crab(actorId,lifeId,team,initial,launch,reserve);
      case 'blower':
        return this.vacuum(actorId,lifeId,team,initial,launch,reserve);
      case 'waveBreaker':
      case 'greatBarrier': {
        const wave=special==='waveBreaker';
        return reserve(wave?{readyDelayF:20,castLimitF:240,radiusM:5.6}:
          {readyDelayF:20,castLimitF:240,minRadiusM:.85,maxRadiusM:2.55},
        {deploy:({tick,factory})=>{
          if(!this.input)return false;
          const foot=this.placement(this.input);
          if(!foot)return false;
          const device=factory({deviceId:this.roundId+':device:'+ ++this.deviceSequence,
            physicalPlacementAccepted:true});
          if(wave)this.waveDevice(device as WaveDevice,foot,team,actorId);
          else this.barrier(device as BarrierDevice,foot,team,tick);
          this.anchors++;
          return true;
        }});
      }
      case 'microLaser':
        return reserve({pairIntervalF:30,actionLockF:40},{launchPair:pair=>{
          const input=this.input??initial;
          const start=input.origin.clone();
          const forward=input.forward.clone().normalize();
          const right=new Vec3().cross(Math.abs(forward.y)>.98?Vec3.RIGHT:Vec3.UP,forward).normalize();
          const beams=[-1,1].map(side=>{
            const position=start.clone().add(right.clone().mulScalar(side*.42));
            return {position,visual:this.visual('F4 beam','box',team),
              direction:forward.clone().add(right.clone().mulScalar(side*.05)).normalize(),
              target:this.projectiles.findF4SubOpponent(position,team,18)?.id};
          });
          const handler=pair.factory({physicalLaunchAccepted:true});
          this.laser(beams,handler,pair.tick,team,actorId);
          this.launches+=beams.length;
          return true;
        }});
      case 'ultraStamp':
        return reserve({firstSwingF:18,repeatF:24,throwDelayF:14},{
          swing:({swingId})=>{
            const input=this.input;
            if(!input)return false;
            const start=input.origin.clone();
            const forward=input.forward.clone().normalize();
            const end=start.clone().add(forward.mulScalar(1.5));
            const visual=this.visual('F4 stamp','box',team);
            this.drawSegment(visual,start,end,.4);
            const tick=this.frame;
            this.effects.push({step:nextTick=>{
              if(nextTick===tick+1 && this.active.get(actorId)===lifeId){
                this.sweptHpLoss+=this.projectiles.applyF4SpecialSweep(start,end,.25,team,actorId,(id,targetTeam)=>{
                  const targetLifeId=this.projectiles.f4TargetLifeKey(id);
                  return targetLifeId?Number(this.port.contact({roundId:this.roundId,lifeId,actorId,tick:nextTick,
                    swingId,targetLifeId,targetTeam,liveTarget:true,physicalContact:true,hitClass:'direct'}))||0:0;
                },true);
                this.port.closeSwing({roundId:this.roundId,lifeId,actorId,swingId});
              }
              return nextTick<tick+8;
            },dispose:()=>visual.destroy()});
            return true;
          },
          launchThrow:({direct,near,far})=>launch({
            speed:23,gravity:8,lifeSeconds:1.45,diameter:.4,directDamage:direct,
            blast:{radius:1.45,damage:far,paint:.55,near:{radius:.7,damage:near}}
          })
        });
      default:return null;
    }
  }

  private crab(actor:string,lifeId:string,team:Team.A|Team.B,initial:Input,
    launch:(flight:F4SpecialFlight)=>boolean,reserve:(config:SpecialPlan['config'],ops:SpecialPlan['ops'])=>SpecialPlan):SpecialPlan {
    const armorId=this.roundId+':armor:'+ ++this.deviceSequence;
    let mode:'turret'|'ball'='turret';
    let at=initial;
    let visual:Entity|null=null;
    const hitThisRoll=new Set<string>();
    const center=(foot:Vec3)=>foot.clone().add(new Vec3(0,mode==='ball'?.40:.28,0));
    const radius=()=>mode==='ball'?.48:.40;
    const pose=()=>{
      visual?.setPosition(center(at.foot));
      visual?.setLocalScale(radius()*2,radius()*2,radius()*2);
    };
    const livePose=()=>{
      const input=this.input;
      if(!input)return;
      if(mode==='ball'&&!input.airborne&&!at.airborne&&input.foot.distance(at.foot)>.025){
        this.sweptHpLoss+=this.projectiles.applyF4SpecialSweep(center(at.foot),center(input.foot),radius(),
          team,actor,id=>{
          const targetLifeId=this.projectiles.f4TargetLifeKey(id);
          if(!targetLifeId||hitThisRoll.has(targetLifeId))return 0;
          hitThisRoll.add(targetLifeId);
            return 40;
          },true);
      }
      at=input;
      pose();
    };
    const contact:DeviceQuery=(from,to,enemy)=>{
      if(enemy===team||!visual)return null;
      const distance=this.physics.castInkSegmentAtBall(from,to,center(at.foot),radius());
      return distance===null?null:{distance,damage:damage=>{
        this.port.contact({roundId:this.roundId,tick:this.frame,actorId:actor,lifeId,
          armorId,eventId:String(++this.deviceHitSequence),sourceTeam:enemy,
          damage,objectMultiplier:1,firstPhysicalHit:'armor'});
      }};
    };
    const plan=reserve({armorId},{
      physicalMode:()=>{livePose();return mode;},
      changeMode:next=>{mode=next.mode;hitThisRoll.clear();pose();return true;},
      launch:shot=>shot.kind==='cannon'?launch({
        speed:21,gravity:4,lifeSeconds:1.15,diameter:.27,directDamage:shot.direct!,
        blast:{radius:1.45,damage:shot.blast!,paint:.48}
      }):launch({
        speed:31,gravity:6,lifeSeconds:.73,diameter:.11,directDamage:32,damageAtAge:crabProjectileDamage
      })
    });
    const clean=()=>{this.devices.delete(contact);visual?.destroy();visual=null;};
    return {...plan,commit:()=>{
      visual=this.visual('F4 armor','sphere',team);
      pose();
      this.devices.add(contact);
      return plan.commit();
    },abort:()=>{clean();plan.abort();},finish:(reason,tick,details)=>{
      clean();plan.finish(reason,tick,details);
    }};
  }

  private vacuum(actor:string,lifeId:string,team:Team.A|Team.B,initial:Input,
    launch:(flight:F4SpecialFlight)=>boolean,reserve:(config:SpecialPlan['config'],ops:SpecialPlan['ops'])=>SpecialPlan):SpecialPlan {
    let at=initial;
    let visual:Entity|null=null;
    let consume:{id:string;apply():boolean}|null=null;
    const query:SuctionQuery=(from,to,shot)=>{
      if(shot.team===team||shot.damage<=0||!at.trigger||!visual)return null;
      const center=at.origin.clone().add(at.forward.clone().normalize().mulScalar(1.18));
      const distance=this.physics.castInkSegmentAtBall(from,to,center,.84);
      if(distance===null)return null;
      const overlap=from.clone().lerp(from,to,distance/from.distance(to));
      if(this.physics.castStageSegment(at.origin,overlap,'ink-projectile'))return null;
      return {distance,accept:()=>{
        consume={id:shot.id,apply:shot.consume};
        try{
          const accepted=this.port.contact({roundId:this.roundId,tick:this.frame,actorId:actor,lifeId,
            projectileId:shot.id,sourceTeam:shot.team,eligible:true,physicalContact:true,
            unoccluded:true,chargeValue:shot.damage})===true;
          if(accepted)this.absorbed++;
          return accepted;
        }finally{consume=null;}
      }};
    };
    const plan=reserve({capacity:210,minRadiusM:1.15,maxRadiusM:2.5},{
      consume:id=>consume?.id===id&&consume.apply(),
      launch:shot=>launch({speed:20,gravity:6,lifeSeconds:1.6,diameter:.36,directDamage:shot.damage!,
        blast:{radius:shot.radiusM!,damage:75,paint:.72}})
    });
    const clean=()=>{
      this.suctionQueries.delete(query);
      if(this.suctionQueries.size===0)this.projectiles.useF4Absorption();
      this.livePose.delete(actor);
      visual?.destroy();
      visual=null;
    };
    const pose=()=>{
      if(this.input)at=this.input;
      if(!visual)return;
      visual.enabled=at.trigger;
      if(visual.enabled){
        const target=at.origin.clone().add(at.forward.clone().normalize().mulScalar(1.18));
        visual.setPosition(target);
        visual.lookAt(target.clone().add(at.forward));
      }
    };
    return {...plan,commit:()=>{
      visual=this.visual('F4 suction aperture','torus',team);
      visual.setLocalScale(.8,.13,.8);
      pose();
      this.suctionQueries.add(query);
      this.projectiles.useF4Absorption(this.querySuction);
      this.livePose.set(actor,pose);
      return plan.commit();
    },abort:()=>{clean();plan.abort();},finish:(reason,tick,details)=>{
      clean();plan.finish(reason,tick,details);
    }};
  }

  private placement(input:Input):Vec3|null {
    if (input.airborne) return null;
    const ahead=input.forward.clone();
    ahead.y=0;
    if(ahead.lengthSq()<.05)return null;
    const near=input.origin.clone().add(ahead.normalize().mulScalar(1.05));
    if(this.physics.castStageSegment(input.origin,near,'thrown-sub'))return null;
    const ground=this.physics.castStageSegment(near,near.clone().add(new Vec3(0,-1.5,0)),'thrown-sub');
    if(!ground||(ground.normal?.y??0)<.96)return null;
    // A device cannot straddle an edge or hang on the side of a wall.
    for (const [x,z] of [[-.22,0],[.22,0],[0,-.22],[0,.22]] as const) {
      const above=ground.point.clone().add(new Vec3(x,.18,z));
      const edge=this.physics.castStageSegment(above,above.clone().add(new Vec3(0,-.38,0)),'thrown-sub');
      if(!edge||edge.solidId!==ground.solidId||(edge.normal?.y??0)<.96||
         Math.abs(edge.point.y-ground.point.y)>.09)return null;
    }
    return ground.point;
  }

  private waveDevice(device:WaveDevice,foot:Vec3,team:Team.A|Team.B,actor:string):void {
    let hp=480;
    const body=foot.clone().add(new Vec3(0,.26,0));
    const visual=this.visual('F4 wave device','cylinder',team);
    visual.setPosition(body);
    visual.setLocalScale(.49,.52,.49);
    const rings=Array.from({length:3},()=>{
      const ring=this.visual('F4 wave front','torus',team);
      ring.setPosition(foot.clone().add(new Vec3(0,.07,0)));
      ring.enabled=false;
      return ring;
    });
    const contact:DeviceQuery=(from,to,enemy)=>{
      if(enemy===team||hp<=0)return null;
      const distance=this.physics.castInkSegmentAtBall(from,to,body,.26);
      return distance===null?null:{distance,damage:damage=>{
        if(damage<=0||hp<=0)return;
        hp-=damage;
        if(hp<=0){device.destroy(this.frame);visual.enabled=false;this.devices.delete(contact);}
      }};
    };
    this.devices.add(contact);
    const emitted=new Set<number>();
    this.effects.push({step:tick=>{
      if(device.finished(tick))return false;
      for(const ring of rings)ring.enabled=false;
      for(const wave of device.fronts(tick,this.roundId)){
        if(!emitted.has(wave.index)){
          emitted.add(wave.index);
          this.waves++;
        }
        const ring=rings[wave.index]!;
        const size=wave.radiusMeters*2;
        ring.enabled=size>.02;
        ring.setLocalScale(size,.7,size);
        this.sweptHpLoss+=this.projectiles.applyF4GroundWave(foot,wave.previousRadiusMeters,wave.radiusMeters,
          team,actor,(id)=>{
            const targetLifeId=this.projectiles.f4TargetLifeKey(id);
            return targetLifeId?device.hit({tick,roundId:this.roundId,waveIndex:wave.index,targetLifeId,
              liveEnemy:true,physicalWaveContact:true}):0;
          });
      }
      return true;
    },dispose:()=>{
      this.devices.delete(contact);
      visual.destroy();
      for(const ring of rings)ring.destroy();
    }});
  }

  private barrier(device:BarrierDevice,foot:Vec3,team:Team.A|Team.B,start:number):void {
    let radius=0;
    const body=foot.clone().add(new Vec3(0,.33,0));
    const anchor=this.visual('F4 barrier anchor','cylinder',team);
    anchor.setPosition(body);
    anchor.setLocalScale(.54,.62,.54);
    const shell=this.barrierShell(team);
    shell.setPosition(foot);
    shell.enabled=false;
    const field=this.visual('F4 barrier perimeter','torus',team);
    field.setPosition(foot.clone().add(new Vec3(0,.055,0)));
    field.enabled=false;
    const contact:DeviceQuery=(from,to,enemy)=>{
      if(enemy===team||device.ended)return null;
      const drone=this.physics.castInkSegmentAtBall(from,to,body,.28);
      const shell=radius>0&&from.distance(foot)>radius+.001?
        this.physics.castInkSegmentAtBall(from,to,foot,radius):null;
      const shellPointY=shell===null?0:from.y+(to.y-from.y)*(shell/from.distance(to));
      const outsideIn=shell!==null&&shellPointY>=foot.y;
      const hitField=outsideIn&&shell!<(drone??Infinity);
      const distance=hitField?shell:drone;
      return distance===null?null:{distance,damage:damage=>{
        if(damage<=0||device.ended)return;
        device.hit({tick:Math.max(start,this.frame),roundId:this.roundId,deviceId:device.deviceId,
          eventId:String(++this.deviceHitSequence),sourceTeam:enemy===Team.A?'A':'B',damage,
          objectMultiplier:1,firstPhysicalHit:hitField?'field':'device',enteringFromOutside:hitField});
      }};
    };
    this.devices.add(contact);
    this.effects.push({step:tick=>{
      radius=device.radius(tick,this.roundId);
      field.enabled=radius>0;
      field.setLocalScale(radius*2,.85,radius*2);
      shell.enabled=radius>0;
      shell.setLocalScale(radius*2,radius*2,radius*2);
      return !device.ended;
    },dispose:()=>{
      this.devices.delete(contact);
      anchor.destroy();
      shell.destroy();
      field.destroy();
    }});
  }

  private tornado(foot: Vec3,team:Team.A|Team.B,actor:string,pulse:TornadoPulse): void {
    const start=this.frame+82;
    const visual=this.visual('F4 tornado','cylinder',team);
    visual.enabled=false;
    const bottom=foot.clone().add(new Vec3(0,.08,0));
    const top=bottom.clone().add(new Vec3(0,3,0));
    visual.setPosition(bottom.clone().lerp(bottom,top,.5));
    this.effects.push({step:tick=>{
      if(tick<start)return true;
      const value=pulse(tick-start,{damageRadiusMeters:1.65,paintRadiusMeters:1.5,damageStartRadiusMeters:.14});
      if(!value)return false;
      visual.enabled=true;
      const width=value.damageRadiusMeters*2;
      visual.setLocalScale(width,3,width);
      if(value.damageDue)
        this.sweptHpLoss+=this.projectiles.applyF4SpecialSweep(bottom,top,value.damageRadiusMeters,team,actor,()=>value.damage,false);
      if(value.paintDue)
        this.projectiles.applyF4SpecialPulse(bottom,team,actor,value.paintRadiusMeters,0,.26);
      return true;
    },dispose:()=>visual.destroy()});
  }

  private laser(beams:{position:Vec3;visual:Entity;direction:Vec3;target?:string}[],
    pair:LaserPair, start:number, team:Team.A|Team.B, actor:string): void {
    this.effects.push({step:tick=>{
      if(pair.finished(tick))return false;
      const age=tick-start;
      for(const [index,beam] of beams.entries()){
        const target=beam.target&&this.projectiles.findF4SubOpponent(beam.position,team,30,beam.target);
        if(target){
          const desired=target.point.clone().sub(beam.position).normalize();
          beam.direction.lerp(beam.direction,desired,.045).normalize();
        }
        const end=beam.position.clone().add(beam.direction.clone().mulScalar(21));
        this.drawSegment(beam.visual,beam.position,end,age<36?.035:.12);
        if(age>=36&&(age-36)%5===0){
          this.sweptHpLoss+=this.projectiles.applyF4SpecialSweep(beam.position,end,.07,team,actor,(id)=>{
            const targetLifeId=this.projectiles.f4TargetLifeKey(id);
            return targetLifeId?pair.damage({roundId:this.roundId,beamId:pair.beamIds[index]!,targetLifeId,
              tick,liveEnemy:true,beamOverlap:true}):0;
          },false);
        }
      }
      return true;
    },dispose:()=>{for(const beam of beams)beam.visual.destroy();}});
  }

  /** Translucent rendering only; no collider, damage, or score authority. */
  private barrierShell(team:Team.A|Team.B):Entity {
    if(!this.barrierShellMesh){
      const positions:number[]=[],indices:number[]=[];
      const bands=12,segments=32;
      for(let y=0;y<=bands;y++){
        const angle=Math.PI*.5*y/bands;
        const h=Math.sin(angle),r=Math.cos(angle);
        for(let x=0;x<=segments;x++){
          const a=2*Math.PI*x/segments;
          positions.push(r*Math.cos(a),h,r*Math.sin(a));
        }
      }
      for(let y=0;y<bands;y++)for(let x=0;x<segments;x++){
        const a=y*(segments+1)+x,b=a+segments+1;
        indices.push(a,b,a+1,a+1,b,b+1);
      }
      const mesh=new Mesh(this.app.graphicsDevice);
      mesh.setPositions(new Float32Array(positions));
      mesh.setNormals(new Float32Array(positions));
      mesh.setIndices(new Uint16Array(indices));
      mesh.update();
      this.barrierShellMesh=mesh;
    }
    let material=this.barrierMaterials.get(team);
    if(!material){
      material=new StandardMaterial();
      material.diffuse=team===Team.A?new Color(.08,.74,.86):new Color(.91,.28,.66);
      material.emissive=team===Team.A?new Color(.035,.18,.22):new Color(.30,.055,.18);
      material.opacity=.18;
      material.blendType=BLEND_NORMAL;
      material.depthWrite=false;
      material.cull=CULLFACE_NONE;
      material.update();
      this.barrierMaterials.set(team,material);
    }
    const entity=new Entity('F4 barrier shell');
    entity.addComponent('render',{meshInstances:[new MeshInstance(this.barrierShellMesh,material,entity)],castShadows:false});
    this.app.root.addChild(entity);
    return entity;
  }

  private visual(name:string,type:'box'|'cylinder'|'torus'|'sphere',team:Team.A|Team.B): Entity {
    let material=this.visualMaterials.get(team);
    if(!material){
      material=new StandardMaterial();
      material.diffuse=team===Team.A?new Color(.08,.74,.86):new Color(.91,.28,.66);
      material.emissive=team===Team.A?new Color(.035,.18,.22):new Color(.30,.055,.18);
      material.update();
      this.visualMaterials.set(team,material);
    }
    const entity=new Entity(name);
    if(type==='torus'){
      this.ringMesh??=Mesh.fromGeometry(this.app.graphicsDevice,
        new TorusGeometry({ringRadius:.48,tubeRadius:.02,segments:48,sides:6}));
      entity.addComponent('render',{meshInstances:[new MeshInstance(this.ringMesh,material,entity)],castShadows:false});
    }else entity.addComponent('render',{type,material,castShadows:false});
    this.app.root.addChild(entity);
    return entity;
  }

  private drawSegment(entity:Entity,start:Vec3,end:Vec3,width:number): void {
    entity.setPosition(new Vec3().lerp(start,end,.5));
    entity.lookAt(end);
    entity.setLocalScale(width,width,start.distance(end));
  }
}
