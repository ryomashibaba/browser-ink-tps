# B375 — 実際のSOURCEカメラのマウス感度調整

2026-10-31 JST / `dev/t21-f4e103w-qa-infra`。実装の保存は真正ChromiumでのPASSを意味しない。

## プレイヤーが使える機能
SOURCE練習版の180秒プレイで、マウス感度が水平0.22度/pixel、垂直0.18度/pixelの固定倍率だった。実際のSOURCE Pointer Lock操作中にキーボード `[` を押すと0.25倍遅く、`]` を押すと0.25倍速くできるようにした。初期1.00x、範囲0.50〜1.75x。キーリピート・Alt/Ctrl/Meta中・ロック外・通常版T20では変更されない。ページを再読込すると初期値に戻る。

既存の180秒情報パネルとREADY案内に現在感度/ショートカットを加える。新しいプレイオーバーレイやメニューは増やさない。SOURCEカメラのYaw/Pitchの生マウス移動量だけに倍率を適用し、ピッチ可動範囲、Q肩切替、照準レイと障害物レイ、弾・武器・資源・インク・Rapier・Recast・CPU・HP・復活・時計には書き込まない。原作スプラトゥーンの実測感度と一致するという主張もしない。

## テストと境界
既存 `ThirdPersonCamera.combat.test.ts` に通常版1倍固定、SOURCE Pointer Lock認可、キー連打の上下限、実マウス移動のYaw/Pitch、Q肩切替維持を追加。既存のPlayCanvasビルド/真正Chrome系CIを再利用し、新しい専用重いCIは設けない。GitHub ActionsがQUEUEDなら未検証。

25原作Rapier solids / 17 PaintSurface / 26 source NavLinks / 0 Scoreable。自然相手陣経路0/12、正式4v4/得点/勝敗/productionはHOLD。main、T19C/T20、公開Pages、Draft PR #5、非公開OBJは変更しない。

B373には過去の真正FAIL [#41181647068](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41181647068) があり、再試験 [#41182370552](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41182370552) の結果を別途確認する必要がある。
