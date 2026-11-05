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

## 2026-11-05 実機RAW追補（B471 core SUCCESS／B200 keyboard replay HOLD）
- [真正Chrome #42035150903](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42035150903) は **workflow全体は FAILURE**。ただしRAW Artifact #13419705351 の `b471-real-player-c-original-a1.json` は本物のCDP KeyC=1、nativeTick 1178→1190、A1原作Goal厳格承認1、native Crowd goal要求1、拒否0、actor/ink/score/clock書換0を示す。承認時のA1実足 [2.51857,3.17431,50.90491]、承認された原作目標 [0.31075,3.10,56.45383]、実機ステータス MOVING。実際の着弾・命中・公式勝者をこのgoal要求から推定しない。
- 同じ本物の試合でB162 A1協力は **CLEAR**：人間808 changed cells、A1が実39 changed cells、接地移動35.55m。さらに**二度目の独立A1協力もCLEAR**（人間808/A1実57、接地移動35.76m）し、クリックによる新ワールド移行は確認。B200の**その後のキーボードによる再戦移行でB140_WAIT_TIMEOUT**（参照: `w10b200-real-replay.json`）となったため workflow全体は SUCCESSではない。既存B200とB471は別ゲートとして管理。
- 実A1足はB471目標承認tick1178 [2.51857,3.17431,50.90491] → 後続真正B163ログtick1298 [0.70249,3.10,55.30735] と4.76m移動し、承認Goalまで水平/3D約1.21mへ接近。ただしその観測だけでは B471内部の真の到着カウンタや完全な連続カプセル経路の合格を宣言しない。
- [新しい隔離B471単一協力試験 #42038173618](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038173618) はB200を**隔離ブランチの試験設定だけ**無効化して、本物のKeyC + 最初のB162協力CLEARを独立検証中。正式なB200再戦試験・原作者性は変更なし。
- 統合候補 `f0c8ad90beff35186fb8b71a2060cafc13ffd0ad` は現行B470＋新OwnerGrid ranker上へB471コードだけを適用し、正式ワークフロー変更なし。既存B441 fast gate [#42037692550](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42037692550) は **SUCCESS**。ただし正規研究branch上で並行B413の長時間実機試験が走っている間はpush禁止。

## B471単独真正Chromiumの最終PASS（2026-11-05）
- [隔離B471 #42038173618](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038173618) **completed / SUCCESS**。元のB162既存真正Chromiumをそのまま使い、B471隔離branch限定でB200の後続キーボード再戦検証を分離した。B200の正式QA自体は変更・解禁していない。
- RAW Artifact [#13418584735](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038173618/artifacts/13418584735) `b471-real-player-c-original-a1.json`：本物のKeyC 1回、厳格認証原作Goal 1件、実Crowd goal request 1件、原作以外のActor/インク/Score/Clock書換0。Goal [0.3107475,3.10,56.453831]、A1実足 [2.51857,3.17431,50.90491]、1190 tick時点の状態は MOVING。
- 同じ試行の `w10b162-real-ally-sync-practice.json` は `B162_NATIVE_60HZ_GENUINE_COOPERATIVE_CLEAR`：人間実塗装808セル、A1実塗装38セル、実接地移動37.04m、公式勝者NONE、元SOURCE 25/17/26/0。不正な架空の対岸移動・撃破・勝利は0。
- この試行の真のブラウザ画面 `W10B162_GENUINE_ORIGINAL_COOPERATIVE_CLEAR.png` にはB471 A1指示HUDの **ARRIVED** 表示が残る。ただし到着カウンタそのもののRAW書き出しは未実装で、連続全身カプセル経路の独立認証や公式敵遭遇の証拠とはしない。
- 正規研究HEAD上のB413長時間真Chromeと並行開発を保護するため、B471本線pushは本記録時点 **未実施**。現行B470＋実OwnerGrid rankerを含む統合候補 `9cd37a6f07b580f7f48de43af712cfc56590b5f3` は別branch `research/t21-b471-ready-20261105` に保存。最新並行差分確認後の非force統合が必要。対応する組合せTypeScript/Vitest/build [fast #42037692550](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42037692550) は SUCCESS。
