# T21 B445 — 6実CPUの原作前線ルートが承認できない理由を分離する

## 背景と最上位制約
- 前工程B443の**真正**Chromium（[Actions #41833356990](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356990)、Artifact 13324588065）は3体A2/B1/B3の原本B441ゴール近接と、目標切替旧29→新5を検証済み。一方、A3/B2/B4はB441ゴールの実受理記録0であった。
- 0件は「原作の物理経路がない」を意味しない。静的候補の不足なのか、元Rapierの足場・境界クリアランス不足なのか、元Recast+中間点支持で通らないのか、または実戦中の生きた原本CPU経路に不成立があったのかは、前Artifactだけでは**不明**。
- Ver.7.2.0 Turf正規Mesh/Collision/Face照合は独立HOLD（敵陣侵入用スロープ追加はVer.2.0.0、7.2.0で全モード地形改修）。原作の床・Linkを推測で追加しない。

## 新しい診断コード
研究コミット [84268bc](https://github.com/ryomashibaba/browser-ink-tps/commit/84268bc4d70b0c6e22c219bc9e943713d7a1af0a) は、本体の既存SOURCEフロント目標候補/可否判断を一切変更せず、判定の各段階をCPUごとに記録する。

`snapshot().cpu.sourcePatrol.b445OriginalFrontlineGates`：6つの実Actor ID（A2/A3/B1/B2/B3/B4）ごとに下記情報を読み取れる。
- `actualOriginalLanding`：元の初回DROPで指定された既存原作低地着地点（新しい開始地点ではない）。
- `originalFloorProposals`：現在の凍結原本右低地床Footprint上にある候補の数。
- `inspectedProposals`、`rejectedOriginalRapierOrBoundary`：実Rapierヒット/元SOURCE solid ID/B130境界≥0.75mを満たせなかった候補の数。
- `rejectedNativeRecastOrOriginalPath`：実navのstart/end snap≤0.20m・到達・0.30mごとの原本Rapier中間支持が通らなかった数。
- `strictlyApprovedGoals`、`approvedOriginalGoals`：本当に承認した元SOURCE同側ゴールの座標。座標があることはそのゴールが到達済みという意味ではない。
- `runtimeChooseInvocations/runtimeNoOriginalFrontGoals/runtimeNearExistingGoal/runtimeUnsupportedGoalFoot/runtimeUnsupportedNativePath/runtimeTrueOriginalGoalRequests`：生きた元CPUのティック中で本当にゴール選択が呼ばれたか、その時の拒否段階と受理数。既存の旧巡回や原作CPUの行動は不変。

追加の短時間真正Chromiumスクリプトは 6Actor IDの実存在、原作低地ランディングの有限座標、拒否＋承認の件数が**検査対象件数に一致**しているか、承認先が原作同側内だけかをfail-closedで確認。研究本体のActorは移動させず、読取JSON `b441NativeEvidence.firstRead.b445FirstOriginalGateByCpu` および `b441NativeEvidence.b445LastOriginalGateByCpu` に真正snapshotを保存する。

## 今回の検証・判定条件
- [B445短時間真正SOURCE #41840777818](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840777818)：native 720 tick / 本物7CPU、元のSOURCE25/17/26/0、元Human W入力、Actor/clock/score/geometry書込み0。試験完了前はB445各CPU原因の成功・失敗を主張しない。
- [B445通常B440回帰 #41840778284](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840778284) は通常デフォルト動作の実証でありB445目標承認の証明とは別。
- 長時間二試合回帰 [#41840778148](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840778148) はB445コードSHAの本当の180秒回帰、以前の [#41833356991](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356991) はB443 SHAの長時間回帰であり、結果を混同しない。
- 次回、A3/B2/B4の各段階の数値を**実Artifactから照合してはじめて**改修可否を決定する。Rapier/元Recastが現実に不成立なら**HOLD**。条件の緩和、偽床/NavLink、Actorワープ、偽の勝敗・射程を使用しない。

**正式4v4/自然交戦/元7.2.0敵陣横断/HP/撃破/復活/公式scoreable/winner/ART/本番：すべてHOLD。**

## 2026-11-04 JST — 真正720tick結果の確定

- [B445真正Chromium #41840777818](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840777818) **overall SUCCESS**、コードSHA `84268bc4d70b0c6e22c219bc9e943713d7a1af0a`、[実Artifact 13330170325](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41840777818/artifacts/13330170325) の `b440-short-real-original-human-foot.json` / `b441NativeEvidence.b445LastOriginalGateByCpu` の本物の6CPUフロント診断。
- 研究用原本SOURCE 25 solids/17 paints/26 links/0 scoreable、7物理CPU実worldで720tick、B441真前線ゴール要求合計**112件**、Actor・native clock・score・stage改変**0**。

| CPU | 提案数 | 検査数 | 元Rapier/床margin拒否 | Recast/中間原本ルート拒否 | 承認した元ゴール | 実選択呼出 | 元ゴール実要求 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A2 | 32 | 11 | 0 | 9 | **2** | 43 | 43 |
| A3 | 32 | 32 | 2 | 30 | **0** | 43 | 0 |
| B1 | 32 | 12 | 2 | 8 | **2** | 43 | 35 |
| B2 | 32 | 32 | 2 | 30 | **0** | 43 | 0 |
| B3 | 32 | 12 | 2 | 8 | **2** | 43 | 34 |
| B4 | 32 | 32 | 2 | 30 | **0** | 43 | 0 |

検査数が32未満のA2/B1/B3は**2承認した時点で早期終了**する既存実装のため。拒否数+承認数と検査数の和は各CPUで一致。A3/B2/B4は32件全拒否。ここで「その場所に原作の道が一切存在しない」とはまだ言えない。初回DROPの登録着地点を起点としたroute失敗である。

### B446 — 次の真正SOURCE検証（改善実装ではなく原本の精密再監査）

- [B446研究実装コミット](https://github.com/ryomashibaba/browser-ink-tps/commit/038fffd510bb221c2a6388f221028edd8a737d45) ではB445 Recast/pathの拒否を **UNREACHED / START_SNAP / END_SNAP / INTERMEDIATE_ORIGINAL_SUPPORT** に四分する（同じ閾値・同じ短絡順序を維持）。
- A3/B2/B4の**実際の7CPU合流後**、GROUND・ACTIVEで原本Rapier足を持つ真のCPU実foot起点で、候補32件を**読み取り専用かつ各CPU1回**だけ再検証。経路が認証されても移動目標への採用はしない。新 `snapshot().cpu.sourcePatrol.b446LivePhysicalFootDryRouteProbes` に本人座標と分類した拒否数・承認可能性を保存。
- [B446真正試験 #41842046623](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41842046623) が出力する `b446LiveActualCpuFootDryRouteProbes` は、実Artifactが確定してから初めて合否を判定する。合格証拠前の前線への近接・敵陣横断・自然交戦・正式4v4は未証明。
