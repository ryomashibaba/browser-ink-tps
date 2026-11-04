# T21 B449 — B448 A3本物SOURCEゴールの「方向付き」移動検証

**2026-11-04 JST／研究ブランチ。** B448の研究用A3再承認が「CPUがどこかへ0.5m動いた」ことだけを成功条件にしている危険を防ぐため、**別の真正Chromium Artifactで本人のゴール方向への移動**を認定する独立二者比較を追加した。

## 根拠と仕様
- B446基準：[Actions #41846226630](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846226630) SUCCESS、Artifact **13330584207**。A3の実足から元SOURCE正規足場/経路を15件dry PASS、ただし**Crowdゴールとしては未採用**。B2/B4は同条件で各0件。
- B448研究コード：[c2a910a](https://github.com/ryomashibaba/browser-ink-tps/commit/c2a910a49fe62e9f537f6a137b36e2ecf22d7ecb)。`t21W10B441=sourceFrontline`と追加 `t21W10B448=realA3Front` の両方を満たす場合のみ、真正CPU A3の今の物理足から再検証し既存Crowdに元SOURCEゴールを渡す。デフォルトやB2/B4は変更しない。
- B449純粋監査：[code/test commit 18cd6ce](https://github.com/ryomashibaba/browser-ink-tps/commit/18cd6ce1d9ff781841b9d90d103c0138c3551b94) と[独立高速CI #41849644085](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41849644085) **SUCCESS**。Node構文・unit **3/3 PASS**、偽SOURCE・Actor・目標・world・tick等10変異を拒否。
- 比較CLI：
  `node scripts/t21-b449-a3-real-goal-progress.mjs <B446_native.json> <B448_native.json>`
  JSONの実装名はArtifact内 `b440-short-real-original-human-foot.json`。CLIは**B448が実PASSを記録したArtifactにだけ適用する**。B448未完了なら合否を作らずHOLD。

## 独立の承認条件
1. B446/B448が**別のChromium worldTimeOrigin**で、元SOURCE25/17/26/0、7CPUの実足、オリジナル時計・Actor・scoreのwrite0。偽の勝敗NONE、公式4v4認定false。
2. B446でdry PASSしたA3の**原作右低地の唯一の候補座標**と、B448でA3が真に受理した全標本の元Recast goalが各XYZ差0.001m以内。単に任意の同側床の場所へ動いたデータでは不可。
3. native24tick間隔の複数観測時点における**同一目標への物理XZ距離**が、最初の観測から最も近づいたサンプルまで**0.5m以上縮まった**。その間の本人実足の水平移動も**0.5m以上**ある。目標の変更や偽座標はHOLD。
4. B448元プログラムの `b448A3RealEvidence.actualOriginalGoalsAuthorized===1`、`actualNativeGoalRequests>0`、`verifiedSourceOnlyGoalPass===true` 等を保存済み実Artifactから確認。B449はその上で独立した物理実績を確認する。
5. 合格してもこれは**A3の同側原本床ゴール方向への実移動**のみ。7.2.0 Turf正規Face/Collision、敵陣横断、敵への実命中、HP/撃破/復活、公式score/winner、正式4v4、ART・productionはすべてHOLD。

## 状態
- B449のコード・自動テスト：**完了、CI SUCCESS**。
- B448の[真正実走 #41847809446](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809446) は作成時点で**実行中**。Artifact確定まで新機能の実走PASSは**未認証**。
- 通常B440/B441および二試合180秒フル回帰の新SHA試験はB448実走と独立に評価する。
