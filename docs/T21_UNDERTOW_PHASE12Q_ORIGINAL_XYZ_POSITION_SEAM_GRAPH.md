# T21 Phase12Q — 元OBJ XYZ完全一致の接触関係グラフ

## 範囲
Phase12Pでは、元OBJのI/K/L/M部品の80組中、幾何学的距離ゼロの32組でOBJ頂点IDの共有がゼロだった。Phase12QはI6+K4+L4+M8=22個/488三角形の、左11部品55無順序組と右11部品55組、合計110組を検査する。原本はTemple01 OBJ 43,263,289 bytes、SHA256 a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046。

## 判定
- EXACT_POSITION_VERTEX_ONLY：原本Float64 XYZが1点以上完全一致するが、幾何学的に同一の元OBJ三角形辺は共有しない。
- EXACT_POSITION_EDGE_COINCIDENCE：両端XYZ完全一致の三角形辺が存在する。
- EXACT_POSITION_TRIANGLE_COINCIDENCE：三角形の3頂点XYZが一致する。
- NO_EXACT_POSITION_COINDICENCE：原本頂点XYZの完全一致なし。ただし非頂点での面交差や近接は否定できない。

原本Float64座標は許容差によるスナップを行わず、-0と+0だけ同じゼロとして扱う。同じXYZでも異なるOBJ頂点IDなら、原本頂点ID共有もゲーム内の物理接続も認めない。全110組の左右鏡映一致を原本IDの対応関係で検査する。

## 既存監査との独立照合
Phase12QはPhase12Pの3D三角形最近接距離アルゴリズムを再利用せず、原本の座標・辺・面に別の完全一致キーを使う。CIで生成したPhase12Pの80組JSONを必須入力とし、元OBJ頂点ID共有数、最接近頂点3D距離・最接近三角形3D距離と110組からの正確な座標一致を突き合わせる。両方の指標が一致しなければテストを失敗させる。全488元Face IDが一意で、原本IDと座標の対応が揺らがないことも検査する。

CI成果物名は t21-undertow-phase12q-source-only-position-seam-graph。110組の双方の原本ID、最初の同一XYZ代表値、幾何学的同一辺・三角形数、左右の位置グラフ連結成分、Phase12P独立交差照合結果をJSONで保存する。

## Freeze
- PR #5はDraft/open/unmerged。T20本番はinkworks-junction。T21 activationReady=false。Visual Freeze未承認。
- 通常124 source display、64 walk-source、42点ハードXZ、未表示28部品616三角形はHOLD。
- 追加/変更するのは独立QA・CI・文書のみ。メッシュ・頂点weld・床/屋根/キャップ・collision/nav/paint/score/CPU/本番切替はゼロ。
- 幾何学的座標グラフが連結されても、原本OBJが溶接された、床が歩ける、ナビゲーションが繋がると断定しない。
- Phase12Rへの進行は、最終HEADのCI必須ジョブ完全SUCCESSと成果物110組の検証後に限定する。

## 実装
- scripts/UndertowSpillwayPhase12QOriginalPositionSeamGraphQa.test.ts
- .github/workflows/deploy-pages.yml
- 通常必須5方向、Phase12O拡大WebGL2撮影、T20/T21既存シーンは非変更。
