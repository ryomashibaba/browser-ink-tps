# Browser Ink TPS — 全体方針・全履歴の批判的再評価／次チャット用完全統合正本 V14.0

**統合基準：2026年11月7日（JST）**  
**対象：DOPAGAKI等の別案件ではなく、Browser Ink TPS / Undertow Spillway / T21 の継続開発のみ。**  
**目的：固定済みのF1〜F5・Fast Track・安全原則を絶対に勝手に変更せず、成功・失敗・未認証を峻別して、次チャットで資料探しや無意味な小工程を繰り返さず、実ゲームの本質的進歩へ直行する。**

> この文書の「完全統合」は、現在アクセスできる正本・実装・真正CI・過去引き継ぎから、意思決定に不可欠な点を一本化したという意味である。全過去チャットの逐語的保存や将来の無謬を保証するものではない。最新HEAD、CI、実RAWは必ず新チャットで再確認する。歴史的正本へのリンクを残しているので、欠落や矛盾は必ず原文に戻って検証すること。

## 0. 最初の60秒で把握する「運用契約」

- GitHub正本：<https://github.com/ryomashibaba/browser-ink-tps> 。作業対象ブランチは `research/t21-integrated-a1-c-patrol-four-mode-20261105` **のみ**。main、T19C/T20、既存Pages・本番、正式QA、PRIVATE/原作素材、Draft PR #5、他研究ブランチを保護。mainへの直接書き込み、無断merge/rebase/force-push、無断公開を禁止する。研究ブランチへの書き込みは**直前HEADを取り直し、expected SHA条件付きの非force更新**で行い、競合時は停止して再照合する。
- 現在の最上位目標は『スプラトゥーン3』Ver.7.2.0以降・**マテガイ放水路通常ナワバリ**を忠実に再現した高品質なブラウザTPS。最終形：人間1＋実CPU7＝自然な4対4／180秒／原作支持の移動・弾・塗装・インク・HP／撃破・150 native tick復活／公式得点・勝敗／再戦／実試遊・ART・音・性能。Big Run・トリカラ・別版・別ステージ・新企画にはしない。
- **原作SOURCE不変**：25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / **0 Scoreable**。既存の歴史的原作経路0/12と、定義の異なるB487「実Human＋CPUの敵味方16組」0/16を区別。公式勝者 `NONE`、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。正式4v4・公式勝敗・F4全域・ART正式採用・公開は**HOLD**。
- 原作から認証されていない透明床・橋・坂・NavLink、描画OBJを本当の衝突とみなす操作、未認証のActor/CPUワープやカプセル縮小、敵を都合のよい位置に動かす試験、偽の弾・HP命中・塗装・インク・得点・クロック注入は禁止。Fixture/部分QAのPASSを本物の原作ゲームPASSに昇格しない。
- **Chat＋接続GitHub優先**。ユーザーの作業は原則0回、必要でも一度にまとめたワンショット。追加課金原則0円。Work/Computer Useはユーザーの**毎回の個別事前承認**なしに開始しない。Windows端末・ローカルPRIVATEへの接続可否を推測せず、接続不能なら権限外の操作はしない。MinecraftAIBuilderは長期的に本案件と同格の最重要2作品であり、Strataや12月対策へこのチャットの開発目標を移さない。
- 成功を名乗るときは必ず **対象SHA／本物のRUN ID／RAWとPNG／合格条件／未達条件** を対にする。新HEADへのゲーム実証の引き継ぎは、変更範囲と独立回帰の範囲を示して慎重に行う。

## 1. 絶対的な上位仕様 F1〜F5（変更禁止）

| 工程 | 不変の目標 | 正式合格に必要な核心 |
| --- | --- | --- |
| **F1** | 原作登録支持床の真正4＋4起点、人間1＋CPU7 | 8体の実Body・衝突分離・本人入力、CPUの真Rapier/Recast復帰と自然開始 |
| **F2** | 原作支持に基づく連続移動・高低差・初降下・坂・中央接続 | 8体の連続的な本物のKCC/Recast/Crowd、原作との各面照合、ワープ・架空床なし |
| **F3** | 本当に遊べる実戦と180秒ゲームループ | 12武器＋サブ／4 SOURCE導線、射撃・着弾・ownerGrid・インクOWN・HP／撃破・150tick復帰・自然CPU対敵戦闘・再戦を**真のゲーム内**で結合 |
| **F4** | Ver.7.2.0 **通常ナワバリ版**の全域マップと公式得点権限 | 同版ソース・実衝突Face／collision flags・0.30mのCPUカプセル支持・Recast連続通行・真正敵味方経路・Scoreable正規認証 |
| **F5** | 楽しい操作・視認性・音・性能・高品質なARTと公開審査 | 真正Chrome/本人試遊、ゲーム本体品質評価、原作・権利・正式4v4ゲートすべて合格後の明示承認 |

