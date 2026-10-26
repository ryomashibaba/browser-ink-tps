# GPT-6.1 Sol / low — SOURCE center-ray combat aiming

2026-10-27 JST. Comparison branch: `experiment/gpt-compare-20261027-sol-low`.
Base: `39ba2accd59f2f4e99b19a5fc1732f40739612da`.
Gameplay implementation: `6a6cd41cc5ac9577c0a4a6f19d216a135c05a352`.
Model and effort were read from this session's `turn_context`: `gpt-6.1-sol`, `low`.
Only the pinned base was fetched; no other model branch or ordinary development update was read.

## 実装と原因の切り分け

`ThirdPersonCamera.getAimTarget()` はPaintSurface / Rapier stage solid / 80m fallbackのみを選び、CPUの実hit volumeを調べていなかった。
したがって画面中央の敵を捉えていても、その奥の地面や空の距離で銃口のパララックスと重力補正が計算される。
今回、選択された180秒SOURCE戦闘でのみ、`CpuAgentSystem.findNearestCombatHit()` をカメラの既存中央レイに接続した。
床・壁より手前の実交点に射撃する。照準角度の吸着、候補範囲拡大、敵配置変更、hit volume追加、HP書き込みは行わない。
ProjectileSystemは従来どおり銃口から実弾を飛ばし、世界遮蔽とActorの距離を比較して実ダメージを決める。
プレイヤーには「中央で捉えた敵の距離で射撃する」という利益がある。B243のHUD作り直しではない。

これは敵視認0の原因とは別である。実SOURCE試合では視認用の原作stage ray自体が0。
`chooseB181OriginalSourceSight()` は実Actorの水平32m / 高度差2.4mを満たした候補にのみレイを発行する。
取得位置では両チームが別の自陣セクターに留まり、32mの範囲外だった。
未認証の対岸接続を補うことはしていない。自然遭遇、自然な敵への照準改善効果はHOLD。

## 検証

- TypeScript + Vite production build: PASS（既存chunk-size警告あり）。
- 既存B75のVitest一覧 + 新照準 + 実CPU/Projectile/HP + 入力回帰: **51 files / 232 tests PASS**。
- 新規6テストは中央レイ、味方/死亡/レイ外除外、cover優先、実原作Rapier slab、実ProjectileのHP適用を確認。
- 明示的UNIT配置で旧方式はHP100・命中0、新方式はProjectileSystem経由で1命中。自然遭遇の証明ではない。
- Node B134/B135/B179/B80等: 合計15 PASS、B131の1件のみFAIL。
- B131 FAILはWindows checkoutのCRLFに対し `permissions:\n  contents: read` を検索する既存判定。対象test/workflowは共通ベースとgit上で同一、LF正規化で当該条件は成立。テスト無効化・閾値緩和・改行修正はしない。

共通ベースの指定Actionsを実際に照合:

- [B75 success](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40404097277)
- [B15 success](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40404097352)
- [B162 failure: B140_WAIT_TIMEOUT](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/40404097487)

全てbase SHA。今回の新規回帰として扱わない。比較ブランチのActionsは起動していない。
ローカル実Chromiumと既存軽量ゲートを使用し、新CIワークフローは作成しなかった。

## 実Chromium計測

Windows / Chrome / WebGL2 / SwiftShader / 1600x900。
ローカルURL:
`http://127.0.0.1:4197/browser-ink-tps/?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B192=humanCombat&t21W10B112=humanGround&t21W10B203=fullRound`

`node scripts/compare-sol-combat-browser.mjs after` で再現可能。ChromeパスはWindowsローカル用。
CDPの実STARTクリック、Pointer Lock、W移動と左ボタン射撃、P停止、実ボタン再開、以降静止で7CPUと試合時計を観測。
APIでのActor移動・HP変更・Tick注入はない。選択した試合のREADYはtick0 / 180sで停止。

