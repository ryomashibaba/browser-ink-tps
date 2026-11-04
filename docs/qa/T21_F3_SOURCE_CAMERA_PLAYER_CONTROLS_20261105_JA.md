# Browser Ink TPS — F3 実プレイヤーカメラ操作の統合（2026-11-05）

## 機能と範囲

既定の F1→F5 Fast Track に従う **F3/F5の操作性改善**。マイクロQAや原作経路の偽解除ではなく、実プレイヤーが真のSOURCE原本試合で操作するカメラの選択肢を追加する。

- 既存 `[`/`]`：実ユーザーがSOURCEモードでマウス感度0.50〜1.75倍を0.25刻みで変更。
- 新規 `I`：上下マウス操作の反転を切り替える。真のカメラ視点だけで、Actor・弾道補正・照準補助や物理は変更しない。
- 新規 `\\`：感度1.00倍・上下通常方向に戻す。
- 既存 `Q`：左右ショルダー切替。カメラ調整時だけ短い非インタラクティブ操作通知を画面内に表示（スクリーンリーダー用`role=status`）。
- SOURCE practiceでのみ有効、実canvas pointer lockなしではキーを無視。T20通常カメラ、CPU、経路、Rapier、Recast、25 solids／17 paint／26 nav／0 scoreable、公式勝者 NONE を維持。

## GitHubで保存した実装

- [プレイヤー操作本体 ce6b613](https://github.com/ryomashibaba/browser-ink-tps/commit/ce6b6132ef1ac09c69758af7f651391811811f5d)：`src/camera/ThirdPersonCamera.ts`。
- [実Chromium試験への結線 771e815](https://github.com/ryomashibaba/browser-ink-tps/commit/771e8151501f6badc653f5e5b90be531b750a2ff)：既存`scripts/t21-b440-short-native-original-foot.mjs`の本物CDPに、実キー`BracketRight`→`KeyI`→`Backslash`を通して、同一ブラウザ世界・既存native snapshot・実DOM表示・スクリーンショットを検証する工程を追加。後続B441/B454毎tickの足観測はそのまま。
- [単体試験 304a735](https://github.com/ryomashibaba/browser-ink-tps/commit/304a7352b394ada6e91e9bc2daee43f8f2910cdf)：`src/camera/ThirdPersonCamera.test.ts`。SOURCE opt-in・デフォルト不変更・pointer lock・入力/復元/通知をテスト対象にする。
- 実ブラウザArtifact予定：既存B441短時間ジョブの `b440-short-real-original-human-foot.json` に`realPlayerCameraControls`、さらに `source-camera-inverted-real-chromium.png` を保存。独立QAジョブ/長時間試験は新設しない。

## 認証状態：実装保存≠真正PASS

本文作成時点は **IMPLEMENTED / CI RESULT NOT YET VERIFIED**。新コードSHAの実ビルド・Vitest結果・真正Chromium結果は、GitHub Actionsの実ジョブとArtifact確認まではPASSを宣言しない。結果を確認して不具合があればこの研究ブランチだけで修正する。スクリーンショットの生成成功とART合格も区別する。

従前の本物B454 [#41914034454](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41914034454)、通常B440 [#41914034459](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41914034459)、A3 B448 [#41914034505](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41914034505) は旧コードSHA `e156f0e` に限りSUCCESS。新SHA 2×180秒 [#41914034445](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41914034445) は2026-11-05 06:XX JST再照合時点で **IN_PROGRESS・Artifactなし**。これを遡及的PASSにしない。

## 未変更・次の中核目標

原作の真の自然対岸0/12、B2/B4原本経路・全身KCC支持、自然敵HP命中、原作Scoreable、公式勝敗、ART、production、正式4v4は **HOLD**。元0.25m支持基準とCPU半径0.30mを緩めず、架空の床・NavLink・ワープを作らない。main・正式QA・T19C/T20・Draft PR #5・Pagesは無変更。Work/Computer Useは事前個別承認。

次は最新SHAの短時間真正結果を確認し、次の**まとまった実プレイ機能**としてF3の自然な実戦／実HUD・操作・インクのプレイ性を拡大。F4の原作7.2.0 Collision/Face接続の認証ができない部分はその範囲のみHOLDする。
