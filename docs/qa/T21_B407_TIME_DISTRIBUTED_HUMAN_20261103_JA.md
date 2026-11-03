# B407 — B405の同じ真正180秒試合に30秒間隔の実PLAYER操作を統合（研究）

2026-11-03 JST。根拠: B405 [真正Chrome #41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883) とB406 [SHA固定原本再計算 #41604651650](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41604651650) はSUCCESS。B405は最初の本物のWASD/9発/92原作セル後、180秒までは主に観測し、人間の途中操作は未認証だった。

## 今回の実装範囲
- B405の真正CDP・原作PaintSurface ownerGrid・人間Rapier KCC・7 CPU・本物の180秒時計をそのまま使う。独立の再試合、actor/spawn/弾/HP/インク/時刻の注入なし。
- 環境変数 T21_B407_ACTIVE_WAVES=1 の**研究CI限定**で、150/120/90/60/30秒に、その試合の実PLAYER入力 W→A→S→D と実マウス・主射撃を各1回組み込む。接地のSource solidとRapier足元を毎回読み、ワープ・架空の床・投射・Scoreableはゼロ。実CDPでのプレイヤー移動が物理的に観測できない場合はFAIL/HOLD。
- 新しい追加ショットと実ownerGridセル増分は分離（再び同じセルを撃った場合、追加弾があっても塗り面積が0の可能性あり）。直接CPU HP減少、撃破、150tick復活は本当のActor連鎖の証拠がなければ認証しない。
- B405の既存7チェックポイント、B337の本当のmouse/shot/paint、B405独立監査を保持し、さらにB407の5回の実入力を別JSONと独立監査でゲート。
- 実験は現状の **元高所床内のSOURCE入力統合** であり、未認証中央経路や対岸の自然な敵遭遇を主張しない。敵との距離が縮まず、実HP hit 0ならそのままHOLDとする。

## 安全・判定
25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸0/12、原作Ver.7.2.0 collision authority不足、activationReady=false、正式4v4/勝敗/ART/production HOLD。main/正式QA/T20/Draft PR #5/Pages/原作の非公開素材は不変更。

SOURCE変更なしの実操作統合コードとfail-closed unitをGitHub研究ブランチに保存。**真正ChromiumのPASSは同SHA Actionsの実行結果と原本artifactを照合するまでは未認証。**
