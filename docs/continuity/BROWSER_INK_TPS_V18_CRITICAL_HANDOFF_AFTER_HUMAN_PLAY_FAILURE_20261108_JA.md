# Browser Ink TPS / T21 — V18.0 本人試遊FAIL後の全面批判・根本修復・次チャット引継ぎ正本

**2026-11-08 JST。ユーザーから明示的に依頼された大規模引継ぎのため1回作成。** 本書はV17を廃棄しない。F1〜F5 / Fast Track / ソース安全条件を一切変えず、**本人試遊FAILという新しい上位証拠に従って実行の順序・受入基準・過剰QAを改める**。本書の保存はコード修正でも正常プレイ認証でもない。

## 0. 正本と作業権限

- GitHub: https://github.com/ryomashibaba/browser-ink-tps
- **唯一の書込ブランチ**: `research/t21-integrated-a1-c-patrol-four-mode-20261105`。本書作成前の観測HEAD: `6bd043ad83fe49c202fee75e76b5d1a4adf7d16a`（文書コミット後に変わる）。直近のゲーム本体実装系は `82a361269693918be94976079cbf7f826d14d45b`、以後はP2結果追補・入口表示修正・検証用WASD方位修正を含む。これらを本人プレイの修正と誤認しない。
- 保護main: `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。Draft PR #5 はOpen / Draft、HEAD `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。**main、T19C/T20、他branch、PR #5、Pages、本番、正式QA、原本/PRIVATE/原作メッシュ、設定は不変更**。勝手なmerge / force-push / 公開は禁止。
- 読込順：本V18 → V17 (`docs/continuity/BROWSER_INK_TPS_V17_COMPLETE_CRITICAL_HANDOFF_AFTER_P1_P2_20261108_JA.md`) → 固定 `T21_FAST_TRACK_ROADMAP.md` → 固定 `docs/continuity/FAST_TRACK_EXECUTION_JA.md` → 必要箇所のみV16/V15/V14・証拠JSON。V17や固定ロードマップを後から書き換えない。
- **上位仕様不変**：Splatoon 3 Ver.7.2.0以降、マテガイ放水路の**通常ナワバリ**を忠実な3D TPSとして完成。F1 8体物理、F2原作連続移動、F3プレイ可能な180秒の武器/Ink/HP/復活/再戦、F4原作全域collision/Scoreable、F5人間プレイ/品質/承認。別ルール・別ステージへの転用禁止。
- **原作SOURCE凍結**：25 registered Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 official Scoreable。B487 Human+CPU敵味方自然経路は **0/16**（歴史的0/12と母数を混同しない）。Official winner NONE、activationReady=false、productionAuthorized=false、正式4v4=false。中央の未認証8局所ギャップを勝手に埋めない。
- 偽床・橋・坂・NavLink・Scoreable・敵HP・Winner・CPUワープ・Actor再配置・半径縮小・当たり判定の推測昇格・既存0.25m等の安全閾値緩和は禁止。描画用OBJは衝突権限ではない。原作データを外部へ持ち出さない。
- 利用予算追加原則0円、GitHub+Chatを優先、ユーザー操作最小。Windows/Work/Computer Use/OS管理者/PRIVATEアクセスは毎回**個別の明示承認**が必要。12月統合プロジェクトに脱線せず、MABと本TPSが同格最重要という全体順位も侵さない。

## 1. 新しい最重要事実：2026-11-08 JST 本人の普通の試遊はFAIL

ユーザーが普通に遊んだ画面を提供。Chrome 127.0.0.1:4173 /browser-ink-tps/ の `t21Play=preview`、`t21QaDrive=source`、`t21W10B112=humanGround`、`t21W10B183=firstDropPlay`、`t21W10B192=humanCombat`、`t21W10B203=fullRound`、`t21W10B384=...` を含む長い研究起動URL（末尾は画像で省略されているため厳密な全クエリ文字列は**不明**）。今回のPCローカルチェックアウトSHAも**不明**。スクリーンショットの定量的観察は以下の範囲に限定する。

