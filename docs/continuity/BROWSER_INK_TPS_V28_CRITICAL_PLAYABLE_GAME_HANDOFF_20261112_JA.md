# Browser Ink TPS / T21 — V28 全体批判と実ゲーム完成優先・新チャット統合正本

## 【2026-11-12 本人最終再査読・次チャット最新入口】

**本追補は本人の明示的な全体批判・次チャット移行依頼に対する一度限りの整理。新V29・B番号・小QA・HUDを増やさず、これより下のV28・V27以前と固定F1〜F5／Fast Track／DECISIONSは全て継承。文書更新自体はゲーム開発の進捗0。**

### 最新実証状態
- リポジトリ `ryomashibaba/browser-ink-tps`、唯一の書込先 `research/t21-integrated-a1-c-patrol-four-mode-20261105`。**本追補保存直前の研究HEAD** `bee2d19a09c60e5d6716c20c62fcb41d70918851`（次チャットはライブで取り直す）。main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9` は不変、PR #5はOpen/Draft/未merge、head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。
- 最終ゲーム目標は『スプラトゥーン3』**Ver.7.2.0改修後マテガイ放水路・通常ナワバリ**、本当の人間1＋CPU7、180秒・再戦、原作物理地形・自然4v4・射撃・インク・HP/撃破/150 native tick復活・原作得点/勝敗・本人F5実機/ART。別版/別モード/別ステージへ変更しない。登録されたSOURCEは25 Rapier solids／17 PaintSurfaces／26 NavLinks／0 Scoreable、Winner NONE。B499原作候補10部品42面は未登録、検査対象の原作8隣接Recast0/8、自然敵味方16経路0/16。正式4v4・ART・公開はHOLD。**全体の完成割合はUNKNOWN**。
- 既存真正Chromiumでは7CPU、原作登録坂での移動、一部真人間射撃/塗装/OWN回復、180秒TIME_UP・同武器再戦などに別SHA・別条件の**個別限定PASS**。最新一試合の統合PASSではない。本人Windowsの床抜け／CPU少数／SAFE STOPの最新全域解消も未確認。
- `0156467ec3` の [CI #43177214078](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43177214078) は軽量SUCCESS・真正SKIPPED。`803ea99a` の [CI #43183698220](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43183698220) は37ファイル388テストとViteビルドPASSだがCPU真正起動FAIL。同SHAの [A1 #43183698396](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43183698396) もラウンド開始前FAIL。両方は床・CPU実移動バグの直接証拠ではない。
- `803ea99a` はCPU支持をHUMAN Rapierで判定するコード。`81c7a6a8` CPU未発動攻撃の資源/死亡時回数、`2c915923` SUB回復待機、`e76b65f9` A1前面フォーカス、`bee2d19a` B440 READY診断を追加。**後ろ4コミットは全て [skip ci] で、現HEADの型/ビルド/テスト/真正試遊は未確認。** 修正を完成・安全認証済みと呼ばない。
- 既存Windows/B490原作UV・登録床同一視点比較は `Documents/BrowserInkTPS_F3L_15864_5030`、研究cloneは `Downloads/browser-ink-tps-current`。本人に再clone・43MB原作再ダウンロード・スクショ/ログ再提出を要求しない。
- 高台tick1271の空中非接地を即「床穴」と断定しない。下段tick1355は登録床ラスタ内、tick1356は床外・境界約0.246m。近傍 `FloorSlope01` は**未配置Actor由来**で、Ver.7.2.0通常ナワバリのActor transformとPhive/collision flagは不明。見た目のOBJ Faceを無根拠に衝突床登録しない。

### 批判的反省（優先順位の修正ではなく実行法の改善）
1. テスト数・連続push・B番号・診断・HUD・ドキュメントがプレイ可能性を上回った。**「実ゲームで何が新たにできたか」を唯一の成果基準**とし、細かなガード修正を工程完了扱いしない。
2. pushで高負荷CIが連続起動した失敗と、以後[skip ci]で未検証コードが累積した失敗を両方是正。ゲーム機能バッチ単位の**軽量型/既存テスト/Vite 1回**と、個別承認後の**真正Chromium 1系統**に分離する。重負荷が無許可で起動するpushは回避。
3. F4原作の未認証面を全部都合のよい橋や床で埋めることも、F4の材料不足で既登録SOURCEゲームを停止することも禁止。**根拠不足のFaceだけ局所HOLD、F1/F2/F3を既登録床で並走**。SAFE STOPや0.12m等のガード閾値を証拠なしに緩めない。
4. CIのREADY前／ポインターロック前のFAILをCPU経路のFAILと取り違えない。旧Ray/KCCや別SHAの限定PASSを最新正式4v4に読み替えない。

### 次チャットの実行順と明確な停止条件
**P0：** `START_HERE.md`最上段→本V28全文→V27→必要に応じV26以下→Fast Track/DECISIONS。最新HEAD/main/PR5/Actions確認。まず直近4件の**未検証差分を一括査読**し、軽量TypeScript／Vitest／Vite／Node構文の既存チェックを負荷条件の範囲で1回実施。実行手段がなければ未検証と明示。新B番号、計画書、HUD、テスト専用モジュールの先行追加は禁止。
**P1：** 既登録SOURCEの**ひとつの60Hz実ゲーム**で真人間WASD→本当の射撃と塗装→インク消費→同一登録backingSolidのOWNイカ回復→再射撃、7CPU全員の実物理再合流・合法射撃・HP/150tick復活、180秒TIME_UP/同武器再戦を実装・検証する。既存コードを一括査読、再現済みの欠陥だけ関連修正。真の同一SHAイベントがなければCODE_PASS_ONLY/HOLDであって完成PASSでない。自然敵遭遇・対岸経路0/16なら偽HP・撃破・正式得点は実装しない。
**P2：** 原作F4ではB490/B499と既存足元記録の**最初の本人実歩行阻害点1か所**だけ調べる。正規Ver.7.2.0 Turf Banc/BYML Actor placement・Phive／原作Face materialとcollision flagが独立確認できた場合に限り、隔離Face→Rapier全身カプセル連続接地→CPU Recast→本物のゲーム世界と順次証明。原本PRIVATE/派生物はGitHub/CIへ転送しない。権限不明ならそのFaceだけ`HOLD_REFERENCE_REQUIRED`、同条件で空転せずP1に戻る。正式Scoreableは別途原作権限の証明が必要。
**P3：** F5は関連コードがまとまってから本人に必要時だけ**最小1回の普通の実機一括確認**を頼む。既存cloneとB490を活用し、床表示とRapier一致、CPU7、SAFE STOP、FPS、180秒／再戦をまとめて判断。Windows／Work／高負荷／PRIVATE／公開は**それぞれ個別事前承認**。本人操作原則0回・追加課金原則0円。
**STOP：** 2工程続けて新しい真正ゲーム進展0なら微修正／ドキュメント／小QAを中断しP1の機能障害かP2の最大根因へ切替。報告は`FACT`／`CODE_PASS_ONLY`／`TRUE_RUN_LIMITED_PASS`／`HOLD_REFERENCE_REQUIRED`／`FAIL`／`UNKNOWN`を使い分ける。main、T19C、T20、PR5、Pages、正式QA、原本、PRIVATE、本人Windowsを保護、唯一の研究ブランチだけ単親・expected_sha CAS・force:false。

**次チャット冒頭は新しい計画作りではなく「上記P0の未検証コード一括査読→安全な軽量確認→P1の実ゲームを妨げる最初の再現済み根因を一括修正」とする。**


**2026-11-12 JST／本人が明示した全体再検討と次チャット移行のための一回限りの記録。新規企画・上位目標の変更ではない。文書作成自体はゲーム進捗0。次回以降、惰性でV29・B番号・細かいQA・HUD・文書を増殖させない。**

## 【2026-11-12 本人明示・追補】ステージ未完成の根本再評価と次チャット固定実行方針

**適用方法**：この追補は既存V28本文に対する今回限りの本人明示の批判的見直し。上位F1〜F5、通常ナワバリVer.7.2.0・人間1＋実CPU7・180秒、Fast Track/永続DECISIONSとすべての保護は不変。新V29/QA/HUDを惰性で増殖させない。この文書更新は**ゲーム実装の改善ではなく、進捗0**。

### 現段階の客観的判定：STAGE INCOMPLETE / OFFICIAL 4v4 HOLD

- 現研究用ステージは25 Rapier solids、17 PaintSurfaces、26 NavLinks、正式Scoreable0。**全マップに対する25や17の割合・完成パーセントは不明**。既存の高精細F3L光学モデルの見た目が良くても、歩ける原作物理床/原作正式スコアを保証しない。
- B499の真正原作候補10部品・42原作三角面は現25-solidに0/10登録。原作面中心のRecast 0.35m以内0/42・Rapier支持hit0/42、原作8隣接組の現Recast接続0/8。旧Pass18の8 gapとB218の8 seamは対応未確定。**表示OBJの面を全部Rapier colliderにしてよいという証拠ではない。**
- 自然な敵味方対戦の検査対象16経路は0/16成功。正式Scoreable0、Winner NONE、正式4v4・自然敵HP→撃破→復活・ART・公開は未認証/HOLD。0/16は**その16検査経路の結果**であって全原作通行不可能の数学的証明ではない。
- 原作改修版`Vss_Temple01`を示す720 SceneInfo等の版資料はあるが、対象表示OBJのVer.7.2.0 Turf確定、個別原作Faceのゲーム用Phive/Actor/collision flag・`col_disable_flags`意味論と正式得点権限は未認証。Ver.7.2.0に関する根拠不足Faceは`HOLD_REFERENCE_REQUIRED`と判定する。
- 本人Windows実試遊では以前に床抜け/視覚床不一致、CPU少数、SAFE STOPを観測。既存の`Documents/BrowserInkTPS_F3L_15864_5030`のB490同一視点原本UVと登録物理床の2比較画像/HTMLを**再利用**する。最新HEADで全域改善したという実機証拠はない。元43MB原作、同一B490画像、clone、PowerShellログを本人に再提出させない。
- 今回のレビュー前ゲームHEAD=`0156467ec31c0a3704f557b0fb1cf9c428d57c91`。直近CPUライフ/合法rejoin、真人射撃・インク消費、DUALIES/SHOOTER開幕連射、CPU空弾返金/巡回/STRINGER・CHARGERの弾経済修正は**コード実装**として存在し、[#43177214078](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43177214078) 軽量SOURCEテスト＋型＋Vite build SUCCESS。ただし最新SHAの真正180秒ChromiumはSKIPPED。旧SHAの人間移動→射撃→OWN回復→再射撃、CPU7や180秒再戦の**個別限定成功**を最新全機能同一試合のPASSと誤認しない。

### 過去の方法の批判と修正

1. 「次の工程へ進む」への対応で**小さな射撃ガードとコード単体CIが続きすぎた**。CPU弾返金は有用だが、ステージの最大阻害要因0/16・物理床未完成は動かず、実ゲームの新たな同一SHAプレイ成果は未証明。以後は一つの完成条件に結びつく関連コードをまとめる。テスト数/コミット数/単体CODE_PASS_ONLYを遊べるゲーム完成と呼ばない。
2. **F4ステージの原本衝突権限を後回しにしない。** 一方で未知の橋/床/NavLink/ワープ/公式得点を推測追加するのも禁止。原本のない各FaceだけHOLDにし、残り25登録床のF1/F2/F3実プレイを並走させる。空転するF4同条件テストは禁止。
3. プレイヤーとCPU7、実KCC、見た目と物理、SOURCEインク、同一180秒、CPUライフ・復活、STOP→再戦を**同一世界・同一ゲームHEAD**で独立に判定。以前の局所CI結果はその条件とSHAに限定して再利用。
4. HUD/透明化/報告文書では原作衝突やARTを完成させられない。本人が床を抜ける/CPUが少ない/SAFE STOPの**最初の再現箇所**を根拠優先で調査。むやみに障害閾値を緩めず、原作当たり判定と人間カプセル/0.30m CPU Recastを区別。
5. 良い方針は維持：研究ブランチ`research/t21-integrated-a1-c-patrol-four-mode-20261105`のみ単親・expected_sha CAS・force:false。main/T19C/T20/PR#5/Pages/正式QA/原本/PRIVATE/本人PC書換禁止。未取得PhiveやPRIVATEの外部アップロード禁止。本人操作原則0・追加課金原則0、Windows/Work/真正長時間Chromiumは個別事前承認。

### 次工程の固定優先順位（F1〜F5の目標は変更しない）

**1. 原作ステージ阻害箇所の一点突破（F2/F4）**：GitHub最新HEAD、B490比較既存証拠、B499 10部品42面/8隣接/0/16、実Rapier/原作Faceの現登録を対照し、**本人が普通に歩けない「最初の場所」**のIDと視覚・物理・ナビ差を具体的に特定する。欠落モデルだけで床を追加せず、元のBanc/BYML/Phive/Actorの7.2.0 Turf整合と個別material/disable flagを確かめ、同じ座標の全身Rapier KCC＋CPU Recast連続歩行を証明。既存`scripts/f4_phive_original_collision_probe.py`は元衝突データが正当に揃った場合だけ利用し、PRIVATEはローカル保持。根拠がない場合**その面だけHOLD_REFERENCE_REQUIRED**、新しい捏造地形や同条件CIを増やさない。

**2. 並走：既登録SOURCEの実ゲーム一体化（F1/F2/F3）**：同じ本物の60Hz世界で、人間WASD→着弾/17塗装面→インク減→元Rapier backingSolidIdのOWN SQUID回復→再射撃、7CPU全員の実物理rejoin/合法な移動・射撃・塗装/HP・150tick復活、必要なCキー支援、180秒TIME_UP・同武器再戦を一機能として検証・修正。最近のCPU射撃返金・公平巡回などの副作用も**同一試合**で確認。軽量CIのCODE_PASS_ONLYはTRUE_RUNへ昇格しない。真正Chromiumや実機は事前承認を得た時だけ実施。

**3. 原作権限成立後に正式4v4得点（F3/F4）**：元Faceの安全な連続経路で自然敵味方ルートが成立した証拠が出て初めて、本物の遭遇→HP0→150 native tick復活を確認。元Scoreable権限が確定するまで正式Turf面や得点/勝敗を実装しない。`UNSCORED/WINNER NONE`を守る。

**4. F5本人実機判定はできるだけ1回**：実装をまとめ、既存研究clone、B490資料を使って、普通のWindows操作で床抜け・CPU7・SAFE STOP・視覚衝突一致・FPS・180秒・再戦を確認。本人操作は必要な場合だけ**単一の安全な手順**を提示。無断のPC操作/高負荷/設定変更なし。

**工程ゲート**：各機能バッチは「ゲームでできることの変化→関連コード→原則1回軽量CI→許可のある真正/本人評価→結果とHOLD」の順。2工程連続で実ゲームの進展が見えなければ小修正を停止し、最大阻害要因から再選択。原作資料不足の個別Face以外は無期限で開発を止めない。現時点で原作ステージの完成率は**わからない**。本追補作成自体はdocs-onlyでゲーム進捗0。

### 次チャットの最短再開命令

Browser Ink TPS/T21 Ver.7.2.0マテガイ放水路通常ナワバリの既存開発継続。F1〜F5/Fast Track/DECISIONSと過去成功・失敗・保護を変更しない。GitHub`ryomashibaba/browser-ink-tps`の研究`research/t21-integrated-a1-c-patrol-four-mode-20261105`で`START_HERE.md`最上段→V28の**2026-11-12追補**→V27以前を読み、最新HEAD/CI/main/PR5をライブ確認。追補前の最新ゲームコードは`0156467ec31c0a3704f557b0fb1cf9c428d57c91`で軽量CI#43177214078 SUCCESSだが真正180秒SKIPPED。**ステージ未完成**：25/17/26/0は完成率ではない、元候補10部品42面が現未登録、原作8隣接現Recast0/8、敵味方自然経路0/16、正式Scoreable0/Winner NONE、本人Windows床抜け/CPU少数/SAFE STOP全域修復未認証。射撃小修正/書類/HUDでなくF4原作Face/Phive衝突権限・最初の通常プレイ床不整合を最優先、証拠不足FaceだけHOLD、既登録SOURCE実床で人間射撃→OWN回復→再射撃＋7CPU＋180秒の一体化を並走。偽橋/床/NavLink/ワープ/得点禁止。main/PR5/Pages/正式QA/PRIVATE/本人PC保護、研究branchのみCAS非force。本人作業0原則/追加課金0円、高負荷/Work/Windowsは個別承認。実ゲームの成果・根拠・残HOLD・本人操作必要性を短く報告。

## 0. 読順・最新証拠・操作許可

- GitHub: https://github.com/ryomashibaba/browser-ink-tps
- **唯一の書込先**: research/t21-integrated-a1-c-patrol-four-mode-20261105
- **本書作成直前の研究HEAD**: 852d662bc84bee5bdc34301e85641a463563c6cd。本書保存後HEADは変わるため次チャットでは必ずライブ再取得。2026-11-12の最新軽量CI #43159892864 はSUCCESS。real-native-original-frontlineジョブはSKIPPEDなので、真正ゲームの最新成功とは言わない。
- 同時点で main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9。Draft PR #5はOpen/Draft・未merge、head=8cfc95756ef0b56e2c33dc9f89a9041126daa272。変更禁止。
- 読む順：START_HERE.md最上段→本V28全文→V27正本 docs/continuity/BROWSER_INK_TPS_V27_CRITICAL_EXECUTION_HANDOFF_20261111_JA.md 全文→必要時V26以前→T21_FAST_TRACK_ROADMAP.md / docs/continuity/DECISIONS_JA.md / docs/continuity/FAST_TRACK_EXECUTION_JA.md→対象実コードとSHA一致の真正CI/RAW。旧DECISIONSのQAブランチ、0/12は過去時点の履歴。今の研究書込先と自然敵味方0/16が優先するが上位F1〜F5は一切変えない。

## 1. 最上位ゴールと凍結条件

『スプラトゥーン3』改修後Ver.7.2.0マテガイ放水路・**通常ナワバリ**の原作忠実な高品質ブラウザTPS。人間1＋CPU7の自然な4v4、180秒、Rapier/Recastの正しい地形・衝突・操作、武器・Projectile・塗装・インク消費・OWNイカ回復、HP・撃破・150 native tick復活、公式得点・勝敗・同武器再戦、実機での原作外観とFPS、正式QAまで。Big Run、トリカラ、旧版・別ステージへ逃げない。

固定F1：人間＋CPU7の本物の安全な配置、真の生存・物理合流・復活。
固定F2：人間とCPUのRapier KCC/Recast、原作床支持、連続移動、原作高低差と動的衝突。
固定F3：実ユーザー入力、武器、原作への本物の着弾塗装、インク経済、イカ、サブ、敵との自然遭遇・本当のHP/撃破/復活、180秒終了・再戦。
固定F4：Ver.7.2.0 TurfのBanc/BYML、Actor transform、Phive面単位collision flagsと正しい中央地形、正式Scoreable権限。
固定F5：本人Windowsの普通の試遊、床と見た目の一致、カメラ、ART、FPS、最終QAと明示的公開承認。

現行は **25 Rapier solids /17 PaintSurfaces /26 source one-way NavLinks /0 Scoreable、敵味方自然到達0/16、Winner NONE、activationReady=false**。正式4v4・対岸中央の原作衝突・公式得点/勝敗・ART・公開/Pages・PR mergeはHOLD。偽床/橋/坂/足場/リンク/ワープ/敵/HP/得点、原作OBJを全部衝突面にする昇格、閾値緩和・カプセル半径0・実キー偽装は禁止。PRIVATE原作OBJ/MTL/PNG・面ごとの抽出物は外部GitHub/CIに無断転送禁止。

## 2. 実証したものと、実証していないもの

- 旧真正Chromeでは、人間実W/S/D/坂移動、射撃→原作塗装→インク消費→OWN SQUID回復→再射撃、CPU7体の実参加・射撃・着弾塗装、実CキーA1協力、180秒TIME_UP・同武器再戦などがそれぞれ**個別に限定PASS**。これら全部が**最新同一HEAD・同一180秒世界で統合PASSとは未証明**。
- B491真正 #43140584988：同一世界720 native tickのCPU7体、射撃要求154発・実着弾8,382セル・OWN補給+118、無償足元塗装0。原作中央の自然敵到達は証明しない。
- B490本人Windowsの原作F3L比較は、元の見える地形と登録物理床の差を確認（57,578 triangles、54 material groups、19 textures）。原本と比較画像/HTMLは本人ローカルに保管。以前の通常Windowsでの床抜け・CPU少数・SAFE STOPを**最新実ゲームで全域解決したとは未認証**。同じ画像を再提出させない。
- B492〜B495で実Recast経路YとRapier床Y最大約0.28m差、B493/B494のB2/B4/A1観測足を使ったKCC局所/連続再演に限定PASS。ゲームAIがその経路を自然に選ぶ証拠ではない。
- B496の既存拒否60経路は再現成功。補間YをRecast近傍点に投影するとRay支持だけなら50/60、なお10/60拒否。最大約1.08mのY補正を要する箇所があり、その50経路は**新通路でも安全な道でもない**。
- B497〜B498の原作25-solid隔離KCCは速度を実CPU4.4m/s/60Hz以下に細分して23/50がQA上許容内、27/50は接触・累積差。24/50に水平クリップ、26/50に垂直クリップ。27件の最初のQA接触位置は実CPUの記録足からXZで**2.28〜3.71m遠い反事実候補**。原作右低地コライダーの実ゲームバグと断定して変更しない。
- B499真正原作SOURCE面と現25-solid Rapier/Recast #43156897600：CI688由来の10部品・42三角面の現Solid登録0/10、三角形中心でRecast 0.35m以内0/42、Rapier床Hit 0/42、原作面8隣接組の現Recast到達0/8。**Pass18で左右各4件の8局所GapとB218の原作面隣接8組は同一物理箇所との対応未認証**。原作面間最短距離は片側0.17/2.074235/0.518559/0.518559m。以前のCI#691で10原作由来部品を研究追加しても原作中央ルートは開通せず。新面の衝突権限/版一致もUNKNOWN。
- **B499以降の最新ゲームコード差分**：a0b0813b004bc2dc8cb276f27bb062f6ed975584で、実CPU敵候補をACTIVE・HP>0・GROUND・本物のRecast/Rapier rejoin済・現位置一致に限定し、SPLATTED/未知/未復帰の過去の足を自然な敵と誤扱いしない。同時に実Life/physicalRejoinsのsnapshot整合性を改善。前回軽量CI #43159355114 はfixture未初期化でFAIL。修正済み研究HEAD 852d662bc84bee5bdc34301e85641a463563c6cdのCI #43159892864 はSOURCE交通19 suites/186 tests PASS（2 skip）、Ink/Resource4 suites/19 tests PASS、TypeScript・Vite build PASS。**real-native-original-frontlineジョブはSKIPPED。最新コードの自然遭遇・実敵HP・復活を真正実証したとは言えない**。

## 3. 従来の開発手法を批判し、対策を確定

1. **B番号・小QA・文書・HUDとCIが実際のゲーム進化を上回った。** テストは重要だが完成度ではない。次回以降「その変更で普通のSOURCEゲームでどんな行為が新たにできるか」を先頭に置く。コード変更なしのQA/Docsだけなら分析進捗と明記。
2. **0/8原作面と0/16自然敵経路、50 Ray/23静的KCCを混同した。** 母集団、観測した世界、SHAと根拠の種類を毎回分ける。Ver.7.2.0 collision/Actor根拠なしに原作OBJを本番Collisionへ昇格しない。
3. **周辺で見えるもの全部を歩ける床にする誘惑**は偽物の完成。逆に**F4証拠が揃うまで何もしない**も永久HOLD。証拠のない中央の個別部分のみHOLDにし、原作登録済み範囲のF1/F2/F3実プレイを並行して改善する。
4. **ガードによるSAFE STOP、床継ぎ目でのInk/接地誤拒否、ライフキャッシュの過去足**がプレイを阻害し得る。原因を特定して関連コード単位で直す。証拠のない数値緩和や、KCCのQA結果だけによる地形変更はしない。
5. **真正7CPU・塗装・180秒を正式4v4と誤称しやすかった**。自然な敵遭遇・HP→撃破→150 native tick復活・公式得点/勝者・本人普通の試遊が未証明。限定PASSを拡大して報告しない。
6. **透明化/HUDはARTや物理の修正ではない**。本人の同一視点で必要なものに限定し、原作の見た目を損なう暫定透明化を増殖しない。
7. **push→CI失敗→push→CI繰返しが高コスト**。関連機能を調べてまとめて実装→可能な範囲でpush前型/構文確認→原則1つの軽量CI→結果に応じた最小修正。既存成功の真正CIの無意味な再実行なし。
8. **本人へZIP・clone・B490スクショ・Windowsコマンドを反復要求した**。既存cloneはDownloads/browser-ink-tps-current、B490ローカル比較はDocuments/BrowserInkTPS_F3L_15864_5030。本人の手作業原則0回、追加課金原則0円。PRIVATEを無断公開しない。
9. **レビュー不足の古い正本の「現行」表記が混入しやすい**。ライブHEADを優先、旧V27以下は仕様と根拠を継承するが古いSHA/次手順は履歴にする。今回の正本以降、毎ターン新Vxxの引き継ぎを作らない。

## 4. 批判後に確定した唯一の実行順と合格条件

### P0｜再開時はライブ照合だけ
本V28全文・V27・F1〜F5/FAST_TRACK/DECISIONSを読み、最新研究HEAD・直近3〜5コミット差・main/PR5/Actionsを照合。古いHEADから勝手に作業を始めない。B492〜B499の同条件QA・既成功のTRUE Chromiumを再実行しない。新しい長い計画書を作らない。

### P1｜最優先：既登録原作SOURCEでの遊べる垂直スライスを本体コードで改善
人間の**実移動→実射撃/塗装→インク消費→OWNイカ回復→再射撃**と、7CPUのACTIVE/HP・実物理rejoin/復活・合法な射撃/支援・実Cキー協力を、同一世界で矛盾なく結合する。最新UndertowF3SourceTraffic.tsの敵life/respawnロジック、PlayerControllerのSOURCE backingSolidIdと0.12m接触判定、GameplayInkSystem、CpuAgentSystem、Projectile/Ink、SAFE STOPや本物の床支持・CPU欠員に関連するコードを**一括で**確認し、再現した不具合のみ修正する。ない不具合は作らない。
- コード+既存回帰+必要な根拠をまとめ、軽量CIは原則1回。
- 完成証拠は同一SHAでの新しい実ゲームイベントと負の副作用なし。軽量CIだけならCODE_PASS_ONLYとし、実ゲーム改善TRUE_PASSと呼ばない。
- natural enemy route 0/16では敵をワープさせてHP/撃破/公式Turfを作らない。現行の最新life-filterも実戦認証前である。

### P2｜中央部F4は原作根拠が新たに出たときだけ有界再開
右低地の登録床→未登録SOURCE部品への入口と、その内側の出口を正確な**Ver.7.2.0 Turf**面ID/Actor transform/原作collision flags/Phiveと照合。旧Pass18 8 GapとB218 8 face-seamは別扱い。PRIVATE原作をGitHub/CIに流出させない。新証拠が取れた場合だけ隔離研究でcandidate Face→権限→CPU全身カプセル連続移動→Recast全経路→真正現場の順で評価。資料不足なら該当箇所だけHOLD_REFERENCE_REQUIREDにしてP1へ戻る。未認証の2.074mを透明橋やNavLinkで補完しない。

### P3｜原作中央自然経路が真に成立した後にのみ正式敵戦闘と得点
現在の0/16を実本物Recast→Rapier→7CPU+Humanで解消する根拠が得られたら、自然に相手へ到達し、真の弾命中・HP減少・撃破・150tick復活を同じゲーム世界で検証。Scoreableの原作7.2.0 Face認証後にだけ正式Turf得点・勝敗を実装。未認証の間はSOURCE練習表示UNSCORED／WINNER NONEを維持。

### P4｜本人Windowsと最終F5
本体機能バッチをまとめてから、必要な場合に限り既存のローカルcloneとB490比較画像を再利用し、本人の操作は最小1回の安全な一括チェック。原作床と光学形状の同位置一致、普通の操作/安全停止/CPU7・FPS・視認性・180秒/再戦を検証。本人Windows/PRIVATE/Work/高負荷の個別承認を厳守。正式QA/公開/PR mergeは最後までHOLD。

### 停止・転換
- 2工程連続でゲームコードの体験改善が0、かつ小テスト・報告だけが増えたら強制再査読し、P1の機能改修か対象限定HOLDに切替。
- 原作資料が不足した特定Faceは保留、他の認証済み機能は前進させる。
- 証拠のレベルをFACT・TRUE_RUN_LIMITED_PASS・CODE_PASS_ONLY・HOLD_REFERENCE_REQUIRED・FAIL・UNKNOWNに分離。「完璧」「正式4v4完成」を推測で宣言しない。

## 5. 操作保護・費用・次チャットへ引き継ぐ要点

変更先は研究ブランチのみ、コミット直前に最新HEAD/他作業差分を再取得し、単親・expected_sha付きCAS・force=false、force/rebase/merge禁止。main、T19C/T20、Draft PR5、Pages、固定F1〜F5ロードマップ、正式QA、本番、PRIVATE、本人Windowsを保護。GitHub/CIの既存証拠を使い回し、同じZIP/写真/PowerShellを再要求しない。Work/Computer Use、Windows、高負荷Chromium/180秒、正式公開/QA、PRIVATEは**既存の個別明示承認**が必須。Work /goalはユーザーの別途許可と予算、安全な作業範囲、最終独立レビューが揃わない限り自動開始しない。追加課金原則0円。

報告は毎回「実際のゲーム挙動の改善／コードSHA・検証範囲／現在のHOLD／次に実装する機能／本人操作要否」を短く。次チャットではP1の**ゲーム実装**へ直行。新計画・別文書・同条件のQA反復には戻らない。

## 6. 新チャットに貼る最短命令

Browser Ink TPS/T21/Ver.7.2.0 Undertow Spillwayの既存開発を継続してください。F1〜F5/Fast Track/DECISIONSと過去の失敗・成功・保護条件を維持し、新企画にはしない。まずGitHub ryomashibaba/browser-ink-tps の研究branch research/t21-integrated-a1-c-patrol-four-mode-20261105 でSTART_HERE.md最上段とV28正本 docs/continuity/BROWSER_INK_TPS_V28_CRITICAL_PLAYABLE_GAME_HANDOFF_20261112_JA.md を全文読み、V27以前も継承。V28作成前HEADは852d662bc84bee5bdc34301e85641a463563c6cd、最新HEAD・CI・main・Draft PR5をライブ確認。新しいゲームコードのCPU敵life/HP/真rejoin条件は軽量CI #43159892864 SUCCESSだが真正ChromiumはSKIPPED。B491真正7CPU/塗装/OWNは限定PASS、B499で原作10部品/42面の現Stage未登録が判明、自然敵味方0/16、SOURCE25/17/26/0、公式Scoreable0/Winner NONE、正式4v4/ART/公開はHOLD。B492〜B499の分析/QAや新文書の反復でなく、V28第4節P1の既登録SOURCE人間の実移動・射撃・消費・OWNイカ回復・再射撃とCPU7の生存/支援/復帰が自然につながるゲーム本体の関連コード改善へ進める。原作根拠のない床/橋/NavLink/ワープ/戦闘/得点は禁止。main/PR5/Pages/原本/PRIVATE/正式QA/本人Windowsを保護、研究branchのみ最新SHAから単親expected_sha CAS・非force更新。本人操作原則0・追加課金原則0、Work/Windows/高負荷は個別承認。実改善内容・証拠・HOLD・次工程を簡潔に報告。
