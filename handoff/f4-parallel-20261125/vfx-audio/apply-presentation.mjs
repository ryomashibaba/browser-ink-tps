// Integrate only on a copy. node apply-presentation.mjs <copy> [--apply]
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]??'.');
const v1=[
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "import type { WeaponClass, WeaponProfile } from '../weapons/WeaponCatalog';",
    "next": "import type { WeaponClass, WeaponProfile } from '../weapons/WeaponCatalog';\nimport {chooseSlot,droplet,pose} from './F4FeedbackMotion.mjs';"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "type FxMode = 'BURST' | 'FUSE';",
    "next": "type FxMode = 'BURST' | 'FUSE' | 'DROP';"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "  mode: FxMode;",
    "next": "  mode: FxMode;\n  priority?:number;\n  motion?:{x:number;y:number;z:number;vx:number;vy:number;vz:number};"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "  private lastAudioEventMs = 0;",
    "next": "  private lastAudioEventMs = 0;\n  private f4Presentation=false;\n  private phase=0;\n  private voices=0;\n  private canvas:HTMLCanvasElement;\n  public enableF4Presentation():void {this.f4Presentation=true;}\n  public resetF4Presentation():void {\n    if(!this.f4Presentation)return;\n    for(const slot of this.fx){slot.ttl=0;slot.entity.enabled=false;slot.motion=undefined;}\n    this.disableChargeVisual();this.phase=0;\n  }"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.materialA = makeFxMaterial(GAME_CONFIG.visual.teamA);",
    "next": "    this.canvas=canvas;\n    this.materialA = makeFxMaterial(GAME_CONFIG.visual.teamA);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "      if (slot.mode === 'FUSE') {",
    "next": "      if(slot.mode==='DROP'&&slot.motion){\n        const m=slot.motion;\n        const [x,y,z,s]=pose(m.x,m.y,m.z,m.vx,m.vy,m.vz,slot.duration-slot.ttl,slot.duration,slot.baseScale);\n        slot.entity.setPosition(x,y,z);slot.entity.setLocalScale(s,s*1.25,s);\n      } else if (slot.mode === 'FUSE') {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.spawnFx(team, position, 0.11 * profile.fxScale, 0.14);",
    "next": "    this.spawnFx(team, position, 0.11 * profile.fxScale, 0.14);\n    this.spray(team,position,3,.065*profile.fxScale,1.15,.85,.19,0);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(660*profile.audioPitch,0.024,0.06,'sine',1.05);",
    "next": "    this.spray(team,at,4,.075,1.7,1.3,.23,2);\n    this.playTone(660*profile.audioPitch,0.024,0.06,'sine',1.05,2);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52);",
    "next": "    this.spray(team,position,7,.12,Math.min(4,radius*2),2.1,.34,2);\n    this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52,2);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44);",
    "next": "    this.spray(team,position,8,.13,Math.min(5,radius*2),2.4,.38,2);\n    this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72);",
    "next": "    this.spray(team,position,9,.16,Math.min(5,radius*2.4),3,.40,3);\n    this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.spawnFx(team, position, 0.36, 0.32);\n    this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42);",
    "next": "    this.spawnFx(team, position, 0.36, 0.32,'BURST',3);\n    this.spray(team,position,10,.14,3.4,2.7,.42,3);\n    this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.spawnFx(team, position, 0.22, 0.24);\n    this.playTone(430, 0.035, 0.11, 'sine', 1.35);",
    "next": "    this.spawnFx(team, position, 0.22, 0.24,'BURST',3);\n    this.spray(team,position,6,.10,.7,3.1,.40,3);\n    this.playTone(430, 0.035, 0.11, 'sine', 1.35,3);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "  private spawnFx(",
    "next": "  private spray(team:Team.A|Team.B,at:Vec3,count:number,size:number,speed:number,up:number,ttl:number,priority:number):void {\n    if(!this.f4Presentation||![at.x,at.y,at.z,size,speed,up,ttl].every(Number.isFinite))return;\n    this.phase=(this.phase+2.399963229728653)%(2*Math.PI);\n    for(let i=0;i<count;i++){\n      const [vx,vy,vz]=droplet(i,count,this.phase,speed,up);\n      const slot=this.spawnFx(team,at,size,ttl,'DROP',priority);\n      if(!slot)break;\n      slot.motion={x:at.x,y:at.y,z:at.z,vx,vy,vz};\n    }\n  }\n\n  private spawnFx("
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    mode: FxMode = 'BURST'\n  ): void {\n    const slot = this.fx.find((candidate) => candidate.ttl <= 0);",
    "next": "    mode: FxMode = 'BURST',priority=0\n  ): FxSlot|undefined {\n    const slot = this.f4Presentation?this.fx[chooseSlot(this.fx,mode==='FUSE'?2:priority)]:this.fx.find((candidate) => candidate.ttl <= 0);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    slot.mode = mode;",
    "next": "    slot.mode = mode;\n    slot.priority=mode==='FUSE'?2:priority;\n    slot.motion=undefined;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    slot.entity.enabled = true;\n  }\n\n  private unlockAudio",
    "next": "    slot.entity.enabled = true;\n    return slot;\n  }\n\n  private unlockAudio"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "      this.audio = new Context();",
    "next": "      try{this.audio = new Context();}catch{return;}"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if (this.audio.state === 'suspended') void this.audio.resume();",
    "next": "    if (this.audio.state === 'suspended') void this.audio.resume().catch(()=>{});"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    endFrequencyMultiplier: number\n  ): void {",
    "next": "    endFrequencyMultiplier: number,priority=0\n  ): void {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if (wallNow - this.lastAudioEventMs < 12) return;",
    "next": "    if(this.f4Presentation){\n      if(this.canvas.dataset.t21SourceAudio==='MUTED'||this.voices>=(priority>=2?12:8))return;\n      if(priority<2&&wallNow-this.lastAudioEventMs<12)return;\n    }else if (wallNow - this.lastAudioEventMs < 12) return;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    gain.gain.setValueAtTime(gainValue, now);",
    "next": "    if(this.f4Presentation){gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,gainValue),now+.006);}\n    else gain.gain.setValueAtTime(gainValue, now);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    gain.connect(audio.destination);\n    oscillator.start(now);",
    "next": "    gain.connect(audio.destination);\n    this.voices++;\n    oscillator.onended=()=>{this.voices=Math.max(0,this.voices-1);oscillator.disconnect();gain.disconnect();};\n    oscillator.start(now);"
  },
  {
    "path": "src/projectile/ProjectileSystem.ts",
    "old": "    this.feedback.impact(slot.team, point, profile);",
    "next": "    // Empty-air expiry is not physical contact.\n    if(!this.physics.hasF4WholeResearchTrimesh||reason!=='TTL')this.feedback.impact(slot.team, point, profile);"
  },
  {
    "path": "src/projectile/ProjectileSystem.ts",
    "old": "        this.applyF4SpecialPulse(center,slot.team,slot.sourceId,blast.radius,blast.damage,blast.paint,blast.near);",
    "next": "        this.applyF4SpecialPulse(center,slot.team,slot.sourceId,blast.radius,blast.damage,blast.paint,blast.near);\n        this.feedback.specialBurst(slot.team,center,blast.radius);"
  },
  {
    "path": "src/projectile/ProjectileSystem.ts",
    "old": "          terrain ? 1.25 : 2.15, terrain ? 0.66 : 0.88, true);",
    "next": "          terrain ? 1.25 : 2.15, terrain ? 0.66 : 0.88, true);\n        if(this.physics.hasF4WholeResearchTrimesh)this.feedback.subBurst(slot.team,center,slot.blastRadius*scale);"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "   new F4SpecialRuntime(app,this.physics,this.projectiles):null;",
    "next": "   new F4SpecialRuntime(app,this.physics,this.projectiles):null;\n  if(this.f4Special&&import.meta.env.DEV&&b31Params.get('t21QaInput')!=='deterministic')this.feedback.enableF4Presentation();"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "  this.f4Special?.reset();",
    "next": "  this.f4Special?.reset();\n  this.feedback.resetF4Presentation();"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "      if(this.nativeLiveSourcePrestart)\n       this.feedback.respawn(Team.A,this.humanSpawn);",
    "next": "      if(this.nativeLiveSourcePrestart||this.f4WholeTrimeshInstalled)\n       this.feedback.respawn(Team.A,this.humanSpawn);"
  }
];
const v2=[
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "import {chooseSlot,droplet,pose} from './F4FeedbackMotion.mjs';",
    "next": "import {chooseSlot,droplet,pose} from './F4FeedbackMotion.mjs';\nimport {spatial,eventTone} from './F4SpatialAudio.mjs';\nimport type {SourceCue} from '../audio/SourcePracticeAudio';"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "  private canvas:HTMLCanvasElement;",
    "next": "  private canvas:HTMLCanvasElement;\n  private listener:[number,number,number,number,number]|null=null;\n  private readonly handledCues=new Set<SourceCue>();\n  public setF4Listener(position:Vec3,forward:Vec3):void {\n    if(!this.f4Presentation)return;\n    this.listener=[position.x,position.y,position.z,forward.x,forward.z];\n    this.handledCues.clear();\n  }\n  public f4HandledSourceCues():ReadonlySet<SourceCue> {return this.handledCues;}\n  public f4SpecialEvent(kind:string,team:Team.A|Team.B,position:Vec3):void {\n    if(!this.f4Presentation)return;\n    this.spawnFx(team,position,.22,.27,'BURST',3);\n    this.spray(team,position,kind==='zipcaster'?4:6,.09,1.9,2.1,.30,2);\n    const [frequency,multiplier,duration,wave]=eventTone(kind);\n    this.playTone(frequency,.036,duration,wave,multiplier,3,position);\n  }\n  public f4DevicePulse(kind:string,team:Team.A|Team.B,position:Vec3):void {\n    if(!this.f4Presentation)return;\n    this.spawnFx(team,position,.23,.23,'BURST',2);\n    this.spray(team,position,4,.10,1.8,1.6,.26,2);\n    const [frequency,multiplier,duration,wave]=eventTone(kind);\n    this.playTone(frequency,.026,duration,wave,multiplier,2,position);\n  }"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.disableChargeVisual();this.phase=0;",
    "next": "    this.disableChargeVisual();this.phase=0;this.listener=null;this.handledCues.clear();"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(\n      210 * profile.audioPitch,\n      localPlayer ? 0.034 : 0.018,\n      0.045,\n      'square',\n      0.55\n    );",
    "next": "    if(this.playTone(\n      210 * profile.audioPitch,\n      localPlayer ? 0.034 : 0.018,\n      0.045,\n      'square',\n      0.55,0,position\n    )&&this.f4Presentation&&localPlayer)this.handledCues.add('SHOT');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72);",
    "next": "this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(660*profile.audioPitch,0.024,0.06,'sine',1.05,2);",
    "next": "    if(this.playTone(660*profile.audioPitch,0.024,0.06,'sine',1.05,2,at)&&this.f4Presentation)this.handledCues.add('CPU_HIT');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(260-intensity*75,0.024,0.075,'triangle',0.88);",
    "next": "this.playTone(260-intensity*75,0.024,0.075,'triangle',0.88,2,contact);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(510, 0.014, 0.035, 'sine', 1.12);",
    "next": "this.playTone(510, 0.014, 0.035, 'sine', 1.12,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52,2);",
    "next": "this.playTone(96 * profile.audioPitch, 0.042, 0.13, 'sawtooth', 0.52,2,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(280, 0.022, 0.055, 'triangle', 1.35);",
    "next": "this.playTone(280, 0.022, 0.055, 'triangle', 1.35,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(430, 0.018, 0.045, 'sine', 1.18);",
    "next": "this.playTone(430, 0.018, 0.045, 'sine', 1.18,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2);",
    "next": "this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3);",
    "next": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(520, 0.032, 0.11, 'sine', 1.72);",
    "next": "this.playTone(520, 0.032, 0.11, 'sine', 1.72,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(170, 0.045, 0.13, 'triangle', 1.48);",
    "next": "this.playTone(170, 0.045, 0.13, 'triangle', 1.48,0,position);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(720 * profile.audioPitch, 0.028, 0.07, 'sawtooth', 0.74);",
    "next": "this.playTone(720 * profile.audioPitch, 0.028, 0.07, 'sawtooth', 0.74,0,from);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(150 * profile.audioPitch, 0.026, 0.065, 'triangle', 0.58);",
    "next": "this.playTone(150 * profile.audioPitch, 0.026, 0.065, 'triangle', 0.58,0,center);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "public splat(team: Team.A | Team.B, position: Vec3): void {",
    "next": "public splat(team: Team.A | Team.B, position: Vec3,local=false): void {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3);",
    "next": "    if(this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3,position)&&this.f4Presentation&&local)this.handledCues.add('SPLAT');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "public respawn(team: Team.A | Team.B, position: Vec3): void {",
    "next": "public respawn(team: Team.A | Team.B, position: Vec3,local=false): void {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(430, 0.035, 0.11, 'sine', 1.35,3);",
    "next": "    if(this.playTone(430, 0.035, 0.11, 'sine', 1.35,3,position)&&this.f4Presentation&&local)this.handledCues.add('RESPAWN');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    endFrequencyMultiplier: number,priority=0\n  ): void {",
    "next": "    endFrequencyMultiplier: number,priority=0,position?:Vec3\n  ): boolean {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if (!audio || audio.state !== 'running') return;",
    "next": "    if (!audio || audio.state !== 'running') return false;\n    let attenuation=1,pan=0;\n    if(this.f4Presentation&&position&&this.listener){[attenuation,pan]=spatial(...this.listener,position.x,position.y,position.z);}\n    if(attenuation<.015)return false;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "      if(this.canvas.dataset.t21SourceAudio==='MUTED'||this.voices>=(priority>=2?12:8))return;\n      if(priority<2&&wallNow-this.lastAudioEventMs<12)return;\n    }else if (wallNow - this.lastAudioEventMs < 12) return;",
    "next": "      if(document.pointerLockElement!==this.canvas||this.canvas.dataset.t21SourceAudio==='MUTED'||this.voices>=(priority>=2?12:8))return false;\n      if(priority<2&&wallNow-this.lastAudioEventMs<12)return false;\n    }else if (wallNow - this.lastAudioEventMs < 12) return false;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    const now = audio.currentTime;\n    const oscillator = audio.createOscillator();",
    "next": "    try{\n    const now = audio.currentTime;\n    const oscillator = audio.createOscillator();"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if(this.f4Presentation){gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,gainValue),now+.006);}",
    "next": "    if(this.f4Presentation){gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,gainValue*attenuation),now+.006);}"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    gain.connect(audio.destination);\n    this.voices++;\n    oscillator.onended=()=>{this.voices=Math.max(0,this.voices-1);oscillator.disconnect();gain.disconnect();};\n    oscillator.start(now);\n    oscillator.stop(now + duration + 0.01);",
    "next": "    const panner=this.f4Presentation&&position&&typeof audio.createStereoPanner==='function'?audio.createStereoPanner():null;\n    if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(audio.destination);}\n    else gain.connect(audio.destination);\n    oscillator.start(now);\n    oscillator.stop(now + duration + 0.01);\n    this.voices++;\n    oscillator.onended=()=>{this.voices=Math.max(0,this.voices-1);oscillator.disconnect();gain.disconnect();panner?.disconnect();};\n    return true;\n    }catch{return false;}"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": " public observe(frame:SourceAudioFrame):void{",
    "next": " public observe(frame:SourceAudioFrame,handled?:ReadonlySet<SourceCue>):void{"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": "  for(const cue of cues)this.play(cue,frame.weaponId);",
    "next": "  for(const cue of cues)if(!handled?.has(cue))this.play(cue,frame.weaponId);"
  },
  {
    "path": "src/ai/CpuAgentSystem.ts",
    "old": "  public constructor(\n    private readonly app: AppBase,",
    "next": "  private f4LifeFeedback?: (kind:'splat'|'respawn',team:Team.A|Team.B,position:Vec3)=>void;\n  public useF4LifeFeedback(fn:NonNullable<CpuAgentSystem['f4LifeFeedback']>):void {this.f4LifeFeedback=fn;}\n  private emitF4LifeFeedback(kind:'splat'|'respawn',bot:CpuBot):void {\n    if(!this.f4WholeNavigation||!this.f4LifeFeedback)return;\n    try{this.f4LifeFeedback(kind,bot.team,bot.position.clone().add(new Vec3(0,.68,0)));}catch{/* cosmetic only */}\n  }\n  public constructor(\n    private readonly app: AppBase,"
  },
  {
    "path": "src/ai/CpuAgentSystem.ts",
    "old": "    this.stats.cpuSplats += 1;",
    "next": "    this.stats.cpuSplats += 1;\n    this.emitF4LifeFeedback('splat',bot);"
  },
  {
    "path": "src/ai/CpuAgentSystem.ts",
    "old": "    this.stats.cpuRespawns += 1;",
    "next": "    this.stats.cpuRespawns += 1;\n    this.emitF4LifeFeedback('respawn',bot);"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "  private lastEffectTick=-1;",
    "next": "  private lastEffectTick=-1;\n  private f4PresentationCue?: (kind:string,team:Team.A|Team.B,point:Vec3,phase:'activation'|'pulse')=>void;\n  public useF4PresentationCue(fn:NonNullable<F4SpecialRuntime['f4PresentationCue']>):void {this.f4PresentationCue=fn;}\n  private emitF4Presentation(kind:string,team:Team.A|Team.B,point:Vec3,phase:'activation'|'pulse'):void {\n    try{this.f4PresentationCue?.(kind,team,point,phase);}catch{/* cosmetic only */}\n  }"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "        this.terminal=null;\n        return true;",
    "next": "        this.terminal=null;\n        this.emitF4Presentation(special,team,initial.origin,'activation');\n        return true;"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "            this.anchors++;\n            this.tornado(hit.point,team,actorId,guide.tornadoPulse);",
    "next": "            this.anchors++;\n            this.tornado(hit.point,team,actorId,guide.tornadoPulse);\n            this.emitF4Presentation('tripleTornado',team,hit.point,'pulse');"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "          this.anchors++;\n          return true;",
    "next": "          this.anchors++;\n          this.emitF4Presentation(special,team,foot,'pulse');\n          return true;"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "          this.launches+=beams.length;\n          return true;",
    "next": "          this.launches+=beams.length;\n          this.emitF4Presentation('microLaser',team,start,'pulse');\n          return true;"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "          this.waves++;",
    "next": "          this.waves++;\n          this.emitF4Presentation('waveBreaker',team,foot,'pulse');"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "      if(!value)return false;\n      visual.enabled=true;",
    "next": "      if(!value)return false;\n      if(!visual.enabled)this.emitF4Presentation('tripleTornado',team,bottom,'pulse');\n      visual.enabled=true;"
  },
  {
    "path": "src/special/F4SpecialRuntime.ts",
    "old": "                this.port.closeSwing({roundId:this.roundId,lifeId,actorId,swingId});",
    "next": "                this.port.closeSwing({roundId:this.roundId,lifeId,actorId,swingId});\n                this.emitF4Presentation('ultraStamp',team,end,'pulse');"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": " private readonly feedback:GameFeedback;",
    "next": " private readonly feedback:GameFeedback;\n private readonly f4FeedbackDirection=new Vec3();\n private readonly f4FeedbackPosition=new Vec3();"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "  if(this.f4Special&&import.meta.env.DEV&&b31Params.get('t21QaInput')!=='deterministic')this.feedback.enableF4Presentation();",
    "next": "  if(this.f4Special&&import.meta.env.DEV&&b31Params.get('t21QaInput')!=='deterministic'){\n   this.feedback.enableF4Presentation();\n   this.cpu.useF4LifeFeedback((kind,team,position)=>{\n    if(kind==='splat')this.feedback.splat(team,position);else this.feedback.respawn(team,position);\n   });\n   this.f4Special.useF4PresentationCue((kind,team,position,phase)=>{\n    if(phase==='activation')this.feedback.f4SpecialEvent(kind,team,position);\n    else this.feedback.f4DevicePulse(kind,team,position);\n   });\n  }"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "    const alive=this.resources.currentHp>0;\n    const playerStart=this.b20ProfileStart();",
    "next": "    const alive=this.resources.currentHp>0;\n    if(this.f4WholeTrimeshInstalled){\n     this.camera.getAimDirection(this.f4FeedbackDirection);\n     this.feedback.setF4Listener(this.player.getPosition(this.f4FeedbackPosition),this.f4FeedbackDirection);\n    }\n    const playerStart=this.b20ProfileStart();"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "this.feedback.splat(Team.A,this.player.getPosition(this.p));",
    "next": "this.feedback.splat(Team.A,this.player.getPosition(this.p),true);"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "this.feedback.respawn(Team.A,this.humanSpawn);",
    "next": "this.feedback.respawn(Team.A,this.humanSpawn,true);"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "     weaponId:this.projectiles.currentPlayerWeapon.id\n    });",
    "next": "     weaponId:this.projectiles.currentPlayerWeapon.id\n    },this.feedback.f4HandledSourceCues());"
  }
];
const zip={"path":"src/app/UndertowF3PlayablePreviewApp.ts","old":"if(this.f4Special.consumeNaturalZip(actor,nextSpecialTick))this.resources.refillF4SpecialInk();","next":"if(this.f4Special.consumeNaturalZip(actor,nextSpecialTick)){\n         this.resources.refillF4SpecialInk();\n         this.feedback.f4SpecialEvent('zipcaster',Team.A,origin);\n        }"};
const files=new Map();
const read=path=>files.get(join(root,path))??readFileSync(join(root,path),'utf8').replace(/\r\n/g,'\n');
const update=({path,old,next},allowExisting=false)=>{const text=read(path);if(allowExisting&&text.split(next).length===2)return;if(text.split(old).length!==2)throw Error('HOLD: anchor missing or repeated '+path+' '+old.slice(0,80));files.set(join(root,path),text.replace(old,next));};
for(const e of v1)update(e,true);
for(const e of v2)update(e);
if(read(zip.path).includes(zip.old))update(zip);else console.log('Zip natural activation anchor absent: optional hook HOLD');
for(const name of ['F4FeedbackMotion.mjs','F4FeedbackMotion.d.mts','F4SpatialAudio.mjs','F4SpatialAudio.d.mts']){const dest=join(root,'src/feedback',name);const source=readFileSync(new URL('./'+name,import.meta.url),'utf8');if(existsSync(dest)){if(readFileSync(dest,'utf8').replace(/\r\n/g,'\n')!==source)throw Error('HOLD: different existing module '+dest);}else files.set(dest,source);}
console.log('PREFLIGHT PASS',files.size,'files');if(process.argv.includes('--apply'))for(const [file,content] of files)writeFileSync(file,content);