1. **SAFE STOP** が画面に表示され、表示時計は **3:00**。プレイヤーHP100・INK66はその時点の画面値。安全停止理由の具体的例外名・stack・native tickは画像からはわからない。
2. HUDは **CPU 1/7 SOURCE DROP / REJOIN**、右下 **CPU REJOINING 6/7**。表示された時点で合流済みが1/7であり、**ほか6体のAIが恒久的に動作不能と証明したわけではない**。早期SAFE STOPで更新が止まった可能性を切り分ける。ユーザー本人は「CPUが一人しか動かない」と報告。
3. 画面内の大きな暗い空間、鋸歯状のエッジや非連続な床らしい部分、ユーザー報告「ステージの床の多くがすり抜ける or 描画されない」。**どのXYZに原作Rapier衝突があるかは画像だけでは不明**。描画欠損、未登録衝突、旧版地形、カメラ/クリッピング、表示用装飾と物理の不一致を分ける。
4. 左下 **F8 QA DETAILS** がある。既存コードは `src/app/UndertowF3PlayablePreviewApp.ts` の通常 `update()` 内例外を `stopReason` へ記録し `T21_F3_FAIL_CLOSED` を console.error、通常更新を停止、F8詳細には `SAFE STOP: <reason>` を表示する仕組みを持つ。この証拠回収を優先し、「普通の入力だから無害」と断定して例外を握り潰さない。

**受入判断の格下げ**：P1真正180秒PASSは限定回帰の事実として有効だが、「通常の人間プレイができる」という認証を一切含まない。2026-11-08の本人プレイ品質は**FAIL**。このFAIL解決前はリリース/品質/HUMAN PASSを宣言しない。

## 2. 成功・失敗・反省の全体整理

**保持すべき実証**:
- P1真正 #42444639854、SHA `cf2d9025`：1 SOURCE世界/Twin Comets+Snap Bomb、実射撃→Ink消費→実OWN SQUID補給→実再射撃、元17塗装面の実変化、180秒TIME_UP、実クリックから同武器で**新worldのSTAGING・tick0**。この1件を全12武器・全4モード・人間手動・自然4v4のPASSへ拡大しない。
- A3原作実CPU塗装 #42437359770、A1連携 #42320196565、A2実再戦 #42314431496、F8画面 #42326607158、SOURCE_SWEEP #42364849596、Rail Charger #42365628667は、それぞれ限定成功。別RUNを「全機能同時PASS」と合成しない。
- F2/B2/B4の初期Recast↔Rapier高さ拒否（元0.25m超）は、その後の**実物理足からの同側ゴール再審査が成功した**証拠があり、既存の回復策を調べず閾値修正してはいけない。B450/B452/B454の局所RAWは敵陣自然横断の証明ではない。

**保持すべき失敗・NO-GO**:
- P1前の #42440512855 / #42443156696：OWNを前提にした入力シナリオが不成立。補助WASDは別途方位修正済でも実走効果未認証。推測の現地stateでは自動操作を組まない。
- P2追加外側CPU探索 #42448619201：720tick+300Unit+buildはSUCCESSだが、試作した追加探索の使用1件/承認0件、塗装増の因果効果NO-GO。採用・再走しない。
- 昔のCPU巡回最適化は実塗装・移動が悪化した例がある。固定巡回を無根拠に交換しない。
- ドキュメント、B番号、HUD追加、単体テスト数、CI成功が大量でも **現実の試遊破綻を見落としていた**。今後は通常プレイ1系統の実証をゲームの主ゲートにする。新しい小QAワークフローや毎回の引継ぎ文書を増殖しない。
- **批判的な因果関係**：CPU合流1/7はSAFE STOPの結果かもしれない。床欠損は描画用OBJ未読込だけとは限らず、衝突抜けは別問題。これをまとめて「全部衝突データが足りない」と分類するのも、「全部レンダーだけの問題」とするのも不正確。先に因果を確定。

## 3. コードに基づく新しい原因候補（仮説は証明ではない）

