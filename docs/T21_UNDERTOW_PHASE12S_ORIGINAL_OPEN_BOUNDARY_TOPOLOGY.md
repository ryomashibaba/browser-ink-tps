# T21 Phase12S — 原本OBJ頂点ID境界・開放殻・非多様体の独立監査

## Scope / 根拠
- Original KiTrix `Vss_Temple01.obj` 43,263,289 bytes; SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`.
- 監査対象はPhase12I(6)、12K(4)、12L(4)、12M(8)の合計 **22個の元OBJ頂点ID連結ソース部品・488枚の原本三角形**。左右鏡映11個ずつ。
- 既存Phase12P(80方向付き対)、Q(110無順序対)、R(110無順序対)とは別のトポロジー計算法で監査する。Phase12Q/Rの「異なるOBJ頂点ID間で、3D XYZの同じ辺がある」という証拠は**OBJ-IDで溶接されている証拠ではない**。

## 監査の定義
元OBJの Face ID・各三角形の頂点IDの向き・Float64 XYZを保持する。

1. 原本OBJ頂点IDの**無向辺**をキーに、同じ部品内での面数(incidence)を集計。面数1を開放境界、2を内部辺、3以上を非多様体辺とする。
2. 面数2の辺で、元三角形の向きが逆でなければ方向不整合として別途検出する。頂点ID→XYZの一意性、面IDの一意性、三角形面積が非ゼロ、三角形の全3辺が有効であることを検査。
3. 開放境界の原本IDグラフから連結ネットワークと閉鎖境界ループを数え、端点/枝分かれ頂点も独立に計数する。各部品Euler characteristic V−E+Fも証拠化。
4. 全22部品の左右鏡映ペアで V/E/F・開放境界/内部/非多様体/方向不整合・境界ループ数が等しいことを検査。
5. Phase12Rの全110組の原本XYZ一致辺/両部品の境界辺分類と別計算法で照合。CIでは前段Phase12R JSONが必須。通常の全Unit実行時には専用外部JSONの入力を要求しない。
6. 人工的な開放1三角形、正しい閉じた四面体、3面以上が共有する辺の**negative/control tests**を含む。

## 原本22部品の独立Python事前監査
- **488元Face**、全22部品に**開放境界あり**、原本OBJ-IDで閉じた単体シェル **0/22**。
- 原本OBJ-IDの開放境界辺 **524本**、内部の2面共有辺 **470本**、3面以上の非多様体辺 **0本**、面数2の方向不整合 **0本**。
- 境界ループ **計22**（1部品1ループ）。分岐/端点境界頂点 **0個**。全22部品でEuler V−E+F=1。
- 20部品はV24/E45/F22/開放境界24/内部辺21。2部品はV24/E47/F22/開放境界22/内部辺25。
- **大事な制限**：この22個の*個別原本頂点ID部品が閉じていない*という証拠を、元ステージ全体が閉鎖シェルを持たないことの証拠へ外挿しない。異なるOBJ-IDによる幾何学的隣接や、ゲーム上の別衝突プリミティブなども否定しない。

## Freeze と認可の境界
- PR #5 Draft/open/unmerged。本番T20 `inkworks-junction`、T21 `activationReady=false`、Visual Freeze未承認。
- 標準124 source display、64 walk-source、42点hard-XZ outer polygon、未表示28 original candidate components/616 triangles はすべてHOLD。
- I/K/L/M 22部品は以前と同じopt-in source-only。新しいメッシュ・原本頂点溶接・補完面・閉じた床/屋根・collision/nav/paint/CPU/score・stage activationは**一切認めない**。
- 完了判定はCIの新Phase12S独立ジョブ、TypeScript、全Unit、build、従来ブラウザ5ビュー/拡大レビューが同じHEADで全部SUCCESS、Phase12S成果物の現物確認を要する。

## 実装
- `scripts/UndertowSpillwayPhase12SOriginalOpenBoundaryQa.test.ts`
- `.github/workflows/deploy-pages.yml` の独立QAと成果物 `t21-undertow-phase12s-source-only-open-boundary-topology`
- Phase12Tは、必要時に**22部品に限定した原本候補間の不足面と開放境界の分類**を行う段階。未表示28を無条件で描画・活性化しない。
