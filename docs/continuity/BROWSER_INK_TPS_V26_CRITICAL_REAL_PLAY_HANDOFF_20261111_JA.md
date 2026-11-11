# Browser Ink TPS / T21 — V26 全体再評価・実ゲーム優先・新チャット引継ぎ正本
**作成：2026-11-11 JST。** ユーザーが過去方針・実績・失敗を批判的に再審査して新しいチャットへ移るよう明示した、**一度限りの引継ぎ**。本書は上位仕様の改定ではなく既存F1〜F5/Fast Trackの実行改善。**文書を作っただけではゲーム進捗0。以降のV27等を惰性で量産しないこと。**

## 0. 正本・読み始め・ライブ状態（スナップショット）
- Repository: https://github.com/ryomashibaba/browser-ink-tps
- **唯一の書込先**：研究ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105`。本書を作成する前の確認HEAD：`a37ddb1c4540943a7c2e365e6bc0f4da025a4eba`。**保存後のHEADを固定値とせず、必ず再取得する。**
- 2026-11-11 JST実確認：main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。Draft PR #5 Open/Unmerged、head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。書込前後とも必ずライブ照合。
- 最新研究HEADのGitHub Actions：[#42941381277](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42941381277) **SUCCESS**。軽量18ファイル **174 PASS / 2 SKIP**、TypeScript/Vite build PASS、短時間真正Chromium SOURCE CPU7のnative実走成功。180秒/A1協力の無関係ジョブはSKIP。
- 読む順：`START_HERE.md`最上段 → **本V26全文** → 必要な点だけ[V25](BROWSER_INK_TPS_V25_POST_REAL_A1_REPLAY_CRITICAL_HANDOFF_20261110_JA.md) → [V24](BROWSER_INK_TPS_V24_POST_REAL_SOURCE_40T_CRITICAL_HANDOFF_20261110_JA.md) → `T21_FAST_TRACK_ROADMAP.md` / `docs/continuity/FAST_TRACK_EXECUTION_JA.md` / `docs/continuity/DECISIONS_JA.md` → 修正対象コードと生証拠。V25以前の「最新HEAD」「次にやる」は歴史的スナップショットであり現行指示ではない。
- 新チャットはHEAD/差分/CI/PRを確認後、**同じ分析文書を書き直さずに実ゲーム改善を開始**すること。他プロジェクト（MAB/Strata/HALO9など）に越境しない。

## 1. 不変の目標と境界（絶対継承）
『Splatoon 3』**Ver.7.2.0以降のマテガイ放水路（Undertow Spillway）通常ナワバリ**を可能な限り原作どおりに再現するブラウザ3D TPS。目標は**実人間1＋真のCPU7、自然な4v4、180秒、移動・射撃・塗装・イカ/サブ・HP/撃破・150 native tick復活・公式得点/勝敗・再戦・本人Windows通常試遊・ART/性能・明示公開承認**。Big Run、トリカラ、旧版地形は混ぜない。
- **F1**：人間＋7CPUのSOURCE登録地形上の実在・再合流と生存。
- **F2**：同じSOURCE Rapier KCC / Recast・Crowd上の連続で自然な移動。
- **F3**：自然な移動と戦闘、真正射撃・塗装・HP/撃破/復活・180秒・再戦を1試合で統合。
- **F4**：7.2.0通常Turfの原作Banc/BYML・Actor配置・Face/Phive collision flags・中央/対岸接続・Scoreable権限の確定。
- **F5**：本人の通常操作・見た目と物理の一致・操作性/FPS・ART・正式完成/公開審査。**定義・安全閾値・合格基準を緩和しない。**
- 凍結SOURCE：**25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。B487の人間＋CPU自然敵味方16組 **0/16**。昔の0/12指標とは別。公式Winner **NONE**。`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。正式4v4/F4全域/ART/公開/PR merge **HOLD**。
- **絶対禁止**：原作根拠のない床/橋/坂/透明足場/NavLink/得点面・原作OBJ全体の無条件collider化・勝手なActor生成/ワープ・カプセル縮小/都合のよい衝突/経路・偽HP/射撃/着弾/塗装/時計/Score/勝者・安全閾値緩和。レビュー用光学モデルとゲームの歩行可能衝突面は別。
- **保護**：main、T19C/T20、正式QA・固定ロードマップ、Draft PR #5、Pages/本番、PRIVATE/元原作ファイル・バイナリ・画像・派生抽出物、本人Windows/設定。GitHub研究ブランチへの保存だけ最新HEAD照合、単親、expected_sha付きCAS、`force:false`。無断merge/rebase/force-push/本番公開なし。Chat＋GitHub中心、追加課金原則0円、本人操作原則0回。Work/Computer Use/本人Windows/高負荷CI/PRIVATE/正式QA等は既存**個別承認**を必ず尊重する。

