# T21 B442→B443 — 実CPUの原作前線目標「到達」と往復抑制

**2026年11月4日：真正Chromium実証＋未確定の修正実験を峻別。**

## B442：真の720 native tick / 独立読取Artifact

- GitHub Actions [#41831434397](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41831434397) はSUCCESS、研究SHA `1aaefbb2617edea2ac3999bf2265b66922648f0a`。[Artifact 13323282636](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41831434397/artifacts/13323282636) の `b440-short-real-original-human-foot.json` → `b441NativeEvidence` に真正SOURCE original 7CPU、Recast承認ゴールと足、原本tickのread-only証拠が含まれる。
- `realNativeTicks=721`（目標720）、`strictOriginalGoalsAvailable=6`、`actualGoalRequests=112`、`b442ObservedUniqueGoalArrivals=3`。**7CPU実身体・原本物理足・勝敗NONE、原本SOURCE25/17/26/0、時刻/Actor/Source/Score改変0**。
- 30観測フレームで、実承認済み原本ゴールまでの水平距離が1.5m以下になったものだけを「実原本目標近接」認証する。

| CPU | 実承認ゴール最小水平距離 | 30点中の目標観測回数 | 別目標への切替（連続観測間） | 認定 |
| --- | ---: | ---: | ---: | --- |
| A2 | 1.439947m | 30 | 13 | 原本同側ゴールへの近接PASS |
| A3 | 観測なし | 0 | 0 | ゴール非承認HOLD |
| B1 | 0.828536m | 24 | 8 | 原本同側ゴールへの近接PASS |
| B2 | 観測なし | 0 | 0 | ゴール非承認HOLD |
| B3 | 1.313717m | 23 | 8 | 原本同側ゴールへの近接PASS |
| B4 | 観測なし | 0 | 0 | ゴール非承認HOLD |

- A2/B1/B3は、到着前後で「前線に近い既存元ソース目標」と「別の元ソース目標」を短期的に交互に要求。移動を偽造したのではなく実Crowdゴール要求の切替に由来する可能性が高い。原因は `chooseSourceGoal()` の `direct<1.5` ゴール即スキップ、および近傍2候補の優先順位再評価。
- この観測で**敵陣へ横断したわけではない**。A2/B1/B3がゴールに近づいても、敵CPUの射程・HP・撃破・復活・公式得点は未実証。

## B443：コード変更の範囲

- 実装コミット [470fda1](https://github.com/ryomashibaba/browser-ink-tps/commit/470fda1714d55362f063cbca3318915e8ef597e1)。本体 `src/app/UndertowF3SourceTraffic.ts`、純粋判定 `src/app/B443OriginalFrontHold.ts` と単体テスト。
- オプトイン `t21W10B441=sourceFrontline` 時のみ、**すでに本物の原作Rapier+Recastが承認したゴール**を記録して保持。新しい地形や新NavLinkは一切追加しない。
- 原本足が目標から1.5m以内になってからは、条件を満たす限り**120 native tick**元の目標を維持。実経路が不承認となったら即解除。初回承認後300 native tickを過ぎても到達していない場合は無期限保持しない。
- 別の原本目標に移る場合も**同じ原本足支持＋Recast中間線全点0.30m間隔の支持**を実施。Actor座標・ナビリンク・時計・HP/scoreへ書込みなし。
- `sourcePatrol.b443NativeGoalRetentions/b443FirstActualFrontlineArrivals/b443RotationsAfterDwell/b443ReleasedUnsafeOrStalled` が研究テレメトリ。最後の実承認ゴールと現物理足の距離は引き続きB442 witnessで保持。
- 新真正回帰 [Actions #41833356990](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356990) は単体/ビルド＋元SOURCE実720tickを確認する。**この資料作成時点ではB443の実機結果は未認証**。

## B443の合格条件と今後の優先順位

1. 新native実証で、A2/B1/B3について元ゴールへの安全な到達の記録を保ち、同じ30サンプルで旧B442の合計29回（13+8+8）を超えて頻繁に切り替えないこと。原本CPU実生活/攻撃に悪影響がないことを確認する。もし増加・滞留・7CPU欠員ならHOLDし、原因をArtifactから修正する。
2. 目標受理がなかったA3/B2/B4は次段階で**同側原本の足／Recastが不許可の箇所を実証**し、自然に有効な候補だけを追加評価。人工床/Actor teleportで成功したとみなさない。
3. 7.2.0ナワバリの2.0.0由来敵陣侵入スロープの正規Collision/Faceの照合が残る。正式4v4、自然交戦、HP/撃破/150tick復帰、公式スコア・勝者、ART/本番はHOLD。

**過去の2試合180秒真正成功は有効。B443コードのCIがSUCCESSでも、その後のArtifactで実目標切替・本人動作を確認するまで美術・正式4v4・自然交戦をPASSにしない。**
