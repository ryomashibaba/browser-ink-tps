# T21 SOURCE実塗装セル対比のプレイ表示（F3継続）

実体：`src/app/B417SourcePaintedCellView.ts` / 既存F3の左上コンパクトHUD（B411/B414/B415の下）。

原作から既に取得されているB401 `17 PaintSurfaces` の実ownerGrid集計のみを用い、A・Bの**実Painted Cell数**を可視化する。棒グラフは **A+Bの既塗装セル内だけでの比率**を示し、ステージ総面積の公式占有率ではない。ラベルに `UNSCORED` と明示し、Scoreable0のまま、Winner NONE・正式4v4 HOLD。過去のHUDに表示していた数値を再利用し、原作幾何/CPU/HP/移動/武器/インクへの書き込みなし。

安全条件：原作25/17/26/0、B401のLIVEで17独立GRID・active cell総数とA/B/neutral一致、sampleNativeTickの現在時刻との整合、データ/単位/scoreable/winnerの真正フラグを満たす時だけ描画。それ以外は非表示。更新は既存のB401ネイティブ実GRID集計を **read-onlyで参照するだけ**（グリッドを毎フレーム再走査しない）。TIME_UPとHOLDでは非表示。元F3通常ゲーム/正式T20/QA/Mainは無変更。

合格は既存の同一180秒Chromiumにおける実HUDの視認、A/B数字と真B401グリッド、play vs TIME_UPを別々に確認した場合のみ。静的Vitestとビルドだけでは真正ブラウザ表示を認証しない。

**この工程はF3で自然な敵撃破が成立したことの代用ではない。** 敵B1～B4が別岸に分離し、元の±Zルートは0/12未接続。敵への無根拠なHP操作/ワープ/公式得点作成は禁止。F3の本命は自然なCPUとの本当の射撃→HP減少→撃破→150tick復活の一体化。
