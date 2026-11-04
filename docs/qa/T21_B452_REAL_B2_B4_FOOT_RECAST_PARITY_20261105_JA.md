# B452 — 実B2/B4物理足と元Recast拒否点を同一Chromium世界で比較

**2026-11-05 JST**。固定F1–F5、原本SOURCE 25/17/26/0、対岸自然横断0/12、正式4v4/ART/production HOLD維持。

## 先行真正B451の重要な新事実

- [真正720tick #41857128252](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41857128252) **SUCCESS**、研究ゲームSHA `e8aef6c4925d898c65cc9a2a99922a7a95120968`、本物7 CPU / 722 native ticks / 独立分類 PASS。
- B2とB4各30候補の最初のRecast拒否地点はすべて、登録済みの元床 `UndertowT21D:first-drop-landing-negative-z` にRapier hitが存在し、元Recast中間点の高さ差0.25m超過。**原本Floor不在ではなく、Recast経路Yと元Rapier接触高さの不一致である。**
- 同じRAW `b440-short-real-original-human-foot.json` の30実native frame標本から、B2本人の真の物理足と全拒否Recast標本の最短水平距離は約 **0.073554m**（tick1096）、B4は **0.060853m**（tick1096）。実CPU足の高さはどちらも約3.100m、その付近のRecast点は約3.28m。
- ただしB446原本拒否点は別tickのRecast経路であり、**同じ世界であることと同じnative tick・同一KCC通過であることは違う**。24tick程度のサンプルは全60Hz KCC足連続接触の証拠ではない。

## 本工程

既存のB441短時間真正Chromiumを一回再利用して、`scripts/t21-b452-native-foot-vs-recast-audit.mjs` が**元のB450/B451拒否点**と**同じ実世界の実CPU B2/B4足フレーム**を全部独立照合。偽造SOURCE/CPU欠落/フレーム非増加/原本Y一致に見せかけた改変はfail-closed。約24tickの未観測区間数と近接実距離を記録し、`b452-real-foot-vs-original-recast.json` を元RAWと同じArtifactへ。Node否定ケーステストは既存B441事前チェックに統合し、新CI workflow・長時間runを追加しない。

**採用禁止のまま**：B2/B4のFrontline goal / score / enemy crossing / fake Recast vertical projection / KCC actor warp / physical foot rewrite / 0.25m許可閾値緩和。真正B452も「同じ地点付近を実物理足が通った」の限定分析にとどまる。B2/B4で原本連続KCCを証明するためには、一つの同じnative走行で元の安全権威を満たす連続ルートを独立検証しなければならない。

本コミットのコード提出＝実Chrome成功ではない。対象workflowがSUCCESSになりArtifact内のB452原本JSONが読めるまで真正判定は未認証。
