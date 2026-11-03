# Browser Ink TPS — 2026-11-03 B411 真正PASS／B412 nativeイカ泳ぎ統合

## 固定の引き継ぎ
リポジトリ `ryomashibaba/browser-ink-tps`。研究ブランチ `research/t21-b406-single-session-real-enemy-range-audit-20261103`。先に `START_HERE.md`、B406完全統合正本、`DECISIONS_JA.md`、`FAST_TRACK_EXECUTION_JA.md`、`T21_FAST_TRACK_ROADMAP.md` (F1〜F5)、`CURRENT_CANONICAL.md` を確認。研究のSOURCE限定成功を正式4v4に昇格させない。実装はChat+GitHub、Workは承認制。

## 真正成功実績
[B411本物Chrome試合 #41630809201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41630809201)、実コードSHA `bee39cd1310c77a18d081b3e4cd5af4ceba920c8`、artifact `13229516996`、全ステップ・独立監査SUCCESS。CPU7体と同一原作sourceの180秒 TIME_UP tick11855。人間84 shots／1,130 original ownerGrid changed cells、CPU source shot requests145／実塗装12,258 cells、真正4つの原作PaintSurfaceへの人間射撃。元の高所→初着地→上り坂→右上段を本物Rapier KCCで移動。後半120/60/30秒の本物CDP 24 shots／追加197 cells／合計8.740654452743925mの4方向実移動。B411では実試合中に大きな練習CLEAR/カード/再戦を画面から除去し左上コンパクト表示、真のTIME_UP後に元の再戦復帰が独立真正PASS。**B405〜B411同様の実成果を繰り返し開発しない。**

## 新B412 — 原作SOURCEインクで実イカ泳ぎ
- 新研究専用 `T21_B412_REAL_ORIGINAL_SQUID_SWIM=1` は既存B411＋B410真正ルートの使用を必須にし、原作右上段の本物の120秒塗装targetを、90秒チェックポイントで再利用。実ShiftLeft・W短入力でPlayerControllerがネイティブHUMAN→SQUIDとなり、原作ownerGrid `OWN` と `SWIM_GROUND`、Rapier原作右上段支持・実移動を全部同時証明する。実S入力で元の位置近傍に物理的に戻り、Shift解除でHUMAN。カメラ位置/Actor/Stage/Ink/Shot/tickへ直接代入しない。
- 既存の一つの180秒Chrome CIを再利用し、B315/B316/B322/B324/B326/B409/B410/B411の元RAWと合わせてB412の独立監査を実行する。上段から落ちる、OWNのインク泳ぎが存在しない、イカ中勝手に弾が出る、ヒトに戻れない、次の残り60/30秒実射撃・180秒完走を妨げた場合は真正B412 HOLD。原作未確定の道を追加せず、同一ソースの実結果から次の安全な物理操作を判断。
- **B412は同SHAの本物GitHub Actionsが成功して初めてPASS。Nodeユニットテストや文書のみでは成功としない。**

## 凍結条件
ゲーム原作Ver.7.2.0マテガイ放水路の通常ナワバリ。25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable、対岸自然Recast 0/12、activationReady=false、元の公式得点/勝敗NONE、enemy HP hit/splat/150tick respawn 未立証・実HP命中0。正式フル4v4/ART/本番はHOLD。架空床・リンク・Actorワープ・速度不自然補正・原作衝突権限偽装・偽のインク/Hp/時間禁止。main、正式QA、T20、Draft PR#5、Pages書換禁止。PC操作なしでGitHub Actionsの原本証拠を見る方針。
