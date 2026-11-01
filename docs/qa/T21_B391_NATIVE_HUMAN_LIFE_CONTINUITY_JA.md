# B391 — 実死亡・復活のSOURCE試合継続性を厳密に分離

2026-11-01（JST）。B390の真正Chromium 180秒長時間CIが元HEAD `85f1da1d` で進行中に、**別の真正死亡・復活検証をPASSと誤認しない**ための状態・見せ方を整備。試合中の既存B387ラウンド履歴に native HP-zero を観測した tick、実死亡検出回数、150 native ticks 後の復帰観測回数、実復帰tickを追加（ソース実物理の `f.tick`/`f.alive`/`f.respawns` のみ）。これまでと同様、本物の原作局所3/3達成は一生涯で一回のみで、試合全体の `realClearedLives` は死亡・復活をまたいで消さない。

**画面上の実用的修正**：HP0の実死亡中に `CURRENT LIFE SOURCE CIRCUIT · REAL LOCAL CLEAR` と表示すると以前の命の成功を今の生存・今の成功と誤認する。B391では `WAIT_NATIVE_RESPAWN` とし、`currentLifeClear=false` にする一方、`ROUND VERIFIED CLEARS` の真の歴史的達成件数は維持する。復帰後の初期命は既存のB183/B186が物理的に初期化し、達成を自動付与しない。実死亡・150tick実復帰の件数をPLAYERの既存B58カウンタ・最終非得点結果画面に含める。

**禁止する実装**：テストのための人工HP低下、リスポーンの強制、床の追加、Actorワープ、時計の短縮、対岸経路/Scoreableの解禁。原作25 Rapier solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、自然な敵陣経路0/12、正式4v4・ART・production全てHOLD。

**今回の検証範囲**：B387の実入力型を使った単体テストが、(1) HPゼロになる前の3/3実クリア保持、(2) HPゼロのnative tickで当前命表示だけ落とす、(3) 正式な150tickの生体復帰後に旧実績は残し現在命をリセット、(4) 死亡履歴なしや149tick未満の架空復帰カウンタ増加を拒否することを検査。**実ブラウザで自然HPゼロ/150tick復帰の到達そのものは未確認**。原作CPU B1～B4まで約100mで自然経路0/12のため、人工的な死亡導線を作らず真の接敵認証/原作経路回復までHOLD。B390完走CIとは異なる種類の認証であることに注意。
