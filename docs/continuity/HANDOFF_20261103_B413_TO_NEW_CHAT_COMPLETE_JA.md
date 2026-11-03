# Browser Ink TPS — 2026年11月3日 完全統合・新チャット引き継ぎ正本（B412真正PASS／B413継続）

**2026-11-03 JST。Chat＋GitHub継続、Workはユーザー事前承認制。研究ブランチ保存版。**

この文書は「すべての計画や方針、指示、反省点をまとめ、新しいチャットに移る」というユーザーの明示的な要望に対する継続正本。以前の決定を置き換えない。先に必ず root START_HERE.md と、旧B406完全統合正本、DECISIONS_JA、FAST_TRACK_EXECUTION_JA、F1–F5 ROADMAP、CURRENT_CANONICAL を読む。過去SHAの古いステータスより、今回のGitHub実HEAD・Actions・元artifactが優先。ただし証拠の出典時点や旧失敗履歴を消さない。

## 0. 最重要結論・最新状態の厳密な切り分け

1. **B412まで真正Chromiumの局所SOURCEゲームPASS。** CPU7体の同一SOURCE 180秒試合で、実人間CDP入力、原作高所→初着地→正Z坂→元右上段への物理Rapier KCC、原作4つの別のPaintSurfaceへの実人間射撃/塗装、残り120/60/30秒の本物の人間追加操作、原作OWNインクでのイカ泳ぎ、物理KeyS帰路、ヒト復帰、試合中の視界優先HUD、真のTIME_UPでの再戦ボタン復帰を同時に実証した。
2. **B413は新実装・真正総合HOLD。** 残り90秒の前後で「実射撃→本物のPlayerResourcesインク消費→原作OWNイカ泳ぎによるSQUID_OWN回復→本物のヒト再射撃」を、上記1本の180秒セッションに追加。初回CIは真正FAIL、既存B408の120秒時点のCDP照準を90秒でも再利用して元右上段への実着弾監査が成立しなかった。修正版は**毎回現在のsource ownerGrid・実カメラからread-onlyのB408再照準**を作る。修正コードSHA 7fb9740ad50ebfc06fd139bac3a1146f1db2ce11 の [Actions #41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) は**この引き継ぎ執筆時点では実180秒試合をin_progress**。Node unit・ビルドはSUCCESS、実試合と独立監査の結論は未確定。次チャットの**最初の一手**は最新完了結果を取得すること。
3. **正式4v4・相手CPUへの真正HP命中・splat/150 native tick復活・原作ナワバリ得点/勝敗・全体ART・公開本番はHOLD。** このSOURCE実証を任天堂原作の正式フルマッチと称してはならない。
4. **ユーザーの操作なしでChat＋GitHub上の実作業を進める。** 過去のQA/研究を理由なくやり直さず、時間やCI使用量を節約しながらゲーム品質は落とさない。Work・公開・マージ・保護対象変更は事前にユーザー承認が必要。

## 1. リポジトリ・ブランチ・保護対象

- GitHub repository: https://github.com/ryomashibaba/browser-ink-tps
- 継続研究branch: research/t21-b406-single-session-real-enemy-range-audit-20261103
- **現在のゲーム実装HEAD（B413修正）**: 7fb9740ad50ebfc06fd139bac3a1146f1db2ce11（本書をGitHub保存したコミットでは研究HEADはこれより進む）。新チャットではcommitと最新branch SHAを必ず**再取得**し、「文書更新コミット」と「ゲーム実装更新」を区別。
- 保護 main: fbd922cea900df8e1a139f21b3c61ed927b3fdd9（引き継ぎ監査時点）
- 保護正式QA branch: dev/t21-f4e103w-qa-infra = 8c104658a1842218bdfeff07792b3ab35576a0c4（引き継ぎ監査時点）
- Draft PR #5: open, draft, unmerged。**無断編集・マージ・昇格不可**。
- T19C/T20安定凍結、main、GitHub Pages、production、本番公開、ユーザーのローカルWindows原本、原作非公開のOBJ/bphsh/Actor/画像は保護する。
- 実験は上記研究branchで実装・ログ・証拠保存。真正技術PASSはその研究スコープに限定し、正式QAへの昇格、本番有効化、公開ページ更新には別途審査と必要な承認を要する。

## 2. ユーザーが確定した最終目標と優先順位

再現対象は Nintendo Splatoon 3 Ver.7.2.0 の**改修後マテガイ放水路 Undertow Spillway、通常ナワバリ**。Big Run・トリカラ・別バージョン・別ステージと混ぜない。

ブラウザの本物のPlayCanvas/Rapier TPSとして**人間1＋CPU7の自然な4対4、180秒**を通し、原作に忠実な地形と連続移動、イカ/ヒト・武器/サブ・インク/原作塗装、実CPU交戦、HP減少・撃破・150 native tick後の復活、正式scoreableに基づく陣地得点・勝敗、試合終了・再戦、HUD/ART/視認性/性能を、**人間が実際に遊べる一つのゲーム**として完成する。

**品質の優先順位：原作忠実度 ＞ 実際に遊べる品質 ＞ 実移動・CPU自然判断 ＞ 回帰防止 ＞ 開発速度や利用量節約。** 速度や節約のため原作整合性を崩さない。研究の局所PASSやCI/test数だけを「完成」と呼ばない。以前の方針を新しいチャットだからと再決定しない。

F1〜F5（固定ロードマップ）：
- **F1:** SOURCEに裏打ちされた本物の8 Actor/4＋4初期配置/7 CPU、役割・衝突・自然再合流。元のSOURCEメタデータ/正規Actorとは異なるQAスポーンは明記。
- **F2:** 原作地形上のRapier KCC・Recast/Crowdによる自然な段差/落下/坂/対岸移動とCPU判断。足元物理接触とNavMesh投影を混同しない。
- **F3:** 本物のWASD/マウス、武器/弾/塗装、インク残量/回復、CPU本物HP・splat/150tick復帰、原作根拠のあるSOURCE 180秒プレイ・再戦を統合。未認証scoreableは0のまま、SOURCE限定の練習試合と公式得点を混同しない。
- **F4:** Ver.7.2.0原作の中央±Z接続・FloorLine00・bphsh衝突権威/CPU安全通路/公式Scoreableを本物のSOURCEからのみ確立。未認証範囲はその部分だけHOLD。他の実プレイ改善は止めない。
- **F5:** 実プレイのカメラ/照準/HUD/原作ビジュアル・ART・音・性能、人間操作の最終受入、正式QA→本番の厳格な審査・ユーザー承認。実ゲームが不自由なまま単に画像だけ美化しない。

## 3. 絶対に変更・偽装してはいけないSOURCE安全契約

- 元の実証SOURCEステージ: **25 Rapier solids、17 PaintSurfaces、26 NavLinks、0 Scoreable**。自然な対岸Recast正式経路 **0/12**。activationReady=false、productionAuthorized=false、unrestricted4v4Certified=false、officialWinner=NONE。原作PaintSurfaceへの実着弾/ownerGridセル変化は**公式陣地得点とは違う**。
- 技術: TypeScript＋Vite、PlayCanvas Engine 2、Rapier 3D KCC、Recast Navigation/Crowd、元の固定60Hz native tick、PlayerController、PlayerResources、ProjectileSystem、GameplayInkSystem/PaintCoordinator→immutable PaintEvent→GPU表示という権威分離。旧T19C/T20の原本を無承認置換しない。
- 人間の物理Rapier KCCと、Recastの**非物理HUMAN Crowd代理**を混同しない。HUMAN代理の大きな位置ジャンプは自動的に真の物理プレイヤーワープを意味しない。
- 絶対禁止: 架空の床/透明救済足場/橋/坂/水位/新NavLink、衝突フラグ推測追加、Scoreable/勝者の捏造、Actor/CPUワープ・簡単なスポーン近接化、インク/HP/shot/弾道/tickの直接書換・デバッグ用敵命中の実プレイへの偽昇格、radius0の不安全経路、QA閾値を緩めて緑にすること。
- 顔/モデルSceneInfo・見かけのRaycast・Recast近接投影だけでは全身が原作の物理権威に従って安全に歩ける証明にならない。原作OBJ/bphshの非公開バイナリ等を無断公開・外部アップロードしない。
- 原作衝突・経路・HP/Scoreの不明は**SOURCE_AUTHORITY_HOLD**。正しいと証明できないとき、推測を事実として記述しない。

## 4. 実証済みの本物の成果、試験スコープ、CI証拠

**大前提: 以下のB番号のPASSは各CIの正確なコードSHA・実試合の局所スコープだけ。古いrunのPASSを最新runのPASSと取り違えない。**

| 工程 | 実証されたこと | GitHub evidence |
|---|---|---|
| B281 / B123 | 真CDP KeyW・原作KCCで高所から着地/下段・坂/右上段の一部を物理走行。B281は7区間、16.3881m、tick243の実接地 | B406完全正本の実SHA・CI参照 |
| B315/B316/B322/B324/B326 | 元原作高所・初着地・正Z坂・元右上段床に対する**連続した実人間Rapier KCC**と複数の別PaintSurfaceへの本物の射撃・元ownerGrid変化 | B409以降の同一Chromeセッション独立審査 |
| B405 | 最初の真の**1本の180秒SOURCE試合**、人間本物の9shots/92 ownerGrid cells、CPU11773セル、108 source shot requests、7CPU、実TIME_UP tick11855。敵HP実命中は0 | [#41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883), artifact13215309208 |
| B406 | 同一B405試合のRAW 7時点から人間→敵CPU最近距離116.991～119.324mを**SHA-pinned独立計算**。4v4敵HP接触がないことを限定分析 | [#41604651650](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41604651650), artifact13216270763 |
| B407/B408 | 真の180秒試合で人間の残り時刻に応じた入力/射撃、原作active ownerGridに対する**現在のカメラ**での再照準。後続B409/B410から同じ原本関数を再利用 | 実スクリプト scripts/t21-b407-native-human-wave.mjs / t21-b408-native-original-active-aim.mjs、後続B412原本 |
| B409 | 本当の高所→初着地→原作正Z坂→元右上段の**1つの同一SOURCE 180秒試合**。3面別原作人間塗装、CPU7、TIME_UP tick11860 | [#41613268934](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41613268934), artifact13220217862 |
| B410 | その同一180秒ルートを**4つ目の原作右上段PaintSurfaceへ人間本物の追加射撃**、120/60/30秒の実CDP/WASDと7CPU・TIME_UPまで結合。原作4面着弾独立PASS、人間82発/1132 cells、CPU12809 cells、TIME_UP11858 | [#41626195290](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41626195290), artifact13227760449 |
| B411 | 本物の練習A1 CLEAR後も180秒SOURCE試合が継続する間、巨大CLEAR・練習カード・早すぎる再戦操作を隠し、元の小さなSOURCE HUD表示へ。**真TIME_UP後**のみ再戦を復帰。原作4面/CPU7/実射撃/180秒も同run PASS | [#41630809201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41630809201), artifact13229516996、SHA bee39cd1310c77a18d081b3e4cd5af4ceba920c8 |
| **B412最新真正PASS** | 同一SOURCE180秒＋人間4面塗装＋後半操作＋B411 UIに、本物Shift→Squid→OWN＋SWIM_GROUND→実KeyS帰路→Human復帰を組込。イカのnative9移動区間合計**5.204981m**、OWN泳ぎ実3区間、元右上段床支持。人間85発/1025 changed cells、CPU147 shot requests/11846 changed cells、真TIME_UP tick11856 | **[#41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)**, artifact **13233112543**、コードSHA **7d31501c702b725dda730047cc47db379523a400** |

注意：B412は**元のOWN塗装で実際に泳いだ**ことを示すが、120秒時点に狙った特定のセルを確実に踏んだことまで証明していない。CPUの「source shot requests」は実弾着弾/塗装変化/敵HP命中と別。B412の85発は180秒間ずっと人間が手で操作し続けたことの証明ではなく、指定時刻の本物のCDP実入力があるという意味。

## 5. 重要な失敗履歴と真正原因（隠さない・遡及PASSしない）

### F4の原作地形/中央接続はHOLD
- 元中央アンダーパスへ自然Recastの正Z・負Zの残距離が約31.716m／31.786m、対岸0/12。元右上段フラット床とガラス下段床の輪郭間の距離27.742890m・高低差4.5mはその2つのフラット面の幾何学であり、他の元SOURCE面の可能性まで排除するものではない。
- B238～B241の隔離31-solidによる原作FloorLine00三角面研究では細い入口幅**0.311135m**、CPU安全直径**0.60m**、人間実KCC直径**0.64m**。一時的に原作のFace上で物理接触できても元のcollision-intentとCPU安全動線は未認証。radius0で見かけ上つながるだけのRecastは不採用。
- B369/B370の同一時刻KCC/中心レイの欠落記録では正負とも3 native tickで真のsource same-frame collisionが未認証。原作バージョン/モデルIDの一致（Vss_Temple01はLeanny SceneInfo照合済み）とFloorLine00のbphsh正式衝突フラグの実証は別。**権威がなければ同じ狭い地形の数cm再診断に戻らない**。
- B283の原作床端余裕最小0.470656mで安全基準0.60m sampled/0.65m endpointを満たさない候補を不採用。足元/胴体KCC安全契約を丸めて緑にしない。

### B405/B406反省
- 別試合の人間座標とCPU座標を比較したB404の97.553mと、B405同一試合B406の116.991～119.324mを混同しない。B181の32mは光学候補ゲート上限であり武器の本物の射程すべての立証ではない。
- 同一実180秒TIME_UPが成功しても元敵との自然遭遇/撃破や180秒間人間が常時操作したことを主張しない。必要なのはゲームとして意味ある連続操作と、本当に接敵可能な元の原作経路。

### B410初回／2回目のHOLD→3回目のTRUE PASS
- [#41615367024](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41615367024) は元Rapier rampの真crest≥0.90を通過した証拠が短いサンプリングで欠落、B322独立HOLD。真CDP KeyWの小さなパルスでcrestの本当の支持を保存した。
- [#41624270929](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41624270929) は上段後半のshotとTIME_UPは成立したが**初着地原作床に人間が当てた3面目以外の元PaintSurfaceの照準**ができずB315独立HOLD。B337の既存の原作active nearby ownerGridを**read-only**で有効化して現在のsource照準へ解決。
- 最終[#41626195290](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41626195290)で厳格な原作4面＋180秒PASS。古い失敗SHAを後からPASSに塗り替えない。

### B411～B412のUX／イカ泳ぎ
- B409/B410実スクリーンショットではA1練習CLEAR後の大きい通知/再戦ボタンが**まだPLAYINGの実試合の3D照準**を遮っていた。B411は研究opt-inで本物のA1 CLEAR＋本物のPLAYINGの時だけUIを小型化し、真TIME_UP後に再戦復帰。元のゲームスコアやCPU権威を変えていない。
- B412初回[#41635951998](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41635951998)はOWNイカ前進後、元の場所へKeySで戻る際の原作物理/モード確認HOLD。長い帰路キー入力と慣性が問題となり、FAIL直前の本物の座標/元floor/ink/modeのRAWが不足。変更後は短い実KeyS入力と各レグの**失敗時にも残る途中JSON**。修正版[#41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)で真の元位置付近へのHUMAN復帰含めPASS。
- 原作OWN泳ぎで移動したことと、特定の事前塗装セルへ狙い通り誘導したことは違う。不要な「目標セル到達」認証を上乗せしない。

### **現在のB413の最新試験・最大重要事項**
- 初回コード **bed6ec5da1c72c65f4315639a909411371a7bbbb** の [Actions #41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) は真正FAIL、artifact **13234999159**。B322原作坂→上段PASS、B411の90秒表示PASS、120秒の人間真射撃8発/元右上段94 changed cellsが確認されたが、90秒の追加射撃に**原作右上段実着弾の証拠がなく** B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_TRUE_ORIGINAL_UPPER_PROJECTILE_IMPACT_BEFORE_SQUID。
- 原因候補：120秒に成功した古いCDPマウスx/yを90秒時点で使い回したため、実カメラ方向と原作targetが変化している可能性。ただし旧runではB413の個々のcamera/impact/inkの途中JSONが不足していたため**原因の完全確定不可**。
- **修正済みゲームコードSHA 7fb9740ad50ebfc06fd139bac3a1146f1db2ce11**：B413各射撃ごとに既存B408の本物の原作ownerGridと現在の実カメラから新照準→本物CDP mouseMoved→native yaw/pitch一致検証→元SOURCE弾の着弾観測。各実fire phaseのSOURCE aim・実カメラ・shots・tank・impact/footを逐次JSON保存。原作25/17/26/0、実足元、CPU7、OWN回復・正式得点0の厳格ゲートは緩めない。
- **修正版 [Actions #41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309)**：この文書作成途中の確認では exact SHA 7fb9740ad50ebfc06fd139bac3a1146f1db2ce11、Node unit/型ビルド/事前preflight SUCCESS、真正180秒PlayCanvas/Rapier Chromeは**in_progress**。必ずその後のGitHub real-time completion・job logs・artifactを確認し、同SHAの厳格なB315/B322/B409/B410/B411/B412/B413独立監査を照合。FAILならRAWのどの条件が不成立かを調べ、偽PASS・閾値緩和をせず原作忠実な実装だけを修正。
- 既存スクリプト：scripts/t21-b413-native-source-fire-refill-reshoot.mjs、専用.test.mjs、scripts/t21-b413-independent-ink-economy-review.mjs、元統合scripts/t21-w10b139-original-native-descent-rally.mjs、.github/workflows/t21-b409-one-real-route-full-180s.yml。B413の研究フラグT21_B413_REAL_SOURCE_INK_LOOP=1はB412/B411/B410連動でのみ有効化。新しく別の丸ごとランナーを作り直さない。

## 6. プロジェクト全体の反省と不可逆の運用改善

1. **コード実装だけ、ドキュメントだけ、計画だけで終わらない。** 既存コード・証拠を引き継ぎ、意味のある1ゲーム機能を実装→Node unit/型ビルド→本当のChrome/Rapier/CDP→原本JSON/PNG独立審査→研究GitHub保存まで可能な範囲で実作業。ユーザーの「次へ」に毎回計画だけで返さない。
2. **工程をB番号の微小QAへ細分化しない。** 本物の「移動・塗装・インク回復・敵との自然交戦・試合/再戦」の体験が前進したかを優先。失敗箇所が示された時だけ必要な局所診断を追加し、同じ課題にユニットテストやworkflowを増殖させない。
3. **効率化するが忠実度は妥協しない。** Work勝手に使用しない、Chat＋GitHub、短いunitと既存の1回のChrome統合を再利用、古いSHAの本物artifactとJSONを可能な限り再審査、CIの重複起動を避ける。ユーザーにZIP、スクリーンショット、ローカルPowerShellを毎回求めない。
4. **ログと本物の証拠を優先し、不確実性を表示。** GitHub Actionsのqueued/in_progress、unitPASS、source read-onlyPASS、実Chrome physicalPASS、正式4v4認証、本番承認は別々。原作ownerGrid cells≠公式Scoreable。CPU shot request≠実impact≠HP。複数セッションを同一180秒の証拠として合算しない。
5. **バグ修正は根本原因に向かう。** カメラ・world座標・方向を計測し直す。古いCDP x/yや単なる方角Wの盲目的再使用、CDP keyの名目保持tickとnative適用tickの混同、KeyS後の物理慣性無視、実原作足元のサンプリング不足に注意。元のRapier/Input/Inkに沿って直す。
6. **失敗のRAWを必ず残す。** 成功時にしかJSONを書く設計は問題。原作solid/gap、プレイヤー形態・位置、OWNER関係/InkRelation/回復状態・インク残量、actual tick・shot・last impact、pointer lock、CPU7を途中で保存し、失敗理由と修正箇所の関係を検証する。証拠のない「可能性」を事実にしない。
7. **本当に操作しやすいUI/ARTを無視しない。** B411のように実180秒の操作を妨害する練習通知を抑える。だがSOURCE未認証を正式な勝敗/演出で隠さず、スプラトゥーン本来のビジュアル/ゲーム性の品質審査を後回しにして「完成」と言わない。
8. **凍結のF4だけに時間を食われない。** FloorLine00の元ゲームbphshフラグ等の原作衝突権威がないならHOLDを正直に維持して別のF3/F5を開発。CPUへの自然交戦が成立する実幾何学と同時フレームの敵位置がないのに架空の「戦闘PASS」を作らない。
9. **承認の境界。** 研究branch内の通常の開発は継続。main・正式QA・T20・Draft PR#5・Pages・公開・無断原作資料アップロード・Workは勝手に触らない。新しいチャットでは承認済みでない方針を勝手に「変更済み」にしない。
10. **報告は必要十分に。** 実験の状態（限定PASS/HOLD/未実施）、実際のユーザーが遊べるようになった点、比較する原本証拠、最新SHA・リンクと保護対象・本当に次に必要な工程だけを整理。毎回同じ前提や長い状況説明を繰り返してユーザーの時間を奪わない。

## 7. 新チャットが直ちに行う作業（計画だけでは終わらない）

**最優先A：B413の結果確認・実装完成**
1. root START_HERE.mdを読む。本書・固定憲章・B406 COMPLETE・QA/T20凍結を先に読む。研究branch/main/正式QA/Draft PR#5の実SHAを取得。
2. 最新 [B413実Chromium再試験 #41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) のstatus/conclusion/steps、artifact id、job logsを最新取得する。
3. **B413全PASSなら** 90秒の実CDP主射撃と原作impact/ink低下→イカ＋OWN＋SQUID_OWN回復の実増加→元右上段の本物のヒト再射撃とインク再消費→60/30秒の実射撃→元TIME_UP/再戦UIと同SHA独立B412/B413もPASS、という実数字を元RAWで突合。正確な限定成功を正本に追記し、元本を保持。成功済みの同一実験を漫然と反復せず、次の本物のF3ゲーム改善へ。
4. **FAILなら** 精密なphase別RAWを取得して原因分類（現source active cell無し／現在カメラ角・CDP不一致／本物の弾の元PaintSurfaceへの未着弾／InkのLOCKEDとnatural refill干渉／元の7CPU/rapier支持／B412の元位置復帰／native tick window・異なるブランチの静的監査fixture）。**原作元のSourceやゲートを緩めずに**直す。可能な限り同じ元Chrome workflowを研究branchで1回だけリトライし、生証拠と正本に追記。前回B413初回失敗は履歴から消さない。
5. もし安全な直し方がSRC権威不足などで確定不能なら**B413だけHOLD**と記載し、F3のより確実な意味のある遊べる機能に研究を移す。

**次点B：本物の対CPU自然交戦・HP/撃破/復活**
- 本物の原作元床と元Actor/CPU配置で自然に同時刻接近するフレームが得られた場合に限る。元SOURCE物理Ray・元ProjectileSystemの着弾、CPU health decrease→0→splat→150 native tickで復帰の因果とsame actorを証明。自然距離がまだ約117mなど射線/道が欠けるなら誠実にHOLDし、HP数値をデバッグで直接削らない。中核ゲーム戦闘の未達を忘れない。

**次点C：F4の原作衝突権威とナワバリ完成**
- Ver.7.2.0元Stage Faceだけでなくbphsh等の衝突/material flags、元原作SOURCEから合法なNavMeshとCPUサイズ・両陣営の連続経路を証明する。Scoreable0を許可なく増やさない。根拠がなければ該当F4/HOLD。元データ無断配布禁止。

**F5と品質**
- 本物のプレイヤーの視界・カメラ・HUD・自陣/敵/塗装の視認性、ART・音・FPS・UI/再戦をより魅力的に、見た目だけでなく実試合で評価。暫定SOURCE体験と正式試合を画面でも区別。

## 8. 次チャットへの最短指示（本書URL付き）

「Browser Ink TPSをGitHubの最新正本から完全に引き継ぎ、開発を再開してください。研究branch research/t21-b406-single-session-real-enemy-range-audit-20261103 の root START_HERE.md と、本書、B406完全統合正本、永続DECISIONS、F1〜F5、T19C/T20凍結・安全条件を必ず継承。B412の真正SOURCE同一180秒＋原作4面実塗装・OWNイカ泳ぎPASSを確実に維持。B413修正版のGitHub Actions #41647713309 を最初に正確に検証し、PASSなら次の本当に遊べるF3ゲーム機能へ、FAILならRAWを分析して原作ゲートを緩めず修正・CI・GitHub保存を進めてください。main・正式QA・Draft PR#5・Pagesを変更せず、Work事前承認、Chat＋GitHub、ユーザー操作最小、計画だけで終わらず可能な限り実作業をしてください。」

**固定入口URL**： https://github.com/ryomashibaba/browser-ink-tps/blob/research/t21-b406-single-session-real-enemy-range-audit-20261103/START_HERE.md

**この引き継ぎ文書自体も研究branchの文書コミットとして保存され、最新HEADが変わるため、次チャットではHEADを新しく取得すること。**

## 2026-11-04 研究継続：B413真正PASS / F5・B414とB415の最新境界

- **真正確定済み**：B413 [Actions #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100) SHA `53839205a451192b125ca50f8693d157af8d9bf2`、B413+F5既存HUD回帰 [#41654818533](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41654818533) SHA `18cd7f296d97bec9ffab266ae2ab057f6ef7e67e` が真正同一180秒SOURCE・B413までの独立監査 SUCCESS。元原作25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸自然経路0/12、正式4v4/得点/勝敗/敵HP/ART/productionはHOLD。
- **研究F3・B415**：「実射撃消費→OWN SQUID補給→人間再射撃」の順をそのまま本物のプレイヤー向け小型HUDで案内する読取り専用プレイ課題 `src/app/B415LiveInkLoop.ts` が研究branchに追加された。別チャット並行開発との重複・変更上書きを避ける。B415の真正Chrome run [#41721070651](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721070651) は本記録時点でqueued。Unit/Source候補≠現実のプレイヤー達成PASS。
- **研究F5・B414**：本物のPlayerResourcesインクHUD表示をさらに読みやすくし、旧「HUMAN · HUMAN」表示を `FULL` / `HUMAN RECOVERY` / `RECOVERY LOCKED` / `OWN INK · REFILLING` に明確化。既存B413の1本の実Chrome試合から、実射撃前後・OWNイカ中・人間復帰・再射撃・TIME_UPのDOMインク残量/バー幅/native tick/モードを **読み取り専用**収集し、新 `scripts/t21-b414-native-ink-hud-audit.mjs` でB413本体判定と独立に検証。B415のプレイ案内機能を消さない。
- **最新B414コードSHA** `abac9422fa7f6772f286b0fafbea8d6f35353e32`、[GitHub Actions #41721892162](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721892162) は記録時点 **queued・結果未確定**。監査の独立JavaScriptユニット実行では正常系2ケース/偽データ拒否8条件PASS。ただし真正Chrome・同SHA独立HUD監査はまだPASS未確認。旧B413真正PASSへ遡及的な変更なし。
- **衝突回避・安全**：main/正式QA/T19C/T20/Draft PR#5/Pagesを無断変更しない。原作HP/資源/Actor/時計/地形/塗装を書き換えず、ユーザーPC操作不要、Work事前承認制。次回は新SHAの最新Actions最終result・artifactを最初に照合。B414真正FAILならphase別DOM native RAWを解析し、ゲーム判定を緩めずに修正。二重実装やCI乱発を避ける。


## 2026-11-04 B416 実Chromium失敗の真正再調査・継続

- **旧B413 SOURCE限定PASSは変更なし**：[run #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100)、[既存B414簡易HUD導入run #41654818533](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41654818533) だけがその各SHAで真正180秒・独立B409–B413 SUCCESS。元の25/17/26/0・自然対岸0/12、敵HP/正式4v4/得点・勝敗/ART/productionはHOLD。
- **重要な失敗・取り消し禁止**：B415過渡run [#41721029557](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721029557) は真正B413実Shot/OWN回復/再Shotが成立した後でも、HUDの実B415ステージが `REFILL` のままでFAIL。新B414 run [#41721892162](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721892162) ではB412真正ヒト復帰の元上段位置差が1.14mになり、確定限界0.95mを超えたためFAIL。中間実足は元位置から0.78m以内に達しており、追加のKeySで行き過ぎ。別 run [#41721070651](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721070651) は原作着弾native tickと旧先取りsnapshotの読み取り順序差によりFAIL。いずれも真正SUCCESSへ書き換えない。
- **外部との並行変更を尊重**：研究SHA `49f9cdda3ac8d76eefcc17028030fdc831532d2e` はB412の本物のKeyS復帰中止位置を0.85mに改善（最終認証0.95m保持）し、B413の読取り専用の接触ledger先読みによる時刻整合を修正。こちらで重複上書きしない。[run #41724562943](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41724562943) の真正検証対象。
- **今回B416新実装**：SHA `20ebfaddbd90fd65cbefaf5b0a02d195b53efcd8`。B415 read-onlyプレイ目標の状態遷移を遅いWebGL DOM描画から離し、既存真正SOURCE固定tick `b25Run.observe` と同じ60Hzで更新。元B414の実 `PlayerResources` インク数字・回復・バー・B415ラベルはゲーム書き込み無しの軽量毎render表示に変更。実Shot/OWN/refill/reshotを画面から個別観測する既存B414独立監査はそのまま厳格に維持。B412/B413は既存SHA49f9修正を維持。
- **新SHA真正試験**：[Actions #41725404578](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41725404578) は本記録時点queued（未PASS）。従ってB414/B415は**正式SOURCE限定PASS未認証・ART HOLD**。次回はこの実際の最終結果（同SHA／ログ／RAW artifact）を確認し、F3達成判定の偽装や受理条件緩和は不可。
