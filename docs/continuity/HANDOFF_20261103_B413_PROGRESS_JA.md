# Browser Ink TPS — B412真正PASS → B413実インク経済統合 (2026-11-03)

## 固定方針

Repository ryomashibaba/browser-ink-tps、研究 branch research/t21-b406-single-session-real-enemy-range-audit-20261103。root START_HERE.md、B406完全統合正本、DECISIONS_JA、FAST_TRACK_EXECUTION_JA、T21_FAST_TRACK_ROADMAP (F1–F5)、CURRENT_CANONICALを守る。Chat + GitHub中心、Work事前許可、PC操作不要。

## 既存の真正成功を再利用

[B412真正Chrome #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)、本物のコードSHA 7d31501c702b725dda730047cc47db379523a400、元artifact 13233112543、全CI/独立監査SUCCESS。本物の同一SOURCE 180秒ゲームで高所→初着地→坂→右上段Rapier KCC、原作4 PaintSurfacesに人間実塗装、7CPU、120/60/30秒の人間実射撃。ShiftでSQUID→OWN原作InkRelation＋SWIM_GROUND実3レグ、計5.204981m原作Rapier連続歩行／泳ぎ、KeyS物理復帰とHUMAN再変身。真正TIME_UP tick11856、人間85 shots／1025 source-changed cells、CPU147 shot requests／11846 changed cells。B411の大きな練習CLEARを試合中隠しTIME_UP後に再戦戻す機能も同runでPASS。B405〜B412の成果を不必要に再試験しない。

## 新B413ゲーム機能

- まとまったF3体験：「実射撃→実インク消費→元のOWN塗装でSQUIDとして回復→HUMANに戻り実再射撃」。現行の一つの真正B412試合と既存の本物PlayerResources・PlayerController・B408照準を再利用する。新物理・インク生成処理は作らない。
- 研究フラグ T21_B413_REAL_SOURCE_INK_LOOP=1 は既存B412/B411/B410と同時指定のみ。残り90秒の前半で真のCDPマウスを保持し少なくとも5発の実SHOT・4以上のnativeインク消費・元右上段SOURCE PaintSurface impactを記録。その後、既存B412 Shift＋W/Sの本物PlayerResources状態をread-only時系列観測し、連続するOWNインクのSQUID_OWNモードでタンクが実増加したことを証明する。元の原作床へヒト形態で復帰し、もう一度本物のCDP射撃・インク消費・原作着弾を確認する。
- 残り60/30秒のB410射撃、元のB315/B316/B322/B324/B326/B409/B410/B411/B412同一run監査、TRUE TIME_UPをすべて維持した場合に限りB413真正限定PASS。新しい独立監査は同native tick・PlayerResources実残量・CPU7体・source25/17/26/0・実ownerGrid、scoreable0・winnerNONEを確認。単体テストやビルド成功だけで真正PASSとはしない。
- 実装変更は同研究ブランチのB413 native実行＋独立監査＋unit、既存B409→B412 Chrome統合workflowへの追加のみ。B413の最終結果は新SHAのActionsを必ず取得するまで **HOLD**。失敗時は実SHOT/ink/OWN状態/足元原作solid/PointerLock等で分析し、fakeなインク残量や原作当たり判定緩和は禁止。

## 永続HOLD

Splatoon 3 v7.2.0マテガイ放水路通常ナワバリ。25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable、対岸Recast自然経路0/12、activationReady=false。人間からCPUへの本物のHP命中・撃破・150tick復活、正式得点・勝敗、正式4v4、元7.2.0 FloorLine00衝突権威、ART、本番公開はHOLD。main/T20/正式QA/Draft PR#5/Pages不変更。Work事前承認。
## 2026-11-03 B413初回の真正Chrome HOLD（原因未確定部分は明記）

- [初回 GitHub Actions #41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) at **exact code SHA bed6ec5da1c72c65f4315639a909411371a7bbbb** は失敗。事前node unit・型/ビルドPASS、B322真の上段到達PASS、B411本当の実試合PLAYING表示PASS、120秒のB410実射撃**8shots／原作右上段94 original cells changed**、7元CPU稼働。本当の90秒sampleもPASS。直後の新B413最初の追加射撃で **B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_TRUE_ORIGINAL_UPPER_PROJECTILE_IMPACT_BEFORE_SQUID** となり、同runのB413イカ補給・ヒト復帰・再射撃・TIME_UPを未認証。Original artifact **13234999159**。初回は B413 fragment JSON の途中保存がなかった。原作右上段へ新B413の本当のshotが着弾した証拠はなく、「着弾したが監査が誤判定した」と断定しない。
- 初回のコードは「120秒のB408で成功したCDP x/y」をそのまま90秒とイカ復帰後に再利用した。ログと原本では120秒時点のB408 source cell grid[90,131]・world[12.4381,4.502,50.7800]・CDP[805,475]・本当の観測カメラ yaw71.5/pitch-40.62・元のUpperPaintSurface実impactTick4729を確認。一方で90秒時点の**現在の本物のカメラから**再照準した保証はなかった。これが原因である可能性が高いが、初回には新B413の個々の実SHOT/impact/カメラ観測原本がなく**原因を確定できない**。
- 修正では既存B408の **read-only 原作ownerGrid＋実カメラの安全なCDP射撃計画を、B413各射撃（90秒、イカから戻った後）それぞれで新たに計算**、本当の `Input.dispatchMouseEvent(mouseMoved)` から `b408NativeMouseAligned` で現実のcamera yaw/pitchを照合してからメイン射撃する。SOURCE floor/support、原作17セル、実インク消費、元impactTick/Surface、cpu7/clock/Scoreable0の要求は減らさない。独立監査も各射撃の **B408原作surface provenance＋実CDP一致＋実camera alignment** をチェックする。
- また再発HOLDでも `b413-real-original-ink-fire-refill-fire.json` に各段階の実nativeインク残量・shot count・current SOURCE aim・実カメラ・実impact/foot等を逐次保存する。テスト証拠はfake不可。**修正版の新しいCI同SHAで全パスするまではB413 HOLDを維持**する。B405〜B412の狭い真正PASSは保護。

## B413真正SOURCE限定PASS — 2026-11-03 最終監査

- [Actions #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100) は全工程SUCCESS、実ゲームSHA `53839205a451192b125ca50f8693d157af8d9bf2`、真正artifact **13238617827**。ZIP SHA256 `b55ffc7d2ed0acc7c46e6b7eabee4b97a9cb768d5e0d94a6c68e49214f3c5e7c`。GitHubに保存された独立B409/B410/B411/B412/B413は**同じ真正Chromium180秒ゲーム**をPASS。
- ネイティブ残り90秒で実人間17発・実タンク **16.15** 消費・原作右上段PaintCoordinator Human Impact/WallImpact **17件**。元OWNインクでSQUID_OWN回復が**実測6.8増**、ヒト形態に物理復帰後14発・実タンク **13.30** 消費・同原作右上段実Impact/WallImpact **13件**。既OWN再着弾でchangedCells=0のイベントは原作新規塗装セルと区別し、実接触と所有変化を混同しない。
- 本物の元4 PaintSurfaces人間塗装、原作高所→下段→坂→上段KCC、イカOWN実泳ぎ5.237787514m、CPU7、実TIME_UP **tick11857**、人間総116shots/1112原作owner変化セル、CPU151shot requests/12014変化セル。人間→敵CPU HP命中/撃破/復活は **0**、正式4v4・Turf Scoreable0/公式勝敗・ART・productionはHOLD。元25/17/26/0、自然対岸0/12の固定を維持。
- 初回失敗 [#41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) と２回目失敗 [#41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) は履歴から消さず、そのSHAも後付けPASS扱いにしない。今回の修正は真正受理されたPaintCoordinatorイベントを読み取り専用で記録し、実塗装所有変化の判定は一切緩めていない。

## 2026-11-04 研究継続：B413真正PASS / F5・B414とB415の最新境界

- **真正確定済み**：B413 [Actions #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100) SHA `53839205a451192b125ca50f8693d157af8d9bf2`、B413+F5既存HUD回帰 [#41654818533](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41654818533) SHA `18cd7f296d97bec9ffab266ae2ab057f6ef7e67e` が真正同一180秒SOURCE・B413までの独立監査 SUCCESS。元原作25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸自然経路0/12、正式4v4/得点/勝敗/敵HP/ART/productionはHOLD。
- **研究F3・B415**：「実射撃消費→OWN SQUID補給→人間再射撃」の順をそのまま本物のプレイヤー向け小型HUDで案内する読取り専用プレイ課題 `src/app/B415LiveInkLoop.ts` が研究branchに追加された。別チャット並行開発との重複・変更上書きを避ける。B415の真正Chrome run [#41721070651](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721070651) は本記録時点でqueued。Unit/Source候補≠現実のプレイヤー達成PASS。
- **研究F5・B414**：本物のPlayerResourcesインクHUD表示をさらに読みやすくし、旧「HUMAN · HUMAN」表示を `FULL` / `HUMAN RECOVERY` / `RECOVERY LOCKED` / `OWN INK · REFILLING` に明確化。既存B413の1本の実Chrome試合から、実射撃前後・OWNイカ中・人間復帰・再射撃・TIME_UPのDOMインク残量/バー幅/native tick/モードを **読み取り専用**収集し、新 `scripts/t21-b414-native-ink-hud-audit.mjs` でB413本体判定と独立に検証。B415のプレイ案内機能を消さない。
- **最新B414コードSHA** `abac9422fa7f6772f286b0fafbea8d6f35353e32`、[GitHub Actions #41721892162](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721892162) は記録時点 **queued・結果未確定**。監査の独立JavaScriptユニット実行では正常系2ケース/偽データ拒否8条件PASS。ただし真正Chrome・同SHA独立HUD監査はまだPASS未確認。旧B413真正PASSへ遡及的な変更なし。
- **衝突回避・安全**：main/正式QA/T19C/T20/Draft PR#5/Pagesを無断変更しない。原作HP/資源/Actor/時計/地形/塗装を書き換えず、ユーザーPC操作不要、Work事前承認制。次回は新SHAの最新Actions最終result・artifactを最初に照合。B414真正FAILならphase別DOM native RAWを解析し、ゲーム判定を緩めずに修正。二重実装やCI乱発を避ける。


## 2026-11-04 B416 実Chromium失敗の真正再調査・継続

- **旧B413 SOURCE限定PASSは変更なし**：[run #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100)、[既存B414簡易HUD導入run #41654818533](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41654818533) だけがその各SHAで真正180秒・独立B409–B413 SUCCESS。元の25/17/26/0・自然対岸0/12、敵HP/正式4v4/得点・勝敗/ART/productionはHOLD。
- **重要な失敗・取り消し禁止**：B415過渡run [#41721029557](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721029557) は真正B413実Shot/OWN回復/再Shotが成立した後でも、HUDの実B415ステージが `REFILL` のままでFAIL。新B414 run [#41721892162](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721892162) ではB412真正ヒト復帰の元上段位置差が1.14mになり、確定限界0.95mを超えたためFAIL。中間実足は元位置から0.78m以内に達しており、追加のKeySで行き過ぎ。別 run [#41721070651](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721070651) は原作着弾native tickと旧先取りsnapshotの読み取り順序差によりFAIL。いずれも真正SUCCESSへ書き換えない。
- **外部との並行変更を尊重**：研究SHA `49f9cdda3ac8d76eefcc17028030fdc831532d2e` はB412の本物のKeyS復帰中止位置を0.85mに改善（最終認証0.95m保持）し、B413の読取り専用の接触ledger先読みによる時刻整合を修正。こちらで重複上書きしない。[run #41724562943](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41724562943) の真正検証対象。
- **今回B416新実装**：SHA `20ebfaddbd90fd65cbefaf5b0a02d195b53efcd8`。B415 read-onlyプレイ目標の状態遷移を遅いWebGL DOM描画から離し、既存真正SOURCE固定tick `b25Run.observe` と同じ60Hzで更新。元B414の実 `PlayerResources` インク数字・回復・バー・B415ラベルはゲーム書き込み無しの軽量毎render表示に変更。実Shot/OWN/refill/reshotを画面から個別観測する既存B414独立監査はそのまま厳格に維持。B412/B413は既存SHA49f9修正を維持。
- **新SHA真正試験**：[Actions #41725404578](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41725404578) は本記録時点queued（未PASS）。従ってB414/B415は**正式SOURCE限定PASS未認証・ART HOLD**。次回はこの実際の最終結果（同SHA／ログ／RAW artifact）を確認し、F3達成判定の偽装や受理条件緩和は不可。
