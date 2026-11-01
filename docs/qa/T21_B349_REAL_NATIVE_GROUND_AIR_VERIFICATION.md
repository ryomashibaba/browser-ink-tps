# T21 B349 actual source KCC jumping shooter physics evidence

B348's stationary real Chromium physical candidate #41014778484
**PASS**: 10 genuine shooter physical launches and original Paintable
collisions, maximum 2.389052 degree physical deviation, actual
0.238686m impact spread, 135 original-owner changed cells versus
B346 fixed-aim 91. Ground stance 10 / air 0 in B348.
The proposed distribution is project research, not exact Nintendo.

B349 genuine Chromium uses human CDP native Space keyDown at +24
engine ticks during actual mouse held firing; KeyUp after +36 ticks.
The original Rapier KCC must show real grounded -> airborne with
vertical body movement -> genuine grounded landing, without
teleport, fake input, added collider, injected shot, tick or ink.

The actual physical B346 bullet launch witness records the real
native KCC grounded boolean for each bullet ID. New B349 independent
auditor compares original per-shot boolean and 3D velocity to B348
physical evidence and requires 2+ genuine ground launches and 1+
genuine air launches and consistency with actual weapon counters.
Real input, original foot, original paint, and B337/B344/B345/B346/
B348 independent validators remain active.

This is a structural physical shot/stance QA, **not** a validated
original-game jump/accuracy profile or visually finished weapon.
The exact original 25/17/26/0, natural opposite team 0/12, art HOLD,
winner NONE, full 4v4 HOLD and production false must not change.


## 2026-11-01 — B349真Chrome起動前のSOURCEモード矛盾を修正

