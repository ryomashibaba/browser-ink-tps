# Browser Ink TPS — 完全統合・批判的再評価・新チャット継承正本（2026-11-07）

**現行スコープ：Browser Ink TPS / T21。前のF1〜F5・Fast Track・原作保護を変更しない。**  
**確定基準：2026-11-07 JST。ゲーム実証SHA：bca40f70204a1cdc8894d18a7419c2dc10303bf6。**  
**本書を追加する文書コミットHEADと、実際にゲームのChromium検証が完了したSHAは区別する。**  
**この文書はGitHub・過去の正本・真正RAWの照合による現時点の監査であり、未来を含めた絶対的な無謬・全チャットの逐語的網羅を主張しない。**

## 0. 最初の30秒で読む運用契約

1. 正本はリポジトリ https://github.com/ryomashibaba/browser-ink-tps 。現在の継続研究ブランチは **research/t21-integrated-a1-c-patrol-four-mode-20261105**。変更前に必ず実HEADを取得し、対象ブランチを確認。別研究ブランチ、古いdevの記載を採用しない。
2. 優先順位：**正式な固定仕様** [T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md) → [FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md) → **現時点の統合状況**（本書）→ [2026-11-06の前正本](BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261106_LATEST_JA.md) → 個別実証RAW/コード。他の古い START_HERE 記載は歴史的スナップショットと扱う。
3. 目標はVer.7.2.0以降の『スプラトゥーン3』マテガイ放水路の**通常ナワバリ**に忠実な高品質ブラウザ3D TPS。人間1＋CPU7、真正の自然な4v4、180秒、原作KCC/移動・射撃・実インク・HP/撃破/復活・得点/勝者/再戦。Big Run・トリカラ・別版・新規企画には切り替えない。
4. 最重要物理境界は **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。歴史的原作12組経路の承認0/12、最新B487の生存Human＋CPU敵味方16組のネイティブ経路承認**0/16**。母数・定義は違い、矛盾ではない。公式Winner NONE、activationReady=false、productionAuthorized=false、unrestricted4v4Certified=false。正式4v4／Scoreable／勝者／ART正式採用／公開はHOLD。
5. **厳禁**：未認証の架空床・透明橋・追加坂・NavLink・通行抜け道、原作CPU半径の無断縮小、ワープや偽CPU/敵、偽Projectile/命中/HP/インク/時間/得点、画面OBJ＝物理コリジョン認証という誤用。単体fixture成功をゲーム原作合格と呼ばない。
6. 保護：main、T19C/T20、正式QAブランチ、既存Pages/本番、非公開原作・Windows原本、Draft PR #5、他研究ブランチ。無断merge/rebase/force push禁止。研究ブランチでは直前HEADを確認して非force更新する。PR #5は当時と同じ Open/Draft/未merge。
7. 運用：**Chat＋接続GitHub優先、追加課金原則0円、Work/Computer Useは毎回事前個別承認、ユーザーのPC手順は原則0回**。MinecraftAIBuilderとは長期的な最重要優先度が同格。Strataや「12月対策」の目的とこの作品の工程を混同しない。
8. 普通の「続けて／次の工程」はこのT21の**実装＋軽量検証＋必要な既存の真正Chromium＋RAW確認＋研究ブランチへの保存**を意味する。作業時間を要しても「あとで実行する」と約束しない。使えるツールでそのターンに進め、未完了は未完了と報告する。

## 1. 現時点の唯一の状態台帳（2026-11-07朝 JST）

