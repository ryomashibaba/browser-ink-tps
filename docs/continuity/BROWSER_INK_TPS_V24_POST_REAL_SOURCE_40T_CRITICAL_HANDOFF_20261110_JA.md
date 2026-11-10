# Browser Ink TPS / T21 — V24 原作11面・40tick実証後の全体批判と実装再開正本
作成日: 2026-11-10 JST。ユーザーの明示依頼による**一度限りの新チャット引き継ぎ**。docs-onlyでありゲーム完成・F4正式承認ではない。固定F1〜F5・Fast Track・永続決定を変更しない。今後、同様のV25文書を惰性で量産しない。

## 0. 正本入口と最重要の結論
- Repository: https://github.com/ryomashibaba/browser-ink-tps
- 研究の唯一の書込先: `research/t21-integrated-a1-c-patrol-four-mode-20261105`。本書作成**前**のライブHEAD: `97db4b9ab561cd4238fda0f8448211a25445c214`。本書を保存するとdocs-only分だけHEADが更新される。次チャットは必ず最新HEAD/commit diff/CI/PRを**ライブ取得**する。
- 読む順序: `START_HERE.md`最上段 → 本V24全文 → `docs/continuity/BROWSER_INK_TPS_V23_ORIGINAL_STAGE_CRITICAL_REBUILD_HANDOFF_20261110_JA.md` → 必要箇所のV22 → `T21_FAST_TRACK_ROADMAP.md` / `docs/continuity/FAST_TRACK_EXECUTION_JA.md` / `docs/continuity/DECISIONS_JA.md`。旧文書中の「最新HEAD」「次に行う」は当時の履歴。
- **技術的前進**: SHAで照合された原作F3G `FLOOR` の11面（Face 259408〜259418、材質 `Fld_Temple01_FloorConcrete01`）は、別の隔離Rapierステージに置くと入力CONTINUE/RELEASEいずれもtick1405に着地。追加の別テストでは、仮想的なY0開始点から原作11面上の1m・40tick連続支持、端点誤差0.001367m。これは**実ゲーム衝突権限の証明ではない**。
- **実ゲームの本質的未達**: 本人Windows普通プレイでの広域床表示・支持不一致、CPU少数に見える・SAFE STOPなどの障害の完全解消は未確認。自然敵味方経路 **0/16**、Ver.7.2.0 Turf原作collision flags/配置・中央8ギャップFace権限0、Scoreable 0 / Winner NONE、正式4v4/ART/公開HOLDは**不変**。
- **新しい運用の結論**: 11面上の似た隔離試験をさらに積み上げても、ゲーム完成には近づきにくい。F4原作権限調査は対象と回数を限定する。根拠がなければその部分のみHOLDし、認証済み25床内のF1〜F3/F5本体改善へ**直ちに切り替える**。

## 1. 固定ゴールと保護境界
目標: 『Splatoon 3』Ver.7.2.0以降の**マテガイ放水路／Undertow Spillway通常ナワバリ**を原作に可能な限り忠実なブラウザ3D TPSで再現。人間1＋本物のCPU7による自然4v4、180秒、実Rapier/Recast移動、武器/実射撃/インク/イカ/サブ/HP/撃破/150tick復活、公式得点・勝敗・再戦、人間の普通の実試遊・性能/ART最終審査がゴール。
- F1: 8人実Actor/原作登録床の再合流。
- F2: 原作Rapier KCC + Recast/Crowdの安全な連続移動。
- F3: 人間＋CPUの本当の180秒縦切り戦闘/射撃/塗装/回復/復活/再戦。
- F4: Ver.7.2.0正規 collision/Actor/Face/flags、中央と対岸の通行・原作Scoreable権限。
- F5: 本人普通の操作、ゲーム画面、カメラ、ART、FPS、最終QA/明示的公開承認。
F1→F5を再定義・基準引下げしない。実装の順序ではF4証拠不足をF1〜F3の独立進行の妨げにしない。
- 凍結SOURCE＝**25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。自然敵味方経路0/16。公式Winner NONE、`activationReady=false` / `productionAuthorized=false` / `unrestricted4v4Certified=false`。
- 研究ブランチだけ非force・expected_sha CAS・単親コミット。main、T19C/T20、固定ロードマップ、正式QA、Draft PR #5、Pages、本番、PRIVATE/原本、本人Windowsと設定は未承認で変更しない。2026-11-10監査時main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、PR #5 Open/Draft head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。都度最新照合。
- 原作根拠のない床/橋/斜面/NavLink/Actor/透過足場/Scoreable、全OBJの無条件衝突化、ワープ/偽HP/偽命中/偽得点/偽勝敗/人工時計/安全閾値緩和は禁止。原作OBJ/PRIVATE抽出物・派生バイナリを公開リポジトリ・artifact等へ無断持ち出さない。既存のSHA固定公開素材を一時取得する手順は、それ自体が原作版・衝突権限を保証しない。
- 通常はChat＋接続GitHub。本人操作原則0、追加課金0円。Work/Computer Use/本人Windows・管理者/高負荷・正式QA・原本・公開は既存の個別明示承認条件に従う。他プロジェクトには越境しない。

