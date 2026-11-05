# B462：実SOURCE下段のHumanが停滞A1へ本物のKCCで接近

基準2026-11-05。F1〜F5 / Fast Track固定、B193原本A1協力・B203本物180s。

[前HEAD真正Run #41959438127](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41959438127) FAILURE／[原本Artifact #13384029779](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41959438127/artifacts/13384029779)。B322/B324/B326正規坂と上段のKCCはPASSしたが、B162協力は本物のA1射撃0・A1タグ着弾0・CLEAR未到達。下段でHuman body `[.6199,3.8950,48.5818]`、実A1足 `[2.8485,3.2362,51.0511]`、平面3.326m。A1はtick1325以降同一位置。これに対し、[旧実成功Run #41951999679](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41951999679) は下段で実A1まで約2.093mへ近づき、原本A1射撃6・実着弾5・追加source変更156セル、真の協力CLEAR。

今回の修正：本物のCDPで原本下段へ到達後、A1ゼロ射撃かつ3〜8mの場合のみ、既存の厳格B328（実KCC、人間に限る・元Lower floor solid、17原本塗面・実Yaw・Actor移動0）でW/A/S/D短パルスを最大8回。実物理で人間がA1に近づく。各区間本物のnative tick、原本足支持、距離減少を独立B328で判定し、ソース離脱なら即中止。近づけた場合のみ最大90実tick追加観測してA1実弾/着弾を検証。AIゴール/座標を作り直したりA1をワープさせたりせず、未成立なら未成立のまま。B312原本Paint + B316/B322実坂、B409/B430 180秒、元の厳格A1 CLEARは保持。

追加のRAW座標回帰テストは既存B328 Nodeテストへ追加。既存B413真正Chromium長時間CIをそのまま使う。原本25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable・敵陣0/12・winner NONEを保護。main、T19C/T20、正式QA、Draft PR#5、Pages/ART/本番、Work/Computer Use事前承認、追加API課金なし。
