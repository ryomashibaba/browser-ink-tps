# T21 F2＋F3＋B337 三系統の隔離ソース統合 (2026-11-03 JST)

## 固定運用・明示区分
- 新しい研究ブランチ `research/t21-f2-f3-b337-native-integration-20261103` のみ。正式QA・main・Draft PR#5・Pages・frozen T20は編集しない。原作SOURCE 25 solids/17 real PaintSurfaces/26 original NavLinks/0 Scoreables。自然な敵陣到達0/12、正式4v4/ART/production HOLD。
- 独立にPASS済のF2実Chromiumは [#41588119357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41588119357)：4本真正KeyW入力で原作Rapierランプに約1.562m移動、着地・ランプ含む3原作塗装面に実射撃。
- 独立にPASS済のF3回帰は [#41594101783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594101783)：CPU HP0同tick splat・B367 HUD・150tick復活・7CPU live rejoin、50/50 Vitestと全体TypeScript型検査。**実敵への人間射撃・実HP撃破のChromium証明ではない**。
- 独立にPASS済のB337実Chromiumは [#41594858216](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41594858216)：真实CDP mouse yaw -128.92°/pitch -13.14°、原作高所SOURCE 9発・人間92セル実塗装、真正KeyW 0.7051m、7CPU実再合流、独立審査PASS。**敵HP命中は未認証**。

## 統合は別々の二つの真正Chromiumセッション
- F3 PASS済実ソース＋F2の実入力改善研究branchを基準にする。B337 branchから**6コード/試験ファイルだけ**をGit object SHAで正確にコピーする（`UndertowF3PlayablePreviewApp.ts`, local cells helper/test, B337 driver, audit/test）。独立専用B337 workflowと旧文書は不要なためコピーしない。
- **新統合CI 1本**で厳格なF3 50例＋B337 Node/3 Vitest＋F2 original motion Node検証＋同一ビルドの真正Chromeを2回実行。F2実人間ラリー→原作ランプと3塗装面独立認証、別セッションでB337実マウス・撃発・native ownerGridセル増加・原作足元・WASDを独立認証。
- 第3段の結合チェッカーは同一SOURCE、実3面+ランプ、9発等の値ではなく増分 `>0`、人間実インク、正常なHOLD・Scoreable0を要求。一つでも未達ならCI RED。
- **PASSしても単一180秒試合中のランプ登坂→敵撃破→復活とは認定しない**。CI内の二つの真正試合は別々。F3の即時CPU撃破は依然として実戦闘試験ではなくロジック回帰。
- SOURCE境界の擬似前進・補間KCC・世界物理コライダー追加・AIのテレポート・ターフ勝敗・人工インク・人工HP・UI score認証はすべて禁止。次段階は真の対敵戦闘が観測できる原作経路・射線が存在するか監査する。
