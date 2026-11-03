# Browser Ink TPS — START HERE / 新チャット固定入口

**このファイルは研究ブランチ research/t21-b406-single-session-real-enemy-range-audit-20261103 の引き継ぎ入口。**
実装・同SHA Actions・永続方針をGitHubだけで再開し、ZIPやチャット長文の再提出をユーザーへ依頼しない。

0. **最新進捗・優先入口**：[2026-11-03 B408真正180秒原作再照準PASS／B409原作上段実走＋同一180秒統合研究](docs/continuity/HANDOFF_20261103_B409_PROGRESS_JA.md) を先に読む。B405/B406/B407/B408の既完了工程を繰り返さず、B409は最新同SHA Actionsと原本を照合。従来のB408中間引き継ぎは下記リンクから残す。
1. **最優先**：[2026-11-03 B405真正180秒・B406までの完全統合引き継ぎ](docs/continuity/HANDOFF_20261103_B406_COMPLETE_JA.md) を全文読む。
2. **過去から固定の永続方針**：[正本QAの固定入口](docs/continuity/START_HERE_JA.md)、[DECISIONS_JA.md](docs/continuity/DECISIONS_JA.md)、[FAST_TRACK_EXECUTION_JA.md](docs/continuity/FAST_TRACK_EXECUTION_JA.md)、[F1–F5](T21_FAST_TRACK_ROADMAP.md)、[T19C/T20凍結設計](CURRENT_CANONICAL.md)を継承。
3. **GitHub実HEADの取り直し**：本研究ブランチ、QA dev/t21-f4e103w-qa-infra、mainおよび同SHAのGitHub Actions、Draft PR #5を照合。文書コミットでHEADが変わるので過去SHAを現在値と決めつけない。
4. **真の最新成果**：[B405単一真正180秒PASS #41601683883](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41601683883)。人間実射撃9発・実塗装92セル、CPU実塗装11,773セル・SOURCE発射要求108、実tick11855 TIME_UP、敵への実HP命中/撃破/復活0。
5. **最新SOURCE限定実証PASS**：[B406同じ真正試合の敵距離・SHA-pinned artifact再審査 #41604651650](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41604651650) **全ステップSUCCESS**。原本artifact 13216270763。7native時点の最近敵距離116.991〜119.324m、真の敵HP命中0、対岸経路0/12。Unit [#41603445518](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41603445518) もPASS。別セッション比較B404 97.553mを真の同時遭遇に取り違えない。
6. **今後の実作業**：本物のゲームの遊べる品質最優先。原作の実KCC/人間射撃・塗装・7CPU・180秒を自然な一連の実操作に結合し、実敵遭遇→本物のHP減少/撃破/150tick復活を原作物理で目指す。F4の元衝突権威未確認は当該部分のみHOLD、QAマイクロ試験だけを増殖させない。
7. **絶対安全条件**：25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable、対岸自然認証0/12、activationReady=false、正式4v4/ART/production HOLD。架空床/橋/Actorワープ/敵HP捏造/偽弾/score/時間注入は禁止。main/QA/T20/Draft PR#5/Pagesを勝手に書換・merge・公開しない。
8. **運用**：Chat+GitHub中心。実際のコード改修・CI検証・保存まで進める。Workはユーザー事前承認制。ユーザーのPC操作不要、費用と時間を節約し品質は妥協しない。

新しいチャットには、次の1文とこのファイルURLだけで十分：

> Browser Ink TPSの開発を再開してください。GitHubの研究ブランチ START_HERE.md とB406完全統合引き継ぎを読み、既存のF1～F5/原作SOURCE/保護条件を継承。B405真正180秒PASSとB406同一試合距離再検証PASSを確認し、これまでの成功と失敗を踏まえ、次の実プレイ品質改善を実装・検証・GitHub保存してください。
