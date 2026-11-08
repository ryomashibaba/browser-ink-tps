# Browser Ink TPS / T21 — V16.0 完全統合・批判的引き継ぎ正本（2026-11-08 JST）

**これは既存プロジェクトの継続であり、新企画・上位方針変更ではない。**
V15からの真正開発・原作同側CPU・人間操作・成功/失敗/反省を統合する、**新チャット移行時だけの例外的な引き継ぎ更新**。短い作業のたびにV17/V18を増殖させない。V15および旧正本は履歴として保護する。事実の正確性や今後の結果が100%保証されると主張しない。証拠SHAは履歴であり、現在HEADは必ずGitHubで再取得。

## 0. 読み込み順・固定契約

1. START_HERE.md最上段 → このV16全文。
2. [V15完全統合正本](BROWSER_INK_TPS_V15_CRITICAL_HANDOFF_AFTER_SWEEP_CHARGER_20261107_JA.md)全文を継承。V15から参照する[V14](BROWSER_INK_TPS_COMPLETE_CRITICAL_HANDOFF_AFTER_A1_A2_A3_Q_20261107_JA.md)、DECISIONS_JA、QA/RAWは変更せず、必要な箇所に戻って照合。
3. 固定の [T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md) と [FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md) は絶対変更禁止。後者の旧開発ブランチ表記は歴史であり、今の作業ブランチへ読み替えるだけ。

- GitHub正本：ryomashibaba/browser-ink-tps。**唯一の書込許可先は research/t21-integrated-a1-c-patrol-four-mode-20261105**。main、T19C/T20、非公開原本/原作データ、Pages/本番、正式QA、他研究branch、Draft PR #5を保護。別branchやPR #5のHEADを研究HEADと取り違えない。
- 研究branch更新はGitHub最新SHAを都度読む → 単一親のcommitを準備 → expected_sha照合と force:false で一度だけpush。競合・予期しないHEAD更新は即HOLD・差分照合。merge/rebase/force/releaseは禁止。
- 原作SOURCE **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。B487 16組の自然敵味方経路は **0/16**。旧0/12とは母数が違う。元の0.30m CPUカプセル、Rapier/Recast、ガラス/遮蔽、実60Hz物理ゲートを緩めない。
- 追加床、透明橋、架空坂/原作NavLink、Actorワープ、偽Projectile/HP/撃破、偽Ink/Clock/Score、無根拠なSource Face/flags認証を禁止。QA31-solidの歩行は元25の正式SOURCEではない。
- 公式Winner=NONE、Scoreable=0、activationReady=false、unrestricted4v4Certified=false、productionAuthorized=false。**正式4v4・公式得点/勝敗・敵HP自然命中/撃破/150tick復活・全域F4・ART完成・公開はHOLD**。局所SOURCE PRACTICE CLEARを公式Turf勝利に変換しない。
- Chat＋接続GitHub中心、本人作業原則0、追加課金0円。Work/Computer Use・Windows・PRIVATE/原本操作は毎回別個の事前明示承認。アクセスできない環境を使えたと主張しない。本人の手動試遊は真正Chrome CDP自動入力とは別。
- 日付/実装SHA/RUN ID/RAW/PNG/認証範囲が揃わない成功は未確認と書く。CI SUCCESSやUnit PASSは実プレイ完成と区別する。

## 1. 最終目的とF1〜F5を変えない進捗

『スプラトゥーン3』Ver.7.2.0以降・マテガイ放水路・通常ナワバリの忠実な3DブラウザTPS。人間1名＋実CPU7名、正式4対4の自然な接敵・移動、180秒、12武器＋サブ、原作Ink/ownerGrid、実HP/撃破/復帰、公式得点/勝敗、再戦、本人の操作性・ART/音・性能、正式公開が最終条件。別モードや別マップの新企画ではない。

