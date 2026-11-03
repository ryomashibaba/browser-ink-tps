# Browser Ink TPS — 完全統合引き継ぎ正本（2026-11-03 JST）

> **この文書は新チャット移行用の時点記録。恒久入口は [START_HERE_JA.md](START_HERE_JA.md)、固定方針は [DECISIONS_JA.md](DECISIONS_JA.md)。作業開始時は必ずGitHubの実HEADとCIを再取得する。過去のSHAやQueuedを現在のPASSとして扱わない。**

## 1. 正本・継続手順・保護契約

- Repo: https://github.com/ryomashibaba/browser-ink-tps
- 開発するのは dev/t21-f4e103w-qa-infra のみ。2026-11-03本書作成時点のゲーム＋試験HEADは **d4db272226a6b60dd4bde4cf3956c63b4659b886**。文書だけの後続コミットでbranch SHAが進む場合でも、ゲームコード・CI対象SHAは区別する。
- Draft PR #5は **open / draft / unmerged** をGitHub APIで確認。main、T19C/T20、公開Pages、本番稼働サイト、PR #5のmerge・改変、Windows原本、原作の非公開OBJ/Face/Actor/画像/動画/抽出資料の第三者アップロードを無断で行わない。
- ソースは [CURRENT_CANONICAL.md](../../CURRENT_CANONICAL.md)、[T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md)、[FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md)、[CI_TRIGGER_MATRIX_JA.md](CI_TRIGGER_MATRIX_JA.md)、[現在地](CURRENT_SESSION_JA.md)。前チャットの返信より実GitHubコード・同一SHAのActionsを優先。meta/t21-continuityのLIVE_STATEは索引でありゲーム完了認証ではない。
- Chat + GitHub中心。Workは明確な利益とユーザーの**事前承認**がある場合のみ。Windows操作・ZIP再送・大量のコピペを求めず、可能な限りChat内のGitHub操作でコード実装・試験・保存・結果確認まで行う。

## 2. 決定済みの最終ゴール・優先順位

- Nintendo『スプラトゥーン3』**Ver.7.2.0以降のマテガイ放水路（Undertow Spillway）通常ナワバリ**を、PlayCanvas 2 / WebGL2のブラウザ3D TPSとしてできるだけ忠実に再現。トリカラ/Big Run/旧版マップを混ぜない。
- **人間1＋自然なCPU7の4対4・180秒**：正しいステージ、移動、武器/サブ、弾道/実塗装、インク資源、HP/ダメージ、撃破、規定の150native tick復活、陣地得点、勝敗、試合終了・再戦、キャラクター/地形ART、操作と性能まで統合した実際に遊べるゲームが最終成果。
- 固定計画は **F1（実8Actor配置）→F2（Rapier/Recast原作移動）→F3（実戦/戦闘/塗装/180秒）→F4（元ステージの接続・Scoreable/公式勝敗）→F5（ART・操作・性能/最終承認）**。局所HOLD中も独立した実ゲーム機能を進め、基本方針を再決定しない。
- **原作忠実度と実プレイ品質を、コミット数・B番号・テスト数・QAログ増殖より優先**。実ゲームの機能単位でまとめて実装し、既存軽量Unit＋必要最小の真正Chromium統合で検証する。失敗の隠蔽や合格条件の便宜的変更は禁止。

## 3. 不変のSOURCE認証境界

- 原作Rapier solids **25** / 元PaintSurfaces **17** / NavLinks **26** / 正式Scoreable **0**。自然な敵陣・対岸経路認証 **0/12**。大規模な中央アンダーパスのRecast残距離は両側約 **31.716m / 31.785m**（過去の同条件実測）。
- activationReady=false、productionAuthorized=false、unrestricted4v4Certified=false、officialWinner=NONE、公式Turf Score UNAVAILABLE。研究用のA/B所有セル、塗装変更セル、独自SOURCE統計は**正式な陣地得点・勝者ではない**。
- 原作で未確認の床/橋/坂/透明救済足場/水位/衝突/ナビリンク/スコア面/Actorを創作しない。Actorワープ・出現強制・物理衝突無視・CPU半径0・偽HP/撃破・QAでのTick/時計注入・偽弾/塗装・閾値の恣意的緩和は禁止。
- 元43MB KiTrix Vss_Temple01 OBJとFloorLine00の一部Faceは研究済み。Leannyの7.2.0版SceneInfoはVss_Temple01が改修後マテガイ放水路を支持する一方、KiTrix OBJそのものの抽出版・ナワバリ固有地形・元ゲーム内collision属性は未認証。FloorLine00に約0.311mの幅という測定とCPUカプセル直径約0.60mの課題があり、QA31-solidでの歩行を元25-solidの正式通路認証に格上げしない。
- HUMAN実KCCのRapier bodyと8人目の非物理Recast HUMAN代理は異なる。代理の投影/ワープに類する現象を人間本体の瞬間移動と誤認しない。元のRecast→Rapier降下・手動CDP入力・原作支持面ごとに証拠を分ける。

