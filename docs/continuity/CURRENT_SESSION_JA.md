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
