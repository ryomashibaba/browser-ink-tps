# Browser Ink TPS / T21 — V15.0 完全統合・批判的引き継ぎ正本

**2026-11-07 JST。既存開発の継続。新企画でも上位方針の変更でもない。**
**作成前の研究ゲーム/QA基準HEAD** `e15a62ac13284eb9b3906ed97271f22223a63ce2`。この文書のコミット後、GitHub HEADは別SHAになる。新チャットでは必ず取得し直す。

この文書は閲覧できた旧正本・コード・Actions・RAWと過去チャットから、次の意思決定に必要な事項を統合したもの。全過去会話を逐語的に保存したとも、将来の無謬性を保証するとも主張しない。根拠のないPASSを作らず、必要時はリンク先原文と実証SHAへ戻る。

## 0. 不可変の運用契約

- 正本：GitHub `ryomashibaba/browser-ink-tps`。**変更できるのは`research/t21-integrated-a1-c-patrol-four-mode-20261105`のみ**。main、T19C/T20、公開Pages/本番、正式QAブランチ、他研究branch、原作PRIVATE/Windows原本、Draft PR #5を保護。PR #5は別head=`codex/t21-undertow-evidence-ledger`、base=main、Open/Draft/未merge。無断merge、rebase、force-push、release、公開なし。研究branch更新は都度最新HEADを再取得し、`expected_sha`＋`force:false`。競合なら停止・照合。
- 最終目標：**『スプラトゥーン3』Ver.7.2.0以降のマテガイ放水路、通常ナワバリ**の忠実・高品質なブラウザ3D TPS。人間1＋実CPU7、自然な正式4対4、180秒、原作の高低差/移動・弾・塗装/ownerGrid・インク補給・HP/撃破/150 native tick復活・正式得点/勝敗・再戦・本人試遊・ART/音/性能。Big Run・トリカラ・別版・別マップは対象外。原作忠実度＞本当に遊べる品質＞自然な移動/CPU判断＞回帰防止＞速度・節約。
- 上位の**F1〜F5とFast Trackは変更禁止**：[`T21_FAST_TRACK_ROADMAP.md`](../../T21_FAST_TRACK_ROADMAP.md)、[`FAST_TRACK_EXECUTION_JA.md`](FAST_TRACK_EXECUTION_JA.md)。後者にある古い`dev/t21-f4e103w-qa-infra`は当時の歴史。現研究branchに読み替えるだけでロードマップ自体を書き換えない。
- **SOURCE認証数は25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable**。旧経路0/12とB487敵味方16組経路**0/16**は母数/定義が異なる。中央・対岸で自然なHP/撃破/復帰は未成立。公式Winner=`NONE`、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。正式4v4・正式得点/勝敗・全域F4・ART正式採用・本番公開は**HOLD**。
- 未認証の透明床、架空橋/坂/原作NavLink、絵のOBJを衝突Faceと断定する行為、都合のよい敵ワープ/位置変更、CPU半径の恣意的縮小、架空Ray/Projectile・HP命中/撃破・Ink/Score/Clock注入は禁止。QA専用31-solid歩行を元25へ昇格させない。出典・版の怪しい原作データを非公開領域からGitHubへアップロードしない。
- **Chat＋接続GitHubで、ユーザー操作原則0回。追加課金原則0円。Work/Computer Useは毎回の明示的な個別事前承認制。** Windows/PRIVATEにはアクセスできると推測しない。必要な端末操作があれば本人に一括ワンショット手順のみ、不要なら依頼しない。
- 「成功」は**ゲーム実装SHA／本物のGitHub Actions Run ID／元RAW・PNG／限定合格項目／未達条件**が組になって初めて認定。CDPの真正Chromium実操作は本人の手動試遊ではない。TypeScript、Vitest、CI全体、ゲーム内CLEAR、公式Turf勝利を厳密に区別。

## 1. 固定F1〜F5と現在地

