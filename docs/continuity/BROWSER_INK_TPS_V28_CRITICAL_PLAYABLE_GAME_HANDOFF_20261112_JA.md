# Browser Ink TPS / T21 — V28 全体批判と実ゲーム完成優先・新チャット統合正本

**2026-11-12 JST／本人が明示した全体再検討と次チャット移行のための一回限りの記録。新規企画・上位目標の変更ではない。文書作成自体はゲーム進捗0。次回以降、惰性でV29・B番号・細かいQA・HUD・文書を増殖させない。**

## 0. 読順・最新証拠・操作許可

- GitHub: https://github.com/ryomashibaba/browser-ink-tps
- **唯一の書込先**: research/t21-integrated-a1-c-patrol-four-mode-20261105
- **本書作成直前の研究HEAD**: 852d662bc84bee5bdc34301e85641a463563c6cd。本書保存後HEADは変わるため次チャットでは必ずライブ再取得。2026-11-12の最新軽量CI #43159892864 はSUCCESS。real-native-original-frontlineジョブはSKIPPEDなので、真正ゲームの最新成功とは言わない。
- 同時点で main=fbd922cea900df8e1a139f21b3c61ed927b3fdd9。Draft PR #5はOpen/Draft・未merge、head=8cfc95756ef0b56e2c33dc9f89a9041126daa272。変更禁止。
- 読む順：START_HERE.md最上段→本V28全文→V27正本 docs/continuity/BROWSER_INK_TPS_V27_CRITICAL_EXECUTION_HANDOFF_20261111_JA.md 全文→必要時V26以前→T21_FAST_TRACK_ROADMAP.md / docs/continuity/DECISIONS_JA.md / docs/continuity/FAST_TRACK_EXECUTION_JA.md→対象実コードとSHA一致の真正CI/RAW。旧DECISIONSのQAブランチ、0/12は過去時点の履歴。今の研究書込先と自然敵味方0/16が優先するが上位F1〜F5は一切変えない。

## 1. 最上位ゴールと凍結条件

『スプラトゥーン3』改修後Ver.7.2.0マテガイ放水路・**通常ナワバリ**の原作忠実な高品質ブラウザTPS。人間1＋CPU7の自然な4v4、180秒、Rapier/Recastの正しい地形・衝突・操作、武器・Projectile・塗装・インク消費・OWNイカ回復、HP・撃破・150 native tick復活、公式得点・勝敗・同武器再戦、実機での原作外観とFPS、正式QAまで。Big Run、トリカラ、旧版・別ステージへ逃げない。

固定F1：人間＋CPU7の本物の安全な配置、真の生存・物理合流・復活。
固定F2：人間とCPUのRapier KCC/Recast、原作床支持、連続移動、原作高低差と動的衝突。
固定F3：実ユーザー入力、武器、原作への本物の着弾塗装、インク経済、イカ、サブ、敵との自然遭遇・本当のHP/撃破/復活、180秒終了・再戦。
固定F4：Ver.7.2.0 TurfのBanc/BYML、Actor transform、Phive面単位collision flagsと正しい中央地形、正式Scoreable権限。
固定F5：本人Windowsの普通の試遊、床と見た目の一致、カメラ、ART、FPS、最終QAと明示的公開承認。

現行は **25 Rapier solids /17 PaintSurfaces /26 source one-way NavLinks /0 Scoreable、敵味方自然到達0/16、Winner NONE、activationReady=false**。正式4v4・対岸中央の原作衝突・公式得点/勝敗・ART・公開/Pages・PR mergeはHOLD。偽床/橋/坂/足場/リンク/ワープ/敵/HP/得点、原作OBJを全部衝突面にする昇格、閾値緩和・カプセル半径0・実キー偽装は禁止。PRIVATE原作OBJ/MTL/PNG・面ごとの抽出物は外部GitHub/CIに無断転送禁止。

## 2. 実証したものと、実証していないもの

