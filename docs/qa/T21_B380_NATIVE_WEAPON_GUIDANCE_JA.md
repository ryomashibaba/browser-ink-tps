# B380 — 実武器選択に応じたプレイヤー向け操作案内

2026-10-31 JST。原作忠実度・SOURCE実試合180秒を優先する既存 QA 方針。

B378では12既存研究武器が選べ、B379では実Pointer LockからRapierマニューバースライドと武器移動倍率が接続された。しかし選択武器や右クリックの役割が開始前/プレイ中に見えず、プレイヤーが実機で動作を判断しにくかった。今回は既存のB202 READY案内とB205 180秒時計のテキストに、実 `ProjectileSystem.currentPlayerWeapon` の名前・クラスと、既存 `PlayerController` の使用条件／実 `PerformanceStats.playerWeaponDodgeCharges`・チャージ率から導いた**一行の操作案内**を加えた。新規オーバーレイは作らない。

- マニューバーは本物の右クリックKCCスライドと実残量0〜2、イカ状態ではHUMAN FORM、発射ロック中はRECOVERING、HP0はSPLATTED。
- シェルターは実ガードのRMB、チャージ式武器は既存チャージ率、フデ/ローラーは実LMB操作。サブは実装が有効な条件に限りFを表示。
- 現在選んだ武器以外のアクションを案内しない。弾やCPU戦闘・ナワバリ得点は一切作らず、原作スキル完全一致とは主張しない。新データセットや手動QA起動、専用Actionsを増やさない。
- `UndertowF3PlayableHud.test.ts` に実カタログ参照の表示、スライド残量・撃破状態・チャージ境界を追加。最新CIが完了するまでは実ブラウザの描画PASSではない。

原作25/17/26/0、敵陣接続0/12、正式4対4・得点・勝敗・本番HOLD。main、T19C/T20、公開Pages、Draft PR #5と非公開OBJは未変更。

## 2026-11-01 — 実サブインク消費とHUDの一致（実装、CI未判定）

PLAYER HUDのFサブ案内が実際の現在インク量とサブの消費量に一致しない問題を修正。既存の `weaponKit(actualWeapon.id).sub` → `subWeaponProfile(sub).inkCost` と `stats.playerInk` を読み取るだけで、インク不足時は `SUB <name> · NEED <cost> INK` として F 使用可能を示さない。十分な場合だけ `F SUB` を表示。判定には実 `PlayerResources.tryConsumeSubInk` の許容差 `1e-6` を使用する。全12武器キットの閾値を単体テストで検査し、壊れた消費量・不明インクはFail Closedとする。物理、実際のインク経済、試合時計、塗装、原作地形/CPU/得点は変更しない。追加後の真正ChromeとCI結果を待って初めて検証PASSとする。原作25/17/26/0、敵対自然経路0/12、4v4・本番公開HOLD。

## 2026-11-01 — 全キットサブインク閾値の回帰検証

実装SHA `508cfaa1475538ec558965efedc0f5aca7939bad` の [B75 Actions #41279188703](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41279188703) で **事前検証 SUCCESS**：全65テストファイル・382テストPASS、そのうち `B380NativePlayerWeaponGuide.test.ts` は55テストPASS。実 `PlayerResources.tryConsumeSubInk(cost)` と同じ許容差1e-6で、12武器の現在インク不足時にFサブ操作可能と偽表示しない。前段階の[B75 #41277953724](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41277953724) はREADY/F8/FIXED/SWEEP全4ジョブSUCCESSだが旧SHAである。新SHAでのB287/FIXED/SWEEPは本記録時点で最終判定前。未完の真正ブラウザ結果をPASSに繰り上げない。
