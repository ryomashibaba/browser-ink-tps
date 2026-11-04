# T21 B448/B449 — A3本物の原作SOURCEゴール到達：独立2ブラウザ世界の真正証拠

**2026-11-04 JST／研究オプトイン限定。** 安全閾値変更・Actorワープ・地形/NavLink追加・公式時計/score/winner合成なし。ゲーム制作採用ではなく原本同側のCPU移動研究のみ。

## 1. 実行と証拠
- **B446基準（読み取り専用）**：[Actions #41846226630](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846226630)、[Artifact #13330584207](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846226630/artifacts/13330584207) — SUCCESS、native worldOrigin `1793801954133.4`。A3の実物理足から既存の原作床候補32件中**15件**が全Rapier/Recastをstrict PASS。ただし本試験でのA3実Crowd前線目標は**0件**。
- **B448実装・真正7CPU**：[commit c2a910a](https://github.com/ryomashibaba/browser-ink-tps/commit/c2a910a49fe62e9f537f6a137b36e2ecf22d7ecb)、[Actions #41847809446](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809446) — **SUCCESS**、[Artifact #13334746304](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809446/artifacts/13334746304)、worldOrigin `1793802997556.8`、本物の**724 native ticks**。研究フラグ `t21W10B441=sourceFrontline&t21W10B448=realA3Front` でのみ実行。
- **B449独立検証**：[code/test commit 18cd6ce](https://github.com/ryomashibaba/browser-ink-tps/commit/18cd6ce1d9ff781841b9d90d103c0138c3551b94)、[CI #41849644085](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41849644085) SUCCESS、3/3 Node unit + 10 forged input rejects。**2つの実Artifactを入力**し、`node scripts/t21-b449-a3-real-goal-progress.mjs b446-native.json b448-native.json` を実行。実結果は `PASS_ACTUAL_A3_DIRECTIONAL_APPROACH_ON_REGISTERED_SOURCE_NOT_4V4`。

## 2. A3の真正移動結果
| 計測 | 実測 |
| --- | ---: |
| 正しく再承認した原本SOURCE同側目標 | 1件 |
| A3本人実Crowd目標要求 | 43回 |
| 初回から終点への本人物理XZ水平変位 | **15.450521798m** |
| 元ゴールまでの最初の観測距離 | 14.349228105m |
| 同一元ゴールまでの最短観測距離 | **0.009972716m** |
| 30 read-only標本における同一ゴールへの距離短縮 | **14.339255389m** |
| 上記同一区間の本人実足移動 | 14.339468850m |
| 7CPU実SOURCE / native tick | 7体 / 724 ticks |
| Actor/clock/score/SOURCE geometry writes | 0 |

B446で元Rapier/Recastをdry PASSしたA3原本元ゴールXYZは `[3.375599288987395,4.502,37.992506688080205]`。B449はB448真正の実承認ゴールがこのXYZ（各成分0.001m以内）と一致することを確認した。追加フラグなしのA3は前線ゴール0件、B448で同原本ゴール1件を承認し、実ネイティブ位置の方向付き変位まで検証した。

## 3. 成功として主張できないこと
- **B2/B4は依然として0/32元ゴール支持**。B448は2体を変えていない。
- A3は**自陣側の原本既存右低地床へ前進**しただけで、敵陣への自然横断・敵への命中・HP減少/撃破/150tick復活・公式Scoreable/勝者・正式4v4は未達成。source 25/17/26/0、original scoreable0、winner NONE、自然跨ぎ0/12。
- B449独立判定は単一試験ペアの現物測定であり、再現性の統計評価はない。将来の全CPU・全環境で同じ距離を保証しない。
- [通常B440 #41847809357](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809357) と[従来B441 #41847809034](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847809034) は、B448改修コードSHA `c2a910a` に対してそれぞれ**SUCCESS**。これらは短時間検証でありフル試合の合格ではない。
- 2回180秒の同SHA [#41847808958](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41847808958) は本記録時点で未完了。B448に基づく正式二試合180秒PASSは未認証。先行B446コードの[#41846075962](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41846075962) は原本B322ランプ上端接地の認証に失敗しており、旧の成功と混同しない。

## 4. 次の安全工程
A3は成果を固定し、次は **B2/B4のネイティブ全経路が原本Rapierのどの面・どの区間で支えられないか**を最初の失敗位置ごとに定量化する。欠落が正規ソースの証拠不足であればHOLDし、人工床や便宜的NavLinkで埋めない。7.2.0ナワバリ本物のFace/Collision照合と、連続2回180秒・7CPU正式4v4は別の必須ゲート。

**方針：main/正式QA/Draft PR#5/Pages/原本SOURCEを保護。Chat+GitHub中心、Work事前承認、追加有料APIなし。**
