# B421 SOURCE CPU対CPU実物理間合いへの移動

本物のチームA/BのCPU足元が原作登録床の同じ側に来た場合に限る。旧実装は敵の現在foot座標そのものを移動目標にするが、この座標は生存CPUの物理カプセルに占有されている。これは追跡の終了位置として不適切。

新実装は `chooseB142OriginalAllyStandoff` の真正Recast経路2m手前のウェイポイントを敵CPUに適用。敵への既存の原作足元＋全経路審査に続き、提案地点そのものの元Rapier支持と、新目標への独立Recast経路全中間のRapier支持・始終点スナップ距離を再監査。安全な候補が存在しない場合は未認証目標を出さず既存の原作patrolを継続する。

これらは**動作改善であって実自然敵命中・撃破・復活の実証ではない**。原作25 solids、17 paints、26 NavLinks、0 Scoreable、自然対岸経路0/12、正式4v4・本番・ART・得点・勝敗はHOLD。研究branch限定、main/正式QA/PR#5/Pages変更禁止。新SHAの真正Chromium/単体テスト合否を最終CIで確認する。

## 2026-11-04 実run照合

- [B419旧 #41743828860](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41743828860) は **FAIL**。真正180秒TIME_UP tick11858、人間114shot/元1133cells、CPU143shot/元12326cells。保存RAWに実`REPLAY` UI表示有効と `clicked:false,boot:null`、ログ `B140_WAIT_TIMEOUT`。
- [B420旧 #41745041033](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41745041033) も**全体FAIL**。B326原作延長PASS、真正TIME_UP tick11856、人間114shot/元1066cells、CPU元11800cells。原因は同じB419後処理のEscape入力からpointer-lock解除待ち。従ってB420実武器経路のUnit/ビルド/事前PASSと、2試合目を始めたことは混同しない。
- B419 Headless UI解除フォールバックの新SHA `3abdf1c667eab1de5b09001770a21705a507b530` の [#41747779681](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41747779681)、B421実敵2m間合い実装SHA `71634b685ec9a151c17ab59c7bcd4a2b993c35ab` の [#41748022646](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41748022646) は最終CI確認まで**研究実装・認証HOLD**。実CPU敵との自然な交戦・HP減少・撃破・復活について成功報告禁止。


## B422 監査時の訂正と真正戦闘距離

- B419旧run #41743828860、B420旧run #41745041033 は、実TIME_UP後から `B140_WAIT_TIMEOUT` まで**それぞれ約100秒**。これは `until(newPage,100000)` と一致する。旧RAWの `clicked:false` はクリック後の即時保存がないため**クリック未送信の確定根拠ではない**。今回実CDPクリック直後に証拠を永続化し、クリック先上の真DOM elementFromPoint、ページの`performance.timeOrigin`、URL、READY、canvas有無を分離記録する。ゲームworld・原作NavLink・Actor・HP・タイマー・インク・Scoreableを変更する修正ではない。
- B418実 180秒 [#41741444484](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41741444484)、artifact `13281582246` の `b409-one-original-route-180s.json` **全7サンプル**より実の人間body(x,z)と敵チームB CPU foot(x,z)で水平距離をPython再計算。人間→最も近い敵CPUは 96.773〜98.592m、A CPU→B CPU最短は 97.594〜99.345m。これは「1試合目180秒7サンプルの実距離」であり、全tick/別runの最小距離ではない。実敵への命中0の主要説明は分断した原作SOURCEステージ（0/12自然対岸経路）で、旧B420/B421のAI改善がこの分断を解決したという主張は禁止。
- **次の大工程**はF4の原作Ver7.2.0ナワバリ版との地形照合と、既存の未認証SOURCE right-low→underpass の両岸±Z経路の物理衝突・CPU Recast capsule clearanceを解決すること。歴史的FloorLine00/FloorFence overlayで見かけの接続を捏造しない。原作25 solids/17 Paint/26 NavLinks/0 Scoreable、正式4v4・ART・本番HOLD。
