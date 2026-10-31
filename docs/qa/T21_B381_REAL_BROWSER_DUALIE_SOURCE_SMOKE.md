# B381 — 実Chromiumでのマニューバー選択→Rapierスライド→本物の発射

2026年10月31日 JST。既存のGitHub正本 `ryomashibaba/browser-ink-tps` / `dev/t21-f4e103w-qa-infra`。本番 `main`、凍結T19C/T20、公開Pages、元OBJは変更しない。

## 動機と実施

B380の7件の既存GitHub ActionsはすべてSUCCESS。しかし、B379によるマニューバー操作接続は、Vitest上の入力判定と別の既存Chromium回帰のみで、実ユーザー相当の右クリックが本当にRapier KCCのスライド変位を生じるかは未認証だった。

B381では既存の `scripts/t21-f3-browser-smoke.mjs` にSOURCE-onlyの別検証レーン `T21_B381_REAL_DUALIE_CHROME=1` を追加。新しいCIワークフローは作らず、既存W10-B15の trusted-input にテストステップを統合した。

1. 真正WebGL2 Chromeで既存 SOURCE 180s REAL READY を起動。25 originals solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable の境界を確認。
2. 画面の既存B378武器セレクトをCDPの本物のマウス・矢印キーイベントで操作し、3番目 `twin-comets` をユーザー選択する。内部 setter 直呼びは禁止。DOM選択・実 `ProjectileSystem` 武器・実tick未進行が一致することを確認。
3. 実Startボタンをクリックし、真のPointer Lockと連続する物理tickを確認。右クリック1回のみで既存 `PlayerController.requestWeaponDodge` が真のKCCで適用された結果、実 `PerformanceStats.playerWeaponDodges=1` とスライド残量1を読み取り検証。
4. 同じ実Chromeの前後プレイヤーbody座標の水平変化が0.40〜5.5mであることを検査。その後、本物の左クリックで既存 `ProjectileSystem` の発射回数が増えたことを検証。
5. ScreenshotとJSON証拠を既存Actions artifactへ保存。人工CPU命中、手動プレイヤーテレポート、模擬射撃、人工足場、捏造の敵との接触は一切なし。

`b381RealNativeDodge` は原本 `snapshot()` の**読み取り専用**物理カウンター・元のKCC座標であり、試験用の操作・CPU制御・時間変更・物理ゲートではない。

## 判定の上限

B381の専用Chromeテストが完了してSUCCESSになるまでは B381 技術PASSと主張しない。仮に実機PASSしても、原作マニューバーの射速・拡散・スライド距離や視覚的再現、敵陣への自然通路、対人の本物の試合、Scoreable化は認証しない。

原作25/17/26/0、自然な敵陣ルート0/12、得点とWinner NONE、正式4v4とproductionはHOLD。B380での既存成功CIと新B381の合否は分離して記録する。
