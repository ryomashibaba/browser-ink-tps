# Browser Ink TPS — B470巡回＋B471実CキーA1＋B472四モード統合（2026-11-05）
## 実装と目的
固定F1〜F5 / Fast Track変更なし。正規研究ブランチ最新 `3a601c4da00ae2314cfa137eb84467838e618b05` とB471 ready `27cfca2adfa2dfdfeeae9ad1c625fa4ec4bf56b5` の共通祖先はB472真正ゲーム実装 `88867be1`。正規B472のドキュメントと武器機能を親に残し、B471 readyからSourceTraffic・PlayablePreviewApp・Frontline gate/test・Chromium scriptの変更を統合した。B470は共通実装から継承。単なる計画ではなく、1つのSOURCEゲームで選べる四モード武器＋A1実C入力＋同側CPU巡回が同居するコード状態を保存する。
## 証拠の区別
- 統合前のB470本物Chrome B441/B448：成功（別SHA）。
- 統合前のB471単独実CキーB162 #42038173618：成功（別SHA、B200正式再戦は未成功）。
- 統合前のB472四モード選択B440 #42038865662、B441 #42038865792、B448 #42038865783：成功（共通祖先SHA `88867be1`）。
- B471＋B470＋B472軽量 gate #42039715852：TypeScript / Vitest / build SUCCESS（別隔離SHA）。
- **本統合SHAの真正ChromiumとRAWはCIを直接確認するまで未認証**。既存の短時間B441と実C入力のB162の2ワークフローをこの隔離branchのみ追加トリガー。後者は既知のB200キーボード再戦TIMEOUTがB471コア判定を隠さないよう、隔離branch限定でB200=0、B471=1とする。正規ワークフローの既存branch条件は保持。
## 完全保護
研究SOURCE 25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable、不認証自然対岸0/12、元Rapier/Recast/Actor/Ink/Clock改変なし。main、原本、T19C/T20、正規研究進行中CI、正式QA、Pages、Draft PR #5 は変更しない。公式Winner NONE、正式4v4・ART・公開HOLD。追加課金0、Work/Computer Use不使用。
## 判定
真正Chrome結果が揃うまでTECH PASSは**HOLD**。A1実CキーとB441実足/選択を同一統合SHAで個別認定しても、自然な敵対岸・公式得点・正式ゲーム完成を意味しない。既存の2×180秒B413は元の正規研究旧SHAでのみ判定し、この統合SHAへ流用しない。
