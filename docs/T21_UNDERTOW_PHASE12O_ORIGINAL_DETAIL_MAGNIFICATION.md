# T21 Phase12O — 原本の細部を拡大してA/B比較する専用レビュー

## 基点・不変条件

- 基点: Phase12N `4747a5c7aa861dda454f1c3f7099c1118d73bfb4`。GitHub [CI #1412](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/38019873445) 必須ジョブすべてSUCCESS。
- 既存 `codex/t21-undertow-evidence-ledger` / PR #5 Draft/open/unmergedで開発。本番はT20 `inkworks-junction`。T21 `activationReady=false`、Visual Freezeは未承認。
- Phase12I=6, 12K=4, 12L=4, 12M=8の**原本22部品/488三角形**のまま。元OBJ 43,263,289 bytes / SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`。未使用Phase12J候補28部品は保留。
- 通常レビュー原本124、歩行source inventory64、XZ外殻42点。新規ソース、推測面、床/天井/屋根/キャップ、コライダー、塗り、AI、ナビ、スコア、ゲーム本番変更は **0**。

## なぜ拡大が必要か

Phase12NのLEFT 1252 pixels・RIGHT 1242 pixels (閾値RGB差≥12)は、1600×900画面の約0.087%の差にとどまった。カメラは大きな柱全体Y20以上を収めており、原本由来の小さなY25.1–25.6の帯・水平縁を十分な大きさで確認できていない。

## Phase12Oで変更する箇所

- `?stageReview=undertow&reviewRenderer=webgl2&reviewPillarZoom=LEFT_BASE|LEFT_WITH|RIGHT_BASE|RIGHT_WITH`。UIに同じ4選択肢を配置。
- まずPhase12Nの左右元OBJ源だけを抽出する隔離処理でBASE=7 original parts/156 original triangles、WITH=11/244を再利用。その後、表示する/しない両方に共通する元Phase12M 4 partsから正確なY25.1–25.6とX/Z extentsを求め、カメラターゲットを細部中央へ移動。レンズ(fov55)・nearClip0.1は既存カメラ設定を保持。
- 距離は元のX/Z spanから `Math.max(13.5, horizontalSpan*1.28)` で固定。左右の180度対称カメラ（yaw38/218、pitch30）、カメラターゲット座標XYZ/角度/距離を記録し、同じ側のBASE/WITHは**完全一致**。
- 新しいカメラはreview-onlyのdatasetに記録し、通常Preset/レイヤー操作でOFFへ戻る。通常必須5方向のキャプチャを変更しない。

## 実画像の独立計量ゲート

- 新しいChrome PlayCanvas WebGL2（1600×900）で左右BASE/WITHの**計4枚**を、Phase12Nの従来の4枚と同じCIジョブ内で撮影。
- 自前のNode.js PNGデコーダ（zlib/PNG scanline filter 0～4、8bit RGB/RGBA、色データを再構築）でピクセル単位に RGB max channel Δ≥12 を判定。PNG署名、画素サイズ、SHA256、original source review-only metadata、default124、同じ側のcamera key完全一致を確認。ブラウザ/画像処理の単なるメタデータをもって視覚検証PASSとはしない。
- **Phase12Nで測定した差分画素数を新たなCI内で再測定した上で、Phase12Oの差分が1.5倍以上**となったときのみ拡大効果をPASSとする。実数値を予想で設定しない。変化面積/ROIをログに記録する。視認性が改善できなければCIはFAILし、カメラを再検討。
- Chrome captureが成功しても Visual Freeze／本番実装の許可・接続や歩行可能性の証拠にはならない。

## 次のPhase12P

Phase12Oの左右実画像と差分bboxを目視照合。幅0.5mの水平縁が重なりすぎる場合、同一カメラ・透明度のみ可変のoverlayを検討。ただし原本メッシュの面を足したりゲームコリジョンを認めたりしない。原本候補28個の承認も引き続き保留。
