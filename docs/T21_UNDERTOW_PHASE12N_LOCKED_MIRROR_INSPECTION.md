# T21 Phase12N — 原本22部品の左右近接・同一カメラA/B輪郭比較

## 不変条件

Phase12M canonical HEAD `8e889c9d9efcbbe1a6d4a52fdb0734bf57b9b939`、CI #1411 の build / WebGL2 visual capture はすべて SUCCESS。既存 Draft/open/unmerged PR #5 `codex/t21-undertow-evidence-ledger` のみを変更。本番 T20 は `inkworks-junction`、T21 `activationReady=false`、Visual Freeze 承認なし。通常レビューに表示する original source は124部品、source-walkは64のまま。

Phase12Nは **新しい原本ジオメトリを一切追加しない**。Phase12I=6、12K=4、12L=4、12M=8という既存22部品・488原本三角形のみを比較する。

## 左右別 A/B（同一カメラ・同一フレーミング）

- URL例: `?stageReview=undertow&reviewRenderer=webgl2&reviewPillarInspect=LEFT_BASE`。
- `LEFT_BASE`：負X側の原本7部品（I3+K2+L2）、156原本三角形。Phase12Mの平面縁・短い帯を非表示。
- `LEFT_WITH`：**全く同じカメラ**のまま、M4を追加表示。負X側原本11部品、244原本三角形。
- `RIGHT_BASE` / `RIGHT_WITH`：正X側の鏡像11部品について同様の7↔11、156↔244の比較。
- 個々の対象物が左右いずれにあるかは、**元のFloat64頂点X座標の重心**だけで決定する。表示ノードの順序から推測しない。鏡像を誤認しないため各root内の部品数と7/11、および156/244を fail-closed 検査。
- 左右のカメラ位置は両側の **計11原本部品すべての頂点**から計算し、M4をOFFにしてもカメラのXYZ位置・yaw・pitch・距離を変えない。左右はyaw 38° /218°、pitch30°で見比べる。
- A/B用カメラ文字列 `t21ReviewPhase12NCameraKey` を画面の `dataset` に保存。撮影ジョブの各A/Bで完全一致を要求。左右のフレーミング中心は原本の鏡像軸 `x+x'=0.229368288528164; z+z'=0.194564295456822` を保持しているか独立チェック。
- 4枚の実画像はChrome/PlayCanvas WebGL2で1600x900取得。PNGヘッダ/サイズ/長さ/SHA256の不一致、同一画像の繰り返し、base/WITHのカメラずれ、片側の取り違えを拒否。これは五方向の標準キャプチャとは別の diagnostic であり、human visual approval を自動付与しない。

## Phase12Jの未使用候補28部品 — 分類結果（レンダリングしない）

元OBJ: `Vss_Temple01.obj`、43,263,289 bytes、SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`、original active faces 70,396。
Phase12Jでレビューのみ適格と判断された44 source componentsのうち、K/L/Mの16個を除く**14鏡像対＝28原本部品、616原本三角形**が保留。Phase12Nの独立テストで全44候補/28残存、元のFace IDと鏡像先の参照、原本適格gateの決定、下記7グループ（各4）を固定チェックする。

| 元source family | 元Y範囲 (m) | 未使用original Face min（各22枚） | 意味合い |
|---|---|---|---|
| Pillar00 | 21.4–21.8 | 16816, 20854, 17090, 20577 | 下部短い側面 |
| Pillar00 | 21.8–21.8 | 16062, 19976, 16106, 19910 | 薄い断面 |
| Pillar00 | 21.8–22.3 | 16018, 19998, 16128, 19888 | 下部短い側面 |
| Pillar00 | 22.3–22.3 | 16084, 19954, 16040, 19932 | 薄い断面 |
| PillarObject01 | 25.1–25.1 | 44140, 44316, 44404, 44470 | 平面source（床ではない） |
| PillarObject01 | 26.2–26.2 | 44272, 44646, 44206, 44338 | 平面source（床ではない） |
| PillarObject01 | 26.2–26.7 | 44162, 44580, 44250, 44602 | 短い側面 |

これは **source-only eligible** の分類であり、元OBJの接合関係や当たり判定を証明しない。新規28部品は一切表示・ゲーム実装・マージ・Freezeしない。足場、床、屋根、ガラス当たり判定、塗り、AI移動先、ナビゲーション、スコアに自動変換しない。

## 後続Phase12O

Phase12Nの4画像（左右BASE/WITH）を実際に比較し、追加M4が明瞭に見えるか、原本の細い水平帯が遮蔽されるかを判断する。拡大表示が不足していれば camera FOV / near clip /同じカメラでの transparent overlay を先に検討。残り28部品の無条件追加はしない。必要な形状変更は独立した元OBJ鏡像/外側42頂点/先行158 source の全QAが通る場合に限り提案する。
