# B393 — 真正180秒SOURCE内でのサブ2発爆発と自然回復の証拠

2026-11-01 JST。正本 branch dev/t21-f4e103w-qa-infra。F1–F5 Fast Trackを維持。

## 確定済みのB385/B390前工程

- [GitHub Actions #41279671286](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41279671286) はSUCCESS。Twin Cometsを実選択し、原作の落下・坂・塗装局所3/3を成立させたうえで、実CDP KeyFからSnap Bombを2回投擲した。
- 実インク99.16→54.33→9.33、実HUDは残量不足時に SUB Snap Bomb · NEED 45 INK。SOURCE native tick 11860で180秒TIME_UP、実人間92 shots/388 changed source cells、CPU745 shots/17388 changed source cells、実CPU7/7復帰、真の同武器再試合へ遷移。Scoreable 0、公式Winner NONE。
- 上記成功は2回の実投擲・インク消費・試合終了を証明したが、その同じラウンドでサブ2発が自然爆発したことや45インク再回復後のHUD復帰を証明していない。

## B393の実装（新CI判定前）

- 変更 [500f3da29222160a995decb40ebdbee624604a6f](https://github.com/ryomashibaba/browser-ink-tps/commit/500f3da29222160a995decb40ebdbee624604a6f) は、既存B385/B390真正Chromiumに限り、2回の実Fキー投擲後に本当の b38HumanSub.explosions が2増加することを検証する。
- 本当のplayerInkが45以上まで通常回復し、PLAYER HUDの F SUB Snap Bomb 案内が復帰することを実native tickと共に保存する。試合時計を強制せず、インク・HP・サブ・Actor・物理・地形・得点を直接変更しない。
- CI [#41282785196](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41282785196) がSUCCESSになり、実計測ログで上記検証が確認できるまではB393の新要件をPASSとして報告しない。

## 絶対維持

自然な相手へのサブ物理爆発は、原作への塗装成功やCPUへのHP命中、公式得点を自動的に意味しない。原作25 Rapier solids /17 PaintSurface /26 NavLinks /0 scoreable、対岸自然経路0/12、原作 FloorLine00衝突権限未確認、正式4v4・ART・本番公開HOLD。main/T19C/T20/Pages/Draft PR #5を変更しない。

## 2026-11-01 — B393真正完了結果

[GitHub Actions #41282785196](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41282785196) の対象SHA `500f3da29222160a995decb40ebdbee624604a6f` は**SUCCESS**。ログ `B393_REAL_NATIVE_SUB_EXPLOSIONS_REFILL` で真の実サブ爆発0→2、投擲2、native tick 1482、インク9.3267（tick1464）→45.66（tick1698）とHUDの`F SUB Snap Bomb`復帰を確認。同じ真正SOURCEラウンドで180秒TIME_UP tick11860、人間93弾・388セル、CPU745弾・17388セル、CPU7/7実復帰、Winner NONE。CPUへの実命中／サブ塗装変化は未認証のまま。B392新HUDの実DOM認証とは別。