**STOP**：`UndertowF3PlayablePreviewApp.ts` の `update()` は例外時 `stopReason=error.message` / `paused=true` で fail-closed。次フレームは `if(this.paused||this.stopReason)return`。よって **STOP前に発生した例外が1件あるだけで後続6体のリジョインも止まる**ことはコード上可能。実際のエラー名は未取得。STEP中の `CpuAgentSystem`（DROP/FALL/REJOIN/KCC/共有物理/原作支持）だけでなく描画/Ink/Refresh側も同じcatch対象。**具体的例外を確定する前にCPU移動・例外条件を変更しない**。

**地形**：通常 `UndertowF3PlayablePreviewApp` は `undertowT21dConnectivityQaStage()` の凍結25 Rapier solidsで `buildTestStage`、光学構造と補完表示を構成。全面のピン留めした原作描画OBJは `?t21FullSource=review` による `loadWholeSource()` と別途作成済みローカル `public/t21-f3g-source` パックが必要で、既定ゲーム起動では読み込まない。描画用F3G/F3Lは**render-only**で、Rapier/Recast/Scoreableを増やさない。見栄えの問題と実通行の問題が併存しうる。元7.2.0通常Turfの物理Face/flagsは未取得。

**CPU**：`UndertowF3SourceTraffic.ts` は7体の`physicallyRejoined`が成立すると`freeCombat=true`へ進み、初回DROP・再合流・真KCCを別に追跡する。画像の1/7では自由行動未解禁が自然で、STOPの前後時系列がない限り「他のCPUのAIが不正」という断定は不可。

**実ユーザー環境差**：既存Chromium RAWは自動化/特定フラグの固定経路。本人URLの末尾、端末の実HEAD、GPU/画質、ローカル描画パック、起動前後状態は未特定。**コード変更前に同一設定の再現性を確認**する。再現しないときは不明と報告し、別要因を無制限に推測しない。

## 4. 新しい最優先実装計画：STABILITY FIRST（固定F1〜F5の下位実行順のみ）

### P0 — 普通の操作でSAFE STOPを起こす根本原因の確定と修復【最優先・必須】

1. 最新研究HEADとソース`stopReason`既存取得経路を確認。画像のURLと`PLAY_SOURCE_WINDOWS.cmd`の起動仕様を照合。ローカル実SHAは本人操作なしに取得できなければUNKNOWNとする。
2. 本人のスクリーンショットを**既存の手動FAIL証拠**として保存扱いし、同じ画像を再要求しない。自動で読める場合は `window.__t21F3.snapshot()` の `stopReason/tick/phase/CPU physicalFeet/rejoined`、既存 console の `T21_F3_FAIL_CLOSED` と native stage数を**READ ONLY**で一度採取。秘密や原作バイナリはアップロードしない。F8既存情報で足りれば新診断UIを作らない。
3. エラーが起きた直前tick・関係Actorと未成立ゲートを特定し、**1つの原因に対して1まとまりの最小実装修正**。停止条件の単純削除、catchの握りつぶし、物理KCC検査/安全閾値緩和、CPU位置書換えは禁止。
4. 合格条件：同じ起動モード・本物の入力がある通常PLAYING遷移で、従来STOP地点を連続通過し、実ステージ25/17/26/0・安全観測・Actor移動/CPU合流を保ち、例外0。まず短時間で確認し、**この条件が未達のまま180秒CIを走らせない**。
5. 不明/環境再現不可なら具体的不足項目を明示してHOLD。費用・時間のため同条件を無限再試行しない。

### P1 — 見える床と歩ける床の不一致を区域別に解消【P0と一括できる範囲は統合】

- 同じ実カメラで元上段spawn→初回DROP→低地landing→元坂→高台→中央の順、**画面表示 × 原作Rapier foot/support × Recast経路**を1対1で照合。どの区域・XZ・元solidかを明示する。
- [A] Rapier原本床あり・描画欠落：**表示だけ修正**。原本の形と衝突の偽一致は作らない。光学モデルやメッシュ表示モードの二重描画・カメラクリップ・depth等を1回調べる。
- [B] 描画あり・Rapier原本床なし：現時点では**通行不可を可視化**し、本当の通行を追加しない。虚偽の歩行可能表示を消す。正規collision権限は独立F4ゲート。
- [C] 両方なし：正規Face/flagsの入手まで本物の床追加はHOLD。デバッグ専用表現はゲームへ混ぜない。
- 合格条件：SOURCEで**通行を許可する既存経路**が見える形と一致し、本人が指摘した通常ルートで無根拠なすり抜け・未描画危険区域がないこと。全マップ網羅の原作再現は別F4のまま。