| 項目 | 確認済み事実 | 明確な限界 |
| --- | --- | --- |
| ゲーム実証済み研究SHA | **bca40f70204a1cdc8894d18a7419c2dc10303bf6** | 本書の文書コミットSHAとは別 |
| 真正B441 GitHub Actions | [#42296521946](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42296521946) **completed / SUCCESS**。Artifact **13542970884** | 「短時間SOURCE・人間と本物7 CPUの基線」だけ。180秒・正式4v4ではない |
| 直前実装の実証 | [#42295249217](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42295249217) SUCCESS、Artifact 13541482871 | 旧SHA a6b281b5 の結果 |
| main | **fbd922cea900df8e1a139f21b3c61ed927b3fdd9** | 変更しない |
| PR #5 | Open / Draft / unmerged、head 8cfc95756ef0b56e2c33dc9f89a9041126daa272 | 自動merge/公開禁止 |
| 原作SOURCE | **25 / 17 / 26 / 0** | 完成した7.2.0競技面とは主張できない |
| B487真正原作敵味方経路 | ネイティブ経路問い合わせ **16、報告経路0、信用できる終点0** | 実自然対敵遭遇・全身渡河 0/16 |
| B488ギャップ判定 | 旧局所未解決ギャップ8（各側4）。現0/16 | 7.2.0本物の衝突Face/衝突フラグ、0.30m CPU連続カプセル支持未認証 |
| B486本物の敵距離 | 729 native-tick 行。人間―最寄敵 **104.586169m**、味方―敵 **78.673825m**、3m以内サンプル0 | 原作の自然な敵HPダメージ未確認。距離はこのRUNの値 |
| B441人間の実操作 | CDPの真正ポインタロックで実武器射撃 **6発**、実7 CPU・同側物理巡回。CPU native原作Goal要求 **172**、観測した固有Goal到着 **5** | Goal要求172は172回の異なる移動／射撃／交戦ではない。敵へのHP命中0 |
| B356実画面通知 | 同一RUNでPLAYER DOMの enabled=true、実native tick **1143**に **ACTUAL_SHOT_ONLY** 表示、実射撃6。原作人間変更塗装イベント1・最新変更90セルもRAWに記録 | この特定の画面観測は「発射のみ」。**REAL_PAINT表示自体の観測PASSや敵HP命中PASSではない** |
| A1 C-key動作 | 真Cキー2回、原作候補Goal承認2、B484真native 642行、要求19 | 自然敵接触、指示が全移動を引き起こしたとの完全因果、原作中央横断は未認証 |
| 現HEADのフル180秒 | **未再認証** | 旧SHAの180秒成功を現SHAの完成に合成しない |
| F5実プレイヤー視界 | B245/B480 PLAYER HUD縮小、F8復元とB356通知機能が実装。B441短時間ビルド・実Chrome成功 | 1600×900視覚品質、実人間による楽しさ・ART正式承認は未合格 |

B441の実測は [真正短時間RAW](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42296521946) の **b440-short-real-original-human-foot.json / b486-original-human-7cpu-enemy-distance-60hz.json / b487-real-original-16-cross-team-route-audit.json / b488-real-original-f4-gap-authority-hold.json** に基づく。経路0/16、SOURCE 25/17/26/0、公式Winner NONEを維持。Artifactは有効期限があるので必要なら再ダウンロードする。旧成功は消さず、現SHAへ転記しない。

### 真正180秒について、どこまで歴史的にできているか

- 以前の別SHAでは **実180秒TIME_UP、本物の7CPU、人間の原作移動／射撃／塗装、次の新世界リプレイ**が成立した。先行参考：B210 [#41272467681](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41272467681)、B390 [#41271399268](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41271399268)（真正各180秒）。古いB413等の失敗と修正の詳細は旧文書を参照。
- 既存「12武器選択／4 SOURCEモード／本物CキーA1支援／同側CPU巡回／練習CLEAR」の実証も**対象SHAごと**に存在するが、現HEADの全モード×全武器×フル180秒完走を保証しない。
- 真のHP・SPLAT・150tick復活のコード・局所機能の存在と、**両陣営が自然に出会い、同一プレイで被弾→撃破→150tick復活**したことは全く別の合格条件である。

## 2. 変えてはいけない全体計画 F1〜F5 と作業の依存関係

**F1: 正真正銘の8人起点。** 同一SOURCE上の人間＋7 CPUを原作の支持面に置き、重なり・チート配置なしで真の身体と入力を成立させる。旧真Chromiumで限定実証。全マップ正常初期化は未認証。

**F2: 原作の全身体物理。** PlayCanvas / Rapier KCC / Recast Crowd / 原作衝突を用いた連続移動、実下段初降下・坂・全域。左右同側は限定成功。敵陣への中央接続は0/16。

**F3: 本当の対戦ループ。** 人間操作、元の12武器とサブ、弾・塗装/ownerGrid、インク残量とOWN回復、HP/撃破/復活、自然CPU戦闘、180秒・再戦。旧SHAの局所ループと180秒は成功。全要素を同じ新SHAの正式4v4で通した証拠はない。

**F4: Ver.7.2.0通常ナワバリ全マップ原作根拠。** 版・ルール、Face、collision flags、Rapierと半径0.30m CPU完全カプセル、Recast全ルート、正規Scoreable/得点境界を順番に認証。これが自然対敵戦闘と公式勝敗の厳格な依存条件。正規原本不足につきHOLD。

**F5: 真に遊びやすく美しい完成品。** 画面視界、入力、視認、武器/インク反応、音、性能、ART/実試遊。PLAYERとF8 QAを分離する変更あり。本人による最終ART・公開・著作物の使用許諾も別途審査。

**重要な論理：** F1/F2/F3/F4/F5は上位ロードマップ上の同一5段階を維持する。一方F4原本の未入手で**許可済みSOURCE内のF3/F5を全停止させない**。並行するのは工程順序の撤回ではなく独立した作業の切り分けである。正式対敵戦闘とスコアだけはF4認証前に昇格しない。

## 3. 批判的再評価：何が悪かったのか（再発防止の契約）

1. **指標の目的化。** B番号、CI workflow、test件数、Goal要求数、commit数の増加を完成度と錯覚。現在の原作自然敵経路0/16こそ根本指標。次回の必須問いは「プレイヤーが本当に新しく何をできるか」。1つも答えられないなら、ゲームの実装優先度として見送り。
2. **小刻みなHUD／退避AI／テスト／文書ループ。** 実際にB245/B356/F4 Phive補助検査などを短いコミットで何度も追加し、実ブラウザCIを何回も起動した。本当に遊べる局所差分はあるが、最大障害は不変。**修復必要な不具合が判明するまで、UIマイクロ改善と同一A1 C指示の追認を凍結**。
3. **真正CI成功の言い過ぎ。** 短時間native B441のPASSは実操作の証拠であり、真180秒・敵へのHP命中・正式結果には絶対に転用しない。B356 DOMの ACTUAL_SHOT_ONLY 成功を REAL_PAINT 表示成功へ昇格しない。**VERIFIED / PARTIAL / HOLD / UNKNOWN + SHA + RAW + RUN**の4点を一体に記録。
4. **既存CIの肥大化。** 現研究ツリーに **122個のGitHub Actions workflow YAML** が存在（有効化されている数とは別）。さらにCI実行中の小pushがconcurrencyでキャンセルを発生させる可能性。**新規CIワークフローを原則作らず、既存の最適な1系統へ一度だけ統合**。push前に軽量型・テスト確認を優先。
5. **同じ失敗の再試験。** B200のChrome Rキー入力が真DOMで検出0なのに高コスト同条件で試す、B75/B287やB440の先行失敗を同じ条件で繰り返す。操作配送が新しい根拠で変わらない限りRキー経路はHOLD。**実際にクリック可能な再戦ボタン**を正式な試合ループの試験対象にする。
6. **原作権限の推測。** FloorLine00の表示OBJやB239別QA31-solidでのKCC、4点の内側サンプル、合成Phive fixture 8件PASSは、7.2.0 Turfで本物のプレイヤー/CPUが渡れる根拠ではない。F4では**正真正銘の同一版ゲーム衝突原本の存在自体が未確認**。入力がない検証器を繰り返し改良してもゲーム進行にならない。
7. **「全体ゲーム」の実装評価不足。** 4 SOURCE導線／12武器／真180秒／A1が別々に成功しても、同じ選択武器・同じRUN・同じSHA・実TIME_UP/実リプレイまで証明していない。個別カードの合格で終わらず**縦切り1プレイ**を主単位とする。
8. **ユーザーへの過大な負担・移行不備。** 毎ターン「続けて」だけを求め、小進捗を繰り返し、START_HEREに時代遅れのHEAD/CIが残る。今後は各回で可能な機能バッチを完了、GitHubに保存、ユーザーのPC作業なし。手動の実機/ART確認が不可避なときのみ明確なワンショット手順を1回依頼。
9. **過去の枝・他プロジェクトへの混線。** devや旧researchが旧資料に残る。現在の継続branchを明示し、旧docsは根拠・歴史として読む。MinecraftAIBuilderや12月対策の別目標へ勝手に移らない。
10. **原作忠実性と公開の混同。** 再現を優先する研究と、権利・許諾・公開品質は別。ユーザー承認なしにPages/PR/main/production/原作アセット公開を進めない。

## 4. 修正した実行計画（上位F1〜F5は不変更）

### Sprint A（優先順位1） — SOURCEにおける実際の一連の遊びを成立させる

対象は **1人がメニューで1つの既存SOURCEモード/武器を選ぶ→本当の7CPUとPLAYING→本物の移動・発射・着弾/塗装・インク回復→本物のTIME_UP 180秒→UIを押して次の世界へ再戦** の**同一commit／同一実ブラウザ**による縦切り。既存の [SourcePlayPortal](../../src/app/SourcePlayPortal.ts)、[UndertowF3PlayablePreviewApp](../../src/app/UndertowF3PlayablePreviewApp.ts)、[UndertowF3PlayableHud](../../src/app/UndertowF3PlayableHud.ts)、[SourcePaintRun](../../src/app/UndertowF3SourcePaintRun.ts)、既存B405/B409/B419等の真正runnerを再利用する。既存試験成功を新証拠にすり替えない。

- **完了条件A1**：真のプレイヤー入力と実SOURCE KCC、実武器射撃、原作ownerGridで新規塗装・インク経済が同一native世界に記録される。
- **完了条件A2**：TIME_UPは本物の180秒Native Tick（停止や手動tick注入なし）、実7 CPU、実再戦ボタンのクリックで新世界へ。旧の成功は設計の足場であり現SHAの結果ではない。
- **完了条件A3**：USER画面で視認できる時計・照準・HP/Ink・練習表示・本人のSHOT/INK通知と実際の行動が整合、F8でQAを復元できる。QA表示をデバッグ目的だけで増やさない。
- **禁止／留保**：敵HP命中、公式Scoreable/勝者、正式4v4、原作全域移動の認定。**一度の大きな機能差分で実際の遊びが変わらないなら、新しいコードに手を出さず現在の完成足場と障害を再検査する。**

### Sprint B（最上位の真の完成障害） — F4原作衝突権限の根本解決

[7.2.0版・Temple01原作の対応検証](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)と[Phive衝突照合の入力要件](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)を優先参照。

- **ゲートB1**：ゲームVer.7.2.0通常ナワバリの改修後ステージ、render/colバイナリ・取得版・モードを出典付きで確定。
- **ゲートB2**：該当FloorLine00など中央ギャップの真正collision flagsとPlayer/CPU衝突レイヤーを証明。Phive変換ができることと当該原本の在庫・衝突有効性は別。
- **ゲートB3**：原作FaceについてCpu半径0.30mの完全カプセル支持／native Rapier KCC→Recast Crowd連続移動を同一世界で証明。源25/17/26/0を推定で拡張しない。
- **ゲートB4**：その条件を満たした原作素材のみで本当のA/B 16経路・実敵遭遇・弾とHPを順に検証。得点の本物の各Surface/Mode権限も別途認証。
- 新たな版照合・原本がない限り **SOURCE_COLLISION_AUTHORITY_HOLD**。原本を取得・認証できない状態で合成Phive QAを無限再実行しない。F4が保留中でもSprint A/Cの独立工程を進める。

### Sprint C（Sprint Aの範囲で並行） — 自然なHPとF5品質

- 既存の同側原作床で真正CPU/人間の弾道・遮蔽・エイムとHP/撃破/150tick復帰の実装経路を分析し、**本当に自然に会える環境のみ**で、1つの同一世界の戦闘縦切りを検証する。相手位置変更・ワープ・偽命中を使わない。F4が遮断した時点では原因とHOLDを明示。
- F5では監査HUDが画面を占めないこと・高低差の読みやすさ・武器反応・操作の自然さ・色彩/ART/性能を重視。ただし今のB245/B356マイクロ調整は一度停止し、**1600×900真正スクリーンショットの問題を人が読んで1機能バッチにまとめられるときだけ**修正。
- CPUが本当に交戦可能になっても、HP減少と撃破・復活が同一実Actor/真Tickから追えない限りF3完了にはしない。

**実行順序の読み方：** 固定F1→F5は変更しない。Sprintは同ロードマップ内の実装／実証の優先バッチを束ねる方式。Sprint AでSRC局所プレイを完成させつつ、F4の原作依存で止まる敵戦闘はSprint Bと連動。Sprint Cはプレイ品質を壊さない範囲のみ。

## 5. 実行上の具体的な節約ルール

1. **次に遊べる内容を1行で宣言。** できなければ新HUD／検証器／文書／B番号だけを増やさない。
2. **先に既存コード・RAWを再利用。** T21専用の新workflow、同じ目的の新スクリプト、実体のないFAKE測定を作らない。F4未認証のときは本物の資料が新たに来て初めてF4検索を再開。
3. **1機能→軽量TS/Vitest/Build→必要な既存1真正Chromium→独立RAW/PNG→研究ブランチ保存**を基本。既存workflowのpaths/concurrencyを調べて、進行中に同branchへpushを重ねない。
4. 実ゲームの真の**180秒×2**を毎回走らせない。Native clock・試合ループ・再戦・CPU交戦・大きな統合差分を伴う節目に限り、目的を明示して既存runnerを選択。
5. PR・CI・Docsの**現在値は都度GitHubから取り直す**。古い文章内の「最新HEAD」「CI待ち」は歴史として読む。SOURCE数が不明瞭になったらHOLD。
6. 各ユーザー報告は **実際に遊べる差分／SHA／真正RUN・artifact／SOURCEと正式認証の差／残存HOLD／ユーザー操作** のみ簡潔に。Build成功をART/Gameplay成功に置き換えない。
7. ドキュメントだけのコミットは開発進捗0として扱う。F4の原作ライセンス・衝突原本の私有データをGitHubに掲載しない。
8. Workは現在の開発メッセージを勝手に許可と解釈しない。もし新しい権限・追加課金・本番変更が必要になればそこで明示停止し、その範囲だけ承認を求める。無関係なローカル手順をユーザーへ投げない。

## 6. 最新の証拠に関する重要な自己批判

**2026-11-07最新B441で何が本当に証明されたか：**
- 真のnative物理世界で7CPU、実W移動、実マウス射撃6発、実B471 Cキー2回、短時間CPU巡回の一部、B356のプレイヤー向け「SHOT FIRED · PAINT UNCONFIRMED」の実DOM可視。
- Human changed impact count 1 / 直近変化90セルは**原作ownerGridのイベント事実**だが、その観測瞬間にB356画面が「REAL_PAINT」を表示したという証拠ではない。SHOTの通知は着弾や敵Hitではない。
- 距離と経路：Human対敵最短104.586169m、味方対敵78.673825m、native queries 16中0、3m以下0、HP direct hit 0。これが正式ゲームを止める根本問題。
- **短時間のSOURCEテストであり全180秒の完全試合ではない**。B441のrealNativeTicksは722。C指示19回Goal要求≠19到着。FULL 4v4・真の勝者・ART合格の根拠にならない。

**改善評価：** 真正テストと安全な研究GitHub保全は信頼できる形へ進歩。ただし大目標への到達速度は不十分。根本ブロッカーの原作衝突原本が未入手の間に、HUD/B356/Phive診断/実CIを繰り返した割合が高すぎた。今後の開発は**体験を一度で押し上げるF3縦切り**に集中し、許可なき経路を作るのではなくF4のみHOLDする。短い実測のCIが多数成功しても「完成率」を恣意的に数値化しない。

## 7. 読み取り順序・次チャットの最初の一手

1. [START_HERE.md](../../START_HERE.md)の最上段から**本書**、[T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md)、[FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md)、[旧11/06統合正本](BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261106_LATEST_JA.md)を読み、その中の個別元正本へリンクを辿る。履歴資料の旧HEADは再利用しない。
2. GitHub research branch / main / Draft PR #5 / Actions最終結果を取得。同時書込または未完CIがあれば、実験結果を確定するまで無駄なpushを行わない。
3. 2026-11-07のゲーム証拠基準は **bca40f70204a1cdc8894d18a7419c2dc10303bf6** の B441 [#42296521946](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42296521946) / Artifact **13542970884**。**文書追加HEADのゲーム実証は発生しない**。0/16・0 Scoreable・正式HOLDを保持。
4. 次の実作業はSprint Aの**4 SOURCEモード／12武器既存資産を使い、新HEADと同一世界の本物の180秒→TIME_UP→再戦**をまず機能単位に繋ぐ／評価する。B405/B409/B419既存runnerを使えるか再確認。真のユーザー操作・RAW・画面と紐付ける。現状で何も直す必要がなければ、コードを増やさず既存機能の結合部だけ真Chromium実証する。
5. 原作Ver.7.2.0 Turf collision原本がなければF4はそこで停止。F3の敵HP/撃破を別座標のQA dummyや架空ワープで達成扱いしない。今ある本当のSOURCE局所プレイの完成品質を上げる。
6. 作業はChat＋GitHubで完結するところまで行い、ユーザー操作0回を基本にする。

### 新チャット開始用の最短メッセージ

Browser Ink TPSの継続開発を再開してください。新規企画や方針変更ではありません。GitHub ryomashibaba/browser-ink-tps の START_HERE.md 最上段から docs/continuity/BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261107_JA.md を全文読み、固定 T21_FAST_TRACK_ROADMAP.md、FAST_TRACK_EXECUTION_JA.md、旧正本と真正RAWを継承してください。研究ブランチ research/t21-integrated-a1-c-patrol-four-mode-20261105、ゲーム最終実証 bca40f70204a1cdc8894d18a7419c2dc10303bf6 / B441 #42296521946 SUCCESS (Artifact 13542970884)。ただし短時間SOURCEの限定PASS、対敵経路0/16、敵HP実命中0、正式4v4・Scoreable・Winner・ART・公開HOLD。main/T19C/T20/PR#5/Pages/PRIVATE原本を保護し、架空床・経路・Actor/命中・得点は禁止。F1〜F5/Fast Trackは固定。次の大きな機能Sprint Aを優先し、既存コードの180秒→再戦と実プレイ差分を一つの真正Chromiumで証明。F4は正規原本がなければ局所HOLD。小QA・HUD・CIの反復禁止。Work/Computer Useと追加課金は事前承認、ユーザー操作原則0回。計画だけでなく可能なところまで実装・軽量検証・必要な既存1系統の真Chrome・独立RAW・研究branchへGitHub保存まで続けてください。

