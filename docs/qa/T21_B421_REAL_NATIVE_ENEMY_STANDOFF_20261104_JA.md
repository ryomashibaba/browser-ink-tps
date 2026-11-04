# B421 SOURCE CPU対CPU実物理間合いへの移動

本物のチームA/BのCPU足元が原作登録床の同じ側に来た場合に限る。旧実装は敵の現在foot座標そのものを移動目標にするが、この座標は生存CPUの物理カプセルに占有されている。これは追跡の終了位置として不適切。

新実装は `chooseB142OriginalAllyStandoff` の真正Recast経路2m手前のウェイポイントを敵CPUに適用。敵への既存の原作足元＋全経路審査に続き、提案地点そのものの元Rapier支持と、新目標への独立Recast経路全中間のRapier支持・始終点スナップ距離を再監査。安全な候補が存在しない場合は未認証目標を出さず既存の原作patrolを継続する。

これらは**動作改善であって実自然敵命中・撃破・復活の実証ではない**。原作25 solids、17 paints、26 NavLinks、0 Scoreable、自然対岸経路0/12、正式4v4・本番・ART・得点・勝敗はHOLD。研究branch限定、main/正式QA/PR#5/Pages変更禁止。新SHAの真正Chromium/単体テスト合否を最終CIで確認する。

## 2026-11-04 実run照合

- [B419旧 #41743828860](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41743828860) は **FAIL**。真正180秒TIME_UP tick11858、人間114shot/元1133cells、CPU143shot/元12326cells。保存RAWに実`REPLAY` UI表示有効と `clicked:false,boot:null`、ログ `B140_WAIT_TIMEOUT`。
- [B420旧 #41745041033](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41745041033) も**全体FAIL**。B326原作延長PASS、真正TIME_UP tick11856、人間114shot/元1066cells、CPU元11800cells。原因は同じB419後処理のEscape入力からpointer-lock解除待ち。従ってB420実武器経路のUnit/ビルド/事前PASSと、2試合目を始めたことは混同しない。
- B419 Headless UI解除フォールバックの新SHA `3abdf1c667eab1de5b09001770a21705a507b530` の [#41747779681](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41747779681)、B421実敵2m間合い実装SHA `71634b685ec9a151c17ab59c7bcd4a2b993c35ab` の [#41748022646](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41748022646) は最終CI確認まで**研究実装・認証HOLD**。実CPU敵との自然な交戦・HP減少・撃破・復活について成功報告禁止。
