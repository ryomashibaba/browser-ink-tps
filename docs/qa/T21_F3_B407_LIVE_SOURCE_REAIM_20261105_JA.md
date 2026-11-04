# T21 F3 — 180秒 SOURCE 本物CDP照準の限定再照準（2026-11-05）

固定F1–F5/Fast Track。ゲーム本体の自然プレイと180秒2試合回帰を前進させる研究実装。**正式QA・Turf得点・4v4採用ではない。**

## 現HEADで確認した真正失敗

- code SHA `f5cb86bf9292d7c40ace36bb6af2967bf07932b1`
- [実Chromium二試合Run #41928164995](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41928164995) FAILURE、RAW Artifact `13370898200`。
- 1試合目の原本坂→上段KCCは実5.316m、実B413インク消費/OWNイカ回復/再射撃、および残り120秒・60秒の本物のSOURCE上段塗装が成立。
- 残り30秒 `B407_REAL_NATIVE_INPUT_HOLD_NO_REAL_ORIGINAL_IMPACT_AFTER_NATIVE_AIM_30`。着弾しなかった理由（遮蔽、照準位置、すでに塗装済み等）は未確定。既存プランは原本OwnerGridに基づくがヒット保証ではない。

## 安全なコード変更

- B407の既存4方向KCC・native clock・本物7CPUと原本支持判定を維持したまま、**1波につき最大3件の異なる現在の本物の近傍SOURCEセル**へ真正CDP照準・マウス押下を実施。
- 追加試行前に毎回、真正PLAYING / 7CPU / 原本source / Rapier足 / pointer lockを再確認。B408は実際のOwnerGrid候補からすでに試したセルを除外し、候補が無ければHOLD。
- PASSは元B407/B408/B410の本物の変更セル・実衝突tick・元source paint surfaceに加え、native PaintCoordinatorの新規accepted contactに限る。撃った回数・照準が合ったこと・CPUへの架空命中でPASSしない。
- ゲームのAI/Actor・原本25/17/26/0・0.25m制限・インク・clock・HP/score・T19C/T20・main・Draft PR #5・Pagesに変更なし。
- 既存B413長時間workflowのみ使用、新workflow追加なし。**本コミットの真正2×180秒結果は完了・RAW独立検証までHOLD**。

次のゲーム進展は未達成の自然CPU敵遭遇・HP命中/復活とF4原本物理接続。本修正自体を正式4v4達成としない。