**F1→F5の固定ロードマップとFast Trackを上書きしない。** 実作業を「Sprint/Batch」に分割するのは、F4の原本不足でF3/F5まで停止しないための実行上の整理にすぎない。F4を通らない機能がF4を満たしたことにはならない。

## 2. 正本優先順位と歴史への入口

1. **最上位不変規約**：[T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md) → [FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md)。後者の古いブランチ名 `dev/t21-f4e103w-qa-infra` は2026-10-25当時の履歴であり、現行対象ではない。
2. **現時点の運用と批判的評価**：本書V14 → [2026-11-07統合正本](BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261107_JA.md) → [2026-11-06統合正本](BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261106_LATEST_JA.md) → [START_HERE.md](../../START_HERE.md)最上段。START_HEREの旧「最新」は記載当時のスナップショットである。
3. **これまでの統合史**：[B470/B471/B472 真正統合](T21_INTEGRATED_A1_C_PATROL_FOUR_MODE_20261105_JA.md)、[B472批判レビュー](BROWSER_INK_TPS_COMPLETE_HANDOFF_B472_CRITICAL_REVIEW_20261105_JA.md)、[11/5全体批判](T21_COMPLETE_HANDOFF_20261105_CRITICAL_REVIEW_JA.md)。初期からの詳細を必要時にだけ参照する。
4. **2026-11-07 A1/A2/A3最新実証台帳**：[T21_SPRINT_A1_A2_A3_REAL_CHROMIUM_ACCEPTANCE_20261107_JA.md](../qa/T21_SPRINT_A1_A2_A3_REAL_CHROMIUM_ACCEPTANCE_20261107_JA.md)。歴史的な複数のSHAを1回の同一試合PASSだと混同しない。
5. **最重要F4原作根拠**：[版・対応・衝突権限](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md) と [Phive実物照合ゲート](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)。旧B239・B369/B487/B488原作不足の履歴はこれらから追う。

## 3. GitHub現況（確認時点の真実と今後の再確認方法）