実ジョブ [#41275901729](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41275901729) は 64ファイルの本体テストとは別にB349専用Node/Vitest/ビルドを通過したが、Chrome `pointerLockElement` の20秒待ちでFAIL。最初は単なるクリック/フォーカスの問題か不明だった。

起動ボタンの厳格な実hit-testを追加した後の [#41276492861](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276492861) では、DOM `#boot-error` がボタンを物理的に覆っていることを確定。さらに実ブート例外の本文を記録した [#41276606770](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276606770) で、**`B373_UNTRUSTED_SOURCE_PRACTICE_RECAP`** が原因と判明。

**根本の矛盾:** B349実ブラウザドライバー2本は古い `t21W10B193=allyCoop` を URL に指定していた。このモードは実装の `sourceCoopEligible(q)` により `b183DropPlayEnabled=false` とする。一方、同URLは `t21W10B343=sourceVolleyAtomic` を指定し、B373では実物理 B186原作回路 `enabled=true` を要求するため、起動時点で必ず整合性エラーになる。これは原作のジャンプ・弾道の不合格ではなく、テスト起動契約の不一致。

**修正:** [`1b2c26c5dafd...`](https://github.com/ryomashibaba/browser-ink-tps/commit/1b2c26c5dafd68b016b1dbdf8f7c01af4df2c5b6) で、2本のB349ドライバーの実URLと厳格一致照合の両方を、既存B343真正Chromeと同じ `t21W10B192=humanCombat` に変更。静的回帰では古い `allyCoop` 再使用を拒否する。B373の不正回路・実績・source権限を検出する安全検査は一切緩めない。

B349実ジャンプ中の本物の地面/空中射撃・元の25/17/26/0・元CPU7体を評価する物理判定は未変更。新しい真正Chromium [#41276813715](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813715) と [#41276813748](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813748) の成功/失敗は、ジョブ完了・実ログ照合まで **PENDING**。元ステージCPU自然接敵0/12、原作FloorLine00の衝突権限、ART、正式4v4、Scoreableは一切認証していない。


## 2026-11-01 — B349 root-cause correction, independent real browser PASS

**AUTHENTIC B349 PASS** on the exact fix SHA `1b2c26c5dafd68b016b1dbdf8f7c01af4df2c5b6`. The prior boot error was traced to the incompatible original `allyCoop` flag and corrected to actual `humanCombat` without disabling B373 recap safety checks. Both independent genuine Chromium jobs finished SUCCESS (not just unit testing):

- [B349 physical KCC + original shoot #41276813715](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813715): 10 genuine native physics bullets, four grounded and six airborne; actual Space key press/release, original Rapier KCC vertical rise **1.0333m** and genuine landing. All 10 physical bullet exits collided with original paintable source; native sample 466 original changed cells. Native simultaneous genuine W + jump + held-fire moved human horizontally **2.6477m**, generated six moving shots (two grounded/four airborne), muzzle horizontal travel **2.3799m**. Human ink genuinely recovered from 90.5 to 98.5 after firing. Independent B353 reported `HOLD_NO_GENUINE_CPU_HP_HIT_OBSERVED`, not a simulated enemy hit.
- [Independent real CDP air shooter #41276813748](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813748): four grounded / six airborne genuine source projectiles, all 10 exited on original paintable source; native 7/7 CPU present, actual 405 source changed cell events. Different runner, starting positions & trials; identical scope.
- [Complete B75 genuine WebGL2 SOURCE HUD #41275901752](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41275901752): preflight 64 test files / 325 tests PASS; B287 actual Chromium selected-weapon READY and F8 PLAYER/QA PASS; FIXED and SWEEP real native source HUD Chrome jobs both SUCCESS. These results apply to the earlier `a067b7687a3245a81fe8086dc82cce8ab078f65f` code SHA.
- Subsequent user-facing actual KCC **ground/air** read-only HUD improvement `82819b5dd6979c6b33f984e26604eba780b36bcc` adds native `KCC GROUNDED / KCC AIRBORNE` and real Space jump hint to the standard 180s PLAYER display; it changes no physics or shooter abilities. Its fresh browser/code CI must be inspected separately before certifying that UI.

**Scope limit:** This is true native-source human movement/fire verification, NOT source game weapon accuracy parity, natural enemy encounter, opponent CPU ground routes (still **0/12**), original FloorLine collision authority, official 4v4, winner, ART acceptance or production authorization. Frozen stage remains exactly **25 solids / 17 paint / 26 nav links / 0 scoreable**. No artificial geometry, native tick, actor teleport, score or fake hit was added.


## 2026-11-01 — 同じ実Chrome物理フレームからPLAYERジャンプ表示を検証

既存のB349真正Chrome実ジャンプ・移動・射撃試験へ、独立したPLAYER HUDの**同時実測**を追加した。同じ`Runtime.evaluate`で実`window.__t21F3.snapshot().b349ActualKccGrounded`と表示`#t21-f3-b338-source-guide`を読み、`KCC GROUNDED`／`KCC AIRBORNE`・SPACE案内・本物の武器案内が一致するか、PRE_FIREとHOLD_12～60で厳密にチェックする。違えばFAIL、`b338-native-kcc-player-guide.json`の小さな実tick証拠を既存artifactに保存。リアル物理・Actor・射撃・Paint・地形・ナビ・scoreを変更せず、held-fire中の遅いスクリーンショットも追加しない。

コード投入のみで新たなChrome成功は保証しない。従来のB349接地4発/空中6発の独立真正ブラウザPASSは [#41276813715](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41276813715) に保持。今回の画面照合は、新しい同SHAジョブでSUCCESSを確認して初めて認証する。F4 FloorLine00原作衝突権限未確認、CPU自然接続0/12、正式4v4/ART/本番公開HOLD。

## 2026-11-01 — 真正Chromium B338＋B349同フレームHUD照合：PASS

同SHA `3f49d367202fc2c50c9bd1732285408582728cb7` の [Actions #41278709939](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41278709939) は **SUCCESS**。新しい厳格B338は、原作SOURCEの同一CDP readで実KCC接地・空中と画面`KCC GROUNDED/AIRBORNE`、`SPACE JUMP`、武器案内、PLAYER/PLAYING、書込み0を照合し、PRE_FIRE/HOLD_12～60の実tick証拠`b338-native-kcc-player-guide.json`をartifactに保存した（Artifact ID `13072262011`）。実射撃は地上4/空中6の10発、身体上昇1.0333m、移動射撃6発、実移動2.6477mで原作25/17/26/0を維持。

**注意：** 同回のB357独立視覚サンプルは `HOLD_REAL_SHOOTER_AND_PAINT_BUT_NO_MATCHED_LIVE_RETICLE_CAPTURE`、着弾事実は実証してもレティクル表示の同一瞬間を捕捉できていない。B338表示一致PASSをB357の瞬間表示まで広げない。真正CPU HP被弾0/自然経路0/12・4v4/ART/公開HOLD維持。
