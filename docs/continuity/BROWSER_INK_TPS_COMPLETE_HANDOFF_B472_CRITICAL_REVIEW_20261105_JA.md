# Browser Ink TPS — 全方針・全実績・全反省の批判的再評価と完全統合引き継ぎ正本
**評価日：2026年11月5日（JST）／B472完了後の新チャット入口**
**区分：既存プロジェクト継続・固定方針の撤回なし。修正対象は実行戦術・情報整理・CI効率。**

> **絶対条件**：本書のSHA・Actions状態は2026-11-05確認時点のスナップショットであり、永続的な現HEADではない。次チャットは最初にGitHubの研究HEAD・CI/Artifacts・PRを再照合する。最新事実で状態を更新しても、固定の安全制約は証拠も承認もなく緩めない。本書だけを読み、永続正本を無視して作業してはならない。

## 0. 再開するための最短経路 — 新チャットではここから

- **Repository**: https://github.com/ryomashibaba/browser-ink-tps
- **継続研究ブランチ**：`research/t21-b406-single-session-real-enemy-range-audit-20261103`（main/PR #5のheadとは異なる）。
- **引き継ぎ作成直前の研究HEAD**：`4fb3b0122ca0828d00793d3800bc246a806549dc`。B472ゲーム実装HEADは `88867be1e132f3a2a3345cbd64e485355776b049`。その後の2コミットはB472文書保存とMarkdown整形のみ。
- **恒久正本**：[START_HERE.md](../../START_HERE.md)、[固定F1〜F5](../../T21_FAST_TRACK_ROADMAP.md)、[Fast Track実行正本](FAST_TRACK_EXECUTION_JA.md)。これらを現在のHEADで読み直す。過去の完全統合引継ぎB467資料や多数のB系記録は歴史的証拠であり、古い「次工程」「未push」「CI待ち」を最新の命令にしない。
- **2026-11-05確認時点の保護先**：`main` HEAD `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、Draft PR #5はOpen/Draft/未merge。main・PR #5 head・T19C/T20・Pagesは今回変更していない。
- **まず確認する未完了**：[B413 #42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341) はB470統合の旧SHA `617f4158` に対する本物の2×180秒で、最終チェック時は実行中。最終STATUS・独立ログ・RAW Artifactを必ず読み、結果に応じて実装へ進む。別HEADのSUCCESSを流用しない。
- **再起動しない既完了**：B472 [B440 #42038865662](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865662)、[B441 #42038865792](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865792)、[B448 #42038865783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865783) は**同一ゲーム実装SHA `88867be1` で3系統SUCCESS**。当該CIが認証した範囲を再証明するためだけに長時間runを増やさない。
- **研究ブランチへの書込**：最新HEADを確認し、期待SHA指定・非force更新。途中で他チャットがpushしたら即HOLD、差分再取得・非競合マージ。main/PR/正式QA/公開を触らない。

## 1. 固定された目的 — 変更不可

『スプラトゥーン3』**Ver.7.2.0以降・マテガイ放水路（Undertow Spillway）通常ナワバリ**を忠実に再現し、PCブラウザ上で実際に面白く遊べる高品質の3D TPSに仕上げる。
人間1＋CPU7による自然な4v4／**180秒**／本当のWASD・マウス・Rapier KCC・Recast/Crowd、Squid・Human、既存12武器・サブ、本当の射撃・インク着弾・塗装・消費・OWN回復、HP・撃破・150native-tick復活、原作に根拠あるナワバリ得点・勝敗、再戦、視認性・音・ART・FPS・リリース審査を一体化する。

**F1→F5は固定**。F1＝原作支持の本物の4+4配置、F2＝8人の連続物理移動/降下/再合流、F3＝人が遊べる試合と自然CPU戦闘、F4＝原作Ver.7.2.0の全域接続・物理とNavMeshと得点権限、F5＝体験・ART・性能・最終審査と明示公開承認。
**QUALITY-FIRST／INTEGRATED VERTICAL SLICE／FAST TRACK**は変更しない。重要なのは毎バッチ「遊べる何が増えたか」であり、B番号・テスト数・文字数・コミット数は進捗ではない。

2026年12月の全体方針：**MinecraftAIBuilderとBrowser Ink TPSは完全同格の最重要2件**。Strataを将来的な自律コーディング主力へ育てるが、未完成時は安全HOLDを維持。Qwen14B直接経路はPRIVATE開発限定の暫定手段。追加課金原則0円、Chat＋GitHub優先、Work/Computer Useは事前個別承認。TPSにこの2件の優先順位を上書きする権限はない。

## 2. 改訂不可の安全・認証境界

| 対象 | 現在の厳格な境界 | 禁止される誤用 |
| --- | --- | --- |
| 研究SOURCE | **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable** | 元ソリッド、元NavLink、得点面を原作根拠なく増やす |
| 自然な敵対岸ルート | **0/12認証** | 同側B470のGoalやRecast到達を敵対岸経路PASSへ昇格 |
| 公式試合 | `officialWinner=NONE`、`activationReady=false`、production OFF | 非得点の原作SOURCE練習を正式4v4・勝者として宣言 |
| 物理 | 本物の60Hz Rapier KCC足、原作支持・連続経路・既存半径・元snap/安全閾値 | 半径0、架空床・橋・坂・透明足場・NavLink、Actorワープ、偽KCC |
| 戦闘 | 実CPU体／実ProjectileSystem／実PaintCoordinator／実HP・native状態のみ | 便宜的敵配置、偽命中、偽HP・撃破・復活、タイマー早送り、偽塗装 |
| 原本情報 | 非公開Windows/元OBJ/個人情報は外部へ無断アップロード不可 | GitHub/CI Artifactへの機密原作・非公開資料の混入 |
| 環境・公開 | main、T19C/T20、原本、正式QA、Draft PR #5、既存Pagesを保護 | 無断マージ/公開/production/正式ART採用 |
| 権限・費用 | GitHub研究ブランチへの既存承認範囲のみ・追加課金0円 | 過去の一時Work承認を今後の無制限許可とみなすこと |

研究で原作が不明な箇所は`UNKNOWN`または`SOURCE_AUTHORITY HOLD`とし、他機能の開発を止める理由にも、合格を偽る理由にもしない。工作物が「元OBJ由来」であっても、元ゲームの衝突属性・モード・ルール・版・全カプセル通行が認証されたわけではない。

## 3. 事実に基づく到達状況（認証レベルを混同しない）

### 3.1 SOURCE局所プレイの本物の成果

- **旧HEAD `11d03c70` の真正B413 [#42025456079](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42025456079) はSUCCESS**。本物の原作上段→下段→登録坂→上段、実人間射撃17発・インク支出16.15、実OWNイカ回復約13.88、再射撃14発・支出13.30、実7CPU、**本物の別PlayCanvas/Rapier世界へ再戦し2試合とも180秒TIME_UP**（B409/B412/B413/B419/B430/B433等の独立監査）。これを「旧SHAにおける非得点2×180秒」として永続保存。正式敵HP交戦やTurf勝敗の達成とは別。
- **B470同側CPU巡回**：A2/A3/B1/B3と既存B2/B4の原作床上巡回を、本物OwnerGridと厳格Recast/Rapier・120 native tickのGoal dwellに基づいて拡大。別の隔離RAWでは追加厳格承認6件・実別目標要求8件、A3/B3の実足変位あり。[B470記録](../qa/T21_F3_B470_REAL_SAMESIDE_NATIVE_COVERAGE_20261105_JA.md)。これらは同側の局所巡回／CPU行動であり、敵との遭遇・撃破・全身カプセル連続跨岸を証明しない。
- **B471→B472のプレイヤー機能**：4モード（12武器サーキット／通常戦闘／A1協力／任意CPU前線）で同じ既存12武器の開始前選択を共有。LOCAL設定は許可済み武器IDだけ保存、デフォルト時の旧URLは変更なし。B389はSOURCE起動パラメータの安全な完全一致のみ受理。
- B472同一ゲームSHA `88867be1` の **B440/B441/B448すべて真正Chromium SUCCESS**。実CDPでInk Saberを選び、実B384 PlayCanvas STAGINGと任意B441/B448前線モードの内部 `b361NativePlayerWeapon.id=ink-saber`、再メニュー4リンク保存、7CPUと実W歩行を確認。**通常戦闘/A1協力の個別真人間武器起動はまだURL+単体検査まで**。[B472記録](../qa/T21_F3_B472_FOUR_MODE_REAL_WEAPON_20261105_JA.md)。
- 実人間KCC/カメラ・実複数武器・実サブ投擲/爆発・元SOURCE塗装/Ink/HUD、A1本当の協力Ink、Source-only活動比較/再戦導線を過去の各限定SHAで達成。ユーザーWindowsでの`PLAY_SOURCE_WINDOWS.cmd`真正ダブルクリック成功および見た目/聴感の人間ART採用は**未認証**。

### 3.2 絶対に未完成として残すもの

1. **F3**：原作許可に基づいて敵が自然に接近→本物の敵HP減少→撃破→150 native tick復活→次の戦闘を**同一真正世界で**実証すること（現状認証なし）。既存の人間/CPU射撃・HPシステムがあることは敵との自然交戦を意味しない。
2. **F4**：右下段→中央アンダーパス±Z、FloorLine00を含む全区間の実ゲーム衝突・NavMeshと真カプセル/CPU安全通路。自然な敵対岸ルート0/12。
3. **公式ナワバリ**：原作得点面・塗装集計対象の正当な出典・実プレイ公式勝敗、ART正式受入、production・公開承認。いまScoreable=0／Winner NONE／正式4v4未認証。
4. **B470統合後の全長実2×180秒**：[B413 #42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341) は`617f4158`のrunで、作成時にはin_progress。**B472ゲームSHA `88867be1` とも別**。旧成功や短時間3CIを新HEADの長時間PASSに読み替えない。
5. **F5**：全画面の原作視覚忠実性、アニメーション、カメラと敵の視認、音、FPS/負荷、操作の楽しさを実画像と人間プレイで評価すること。現在の技術PASSは品質/ART採用を示さない。

## 4. 最重要SOURCE_AUTHORITYの事実と止まる場所

- [F4 Ver.7.2.0＋衝突権限記録](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)：独立SceneInfoの720レコードは`Vss_Temple01`が改修後マテガイ放水路のシーンIDであることを強く裏づける。ただしKiTrix OBJ `Vss_Temple01.obj` が**7.2.0通常ナワバリの同一モード・衝突データ**であることまで認証されていない。OBJ 43,263,289 bytes／SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046` を元本人版証明と混同しない。
- [B369真カプセル物理監査](../qa/T21_B369_NATIVE_FLOORLINE_CAPSULE_COLLISION_PROVENANCE.md)：原作FloorLine00元Face幅約0.311135mに対しCPU直径0.60m／人間直径0.64m。分離QA31-solidで案内付き人間KCCは2側成功したが、正式登録25-solidへの権限ではない。center ray欠損7/8フレーム中、同tick上方KCC colliderが見つかったのは4/7・5/8、残る**3+3 nativeフレームはsolver接触未証明**。元CPU半径のRecast完全経路はB240でFAIL。これを「FloorLine通行承認」と解釈禁止。
- 原作の版・モード・Collision Face/Actor証拠が取得できない限り、追加ジオメトリ・仮設NavLink・radius0・ワープで中央を閉じることは永久に禁止。この独立なsource authority障害は、他のF3/F5実プレイ品質改善を止めない。
- 必要なら原作**ソース由来の版一致・物理衝突フラグ・同一体全tick真KCC＋Recast安全幅**を調査するが、1バッチで新しい一次証拠が見つからなければ「証拠不足／F4局所HOLD」と明記し、追跡研究を隔離。**同じ3+3不明フレームの再測定を無制限に続けない**。

