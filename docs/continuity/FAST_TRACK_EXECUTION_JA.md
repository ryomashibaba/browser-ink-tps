# Browser Ink TPS — 機能単位 Fast Track 実行計画（2026-10-25 JST）

## 正本と厳守事項
対象は `dev/t21-f4e103w-qa-infra`。既存 `T21_FAST_TRACK_ROADMAP.md` の **F1→F5を保持**し、その実行単位・証拠運用のみ改善する。原作Ver.7.2.0マテガイ放水路の通常ナワバリが最終目標。T19C/T20、main、公開Pages、Draft PR #5と非公開原作資料を保護する。原作認証 25 Rapier solids / 17 PaintSurface / 26 NavLinks / 0 Scoreable、対岸自然経路0/12。正式4v4、正式得点、勝敗、productionは認証・承認までHOLD。

## 起動監査：2026-10-25 15時台 JST
- 確認したブランチHEAD: `4b22409c10e857ee2fa872c8029423e3aa722ce8` (B191)。この値は監査時の基点であり、以後のチャットでは必ずGitHub現行HEADを取り直す。
- **B184**: 元のB121/B125系に failure、B123・B120等に success が混在。限定的既存成功を全面的PASSとしない。
- **B185–B186**: B112/B120/QA等に success。ただしB75がQueuedであり、B186の原作坂→人間Inkチャレンジ一気通貫のブラウザCLEARは未認証。
- **B187–B191**: B120ワークフローの本物ChromiumジョブがQueued（B191 `40168957957`、B190 `40168284687`、B187 `40166552340`）。実測ログ/JSON/スクリーンショットがない段階では成功と判定不可。既存のキューを無闇に再実行・再投入しない。
- `meta/t21-continuity/docs/continuity/LIVE_STATE.md` はB181 HEAD時点の古い自動キャッシュ。QA HEAD不一致につき無効。

## 機能群ごとの設計・受け入れ基準
**A. F1/F2/F3: 1本の操作可能な原作局所プレイ**
原作上段→本当の下段KCC→登録済み上り坂→高台で本当の塗装、射撃、インクの消費/回復、Squid/Human、HPと本当の150 tick復活、明示的な再挑戦まで一連の操作としてつなぐ。B183/B186/B191を再利用する。合格は実ブラウザ上で60Hz物理と人間操作、原作支持solid名、新規Impact paint cell、HUDが同じ試合で証明され、失敗・試合終了でも復帰可能なこと。B191 CIが未開始なら修正を推測で重ねず、独立実装へ進む。

**B. F1/F2/F3: 実CPUと人間の戦闘プレイ**
既存CPU7実足、元のRecast/Rapier、人間の実入力、ProjectileSystem、HP、撃破、復活、真正の原作遮蔽を同じ試合で一体化する。新たな仮想Actor、敵のワープ、壁越し命中保証、偽の試験位置は禁止。敵遭遇が成立しない場合にはSource authority HOLDとし、弾の照準・当たり・HP・AIのうち独立部分を改善する。合格は対戦相手が本当に存在する原作床での実射撃・着弾/命中・HP・撃破・復活の同時Chromium証拠。0/12を勝手に12/12に変更しない。

**C. F4: 本当に通れるステージ全体**
原作の中央・両岸・橋下±Zの接続を原作Face/ActorとRecast/Rapierの同じ世界座標で解決し、実人間KCCとCPU物理移動の連続性で評価。従来成功した床を何度も再計測せず、真正の未接続点を合否の中心に据える。原作根拠が不足なら対象のみHOLDし、A/B/Dの独立作業を継続。推測の床、透明足場、上り坂、NavLink、得点面は追加しない。

**D. F3/F4: 180秒・試合ループ**
8人参加、自然な塗装・撃破・復活、時計、終了、次の試合をユーザー操作で再開できること、これらを統合。SOURCE_ONLYモードでは本物のプレイを楽しめても **NO OFFICIAL TURF RESULT** と表示し、公式Scoreable 0のまま。原作が確認された正式な得点面がない限り、勝敗計算へ昇格しない。合格は1回の人間実操作180秒プレイ＋同時CPU7、タイムアップ、再挑戦、セッション整合性を実ブラウザで再現可能なこと。

