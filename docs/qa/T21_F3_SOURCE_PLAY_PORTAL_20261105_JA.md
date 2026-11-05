# T21 F3 — SOURCE 180秒ゲームへの独立プレイ入口（2026-11-05）

固定F1–F5 / Fast Trackの、ゲーム体験への直接の改善。研究ブランチ限定。**既存T20 index.html / InkLabAppは変更しない**。

- 新しい `play-source.html` は通常のゲーム入口を侵さない、Viteの第2HTML entry。Viteが示すプロジェクトURLの `play-source.html` を開けば、ボタン1回で既存の真正SOURCE専用180秒ゲームへ移動できる。
- MAINは既存のB384を再利用し12武器READY選択、実KCC/射撃/インク/再戦へ接続。対戦研究は既存B207を再利用し、敵の自然対岸移動やHP命中を保証しないと明記。
- 新しい物理・AI・ステージ・CPU・原作ファイル・得点・時計は**一切作らない**。既存URLビルダーの信頼できるフラグのみ使用。QA shortcutや任意クエリを引き継がない。実端末内の同一serverへ遷移。
- 既存B441真正Chromium runnerに、同じブラウザ内で入口の実画面CDPクリック/遷移URLとPNG採録を統合。既存CPU7本体テストに戻ってから元の全source KCC/foot基準を維持。別workflowなし。
- 正式4v4、対岸0/12、公式Scoreable0/winner NONE、ART、本番はHOLD。実画面の見た目は人間ARTの承認ではない。

検証：`src/app/SourcePlayPortal.test.ts` を既存のB441 Vitestへ統合し、2HTMLをVite buildの入力へ追加。新SHA CIの成功と実PNG/URLを確認するまで真正PASSは未認証。main/正式QA/T19C/T20/Draft PR #5/Pages・Work/Computer Use保護。

## 2026-11-05 既存A1協力ゲームとモード復帰動線（新CI確認待ち）

- 入口3モードは既存B384（12武器SOURCE原作回路）、B193（真正味方A1 ALLY_SYNC協力）、B207（自然敵遭遇未認証の対人研究）の**既存ゲーム経路**。物理Actor・ステージ、CPU攻撃、公式得点は追加していない。
- 元の180秒SOURCE STAGING/PAUSED画面からモード選択へ戻る。実TIME_UP後のみ結果画面からモード選択へ戻る。現在の世界のCPU移動やNative Tickを書き換えず、新規原作SOURCEセッションを明示起動する。
- 同じB441 Chromiumでブラウザ内の3つのURLと既存真正7CPU SOURCE READY画面のボタンを点検。真TIME_UP結果画面での押下は、長時間の独立真正検証前にPASS扱いしない。main、T19C/T20、正式QA、PR#5、Pages、本番は変更しない。
