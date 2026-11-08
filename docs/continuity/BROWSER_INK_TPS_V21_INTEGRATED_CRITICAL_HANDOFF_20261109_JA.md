# Browser Ink TPS / T21 — V21.0 全体批判・根拠付き統合・次チャット引き継ぎ正本

**作成：2026-11-09 JST。** ユーザーによる今回の「過去の全体計画・方針・指示・反省点をすべて批判的に評価し、新チャットに移行」の**明示依頼に限る**V21更新。**既存T21の継続であり、新企画・上位憲章改定・公式認証・ART採用・公開許可ではない。** V20の「明示依頼なしの新V増殖禁止」を維持する。これ以後、依頼なしにV22等を作らない。**本書は docs-only で、ゲーム機能の前進は0件。**

## 0. 再開に必要な最少情報（この節を優先）

- GitHub `https://github.com/ryomashibaba/browser-ink-tps`。**書込可能な唯一の研究ブランチ**：`research/t21-integrated-a1-c-patrol-four-mode-20261105`。
- **本書作成直前にGitHub APIで確認したゲーム／runner HEAD**：`bce544734e408ca50e5eda2218f8b8ff65ef1b68`（2026-11-09 JST）。本書保存でHEADが変わる。**次チャットはその場でHEADを再取得し、新HEADをゲーム実証済みと自動認定しない**。
- **固定main（同時確認）**：`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。**Draft PR #5**：Open/Draft/unmerged、別のHEAD `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。研究ブランチはPR#5のブランチではない。
- 不変正本：本V21 → `docs/continuity/BROWSER_INK_TPS_V20_CRITICAL_INTEGRATED_HANDOFF_20261108_JA.md` → V19 → V18 → `T21_FAST_TRACK_ROADMAP.md` → `docs/continuity/FAST_TRACK_EXECUTION_JA.md` → `docs/continuity/DECISIONS_JA.md`。**上位F1～F5、Fast Track、永久決定を変更しない。** 文書間の古いSHA・0/12・QA書込ブランチは歴史的記載。今回の現行研究ブランチ・0/16・保存RAWを優先しつつ、不変な安全条件は厳しい方を守る。START_HERE.md中の過去の「現行」見出しは履歴。
- **原作SOURCEの固定境界**：実登録25 Rapier solids / 17 PaintSurfaces / 26 one-way NavLinks / **公式Scoreable 0**。B487で自然な敵味方到達 **0/16**。中央8ギャップのVer.7.2.0通常ナワバリ正規Collision Face/flags個別権限 **0**。公式Winner NONE、`activationReady=false`、`productionAuthorized=false`、正式4v4・公式得点勝敗・ART採用・Pages/正式公開は**HOLD**。
- **絶対保護**：main、T19C/T20、PR #5、Pages/production、正式QA、他ブランチ、原作・PRIVATE・本人Windows、固定ロードマップ、既存安全閾値。無承認merge/rebase/force-push/本番/設定変更禁止。研究ブランチだけ最新HEAD→単親commit→`expected_sha`付き非force CAS。HEAD競合は差分再照合の前に停止。
- **不正なショートカット禁止**：未認証/光学専用OBJの床化、偽床・橋・坂・NavLink・Scoreable・透明足場、CPU/Actorテレポート、CPU半径縮小、KCC/Rapier/Recastの不当閾値緩和、偽命中/HP/インク/時計/勝敗。版違いの原作素材を当該Ver.7.2.0通常ナワバリの公式証拠に転用しない。PRIVATE原本は無断外部投入しない。
- **作業境界**：Chat＋接続GitHub中心、本人操作原則0回・追加課金原則0円。Work/Computer Use/本人PC/管理者/PRIVATE原本・高負荷処理・正式QA/公開は従前の個別承認を要する。他プロジェクトへ権限やスコープを持ち込まない。TPSとMinecraftAIBuilderは全体で同格最重要。

## 1. 最終完成条件（不変、成果の水増し禁止）

Splatoon 3 **Ver.7.2.0以降のマテガイ放水路（Undertow Spillway）・通常ナワバリ**を、忠実なブラウザ3D TPSで完成させる。1人の実人間＋本物のCPU7体、自然な4対4、180秒の同一試合、正規の高低差/床と通路、WASD・視点・本当の物理/HP/撃破/150 tick復活、実弾/武器12種・サブ・イカ・インク消費/OWN回復・塗装/Scoreable得点・勝敗・明示再戦、良い映像/音/FPS、本人試遊と明示最終承認。