## 5. 批判的総合評価：守るものと直すもの

| 観点 | 評価 | 理由・訂正する運用 |
| --- | --- | --- |
| 原作忠実性と安全性 | **固定方針は良好／変更しない** | 未認証0 Scoreable・対岸0/12を偽昇格しない。元の固定データを守り、HOLDを欠陥扱いせず「根拠未取得」と区別 |
| ゲームとしての達成 | **限定的に実体あり／未完成** | 2×180秒・実武器/イカ/Ink/CPUは本物。しかし敵との実遭遇と正式ゲームループを依然欠き、完成を主張できない |
| 作業効率 | **明確に改善が必要** | 小さいB番号の増殖、同じSOURCE足監査の再実行、文書/ZIP大量化、CI多重起動、途中pushによる長時間キャンセル |
| 事実の品質 | **証拠は強いが伝達が複雑** | 短時間Chromium PASS、2×180秒旧SHA PASS、単体PASS、未認証のART/F4を時に横並び表示して誤解を招く |
| 計画の整合 | **F1→F5は正しいが実行順が散漫** | 小問題の単発修理を「次工程」とする運用が本物の自然戦闘/F4障害解決を圧迫 |
| ユーザー負担 | **ゼロ操作に近づける余地大** | 自動GitHub読込・実装・CI/RAW・報告・引継ぎ保存を一括化。ユーザーに繰り返し判断や大量スクショを求めない |
| 記録・引継ぎ | **重要な改善対象** | `START_HERE.md` 約7.8万文字、過去の「CI待ち・未push」が最新結果と共存。本書を「現在の真実」索引にし、古い段落は歴史的な状態スナップショットと明記 |