| 工程 | 変えない最終条件 | 現時点の到達点 |
| --- | --- | --- |
| F1 | 正規支持床上の1人＋実CPU7、4+4物理起点と接触分離 | SOURCE内の7CPU実参加は複数真正RUNでPASS、全8体の正式戦闘保証ではない |
| F2 | 元Rapier KCC/Recast/Crowdで本物の高台、初降下、坂、中央/全域連続 | 元上段→着地点→坂など同側のみ限定PASS。自然敵味方対岸0/16 |
| F3 | 12武器+サブ、真正入力、弾/塗装/ownerGrid/OWN補給、自然なHP/撃破/復帰、180秒/再戦 | 選択・射撃・補給・再戦は**異なるRUNで限定PASS**。本物の自然対敵HP連鎖はHOLD |
| F4 | Ver.7.2.0通常Turfの真正collision Face/flags、0.30m CPUカプセル/Recast全域、Scoreable | 正規衝突原本未認証。0/16・Scoreable0、最大阻害 |
| F5 | 実操作感・視認性・FPS/音/ART・本人試遊・正式公開審査 | 真1600×900 PLAYER/F8切替はPASS、本人試遊とART完成・リリースはHOLD |

F4の原本不足を理由に、正当な同側SOURCE局所F3/F5を全部停止する必要はない。一方、F4を回避して正式4v4・公式得点を名乗ることも絶対にできない。

## 2. 最新GitHub証拠台帳（2026-11-07 JST／古いV14より優先）

確認済み研究ゲーム/QA HEAD **`e15a62ac13284eb9b3906ed97271f22223a63ce2`**。保護main **`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`**。PR #5はOpen/Draft/未merge・別head。以下は証拠ごとに成功範囲を限定する。