- **F1** 原作根拠の8体実Actor・開始/再合流。**F2** 実Rapier KCC＋Recastの各地点の連続物理。**F3** 同一世界180秒/実戦/Ink/HP/撃破/復活/結果/再戦。**F4** 同版の原作Collision Face/flags・連続床/敵味方経路・公式Scoreable。**F5** 本人通常操作・表示・性能・公開審査。
- F1/F2/F3の局所SOURCE練習PASSは、正式F4・F5や公式4v4を自動解除しない。

## 2. 根拠のある最新状態（別SHAと別RUNを厳密区別）

| 事実・限定合格 | 不変の真正根拠 | してはいけない拡大解釈 |
| --- | --- | --- |
| **K0：同一native tickによるF4監査方法の同期PASS** | SHA `87086f8abcdb919dc077f23a257c4c8885bdd426`、Actions [#42487525658](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42487525658)、Artifact `13620431059`、B486/B487/B488 tick **1785**、真敵味方自然経路 **0/16** | F4の8ギャップが修復されたわけではない。再監査だけの重複RUN禁止 |
| **K1：真正HUMAN WASD→登録済み坂、Rapier接地PASS** | SHA `8d3f6bb09f0f48b5b38d03d1189b2d585ff0eef1`、Actions [#42493927363](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42493927363)、Artifact `13622314840`、start tick1269 body(-0.079,3.896,50.582) → ramp tick1305 body(2.528,3.971,50.552)、原作 ramp solid `UndertowT21D:right-low-route-ramp-positive-z`、true KCC grounded、CPU 7/7、stopReason null | 本人Windowsの見た目・中央の床・物理全域PASSではない。明るい材質単独のART因果証明でもない |
| **K2：CPU7/7が同一世界で実射撃・実着弾塗装PASS** | SHA `bce544734e408ca50e5eda2218f8b8ff65ef1b68`、Actions [#42523962398](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42523962398) **completed/SUCCESS**、Artifact `13635030583`、native tick **1062→1784（722 tick）**、7 ID全員で影響セルが正に変化、CPU真正射撃要求 **154**、実着弾で変化したセル **6008**、全CPU塗装変化 **13231**、着弾イベント **157** | 同側のSOURCE床塗装であり自然な対敵命中・撃破・対岸経路・公式スコアではない。全CPUで同程度の自律戦闘ができることも未証明 |
| **同一K2世界の人間入力** | #42523962398では人間実射撃 **6発**、人間実塗装イベントの変更セル **90**、本物のCキーによるA1指示 **2回** | 別SHAのK1実WASD試験と一つの完全180秒実世界に合成しない |
| **既存180秒・Ink/OWN補給・同武器再戦の限定成功** | 別SHA/別RUNで真正 [#42444639854](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42444639854)、ほかV20 2章のA1/A2/A3証拠 | 現HEAD `bce54473` の同一世界フル180秒統合成功ではない。4モード×12武器の一括PASSではない |
| **本人Windows実試遊のFAILが最上位の品質証拠** | 2026-11-08本人報告：多くの床が暗い/見えない/抜ける、CPUが1体ほどに見える、普通の操作でSAFE STOP、時計3:00/早期1/7表示 | 本人のローカルSHA/完全URL/最初の例外/足座標が分からない。これを自動成功で「修復済み」に変えない |

K2 RAW検証補足：ZIP `github-actions-artifact-13635030583.zip` の SHA256=`bd52ab06c0a0ed51b6ff9de4ba4020a2e5577b3fd7e22946945fcfcedc4e2018`。内部 `b440-short-real-original-human-foot.json` SHA256=`a93584ed9c1ea7b6dd4ebb9bbf4f21bcbecef229d085b2b4026f35991e1249b5`。局所監査JSON `tps_k2_seven_cpu_native_ink_audit_20261109.json` はChat成果物で、GitHub Actions Artifactの元データが唯一の真正一次証拠。7体別着弾セル：A1 547/A2 548/A3 298/B1 1202/B2 1470/B3 502/B4 1441（合計6008）。**射撃要求≠飛翔弾≠着弾イベント≠所有セル増加≠敵HP命中**。足元塗装と着弾塗装を混同禁止。K2のRUN・RAWは再実行しない。

K2の実装事情：`bce54473` は既存 `scripts/t21-b440-short-native-original-foot.mjs` のK2「読取差分」追加だけ。前HEAD `8d3f6bb` は既存B250で**登録済み原作坂の非塗装色を区別する局所描画変更**。原作SOURCE物理・AI・塗装・スコアは不変。これを正式ART PASSと呼ばない。

B487/B488：同一現有地形で人間→敵最短約**104.91m**、味方→敵最短約**79.23m**、認証された自然敵味方経路0/16。8ギャップのVer.7.2.0 Collision Face/flags根拠0。継続するF4上限を数字の緑化で隠さない。

## 3. 全体の批判的評価（成功・失敗・根本要因・改善）

1. **正しかった**：原作忠実性とUNKNOWN/HOLD、main/PR5/本番/PRIVATE保護、各種SOURCE衝突と光学専用OBJの分離、実キー・Rapier・本物PaintCoordinatorの証拠、違うSHAの成功を独立して残すこと、本人0操作・追加0円。**これらは維持**。
2. **最重大な不一致**：研究Chromeの成功を積み上げても2026-11-08の本人Windows実プレイはFAIL。原作すり抜けと表示欠落は、未登録源流床・光学面と物理衝突のズレを含み得るが、どの座標・何が原因かは不明。CPU 1/7は**段階的な本来の合流中/早期SAFE STOPによる更新停止の可能性**もあり、恒久的CPU故障と決めつけない。最初の実例外/NativeTick・ローカルSHAが不明なうちはその根因を断定しない。
3. **最重大な構造的障壁**：原作F4 Collision Face/flagsなしに中央8ギャップをつなげない。真敵味方自然遭遇・HP/撃破・正式Scoreable/勝敗への道が塞がれる。**描画OBJや推測の透明足場では越えない**。F4がないことを理由に同じ監査を何十回も繰り返さない。合法に遊べるSOURCE局所体験は別途改善する。
4. **仕事の効率失敗**：B番号、短いQA、Hud微調整、3〜6分の重複7CPU試験、毎回の大型V文書を「ゲーム進歩」と数え過ぎた。**K2の7体すべての真正着弾ができたので、CPU7が動く・塗るだけの再証明は打ち切る**。本書のdocs-only保存＝ゲーム成果0と明記。次の実行では新B番号/HUD/CI/ドキュメントを原則作らない。
5. **実行優先順の課題**：旧V20でK1/K2を優先したことは妥当だったが、両者の限定実証が完了した今は同じK1/K2を繰り返す優先順位は誤り。**K3（普通に遊ぶ1本の連続試合）と本人FAILの根本原因の特定**へ切り替える。形式的な180秒RUNより、STOP/床/CPUの実ゲーム欠陥に因果がある修正が先。
6. **性能と品質の不透明さ**：現在の自動証拠は本人GPU/OS/ローカルSHA・現実のFPS/描画環境を証明しない。GPU/PC設定の想像でWindowsや原本を書き換えない。実験の最後に本人の**1回のまとめた試遊**で最小観測だけ回収する。
7. **誤った成功と誤った失敗の両方を防ぐ**：Actions successはそのrunnerの限定要求に対する成功。将来 FAIL なら `CODE_RUNTIME / TEST_OR_ARTIFACT / SOURCE_AUTHORITY / RENDER_PHYSICS / CPU_LIFECYCLE / LOCAL_ENV / INSUFFICIENT_EVIDENCE` を保存RAWと初発理由で分類。過去B487/B488の時刻同期の形式FAILから物理を改悪したり、失敗を隠すために安全ゲートを緩めない。
8. **スコープ管理の反省**：このチャットはTPSだけ。他のプロジェクト、12月対策の費用監視やStrata実行権限は持ち込まない。少ないユーザー操作という希望は、既存承認ゲートを無効にしない。

### この新計画に対する反対意見を先に検査

- 「K3をすぐフル180秒で実行すれば完成が近い」→ **反論**：本人SAFE STOP/床欠落の根因が分からないまま、過去の別SHA180秒を繰り返しても人間プレイ品質は直らない。まず同一HEADでの通常PLAYER入力・停止分類・CPU可視活動を既存RAW/ソースから確認。真に必要な時だけ既存の1本の統合RUNを選ぶ。高負荷実行は承認境界を確認。
- 「7/7全員が塗れるなら4v4はほぼ完成」→ **反論**：敵陣経路0/16、自然な敵への実HP命中0認証、公式Scoreable0なので4v4達成と認定不可。
- 「表示を改善したから床は直った」→ **反論**：描画はB250/光学F3E、衝突はRapier独立。SOURCEにない床を画面だけで本物と表現すると危険。区域ごとの真support IDと見た目の一致を優先。
- 「CPUの発進順を同時にすれば1体問題は直る」→ **反論**：A1→A3→A2、B4→B1→B3→B2の狭い着地点保護の段階キューは既存真正7/7到着の前提。無検証の解除は衝突事故を増やす。本人早期STOPと合流待ちを先に分離。
- 「毎チャットでV文書を作れば安全」→ **反論**：作業時間を奪い、資料重複・現行SHAの誤認を増やす。今回の**明示依頼の引継ぎ1件**で終了し、通常はコード・RAW・短い成果報告のみ。

## 4. 以後の工程（上位方針を変えない実行順）

**工程R0 — 新チャット最初の軽量状態照合（1回、変更なし）**：本V21全文と固定Docsを読む。研究HEAD、main、PR5、直近Actionsの状態を再取得。`bce54473` と `#42523962398` の限定K2達成を正当に受け継ぎ、K0/K1/K2を再試験しない。ソース、既存runner、保存RAWのうち必要箇所だけを調べる。**K0/K1/K2限定PASSの再調査・重複CIには戻らない**。

**工程R1 — 本人が普通に遊んだ際のP0/STOP・見える床の原因整理（K3の前提）**：
- 自動環境で可能な既存コードとログから、**最初の** `stopReason` 発生経路、初発 `T21_F3_FAIL_CLOSED`、STAGING→PLAYING/CPU再合流、実元Rapier支えとB250描画の食い違いを因果で分類。二次HUD例外は初発物理例外と混同しない。未見の本人Windowsの例外名は**わからない**と記す。
- 元の原作登録済み床が見えない**A**なら登録済み頂点/描画だけを修復。光学OBJのみで衝突のない**B**なら歩ける床と誤認させない。どちらも根拠なし**C**なら源流F4資料までHOLD。無理に中央床/通路を設計しない。
- 実際に再現可能な1不具合が判明したら、**本体を直す1まとまりの差分**→既存最小Unit/build→必要な既存Chrome1RUN→RAW照合→研究CAS保存。原因の推測だけなら物理変更なし、別の有益な既存合法SOURCE工程へ進む。

**工程R2 — K3・1世界に統合した代表180秒（実ゲーム機能優先）**：K1とK2が**別々のSHA/実行**だったことを認める。既存ランナーを再利用し、新規ワークフローなしで**同じ最新SHA・同じ1世界**に、7CPU実合流→本物の人間WASD→見える登録済み坂接地→人間の実射撃/インク消費/OWN回復/塗装＋CPU7全員の動作/実着弾→実TIME_UP→人間の明示再戦を順に統合。**本当の敵HP命中、公式Scoreable、勝敗はHOLDのまま**。いきなり重い80分CIを作動させず、現状の長時間既存RUNと足りない入力区間を比較して、必要な一度の真正統合を選ぶ。高負荷／外部費用／実PC操作は既存個別承認に従う。

**工程R3 — F4の真正SOURCEが得られた場合だけ権限更新**：Ver.7.2.0通常Turf同版の本人が扱える正規Collision Face/flags/Actor/Scoreable根拠を確認できる場合のみ、対象8ギャップを**1箇所ごと**SOURCE同定→Rapier 0.30m物理→Recast capsule連続性→真敵味方自然経路→実HP/撃破/復活→公式Scoreable/勝敗の順に進める。根拠なしの場合、日々の仮説調査や偽床を繰り返さず**F4 HOLDのまま他の合法的なゲーム本体を改善**。PRIVATE資料へ無断接続・CI投入禁止。

**工程R4 — 本人Windows 1回の統合受入（適切な改善が完成してから）**：GitHubの最新研究候補と本人の実ローカルSHA/URLを取り違えない。既存 `PLAY_SOURCE_WINDOWS.cmd` を使った**一度だけ**の短い通常試遊で「床は見えるか・7体の自然な動き・SAFE STOPの有無」だけまとめて聞く。失敗時は可能なら既存F8またはストップ理由の最小値**1件**。毎バッチZIP/スクショ/コマンド/長いログの提出を求めない。Windows実機を勝手に操作せず、本人が試すまで **Windows品質はFAIL/未確認**。

**工程R5 — 正式4v4と公開はなお別ゲート**：F1～F5の全要求（原作全域・敵自然交戦/HP・得点/勝敗・180秒・視覚/音/性能・人間手動審査・安全）の真正証拠が揃い**本人の明示承認**があるまで、main/PR5/Pagesに反映しない。

## 5. 反復を防ぐバッチ実行契約（本人操作最小）

- **「1つの本人への実害/本体改善」単位で進む**。最初に既存証拠を見て、直す根因・対象実装・成功/失敗の反証条件を内部で決める。証拠がない場合は改変しない。`コードゲーム本体 > 保存真正RAW > 最小確認 > HUD/文書`。
- コミットは意味のある機能のまとまりで、HEAD-CAS非force。ユーザーへの報告は機能単位。小QA/HUD/B番号/CI増殖や、RUNが緑になるまで同じ試行を回す運用は禁止。**同型FAILが2回続けば仮説変更、3回目の同条件重負荷RUN禁止**。
- GitHub Actionsを走らせる前に、既存の成功した同目的証拠があるかを確認。静的確認/過去RAWだけで決着するなら**CI=0**。必要なら既存1RUNを選び、進行中に新コミットで再実行・キャンセルを起こさない。
- 技術ラベルを厳格に区別：`CODE/UNIT PASS`、`GENUINE_CHROMIUM LIMITED PASS`、`NATIVE_SOURCE AUTHORITY`、`HUMAN_WINDOWS PASS/FAIL`、`ART ACCEPTED/HOLD`。色変更・ログ・計測コード・資料は完成度を加算しない。
- 1回の報告は「**実際に使える進歩、研究HEAD＋CIとRAW、未完成HOLD、次に行う本体改善、本人操作/費用**」に絞る。作業していないことをしたと言わない。確認不能な原作根拠・ローカル状態・本当の性能は「わからない」。
- 進行対象はTPSのみ。MAB/Strata/DECEMBER_2026の別管理や勝手な長時間ローカル実行に飛ばない。

## 6. 新チャットへ送るメッセージ（この1通で十分）

> Browser Ink TPS / T21 / Undertow Spillwayの**既存開発**を継続してください。新企画・上位方針変更ではありません。GitHub `ryomashibaba/browser-ink-tps` の `START_HERE.md` 最上段から **V21.0** `docs/continuity/BROWSER_INK_TPS_V21_INTEGRATED_CRITICAL_HANDOFF_20261109_JA.md` を全文読み、V20以前・固定F1〜F5・Fast Track・永続決定を継承してください。保存前の研究ゲーム/runner HEADは `bce544734e408ca50e5eda2218f8b8ff65ef1b68`、GitHub研究ブランチ・main・Draft PR #5を改めて確認。真正 #42493927363 でK1登録済み坂WASD/Rapier接地PASS、真正 #42523962398 でK2 CPU7体全員の実射撃・実着弾塗装が同一世界で限定PASS（722tick、CPU154射撃要求/実着弾塗装6008セル）。**K0/K1/K2再調査・重複CI禁止。** 次は**本人の床欠落/SAFE STOP/CPU1体の通常試遊FAILを真因別に切り分け、K3の同一最新SHA・同一世界180秒の本体プレイ統合**へ。原作SOURCE25/17/26/0、自然敵味方0/16、中央8ギャップ原作Face権限0、公式得点・Winner NONE・正式4v4/ART/公開はHOLD。架空床/ワープ/偽命中/スコア禁止。main・PR5・Pages・原本・正式QAを保護、研究branchだけexpected_sha非force CAS。追加課金原則0、本人操作原則0、Work/Windows/高負荷/PRIVATE等は既存の個別承認を維持。不要なHUD/Docs/新B番号/CIを増やさず、本体で使える一まとまりの改善と必要最小限の真正証拠まで進めてください。

**残余の限界**：V21を作っても原作Face/flags・本人Windows初発例外・今後のCI結果・最終ARTは証明されない。「完璧」は将来の保証ではなく、**不明・HOLD・誤認を残さない再開契約**として追求する。本書とSTART_HERE入口の保存は**ゲーム本体改善0件**として計上する。