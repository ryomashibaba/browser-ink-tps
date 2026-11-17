# Browser Ink TPS / T21 V28 — QA Issue #18, 第4実装ロット

**2026-11-17**  
対象GitHub: `ryomashibaba/browser-ink-tps`  
基点研究本線: `e442edb5796a9633d25a72c661fc84bf5e34d7ce`  
専用ブランチ: `research/t21-v28-qa-route-cpu-cause-lot4-20261117`  

## 本ロットの目的と制約

実試合の「B2/B4が8〜10秒止まる」「敵HP/撃破/150tick復活が発生しない」「B487真Recast対向経路0/16」を、**実CPUの原作目標認可失敗、原作Rapier/KCC移動拒否、自然接敵不成立**に区別する。これはQAが正しい修正箇所を特定できる機能改善であり、CPU移動や本当の経路を生成するゲーム本体の修正ではない。

main / Pages / 正式QA / StageDefinition / CPU / 物理・武器・HP・ink ownership・スコアの実装には変更を加えていない。原作SOURCE `25 solids / 17 paint / 26 navigation links / 0 scoreable`、F4 HOLD、正式4v4 HOLD。

## 新たに確定した真正RAWの実際の拒否地点

過去の**唯一の既存真正Chrome** [Actions #44035240101](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44035240101)、同一SOURCE [artifact #14306494291](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44035240101/artifacts/14306494291)。原本SHA256: `c7bac7e86824706efabb3cc98b104a5fdcdde3567f2fa7f38cbbfb364e88e74d`。

| 正真正銘の原作側観測 | CPU B2 | CPU B4 |
|---|---:|---:|
| 連続原作Rapier床支持 | 732/732tick | 732/732tick |
| ほぼ連続静止 | 506tick / 約8.43秒 | 577tick / 約9.62秒 |
| 本物の原作目標候補 | 32件 | 32件 |
| 真正Rapier/Recast審査で拒否 | 30件 | 30件 |
| 認証済みの既存SOURCE目標 | 0件 | 0件 |
| native runtimeの目標選択 | 44回 | 44回 |
| 「認証された原作目標なし」 | 44回 | 44回 |
| 真正SOURCE Crowd goal要求 | 0回 | 0回 |
| 実probe先頭の拒否原因 | `NATIVE_PATH_RAPIER_HEIGHT_MISMATCH` 30件 | 同30件 |
| Rapier床と経路サンプルの垂直ギャップ（実値） | 0.2538〜0.2857m | 0.2519〜0.2875m |

したがって、**B2/B4は空中に落下しているというより、原作床の上で新しい目標候補のRapier/Recast支持検査に失敗し、移動可能な認証済み目標が出ていない**ことが旧実試合で確認できる。これが停滞の強力な説明候補である。

ただし「全瞬間の唯一の停止原因」「特定武器のcharge/guardは無関係」「最新e442edb5でもこのとおり」とは断定しない。新たな生の `cpuSourceNativeGroundMotion` のKCC `rejectionCauses` を同じ試合から保存できるようにしたが、今回は新しい実機試験を実施していない。

## さらに優先される正式4v4の遮断条件

既存 [Actions #44035240101] のB486/B487/B488から、Human→最短敵 112.298m、味方→敵 86.793m、敵味方3m未満サンプル0件、真正Recast対向16組の報告経路 **0/16**。SOURCE実Projectileは7CPUが発射し、登録面へ塗装する一方で、人間→敵CPUのHPイベント0件、CPU撃破0件、CPU復活0件。150tick復活の正常性は未実証。

**目標が認可されない問題を解消しても、原作F4の実経路とcollision flags・既存カプセル半径での連続Rapier通過が証明されなければ、自然な敵HP・撃破・復活は認証できない。**

司令塔によりPR #45だけは、真の4+4スポーンで `T21_QA_SOURCE_SPAWN_INSUFFICIENT_ORIGINAL_SUPPORT_positive-z_0` 等2件FAILのため保留。これを避ける偽support・新床・NavLink増設・試験緩和は禁止。

## QA担当が実装した、今後の本物の試合に直接働く機能

1. `scripts/t21-v28-qa-native-playability-blockers.mjs`：実B440、実B454の連続60Hz B2/B4足元、実B445のSOURCE目標認可、実B446のRapier/Recast乾式原作経路拒否を**同一document / 同一native観測時刻**で照合。原作床支持・長時間停止・各目標44回中の不認可・拒否高さの分布を原因別に保存する。継続的な移動改善や4v4 PASSを捏造しない。
2. **既存の真正B440ランナーを実修正**：既に真のB484 PLAYER HUD、B486/B487/B488、B454 60Hz、B445/B446が採取された際、収集済みの `actual.cpu.cpuSourceNativeGroundMotion`（原作Recast proposal・Rapier KCC accepted/rejectedの本物のcounter）を合流し、`qa-issue18-native-gameplay-blockers.json` に保存。診断に必要な実証が欠けた場合は `HOLD_MISSING_AUTHENTIC_BLOCKER_EVIDENCE` として元の実試合を改変せずに保存。
3. CPU/stage/Combatへ渡す**本物の最短の阻害要因**を `ORIGINAL_OPPOSING_RECAST_CONNECTIVITY_0_OF_16` と記録。CPU別では `HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED` と、認証済み目標が存在するのに止まる `HOLD_GROUNDED_LONG_STALL_CAUSE_UNRESOLVED` を区別。実プレイを偽PASSにしない。

これはQAランナーの実動作改善であり、ユーザーに公開するゲーム本体の自然移動・HP機能を修正したという意味ではない。実CPUの修正はIssue #14、Stageの原作4+4/F4接続はIssue #13、実HPと復活の認証はIssue #15に残る。

## CI・真正実証

- [Actions #44039189856](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44039189856)：実B440ランナー構文チェック、27/27 Node QA回帰PASS。
- [Actions #44039336898](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44039336898)：同じ27/27 PASS **＋過去の真正GitHub Artifactを読み取り専用で再取得**。B2/B4の44回目標不認可、30件の高さ不一致拒否、B487の0/16、実HP 0を新コードで**実RAW照合PASS**。
- GitHub Actionsの `actions/download-artifact@v4` は保存済み原本を再利用するため、**新しいChromium、4+4スポーン、720tick、180秒の再試験は一切行っていない**。
- **e442edb5における新しい実移動・4+4・F4・HP/撃破/復活の真正証明は未実施/HOLD**。CI成功をゲーム完成と表示しない。

## 次の実務優先順位と役割境界

- **Stage #13**: PR #45の現実のpositive-z原作スポーン支持FAILを、該当ソースのRapier/collision flags/実足元から解消。原作への証拠のない変更は禁止。
- **CPU #14**: 真の目標候補B2/B4 32件中30件の `NATIVE_PATH_RAPIER_HEIGHT_MISMATCH` を、実Rapierカプセル中心・本来の足元基準・Recast intermediate yとの関係で調べる。単純に閾値を拡大するだけでなく原作衝突物理を尊重。ガードや充電中停止、KCC拒否も独立して確認。
- **Combat #15**: 自然接近ができるようになった後、実CPU HP0→同一Actor撃破→150 native tick復活を真正イベントで認証。0/16の段階で勝手な敵や遠隔ダメージは生成しない。
- **QA #18**: 真正試験は司令塔・Stage/CPUと事前にまとめて1回だけ。B440から新しいコードが実際に持ち込んだ `cpuSourceNativeGroundMotion` を検証し、本当に移動距離と安全な実経路に改善があるか比較。正式QA、Pages、mainを変更しない。

