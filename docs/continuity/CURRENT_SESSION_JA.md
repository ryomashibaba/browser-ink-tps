# Browser Ink TPS — 現在の作業地点（GitHub引き継ぎ）

**更新時点：2026-11-01 JST。必ず現在HEADとCIを取り直すこと。** 添付ファイルなしでこの文書と固定入口だけで再開する。

## 正本と絶対禁止

- 正本 `ryomashibaba/browser-ink-tps` / 作業可能ブランチ `dev/t21-f4e103w-qa-infra`。
- 本記録のゲーム実装基準HEAD: `9c048d520afde1528f6c7288274eb8b438b2efac`（B402 fail-closed 修正）。引き継ぎ文書コミットはゲームソースに変更なし。
- `main`、T19C/T20、Draft PR #5、公開Pages、Windows原本、非公開原作資料は一切無断変更・公開しない。Workは事前承認が必要。
- 原作現認証 **25 solids / 17 paint surfaces / 26 NavLinks / 0 Scoreable / 自然対岸ルート0/12**。
- `activationReady=false` / `productionAuthorized=false` / `unrestricted4v4Certified=false` / Winner `NONE`。ART・正式4v4・公式勝敗・本番公開はHOLD。
- 推測の橋・床・坂・NavLink・Actorワープ・偽弾/HP/インク/tick・未認証得点面を作らない。

## 永続ロードマップ（変更禁止）

- 最終目標：スプラトゥーン3 Ver.7.2.0以降のマテガイ放水路・通常ナワバリ。人間1＋CPU7による自然な4v4、実移動・射撃・インク・HP・撃破・150tick復帰・180秒・原作得点と勝敗・再戦まで完成。
- F1：実8Actor配置 → F2：実Rapier/Recast移動 → F3：本当に遊べる戦闘と試合 → F4：原作ステージ/接続/得点 → F5：美術と視認、手動品質審査。既定の順序とHOLD権限を維持。
- 次の最重要課題：**実敵との自然な遭遇、実弾HP命中、撃破と実復活**。原作中央経路の未認証はF4だけHOLDし、他の独立した実ゲーム改善を続ける。

## B399〜B402の到達点と証拠

