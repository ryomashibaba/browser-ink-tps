# T21 V28 — 独立QA（統合ソース fa124516、2026-11-17）

## 対象・証拠範囲

- **検証対象ゲーム本体**: `fa12451665588f91e190f88fc52f0c16c0d47973` / `research/t21-integrated-a1-c-patrol-four-mode-20261105`。
- **QA専用ブランチ**: `research/t21-v28-qa-20261117`。まずソースHEADへfast-forwardし、**ゲーム本体無変更**で1回限りの既存B440 Chromium実行ラッパー `.github/workflows/t21-v28-qa-fa124516-once.yml` を追加。
- 本文にない試験をPASSとしない。正式QA、main、研究本線、Pages、原作PRIVATEは変更しない。
- 元ソースHEADの既存GitHub Actions [#44017373705](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44017373705)：**48ファイル/634 tests PASS、TypeScript/Vite build PASS**。ただし同runの「One real native browser with 7 original CPU and B441 opt-in」は **SKIPPED**。このrunの総合SUCCESSは実ブラウザの成功ではない。
- 本QAの1回限り真正ブラウザ試験は、別途実行結果が確認されるまで **NOT_RUN / RUN_PENDING (UNKNOWN)** とする。直近の結果はGitHub Actionsで確認する。ユーザーに実機操作を求めない。

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

main / 正式QA / Pages / PR#5 / PRIVATE原本 / research本線に書込みなし。SOURCE 25/17/26/0 とscoreable=0を維持。本人操作0、追加課金0、既存同条件Chromium再実行の連発なし。次のQA判断は、**今回の一回実行ログ**だけを証拠として更新する。
