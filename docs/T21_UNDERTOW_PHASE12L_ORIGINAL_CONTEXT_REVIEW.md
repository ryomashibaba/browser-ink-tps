# T21 Phase12L — 原本柱周辺の立体的下部外装と文脈表示（review only）

基点: `e4e9737db52c14a7b7e527de7d20d6eaf8e85249` (Phase12K)。CI #1409 全ジョブ SUCCESS を確認したうえで、Phase12Lを実施。PR #5 は Draft/open/unmerged、T20 production `inkworks-junction`、T21 `activationReady=false`、Visual Freeze 未承認を固定。

## 元OBJに厳密に存在する4部品

- 元データ: KiTrix `Vss_Temple01.obj`、43,263,289 bytes、SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`、active original faces 70,396。
- Phase12Jの独立 gate (124通常+旧18=142 source mesh、凍結42点XZ、完全mirror、OBJ vertex ID)で source-only candidate と認められた44個から、新たに`PillarObject01` 4個、2 mirror pairsを選定。
- 原本 Face min `#42926/#43624` と `#43102/#43448`。各22 source faces、各26.61583245858 m² 3D triangle surface。原本Yは22.7〜25.1m。
- 合計4完全original connected components / 88三角形。元Face ID、元OBJ vertex IDs、元Float64 XYZは一切加工せず圧縮バイナリ `<IIII9d>` に保持。
- 展開前のバイト列7,744 bytes SHA256: `b1bf7357331125993a0f52c644d8da0dd99633b6aec335bf0452391ac35db817`。
- この追加により source-only optional は Phase12C 8 + Phase12D 4 + Phase12I 6 + Phase12K 4 + Phase12L 4 = **26**。通常表示原本は引き続き **124**、プレイ可能な床の追加 **0**。
- Phase12Jの残り36個は保留。そのうち `Pillar00` 4個（#16018/#16128/#19888/#19998）は候補として確認したが、上下0.5mの薄い部品なので視認性と構造との関係を優先して今回は追加しない。

## 見せ方と安全ゲート

- `?stageReview=undertow&reviewRenderer=webgl2&reviewPillarContext=OBJECT`: original PillarObject01 4個のみ表示（ターコイズ）。
- `?stageReview=undertow&reviewRenderer=webgl2&reviewPillarContext=CONTEXT`: Phase12I 6 + Phase12K 4 + Phase12L 4 = 14 original source-only components を同時表示。見た目の相対配置を見るための証拠表示のみ。
- どちらのモードも専用ボタンから切替可能。初期OFF、通常五方向カメラと原本124の標準表示に変更なし。
- 別ルート/原本三角形のみ。壁の延長、連結補間、歩行可能な床、屋根、閉じた柱、衝突、塗り、スコア、CPU、navigation、Spawnや一般公開への昇格はすべて **非承認**。
- CIのPhase12L独立テスト: 元Phase12J JSON+独立gatingを参照し、元Face/OBJ vertex IDs/Float64 bytewise digestの一致、完全鏡像、現在146個（旧142+K4）との重複なし、凍結42点XZ polygon-crossing / seven sample / polygon vertex enclosureを独立に再判定。負例も検証。
- WebGL2 screenshot: CONTEXT / OBJECT 2枚を追加（1600×900、PlayCanvasの実描画）。通常必須5方向にはカウントしない。キャプチャ取得だけでは目視承認・Visual Freezeにはならない。

## Phase12Mへ向けた保留事項

このGateはsource-onlyの可視化を改善したもので、ゲームプレイ接続を解決していない。確認には実スクリーンショットにおける14部品の位置関係と薄い輪郭の視認性が必要。形状追加の次は「ただ輪郭を増やす」のではなく、施設や射線を変えずに、元資料で根拠のある連結性・見切れ・境界を確認すること。推測で床・屋根・大幅な空白埋めはしない。
