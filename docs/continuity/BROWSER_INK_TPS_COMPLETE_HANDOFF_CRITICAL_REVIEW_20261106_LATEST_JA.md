# Browser Ink TPS — 全体計画・実証・失敗・反省・次工程の完全統合引き継ぎ
**2026-11-06 JST / 現行研究ゲーム検証基準 9f5fa6faafacb217f33b46ce66f620b5c4be6898**

> この文書は過去のF1〜F5・Fast Track・憲章を変更しない。2026-11-06の最新GitHub証拠と従来の正本を結び、効率と判断順序を厳格化する。**絶対的な完成・将来の全事象の網羅を主張しない。** 文書保存による後続HEADはゲーム実証SHAではない。再開時は必ず最新GitHub HEAD / PR / Actions / Artifactを取り直す。

## 0. 読む順序と正本の優先順位
1. 最上位固定： [T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md)、[Fast Track実行正本](FAST_TRACK_EXECUTION_JA.md)。
2. 最新状態・一括引継ぎ：この文書。旧[START_HERE.md](../../START_HERE.md)は履歴と索引。古い「次工程」「CI待ち」は当時のスナップショット。
3. 統合の原点：[B470+B471+B472統合と真RAW](T21_INTEGRATED_A1_C_PATROL_FOUR_MODE_20261105_JA.md)、[B472批判的評価](BROWSER_INK_TPS_COMPLETE_HANDOFF_B472_CRITICAL_REVIEW_20261105_JA.md)、[旧全体批判レビュー](T21_COMPLETE_HANDOFF_20261105_CRITICAL_REVIEW_JA.md)。
4. F4原作権限：[版・衝突証拠](../qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)、[FloorLine00衝突未認証](../qa/T21_B369_NATIVE_FLOORLINE_CAPSULE_COLLISION_PROVENANCE.md)。
5. 以前のLibrary版『Browser_Ink_TPS_完全統合引き継ぎ_批判的再評価_20261106.md』は詳細な自己批判の歴史的原資料。古いSHA 88d83858 / 9d78faeeを現HEADと誤認しない。

## 1. 非交渉の最終目的・技術・保護
- 最終製品は『スプラトゥーン3』**Ver.7.2.0以降のマテガイ放水路通常ナワバリ**に忠実な、実ブラウザーで操作可能な**180秒・人間1＋CPU7・自然4v4**。真のWASD/Mouse/Player KCC、7 CPU Recast/Crowd/Rapier、12武器/サブ、射撃/実塗装/OWNインク/HP/撃破/150 native tick復活/得点/勝敗/再戦、視認性/音/ART/性能を一つのゲームへ。
- **F1**：原作支持の4＋4起点と実8人。**F2**：原作物理・連続移動、全体KCC/Crowd整合。**F3**：実プレイヤー操作・AI戦闘・インク/HP/復活/180秒と真のゲームループ。**F4**：原作の中央・右低地からアンダーパス±Zを、正規の版・Face・衝突フラグ・Recast/Rapier・真の得点面で接続。**F5**：実試遊・高品質ART/UX/性能・安全ゲートと明示承認後のみ公開。
- 現在の凍結された本ゲーム SOURCE は **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**。公式Winner NONE、activationReady=false、productionAuthorized=false、正式4v4未認証。歴史的原作対岸監査 **0/12**；別のB487全16組監査は**全16未認証**。母数を混同しない。
- **禁止：** 根拠なき床・透明橋・坂・NavLink、原作collision/版の推定昇格、CPU半径0、Capsule/Player/Actorワープ、敵の都合の良い配置、偽Projectile/HP/撃破/塗装/得点、native clock注入、見た目OBJだけを公式コリジョン認証と宣言すること。
- 保護： **main**、T19C/T20・既存公開Pages/正式QA、凍結原本・非公開Temple01資料、Draft PR #5（Open/Draft/未merge）、他の研究branchを変更しない。書込はHEAD一致を確認した指定研究branchの**非force**のみ。同時書込競合はHOLD→取得し直す。
- 費用は**追加課金原則0円**。Chat＋GitHub主軸、Work/Computer Useは毎回個別事前承認。ユーザー手順原則0回。MinecraftAIBuilderとはプロジェクト優先度が**同格**。12月対策/Strataへ目的が逸脱しない。

