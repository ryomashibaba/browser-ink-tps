# Browser Ink TPS — START HERE / 新チャット固定入口

> **最新継続（2026-11-04）**：B413真正SOURCE限定PASSを維持。新B416（B414実HUD毎描画更新・B415進行真60Hz同期）実装SHA `20ebfaddbd90fd65cbefaf5b0a02d195b53efcd8` / [Actions #41725404578](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41725404578) は最終検証中でPASS未確定。B415旧run #41721029557、B414旧run #41721892162 のFAILを正式PASS扱い禁止。下記歴史上のB413「修正中」は古い時点の記録。main/正式QA/Draft PR5/Pages、本番・原作4v4/Scoreable0・ART HOLDを保持。

> **最新工程（2026-11-04）**：B413真正PASS維持。B415実プレイ案内HUD実装済み・CI未確定。F5/B414の実インク残量・OWN補給・再射撃DOM独立監査実装済み、SHA `abac9422fa7f6772f286b0fafbea8d6f35353e32`、[Actions #41721892162](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41721892162) の最終結果を最優先で確認すること。以下の古い「B413修正中」は当時の経緯。正式4v4・Scoreable・ART・本番は継続HOLD。

> **最新真正状況（2026-11-03）**：B413の修正版は [Actions #41651119100](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41651119100) にて本物のインク消費→OWNイカ補給→再射撃と同一SOURCE 180秒独立監査まで**限定PASS**（コードSHA `53839205a451…`、artifact `13238617827`）。B413の「修正中」は古い時点の経緯。F5 HUD研究は別SHAで独立検証中の場合があるため、そのPASSをB413から転用しない。正式4v4/原作Scoreable/敵HP/ART/本番はHOLD。

**2026-11-03 JST。継続研究 branch: research/t21-b406-single-session-real-enemy-range-audit-20261103。**

まず **[B412真正PASS・B413修正中・全体方針・実証・失敗・次工程の完全統合引き継ぎ](docs/continuity/HANDOFF_20261103_B413_TO_NEW_CHAT_COMPLETE_JA.md)** を全文読む。B405〜B412の成功を巻き戻さず、最新版のGitHub実HEADとActions・artifactを照合する。ユーザーへのZIP再提出やWindowsローカル操作を不要にする。

## 必読の永続正本（順序）

1. [B413完全新チャット引き継ぎ正本](docs/continuity/HANDOFF_20261103_B413_TO_NEW_CHAT_COMPLETE_JA.md) — **最優先**。成功範囲、B413最初の本物FAILと修正同SHA Actions、F1〜F5/技術・安全契約、失敗教訓、次工程を一括継承。
2. [B406までの旧完全統合正本](docs/continuity/HANDOFF_20261103_B406_COMPLETE_JA.md) — F4元SOURCEと直近以前の真正歴史、B405/406。
3. [永続決定と失敗教訓](docs/continuity/DECISIONS_JA.md)、[Fast Track実行基準](docs/continuity/FAST_TRACK_EXECUTION_JA.md)、[固定F1～F5](T21_FAST_TRACK_ROADMAP.md)、[T19C/T20安定正本](CURRENT_CANONICAL.md)、[正式QAの既存固定入口](docs/continuity/START_HERE_JA.md)。これらを無断で変更しない。
4. [B413の現工程引き継ぎ](docs/continuity/HANDOFF_20261103_B413_PROGRESS_JA.md) と [QA実測判定](docs/qa/T21_B413_TRUE_NATIVE_SOURCE_INK_FIRE_REFILL_FIRE_20261103_JA.md) を照合。

## 実証済み・進行中・保護

- **B412真正SOURCE限定PASS**：[GitHub Actions #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)。コードSHA 7d31501c702b725dda730047cc47db379523a400、元artifact 13233112543。**同じ真Chromium180秒**、元高所→着地→坂→右上段、実人間原作4面射撃・塗装、残り120/60/30秒の実入力、7CPU、OWNイカ泳ぎ3区間／実KCC計5.204981m、実ヒト復帰、B411試合中HUD/真TIME_UP後再戦、原作TIME_UP tick11856。人間85 shots/1025 changed cells、CPU147 shot requests/11846 changed cells。これは公式4v4・得点・敵HP命中の証明ではない。
- **B413新機能研究**：「実射撃→実インク消費→本物のイカ＋OWN回復→実ヒト再射撃」。初回 [#41644833953](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41644833953) は実ブラウザで**最初の90秒原作右上段impact証拠なしFAIL**（旧120秒CDP照準再利用が原因候補）。修正ゲームコードSHA **7fb9740ad50ebfc06fd139bac3a1146f1db2ce11** は現在の元ownerGrid＋実カメラで各射撃を再照準、Native RAW途中JSONを追加。[再検証Actions #41647713309](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41647713309) は引き継ぎ文書執筆時点で**unit/build PASS、真正Chrome in_progress**。**次チャットはこの最終結論を最初に確認**。成功と捏造しない。
- 原作凍結は **25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**、自然対岸経路0/12、activationReady=false、productionAuthorized=false、unrestricted4v4Certified=false。原作衝突未認証、敵の本物HP命中/撃破/150tick復活・正式得点/勝敗・正式4v4・ART・productionはHOLD。
- 保護：main HEAD fbd922cea900df8e1a139f21b3c61ed927b3fdd9、正式QA dev/t21-f4e103w-qa-infra HEAD 8c104658a1842218bdfeff07792b3ab35576a0c4、Draft PR #5 open/draft/unmerged（執筆時点）。T19C/T20、Pages、本番、非公開原作データに無断変更なし。最新HEADは再取得する。
- **作業方式：Chat＋GitHub中心、Workは必ずユーザーの事前承認、原作忠実度と遊べる完成度を落とさない、ユーザーPC操作最小。** 研究の狭いPASSと本番採用を混同しない。意味あるF3ゲーム機能の実装→軽量テスト→本物のChrome→RAW独立審査→GitHub保存まで進める。F4権威不足を架空の床/CPUワープ/Scoreableで穴埋めしない。

## 新チャットへ渡す最短指示

> Browser Ink TPSをGitHub正本から完全に引き継いで開発を再開してください。リポジトリ ryomashibaba/browser-ink-tps、研究ブランチ research/t21-b406-single-session-real-enemy-range-audit-20261103。まずこのSTART_HERE.mdとリンク先のB413完全統合新チャット引き継ぎ、B406旧正本、DECISIONS、Fast Track、F1〜F5、CURRENT_CANONICALを読み、決定済み方針・保護・全失敗教訓を守ってください。B412真正Chrome 180秒・原作4面塗装・OWNイカ泳ぎPASSを維持し、最新B413修正版Actions #41647713309の結果・artifactを最初に確認。PASSなら次の本当に遊べるF3の機能へ、FAILなら実RAWを分析し安全ゲートを緩めず実装・検証・研究branchへ保存してください。main/正式QA/PR#5/Pagesは変更せず、Workは事前承認制、Chat＋GitHub中心、ユーザーPC操作最小。計画だけで終わらず可能な限り実作業してください。
