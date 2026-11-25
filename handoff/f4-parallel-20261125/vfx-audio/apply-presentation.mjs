// Run only in integration copy: node apply-presentation.mjs /path/to/copy [--apply]
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]??'.');
const edits=[
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
const files=new Map();
for(const {path,old,next} of edits){const file=join(root,path);let s=files.get(file)??readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(old).length!==2)throw Error('HOLD: anchor missing or repeated '+path+' '+old.slice(0,80));files.set(file,s.replace(old,next));}
const modules=['F4FeedbackMotion.mjs','F4FeedbackMotion.d.mts'];
for(const name of modules){const dest=join(root,'src/feedback',name);if(existsSync(dest))throw Error('HOLD: module exists '+dest);files.set(dest,readFileSync(new URL('./'+name,import.meta.url),'utf8'));}
console.log('PREFLIGHT PASS',files.size,'files');
if(process.argv.includes('--apply'))for(const [file,s] of files)writeFileSync(file,s);
