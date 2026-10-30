# B131 — GitHub Actions 起動条件の集約（2026-10-23 JST）

目的：少しの `UndertowF3PlayablePreviewApp.ts` 変更で、歴史的な単独ブラウザ試験が **24ワークフロー同時起動**した問題を解消し、Plusの使用量だけでなくGitHub Actionsの無駄と検証遅延を削減する。

## 変更範囲

- QA `dev/t21-f4e103w-qa-infra` のみ。
- **19の歴史的専用ワークフロー**から、共有 `src/app/UndertowF3PlayablePreviewApp.ts` と自身のワークフロー定義ファイルを `push.paths` から除外。19件のファイルを削除・無効化したわけではない。**関連する元のスクリプト、専用ソース、専門テストのpush、および `workflow_dispatch` の手動実行は維持**。
- 総合安全網として、統合B75（型チェック＋ビルド＋B129/B130/HUD Vitest＋本物のChrome FIXED/SWEEP）、元のF4E103W QAランチャー（OS別＋型チェック）、B112の真のRapier床接地、B120の元原作床ポリゴン実キー試験は **共有App変更時の自動トリガーを維持**。
- B75に `node --test scripts/t21-w10b131-trigger-matrix.test.mjs` を追加。上記19+4のファイル群、手動復旧経路、元のブラウザ・型チェック回帰をコードで監査。
- 常時 `meta/t21-continuity` が別ブランチの状態情報を更新（ゲームQA認証ではない）。通常のアプリ更新で起動するワークフローは **24→5（4実検査＋Continuity）を目標**。これはトリガー静的監査に基づく想定で、次のアプリ変更commitで実数を確認すること。

## 背景・判定

B130の元HEAD `2cd35b10bc37c58cb5aebce99cd7ebbb466b2a0c` で作成した [B75 Actions #39948017109](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39948017109) はB131開始時点で **queued**。その時点では専用B129/B130 Vitest、実物ChromeをPASS認定しない。

短縮するのはCIの重複発火であり、原作の検証条件・閾値ではない。元原作25 solids、17 paint、26 navigation links、0 scoreable、相手陣自然経路0/12、`activationReady=false`、`productionAuthorized=false`、正式無制限4v4 HOLD。main/Pages/Draft PR #5、Windows原本は変更禁止。

## 運用

通常のF3アプリ改善：B75＋QA＋B112＋B120で回帰。旧B14/B15/B21/B51/B54/B56/B57/B59/B64/B68/B69/B70/B86/B96/B99/B100/B107/B124/F3Gの対象部分を直接変更した場合は、その専用ワークフローで検査。単独で再現・検証したい場合は該当の `workflow_dispatch` を利用。CIが未終了ならユーザー報告ではHOLD/queuedと表記する。


## 2026-10-30 B352実測に基づく再集約
B351 commit `5782f494` は18本のActionsを自動発火。B131の旧19本の整理後に、後発の領域専用CIが共有 `UndertowF3PlayablePreviewApp.ts` と `ProjectileSystem.ts` を広く購読し、CI扇状発火が再発していた。

今回12本の**旧・領域別専門CI**について、一般的な共有アプリ/射撃実装の変更だけでは起動しないよう整理。専用領域のコード・スクリプトのpushトリガー、手動 `workflow_dispatch` は維持。変更されたYAML自身で無駄に旧検査を再起動しないよう自身のpush pathも除外。B131静的検査にB352回帰を追加。

維持する自動統合網: B75真正Chrome、F4E103W、B112/B120 KCC原作床、B349 projectile source witness、元のSOURCE gameplay統合検査。**テストの閾値・本体・認証は変更せず、消したのは過剰な自動起動だけ。**実際の新HEAD発火本数と成功は別途CIの実測を確認するまで未認証。

B350 CI [41059504859](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41059504859) の単体テスト失敗は、負のテストfixtureで `nativeShooterLaunches.worldPosition` と `physicalWitness.events.worldPosition` が同じJS配列を参照していたことによる偽陰性。片方の値を変えると両方変わるため `Missing expected exception`。B352で２つの独立した配列に修正、両方向の改変を負検査へ追加。真正Chromium含むB350 PASSは新CIが終わるまで主張しない。

B351追加の型チェック・負検査・ビルドは [41060649046](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41060649046) SUCCESS。しかし敵CPUへの自然な人間射撃命中と命中音/エフェクトの同時記録は未実証。別件A1協力試験 [41060648940](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41060648940) は `B140_WAIT_TIMEOUT` で失敗、原因と再現性は未確定、HOLDを維持。
