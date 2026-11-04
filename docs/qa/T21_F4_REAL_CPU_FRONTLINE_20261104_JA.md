# T21 F4: 実180秒Native CPU前線停滞の実測・未承認経路の区別（2026-11-04）

## 検証元・方法
- 真正原作 SOURCE Chromium [Actions #41802105037](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41802105037) の **SUCCESS**、codeSHA `401d90640bf318956ab938bba8305d8b7cf39716`。[Artifact 13310359804](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41802105037/artifacts/13310359804) 内 `b433-real-source-opponent-polls.json` を使用。原作凍結 **25 solids/17 paint/26 links/0 scoreable**。
- `scripts/t21-f4-real-cpu-frontline-audit.mjs` は Artifact JSONを **read-only** で読み、真正データのSOURCE、7体のIDと実位置、native tick単調増加、Actor/clock/ink/score/入力への書込みが0か確認し、各CPUの観測座標間の水平累積（**移動距離の下限**）、前線方向の最大到達、人体対敵CPU・CPU対CPU最短観測距離と標本間欠落を算出。
- ローカルNode構文検査、元Artifactの **1358真正サンプル** への再実行PASS、10種の敵対的改ざん（偽SOURCE/tick/actor/score、CPU欠損・重複、HP/座標異常等）をすべて拒否。これは**真正ブラウザ試験の追加実施ではない**。過去のB430×2実180秒PASSは別の不変証拠。

## 結果（元Artifact 1358観測点）
native tick **2361→11856**、観測されない最大連続 **296 tick**。各値は観測だけであり、間の状態は断定しない。

| CPU | 観測中の水平移動距離の下限 | 中央側に最も進んだ実Z |
| --- | ---: | ---: |
| A1 | 12.870 m | +46.508 |
| A2 | 635.933 m | +48.094 |
| A3 | 637.396 m | +47.434 |
| B1 | 615.426 m | -47.705 |
| B2 | 598.876 m | -47.764 |
| B3 | 606.435 m | -47.833 |
| B4 | 600.736 m | -47.287 |

全7CPU×1358観測点で **|z|<33 の観測0件**（標本間の通過は不明）。人間→B4最短実測 **95.39409222162539m（tick10808）**、A1→B4最短 **96.7353771363595m（tick10808）**。元の同試合の人間直接敵hit0／splat0。

## 実装根拠と直すべき所
- `src/app/UndertowF3SourceTraffic.ts` のCPU巡回候補は **自陣側Z×sideSign>=33、Y 2.7〜5.25m** に限定。さらに実Recast最寄点/goalへの到達と元Rapier足支持を要求する。実runで多数動くCPUが自陣を出ないのは単純な「移動更新不動作」ではなく **目標候補・経路・原作地形権限が交差する問題**。
- 同ファイルの敵追跡は生きた敵Actorの実足と、狭い現場レンジ、Recast経路到達、**全経路の元SOURCE地面支持**が必要。ソース・実渡河が未認証なら、仮想敵を自陣に配置・人工接敵してはならない。
- `src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry.ts` の元OBJ由来5要素／片側の **試験投入でもendpoint error約31.716m**、直通経路未達。FloorLine00の元ゲーム衝突権限・幅0.30m CPU半径×2の支持・7.2.0 Turf一致は未認証。元版照合は `docs/qa/T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md` を参照。

## 次のF4受け入れゲート（主プロジェクトのF1〜F5方針を変えない）
1. 元の Ver.7.2.0 Turf の **mesh + physics collision + actor** を対応Faceで照合し、中央通行面と本来の接続先をソース由来と独立認証する。
2. 元Rapier体・半径0.30mのCPUの**連続接地、カプセルクリアランス、実Recast/Crowd走行**を連続時計で実証。既存 `25/17/26/0` への修正は根拠と承認が揃うまで行わない。
3. そこで初めて両陣営が本物の位置から接近したら、HP→撃破→150tick復活→得点候補の検証へ進む。リアルCPUの単純移動距離を正式4v4の達成と扱わない。

**現在の認定**：連続2回真正SOURCE 180秒完走はPASS。自然な対岸経路 **0/12**、CPU同士実遭遇とhuman hit、正式得点/勝者、ART、本番/mergeは **HOLD**。不許可の床・透明足場・NavLink・Actor warp・架空勝敗は採用しない。追加の80分Actionsは起動しない。
