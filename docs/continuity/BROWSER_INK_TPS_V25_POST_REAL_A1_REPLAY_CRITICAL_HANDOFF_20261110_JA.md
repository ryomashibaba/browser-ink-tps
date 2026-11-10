# Browser Ink TPS / T21 — V25 既存開発の厳格な全体批判・優先順位改革・一度限りの新チャット正本
作成：2026-11-10 JST。**本人が全計画・反省・方針を再検討し新チャットへ引き継ぐよう明示したため今回一度だけ作成**。V24/V23以前と固定F1〜F5、Fast Track、DECISIONSを継承する。ゲーム本体を変更しないdocs-only記録であり、正式F4/F5や4v4の認証ではない。後続のV26等を惰性で制作しない。

## 0. 読む順序と作業開始契約
- GitHub `ryomashibaba/browser-ink-tps`、**書込み可能なのは研究ブランチ** `research/t21-integrated-a1-c-patrol-four-mode-20261105` のみ。本V25保存前の確認HEAD `2a905e84cb735ade83ef15a958fe7f3d6da402c6`。保存後はHEADが変わるため**次チャットは必ず最新HEAD/差分/Actions/PRをライブ再確認**。
- 読む順：`START_HERE.md` 最上段 → 本V25**全文** → V24 `docs/continuity/BROWSER_INK_TPS_V24_POST_REAL_SOURCE_40T_CRITICAL_HANDOFF_20261110_JA.md` → 必要に応じV23/V22、`T21_FAST_TRACK_ROADMAP.md`、`docs/continuity/DECISIONS_JA.md`、`docs/continuity/FAST_TRACK_EXECUTION_JA.md`。旧文書のHEADや「次の工程」はその時点の履歴。
- 本書は新仕様ではない。次チャットで**再度の計画・概要・移行文書を作らず、最後の第6節の実ゲーム改善へ進む**。資料不足なら真偽を明確にしてできる範囲の実作業を優先する。

## 1. 最上位の固定目標と保護条件
最終目標：『Splatoon 3』Ver.7.2.0以降の**マテガイ放水路（Undertow Spillway）通常ナワバリ**を可能な限り原作どおりに再現するブラウザ3D TPS。人間1＋本当のCPU7、自然な4v4、真正180秒、人間KCC／CPU Recast・Rapier、実射撃・塗装・イカ・サブ・HP・撃破・150tick復活・正式スコア／勝敗・再戦・通常Windows人間試遊・ART/性能最終認証を目指す。Big Run、トリカラ、旧版は混ぜない。
- 固定F1＝原作登録8人Actor準備、F2＝同じ原作床で連続物理移動、F3＝操作可能な本物の試合縦切り、F4＝7.2.0原作地形/Actor/Face/Collision・中央/対岸・Scoreable権限、F5＝本人通常試遊/見た目/操作/性能/最終公開承認。**定義・達成条件は変更しない**。F4で止まる範囲だけHOLDし、独立のF1〜F3/F5は並行進行してよい。
- 現在の登録SOURCEは **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。自然敵味方経路 **0/16**、正式Winner **NONE**、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。原作根拠と別途明示承認なしに昇格させない。
- **絶対保護**：main、T19C/T20、本番/Pages、固定ロードマップ・正式QA、Draft PR #5、PRIVATE・原作バイナリ/画像/派生抽出物、本人Windows・設定。研究ブランチ更新は最新HEADを確認し、単親コミット＋`expected_sha` CAS＋`force:false`のみ。2026-11-10確認main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`、PR #5 Open/Draft/unmerged head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`（以後必ず更新確認）。
- 原作Face/flags/Actor証明なしの床、坂、橋、NavLink、得点面、仮Actor、透明救済足場、モデル全体の無条件コリジョン化、CPU/人間ワープ、偽HP・射撃・塗装・Tick・勝敗、閾値緩和禁止。現場テストのための人工STOP/CLEARも禁止。元の非公開素材の外部公開/CIへの無許可アップロード禁止。外部サービス追加課金原則0円、本人操作原則0。Work/Computer Use、本人Windows、重い長時間CI、正式QA・PRIVATE・公開等は既存の**個別承認条件**に従う。MAB/Strata/DECEMBER_2026等、別プロジェクトへ越境しない。

