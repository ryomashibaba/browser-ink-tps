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


## 2026-11-04 08時台 最新真正結果・実画面・修正詳細

- **初回機能の成功**：SHA `6dd24e4e76dbd5283697ad625497b81e002202fb` の真正 [Actions #41730182445](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41730182445) は **全SUCCESS**。Artifact `13276274727`。本物の `B409_REAL_ROUTE_MID.png` には左上コンパクトHUDに原作A **6,431** / B **6,133** の `SOURCE PAINTED CELLS`、`UNSCORED` の表記と両チームの棒グラフが表示された。元のB401 live SOURCE 17-gridのみを参照する実装。**このSHAで専用のDOMとB401独立3時点一致監査を通したと主張してはいけない**（専用証拠を追加したのは次のSHA）。
- **同一真正180秒実績**：TIME_UP tick **11856**、人間 **114 shots / 1158 changed original cells**、CPU **150 source shot requests / 12227 original changed cells**。B409–B414独立SOURCE限定PASS。実敵命中0・撃破0・原作SOURCE所有セル≠正式Turfスコア。
- **新3時点DOM照合＋Splatana SOURCE追跡修正**：SHA `10ce04f6ab6ae60e7ea0367bd06356f7d94063c7`。新真正 [Actions #41732151648](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41732151648) は**FAIL**、artifact `13277011966`、本物の `b322-actual-original-ramp-crest.json` によれば、3つの本物の原作坂KCC支持時点と実上段 `UndertowT21D:right-low-team-a` 接地まで達したが、B322の独立認定に必要な原作坂内実上昇量が **0.31891632080078125m** で固定 **0.32m** に届かず `HOLD_NO_TRUE_ORIGINAL_CREST_SUPPORT`。単体検査/ビルドPASS、失敗はF2物理証拠のみ。したがってB417追加3時点DOM実証は**未実施・HOLD**（後段に到達していない）。既存原作支持床や物理閾値を変更しない。
- **修正SHA `97d34a2b081aca3ab392fad042d7567806f571a6`**：B322直前に本物の `KeyS` 1 native tickリクエストで元登録坂上を短く後退し、本物の `b312Ledger` 両時点を独立安全審査する。実身体の後退後も元RAMP_SOLID支持、17 owner grid、実native tick、元source/actor非改変、0.60～0.77原作坂長手比率、物理移動幅・高度・足元ギャップに違反すれば**即HOLD**。正規の `KeyW` 上り直しで旧B322 **maxAscent>=0.32m、3 native KCC坂サンプル、長手率>=0.90、上段床実支持** をそのまま要求。元SRC geometry・weapon/AI・CPU足元・scoreableは不変更。Unit新実条件と違反ケースを追加。
- 最新 [Actions #41739563081](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41739563081) は記載時点で Node/Vitest・ビルド・preflight PASS、真正180秒は**in_progress**。結果が出るまではB322修正もB417同一SHA3時点一致も未認証。**次工程は最終Actions/RAWを確認して初めて合否を確定**する。

固定方針：正式4v4・原作をまたぐ敵との自然交戦/HP撃破/150tick復活・Scoreable0の公式得点/勝敗・ART・releaseは未認証。main、正式QA、T19C/T20、PR5、Pagesに無断変更なし。

## 2026-11-04 B418 本物の上段経路失敗原因と保存高速化

- 最新の旧run [#41739563081](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41739563081) は全体**FAIL**、保存artifact `13281465260`（33ファイル）。元坂後退・再上昇は真正原作 `B322` PASS、B324 原作上段支持と連続KCCも PASS。人間112 shots / 1139 original paint changed cells、CPU144 shot requests /11974 changed cells、真正TIME_UP tick11860まで実行。**ゲーム全体B409独立PASSには達していない**。
- **B326実失敗の正確な原因**：元 `b326-extended-original-upper-floor.json` では本物の6件CDP KeyWが発生。独立監査でstep1～5 は原作上段支持・無入力drift0、累計 **2.5131070325913005m**。step5後tick2212→step6直前tick2215に、入力なしの3tick間で実body位置が **0.1923316141078184m**進行。閾値 `idleDrift<=0.15m` に違反、`firstUnsupportedStep=6`・`realOriginalSupportedSteps=5`・`extendedUpperFloorProven=false`。**0.15mは一切緩めない**。上段床への接地をもってB326合格としない。
- **B417生の3点**：同旧runの `b417-true-native-source-cells-hud.json` について元RAWをプログラムで照合。実90秒 tick6464：native sampled tick6414、A6295/B6133、画面棒50.65/49.35%。実再射撃後 tick6725：sampled tick6677、A6445/B6133、棒51.24/48.76%。真TIME_UP tick11860：native tick11775、A6925/B6188、棒52.81/47.19%だが実HUDは非表示。各時点の `source 25/17/26/0`、17-grid count・total A+B+neutral・DOM数字・文字・棒・native tick・UNSCORED・公式勝者NONEを**実元ファイルに対し全項目照合PASS**。これは **B417の実可視化限定証拠**であり、旧run全体のFAILを覆すものではない。
- **B418修正SHA `99cab8bfdcb134104b9c895e24770b31e787852e`**：長い元SOURCE17-grid `b312Ledger`を1歩ごとに `JSON.stringify` + `writeFileSync` していた制御ループを、同じ `b326AuditExtendedUpperFloor` による即時メモリ審査のみに変え、走行区間終了後に同一の全実native before/after・監査判定・写真を保存。仮説はディスク書込/シリアライズが実キー入力の間隔を拡大し得ること。**まだ因果関係や真正PASSは未確定**。
- 回帰：B326既存5試験に加え、元RAWで観測した `0.192331614m` 無操作driftは旧閾値で厳格REJECT、6歩かつ2.5m以上の正常例はPASS、5歩止まりはHOLDをunitで確認する設計。最新 [Actions #41741444484](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41741444484) の真正18０秒と独立QAは最終未確定。新SHA同一試行のログを確認すること。

固定：原作25 Rapier solids/17 owner grids/26 NavLinks/0 scoreable、自然対岸0/12、真4v4敵HP撃破/150tick復活/公式勝敗・ART/公開**HOLD**。main/正式QA/PR5/Pages、T19C/T20不変更。