### 大きな失敗から得た永久的な教訓

1. **CIの型エラー1件で多系統FAIL・長時間ジョブキャンセル**：B467のfixture型誤りで5系統が壊れた。push前の1本の軽量TypeScript/Vitest、関連変更まとめpush、短時間真正Chrome、必要時だけ既存B413長時間。長時間run中は監視パス・concurrencyを確認し、不要なpushでキャンセルしない。
2. **実ゲーム失敗とテスト観測失敗を混同しない**：B322坂のサンプル欠落、B430のPLAYING観測前tick、B412のOWNインク100飽和、B463のregex誤り、B313のカメラpitch超過。まずRAW座標・本当の時刻・目的の原作床を調べる。安全閾値を緩めたり、ログ上だけ成功にしたりしない。
3. **Route request ≠ 実体の全経路移動 ≠ 自然敵対岸 ≠ 敵HP命中**：B467/B470は同側の実ゴールと実足を示したが、全tickの実CPUカプセル通行や敵遭遇は別証拠を要する。特にRecast endpointが届いたことをRapier衝突PASSへ昇格しない。
4. **UI DOM可視と人間のプレイ可能性は別**：1600×900のTIME_UPで統計が再戦ボタンを画面外へ押し出した。実スクリーンショットと本物のCDPクリックで操作性検証、F5では実際に使えるか優先。
5. **証明済み技術の小変更より未完成の大きなプレイ要件**：B472の武器選択はまとまった便利機能として価値があったが、さらに個別のボタンや小HUDの量産へ逃げない。次は**敵との真正一連戦闘またはF4 blockerを前進させる単位**にする。
6. **新チャットで旧スナップショットを「現在」扱いしない**：GitHub最新HEAD＋CI/RAW＋ドキュメントの参照優先順位を守り、`START_HERE`の多数の古い冒頭項目を新指示と混同しない。
7. **安全な対策でも求められた結果を代替しない**：AUTHORITY HOLDの維持を「完成度向上」と数えないし、診断スクリプト実装だけで「ゲームが遊べるようになった」と報告しない。

