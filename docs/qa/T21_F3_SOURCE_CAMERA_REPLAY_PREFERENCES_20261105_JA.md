# Browser Ink TPS — F3/F5 再戦をまたいだSOURCEカメラ設定保存（2026-11-05）

固定F1〜F5/FAST TRACKに従う既存SOURCE本物180秒ゲームの操作品質改善。元T20は変更しない。

- 元のSOURCE限定操作 `[`/`]`感度0.50〜1.75（0.25刻み）、`I`上下反転、`Q`肩替えを、このブラウザに保存。180秒試合終了後の**新しい原作SOURCE物理世界**でも復元する。
- `\`キーは感度1.0・上下非反転にリセット（従来と同じく肩位置は維持）。カーソルロック時の表示は実際のM=レーダー、N=音声に修正。
- Storageが拒否されるプライベートブラウザや改ざんデータでは保存値を拒否し、従来の動作を保つ。version1の4項目だけ厳格検査。T20カメラ・`t21QaInput=deterministic`は保存値を読まない。アカウント、課金API、ネット送信は行わない。
- 実Actor・CPU・Rapier・Recast・射撃・native clock・正式得点面・試合の公式結果には書き込まず、25/17/26/0と対岸0/12・正式4v4/ART/公開HOLDを維持。main・原本・正式QA・PR#5・Pages、Work/Computer Useを保護。
- テストは新codec Vitest＋既存カメラVitest、既存B441真正Chromeを再利用。新SHAのCIが終了するまでは真正PASS未認証。
