# 180秒SOURCE局所プレイ — B390確定実績と死亡中の表示改善
2026-11-01 JST / 対象: `dev/t21-f4e103w-qa-infra` のみ。

## B390 正式な限定技術実測（前工程の未確定事項を解消）
- GitHub Actions [#41271399268](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41271399268) の `native-b384-user-round` ジョブ、真正Chromium 180秒終端・同武器新世界リプレイの全ステップ SUCCESS。
- 元SHA `85f1da1d782132b525c6e93a2c956c76a2d25fd2`、artifact `b390-genuine-selected-180s-source-round`（ID 13069673491）。当該SHAの限定証拠であり現行HEADでの再実走行を意味しない。
- 本物の180秒TIME_UP: native tick 11,855（開始はtick 1,055付近）、人間Twin Comets 94発/塗装397セル、CPU605発/塗装13,376セル、7/7実物理復帰、局所3/3達成履歴1件、実死亡・復活0/0。終了画面00:00、公式winner NONE、Scoreable 0。
- 実ボタンから同武器を引き継いだ**新規** SOURCE世界の STAGING tick0、180秒、全射撃・塗装・歴史的達成の初期化を確認。時計・Actor・位置・塗装の書込なし。
- B390は「実180秒 SOURCE練習 + リプレイ」限定PASS。自然敵接触・HP撃破・実死亡/150tick復活・公式ナワバリ勝敗・全域の原作連結・ART/公開の認証ではない。

## 今回の遊びやすさの改善
- B371の既存 PLAYER用現命案内で、局所3/3後も元の180秒を続けて遊べる旨を明示する。終了後に続行案内を出さない。
- 本物のHP-zeroフレームで、仮に前のCLEAR値が一時残っても画面の現在命を `RESPAWN 0/3` に切り替え、過去CLEARを新しい命へ持ち越したように見せない。生存復帰/リセットはB186/B391の既存本物60Hz状態だけが決める。新たなHP操作・復活Tick短縮は行わない。
- 型・表示の純粋関数テストを追加。これだけでは**真正Chromium死亡→復活 PASSにならない**。現行HEADのCI結果と実ブラウザは別途証拠が必要。

## 不変条件と次のまとまった工程
25 solids / 17 PaintSurfaces / 26 source NavLinks / 0 Scoreable、敵陣自然経路0/12、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。正式4v4・ART・main/Pages/PR#5変更は禁止。

次は既存B390・B391証拠を一つの真正プレイ体験に統合して **人が操作した移動・自然な敵の可視性と射撃・180秒全体・復活導線**を点検する。自然な敵遭遇/原作根拠がない場合はその部分のみ SOURCE_AUTHORITY HOLD とし、架空のActor・床・NavLink・得点を生成しない。QAを番号ごとに細分化せず、新規ワークフローを作らない。