## 6. 批判的見直し後に採用する実行戦術（F1→F5の変更ではない）

### 6.1 二つの並行レーン、ただし同時に新CIを乱発しない
- **主レーン＝ゲーム本体F1/F2/F3/F5**：現状SOURCEを使って、人間の自然なプレイ／CPU同側巡回と塗装／本物の戦闘準備、読みやすいゲームUI、再戦の実体験を改善。変更後は「人が新たに何をできるか」の実証を求める。単なるREADONLY監査の追加で主成果としない。
- **証拠レーン＝F4原作衝突・経路AUTHORITY**：Ver7.2.0通常ナワバリのFace・collision flags・元CPU通路証拠が存在するかを短期で確かめ、なければその範囲だけHOLDして主レーンに戻る。原作非公開ファイルを無断で外部へ出さない。UNKNOWNはUNKNOWNのまま保持。
- **F5の見やすさは後回し専用ではない**：視界や操作が遊びに直結する不具合はF3バッチとまとめて修正。ただしゲームの視覚ART評価・ユーザー承認を真正QAで置換しない。

### 6.2 次の具体的な3バッチ（不正なショートカットなし）

**バッチ1 — 既存長時間結果と1つの統合ゲームの状態確定**
- 最新HEADと[B413 #42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341)の最終結論を同SHAで取り直す。PASSならRAWから2×180秒・B463最終表示・インク・時刻を確認し、成功を**そのSHAだけで**記録。FAILならpreflight/renderer/ゲーム本体/独立監査のどこで失敗したか分け、ゲームの根本原因だけを1バッチで修正する。
- 既存B472の4モード実武器入口とB470同側6CPUを保持。通常戦闘/A1協力の未証明の武器選択を必要に応じ**既存の短時間Chromium 1回へ同梱**して検証。新規同目的ワークフローは作らない。
- ここで元の2×180秒を毎回やり直す必要はない。ゲームコア（物理/clock/CPU/Ink/replay）を変更した場合に、必要な真正B413長時間を行う。

**バッチ2 — 自然なCPU敵遭遇を妨げる実際のF3/F4因果障害を1つ減らす**
- 同一世界の実CPU/player位置・元Recast/Rapier経路・射線・本物の交戦距離をRAWから調べ、まず「原作許可済み範囲で実際に前進できる候補」を絞る。本物のCPU半径と元StageSupport・各中間tick・OriginalFaceを保持する。いまの0/12を勝手に成功扱いしない。
- ソース不足で自然遭遇までの幾何が未認証なら、F4 blockerを`SOURCE_AUTHORITY HOLD`として固定し、同じ根拠のないRecast半径修理を繰り返さず、**独立に価値のあるF3機能（実武器/射撃/ゲームAIの原作床内実行と実塗装）を1件まとめて完成**させる。
- 合格宣言は少なくとも同じ真正ブラウザで元Actor位置・実連続物理・真正弾命中・HP変化・撃破・150tick復活という必要な事実が揃った部分だけ。途中Goal到達は目標ではない。

**バッチ3 — 実プレイ品質の大きな障害をまとめて減らす**
- B472の開始入口→READY→実人間操作→180秒TIME_UP→再戦のプレイヤー体験を**機能群単位で**整理。1600×900スクリーンショットと本当のボタンクリック、密集HUD・武器/敵視認・カメラを評価して一括改善する。
- Windows`PLAY_SOURCE_WINDOWS.cmd`はLinuxのCIでの存在だけではWindows実機PASSとしない。ユーザーへのWindows要求は、ブラウザCIで代替できない実機最終確認が必要になった**節目の一回のみ**。複雑な端末セットアップやログ/スクショ大量添付を避ける。
- 元のF4素材版とART/公開許可がないまま「正式完成」「公式Turf結果」「世界水準ART採用」と言わない。

### 6.3 完了判定と「ここで止める」条件
- 研究ゲームの非得点SOURCEスライス：人間の真实入力、CPU7、原作支持、実インク/射撃/回復/再戦、180秒・新世界のRAW＋真正Chrome。合格しているSHAの限定実績を保存、ただし別SHAに自動昇格なし。
- F3正式交戦：本物の敵への命中→HP減少→撃破→復活を同一WORLDで測定。原作越境や架空配置を使って達成しない。
- F4：版・衝突フラグと同一CPUカプセルの全tick連続通過、Recast/Crowd経路を元のステージに対して認証。元のQA31-solid局所実験を代用しない。
- 公式TurfとF5公開：元のScoreable/source証拠、元の実ゲーム入力・人間ART/性能審査、ユーザーの個別明示承認。未完ではHOLD。
- **同一根拠不足のF4実験を繰り返すのは1バッチで終了**。新一次資料・新実物理証拠・実ソース差分なしなら追加監査を保留し、F3/F5の本機能に移る。**新しい「小QAだけ」の工程を3回連続で出さない**。必要なら今の主ボトルネックを報告し次のプレイ実装へ進む。
- 合格率/FPS/人間面白さなど、ユーザーと未合意の数値合格閾値は作らない。実測値と重要障害を示して比較し、品質採用は本人判断が必要。

## 7. CI・並列GitHub・ユーザー負担の運用確定

1. 最初に**最新HEADを確認**、未完了CIが検査しているSHA/ファイルを確定する。並行チャットのHEAD変更を検知したら非forceで再取得し、変更差分を吸収する。
2. 1まとまった機能を実装し、同じバッチで**軽量TypeScript/Vitest**を先行。問題があれば同バッチで修正し、1回の研究pushへ集約。これまでの「型エラーのpush→5本FAIL→型修正push→長時間取消」を防ぐ。
3. 最終段階に既存B440/B441/B448の**必要な1〜2本**の真正Chromeを選ぶ。重複した同目的ワークフロー・同じRAWの再採取・B番号だけの新CIは原則禁止。毎回すべて3本を回す必要はない。
4. **B413 2×180秒はゲームコア/180秒/Ink/CPU/再戦の変更と、節目の統合検証に限定**。Workflowの`concurrency.cancel-in-progress`があるため、対象パスにpushすると前回長時間runがキャンセルされる恐れがある。必要なら先に結果を確保し、docsだけのpushは検査対象にならないことを確認。
5. 証拠は`commit SHA → workflow run → true browser log/JSON/PNG → 独立review → PASS/HOLD`の一対一で記録。CI緑でも真のゲーム動作を証明していない工程はPASS領域を書き過ぎない。出力に特定ユーザー個人情報や非公開SOURCEを含めない。
6. **報告は一括で簡潔に**：「新しく実際に遊べること」「HEAD」「CI / RAW」「残るHOLD」「本人操作0回か必要1回か」。巨大ZIP・同内容のレポート再作成・起動コマンドの繰り返しを避ける。
7. 研究ブランチで既存権限があるChat＋GitHubなら自律的に読み/編集/コミット/テスト/保存まで行う。Workの一時許可は再利用しない。Computer Use、Windows本体、元非公開ファイル、課金API・main公開/正式採用については**必ず新しい事前承認**。
8. 人間にしか確認できない実Windows起動/視認/遊びやすさが必要な場合も、先にGitHub側を実装・テストし、最小の「一度起動＋短いフィードバック」にまとめる。高校生ユーザーの操作を何度も要求しない。

## 8. 方針ドリフトを防ぐ毎回の6点チェック
- F1→F5／原作Ver.7.2.0通常ナワバリ／QUALITY-FIRSTは不変か？
- 25/17/26/0、自然対岸0/12、公式Winner NONE、production OFFと保護対象を守っているか？
- 今のコード変更が**実際の遊びのどこを改善したか**一言で示せるか？
- 今回のPASSは本当に**同じSHA・本物の世界・同じActor・独立監査**で確認されたか？
- 本当に必要なCIだけ動かし、長時間runを途中で無駄にキャンセルしていないか？
- ユーザー操作を要求する前にChat＋GitHubで実行可能な作業を全部済ませたか？

## 9. 必ず参照する保存済み正本・証拠
- [固定F1〜F5](../../T21_FAST_TRACK_ROADMAP.md) ／ [Fast Track実行正本](FAST_TRACK_EXECUTION_JA.md) ／ [詳細な歴史的START_HERE](../../START_HERE.md)
- [B472四モード実装・結果](../qa/T21_F3_B472_FOUR_MODE_REAL_WEAPON_20261105_JA.md) ／ [B470同側CPU巡回](../qa/T21_F3_B470_REAL_SAMESIDE_NATIVE_COVERAGE_20261105_JA.md)
- [F4版・原作衝突属性](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md) ／ [B369 FloorLine00真カプセル](../qa/T21_B369_NATIVE_FLOORLINE_CAPSULE_COLLISION_PROVENANCE.md)
- [B463再戦・終了HUD](../qa/T21_F3_B463_REAL_SOURCE_REPLAY_HISTORY_20261105_JA.md)
- [B472 B440](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865662) ／ [B441](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865792) ／ [B448](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865783)
- [旧SHA 2×180秒正式独立SOURCE非得点試験](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42025456079) ／ [B470統合B413結果を必ず再確認](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341)
- B467以前の全過去指示・旧B番号や教訓はユーザーの既存「Browser Ink TPS 完全統合引き継ぎ正本」および既存QA docsに保存。**本書はこれらを削除/撤回せず、現状解釈と実行優先順位だけを最新化する。**

## 10. 次チャットへ貼る開始指示（これだけでよい）

> Browser Ink TPSの既存開発を継続してください。GitHub `ryomashibaba/browser-ink-tps` の研究ブランチ `research/t21-b406-single-session-real-enemy-range-audit-20261103` にある `docs/continuity/BROWSER_INK_TPS_COMPLETE_HANDOFF_B472_CRITICAL_REVIEW_20261105_JA.md` を全文読み、`START_HERE.md`、`T21_FAST_TRACK_ROADMAP.md`、`docs/continuity/FAST_TRACK_EXECUTION_JA.md`、最新HEAD/CI/Artifacts/PR #5を照合してください。新規企画や方針変更ではありません。固定F1〜F5・原作SOURCE 25/17/26/0・自然対岸0/12・正式4v4/ART/production HOLD・main/原本/T19C/T20/Pages/PR保護を継承し、前回B472真正3CI PASSとB470を保存してください。まず未確認のB413 #42034952341をRAWまで確認し、その後は小さなQAや資料作成で止まらず、F3自然戦闘または原作SOURCEに許された実プレイの大きい機能を1バッチで実装→軽量検査→必要な真正Chromium→独立検証→研究GitHub保存まで進めてください。古いSHAのPASSを最新と混同せず、F4の証拠不足を推測床/NavLink/ワープ/偽得点で埋めない。ユーザー操作最小、追加課金原則0円、Chat＋GitHub優先、Work/Computer Useは再度事前承認。既存の実装を作り直さず、成果とHOLDを簡潔に日本語で報告してください。

**本書は「計画だけを増やす」ための新企画ではない。次チャットは既存の研究ブランチから実際のゲーム実装を再開すること。**
