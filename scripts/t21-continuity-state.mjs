#!/usr/bin/env node
// Cheap report-derived pointer. Does not certify gameplay, touch original assets,
// read private evidence, fetch remote data or modify a repo.
import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const ROOT='https://github.com/ryomashibaba/browser-ink-tps';
const QA='dev/t21-f4e103w-qa-infra';
export function latestQaReport(names){
 return names.flatMap(name=>{
  const m=/^W10-B([0-9]+)-.+\.md$/.exec(name);
  return m?[{name,number:Number(m[1])}]:[];
 }).sort((a,b)=>b.number-a.number||b.name.localeCompare(a.name))[0]??null;
}
export function makeLiveState({names,load,head}){
 if(!/^[0-9a-f]{40}$/.test(head))throw Error('INVALID_QA_HEAD_SHA');
 const latest=latestQaReport(names),body=latest?load(latest.name):'';
 const evidences=[...body.matchAll(/https:\/\/github\.com\/ryomashibaba\/browser-ink-tps\/actions\/runs\/\d+/g)];
 const verdicts=[...body.matchAll(/W10[-–]B\d+\s+verdict:\s*([^\n]{0,100})/gi)];
 const nexts=[...body.matchAll(/\bNext\s+W10-B(\d+)\b/gi)];
 const next=nexts.at(-1)?.[1]??(latest?String(latest.number+1):'?');
 const report=latest?'W10-B'+latest.number:'不明';
 const reportUrl=latest?ROOT+'/blob/'+QA+'/docs/qa/'+latest.name:'なし';
 const verdict=verdicts.at(-1)?.[1]?.replace(/\*\*/g,'').trim()??'明示判定なし（未確認）';
 return [
 '# Browser Ink TPS — 自動生成の引き継ぎ状態（未認証キャッシュ）',
 '',
 '**QA現在HEADと一致しない場合は必ず破棄。** 文書由来のPASSは実CI認証を意味しない。',
 '',
 '- 同期元QAブランチ: \`'+QA+'\`',
 '- 同期元QA HEAD: \`'+head+'\`',
 '- 最新番号のQAレポート: '+report+' — '+reportUrl,
 '- レポート記載の判定: '+verdict+' （CI・JSONと要照合）',
 '- 次工程候補: W10-B'+next+' （着手・完了の保証ではない）',
 '- レポート記載のActions: '+(evidences.at(-1)?.[0]??'確認できない'),
 '- 原作認証権限: 25 solids / 17 paint / 26 NavLinks / 0 Scoreable',
 '- 相手陣接続: 0/12（新しい原作認証が確認されない限りHOLD）',
 '- 正式4対4: HOLD（明示承認なしに解除禁止）',
 '',
 '## 起動',
 '1. QAブランチの今のHEADを直接読む。同期元SHAと照合。',
 '2. 固定方針: '+ROOT+'/blob/'+QA+'/docs/continuity/START_HERE_JA.md',
 '3. 同一SHAの最新実装・QA文書・Actionsと実測JSONを照合。',
 '4. 本当に遊べる原作通常ナワバリへ向けて、次の有益な工程を行う。',
 '',
 'この情報はQA pushから生成し \`meta/t21-continuity\` に保存。main、Pages、QAのソースは自動変更しない。',
 ''
 ].join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const dir=resolve('docs/qa'),names=readdirSync(dir);
 const head=process.env.GITHUB_SHA??process.env.T21_CONTINUITY_SOURCE_SHA??'';
 process.stdout.write(makeLiveState({names,head,load:n=>readFileSync(resolve(dir,n),'utf8')}));
}
