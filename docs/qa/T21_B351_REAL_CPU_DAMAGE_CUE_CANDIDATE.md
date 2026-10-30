# B351 — SOURCE-only real CPU damage feedback research candidate

2026-10-30 JST. B349 native Chromium #41016263622/#41016386310
is already SUCCESS; those earlier runs do NOT certify B351.

Only on explicit SOURCE 180s QA with 25 original Rapier solids,
17 Paintables, 26 original NavLinks, 0 Scoreable and opt-in
B343/B345/B346/B348 plus t21W10B351=realCpuHitCue:
the genuine physical human pulse-sprayer bullet is resolved against
world surfaces and enemy actors. If CpuAgentSystem.applyProjectileHit
has REALLY reduced enemy HP, existing humanCpuDirectHits increments
by one and a small visual effect and distinctive tone are displayed
at actual physical CPU impact. Guard-blocked, wall-hit, paint-hit,
CPU-fired shots and other weapons cannot generate the new cue.
The cue does not modify damage, HP, ink, collision, projectile count,
AI, timer, original source geometry or authoritative scoring.

Existing B349 native launch-stance CI reuses Vitest/TypeScript/build
for B351 negative checks. No new CI workflow. Actual native enemy
HP loss + cue/frame capture is NOT YET verified. Official Nintendo
visual/audio match and ART remain HOLD; 0/12 opposite-team route,
no Scoreable, 4v4, winner and production HOLD.


## 2026-10-30 B351 CI検証更新
[CI 41060649046](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41060649046): B351 negative Vitest, B349 witness tests and TypeScript/Vite build SUCCESS. Real original-CPU hit+HP loss+world cue in one native Chromium scene is NOT certified; no legitimate cross-team access (0/12). Unit success is not playtest success. ART and official 4v4 remain HOLD.


## B353 — 同一真正ChromiumのCPU実HP/命中演出の結合確認

既存B349の原作SOURCE・本物CDPマウス/Space/実弾ドライバーを使い、B351 QAオプトインを追加。既存Bチーム4人の物理足元・HP、プレイヤーの実物理弾CPU衝突Exit、`humanCpuDirectHits` の変化、命中エフェクト発生カウンター、インク塗装を**同じ真正セッション**で採取する。新たな架空CPU/床/HP変更/時計操作なし。独立B353監査はHP減少0ならHOLD、実ダメージがある場合のみ衝突Exitと演出カウンターの一致を要求する。既存の実フレームバッファ2枚も保存するが、演出の画面内確認・音の原作一致は別途ART HOLD。新ワークフロー追加なし。新HEAD CIの結果に基づいて合否判定。