- 旧真正Chromeでは、人間実W/S/D/坂移動、射撃→原作塗装→インク消費→OWN SQUID回復→再射撃、CPU7体の実参加・射撃・着弾塗装、実CキーA1協力、180秒TIME_UP・同武器再戦などがそれぞれ**個別に限定PASS**。これら全部が**最新同一HEAD・同一180秒世界で統合PASSとは未証明**。
- B491真正 #43140584988：同一世界720 native tickのCPU7体、射撃要求154発・実着弾8,382セル・OWN補給+118、無償足元塗装0。原作中央の自然敵到達は証明しない。
- B490本人Windowsの原作F3L比較は、元の見える地形と登録物理床の差を確認（57,578 triangles、54 material groups、19 textures）。原本と比較画像/HTMLは本人ローカルに保管。以前の通常Windowsでの床抜け・CPU少数・SAFE STOPを**最新実ゲームで全域解決したとは未認証**。同じ画像を再提出させない。
- B492〜B495で実Recast経路YとRapier床Y最大約0.28m差、B493/B494のB2/B4/A1観測足を使ったKCC局所/連続再演に限定PASS。ゲームAIがその経路を自然に選ぶ証拠ではない。
- B496の既存拒否60経路は再現成功。補間YをRecast近傍点に投影するとRay支持だけなら50/60、なお10/60拒否。最大約1.08mのY補正を要する箇所があり、その50経路は**新通路でも安全な道でもない**。
- B497〜B498の原作25-solid隔離KCCは速度を実CPU4.4m/s/60Hz以下に細分して23/50がQA上許容内、27/50は接触・累積差。24/50に水平クリップ、26/50に垂直クリップ。27件の最初のQA接触位置は実CPUの記録足からXZで**2.28〜3.71m遠い反事実候補**。原作右低地コライダーの実ゲームバグと断定して変更しない。
- B499真正原作SOURCE面と現25-solid Rapier/Recast #43156897600：CI688由来の10部品・42三角面の現Solid登録0/10、三角形中心でRecast 0.35m以内0/42、Rapier床Hit 0/42、原作面8隣接組の現Recast到達0/8。**Pass18で左右各4件の8局所GapとB218の原作面隣接8組は同一物理箇所との対応未認証**。原作面間最短距離は片側0.17/2.074235/0.518559/0.518559m。以前のCI#691で10原作由来部品を研究追加しても原作中央ルートは開通せず。新面の衝突権限/版一致もUNKNOWN。
- **B499以降の最新ゲームコード差分**：a0b0813b004bc2dc8cb276f27bb062f6ed975584で、実CPU敵候補をACTIVE・HP>0・GROUND・本物のRecast/Rapier rejoin済・現位置一致に限定し、SPLATTED/未知/未復帰の過去の足を自然な敵と誤扱いしない。同時に実Life/physicalRejoinsのsnapshot整合性を改善。前回軽量CI #43159355114 はfixture未初期化でFAIL。修正済み研究HEAD 852d662bc84bee5bdc34301e85641a463563c6cdのCI #43159892864 はSOURCE交通19 suites/186 tests PASS（2 skip）、Ink/Resource4 suites/19 tests PASS、TypeScript・Vite build PASS。**real-native-original-frontlineジョブはSKIPPED。最新コードの自然遭遇・実敵HP・復活を真正実証したとは言えない**。

## 3. 従来の開発手法を批判し、対策を確定

