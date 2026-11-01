# B392 — REAL SUB THROWN / DETONATED を通常PLAYER HUDに追加

2026-11-01 JST。原作SOURCE F3「人間1＋CPU7、180秒」の可視操作品質改善。既定F1–F5を継承し、新しいCIワークフローは作らない。

## 実装
選択中の実サブと、真の人間所有 native 60Hz `playerSubThrows`/`playerSubExplosions`の増加を監視。実投擲時は「REAL SUB THROWN · Snap Bomb · NOT CPU HIT」、実爆発時は「REAL SUB DETONATED · Snap Bomb · NOT CPU HIT」をPLAYER HUD内で90 native ticks表示。実人間インク、投擲・衝突物理、爆発、塗装、CPU/HP/得点、タイマーや操作には一切書込みしない。

既存累積数から「今投げた」と推測せず、真正状態の初回をbaselineとし、実増分のみイベントとする。原作25/17/26/0以外、F8 QA、非PLAYING、PAUSE、HP0、安全停止、不正カウンタ、tick逆行、試合リセットでは非表示。実爆発は原作塗装・敵被弾・公式得点の保証ではない。

## 既存実証と認証境界
[B385/B390 #41279671286](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41279671286) は実CDP FキーでSnap Bomb2投擲・実インク99.16→54.33→9.33、180秒TIME_UPと新世界同武器リプレイを真正WebGL2でPASS。新B392 HUD視認までのPASSを意味しない。B393別の真正Chrome #41282785196は新サブ爆発＋自然インク回復の検査であり、この新UIと混同しない。

原作地形25/17/26/0、自然対岸ルート0/12、元FloorLine00公式衝突未認証、正式4v4/ART/得点/勝者/本番公開HOLD。
