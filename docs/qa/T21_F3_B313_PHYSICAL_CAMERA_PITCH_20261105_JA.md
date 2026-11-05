# T21 B313 / B315 — 原作の実カメラが届かないSOURCE射撃候補を拒否（2026-11-05）

[新HEAD真正B413 #41980851257](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41980851257) はFAIL。直接取得した[RAW Artifact #13394750575](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41980851257/artifacts/13394750575) を解析。B462の本物の人間KeyS原作下段接近3区間すべて独立PASS、B322実坂登頂PASS、本物のB413射撃19+15、OWNインクイカ回復まで成功。ただしB315の独立3面着弾監査がFAIL。

B312の元first-drop-landing PaintSurfaceへの計画は原本ownerGrid座標 `[-1.0300,3.002,57.8961]` を選び、`targetPitch=-60.9845°` で `safe:true` と誤分類。一方、本物の `ThirdPersonCamera.ts` は下向き-55°にクランプされ、実CDP after pitch=-55°でB313監査 `HOLD_TRUE_MOUSE_AIM_NOT_AT_ORIGINAL_CELL`。右原作坂PaintSurfaceへの実着弾は57セルPASSも、独立B315は元の3面をともに実証しなければPASSとしない。

## 実装
- B313 pure target plannerの可動域を仮の `[-78°,12°]` から真正nativeカメラと同じ **`[-55°,28°]`** に限定する。実際に向けない目標を選ばず、既存B312の原本B337近傍ownerGridセルfallbackへ通す。B337候補は元の17原本PaintSurface上の既存Active Cell（今回RAWの本物3セル）を使う。新規原作ブロックや偽着弾/テレポートなし。
- RAWの実本体位置・セル座標によるB313 Node回帰を追加。実カメラを直接操作するのではなく、従来どおり真正CDPマウスで移動し、`b313ObservedRealAimMatch` が本当に一致するまで実弾を送らない。
- B413長時間CIのpath triggerとpreflightにB313 Node回帰を追加。元B315独立人間実弾・原本ownerGrid変更3面の厳格ゲートは**非変更**。いずれも狙えなければHOLDする。新HEAD真正2×180秒/B463履歴表示はまだ未認証。
- F1〜F5/Fast Track固定、原本25/17/26/0・対岸0/12・Scoreable0/勝者NONE、正式4v4/ART/productionはHOLD。main/T19C/T20/正式QA/PR#5/Pages保護、Work/Computer Use事前承認、有料APIゼロ。
