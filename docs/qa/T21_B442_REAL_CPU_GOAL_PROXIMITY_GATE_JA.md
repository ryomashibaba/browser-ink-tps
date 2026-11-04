# T21 B442 — 実CPUゴールと原作床への近接度を真正Chromiumで監査

**基準日：2026-11-04 / 研究ブランチのみ。** F1〜F5、原作SOURCE安全規則は変更しない。

## 今回実装した実機可観測性
- `src/app/UndertowF3SourceTraffic.ts`：B441が**原本Recast+Rapier経路検証を通して実際にacceptした場合だけ**、各CPUの最後の承認済みFrontゴール座標とnative tickを記録。読み取り専用 `snapshot().sourcePatrol.b442LastApprovedRealFrontTargets` として現在の本人CPU物理足位置・XZ距離を公開する。CPU移動・時計・他Actor・SOURCE形状には書き込まない。
- `scripts/t21-b440-short-native-original-foot.mjs`：従来B440標準URLはそのまま。研究フラグ `T21_B441_SOURCE_FRONTLINE=1` だけで原本SOURCEの7CPUと本物のCDP人間操作を起動。今回 `T21_B441_NATIVE_OBSERVE_TICKS=720` で本物の720tickを観測し、目標距離を各CPUごとに記録する。
- `.github/workflows/t21-b441-frontline-native-short.yml` は既存15分・隔離研究CIのまま上記720tickを実行。B440標準テストや旧成功B438（2回180秒）と判定を混同しない。

## 明確な「到達」判定
- 対象CPUはA2/A3/B1/B2/B3/B4のみ。A1は既存Human協調を継承。
- **原本から証明した実Recast goal** へのXZ水平距離 **<=1.5m** の観測が存在し、かつその時点の実CPU足と渡されたgoals witnessを照合したときに限り「承認目標に近づいた」と認定できる。元の7CPUが本当のsource runtimeで合流していること、読取tickが単調、本人のnative位置改変・時刻改変がないことを前提とする。
- この閾値は**原作世界での横断や公式CPU戦闘を証明しない**。最終スナップショットだけでなくtickごとの最短距離、停滞/戻りを観測する。
- **0件ならHOLD**。承認目標が0件や、ログとCPU足の距離が一致しない場合もHOLD。旧B441の「原作前線目標要求＋実移動」実績のPASSとは別判定する。

## 既存の実CPU前進の具体的比較対象
- 真正B441 [Actions #41829596416](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829596416) Artifact **13321497794** の241tickで、A2初終水平変位16.272m、B1 15.455m、B2/B3/B4 13.99〜14.18m。A/B間最短水平距離は元観測11個の初点 **106.064m**→終点 **98.429m**。両陣営間で接敵した証拠ではない。
- SOURCEは **25 solids /17 paint/26 links/0 scoreable**。公式winner **NONE**。7.2.0 Turfの原作敵陣侵入スロープのFace/Collision接続は未認証（そのスロープ追加は公式Ver2.0.0であり、Ver7.2.0は全ルール地形改修）。

## 判定後の実装選択
- **実到達が確認された場合**：原本同側の合法なゴール到達後のCPU維持・分散・自陣塗装を、実観測に基づいて改善。
- **近接できず停滞した場合**：CPUごとの実承認目標XZ、位置、近接度の時系列から渋滞位置を特定し、原本範囲内の分散経路だけを研究。敵陣へワープする対処を禁止。
- **クロスチーム接敵はどちらの場合でもHOLD**：元Mesh/Face/Collisionの版別照合で物理支持が証明されてから、全8Actorの連続Recast/Rapierルートと自然命中を別途試験する。

これらは計画と実装の現況を示す資料で、**新B442実機PASS判定の代用品にはならない**。
