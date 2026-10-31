# B376 真正180秒終了と致死HPへの射撃・kitの同期

2026-10-31 JST。SOURCE 180秒・人間1+CPU7の現行F1〜F5方針。今回の修正は実ゲーム60Hz固定Tickの戦闘動作を対象とする。

- `stepFixed` は真のCPU物理更新と `TIME_UP` 遷移の後に、既存の `PlayerResources.currentHp`、`matchState`、`stopReason` を観察する。新しい偽時計・新しい弾・テレポート・原作床は作らない。
- 残り時間0の最後のTickでは新規の人間射撃/武器右クリック・CPU7体の射撃キュー/kitを受け付けない。以前から飛んでいた弾がそのTickで着弾する正規の物理計算はそのまま。それ以降のTickは既存の `TIME_UP` ゲートで停止する。
- 同TickのCPU処理により人間の実HPが0になったら、Tick開始時点の `alive` がtrueでも新たな発射を認めない。さらに `ProjectileSystem.fixedUpdate` 後にHPをもう一度確認し、致死被弾後の人間Fサブ使用をブロックする。
- `UndertowF3PlayableHud.test.ts` の既存ユニット検査へ、実装と同じ判定関数のSTAGING/PLAYING、TIME_UP、真HP0、SAFE_STOPを確認する試験を追加した。**ユニット試験は真正180秒Chromium検証ではない**。CI未完了中にPASSは主張しない。
- SOURCE固定の25 Rapier solids、17 PaintSurfaces、26 NavLinks、0 Scoreable、敵側自然経路0/12。公式winner NONE、本番/正式4v4とART認証HOLD。不変のmain/T19C/T20/公開Pages/Draft PR #5、非公開OBJに触れない。
- B373真正再試験 [Actions #41182370552](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41182370552) とB375の既存回帰試験 [#41183569332](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41183569332) はGitHub Actions待機、完成とみなさない。前例の真のB373 FAIL #41181647068 は記録を維持。