## 2. 新たに確定した証拠（過去PASSとの境界）
- **A1協力実プレイとCLEAR→R新ワールド：限定PASS。** 研究HEAD `2a905e84cb735ade83ef15a958fe7f3d6da402c6`、GitHub Actions [#42826851912](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42826851912)、artifact ID `13769513526`（`w10b162-actual-original-human-A1-ally-sync`）、`t21-w10b162/w10b200-real-replay.json`。本物のCLEAR（tick1927、実人間808塗装セル、接地35.74m、A1元Impact34セル）、ポインタ解放・真CDP R送信後、`performance.timeOrigin` 1794318147764→1794318428105.6、NEW STAGING、native tick0、A1 practice IDLE、CPU初期再合流0、actor teleport0。**同一SHAで二度目のA1ミッションや正式4v4が成功した証拠ではない**。DOMキー収集は新ページへ遷移したため `actualKeyRDispatch=[]`、単独DOM捕捉証明はなく、CDP入力履歴＋新ワールド実測による限定PASS。
- **本当の落下STOP後のR再入場：HOLD（不達＝Rバグ確定ではない）。** 同Actions全体は **FAILURE**。後半の自然CDP移動はSTOPに到達しなかった。`t21-b440-fall-R/b440-short-real-original-human-foot.json` は `verdict=HOLD`、`P0_NO_ACTUAL_PHYSICAL_FALL_STOP_R_NOT_PROVEN`、最後のtick1074で人間は元自陣登録床 `UndertowT21D:spawn-high-positive-z` に接地、STOPなし、真CPU7再合流。**この移動を繰り返してもSTOP-Rの証明にはならない**。真正STOP発生の既存人間ログは別時刻・別経路で、現SHAのSTOP→R連続証拠とは混同禁止。
- **通常PLAYING中のR誤再戦防止：限定PASS。** 前SHA `80ec39ec71ebe7e651c678b538550393b33de4c7` の [#42818355011](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42818355011) で、本物CDP R後 tick1056→1062、同じ原作ワールド/URL/7CPU、0 scoreable、Winner NONE。後続R経路の安全修正 `0c598b33`・`38d0aba7` は軽量CI PASSだが、最新SHAの通常PLAYING Rを再度Browser認証したとは記さない。
- **過去の有効証拠を再実行しない。** K1 [#42493927363](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42493927363) 局所真KCC、K2 [#42523962398](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42523962398) 真CPU7塗装、K3 [#42540893238](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42540893238) 旧SHAでの180秒/武器/再戦。原作SHA一致11 Face（259408〜259418）の隔離Rapier、仮想開始1m/40tick [#42801475771](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42801475771)、13アンカー [#42799943705](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42799943705) はいずれも**研究限定**で元7.2.0正式衝突の許可ではない。
- **実際の未解決障害：** 本人2026-11-10 Windowsレビューでは元F3G/F3L高精細見た目と25登録床が自陣で部分一致、中央以降でずれ、普通の歩行支持・視認不一致の解消未認証。原作7.2.0 Turfのcollision flags/Actor transforms/中央8ギャップが未認証。自然敵味方0/16、公式Scoreable0/Winner NONE、敵HP/撃破/復活を伴う自然4v4、正式ART/F5、公開HOLD。
- F4識別上、公開SceneInfo v720の `Vss_Temple01` → 改修後マテガイ放水路という原ID根拠はあるが、KiTrix OBJが同一モード/ゲームコリジョンを含むとは言えない。KiTrix OBJ／FaceのSHA、材質名、光学・孤立KCCは**collision flagの代替ではない**。既存文書 `docs/qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md` に詳細あり。

## 3. 全体計画の批判的評価と反証
**良かった点**：SOURCE証拠を厳格に扱い、偽床・偽戦闘・偽スコア・ゲーム中ワープを拒否。Rapier/Recast、CDP真入力、真CPU7/原作塗装・真正CLEAR、バージョン別モデルIDの対応と不可認証を分離。main/PR/本人Windowsを守り、SHA＋生証拠の再利用が可能。これらは全て維持する。

**問題A（最重要・優先順位の逆転）**：小QA、HUD、Rキー、安全ハンドラー、長い結果レポートが続く一方、見える床と実支持の不一致・中央経路0/16・自然敵戦闘は未達。RのTRUE CLEAR→新世界は今回証明されており、これ以上細かいRの修正・STOP到達のための同じ経路反復は**費用対価値が低い**。成功済の機能を主戦線から外し、未完成の体験を先に作る。
**問題B（検証準備にCI失敗を量産）**：今回の一括検証準備でワークフローYAML構文/ジョブ条件の不備があり、[#42824482278](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42824482278)、[#42824754059](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42824754059)、[#42825014056](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42825014056) は**ゲーム実ブラウザFAILではなくジョブ未起動の設定FAIL**。複数の修正コミットで同じ問題を追いかけた。原因は変更前の包括的YAML構文検査/トリガ条件レビュー不足と、チェックポイントの細分化。今後は**push前に変更対象をまとめて構文・型・条件・必要証拠を静的点検**し、無用なpush/CIファンアウトを抑える。
**問題C（数値の拡大解釈）**：0/16は実通路未認証を示し、存在しない断定や後付けで16/16へ変更してよい許可ではない。11面孤立着地成功→本ゲーム床追加、モデル名`Floor`→ゲーム内collision、過去の180s→現在の正式4v4、URL新世界→旧STOP R成功、CI緑→人間普通プレイ完成、をいずれも禁止。
**問題D（過度な慎重さの逆効果）**：F4衝突根拠がないからと全工程停止すると「いつまでも遊べない」。それを埋めようと無根拠床を足すのはさらに悪い。**F4の当該FaceだけHOLD**、既登録25床上のF1/F2/F3と表示・視認性・入力の実ゲーム改善を並行する。
**問題E（証拠より人間体験の乖離）**：複数のChromiumテストとWindowsの通常操作は同じではない。本人に毎回ZIP/旧ログ/同じスクショを要求せず、実際のゲームコード改善を1バッチ完了した後、個別に許可が得られる場合のみ短い通常Windows試遊を1回お願いする。

**再批判と改訂後判断**：
- 「F4を先に全部解決」は原作flags不明で停滞する→**1回の有界資料確認後HOLD/独立機能へ切替**。
- 「見た目だけ先に美しくする」は実床不一致が残り見せかけの進歩になる→**25登録床と同じ座標・接地・通常PLAYER見た目をひとつの観測済み区間で整合させる**。グローバルな光学モデル移動や原作全衝突化はしない。
- 「自然敵戦闘をすぐ成立させる」は現実の自然経路0/16のため架空遭遇を誘発する危険→**既登録床で合法的に到達する場面のみ実戦評価し、不可能なら独立のプレイヤー移動・射撃品質を先に改善**。
- 「すべてを毎回180秒試す」は費用・時間・CI負荷が高い→**1まとまりのユーザー価値変更につき既存軽量チェック1回、真正ブラウザ統合原則1回**。失敗時は生証拠を読んで原因を修正、同条件無意味再実行を禁止。
- 「STOP Rを今すぐ認証」は自然STOPが起きておらず短い同じ道で不可能→**人間の既存真STOP経路から安全に再現できる新しい根拠が現れたときに再開**。止まった世界を無許可で復帰させない。

## 4. 今後の優先順位（既存F1〜F5そのまま）
**優先1：通常PLAYERの原作登録床上の見た目と物理を一致させる実ゲーム改善**（F2/F5。ただしF4原作証拠無しの床追加は禁止）。
- 現行の高精細光学モデル、登録Rapier 25、実PLAYER描画、カメラ、現在のレビュー用座標変換を**既存13アンカーとWindows画像を再利用して**読み取り比較。中央は「UNKNOWN」のままでもよいが、既登録床1区間で再現できた表示/支持不一致の根本原因を特定する。旧40tickや13点テストは再実行しない。
- 同じSOURCE座標系・原作登録solidに限定して**1つの実際にプレイヤーが見る描画・床対応の修正**を狙う。修正の根拠がまだない場合に無理に位置を動かさず、調査の範囲を限定して優先2へ切替。既存凍結25/17/26/0の物理・スコアは保護。レビュー専用のモデル変換を全域正解と誤認しない。
- 合格指標は「同一実SOURCE世界の既登録支持点、KCC、見える床/カメラの一致・非貫通、実画面の使いやすさ」の**前後実測**。単にHUD行数や新しい診断件数の増加では不可。

**優先2：実人間操作・実CPUを同一局所プレイへ統合する**（F1/F2/F3）。
- 既存の本物7CPU再合流・Rapier／Recast・真正人間KCC、実射撃/ペイント・HP/150tick復活のコードを読む。**原作登録済み区間だけ**で続く自然な移動、カメラ、発射・回復・サブを優先し、遭遇できた場合のみ本物の敵HP・撃破・復活を認証。敵を隣に出現させる、CPUをワープ、非存在の通路や偽遮蔽を付与することは禁止。
- 180秒やA1再戦の既存PASSを流用する。新しい真R CLEAR試験は新ゲーム機能に直接関わる回帰がない限り再実行しない。

**並行・有界F4ゲート**：
- 元Ver.7.2.0 TurfのBanc/BYML/Actor transform/collision flags/原作Face（とくに11面259408〜259418、中央8ギャップ）の証拠を**既存資料で1回だけ照合**。版・flags不明なら正直にHOLD、原本・非公開データを無断取得しない。
- 根拠が正式に確認できた対象だけ隔離Rapier KCC＋CPU本物半径/Recast連続移動・二重衝突・カメラ検証。成功しても原作承認/ユーザー明示承認前は通常本体に昇格しない。旧11面の孤立KCC再実行は禁止。

**最終F5**：通常本人Windowsの短い実試遊、ART、フレーム性能、敵の視認・武器反応、全条件の統合・明示的な公開審査。未承認の本番/Pages/PRマージは禁止。

## 5. 開発効率・負担軽減の具体ルール
1. 1バッチ＝**認証済みSOURCE内の実プレイ価値**を一つ改善。事前コード調査と変更をまとめ、細かいセーフガードだけで「次の工程完了」としない。次チャットでは新しいロードマップ・HUD・新QA・再引継ぎ文書を先に作らない。
2. 1バッチで最新HEAD/CAS、対象差分、必要な既存証拠を読んでから設計・コード変更。一貫した差分を1〜少数コミットで研究ブランチに保存し、**push前に静的なTS/Node/YAML検査（実行環境がある範囲）**をまとめる。ワークフロー構文不備の連続pushは禁止。
3. 既存のビルド/小テストだけを開発中に使用。実挙動変更に対してのみ元からある真正Chromium1系統。重い180s・STOP意図的誘発・同一原作11面テスト・重複キューを避ける。最新の高負荷は個別承認条件を確認。新ワークフローや意図のないpushトリガを増やさない。
4. **PASS/FAIL/HOLD/未実施を実測＋SHAで厳格に記す**。特にCI #42826851912は「A1再戦の限定PASS＋真STOP未発生ゆえ全体FAIL」であり、「R全部成功」「R修正が失敗」はどちらも誤り。
5. 操作を求める前にGitHub/保存済みartifact/既存コードを自律的に読む。必要な本人作業は本当に改善された後の**1回の短い実プレイのみ**、あらかじめ個別承認を得る。PowerShellやZIP作業を繰り返しさせない。Work/OS操作・PRIVATE・課金等の明示許可は省略不可。
6. 毎回の報告は【実ゲームで何が良くなったか／SHA・CI・根拠／どこまでPASSか／HOLD／次の唯一の工程／本人操作】の短いセット。研究ドキュメント更新はゲーム進捗0と区別する。

## 6. 新チャットで最初に行う「一つの工程」
**GitHub最新HEAD・差分・既存真証拠の確認後、F4版/Collision flagsの証拠を一回の有界調査で判定し、即座に実ゲーム改善へ進む。** 根拠が足りないF4 FaceはHOLDにし、既存のF3L/F3G光学描画と登録25 Rapier/ユーザー通常SOURCE描画の**自陣→下段→認証済み坂の既存原作区間**で、実PLAYERが見る地面と支持面の既知の不一致を1件特定し、誤認なしで修正可能なコードを一まとまりで実装する。単なる警告・HUD・一時的な11面隔離試験では終了しない。対応できる描画不一致が確証できなければ、許可されたSOURCE局所内で人間操作／自然CPU視認・射撃の本当の改善に切り替える。必要なテストは1バッチの最後だけ。
- 対象に実装上の変更がない限り、A1 Rと落下STOP Rの再試験は禁止。真STOP再入場は**HOLDのまま**、真正STOPを再現できる安全な人間ルートの新たな証拠が出たときだけ個別判断。既存の真A1 R結果を保存・再利用する。
- 本人操作0、追加課金0。固定F1〜F5・SOURCE25/17/26/0・自然0/16・Scoreable0/Winner NONE・保護境界を維持。正式4v4/ART/公開はHOLD。

## 7. 最短の新チャット引継ぎプロンプト
Browser Ink TPS / T21 / Undertow Spillwayの既存開発を継続。新企画・F1〜F5の上位方針変更ではありません。GitHub `ryomashibaba/browser-ink-tps` 研究ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105` の `START_HERE.md` 最上段と**V25** `docs/continuity/BROWSER_INK_TPS_V25_POST_REAL_A1_REPLAY_CRITICAL_HANDOFF_20261110_JA.md` を全文読み、V24以前・Fast Track・DECISIONSを継承してください。最新HEAD/CI/差分/PR#5をライブ照合。基点HEAD `2a905e84cb735ade83ef15a958fe7f3d6da402c6`（本V25保存前）。A1真正CLEAR→R新ワールドは #42826851912 / artifact13769513526 にて限定PASS、ただし自然落下STOPが発生せずSTOP→RはHOLD、CI全体はfailure。F4 Ver7.2.0 collision flags/中央経路0/16、物理床vs高精細描画、正式4v4/ART/公開HOLD。R/小QA/CI/文書増殖を止め、V25第6節の**原作登録SOURCE内の実ゲーム改善を今すぐ開始**してください。正規25/17/26/0・Scoreable0/Winner NONE・原作忠実性を維持し、偽床/架空NavLink/ワープ/偽スコア/閾値緩和禁止。main/PR#5/Pages/正式QA/原本/PRIVATE/本人Windows保護。書込は研究branchだけexpected_sha CAS非force。本人操作原則0、追加課金0、Work・Windows・高負荷は従来の個別承認を遵守。引継ぎ文書の再制作ではなく、本当のゲームコードと証拠を優先してください。

**V25保存はdocs-only、ゲーム機能の前進0件。**
