# T21 B412 — 原作SOURCE塗装への本物のイカ潜伏・泳ぎ・ヒト復帰を同じ180秒試合で統合

2026-11-03。F3のゲーム性・継続プレイを優先する新しい真正Chromium機能群。**実装済み=成功ではない**。原作の物理/キャラ/当たり判定・インク機構を使う。既存の凍結F1〜F5を変更しない。

## 真正PASSの継承 (B411)
[Actions #41630809201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41630809201)、code SHA `bee39cd1310c77a18d081b3e4cd5af4ceba920c8`、原本artifact `13229516996` は**全ジョブSUCCESS**。元原作25 Rapier/17 PaintSurfaces/26 NavLinks/0 Scoreableのまま、真の高所→着地→坂道→右上段KCC、原作4面への人間CDP実射撃・塗装、7CPU、180秒TIME_UP tick11855。HUMAN実射撃84発、原作塗装1130セル、CPU実SOURCE塗装12258セル/実射撃要求145。残り120/60/30秒の右上段実入力24発/追加197セル、native KCC移動距離合計8.740654452743925m。試合中は練習CLEARオーバーレイと再戦を隠し、実TIME_UP後再戦ボタンを復帰するB411 F5 UIも真正PASS。原作CPUに対する実HP命中/撃破は0、自然対岸経路0/12、正式4v4/HOLD。

## B412で実装する遊べる機能
- 既存B410の残り120秒の**本物の原作右上段へ着弾した**source cell world座標を再利用。仮の塗装セルや架空の床は絶対に作らない。
- 残り90秒で、既存B411とB410に続けて**本物のCDP ShiftLeftを保持**し、ヒト→イカ状態の native `PlayerController` /Rapier BALLと実InkRelationを観測。再照準/ワープ/位置代入/QA軸は使用しない。
- 実KeyWを最大10回・各8native tick相当の短い本物のキー入力で、先ほど塗った原作右上段のownerGridに向かう。各native記録で原作右上段solid、Rapier足元ギャップ≤0.4m、CPU7体、Shot数不増加、イカ状態と真の移動距離を保存する。少なくとも1回は**ownerGrid OWNで native locomotion `SWIM_GROUND`**が真に観測されなければB412はHOLD。
- その後Shift+実KeySで同じ原作床の元位置の近傍まで**物理的に引き返し**、Shiftを離してHUMANへ復帰。原作位置の代入は禁止。復帰した同じ実試合で残り60/30秒の実射撃と最後の180秒TIME_UP、真正B409+B410+B411独立監査をもう一度満たす。
- 100%原作SOURCE-only。新しい衝突/立体経路/Scoreable/HP/Projectile/CPU位置/Clockは追加・変更しない。イカで射撃しないという既存仕様を実Shotカウンターが増えないことで観測する。

受け入れは同じSHAの**Node/型ビルド＋1回の真正Chromium180秒＋B315/B316/B322/B324/B326/B409/B410/B411/B412の独立RAW JSON/PNG監査**。失敗したら実ブラウザログにある移動方向/原作足元/inkRelation/locomotionの状態で改善する。勝手にOWNに変えたりSWIMに偽装して緑にしない。

## 保護
ゲームの目的はSplatoon 3 v7.2.0マテガイ放水路通常ナワバリ。原作25/17/26/0、natural cross-bank0/12、activationReady=false、原作FloorLine00 source collision authority未証明。正式4v4、原作得点/勝敗、ART、productionはHOLD。main・正式QA・T20・PR#5・Pages書換/マージ/公開禁止。Work事前許可。ユーザーのローカル操作不要。
