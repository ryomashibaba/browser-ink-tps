# F3 本物のイカ操作：OWNインク上で移動を止めて回復（2026-11-05）

## 真正実走行の原因
[Run #41983232424](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41983232424) はFAIL、RAW [Artifact #13395157849](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41983232424/artifacts/13395157849) を取得し直接解析。B315 3面射撃・B322坂頂点・B412本物のイカOWN泳ぎ・ヒト再射撃・TIME_UP tick11859は成立。ただしB413の独立監査は「OWNインクで2回以上継続観測＋真正インク増加」を要求し、実イカはtick6624（OWN, ink84.033）に続いてKeySで原作中立床へ戻ったため、次のtick6630はNEUTRALだった。確かに現実の回復は約1.13ink発生したが、厳格な独立認定条件は未達。過去のFAILをPASS扱いにしない。

## 実装
既存B412 SOURCE人間KCCで本物のOWN塗装セルに移動した直後、Shift（本物イカ状態）を保持し、**移動キーを送信せずその場で回復する**。その間、実(native) 60Hz時計が3tick以上経過するたび最大5回、実プレイヤー/原作Rapier足/ink状態/OWN relation/SWIM_GROUND/CPU7をread-only取得。OWNを外れたら直ちに休止終了。衝突floor、source 25/17/26/0、元の5m/0.85m/0.95m復帰閾値、元B413の2回連続OWN回復独立検証は**変更しない**。ゲーム時刻、Ink、Actor、原本OWNERGRID、カメラ、得点は一切書き込まない。

厳密な自然動作が成功した場合の真サンプルをB412 Artifact `stationaryOwnRefill` に保存。B413側の既存真の連続OWN回復判定はそのまま。既存B413真正Chromium長時間ワークフローを使う（新設なし）。新HEADで実7CPU・B413/B419/B430/B438が成功するまで、修正の実ゲーム合格とは主張しない。

固定F1〜F5とFast Track優先。原作25 Rapier /17 Paint/26 links/0 Scoreable、自然対岸0/12、正式4v4・敵HP命中・勝敗・ART・productionはHOLD。main、正式QA、T19C/T20、Draft PR#5、Pages、Work/Computer Use事前承認を保護。
