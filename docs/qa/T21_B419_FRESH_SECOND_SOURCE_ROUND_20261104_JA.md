# B419 — 真正180秒の後、実REPLAYで新SOURCE世界の2試合目を開始・発砲

固定F1–F5。既存B418全SUCCESSの180秒プレイ終了後だけ、実ユーザー入力（ESCと可視REPLAYボタンのCDPクリック）で別ページへ遷移する。従来B200での局所Co-op replayと異なり、真B409～B414通過後の試合から開始する。新世界はperformance.timeOriginの増加、原作25/17/26/0、cpu7実ボディ、native tick0、shots0、ink100、HP100を要件にする。続けて実UIでミッションARM→新試合START→本物のmousePressed射撃、shots増加とnative ink消費を同じブラウザで観測する。

新`scripts/t21-b419-real-full-round-fresh-replay.mjs` の独立偽反証とその単体テスト。実ログ`b419-real-second-source-round.json`、画像`B419_REAL_NEW_SOURCE_STAGING.png`、`B419_REAL_SECOND_SOURCE_PLAYER_SHOT.png`、独立判定`b419-independent-native-replay-verdict.json` を同一CI artifactに保存する。**新SHA真正Chromiumの最終判定は未確定**。2試合目180秒完走、対岸経路・敵命中HP撃破150tick復活、正式勝敗/得点、ART/本番は一切認定しない。main/QA/PR5/T19C/T20/Pagesを変更しない。追加有料サービス0。