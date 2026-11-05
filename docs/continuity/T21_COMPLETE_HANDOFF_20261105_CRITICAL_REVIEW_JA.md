# Browser Ink TPS — 批判的再評価・新チャット引き継ぎ正本（2026-11-05）

**方針変更ではない。** 最終目標はスプラトゥーン3 Ver.7.2.0以降マテガイ放水路で、人間1＋CPU7が自然に交戦し、180秒・塗装・HP・撃破・復活・得点・勝敗・再戦が成立する実ゲーム。F1〜F5と `T21_FAST_TRACK_ROADMAP.md`・`docs/continuity/FAST_TRACK_EXECUTION_JA.md` を不変とする。単なるQA数増加ではなく、実際に遊べる機能を優先する。

## 固定安全条件

研究SOURCE **25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable**、自然対岸経路 **0/12認証**。正式4v4・公式得点・勝敗・ART・公開はHOLD。元の衝突・版が未認証のFloorLine00・推測床／橋／NavLink／仮Actor／ワープ／半径0経路／偽命中／偽得点は禁止。main・T19C/T20・正式QA・原本／非公開資料・Pages・Draft PR #5（OPEN/DRAFT/UNMERGED）を保護する。Chat＋GitHub優先、Work/Computer Useは事前承認、追加課金原則0円、ユーザー作業最少。MinecraftAIBuilderと同格最重要。

## 監査したGitHub状態（2026-11-05 22:55 JST前後、最新値は必ず再取得）

- 正規研究 `research/t21-b406-single-session-real-enemy-range-audit-20261103` HEAD: `4fb3b0122ca0828d00793d3800bc246a806549dc`。B470巡回・B472 4 SOURCEモード武器選択などを含む。B471コードはまだこのHEADに入っていない。
- B471準備 `research/t21-b471-ready-20261105`。GitHubでの本文書保存によりこのHEADは更新される。B471実キー＋A1協力・B470・並行武器選択を保持する候補。main `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。
- B470 [B441 #42022904052](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42022904052)・[B448 #42022904083](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42022904083) genuine SUCCESS：A2/A3/B1/B3追加原作Goal6、実切替8。自然対岸成功の証拠ではない。
- B471 [実KeyC A1 #42038173618](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038173618) genuine SUCCESS（RAW Artifact #13418584735）：本物のCキー1回、原作Goal承認1、Crowd移動要求1、A1協力CLEAR、人間808/A1 38セル、真接地37.04m。画面ARRIVEDを確認。ただし全身カプセル連続移動の独立認証とは区別。
- B471旧全体 [#42035150903](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42035150903) は最終FAILだが、A1協力2回CLEARを確認。その後のB200キーボード再戦遷移がTIMEOUT。B471コアPASSとB200後段FAILを分ける。
- B471＋B470＋武器選択の組合せ軽量 [#42039715852](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42039715852) は Vitest／TypeScript／本番ビルドSUCCESS。最終正規HEADでの長時間総合合格を示すものではない。
- B472 Chrome B440 [#42038865662](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865662)／B441 [#42038865792](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865792)／B448 [#42038865783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865783) SUCCESS。ただし全4モードの独立全試合認証ではない。
- B413長時間 [#42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341) は監査時IN_PROGRESS。旧HEAD B413 SUCCESSを新HEADへ流用しない。実行中は正規研究branchへのpushを避ける。

## 批判的結論と運用修正

1. 原作忠実性と安全性は維持。正式得点面0・対岸0/12のまま、SOURCE協力試合の成功を正式4v4と呼ばない。
2. **小QA／多ブランチ／B番号の増殖を止める**。1つの遊べる機能を実装→既存fast→既存真正ChromiumとRAW・実画面→安全な研究GitHub保存まで一括。
3. 長時間CIのHEADは固定し、並行修正は原則1つの隔離研究branchにまとめる。各段階でSHAを再照合、終了後1回の非force統合。無駄な取消・重複再実行禁止。
4. `START_HERE.md`の旧ステータスの巨大追記を事実上の現況と扱わない。本書を最新状態の入口、詳細は既存docs/qa。報告は成果／HEAD／真の証拠／HOLD／次の一工程を中心に。
5. F3の局所プレイ改善を進めるが、F4版・原作衝突権限を永遠に放置しない。Vss_Temple01の720版対応資料と、個別FloorLine00衝突フラグ、半径0.30m CPU全身カプセル支持は別証明。証拠がない部分だけ局所HOLD。ソース証拠なしの通路は追加しない。
6. AI CDPテストだけでは楽しさは認定できない。実画面と普通の人間操作の視認・操作・再戦を優先して見る。必要な場合だけ、最後に一度の短い人間プレイ評価をお願いし、通常のユーザー作業は0回を目指す。

## 次の1バッチ

最新正規研究HEADとB471 ready HEAD、B413 CI／Artifacts／PR #5を確認する。長時間runが走る間はHEADを変更せず、B471真正Cキー→A1移動指示をB470巡回・B472武器UIと同居させた候補を隔離で真正検証する。現行1セッションで実C入力、元Recast／Rapier、実A1足、非公式塗装、7CPU、180秒、結果、クリック再戦、操作可能な画面を確認し、必要なら一括修正してGitHubへ非force安全保存。B200キーボード再戦問題は区別。F4の未認証床／公式得点／正式4v4はHOLD。計画や小QAだけで終了しない。

## 次のチャット用開始文

Browser Ink TPSの継続です。GitHub `ryomashibaba/browser-ink-tps` の `research/t21-b471-ready-20261105` にある `docs/continuity/T21_COMPLETE_HANDOFF_20261105_CRITICAL_REVIEW_JA.md`、最新START_HERE・F1〜F5ロードマップ・Fast Track・B470/B471/B472 QA文書を読み、過去の固定方針と成功失敗反省点を継承してください。最新正規研究HEAD・B471 ready HEAD・B413 CI/Artifacts・Draft PR #5を照合し、B471 A1実Cキー協力をB470巡回・B472武器選択と安全に統合し、実際に遊べる機能の真正Chromium＋RAW確認・GitHub隔離保存まで自律的に進めてください。main/T19C/T20/原作SOURCE/正式QA/Pages/PRを保護、F4未認証床・自然対岸0/12・Scoreable0・正式4v4/勝敗/公開はHOLD。Work事前承認、追加課金原則0円、私の操作を最小化してください。

**本書はゲーム完成認証ではない。** 事実と未認証、独立試験の成功と現行HEADの成功を厳密に分ける。