### P2 — 真CPU7体のDROP→REJOIN→自由行動を修復【P0 STOP修復後】

- 7 ID A1/A2/A3/B1/B2/B3/B4の各native tickで、lifeState・mobilityState・Recast proxy・実Rapier foot・lastMoved・支持面・例外を同じ世界で追跡。
- **ステップ1：7/7の本物の物理再合流。ステップ2：freeCombat成立。ステップ3：全7 IDで真正な移動/塗装/射撃の活動を観測**。存在数や描画された人形数だけではPASS不可。
- Recastの旧位置にCPUをスナップしない、Actor warpしない、CPUサイズ/速度を不当変更しない、B2/B4既存同側リトライを壊さない。人間を含む共有カプセル安全を保持。
- 目安は既存の短時間真正720 native ticks級を再利用するが、7/7までの到達時間を**根拠なく事前断言しない**。SAFE STOPが発生したらそこでFAILし、止まった以後の「動かなさ」を独立AIバグと誤判定しない。

### P3 — 普通のプレイ1本の一貫動作を回復

- P0〜P2の同一研究SHAで、本人と同じ通常SOURCE起動 → 実WASD/マウス/射撃/イカ/Ink補給/サブ → 180秒TIME_UP → 明示再戦で新worldを一続きの**1系統**として試す。
- 安全STOP0、原作支持の見える床、CPU7体の実活動、正しいHUDを**同じworldで**確認する。単体テストPASSや別RUN結合では不可。物理敵交戦と公式Winnerは認証しない。
- 12武器×4モードの全組み合わせは上記安定化後の段階的探索。まず一つの典型的実プレイループを再確立してから拡大。

### P4 — 本人試遊1回の再受入

- P0〜P3に根拠が揃ってから、ユーザーに**一度だけ短い確認**を依頼。提示する操作は既存 `PLAY_SOURCE_WINDOWS.cmd` の1回起動、選択モード、数分以内の確認箇所だけ。起動済みの既存PC環境なら再ダウンロード要求を避ける。
- 合格は本人が床・移動・CPU・STOPに問題がないことを確認した範囲だけ。本人実プレイなしに「操作感/FPS/ART完全PASS」と書かない。
- FAILならスクリーンショットやF8表示等の既に得た情報を優先し、新たな反復手作業を課さない。指摘の再取得が不可避なら**依頼を1件だけ**にする。

### P5 — 後続の原作忠実性・正式試合【現時点HOLD】

- F4正規同版・通常TurfのPhive collision Face/flags、中央8局所ギャップ、CPU半径0.30m、Rapier/Recast/原作通路の連続性が全て証明されるまで自然敵味方経路0/16を解禁しない。
- 有効な根拠が得られた後だけ、本物の敵遭遇→物理弾→HP→splat→150tick復活→全17/追加正規Scoreable認証→公式計点/勝敗→正式4v4/公開審査へ。F3練習実装を「正式Turf」と呼ばない。

## 5. 修正バッチの検証設計・失敗分類（QA増殖を止める）