- B399：実カメラの照準を塞ぐ既存Actorだけの表示OFF・一時停止時復帰。`c772767a`、[真正Chromium B75 #41310880914](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41310880914) SUCCESS。実STAGINGでの限定PASS。180秒通しのART認証ではない。
- B400：実180秒TIME_UPの17 SOURCE ownerGridをA/B/未塗装に集計、終了画面で表示、手動JSON保存（統計のみ）。`c5bbda1e`〜`7a3c4b0d`。[B390 #41312738273](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41312738273) 真正Chromium SUCCESS。
- B400確定実測：登録済み実SOURCEセル計169,742（A 19,212／B 15,052／未塗装135,478）。CPU7/7、CPU実射撃859、CPU変更セル20,093、人間実射撃93、人間変更セル390、サブ実爆発2、原作スタンプ14、サブ変更セル271、tick 11856で180秒TIME_UP、再戦PASS。対敵HP命中・撃破は0。公式得点・勝者ではない。
- B401：実ゲーム中SOURCEセル所有数をプレイヤーHUDに180実tick間隔で表示。`f01b7ab4`〜`3890ccd9`。専用VitestとbuildはSUCCESS。180秒B390での表示値一致は**まだ未認証**。
- B402：8Actorレーダーに原作実所有PaintSurfaceの点サンプルを重ねる。位置・高さ・有効footprintに限定、塗装全域を補間しない。`998982f3`〜`9c048d52`。初回B75は406 test PASS/1 FAIL（不正stageの例外）だったが後続修正でfail-closed化・端セル座標補正。
- 最新ゲームHEADの[B75 #41316119230](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41316119230) は preflight、B287、FIXED、SWEEP **すべてSUCCESS**。ただし短時間Chrome試験はB401/B402の真正180秒表示を認証しない。
- [B390長時間統合 #41315948710](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41315948710) はこの文書作成時**実行中**（`998982f3`時点のコード）。次の担当は最終ジョブログから `B401_REAL_NATIVE_LIVE_GRID_HUD_PASS`、`B402_REAL_NATIVE_SOURCE_INK_RADAR_PASS` とTIME_UPを確認し、未認証部分は実測で修正する。別SHAのSUCCESSを最新SHAに無条件転用しない。

## 最重要HOLDと反省

- 中央アンダーパスRecast残り約31.716m/31.786m、自然対岸ルート0/12。FloorLine00原作由来幅約0.311mに対しCPU直径約0.60m。元OBJの版・collision属性が未認証。局所QA追加solidをゲームの原作経路権限に昇格させない。
- SOURCEの実塗装セル数は公式面積・得点ではない。自然180秒で人間→敵HP減少・splat・実150tick復帰はまだ一気通貫未認証。
- 旧『同一元solid上だけ射撃可』条件は歩行可能性と物理弾射線を混同しCPU塗装を減らした。弾道は元Rapier遮蔽、歩行は元Recast/Rapierで別判定。
- **大きな反省**：B番号・小さなQA・数値校正・CI起動乱発・HUD追加だけを進歩としない。実際の遊びの増加が最重要。新CI乱立より既存1系統の真正Chromiumを再利用。結果確認前にPASSを名乗らない。
- 自動 `meta/t21-continuity/docs/continuity/LIVE_STATE.md` はQA HEADに同期しても古いW10-B244等のドキュメント名を表示することがある。最新ゲーム実装の根拠にしない。

## 次チャットの最初の実作業

1. QA HEAD、同SHAの実CI、上記B390の最終ChromeログをGitHubで照合。
2. [永続決定](DECISIONS_JA.md) / [Fast Track](FAST_TRACK_EXECUTION_JA.md) / [F1〜F5ロードマップ](../../T21_FAST_TRACK_ROADMAP.md) / [原作固定](../../CURRENT_CANONICAL.md) を継承（作り直しや方針再決定は不要）。
3. B401/B402実Chromeで未証明なら修正。その後F2/F3の自然敵遭遇・実HP戦闘・実復活に直結する**まとまったゲーム機能**へ進む。原作資料不足なら該当F4部分だけHOLD。
4. 開発QAブランチのみ実装・必要最小限の回帰・真正Chromium・Actions実測・コミット。機能単位の終了時にこの現在地文書を短く更新。**ユーザーにファイル添付を頼まない。**

## 2026-11-01 — F3 真のCPU巡回ゴール到達後の原作塗装候補（検証待ち）

- QAブランチで既存B216の原作PaintSurface探索を拡張。実Recast巡回ゴールからCPU実足元までの水平距離が0.40m未満の場合に限り、既存の実CPU `weaponFacing` を探索方位に利用する。以前は候補0件だった条件。ゴールまで距離がある従来の12候補は変更しない。
- 生成するのは2.5/3.5m以内の**照準候補**だけ。既存 `GameplayInkSystem.sampleWorld` の実所有者・原作面・非Scoreable条件、実CPU接地状態、既存B216 Rapierの足元と射線審査を通るまで**発射も命中も認証しない**。0入力/不正な実向きならfail-closed。原作ジオメトリ/Actor/経路/HP/弾仕様/スコアを変更しない。
- 同一変更にVitest回帰を追加。**真正Chromiumで塗装件数が増えた証拠はまだない。** 新HEADでのbuild・Vitest・原作180秒実測の結果を別途確認するまで、これはコード実装でありゲーム性能PASSではない。
- 従来の25/17/26/0と自然対岸0/12、正式4v4/ART/公開HOLD、main/T19C/T20/PR#5/Pages凍結は継続。

## 2026-11-02 — F3 実CPU装備射程と原作塗装候補の整合（新HEADの真正QA待ち）

- **既存B390の未確定項目を実ログで確定:** [#41315948710](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41315948710)（実施SHA `998982f3`）ではB401 `B401_REAL_NATIVE_LIVE_GRID_HUD_PASS` とB402 `B402_REAL_NATIVE_SOURCE_INK_RADAR_PASS`。実SOURCE 169742セル、180秒 TIME_UP tick11859、CPU7/7復帰、CPU617発/13608実変更セル、人間94発/388実変更セル、HPヒット0。別SHAの現在ゲーム全体のPASSには流用しない。
- **実装:** F3の既存CPU局所SOURCE塗装において、原作面・Rapier支持・物理弾射線の審査を維持したまま、既存の**実装備の主武器射程判定**を候補選択時にも適用。協力照準・B64局所探索・元の前方探索・B216後方/側方探索で射程外候補を捨て、もし同一探索に別の実SOURCE射程内候補があれば選択し直せる。以前は選択後のfire側で拒否され、他の候補を検討できない場合があった。新弾・新Actor・新地形・射程チューニング・見せかけの命中は0。
- **厳格な判定:** この変更によるCPU射撃増加、所有セル増加、人間対CPU命中、正式4v4は**実測していない／HOLD**。最新HEADの同SHAビルド/既存Vitest/真正Chromiumの最終結果を必ず確認。B401/B402の既存実PASSも旧SHAの独立証拠に限定。
- 25/17/26/0・自然な対岸経路0/12・正式勝敗/ART/本番/マージHOLD、main/PR#5/Pages/Windows原本不変更。

## 2026-11-02 — F3 原作ゴール到達時の実塗装近接候補（限定実装）

- ゴール残距離0.40m未満の実Recast CPUでは既存の前方向B64探索が空になるため、原作既存B64と同じ**1.7m距離**の近接角度6候補をB216のSOURCE専用探索に追加（従来の2.5/3.5m各6候補も維持）。通常ゴール移動中は従来12候補のまま。使用する方向は実CPUの`weaponFacing`だけで、非有限値/長さ不足は拒否。
- 候補はSOURCE正本の`GameplayInkSystem.sampleWorld`による実PaintSurface/ownerGridと、既存Rapier支持・物理射線・実武器射程の全審査が通るまで射撃対象にしない。実装済みの`CpuAgentSystem`で最終的に採用された短距離照準を**候補数**として観測可能にし、実弾発射・塗装変化とは明確に区別。
- 従来の真正B390実ブラウザ180秒に件数を追加。新SHAで同一実行のCPU射撃/原作インクの最終結果が出るまで効果は**未認証**。短距離候補0件でもゲーム失敗と断定しない。追加地形/Actor/得点面/HP変更/公式スコア/新CIは0、従来の25/17/26/0、対岸0/12、正式4v4と公開HOLD維持。

## 2026-11-02 — F3 原作ownerGrid周辺塗り残しへの実弾照準（新SHA実測待ち）

- 直前の真正Chrome B390 [#41321143735](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41321143735) は旧HEAD `8a317c1` で180秒TIME_UP・CPU実射撃617・変更13,608 SOURCEセル、CPU7/7復帰、自然なHP命中/撃破0、ゴール短距離照準採用0。これは新変更の性能証拠ではない。
- F3実装：照準中心が自色でも**原作同一PaintSurfaceの周辺実ownerGridに未塗装/敵インクがある場合だけ**、既存B180/B216の実照準候補を審査する。中心の実Paintable mask/owner一致・実武器射程・Rapier足元支持・原作射線を厳守。元の弾/物理/移動/Actor/スコア/新CIに変更0。B180 opt-in無効時は従来の選択経路を維持。
- B390真正180秒実ブラウザにB180/B216別の自色中心照準候補採用件数を追加。照準候補≠実弾≠実変更セルであり、新HEADのCIと実測前は**改善PASS未認証**。
- 原作25/17/26/0、自然対岸0/12、正式4v4・公式スコア/勝敗・ART・本番/マージHOLD。main/T19C/T20/Pages/PR#5/Windows原本不変更。

## 2026-11-02 — B390 180秒レーダー時刻競合の修正（真正CI結果待ち）

- 対象の失敗: [#41352174379](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41352174379)、SHA `063b415d161ea11e1c282983e7b2743ec8a80db8`。B390の実SOURCE試合は100秒時点まで本物の7 CPU・CPU 773発・原作インク17,932セルを確認。120秒頃、B402 radar `nativeTick=8270` が先に取得済みの外側 `n.tick=8264` を6Tick越えたため、時刻比較でHOLD。表示値・SOURCE条件の他の不一致はログに現れていない。
- 修正: レーダー本体と同一のCDP `Runtime.evaluate` 内で取得した `snapshot.tick` を上限にし、検査済みの外側Tickより前に戻らないこと、実B402サンプルが最新ページから180 native ticksを超えて古くないこと、25/17/26/0とSOURCE・DOM・所有者件数・非得点権限が一致することを要求。両陣営の可視点は位置によりゼロでもよく、存在を捏造しない。
- 現行B390統合CIに独立node:testの正常6Tick先行・未来時刻・古いレンダー・SOURCE権限不一致の回帰検査を追加。ゲームのKCC/CPU/塗装/原作当たり判定/時計/得点の実装は変更しない。
- **未確認:** 新HEADの同一SHA真正Chromiumでの180秒TIME_UPと再戦、原作敵HP戦闘、自然対岸0/12・正式4v4・ART・本番公開は引き続きHOLD。CI完了前のPASS宣言は禁止。

## 2026-11-02 — F3 原作ゴール到達時の8方向インク探索（新SHA認証待ち）

- 本物のRecast patrol goalに0.40m未満まで接近したCPUは、既存の実weaponFacingを使ったSOURCE-only近接探索を6方向から8方向（45度間隔）にする。以前欠落していた真正の前方向と片側斜め前方向を補い、到達前の従来12候補は一切変更しない。
- これは照準**候補**のみの改修。既存の実SOURCE ownerGrid・Paintable・非Scoreable・Rapier足元支持・原作物理弾射線・実武器射程・cooldownを全て通った場合だけ既存CpuAgentSystemが照準を選択する。射撃数、塗装数、命中率の改善は真正Chromium実測前には未認証。
- 原作25 solids /17 PaintSurfaces /26 NavLinks /0 Scoreable・対岸自然経路0/12を維持。既存の本物の180秒CIが走行中のため、旧SHAの結果を今回のゲーム改善PASSへ転用しない。新しい地形、Actor、経路、偽インク、HP、スコア、CIワークフローは追加しない。main / PR#5 / Pages、ART / 正式4v4 / 本番のHOLD維持。

## 2026-11-02 — B403 真正SOURCEレーダーの低FPS下更新・180秒検証

- 起点QA HEAD `abb068396e926e53df8c5764dd893efacdb81830`（CPUの実到達ゴール8方向SOURCE塗装）。旧B390真正 [#41422194231](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41422194231) は100秒時点で実CPU768発/原作塗装17,560セルを記録したが、120秒付近でレーダー描画サンプルがページnative tickより198tick古く、厳格な180tick鮮度ゲートでFAIL。試合完走・公式4v4の証拠ではない。
- **ゲーム機能改善:** 低FPS/SwiftShaderでHUD全体は従来12可視フレーム更新のまま、SOURCEレーダーのみ3可視フレームごとに本物のCPU位置と原作ownerGrid表示を更新。元PaintSurfaceの本物の点サンプル周期を180→120 **native 60Hz ticks**へ短縮し、長時間プレイ中に古いレーダーを見る時間を抑える。PaintEvent/インク所有/HP/Actor/物理tick/得点/ステージへの書込なし。原作セルの周辺面積を推定しない。
- コミット: `ddc6f3e4`（描画間隔）、`7a0a258f`（実SOURCEサンプリング）。`6b69d323`で既存の真正B390・20秒チェックポイントに同一Chromiumページのレーダーnative sample ageと本物の描画フレーム数の計測を追加。新ワークフロー追加なし。
- **検証は限定・保留:** [B390最新SHA CI #41428008971](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41428008971) は起動直後で結果未確認。B75・型ビルド・180秒TIME_UP・リプレイ・実人間対CPU HP命中・150tick復活の新SHA PASSは**認証前**。旧成功を流用しない。
- F1〜F5と25 solids/17 PaintSurfaces/26 source NavLinks/0 Scoreable/自然対岸0/12、正式4v4・公式Winner・ART・公開・mainマージHOLD継続。次工程: B390の同一HEAD実測を確認し、レーダー鮮度と完走/再試合を独立判定。その後、原作ルート0/12を架空接続せず実敵遭遇→実弾HP減少→撃破・実150tick復活のF3実ゲーム統合へ戻る。

- 追加の性能修正 `a3ec0814`: 3フレーム刻みのレーダー描画で巨大な全QA/HUD snapshotを再実行せず、真正Rapier KCC位置と `traffic.snapshot()` だけを使う。実CPU交通・実ownerGridの読み取りのみ。最新コード同一SHAの [B390 #41428195956](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41428195956) と [B75 #41428196121](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41428196121) は起動済み・検証結果待ち。前SHAのキャンセルをPASSと誤認しない。

## 2026-11-02 — B403 レーダーのnative試合切替・終了時表示を正本化（CI待ち）

- 読み取り専用のSOURCEレーダーに、前回試合よりnative tickが巻き戻った場合・sample ageが180実tickを超えた場合・不正tick時に古い原作塗装点を破棄する処理を追加。新試合の実ownerGridが読めるまで以前の塗装を現在地として描かない。
- 真正TIME_UP画面でも必要なら元の17 PaintSurfaceの実ownerGridから最終サンプリングする。補間・推定塗装・Turf公式得点・Actor/物理/インク/時計書込は追加しない。既存B402のproofのみ利用する。
- 前回B390 [#41428195956](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41428195956) は別HEAD `a3ec0814` の長時間真正Chromium。結果を本変更のPASSと混同しない。新HEADのB75/真正180秒が未終了ならHOLD。main/T19C/T20/PR#5/Pages、原作25/17/26/0・自然対岸0/12・正式4v4・ART・公開HOLD維持。

## 2026-11-02 — B403 実SOURCEレーダーの再戦分離・検証追加

- 前HEAD `a3ec0814929e8e9fee513032241246db598cfa76` の [真正Chromium 180秒 #41428195956](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41428195956) は全体SUCCESS。CPU実1053発・元SOURCE ownerGrid変更18810セル、原作7 CPU再合流7/7、TIME_UP実tick11860、実再試合（STAGING tick0）の実証。B402レーダーは20〜160秒の既存各チェックポイントでSOURCE実サンプルと描画を確認。**この旧SHAの成功を後続HEADの成功とはしない。**
- 新しい再戦表示対策：同一レーダーがTIME_UPからSTAGINGに移った場合、過去試合のownerGridサンプルを先に破棄。不明なmatch phaseもfail-closed。原作地形・NavLink・ゲーム経過・PaintCoordinator・HP・Scoreableへ書き込まない。
- 既存B390真正Chromiumの180秒TIME_UP後、実ユーザークリックで作られる次の新世界について、元レーダーcanvasの存在とSOURCE ink状態OFF、サンプルtickが非正、A/B表示点0、SOURCE snapshotの旧試合proof非継承を実際に検査する。**この新チェックのPASSは新HEADのActions完了まで未認証。** 新ワークフロー0、原作25/17/26/0と自然対岸0/12、正式4v4・ART・公開HOLD維持。

## 2026-11-02 — B401実ブラウザ120秒のTick競合を修正（新CI検証待ち）

- QA HEAD `39e724db9774767bf4374542cb1e5dab6dd2c6de` [B75 #41442964849](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41442964849) と[B15 #41442964779](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41442964779) は全ジョブSUCCESS。一方、[真正B390 #41442964780](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41442964780) は約120秒で **FAIL**。停止理由は `B385_B401_TRUE_NATIVE_HUD_SOURCE_GRID_MISMATCH`：先に保存した外側Tick8265より次のブラウザ読み込みの実ownerGridサンプルTick8271が6Tick進んだだけでも偽の失敗としていた。60秒時点などの原作HUD、CPU7/7、実塗装の成功は旧範囲だけ確認。
- 既存B402の同CDP時刻比較方式と整合させ、`B401`でもページSnapshotのTickとHUD・SOURCE countersを**一回のRuntime.evaluate内**で同時取得。前のTickは下限とし、後の実Tickへの前進は許可する。新しい同一時点Snapshotより未来のsource tick、180tick超の古いサンプル、原作17面/169742等のセル総和不整合、HUD値相違、公式Scoreable/勝敗偽装は依然拒否。自然な180秒やレーダー再戦の新しいPASSは**後続真正CIまでHOLD**。
- 既存B390 node:testに正常CDP進行・古さ・未来・偽スコアを一括回帰。物理/CPU/武器/原作25/17/26/0/ゲーム時計を変更せず、ワークフロー新設なし。main/Pages/T19C/T20/PR#5、対岸経路0/12・正式4v4/ART/公開HOLD維持。

## 2026-11-02 — F3 原作同側の真正敵CPU接近を実戦向けに変更（新SHA CI待ち）

- 既存B192の SOURCE-only 敵CPU追跡は、人間が現実にB側の原作支持床へ入ったときだけ成立し、CPUの実足→人間の実足の原作Rapier支持、全中間実Recastパス/原作床を要求する。ただし以前は最終Crowd goalが**生存する人間の物理足そのもの**であり、近接時に互いのカプセルが衝突してCPUが攻撃距離を維持できない恐れがあった。
- 今回は既存B142の**実Recastパス上2m手前の既知standoff**を再利用。ただし相手は実敵人間であり、B側元原作床の支持、再度そのstandoffまでのRecast+全中間Rapier支持を個別審査。通らなければ従来の安全な原作巡回へ戻す。CPU position/physics/cooldown/武器性能/AI距離認証は直接変更しない。これは正式原作スタンスパラメータの認定ではない。
- B192の正・負・短距離・原作中央未接続・高低差条件のVitestを追加し、既存B75統合CIで実行する。新ワークフローなし。**自然な敵人間との真正HP交戦・撃破・復活が増えたとの主張はしない。** これまでのSOURCE通常配置では対岸経路0/12のまま。
- 直前B401 CDP tick同期の [真正B390 #41446701637](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41446701637) は現時点Queuedであり、旧HEAD結果を今回の実装PASSと混同しない。固定25 Rapier solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、公式Winner NONE、正式4v4/ART/本番/マージHOLD、main/T19C/T20/Pages/PR#5保護継続。

## 2026-11-02 — B384実12武器の敵CPU実HP・撃破・復活通知統合（本物の命中は未認証）

- 正本B367は旧B351研究用pulse-sprayerの「実物理命中→CPU HP減少→SPLATTED→実復活」記録に限定され、ユーザーが選ぶ標準B384原作SOURCE 180秒（Twin Comets等）ではゲーム実ダメージが発生しても履歴通知は作れなかった。
- 今回B384特有の厳密なSOURCE 25/17/26/0+全17面+非B343認証後だけ、**元々発生した実CPU HP減少の読み取り**を有効化。既存のProjectileSystem動的弾のHP結果だけでなく、CHARGERの原作Rapier衝突順による実ray HP結果も同じ録画台帳へ通す。被弾シールド吸収・Rayの見かけ重複・壁手前・CPU弾・自動生成イベントは記録しない。12武器のIDは既存WeaponCatalog正本からのみ受理。
- B384 PLAYING時だけB367 overlayをプレイヤー向けに表示し、実HP減少、HP=0（撃破未確定）、本当にlifeState=SPLATTED、同じCPU本当にACTIVE+HP100+実復活数を段階的に表示。既存B351 pulse研究起動/視覚候補は従来のopt-in、現行武器挙動・弾・敵AI・HP/Scoreable/物理/地形はすべて変更しない。
- B367の複数実武器識別・不正武器・偽HP・敵ID・失効のVitestを追加し、既存B75統合CIへ含める。**未認証:** SOURCE通常配置の対岸自然敵遭遇0/12は未解決、実HP命中0の可能性がある。本変更により命中自体が発生・増加したとの主張は厳禁。真正新SHAの60Hz/180秒/再戦はCI結果が出るまでHOLD。main, T20/T19C, PR#5, Pages, 正式4v4/ART/本番公開はHOLD。

## 2026-11-02 — B384/B367 真正60HzのHP撃破・復活観測へ移行（新HEAD CI待ち）

- 以前のB367通知は重いHUDの `refresh()` でだけ `timeline.observe(snapshot)` を実行していた。SwiftShaderなど実ブラウザ低FPSでは観測間隔が150 native ticks以上になる可能性があり、**現実にSPLATTED→復活した同じCPU**がHUD観測間で欠落してしまう。前工程12武器統合 `e830646ae1aef36a48bff1ea6c763f6c0ffd3939` ではこの時刻問題が未修正だった。
- 本工程はSOURCE 12武器B384または既存B367研究選択中に限り、`stepFixed()` の実CPU更新・真正弾HP処理・ペイント処理の後で毎native tickに実Actor7体の `lifeState/hp/physicallyRejoined` と本物の `ProjectileSystem` HPイベントをB367 ledgerへ読み取り。重いSourceTraffic全スナップショットを避け、7人分だけの新しい**読み取り専用**軽量readerを使用。UI刷新は単に `currentNotice()` を表示し、証拠イベント・寿命を進めない。
- 本物のCPU被弾→HP 0→CPU側fixedUpdateで `SPLATTED`→既存150tick復帰を、遅いグラフィックスframeに左右されず保持する単体回帰。観測/表示が移動、武器射撃、Actor HPやリスポーン時間、original source 25/17/26/0、Scoreable・公式Winner・F4接続経路を変更しない。
- 本工程は **本物の自然敵HPヒット/撃破・復活が起きたとのPASS宣言ではない**。通常の対岸経路は0/12、実戦条件未解決。ゲームの正式4v4・ART・本番・main/T19C/T20/PR #5 / Pages変更禁止継続。最新HEAD一致CI PASSまで統合認証HOLD。

- **CIトリガー保全:** B367 60Hz観測と武器実HP証拠のSOURCE関連ファイル（本体・試験）とB192の追跡候補単体変更でも、既存B75のビルド+統合Vitestを起動するよう既存 paths に追加（新ワークフローなし）。回帰通知の120tick TTL正しい境界を再確認。数件の連続commitによる途中旧SHAのActionはキャンセルされたため、現在HEAD一致のCIのみ最終判定対象とする。

## 2026-11-02 — 実CPU死亡後のF2 original drop再合流修正（新HEAD CI検証待ち）

- SOURCE通常設定で本物のCpuAgentSystem.splatBot→150tick後respawnBotは上段原作spawnにCPUを再生成するが、SourceTrafficが「前の命で一度着地した」という`physicallyRejoined`/clearedを残し、freeCombat下では新しい一方通行F2 first-drop goalを再要求しない問題を確認。
- この工程ではSourceTrafficが**同一実ActorのSPLATTED→ACTIVE**と原作8Actor割当済み上段spawnの一致をnative observeで検証したときだけ、旧rejoinedをクリアして**既存のF2 original sourceGoal**をRecastへ再要求。毎回Rapier原作下段支持・本人の現在地→同じ既存sourceGoalのRecast到達・端点誤差を審査し、通らなければHOLD。Actorの実位置・物理衝突・元solid/ナビリンクやジャンプ速度・時計を変更しない。真正FIRST_DROP_REJOIN→GROUNDで初めて「この命の着地」再認定。freeCombatとほか6CPUは保持。
- B367実生命台帳も、累積の`cpuSplats>0`等で別Actorや以前の命を誤認しないよう、被弾時の実カウンター基準からの増分、同一Actorの本当のSPLATTEDと150 native tick以降の本当の復活を個別確認する。復活は上段で`rejoined=false`、下段再合流とは別。旧HUDの偽「再着地」認証を禁止。
- **まだ未実測:** 新SHAの同一真正Chromiumで実敵とのHP命中／splatted／本物の再降下／再合流を達成したわけではない。通常配置対岸0/12、元25 solids/17 PaintSurfaces/26 Links/0 Scoreable、公式score/4v4/ART/本番、main/PR#5/Pages/T19C/T20保護維持。GitHub Actions PASS前に新ゲーム成功認定禁止。

- **同SHA実Chromium統合試験:** F3 CPU life/オリジナルF2再降下/実Projectile HPの変更を既存`t21-b385-selectable-source-round.yml`のpathsに追加。従来のB384同じ180秒/再戦/原作HUDテストへB367ライフテストも含め、単体PASSだけで実プレイPASSと取り違えない。元の重い実Chrome CIがqueueならその旨をHOLDと表示し、証拠未取得で「CPU復活再降下成功」「自然敵HP命中成功」とは書かない。追加のCIワークフローは0。

## 2026-11-02 — B390真正180秒試験の「実撃破→上段復活→元一方通行降下」判定を修正

- B390実180秒試験はPLAYING中・終了画面で一律`physicalRejoins.length===7`を要求していた。前工程で実CPUが本当に撃破・150tick後に上段原作spawnへ復活すると**一時的に再着地者は6/7**となるのが正しいゲーム物理。旧B390は真の生命イベントを偽CI failure扱いする問題だった。
- 証拠を安易に甘くせず、SOURCE原作CPU7人の固有ID・各本物`lifeState/hp`・rejoined IDs・実150tick CPU respawn数・SourceTraffic上段返還待ちID・実復活検出数・元F2再降下完了数・禁止Actor実足ワープ0を**相互照合**する既存B390内read-only検証を追加。不明な欠員、他者ID、偽counter、元地形外目標はHOLD。終了画面の実再合流数とDOM表示も同じ現在の数に一致させ、必ず7/7との偽認定はしない。
- ゲームの`snapshot()`には本物の`stats.cpuRespawns`を読み取り専用で公開。20秒ごとの実ブラウザB390 checkpointにも復活数と実戻り待ちIDを保存。既存node:testを追加し、通常7/7の物理SOURCE試合は厳密維持。**自然な撃破が発生したとは認定しない。** 最新HEAD一致のCIと実Chromeが完了するまでHOLD。原作25/17/26/0、自然対岸0/12、正式4v4/ART/main/Pages/PR#5保護継続。

## 2026-11-02 — B390実180秒の低FPS SOURCE所有HUD遅延を修正（新HEADの真正CI待ち）

- 直前HEAD `464623f578a24f7d5d5a288d4d06ba9624156ff8`： [B75 #41452559787](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41452559787) は事前ビルド・Vitest・B287・FIXED・SWEEPが全SUCCESS。一方 [B390 #41452559893](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41452559893) は本物のChromium 180秒統合の120秒付近にFAILした。旧成功を新HEAD完走へ流用しない。
- **失敗の直接原因:** `B385_B401_TRUE_NATIVE_HUD_SOURCE_GRID_MISMATCH`、実`pageNativeTick=8256`に対し原作17面実ownerGrid表示の`sampleNativeTick=8058`（差198 native ticks）。CIの鮮度要求180tickを超えた。100秒時点では実CPU射撃769・元SOURCE塗装変更18007セル・本物の再合流7/7・CPU復活0を確認したが、180秒TIME_UPと再戦は未達。
- **ゲームの可視性改善:** B401 SOURCE所有セルの実読み取り周期を180→120 **native物理tick**に短縮。重い通常HUD・QA snapshotは従来12描画フレーム周期を守り、B403レーダーと同じ3描画フレーム周期に、原作17面の既存ownerGrid/実nativeTickだけを読む軽量B401 HUD更新を追加。SOURCEのA/B/中立セル数・sampleNativeTick・DOMデータを同じ実測値で更新し、元の表示欄以外は変更しない。画面のNO OFFICIAL WINNER、非得点と原作境界を維持。
- **検証の厳格性:** B390の最大鮮度180tickは緩和せず、物理60Hz・Rapier/Recast・CPU生命・HP・弾・PaintCoordinator・元ステージ25/17/26/0・原作対岸経路0/12・公式得点0を変更しない。既存B401専用Vitestを更新・追加。**新HEADのbuild/真正180秒/再戦は同SHA CI結果を待って初めて判定する。** 正式4v4/ART/本番公開/main/T19C/T20/PR#5/PagesはHOLD・不変更。

## 2026-11-02 — F3 native CPU death inventory and player-visible roster clarity (prepared; CI running)

- Preceding source SHA: `21546abafbb1815e58e6a2e92fbfd083e7d1246d`. At preparation time [B390 #41463623081](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41463623081) remains in_progress, while [B75 #41463623163](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41463623163) has an already successful preflight and other jobs in progress. Do not push over either ongoing run before reviewing their conclusions.
- Code correction prepared from prior WIP `df23d5213481a6f5bffbf95b6f79a50aec906656`: on actual same-CPU ACTIVE→SPLATTED, clear only the *previous life* original first-drop/rejoin proof. Block the stale FIRST_DROP_REJOIN→GROUND edge from classifying immediate upper-spawn respawn as lower Rapier landing. This never directly relocates actors or edits the genuine original stage.
- B390 native 7-actor inventory now differentiates real SPLATTED actors, ACTIVE lower-physical-rejoined actors, and real original upper-spawn return-pending actors. Check genuine native splat / respawn counters and actor-specific live states instead of inventing a 7/7 result. No death/hit is generated by QA or the code change. The 180-tick B401/B402 freshness requirements are unchanged.
- PLAYER original SOURCE round clock: report **CPU ACTIVE**, **LOWER REJOIN**, **SPLATTED**, and **RETURN PENDING** separately from actual native CPU and SourceTraffic snapshots. This corrects the prior ambiguous “CPU 7/7” presentation and does not claim unrestricted 4v4 or official score.
- **Prepared only, not certified:** New combined code is an unreferenced Git commit, not on QA branch until current same-SHA CI finishes. After integration, B75 build/Vitest and genuine B390 180-second Chromium must PASS for their respective scopes; one native HP hit→splat→150-tick respawn→original re-drop is NOT certified without separate same-actor native evidence. Keep original 25/17/26/0; opponent 0/12; F4/ART/score/production and protected main/PR#5/Pages HOLD.
- 追加レビューで、SPLATTED中に過去のFIRST_DROP_FALL/REJOIN移動文字列が残っても、SOURCEのphysicalFirstDropsに死亡Actorを再登録しないよう観測条件を厳格化。これは同一Actorの実生命状態の読み取りのみで、物理・移動は変更しない。新SHA真正CIの前にPASS扱いしない。

## 2026-11-03 — F3 native CPU life-state修正統合（新HEAD QA待ち）

- 前HEAD `21546abafbb1815e58e6a2e92fbfd083e7d1246d` の6 CI全終了を確認。B390 [#41463623081](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41463623081) 真正180秒/再戦SUCCESS：TIME_UP nativeTick 11857、native 180秒、Human shots 93、SOURCE実human changed 393 cells、CPU shots 1039、SOURCE実CPU changed 16284 cells、再合流7/7、CPU実復活0、実human→CPU HP命中0、実direct splats 0、公式winner NONE・scoreable 0。別の撃破→150tick復活→原作再降下は未実証で、PASS認定しない。
- 同HEAD B75 [#41463623163](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41463623163) は4ジョブ中3件成功。FIXED真正WebGL2は `T21_B75_NATIVE_TIMEOUT_270000` でFAIL。最後のread-only tick3217/STAGING/元原作CPU再合流5/7/actor relocation0で、再合流の物理遅延または競合は未解決。SWEEPの成功やB390の成功でFIXEDを代用しない。ゲームのTick/Actor/足場/実物理を偽装せず、B75 FIXEDの改善は次独立トリアージとして保持。
- 本研究統合により、実native CPU ACTIVE→SPLATTED時の古いrejoined/cleared/falling履歴を失効し、死亡中は古いFIRST_DROP_FALL記録を残さず、本物のSPLATTED→ACTIVE上段復活時のFIRST_DROP_REJOIN→GROUNDを新しい物理着地と取り違えない。元original F2が新しい命で実証されたときのみ物理再合流認証。
- B390に実cpuSplats・実cpuRespawns・個別lifeState/hp・上段返還待ち/下段再合流の相互監査およびNode回帰ケースを追加。SOURCEプレイヤーHUDにCPU ACTIVE、LOWER REJOIN、SPLATTED、RETURN PENDINGを区別し、旧『CPU 7/7』表示が死者まで含むと誤解されないよう改善。
- **新HEAD同一SHAのビルド/単体テスト/B75 Chromium/B390 180秒は、実行結果が出るまで未認証。** main、T19C/T20、PR#5、Pages、25/17/26/0、対岸自然ルート0/12、正式4v4、公式得点、ART、本番公開は継続HOLD。

## 2026-11-03 — B390 180秒CPU生命管理同HEAD実測PASS、B75 FIXED停滞診断準備

- 現行SOURCE QA HEAD `95322c79a1b2af18e08719cb09f8e151b2018028` の [B390 #41552053294](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41552053294) は真正Chromium 180.000秒TIME_UP+同武器新世界再戦に **SUCCESS**。native tick11856、human 95 shots/実SOURCE 391 changed cells、CPU 1045 source shots/17842 changed cells、物理再合流7/7、実CPU splat 0/respawn 0、人間からCPUへの実HP命中0、scoreable0/winner NONE。生命状態読み取りとHUDの統合は成功したが、撃破→150tick復活→再降下の実戦認証は0件でHOLD。B120 / B112-B115 / B162 / F4E103W は同HEADでSUCCESS。
- [B75 #41552053301](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41552053301)：同SHAのpreflight/B287/SWEEPはSUCCESS、FIXEDも後にSUCCESS、同HEADの4ジョブすべてSUCCESS（#41552053301）。元の原作CPU7/7再合流が実走行で成立。先行HEADのFIXED #41463623163 はSTAGING中5/7で壁時計270000ms超えFAIL。人間は本物のKeySで3.185m後退（x=-0.135,z=67.018）しており、『後退していないのが原因』とは断定できない。FIXEDの5/7根本原因は未解明。
- 次の**診断準備**：既存B75 read-only progress heartbeatに未再合流CPUのID/原作実foot/実lifeState/実mobility/最終移動Tickと、人間本物KCC footを追加。7/7とactual changed ink>0というゲート、270秒壁時計期限、native tick、元25 solids/17 paint/26 links/0 scoreableは変更しない。
- SourceTraffic単体テストは、本物の7/7走行fixture完了後に隔離されたCPUモックのlifeState遷移だけを検証する。死亡時に前世のrejoin/fallが消え、原作上段以外のACTIVEに虚偽rejoinを与えない。fixtureの観測tickは完走より後の単調増加時刻に合わせる。生ゲームへの死亡/HP書込みはゼロ。
- 上記は準備内容としてレビュー済み。B75 FIXEDもSUCCESSとなったので、候補の追加KeyS操作は採用しない。原因が未特定の過去の5/7 FAILは残しつつ、read-only停滞診断と独立した死亡状態回帰テストのみを一括統合。新SHAのCIは再検証までPASS扱いしない。main/T19C/T20/PR#5/Pagesは不変更、正式4v4/対岸0/12/ART/本番公開/score certificationはHOLD。

- QA採否監査：準備試行 `f2dcbe72a5728d2bcefd9c7f95b9457d900173da` のB207選択世界追加KeyS操作は**不採用・未統合**。B75 #41552053301 FIXED 7/7が原作入力のまま実成功したため、一度の5/7失敗を根拠に試験入力を改変しない。未証明の根本原因や不可視敵HP命中を認定しない。

## 2026-11-03 — F3/F5 SOURCE player-flow: 実A1共同プレイと敵位置秘匿（新HEAD CI待ち）

- 研究ブランチの既存A1 SourceCoop (B193/B162) を再実装せず、普通の12武器SOURCEフルラウンドB384 READY/PAUSEオーバーレイからユーザーが明示的にクリックできる導線を追加する。F8 QAパネルを開かなくても「PLAY WITH REAL ALLY A1」を選べる。実クリックだけで既存 `sourceCoopNavigationUrl` を使用し、再起動は新しい原作25/17/26/0のRapier/Recast/CPU world。元のB384 12武器・相手CPU Pursuit・研究フラグは既存関数により排他除去し、ライブActorの位置・HP・時計・物理は書き換えない。SOURCE専用/通常人間の選択に限定し、決定的QA入力は不変更。
- PLAYERレーダーは、元チームA1/A2/A3の実Rapier footだけを表示し、未発見の相手B1〜B4の正確な現在座標およびB側のnative path targetは表示しない。QA/旧SOURCE検証/F8では7体すべての既存元データを保持する。塗装ownerGridの真のA/Bサンプル・元support geometry・Radar history・Scoreable 0は変更しない。敵を発見したと推測する代替ロジックも作らない。
- 固定F1〜F5、自然対岸0/12、正式4v4/勝敗/ART/本番HOLD不変。既存のB75/B390で検証するまで、コントロールが実ブラウザで使えるとのPASS宣言はしない。main/T19C/T20/PR#5/Pages不変更。研究目的のSOURCE試合としては実180秒/再戦既存PASS、実敵HP命中/撃破0の状態は不変。

### 2026-11-03 同SHA CI初回型チェック失敗の修正

- 初回実装 `49d2004263577a2d6c4f63b8d0d485ffdebbf115` の [B390 #41556776582](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41556776582)、[F4E103W #41556776639](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41556776639) および [B120 #41556776580](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41556776580) が、`UndertowF3PlayablePreviewApp.ts(1262)` の TS2448/TS2454（`pauseOverlay`/`resumeButton` を宣言前に使った）でFAIL。これは実ゲームの描画・ゲーム挙動のFAILではなく、ビルド時の誤挿入。初回SHAの認証は失敗扱い。
- 新修正は新ボタンのコードを **既存B399 READY/PAUSE overlayで `pauseOverlay` / `resumeButton` を生成した直後**へ移動するのみ。A1協力の既存B193 URL生成、SOURCE 25/17/26/0、CPU7、元のB384セッション、QAゲートや真の物理は不変更。修正SHAのCIによる型チェック・READY可視性・180秒結果が出るまではPASSを主張しない。
