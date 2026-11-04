# T21 B450 — B2/B4の本物の原本SOURCE経路「最初の拒否点」
2026-11-05 JST / 研究 branch のみ。既存B448/B449 A3真正SOURCE目標への限定到達PASSを維持。

B2/B4が現在の真正物理足から元前線候補32件すべてを拒否したことを、実native Recastの折れ線を0.30m刻みで再走査して、最初の原本未支持サンプル点・区間・元Rapier hit solid・縦方向誤差ごとに記録する。**既存 hasSourceSupportedRoute の元ゲートは1文字も変更せず**、偽の足場、原本衝突、NavLink、ワープ、score/clock、CPU目標の変更をしない。初めの拒否地点は「本来あるべき原作面が欠落している」との認証ではない。

追加: src/app/B450OriginalRouteWitness.ts/test.ts、scripts/t21-b450-real-b2-b4-gap-audit.mjs。既存B441 720-tickの真正Chrome・Vitest・ビルド・Artifactに独立監査を同梱し、B450専用の新しい長時間CIは作らない。B2/B4の全native中間SOURCE否決と記録件数が一致し、元WORLD 25/17/26/0・score/winner NONE・actor/clock writes0でなければHOLD。成功しても同側候補の調査であり、自然対岸横断0/12・正式4v4・敵HP・原作Scoreable・ART・productionは引き続きHOLD。

この文書の保存は実Chromium PASSではない。ActionsとArtifactを別途確認する。main/正式QA/PR#5 Draft/Pagesは保護。

## 2026-11-05 B450真正720tick実測結果（新工程の根拠）

- [真正Chromium #41855055191](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055191) **SUCCESS**、研究code SHA `5f6157c6bdfd1239b05fa25f6b9c3a314fa924bb`、[Artifact #13337616434](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055191/artifacts/13337616434)。本人7 CPU / 723 native ticks、Node/Vitest/typecheck/build・独立B450 JSON監査成功。
- それぞれB2/B4 32元候補、既存Rapier/境界拒否2件、Recast中間元SOURCE拒否30件、承認0件、元SOURCE改変0。
- RAW `b440-short-real-original-human-foot.json` 内の全60件の最初の拒否標本を直接分析：**60/60が登録済み `UndertowT21D:first-drop-landing-negative-z` にRapier hitあり**。従って「そこに床のhit自体がない」は不正確。Nav経路が報告した各sample Yとその原本Rapier hit Y間の差が厳格な0.25m上限を超過している。
- B2全30標本の縦差は **0.253846–0.285714m**、B4全30標本は **0.251899–0.287500m**。最初の拒否は両CPUともnative Recast経路の **leg 0**、B2 sample 4–11、B4 sample 4–11。
- [A3 B448真正回帰 #41855055000](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055000) **SUCCESS**。同SHAでの2×180秒試験 [#41855055248](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41855055248) は本記録時点in_progress、合否は未認証。

**結論：** 真のRapier solidが存在するために不足原本Faceや架空床を追加しない。しかしsource hitがあることは Recast route / 実CPU KCC / 正式4v4 を証明しない。0.25m/0.20m/0.30mなど既存全閾値を変更・丸め・バイパスしない。次の検証はこの接触あり・高さ不一致と「接触なし」を誤って同一分類しない、研究専用の結果整理。F3の自然移動はKCCによる本当の連続路線が認証された場合のみ採用する。