| 固定工程 | 真正に出来た範囲 | 未完了・禁止する誤認 |
| --- | --- | --- |
| F1 実8体起点 | 人間＋CPU7の原作SOURCE上参加・物理的合流、A1協力を複数RUNで限定PASS | 全8人の正式連続4v4自然戦闘は未認証 |
| F2 連続物理移動 | 元上段→着地点→同側坂、CキーA1実到達、B2/B4別ゴール実移動、研究B448のA3実巡回 | 中央・対岸の連続0.30mカプセル通行と敵味方自然経路0/16はHOLD |
| F3 操作可能局所試合 | 4モードのSOURCE武器選択導線、実射撃/原作着弾/サブ、OWN Squid補給、人間再射撃、180秒TIME_UP・再戦の限定実証あり。B415の実HUD進行も成立 | **これらが現HEADの一つの同一試合で全て成立した全面PASSではない**。自然敵HP/撃破・公式勝利はHOLD |
| F4 原作版・衝突全域 | 既存25/17/26/0の正規原本根拠は保護 | Ver.7.2.0通常Turfの真正collision Face/flags、中央/対岸接続、Scoreableなし。元版確認できるまでは断定しない |
| F5 体験・性能/ART | 1600×900 PLAYER/F8、Vキーで視界補助、上部HUD文字切れ改善を真正PNGで確認 | 人間の実手動試遊、最終ART/音/FPS、公開/merge審査未実施 |

## 2. 必要最小限の証拠台帳（作業時点）

