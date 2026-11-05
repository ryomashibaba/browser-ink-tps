# Browser Ink TPS — SOURCE PLAY Windows 1クリック起動（2026-11-05）

F3/F5：既存の本物のSOURCE 180秒プレイをユーザーが簡単に起動するためのローカル入口。F1〜F5およびFast Trackは変更しない。

## 起動
すでに手元にある研究branch `research/t21-b406-single-session-real-enemy-range-audit-20261103` のゲームフォルダ内で、**`PLAY_SOURCE_WINDOWS.cmd` をダブルクリック**するだけ。

このランチャーは同フォルダだけを使い、Node/npmが対応バージョンか検査する。初回のみ `node_modules/.bin/vite.cmd` がない場合にプロジェクト記載のnpm依存をインストール。毎回 `npm.cmd run build -- --base=/browser-ink-tps/` でゲームと3モード選択画面を新しくビルドする。完了後、Vite 7の正式な `preview --open` を利用して **`http://127.0.0.1:4173/browser-ink-tps/play-source.html`** を既定ブラウザへ開く。

- 「12武器180秒SOURCE」「A1実CPU協力」「敵CPU研究」の選択は既存のB384/B193/B207ゲームをそのまま使う。新規SOURCE・Actor・HP/Ink・時計・得点・Scoreableは作らない。
- Webサーバーは `127.0.0.1:4173` の**端末内限定**、port競合時は厳格に停止。GitHub/Pagesへのpush/merge/公開なし。有料API/Work/Computer Useなし。
- 操作を止めるときは起動したコマンドウィンドウを閉じる。ゲームはプロジェクトのローカルビルド `dist/` を参照する。公式4v4・勝敗を宣言するものではない。
- 注意：初回依存のインストールにはnpmレジストリへの通常のインターネット接続が必要。Node.js 20.19+/22.12+/24+がないと起動不可。Windowsのcmd.exeでの実実行まではGitHub Linux CIでは証明できないため、Windows固有動作は**未認証**として残す。
- ブラウザ内の日本語表示・原作のART受入は、Ubuntu CIの日本語フォント欠落により未認証。プレイヤーのWindows実表示での確認は将来のユーザー判断に委ねる。

## 検証契約
既存B441真正Chromium CIで同じVite `--base=/browser-ink-tps/` のSOURCEプレイページと3モードリンク、実7CPU原作ラウンドを検証。追加で `scripts/t21-source-play-windows-launcher.test.mjs` がWindowsランチャーのホスト固定・ルート・保護対象非変更を検証。Windowsで実行したと偽称しない。

厳格固定：原作25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸原作経路0/12、公式Winner NONE。main・T19C/T20・正式QA・Draft PR #5・Pages・activationReady=false・原作非公開ファイル保護。
