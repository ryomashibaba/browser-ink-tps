# Browser Ink TPS — B406時点・完全統合開発引き継ぎ（2026-11-03 JST）

この文書は **2026年11月3日、B406の実装とB405真正180秒成功後**の再開正本。
元の固定方針は docs/continuity/DECISIONS_JA.md、docs/continuity/FAST_TRACK_EXECUTION_JA.md、T21_FAST_TRACK_ROADMAP.md、CURRENT_CANONICAL.md にある。**本書はこれらを変更せず、最新工程・確認済み証拠・未完了を追記したもの。**
旧 docs/continuity/HANDOFF_20261103_COMPLETE_JA.md、CURRENT_SESSION_JA.md の途中時点のQueued/PASS/SHAや旧工程を本書より優先しない。GitHubの実HEADとActionsを毎回照合する。長大なチャットの復唱より、このGitHub正本を使う。

## 0. 最も重要な現在地と区分

- **本当に成功した新しい到達点**：B405で**同一の本物のChromium・同一試合**において、人間による本物のマウス照準・発射・原作ownerGrid塗装と実WASD、CPU7体のSOURCE試合、真正60Hzの180秒TIME_UPを成立させた。
- B405修正版の [GitHub Actions #41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883) は全ジョブ・全ステップSUCCESS。真のartifactは **13215309208**、ファイル b405-same-original-180s-round.json のSHA256 **97f1f3bd08d1fe38c58f9fa5ed566c2fc7228f6d771561948952e5ab281227a5**。原本画像4枚とdriver / independent verdictあり。
- 真の終了native tick **11855**。同一試合の人間実射撃 **9発**、人間実変化 **92原作セル**、CPU実変化 **11,773原作セル**、CPU SOURCE shot requests **108**、native人間→敵CPU HP命中 **0**、敵CPU撃破 **0**、復活 **0**。SOURCE-onlyの限定PASSであり、正式4v4・敵撃破・公式得点・勝利・本番のPASSではない。人間が180秒間ずっと能動的に操作した証拠でもない（実射撃/WASDは序盤、以降は同じ実試合の観測）。
- B406は、同じB405の7枚のnative実座標サンプルについて人間とB1〜B4の水平距離・高さ・生命状態を独立再計算する**読取り専用監査**。Unit/Nodeの [#41603445518](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41603445518) はSUCCESS、B406最終Unit HEADは 74813b578fda41d09d28f5eb4cd80cf4f25b5467。
- B406本物のB405 artifactをSHAで再取得して監査するコードは 9da6448e78c46f6ae2a7460261027effc3359508 に保存した。[真正証拠再計算CI #41604651650](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41604651650) は **全ジョブ・全ステップSUCCESS（2026-11-03）**。真正B405 rawをSHAで検証後、同じ試合の7時点・敵B1〜B4の距離を独立計算した。本物の出力artifactは **13216270763**、ファイル b406-genuine-enemy-range-report.json。Unitだけでなく元JSON実証を確認済み。ただし真の敵HP命中、自然交戦、ステージRaycast、4v4等は継続HOLD。
- B405原本からの別途独立座標計算で、同一試合7時点の最近敵は、入力直後B1 **116.991m**、150秒B4 **119.324m**、120秒B2 **117.479m**、90秒B2 **117.653m**、60秒B1 **117.658m**、30秒B2 **117.677m**、終了時B2 **117.630m**。これは時点間を補間しない。B181の**光学照準候補上限32m**より遠いが、32mは武器の真の射程やRaycast確認そのものではない。実被弾ゼロを超えて「どの位置からも敵が撃てない」と断定しない。

## 1. リポジトリ・ブランチ・保護対象

- Repository: https://github.com/ryomashibaba/browser-ink-tps
- 正式QAの現行HEAD: dev/t21-f4e103w-qa-infra = **8c104658a1842218bdfeff07792b3ab35576a0c4**。**本研究では変更していない**。同HEADのB139/B162/B312/B316/B318/B322/B328などの真正CI SUCCESSを過去に確認。今後再取得する。
- mainの確認済みHEAD: **fbd922cea900df8e1a139f21b3c61ed927b3fdd9**。触れていない。
- 現在の隔離研究ブランチ：**research/t21-b406-single-session-real-enemy-range-audit-20261103**。本書作成前のコード・研究HEAD **9da6448e78c46f6ae2a7460261027effc3359508**。本書自体のコミットでHEADが進むため、再開時に必ず実HEADを取得し**文書変更とゲーム実装変更**を区別する。
- B405真正180秒の基準コード branch research/t21-b405-one-real-180s-human-7cpu-source-round-20261103 / HEAD **833b43693b3f11cb376fb076f75d30130ad08faa**。
- 3系統 SOURCE統合 branch research/t21-f2-f3-b337-native-integration-20261103 / HEAD **ab62cd69a954efc82a4488723f6a75df0a77f1dc**。
- 既存B404研究 branch research/t21-b404-genuine-corridor-vs-opponent-envelope-20261103 / HEAD **bbb12c26518b0f6952c0e022540a1031264a16c1**。
- 従来のDraft PR #5は保護し、無断merge/書替え禁止。main、T19C/T20凍結、公開GitHub Pages、productionブランチ、原本ローカルWindows、原作非公開資料（元OBJ/bphsh/テクスチャ/Actor等）の無断アップロード、Web/Work公開禁止。
- GitHub研究branchでの実装・証拠保存は許可済みのChat+GitHub作業の延長だが、**研究PASS→正式QA昇格/PRマージ/公開**は自動で行わない。旧正本の「QAで開発」を主ルートとして尊重し、今回の研究隔離は既存QAを壊さないための保護措置である。QA統合可否は真正・安全審査と適切なユーザー承認を経る。

## 2. 決して再決定しないゴール・全体方針

Nintendo『スプラトゥーン3』Ver.7.2.0の**改修後マテガイ放水路（Undertow Spillway）・通常ナワバリ**を、原作にできるだけ忠実なブラウザ3D TPSとして、本当に遊べる形に仕上げる。Big Run、トリカラ、別バージョン、別ステージを混ぜない。

**人間1＋CPU7の自然な4v4／180秒**で、原作ステージ・位置・移動・接地・ジャンプ/イカ移動、武器/サブ・本物の弾道、射撃と原作塗装、インク経済・HP減少・撃破・**150 native tick後の復活**、正式Scoreableに基づく陣地得点・勝敗、時間切れ・再戦、視認性・ART・性能・操作感まで、切れ目のない実ゲームを実現する。

固定F1〜F5計画：
- **F1**：SOURCEに基づく真の8Actor・出生/再合流・衝突/役割。
- **F2**：Rapier本物のKCC物理歩行、Recast/Crowd、自然で連続する原作地形移動。
- **F3**：実WASD/マウス/射撃/塗装/インク/HP/撃破/復活/180秒/再戦のプレイ可能な縦断。
- **F4**：原作3D地形と±Z中央・両側接続、適法な衝突/経路、原作Scoreableと真の得点/勝敗。
- **F5**：画質・ART・カメラ/UX・音・性能、真人間プレイと品質最終受入。
- **原作忠実度・実プレイ品質最優先**。B番号・コミット数・テスト数・CIジョブ数や機械的塗装セルの増分を完成としない。F4未認証区間のみHOLDしてF1/F2/F3/F5の独立価値がある改善を継続する。過去の決定を勝手にリセット・方針転換しない。

## 3. 正本のアーキテクチャ・SOURCE境界

- 既存TypeScript＋Vite、PlayCanvas Engine 2、Rapier 3D KCC、Recast Navigation/Crowd、60Hz固定物理、SOURCEの実CPU/人間Actor。
- 原作SOURCEの実証境界：**25 Rapier solids / 17 real PaintSurfaces / 26 NavLinks / 0 Scoreable**。自然対岸の正式認証 **0/12**。activationReady=false / productionAuthorized=false / unrestricted4v4Certified=false、officialWinner=NONE、Turf結果はSOURCE未許可。塗装所有者数や実変化セル＝**公式得点ではない**。
- CPU gameplay ink / PaintCoordinator.processTick() → immutable PaintEvent → GameplayInk＋GPU Atlasの固定権威分離。GPU画像や仮表示からHP/ゲーム得点を捏造しない。
- 人間の物理KCCとRecast上の「非物理 HUMAN Crowd代理」は別物。Recast座標の不整合を人間のワープと誤認しない。元StageSolidの物理サポートと元ナビゲーション投影の近さだけで経路認証しない。
- 禁止：架空床/坂/橋/透明足場/水位/新NavLink/未認証衝突/架空Scoreable/敵スポーン、Actorテレポート、CPU半径縮小・radius zero Recast採用、QA tick進行注入、偽WASD・偽弾/偽所有インク/偽HP/kill/respawn/人工得点、便宜的ゲート閾値緩和。原作不明なら**不明/HOLD**と書く。
- 同SHAのビルド・Vitest・真Chromium/CDP、Rapier collision、実足元、17 ownerGrid、実Native tick、証拠PNG/JSONを区別。Unit/SOURCE geometry sample/AI候補/オプトイン模擬のPASSは真のプレイPASSでも公式4v4でもない。

## 4. 直近の本物の成果（年月日/工程/証拠）

| 工程 | 真正結果または試験範囲 | 証拠 |
|---|---|---|
| B281 / B123 | 原作高所→初落下、着地/下段/坂/右上段までの局所KCC。B281 genuine 7 KeyW holds・16.3881m・tick243実接地、B123約18.74m右上段到達 | Actions #40677550686 / #40675889587（各旧SHA） |
| B322 | 原作初着地/ランプ上り/crest/上段延長まで、真正CDP実キー32足元記録（6 JSON、各SHA-pinned） | [#41571706674](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706674)、artifact 13203949453 |
| F2研究 | 原作ランプへの実KeyW4tickパルス×4、原作足元支持、水平移動約1.562m。原作3つの独立PaintSurfaceに実人間塗装 | [#41588119357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41588119357) |
| F3研究 | SOURCE敵CPU HP0の同tick splatBot、B367の読み取り専用実生命状態候補、150tick復活/再合流ロジック。**Vitest 50/50＋型検査**であって真正実敵撃破は未証明 | [#41594101783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594101783) |
| B337研究 | 本物のCDP mouse yaw/pitchと物理弾9発、原作高所PaintSurface ownerGridの実92セル、人間実WASD、7CPU、元SOURCE足元、独立監査 | [#41594858216](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594858216) |
| F2＋F3 | 同一ビルドでF3 SOURCE生命状態回帰＋F2真正ランプ物理・B315原作3面実塗装 | [#41595648530](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41595648530) |
| F2＋F3＋B337 | 同一ビルドでF3 50検査＋F2実Chromium移動/3面インク＋B337別実Chromium照準/9発/92セル。**二つの別セッション、単一試合ではない** | [#41596283655](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41596283655) |
| B403 | B340の元180秒SOURCE証拠をSHA-pinで読み直し、固定高所人間から7時点の最近敵が116.824〜120.494m。B181光学候補上限32mの外。これは固定高所時点のみ | [#41597891974](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41597891974) |
| B404 | B322実人間32足×別B340実敵28足＝896組の原作実座標の別試合比較。最小約97.553m。**同じ試合・同じtickではない** | [#41599352971](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41599352971) |
| B405 | **同一真正180秒セッション**、人間9発/92セル、CPU塗装11,773/射撃要求108、真正TIME_UP tick11855、実HP命中/撃破/復活0。B337実入力後同一試合で全終了時点まで検証 | [#41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883)、artifact 13215309208 |
| B406 | 同一B405真正180秒の元artifact SHA256検証後、人間↔実B1〜B4の7native時点の距離を独立計算して **真正SOURCE限定PASS**。最近敵距離116.991〜119.324m、全てB181光学候補上限32m外、実HP命中は0。真正戦闘/4v4はHOLD | [Unit #41603445518](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41603445518) SUCCESS、[原本再計算 #41604651650](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41604651650) **SUCCESS**、artifact 13216270763 |

特にB405で長時間のSOURCEプレイ可能性は一段進んだ。ただし**9発は試合序盤で発射したもので、180秒通して人間が撃ち続けた証拠ではない**。7 CPUと人間のSOURCE活動はあるが、本来の相手陣への自然な交戦が生じたわけではない。

## 5. F4源流の失敗と今後繰り返さないこと

- 中央アンダーパス本物のRecast到達終端残距離：正Z **31.7162272m**、負Z **31.7857453m**（過去の本物のSOURCE観測）。0/12両陣営自然経路。単にルート計画が終わった/ナビポリゴンが近いだけで突破認証しない。
- 既登録された原作右上段 flat floor とガラス下段 flat floorの平面輪郭の距離は**27.742890m**、高さ差-4.5m。これは既登録フラット床間の幾何最短距離であり全25 solidで可能なジャンプや坂道まで不可能とは言えない（B285）。
- B238–B241隔離31-solid原作Face実験：FloorLine00幅 **0.3111352183m**、CPU navigation直径 **0.60m** / human実KCC直径0.64m。KCCで一部横方向の原作由来三角面を歩けても原作ゲームの衝突フラグ・CPU安全動線は未確定。原Recast安全半径設定ではProjection ~1mずれ、radius0で見かけの投影が改善しても物理クリアランス違反につき不採用。
- B284：**Vss_Temple01＝改修後マテガイ放水路**のモデルIDはLeanny 720/920/1130 SceneInfoで確定済み。昔のKiTrix便利な英語名対応の矛盾は解決済み。**IDの確認と FloorLine00衝突採用属性の確認は別問題**。不明なcollision intentを原作として登録しない。
- B369/B370でFloorLine00付近のKCC 7/8 center-ray nullフレームを多点Ray+native KCC collisionで調べ、upward原作KCC接触4/7・5/8を確認、残り**正負とも3 native tick**のsame-frame collision記録なし。前後の実接触とsnapToGround仮説を記録済み。これを何度も再調査しても新しいゲーム価値に直結しないため、**元bphsh等の実衝突権威が手に入るまではF4該当箇所HOLD**。
- B283は登録済み床内の横移動候補を純粋幾何でスクリーニング。既にB127まっすぐWは実床端余裕0.470656mで危険・REJECT。安全基準0.60m sampled/0.65m endpointを緩めて緑にしない。再び同じ床を数cm動く実験でF4全体接続と勘違いしない。
- 原作衝突セマンティクスを調べるには描画KiTrix OBJ/モデルSceneInfoだけでなくPhive .bphshの衝突Shape・material disable flags（NoHit/Ground/SplPlayer等）の対象ステージ/版確認が必要。第三者ツールPhiveConverterのREADMEはその方法の参考にすぎず、**対象FloorLine00衝突証拠は未取得**。非公開データを無断でアップロードしない。

## 6. 固定された反省点・失敗防止

1. **実ゲーム改善＞B番号増殖＞軽いUnit数値合わせ**。何度も類似SOURCE distance研究を繰り返さない。B405が真に達成した局所人間+CPUの180秒セッションから、次は人間の意味ある経路移動・射撃/塗装・CPUの自然対戦・元Stageを一体に高める。
2. **CIの成功範囲を厳密に**。Node/TS成功＝真正Chrome成功ではない。2つの異なるChromeセッション＝同一試合ではない。過去SHAのPASSを新SHAに移植しない。証拠JSONの「7回観測」＝180秒全フレーム連続認証ではない。CPUの射撃request≠実着弾≠PaintEvent変更≠HP命中、SOURCEインク所有面積≠公式Scoreable。
3. **想像上の進展は禁止**。actor position/HP/Ink/tick/routeやRayを捏造する、実CPUをワープさせて敵命中させる、FloorLine00を無根拠で衝突床へ昇格させる、安全半径を0にする、仮の勝者を作ることは既存方針違反。
4. **本物の物理を優先**。CDP KeyW nominal tickと実native tickはずれることがある。慣性、当たり判定、端余裕、元PaintSurface有効cell、Rapier colliderを観測する。人間KCC vs Crowd HUMAN代理は別。Ray hitやNavMesh投影だけではカプセルの通行・跳躍・支持を証明しない。
5. **短時間試験/局所限定・偽陽性に注意**。B337実射撃と元インクは合格でも原作射撃の全射程・任天堂内部確率・CPU撃破は未証明。B405実TIME_UPは公式4v4ではない。F3 50 test PASSは本物の敵への成功ではない。
6. **高コストCI乱発を避ける**。B403/B404/B406のように保存済み真正GitHub Actions ArtifactをSHAで再利用できるなら再利用。UnitだけのB406検査で成果を大きく見せず、1本の真正ゲームCIと独立審査で実価値を証明。Queue中の同目的を繰り返しPushしない。
7. **SOURCE安全契約は固定**。原作25/17/26/0、0/12、activationReady=false、formal4v4/ART/production HOLD。bphsh/原作Face著作権素材、main/T20/PR#5/Pagesへの影響を拒否する。
8. **Chat＋GitHub中心 / ユーザー操作最小**。Workは明確な便益・ユーザー事前承認がある時だけ。コストのため不用意に高額モデル/Work・ユーザーローカル操作を求めず、GitHubコミット・Actions artifactを直接利用。複数実作業をまとめ、途中で止まらず可能な限り実装→検証→保存する。
9. **引き継ぎのUXを維持**。新チャットではこの固定GitHub入口を読む。毎度巨大テキスト・ZIP/画面写真をユーザーに提出させない。README・docsが古い数値を含む場合は実ブランチHEADのActionsが優先。今回のroot START_HERE.mdは研究ブランチの新設入口であり、既存の docs/continuity/START_HERE_JA.md（正式QAの固定入口）は壊さない。

## 7. 次チャットで実際に行う工程（確認だけで終わらない）

1. **最初に**研究branchの本物のHEAD / QA HEAD / main / Draft PR#5 / GitHub Actionsを照合。B405 **#41601683883 は真正180秒PASS**、B406 **#41604651650 は同一真正試合の7時点敵距離を元SHA固定artifactから再計算してPASS**である。新チャットでは両者のSUCCESS/対象SHAを確認し、完了工程を未完了に巻き戻さない。
2. **B406実証は成功済み**。単純な距離研究をさらに増殖させず、**B405真正180秒のプレイ実価値の不足**（序盤に9発→その後人間操作なし、敵CPUとの交戦0）を改善する。**実SOURCE原作KCCの許された下段/ランプ/上段ルート**を同じ一つの真正180秒ゲームで人間が実WASD/マウス/実弾・本物ownerGrid変化を伴って進む、意味のある一続きの試合を優先。既存B316/B322/B337/B405のCDP/物理証拠を再利用し、新しい偽の道・WASD指示だけで移動認証・危険床通過・Actor座標操作は禁止。
3. 本当に原作地形上で同時刻の生存CPUまで実武器射程/本物のRapierステージレイが通る時だけ、ProjectileSystemの**真正CPU HP削減→同じB actorのHP0→splat→150 native tick後の元spawn復帰**を一体検証。敵が遠方で交戦が不成立なら正直にHOLDし、射撃・照準・カメラ・インク回復・SOURCEのゲーム価値改善へ戻る。人為的な敵同床ワープや架空HP命中は禁止。
4. 並行F4は **既存25 solidの原作出典・collision bphsh等の本物の権威**が新しく得られた時だけ中央切断を再研究。B370の沈黙フレーム・B285のflat gapや31.716mを数値追い直しして工程を消耗しない。original version 7.2.0 適合を確認できなければ明示HOLD。
5. F3同一試合の実TIME_UP/再戦・PLAYER操作・HUD/敵視認、F5の本物のART/画面品質も、ゲーム全体に価値あるまとまりで改善する。画像だけの美化、SOURCE未認証を隠すUI、架空scoreなどは不可。
6. 新しい研究コミットは分離・expected HEAD・force禁止。必要なテストは同SHA、真のActionsと実PNG/JSONで判定し、日本語で**「変えたもの／SHA／検証URL／実測／限定PASS／HOLD／次のゲーム機能」**を報告。main/正式QA・PR・Pagesは事前確認・承認なしに変更しない。Work実行しない。

## 8. 必読のGitHub正本リンク

- 固定QA入口：[docs/continuity/START_HERE_JA.md](START_HERE_JA.md)
- 永続決定：[DECISIONS_JA.md](DECISIONS_JA.md)
- Fast Track：[FAST_TRACK_EXECUTION_JA.md](FAST_TRACK_EXECUTION_JA.md)
- F1–F5：[T21_FAST_TRACK_ROADMAP.md](../../T21_FAST_TRACK_ROADMAP.md)
- 凍結設計：[CURRENT_CANONICAL.md](../../CURRENT_CANONICAL.md)
- 2026-11-03旧統合：[HANDOFF_20261103_COMPLETE_JA.md](HANDOFF_20261103_COMPLETE_JA.md)
- 進捗履歴：[CURRENT_SESSION_JA.md](CURRENT_SESSION_JA.md)
- B405実作業：[T21_B405_TRUE_ONE_180S_HUMAN_7CPU_SOURCE_20261103_JA.md](../qa/T21_B405_TRUE_ONE_180S_HUMAN_7CPU_SOURCE_20261103_JA.md)
- B406実作業：[T21_B406_SAME_GAME_NATIVE_ENEMY_FRONTIER_20261103_JA.md](../qa/T21_B406_SAME_GAME_NATIVE_ENEMY_FRONTIER_20261103_JA.md)
- F4原作衝突調査：[T21_B370_NATIVE_KCC_TEMPORAL_CONTACT_AND_GROUNDED_GAP.md](../qa/T21_B370_NATIVE_KCC_TEMPORAL_CONTACT_AND_GROUNDED_GAP.md)
- 原作モデルID確認：[T21_B284_PINNED_SCENEINFO_SOURCE_IDENTITY.md](../qa/T21_B284_PINNED_SCENEINFO_SOURCE_IDENTITY.md)

## 9. 新チャット用最短プロンプト

> Browser Ink TPSをGitHubの最新正本から完全に引き継いで開発再開。研究ブランチ research/t21-b406-single-session-real-enemy-range-audit-20261103 のルート START_HERE.md を最初に読み、B406完全統合引き継ぎと既存固定方針を継承。最新HEAD・B405真正180秒PASS・B406実証CIとartifactを確認し、残るSOURCE/正式4v4/ART HOLDを厳守しつつ、次の実際のプレイ品質向上をコード・真正検証・GitHub保存まで進めて。main/正式QA/T20/Draft PR#5/Pagesは変更せず、Workは事前承認、ユーザー操作不要・Chat＋GitHub中心。
