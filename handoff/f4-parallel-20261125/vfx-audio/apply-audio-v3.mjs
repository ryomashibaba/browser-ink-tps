// v3 supersedes the v2 integration command, but preserves v2 files. Run on integration copy only.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]??'.'), v2text=readFileSync(new URL('./apply-presentation.mjs',import.meta.url),'utf8');
const parse=(a,b)=>JSON.parse(v2text.slice(v2text.indexOf(a)+a.length,v2text.indexOf(b)));
const v1=parse('const v1=',';\nconst v2='),v2=parse('const v2=',';\nconst zip='),zip=parse('const zip=',';\nconst files=');
const v3=[
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "import type {SourceCue} from '../audio/SourcePracticeAudio';",
    "next": "import type {SourceCue} from '../audio/SourcePracticeAudio';\nimport {f4AudioBus,weaponTexture,type F4Texture} from './F4AudioBus.mjs';"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "  private unlockAudio(): void {\n    if (!this.audio) {",
    "next": "  private unlockAudio(): void {\n    if(this.f4Presentation){if(this.canvas.dataset.t21SourceAudio!=='MUTED')f4AudioBus(this.canvas).unlock();return;}\n    if (!this.audio) {"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.disableChargeVisual();this.phase=0;this.listener=null;this.handledCues.clear();",
    "next": "    this.disableChargeVisual();this.phase=0;this.listener=null;this.handledCues.clear();f4AudioBus(this.canvas).reset();"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "      0.55,0,position\n    )&&this.f4Presentation&&localPlayer)",
    "next": "      0.55,0,position,this.f4Presentation?weaponTexture(profile.weaponClass):undefined,localPlayer?'local-shot':'remote-shot'\n    )&&this.f4Presentation&&localPlayer)"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72,0,position);",
    "next": "this.playTone(118 * profile.audioPitch, 0.018, 0.055, 'triangle', 0.72,0,position,{volume:.022,lowpassHz:950},'impact');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2,position);",
    "next": "this.playTone(82, 0.050, 0.15, 'sawtooth', 0.44,2,position,{volume:.05,lowpassHz:450},'blast');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3,position);",
    "next": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3,position,{volume:.055,lowpassHz:600},'special-blast');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3,position)",
    "next": "this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3,position,{volume:.04,lowpassHz:820},'splat')"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    endFrequencyMultiplier: number,priority=0,position?:Vec3\n  ): boolean {\n    const audio = this.audio;",
    "next": "    endFrequencyMultiplier: number,priority=0,position?:Vec3,texture?:F4Texture,key?:string\n  ): boolean {\n    if(this.f4Presentation){\n      if(document.pointerLockElement!==this.canvas||this.canvas.dataset.t21SourceAudio==='MUTED')return false;\n      let attenuation=1,pan=0;\n      if(position&&this.listener)[attenuation,pan]=spatial(...this.listener,position.x,position.y,position.z);\n      if(attenuation<.015)return false;\n      return f4AudioBus(this.canvas).play({frequency,end:Math.max(20,frequency*endFrequencyMultiplier),duration,volume:gainValue*attenuation,wave:type,priority,pan,texture:texture?{...texture,volume:texture.volume*attenuation}:undefined,key,cooldown:priority>=2?.025:.018});\n    }\n    const audio = this.audio;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    let attenuation=1,pan=0;\n    if(this.f4Presentation&&position&&this.listener){[attenuation,pan]=spatial(...this.listener,position.x,position.y,position.z);}\n    if(attenuation<.015)return false;\n\n    const wallNow = performance.now();\n    if(this.f4Presentation){\n      if(document.pointerLockElement!==this.canvas||this.canvas.dataset.t21SourceAudio==='MUTED'||this.voices>=(priority>=2?12:8))return false;\n      if(priority<2&&wallNow-this.lastAudioEventMs<12)return false;\n    }else if (wallNow - this.lastAudioEventMs < 12) return false;",
    "next": "    const wallNow = performance.now();\n    if (wallNow - this.lastAudioEventMs < 12) return false;"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if(this.f4Presentation){gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,gainValue*attenuation),now+.006);}\n    else gain.gain.setValueAtTime(gainValue, now);",
    "next": "    gain.gain.setValueAtTime(gainValue, now);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    const panner=this.f4Presentation&&position&&typeof audio.createStereoPanner==='function'?audio.createStereoPanner():null;\n    if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(audio.destination);}\n    else gain.connect(audio.destination);",
    "next": "    gain.connect(audio.destination);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "oscillator.disconnect();gain.disconnect();panner?.disconnect();",
    "next": "oscillator.disconnect();gain.disconnect();"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": "import {WEAPON_PROFILES,type WeaponId} from '../weapons/WeaponCatalog';",
    "next": "import {WEAPON_PROFILES,type WeaponId} from '../weapons/WeaponCatalog';\nimport {f4AudioBus,priorityFor} from '../feedback/F4AudioBus.mjs';"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": " private ctx:AudioContext|null=null;",
    "next": " private ctx:AudioContext|null=null;\n private f4Mixer=false;\n public enableF4Mixer():void{this.f4Mixer=true;}"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": "   this.muted=!this.muted;\n   if(!this.muted)this.unlock();",
    "next": "   this.muted=!this.muted;\n   if(this.f4Mixer)f4AudioBus(this.canvas).setMuted(this.muted);\n   if(!this.muted)this.unlock();"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": " private unlock():void{\n  if(this.ctx){",
    "next": " private unlock():void{\n  if(this.f4Mixer){this.ctx=f4AudioBus(this.canvas).unlock();this.canvas.dataset.t21SourceAudio=this.ctx?'ENABLED':'UNAVAILABLE';return;}\n  if(this.ctx){"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": "  this.last.set(cue,now);\n  try{",
    "next": "  if(this.f4Mixer){\n   if(f4AudioBus(this.canvas).play({frequency:freq,end:Math.max(end,20),duration,volume,wave,priority:priorityFor(cue),texture:sourceCueNoiseTexture(cue,weaponId)??undefined,key:'source-'+cue,cooldown}))this.last.set(cue,now);\n   return;\n  }\n  this.last.set(cue,now);\n  try{"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "   this.feedback.enableF4Presentation();",
    "next": "   this.feedback.enableF4Presentation();\n   this.sourceAudio.enableF4Mixer();"
  }
];
const files=new Map(),read=path=>files.get(join(root,path))??readFileSync(join(root,path),'utf8').replace(/\r\n/g,'\n');
function update(e,allowExisting=false){let {path,old,next}=e,s=read(path);if(allowExisting&&s.split(next).length===2)return;if(s.split(old).length!==2)throw Error('HOLD anchor '+path+' '+old.slice(0,80));files.set(join(root,path),s.replace(old,next));}
const app="src/app/UndertowF3PlayablePreviewApp.ts",old="    const alive=this.resources.currentHp>0;\n    const playerStart=this.b20ProfileStart();",fallback="    const playerStart=this.b20ProfileStart();",next="    if(this.f4WholeTrimeshInstalled){\n     this.camera.getAimDirection(this.f4FeedbackDirection);\n     this.feedback.setF4Listener(this.player.getPosition(this.f4FeedbackPosition),this.f4FeedbackDirection);\n    }\n    const playerStart=this.b20ProfileStart();";
const alreadyV2=read('src/feedback/GameFeedback.ts').includes('public f4HandledSourceCues()');
if(!alreadyV2){
 for(const e of [...v1,...v2]){if(e.path===app&&e.old===old&&!read(app).includes(old))update({path:app,old:fallback,next},true);else update(e,true);}
 if(read(app).includes(zip.old))update(zip);else if(!read(app).includes(zip.next))console.log('HOLD optional zip hook');
}
for(const e of v3)update(e);
for(const name of ['F4FeedbackMotion.mjs','F4FeedbackMotion.d.mts','F4SpatialAudio.mjs','F4SpatialAudio.d.mts','F4AudioBus.mjs','F4AudioBus.d.mts']){const dest=join(root,'src/feedback',name),content=readFileSync(new URL('./'+name,import.meta.url),'utf8');if(existsSync(dest)){if(readFileSync(dest,'utf8').replace(/\r\n/g,'\n')!==content)throw Error('HOLD different module '+dest);}else files.set(dest,content);}
console.log('PREFLIGHT PASS',files.size,'files');if(process.argv.includes('--apply'))for(const [file,content] of files)writeFileSync(file,content);