## 2. 本日時点で本当に達成されたことと、達成されていないこと
### 2A. できたこと（証拠範囲限定）
- 各旧SHAの真正ChromiumでSOURCE実プレイヤー操作・接地・坂登り、真CPU7、武器選択、実弾・17面への塗装、インク消費/OWNイカ回復、局所A1協力を確認。K1 [#42493927363](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42493927363)、K2 [#42523962398](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42523962398)、K3 [#42540893238](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42540893238)、180秒・同武器再戦の旧SHAを限定証拠として再利用。**全部が同じSHAで一度に通ったとの誤解は禁止。**
- A1実CLEAR→CDP R後の新SOURCE世界は旧SHA [#42826851912](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42826851912) **限定PASS**。同Runで本物の落下STOPは未発生で、STOP→Rは**HOLD**。CI全体failureを「再戦機能全面成功」や「再戦バグ確定」と捏造しない。自然STOP未発生の再実行はしない。
- 11原作Face（259408〜259418）の孤立Rapier 40tick、13原作位置アンカーの照合は局所的研究PASS。これはVer.7.2.0の本番衝突属性の証明**ではない**。
- V25後の研究実装ではF3G/F3L高精細光学表示の排他化、登録床可視優先、カメラ近距離衝突、接地中のイカ表示高さ、空中の床インク接触除外、F3L不在時の偽橋回避、F3K展示室の通常試合での読み込み抑制を実装し、各コード型/単体テストはPASS。**本人普通プレイで床表示と当たり判定が全域一致した証拠でも、FPS測定でもない。**
- 2026-11-11 [#42934591327](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42934591327) の短時間真正Chromium：722 native tick、真CPU7、原作目標171要求、6候補中5体の目標3D近接（XZだけで近く3Dで遠い観測0）。3D近接は**連続カプセル経路/敵味方横断認証でない**。当該SHA `67d897e...` の証拠で、後続コードの自動PASSではない。
- 最新研究SHA `a37ddb1...` の [#42941381277](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42941381277) **SUCCESS**：720 native tickの本物のSOURCE CPU7、原作目標への実リクエスト167、5体3D近接、XZのみの偽近接0。**B443の読み取り専用実カウンタ**：goal retentions +156、first actual same-side frontage arrivals +7、dwell後の目標回転 +5、unsafe/stalled解放 +1。これは実際のCPU目標管理が動いた証拠だが、自然な敵陣横断・実敵HP戦闘・正式4v4の証拠で**ない**。生ログは同Runの `B440_TRUE_SOURCE_NATIVE_HUMAN_WALK`、`b443RealNativeExistingGoalDwell`。
- 原作研究ではCI688のFace-chain seam 4箇所×両側＝8箇所（0.170/2.074/0.519/0.519m対称）に、40静的候補＋Batch2 14候補を照合。両端30cm以内の**単一独立候補0**。複数部品やSetActor経路の不存在を意味しない。**この8 face seamと歴史的Recast側の8 gapsを同一のものと決めつけない**。

### 2B. 未達成／HOLD（優先順位を誤魔化さない）
- **本人Windows普通の試遊**で以前報告された床抜け・中央以降の見た目とRapier床のずれ・CPUが少数しか見えない/SAFE STOPの根本解消は、現HEADで本人確認なし。CI緑や一部光学透明化で「修復完了」としない。
- 中央/対岸の**Ver.7.2.0 通常Turf Face/collision flags/SetActor配置**が未取得／未認証。SHA付き静的OBJ、材質Floor名、原作光学11面・40tick研究では歩行許可の根拠にならない。**自然敵味方0/16、Scoreable0/Winner NONE、正式4v4・敵自然HP/撃破/150tick復活連鎖・全域ART・公開HOLD**。
- F3L通常SOURCE表示、イカ28.16cm補正、GPU showroom削減はコード・単体証拠中心であり、通常人間試遊の改善・fps効果は未計測。B443最新真正Countersは全ルート連続支持ではない。
- STOP→R、現HEADでのフル180秒×全モード/全武器、同一試合の人間と自然CPU敵の撃破/復活/公式勝敗は未認証。

## 3. 批判的評価（原因→反証→是正）
**強みを維持**：物理と視覚/研究と正式スコアを分離。偽床・偽CPU・偽得点を拒否。GitHub CAS＋原作SHA/真正Chromium生証拠、不可逆な本番操作の保護、本人の操作負担軽減。

**失敗A：代理指標への最適化。** 選択テスト数や細かな修正が増えても自然敵味方0/16、正式0 Scoreable、本人の床抜け未解消。「テスト増・コミット増・CI SUCCESS＝ゲームが遊べる」は誤り。**是正：次の達成判定はプレイ動画/スクショ/実動作と既存物理ログの同一SHA比較に置く。**

**失敗B：優先順位がステージ完成から逸れた。** 近距離カメラ、イカ28cm、F3K最適化、CPU再到達の修正は合理性があるが、ステージの中央・敵陣へ自然に行けない制限を解決していない。**是正：床見た目・実コライダー・可動域の現場一致を第一線に戻す。**

**失敗C：証拠不足と安易な改造の二択に陥りやすい。** 「正式F4全域の証明を先に求める」→原作flags未入手で停止。「見た目の床に全collider付ける」→原作外の架空歩行になり安全・忠実性に違反。**改訂：F4未承認の部分のみHOLDし、25登録床上のF1〜F3/F5を真正ゲームとして進める二層の実行。**

**失敗D：偽の完成条件。** CPUが1.5m以内・120tick滞在・目的地回転は同側巡回の証拠で、敵との自然戦闘や全域横断ではない。モデルが薄く透けて見えるのも物理床補完ではない。**改訂：進捗は移動区間の人間連続支持、CPU真の移動、同一試合の戦闘・試合ループで評価。**

**失敗E：小修正を1ターンごとにCIし、空の検証回数を増やした。** 途中のTypeScript/DOMモック失敗を数回の修正コミットに分け、失敗の原因を限定的にしか先取りできなかった。CI時間・リソースを消費。**改訂：関連不具合は1バッチに統合し、可能な範囲で静的レビュー/型・テスト実行対象とWorkflow構文をpush前に点検。小CIは機能単位で原則1回。失敗時は生ログ根因で最小修正、無意味な再試走なし。**

**失敗F：自動Chromeと本人通常試遊を混同した。** STAGING/実入力可能なChromiumでも、普通のWindows・F3L有無・FPS・操作感は同条件ではない。**改訂：既存SHAのChrome PASSはその範囲に限定し、まとまったゲーム改善が形になってから本人へ一度だけ短い通常試遊を依頼。先にZIP・過去画像の再提出を頼まない。**

**再反証後**：「ステージ100%完成まで他を停止」は実行不可能、「ソース不明だから勝手に床を作る」は禁止、「CPUだけ進めればいつか4v4」は経路0/16のまま不成立、「docsを毎回刷新」はゲーム進歩0。よって**原作根拠に厳格なF4 HOLDと、既存25床での人間体験改善を同時に守ること**が唯一の一貫した実行方針。

## 4. 今後の実行優先順位（F1〜F5変更ではなく現実的な順序）
**優先P0：実SOURCEステージの見える床と物理支持の一致（F2/F5）**。
1. 最新HEADのコードに、F3G/F3L光学→source pose→元Rapier 25、物理接地KCC、普通PLAYER/F8表示モードを照合。V23本人画像とV24「13アンカー」等既存の証拠を使い、**自陣→下段→既登録坂**の一つの実在区間だけで具体的な不一致を再現する。不存在の原作床を表向きの表示で歩行可能と偽らない。F3Lがなければ25床の実用表示を使う。
2. 再現した**一つの原因をゲーム本体コードでバッチ修復**し、同一SHA/同一SOURCEの接地固体ID・視認/カメラ・本当のPLAYER移動を前後比較。単なる透明化/警告表示を「床修復」としない。元Face版/flags未認証の中央部分は「不明」と表示・記録し、それを完成扱いしない。
3. ユーザーにリクエストするのは、必要な権限が揃い修正が実画面に意味を持った後の**短い本人通常プレイ1回**のみ。Work/本人Windowsを無断で制御しない。

**優先P1：認証済み地形内の自然なゲームプレイ（F1/F2/F3）**。
1. 実CPU7体と人間の移動・視認・本物の射撃/塗装・OWN回復/サブを**同じ場面**で改善。CPUの目標距離・高さ対応（最新A37 B443）は限定PASSなので無意味に再試走しない。
2. 自然に遭遇できる敵がいる証拠が出た場合のみProjectile→敵HP→撃破→150tick復活の連続真正試験へ。遭遇できなければ偽敵配置やワープなしでHOLDし、独立の移動/射撃/カメラ/場面遷移を磨く。
3. 真正180秒/TIME_UP/再戦の既存合格を再利用。新しいゲームループ仕様の変更が無ければ長時間RUNを繰り返さない。STOP→Rも真の安全なSTOP経路証拠が出るまでHOLD。

**並列ではなく「新証拠が得られた時だけ」のF4解除ゲート**。
- 足りないのは通常Turf **7.2.0版**の元Banc/BYML・Phive衝突構造/材質collision flags/Actor配置・中央各Faceと元の接続意図。公開物の名前・アップロード日・抽出OBJだけでは不可。既存のF4原本ゲートと54候補0件の照合を**毎ターン反復しない**。原本保護と権限を守り、取得可能な新証拠が本当に現れた時だけ限定復帰。
- その時は (i) 同バージョン/モードの真正性 → (ii) 各Face歩行/CPU衝突フラグ → (iii) Actor配置/座標 → (iv) カプセル半径・実KCCとRecastの連続経路 → (v) 二重衝突/射撃/見た目 → (vi) 個別の研究→正式昇格承認。**条件が欠ければそのFaceだけHOLD**。

**F5最終**：本人普通のWindows試遊、ART・パフォーマンス・正式ゲーム/4v4/自然敵命中/得点勝敗・公開の一体審査。上記ゲートの偽合格によって完成宣言しない。

## 5. 次チャットの厳密な実行契約と本人負担
- **次チャット最初は新計画やV27作成ではなく、実コード修正を始めること**。一度だけ研究ブランチHEAD/差分/最新CI/PR・原作保護のライブ照合を実施。前の証拠が同SHAなら重複再試行しない。
- **最初の具体的バッチ**：既存F3L/F3G通常PLAYERで視覚床とRapier 25の対応を再確認し、**自陣→下段→登録坂の実PLAYER可視・支持不一致**に関するコード上の原因を1件選ぶ。発見できたら関連修正をまとめて実装。根拠がなければ無理に床/光学座標を動かさず、同じ登録地形で人間/CPU自然動作に影響する実バグを直す。どちらも「変更コード＋評価した実遊び＋現SHA PASS範囲」が成果物で、診断JSONだけで完了としない。
- テストは既存小CIの必要範囲、真Chromiumはゲーム価値変化があれば**必要に応じ一系統を一度**。高負荷・個別承認が必要な実行は勝手に始めない。継続するだけで負荷を高めない。再試行前に生ログの原因を読む。
- コミットは研究branchのみ、`expected_sha` CAS非forceで保存。終わりにHEAD/変更ファイル/CI/PRと保護対象を照合。同期せず未保存のコードを「実装済み」と言わない。
- 報告は6要素だけ：**何を遊べるようにしたか／根拠SHAと真正実測／軽量CI範囲／未認証・HOLD／次の1機能／本人操作要否**。小テストの数や型エラー修復だけで進捗を盛らない。
- 本人操作**原則0**。GitHub・既存のRAW/画像/コードから自分で確認し、どうしても必要な操作はまとめて**一度で済む短い通常試遊**を提案。追加課金原則0円、Work・OS・高負荷・PRIVATEには個別明示承認。外出中でもChat＋GitHubでできる有用な範囲を先に行う。

## 6. 次のチャットに貼る最短プロンプト
> Browser Ink TPS / T21 / Undertow Spillwayの既存開発継続です。新企画や上位F1〜F5・Fast Trackの変更ではありません。GitHub `ryomashibaba/browser-ink-tps` の唯一の研究ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105` の `START_HERE.md` **最上段V26引継ぎ** `docs/continuity/BROWSER_INK_TPS_V26_CRITICAL_REAL_PLAY_HANDOFF_20261111_JA.md` を全文読み、V25以前・DECISIONS・固定ロードマップを継承。最新HEAD/CI/PR/mainをライブ確認（V26作成前HEAD `a37ddb1c4540943a7c2e365e6bc0f4da025a4eba`）。#42941381277は短時間CPU7/720tick/B443 goal留置+156・到着+7・回転+5の限定PASS、自然敵味方0/16・原作25/17/26/0・正式Scoreable0・Winner NONE・中央Ver.7.2.0 collision/Actor権限HOLD。**今回は新たな計画書を作らず、V26第5節の登録床で実際に遊べるゲーム本体改善をすぐ進めてください。** 現時点の普通Windows床抜け・描画/物理ずれは未認証のまま。原作根拠のない床/橋/全メッシュ衝突化/NavLink/ワープ/敵HP・得点捏造/安全緩和禁止。正式4v4/ART/公開HOLD。main/PR#5/Pages/正式QA/固定ロードマップ/原本/PRIVATE/本人Windows保護、研究branchのみ単親expected_sha CAS非force。既存K1〜K3/11面/A1 R/CI再試験・新HUD/小QA/文書増殖禁止。本人操作最小、追加課金原則0円、Work/Windows/高負荷は個別承認。ゲームコード・限定真正証拠・結果を最優先。