### V15で確定済みの根拠（繰り返し試験禁止）
- B58 SOURCE_SWEEP：真正3面CLEAR と固定RAW再監査 [#42364849596](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42364849596)。練習CLEARであり得点/勝者ではない。
- Rail Charger：実チャージ→解放後1発、原作上段142変更セル [#42365628667](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667)。武器本体新規実装を意味しない。
- 180秒＋実サブ/同武器再戦/OWN回復：V15第2章の各真正RUNと、A1 [#42320196565](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42320196565)、A2元RUN＋独立RAW監査 [#42314431496](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42314431496)を継承。異なるRUNの成功を同一RUN成功に合成禁止。

### V15後の真正更新（現在最新の根拠）
- [#42378703693](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42378703693)：実射撃29発・実インク消費27.55→OWN Squid実回復24.72→Human再射撃14発・消費13.30、180秒と実物理床支持を限定PASS。飽和100%前の証拠。公式対人HPではない。
- [#42380833002](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42380833002)：サーキットモードの本物Twin Comets37発/原作354セル/インク69.66、B415 1/3→2/3表示、7CPU。4モード全試合のPASSではない。
- [#42382585003](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42382585003) と [#42383555222](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42383555222)：実VキーOFF→ON→OFF、真正3 PNGで自分のモデルの実非表示/復帰・原作/射撃保護を限定PASS。
- [#42432071499](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42432071499)：B338 PLAYER武器操作説明の実文字領域44px全文と照準非遮蔽、実射撃回帰PASS。既存HUDの微調整はここで凍結。
- [#42433069608](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42433069608)：A1実Cキー2回→原作ゴール承認2・実到達2。A2/B1/B3を含む同側巡回の追加ゴール承認/切替もあり、先行報告の「追加分散発動0」は**誤りで訂正済み**。
- [#42434167357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42434167357)：B2/B4の同側で、先行RUNの同一ゴール集中から別々の原作ゴールを実承認・実移動へ改善。既存285件Unit PASS。正式敵味方経路ではない。
- [#42436179070](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42436179070)：独立B448 research A3実足から15個の原作到達候補、1つの原作ゴール承認、実平面11.77m変位、2回の別ゴール切替、7CPU。286 Unit PASS。**最初の優先ゴールは従来と同じ**なので再順位付けの優越性は未証明。
- **最新** [#42437359770](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42437359770)／ゲーム+追加真正観測のHEAD **47e71aabebb531e69693d27ba0b1771fe2f1a57f**：A3の連続実native 723tick間、実射撃14発、PaintCoordinatorが受理した塗装変更2,547セル、そのうち実Impact変更558セル／Foot変更1,041セル。実CPU原作塗装寄与まで真正PASS。**これは塗装変更件数であり公式Turf得点・全マップ到達・敵HPではない**。31ファイル286テストとbuild、Actions全体SUCCESS。前回のHEAD 41fe065dを最新と扱わない。

作業時点保護 main **fbd922cea900df8e1a139f21b3c61ed927b3fdd9**。Draft PR #5 はOpen/Draft/未マージで別HEAD 8cfc95756ef0b56e2c33dc9f89a9041126daa272。**このV16のdocsコミット後も研究HEADは変化する**ため、ここに記す47e71aは「現時点のゲーム実装/真正証拠HEAD」としてのみ扱う。

## 3. 批判的自己監査：本当に悪かったこと

1. **優先度の漂流**：V15第5章P1が定めた「武器/サブ/OWN補給/180秒/再戦を同一プレイヤー体験へ」の完成確認より、B番号・HUD・短時間試験・同側CPUの細分化が前に出た。CPU原作移動/塗装は真正の進歩だが、正式4v4完成条件0/16を変えたとは言えない。**V15 P1へ優先順位を戻す。**
2. **CIの自動多重発火**：1ゲーム変更からB441+B413+B162などが重複起動、修正/実験途中に追加push、不要長時間RUNが発生。branchごとの既存条件で抑制し、**受け入れに必要な1本だけ**選ぶ。B413は長時間節目のみ、B162はA3研究の際SKIP。不要CIを動かすための「確認コミット」をしない。
3. **失敗の種類が混在**：B58 PNG manifest漏れ、B413満タン100で実増分なし、snapshot名違い、CSS文字列の過剰一致、readonly配列のTypeScriptミス。前者は検証器の不具合、実ゲーム動作のFAILとは別。**最短静的/Unit/型照合→真正Chrome**の順にする。1問題につき再試行1回が基本。
4. **小QAと見た目の過剰最適化**：F5文字切れとVキー視界補助は実際のプレイを改善したが、真正PASS後も再監査/微調整を続けると本体完成を妨げる。**B58/Rail/Q/READY/HUD/Vの同目的追加QA凍結**。新たなユーザー目線の欠陥が画像で明示された時だけ例外。
5. **PASSの過大解釈**：Unit数、CI SUCCESS、実CPU移動、原作Paint changedCells、練習CLEAR、人工CDP入力は、相互にも正式4v4/公式Turf/本人試遊にも自動昇格しない。1つのRAWの同一試合で証明した範囲を厳守。
6. **F4への依存と停止の両極端**：衝突原本の真正Ver.7.2.0 collision mesh/flagsが未入手なら0/16は解けないが、F3/F5の局所SOURCE体験まで止める必要はない。**合法の同一版原本が入手できた時だけF4認証再開**、推測floorや敵ワープは永続禁止。
7. **引継ぎ文書肥大化**：START_HEREには古い「最新」が多数残る。いま必要なのは正本1つの入口、証拠リンク、次の工程だけ。本V16はユーザーの新チャット移行依頼に対する一度限りの更新。旧正本や長大ログのコピペを要求しない。
8. **ユーザー操作の負担**：本人にZIP/CMD/スクショ/長い貼付を逐次依頼しない。GitHub/Actions/RAW/画像を接続側で読み、必要な本人F5試遊だけまとめて1回頼む。実Windows/PRIVATEへ勝手に触らない。

## 4. 厳しい優先順位（固定F1〜F5の実行順序を合理化するだけ）

### P0：新チャット冒頭、調査を最小化
START_HERE最上段→V16→固定ロードマップ/本Fast Track→必要ならV15の該当章。研究HEAD、main、PR #5、最新RUNのsha/conclusionだけ照合。最新 #42437359770 / A3塗装の実証は**既にPASS**、再試験しない。真正前のCI待機/HEADドリフトだけは更新する。

### P1：同じプレイヤーの実SOURCE一連体験（主優先）
初手は新しいQAやHUDでなく、現行ゲームのSOURCE PLAYERで**最初に本当に途切れる操作**を1つ特定する。原則Twin Comets＋Snap Bombの代表1ケースで、選択→7CPU→原作支持で移動/射撃→実サブ→消費→OWN SQUID回復→Human再射撃→180秒終了→見える再戦ボタン→同じ武器で新world tick0、と続く一つの体験。機能が既に完成しているなら証拠統合だけ行い、**差分がなければコミットしない**。
- 受入は同一実Chromium世界・実マウス/キー/ボタン・RAW/PNG、CPU7、Shot/Ink、Source Impact、Sub実投擲/爆発（原作変更セル0なら0）、本物TIME_UPと新世界初期化、Scoreable0/Winner NONE。未認証の敵HPを混ぜない。
- 新たなコード欠陥を発見したときだけ**ゲーム本体を一括実装修正**。関連Unit/TypeScriptを先に、真正Chromiumは既存1本に集約。全4モード×12武器×180秒48回は行わない。

### P2：F1/F2同側CPUの実効性を伸ばす（P1を奪わない）
A1 Cキー実到達、B2/B4分散、A3実移動・14発・558 impact changedCellsは証明済み。これらを単に反復せず、**原作同側の局所戦闘/塗装判断に新たなプレイヤー効果が生じる変更**だけ行う。既存の同側候補と正規経路ゲートを使用。A3の再順位付けが今回の観測では同じ初回ゴールを選んだことを記録し、改善効果を無根拠に主張しない。
- GO条件：A3/B2/B4の実CPUが別候補を選び、実移動・射撃・塗装へ結び付く可視/RAW差分があり、通常SOURCE操作を損なわない。
- NO-GO：同じ結果の「確認」だけ、単なるカウンタ/HUD/Unit数追加、偽の正式敵自然戦闘、原作にない接続。候補がなければHOLD。

### P3：根本F4ソースゲート（証拠が来るまでHOLD）
Ver.7.2.0以降**通常ナワバリ**に対応する真正collision原本と版/hash/Face/flagsが適法に確認できた場合のみ、床/ステージ/0.30m capsule/Recast/自然敵味方0/16/公式Scoreableの根拠検証へ進む。表示OBJや変換器だけで衝突認証をしたと見なさない。現時点は**NO-GO/HOLD**。

### P4：F5本人試遊・品質・公開
本物の実ゲーム縦切りが整った後、本人の短い試遊で操作・fps・視界・ART・音を評価する。依頼は端末の必要操作を最小限にまとめて1回。正式公開・main/PR merge・Pagesは全ゲート＋本人の明示承認が揃うまでHOLD。

## 5. バッチ単位の判定・コスト/負荷ルール

**採用基準**：「人が新たにできる遊び」または「原作根拠で根本HOLDが狭まる」の少なくとも片方を満たすこと。無ければコードを書かず必要ならNO-GOを報告。

- 現行HEAD確認と既存成果物/RAW再利用 → 対象ゲームコードと最小の関連Unitをまとめて編集 → 型/Unit → **既存真正Chrome1本** → 生ログ/PNGで狭い合格 → CAS非force保存。CIがすでに十分なら重い再実行はしない。
- 予期しないCI自動起動は抑止し、結果未確定の同ブランチへ追加pushしない。長時間180秒は統合節目以外起動しない。重複が発生したら再実行せず原因を直す。
- 実測の改善条件と停止条件を**変更前に**定める。FAIL時は「ゲーム本体FAIL・QA契約FAIL・環境/CI FAIL・証拠不足」の4種に分類して最短の修正一回。原作の厳格閾値を都合よく緩めない。
- 変更は研究ブランチの1まとまり、テストだけ/ドキュメントだけのcommitをゲーム進捗と数えない。文書の新versionを毎ターン生成しない。今回のdoc更新は引継ぎ例外であって実ゲーム完成度は増えない。
- 毎回の日本語結果は「新しく本当に遊べること、SHA、真正RUN/RAW、PASS限定、HOLD、次の1差分、ユーザー操作回数」のみ。本人操作0が可能なら0を維持。

## 6. 次のチャット最初に送る文章（コピー1回）

Browser Ink TPS / T21 / Undertow Spillwayの既存開発を継続してください。新企画や上位方針変更はありません。GitHubは https://github.com/ryomashibaba/browser-ink-tps 、唯一の作業ブランチは research/t21-integrated-a1-c-patrol-four-mode-20261105 です。START_HERE.md最上段と docs/continuity/BROWSER_INK_TPS_V16_CRITICAL_HANDOFF_AFTER_A3_REAL_INK_20261108_JA.md を全文読み、V15、固定T21_FAST_TRACK_ROADMAP.mdとdocs/continuity/FAST_TRACK_EXECUTION_JA.md、過去の成功・失敗・反省・原作安全条件を継承してください。まず最新HEAD/main/PR#5/最新RUNを確認してください。ゲーム証拠基準HEAD 47e71aab、真正A3実射撃14発・原作Ink2,547変更セル（うちImpact558）の #42437359770 はすでにPASSです。これまでのSOURCE_SWEEP/Rail/180秒/OWN回復/A1 C/B2-B4/A3/V/HUDは無駄に再試験しないでください。V16のP1、すなわち選択武器・サブ・OWN補給・180秒・同武器再戦を一つの実プレイヤー体験としてつなぐ最初の実欠陥を特定し、ゲーム本体改善→最小Unit/ビルド→必要なら既存真正Chromium1本→RAW/PNG確認→研究ブランチのみCAS非force保存まで進めてください。F1/F2原作同側研究はP1に従属します。原作SOURCE25/17/26/0、自然敵味方経路0/16、正式4v4・敵HP・公式得点/勝敗・ART・公開HOLDを維持。main/T19C/T20/非公開原本/Pages/Draft PR#5保護。追加課金0円、ユーザー操作原則0、Work/Computer Use毎回事前承認。計画だけ・QAだけ・HUDだけでゲーム進捗を主張しないこと。

---
この文書は2026-11-08のユーザー依頼による一度限りの引継ぎ統合。固定上位方針の改定・実ゲーム完成の認定ではない。
