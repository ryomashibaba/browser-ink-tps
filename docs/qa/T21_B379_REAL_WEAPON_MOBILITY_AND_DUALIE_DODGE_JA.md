# B379 — 180秒SOURCE実プレイの実武器移動・マニューバースライド

2026-10-31 JST。原作忠実度優先の既存QAブランチのみ。

## 実装した本物の操作
B378で既存の12研究武器プロファイルを選べるようにしたが、`ProjectileSystem.getMovementMultiplier()` と `PlayerController.setWeaponMoveMultiplier()` がSOURCE実ゲーム内で接続されていなかった。フデ／ローラー／チャージャー／スピナー／シェルター等の射撃/ガード中移動倍率が、実際の人間KCCに適用されていなかった。加えて `PlayerController.requestWeaponDodge()` と `ProjectileSystem.notifyDualieDodge()` がSOURCEの真の右クリックに接続されていなかった。

今回の `stepFixed` は真のPointer Lock、HP、STAGING/PLAYING、停止有無を判定し、実武器が定義済みの移動倍率を**Rapier KCC計算直前**にセットする。実際のマニューバー装備時のみ、新しい右クリックエッジで既存の有限スライド残量・4F起動・12Fスライド・発射ロックを有する `requestWeaponDodge()` を発動。KCCの本物の完了イベント後にだけ `notifyDualieDodge()` で既存の集中連射/精度モードを開始し、失敗スライドに補正を配布しない。通常シューター/B343基準の倍率1.0は維持。瀕死、ロック外、TIME_UP、SAFE STOPは新規スライドを禁止し、残留右クリックも破棄する。

全12武器プロファイルは原作数値の完全一致認証ではない。原作のない操作や床を発明していない。既存 `UndertowF3PlayableHud.test.ts` にバインド関数の操作・倍率・拒否回帰を追加したが、これはunit期待値であり**まだ真正Chromiumスライド成功ではない**。B373の修正版は独立して [真正Chrome SUCCESS](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41182370552)（現物10発/212新規セル、原作ローカルCLEAR、公式Scoreable0）。B379の新しいCIは別途確認。

25 Rapier solids、17 PaintSurface、26 original NavLinks、0 Scoreable、自然相手陣0/12、正式4v4/得点/勝敗/production HOLD。main、凍結T19C/T20、公開Pages、Draft PR #5、非公開OBJは不変。
