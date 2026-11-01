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

