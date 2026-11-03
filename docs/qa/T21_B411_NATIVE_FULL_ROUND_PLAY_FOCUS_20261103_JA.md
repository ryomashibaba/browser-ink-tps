# T21 B411 — 180秒SOURCE実試合中のUIをプレイ優先に切り替え、TIME_UPで再戦を戻す

2026-11-03。F5の**実プレイ視認性・再戦UX**改善。原作の当たり判定や試合内容を再定義しない。研究ブランチ限定、正式QAには未昇格。

## 実機で証明済みの前提
B410 [真正Chromium Actions #41626195290](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41626195290) はコードSHA `3bf023c775e0188c3c5f88593f16a93e041c4a06` で**全ジョブ・独立検査SUCCESS**。原本artifact **13227760449**。原作の25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable。原作高所→初着地→坂道→右上段の同一真Chromiumルート、原作**4面**への人間実着弾塗装。原作上段B324+B326で5.164171883474169m実KCC、CPU7体とnative TIME_UP tick11858。合計人間**82発、原作ownerGrid実変化1132セル**、CPU source射撃要求150、CPU実ownerGrid変化12809セル。残り120/60/30秒に3回の本物WASD＋B408原作liveセル再照準、合計追加24発、追加実塗装215セル、実KCC距離合計8.331327210901616m（経路ネット距離ではない）。これは実CPUの対戦HP命中を示さず、敵HPイベント0、正式4v4と原作スコア認証はHOLD。

## 実画面から明らかになったプレイ妨害
B409/B410の実ブラウザスクリーンショットで、A1練習短ミッション達成後に中心下側に大型の「REAL ALLY SYNC CLEAR」トースト、練習カード、A1進捗HUD、緑の「REPLAY A1 CO-OP」ボタンが**試合残り約90秒でも消えない**。実180秒のゲームがまだPLAYINGなのに再戦が押せるのはゲームUXの欠陥。練習の独立証拠は正しいが、ユーザーが3Dステージを見て狙うプレイを邪魔してはならない。

## B411 一体化した改善
`src/app/UndertowF3PlayablePreviewApp.ts` に、既存UIを壊さない**明示opt-inのプレイ優先表示**を追加。真のA1 SOURCE mission CLEAR、native B203 PLAYING、明示URL `t21B411=sourceRoundFocus`、本物25/17/26/0と元ownerGrid、Scoreable0、verified A1 shots、停止/PAUSEなしのときだけ有効化する。
- プレイヤーの画面中央・下側から練習CLEARトーストを消す（native CLEAR状態や元DOM監査データは変えない）。
- 練習カードを画面から隠し、A1進捗HUDを**左上の小型SOURCE専用ステータス**に移して3D視界を空ける。原作の新得点や勝者は表示しない。
- 180秒ゲームが実際にPLAYINGの間、元の「再戦」ボタンは隠して無効化。実native TIME_UP後に既存UIと実再戦ボタンを表示し直す。
- B162、B168およびB200の本来のQA・再戦証拠は、研究opt-in前なので不変更。研究opt-inなしの従来B409/B410既存経路も不変更。重要：B411は**UIのみ**であり、native tick、HP、Actor、Rapier/Recast、インク所有、OriginalMap、sourceScoreableには一切書き込まない。

同一の既存B410 true Chrome workflowを再利用し、単一の元SOURCE実180秒試合で「原作4面人間塗装＋後半実入力＋試合中コンパクト化＋TIME_UP時再戦復帰」をまとめて観測する。原作実スクリーンショットのRAW PNGに加え、AFTER_ROUTE/90/TIME_UPのnative HUD DOM、最終的に厳格なB409/B410/B411独立監査を全て同SHAで成功させて初めて限定PASSとする。Node build/Unitだけで真正PASSを出してはならない。

## 固定HOLD
原作25/17/26/0・対岸自然Recast 0/12、activationReady=false。敵の自然HP命中・撃破・150tick復活、原作版7.2.0の中央FloorLine00安全連続接続・bphsh衝突権威、正式Turf得点/勝敗、4v4、ART、productionはHOLD。main、formal QA、T20、Draft PR#5、Pagesの更新・merge・公開は禁止。Chat＋GitHub、Workは事前承認が必要。ユーザーのPC操作は不要。