## 4. 実際に成功が確認された範囲（限定PASS）

- **真正Chromium 180秒SOURCE試合**：B390 [#41558592850](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41558592850) SUCCESS。真の180秒TIME_UPと同武器での新SOURCE世界リプレイ、CPU物理再合流7/7、人間実射撃94発/元SOURCE塗装変更375セル、CPU実射撃1,029発/元SOURCE塗装変更14,080セル。これは当該SHAでの限定実走行。**実敵へのHP命中・撃破・150tick復活は0件、原作公式勝敗なし**。
- **A1本物の協力プレイ**：B162 [#41561600617](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41561600617) SUCCESS（旧pause→arm→resume方式）。2回実クリア：人間実変更808/810セル、元床移動36.28/36.92m、本物のA1新規塗装41/30セル、実A1命中インクイベントを含む。2つの独立した原作SOURCE世界、B330本物の一時停止/再開とB200のカード・画面・Rキー再戦も実証。**新READY予約方式のクリアを認証した結果ではない**。
- **PLAYER導線**：B287 [#41558592913](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41558592913) の真正Chrome部分で、人間の実クリックによる新しい実A1のSOURCE世界（native tick0、CPU7、25/17/26/0）の起動を確認。SOURCE通常B207/B384からのA1切替を実装済み。PLAYERレーダーは未発見Bチームの正確な実位置を隠し、F8 QAには真正Actor足元を残す。
- F1/F2の局所原作床、first-drop、KCC実キー・実弾/インク技術検査に過去限定PASSが存在。特定区間での実歩行や射撃が成立しても、中央/対岸の通行、原作キャラART、正式4v4勝敗を認証したことにはならない。

## 5. 直近の変更の正確な区別（最重要）

- ゲーム／QAブランチの**前回コードHEAD d4db272226a6b60dd4bde4cf3956c63b4659b886**：A1専用の真正READY tick0でミッションALLY_SYNCをARMED予約し、人間が実START 180sを押して、原作CPU7/7物理再合流＋PLAYINGになってから本物のB25 60秒計測開始。B162真正テストは第1試合をこの新経路に、第2試合を従来B205/B330 pause→resume→CLEARにした。
- [**新READY経路B162 #41564182033**](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41564182033) は **Queued・結論なし**（2026-11-03最終照合時）。READY→本物の7/7→RUNNING→CLEARの連結は未認証。B75 #41561600526もQueued、旧SHA B390 #41561600753 とB341 #41561600659は最終照合時in_progress。各Runの現在statusは新チャットで再取得すること。
- [**未統合コミット900d5001**](https://github.com/ryomashibaba/browser-ink-tps/commit/900d5001bdc86109d65bd443d3b3a1d3c015ec50)：d4dbを親とし、B162の実再合流0～7・Clock前進禁止/原作Actor ID偽装拒否・最初のRUNNINGをB162専用純関数とNodeテストに分離。実Node/Chrome CI未認証。チャット内V8ロジック4/4 PASSのみ。
- [**未統合コミットabeef165**](https://github.com/ryomashibaba/browser-ink-tps/commit/abeef1658ccbadc398cdfa1cec8199b3ad2ed9db)：900dを親として、同一実SOURCE世界のnative Tick逆行とRUNNING後の経過Tick減少をFAILにする回帰監査を追加。チャット内V8ロジック6/6 PASS、Node/Chrome CI未認証。**900d/abeefをQAブランチのコードに適用したと誤記しない**。
- 今回の引き継ぎは文書のみ更新。文書コミットでQA HEADが進む場合、900d→abeefは旧d4dbからの別のコミット系列になる。統合時にはGitHub上の現HEADを親に両候補の差分/ファイル内容を安全に移植し、expected SHAを確認して非強制更新すること。**強制pushやmainの変更禁止**。CIがまだQueuedなら実行状況と重複起動を確認し、今すぐコードPushする必要はない。

## 6. 未解決（偽装せずHOLD）

- F3の最大課題：元ステージ上で本当に自然に敵4CPUと遭遇し、実弾が本当の敵HPを減らし、撃破→復帰150native tick→原作上段からの再降下まで一連の実験を成立させること。現時点では自然HP命中/撃破/復活は0であり、本物の4v4試合の完成ではない。
- F4の最大課題：中央下段～敵陣の真正ゲーム版の面と衝突/カプセル/幅/障害物・Recast連結を出典付きで証明し、0/12を改善すること。元の勝敗/得点面を決める権限なし。新しい偽通路で解決しない。
- B337 [#41558592950](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41558592950) は実WASD/照準yaw4.4°後、リアル射撃判定が120秒壁時計期限でFAIL。入力/性能/GPU/物理のどこが主因か未確定。過去9発/93セル成功と条件を照合するが、推測で合格ゲートを下げない。
- B75 FIXEDが旧SHAで真の再合流5/7のまま270秒TIMEOUTになった例がある。一方、別SHAではFIXEDを含め7/7 PASS。単発のFAILを根拠に人間の追加KeySやCPU強制移動を恒久化せず、実Actor足元・lifeState・最後の移動Tickから原因を切り分ける。
- SOURCEの見た目・HUD/カメラ/インクセル表示は改善中だが、原作美術を承認したわけではない。ART・公式Scoreable・本番公開はいずれもHOLD。

## 7. 開発運用・過去の失敗からの固定教訓

- **実ゲーム前進を優先**：B番号や純粋な監査モジュールを毎ターン増やすだけでは完成しない。必要十分な診断をまとめ、真の人間＋CPUの遊べる試合、戦闘、移動、視認性へ開発時間を集中する。
- **CIを増殖させない**：共有App/runnerを少し変えると多数の真正ChromiumがQueuedになり、次のPushでcancel/遅延する。既存B75、B162、B390等の適切な統合ゲートを再利用。軽量Unit→まとまった実ブラウザ1系統が基本。同じSHAで実測を待ち、旧成功の適用範囲と最新コードの未認証を区別する。2026-11-03のQueued遅延原因は不明と記録する。
- **FAILはそのままFAIL**：型チェック成功、preflight SUCCESS、ソース上の正しい条件、CIスケジュール登録、RUNNING表示だけで真正Chrome完走や実HP戦闘PASSと書かない。物理実測・actor固有lifeState・SOURCEセルイベント・別SHAはそれぞれ独立証拠として扱う。
- **過去の原因混同**：非物理HUMAN代理のRecast跳躍を人間KCCワープと混同しない。Footレイと全身カプセルの連続支持を混同しない。CPUの射線遮蔽と歩行連結を混同しない。暫定版のKiTrixの表示名を原作Ver.7.2.0/ゲーム衝突権限と混同しない。
- **不確実ならUNKNOWN**：CPU実HP命中の証拠がなければ0/未確認、原作衝突属性の証拠がなければHOLD。禁止項目を実装して研究成果を水増ししない。QA artifact/Node検査/real Chrome/180秒/本番承認を区別する。
- **Chat主体で実作業**：ユーザーの「次の工程へ」には計画だけで終えず可能な範囲で実装・テスト・GitHub保存・CI確認まで行う。作業やWindows操作をユーザーへ戻さない。Workは無断使用しない。途中の巨大ログやZIPをチャットへ貼らず、GitHubへのリンクと短い証拠を示す。

## 8. 新チャットでの実行順（合意済み計画を変えない）

1. この文書の恒久入口START_HERE・DECISIONS・CURRENT_CANONICAL・FAST_TRACKを読んで、qa branchの現HEAD/PR#5/最新のActionsを**再取得**。旧d4dbや本書文書コミットを新ゲームHEADだと勘違いしない。
2. **最優先**：B162 #41564182033の真正Chrome/Node/実ログを確認。READYで実ARM tick0→実7/7 PLAYING→RUNNING→本物の人間＋A1塗装/原作床移動CLEARの連結を検証。FAILならその根因に絞って修正する。既存旧方式の2/2 PASSを新方式認証に流用しない。
3. 同時にB75 #41561600526、B390 #41561600753、B341 #41561600659の最終CIを確認し、同SHA範囲だけ採用。Queued/Runningの間に無駄な再Pushを重ねない。
4. READY経路が確定したら、未統合900d→abeefのB162専用診断が必要かを判断。必要ならゲームHEADを親に**安全に移植して1回の必要最小QA**へ統合し、不要なモジュール増殖はしない。
5. **その次に本来の最優先F2/F3へ戻る**：原作に支持された人間＋CPUの自然な敵遭遇・本当のHP命中・撃破→150tick復活を実ゲーム機能単位で改善。F4の原作衝突・中央接続は真正ソース取得まで局所HOLD、独立F3/F5作業は前進する。
6. まとまった成果ごとにCURRENT_SESSIONだけ短く更新。報告は「新HEAD・機能成果・同SHA CI URL・実測・限定PASS・未認証HOLD・次の遊べる機能」。毎回全履歴や長文を再生成しない。

## 9. 新チャットの1行プロンプト

> Browser Ink TPSをGitHubの固定入口 https://github.com/ryomashibaba/browser-ink-tps/blob/dev/t21-f4e103w-qa-infra/docs/continuity/START_HERE_JA.md から完全に引き継いでください。CURRENT_SESSIONとHANDOFF_20261103_COMPLETE_JA、DECISIONS、F1～F5の固定計画、最新GitHub HEAD/CIと未統合候補900d→abeefを照合し、原作忠実度・main/PR#5/Pages保護・Work事前承認制を守って、次の実装工程へ進めてください。

**本資料は過去を固定するための引き継ぎであり、最新CIの完了や新ゲーム機能のPASSを意味しない。**