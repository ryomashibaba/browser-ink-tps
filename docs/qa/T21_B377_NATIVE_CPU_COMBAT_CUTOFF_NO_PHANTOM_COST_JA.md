# Browser Ink TPS B377 — 180秒最終TickのCPU実弾とインク消費の整合性

2026-10-31 JST。既存F1〜F5方針と原作Source QAブランチを維持。

## 発見と修正
前工程B376は、0:00遷移後にキューからCPU弾を捨てて物理発射を防ぐが、元の `CpuAgentSystem.fixedUpdate` はその前に7体それぞれの武器判定・サブを実行していた。これらは新規弾をキューに入れると同時に**本物のCPUインクを消費し、CPU射撃数やkit発動数を加算する**。よって「見えない弾のインク消費・射撃回数」が残り得た。B376はその点で不完全だった。

B377では `nativeSourceCpuCanStartActionsBeforeTickEnd()` が、SOURCE現行の試合時計 `remainingSeconds` と実60Hz `dt` だけから最終Tickを推定し、**CPUの発射判断前**にB377のオプトイン可否を渡す。最終Tickなら `CpuAgentSystem` の7体の武器判定・サブ/スペシャルキュー・paintAtBotへの新規ペイントを行わない。同時に Recast/Crowd、真正Rapier共有カプセル・KCC、CPU座標、HP回復・被ダメージ、復活判定、タイマー進行をそのまま続ける。前工程B376のCPUキュー後段ゲートは引き続き第二のfail-closed防御。

- `CpuAgentSystem.fixedUpdate` 末尾にoptional `canStartNewCombatActions=true` を追加。従来のT20/他のCPU呼出元は明示していないため既定動作は変わらない。
- 現行SOURCE F3は `this.matchState` / `remainingSeconds` / `seconds` / `stopReason` から早期に判定し、CPUへの引数にのみ渡す。誰の位置も動かさず、将来のルートやスコアを認証しない。
- 既存の `UndertowF3PlayableHud.test.ts` に、STAGING、通常PLAYING、最終Tickちょうど、端数、異常時計、停止の回帰試験を追加。
- これは主張範囲を制限した実装と単体試験であり、CIキュー完了・真正Chromium等の実測前にPASSに昇格しない。

原作境界25 solids / 17 PaintSurface / 26 NavLinks / 0 Scoreable、敵陣自然経路0/12、正式4v4・得点・勝者・production HOLD。main/公開Pages、凍結T19C/T20、Draft PR #5、非公開OBJを変更しない。

これ以上ミクロなQAに分割せず、次工程で既存CIを確定し、原作証拠のあるCPU戦闘・プレイヤー射撃等のゲーム体験を優先する。
