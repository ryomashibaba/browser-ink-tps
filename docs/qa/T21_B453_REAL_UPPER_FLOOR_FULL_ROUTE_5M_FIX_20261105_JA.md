# B453 — 2×180秒SOURCE回帰の実KCC延長を修正（厳格5m基準維持）

2026-11-05 JST。F1–F5、原本25 Rapier/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸0/12、正式4v4/ART/本番HOLD。main/正式QA/Draft PR #5/Pages保護。

## 失敗を取り消さない

[B450版2×180秒真正Chromium #41855055248](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055248) は **FAIL**、[元Artifact #13337783270](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055248/artifacts/13337783270)。同一世界1試合目は実TIME_UP native tick11859まで継続し、human112 shots/1105 changed cells、CPU148 shot requests/12197 changed cells、元winner NONE/scoreable0を観測。本物のB316 ramp、B320/321 ascent、B322 crest、B324 upper continuationが局所PASS。B326の後続6実KeyW×2-tickで**局所拡張2.721572m**、B324と合計 **4.801533m**。B326局所承認は追加>=2.5mで成立するが、B409が別途要求する**真の合計>=5m**を満たさず、終了後 `B409_REAL_ONE_GAME_SOURCE_ROUTE_HOLD_GROUNDED_PHYSICAL_ROUTE_AND_THREE_NATIVE_PAINTS_NOT_PROVEN`。独立監査は原本以外を通さず、2試合目の正式監査も未実施。同じゲームRUNをPASSと誤記しない。

## 根本修正

既存 `scripts/t21-w10b139-original-native-descent-rally.mjs` のB326 actual KeyWループには最大8歩の余地があるが、局所 `extendedUpperFloorProven` が6歩でTRUEになると即終了し、**本物のB409全経路5m証明前に実入力を切っていた**。

本変更はB409真正180秒モード時だけ、B326の局所PASSに加え**合計5mの本物KCC witness**が揃うまで（最大8歩）本当のCDP KeyW入力を継続させる。それ以外のB326単独モードは以前と同じ。各歩のRapier実足・元SOURCE Solid・B326独立サンプル間drift<=0.15m・実2tick等、元安全審査を厳格維持。どの歩も欠落/未認証ならHOLDして元の物理・score等には書き込まない。5m基準や原本衝突・AI移動閾値は**一切緩和しない**。

既存 `.github/workflows/t21-b409-one-real-route-full-180s.yml` を新コミットで自動実行。過去SHAのPASSは今回新SHAのPASSに転用禁止。実Chrome＋独立B409/B410.../B430最終監査が成功するまで B453 HOLD。