## 2. 根拠ある実証／証明しないこと
| 日時/証拠 | 実際にPASSした範囲 | 絶対に拡張しない範囲 |
| --- | --- | --- |
| K1 `#42493927363` | 既存原作登録坂への真WASD/人間KCC接地 | 全域の床・普通のWindows試遊 |
| K2 `#42523962398` | 実CPU7の実着弾・塗装 | 自然な敵HP・撃破/復活/対岸経路 |
| K3 `#42540893238` SHA `d330138...` | 該当SHAの同一世界180秒、実射撃/回復/サブ/CPU7/再戦 | 現HEADの同じ180秒、正式4v4/得点/勝敗 |
| 2026-11-10 `#42786197295` | 人工床で真正Rapier 2条件KCC、87/87選択Vitest + TypeScript/Vite | 原作衝突属性 |
| `#42794289300` | 原作SHA一致のF3G 11面で隔離Rapier着地2条件tick1405 | 実際の後続Windows入力・原作7.2.0 flags |
| `#42799943705` | 13アンカー原作光学面 vs 既存Rapier床の対応の実測 | 全域・中央/対岸の人間・CPU連続通行 |
| **`#42801475771`** HEAD `97db4b9...` | **原作11面からの仮想Y0開始1m/40tick連続支持、端点誤差0.001367m。9ファイル87 PASS＋2 SKIP、TypeScript/Vite、SHA固定の原作11面限定CIが成功。重いnative試合SKIP。** | 実観測の落下から連続した40tick、敵CPU Recast、ゲーム本体修復、原作collision flags、ART |
- F3Gでは原作静的57,578三角形を公開元からSHA固定して解析。正規FLOORバイナリ2,146面のSHA-256は `c2769136586b9a68657a5a090bafbe58d2ffcd5f4af23cf6b9ca8e6073f38fe4`。内11面は元Face `259408〜259418`。オブジェクト名/材質に`Floor`と付くことはゲーム版の衝突許可証ではない。
- 本人Windowsログ `T21_W10B113_ORIGINAL_FLOOR_TRACE_TICK_1498.json` はtick1388〜1390の真観測から空中下降を示す。後続tick1391〜1405の実入力は不明。2条件CONTINUE/RELEASEは**反実仮想**。tick1405の原作11面隔離着地は真Rapierだが、本番プレイヤーが同経路を辿った証明ではない。
- 13アンカー: K1坂接触・右低所・中央低所など部分的高さ一致。tick1390の見た目FLOOR Y0に対し登録Rapier支持なし。OPPOSITE_SPAWN_REGION参考点では測定高度で支持なし。これらは点サンプルで、モデル全域の座標変換・衝突版一致を保証しない。光学F3G/F3Lのモデル→project XZ局所変換（約26.116°/scale0.964211、Y−3）を全域保証に拡大しない。
- 本人の「自陣だけ重なってる」という実機画像評価は未解消。通常STAGINGのCPU2/7等をCPU全員の失敗と取り違えず、SAFE STOPの真初発原因も現HEADの普通の試遊で解消とは断言しない。

## 3. 批判的評価: 成功・失敗・反証
**維持**: 原作忠実性、停止権限、SOURCE凍結、SHA/実Browser/Rapier証拠、通常試合と研究PASSを分ける、0円・低操作。
**失敗1: 代理指標に最適化**。11面隔離・13点の成功は技術的進歩だが、普通に遊べる完成ではない。KCC試験・GitHub緑・長いHUD・新しいB番号を「ユーザー体験の改善」と記さない。
**失敗2: CIや細かな修正の反復**。型エラー/JS -0/選択テストSKIP等で複数コミット・RUNが必要だった。次は関連箇所をバッチで静的確認→必要な既存短いCI1回→真Browserは実ゲームの変化があるときだけ。空コミット・再RUNのためのRUNは禁止。
**失敗3: 元情報の権限と実用性を混同**。「OBJ/Face SHA一致」「光学床の厚み」「隔離Rapier着地」「その場所が元ゲームで歩行許可」は別命題。元の7.2.0 Turf版・Actor配置・collision flagsが確認されなければ**本体床へ昇格禁止**。
**失敗4: 局所一致で全体を誤推定**。自陣のみ重なった画像と13アンカーでは全域対応不明。さらに13中のREGISTERED_MODEL_REGIONは人間の歩行実測ではない。対岸などUNKNOWNをFAIL/不存在にもしない。
**失敗5: 優先順位の漂流**。SAFE STOP・普通の床欠落・CPU自然戦闘を直す代わりに警告/診断/HUD/文書を重ねた。引き継ぎ後は新たなダッシュボード・広範CI・文書を作らず、遊べる成果で判断する。
**反証**: (a)「11面KCC PASSだから正式床に追加」→flags不明で不可。(b)「flags未判明なので何も進められない」→既存25床の合法F1〜F3改善は可能。(c)「数値が多いほど完成」→本人普通の遊びの失敗が残り不可。(d)「原作モデルを全衝突化」→壁/屋根/ガラス等で破綻し禁止。(e)「全域の見た目は局所座標補正だけで合う」→p95大残差・実画像と矛盾。

