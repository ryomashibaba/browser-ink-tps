# B384 実物理の12武器選択＋SOURCE180秒の原作局所課題

2026-11-01 JST。旧F1〜F5とFast Trackに従う。QAブランチのみ。

B343固定シューターとは独立し、SOURCEの新しいボタンからB183原作落下、B186本当のRamp KCC＋Projectile PaintEvent、B192 1人＋7CPU、B378既存12武器選択、Fサブ、HP/復活、180秒時計を一つの実プレイに接続した。途中の局所3工程と終了画面は本当の60Hz B186/current-life証拠から読み、B343でしか利用できない射撃スロット計測値は通常12武器版では未測定とする。再挑戦は新しいSOURCEワールドを開始する。ゲームルールの新規得点・対岸ルート・無料スペシャルは一切設けない。

既存B75 CIのTypeScript、Vitest、build、既存モードのChromeを確認し、B384固有の操作→武器→実下り→坂→塗装→局所CLEARは別途真正ブラウザで確認するまではHOLDとする。数値契約25 Rapier /17 paint/26 links/0 scoreable、自然敵陣0/12、activationReady=false、ART・正式4v4・winner・本番HOLD。main/T19C/T20/公開Pages/Draft PR #5/非公開資料不変更。

## B386 — playable normal preview 12-kit entry and physical enemy awareness (2026-11-01)

Ordinary preview gets a genuine one-click user action that navigates to the same new, unscored, 180s SOURCE original B384 world with the existing 12-weapon READY selector, real 7 CPU and HP/ink/physics. The existing real B368 native enemy frontier is also enabled on B384: during true PLAYING with original human KCC support it shows only real CPU positions, distance and original-stage cover, never claiming a route or hit. The existing B385 Chromium runner now starts at ordinary preview and verifies B384 3/3 plus visible B368 physical enemy distance against actual native CPU feet. No new workflow or synthetic map/actor; main, public Pages and full 4v4 HOLD unchanged. This feature is not PASS until the new CI confirms it.