## 2. GitHub実測 — 2026-11-06現時点
- Repository https://github.com/ryomashibaba/browser-ink-tps
- 継続branch **research/t21-integrated-a1-c-patrol-four-mode-20261105**。**最終ゲームコード SHA 9f5fa6faafacb217f33b46ce66f620b5c4be6898**。
- 直近 [B441真正Chromium #42214652579](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42214652579) **completed/SUCCESS**、Artifact **13501190902**。本物のPlayCanvas+Rapier+Recast/CPU7/実Mouse+Keyboard、720 native tick超、源25/17/26/0の短時間検証、B450/B452/B454独立監査が成功。実Cキー2回、厳格A1原作Goal承認2、実原作到着2、前線CPU実Goal要求172（これは172回の別個の到着/接敵/撃破ではない）。本SOURCEのみ正式得点0、対岸/敵HP/公式Winner未認証。
- 「練習60秒TIME_UP後、180秒本体PLAYINGのまま本物Cを3回目に受理」は**別SHA 241aff666ce217003f4562c4feb0c0c42ca0d1b9** [#42202098232](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42202098232)の真正PASS。自然elapsedTicks3600・残り約119.97秒・真C注文数3。3回目の原作Goalは**HOLD**であり、受理をルート承認に昇格しない。
- [B441/B162 #42206999154 / #42206998706](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42206999154)は**先行SHA 91275a175c1ffa8fa5e3fae3303fa3140769cfcc**で両SUCCESS。B162真正協力CLEAR、人間808セル、A1原作38セル、native 880 tick。最新9f5fa6faafacb217f33b46ce66f620b5c4be6898のB162再認証ではない。
- 研究変更**1783f13e**：中心が味方OWNでも、同じ原作Floorの実active ownerGrid隣接セルが敵/NeutralならA1の既存原作候補を検討。真のRecast全経路＋Rapier支持は従前厳格。**候補の価値増加は設計仮説**であり、同条件の原作Goal承認/到着/塗装増加を比較した実証ではない。最新B441 SUCCESSは機能互換と限定実C注文の証拠。旧CI #42214459678/#42214459746のTypeScriptテストfixture型失敗は**9f5fa6fa**で修正し、B441最新成功；B162は最新SHAで未走行。
- 旧統合版 **c14809d875e5** B441 [#42044631548](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42044631548) / B162 [#42044631755](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42044631755) 真正SUCCESS。B470巡回・B471本物KeyC原作Goal・B472四SOURCE入口既存12武器。歴史的Baselineとしてのみ保存。
- 別旧研究SHA **617f415841147ec2c76619eaf0a70ee4d9590d88** のB413 [#42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341)は2試合連続の本物180秒TIME_UP・人間射撃/OWN回復/再射撃の限定SUCCESS。**最新HEADの2×180秒を証明しない**。
- main **fbd922cea900df8e1a139f21b3c61ed927b3fdd9**、Draft PR #5はOpen/Draft/未merge、PR head **8cfc95756ef0b56e2c33dc9f89a9041126daa272**。保護。
- 旧別branch **research/t21-b406-single-session-real-enemy-range-audit-20261103**、dev/t21-f4e103w-qa-infra、ほか候補は別系統。勝手にrebase/merge/採用しない。各ゲーム機能は現branchの実コードを確認すること。

## 3. 完成したもの／絶対に完成扱いしないもの
**できた（証拠のある範囲）：** 実原作SOURCE上の7CPU再合流・原作KCC/初降下/同側物理巡回；本物のPlayer WASD/Mouse/複数武器・原作塗装・Ink/HP既存機構・A1協力CLEAR、厳格原作C指示・真到着・native HUD、旧SHAの2×180秒と実再戦ボタン、4 SOURCEモード導線・12武器選択。コードにHP/撃破/復活機能が存在することと、対敵での自然な全シーケンス実証は別。
**HOLD：** Ver.7.2.0通常ナワバリのFloorLine00個別原作collision属性とCPU半径0.30m連続経路、中央両側への自然通行、全8人の自然敵遭遇、相手CPUへの真のProjectile命中→HP減→撃破→150tick復活の同一世界証拠、Scoreable/公式得点/勝者、最新HEADの2×180秒、Windowsダブルクリック真正実機、F5 ART/Performance/公開。正式ゲーム4v4ではない。
**版の注意：** Leanny 720 SceneInfoの Vss_Temple01=改修後マテガイ放水路は強い命名根拠。しかし公開OBJのSHA/Face一致は版・対戦モード・元ゲームcollision flagの証明ではない。B369独立31-solid物理QAの片側3＋3フレームにはnative KCC源コリジョン証拠なし。QA面をゲーム本体へ昇格しない。

## 4. 失敗を構造的に評価（見逃したくない欠点）
1. **成果単位の誤り**：B番号、厳格Goal要求数、テスト254件、CI SUCCESSを開発目的と混同しがちだった。到着の物理・真Projectile命中・被ダメージ・復活・試合の面白さは別。B441が成功でも自然対敵0/12と正式4v4 HOLDは動かない。
2. **細切れの蓄積**：11/06もB483/B484/B485/練習TIME_UP/HUD/OWN隣接などを小差分で連続pushし、1つの軽微なテスト構文や型の誤りでGitHub Actionsを複数回起動した。型チェック不足を長時間CIで検出するのは非効率。新しいB番号やworkflowを成果にしない。
3. **独立実証の境界不足**：旧SHAで通った2×180秒/A1 CLEARと新HEAD短時間B441 PASSを合成して『同SHAで正式180秒対敵試合完走』とは言えない。RUNの該当SHA/Artifact/真入力・Native結果を毎回紐付ける。
4. **入力問題の誤追跡**：B200 Rキーは過去 #42110442130 と #42111873226 でChrome DOMのKeyR受信**0**。重いA1協力CLEAR後、同条件のCDP R入力を繰り返しても新規情報はなかった。実マウスの再戦導線を維持し、Rショートカットは新しい入力配送証拠が得られるまで局所HOLD。JS手動イベント注入で真PASS化しない。
5. **F4での過剰推論**：元OBJの外観・FloorLine00 QA歩行・center ray不在でもperipheral支持がある事実を、全CPU安全・公式原作collisionと誤読してはならない。追加証拠がないまま未認証床/リンクをつないで進捗を演出しない。
6. **UI密度/ART不足**：現ゲームは小字の監査HUDが多く、元の立体空間・敵・照準が見えにくい。見かけのデバッグ機能増大はF5価値を損なう。次の大機能ではPLAYER UIを減らしQA情報は裏側に保つ。
7. **正本肥大・並行開発競合**：古い『次工程』や『CI実行中』がSTART_HEREに多数。新たな長文を同ファイルに直貼りせず、この一括最新版へ短いリンクだけを置く。HEAD/branch正規系・他研究を混同しない。

## 5. 再批判して修正した実行契約（F1〜F5は不変更）
- **最初に1つだけ『ゲームプレイヤーに新しく何ができるか』を書く。** 直接遊びを変えないUI/HUD/小検査は原則まとめるか延期。既に本物C2回＋原作到着2回まで成功しているので同じA1指示を際限なく最適化しない。
- 現研究HEADを原子性を持って読む。差分競合はHOLD。ゲームファイル変更前にはコード適合性・テストfixture TS型の自動/静的確認を優先。関連実装を**一機能バッチ**にまとめてから1回の非forceコミット。小構文修正を一個ずつ真Chromeで判定しない。
- 重要変更は軽量TypeScript/Vitest/build→**必要な既存1本の真Chromium**→独立RAW/PNG→具体的なゲーム作用の実測。2×180秒テストはnative時計/Ink/復活/再戦等の変更時または節目のみ。既存workflowのconcurrency/cancelを必ず確認し、CI実行中の同branchへの新pushでキャンセルしない。
- 各証明に VERIFIED / PARTIAL / HOLD / UNKNOWN と**同じSHA**、Native物理事実、スクリーンショット/証拠、未証明境界を付ける。見込みは見込みと書く。真Native goal requestはshot/hitやroute crossingではない。
- F4の原作collision/版不明は局所 SOURCE_AUTHORITY HOLD。しかしF1/F2/F3の**許可済み既存SOURCE上**で本当のプレイ/射撃・塗装・Player/CPU挙動やUX改善を進める。推定で敵を移動/配置しない。
- user操作を**原則0**にする。Chat＋GitHub内で自動的に取れる資料/証拠/実装/Actions/レビュー/文書を完了。人間Windows/ART試遊が本当に必要な節目でのみ、事前に起動ファイル・操作・成功/失敗の判定を整えた1回の最小確認を依頼。追加課金なし、Workは個別事前承認。

## 6. この順に進める次の大きな3バッチ
### Batch 1: F3実戦成立の最大障害を1つ減らす（最優先）
原作Human/7CPUの本物の foot・Recast path・原作solid・弾と実射線・HP/150tick復活を**同一世界の既存証拠**で突き合わせる。現在の自然敵遭遇が不可なら（F4 source通行不足）、不可の物理・ルート・遮蔽の原因を原作証拠で1つまで絞り、HOLD。許可済みSOURCE内で実際に改善できる戦闘（Human input→実弾/着弾→本物の敵への自然命中/HP→撃破→復活）を一つの完成した縦切り機能へまとめる。ただし原作自然到達が不可ならHP/撃破の達成を作為的に偽装しない。代わりに既存SOURCE上の本当の移動/武器/InkとCPU行動を遊べる一体験として改善し、実際に遊べる差分と証拠を提出。長時間反復で不明なcollisionを解消したことにはしない。
**合格条件：** 本物の1セッションで新しいプレイ行動が計測される。真の敵HP通し実証が成立しない場合は狭いHOLDを維持。既存Cキー/同側巡回の証拠を無限再検証しない。

### Batch 2: F4原作の連続通行は新証拠がある場合だけ昇格
7.2.0通常モード/Temple01抽出時版→原作collision flags→FloorLine00の通行可否→CPU半径0.30m全カプセル支持→真正Recast/Rapier連続経路の順に**未確定の根拠だけ**確認。無ければF4 AUTHORITY HOLDを継続し、Batch 1/3を止めない。QA31-solidは別環境であり正式Stageへコピーしない。
**合格条件：** 原作由来Face/版/衝突・実真body全行程・同一Actor接続を証拠付きで満たす場合のみ実ゲームへ採用する。

### Batch 3: F3の本物の1プレイからF5品質へ
4 SOURCE入口・既存12武器→READY→真180秒→TIME_UP→**現実に機能する再戦ボタン**を、プレイヤー向け1600×900の実画面、簡潔なHUD、音/インク/HP/武器/撃破・再登場で一続きにする。デバッグ表示とPLAYER UIを分離して画面密度を減らし、形状・敵・Aimの読みやすさを改善。現HEADの2×180秒再証明はこのような試合コアのまとまった変更後の節目で行い、人間ART/Windows確認は最後に1回へまとめる。
**合格条件：** 同一SHA・本当のPlayCanvas/60Hz/7CPUと原作支持の1セッション、実操作→終了→再戦のRAW+画面証拠。正式4v4/公式勝敗・ART認定は明示の別ゲート。

※3バッチは既存F1〜F5の**作業の束ね方**であってロードマップや完成条件の置換ではない。

## 7. 次チャット開始前のチェック / 停止規約
1. この文書と固定T21/FAST TRACK・B470/B471/B472統合履歴・F4版衝突記録を読み、最新branch HEAD/main/PR #5とアクティブActionsを再照合。
2. 現SHA B441の本物の成果とB162/2×180sの他SHAの成果を分離。新ゲームHEADなら未再試験は再試験前にPASS扱いしない。
3. 作業が『次に何を遊べるか』を説明できるまで新コードを増やさず、最重要根本原因へ機能単位で手を入れる。無意味な追加B番号・重複CI・Rキー同条件再試行をしない。
4. main/PR/原本/正式QA/Pages/費用/Work承認を守れなければHOLD。証拠不足で正式4v4に到達できなければ、その局所だけHOLDしF3の許可済み作業を進める。
5. 返答は『遊べる差分・HEAD・実証Actions/Artifact・現残HOLD・ユーザーに必要な最小操作』を短く報告する。日本語。

**次に最優先するのは、A1 Cキーの3回目やHUD調整ではなく、自然対敵戦闘のF3/F4根本障害と許可されたSOURCE上での実ゲーム体験のまとまった進展。**
