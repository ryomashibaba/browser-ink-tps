# B421 SOURCE CPU対CPU実物理間合いへの移動

本物のチームA/BのCPU足元が原作登録床の同じ側に来た場合に限る。旧実装は敵の現在foot座標そのものを移動目標にするが、この座標は生存CPUの物理カプセルに占有されている。これは追跡の終了位置として不適切。

新実装は `chooseB142OriginalAllyStandoff` の真正Recast経路2m手前のウェイポイントを敵CPUに適用。敵への既存の原作足元＋全経路審査に続き、提案地点そのものの元Rapier支持と、新目標への独立Recast経路全中間のRapier支持・始終点スナップ距離を再監査。安全な候補が存在しない場合は未認証目標を出さず既存の原作patrolを継続する。

これらは**動作改善であって実自然敵命中・撃破・復活の実証ではない**。原作25 solids、17 paints、26 NavLinks、0 Scoreable、自然対岸経路0/12、正式4v4・本番・ART・得点・勝敗はHOLD。研究branch限定、main/正式QA/PR#5/Pages変更禁止。新SHAの真正Chromium/単体テスト合否を最終CIで確認する。