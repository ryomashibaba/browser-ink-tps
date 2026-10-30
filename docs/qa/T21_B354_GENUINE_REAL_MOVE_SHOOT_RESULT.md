# Browser Ink TPS — B354 実W移動・Spaceジャンプ・射撃の同時真正物理確認

**2026-10-30 JST／QA研究・技術限定PASS**

- QAブランチ正本: `dev/t21-f4e103w-qa-infra`、検証対象HEAD `b71a83537ea0205ba622e74c5fe10fec1cf1b813`
- [完全CI #41074157473](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41074157473): **SUCCESS**。Node負検査・ビルド・実Chrome/PlayCanvas・B337/B344/B345/B346/B348/B349/B353/B354の独立監査ステップすべて成功。
- 真正Wキー継続中の水平移動: **2.6477 m**
- W移動中の真の物理シューター: **6発＝地上2、空中4**
- 真の銃口の水平変位: **2.3799 m**
- 実Space KCCジャンプ: 上昇 **1.0333 m**
- 全体の実物理弾Launch/Exit: **10/10**、地上4・空中6
- 原作Paintable実衝突: **10**、原作側の人間塗装変化イベント: **449**
- 実CPU HPヒット、物理CPU衝突、B351演出: **すべて0**。B353は独立監査上も `HOLD_NO_GENUINE_CPU_HP_HIT_OBSERVED`。勝手な敵HPダメージ、架空の敵・経路を追加しない。
- ゲームSOURCE境界: Rapier 25 / Paintable 17 / original NavLink 26 / Scoreable 0。敵自然対岸経路0/12、正式結果・4v4・productionはHOLD。

## 技術的に重要な反省と再発防止

[初回CI #41068787657](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41068787657)は、実際には`HOLD_36`で空中・物理6発まで到達したが、重いCDP screenshot取得後に別のKCCスナップショットを読んで着地状態になり、`ACTUAL_SPACE_DID_NOT_MAKE_PLAYER_AIRBORNE`でFAIL。修正コミットでスクリーンショットを**射撃/Space操作の完了後**に移し、射撃ループに撮影を挟まない静的負検査を追加した。

この技術PASSはNintendo原作の射撃精度・拡散値・アート・サウンドの一致を意味しない。写真は操作後の真正フレームであり、空中の瞬間を証明するのは同一物理のKCC/弾/キーイベントJSON。証拠アーティファクトの保持期限はGitHub Actions設定に従う。正式4v4・原作得点・全経路完成と表記しない。

## 次のゲーム機能

1. SOURCEで許可された実射撃＋移動＋塗装＋インク残量/回復＋視認と命中演出の一体的な遊びやすさを改善する。
2. 真正敵CPUへのHP減少については同一自然経路が存在せず、証明できる原作Source接続点の研究を別途進める（架空の床・NavLinkや位置変更は禁止）。
3. 原作基本武器の性能/操作/アニメーションは一次資料に基づいて別途差分検証し、独自研究モデルを原作準拠確定と呼ばない。
