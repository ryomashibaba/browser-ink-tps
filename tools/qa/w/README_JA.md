# F4E103W2 — 常設QA・決定論的KCC計測

ブランチ: `dev/t21-f4e103w-qa-infra` (非本番・非デプロイ専用)。2026-10-17。

## 変わらない原則

- 正本 `Downloads/T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff` を絶対に上書きしない。原作の真正な穴を推測で埋めない。
- frozen 権限は 25 solids / 17 paint / 26 nav / 0 scoreable のまま。
- 手入力・ゲーム物理を変更しない。QA限定でPlayerInputへ方向入力を渡すが、本物のRapier KCC・CPUと60Hz固定ステップを使う。
- Userの明示許可なしにGitHubへの本番変更、非公開アセットや結果のアップロード、Workの使用をしない。

## 初回1回（すでにW登録済みなら不要）

Windows PowerShellでユーザーのGitHubからbootstrapを取得し登録する:

```powershell
$p = Join-Path $env:TEMP 'inktps_qa_bootstrap.ps1'
Invoke-WebRequest 'https://raw.githubusercontent.com/ryomashibaba/browser-ink-tps/dev/t21-f4e103w-qa-infra/tools/qa/w/bootstrap.ps1' -OutFile $p
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p
```

常設ファイルは `%LOCALAPPDATA%\InkTPS-QA\RUN_INKTPS_QA.cmd`。

## 以後の操作

- `RUN_INKTPS_QA.cmd` ダブルクリック：**読み取り専用の接続・正本不変チェック**。実ゲームの計測は起動しない。
- `RUN_INKTPS_QA.cmd run`：**隔離Q+Uビルド → W2 QA入力パッチ → 再ビルド → ChromeをPointer Lockなしで起動 → 2ルート実KCCとCrowd代理位置を記録**。通常ゲームの物理と安全停止は維持。
- 結果：`%LOCALAPPDATA%\InkTPS-QA\F4E103W_LAST_REPORT.json`（固定）。詳細ログは `runs/w2-*/F4E103W2_LOCAL_TRACE.json`。
- 再実行時にGitHubのマニフェストにあるSHA-256と一致するコードだけ更新。以前のVキットはビルド診断部品として再利用するが、Pointer Lockを要求するVのブラウザー自動歩行は呼び出さない。
- Windows正本の元のnode_modulesを依存関係として使う。Vキットの展開済みフォルダーは当面必要だが、**今後新しいZIPの展開は不要**。

## 検証レベル

GitHubのWindows/Linux CIで、実コードの型チェック・ビルド・QA入力テスト、歴史的ソースに対する隔離パッチのゲートとSHA-256を検証する。CIには非公開Windows正本がないため、ローカル実測のPASSとは区別する。

初回Windows実行はまだ未検証。ソース文字列差異、ChromeやWebGL2不可、予期せぬCrowd安全停止などはHOLDとしてローカルに結果を残す。**床抜けが治ったという意味ではない。**

## 現時点の効率改善と未実装

ZIP再配布廃止・同じ起動ファイルを継続・更新差分取得・Pointer Lock解除済みQA設計・安全な実KCCログ。まだ結果をクラウドへ自動転送する仕組みはない。非公開の診断ログを公開GitHubへ自動アップロードしない。

今後は正本との差分を見ながら初回Windows実測を確認し、成功したら隔離ビルドの重複処理・キャッシュ・ログ共有を最適化する。実測に基づくまでマップ変更を進めない。
