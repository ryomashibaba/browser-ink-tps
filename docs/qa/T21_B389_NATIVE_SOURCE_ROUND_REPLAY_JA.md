# B389 — 選んだ12武器を維持して、本当の新しい180秒SOURCEラウンドを開始

2026-11-01 JST。既存B210はSOURCE非得点180s TIME_UP→クリックで新セッションの真正Chromium成功（[#41266517229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41266517229)、実180秒・原作CPU7/7・人間132発・CPU805発・終了→新STAGING）。一方、12武器B384は原作局所3/3と実射撃だけが真正Chrome PASSで、ゲーム中に任意の新しいラウンドを開始すると武器を再選択し直す必要があった。

B389ではB384 12武器SOURCE世界で、(1) 真のPLAYING・本物のマウスロック経験後、Escで一時停止しポインタ解除された画面に「NEW 180s SOURCE ROUND · KEEP CURRENT WEAPON」ボタンを表示、(2) 本当のTIME_UPに既存B58/B59のRESTARTボタンから「REPLAY SAME WEAPON · NEW ORIGINAL-SOURCE 180s WORLD」、いずれも現行の人間の選択武器IDだけを URLのホワイトリスト値として渡し、完全な新しいRapier/Recast/CPU/GPU・180秒STAGINGへnavigateする。新ページの初回ロック前、既存B378の合法な12武器セレクターがその武器を自動選択するが、勝手に試合開始しない。既存B343、QA deterministic、非B384、壊れたgeometry、無効武器、現在実プレイ中のマウスロック、SOURCE安全停止には流用しない。

実走行テストは既存B385 WebGL2 ChromiumでTwin Cometsを本物のキー入力で選び、B183実落下→B186登録坂→本物のインク塗装を3/3達成後、本当のEsc一時停止、ボタンDOM可視、実クリック、新ページREADYを連続確認する。新ワールドはtick=0、remaining=180、real human weapon=twin-comets、shots=0、changedHuman=0、cpu shots=0、rejoined=0、B387 previous clears=0、原作25/17/26/0、winner NONEでなければHOLD。これはB384で「TIME_UPまで180秒走り切る実証」ではないため、B384独立の完全180秒完走はHOLDのまま。既存B210の完走証拠をB384の完走証拠に置き換えてはならない。

**変更しない:** original25 solids/17 paint/26 nav/0 scoreable、natural opposing path0/12、B387の同一試合の履歴・死亡復活判定、CPUの物理/AI、戦闘判定、ステージ、時計、ART、main、T19C/T20、PR#5、公開Pages。公式4v4・得点・本番は認証と明示承認までHOLD。


## 2026-11-01 B389 実ブラウザの新世界・同武器リプレイ確定 PASS

実装HEAD `a11b812313b505ba9c052edf5e237d7f6d4e694e`、[真正Chrome CI #41270601156](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41270601156) **SUCCESS**。TypeScript build、関連Vitest **78/78 PASS**、node --check、1600x900 真正CDP/WebGL2/実60Hz。GitHub Actions Artifact `b385-genuine-selected-source-round` の `b385-native-source.json` 原本で `outcome=PASS_B389_REAL_USER_REPLAY_NEW_NATIVE_180S_WORLD` を確認。

本当のTwin Comets・37 shot・人間354変化セル・落下後65 fresh impact・接地11.3417m・7/7 CPU復帰・原作B183落下→B186右上段→3/3 clear、B387その試合の実達成数1を実ブラウザで証明。CDP Escape→本当の一時停止により `PLAYING`, `paused=true`, pointer unlock, old native tick **1446**、PLAYER画面でB389新試合ボタンが可視。人間が本当にクリック→ **新しい** PlayCanvas/Rapier/Recast世界が誕生。新ページ初期 `STAGING`, `tick=0`, `time=180`, `twin-comets` 自動選択、shot/人間ink/CPU shots/CPU physical rejoins/旧達成履歴すべて0。原作25/17/26/0、scoreable=0、winner NONE、無認証対岸経路なし。再び本当のSTARTをクリックし、同じ武器で `native tick=18` まで進行、実CPU7体あり、強制tick/ワープ0。

**注意：** B389 PASSはゲーム途中の本物の新試合操作についてのみ。B384で180秒TIME_UPまで実際に走り切り、同じ武器で再挑戦する経路は**独立未検証HOLD**（一方B210通常SOURCE構成の実180秒TIME_UP→リプレイは [#41266517229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41266517229) で先行PASS）。B387実死亡→復活のブラウザ試験、自然に対岸CPUと交戦する経路、正式得点・4v4、ART、productionは引き続きHOLD。次の大工程では、新たな物理床/スコアの創作や既存QA増殖をせず、B210既存の真正180秒統合をB384へ展開する。
