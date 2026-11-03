# T21 SOURCE実塗装セル対比のプレイ表示（F3継続）

実体：`src/app/B417SourcePaintedCellView.ts` / 既存F3の左上コンパクトHUD（B411/B414/B415の下）。

原作から既に取得されているB401 `17 PaintSurfaces` の実ownerGrid集計のみを用い、A・Bの**実Painted Cell数**を可視化する。棒グラフは **A+Bの既塗装セル内だけでの比率**を示し、ステージ総面積の公式占有率ではない。ラベルに `UNSCORED` と明示し、Scoreable0のまま、Winner NONE・正式4v4 HOLD。過去のHUDに表示していた数値を再利用し、原作幾何/CPU/HP/移動/武器/インクへの書き込みなし。

安全条件：原作25/17/26/0、B401のLIVEで17独立GRID・active cell総数とA/B/neutral一致、sampleNativeTickの現在時刻との整合、データ/単位/scoreable/winnerの真正フラグを満たす時だけ描画。それ以外は非表示。更新は既存のB401ネイティブ実GRID集計を **read-onlyで参照するだけ**（グリッドを毎フレーム再走査しない）。TIME_UPとHOLDでは非表示。元F3通常ゲーム/正式T20/QA/Mainは無変更。

合格は既存の同一180秒Chromiumにおける実HUDの視認、A/B数字と真B401グリッド、play vs TIME_UPを別々に確認した場合のみ。静的Vitestとビルドだけでは真正ブラウザ表示を認証しない。

**この工程はF3で自然な敵撃破が成立したことの代用ではない。** 敵B1～B4が別岸に分離し、元の±Zルートは0/12未接続。敵への無根拠なHP操作/ワープ/公式得点作成は禁止。F3の本命は自然なCPUとの本当の射撃→HP減少→撃破→150tick復活の一体化。


## 2026-11-04 B417真正試合の可視化照合・F3 CPU自然経路の修正

- B417最初の実装SHA `6dd24e4e76dbd5283697ad625497b81e002202fb`。元17 active PaintSurfacesのCPU-authoritative ownerGridを既存B401が読む。本物のA/B/Neutralセル数と、塗装済みセルA/(A+B)の比率を実HUDで表示。公式Scoreable/勝敗には**一切使わない**。元測定が異常・古い、非PLAYINGなら表示しない。
- コードSHA `10ce04f6ab6ae60e7ea0367bd06356f7d94063c7`。真正CDP同一180秒ランナーに `b417-true-native-source-cells-hud.json` を追加し、**実90秒、OWN補給・人間再射撃後、実TIME_UP**の3時点で元B401の実登録17 ownerGrid集計と実DOMのセル数・表示文字・CSS棒グラフ・サンプルnative tickを比較。実データ不一致はfail-closed、源データやゲーム所有面の書き込み無し。
- 同SHA、`CpuAgentSystem.ts` のSplatana型CPUだけが近距離で `navigation.closestPoint(enemy)` を直接 `requestMoveTarget` へ送っていた経路を原作SOURCE実験では停止。既存正常F3 `chooseSourceGoal` のネイティブRapier foot＋Recast連続経路審査を利用し、T20通常の挙動は変更しない。敵の自然撃破や新原作ナビリンクの達成と混同しない。
- 新ゲーム統合ジョブ [#41732151648](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41732151648)、一世代前B417 [#41730182445](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41730182445) は本記録時点で**事前Node/Vitest/ビルドPASS、真正180秒/RAW結果まだ未確定**。合否・性能・ART・敵戦闘成功は本物の最終ログ/JSONで後から決める。
- B414完全同SHAの真正 [#41728078065](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41728078065) は **全SUCCESS**、artifact `13277465598`、tick11860。B409–B414と物理移動・本物のshot/OWN補給/reshotを統合実証。人間115 shots / 1126 changed original cells、CPU147 shots /11970 changed original cells、敵直接Hit/Splat 0、得点/公式勝者なし。B414独立HUD：100→83.85、OWN補給3時点、復帰96.18、再射撃85.05、全DOM真正条件PASS。**B417・CPU修正のPASSを旧SHAから転用禁止**。
- 固定方針：F1–F5、原作Ver.7.2.0通常ナワバリ、25/17/26/0、natural 0/12、正式4v4/HP戦闘/Official Turf/ART/production HOLD、main/T19C/T20/正式QA/PR5/Pages 保護。Workは別承認。
