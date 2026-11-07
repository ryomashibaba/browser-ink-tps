# Browser Ink TPS — Sprint A1/A2/A3 正真正銘の受け入れ台帳（2026-11-07 JST）

**対象**: `ryomashibaba/browser-ink-tps` の `research/t21-integrated-a1-c-patrol-four-mode-20261105`。上位仕様 `T21_FAST_TRACK_ROADMAP.md` と `docs/continuity/FAST_TRACK_EXECUTION_JA.md`、[2026-11-07完全統合正本](../continuity/BROWSER_INK_TPS_COMPLETE_HANDOFF_CRITICAL_REVIEW_20261107_JA.md) の変更ではなく、後続真正実測の限定追補。研究ブランチ限定。成功の粒度はゲーム実証SHA+Actions RUN+RAW/PNG+正式HOLDの4点セットで記す。

## A1 — 同一真正SOURCE試合内の人間インク経済・物理ループ

- 実ゲームSHA `416c0ae2e130577f90d40bd464bc2245ec73a805`、[本物Chromium #42320196565](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42320196565) **SUCCESS**、Artifact `13553497551`。
- 人間の実発射 **121発**、原作塗装変更 **1,189セル**、異なる本物登録塗装面4、CPU7、実180秒 `TIME_UP` tick **11,860**。原作上段→下段→坂→上段の真正Rapier KCC。
- B413独立判定：補給前17発・インク消費16.1500、原作OWN/SQUID `+13.3167`、HUMAN戻り後14発・インク再消費13.3000。B414 HUDとB417 ownerGridは同じ本物のNative世界の観測。原作 `25/17/26/0`、公式勝者 `NONE`。B409/B410/B411/B412/B413/B414の独立ゲートPASS。
- このRUNは **実再戦の別世界クリックまでのA2証拠としては使わない**。相手への自然HP命中なし。

## A2 — 実180秒終了画面からの再戦

- 実ゲームSHA `2fbc44cf719af124500dcd768421a289f155efa5`、[真正Chromium #42309574066](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42309574066)。元RUN **全体FAIL**：B452が短時間SOURCE限定の旧判定文字列を要求したためであり、本体の実180秒・再戦データはPASS。
- Needle SMGの実発射6、実人間の塗装変更41セル、CPU7、実180秒終了tick11,859、Native時計10804 tick、**実再戦ボタンをクリックし新世界のSTAGING/tick0/180秒/CPU7/同じNeedle SMGを確認**。
- 同じ元真正Artifact `13548989370` を再取得し、判定器の短時間限定条件だけを修正したSHA `9595899164f5cc8d936b9590bf4ee5882dcaa078` の[監査CI #42314431496](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42314431496)が **SUCCESS**。B450、B452、B454独立監査を実RAWに対して再検証。**新しい180秒試合を捏造も再実行もしなかった**。B454のB2/B4各729 tick物理足データも元RUNの情報。
- A1のインク経済・原作KCC経路とA2の再戦は**同一RUNでの総合PASSではない**。ここを統合したと断言しない。

## A3 — A1練習CLEAR後のPLAYER視界とF8切替

- CSSバッチSHA `6c95555638418dac361ed1bab1a53323c1e1c87d`、実画面専用短縮RUNのSHA `f3cd7cad5f65329e48676931a6d2a5af6fbc33d4`。前者の短時間B441は[CI #42325497628](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42325497628) **SUCCESS**（A1画面の直接証拠ではない）。後者の[実画面#42326607158](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607158) **SUCCESS**、Artifact `13556082019`、RAW `a3-real-a1-clear-player-f8.json`。
- `PLAYER` native tick **2399**：本物A1練習CLEAR、SOURCE物理25/17/26/0、CPU7、SHOT60。左上の重複する `b195-next` / `b195-time` はCSS非表示、**実B414 ink/B417 paint/中央の時計/F8を維持**。
- `F8 QA` native tick **2435**：非表示になっていた説明と時間が再表示、B414 inkとB417原作塗装セルも保持。通常PLAYERだけの省略で、詳細QAの情報削除ではない。
- `PLAYER復帰` native tick **2471**：重複行のみ再び省略、インク/塗装/時計は維持。3画面を1600×900で真正PNG保存し、ログと独立CIで寸法・段階・実native provenanceを照合。***この短縮RUNは新しい180秒完走を証明しない***。
- 同SHAの[独立A1協力回帰 #42326607161](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42326607161) **SUCCESS**、Artifact `13555696935`。本物A1塗装着弾1件、変更36セル、真人間協力練習CLEAR tick1827。A3とは**別のRUN**。

## 未完了の最上位ブロッカーと開発優先

| ゲート | 最新判断 | 制約 |
|---|---|---|
| F3/A1 狭義人間SOURCEインクループ | **限定PASS** | 全4モード×12武器・対岸自然戦闘ではない |
| F3/A2 1武器・1モードでの180秒→実再戦 | **限定PASS** | A1とは別RUN、2戦目180秒の全要素は未証明 |
| F5/A3 A1 CLEAR中のPLAYER/F8復帰 | **限定PASS** | ART本人合格・全画面/全武器保証なし |
| F4 同一版原作の衝突権限 | **HOLD** | 25 solids / 17 paint / 26 NavLink / **0 Scoreable** |
| 自然敵味方16原作経路 | **0/16 HOLD** | 原作Face・collision flags・CPU0.30mカプセル連続支持が未認証 |
| 公式HP敵撃破/150tick復帰/得点/勝者 | **HOLD** | 公式Winner NONE、正式4v4未認証 |
| ART・公開・PR#5 merge | **HOLD** | 本人判断・安全ゲートと承認が必要 |

**以後の効率方針**：この受け入れ済み限定範囲を毎回の新180秒RUNで再証明しない。A3の小さなHUD整形バッチを凍結し、修復すべき再現不具合がある時だけ行う。新規F4の権威ある同版実ソース原本が入手できない限り、安全なSOURCE内で遊びの本質を変えるF3/F5を優先。毎回の新機能は「実際に何が遊べるようになったか」で判断し、ゲーム本体をいじらない検証器・文書だけを無限に増やさない。原作床・NavLink・敵移動・HP命中・Scoreable/得点・本番/Pagesに虚偽または代理の承認を入れない。

**安全**：main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9` 不変更、Draft PR #5 Open/unmerged。T19C/T20、本番、原本、PRIVATEを保護。Chat+GitHub、Work事前承認、追加課金原則0円。
