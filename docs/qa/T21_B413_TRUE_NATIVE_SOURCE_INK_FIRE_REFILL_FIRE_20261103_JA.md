# Browser Ink TPS — B413 1本の本物SOURCE試合で「撃つ→インクを消費→イカでOWN補給→再び撃つ」

基準日 2026-11-03 JST。F3・操作可能な本物のゲーム体験を優先。既存の原作25 Rapier solids/17 PaintSurfaces/26 NavLinks/0 ScoreableとF1～F5・保護方針は完全維持。

## 今回B413で新しく作るもの

- [B412の真正PASS #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)（コードSHA `7d31501c702b725dda730047cc47db379523a400`、証拠artifact `13233112543`）を前提とする。B412では元の原作右上段で実イカ形態・実OWN塗装・SWIM_GROUND・原作支持KCC・ヒト復帰、真の180秒試合と人間4面実塗装、CPU7、B411 HUDが同一runで成立済み。
- `T21_B413_REAL_SOURCE_INK_LOOP=1`は**B412+B411+B410全て有効時のみ**。既存同一ネイティブChromiumルート試合の残り90秒で、元B408成功した原作右上段のCDP狙い位置を使い、本物のCDPマウス押下を約78 native ticks保持。元の本物のPlayerResourcesから、SHOT数が5以上増え、インクが4以上実際に減り、同じ原作右上段のProjectile/PaintSurface impactイベントが届いたことを記録・検証。テスト用にタンクや命中を直接変更しない。
- 続くB412実Shift＋W/Sイカ移動を本物の原作OWN塗装で行う間、`window.__t21F3.snapshot()`の`player.ink`、`playerInkRecoveryState`、`player.mode`、`player.inkRelation`、native tickを**観測のみ**で時系列記録。少なくとも2サンプルで**イカ状態＋OWN＋SQUID_OWN**が実際に観測され、同じOWN連続観測でタンクが増えていること（>0.25）を要求する。これでヒト形態での待機補給と区別する。
- 元の実KeyS帰路で同じ原作床にヒト形態で戻った後、本物CDPマウス射撃を約54 tick続け、原作着弾、追加5 shots以上、追加4以上のインク消費を測る。そのまま既存の残り60秒・30秒の原作4面source shot、7CPU、180秒TIME_UPと正式再戦UI復帰まで成功させる。
- `b413-real-original-ink-fire-refill-fire.json`にnativeの実インク残量・OWN補給・実shotを保存し、`b413-independent-original-ink-economy-verdict.json`で既存B409/B410/B411/B412の**同一runの厳格な独立PASS**と照合する。

## 失敗時の扱い

本物の原作着弾がなかった、インク消費/OWN補給が測れなかった、原作右上段支持が崩れた、追加射撃でB412移動が変わり本物の復帰ができない、タイムアップ前にTIME_UP/安全停止した、または独立監査がFAILなら**B413のみHOLD**。本物の実ログ・保存JSONで根拠を調べ、原作のスコアや物理を偽装してPASSにしない。B412までのPASSを取り消さない。

## 永続HOLD

原作Ver.7.2.0・元25/17/26/0・natural cross-team Recast0/12、activationReady=false。人間→CPUの実HP命中・撃破・自然150tick復活、正式得点・勝敗、正式4v4、ART、本番公開は認証未了。main/T20/正式QA/Draft PR#5/Pages保護、Workは事前承認制。Chat+GitHub、ユーザーPC操作不要。これは仕様の変更ではなく**本物の可操作F3機能の統合**である。

## 2026-11-03 B413初回の真正Chrome HOLD（原因未確定部分は明記）

- [初回 GitHub Actions #41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) at **exact code SHA bed6ec5da1c72c65f4315639a909411371a7bbbb** は失敗。事前node unit・型/ビルドPASS、B322真の上段到達PASS、B411本当の実試合PLAYING表示PASS、120秒のB410実射撃**8shots／原作右上段94 original cells changed**、7元CPU稼働。本当の90秒sampleもPASS。直後の新B413最初の追加射撃で **B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_TRUE_ORIGINAL_UPPER_PROJECTILE_IMPACT_BEFORE_SQUID** となり、同runのB413イカ補給・ヒト復帰・再射撃・TIME_UPを未認証。Original artifact **13234999159**。初回は B413 fragment JSON の途中保存がなかった。原作右上段へ新B413の本当のshotが着弾した証拠はなく、「着弾したが監査が誤判定した」と断定しない。
- 初回のコードは「120秒のB408で成功したCDP x/y」をそのまま90秒とイカ復帰後に再利用した。ログと原本では120秒時点のB408 source cell grid[90,131]・world[12.4381,4.502,50.7800]・CDP[805,475]・本当の観測カメラ yaw71.5/pitch-40.62・元のUpperPaintSurface実impactTick4729を確認。一方で90秒時点の**現在の本物のカメラから**再照準した保証はなかった。これが原因である可能性が高いが、初回には新B413の個々の実SHOT/impact/カメラ観測原本がなく**原因を確定できない**。
- 修正では既存B408の **read-only 原作ownerGrid＋実カメラの安全なCDP射撃計画を、B413各射撃（90秒、イカから戻った後）それぞれで新たに計算**、本当の `Input.dispatchMouseEvent(mouseMoved)` から `b408NativeMouseAligned` で現実のcamera yaw/pitchを照合してからメイン射撃する。SOURCE floor/support、原作17セル、実インク消費、元impactTick/Surface、cpu7/clock/Scoreable0の要求は減らさない。独立監査も各射撃の **B408原作surface provenance＋実CDP一致＋実camera alignment** をチェックする。
- また再発HOLDでも `b413-real-original-ink-fire-refill-fire.json` に各段階の実nativeインク残量・shot count・current SOURCE aim・実カメラ・実impact/foot等を逐次保存する。テスト証拠はfake不可。**修正版の新しいCI同SHAで全パスするまではB413 HOLDを維持**する。B405〜B412の狭い真正PASSは保護。

## 2026-11-03 B413修正版再試験 #41647713309 の真正FAIL

- 同SHA `7fb9740ad50ebfc06fd139bac3a1146f1db2ce11` の [Actions #41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) はFAIL。Node/build/preflight PASS、Chromium本体FAIL、独立監査SKIPPED。真正artifact **13236443122**、ZIP SHA256 `ab745fac7bbf82ac8cbcbd5685e09df7e9a704fa027358a1809baa9708678835`。
- 90秒 native tick6510→6588、実人間Shots 68→85（17）、実ink 100→83.85（16.15消費）、原作右上段支持、実カメラとCDP照準一致。従来 `humanLastImpactTick=4740` は120秒時点の古い実変化セルのtick、90秒の新しい着弾は未認証。候補の元セルは全てOWN（nonOwnCandidateCount=0）。
- 原因を原本追跡：`UndertowF3SourceInkFeedback.accept` はHuman `Impact/WallImpact` のうち `changedCells<=0` を既存 `lastImpactTick` から除外。これは**実接触したが既にOWNで0変化**と**本当の弾外れ**を区別できない。90秒17発の実接触を現状RAWだけでは認証不可。
- 修正は元 `PaintCoordinator` に受理されたHuman `Impact/WallImpact` のイベント数・target原作surface・native tick・changedCellsを別の読み取り専用証拠として追記するだけ。既存B23セル変化・原作ownerGrid・得点・HP・stage・試合時間・CPUは変更しない。B413は新しい実接触イベント＋本物shot/ink消費＋OWN補給＋ヒト復帰/再射撃＋180秒を要求したまま。**新SHAの真正同一試合・独立監査成功まではB413 HOLD**。

## B413真正SOURCE限定PASS — 2026-11-03 最終監査

- [Actions #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100) は全工程SUCCESS、実ゲームSHA `53839205a451192b125ca50f8693d157af8d9bf2`、真正artifact **13238617827**。ZIP SHA256 `b55ffc7d2ed0acc7c46e6b7eabee4b97a9cb768d5e0d94a6c68e49214f3c5e7c`。GitHubに保存された独立B409/B410/B411/B412/B413は**同じ真正Chromium180秒ゲーム**をPASS。
- ネイティブ残り90秒で実人間17発・実タンク **16.15** 消費・原作右上段PaintCoordinator Human Impact/WallImpact **17件**。元OWNインクでSQUID_OWN回復が**実測6.8増**、ヒト形態に物理復帰後14発・実タンク **13.30** 消費・同原作右上段実Impact/WallImpact **13件**。既OWN再着弾でchangedCells=0のイベントは原作新規塗装セルと区別し、実接触と所有変化を混同しない。
- 本物の元4 PaintSurfaces人間塗装、原作高所→下段→坂→上段KCC、イカOWN実泳ぎ5.237787514m、CPU7、実TIME_UP **tick11857**、人間総116shots/1112原作owner変化セル、CPU151shot requests/12014変化セル。人間→敵CPU HP命中/撃破/復活は **0**、正式4v4・Turf Scoreable0/公式勝敗・ART・productionはHOLD。元25/17/26/0、自然対岸0/12の固定を維持。
- 初回失敗 [#41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) と２回目失敗 [#41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) は履歴から消さず、そのSHAも後付けPASS扱いにしない。今回の修正は真正受理されたPaintCoordinatorイベントを読み取り専用で記録し、実塗装所有変化の判定は一切緩めていない。
