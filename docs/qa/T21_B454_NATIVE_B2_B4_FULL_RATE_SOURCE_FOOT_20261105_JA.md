# B454 — 本物のCPU B2/B4 60Hz物理足と登録済み原本Rapierの連続観測

2026-11-05 JST。元F1–F5継続。main/正式QA/Draft PR/Pages、原本SOURCE 25/17/26/0と全本番経路を保護。

## 前の真正結果

- B452 [#41858782560](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41858782560) SUCCESS、Artifact #13338054747、実7CPU/724tick。30/31個の実CPU足の疎標本と元Recast高度不一致30件を同じ実Chromium世界で比較。最短水平距離 B2=0.227532m（その世界では20cm未満にはならず）、B4=0.127096m。B451の別世界での0.074m/0.061mは再現必須の閾値ではない。旧24tick標本は観測間隔で最長27tickが未観測。
- B453 [#41859571437](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41859571437) SUCCESS、Artifact #13342167622。修正後 B326+B324の原本上段真KCC延長5.113554mがB409独立監査を通過し、二つの実180秒世界B430と第二試合の実人間SOURCE歩行B438まで全ジョブ成功。1試合目実Human119shots・1154 changed cells、CPU146 source shots・12412 changed cells、2試合目Human19shots・CPU112 source shot requests。敵CPU HP HIT 0、自然対岸0/12、Scoreable0、winner NONE。前FAIL #41855055248も記録維持。

## 本工程

既存のSOURCE B441研究URLだけ、*既存本物のCpuAgentSystem物理ステップが完了した後*の native traffic.observe(frame) で、B2/B4の実Rapier KCC足を毎native tick読み取る。各実foot（XYZ）に、登録済み25原本Rapier solidへのread-only静的rayを照射。足のyと元Rapier hit Y、0.25m従来許可閾値以内か、CPU mobility/life/rejoin、元B-side範囲を記録する。1200個/CPU上限付き（長時間研究時はOVERFLOWを独立監査で拒否し、元ゲームは動かしたまま）。ゲーム・元SOURCEのポーズ、time、score、AI目标、KCC制御、Recast生成は不変。通常のSOURCEプレビューではextra rayなし。

B440真正短時間7CPUが終了した後、別ファイル b454-native-b2-b4-physical-60hz.json に保存し、同一世界の疎標本B440と每tick配列を照合する。連続したtick番号、原本static hitと元0.25m以内割合、実1tickあたり最大XZ差、拒否Recast点への最短距離を独立監査。毎tick静的Rayは**完全KCC接触マニフォールド証明でも経路承認でもない**ため、B2/B4新ゴール・自然対岸・敵交戦・正式4v4を解禁しない。新しい長時間CIは作らず既存B441短時間nativeに同梱。最終ActionsとArtifact前は真正PASS未認証。
