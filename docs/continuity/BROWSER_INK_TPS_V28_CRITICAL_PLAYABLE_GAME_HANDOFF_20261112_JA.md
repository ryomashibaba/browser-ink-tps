# Browser Ink TPS / T21 — V28 全体批判と実ゲーム完成優先・新チャット統合正本

## 【2026-11-14 20時台／本人明示：V28全体再批判・新チャット唯一の再開基準】

**位置づけ：** 今回の本人依頼に対して、既存V28の最上段とSTART_HEREの入口だけを更新する一度限りの引き継ぎ。新V29・新B番号・新QA・別企画ではなく、実ゲーム進捗は0。下記すべてのV28章、V27以前、固定F1〜F5、T21_FAST_TRACK_ROADMAP.md、FAST_TRACK_EXECUTION_JA.md、DECISIONS_JA.md、CURRENT_CANONICAL.mdの方針および本人の採否を継承する。古い節の「最新」と「次工程」は歴史的記録であり、GitHubのライブHEAD/RAWを優先。

### A. 2026-11-14 最終事実・SHAと判定

- 公開GitHub：ryomashibaba/browser-ink-tps。唯一の研究書込先：research/t21-integrated-a1-c-patrol-four-mode-20261105。**今回の文書保存直前HEAD = `662a98db308784edab045a5ef5f88542d1ecbb03`。このdocs-only commit後にはHEADが変わるため、必ずライブ再確認する。** main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、Draft PR #5 Open/Draft、PR head `8cfc95756ef0b56e2c33dc9f89a9041126daa272` は保護対象。
- 直近真正180秒は [Actions #43576839316](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43576839316)（試験/ゲームSHA `059aad733532e96fdbf56b26d31aa321d0f1e281`、attempt 1）。**2026-11-14 18:20 JST頃に completed/failure**。FAILはB1の80〜180秒の射撃・塗装回復を認証できなかったため。実RAWの `T21_P2_GENUINE_NATIVE_JSON_BEGIN/END` が唯一の同SHA証拠。B441/B448前線研究モードは有効、CPU7/7、180秒=10800 countdown native ticks、TIME_UP、Twin Comets保持の新Rapier/Recast世界再戦と再戦後の実射撃3発は限定PASS。自然4v4や公式Winner成功とはみなさない。
- 同RUN B1の80秒→180秒：実足元 `(-5.897308208,4.619208171,-48.422490004)` は不変、実射撃要求 `43→43`、実塗装変化セル `1878→1878`、有効照準なし `2590→8587`。P2研究追加探索は**CPU全体**で `195→662` 回、候補採用 `0→3` 回。B1だけの探索成功とは断言しない。
- 同RUN B2：射撃要求 `94→212`、塗装変化 `2462→2462`、80→180秒の実足元の直線変位0m。B3：`94→212`、`211→211`、変位0m。B4：`108→108`、`870→870`、変位0m。**Bチーム4体が80/90/120/150/180秒の各観測点で停止。** 標本点間の一時運動は除外できないが、問題はB1だけでない。B3の後半には前線承認目標が存在したが実足元が動かず、前線目標の存在＝KCC移動成功ではない。
- 既存の真正B1開始足・原作Rapier/Recast経路検査：Recast投影開始Y `4.621169`、Rapier支持床Y `4.370488` で支持差 `0.250681m`、既存上限 `0.250000m` を約0.68mm超過。7経路は投影開始点だと0/7、RAW実足元を初点に使うオフライン検査では5/7支持合格、2/7は引き続き不合格。局所修正コミット `9185b15ab64ba1d072d1e8d81d0ca54a9d306255` は軽量PASSだが、**同修正後の真正 #43576839316 でもB1回復FAIL**。経路投影差のみが根因とは判定不可。安全0.25m許容や0.30mサンプル間隔を無断変更しない。
- 真正FAIL後の2コミットは `7948966d6ee6b33b7711c9c9b682991f32c2c051`（CPU別Recast提案数／Rapier承認・拒否理由・Crowd再同期の読み取り専用計測）と `662a98db308784edab045a5ef5f88542d1ecbb03`（コンストラクターを通らない従来テストへの初期化互換対応）。[軽量CI #43583009273](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43583009273) SUCCESS：241 PASS/2 SKIP＋109 PASS、TypeScript/Vite PASS、真正ブラウザSKIPPED。**この新計測を本物の180秒Chromiumで実行した証拠はまだ0。CODE_PASS_ONLY。**
- 原作認証境界は `25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable`、Winner NONE、自然敵味方の検査経路0/16、原作接続の検査対象8対0/8。元のB499候補10部品42面は現ゲーム本体への昇格0/10。これらは限定検査の値であり、全マップの完成割合は**UNKNOWN**。正規Ver.7.2.0 Turf Actor transform、Phive collision/material、col_disable_flags、正式得点の認証が未解決。正式4v4、自然敵HP命中・HP0・150tick復活、公式得点/勝敗、本人Windows全面試遊/ART、main/PRマージ/Pages公開はいずれもHOLD。

### B. 自己批判と改訂した実行規律

1. **最も大きな失敗：** 何度もB1の照準/巡回目標/開始点を局所修正し、軽量CI成功を大量に得たが、80〜180秒のB1実移動・射撃・塗装は改善0。真正180秒まで繰り返して根因の切分けが後手に回った。今後B1小ガード、小テスト、診断番号、HUD、長い文書を1工程ごとの完成と呼ばない。二工程連続で本物の遊びの改善0なら必ず方向転換する。**この停止条件はすでに発動済み**。
2. **単独B1からBチーム共通のF2障害へ主軸を修正：** 本物のCPU Crowdが移動提案しないのか、提案するがRapier KCCが拒否するのか、拒否の原因（原作支持Y/ルート端/他キャラ接触/過速度/Offmesh延期/再同期）を同じ実SHAの既存の読み取り専用計測で分離する。B2/B3に移動目標がある事実だけでKCC故障と断言しない。**まず最新計測コードのソース・シリアライズ・サンプル要件を監査し、必要な一つの有界な真正観測のみ個別承認後に実施する。** 原因が判明するまでゲーム物理の閾値や登録床を緩めない。次も無条件180秒試験にしない。
3. **F4の原作地形認証は最大の全体HOLDとして並行維持：** B490本人の視覚/物理差、B499候補Face、既存の8接続と足元を同じ位置で照合。正規Ver.7.2.0 Actor/Phive衝突権限が確認できる個別FaceだけPRIVATE隔離→実Rapier KCC→元CPU半径のRecast→普通のゲーム世界へ昇格。不明なら当該Faceのみ `HOLD_REFERENCE_REQUIRED`。架空の床/坂/橋/NavLink/ワープ/敵/HP命中/Scoreable・公式得点を捏造しない。F4材料不足で登録済みF1/F2/F3開発を止めない。
4. **次の一工程は本体阻害を一括で解決する縦スライス：** 実CPU7と人間の共通60Hz物理・自然な同側の移動→実射撃/実着弾塗装→インク消費/OWN回復→180秒・同武器再戦を同じSHAで評価。必要な関連ファイルをまとめて修復→既存軽量Vitest/型/Viteを原則1回→個別承認後に真正1系統を必要時のみ実施。診断のみはゲーム進捗0、TRUE PASSは本人が普通に遊べる動きの新しい実測を要する。F3の自然敵遭遇/HP・復活、F4原作接続・公式スコア、F5実Windows試遊は段階的なHOLDを維持。
5. **無駄な実行・競合を止める：** 重いChromium実行・本人Windows・Work/Computer Use・PRIVATE転送・正式QA/公開はそれぞれ対象ごとに明示承認。過去の「効率的な試験を承認」は自動無限再試行や保護変更の許可ではない。公開GitHub標準ubuntu-latestを使い追加課金原則0、本人操作原則0。1人の統合担当が同一研究branchだけをライブHEAD再取得→単親commit→`expected_sha` CAS→`force:false`で書込、他チャットの変更があれば必ず再照合し旧HEAD上書き禁止。高負荷実行中に競合pushしない。新V29/新B番号/新workflow/小QA/HUD/別文書を増やさない。
6. **報告を成果に合わせて短縮：** `FACT`、`CODE_PASS_ONLY`、`TRUE_RUN_LIMITED_PASS`、`FAIL`、`HOLD_REFERENCE_REQUIRED`、`UNKNOWN`を厳格に分離。毎回、新しく遊べるようになったこと（なければ0）／ゲームSHAと真正Run・軽量CI／最大HOLD／次の一手／本人操作の有無だけ報告。連続「次工程へ」で毎回同じ長文説明や待機ポーリングを繰り返さない。時間とモデル利用予算は実ゲーム成果へ振り向ける。

### C. 新チャットの最初の具体作業（再計画禁止）

**ここから計画の再作成はしない。** START_HERE最上段→本V28最上段→V28全文/既存F1〜F5/Fast Track/DECISIONS必要範囲→研究HEAD/最近のCI/正本とRawを照合。最初の重要な一作業は**現 `662a98db...` のCPU Recast提案・Rapier KCC結果計測が真SOURCE回路で必ず読めることのコード検証**、直近FAIL #43576839316 と現在HEADの差分の照合。その上で真の提案・拒否原因を特定し、F2 Bチーム共通停止へ一括修正する。既存RAWに存在しない新計測の数値はUNKNOWNとする。高負荷試験は承認を得て1系統のみ。F4根拠不足のFaceは局所HOLD、偽の通路を作らない。main/T19C/T20/Draft PR5/Pages/正式QA/原本/PRIVATE/本人Windowsは一切変更しない。

**この移行記録自体の実ゲーム進捗：0。最新コード（文書保存前）＝`662a98db308784edab045a5ef5f88542d1ecbb03`、最新真正B1回復＝FAIL、最新軽量CI＝CODE_PASS_ONLY。新チャットでは必ず文書保存後の研究HEADをライブ取得する。**

---


## 【2026-11-14 本人明示：批判的全体再評価と新チャット唯一の引き継ぎ／既存V28継続】

**位置づけ：** 本人の今回の明示依頼に限り既存V28の最上段を一度更新する。新V29、新企画、新B番号、新機能ではない。既存V28全文、V27以前、固定F1～F5、T21_FAST_TRACK_ROADMAP.md、docs/continuity/FAST_TRACK_EXECUTION_JA.md、永続docs/continuity/DECISIONS_JA.md、CURRENT_CANONICAL.md、本人の全採否・過去の失敗教訓を保持する。**本追補はDOCS ONLY／ゲーム進捗0。** 古い節の「最新」は記録当時の事実であり、今後はGitHubのライブHEADと証拠を優先する。

### 1. 今回の真正試験を最初に判定する（再実行禁止）

- 正本GitHub公開リポジトリ：ryomashibaba/browser-ink-tps。唯一の書込先：research/t21-integrated-a1-c-patrol-four-mode-20261105。承認済み**ゲームコード基準SHA** 38782e98cc91c4a755287645cce7868b4f7ba5b9（B1診断を読み取り専用補強）。同SHAの軽量CI [#43553582657](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43553582657) SUCCESS＝344 PASS／2 SKIP、TS/Vite PASS、重いChrome SKIPPED、CODE_PASS_ONLY。
- **本人が今回1回だけ承認し、既に使用した真正試験**は [Actions #43555311901](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43555311901) 。起動研究コミットSHAは 3715d7402c07517d2d62119d9d57489332bdc12b、親はゲームコードSHA 38782e98。変更は既存scripts/t21-b385-native-selectable-circuit.mjsのコメント1行のみでゲーム挙動不変更。既存B385/B390の[p1-180s-once] [p2-canonical-combat-once]、公開リポジトリの標準ubuntu-latest、Chrome1系統、run_attempt1。新規Artifactアップロードなし、RAW JSONと画像SHA-256のみログへ。**この試験承認は消費済み。失敗時再実行・別Chromeの自動起動は禁止。**
- 本引き継ぎの記録時はRUNNING、前段9ステップSUCCESSで真正Chrome工程中。完了結果を憶測で「SUCCESS」にしない。**新チャット開始後の最初の唯一の作業は #43555311901 のRun/jobs/RAWジョブログをライブ取得し、どこまで実証できたか判定すること**。T21_P2_GENUINE_NATIVE_JSON_BEGIN/END の範囲からactor別cpuPaintDecisionByActor・cpuActualByActor・cpuShots・cpuActualChangedCellsを80/90/120/150/180秒で照合、TIME_UP・同武器再戦の同一SHA証拠を確認。FAILならBOOT/READY、CPU7合流、試合、TIME_UP、再戦の**最初の停止地点**を切り分け、スクリプト期待値の問題をゲーム物理のFAILと誤分類しない。再試験には必ず新たな本人個別承認が必要。
- 保護対象を2026-11-14ライブ照合：main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9、PR #5はOpen/Draftでhead=8cfc95756ef0b56e2c33dc9f89a9041126daa272。main/T19C/T20/PR5/Pages/正式QA/原本/PRIVATE/本人Windowsを無承認変更しない。研究branch書込は毎回ライブHEAD確認→単親コミット、expected_sha付きCAS、force:false。今回docs-only保存後のHEADは別になるためゲームSHA／試験SHA／文書SHAを混同しない。

### 2. 確定実測と未確定事項を明確に分ける

- 前回真正P2 [Actions #43544865098](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43544865098)、SHA 98d69de48aa6081c48bed882a46017e020b5053e は**TRUE_RUN_LIMITED_PASS**。同一の本物のSOURCE試合でCPU7実合流、実CPU射撃要求累計974、塗装変更セル80秒18,066→90秒18,725→120秒20,764→150秒21,791→180秒22,097（80秒以降＋4,031）、native 180秒TIME_UP、Twin Comets保持の新Rapier/Recast世界で再戦開始を確認した。変化セル数は**累計塗り替え回数**であり、重複しない占有面積や公式得点ではない。旧SHAの80秒以降0セルという停滞との差があっても、違うSHA・試験条件での単独因果は証明できない。
- このRUNのB1は80～180秒に実着弾0、塗装変化0。累計着弾17／塗装変化588で停止、終了時生存／再合流済み。B4は同区間実着弾115のうち71が既に自チーム色の範囲。B1の直接原因は**UNKNOWN**（塗装候補不足、射線遮蔽、実インク不足、武器クールダウン、弾未着弾等を未分離）。推測で武器射程/連射頻度/インク容量を変えない。
- B4の既塗装照準再利用はソース修正fd3f7476、軽量CI [#43548948747](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43548948747) SUCCESS＝343 PASS／2 SKIP（CODE_PASS_ONLY）。B1原因の計測不足は研究SHA 7a2a807a と 38782e98 で補い、実武器ready時の候補有無、原作照準・backfillの射線拒否、実インク不足による弾の拒否、CPU別着弾・塗装変化と現武器状態を分離。**新しいSOURCEゲームでの実B1改善はまだ証明していない**。今回実行の結果が確定してからだけ実装修正を判断する。
- 原作登録は**Rapier 25 solids／17 PaintSurfaces／26 source NavLinks／0 Scoreable**、Winner NONE、activationReady=false、unrestricted4v4Certified=false。B499原作候補10部品42三角面の本体昇格0/10、試験対象の原作8隣接は現Recast0/8、敵味方自然経路の試験16件は0/16。これは**その検査集合のみの結果**で、全マップの正確な完成割合・あらゆる経路の不在はUNKNOWN。自然4v4／敵HP0と150native tick復活／公式勝者・正式得点／本人Windows全域試遊／ART／本番・公開はHOLD。
- 以前の本人Windows通常試遊FAIL：視覚床と物理床の不一致、床抜け、CPU少数、SAFE STOP。最新HEADで解消した証拠はない。既存比較Documents/BrowserInkTPS_F3L_15864_5030と既存clone Downloads/browser-ink-tps-currentを再利用し、本人に同じ43MB原本・ZIP・スクショ・環境作業を再提出させない。足元の支持喪失は正常な段差・マップ縁落下と床内欠落を独立判定する。

### 3. 批判的に修正した、今後の唯一の実行法

1. **最大の失敗パターンをやめる：** CPUの小さい照準・ログ・閾値・小QA・HUD・B番号・文書を一回ごとの「進歩」と称するのは非効率。今後は**実際にプレイできる機能のまとまった一バッチ**を開発単位にする。診断・docs-only・CIだけならゲーム進捗0。2工程連続で実遊びの新成果0なら微修正を停止し、根本ブロッカーへ注力。新V29／新B番号／新workflow／QA/HUD増殖は禁止。
2. **レーンF4：原作ステージの最大阻害を並行して解く。** 原作Ver.7.2.0ナワバリ用のBanc/BYML Actor transformとPhive material／col_disable_flagsの証拠が揃った**一つの具体的なFace/Actorだけ**を、旧B490の本人通常WASD最初の停止点、B499原作42面、原作8隣接、B2/B4のRecast高さ拒否と同一座標で照合する。PRIVATE隔離→実人間Rapier KCC→元CPU半径0.30m Recast→本当のSOURCE世界の順で認証。正規衝突属性不明なら当該FaceだけHOLD_REFERENCE_REQUIRED。見た目OBJの全床化、架空橋/床/坂/NavLink/Actorワープ/閾値緩和、未認証Scoreable追加は禁止。Private原本・抽出Face・画像/動画を公開GitHub/CIへ無承認転送しない。根拠がないからとF1/F2/F3全作業を止めない。
3. **レーンF1/F2/F3：実際の通常SOURCE試合。** 今回RUNのactor別B1で、weaponReadyPaintChecks、approvedPaintAimChecks、noApprovedPaintAimChecks、originalStageSightVetoes、backfillStageSightVetoes、insufficientInkMainShotAttempts、インク残量、実ショット／実着弾を照合。候補不足・インク不足・stage射線拒否・実弾未着弾を**証拠で分類**する。フィールド欠測は「計測不足／UNKNOWN」であり、CPU故障と断定しない。そのうえで**再現した本体欠陥だけ関連ソースをまとめて修正**→既存軽量TypeScript/Vitest/Viteを原則1回。新しい本物の180秒試験は別の明示承認が必要。原作に存在しない対岸の敵を無理に遭遇させない。
4. **F1～F5昇格順は不変：** 本物の7CPU＋人間入力＋KCC＋実弾/インク補給＋180秒＋同武器再戦、原作中央・対岸の連続床と自然経路、自然な敵への実射撃/HP0/150tick復活、正規Scoreable確定後だけ公式得点/勝敗、本人Windows一括FPS/ART/普通の移動試遊、最後に明示承認による正式QA・マージ・公開。SOURCE_ONLYの塗装変化は正式スコアではない。
5. **ユーザー負担を最小化：** このチャットを唯一の全体統合・書込み担当とし、必要時だけ読み取り専用の独立F4/CPUレビューを少数並行。複数チャットの競合pushを禁止。最初に既存GitHub/真正RAW/旧比較資料を使い、ユーザーPCでの再提出・再clone・反復操作は要求しない。本人操作原則0、追加課金原則0円、API課金回避。Windows・Work/Computer Use・PRIVATEデータ転送・重いChromium/Actions・正式公開は**用途別の個別事前承認**。今回のChrome許可を将来へ流用しない。
6. **報告形式を短縮：** 毎回「ゲームで新しくできるようになったこと（なければ0）／実装・実RUN SHA＋同SHA証拠／最重要HOLD／最短次の実装一件／本人作業の有無」。CODE_PASS_ONLYとTRUE_RUN_LIMITED_PASSを混同しない。準備・文章・軽量CIに費やした時間を遊べる機能の完成と誤報しない。

### 4. 新チャットで計画を作り直さず進む手順

1. START_HERE.mdの最上段→本V28最上段→必要なV27／F1～F5／Fast Track／DECISIONSを継承し、研究branch・main・Draft PR #5のライブHEADを確認。
2. **最初に [#43555311901](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43555311901) の最終状態と同SHA RAWログを確認**。正式4v4/スコアではなく、CPU7、80～180秒の実塗装、B1原因、TIME_UP・同武器再戦の成否と原因を正しく分類。承認済み1回を再実行しない。
3. 同RUNで再現した本体不具合があれば関連ファイル単位で一括修正→軽量CI原則1回。原作権限不足F4は局所HOLDのまま根拠が入るまで無理に変更しない。次の高負荷/Windows/PRIVATE/公開は別途本人個別承認。
4. 以前の文書が長くても再計画をしない。新マスター文書をもう増やさない。この追補の存在をゲーム進捗に算入しない。

**厳密な現状判定：** 前回P2の180秒・塗装増分・同武器再戦はTRUE_RUN_LIMITED_PASS／現コードSHAはCODE_PASS_ONLY（344 PASS／2 SKIP）。今回承認の真Chromeは本記録時RUNNINGで、最終結果未判定。自然4v4、中央連続床、原作公式得点、本人Windows全域試遊、ART、公開はHOLD。完成割合はUNKNOWN。

---

## 【2026-11-14 V28継続・真正180秒進行中の全体再批判／次チャット最新正本】

**位置づけと変更範囲**：2026-11-14の本人明示依頼による**既存V28正本の一度限りの更新**。新V29・新企画・新規B番号・追加ゲーム機能ではない。これまでの全V28、V27以前、固定F1〜F5、Fast Track、DECISIONS、本人の採否・反省・保護方針を不変として継承する。**この更新はDOCS ONLY／ゲーム進捗0件**。以下の「最新」は保存時点の記録であり、新チャットはライブ状態を常に優先する。

### 1. 最初にライブ確認するもの（真正試験の最優先ゲート）

- 公開GitHub `ryomashibaba/browser-ink-tps`。唯一の書込先 `research/t21-integrated-a1-c-patrol-four-mode-20261105`、**文書保存前の研究HEAD**=`d261f1fbb054b3462d1e030df26756b91f836cd5`。ゲーム本体最終コードHEAD=`79e0b6441c4e0053b476b49c89fd2c88d9273405`。研究HEADはこのdocs-onlyコミット後に変わる。main=`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、Draft PR #5 Open/Draft head=`8cfc95756ef0b56e2c33dc9f89a9041126daa272`（いずれも保護）。START_HERE/V28への今回の書込と元の実ゲームコードの変更を混同しない。
- **承認済み真正180秒試験** [Actions #43528988040](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43528988040)、job `132241694209`、HEAD=`d261f1fbb054b3462d1e030df26756b91f836cd5`、既存 `t21-b385-selectable-source-round.yml`。承認は**この1回のみ、すでに消費済み**。コミット `d261f1fb` の変更はワークフローのコメントのみ。既存 `[p1-180s-once] [p1-own-once]` により真SOURCE世界で人間WASD・選択Twin Comets/物理弾・7CPU実Rejoin・本物のSOURCE射撃/インク→OWN SQUID回復→再射撃・真180秒TIME_UP→同武器新世界再戦の一体検証を目指す。**本記録の確認時点は `in_progress`（run_attempt 1）**、事前9ステップSUCCESS、`Drive actual source Chrome` ステップ実行中、最終結論と新たなゲームPASSは未確認。実行中はジョブログ取得404だった。次チャットの**最初の唯一の行動**はこのrun/jobs/artifactsを再取得し、完了していればジョブログ／RAWを同じSHAで照合して結果を分類すること。時間経過だけで成功・失敗・タイムアウトの原因を推測しない。完了を待つための新CI・再試行・別Chromium起動は禁止（再実験には新しい個別本人承認が必要）。
- 旧真正 [#43520746850](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43520746850) は7/7物理合流 native tick1068、合流後362 native tick（〜1430）を**真正観測**したが、支持足上での「移動拒否→有償攻撃」成立機会0、要求0で `HOLD_NO_SUPPORTED_BLOCKED_FOOT_EVENT_IN_360_WINDOW`。攻撃機能自体が壊れた証拠ではない。未成立イベントを合格したことにしない・同じ条件を無意味に再実行しない。
- 本体修正 `3e0d247e` と型だけの修正 `79e0b644`：物理再合流済みのCPUが登録済みの床から無支持の次足位置へ、Recast地上ステップとして進まないRapier支持判定を追加。初期first-drop・まだ無支持の足からの復帰は保護。新たな原作床/リンクなし。軽量CI [#43524004297](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43524004297) SUCCESS：20 files 211 PASS/2 SKIP、8 files 104 PASS、TypeScript+Vite PASS、真正Chromium SKIPPED、Artifact0。これは**CODE_PASS_ONLY**で、最新本体のWindows床抜け・SAFE STOP・CPU自然行動を解決したと認定しない。
- それ以前のB448真正 [#43335171546](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43335171546) は原作登録床上の研究opt-in A3前進15.818m／有償射撃14／塗装1,881セルの限定成功。B441、B448、B390などの異なるSHA／ゲームモードを合算して「同一世界の全機能PASS」にしない。

### 2. 永久固定の最上位目標と厳格な未完成認定

- 対象は『スプラトゥーン3』Ver.7.2.0**マテガイ放水路・通常ナワバリ**。ブラウザ3D（Rapier/Recast）で、本人が自然に操作できる**人間1＋CPU7（自然4v4）**、見た目・物理・カメラ、移動/イカ/実射撃/塗装/インク補給、自然敵との本物のHP/撃破/150 native tick復活、180秒、原作根拠に基づく公式得点/勝敗、同武器再戦、Windows実機FPS/ARTと正式QAが目標。Big Run、別ステージ・別モードへ退避しない。
- **現時点の登録権限は25 Rapier solids /17 PaintSurfaces /26 source NavLinks /0 Scoreable、Winner NONE、正式4v4/ART/公開はHOLD**。B499原作候補10部品42三角Faceは現本体0/10登録、8隣接の現Recast接続0/8、検査した自然敵味方16経路0/16。これは検査集合における観測であり、原作全域の完成率も全経路の不存在も**わからない**。視覚OBJを丸ごと衝突床へ昇格、仮橋・床・NavLink・ワープ・敵接触・HP/得点の捏造、閾値/CPU半径の無根拠緩和は禁止。
- **旧Windows本人通常試遊FAIL**：見える床と物理の不一致・床抜け・CPU少数・SAFE STOP。既存の比較証拠 `Documents/BrowserInkTPS_F3L_15864_5030`、クローン `Downloads/browser-ink-tps-current` を再利用し、43MB原作、スクリーンショット、ZIP、PowerShellを再提出させない。旧本人実歩行tick1270→1271で高台支持喪失（X -4.770→-4.924、Z 52.723→52.413）、tick1355→1356で低地支持喪失（X -0.910→-0.675、Z 46.989→46.629）。**正常な縁/落下、他の高さの床との区別は未解決**なので、見た目だけで「原作の床穴」と断定しない。現在の本体を本人Windowsで一体試遊した新証拠はなし。

### 3. 今回の批判を踏まえた実行法の修正

1. **最初は #43528988040 の最終状態を読むことだけ**。途中で失敗したなら `BOOT/READY`、`7/7合流`、`人間WASD+実弾/インク`、`OWN SQUID`、`180秒TIME_UP`、`同武器再戦` の**最初の失敗地点**に切り分ける。UI/厳格スクリプト前提のFAILか本体ゲームFAILかも分離。失敗点がない限り修正コミットなし。1回の実験に許可された範囲と結果を超えて合格宣言しない。
2. **レーンB（F1/F2/F3の既存SOURCEゲーム）を第一の実制作**：実障害があれば本体の関連ファイルを一バッチで修復し、既存軽量Vitest/TS/Viteを原則一回。軽量テストがPASSでも `CODE_PASS_ONLY`。真正試験/Windows実機は**対象を限定した本人の別途明示承認**があるときのみ。特殊な「拒否移動時に攻撃」だけを人工的に発生させる実験を優先しない。
3. **レーンA（F4地形・最大阻害）を止めない**：本人の最初の通常歩行障害1箇所について旧B490、B499、原作Face/Actorの同一座標を突き合わせ、Ver.7.2.0 Turf Banc/BYML・Actor placement・Phive材質と`col_disable_flags`の**個別正規根拠**が確認できる場合だけ隔離して真HUMAN Rapier KCC→元半径0.30m CPU Recast→真世界へ段階昇格。根拠不足Faceだけ`HOLD_REFERENCE_REQUIRED`、PRIVATE原本・派生Faceを外部CI/GitHubへ無承認送信しない。Pass18の8 gapとB499の8 adjacent seamを同じ場所と断定しない。
4. **マクロ受入順は不変**：自然4v4の足場と接続→本当の対人CPU遭遇→実HP0/150tick復活→原作Scoreable権限成立後にのみ公式得点/勝者→本人Windows普通の試遊・実FPS/ART→正式QA・明示公開。未完了なら未完了。2工程続けて実プレイ進捗0なら小修正/小QA/HUD/文書を止め、最大阻害要因と実行方法を見直す。
5. **単独統合担当で効率化**：原則この新チャットだけでGitHub本体/旧RAWを読み、必要な独立レビューのみ読み取り専用並列化。書込みは唯一の統合担当が研究branchへ `expected_sha` CAS・single parent・`force:false`。勝手な並列push・無限再試行をしない。main・T19C・T20・PR #5・Pages・正式QA・PRIVATE・本人Windowsの変更は不許可。Work/Computer Use/Windows変更/高負荷GitHub Actions/PRIVATEの転送/本番公開はそれぞれ個別事前承認。
6. **コストと伝達の最小化**：本人操作原則0、追加課金原則0円。高負荷完了を待つための会話の連投/無意味なポーリング/重複実行なし。返答は `FACT/CODE_PASS_ONLY/TRUE_RUN_LIMITED_PASS/HOLD_REFERENCE_REQUIRED/FAIL/UNKNOWN` で、「実ゲームが何を新たにできるようになったか・同SHA証拠・残HOLD・次の1手・本人作業」のみを報告する。必要なファイルや情報が既存にあればユーザーへ再提出させない。

**新チャット最初の具体命令**：本セクション→同V28下位章→必要なV27/Fast Track/DECISIONSを継承し、`#43528988040` の最終状態・jobログ/Artifact（取得できる場合）を確認する。①真正の試験範囲だけ結果判定、②実ゲームの再現済み欠陥があれば最小一括修正、③原作権限がないF4個別FaceはHOLD。新たな真正試験を自動で起動しない。ユーザー作業0を基本とする。

---

## 【2026-11-13 B448真正後・本人明示の最終全体批判／V28継続・新チャット唯一の最新版】

**位置づけ**：ユーザーが再度明示した総合再評価・移行のための今回1回のみの追補。新V29・新企画・上位仕様の変更ではない。最上位は原作『スプラトゥーン3』Ver.7.2.0マテガイ放水路**通常ナワバリ**、本当の人間1+CPU7の自然な4v4・180秒・再戦・原作地形/HP/インク/得点/勝敗/ART・Windows実機。固定F1〜F5、Fast Track、DECISIONS、既存V28全文・V27以前の本人指示、失敗と保護条件をすべて継承。**この追補自体はdocs-only、実ゲーム進捗0**。古い文書内の「最新HEAD」「次の工程」「研究QAブランチ」「0/12」は記述時点の履歴。新チャットは必ずGitHubを再照合する。

### 直近の実測によって更新された事実と確実性

- **保存直前の研究HEAD**：`4a256b2e02f1e5203ded11a0528ae1352b3dcda0`。これは承認済みの真正B448を**既存ワークフローで1回だけ起動したコメント**のコミット。本体ソース最終修正は親の`a20b08078c29c75d4d9841c1508fbcc2498caf5f`（B384の本物の物理弾数管理と「専用ベンチマーク選択」の誤混同を分離）。本追補保存でHEADはまた別SHAになる。main=`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、Draft PR #5 Open/Draft、PR head=`8cfc95756ef0b56e2c33dc9f89a9041126daa272`、いずれも保護。
- **軽量CI** [#43331490352](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43331490352)（B384修正ソースHEAD）はSUCCESS：20ファイル211 PASS/2 SKIP、別7ファイル75 PASS、TypeScript/Vite PASS。重いChromium SKIPPEDで、`CODE_PASS_ONLY`。旧B441真正 [#43328802850](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43328802850) ではB384誤衝突コンソールエラーを実測し、修正した。新CI成功を全モードの実ブラウザ認証と呼ばない。
- **今回答えた真正B448** [#43335171546](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43335171546)：HEAD `4a256b2e...`、既存の研究opt-in `T21_B448_A3_REAL_ORIGINAL_FRONT=1`、`ubuntu-latest`、720tick指定、証拠区間722tick、ジョブSUCCESS、実CPU7/7参加。A3は旧Landing起点で厳格許可0だったが、**後続の実Rapier足元から原作登録床の前線目標を1件新規許可**し、実Crowd目標要求43回、実水平変位 **15.818m**、認可目標との最短約**0.098m**。A3本物のCPU射撃要求14・原作塗装変化1,881セル（実弾着による変化1,559セル）。7CPU合計射撃要求154、登録塗装変化9,222セル。確定できるのは研究モードでの**実CPU前線移動・射撃・塗装のTRUE_RUN_LIMITED_PASS**であり、F4中央開通/自然敵HP/180秒/正式4v4ではない。前回B448無効A3約3.53mとの単純比較は異なるSHA・モードなので厳密な因果証明ではない。
- B448の正規証拠：Run #43335171546、Artifact **13996973133**、ZIP SHA-256 `06ded5fe1d7fc726d1769727ab3245a5762646a586b632ad2b5a64ec1c68e388`。中の`b440-short-real-original-human-foot.json`、`b487-real-original-16-cross-team-route-audit.json`、`b488-real-original-f4-gap-authority-hold.json`などで個別照合できる。保存先が消える前に既存証拠を再利用し、同条件の無意味な再試行をしない。
- **絶対に未完了**：既登録25 Rapier solids /17 PaintSurfaces /26 source NavLinks /0 Scoreable。B499候補10部品42原作面の現登録0/10、原作8隣接の現Recast到達0/8、今回も自然な敵味方16経路0/16、原作局所8ギャップは未解決。現同一世界の敵への自然接近/HP/撃破/150 native tick復活、正式ナワバリ得点/勝敗・Winner、本人Windows全域床・ART・FPS、正式F5と公開はHOLD。対象16経路の結果は全世界の経路不存在を数学的に証明せず、全マップの完成率は**わからない**。B2/B4初期Recast経路とRapier支持Y約0.28m差で0.25m安全閾値HOLD、一方後半の本物の同側床前進は成立。4tickのfoot Ray未検出は床穴や安全な全身カプセル通過の証明でない。閾値を緩めない。
- **旧実績の扱い**：旧SHAの180秒試合、OWN回復→再射撃、再戦、CPU7回復などは各々限定PASSだが**最新HEADの同一試合で全項目の統合認証なし**。前のREADY/CDPタイムアウトをCPU物理経路バグと誤分類しない。これまで本人Windowsで見えた床抜け・光学床と物理床の不一致・CPU少数・SAFE STOPが最新HEADで完全改善した証拠なし。

### 今回の最終自己批判と修正した実行順

1. **退ける進め方**：小B番号・HUD/デザイン・文書・QA増殖を次工程と称する、旧成功SHAを機械的に再実行する、CPU opt-inの局所PASSを正式4v4完成に拡大する、原作OBJを衝突床へ無根拠に一括昇格/見えない橋やNavLinkを追加する、原作Phiveがないため全開発を停止する、多チャットが同一branchを並列pushする。文書だけの進捗は0と記録。
2. **レーンA（F4最大阻害・局所HOLD可能）**：旧B490同一視点の原作光学床と実Rapier差、B499原作Face・原作局所8接続、B2/B4原作経路高さ不一致、本人が普通に歩けない**最初の1地点**を一つの具体的な原作Face/Actorとして同定。正規Ver.7.2.0 Turf Banc/BYML Actor transform、Phive material/`col_disable_flags`と当該Faceの衝突可否が独立確認できたときだけPRIVATE隔離→真正HUMAN全身Rapier KCC→元CPU半径0.30m Recast/Crowd→同一native世界の実CPU/人間歩行を検証。証拠がなければそのFaceだけ`HOLD_REFERENCE_REQUIRED`、同じ再生成やタイムアウト増量はしない。Pass18の8 gapとB499の8隣接を同一点と仮定しない。
3. **レーンB（F1/F2/F3を止めずに先行実装）**：登録済み25/17/26の**普通のSOURCE試合**で、起動READY→実Pointer Lock→7CPU真正rejoin→人間の本物のWASD＋KCC→選択武器で実射撃と着弾/17面塗装→実インク消費→同じ登録面のOWN SQUID回復→再射撃→合法なCPU7参加/ライフ→180秒TIME_UP→同武器新世界再戦、という1本の垂直スライスを既存本体で完成させる。**次チャット最初はこの本体コードと既存RAWを監査し、再現した現実の欠陥だけ関連ファイルを一バッチ修正する**。不要なコードや新文書を追加しない。B448は研究opt-inのまま、普通の試合へ無審査に自動昇格させない。中央未開通の間は偽の敵接触/HP/得点を作らない。
4. **合格順**：まず関連コードを一括確認→1つの本体機能バッチ→原則1回の既存軽量TypeScript/Vitest/Vite検査（成功でも`CODE_PASS_ONLY`）→本当に必要な場合にだけ1系統の真正Chromium/実機検査を**明示再承認後**実施。過去のB448 1回承認は消費済み。自然敵遭遇→本物の着弾HP0/150tick復活→原作Scoreable権限→公式Winner→本人一括実機F5→明示公開の順。二工程連続で実ゲームの新体験0なら微QAを停止し最大阻害を再査読する。
5. **並列の最適化**：初期はこの一つのチャットからGitHub・ソース・旧RAWをまとめて読み、ユーザーに補助チャットの運搬を要求しない。分業で実際に時間短縮する独立仕事が生じたときだけ最大2〜3チャット（F4原作Face根拠、CPU移動・物理、F3ライフ・180秒）を**読み取り専用レビュー担当**にする。唯一の統合担当だけが最新HEADから単親expected_sha CASで研究branchへ書込む。補助の無断push・CI・PRIVATE転送禁止。
6. **本人負担・保護**：本人操作0回・追加課金原則0円。既存clone `Downloads/browser-ink-tps-current`、B490比較 `Documents/BrowserInkTPS_F3L_15864_5030` を再利用し、ZIP/43MB原本/スクショ/PowerShellの再提出を求めない。main/T19C/T20/PR5/Pages/正式QA/PRIVATE/Windowsは保護。Work/Computer Use・高負荷Chromium・Windows操作・PRIVATE転送・公開はそれぞれ個別事前承認。今後の返答は実際のゲームの新機能/改善（なければ0）・SHA・正しい証拠・残HOLD・最短次工程・本人作業有無を短く報告。

**このV28追補は本人明示の一度限りの移行作業。** 次チャットで新しい計画作りに戻らず、最新HEADをライブ確認したうえで**レーンBの実ゲーム本体の破綻を調べ、根拠があれば修正**へ直行する。正式完成率はUNKNOWNのまま。V28下段の内容は継承するが古い現状数値/次手順は履歴であり本節を優先する。


## 【2026-11-13 本人明示の最終批判・次チャット統合入口：V28継続追補】

**位置づけ：今回のみの新チャット移行保存。新V29、新プロジェクト、新B番号、新ゲーム仕様ではない。** 下記V28全文・V27以前・永続DECISIONS/Fast Track/固定F1〜F5を継承する。古い「現行HEAD」「次の工程」は書いた時点の履歴とし、最新のGitHub証拠を優先する。**本追補はdocs-only、実ゲーム進捗0。**

### A. 再開時点で実際に確かめた事実

- 今回の保存前**最新ゲームコードHEAD**：`421e869c9ad3c27e8704588b5273acddd5761657`。直近の同HEAD軽量Actions [#43237631457](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43237631457) はSUCCESS：SOURCE 19ファイル **192 PASS / 2 SKIP**、関連7ファイル **61 PASS**、TypeScript・Vite build PASS。ただし **real-native-original-frontline job SKIPPED**、真正Chromiumの同一SHA・180秒統合試験は**未実施**。文書保存後は研究HEADが新しいSHAになるので、文書コミットをゲーム実装の新HEADと誤認しない。
- 現時点main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、Draft PR #5 Open/Draft・未merge・PR head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。いずれも変更禁止。研究branch `research/t21-integrated-a1-c-patrol-four-mode-20261105` のみ、HEAD再取得→単親→expected_sha→force:falseで更新する。
- 2026-11-12以降の関連ゲーム修正は、通常SOURCE CPU SUB/特殊効果実行経路、投擲物の実敵・人間衝突、HUMANカプセル/SQUID球でのCPU MAIN/CHARGER/SUB/爆風整合、CPU命中・撃破後の二重計上防止、180秒終了時の余分なtick防止・最終実物理位置の描画を含む。**これらはコード実装と軽量CIの成功にすぎず、最新実プレイでの命中・HP/150tick復活・同一180秒再戦は未認証。** 正式Scoreable=0のため、CPU特定SPECIALの通常試合内での自然発動も未実証。
- 旧SHAの真正Chromium [#43140584988](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43140584988) の保存ZIPは直接再査読済み：同一世界で**実CPU7/7再合流、720 native ticks、CPU有償射撃要求154、実着弾変化8,382セル、OWN回復118.003333、無償足元塗装0**という限定PASS。tick1032で6/7（B2未合流）、後の7/7確認であり、6/7一時観測を永久故障としない。同試験のB486読取は人間―敵CPU最短約**104.86m**・味方CPU―敵CPU最短約**76.83m**、3m以内の自然相手遭遇0、実敵HP命中未認証。B2旧目標32件は原作経路高さ不一致30＋別拒否2で初期0承認だが、後半の局所同陣営原作目標到着を永久不能と混同しない。
- 旧真正失敗 [#43183698220](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43183698220) の保存ZIPは `stage=NOT_STARTED`、ゲーム開始前の選択画面画像と `B440_SHORT_REAL_NATIVE_HOLD_TIMEOUT_`。**この回はCPU/床の実戦回帰を示さず、起動・CDP・READY以前の不明なタイムアウト**として別分類する。原因はUNKNOWN、同条件の無意味な長時間再試行をしない。
- **STAGE INCOMPLETE / 本番HOLD**：既登録25 Rapier solids /17 PaintSurfaces /26 one-way source NavLinks /0 Scoreable、正式Winner NONE。B499原作候補10部品42面は現25-solidへ0/10登録、現Recast上の候補8隣接は0/8接続、16件の自然敵味方経路試験は0/16。これらは**限定された検査集合であり、原作全マップの完成率や数学的な全経路不存在はわからない**。未検証のVer.7.2.0 Turf Banc/BYML Actor配置・Phive material/`col_disable_flags`・歩行権限を仮定しない。
- 本人Windows旧失敗：床抜け/原作光学床とRapierの不一致/CPU少数/SAFE STOP。既存B490 `Documents/BrowserInkTPS_F3L_15864_5030` と既存clone `Downloads/browser-ink-tps-current` を再利用し、再提出・43MB再ダウンロード・再cloneを求めない。真足元既存観測は下段tick1355 `x=-0.909828,z=46.989162` が登録支持、tick1356 `x=-0.674687,z=46.629433` の同じ高さに支持なし。**空中・境界・別高さの可能性を除外していないので床穴認定は禁止。**
- 既存のF4 Phive検査 `scripts/f4_phive_original_collision_probe.py` は**別途正当に入手・版照合された**衝突OBJとmaterial JSONおよびB239原本ピン留めデータが揃った場合のみ使う。現段階ではVer.7.2.0 Turfの実Actor変換・衝突有効性・Face権限はUNKNOWN。元ファイルと抽出面を外部GitHub/CIへ無承認送信しない。

### B. 自己批判を経た唯一の実行戦略：F4原作認証とF1/F2/F3統合を並行する

**棄却する案：** (1) 小さな射撃・描画・ガード修正を毎回「次工程完了」と呼ぶ、(2) 複数のQA・HUD・B番号・Vxx文書を増やして進捗扱いする、(3) 原本がないのに見えるOBJを全部床にし閾値を緩める、(4) Phive取得まで開発全体を無期限停止する、(5) 準備段階のCDPタイムアウトをCPU経路故障と誤分類する、(6) 成功済み旧SHAの限定試験を無駄に再実行する。**実ゲームの可動域、自然遭遇、実際のWindows試遊が増えないまま軽量CIだけを積む流れを断つ。**

**優先レーンF4（原作ステージ・最大阻害）：** 旧B490本人同位置比較、B499 42Face、本人tick1355/1356、B2原作経路拒否の**一つの具体的最初の普通の歩行阻害点**を整合させる。原作7.2.0 Turfの同じFaceについてBanc/BYML配置とPhive/材質/collision disable権限を独立確認できた場合のみ、PRIVATE隔離で視覚・物理の座標対応→実HUMANカプセルの連続Rapier接地→CPU半径0.30m Recast連続経路→本物の60Hz世界での移動を段階的に検証。原本未取得なら当該Faceだけ `HOLD_REFERENCE_REQUIRED`、**決して架空の床/橋/NavLink/ワープ/スコアを作らず、同じ検査を繰り返さない。**

**並走レーンF1/F2/F3（既登録SOURCEの本当のゲーム）：** まず最新のソースと旧TRUE RAWで、起動READY→実ポインターロック→STAGING中の7CPU実Rejoin→PLAYING→人間WASD→実射撃/着弾/17面塗装/インク消費→同じRapier backingSolid上のOWN SQUID回復→再射撃→CPU7の有償攻撃/生存/実被弾・150tick復活→180秒TIME_UP→同じ選択武器で新世界再戦、を**同一HEAD・同一現実の世界**で成立させる。自然遭遇が起きていない敵HPや本番相当の撃破・公式得点を偽装しない。これまでの実装を一括レビューし、**再現済みの本体欠陥のみ**まとめて修正する。可能なら現成績を悪化させず、現時点の真正統合証明がないことをHOLDとする。
- 旧B440の失敗はまずREADY前／世界生成後／7/7準備／実戦中に分岐して分類。証拠不足の段階に入ることをCPU物理バグと呼ばない。タイムアウトの延長だけでPASSにしない。
- 真正Chromiumは長時間・高負荷なので**個別の明示承認を得た時だけ**最小1系統で実施（GitHub Actions上でも同様）。未承認のまま新しい重負荷CIやWorkを起動しない。既存真正成功RAW・軽量CI・安全な読取監査は無断の高負荷実行に代わる準備として活用する。
- 試験本体の変更で成功しそうに見せず、正式QA・上位ロードマップ・main・PR・Pagesは保護。

**最終F3/F4/F5昇格：** 自然な原作対岸経路→実敵命中/HP0/150 native tick復活が成立したとき、初めて敵戦闘をTRUE認証。正式Scoreable権限確定後だけ公式得点・勝敗を実装する。最終的に本人Windowsで同一視点の原作外観、物理床、CPU7、自然戦闘、FPS/安全停止、180秒・再戦を**1回の一括試遊**で確認する。正式ART/本番/公開/PRマージは個別明示承認までHOLD。

### C. 運用ルール・厳格な停止条件・本人の負担最小化

1. **最初の1回だけ**最新研究HEAD/main/PR5/直近CI/対象差分をライブ照合、旧RAWを再利用。目的が変わらない限り同じ読み取り・長い説明を何度も繰り返さない。別チャットの同研究branchが進んだら古いHEADを上書きしない。
2. 調査→原因・再現条件の確定→関連本体コードをまとめた修正→必要最小の既存回帰/型/Vite（原則1回の軽量CI）→個別承認がある場合だけ真正1系統→結果の順。原則新B番号、新ドキュメント、新QA-only変更、HUD装飾は禁止。**1つの小ガードやtests PASSを「ゲーム改善完了」と称さない。**
3. ゲート別結果ラベル：`FACT`＝証拠そのもの、`CODE_PASS_ONLY`＝型/軽量CIまで、`TRUE_RUN_LIMITED_PASS`＝同一SHAで限定実戦イベント実測、`HOLD_REFERENCE_REQUIRED`＝原本不足、`FAIL`＝再現した実測失敗、`UNKNOWN`＝検証不足。最終完成率はUNKNOWN。2工程連続で真正の遊び改善が0なら小修正を止め、ブロッカー／承認条件を見直す。必要な証拠がない場合、修正を作ったふりをしない。
4. 本人の操作は**原則0回、追加課金原則0円**。GitHubの読取・安全な軽量検査・研究branchのコード整備は可能な限り一括してこちらで実施。本人PCの操作が避けられない場合は既存clone/B490資料を再利用し、リスク・結果・必要な操作を**安全な1回分にまとめて**依頼する。Windows/Work/Computer Use、PRIVATEデータ転送、重負荷Chromium、正式QA・公開は個別事前承認。確認が必要な条件は省略しない。
5. 報告は短く「ゲーム上で新しくできるようになったこと（なければ0）／SHAと真の証拠／未完了の最重要HOLD／次の一本の作業／本人作業の有無」を揃える。全体説明は今回だけ。次の「工程へ進めて」で同じ大総括を繰り返さず実行へ進む。

### D. 次チャットの最初の具体的行動（最重要）

**新チャットでは計画作成からやり直さない。** `START_HERE.md`最新入口→本V28（この最上段から全章）→V27の要点・固定F1〜F5/Fast Track/DECISIONS→現HEAD・CI・PR・差分→旧RAWを確認する。

1. **最初のブロッカーを選ぶ：** 既存B490/B499/tick1355〜1356の原作Face collision権限がいまだ不明ならその箇所はHOLD。正規Ver.7.2.0 Turfデータがこの会話で新たに利用できるときだけ局所F4隔離検証する。
2. **並行の具体作業：** 同じSOURCEゲームの起動〜7/7〜人間・CPU実戦〜TIME_UP〜同武器再戦について、最新HEADでまだTRUE実証されていない**最も破綻しやすい一本の現存コード経路**（準備段階／入力・実KCC／HPライフサイクル／終了・再戦）を旧TRUE RAWと比較し、根拠のある本体不具合があれば関連単位で一括修正する。新文書/HUD/小QAを成果としない。
3. 真正統合試験が**不可欠になった段階だけ**、対象1系統・最大負荷・費用0円・本人操作0の範囲を具体化して個別承認を得る。許可がない状態では実行せず、SOURCEコードの安全な調査を進める。

**再開時の基準ゲームSHA = `421e869c9ad3c27e8704588b5273acddd5761657`。これは固定HEADではない。毎回ライブHEADが優先される。今回の文書コミット直後のHEADは別である。**

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
