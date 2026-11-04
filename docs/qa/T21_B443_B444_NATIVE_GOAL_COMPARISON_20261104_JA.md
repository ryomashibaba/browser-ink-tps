# T21 B443/B444 — CPU実目標切替の削減：2つの真正Chromium世界を独立比較

**2026年11月4日 JST／原作SOURCE安全研究。** どちらも別の本物のChromium/7 CPU/720 native tick、原作25 solids・17 paint・26 navigation links・0 scoreable、Actor・score・native clock・geometry書込みなし。正式4v4/敵横断/HP/撃破/復活/公式得点・勝敗/ART/本番はHOLD。

## 実データ・コード

- 旧B442研究コードSHA `1aaefbb2617edea2ac3999bf2265b66922648f0a`、[Actions #41831434397](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41831434397) SUCCESS、[Artifact #13323282636](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41831434397/artifacts/13323282636)。実世界原点 `1793796139294.9`、720tick以上、実標本30個。
- 新B443研究コードSHA `470fda1714d55362f063cbca3318915e8ef597e1`、[Actions #41833356990](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356990) SUCCESS、[Artifact #13324588065](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356990/artifacts/13324588065)。実世界原点 `1793797312729.7`、720tick以上、実標本30個。
- 独立オフライン比較 `scripts/t21-b444-native-front-goal-comparator.mjs` は2つの実Artifact JSONを入力し、各native tickのCPU7体の物理足、実承認済みのゴールと距離の整合、SOURCE/clock/score/Actor/公式勝敗、異なるブラウザ世界IDを検査。**CLIの結果は `PASS_REAL_ORIGINAL_FRONT_GOAL_SWITCH_REDUCTION_WITH_ARRIVALS`**。Node構文検査、unit **3/3 PASS**、偽のSOURCE/actor/clock/goal等**10改ざんを拒否**。[独立5分CI #41835393264](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41835393264) は本記録時点で実行待ち（成否は別途照合）。

## 計測値 — 30 read-only標本で、各CPUの実承認ゴールが変わった回数

| CPU | 旧B442：切替回数 | 新B443：切替回数 | 旧ゴール最短距離 | 新ゴール最短距離 |
| --- | ---: | ---: | ---: | ---: |
| A2 | 13 | **3** | 1.439947m | **0.008867m** |
| B1 | 8 | **1** | 0.828536m | **0.229836m** |
| B3 | 8 | **1** | 1.313717m | **0.242960m** |
| A3 / B2 / B4 | 0（対象ゴール未承認） | 0（対象ゴール未承認） | なし | なし |
| **到達できた3体の合計** | **29** | **5（約82.76%減）** | 3体とも1.5m以内 | **3体とも1.5m以内** |

B443の同側原作目標保持は「到達前の目標維持＋到達後120native tickの原本目標滞留」に基づく。原本RapierとRecast全経路の安全検証は**保持中も省略していない**。異なるブラウザ世界での2回の実走行比較であり、同じ乱数条件を厳密に固定した統計的多数回試験ではない。**一回の改善実証であり、再現率・性能向上の信頼区間はまだ不明**。

## 次の実装優先

- A3・B2・B4がB441前線目標を承認できない理由を、登録元の本物の開始足・候補点・Recast最短路・原本の物理支持を区別して計測する。**既存の目標間の安全規則を緩めない**。
- 2試合180秒の新研究回帰は [Actions #41833356991](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41833356991) で継続検証中。前の成功B438二試合180秒 [#41818029209](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41818029209) を取り消さない。
- 2.0.0侵入スロープと7.2.0全面改修のソース版照合は独立HOLD。原本の証拠がないまま人工床・人工NavLink・ワープ・HP/score/勝者合成は行わない。
