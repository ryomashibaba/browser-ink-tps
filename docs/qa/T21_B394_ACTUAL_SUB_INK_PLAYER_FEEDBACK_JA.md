# T21 B394 — サブ爆発と原作塗装セルの本当の変化を区別したプレイヤーHUD

2026-11-01 JST。F1–F5 Fast Track、原作25 solid /17 PaintSurface /26 navlink /0 scoreable、自然対岸0/12。正式得点・敵命中・4v4・ART・本番公開HOLD維持。

B392は本物の投擲と爆発を示す。B394はその次の大切なユーザー体験：「サブで本当に原作塗装セルが変わったか」を既存B41真正PaintCoordinator後のデータから表示する。

- NEW_CELLS は実際の人間bomb由来の原作PaintSurface新規変更セル数を表示。NOT TURF SCOREを明記。
- STAMP_ZERO_CHANGE は原作面にスタンプはしたが新規セル変化0と表示し、敵Missや操作失敗と断定しない。
- NO_CERTIFIED_STAMP は原作登録面へのスタンプがないと表示し、物理未爆発・弾消失や敵Missとは混同しない。
- MULTIPLE_UNRESOLVED は同一tickの複数爆発で個別帰属不能と表示し、塗装セルを特定ボムへ誤帰属しない。
- 判定はB41真正human bomb native tick・本物のexplosionカウンタ増加・原作source provenance・非scoreable・通常PLAYER・PLAYING・HP>0・停止なしでゲート。初回過去累積、QA/F8、死亡、pause、timeout、counter/tick逆行、元Face不一致は非表示。実イベントは最大120 native ticks可視。
- HUDは読み取りのみ。投擲物理・弾道・インク経済・塗装結果・AI・KCC・スコア・Actor・時計・原作25/17/26/0は変更しない。

既存B393本物Chrome #41282785196で2発実爆発、自然インク回復、180秒試合PASS。ただしその実爆発の原作塗装面への着弾/変化はB393では認証していない。B394新HUDも新HEADのCIと可視実測を確認するまで未認証。
