# B385 — B384 12武器モードの真正Chromium一気通貫受け入れゲート

2026-11-01 JST。GitHub QAブランチ限定。B384開発モードと原作25/17/26/0、自然敵陣経路0/12、正式4v4/ART/production HOLDは変えない。

## 何を計測するか
専用の軽量GitHub Actions 1ジョブが、既存WebGL2/PlayCanvas/Rapier/Recastの本物のSOURCEプレビューを開く。実CDPクリックで**B384の新設ボタンを押して**新しい物理世界へ遷移し、12件の武器リストを本物のCDPマウス/矢印/Tabで操作してTwin Cometsを選ぶ。native tickが0のままになること、既存実ProjectileSystemの装備・B183/B186有効・7CPU・原作25/17/26/0が一致することを検査する。実マウスでSTARTし、実Pointer Lock、実W移動/本物の左クリック射撃、60Hz増加、実KCC位置差を検証する。原作局所ミッションがPLAYER画面に表示されることを実DOMと実画像で記録。実時計の180秒完了と本物の「勝者なし」の結果画面を確認。タイムアウトや未達ならHOLDとJSONに残す。

**一部の実操作が成功しても原作落下→坂→新着弾の3/3が成功したとは認証しない。** 実験では経路/カメラ/射撃先を人工変更しないため、局所CLEARの未達はそのまま記録。原作敵陣0/12・正式対戦/得点はHOLD。CPUやプレイヤーを動かすQAテレポート、人工HP/インク、人工Clock、発射処理の直接呼び出しは厳禁。

## 効率
従来B75やW10B15の重い複数の検証ワークフローは改変しない。B385 scriptかこのworkflow自身が変わる場合だけ単一受け入れCIを自動起動。失敗時は証拠のある原因だけを修正する。


## B385初回失敗と本工程の再実装

2026-11-01 JST。初回 [true Chromium #41222036452](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41222036452) FAIL。B384ボタンと12武器Twin Comets選択、7.0945m物理移動、15実弾、280原作塗装セル、CPU7体の合流は確認。旧W90入力はSTAGING中で、B183原作下降は未達のまま実測134.9秒で19分待機上限に到達（ゲーム自体の停止は未観測）。

再実装ではB366実Chromeの成功したW200→D12→W18→D90を、本当の7CPU再合流とPLAYING開始後のCDPキー入力で実行。B183実登録下段への着地/B186原作坂・上昇床接触を確認後、実CDPマウスで塗装し本当の3/3、B58結果数字一致を検証する。Twin Cometsの実物理はB343固定シューターと同一とは仮定せず、違えばHOLD。CIは16分以内で長い180秒の無操作待機を廃止。今回PASSできるのはSOURCE局所3/3だけであり、180秒TIME_UP、原作敵陣0/12、正式4v4、公式得点、ARTとproductionは未認証のまま。


## B385 真正Chromium再検証 #41254428367 (2026-11-01)

実WebGL2の選択Twin Cometsで **原作下段への真正着地と原作坂→上段の物理踏破が成立**。実ログ：W200→native SOURCE_LOWER_LANDED、D12/W18後、上りD90の84 native ticks時点で登録床 UndertowT21D:right-low-team-a に着地し、B186内部ステータス REAL_LOCAL_CIRCUIT_CLEAR。実射撃37発、原作インク変更354セル。原作25/17/26/0維持。

CI自体はFAILだが、**すでに本物の3/3が成立している場合にも2/3の途中表示を必須としたB385検証コードの不備**。次の修正は実B186の CLEAR と新規post-drop 60+セルの有無で2分岐し、すでにCLEARなら余計な射撃を追加せずB371/B58表示・数値一致をチェックする。実SOURCE 180秒終了までは依然未認証、自然敵経路0/12と正式4v4/ART/productionはHOLD。


## 2026-11-01 B385 真正Chromium 12武器 SOURCE 局所3/3 — PASS

- **検証正本:** [B385 Chromium #41254904779](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41254904779) は全ジョブ **SUCCESS**、テスト67/67、TypeScript/Vite build、実PlayCanvas WebGL2・実CDPクリック/キー入力/Pointer Lock・実Rapier/Recast走行・実Projectile/PaintEvent・B371/B58同一世界表示の合致を確認。対象コードHEAD `35f8def60627ed389eba0c39aca386a6df3f59ff`。
- **実測:** B384ボタン→B378実12武器セレクトで Twin Comets を選択、原作 first-drop → 登録済み下段支持面 → 原作右低地ランプ → 上段支持面。実接地移動 **11.3417m**、人間実弾 **37**、人間の原作インク変化 **354セル**、下降後の本物の新規変化 **65セル**（要件60以上）、7/7本物のCPU復帰、CPU実弾 **68**、CPU原作インク変化 **2926セル**。B186は `REAL_LOCAL_CIRCUIT_CLEAR`、プレイヤー画面 `SOURCE CIRCUIT 3/3`、B58 RECENT LIFE `REAL LOCAL CLEAR`、実弾と人間インク数が一致。公式Winner `NONE`、Scoreable `0`、本物の人間→CPU命中 `0`。
- **原因と対処:** 初回B385はSTAGING中のW90で原作下降認証が成立しなかった。修正版ではCPU7体実合流とPLAYING後、過去実証済み原作のW200/D12/W18/D90を実キー操作で実行。落下後に撃った真の弾で上段到達時点ですでに3/3となっていたため、次の修正で「必ず2/3を経由する」という誤テストを修正。SUCCESSは今回のB384選択武器経路に厳密限定。未選択の他11武器を全PASSとはしない。
- **絶対HOLD:** 180秒の実際のTIME_UPまで完走した新B384は未確認。正式4v4、自然な敵陣経路 **0/12**、公式スコア/勝者、ART/F5、production/activationReadyはHOLD。物理原作登録 **25 solids / 17 PaintSurface / 26 NavLinks / 0 Scoreable** 不変。過去のT19C/T20、main、公開Pages、Draft PR #5不変更。
- **次の統合工程:** 同じSOURCE実プレイで、CPUとの自然な相互遭遇を原作の地形/経路の権限だけで改善する。未証明の中央アンダーパスに人工足場やワープを追加しない。表示面では本物の実画面で視認性・過剰警告の重なりを評価し、ART採用は別の固定視点審査まで保留。既存CIを再利用して非必要な微小QA増殖は禁止。
