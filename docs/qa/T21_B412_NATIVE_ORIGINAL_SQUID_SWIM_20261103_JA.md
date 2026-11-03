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

## B412初回真正Chromeの失敗と修正（2026-11-03）

- 実コード `d264c16fba9d34608c92b46366073bae7429288d` の [Actions #41635951998](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41635951998) は **FAIL**。事前Node・型/ビルドはPASS、原作B322上段到達とB411試合HUDの初期/90秒表示は実ログで確認。残り120秒のB410実射撃は9発・原作右上段への実変更92セル、7CPU継続。失敗は**90秒イカ帰路KeyS**の原作Rapier/入力チェックで `B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_REAL_SQUID_KCC_SOURCE_AND_NO_FIRE_RETURN_TO_ACTUAL_UPPER_BODY`。原本artifact `13230988016`。前進後に帰路へ進むまでのコード上のOWN・SWIM要求は通過したが、**B412全体のイカ泳ぎ成功、ヒト復帰や180秒TIME_UPは認証されない**。
- 原本ではB412が戻りで失敗する前に、別のB412部分JSONを保存する仕組みがなかった。どの native original foot/gap、Squid/Human、InkRelation、CPU状態、実Shot数が原因か未確定。「原作床を離れた」と決めつけない。
- 次の試験では各実CDP shift/key/原作足/インクの状態を **同一ワールドで逐次JSON保存**し、HOLDでも原因がartifactに残るよう変更。帰路は最初の8native tick要求より**短い3native tickの実KeyS**で元位置に接近し、安全支持・モード・インク判定は一切緩めない。独立監査はこの**実際の短い入力tick数のみ**を認め、原作上段solid、実KCC長、OWN泳ぎ、Shot非増加、CPU7体、帰還HUMAN、真TIME_UPを依然必須にする。
- 研究ブランチ限定。F1〜F5不変、25/17/26/0、0/12、正式4v4/HP/ART/productionはHOLD。B411真正PASSは独立に維持。
