# Browser Ink TPS — 実2試合TIME_UPのB430 native clock監査修正（2026-11-05）

## 一次証拠
- 研究SHA `4db76a797fbaa45ced24059de223e5205f52aae9` の [真正B413 Run #41951999679](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41951999679) は **FAILURE**。[RAW Artifact #13383758500](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41951999679/artifacts/13383758500) の `b430-two-authentic-source-180s.json` を直接取得して監査。
- 同一Chrome上の**1試合目**：B322原作坂v≥.90・実上段床PASS、B412 OWNイカ/SWIM_GROUND/HUMAN復帰の独立PASS、B413実射撃→OWN回復→再射撃、真正TIME_UP **tick 11860**。
- 正規の再戦ボタンから新ブラウザ `performance.timeOrigin=1793845133735` の別PlayCanvas/Rapier/Recast世界起動、B419新世界実射撃/7CPU独立PASS。
- **2試合目**：最初のPLAYING記録 `tick=1060`, `remaining=179.9166666667`（真正時計は既に5tick消費済み）、120秒 `tick4655`、60秒 `tick8257`、TIME_UP `tick11857`。プレイヤーshots19、native CPU7、実CPU SOURCE shot requests112、CPU原本ink変更11908セル、人間インク112セル。新たな実物理WASD歩行2回のRAWも収録、SOURCE foot支持を保存。scoreable0、winner NONE。
- 旧B430独立監査では `end.tick>=base.started.tick+10800` としたため、最初のPLAYINGサンプルが試合開始**5 tick後**だったことを無視し、実差10797tickを条件外とし `B430_TRUE_SECOND_180S_HOLD_NATIVE_SECOND_180S_TIMELINE`。
- 全記録は本物の時刻・実PlayCanvas 60Hz native tick/実CPU。**時間・tick・Actor・scoreの生成や早送りは一切していない**。

## 修正
- 真の最初のPLAYING時点で既に経過した原作ゲーム時計 `(180 - started.remaining)*60` と、その観測点から真正TIME_UPまでのnative tick差 `end.tick-started.tick` を足し、**元の必要量10,800 native tickは維持**して判定。RAW実値は約5+10797=10802。開始実remainingは0〜180の範囲、直前のB419独立実PLAYING証明、120/60/0秒の順序・本物pointerLock/CPU・非synthetic・終了UIの認証を継承。
- 独立PASSの証拠には計算の各項と合計を可視化。実座標・真時計の同じRAWを回帰fixtureとして追加し、数tick早い偽TIME_UPや書換・早送りをHOLD。
- **元失敗Runを事後PASS扱いしない**。修正した新SHAの同じSOURCE実ブラウザでB430/B438独立PASSを得て初めて、新HEADの2試合連続検証合格。
- 2試合の真TIME_UPは原作ナワバリの公式スコア・敵HP着弾/撃破・対岸経路を意味しない。Source原本25/17/26/0・対岸0/12、F1〜F5維持。main、T19C/T20、正式QA、Draft PR#5、Pages、Work/Computer Use、原作非公開の保護継続。
