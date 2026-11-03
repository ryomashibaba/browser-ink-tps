# Browser Ink TPS — B412真正PASS → B413実インク経済統合 (2026-11-03)

## 固定方針

Repository ryomashibaba/browser-ink-tps、研究 branch research/t21-b406-single-session-real-enemy-range-audit-20261103。root START_HERE.md、B406完全統合正本、DECISIONS_JA、FAST_TRACK_EXECUTION_JA、T21_FAST_TRACK_ROADMAP (F1–F5)、CURRENT_CANONICALを守る。Chat + GitHub中心、Work事前許可、PC操作不要。

## 既存の真正成功を再利用

[B412真正Chrome #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)、本物のコードSHA 7d31501c702b725dda730047cc47db379523a400、元artifact 13233112543、全CI/独立監査SUCCESS。本物の同一SOURCE 180秒ゲームで高所→初着地→坂→右上段Rapier KCC、原作4 PaintSurfacesに人間実塗装、7CPU、120/60/30秒の人間実射撃。ShiftでSQUID→OWN原作InkRelation＋SWIM_GROUND実3レグ、計5.204981m原作Rapier連続歩行／泳ぎ、KeyS物理復帰とHUMAN再変身。真正TIME_UP tick11856、人間85 shots／1025 source-changed cells、CPU147 shot requests／11846 changed cells。B411の大きな練習CLEARを試合中隠しTIME_UP後に再戦戻す機能も同runでPASS。B405〜B412の成果を不必要に再試験しない。

## 新B413ゲーム機能

- まとまったF3体験：「実射撃→実インク消費→元のOWN塗装でSQUIDとして回復→HUMANに戻り実再射撃」。現行の一つの真正B412試合と既存の本物PlayerResources・PlayerController・B408照準を再利用する。新物理・インク生成処理は作らない。
- 研究フラグ T21_B413_REAL_SOURCE_INK_LOOP=1 は既存B412/B411/B410と同時指定のみ。残り90秒の前半で真のCDPマウスを保持し少なくとも5発の実SHOT・4以上のnativeインク消費・元右上段SOURCE PaintSurface impactを記録。その後、既存B412 Shift＋W/Sの本物PlayerResources状態をread-only時系列観測し、連続するOWNインクのSQUID_OWNモードでタンクが実増加したことを証明する。元の原作床へヒト形態で復帰し、もう一度本物のCDP射撃・インク消費・原作着弾を確認する。
- 残り60/30秒のB410射撃、元のB315/B316/B322/B324/B326/B409/B410/B411/B412同一run監査、TRUE TIME_UPをすべて維持した場合に限りB413真正限定PASS。新しい独立監査は同native tick・PlayerResources実残量・CPU7体・source25/17/26/0・実ownerGrid、scoreable0・winnerNONEを確認。単体テストやビルド成功だけで真正PASSとはしない。
- 実装変更は同研究ブランチのB413 native実行＋独立監査＋unit、既存B409→B412 Chrome統合workflowへの追加のみ。B413の最終結果は新SHAのActionsを必ず取得するまで **HOLD**。失敗時は実SHOT/ink/OWN状態/足元原作solid/PointerLock等で分析し、fakeなインク残量や原作当たり判定緩和は禁止。

## 永続HOLD

Splatoon 3 v7.2.0マテガイ放水路通常ナワバリ。25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable、対岸Recast自然経路0/12、activationReady=false。人間からCPUへの本物のHP命中・撃破・150tick復活、正式得点・勝敗、正式4v4、元7.2.0 FloorLine00衝突権威、ART、本番公開はHOLD。main/T20/正式QA/Draft PR#5/Pages不変更。Work事前承認。