## 4. 修正後の実行契約（次のチャットはここから実装）
**最優先の一工程：F4根拠の判定を有界化し、必ず実ゲーム価値への出口を持つ。**
1. 現HEAD/最新Actions・差分・main/PR/保護を読み取り専用照合。`#42801475771`の11面KCC/40tick証拠と`#42799943705`の13点を再利用し、同じ物理試験を再実行しない。V24を読んだら次のV25文書を書かず実コード・根拠へ。
2. F4権限に関して**一つのまとまった読み取り専用探索**を実施。対象は**Ver.7.2.0 通常Turfの正規Banc/BYML配置・Collision flags・Actor transforms・原作11面 `259408〜259418` の実配置と歩行属性**、および中央/対岸の元Face根拠。手元既存資料・GitHubコード/既存RAWを優先。根拠がないことを資料名/版/必要な欠落データで明記し、同じ探索を形を変えて何度も繰り返さない。原作名/材質・後年のGitHubアップロード日・公開KiTrixテーブル・光学一致だけでflagsを推定しない。
3. **権限と連続経路が独立認証できた場合だけ**、既存研究パイプラインで11面の原作接地→既登録坂までの**同じ人間KCC**連続性とRecast実CPUサイズでの接続・壁/他床二重衝突/カメラを隔離検証。固定25/17/26/0は保持し、原作情報＋安全性＋正式許可が揃うまでゲーム本体/正式QA/本番に昇格しない。
4. **権限が得られない、または原作版が不明ならそのF4床候補は即HOLD**。同じ11面の検証を追加せず、**認証済み25床の実ゲーム本体**で1つの体験を改善する。具体的には、本人の支持済み床で表示が欠ける問題の再現が得られれば描画修復、それが不可能なら同一WORLDの実プレイヤー移動→実射撃/HP→実CPU視認・自然対峙の障害を一つ選ぶ。ただし敵を偽出現させず、実遭遇不可なら独立するPLAYER操作/カメラ/復旧性能を改善する。ソース権限外の架空地形で進めない。
5. 1まとまりの**ゲーム本体差分**→既存小テスト/tsc/Viteを可能な範囲で実施→本物の体験変更に必要な既存Chromium 1回の独立証拠→非force CASで研究ブランチだけ保存。公式4v4を認証しない。本人の通常Windows 1回試遊は**実際のゲーム挙動改善後、個別承認を得たときのみ**。事前の過去ZIP/スクリーン再提出は頼まない。

**停止/切替ルール**:
- 版/flags不明＝11面正式床昇格HOLD。既存のソースを無断入手・公開・ゲーム面積を捏造しない。
- 既存SHAで証拠がある＝K0〜K3/11面/13点の重複試験停止。新CI・重い180s自動反復・HUD・文書量産停止。
- 純粋なdocs-only更新はゲーム進歩0と明記。今回の引継ぎ以後、追加引継ぎは本人の明示依頼時のみ。
- 通常Windowsの実機・正式ART・CPU自然経路/正式4v4は**未認証**と明記。将来の成功を保証しない。
- 毎報告は「実ゲーム価値」「証拠のSHA/CI」「PASS範囲」「残HOLD」「次の一工程」「本人の操作要否」を簡潔に。成果のない小QAや長い履歴を報告単位にしない。

## 5. 新チャットに渡す最短プロンプト
Browser Ink TPS / T21 / Undertow Spillwayの既存開発を継続してください。新企画・上位方針変更ではありません。GitHub `ryomashibaba/browser-ink-tps` 研究branch `research/t21-integrated-a1-c-patrol-four-mode-20261105` の `START_HERE.md` 最上段からV24 `docs/continuity/BROWSER_INK_TPS_V24_POST_REAL_SOURCE_40T_CRITICAL_HANDOFF_20261110_JA.md` を全文読み、V23以前・F1〜F5・Fast Track・永続決定を継承。現HEAD/CI/PR/保護をライブ再確認し、V24第4節の最優先工程を**文書制作でなく実作業**で始めてください。2026-11-10基点HEADは `97db4b9ab561cd4238fda0f8448211a25445c214`（docs-only保存前）、#42801475771で原作11面2条件着地・仮想開始1m/40tick支持PASS、#42799943705で13アンカーPASS。しかし原作Ver7.2.0 flags/Actor配置/通常ゲーム床/自然敵経路/公式Scoreable/ART/公開はHOLD。F4権限を有界な1回の読み取り調査で確定できなければ、その部分のみHOLDして認証済みSOURCE内の遊べる本体改善へ切替。25/17/26/0・0/16・Winner NONEを維持し、架空床/経路/ワープ/得点・閾値緩和禁止。main/PR#5/Pages/正式QA/原本/PRIVATE/本人Windows保護。研究ブランチだけexpected_sha CAS nonforce。本人操作原則0・追加課金0円、Work/Windows・高負荷は個別承認。Docs/CI/HUD量産や既存テスト繰返し禁止。成果・SHA/CI・未認証・次工程だけ報告してください。