1. **B番号・小QA・文書・HUDとCIが実際のゲーム進化を上回った。** テストは重要だが完成度ではない。次回以降「その変更で普通のSOURCEゲームでどんな行為が新たにできるか」を先頭に置く。コード変更なしのQA/Docsだけなら分析進捗と明記。
2. **0/8原作面と0/16自然敵経路、50 Ray/23静的KCCを混同した。** 母集団、観測した世界、SHAと根拠の種類を毎回分ける。Ver.7.2.0 collision/Actor根拠なしに原作OBJを本番Collisionへ昇格しない。
3. **周辺で見えるもの全部を歩ける床にする誘惑**は偽物の完成。逆に**F4証拠が揃うまで何もしない**も永久HOLD。証拠のない中央の個別部分のみHOLDにし、原作登録済み範囲のF1/F2/F3実プレイを並行して改善する。
4. **ガードによるSAFE STOP、床継ぎ目でのInk/接地誤拒否、ライフキャッシュの過去足**がプレイを阻害し得る。原因を特定して関連コード単位で直す。証拠のない数値緩和や、KCCのQA結果だけによる地形変更はしない。
5. **真正7CPU・塗装・180秒を正式4v4と誤称しやすかった**。自然な敵遭遇・HP→撃破→150 native tick復活・公式得点/勝者・本人普通の試遊が未証明。限定PASSを拡大して報告しない。
6. **透明化/HUDはARTや物理の修正ではない**。本人の同一視点で必要なものに限定し、原作の見た目を損なう暫定透明化を増殖しない。
7. **push→CI失敗→push→CI繰返しが高コスト**。関連機能を調べてまとめて実装→可能な範囲でpush前型/構文確認→原則1つの軽量CI→結果に応じた最小修正。既存成功の真正CIの無意味な再実行なし。
8. **本人へZIP・clone・B490スクショ・Windowsコマンドを反復要求した**。既存cloneはDownloads/browser-ink-tps-current、B490ローカル比較はDocuments/BrowserInkTPS_F3L_15864_5030。本人の手作業原則0回、追加課金原則0円。PRIVATEを無断公開しない。
9. **レビュー不足の古い正本の「現行」表記が混入しやすい**。ライブHEADを優先、旧V27以下は仕様と根拠を継承するが古いSHA/次手順は履歴にする。今回の正本以降、毎ターン新Vxxの引き継ぎを作らない。

## 4. 批判後に確定した唯一の実行順と合格条件

### P0｜再開時はライブ照合だけ
本V28全文・V27・F1〜F5/FAST_TRACK/DECISIONSを読み、最新研究HEAD・直近3〜5コミット差・main/PR5/Actionsを照合。古いHEADから勝手に作業を始めない。B492〜B499の同条件QA・既成功のTRUE Chromiumを再実行しない。新しい長い計画書を作らない。

### P1｜最優先：既登録原作SOURCEでの遊べる垂直スライスを本体コードで改善
人間の**実移動→実射撃/塗装→インク消費→OWNイカ回復→再射撃**と、7CPUのACTIVE/HP・実物理rejoin/復活・合法な射撃/支援・実Cキー協力を、同一世界で矛盾なく結合する。最新UndertowF3SourceTraffic.tsの敵life/respawnロジック、PlayerControllerのSOURCE backingSolidIdと0.12m接触判定、GameplayInkSystem、CpuAgentSystem、Projectile/Ink、SAFE STOPや本物の床支持・CPU欠員に関連するコードを**一括で**確認し、再現した不具合のみ修正する。ない不具合は作らない。
- コード+既存回帰+必要な根拠をまとめ、軽量CIは原則1回。
- 完成証拠は同一SHAでの新しい実ゲームイベントと負の副作用なし。軽量CIだけならCODE_PASS_ONLYとし、実ゲーム改善TRUE_PASSと呼ばない。
- natural enemy route 0/16では敵をワープさせてHP/撃破/公式Turfを作らない。現行の最新life-filterも実戦認証前である。

### P2｜中央部F4は原作根拠が新たに出たときだけ有界再開
右低地の登録床→未登録SOURCE部品への入口と、その内側の出口を正確な**Ver.7.2.0 Turf**面ID/Actor transform/原作collision flags/Phiveと照合。旧Pass18 8 GapとB218 8 face-seamは別扱い。PRIVATE原作をGitHub/CIに流出させない。新証拠が取れた場合だけ隔離研究でcandidate Face→権限→CPU全身カプセル連続移動→Recast全経路→真正現場の順で評価。資料不足なら該当箇所だけHOLD_REFERENCE_REQUIREDにしてP1へ戻る。未認証の2.074mを透明橋やNavLinkで補完しない。

### P3｜原作中央自然経路が真に成立した後にのみ正式敵戦闘と得点
現在の0/16を実本物Recast→Rapier→7CPU+Humanで解消する根拠が得られたら、自然に相手へ到達し、真の弾命中・HP減少・撃破・150tick復活を同じゲーム世界で検証。Scoreableの原作7.2.0 Face認証後にだけ正式Turf得点・勝敗を実装。未認証の間はSOURCE練習表示UNSCORED／WINNER NONEを維持。

