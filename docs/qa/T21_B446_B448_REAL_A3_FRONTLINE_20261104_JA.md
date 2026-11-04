# T21 B446→B448：真正CPU足からの原作前線経路 / A3だけの研究用実ゴール

**2026-11-04 JST。** 既存のF1〜F5・原作幾何SOURCE25 solids/17 paints/26 links/0 scoreableを固定。main・正式QA・PR#5・Pages・公開なし。原作SOURCE/他Actor/時計/Score/HP・勝敗の書換なし。B446のdry probeは移動権限ではない。

## B446：2つの別真正Chromium SOURCE worldの実証
- [B445旧実装 #41840777818](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840777818) SUCCESS、Artifact **13330170325**。対照は[B446型修正版 #41846226630](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846226630) **SUCCESS**、Artifact **13330584207**。両方真正7CPU・720 native tick以上、別browser timeOrigin、既存SOURCE同一。
- [B447独立JSON整合検証](https://github.com/ryomashibaba/browser-ink-tps/commit/14285d75c60d33a70acd1a74de3ac9f8304c14b9) はCPU本人の実原本着地点・実足・候補の拒否勘定・元SOURCE/clock/score/Actor禁止、別世界IDを検査。単体3/3、改ざん10種類拒否。[B447 CI #41847107640](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847107640) SUCCESS。

| CPU | 静的初回着地点の32候補 | 生きたCPU実足からの32候補 | 静的Recast拒否の内訳 | 実足Recast拒否の内訳 |
| --- | --- | --- | --- | --- |
| A3 | **0 PASS** | **15 PASS** | 経路中間元床支持で30 | 中間支持15、原本床境界2 |
| B2 | **0 PASS** | **0 PASS** | 経路中間元床支持で30 | 中間支持30、原本床境界2 |
| B4 | **0 PASS** | **0 PASS** | 経路中間元床支持で30 | 中間支持30、原本床境界2 |

- 3体の static/from-live の Recast unreached/start-snap/end-snap 不成立は0件。残りは厳格な **原作中間支持** の拒否。A3が適用可能かはCPUの実位置に依存する。
- A3 live tick1067 `[3.5986366272,3.1354997158,53.4511680603]` から原作候補 `[3.3755992890,4.502,37.9925066881]` は元床Footprint/B130クリアランス・元Rapier・native Recast全中間元床支持を**読み取り専用で確認**。B2/B4の「横断不能を全面証明」とは言えないが、現時点の合法な前線候補は**HOLD**。

## B448：新しい合法A3目標の研究オプトイン
- [実装コミット c2a910a](https://github.com/ryomashibaba/browser-ink-tps/commit/c2a910a49fe62e9f537f6a137b36e2ecf22d7ecb) では通常preview/既存B441が勝手にB448へ変わらないよう **追加 `t21W10B448=realA3Front`** のみ有効化。
- A3だけにB446の**同一native tickの本当の本人足**で原本dry passがある場合、その点が既存 `proposeB441OriginalFrontline` の「UndertowT21D:right-low-team-a」内側の正式候補と一致することを確認。さらにRapier hit/原本Solid ID/B130境界>=0.75m／実CPU足とgoal双方の物理支持／Recast end/start snap<=0.2m／全0.30m原本中間点支持を**直前に再検証**してからだけ、本物のCrowdにoriginal SOURCE同側goalを渡す。
- この再検証を通ったとしても**本当に物理CPUが到達するかは別の真正結果が必要**。A3/B2/B4を人工的に移動させる方式ではない。B443の保持ロジックは既存のまま、B2/B4はこれまでのHOLD。
- [B448 A3真正720tick #41847809446](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809446) は `T21_B448_A3_REAL_ORIGINAL_FRONT=1` で直接実A3 goal requests/原本水平移動>0.5mを検査。**結果が出るまでB448実走PASSは未認証**。
- [通常B440 #41847809357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809357)、[従来B441/B443研究 #41847809034](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809034)、[二試合180秒 #41847808958](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847808958) はそれぞれ独立回帰。

## 別系統フル試合の失敗を隠さない
- 旧B446修正版の [Actions #41846075962](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846075962) は **FAIL**。B320/B321中に元ランプ実接地と上昇途中は存在したが、B322真正上端→次originalFloor連続KCCを認証できず `B140_B322_REAL_ORIGINAL_RAMP_UPPER_EXIT_NOT_CERTIFIED` により中止、Artifact **13331477616**。この原本ルートは見せかけ成功ではなく**HOLD**。
- 前のコードSHAで実証した2試合180秒PASSは独立した本物の成功として保持。ただし旧SHA PASS ≠ B448版PASS。
- 2.0.0で追加された敵陣侵入スロープと7.2.0全面地形改修の本物SOURCE Face/Collision対応、自然対岸横断、HP/撃破/150tick復活/score/winner、正式4v4、ART/productionはすべてHOLD。

**採用判断**：新B448実走Artifactで、本人A3の元ゴール要求と原作KCC真正移動が立証されれば研究用PASSとする。原本横断/敵への命中/正式4v4の昇格は禁止。
