# Browser Ink TPS / T21 / Undertow Spillway — V22 統合批判・K3以後の実行正本
**作成日:** 2026-11-09 JST。**この文書はユーザーの「全体方針・指示・反省点を批判的に評価して次チャットに移る」という今回の明示依頼に限る一度の引き継ぎ。** 新企画でもF1〜F5改定でもなく、**docs-only・ゲーム進歩0件**。明示依頼なしにV23や別引き継ぎ文書を増やさない。

## 0. 30秒で再開するための事実と優先順位
- Repo: https://github.com/ryomashibaba/browser-ink-tps 。**書き込み先は研究ブランチ** \`research/t21-integrated-a1-c-patrol-four-mode-20261105\` **だけ**。本書保存**前**のライブHEADは \`cf0560e656b499e976339ab64a8a5a8f682faeae\`。本書のdocs-only保存後HEADは当然異なる。開始ごとにライブSHA/差分/CIを取得し、古いSHAを最新として流用しない。
- 2026-11-09確認時、main \`fbd922cea900df8e1a139f21b3c61ed927b3fdd9\`、Draft PR #5 Open/Draft/unmerged（別HEAD \`8cfc95756ef0b56e2c33dc9f89a9041126daa272\`）。どちらも**変更禁止**。研究HEADはPR#5のHEADではない。
- 正本の読み順：本V22 → **V21** \`docs/continuity/BROWSER_INK_TPS_V21_INTEGRATED_CRITICAL_HANDOFF_20261109_JA.md\` → V20 → V19 → V18 → \`T21_FAST_TRACK_ROADMAP.md\` → \`docs/continuity/FAST_TRACK_EXECUTION_JA.md\` → \`docs/continuity/DECISIONS_JA.md\`。V17以前は必要箇所を参照。START_HERE下方の古い「現行」・古いSHA・0/12・旧QA書込先は**履歴**。不変な制約は常に厳しい方を優先。
- **原作SOURCE境界:** 25 registered Rapier solids、17 PaintSurfaces、26 one-way NavLinks、**公式Scoreable 0**。自然敵味方経路 **0/16**、中央8ギャップのVer.7.2.0通常Turf Collision Face/flags権限 **0**。\`activationReady=false\`、\`productionAuthorized=false\`、\`unrestricted4v4Certified=false\`、公式Winner **NONE**。正式4v4、自然敵戦HP命中/撃破/復活の統合、公式得点/勝敗、ART、Pages/productionは**HOLD**。
- **実績の更新:** K0/K1/K2はV21参照。**K3は後続の真正 #42540893238 で「同一ゲーム世界180秒＋再戦」の限定PASSに到達した。K3未実施とするV21のR2は履歴として更新する。** このPASSは当該SHAだけの範囲であり、新HEADのWindows/正式4v4を保証しない。
- **今やること:** これまでのテストの再実行・HUD/診断/文書追加ではなく、**本人Windowsの床欠落、CPU少数に見える、SAFE STOPの実原因**を原作権限別に切り分け、実害を減らす**1つのゲーム本体修正**。証拠不足なら物理改変せず、認証済みSOURCE内の独立した遊べる機能を選ぶ。
- **本人の操作原則0回、追加課金原則0円**。Chat＋接続GitHubを優先。Work/Computer Use/本人Windows/管理者/PRIVATE原本/高負荷実行/正式QA/公開は、既存の個別承認ゲートを消さない。このプロジェクトは他プロジェクトの権限を持たない。

## 1. 変えてはいけない完成基準
目標は『Splatoon 3』**Ver.7.2.0以降のマテガイ放水路（Undertow Spillway）・通常ナワバリ**の原作忠実なブラウザ3D TPS。**人間1＋本物のCPU7、自然な4v4、180秒**、原作連続床/経路、高低差、真のRapier KCC/Recast、射撃/12武器・サブ/Ink/イカOWN回復、HP/撃破/150tick復活、公式Scoreable塗装・点数・勝敗、再戦、良い操作/画面/音/FPS、本人通常試遊、明示的な最終承認を要する。
固定**F1** 8実Actor/再合流、**F2** 連続原作Rapier/Recast移動、**F3** 一つの試合内での人間＋CPU/交戦/180秒/再戦、**F4** Ver.7.2.0正規Collision Face/flags・中央通行・公式得点権限、**F5** 人間の実プレイ・ART/性能・公開受入。部分的研究モードのPASSはF4/F5を解除しない。
**厳禁:** 偽床・透明橋/坂・推測NavLink・見た目だけの床を衝突に昇格、半径/原作KCC安全基準の緩和、CPU/Actorワープ、偽インク/弾/敵HP/復活/時計/得点/勝敗。版違いのOBJ・光学用OBJに原作ゲーム衝突権限を与えない。PRIVATE抽出素材を外部GitHub/CIへ無断投入しない。

## 2. 最新の真正エビデンス台帳 — 範囲外に拡大しない
| 証拠 | SHA / Actions / RAW | 認める範囲／認めない範囲 |
| --- | --- | --- |
| K0 原作監査 | \`87086f8abcdb919dc077f23a257c4c8885bdd426\` / [#42487525658](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42487525658) / Artifact 13620431059 | B486/B487/B488の真正同期tick1785。自然経路0/16とF4 HOLDは継続。再実行不要 |
| K1 人間真正WASD＋坂 | \`8d3f6bb09f0f48b5b38d03d1189b2d585ff0eef1\` / [#42493927363](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42493927363) / Artifact 13622314840 | 登録済み原作坂の実KCC接地PASS。全域床/本人Windowsの見た目は未認定 |
| K2 CPU7全員同世界実塗装 | \`bce544734e408ca50e5eda2218f8b8ff65ef1b68\` / [#42523962398](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42523962398) / Artifact 13635030583 | 722native tick、7CPU計154発射要求・157着弾イベント・実着弾で6008セル変化。敵HP/自然遭遇・公式得点ではない |
| **K3 同一世界180秒と再戦** | **\`d3301380735fcd383b2acbfa29641e7e5f46e675\`** / [**#42540893238**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42540893238) / **Artifact 13641941991** | **\`PASS_LIMITED_K3_NATIVE_SINGLE_SOURCE_180S_AND_REAL_REPLAY\`**。原作Rapier坂、人間実射撃→実塗装→OWN SQUID回復→有料弾を消費した再射撃→実Fサブ1回→CPU7体実射撃・実着弾→真TIME_UP→ユーザー操作による再戦・新STAGING世界。CPU射撃要求966、着弾969、影響変更セル10215をRAWで確認。公式4v4、対敵HP、Scoreable、本人Windowsは未認定。**最初から足元OWNだったため「別OWNセルへ移動できる自動経路」の合格ではない** |
| K3後のビルド・通常HUD修正 | \`30db571e\` レーダー軽量化、\`c57b76b4\` 初発STOP JSON、\`56224446\` fail-closed修正、\`0f70037f\` ローカルGit版識別、\`5e174791\` 7CPU READY/A1軽量化 | いずれも研究修正と関連Unit/tsc/Vite中心。**K3の真180秒を後続HEADで再実証したことにはならない**。CIにPASSがあっても本人Windowsの改善FPSや初発STOP消失は証明されない |
| 直近の追加修正 | \`cf0560e656b499e976339ab64a8a5a8f682faeae\`、[#42554354891](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42554354891) | PLAYERレーダーでレンジ外の**実味方**を元Rapier足位置から境界方向矢印として示す修正。**軽量ビルドCI SUCCESS、真7CPU ChromiumジョブはSKIPPED**。自律経路追加・公式レーダー完成ではない |
| 先行A1協力の自動検証 | \`5e174791...\` / [#42553285310](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42553285310) | Genuine CDP A1協力局所Run SUCCESS。直近HEAD \`cf0560e6\` の真正再検証とは区別 |
| 本人Windows普通の試遊 | 本人2026-11-08報告 | 広い暗色/欠落床・すり抜け・CPUが1体ほどに見える・SAFE STOPで**HUMAN WINDOWS FAIL（未解決）**。当時のローカルコード内容、原作足support ID、初発例外・tickは**不明** |

**記録の扱い:** K3の7CPU計数は「射撃要求」「着弾」「塗装セル変化」という別計測量。敵命中/公式得点ではない。前回のRAW ZIPを再利用できる限り大規模な同型RUNを行わない。K3基準は最新HEADではなく \`d330138...\`、V21の「K3次に行う」は旧時点。最新 \`cf0560...\` はレーダー修正のみ、K3後もF4権限0のまま。

## 3. 批判的評価と反証（元の方針を守りつつ、やり方だけ刷新）
**正しかったので維持する:** 原作資料・版・SOURCE_AUTHORITYと表示を分離したこと、実Rapier/Recast/Ink/60Hz/7CPUを厳密に確認したこと、PASSのSHA/RAW保存、main/本番/PR保護、0円/少操作方針、仮の得点/床を拒否したこと。

**重大な失敗1 — 技術PASSが体験の代替になった。** CPU7/7・K3は大きな進歩だが「本人の床が欠ける/SAFE STOPする」は未解決。正しい優先順は**実ユーザーのプレイFAIL ＞ 自動練習PASS**。単にActionsを緑化し続けることを停止する。

**重大な失敗2 — 本体修正より周辺処理が増殖。** K3後にもSAFE STOPボタン、診断JSON、Git出所情報、HUD/レーダーの微細な表示・速度調整、各種型/テストを多数コミットした。個別には有益でも、実Windowsの原因を直接修復した証拠はない。**これ以上の診断追加とHUD整形は原則停止**。効果未実測の性能最適化を「FPS改善済み」と呼ばない。

**重大な失敗3 — 細かなpushが付随CIを起動。** 型未定義、テストのnull条件、\`firstPaint\`未捕捉、ownedセルの誤誘導、色変更で増えた形式チェックなどに再試行を費やした。軽量タグだけを想定しても、独立のA1協力CIが走った例がある。最新 \`cf0560\` にワークフロー条件修正はあるが、今後は**push前に全workflowのトリガーを照合**。大きい1機能→手元/静的点検→既存小Unit/tsc/Vite→必要時だけ真正1RUN。RUNを走らせるための空コミットは禁止。

**重大な失敗4 — 原作が足りない部分の境界説明が曖昧。** 元のSOURCE25/17/26/0は全域ではない。描画だけのOBJが見えることは通行可能性を意味しない。一方、登録済み坂が見えるだけで本人の広域床欠落が解決したとも言えない。**A=登録済みRapier床なのに表示不能、B=見える光学だけで当たりなし、C=双方未認証**に分け、Aの見た目だけ実修復、Bは歩けると誤解させない、Cは原作根拠まで保留。

**重大な失敗5 — CPU人数のラベルと実体を混同。** STAGING/段階的再合流、早期STOP、味方だけのレーダー表示、画面外の実味方、CPU生存/撃破を区別する。レーダーを修正してもCPU物理の治癒ではない。K2/K3で7体実射撃・塗装は認証済みなので、それを繰り返さず、本人の普通の試合での**最初に止まるtickと現実のCPU状態**を対象にする。

**反対意見の再検証:**
- 「K3がPASSだから普通の4v4はもうできた」→0/16敵自然経路とScoreable0、本人FAILゆえ**誤り**。
- 「最新ビルドがPASSだからWindowsの床やFPSも直った」→ブラウザ/PC/ローカル実行バージョンが異なるため**誤り**。
- 「同じ180秒をもう1回やれば安全」→実害に新しい判定価値を生まなければ**費用の無駄**。
- 「まだ原作面が足りないので中央を合成床でつなぐ」→版・Face権限がなく**禁止**。
- 「Windowsの証拠がないなら、いつまでもHUDと計測機能を増やそう」→むしろ停滞。**自動でできる修正を絞り、それ以上は本人一回のまとめた試遊証拠へ**。
- 「完璧になってから移行」→将来の成功を保証できない。**情報の誤認がなく、実行可能でHOLDが正しく残った引き継ぎ**がこの依頼の完了条件。

## 4. 次チャットの明確な実行順（回り道・不要CIを止める）
**P0 再開時（軽量、1回だけ）**：本V22全文→V21/固定F1〜F5と決定→最新研究HEAD/main/PR5/既存RUN/API。5e174/ cf056のCI・K3限定RAWを再利用。docs-only前後をゲーム進歩と数えない。**K0/K1/K2/K3の同条件再実行禁止**。直近HEADのコード変更内容と「ユーザーに何ができるようになったか」を1回で整理。

**P1 最優先 — 本人FAILの真の根因**：2026-11-08 Windows当時の例外名/foot ID/tick/実CPU状態は**わからない**。既存の \`PLAY_SOURCE_WINDOWS.cmd\`、最初のSAFE STOP JSONと足元・CPUの読取機能は**すでに実装済み**。余分なログ/ボタンは作らない。まずGitHub上で自動再現可能な同SHA原作床表示/衝突不一致・CPUライフサイクル/STATE遷移を既存コード/保存RAWで絞り込む。実害に因果があるバグが見つかればゲーム本体を一まとまりで修正する。証拠がないなら**物理改変せず、本人Windowsの個別承認が必要な1回の実試遊に備える**。本人へ聞く内容は「見えた床/CPU/Safe Stop」の3要点と、発生時は既存保存ボタンからJSON1ファイルのみ。過去の長いコマンド列・ZIP再提出要求を禁止。

**P2 原作の見える床と通行権限**：同一カメラ位置/同一SOURCE SHAで、視界の各範囲をA/B/Cに分類。元Rapier support IDとB250/B245/F3E/F3Gなど描画レイヤーを照合。許された登録済み頂点の表示欠落を実証した場合だけ、その見た目を直し短い本物PlayerController/Human KCCの受入証拠を1回。未認証面をopaqueにして歩けると思わせる改変はしない。原作F4の8ギャップは根拠0でHOLD。

**P3 CPU実体と「見える人数」**：7体の実CPU IDと生存状態、STAGING→段階合流→PLAYING→STOPの時系列、レーダーの味方/敵フィルタ・画面外方向表示を区別。K2/K3の全CPU実着弾は再利用。真に動いていない／早期停止する最初の原因だけ修正。人数を7と偽描画したり再合流速度/CPU物理を無承認変更しない。

**P4 実際に遊べる体験の統合受入**：K3の限定PASSは確定。新SHAの変更が物理/入力/プレイループに影響する本体修正となったときだけ、既存最小Unit/build→必要なら既存真正Chromium1回を選ぶ。**毎回180秒RUNしない**。真のユーザーのWindows画面では通常操作で床・CPU・SAFE STOP・実FPS/違和感を1回のまとめた試遊で確認し、具体的な原因修正に戻る。真正K3 PASS、HUMAN WINDOWS PASS、ART PASS、正式4v4を絶対に混同しない。

**P5 F4/公式試合は別ゲート**：Ver.7.2.0通常Turfの原本Collision Face/flags・8ギャップ/元Actor/Scoreableを正規に検証可能となった場合だけ、1箇所ごとSOURCE同定→真KCC/Rapier/Recast連続カプセル→本物の敵自然経路/HP/撃破/150tick復活→正式Scoreable/勝敗→実プレイ/ART審査。未取得ならF4はHOLD、合法SOURCE内の体験を進める。完成・main/PR5/Pages・正式QAは本人の**明示承認**までは禁止。

## 5. 今後の作業効率と安全なバッチ契約
- ユーザーの短い「次工程へ」は**新規計画やDocsを作れ**ではなく、**直前の証拠に基づく実ゲーム本体の一まとまり**を意味する。実コード→軽量確認→必要な真正証拠→研究CAS保存まで自走し、質問往復を極小化。
- **同じ目的のCI 0〜1本**。既存保存RAW/静的確認で答えが出ればCIは0。型/Unit/Viteビルド1系統にまとめ、重いChromiumは実ユーザー価値/新規リスクが大きく、既存承認ゲートを満たした場合のみ。同型FAIL2回で原因仮説を修正、3回目の同条件重負荷は禁止。特にpushで動く**全workflow**を事前照合。
- 研究更新は直前HEAD+単親commit、\`expected_sha\`、\`force:false\`で非force CAS。HEAD競合なら止めて差分再評価、force/rebase/mergeをしない。原本/PRIVATE/本人Windows/他ブランチ/main/PR5/T20/T19C/正式QA/Pages/既存固定ロードマップ保護。
- 証拠は「RUN成功/失敗」ではなく **当該SHAの真正RAWと、UI/CPU/物理・時間・Scoreableのスコープ**に結びつける。単体PASSとヒト試遊PASSは別。根拠が不足するときは「不明」/HOLD。従来の人間試遊FAILは新証拠が出るまで無効化しない。
- **同じ周辺機能を作り続けない**。Docs/HUD/ランナー/監査/タグの増殖は、今回のユーザー明示依頼以外原則停止。CI回数、テスト数、移動矢印、着弾塗装セル、資料は完成率に数えない。
- 報告は「今回ユーザーが使える改善 / SHA・検証 / HUMAN Windows と正式4v4の未解決 / 次に直す1件 / 操作・費用」を短く。大きなチャットを完走したふりをしない。本人へ必要なら**一度の短い試遊**だけ提案するが、WorkやWindows直接操作は個別許可前に行わない。
- 本チャットはTPS専用。MAB、DECEMBER_2026、Strata等への越境書込・権限拡大は禁止。TPSとMABはユーザー全体で同格最重要という方針を尊重する。

## 6. 次チャットに貼る文（必要な操作はこれ1回）
> Browser Ink TPS / T21 / Undertow Spillwayの既存開発を継続してください。新規企画・上位方針変更ではありません。GitHub \`ryomashibaba/browser-ink-tps\` の \`START_HERE.md\` 最上段から、**V22** \`docs/continuity/BROWSER_INK_TPS_V22_AFTER_K3_CRITICAL_COMPLETE_HANDOFF_20261109_JA.md\` を全文読み、V21以前・固定F1〜F5・Fast Track・永続決定を継承してください。2026-11-09本書保存前の研究HEADは \`cf0560e656b499e976339ab64a8a5a8f682faeae\` ですが、現行研究HEAD・main・Draft PR #5・最新CIは必ずライブ取得してください。真正 K3 [#42540893238](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42540893238) は \`d330138...\` で本当のSOURCE1世界180秒・CPU7体・人間射撃/OWN回復/再射撃/Fサブ/TIME_UP/明示再戦が**限定PASS**。直近 \`cf0560...\` のレーダー修正は軽量build [#42554354891](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42554354891) SUCCESSですが、本人Windowsの通常試遊FAIL（床欠落・CPU少数に見える・SAFE STOP）は未解決。K0〜K3の同条件重複RUNやHUD/診断/Docs増殖は禁止。今は**本当の通常プレイ障害の根因の特定→一まとまりのゲーム本体修正→必要最小限の検証**を優先。原作25/17/26/0、自然敵味方0/16、中央8ギャップ同版Face権限0、Scoreable0、Winner NONE、正式4v4/ART/公開HOLD。架空床/ワープ/偽敵HP/偽点数は禁止。main/PR5/Pages/正式QA/原本/PRIVATE/本人Windowsを保護、研究ブランチだけ\`expected_sha\`付き非force CAS。本人操作原則0回・追加課金0円、Work/Windows/高負荷/PRIVATE等は従来の個別承認制。実ゲームの進展を優先し、今回の成果をSHA・RUN・真正RAWごとに正直に報告してください。

**このV22本体はdocs-onlyでゲーム修復ではない。** 完璧な実ゲームを保証したものではなく、誤った認定・旧情報の混入・無駄な工程を避けるための新チャット再開契約である。
