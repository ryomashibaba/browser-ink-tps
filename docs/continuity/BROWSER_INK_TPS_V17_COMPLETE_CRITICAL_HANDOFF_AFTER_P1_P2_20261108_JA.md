# Browser Ink TPS / T21 — V17.0 完全統合・批判的引き継ぎ正本
**2026-11-08 JST。新チャットへの移行を求められたための1回限りの統合。** 既存のUndertow Spillway開発に限る。新企画・上位方針変更・正式採用ではない。以後の短いバッチごとにV18/V19を増殖させない。正確性を再点検したが、将来の完全無欠は保証しない。未確認は未確認とする。

## 0. 現行入口と変更できる場所
- GitHub：<https://github.com/ryomashibaba/browser-ink-tps>。書込先は `research/t21-integrated-a1-c-patrol-four-mode-20261105` **だけ**。観測時HEAD `a32957ec4a671f8c67755a27848e443578edd530`。**本引き継ぎ文書を保存するとHEADが変わる。次チャットは必ず取り直す。**
- 最新ゲーム本体実装HEAD `82a361269693918be94976079cbf7f826d14d45b`。続く `a32957ec` はP2真正RAW観測の追補であり新ゲーム体験ではない。
- 保護main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。Draft PR #5 は別HEAD `8cfc95756ef0b56e2c33dc9f89a9041126daa272`、Open/Draft・未merge。main/T19C/T20/PRIVATE原本/公式QA/Pages/本番/他branch/PR #5は編集・公開・force-push・merge不可。
- 読込順は **本V17 → [固定F1～F5](../../T21_FAST_TRACK_ROADMAP.md) → [固定Fast Track](FAST_TRACK_EXECUTION_JA.md)**。必要なら[V16](BROWSER_INK_TPS_V16_CRITICAL_HANDOFF_AFTER_A3_REAL_INK_20261108_JA.md)→[V15](BROWSER_INK_TPS_V15_CRITICAL_HANDOFF_AFTER_SWEEP_CHARGER_20261107_JA.md)→[V14](BROWSER_INK_TPS_COMPLETE_CRITICAL_HANDOFF_AFTER_A1_A2_A3_Q_20261107_JA.md)→[永続決定](DECISIONS_JA.md)と元RAW。旧START_HEREの多くの「最新」は履歴。
- 接続GitHub＋Chat優先。**本人作業原則0回・追加課金0円。** Work/Computer Use、実Windows/PRIVATE/原作、本番操作は毎回個別の明示承認が必要。研究branchでのみ最新HEAD→単親commit→`expected_sha`＋`force:false`で更新し、競合はHOLD。

## 1. 上位の最終目的と絶対HOLD（不変更）
- 『スプラトゥーン3』Ver.7.2.0以降・**マテガイ放水路の通常ナワバリ**を忠実な3DブラウザTPSとして完成させる。Big Run・トリカラ・別マップへ逸脱しない。人間1＋CPU7、自然な4対4、原作高低差/真正KCC移動、180秒、12武器/サブ、弾・ownerGrid・Ink回復・HP/撃破/150tick復活、公式得点/勝敗、再戦、本人試遊、ART/音/FPSまでが最終条件。
- 固定F1=8体物理起点、F2=原作連続移動、F3=自然な戦闘とプレイ一連体験、F4=原作全域collision/Scoreable、F5=人間の品質/正式公開審査。**上位F1～F5・Fast Trackは変更禁止。**
- 原作SOURCEの認証は **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。自然なHuman＋CPU敵味方経路B487は **0/16**。旧0/12は定義・母数が違う。Winner=`NONE`、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。
- Ver.7.2.0通常Turfの元collision Face/flags、中央/対岸の0.30m実CPUカプセル全区間連続支持、公式Scoreable未認証。**正式4v4、自然な対敵HP・撃破・復活、公式得点/勝敗、全域F4、ART最終採用、production・公開・mergeはHOLD**。
- 偽の床/橋/坂/NavLink/Scoreable、Actorワープ、CPU半径の不当縮小、描画OBJのcollision昇格、架空HP/Ink/Score/Clock/弾/入力、31-solid fixtureの正式昇格は禁止。Rapier/Recast/60Hzの安全閾値を緩めない。PRIVATE原作をGitHubにアップロードしない。CDP自動入力は本人手動試遊ではない。

