# T21 F3 — SOURCE 180秒ゲームへの独立プレイ入口（2026-11-05）

固定F1–F5 / Fast Trackの、ゲーム体験への直接の改善。研究ブランチ限定。**既存T20 index.html / InkLabAppは変更しない**。

- 新しい `play-source.html` は通常のゲーム入口を侵さない、Viteの第2HTML entry。Viteが示すプロジェクトURLの `play-source.html` を開けば、ボタン1回で既存の真正SOURCE専用180秒ゲームへ移動できる。
- MAINは既存のB384を再利用し12武器READY選択、実KCC/射撃/インク/再戦へ接続。対戦研究は既存B207を再利用し、敵の自然対岸移動やHP命中を保証しないと明記。
- 新しい物理・AI・ステージ・CPU・原作ファイル・得点・時計は**一切作らない**。既存URLビルダーの信頼できるフラグのみ使用。QA shortcutや任意クエリを引き継がない。実端末内の同一serverへ遷移。
- 既存B441真正Chromium runnerに、同じブラウザ内で入口の実画面CDPクリック/遷移URLとPNG採録を統合。既存CPU7本体テストに戻ってから元の全source KCC/foot基準を維持。別workflowなし。
- 正式4v4、対岸0/12、公式Scoreable0/winner NONE、ART、本番はHOLD。実画面の見た目は人間ARTの承認ではない。

検証：`src/app/SourcePlayPortal.test.ts` を既存のB441 Vitestへ統合し、2HTMLをVite buildの入力へ追加。新SHA CIの成功と実PNG/URLを確認するまで真正PASSは未認証。main/正式QA/T19C/T20/Draft PR #5/Pages・Work/Computer Use保護。