### P4｜本人Windowsと最終F5
本体機能バッチをまとめてから、必要な場合に限り既存のローカルcloneとB490比較画像を再利用し、本人の操作は最小1回の安全な一括チェック。原作床と光学形状の同位置一致、普通の操作/安全停止/CPU7・FPS・視認性・180秒/再戦を検証。本人Windows/PRIVATE/Work/高負荷の個別承認を厳守。正式QA/公開/PR mergeは最後までHOLD。

### 停止・転換
- 2工程連続でゲームコードの体験改善が0、かつ小テスト・報告だけが増えたら強制再査読し、P1の機能改修か対象限定HOLDに切替。
- 原作資料が不足した特定Faceは保留、他の認証済み機能は前進させる。
- 証拠のレベルをFACT・TRUE_RUN_LIMITED_PASS・CODE_PASS_ONLY・HOLD_REFERENCE_REQUIRED・FAIL・UNKNOWNに分離。「完璧」「正式4v4完成」を推測で宣言しない。

## 5. 操作保護・費用・次チャットへ引き継ぐ要点

変更先は研究ブランチのみ、コミット直前に最新HEAD/他作業差分を再取得し、単親・expected_sha付きCAS・force=false、force/rebase/merge禁止。main、T19C/T20、Draft PR5、Pages、固定F1〜F5ロードマップ、正式QA、本番、PRIVATE、本人Windowsを保護。GitHub/CIの既存証拠を使い回し、同じZIP/写真/PowerShellを再要求しない。Work/Computer Use、Windows、高負荷Chromium/180秒、正式公開/QA、PRIVATEは**既存の個別明示承認**が必須。Work /goalはユーザーの別途許可と予算、安全な作業範囲、最終独立レビューが揃わない限り自動開始しない。追加課金原則0円。

報告は毎回「実際のゲーム挙動の改善／コードSHA・検証範囲／現在のHOLD／次に実装する機能／本人操作要否」を短く。次チャットではP1の**ゲーム実装**へ直行。新計画・別文書・同条件のQA反復には戻らない。

## 6. 新チャットに貼る最短命令

Browser Ink TPS/T21/Ver.7.2.0 Undertow Spillwayの既存開発を継続してください。F1〜F5/Fast Track/DECISIONSと過去の失敗・成功・保護条件を維持し、新企画にはしない。まずGitHub ryomashibaba/browser-ink-tps の研究branch research/t21-integrated-a1-c-patrol-four-mode-20261105 でSTART_HERE.md最上段とV28正本 docs/continuity/BROWSER_INK_TPS_V28_CRITICAL_PLAYABLE_GAME_HANDOFF_20261112_JA.md を全文読み、V27以前も継承。V28作成前HEADは852d662bc84bee5bdc34301e85641a463563c6cd、最新HEAD・CI・main・Draft PR5をライブ確認。新しいゲームコードのCPU敵life/HP/真rejoin条件は軽量CI #43159892864 SUCCESSだが真正ChromiumはSKIPPED。B491真正7CPU/塗装/OWNは限定PASS、B499で原作10部品/42面の現Stage未登録が判明、自然敵味方0/16、SOURCE25/17/26/0、公式Scoreable0/Winner NONE、正式4v4/ART/公開はHOLD。B492〜B499の分析/QAや新文書の反復でなく、V28第4節P1の既登録SOURCE人間の実移動・射撃・消費・OWNイカ回復・再射撃とCPU7の生存/支援/復帰が自然につながるゲーム本体の関連コード改善へ進める。原作根拠のない床/橋/NavLink/ワープ/戦闘/得点は禁止。main/PR5/Pages/原本/PRIVATE/正式QA/本人Windowsを保護、研究branchのみ最新SHAから単親expected_sha CAS・非force更新。本人操作原則0・追加課金原則0、Work/Windows/高負荷は個別承認。実改善内容・証拠・HOLD・次工程を簡潔に報告。