初回ベース試行はマウス移動/前面化不足、次は再開イベント待機不足で停止した。
後者はtick74 / STAGING / 180s / HP100 / 敵視認0 / 直接命中0までの部分証拠であり、180秒baselineではない。
待機を修正した変更後測定だけを完走確認に用いる。前後で同一180秒測定が揃わないため改善率は算出しない。
初期テスト実行のサンドボックスEPERM、および新テストのRapier初期化をDOMスタブ後に行った失敗は修正済み。

計測結果・スクリーンショットはローカル `artifacts/before/` と `artifacts/after/` に保存し、Gitには含めない。
公開/非公開原作データを新たに取得・アップロードしていない。

### 終了時の実測（ローカル最新JSONと実画面を照合）

| 指標 | 共通ベース | 今回の180秒SOURCE |
| --- | --- | --- |
| 敵視認 / 真正な人間直接命中 | 提示baseline 0 / 0。ローカル部分試行も0 / 0 | **0 / 0** |
| 完走 | 指定B75は限定セッション。ローカルbase試行はSTAGINGまで | **TIME_UP / 残り0秒 / tick11857** |
| CPU再合流 / 射撃 / changed impact cells | 同条件180秒は未計測 | **7/7 / 808 / 19,808** |
| 人間射撃 / changed impact cells | 同条件180秒は未計測 | **7 / 262** |
| 最終人間HP / CPU combat hits | 同条件180秒は未計測 | **100 / 0** |
| 人間の始終点水平変位 | 同条件180秒は未計測 | **2.753m**（歩行距離ではない） |
| 最終CPU両チーム最短水平距離 | 同条件180秒は未計測 | **100.077m** |
| 最終人間→敵最短水平距離 | 同条件180秒は未計測 | **114.232m** |
| Actor relocation / Scoreable | 0 / 0 | **0 / 0** |

視認用stage rays / cover rejectsは最終時点でも **0 / 0**。現在の射撃・塗装活動と敵遭遇を混同しない。
全フレームの最短敵距離、全フレームHP最小値、CPU→人間のhit counter単独値は未計測。
終了JSON `artifacts/after/latest.json`、実終了画面 `artifacts/after/failure.png` を確認した。
ファイル名failureはランナーの誤判定に由来する。実画面はSESSION COMPLETE / 00:00 / NO TURF WINNER。

ゲームはTIME_UPで正常にpaused=trueとなるが、ランナーがTIME_UP判定より先にpauseをエラー扱いしたため、
**この実Chromiumランナーの終了コードは1**。ゲーム180秒完走確認とランナーPASSを分ける。
保存済みterminal JSONに対し、TIME_UP・0秒・stopReasonなし・25/17/26/0・relocation0・production/4v4 falseを再検証しPASS。
ランナーはTIME_UPを先に判定し、途中controls/samplesを逐次保存するよう修正、構文確認PASS。
修正版ランナーでの再180秒実行は未実施。途中サンプル配列が保存前に失われたため、全サンプル最小距離は報告しない。

ブラウザ再試行は上記環境/待機/終了分類の手戻り。実ゲーム側の再修正は行っていない。
新テストのRapier初期化をDOMスタブ前に移す手戻りもあった。最新テストは全232件PASS。
作業経過は約50分（中断を含む）。純実作業時間・タスク固有費用は未計測。
22:29 UTC取得の共有アカウント使用量は5時間枠45%使用、週枠33%使用。タスク単独の消費率ではない。
同時点のセッション累積は input 5,101,403（cached 4,956,032）、output 18,300 tokens。
これは反復コンテキストを含む記録値であり請求金額ではない。最終累積値は未計測。

## 認証範囲

25 solids / 17 PaintSurface / 26 NavLinks / 0 Scoreable、対岸経路0/12を維持。
正式4v4、得点、勝敗、productionはHOLD。main / 通常開発 / Stable/T20 / Pages / Draft PR #5は変更なし。
採用価値: 既存hit volumeを共有する距離に忠実な射撃照準。自然遭遇を認証するまでは効果の実戦評価をHOLDとする。
