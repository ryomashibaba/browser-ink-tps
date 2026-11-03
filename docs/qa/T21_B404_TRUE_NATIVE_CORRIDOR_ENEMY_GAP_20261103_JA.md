# Browser Ink TPS B404 — 原作KCC上段までと敵CPUの距離候補（異なる真正セッション）

2026-11-03｜B403 [#41597891974](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41597891974) は、固定高所プレイヤーと敵CPU7点観測の独立SHA照合・距離計算に成功。

## 今回の実データ（SOURCEのみ）
- B322 genuine Chromium [#41571706674](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706674)、Artifact #13203949453：B316/B320/B321/B322/B324/B326、真正KeyWの原作Rapier足元32点。上段までの連続局所移動（5.1999937mの上段延長を含む）は既存の原作物理審査PASS。
- B340 genuine Chromium 180s [#40988204871](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40988204871)、Artifact #12949234359：異なる実試合で、敵B1〜B4の実物理足位置を7時点、28点。
- 32×28＝896の全組み合わせで水平距離を再計算。**最小97.553m**。これが同じ瞬間の人間と敵との距離ではない。敵は別試合の別tickにいるため、**cross-session nonconcurrent lower sampled envelope** のみ。B181最大32m候補窓は全組み合わせで遠方。
- 最接近の組み合わせ：B326実人間 tick2188 / 原作右上段 [11.5056028,5.3943486,46.8775673]、B340敵B2別試合 tick11860。近接、自然敵陣経路、物理レイ・命中・HP喪失・撃破・復活、正式勝者は**全て未認証**。

## 実装 / CI
B403から研究branchを分け、B322元6 JSONとB340元1 JSONを本物のGitHub Actions artifactから読み取る。ファイル内容のSHA256原本照合（7個）、real foot source support / real KeyW / scoreable 0 / actor relocation 0 / 17 PaintSurfaces / 25/17/26/0を強制。真正Chromiumを繰り返さず、数学的比較のみ。異なるセッションの2データは**一体の実戦闘証明に絶対昇格しない**。

この結果は「現時点の局所原作KCC延長だけでは既存の敵位置に射程候補が現れない」ことを示すが、未探索の原作移動経路、未記録の時刻、別の敵進路には外挿しない。次の工程はF4既存SOURCEの本物の地形・RAPiER/Navmesh seam問題を修復検証すること。人工通路、物理テレポート、HP直接変更、Scoreable解禁、偽射線の導入は禁止。

main、既存QA branch、T20、Draft PR #5、公開Pages不変更、正式4v4/ART/production HOLD、自然敵陣0/12維持。
