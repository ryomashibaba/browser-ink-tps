# T21 F2＋F3 統合研究 — 原作物理KCC＋実CPU HP撃破・復活の回帰 (2026-11-03)

## 統合理由と固定入口
- QA正本 `dev/t21-f4e103w-qa-infra` HEAD `8c104658a1842218bdfeff07792b3ab35576a0c4` を共通祖先とするF2/F3の隔離統合。main、QA正本、Draft PR #5、Pages、T20、ユーザーPCには変更なし。
- F2実物理PASS: [研究 #41588119357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41588119357)・研究HEAD `02dfc68dec4c8ace70e7786b64fe7048dd789df4`。本物のCDP短KeyW 4ステップで原作正Z下段着地→ランプ、元原作足元supported＋paint面、真の水平移動約1.562m、三つの独立原作塗装面、偽床・Actor移動0。F2変更は原作4頂点内点のカメラ**実入力ガイド**とそのテストだけ。ゲーム内物理そのものは変更していない。
- F3ソース回帰PASS: [研究 #41594101783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594101783)・研究HEAD `ba6a001684aa3d98fcf359f68a54199745a363fe`。Vitest 50/50、全体TypeScriptチェック成功。F3 SOURCEのCPU真正HP0処理に限り同tick `splatBot`、実生命状態とB367読み取り専用HUDの同tick撃破、元の150tick復活、7CPU真の再合流カウント。これは*ソースロジック単体テスト*であり、実際に敵を倒した真正Chromium証拠ではない。
- B337は最新の原作実人間照準／射撃／ownerGrid実測が未確定のため**本統合には含めない**。別ブランチのB337を「局所人間成功」として暗黙に移植・認証しない。

## この統合で実際に変更する範囲
1. F3ブランチから出発するためHP、F3CPU生命状態、B367の改修は既存の隔離ソースそのまま。
2. F2ブランチから原作4頂点内点方向へ実KeyW4tickの `scripts/t21-w10b139-original-native-descent-rally.mjs` と、古いコーナー候補に戻らない `scripts/t21-b316-native-human-ramp-walk.test.mjs` をそのまま移植。
3. 研究CI **1本だけ**でF3の50回帰、F2の既存Node回帰、アプリの厳密TS build、1人＋7CPU原作SOURCE真正180秒セッションを同じビルドから検査。独立B315と、実原作支持ランプ面・非架空人間・原作再合流／移動0を要求する厳格B316プローブ。誤検知のGREENを防ぐ。
4. B337の最新CI結果は後で別途照合。B337実真正SHOT＋original ownerGrid changed-cell＋独立監査に成功しない限り、統合には含めない。
5. 本研究CIの合格は、F2原作移動とF3戦闘**ソースロジックの共存**を確かめるだけ。1試合内の真正敵CPU HP減少→撃破→150tick復活は別途証拠が必要。

## 維持する絶対境界
原作25 Rapier solids、17 PaintSurfaces、26 source NavLinks、Scoreable 0、自然敵陣0/12、actorテレポート0、公式Winner NONE、F4未接続アンダーパスHOLD、原作戦闘忠実度HOLD、公式Turf/4v4/ART/production HOLD。正式QAブランチへは未昇格、原作SOURCE未証明経路/床/HP/得点を補わない。