- 2026-11-07時点の研究ブランチ実HEAD：**`9daae0d55766e32c640647ff118a39690ee319fb`**。前HEAD `ccd1a75b278c0556df182116b032a8887a4a6838` からの1コミット。最新の**実装**は [Qキー局所練習再挑戦](https://github.com/ryomashibaba/browser-ink-tps/commit/9daae0d55766e32c640647ff118a39690ee319fb) で、`UndertowF3PlayablePreviewApp.ts`、`UndertowF3SourcePaintRun.ts` と同testを変更した。
- main：**`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`**、固定・変更禁止。
- PR #5：Open／Draft／未マージ。**PRのheadがこの継続研究branchと同一であるとは推定しない**（別ブランチとの取り違えを防ぎ、GitHub上の本物のhead/base SHAを別途確認）。PRを編集・mergeしない。
- 同SHAの [B441短時間真正 #42330835191](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835191) **SUCCESS**、Artifact **13557845414**。原作7CPU実走とB450/B452/B454監査、同じSHAの変更に対する有限な回帰確認。
- 同SHAの [B162本物A1協力 #42330835220](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835220) **SUCCESS**、Artifact **13557443305**。
- 同SHAの [B413本物インク・180秒 #42330835190](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835190) は**この文書の初期確認時点で `in_progress`**。成功・失敗は新チャットで必ず最新状態とRAWを確認。完走前にPASS扱いしない。
- 上記3本は**Qキーを実際に押して練習だけ再開始したという検証ではない**。Q機能はコード・単体テストで検証済み、真正ユーザーQ入力と同じ世界の継続性は**HOLD**。B441/B162/B413成功をQ実操作PASSに誤用しない。
- このドキュメントをGitHubへコミットすれば、その文書コミットHEADは上の**真正ゲーム実装SHAとは別**になる。新チャットでは両者を区別する。

## 4. 2026-11-07までに本当に成立したプレイループ（正確な実証粒度）

### A1 — 人間の実射撃→元ownerGrid塗装→インク消費→OWN上Squid補給→Human再射撃

- ゲーム実装SHA `416c0ae2e130577f90d40bd464bc2245ec73a805`。[本物のChrome #42320196565](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42320196565) **SUCCESS**、Artifact **13553497551**。
- 真の180秒試合、実CPU7、原作上段→下段→坂→上段KCC。人間121発、元塗装変更1,189セル、原作の異なる4つの面、実TIME_UP tick 11,860。B413独立：補給前17発・インク消費16.15、OWN Squid回復 **+13.3167**、Human復帰14発・消費13.30。B409〜B414に独立監査あり。
- **限定PASS**。このRUN自体で再戦をクリックしたこと、敵を本当に撃破したこと、公式勝敗は証明しない。

### A2 — 真180秒TIME_UP→実再戦ボタンクリック→同武器で新世界

- ゲームSHA `2fbc44cf719af124500dcd768421a289f155efa5`。[真正Chrome #42309574066](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42309574066)。本当の7CPU／Needle SMG 6発／人間原作変更41セル／180秒TIME_UP tick11,859 → **見えていて押せるボタンを実クリック** → 新世界 `STAGING` tick0、同じ武器／CPU7を実測。
- **元RUN全体はFAIL**：古いB452が短時間専用の判定名を要求してしまった証拠審査の問題。元RAWを捏造・再プレイせず独立監査側のみ正しく修正したSHA `9595899164f5cc8d936b9590bf4ee5882dcaa078` の [監査#42314431496](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42314431496) は **SUCCESS**。Artifactは元 `13548989370`。
- **限定PASS**。2戦目全180秒、全4モード×12武器、A1インクループとA2再戦を**同じ一つのRUN**で完遂したことまでは実証していない。

### A3 — A1練習CLEAR後の実プレイヤーHUDとF8詳細画面

- 表示変更SHA `6c95555638418dac361ed1bab1a53323c1e1c87d`。同系譜の真正画面試験SHA `f3cd7cad5f65329e48676931a6d2a5af6fbc33d4`、[実Chrome #42326607158](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607158) **SUCCESS**、Artifact **13556082019**。
- 元SOURCE上でA1協力練習CLEAR、PLAYER tick2399→F8 QA tick2435→PLAYER復帰 tick2471。1600×900実スクリーンショット3枚。実CPU7、実B414 ink、B417 paint、中央時計と真データ維持。PLAYERだけ重複の残り時間・案内を削り、F8で元のデータを復元。
- 同SHAの [B162協力#42326607161](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607161) **SUCCESS**。本物A1原作着弾1件・変更36セル、練習CLEAR tick1827。
- **限定PASS**。A3は短縮した真ゲーム画面検査で、新180秒完走も最終ART・人手試遊のPASSも意味しない。

### その他すでに確立した部分

- 既存の SOURCE 4モード入口・12武器選択、SOURCE版の実CPU物理巡回・一部原作Goal到着、ユーザーの真CキーによるA1支援、練習CLEAR、真サブ爆発等には**個別SHA／別RUNごとの限定的成功**がある。フル4モード×全12武器×全機能を一つの現行ゲームで認証したものではない。
- CPUは本物の7 Actorだが、相手チームとの「自然な接敵→発射→HP減少→撃破→150tick復活」を同一真正プレイでつないだ証拠はない。局所HP/復活コードやFixture成功を正式自然対戦PASSにしない。

## 5. 根本未解決（必ず明記、HOLDを緩めない）

1. **F4最大障害：同版原作の真正な衝突Faceと属性が足りない。** 現行SOURCE 25/17/26/0のまま。B488には右低地～アンダーパスの8局所gap（両側各4）等の未解決箇所。B487実敵味方自然原作経路 **0/16**（歴史的な0/12とは別）。真正対岸の0.30m CPU完全カプセル支持・Recast/Crowd経路・人間KCCの連続実証なし。これが自然敵HP・撃破・公式対戦の必須の前提。
2. **表示用モデルとゲーム用衝突は違う。** KiTrix `Vss_Temple01.obj` の43,263,289 bytes／SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046` は視覚メッシュの正本指紋だが、7.2.0ナワバリ版の個別衝突有効フラグの証拠ではない。KiTrix内のStageNameテーブルに誤導的対応がある可能性があり、`Temple`/`Athletic`などの内部名や別モードの同名OBJで推定置換しない。
3. **PhiveConverterは変換手段であって、真正衝突データ自体ではない。** 同一版の正当に利用可能な原作 `.bphsh` 等・モード・抽出時点・Face／collision flagsが得られない限り、既存 `scripts/f4_phive_original_collision_probe.py` の空打ちや新しいfixtureを増やさない。非公開／ライセンス不明の原本はGitHubにアップロードしない。
4. **公式Scoreableは0、公式WinnerはNONE**。敵HP/撃破/復活の真正自然プレイでの連続証明は0。正式4v4、原作完全性、ART最終審査、PR merge、Pages/本番公開の許可はどれもない。
5. **最新Qキー機能**：コード上は通常`combat`/`circuit`、生存・接地・実7CPU・真PLAYING・残り60秒以上・原作支持面・終了した非A1協力練習のみ許可。`this.b25Run.arm()`により局所練習だけ再ARM、ゲーム時計・CPU・インク/ownerGridには触れない設計。まだ真キー入力で成立したRAWがないので保留。反復練習の有用性は大きなF4阻害を解く成果と混同しない。

## 6. 過去の失敗から導出した批判的改訂（方針のブレを防止）

| 過去の問題 | なぜ非効率／誤りだったか | 今後の厳密な改善 |
| --- | --- | --- |
| B番号・コミット・テストの大量生産 | 成功件数は自然4v4の実現度を表さず、経路0/16は不変 | 「今回新たにユーザーが何を遊べるか」「根本HOLDが減ったか」の二つで優先順位決定。どちらもない変更は原則保留 |
| 多数のHUD・警告・診断微修正 | 実ゲームの視界改善に対する反復CI費用が高い | A3 PLAYER/F8の限定受け入れ後は小さな見た目いじりを**凍結**。真スクショの明瞭な支障がある時だけ大きめのF5バッチ |
| 毎pushで真正Chromiumが3本以上走る | GitHub Action時間・失敗対応・concurrencyキャンセルの無駄 | 1機能バッチ→静的/軽量Vitest/Build→最適な既存1本の真Chrome→RAW/PNG。ワークフロー数を増やさず、CI実行中の同ブランチpushを避ける。既存の自動多重起動は次の大変更時に既存workflowの条件整理を候補にするが、単独の新CI改造企画にしない |
| 履歴の「現HEAD」「PASS」の混同 | 真ゲームSHAの異なる成功を合成し、全面完成のように見える | 最新HEADと「ゲーム実証SHA」を分ける。元RUN FAIL+独立監査PASSは両方表記。部分PASSから総合PASSへの無断昇格を禁止 |
| 再び失敗するRキー実再戦の反復 | 同一CDP配送条件での検証に時間を使い、未改善原因へ再試行 | 実際に操作できる**再戦ボタン**を優先。Rキー経路は新しい原因と操作証拠が得られるまでHOLD |
| 原作モデルと衝突の取り違え | OBJ Faceや単体31-solid条件を原作ゲーム通行と誤解 | 7.2.0通常ナワバリ出典、Face collision flags、0.30m完全体支持、真CPU連続歩行を順番に独立検証。推定の床を加えない |
| サブ・塗装イベントの過大評価 | 原作スタンプが存在しても変更セルが0の場合があり、発射≠命中 | PROJECTILE・STAMP・実ownerGrid変化・敵HPを別に記録し、実結果だけを表示 |
| 再挑戦・局所改善の機能化が目的化 | Q等の便利機能はよくても、正式対戦の最大障害は解けない | Qの真正動作を**1本だけ**検証して締め、次は原作SOURCEの実プレイ価値が増えるまとめバッチ。Q専用の長い連続改修は禁止 |
| 毎ターン説明や調査を重複 | 進行せず、ユーザーに「続けて」の反復を求める | 各回はSTART_HERE+本V14+HEAD+必要なコードだけで即実装。結果は成果/SHA/RUN/HOLD/次の一工程を短く報告。ユーザー操作0回を基本とする |
| 開発枝と別プロジェクトの混線 | 古いdev/異なるresearchやMinecraftAIBuilder・Strataの目標を混同 | 明示された研究ブランチだけに非force書込み。別案件は勝手に進めず、ユーザーの「次の工程」はT21のみを意味する |

**再批判**：`Qキーを一度証明して終了`も、長時間Chromiumを何回も起動しては逆に非効率になり得る。既存CIがQを直接検証しないなら、まず軽量テストと既存Chromeの再利用可否を確認し、最短の真入力試験が必要なときだけ一度走らせる。Qのための新規大型検証基盤／別ワークフローは作らない。実物のF4原本が手元にない以上、F4調査だけで何回もチャットを消費するのも禁止する。

## 7. 今後の実行計画（批判的修正版・F1〜F5は不変）

### Phase 0 — いま開始する再開ゲート（調査を最短に）

1. GitHub HEAD/main/PR #5とactive Actionsを取得し、`#42330835190`の完了状態／RAW・エラーを確認。CIで走っているSHAが現ゲームSHAと一致するか確認する。
2. 最新QキーコミットとこのV14が別のSHAなら区別。既存B441/B162の成功だけでQ実操作をPASSとしない。
3. 未完了の真正CIがある間は、競合するソースpushをしない。結果がFAILなら最初の故障点とRAWを読み、真の不具合だけ最小修正。

### Phase 1 — 完了済みA1/A2/A3を足場に「新しい遊び」を1バッチ

**第一候補：真正Q再挑戦の有効性を1回で判断**。原作通常combatまたはcircuitの実Chromeで、実PLAYING・実原作支持・CPU7・60秒練習の自然TIME_UP（または真正CLEAR）→ **本物の`KeyQ`を配送** → 同一ページ `performance.timeOrigin`／同じnative world／単調増加tick／継続する180秒残時間・weapon・human/CPU7／塗装・インク残高不変／練習のみ`ARMED→RUNNING`をRAWと実画面で示す。ステート注入や直接`arm()`呼び出しを真正操作の代用にしない。

- 1回でPASSしたらQの追加バリエーション・微UI改良に進まない。FAILなら最初の実コード原因を確認し、挙動が本当に改善できるときにだけ1回修正＋再試験。原因不明ならQ局所HOLDのままF3本質へ移る。
- 次の実プレイ差分は既存の4入口・12武器のうち**実際のプレイヤー行動と異なる武器反応／練習・再挑戦・180秒がつながる体験**を代表ケースとして集約。48通りの180秒CIを無意味に走らせない。武器選択が別世界でリセットされたり、実Inputが受付不可という既知再現バグがあればそこを優先。
- 真の対敵戦闘はF4原本なしでは推測経路を許可せず、許可済みの原作局所SOURCE内だけで弾・音・視覚・インク等のプレイ品質をまとめて改善する。CPU/敵を手動で寄せてHP連鎖を偽造しない。

### Phase 2 — F4は「新しい正規原本」が入ったときだけ

同一ゲーム版Ver.7.2.0、通常Turfルール、ステージ出典 → 真の原作collision mesh／Faceと衝突フラグ → Player/CPUレイヤー解釈 → 0.30m Capsule＋Recast幅 → 実8Actor連続ルート → 自然な敵HP/撃破/復活 → 正規Scoreable/勝者、の順に**別々に**評価する。途中欠けたら局所HOLD。KiTrix表示OBJ・PhiveConverterの存在・Fixture PASSだけで次段に進めない。許諾のない原作バイナリは公開しない。F4資料探しでF3/F5開発を無期限停止しない。

### Phase 3 — F5と完成品の統合ゲート

実1600×900のプレイ動画・HUD/射線・FPS・音・武器・カメラ・床の視認性を1つの制作バッチで評価。真のプレイヤー操作で「楽しい」「原作らしい」かを実試遊で確認する。本人Windows実機・ART判断が必要になった場合のみ、最後に**単一の簡単な手順**として依頼する（ユーザーの外出中はGitHubとCI上の可能な作業を進める）。正式4v4、原作対応、権利、安全、本人承認が揃うまでPR merge・本番公開禁止。

### 完了条件の層を明確にする

- **LEVEL 1：限定原作SOURCE遊び PASS**：今あるA1/A2/A3、真正7 CPU＋人間入力・塗装・OWNインク・180秒→再戦はそれぞれ証拠を持つ。ただし複数RUNを1つに合成しない。
- **LEVEL 2：自然対敵戦闘の真正実ゲーム PASS**：両チームの本物のCPUが自然に接近、実弾→敵HP減少→撃破→150tick復活が同一SOURCEゲーム・原作衝突で成立。**現状HOLD**。
- **LEVEL 3：原作7.2.0通常ナワバリ正式PASS**：自然経路16組、同一ステージ全域、原作正規Scoreableと勝者、1＋7で180秒・再戦。**現状HOLD**。
- **LEVEL 4：ART・品質・公開PASS**：本人試遊/美術、性能、権利、安全、明示承認を通過。**現状HOLD**。

## 8. 1ターンの実行契約（ユーザーの作業とCI費を最小化）

1. **目的を1文にする**：「今回、新たに何が遊べるようになるか」。不足があるならその真の根本条件を特定。資料再読を目的化しない。
2. **リモートを確認**：現在branch SHA、main、PR #5、実行中Actions、最近のコミット差分。ユーザーの指示なくWork/Computer Use・課金・PRIVATEは利用しない。
3. **現存実装を再利用**：1機能に必要な既存コードだけを読み、共通原因にまとめて変更。新スクリプト・Workflow・状態台帳を乱立させない。
4. **軽量検証→真正証拠**：静的TS・対象Vitest・Buildをまとめて行い、必要なら既存1系統のChromiumを選択。`TIME_UP`/Q/CDP/F8/原作ownerGridなどは本物の人間入力に基づくRAW/PNGで判定する。
5. **失敗を扱う**：CIログの最初の実故障、同一SHAのRAW、原作Authorityを読んで1つだけ修正。3度以上同じ症状なら、入力や手法を変える新根拠なしの再試行をやめる。
6. **GitHub安全保存**：現在HEADが変わっていないことを再検証、研究ブランチのみCAS・非force。CI実行中にソース追加pushを連打しない。ドキュメントだけのコミットをゲーム進捗と数えない。
7. **返答短縮**：何が実際にできたか／HEAD／対象実証RUN+Artifact／正式HOLD／ユーザー操作（原則0）のみ。サンドボックスZIPのダウンロードを強制せず、GitHubの正本URLを優先する。

## 9. 最初に開くリンク（短い索引）

- [研究リポジトリと現在の作業ブランチ](https://github.com/ryomashibaba/browser-ink-tps/tree/research/t21-integrated-a1-c-patrol-four-mode-20261105)
- [START_HERE.md](../../START_HERE.md)
- [A1/A2/A3真正限定PASSの証拠](../qa/T21_SPRINT_A1_A2_A3_REAL_CHROMIUM_ACCEPTANCE_20261107_JA.md)
- [Qキー実装コミット](https://github.com/ryomashibaba/browser-ink-tps/commit/9daae0d55766e32c640647ff118a39690ee319fb)
- [最新の真正B413/180秒CI（結果の再取得が必要）](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835190)
- [最新B441短時間SOURCE PASS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835191)
- [最新B162真正協力PASS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42330835220)
- [F4原作不足とPhive照合規約](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)

## 10. 次チャット開始用のコピー文

**Browser Ink TPS / T21 / Undertow Spillwayの継続開発を再開してください。新企画・方針変更ではありません。GitHub `ryomashibaba/browser-ink-tps` の作業ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105` にある `START_HERE.md`、本V14.0、11/7完全統合正本、固定 `T21_FAST_TRACK_ROADMAP.md` と `docs/continuity/FAST_TRACK_EXECUTION_JA.md` を読み、参照先の過去計画・成功・失敗・安全条件を全て継承してください。現在確認済みのゲーム実装基準は `9daae0d55766e32c640647ff118a39690ee319fb`（Qキーで終了済み局所練習を同じ180秒世界内で再ARMする新機能）。B441 #42330835191、B162 #42330835220はSUCCESSですが、Qの真正キー操作は未認証。B413 #42330835190の最新結果を最初に再確認してください。A1/A2/A3はそれぞれ別真正RUNによる限定PASS。F4の原作25/17/26/0・敵味方自然経路0/16・正式Scoreable0、敵HP/撃破/復活の自然実証、公式勝敗・ART・公開はHOLD。新原作7.2.0ナワバリ collision/Face資料なしに偽床/経路/Actor/得点を追加しない。F1〜F5/Fast Trackは不変。Q実操作の必要最小限の真正検証を1回で締め、次は実際の遊びの本質が増えるF3/F5の機能バッチに集中。main/T19C/T20/原本/Pages/Draft PR #5を保護、CAS非forceで研究ブランチのみ変更。CIと文書の増殖・HUDマイクロ改善・長い同条件再試走は禁止。Work/Computer Use・追加課金は事前承認、ユーザー操作原則0回。今回も計画だけで終わらせず、可能な実装→検証→証拠→GitHub保存まで進めてください。**