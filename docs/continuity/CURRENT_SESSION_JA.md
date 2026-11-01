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
