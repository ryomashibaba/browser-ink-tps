# Browser Ink TPS / T21 — V27 批判的全体再評価・一度限りの次チャット実行正本
**記録日：2026-11-11 JST。本人の明示依頼による新チャット移行目的のみ。** 新企画・上位目標変更なし。本ドキュメント作成は**ゲーム進捗0**。V28等の文書を惰性で量産しない。

## 0. 再開場所と証拠の鮮度
- Repo: https://github.com/ryomashibaba/browser-ink-tps 。唯一書込可：研究 `research/t21-integrated-a1-c-patrol-four-mode-20261105`。
- **本書作成前に確認した研究ゲームHEAD**：`dc69658112e9357f3b96c7541c440fee8e37b326`（直前`9338c8662b62a505c18dc78d0752db9beab19bea`のB492実接触コードに、短時間真正P1の接触証拠を追加）。本書保存でHEADは変わる。**新チャットでは研究HEAD、親、差分、最近のCI/PR/mainを必ず再取得**。
- 同確認時main：`fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。PR #5 Open/Draft/未merge、head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。保存前後とも再確認、書込禁止。
- 最新真正局所検証：[GitHub Actions #43028289115](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43028289115)：SUCCESS。37 test files / **387 tests PASS**、TypeScript＋Vite build成功、実Chromiumの`P1_NATIVE_REAL_SOURCE_RAMP_ROUTE`が`PASS_REAL_KCC_LANDING_TO_EXISTING_REGISTERED_SOURCE_RAMP`。native tick1265–1301、真CPU7、実KeyS/KeyD、実登録下段床→既存右下段坂、支持solidの接地差約0.025〜0.042m。足元塗装backingと実Rapier solid IDの一致あり；tick1283で`OWN`一観測。**OWNイカでの連続回復・敵INK減速・通常Windowsの自然操作・180秒・中央・自然敵4v4は本実行で未証明。**
- 読順：`START_HERE.md`最上段 → **本V27全文** → 必要時[V26](BROWSER_INK_TPS_V26_CRITICAL_REAL_PLAY_HANDOFF_20261111_JA.md) → V25/V24 → `T21_FAST_TRACK_ROADMAP.md`、`docs/continuity/DECISIONS_JA.md`、`docs/continuity/FAST_TRACK_EXECUTION_JA.md` → 対象コードとSHA同一のActions/本人実機データ。旧HEADと旧「次工程」はその日時の履歴。

## 1. 不動の完成条件（妥協・短縮不可）
目標：『スプラトゥーン3』改修後Ver.7.2.0マテガイ放水路（Undertow Spillway）の**通常ナワバリ**を可能な限り忠実にブラウザ3D TPSで再現する。Big Run、トリカラ、旧版、別ステージを混ぜない。
- F1：人間1＋実CPU7の原作登録地形での安全な同時参加・自然な配置。
- F2：Rapier KCC、Recast/Crowd、カプセル・実連続支持・自然な高低差・接続・移動。
- F3：人間入力、武器、実Projectile→塗装、インク消費・OWN回復・イカ・サブ、HP/本物の撃破と150 native tick復活、180秒・終了・再戦の一体的に遊べる試合。
- F4：Ver.7.2.0 Turf原本のBanc/BYML、Face/Phive collision flags、Actor transforms・本物の中央/対岸接続、正式Scoreable権限。
- F5：本人の通常Windowsプレイ、視認・自然なカメラ・原作に忠実な外観・FPS・安全な落下/リカバリー・最終正式QA・明示公開承認。
- 現行凍結`25 Rapier solids / 17 PaintSurfaces / 26 original NavLinks / 0 Scoreable`。自然な敵味方16組は`0/16`（旧文書の`0/12`は別の過去指標）。公式Winner`NONE`。`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`。全域4v4、得点、勝敗、ART/公開/PR merge **HOLD**。
- 原作に証拠がない床・ガラス・橋・坂・合成衝突、透明救済足場、架空NavLinkやActor/敵ワープ、原作OBJの一括collider化、半径0/衝突無視、偽HP/撃破/公式Turf、虚偽の時計やキー、閾値のPASS合わせは禁止。レビュー上の光学モデル・静的OBJの名前だけで歩行権限を与えない。

## 2. 現実に達成したことと未認証の線
**現実に達成**：
1. 過去の真正RUNでは人間のW/S/D移動、下段への自然降下、実登録坂でのRapier接地、CPU7の物理再合流、射撃・原作17塗装面の実セル変化、インク消費とイカOWN回復、サブ、特定A1協力、180秒終了＋同武器再戦などの**個別・旧SHA限定成功**がある。K1/K2/K3/B413の証拠を用途限定で再利用し、全機能が現HEADで同時に成立とは言わない。
2. B490本人Windowsで原作F3Lテクスチャを含むローカル再構築成功。57,578 triangles／54 material groups／19 textures、原作ファイルは本人PC内だけ。`Documents/BrowserInkTPS_F3L_15864_5030`に原作UV ON、登録物理床のみOFF、オフライン比較HTMLと既存P1画像あり。**2枚が実際に得られた**。大きな建築表面差と局所登録床の比較ができたが、中央全域の位置合わせや元Face collision属性は認証しない。全体の足元はきれいに見えても、左奥の橋・側面等に未登録光学構造が目立つ。
3. B490によりF3L背景の無断重畳防止・比較ページ/同一ポーズ確認を実装。B491では`StageSide`の原作光学材質を**通常PLAYERに限り**薄く表示し、原作レビューは保護。`BridgeMetal`/`FloorLine`の視認優先も局所的対応。材質名が本人画像の特定画素と一対一に対応したか、透明化が本当に見やすいかは**本人の修正版実画像なし**。これらは誤認軽減であって原作衝突の修正でもART完成でもない。
4. B492は現HEADに、SOURCE人間プレイヤーの床OWN/ENEMY接触について、登録17塗装面の`backingSolidId`と現在のRapier足元`solidId`およびgap（コード閾値0.12m）を突合する処理を追加。最新真正短時間#43028289115では実接触IDと`OWN`の局所観測を確認。**連続的なインク回復・イカの移動速度・床継ぎ目での誤拒否・ENEMY減速は未検証**。閾値を「正規値」と断定しない。
5. V26以前のB443 CPU目標維持/3D近接の局所真正は認証済だが、自然に相手陣へ走る・敵と遭遇する・実敵HP/撃破まで通る証拠ではない。旧180s＋同武器再戦も正式得点0のSOURCE練習であって正式ナワバリではない。

**依然HOLD**：本人通常Windowsでの以前の床抜け・CPU少数・SAFE STOPの全域解消、F3L描画とRapier床の全域一致、正式な元版のFace/Actor/collision flags、自然敵味方0/16、原作正式Scoreable0・Winner NONE、自然遭遇からの敵HP→撃破→復活の本番相当連鎖、正式4v4/ART/公開。STOP→Rは自然STOPを証明しておらず保留。

## 3. これまでの運用を批判して改訂する
- **良かった点**：偽の地形・ルート・スコア/ダメージを拒否、原作光学と実物理を分離、SHA付き真正CDP/Rapierと研究CI、研究だけのGit CAS、PRIVATE/PCの保護は堅持。
- **失敗A：テスト数・小修正・HUD・文書が実際のゲーム進化を上回った。** 新しいB番号/テスト数で達成を語るのを禁止。**「その修正で同じSOURCEゲーム中に何が新たにできたか」**を先に示す。小QAの合格だけなら「技術的準備」に留める。
- **失敗B：一時的な透明化は原作忠実なステージ再現ではない。** 表示を薄くすれば踏めない構造が減って見えても、原作の形・材質・奥行きを犠牲にする。透明化を際限なく増やさず、実機の同一視点結果を比較し、実物理と整合する既認証区間だけ改善。実機で悪化ならロールバックも候補。
- **失敗C：安全ガード自体が遊びを壊し得る。** B492の同一support/gap0.12mは、床境界・坂・浮き跳ね/イカ切替で本来のOWNインクを拒否するかもしれない。これは未観測の**リスク仮説**であり「既知バグ」とは呼ばない。次に実イベントで消費→OWN SQUID回復→再射撃を評価し、偽拒否があれば原因を追い、数値だけを緩めない。
- **失敗D：3D接近・CPU7/7・原作25面を正式自然4v4に読み替えがち。** 0/16自然対岸・Scoreable0では自然な敵遭遇／公式勝利は成立していない。局所の遊べるSOURCEから先へ進み、構造的F4不足は対象箇所のみHOLD。
- **失敗E：本人の操作・データ準備を要求し過ぎた。** 旧ZIPフォルダは`.git`を含まず、cloneをやり直した。本人は新`Downloads/browser-ink-tps-current`研究clone、43MB級原作アセットのローカル準備、B490撮影まで完了。**旧ZIPを再利用せず、既存clone/資料を再活用**。同じ画像/ログを再提出させない。プライベートOBJ/MTL/PNGを無許可アップロードしない。
- **失敗F：連続push・毎回CI・途中の構文問題で無駄を増やした。** 実装前に複数の関連修正をバッチ化、既存の型・Node/TS・ワークフロー構文を可能な範囲でpush前確認。CIはまとまった機能ごとに原則1回。エラーが出たら生ログに基づく最小修正のみ。軽量CIがSUCCESSでも人間試遊PASSと書かない。
- **失敗G：古い正本の古い「現行」が引き継ぎ時に混ざる。** `DECISIONS_JA.md`や`FAST_TRACK_EXECUTION_JA.md`の2026-10-25 QA開発ブランチ`dev/t21-f4e103w-qa-infra`、0/12は歴史情報。2026-11-11現行書込先は上記研究ブランチのみ、指標は0/16。**固定上位仕様や保護は古い文書も有効**で、どちらかの資料を無断破棄しない。
- **再批判**：「全F4衝突証拠まで何もしない」は永久HOLDを招く。「見える面全てを床にする」は偽物の完成。「CPUだけの近接を繰り返す」は自然敵戦闘にならない。「毎ターン新計画」はゲーム進捗0。したがって**対象限定のF4 HOLD＋真正F1/F2/F3/F5を既登録SOURCEで実装・実験**というV26方針をさらに厳格化する。

## 4. 改訂後の実際の次工程（追加計画ではなく固定F1～F5の実行順）
**第一の機能バッチ：B492変更後の本物の人間入力・接地・インク経済を既登録坂/下段の同じSOURCE世界で統合（F2/F3）**。
1. 新チャットの最初に**既存HEAD/差分/CI/PRをライブ確認**。#43028289115の真P1は既に同SHAで7CPU＋下段→坂＋接触IDを確認済みなので**同条件単純再実行禁止**。
2. `PlayerController`の実SOURCE`sourceFloorInk`と`sourceNativeFloorInkWitness`、`GameplayInkSystem`、ラウンド実キー入力を読み、B492新判定のSOURCEに限定した**実消費→同一登録床のOWNインク→SQUID実回復→HUMAN再射撃**の連続機能が正しくつながるか評価。既存のB413やP1証拠・コードが同SHA/既存条件を満たすなら再利用。実測の新証拠が必要なときだけ既存一系統の短い真Chromiumを検討（個別高負荷承認条件を厳守）。**隣接面の誤OWN・床継ぎ目での正当な回復拒否・イカ高さ・60Hz tick同期**を特に注意。条件を満たさない場合は対象の根因だけ修正し、まとまった機能として完成させる。閾値0.12mの根拠が実測で不足ならHOLD、安易な緩和なし。
3. 遊びの価値は「登録済み実床上で自然に移動・撃つ・インクを使う・OWNインクでイカ回復し、再射撃ができること」。コード変更＋同一SHAの真のイベント＋負の副作用なしを確認できた時だけ機能限定PASS。静的テストや接触ID1サンプルは中間成果。
4. その後の第二の機能バッチは、7CPUの同一場面での自然視認・原作射線・合法な塗装/支援を実ゲームと結合。実相手遭遇は自然経路0/16なので**遭遇したという真正証拠がなければ敵HP/撃破に進まない**。CPUの目標カウンターや固定巡回の再計測だけに逆戻りしない。
5. F3L/PLAYERの視覚床は今回のWindows B490画像（原本PRIVATE保持）を参照し、原作オブジェクトの表示/物理齟齬が**実際の歩行を阻害する一つの箇所**に限って研究修正。StageSide/BridgeMetalの色をまた適当に薄くする作業は禁止。**同じ本人視点で改善が見えた場合のみ見た目改善をPASS**とする。
6. 7.2.0の元Banc/BYML/PhiveのFace/Actor衝突属性は未取得。公開`Vss_Temple01`等のSceneInfoは版対応を支持しても原作衝突許可ではない。**新しい具体的なソース根拠が出た場合だけ**F4を局所再調査、元のFace名とゲーム判定の対応確認→実KCC/CPU全身半径・Recast連続支持→個別昇格承認。依然0/16・0 Scoreableの全域制約は推測で埋めない。
7. F5・正式4v4・ART・Pages/PR merge/公開は最後。正式条件を達成するまではゲームSOURCEは`UNSCORED`／`NO OFFICIAL WINNER`を明示する。

**バッチ終了の機械的な停止・転換条件**
- 本人が見て改善した画面・本物の追加ゲームイベントが0なら「実ゲーム改善PASS」と報告しない。薄い情報の追加に止めず、次に試す機能仮説を再選択。
- 原作権限が必要で新しい根拠がないなら当該Face/HUD/経路だけHOLD、**他の登録済みゲーム機能へ切替**。
- 機能変更がない・同じ既証明経路しか試せない場合は同条件のChrome/180秒を再実行しない。
- 同一機能を修復しようとして2回以上連続でガード/テストだけ増えたら「なぜ遊びが良くならないか」を再査読して一括バッチへ統合。文書やコミット数で擬似進捗を作らない。

## 5. 守る保護と本人負担削減
- GitHub研究ブランチのみ単親・`expected_sha` CAS・`force:false`。コミット前後のHEAD、main、PR5、直近Actions、保護差分を照合。他の開発チャット/プロジェクトや同じ研究ブランチの別作業が先にHEADを進めていたら**現行SHAを読んで差分を統合してから**保存。force/rebase/mergeは禁止。
- main、Stable T19C/T20、固定F1〜F5ロードマップ、正式QA、Draft PR #5、Pages、本番、原本、非公開ソース/Face・画像・派生物、本人Windowsと設定を保護。原作の商用データを外部CI/公開GitHubに送らない。Work/Computer Use、Windows操作、高負荷実行、PRIVATE、正式QA・公開は個別明示承認。追加課金原則0円。別のMAB/Strata/HALO9等の作業に侵入しない。
- 本人PCには既存`Downloads/browser-ink-tps-current`を保持し、`public/t21-f3g-source`のローカルF3Lアセットと`Documents/BrowserInkTPS_F3L_15864_5030`のB490画像／HTML／JSONを保持。古いZIPはGit管理されない。**今すぐ本人へ再clone、43MB再取得、ログ再提出、新しいスクショ、PowerShell連打は要求しない。**
- PC操作が本当に必要な場合のみ、変更実装をまとめた後に**最小1回**、所有ファイルを壊さない前提の事前チェック→安全なff-only更新→既存一括起動という一連の明確な操作として案内。本人がPCを操作できない間もGitHub/既存証拠/コードの範囲だけ進める。本人PCの起動・外部通信・高負荷は承認なしに実行しない。
- 何かを「完璧」と断定せず、未測定は`UNKNOWN`、未認証は`HOLD`、実証範囲は`LIMITED_PASS`、実測失敗は`FAIL`。原作版や正式得点は推測を事実にしない。
- 本書以降の1報告は【ゲームの実動作がどう改善したか／コードSHA・真の測定・必要最小CI／未認証HOLD／次の機能単位／本人操作要否】。通常は1枚の要約で足りる。

## 6. 次のチャットへ貼る最短指示
Browser Ink TPS/T21/Undertow Spillwayの既存開発継続です。新企画・F1～F5/Fast Track/永続決定の変更禁止。GitHub `ryomashibaba/browser-ink-tps`、研究`research/t21-integrated-a1-c-patrol-four-mode-20261105`の`START_HERE.md`最上段V27正本`docs/continuity/BROWSER_INK_TPS_V27_CRITICAL_EXECUTION_HANDOFF_20261111_JA.md`を全文読み、V26以前・DECISIONSを継承。作成前ゲームHEAD`dc69658112e9357f3b96c7541c440fee8e37b326`、真正#43028289115は387PASS＋原作登録坂実接地・塗装backing ID一致の限定PASS。OWNインク一観測は回復/ENEMY減速の完成ではない。25/17/26/0、自然敵味方0/16、Scoreable0/Winner NONE、正式4v4/F4中央衝突/ART/公開HOLD。V27第4節に沿い、次は既登録SOURCE内の人間実移動・OWNイカ回復・再射撃の連続実ゲーム機能を最優先し、根拠のない床/橋/NavLink/ワープ/得点を追加しない。新文書/細かなQA/HUDや既証明試験の反復でなく、ゲーム本体の関連修正をまとめる。main/PR#5/Pages/正式QA/PRIVATE/本人PCを保護、研究branchのみ最新SHA＋単親expected_sha CAS・非force。本人操作原則0、0円、Work/Windows/高負荷は個別承認。最終報告は成果・実証範囲・HOLD・次のゲーム機能を簡潔に。
