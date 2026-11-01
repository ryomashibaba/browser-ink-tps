# B390 — 実12武器SOURCEの180秒完走・終了・同武器リプレイ

2026-11-01 JST。実装ブランチ dev/t21-f4e103w-qa-infra。B389実ブラウザ [#41270601156](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41270601156) は本当の原作B183落下→B186坂→塗装3/3、同一命の実ミッション達成、Esc一時停止→ユーザーによる同武器の新しいSOURCE世界→native tick 18まで成功。一方B210 [#41266517229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41266517229) は別の通常SOURCE設定で実180秒、TIME_UP、新試合リプレイを成功。B384の12武器で実180秒のTIME_UP、B387原作達成数を維持した終了画面からの同武器リプレイはまだ別の未認証工程。

今回、**同じ実B384 3/3達成後のPlayCanvas/Rapier/Recast/7 CPU/Twin Cometsを中断せずに**、真の60Hz物理で残りの試合時計を進めるB390モードを既存B385 Chromeドライバへオプトイン接続。元のB389即時再挑戦は既にPASSなのでこの長時間検証では重ねない。途中は実native 20秒ごとにtick・実人間射撃と塗装・実CPU7と射撃塗装・B387本当の現試合達成1回・Scoreable0をJSONとActionsに記録。必要に応じ、本当のCDP人間マウスで武器を使用する。コードによるtick送り、時計短縮、ステージ補完、Actor移動、インク注入は一切行わない。

終了ゲートは native timeRemainingSeconds=0、tick>=10800、真正TIME_UP、7 CPU実復帰、元3/3のB387実履歴1、非得点END画面の時計00:00/実人間塗装一致/CPU7/元達成表示/正式winner NONE。さらに終了画面の実REPLAYボタンをユーザーCDPクリックし、完全新ブラウザSOURCE世界へnavigate、同じTwin Comets、STAGING 180秒/0tick/旧塗装とCPU射撃・復帰/旧達成履歴が全て0であることを確認。1つでも未成立ならHOLD。標準B385即時再挑戦ルートは環境フラグなしで維持。

長時間実走行のため同一既存B385ワークフローのホスト上限を75分に変更。新規CIワークフローは増やさない。初回実証成功とログ回収までは **B390結果未認証**。原作25 solids /17 paint /26 nav /0 scoreable、対岸自然経路0/12、原作正式4v4/ART/本番許可は従来どおりHOLD。