| 証拠 | 真正プレイで成立 | 成立しない主張 |
| --- | --- | --- |
| A1 [#42320196565](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42320196565)、実装`416c0ae2` | 真180秒CPU7、人間121発・原作1189変更セル、実17発インク-16.15→OWNイカ**+13.3167**→Human14発・-13.30 | A2と同じRUNの再戦、自然敵HP命中・公式勝利ではない |
| A2 [元真正#42309574066](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42309574066) ＋[固定RAW監査#42314431496](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42314431496) | 同じNeedle SMG、本物180秒TIME_UP tick11859→本物の再戦ボタン実クリック→新世界tick0・180秒。元CI全体FAILは旧B452監査の判定名不一致、後のread-only独立監査SUCCESS | 2戦目180秒全完走、他11武器の完走ではない |
| A3 [#42326607158](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607158) | PLAYER→F8→PLAYERの真1600×900 PNG3枚、原作Ink/ownerGrid・7CPU | 本人のART/操作感合格ではない |
| Q [#42361794485](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42361794485) | 本物のKeyQ、同じSOURCE世界の局所練習`TIME_UP→RUNNING`、元CPU/時計/武器/インク保護 | 公式180秒の巻戻しではない。旧V14「Q実キー未認証」は履歴で更新済 |
| A1協力 [#42361694394](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42361694394) | 実A1原作着弾36セル、人間808変更セル、真Rapier KCC35.76m、練習CLEAR | 自然な敵撃破ではない |
| A1/180秒回帰 [#42361694364](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42361694364) | 原作床で人間の射撃/インク支出/OWN回復/再発射と本物180秒の統合回帰SUCCESS | Q/B58/Chargerと同じ1RUNではない |
| **B58 SOURCE_SWEEP** 元[真正#42363774075](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42363774075)＋[独立RAW再監査#42364849596](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42364849596) | 同一真正Chrome原作7CPU、上段**97**/着地点**60**/右低ランプ**92**セルの本物Human Impact、原作で**31.02m**接地移動、`SOURCE_SWEEP CLEAR` 練習経過**677tick（約11.3秒）**。元CIは3枚目PNGのJSON列挙漏れでFAIL、元PNG3枚の実ファイルとKCC/inkを固定RAWで再監査してSUCCESS、281テスト+build PASS | **非公式局所練習のCLEAR**であり公式スコア/勝者ではない。元CIのFAILを消して表記しない |
| **Rail Charger** [#42365628667](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667)、HEAD`e15a62ac` | 実メニュー4番目選択、本物7CPU、実マウス73tick押下中0発→解放後**1発**・原作上段**142新規セル**、3真PNG/独立QA SUCCESS | 既存武器の真正操作を**検証した**のであり、武器本体の新実装・全12武器180秒PASSではない |

B58の真正生証拠Artifact [13571455107](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42363774075/artifacts/13571455107)、RailのArtifact [13571995282](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667/artifacts/13571995282)。保持期限があるので必要時だけ存在を確認。足りない証拠を新規ZIP提出でユーザーに求めない。最新の文書追加SHAはゲーム証拠SHAではない。

## 3. 正しくHOLDを維持する根本障害

1. **F4原作権限**：右低地～アンダーパスの旧B488局所gap計8、B487本物Human＋CPU敵味方16経路は**0/16**。同一版原作真正collision Faceとmaterial flagsが足りず、0.30m CPUカプセル全身連続支持・Recast経路を証明不能。現行の25/17/26/0を弄らない。
2. [原作版照合](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)：版別SceneInfoはVer.7.2.0改修後`Vss_Temple01` / `Fld_Temple01.bfres`との対応を示すが、KiTrixの表示名テーブルと矛盾がある。可視OBJのSHA/Faceが正しくても**当該OBJの抽出版・Turfの有効collision flagsは未確認**。Stage名から推定の置換禁止。
3. [Phive原本ゲート](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)：`PhiveConverter`は原本ではなく変換器。適法な7.2.0通常Turf`.bphsh`等、モード/抽出版/hash/元Face collision flagsの実物がない限り**F4 SOURCE_COLLISION_AUTHORITY_HOLD**。合成fixture・空の比較を何度も回さない。
4. 敵自然接敵→本物Projectile→本人/敵HP低下→撃破→150tick復活の同一世界証拠なし。CPU7の真移動/射撃は、自然な対敵戦闘の証明ではない。人工対戦位置・QA dummyの達成を正式化禁止。
5. 正規Scoreable=**0**、勝者NONE。練習セル数をTurf得点に転用できない。正式4v4/ART/公開/mergeはHOLD。本人の本当の手動試遊と、完成ART品質・FPS/操作感は未認証。

## 4. 過去の失敗の批判的再評価 → 二度としないこと

| 問題 | 失敗の本質 | 今後の修正 |
| --- | --- | --- |
| B番号・大量HUD・小QA・コミット・CI増殖 | 本物の接敵0/16のまま成果の件数だけ増えた | 新バッチ採択は**プレイヤーが新たに何をできるか**／**根本HOLDが実根拠で減るか**で判断。どちらもないなら実装しない |
| B58等で証明を細切れ化 | 真のゲーム本体改善と検証器の追加が混ざる | SOURCE_SWEEPは真正CLEAR済、Rail Chargerは代表入力検証済。**追加の小武器単発QAやQ/HUD再試験を凍結** |
| TypeScript fixture不備、起動前snapshot参照 | 同じ修正で複数CIが落ち、大きな時間損失 | 型/呼出し契約・最短静的/Unitを先に確認。真Chromiumはロード完了待ち。失敗原因が一つなら一括修正し再実行1回 |
| RAWに3枚PNGがあるのにmanifest2件 | ゲームはCLEARだが独立CIがFAIL。誤ってゲーム失敗扱いする危険 | 元RUN FAIL／本物のRAW PASS／read-only監査SUCCESSを別記。必要なら**固定元RAWの独立再監査**、高コスト再試走禁止 |
| 短時間SOURCEと180秒や公式4v4の混同 | 局所成功の合成で全面完成に見える | `SOURCE_ONLY`, `PRACTICE CLEAR`, `180s TIME_UP`, `REAL HP HIT`, `OFFICIAL SCORE`は別ゲート。RUNと実装SHA単位に記す |
| 原作表示OBJ/FloorLine00を物理通行と混同 | 31-solid QA KCC歩行≠ゲーム版・衝突旗・CPU0.30m支持 | 出典/版→Face/flags→Rapier/Capsule→Recast→実Actor→敵HP→Scoreableの順、未入手ならHOLD |
| 本人操作を毎回依頼／難しいZIP/CMD/スクショ | ユーザー負担が増え、開発の進展が乏しい | Chat+GitHubを第一に。本人が本当に必要なF5試遊だけ、事前準備した**一度の短い操作**に集約 |
| docsだけの増殖 | 古い「最新」が複数あり再開が困難 | 本V15を唯一の新しい継続正本にして、`START_HERE.md`最上段だけ更新。旧V14/履歴は改変しない。V16乱造しない |
| CI多重発火と同ブランチ途中push | GitHub Actionsが長時間・重複して予算/成果を浪費 | 関連Unit＋Build→**既存1本の真正Chromium**。新workflow禁止、長時間は真に必要な節目のみ。結果待ちの同枝pushを避ける |

**正直な評価：** 技術的な実プレイ基盤は大きく改善した。一方「本当に遊べる正式4v4」への進行は原作衝突権限と0/16で頭打ち。最近の検証だけで完成へ進んだと語ることはできない。**この文書コミット自体はゲーム完成度を上げない**。次のチャットが無駄な調査を避け、本質の実装に時間を戻すための管理改善にすぎない。

## 5. 今後の実行バッチ（固定F1〜F5は変えない）

### P0 — 新チャット最初の最短確認

`START_HERE.md`のV15入口→本V15全文→上位固定2文書を読む。最新研究HEAD、main、Draft PR #5、実装SHAとRUN [#42365628667](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667)／固定B58監査 [#42364849596](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42364849596)を一度照合。これらがすでにSUCCESSなら**追加Q/B58/Rail試験に戻らない**。START_HEREの旧head/旧runを現在の情報として扱わない。

### P1 — **次の最重要F3実装**：既存のゲームプレイを本当に一本化

最優先は、新QA番号ではなく、実際のユーザーが**SOURCEモード/武器を選ぶ→本物7CPUと動く→原作を撃って塗る→インク消費→OWN Squid回復→Human再射撃→実サブ投擲/爆発→180秒終了→可視ボタンで同武器の新世界へ再戦**できる**同一ゲームの体験**を、実装・不具合修正で改善すること。

- 既存入口：`src/app/SourcePlayPortal.ts`、`UndertowF3PlayablePreviewApp.ts`、`ProjectileSystem.ts`、`SubWeaponSystem.ts`、`PlayerResources.ts`。既存真正runner：`scripts/t21-b413-native-source-fire-refill-reshoot.mjs`、`scripts/t21-b419-real-full-round-fresh-replay.mjs`、`scripts/t21-b430-full-second-source-round.mjs`、既存B385/B390/B393。**まず最初の本物の操作上の断絶を1〜2件だけ特定して実ゲームを修正**。機能が既に成立しているなら無理にコードを増やさない。
- 代表ケース候補は**Twin Comets＋Snap Bomb**（旧B390真正180秒、B393実Fキーサブ2爆発あり）。Needle SMGはA1/A2の補助的対照に限定。**この最新HEADで全機能の同一RUNがPASSしたとは未確認**。全4モード×全12武器の48通り180秒テストは実行しない。
- 受け入れは**同じnative world・実Chromeのユーザー入力**で、CPU実7/7、原作足支持・Impact変更セル、shot/ink、本人イカ/OWN回復、sub投擲/爆発（爆発しても原作塗装0なら0と記録）、実180秒TIME_UP、見える再戦ボタン実クリック、同じ選択武器の**新世界STAGING tick0・180秒・原作セル/shot/CPU状態初期化**。これはSOURCE-only非得点であり敵HP/公式Winnerを受け入れ条件に捏造しない。
- 初手に歴史的真正RAWを確認した結果、すでに欠陥がないなら重いCIを繰り返さず、実際に遊べる別の大きなF3/F5機能へ進む。**テスト器のみのコミットを新ゲームプレイと呼ばない。**
- 手順：必要コードを一括変更→静的/関連Unit→既存**1系統**真正Chromium→RAW/PNG/独立判定→研究branchへCAS非force保存。過去CIが十分なら固定RAW再利用。新workflow/大量小コミット/無意味なフルCI再走はしない。

### P2 — 自然CPU対敵戦闘（正式ゴールを見失わない）

同じ正規原作上で自然に出会う根拠が実証された場合のみ、実本人/敵HP・撃破・150tick復活を同一世界で検証。未承認の対岸経路ならHPトリックやActorワープで達成扱いせず、**F4依存HOLD**として隔離。原作不足であってもF3の独立した本物のプレイ品質は続ける。

### P3 — F4の再開条件（原本が現れた時だけ）

適法・同一版Ver.7.2.0+通常Turfで元`Fld_Temple01`collision mesh／`.bphsh`／flags・Face属性が得られた時のみ調査再開。版/ルール/出典/hash→衝突Face/flags→0.30m原作カプセル→Rapier/Recast→Human＋CPU自然経路→自然HP/撃破/復活→**別途Scoreable**。元原本がない現状ではF4診断fixtureを無限に増やさない。非公開データGitHubアップロード禁止。

### P4 — F5と本番ゲート

人間の操作感、FPS、視認性、音、ARTは本当のゲーム画像と本人の短い試遊で別途判定。本人試遊が必要な節目にはこちらで準備をしてユーザーの操作を一度にまとめる。**F1〜F5全条件＋正規原本＋本人承認**が揃うまではmain merge/PR merge/Pages公開/production activation禁止。

## 6. 最小運用と正本の読込順

- 毎回の報告は「何が**新しく遊べるか**／実装SHA／真正RUN+RAW／PASSの狭い範囲／主HOLD（0/16、0 Scoreable）／次の実ゲーム差分／ユーザー操作回数」のみ。推定の完成率や大げさなPASSは禁止。
- docs-onlyコミットは**開発進捗ゼロ**として扱う。既存CIの自動トリガに無用な発火がないか確認。原則、新しい引き継ぎ文書を毎バッチ作らない。
- 読む順：[`START_HERE.md`](../../START_HERE.md)最上段→**本V15全文**→[固定F1〜F5](../../T21_FAST_TRACK_ROADMAP.md)→[固定Fast Track](FAST_TRACK_EXECUTION_JA.md)。必要時のみ[V14](BROWSER_INK_TPS_COMPLETE_CRITICAL_HANDOFF_AFTER_A1_A2_A3_Q_20261107_JA.md)、[`DECISIONS_JA.md`](DECISIONS_JA.md)、[A1/A2/A3台帳](../qa/T21_SPRINT_A1_A2_A3_REAL_CHROMIUM_ACCEPTANCE_20261107_JA.md)、[F4原作版・衝突](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)、[Phiveゲート](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)。旧START_HEREの「現HEAD」は履歴。
- ユーザー操作は**新チャットへ下記一段落を貼るだけ**。ZIPダウンロードやWindows操作は不要。

## 7. 新チャットへの最短貼り付け文

> Browser Ink TPS / T21 / Undertow Spillwayの**既存開発を継続**してください。新企画や上位方針変更ではありません。GitHub `ryomashibaba/browser-ink-tps`、唯一の作業ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105`。まず`START_HERE.md`最上段と`docs/continuity/BROWSER_INK_TPS_V15_CRITICAL_HANDOFF_AFTER_SWEEP_CHARGER_20261107_JA.md`を**全文**読み、固定`T21_FAST_TRACK_ROADMAP.md`と`docs/continuity/FAST_TRACK_EXECUTION_JA.md`、旧V14・過去の成功/失敗/反省を継承してください。最新HEAD・main・Draft PR #5・最新CIを確認。B58真正3面CLEAR [#42364849596](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42364849596)とRail Charger実射撃 [#42365628667](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667)は既に成功済みなので重複QAせず、V15第5章P1の**プレイヤーが遊べるSOURCE選択武器＋サブ＋インク補給＋真180秒＋再戦の統合バッチ**を、既存コード/証拠から実装・検証し研究ブランチへ保存してください。小QA/HUD/ワークフロー/コミット数を完成の代用にしないこと。固定原作25/17/26/0・敵味方自然0/16・公式得点/勝敗/正式4v4/ART/公開HOLD、架空床/NavLink/ワープ/偽命中禁止。main/T19C/T20/原本/Pages/PR#5保護。GitHub上でCAS非force、Work/Computer Use/追加課金は毎回個別事前承認、ユーザー作業原則0回。計画だけで終わらず、可能な範囲の**実ゲーム本体の改善→必要最小限QA→真正証拠→GitHub保存**まで進めてください。
