# T21 V28 — 独立QA（統合ソース fa124516、2026-11-17）

## 対象・証拠範囲

- **検証対象ゲーム本体**: `fa12451665588f91e190f88fc52f0c16c0d47973` / `research/t21-integrated-a1-c-patrol-four-mode-20261105`。
- **QA専用ブランチ**: `research/t21-v28-qa-20261117`。まずソースHEADへfast-forwardし、**ゲーム本体無変更**で1回限りの既存B440 Chromium実行ラッパー `.github/workflows/t21-v28-qa-fa124516-once.yml` を追加。
- 本文にない試験をPASSとしない。正式QA、main、研究本線、Pages、原作PRIVATEは変更しない。
- 元ソースHEADの既存GitHub Actions [#44017373705](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44017373705)：**48ファイル/634 tests PASS、TypeScript/Vite build PASS**。ただし同runの「One real native browser with 7 original CPU and B441 opt-in」は **SKIPPED**。このrunの総合SUCCESSは実ブラウザの成功ではない。
- 本QAの1回限り真正ブラウザ試験は **FAILED_PRESTART**。実行とRAWの詳細は本文末の確定追補を参照。ユーザーに実機操作を求めない。

## 最重要トリアージと再現方法

### QA-P0：原作中央/F4の床支持欠落と視覚物理差（既存診断上の事実／現在の実ブラウザ再現は未認証）

原作登録 `25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable` のまま。固定テスト `src/app/UndertowF3SourceFloorAuthority.test.ts` の旧Windows native足記録が、`LOW_LAST_SUPPORTED_1355 x=-0.909828484 z=46.989162445 Y=3.025102739` から `LOW_FIRST_UNSUPPORTED_1356 x=-0.674686849 z=46.629432678 Y=3.0` に移る際、後者で `actualRapier=null` と示す。2026-11-17統合HEADの既存Actionsログにも `WINDOWS_1498_REGISTERED_VS_VISIBLE_THIN_FLOOR` として再確認可能。

再現（元データに基づく隔離診断）：
```sh
npx vitest run src/app/UndertowF3SourceFloorAuthority.test.ts
```
ログ中の `LOW_FIRST_UNSUPPORTED_1356_AT_LOW_FLOOR` と `actualRapier:null` を確認。**見た目上の同じ場所に原作床があること・当時と現在の実操作で床抜けが起きたことは、これだけでは確証できない**。元映像と物理Hitは同一足元・同一高さ・同一HEADで別途照合が必要。架空の床/橋や無根拠のKCC緩和は禁止。

### QA-P1：真正CPU7体の自然移動と再参加（未認証）

`src/app/UndertowF3SourceTraffic.LiveRejoin.test.ts` では古いlifeを破棄し、復活後の古いrejoin/front cacheを使わない fixture 回帰が通過した。だが「同一試合で自然遭遇→本物の被弾→HP0→150 native tick復活→実Rapier/Recast再合流」を示す実Chromiumログではない。旧時点の自然敵味方横断0/16も未解決。CPU担当の別ブランチは今回の4担当統合に含まれない。

再現（レベル区分の確認）：
```sh
npx vitest run src/app/UndertowF3SourceTraffic.LiveRejoin.test.ts src/ai/CpuAgentSystem.F3LethalLifecycle.test.ts
```
これは回帰テスト。真正7CPUの個々の `physicalFoot / grounded / realGroundTravelMeters / lifeState / hp / physicalRejoins` を実ブラウザの同じtick列で調べる必要がある。HP0/復活イベントが実行されなければ **NOT_OBSERVED**。CPUが7体存在するだけでは自然戦闘や復帰完了ではない。

### QA-P1：実弾・インク所有とGPU見た目（表示不一致のコード上リスク）

統合後の `GameplayInkSystem.apply` は非塗装 `flagsGrid` セルを除外し、`PaintCoordinator` は `rasterEligibleCells>0` ならGPUへの楕円ブラシを1個投入する。一方、`GpuInkAtlas.flush` のブラシ描画側はセルごとの Paintable フラグを参照していない。**許可・禁止セルが混在するブラシで、ownership Gridの禁止セルはNeutralのままGPU色だけ塗られる可能性**がある。これは実画面で未確認、現時点で「バグ確定」ではない。テスト `src/ink/InkPaintAuthority.test.ts` はGPU `queue` が呼ばれたかのmockのみで、実WebGLピクセルとflagsGridの一致までは検証していない。

最小再現の候補：登録済みPaintSurfaceで1セルの Paintable を外し、隣の有効セルと無効セルを跨ぐ弾のブラシを1回適用する。CPU `ownerGrid`、`gpu.queue`、GPU atlasの該当2ピクセルを**同一WebGL2フレーム**で比較する。新たな不正地形・架空得点を作らない。既存軽量回帰：
```sh
npx vitest run src/ink/InkPaintAuthority.test.ts src/projectile/SourceSplatlingBurstPoolWait.test.ts
```
後者はチャージしたスピナー弾プール満杯時の待機をfixtureで確認するだけで、真正弾の命中/HP/床塗装を証明しない。

### QA-P1：原作登録ガラス188衝突面＋16光学専用面（限定コード検査のみPASS）

`src/app/B250SourceStageReadability.test.ts` により、登録済み広域glass衝突188三角面・optical-only 16面の分離と、表示A/B `visible` フラグの排他切替は回帰PASS。光学専用面は実床権限を持たず、影を落とさない設定。ただし**実Chromeの複数連続トグル、画像・物理座標一致、FPS評価は未認証**。

再現：
```sh
npx vitest run src/app/B250SourceStageReadability.test.ts
```
真のWebGLで画面A/Bを複数回切り替え、同じカメラ足元のRendered面IDとRapier支持面IDを比較。背景の薄いガラスを正式床扱いしない。

## Chromiumの一回試験と合否規則

既存 `scripts/t21-b440-short-native-original-foot.mjs` の単一SOURCE WebGL/Chromium試験を、QA専用branchで **720 post-join観測tick** に限定。新規テストランナーの実装・原作の変更なし。GitHub Actions artifactに失敗時/HOLD時もRAW JSON・スクリーンショットを保存。これは **短時間SOURCE練習品質** であり180秒全周回、自然敵命中、150tick復活、正式得点、4v4認証ではない。

合否：実行ステップ成功＋RAW `proof.verdict` を照合して初めて当該試験をPASS。実行がSKIPPED/未起動/失敗ならHOLD/FAILとしPASS拡張禁止。レンダリング視覚/床一致はスクリーンショットと同じtick物理観測がない限りUNKNOWN。

## 保護条件

main / 正式QA / Pages / PR#5 / PRIVATE原本 / research本線に書込みなし。SOURCE 25/17/26/0 とscoreable=0を維持。本人操作0、追加課金0、既存同条件Chromium再実行の連発なし。次のQA判断は、**今回の一回実行ログ**だけを証拠として更新する。同一条件の重い再実行禁止。


## 2026-11-17 04:33 UTC — 1回だけ真正Chromium実行した確定結果（優先）

- **QA workflow**: [Actions #44017850643](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44017850643), commit `c50665bb14bdd7e7991c5ee719ff0eef1b5cb645`。このcommitの親が統合対象ソース `fa12451665588f91e190f88fc52f0c16c0d47973` であることをJobの `git rev-parse HEAD^` / `git diff --name-only` で実際に検査、**QA workflowファイル以外の差分0**。
- **対象**: 本物のヘッドレスLinux Chromium 1600×900 + PlayCanvas / Rapier / Recast SOURCE。ワークフロー既存B440ランナーを呼出。新しいゲーム/CPU操作アルゴリズム・Actor・床・scoreの変更なし。
- **実際のステップ結果**: source installation PASS、TS/Vite build PASS、**真正B440 trial FAIL（exit 1）**、失敗/HOLD artifact upload PASS。Run全体は **FAILURE**。真正試験はSKIPPEDではなく本当に開始されたが、**試合開始前にHOLD**。この試験をゲームプレイPASSと言わない。
- **失敗**: `B440_SHORT_REAL_NATIVE_HOLD_UNCLICKABLE_REAL_BUTTON_#t21-f3-b25-start`。RAW `proof.stage='FRESH_NATIVE_SOURCE'`、`verdict='HOLD'`、`before=null`、`after=null`、`b441NativeEvidence=null`。
- [RAW + スクリーンショット Artifact #14299677710](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44017850643/artifacts/14299677710)。内容 `b440-short-real-original-human-foot.json`、`source-play-portal-real-chromium.png`、`source-play-selected-ink-saber.png`。zip SHA256 `999716cac68877e5cab8adda44d2bdc3ca274b0301714bfd44e0406586519406`。
- **限定的な真正確認**：実Chrome CDPで SOURCE portalロード → Ink Saberを人間入力で選択・反映（`realSourcePlayPortal.verdict='PASS_ACTUAL_CDP_SOURCE_LOADOUT_TO_NATIVE_PLAYCANVAS_WEAPON'`） → 各リンクの装備一致 → FRONTLINE項目を実CDPクリックして元25/17/26/0のゲームをSTAGING起動、`cpu.cpu.length=7`、正式スコア0、 `originalWinner NONE` を確認。ここまでは本物のブラウザで観測された **メニュー～起動直前の限定PASS**。
- **未実行・未観測**：クリックによるB25 ARMED化、実WASD/入力、60Hz進行、物理床と同一画面比較、7CPU移動・実再合流、弾発射/命中/塗装、敵HP0、150tick復活と同一ラウンド再参加、180秒TIME_UP/再戦、正式4v4。これらすべて **NOT_OBSERVED**。7CPU `STAGING` 存在を7CPUの行動PASSへ拡大禁止。

### QA新規P0 バグ候補：リアルSOURCE試合開始ボタンがCDPで押せない

再現：上記Actions #44017850643ワークフローのB440スモークを実行する。元 `scripts/t21-b440-short-native-original-foot.mjs` は実CDPで SOURCE Ink Saber選択とFRONTLINEロード後、歴史的B441-onlyパラメータの元SOURCE世界を再オープンする。 `window.__t21F3.snapshot()` がSTAGING/7CPU/登録25/17/26/0を示すところまでは進むが、`await buttonClick('#t21-f3-b25-start')` にて停止。

判定ロジックは同ランナー `buttonClick()` （約224–234行）。対象ボタンが欠落 / hidden / disabled / `display:none`、またはバウンディング矩形中央 `document.elementFromPoint` のクリック先が別要素、もしくは中心が1600×900外、の**いずれか**である。どれが今回の直接原因かはRAWに座標・hit要素がないため **UNKNOWN**。元ボタンは `src/app/UndertowF3PlayablePreviewApp.ts` の `#t21-f3-b25-start` （約2323行）。CSS `src/app/B245SourcePresentation.ts` にはPLAYING時の練習カード非表示設定があるが、今回STAGINGであったためそれを原因と断定しない。

次の修正担当へ：本体を無根拠に変更せず、次回の**別内容の修正検証時に**対象ボタンの `hidden/disabled/display/visibility/rect/elementFromPoint/hit id/class/z-index/parent` を1回だけREAD-ONLYで取得し、最初の遮蔽要素を特定する。セレクタを別ボタンに差し替えたり、JS `.click()` で物理的に押せないUIを隠蔽することは禁止。**同じ内容の重いChromium試験は再実行しない**。

### スクリーンショットの限界

RAWの2 PNGは SOURCE portalのみ。CI Ubuntuで日本語文字が豆腐（□）のように表示される部分があるが、Chromium Linuxの字体環境差を除外できず、**Windows実機のビジュアル不具合と断定しない**。ゲームプレイ画面のGPU/物理床対応は今回未撮影。