**E. F5: 操作・視認性・性能と完成審査**
実ゲームの見やすい高低差、プレイヤーと敵の視認、自然なカメラ、武器/塗装反応、FPS、誤落下の原因を人が遊んで確認。一括で品質を改善し、本物の原作認証に必要な範囲の根拠のみ追加。正式4v4と公開/マージは原作・最終審査・明示承認が揃うまで不可。

## 優先度と工程ルール
- まとまった1機能の実装・軽量ローカル相当テスト・**既存1系統のブラウザ統合**を基本単位にする。細かいコミットは安全のため許可するが、ユーザー向け報告を小QAごとに区切らない。
- 新規CIワークフロー禁止をデフォルトとする。既存の B75・B120・QA・B112など必要なものだけ利用し、Queuedの同目的試験を繰り返さない。ジョブSUCCESSと実プレイ成功は別。
- 毎バッチ **成果・HEAD・CI URL・実測・PASSの範囲・HOLD・次の遊べる機能** を短く記す。定量的成功は実コード・Actions・JSON・スクリーンショットから取得。確認できないものは「未確認」と言う。
- 次の大きな実装バッチは A の実ブラウザ一気通貫確認および B の実CPU対人戦闘の機能統合。B191がQueuedである間は単発ドロップ校正に戻らず、独立した機能を選ぶ。Cの原作根拠不足は推測追加せず別HOLD。

## この文書の位置づけ
今回の効率改革は前の方針を**実行で厳格化**する。ゲーム認証や完走を新たに主張する証拠ではない。この文書の存在をコード実装やCI成功として扱わない。

## 2026-11-01 — F3 PLAYER HUDとF4原作接続の最新引き継ぎ

