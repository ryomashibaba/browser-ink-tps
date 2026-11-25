// On a chief-09-or-newer integration COPY only. node apply-f4-audio-fix.mjs <copy> [--apply]
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]??'.'),edits=[
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": "export function voiceAdmission(active,priority){return Number.isInteger(active)&&active>=0&&active<(priority>=2?12:8);}",
    "next": "export function voiceAdmission(active,priority){return Number.isInteger(active)&&active>=0&&active<(priority>=3?12:priority>=2?10:8);}\nfunction finishVoice(record,stop=false){if(record.finished)return;record.finished=true;for(const source of record.sources){source.onended=null;if(stop)try{source.stop(record.ctx.currentTime);}catch{}}for(const node of record.nodes)try{node.disconnect();}catch{}if(record.bus.live.delete(record))record.bus.active=record.bus.live.size;}\nfunction resetVoices(bus){for(const voice of [...bus.live])finishVoice(voice,true);bus.last.clear();}"
  },
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": "this.active=0;this.muted=false;this.last=new Map();",
    "next": "this.active=0;this.muted=false;this.last=new Map();this.live=new Set();"
  },
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": "    const ctx=this.makeContext();if(!ctx)return null;",
    "next": "    this.reset();\n    const ctx=this.makeContext();if(!ctx)return null;"
  },
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": " reset(){this.last.clear();}",
    "next": " reset(){resetVoices(this);}"
  },
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": "  const nodes=[],sources=[];let pending=0,admitted=false,failed=false;\n  const release=()=>{if(--pending===0){for(const node of nodes)try{node.disconnect();}catch{}if(admitted&&this.context===ctx)this.active=Math.max(0,this.active-1);}};\n  const connectSource=(node,output,duration)=>{sources.push(node);node.connect(output);node.onended=release;pending++;node.start(now);node.stop(now+duration+.012);};",
    "next": "  const nodes=[],sources=[];let pending=0;\n  const record={bus:this,ctx,nodes,sources,finished:false};\n  const release=()=>{if(!record.finished&&--pending===0)finishVoice(record);};\n  const connectSource=(node,output,duration)=>{sources.push(node);node.connect(output);node.onended=release;pending++;node.start(now);node.stop(now+duration+.012);};"
  },
  {
    "path": "src/feedback/F4AudioBus.mjs",
    "old": "   admitted=true;this.active++;if(v.key)this.last.set(v.key,now);return true;\n  }catch{failed=true;for(const node of sources)try{node.onended=null;node.stop(now);}catch{}for(const node of nodes)try{node.disconnect();}catch{}return false;}",
    "next": "   this.live.add(record);this.active=this.live.size;if(v.key)this.last.set(v.key,now);return true;\n  }catch{finishVoice(record,true);return false;}"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "import type {SourceCue} from '../audio/SourcePracticeAudio';",
    "next": "import {sourceShotTone,type SourceCue} from '../audio/SourcePracticeAudio';"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    if(this.playTone(\n      210 * profile.audioPitch,",
    "next": "    if(this.f4Presentation){\n      const tone=sourceShotTone(profile.id);\n      if(this.playTone(245*profile.audioPitch,(localPlayer?.025:.014)*tone.volume,.065*tone.length,tone.wave,130/245,0,localPlayer?undefined:position,weaponTexture(profile.weaponClass),localPlayer?'local-shot':'remote-shot')&&localPlayer)this.handledCues.add('SHOT');\n      return;\n    }\n    if(this.playTone(\n      210 * profile.audioPitch,"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "    this.playTone(260-intensity*75,0.024,0.075,'triangle',0.88,2,contact);",
    "next": "    if(this.playTone(260-intensity*75,0.024,0.075,'triangle',0.88,2,this.f4Presentation?undefined:contact,undefined,'local-hurt')&&this.f4Presentation)this.handledCues.add('HURT');"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,3,position,{volume:.04,lowpassHz:820},'splat')",
    "next": "this.playTone(82, 0.055, 0.16, 'sawtooth', 0.42,local?3:2,local?undefined:position,{volume:.04,lowpassHz:820},local?'local-splat':'remote-splat')"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(430, 0.035, 0.11, 'sine', 1.35,3,position)",
    "next": "this.playTone(430, 0.035, 0.11, 'sine', 1.35,local?3:2,local?undefined:position,undefined,local?'local-respawn':'remote-respawn')"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(frequency,.036,duration,wave,multiplier,3,position);",
    "next": "this.playTone(frequency,.036,duration,wave,multiplier,2,position,undefined,'special-'+kind);"
  },
  {
    "path": "src/feedback/GameFeedback.ts",
    "old": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,3,position",
    "next": "this.playTone(118, 0.055, 0.18, 'sawtooth', 1.72,2,position"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": " public enableF4Mixer():void{this.f4Mixer=true;}",
    "next": " public enableF4Mixer():void{this.f4Mixer=true;}\n public resetF4Mixer():void{if(this.f4Mixer){this.previous=null;this.last.clear();}}"
  },
  {
    "path": "src/audio/SourcePracticeAudio.ts",
    "old": "  if(now-(this.last.get(cue)??-Infinity)<cooldown)return;\n  if(this.f4Mixer){\n   if(f4AudioBus(this.canvas).play({frequency:freq,end:Math.max(end,20),duration,volume,wave,priority:priorityFor(cue),texture:sourceCueNoiseTexture(cue,weaponId)??undefined,key:'source-'+cue,cooldown}))this.last.set(cue,now);\n   return;\n  }\n  this.last.set(cue,now);",
    "next": "  if(this.f4Mixer){\n   f4AudioBus(this.canvas).play({frequency:freq,end:Math.max(end,20),duration,volume,wave,priority:priorityFor(cue),texture:sourceCueNoiseTexture(cue,weaponId)??undefined,key:'source-'+cue,cooldown});\n   return;\n  }\n  if(now-(this.last.get(cue)??-Infinity)<cooldown)return;\n  this.last.set(cue,now);"
  },
  {
    "path": "src/app/UndertowF3PlayablePreviewApp.ts",
    "old": "  this.feedback.resetF4Presentation();",
    "next": "  this.feedback.resetF4Presentation();\n  this.sourceAudio.resetF4Mixer();"
  }
];
const files=new Map();for(const {path,old,next} of edits){const file=join(root,path);let s=files.get(file)??readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(old).length!==2)throw Error('HOLD: missing/repeated anchor '+path+' '+old.slice(0,80));files.set(file,s.replace(old,next));}
console.log('PREFLIGHT PASS',files.size,'files');if(process.argv.includes('--apply'))for(const [file,s] of files)writeFileSync(file,s);