- 開始前に「ユーザーが困った実害・原因仮説・直すファイル・新しい受入RAW・許容しない副作用」を**短い一枚の作業計画**として内部で確定。通常プレイの生状態に合わせる。
- **STOPで検査が崩れたら早期終了**。無意味な180秒継続をしない。旧成功RAWを本体比較用に再利用。新CI workflowの追加、毎回のB番号付け、docsのみ修正、ZIPや手動CMDの連発を禁止。
- 修正は研究ブランチで必要最小差分にまとめ、Unit+typecheck/build+**既存の真正Chromium 1系統**を原則。GO判定は同SHAの実RAW・画面・ゲーム状態。CI全体のsuccessだけでPASSしない。CI実行料金や課金が必要ならユーザー承認を得る。
- FAIL分類を **CODE_RUNTIME / ORIGINAL_SOURCE_AUTHORITY / RENDER_OR_PHYSICS_MISMATCH / CPU_LIFECYCLE / ENVIRONMENT_OR_LOCAL_SHA / TEST_OR_ARTIFACT_FAILURE / INSUFFICIENT_EVIDENCE** に分け、原因の違うものを同じ修正にまとめない。
- 原本と25/17/26/0を一切書き換えない。非force CASでHEADを比較し、ブランチ競合は中止・再検査。コミット単位は「実際の症状1まとまり」であり、記録だけのCommit乱立はしない。
- 各応答は (1) 今回新たに直った実害 (2) 検証証拠・SHA/RUN (3)未解決 (4)ユーザー作業/課金 の四点を簡潔に報告。完璧を保証しない。新しい情報がない場合は同じGO/NO-GO調査を繰り返さず、このP0の確定作業へ戻る。

## 6. 批判的な自己検査：この計画でも間違えうる点

1. **STOPの単一原因を過剰に期待**：最初の例外を直しても別の床・CPU・描画の問題が現れる可能性がある。P0修正＝P1/P2合格ではない。
2. **見た目の修正が逆効果**：光学OBJを可視化しても衝突の欠落は直らず、むしろ歩けそうな偽床を増やす。表示した形と物理が一致する既存通路を先に優先する。
3. **CPU7/7は遊びの完成ではない**：再合流後に7体が本当に動き、役割を持ち、危険なく塗る必要がある。旧720tickの成功を今回URLへ転用しない。
4. **3:00はゼロ進行とは限らない**：表示丸め/停止タイミングを考慮し、必ずnative tickを取得。SAFE STOPと1/7の時系列は未確定。
5. **原作忠実性と遊びやすさの衝突**：原作権限不足を偽足場で消すと将来のF4検証が破綻する。不可部分を非公式練習の範囲として正しく表示し、真正通行の認証は別にする。
6. **ユーザー作業ゼロの限界**：Chat/GitHubだけで本人WindowsのconsoleやローカルSHAは直接見えない。Work/Computer Use等の個別承認なしにアクセスしたと主張しない。可能な範囲でGitHub側から自動再現し、最後の本人確認1回だけ依頼する。
7. **時間/コスト消費**：根本STOP原因がわかる前に高価なfull roundや新しい長時間CIへ進まない。一度の有界な原因切分けが失敗したらHOLD+証拠不足を明示。

## 7. 最初の新チャットで実際にやること（依頼の反復禁止）

**P0を開始する**。最初に研究HEAD/main/PR#5/直近RUNを取り直し、本書→V17→固定計画を読む。次に `UndertowF3PlayablePreviewApp.ts` のstopReason/通常update/起動フラグと `UndertowF3SourceTraffic.ts` の初回再合流、既存 `PLAY_SOURCE_WINDOWS.cmd` を照合。本人画像のSAFE STOP / CPU1/7 / 欠損床を**未修正の重大FAIL**として登録。まず通常起動でSTOPの実原因を1回再現・採取できる最短路を決め、証明できたコード原因のまとまった修復を実施する。画像や基本方針を本人へ再質問しない。Windows側への介入が不可欠なら個別承認前に停止し、代わりにGitHub上でできる実装と証拠整理を先に済ませる。

**採用しないこと**：B2/B4初期高さ拒否の再研究、P2の遠距離CPU探索の再走、表示だけの微修正、B番号/CI新設、正式Scoreable/地形の推測昇格、main/PR#5/Pages変更、本人の新しい試遊をすぐ要求。

**継続HOLD**：SOURCE 25/17/26/0、自然敵味方0/16、公式Winner NONE、正式4v4/敵HP自然命中/得点/ART/本番公開。**本人の通常試遊品質はFAIL。**
