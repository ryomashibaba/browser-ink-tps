#!/usr/bin/env node
/** W2: guarded transformation of ISOLATED QA copy only.
 * No edits to originals, stage geometry, NavMesh, paint, or actor poses.
 */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readFileSync,writeFileSync,realpathSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';

const names=['src/input/PlayerInput.ts','src/app/UndertowF3PlayablePreviewApp.ts'];
const sha=s=>createHash('sha256').update(s).digest('hex');
function once(src,needle,replacement,label){
 const count=src.split(needle).length-1;
 if(count!==1)throw Error('HOLD_W2_ANCHOR_'+label+'_COUNT_'+count);
 return src.replace(needle,replacement);
}
export function patchSources(player,app){
 if(player.includes('qaAxis')||app.includes('qaDriveTicks'))
  throw Error('HOLD_W2_PREVIOUS_QA_INPUT_PATCH_FOUND');
 let p=player,a=app;
 p=once(p,"  private readonly keys = new Set<string>();",
  "  private readonly keys = new Set<string>();\n  private qaAxis: Readonly<{x:number;y:number}> | null = null;",'INPUT_FIELD');
 p=once(p,"  public constructor(private readonly canvas: HTMLCanvasElement) {",
  "  public constructor(\n    private readonly canvas: HTMLCanvasElement,\n    private readonly deterministicQaEnabled = false\n  ) {",'INPUT_CONSTRUCTOR');
 const getterOld=[
 "  public get moveX(): number {",
 "    return (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);",
 "  }","",
 "  public get moveY(): number {",
 "    return (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);",
 "  }"].join('\n');
 const getterNew=[
 "  /** Only applied for opt-in paused source QA; actual Rapier KCC is retained. */",
 "  public setQaAxis(x: number, y: number): void {",
 "    if (!this.deterministicQaEnabled) throw Error('T21_QA_AXIS_NOT_AUTHORIZED');",
 "    if (![x,y].every(Number.isFinite) || Math.abs(x)>1 || Math.abs(y)>1)",
 "      throw Error('T21_QA_AXIS_OUT_OF_RANGE');",
 "    this.qaAxis = {x,y};",
 "  }",
 "  public clearQaAxis(): void {this.qaAxis = null;}",
 "  public get moveX(): number {",
 "    return this.qaAxis?.x ??",
 "      ((this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0));",
 "  }",
 "  public get moveY(): number {",
 "    return this.qaAxis?.y ??",
 "      ((this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0));",
 "  }"].join('\n');
 p=once(p,getterOld,getterNew,'INPUT_GETTERS');
 if(!a.includes('T21_F3_EXPLICIT_NONPRODUCTION_PREVIEW_ONLY')||
    !a.includes('T21_F3_QA_PHYSICAL_DRIVE_FORBIDDEN'))
  throw Error('HOLD_W2_NOT_FROZEN_QA_STAGE');
 a=once(a,'  this.input=new PlayerInput(canvas);',[
 "  const qa=new URL(location.href).searchParams;",
 "  this.input=new PlayerInput(canvas,",
 "   qa.get('t21Play')==='preview'&&qa.get('t21QaDrive')==='source'&&",
 "   qa.get('t21QaInput')==='deterministic'&&qa.get('t21KccAudit')==='readOnly');"
 ].join('\n'),'APP_INPUT');
 a=once(a,' private paused=false;',[
 " private paused=new URL(location.href).searchParams.get('t21Play')==='preview'&&",
 "  new URL(location.href).searchParams.get('t21QaDrive')==='source'&&",
 "  new URL(location.href).searchParams.get('t21QaInput')==='deterministic'&&",
 "  new URL(location.href).searchParams.get('t21KccAudit')==='readOnly'&&",
 "  new URL(location.href).searchParams.get('t21QaPauseOnBoot')==='1';"
 ].join('\n'),'APP_PAUSED_BOOT');
 a=once(a,'   advanceQaTicks:(count:number)=>this.advanceQaTicks(count),',
 "   advanceQaTicks:(count:number)=>this.advanceQaTicks(count),\n"+
 "   qaDriveTicks:(x:number,y:number,count:number)=>this.qaDriveTicks(x,y,count),",
 'APP_QA_API');
 a=once(a,' private advanceQaTicks(count:number){',[
 " /** Preserve actual PlayerController, CPU, Rapier and native 60Hz tick. */",
 " private qaDriveTicks(x:number,y:number,count:number){",
 "  const qa=new URL(location.href).searchParams;",
 "  if(qa.get('t21Play')!=='preview'||qa.get('t21QaDrive')!=='source'||",
 "     qa.get('t21QaInput')!=='deterministic'||qa.get('t21KccAudit')!=='readOnly'||",
 "     !this.paused||document.pointerLockElement===this.canvas||",
 "     this.stopReason||!Number.isSafeInteger(count)||count<1||count>96)",
 "    throw Error('T21_QA_DETERMINISTIC_INPUT_FORBIDDEN');",
 "  this.input.setQaAxis(x,y);",
 "  try{return this.advanceQaTicks(count);}",
 "  finally{this.input.clearQaAxis();}",
 " }",
 " private advanceQaTicks(count:number){"
 ].join('\n'),'APP_QA_METHOD');
 if(!p.includes('T21_QA_AXIS_NOT_AUTHORIZED')||
    !a.includes('T21_QA_DETERMINISTIC_INPUT_FORBIDDEN'))
  throw Error('HOLD_W2_SAFETY_GUARD_MISSING');
 return {player:p,app:a};
}
export function apply({sandbox,original}){
 if(!sandbox||!original)throw Error('HOLD_W2_EXPECTS_SOURCE_PATHS');
 const root=realpathSync(resolve(sandbox)),source=realpathSync(resolve(original));
 if(root===source||root.startsWith(source+sep)||source.startsWith(root+sep))
  throw Error('HOLD_W2_SANDBOX_OVERLAPS_SOURCE');
 const files=names.map(name=>join(root,name));
 for(const f of files){
  if(!existsSync(f)||lstatSync(f).isSymbolicLink()||!lstatSync(f).isFile())
   throw Error('HOLD_W2_EXPECTED_SOURCE_MISSING');
 }
 const old=files.map(f=>readFileSync(f,'utf8'));
 const revised=patchSources(old[0],old[1]),next=[revised.player,revised.app];
 // All source structure gates have passed BEFORE the first isolated write.
 files.forEach((f,i)=>writeFileSync(f,next[i],'utf8'));
 return {schema:'t21-f4e103w2-isolated-stage/v1',
  status:'PASS_ISOLATED_QA_PATCH_NOT_DEPLOYED',
  changes:names.map((path,i)=>({path,oldSha256:sha(old[i]),newSha256:sha(next[i])})),
  geometryModified:false,navModified:false,productionAuthorized:false};
}
