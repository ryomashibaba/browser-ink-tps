# T21 F3 — 実2×180秒SOURCE再戦の前回記録比較（2026-11-05）

## 実プレイ実績と目的
[旧研究HEAD #41966021991](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41966021991) は **SUCCESS**。[本物の独立Artifact #13389770786](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41966021991/artifacts/13389770786) を実際に取得して確認。1試合目 tick11856、人間121shots/1117 original changed cells、CPU146 shots/11926 cells。元ゲームボタンの再戦で新しい実PlayCanvas/Rapier世界（異なるbrowser timeOrigin）を開始し、2試合目 tick11858、人間19shots/112 cells、CPU112 requests/11908 cells。B430/B438独立PASS、ただし正式得点/自然対岸敵経路/敵HP命中はゼロでHOLD。
さらに最新HEAD `ce159694` はB440/B441/B448真正 SUCCESS（B441 Artifacts #13388637543、Source end footerの真READY DOM検証を含む）。

ゲームとして継続して遊ぶため、**前回の実180秒SOURCE非得点セッションと今回の真正セッションを比べるUI**を導入する。新規の疑似CPU・偽スコア・シミュレーションではなく、元SOURCEの実native試合完了後に既存B58の実shot、original changed cells、CPU shotをブラウザの同一タブ内 `sessionStorage` に保存。前回とは異なる本物のbrowser `performance.timeOrigin` の新worldでのみ参照し、TIME_UP終了画面の既存スクロール統計内へ増減表示。再戦ボタンは前工程の常時可視footerを保持。

記録条件は厳格：本物のTIME_UP、`timeRemainingSeconds=0`、native tick≥10800、SOURCE25/17/26/0前提の既存 `sourceSessionSummary` 独立検証、CPU7/7 rejoined、Scoreable0/officialWinner NONE、非production。前回のローカル記録は**独立GitHub QAの認証証拠ではない**ことをUIに明記。タブを閉じると消える。一切のアップロード・遠隔送信・analyticsなし。JavaScriptストレージ拒否時でも試合は正常に進行。

B463 helperのVitestでRAW実値、異世界比較、偽TIME_UP、無効CPU数、偽official勝者、破損履歴を拒否する。既存B441真正7CPU Chromiumに同試験を追加し、ゲームビルドと新画面DOMの回帰を確認。**新HEADでの本物の2試合連続UI表示自体は後続の長時間Chromeで確認するまで未認証**。

F1〜F5・Fast Track不変更。原作25 solids / 17 paint surfaces / 26 nav links / 0 scoreable、対岸0/12、正式4v4/ART/productionはHOLD。main/T19C/T20/正式QA/Draft PR#5/Pages/非公開SOURCE保護。Work/Computer Use未起動、追加課金なし。
