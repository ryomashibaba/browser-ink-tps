# B390 — 実12武器SOURCEの180秒完走・終了・同武器リプレイ

2026-11-01 JST。実装ブランチ dev/t21-f4e103w-qa-infra。B389実ブラウザ [#41270601156](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41270601156) は本当の原作B183落下→B186坂→塗装3/3、同一命の実ミッション達成、Esc一時停止→ユーザーによる同武器の新しいSOURCE世界→native tick 18まで成功。一方B210 [#41266517229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41266517229) は別の通常SOURCE設定で実180秒、TIME_UP、新試合リプレイを成功。B384の12武器で実180秒のTIME_UP、B387原作達成数を維持した終了画面からの同武器リプレイはまだ別の未認証工程。

今回、**同じ実B384 3/3達成後のPlayCanvas/Rapier/Recast/7 CPU/Twin Cometsを中断せずに**、真の60Hz物理で残りの試合時計を進めるB390モードを既存B385 Chromeドライバへオプトイン接続。元のB389即時再挑戦は既にPASSなのでこの長時間検証では重ねない。途中は実native 20秒ごとにtick・実人間射撃と塗装・実CPU7と射撃塗装・B387本当の現試合達成1回・Scoreable0をJSONとActionsに記録。必要に応じ、本当のCDP人間マウスで武器を使用する。コードによるtick送り、時計短縮、ステージ補完、Actor移動、インク注入は一切行わない。

終了ゲートは native timeRemainingSeconds=0、tick>=10800、真正TIME_UP、7 CPU実復帰、元3/3のB387実履歴1、非得点END画面の時計00:00/実人間塗装一致/CPU7/元達成表示/正式winner NONE。さらに終了画面の実REPLAYボタンをユーザーCDPクリックし、完全新ブラウザSOURCE世界へnavigate、同じTwin Comets、STAGING 180秒/0tick/旧塗装とCPU射撃・復帰/旧達成履歴が全て0であることを確認。1つでも未成立ならHOLD。標準B385即時再挑戦ルートは環境フラグなしで維持。

長時間実走行のため同一既存B385ワークフローのホスト上限を75分に変更。新規CIワークフローは増やさない。初回実証成功とログ回収までは **B390結果未認証**。原作25 solids /17 paint /26 nav /0 scoreable、対岸自然経路0/12、原作正式4v4/ART/本番許可は従来どおりHOLD。

## B390 実Chromium 180秒受け入れ結果（2026-11-01、検証済み）

- **真正実行:** [GitHub Actions #41271399268](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41271399268) は SUCCESS。対象SHA `85f1da1d782132b525c6e93a2c956c76a2d25fd2`。実SOURCEプレビューをPlayCanvas/WebGL2 + Rapier/Recast + CDPの通常マウス・キー入力で操作し、真の60Hz native tickを進めた。テスト用tick注入・人工スコア・人工床・ワープなし。これは人間の手による手動プレイテストではなく、自動Chromium実操作の範囲の証明。
- **選択武器と原作経路:** B384の12武器から選んだ **Twin Comets 1種類**で、原作B183下降→B186坂と登録済み原作接地→実着弾塗装→局所3/3実クリア。途中の実原作接地移動11.4181m、落下後の新規塗装65セル。残り11武器の180秒完走認証はしていない。
- **実180秒終了:** `B390_TRUE_NATIVE_180S_TIME_UP` のログで試合経過180秒、終了時native tick **11,855**、人間実弾 **94発**・実塗装変化 **397セル**、CPU実弾 **605発**・塗装変化 **13,376セル**、CPU実復帰 **7/7**、旧局所達成履歴 **1回**、Scoreable **0**・公式Winner **NONE** を確認。画面時計00:00、TIME_UP/END、実計測値とHUD数値の一致を確認。
- **同武器で新規SOURCE世界:** END画面の実REPLAYをCDPクリックし、Twin Cometsを維持した新SOURCE STAGINGに移行。native tick 0、180秒、射撃・塗装・CPU復帰・前試合クリア履歴が全て0であることを確認。証拠アーティファクト `b390-genuine-selected-180s-source-round`（当該runに保存）。
- **残る未達:** この成功ラウンドで人間の実死亡・復活は **0**、HUMAN/CPU SPLATも **0**。したがって自然な敵との遭遇、真のHP0→150tick復活、正式な8人4v4戦闘、対岸自然経路0/12、公式塗り得点、勝敗、ART・F5・公開は引き続きHOLD。原作 **25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable**、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false` は不変。

**次工程:** 既存B210/B75の真正Chromium CI不合格を原因に即して修正しつつ、自然接敵の原作根拠・実際のプレイヤーHP0/復帰とプレイ可能な機能一体化を優先する。証拠がない接敵を偽装せず、細切れQA追加で進捗を代用しない。