- **現在の開発方針:** 元のF1〜F5を変更しない。小QA番号やテスト数だけを成果扱いせず、人間が操作可能なSOURCE試合と原作接続・戦闘の実証を優先。保護対象 main/T19C/T20/公開Pages/PR#5/原作非公開資料。凍結25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable、自然な対岸経路0/12、正式4v4/ART/本番HOLD。
- **成立した2種の真正180秒:** B210真正Chrome [#41272467681](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41272467681) は原作上段上の人間実W/S入力7往復＋7 CPU実射撃816発、真のTIME_UP、次の試合再開を限定PASS。B390真正Chrome [#41271399268](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41271399268) はTwin Comets選択、原作first-drop→rampの局所3/3、実180秒、真のTIME_UP、同武器新SOURCE世界リプレイを別の限定PASS。他11武器の完全180秒完走、自然CPU敵遭遇/実Human HP0→150tick復帰の現場到達、正式得点は未認証。
- **通常PLAYER HUDの実用改善:** `a067b7687a3245a81fe8086dc82cce8ab078f65f` は既存B380の実選択武器・Native HP/イカ状態/チャージ/回避・サブ案内をB338通常PLAYER HUDへ統合し、元の全クラス一律「LEFT CLICK FIRE」案内を置換。GPUフレーム間の実死亡/フォーム変更は既存の60Hz read-only native pulseを使用。CPU、操作入力、物理・射撃性能、インク、地形、スコアを一切変更しない。B75の新HEAD事前CI [#41275901752](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41275901752) は **64ファイル/325テスト成功**。B287/原作B75 FIXED+SWEEP真正Chromiumは該当CIのジョブ結論を確認するまでPASS未認証。差分はHUD+単体テスト+既存APP接続の3ファイル、CI新設なし。
- **F4 原作物理の解決可能性とHOLDを混同しない:** B238元43MB SHA-pinned OBJから `FloorLine00` 本物の2原作Face×両鏡面が発見された。B239のQA31-solidだけで実KCC同一体が原作右下段からFloorLine00→Slope01を歩けたが、B240 CPU-safe Recast半径の入口接続は全ケースFAIL。B241真正FloorLine単独幅0.311m、元のCPU半径0.30mに対し安全な全身連続支持が未認証、元のソース物体のゲーム衝突権限も未認証。7/8 native tickのfoot-center ray欠落はKCC全体の浮遊と同義ではない。元登録25に昇格させず、半径0・架空橋・NavLink・Actorワープ・勝敗計算で穴埋めしない。
- **次の成果ベース工程:** (1) 現HEAD B75真Chromium描画・HUDの実視認を評価（PASS scope限定）、(2) 原作FloorLine00の衝突権限と実CPU capsule接触法を根拠付きで判断、(3) 同一実CpuAgentSystem体の自然なリーチ・カバー・攻撃へ進む。原作接続根拠が確保できない範囲はSOURCE_AUTHORITY HOLDで止め、代わりに通常PLAYERの操作品質・パフォーマンスを改善する。原作不明部分を見た目で「完成」にしない。

## 2026-11-01 — B349実射撃PASSと実KCC姿勢PLAYER HUD

- B349真正Chrome 2系統 [#41276813715](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813715)・[#41276813748](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813748) **SUCCESS**。原因は旧`t21W10B193=allyCoop`で本物のB186原作回路がdisabledとなりB373の厳格recap検査に拒否されたこと。実`t21W10B192=humanCombat`へ修正、B373/時計/物理/Actor不変更。
- 実Space押下・離し・KCC高度1.0333m上昇→着地、実Rapier物理弾10発（地上4／空中6）と元Source塗装面への実着弾10を確認。別実runで実W移動2.6477mと移動射撃6発、インク回復もPASS。自然な敵へのHPダメージは0、認定しない。
- 前回のB75 64ファイル325件 + B287選択HUD + FIXED/SWEEP真正WebGL2四ジョブは [#41275901752](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41275901752) 全SUCCESS。
- 今回`82819b5dd6979c6b33f984e26604eba780b36bcc`でSOURCE実60Hzの`stats.playerGrounded`のみを通常PLAYERの`KCC GROUNDED / KCC AIRBORNE`表示・Space案内へ接続。撃破・TIME_UP・QAで誤誘導不可。実ブラウザでの新HUD確認は新SHAに対するジョブ判定前なのでPASS未認証。
- 原作FloorLine00は物理衝突権限未認証、CPU Recast安全幅不足、対岸自然経路0/12、正式4v4・ART・公開本番HOLD。ゲーム本体25/17/26/0維持、QA成果を原作接続へ誤昇格しない。


## 2026-11-01 — F4原作IDとVer.7.2.0版の切り分け（研究のみ）

- **重要な原作照合:** KiTrixの`StageLoader.swift`は`Vss_Temple01`をCamp Triggerfishに、`Vss_Nagasaki03`をUndertow Spillwayに対応付けているが、独立のInkipediaは**Undertowの内部名Temple／Camp Triggerfishの内部名Athletic**と記録。KiTrixの表示名テーブルだけを根拠に既存`Vss_Temple01`の原作地形を誤作品と判断・破棄しない。逆にステージ名だけで全Faceと衝突面の公式認証をしない。 https://splatoonwiki.org/wiki/Undertow_Spillway#Internal_names
- **もっと重要な未確認:** 原作マテガイ放水路はVer.7.2.0で中央壁一部撤去・下側トンネル追加・ガラス等の大きな版変更を受けた。KiTrix OBJのGitHub初期収録日は2026-04-04だが、これは**元ゲームの抽出バージョンの証明ではない**。OBJ SHA照合＝7.2.0ナワバリモード一致・公式衝突フラグ認証ではない。 https://splatoonwiki.org/wiki/Undertow_Spillway#Version_7.2.0_onwards
- **厳密な次のF4ゲート:** 元の7.2.0ナワバリ版と当前OBJのFace/中央トンネル等を照合し、実ゲームの物理衝突フラグとCPUサイズの連続接地を別々に証明する。詳細は `docs/qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md`。QA31-solidを本番へ昇格させない。既存25/17/26/0、0/12対岸経路、正式4v4/ART/公開HOLD維持。**B385実Fキー2投擲+180秒SOURCE統合CI `#41279671286` は最終判定が出るまでPASS扱い禁止。**


## 2026-11-01 — B393 SOURCEサブ実爆発PASS → B392/B394通常プレイ可視化

- **F1–F5・真の達成境界を維持。** 元の25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable、対岸自然経路0/12のまま。正式4v4・ナワバリ得点・勝敗・ART・公開/mergeはHOLD。単体テスト増加をゲーム完成と混同しない。main/T19C/T20/公開Pages/PR#5不変更。
- B393 [Actions #41282785196](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41282785196) は **真正Chromium SUCCESS**。実Twin CometsのFキーSnap Bomb2投擲、native tick 1482までに実爆発2回、インク9.3267→45.66までの自然回復後に F SUB案内が戻り、同一原作SOURCE世界で180秒TIME_UP (native tick11860)、CPU7/7実復帰、人間93 shots/388塗装変化セル、CPU745 shots/17388変化セル、公式勝者NONE。これはCPUへのHP命中や爆弾の原作塗装を意味しない。
- B392 [実装60c7b2db2502](https://github.com/ryomashibaba/browser-ink-tps/commit/60c7b2db250263d8054f3cf50b8d4a3de75bedf5)：通常PLAYER HUDへ本物の人間サブ投擲／爆発を個別に通知（NOT CPU HIT）。既存真正B385に実DOM検査を組み込んだ [Actions #41284813246](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41284813246) は最終結論を必ず確認すること。実ブラウザPASSは同Run成功前には主張しない。
- B394 [5aee533fa8d0](https://github.com/ryomashibaba/browser-ink-tps/commit/5aee533fa8d0b1b54b97966063ce97d12f15ddc3)：既存B41のPaintCoordinator後のsource-only bomb outcomeを通常PLAYER HUDに表示。「実爆発」「原作面にスタンプ」「本当に変更したsourceセル」を分離。NEW_CELLS / STAMP_ZERO_CHANGE / NO_CERTIFIED_STAMP / MULTIPLE_UNRESOLVEDを誤命中/誤得点なしで区別。追加したB394の単体専用6件の実行と新HUDの真正ブラウザ視認は**まだ未認証**。B75 [Actions #41285593705](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41285593705) の最新HEADで、TypeScript+Viteと既存65ファイル/382テストがPASS。ただしその382件はB394の単体専用6件を含まない。
- B394初回のTypeScriptエラー（testの意図的な偽型1/false、既存HUDのoriginalSourceOnly booleanの不必要なliteral narrowing）を2回修正。現HEAD実装は型ビルド成功。原因修正のみで原作物理・インク経済・AI・正式スコアを変更していない。
- **次の優先作業:** B392実Chromium最終結論とB394実塗装セルの現場値・実DOMを確認、必要なら修正を一括実施。F1/F2/F3の実CPU対人戦闘と連続移動を引き続き主目標とする。原作版・FloorLine00当たり判定のソース権限が不足するF4部分はHOLDし、仮設NavLink/ワープ/半径0経路や架空得点で前進したと扱わない。

## 2026-11-01 — B394真正PASS・B395結果画面の限定導入

- **B394新規確定:** [Actions #41286556600](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41286556600) SUCCESS。B394単体込み5ファイル96テストPASS、実SOURCE Snap Bomb2爆発に対して原作スタンプ**7件**・実新規セル**0件**、native tick1500の`STAMP_ZERO_CHANGE`と実PLAYER DOMを厳密照合。0セルの原因・CPU命中・公式得点は認証しない。真正180秒TIME_UP tick11859、実人間94 shots/388 impactセル、CPU605 shots/13308 sourceセル、CPU7/7復帰、新世界同武器再開、Winner NONE。
- **B395プレイヤー向け統合:** B58/B59通常活動・結果画面でpost-PaintCoordinator由来のサブ爆発、元sourceスタンプ、変更セル、0変化スタンプを明確に分けて表示する読み取り専用機能。初回の任意型検査エラーを`36968c0c`で修正。TypeScript/Vite、関連Vitest、Node事前チェックPASS。真正B210 180秒[Actions #41287579025](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41287579025)は最終判定まで未認証。
- **不変:** 元25 Rapier solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、自然対岸0/12。正式4v4・ART・公式Turf得点・公開/merge HOLD、main/T19C/T20/PR#5/Pages不変更。次の主要実戦課題は、原作接地権限を維持した本当の自然CPU遭遇/HP命中/復活。局所micro-QA番号の拡張は進捗代用にしない。
