# Browser Ink TPS — F4E103W 常設QA（初期版）

対象ブランチ: `dev/t21-f4e103w-qa-infra`。公開ゲームの本番コード・マップ・CPU挙動は変更しません。

## 初回だけ

Windows PowerShell に以下を1回貼り付けて実行します。取得先はユーザー自身のGitHubリポジトリです。

```powershell
$p = Join-Path $env:TEMP 'inktps_qa_bootstrap.ps1'
Invoke-WebRequest 'https://raw.githubusercontent.com/ryomashibaba/browser-ink-tps/dev/t21-f4e103w-qa-infra/tools/qa/w/bootstrap.ps1' -OutFile $p
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p
```

インストール先: `%LOCALAPPDATA%\InkTPS-QA`。常設起動ファイルは `RUN_INKTPS_QA.cmd`。以降は同じファイルを使い、新しいZIPを展開しません。

初回と以後の起動時、GitHubの `manifest.json` を照合し、実行プログラムのSHA-256を検証して変更部分だけ取得します。更新ネットワークが失敗しても、検証済みキャッシュのみを使用します。

## 操作と安全性

- `RUN_INKTPS_QA.cmd` — プロジェクトと旧Vキットの存在確認・重要ソースのチェックサム計測のみ。Chromeやゲームは起動しません。
- `RUN_INKTPS_QA.cmd run` — 明示した場合のみ、以前のF4E103Vの隔離ビルド・Chrome実測を実行します。**Pointer Lockの問題は未修正なので失敗し得ます**。通常はまだ使用しないでください。
- `RUN_INKTPS_QA.cmd self-test` — 内部簡易検査。
- 最新結果: `%LOCALAPPDATA%\InkTPS-QA\F4E103W_LAST_REPORT.json`。

初期版は `Downloads\T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff` を正本、`Downloads\BrowserInkTPS_F4E103V_Crowd_Stage_Hotfix` を直近の既存キットとして検出します。

## 実装済み

永続ランチャー、GitHub更新のSHA-256照合、オフラインキャッシュ、安全な分離パス検査、読み取り専用の事前検証、隔離V診断への任意接続、元ファイルSHA照合、固定パスの結果JSON。

## 未実装・HOLD

**重要:** 自動Driveアップロード、毎回の自動GitHubコミット、GitHub Pagesへの開発ゲーム同期、Chrome Pointer Lockを使わない真の歩行計測、実Windows環境での動作検証はまだ完了していません。GitHub ActionsのCIは公開ソースだけを検証し、ユーザーPC内のゲームは触りません。

原作Actor配置、真の歩行可能領域、床の正当な穴は未認証です。原作床・コライダー・塗装・ナビゲーション・得点面への変更は全面HOLDです。

## 守る境界

ゲーム正本への書込み不可。非公開原作アセットをGitHubや外部クラウドへ自動送信しない。公開リポジトリへローカルJSON・ファイルパスをプッシュしない。ソース側の安全停止を無効化しない。更新は専用QAブランチのみ。