## 2. 検証済みの本当の成功と失敗（現HEADへ自動昇格させない）
| 証拠 | 実際に証明したこと | 保留 |
| --- | --- | --- |
| **P1** [真正 #42444639854](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42444639854)・HEAD `cf2d9025` | 同一Chrome世界でTwin Comets＋Snap Bomb、CPU7、原作実射撃28発でInk-22.96 → OWN SQUID回復+6.80 → Human再射撃14発でInk-11.313、Impactイベント54＋26。サブ2実爆発/原作269変更セル。真180秒TIME_UP、人間計136発・CPU1029発、原作Human376/CPU14101変更セル、実再戦クリック→同武器の**新world STAGING・tick0・180秒**。実RAW/PNGとCI SUCCESS | **1武器・1世界のSOURCE-only限定PASS**。2戦目完走、全武器/全4モード、自然敵HP/正式Turf、本人試遊ではない。WASD補助移動はこのRUNで0回、単独未認証 |
| P1前失敗 [#42440512855](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42440512855)・[#42443156696](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42443156696) | B412移動校正で停止、次に真の足元がNEUTRALでOWN前提が誤りと判明。過去の失敗を隠さず保険のWASD追跡を隔離追加 | 同じ物理足位置が毎回OWNとは限らない。補助WASDルートは未実証 |
| A3原作CPU塗装 [#42437359770](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42437359770) | 実CPU A3で14発、原作変更2,547セル/実Impact558/Foot1,041、同側原作巡回 | 自然敵味方0/16、公式Scoreable0を変えない |
| **P2試作** [#42447957917](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42447957917)・ゲームHEAD `82a36126` | B441研究限定、既存の近距離1.7～3.5mが不成立時だけ4.5～5.5mの原作床への**候補探索**を追加。真正短時間Chrome/Unit/buildは成功 | このRUNには専用使用RAWがなく、新候補の発射・塗装改善は不明 |
| **P2正しい最終判定** [#42448619201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42448619201)・観測HEAD `a32957ec` | **32ファイル300Unit＋build＋720tick真正Chromium SUCCESS**、元CPU7、遠距離探索 **1回**、実原作射線・射程で**承認0件**。A3実射撃14、原作セル2,548/Impact558は既存CPUの実結果 | **P2の追加遠距離探索による塗装/射撃増加は未証明。研究NO-GO/HOLD、通常採用不可** |
| 過去の既存証拠：A1 [#42320196565](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42320196565)、A2 [#42314431496](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42314431496)、A3画面 [#42326607158](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607158)、B58 [#42364849596](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42364849596)、Rail [#42365628667](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42365628667) | 原作局所Ink/補給、先行別RUN再戦、PLAYER/F8、SOURCE_SWEEP真正3面、Rail Charger実射撃の限定PASS。A1 CキーとB2/B4の同側原作到達もV16で記録済 | これらを新しい単一RUNの総合PASSだと合成しない。再試験しない |

## 3. F1～F5現在地（完成率を捏造しない）
- **F1**：Human＋物理CPU7/7が原作SOURCEへ合流、協力成立。正式8体自然戦闘は未証明。
- **F2**：上段→下段・原作坂、局所同側A1 C・B2/B4・A3移動の限定真正PASS。中央/対岸の全域・敵味方経路0/16。
- **F3**：P1で代表1回の180秒・サブ・OWN補給・再発射・同武器再戦を統合。ただし全12武器/4モード保証、自然対敵HP～撃破150tick復活、公式得点なし。
- **F4**：公開SceneInfoは改修後 `Vss_Temple01` と `Fld_Temple01.bfres` を支持。しかしKiTrix描画OBJのSHAやPhiveConverterだけで版・ルール・ゲーム内衝突Face/flags認証はできない。正規collision原本の取得と原作通路が最大ブロッカー。[版と衝突](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)、[Phive原本条件](../qa/F4_PHIVE_COLLISION_AUTHORITY_FAST_TRACK_JA.md)。
- **F5**：1600×900 PLAYER/F8、HUD/Vキー等の真正視認証拠はある。**本人実操作・FPS・音/ART・公開品質は未認証**。

## 4. 批判的反省と実行方法の修正（仕様は不変）
1. **P1のOWN推測が誤り**：同じ元床でもOWN/NEUTRALは別。原作ownerGrid・物理接地・現在のtickを毎RUNで実測してから操作。失敗した2RUNを消さない。P1の成功1RUNを無駄に再実行しない。WASDフォールバックは0回で「未認証」。
2. **P2の観測を後付けしたのが非効率**：82a361の試作で必要な使用RAWが不足し、a32957で観測追加の別RUNを起動した。次からゲーム実装と本当のGO判定用RAWを**最初の1コミットに同梱**。今回の**探索1/承認0**で、この仮説は現条件ではNO-GOとして保留。同条件CIの再走はしない。
3. **過去のCPU最適化は逆効果**：[B32ペア実Chrome](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39213335061)で単純ownerGrid巡回は固定比 塗装91.33%/射撃82.76%。B33は塗装99.27%だが移動86.43%、B34の同tick比較では塗装59.42%。**固定巡回が既定**。研究用opt-inを実ゲームへ無断採用しない。
4. **小QA・HUD・B番号・引継ぎ・CIの増殖**：先行C/Q/V/B58/Rail/180秒を再試験せず、1バッチの対象は「人が新たに遊べる具体的機能」か「原作根拠で根本HOLDが減る1点」のみ。QAやdocsだけのコミットを完成度と数えない。ユーザーに「次工程」連呼を要求しない。
5. **形式上のPASSと遊びは違う**：真正RUNのSUCCESS/300Unit/A3塗装増加はP2改善・正式Turf・敵HP命中を証明しない。旧RUN FAILでも真正RAWだけ成功した例は「元RUN失敗」と「後の独立再監査」を両方書く。別RUN同士を同一世界へ合成しない。
6. **F4は出典がない間推測しない**：OBJ・美術モデル・仮設床/旧版・Phive変換器のみで公式衝突権限を付けない。元Face/flags・版/hash・CPU半径0.30m/Recast実通行→自然HP→別途Scoreableを順に確認。新しい正規証拠がないならF4のみHOLD。
7. **人間試遊を飛ばさない**：CDP自動入力は実ブラウザでも本人の操作感・FPS・楽しさの代わりにならない。必要な時は起動入口・観察項目をこちらで用意し、ユーザーの1回の短い試遊だけ依頼。現時点では無断でPC/Workを操作しない。
8. **無理な「進捗」禁止**：根本0/16・Scoreable0が続く間、CPU同側で局所セル数を少し増やすだけの研究を無限に続けない。仮説と効果が立てられなければNO-GOで止め、別案件へ勝手に脱線もしない。完璧・100%保証とは言わず観測できる範囲を厳密に扱う。

## 5. 次の工程の選び方（P0～P4実行だけ更新）
- **P0**：次チャットで最新研究HEAD/main/PR#5と直近RUN `42444639854`・`42448619201` の結論を各1回照合。START_HERE冒頭→V17→固定2正本を読む。原本・既存RAWが十分ならコードもCIも増やさない。
- **P1**：代表SOURCE 180秒＋OWN補給＋再戦は**限定受入済み、再走停止**。WASD保険は未実証。具体的な再現不具合が現れるまでは触らない。
- **P2**：4.5～5.5m CPU候補は**NO-GO/HOLD、未採用の研究として隔離**。現在の固定巡回を守る。無断でデフォルト化・同条件の繰返し・B番号増殖は不可。次の挑戦には独立した新しいプレイヤー効果仮説＋採用前の実測基準が必須。
- **次の本質工程（優先分岐）**：①正当に入手した**同一版・通常Turfの元collision/Face/flags**の新証拠があるならF4原作権限ゲート。出典/バージョン/モード/hash→原作衝突Face→実CPU0.30m/Rapier/Recast連続→自然敵経路→本当のHP→別途Scoreable。非公開原本の勝手な読み込み/転送なし。②新しい原本がなければ、既存ゲームのRAW/画面から**実際にユーザーが困る・再現性あるSOURCE操作/自然な局所遊びの欠陥1件**を選び、ゲーム本体を一括改善。新しい便益がない場合は**SOURCE_AWAITING_EVIDENCE / NO-GO**と明記して停止、架空の小改善を作らない。③必要なF5本人試遊は準備を完了して1度だけ依頼。正式4v4・公開のHOLDは維持。
- **バッチ契約**：GOは「実際に新しく遊べる」または「F4原作権限のHOLDを真正根拠で縮める」。着手前に改善条件・失敗条件・取得RAWを決める。最新HEAD確認→ゲーム実装＋必要最小Unit/観測を1まとまり→型・Unit→既存の真正Chromium**1系統だけ**→RAW/PNG→CAS非force。旧RAWで足りれば再実行0。未完RUN中の追いpush、新workflow、長時間CI重複は禁止。
- FAILは本体失敗/QA検証器失敗/環境停止/証拠不足に分ける。1原因の修正は1回へ束ね、再失敗なら同条件で反復しない。毎回の短い報告は**何が新しく遊べるか・SHA・RUN/RAW・限定PASS・HOLD・次の本質的1差分・ユーザー操作と課金**だけ。
- **この文書のコミットはゲーム完成度0増**。次回のdocs更新はユーザー明示の大きな引継ぎ時だけ。必要のない小さな更新はしない。

## 6. 新チャットに貼るのは1つの短い依頼だけ
Browser Ink TPS / T21 / Undertow Spillwayの既存開発を継続。GitHub `ryomashibaba/browser-ink-tps`、書込は`research/t21-integrated-a1-c-patrol-four-mode-20261105`のみ。`START_HERE.md`最上段と`docs/continuity/BROWSER_INK_TPS_V17_COMPLETE_CRITICAL_HANDOFF_AFTER_P1_P2_20261108_JA.md`を読み、V16/V15/V14と固定`T21_FAST_TRACK_ROADMAP.md`/`docs/continuity/FAST_TRACK_EXECUTION_JA.md`、成功と失敗を継承。HEAD/main/PR#5と最新CIを確認。P1の180秒・OWN補給・同武器再戦[#42444639854](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42444639854)は代表ケース限定PASS、WASD保険0回で未実証。P2遠距離探索[#42448619201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42448619201)は探索1/承認0、**改善NO-GO**なので再走しない。F4の適法同一版collision元データが得られていれば根本ゲートへ、なければ原作SOURCEで本当に新しく遊べる再現不具合1件に限り実装→最小Unit→既存真正1本→研究ブランチCAS保存。価値ある差分がなければ明確なNO-GOで止める。25/17/26/0・自然経路0/16・公式Scoreable0、正式4v4/自然敵HP/公式勝敗/ART/公開HOLD。main/T19C/T20/PRIVATE/Pages/PR#5保護、追加課金0円、ユーザー操作0回優先、Work/Computer Use/Windows操作は都度事前承認。文書/QA/数だけを進歩と呼ばない。
