# B384 実物理の12武器選択＋SOURCE180秒の原作局所課題

2026-11-01 JST。旧F1〜F5とFast Trackに従う。QAブランチのみ。

B343固定シューターとは独立し、SOURCEの新しいボタンからB183原作落下、B186本当のRamp KCC＋Projectile PaintEvent、B192 1人＋7CPU、B378既存12武器選択、Fサブ、HP/復活、180秒時計を一つの実プレイに接続した。途中の局所3工程と終了画面は本当の60Hz B186/current-life証拠から読み、B343でしか利用できない射撃スロット計測値は通常12武器版では未測定とする。再挑戦は新しいSOURCEワールドを開始する。ゲームルールの新規得点・対岸ルート・無料スペシャルは一切設けない。

既存B75 CIのTypeScript、Vitest、build、既存モードのChromeを確認し、B384固有の操作→武器→実下り→坂→塗装→局所CLEARは別途真正ブラウザで確認するまではHOLDとする。数値契約25 Rapier /17 paint/26 links/0 scoreable、自然敵陣0/12、activationReady=false、ART・正式4v4・winner・本番HOLD。main/T19C/T20/公開Pages/Draft PR #5/非公開資料不変更。

## B386 — playable normal preview 12-kit entry and physical enemy awareness (2026-11-01)

Ordinary preview gets a genuine one-click user action that navigates to the same new, unscored, 180s SOURCE original B384 world with the existing 12-weapon READY selector, real 7 CPU and HP/ink/physics. The existing real B368 native enemy frontier is also enabled on B384: during true PLAYING with original human KCC support it shows only real CPU positions, distance and original-stage cover, never claiming a route or hit. The existing B385 Chromium runner now starts at ordinary preview and verifies B384 3/3 plus visible B368 physical enemy distance against actual native CPU feet. No new workflow or synthetic map/actor; main, public Pages and full 4v4 HOLD unchanged. This feature is not PASS until the new CI confirms it.


## 2026-11-01 B386 — 通常プレビューから12武器実プレイ、敵B1～B4の実物理距離HUD

- **実装:** `8625636edd579911bc4345092ce041ac117d25ff`。通常 `?t21Play=preview` のプレビューパネルからワンクリックでB384 SOURCE 180秒/12武器READYの**新しい原作物理世界**を起動できるようにした。旧SOURCE診断URLの手入力は不要。もともとのB368の**実CPU physicalFoot→水平距離・原作Rapierステージ遮蔽**表示を12武器SOURCEプレイで使えるようにしただけで、原作の足場・リンク・CPU座標・照準・HP・得点は変更なし。
- **検証:** [B386本命：B385拡張真正Chromium #41263010880](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41263010880) **SUCCESS**、ビルドおよび関連Vitest **68/68 PASS**。本物の通常プレビューからCDPマウスでボタンをクリック、Twin Cometsを選び、本当のSOURCE 7CPUの合流後、原作下段落下→元の坂道→原作上段でB186の**3/3 CLEAR**。人間37実弾、354原作インク変更セル、うち**初回落下後65新規セル**、本物の接地移動 **11.1732m**、CPU7/7。B371画面3/3とB58同じセッションのShots/Ink数が一致。
- **B386の新たな実証:** PLAYER画面の敵位置表示は **B1まで100.273m**、元CPU実座標 `[-15.655975,4.600000,-47.595318]` と整合。**実敵4体の計測・表示PASS**。DOM上で「DISTANT · NO CROSS-TEAM PATH」、`crossTeamRouteCertified=false`、`actualEncounterCertified=false`、`projectileHitCertified=false`、`actorRelocations=0`、`gameplayWrites=0` を確認。実際の敵への命中・対岸の自然通路を認証した意味ではない。
- **変更禁止とHOLD:** 原作25 Rapier solids / 17 PaintSurface / 26 NavLinks / 0 Scoreable、自然敵陣接続 **0/12**、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。公式winner NONE。180秒のTIME_UPまでのB384全完走、別の11武器の個別全ルート、自然対人/CPU交戦、正式4v4、ART/F5と公開本番は引き続き未認証/HOLD。元のmain、凍結T19C/T20、PR #5、公開Pagesは未変更。
- **次の優先度:** 原作SOURCEの欠けた自然敵陣経路を捏造するのではなく、本人がゲームを操作して評価できる**操作ガイダンス、現実の敵との視界接続・原作面の認証、180秒の実体験と結果**の中で、独立した意義がある工程をまとめて実装・検証する。単なるB番号・QA増殖は行わない。

