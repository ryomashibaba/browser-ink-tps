# T21 F3 — 任意CPU前線研究モードの本物のLIVE HUD（2026-11-05）

**実プレイ機能を前進させる工程。** F1〜F5/Fast Trackを固定し、正常な通常SOURCEプレイは変更しない。

## 実測と導入理由
[本物B441 SOURCE Chrome #41984824145](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41984824145) SUCCESS、[本物B448 #41984824168](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41984824168) SUCCESS。B441 RAW Artifact #13395258630では7CPU、原作25/17/26/0。実native source patrolはoriginal front goal proposals131件を点検し、厳格original+Recast候補6件・HOLD125件。これはCPUの対岸到達や命中の証明ではない。既存SOURCE PLAYから任意の「CPU前線行動も試す」ボタンが真正Chromium CDPでゲームを起動できることは証明済み。

## 今回の実ゲーム機能
- 任意 `t21W10B441=sourceFrontline` + `t21W10B448=realA3Front` + 真SOURCE fullRound/combatのときだけ、ゲーム画面の右下に小さい **CPU FRONTLINE** LIVE HUDを表示。通常の3つのSOURCEモードには一切表示しない。
- 読取データは元 `window.__t21F3.snapshot().cpu.sourcePatrol` にある本物のCPU7/7 ID、approved candidate、actual source goal requests、実検証済みfront goal arrivals、held unsupported/unreachable、A3 native requests。1600×900の実ゲームに通常のaim/physicsに干渉しない `pointer-events:none` で描画。元SOURCEの実world `STAGING`/`PLAYING`/`TIME_UP` とHOLDも識別。
- `REQUEST ≠ ARRIVAL`、`CROSS-TEAM ROUTES 0/12`、`UNSCORED` を明記。候補の存在を原作の対岸自然到達・HP命中・得点/勝敗と混同しない。
- **現進行中の長時間B413をキャンセルしないため**、Source/CPU/game本体やnative driverを変更せず、`src/main.ts` の既存SOURCE起動直後にread-only同タブHUDを追加。1秒間隔のnative snapshot参照、ページ離脱時タイマー解除。新しいCPU/Actor/時計/Ink/Path、サーバー通信、分析/保存、追加課金はゼロ。
- 既存B441真正Chromeのオプション本物CDPクリック後、ゲーム実native snapshotのoriginal SOURCE/support/runtime countersと実HUD DOMデータ値が一致することをチェック。B441元720 native tickの実CPU試験は別世界で継続。
- 新HEADのB441がSUCCESSするまでは、この新HUDのChrome PASSは未認証。元2×180秒実PLAYの合格履歴は過去SHA限定。正式原作4v4/ART/production/PagesはHOLD。main/T19C/T20/正式QA/PR5保護、Work/Computer Use事前承認。
