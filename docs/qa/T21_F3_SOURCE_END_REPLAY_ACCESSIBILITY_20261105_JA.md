# F3：実SOURCE終了画面の再戦・モード変更を常時表示（2026-11-05）

[真正2試合Run #41951999679](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41951999679) の RAW Artifact #13383758500内 `B430_TRUE_SECOND_SOURCE_TIME_UP.png`（1600×900）を直接開き、長い統計欄の末尾の実再戦ボタンが画面外に隠れる実際のUI問題を確認。

旧B59は縦長のカード全体をスクロールしていた。今回、実SOURCE 180秒終了カードを**統計スクロール領域** `#t21-f3-b59-scroll-stats` と、**常に見える操作フッター** `#t21-f3-b59-footer-actions` に分割する。元の実再戦ボタン `#t21-f3-b59-restart`、後から元アプリが追加する「CHANGE SOURCE GAME MODE」、任意LOCAL JSON保存を同フッターへ配置。既存CSS外の改造なく、同じ元React非使用DOMとGameWorldを使用する。

ソース原本25/17/26/0、A1ミッション、CPU7、物理、弾/インク/HP/時計、勝者NONE、Scoreable0、再戦動作、統計自体は一切不変更。main/T19C/T20/正式QA/PR5/Pages/原本・Work事前承認制も固定。

既存B441真正7CPU ChromiumのゲームREADY DOMで、本物のSOURCE終了画面の統計スクロール・固定再戦/モード変更の存在を検証。TIME_UPは改ざんしないので、実TIME_UP時の視認性は後続の長時間真正スクリーンショットで別途検証する。結果判明前にART/PASSを偽称しない。
