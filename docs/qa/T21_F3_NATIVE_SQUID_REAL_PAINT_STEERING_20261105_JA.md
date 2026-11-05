# T21 F3 — OWNインクへの本物のイカ移動方向修正（2026-11-05）

## 確認済みの失敗
[実2試合Run #41941309489](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41941309489) FAILURE、[RAW Artifact #13377715385](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41941309489/artifacts/13377715385) で原作上段のPLAYERは実射撃17発・インク16.15消費、7CPU実復帰、元25/17/26/0を確認。
現行B412はOWNインクの本物B410目標 `[13.4381,4.502,50.2800]` を使わず、照準後のカメラ向きへ盲目的にKeyWを5回送信し、SOURCE足は `[11.8569,5.395,46.0915]` → `[16.8726,5.395,44.2635]` へ5m超。全行程SQUID_DRYで5m安全閾値に失敗。これはステージ衝突破綻ではなく、**既塗装目標の方向とWが逆であること**が記録で確認できる。

## 実装
- 当該世界の真のSOURCE原作床上で実CDPのW1パルスから2D前進方向を読み取り、既存 `b412NativeReturnSteerKey` の実方向ベース四方向選択を**帰還だけでなくOWN塗装セルへのアプローチにも適用**する。CPU/Actor/インク/時計/原作経路は書き込まない。
- 元B412の原作床厳密支持、Squid SWIM_GROUND＋OWN、実水準のインク回復、外向き5m、帰還0.85/0.95m、元source 25/17/26/0、公式勝者NONE、7CPUをすべて保持。元の独立監査も実W校正を検証し不正キーを拒否。
- RAW失敗座標と既存実往復fixtureで Node testを追加。**次の真正Chromium B413完走・OWN回復を得るまでは実修正PASS未認証**。
- F1〜F5/Fast Track不変更。原作物理/原本、main・T19C/T20・正式QA・PR#5・Pages保護、Work/Computer Use禁止。公式スコア、対岸0/12、正式4v4・ART・productionはHOLD。
