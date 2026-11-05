# Browser Ink TPS — F3実プレイ: 本物のCキーでA1へ原作床の塗装エリア移動指示 (B471)

## 方針と成果区別
F1〜F5／Fast Track、A1の実Rapier KCC、既存7CPU、原作SOURCE・原本・main・T19C/T20・Draft PR #5・Pagesを不変更。正式原作25 solids /17 PaintSurfaces /26 NavLinks /0 Scoreable、対岸自然経路0/12、公式勝者NONE、正式4v4、ART、公開すべてHOLD。

ユーザーが体験できる1つの機能として、SOURCE 180秒のA1協力モード中、真のPointer Lockを持つ人間のCキーから「A1を元の未塗装候補へ向かわせる」を研究実装した。A1は既存本物のCPUをそのまま使用。新しいNPC、得点、衝突、カプセル、NavLink、人工床、ゲーム時計、ペイントデカールを生成しない。

## 実装
- `src/app/B441OriginalSourceFrontline.ts`: b471MayRequestActualA1SourceOrder は元SOURCEの完全な25/17/26/0、Co-op RUNNING、実A1 rejoined ACTIVE GROUND、実人間生存接地・同側の真の足を照合する**入力許可だけ**。経路の認証はしない。
- `src/app/UndertowF3SourceTraffic.ts`: 実際のCキー要求だけを記憶し、既存A1 `patrolGoals` の実OwnerGridでNEUTRAL/OTHER_TEAMを優先する。現在のA1物理足から、元Rapier対応足・元Recastの0.20m start/end snap・0.30m刻み全経路元Rapier支持をその都度検証。許可時だけ実Crowd move targetを要求。900 native tickの期限・実足1.5m以内到達・異常時HOLD。
- `src/app/UndertowF3PlayablePreviewApp.ts`: 既存ユーザー選択A1 Co-op中のKeyC＋Pointer Lock＋PLAYING＋生存から入力を接続。既存実A1 HUDにREQUESTED/MOVING/ARRIVED/HOLDを表示。自動ペイント・公式得点・偽到達なし。
- `src/app/B441OriginalSourceFrontline.test.ts`: 不正モード／チーム／擬似座標／偽SOURCE／得点昇格の拒否テスト。
- `scripts/t21-w10b139-original-native-descent-rally.mjs`: 既存TRUE B162 co-op pilot の first READY-prearmed 7/7実CPU試合中に実CDPのKeyCを送信。元SOURCEと認証済みCrowd goal requestのみをRAW `b471-real-player-c-original-a1.json`へ保存。Actor/ink/clock/score書換0。既存 `.github/workflows/t21-w10b162-real-ally-sync.yml`を隔離ブランチで再使用し、専用workflow新設なし。

## 完了条件と実行状況
実装GitHubコミット: `f7c8fbe8927919995cfcf5cd8231ecdc2e5a56e4`、隔離branch `research/t21-b471-real-ally-source-order-20261105`。
真正Chromium [B162 #42032178320](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42032178320) を起動。2026-11-05 この文書作成時点ではqueued、**B471真正GOAL PASS未確認**。完了後Artifactから実キー受付数と同一native worldの実足・原作goal・移動要求を検証する。現時点で実CPUが目標到達・インク着弾したと主張しない。ゲーム本体の他要素や通常のB162正式PASSも、この試験だけで自動認証しない。

## 上位ブロッカー
B470既存実証は[真正B441/B448](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42028612732)まで。B413実180秒2試合（当時 #42025456079）と並行ソース選択UIの試験のため、main・正規研究HEADへの非force pushは本試行中保留。F4原作FloorLine00は元ゲーム衝突権限、7.2.0 Turf同版対応、半径0.30m CPU連続原作支持が未認証。橋/半径0/幻覚の敵/偽得点で解決禁止。正式4v4・勝敗はHOLD。

## 次の動作
1. 真正B471の型/単体/実CDP/RAWを確認。失敗なら本物の不足条件を一括で修正、閾値緩和禁止。
2. B413等の進行中runを保護。終了を確認後、並行コミットと最新HEADをdiffし、安全な非force leaseでまとめて研究ブランチへ統合。
3. 原作7.2.0の衝突・版・Actor正本を得るまではF4の橋/route昇格を保留し、SOURCE内部の真のプレイ機能を磨く。
