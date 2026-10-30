# Browser Ink TPS — 固定の引き継ぎ入口

**このURLは今後も変更しない。毎日1,000行の引き継ぎを作り直さない。**

## 新チャットで使う短い指示

> Browser Ink TPSの開発を継続して。まず https://github.com/ryomashibaba/browser-ink-tps/blob/dev/t21-f4e103w-qa-infra/docs/continuity/START_HERE_JA.md を読み、最新HEAD・証拠・既存方針を照合して、次の実工程を進めて。

## 新しい担当AIの起動手順

1. QAブランチ `dev/t21-f4e103w-qa-infra` の**現在HEAD**をGitHubで取得する。以前の引き継ぎにあるHEADを今の値だと決めない。
2. [永続決定記録](DECISIONS_JA.md)、[凍結アーキテクチャ](../../CURRENT_CANONICAL.md)、[優先ロードマップ](../../T21_FAST_TRACK_ROADMAP.md)を読む。既存の原作・ゲーム完成方針は勝手に上書きしない。
3. [自動更新状態](https://github.com/ryomashibaba/browser-ink-tps/blob/meta/t21-continuity/docs/continuity/LIVE_STATE.md)を読む。同期元SHAと手順1のQA HEADを比較し、違ったら**キャッシュは無効**とする。
4. QAの `docs/qa/W10-B*.md` を工程番号の数値順で調べ、最新レポートの**本当に完了した範囲、未完了、次工程**を把握する。最新レポートが草案・HOLDなら完了と扱わない。
5. GitHub Actionsの同一SHA、ジョブ結果、必要なJSON実測・画像を確認する。文面のPASSと実物理のPASS、全試験SUCCESSと個別ステップSUCCESSを混同しない。
6. ゴールは**Ver.7.2.0マテガイ放水路の原作に忠実で本当に遊べる通常ナワバリ**。次のB番号を増やすより原作移動・CPU・戦闘・塗装・試合・視認性の実質的な改善を優先する。
7. 「次へ」と言われたら、可能な範囲で実装→最小限の適切な回帰試験→実ブラウザ→QAブランチのコミット→CI/実測の確認まで実行。完了していないものを完了と偽らない。
8. 報告は**成果 / HEAD / CI URL / 実測 / PASSの範囲 / HOLD / 次工程**だけを日本語で簡潔に。長文の引き継ぎ全文を作らない。

## 厳守事項

- `main`、T19C/T20凍結、Draft PR #5、公開Pages、Windows実機原本は明示承認なく変更しない。
- 原作認証境界は原則 **25 solids / 17 paint / 26 source links / 0 scoreable / opponent paths 0/12**。`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`をテスト都合で変えない。
- 推測の床・坂・NavLink・正式得点面、テレポート、偽物理Tick、安全閾値の恣意的緩和はしない。
- 非公開原作OBJ/Actor/Face/画像/動画/抽出データを公開GitHubやActionsへ勝手に転送しない。
- 人間のRapier KCCと8人目の非物理Recast HUMAN代理を混同せず、局所代理除外箇所の対CPU回避を認証済みとしない。
- Chat＋GitHubで進め、ローカルWorkは明確な利点＋ユーザー事前承認がある場合だけ。ZIP解凍・CMD連打・頻繁なWindows作業をユーザーに頼まない。

## 仕組み

QAブランチのpush時、[軽量自動索引CI](../../.github/workflows/t21-continuity-state.yml)がレポート名とソースSHAから参照用状態を作り、**別ブランチ** `meta/t21-continuity` の `docs/continuity/LIVE_STATE.md` にだけ保存する。ゲームソース、QAブランチ、main、Pagesにボットが書き戻すことはない。CI停止・古いキャッシュを検出したら、必ず上記1・4・5から現在の事実を再取得する。自動索引は**ゲーム完成や物理を新しく認証しない**。


## CIの起動条件（B131以降）

共有F3アプリ変更で古い個別CIを大量起動しないよう、[CIトリガーの運用・復旧手順](CI_TRIGGER_MATRIX_JA.md)を参照する。B75等の中心的な統合QAは維持し、必要な旧試験は専用コード変更またはGitHub Actionsの手動実行で利用する。

## 2026-10-25 効率改革の確定追記

次の開発担当は [効率改革・機能単位実装計画](FAST_TRACK_EXECUTION_JA.md) を必ず確認する。小さなQA追加を1工程の完成とせず、実際に遊べる複数機能をまとめて実装・検証する。B184〜B191の既存CIキューは再起動・重複起動せず、当該SHAの実測完了まで限定HOLD。原作認証境界は上記のまま変更しない。

## 2026-10-30 B349確定証拠と次の統合工程

この追記は**発見済みの真正結果の索引**であり、新しいゲーム実装・実験PASSの主張ではない。2026-10-30 15:50 JST 時点のQA HEADは `e6a5dad30ed5b8ca1228a59ca44a48ffb572ca11`（次回は必ず取り直す）。

- B349実Space→Rapier KCC地上/空中射撃： [真正Chromium #41016263622](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41016263622) **SUCCESS**。物理発射10発＝地上4＋空中6、実KCC上昇1.0333m、偽ジャンプ・偽弾・推測面なし。B337/B344/B345/B346/B348独立検査も同ジョブ内でSUCCESS。
- 独立の別条件B349： [真正Chromium #41016386310](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41016386310) **SUCCESS**。地上4＋空中6、実KCC上昇1.033333m、元のPaintableへの物理Exit10、ownerGrid changed-cell event394（別実行の計数。上記のインク349と混同しない）。
- この成功は**限定技術認証**。Nintendo純正拡散、画質、武器バランス、自然な対岸CPU経路0/12、Scoreable 0、正式勝敗、4v4、productionはすべて未認証/HOLD。B350の技術的照合強化が通ってもゲーム完成宣言は禁止。
- **次の実プレイ価値のある統合工程**は、`pulse-sprayer` の同一真正ブラウザセッションに「移動中/ジャンプ中の実射撃、実物理着弾、元Paintable塗装、インク資源、原作HP対象への命中、操作/照準/視認・音」を連結し、同条件5視点を比較すること。原作根拠のないジャンプ拡散パラメータは研究仮説として隔離。
- **チャット破損対策**：新規チャットでは最上部の短い指示＋このURLを使用。巨大なActions生ログ・全文履歴を貼らず、HEAD/CIリンク/実測/認証範囲/HOLD/次の機能のみ報告する。GitHubを正本とし、旧会話の自動要約は最新コミットの証拠より優先しない。

## B351 — 本物の敵CPU HP減少と連動した命中演出（研究候補）

SOURCE 180秒のみ、既存のB343/B345/B346/B348をオプトインした状態で追加 `t21W10B351=realCpuHitCue` を指定。人間のpulse-sprayer物理弾が敵CPUのHPを実際に減らしたことを既存の `humanCpuDirectHits` の変化で確認した時だけ、短い視覚・音の命中反応を出す。盾吸収・壁・塗装・CPU射撃では偽の成功を発生させない。自然対戦での実証、ART、原作サウンド一致、正式4v4・得点は引き続きHOLD。[詳細](../qa/T21_B351_REAL_CPU_DAMAGE_CUE_CANDIDATE.md)。


## B354 — 真正W移動＋Spaceジャンプ＋マウス射撃の同時操作（技術研究）
2026-10-30 B353真正Chromium [CI 41067192264](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41067192264) 全CI SUCCESS。ただし「人間命中0・敵HP減少0・B351追加演出0」の限定HOLDが独立監査で確定。地上4＋空中6発、原作Paintable10着弾、塗装変化349は真正PASS。敵B1〜B4はZ−48m付近、人間はZ+68mで自然な対岸経路0/12、架空敵生成禁止。

次のB354は既存B349同一真正Chromiumセッションで、Wキーを射撃継続中に実CDP入力、Spaceジャンプも併用し、KCCの真の水平変位＋移動中の実物理地上・空中発射と銃口座標変化、元Paintable塗装、実フレームバッファを一括保存。新規ワークフローは増やさず、原作境界25/17/26/0とHOLDを保持。新HEADで真正CI成功するまでB354 PASS認定不可。


### B354初回実ブラウザ失敗の技術的原因と修正
[初回CI 41068787657](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41068787657) **FAIL**。B354真正 `HOLD_36` にはreal KCC airborne=true、bodyY約9.428m、移動して6発が発射・インク変化193まで進行。だが直後のCDP screenshotを待ったあとでSpaceキーUp用の別スナップショットを読んだ時には着地しており、`B349_TRUE_CHROMIUM_ACTUAL_SPACE_DID_NOT_MAKE_PLAYER_AIRBORNE` で停止。この未認証をPASSとは扱わない。修正は**1回の60tickマウス保持/Space操作が完了してから**画像をキャプチャする方法とし、前後ソース検査で射撃ループ内に画像取得がないことを回帰監査。画像は「射撃後の本物の画面」であって「空中の瞬間」と偽らない。原作・スコア・actor・弾・ゲーム時計は変更しない。新SHAのCI確認が必要。


### 2026-10-30 B354修正後の真正Chromium実測確定
[修正後CI #41074157473](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41074157473) 全ジョブ・全ステップ **SUCCESS**（HEAD `b71a83537ea0205ba622e74c5fe10fec1cf1b813`）。`B354_INDEPENDENT_GENUINE_MOVE_FIRE_VERDICT` は `PASS_ACTUAL_SIMULTANEOUS_KEYW_SPACE_SHOOT_AND_SOURCE_PAINT`。W保持中の真の水平移動 **2.6477m**、実物理弾の発射銃口移動 **2.3799m**、W移動中の物理弾は地上 **2発＋空中4発**。全体では真の物理発射・Exit各10、B349地上4＋空中6、実Space KCC上昇 **1.0333m**、原作Paintable着弾10、塗装変化イベント449。画面 `B354_POST_MOVING_FIRE.png` は**操作後**にキャプチャされた実フレームバッファであり、空中瞬間を写した証拠とは主張しない。B353独立監査は原作敵B1〜B4実在だが、CPU衝突0・HP減少0・B351演出0のため**HOLD**。正式原作武器忠実度・ART・自然敵交戦・公式得点/4v4・productionは引き続き未認証。


## B355 — 既存B76元SOURCEインク資源をPLAYERへ統合する限定実装
B354真正Chromium `b71a835` は [CI #41074157473](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41074157473) 技術PASS。B355は新武器パラメータや回復処理を作らず、既存 `PlayerResources` の実インク残量/回復状態、B76実塗装/空撃ちの情報から、PLAYER画面の既存HUD内部に小さなSOURCE専用インク回復表示を追加。オプトイン `t21W10B355=realInkHud`、SOURCE 180s限定。ゲーム状態の書込0、原作SOURCE 25/17/26/0、正式スコア/4v4/HOLD据え置き。B349真正Chromium同一セッションで、10発の実弾と塗装後、射撃停止したまま実60Hzでインクが増加・同じショット件数にとどまることを保存し、HUDにも読み出し権限を検査。原作インクパラメータ一致の認証ではない。新SHA CIの結果で初めてPASS/FAILを決める。


### B355確定実証 — インク資源とPLAYERの表示を真正Chromiumで一致確認
2026-10-31 JST、実装HEAD `bb315a220a4a7b8486001dcd064c471f9d942921` [CI 41078648178](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41078648178) **全ステップSUCCESS**。B355独立監査 `PASS_NATIVE_CONSUMPTION_STOPPED_SHOOTER_REFILL_AND_HUD`：本物のシューター10発後、実インク90.5→66 native ticks後98.5、期間内の受理済ショット件数10→10（増加なし）、PLAYERのインク表示 `HUMAN_REFILL`、既存B76が真正SOURCE情報を承認。B354本物のW移動＋Spaceジャンプ＋物理弾は地上4/空中6、原作Paintable Exit10、塗装変化449を再現。B353独立監査は実CPU接触・HP減少・B351演出すべて0によりHOLD。Scoreable 0/経路0/12、原作パラメータ・ART・正式4v4・productionは未認証。オプトインは `t21W10B355=realInkHud`、SOURCE180sのみ、ゲーム資源の書込0。

注意：B355初回 `4b61d6f` では不正Scoreable入力を意図したVitest負のテストがTS2322（型リテラル0に1を代入）でbuild失敗。次の `bb315a2` でテスト専用の型キャストに修正済。旧HEADの複数CI失敗はこの型問題に由来しており、新HEADのB349本命CIは修正後全成功。先の7系統起動は共有HUD変更により発生し、以後は不要なCI再実行を控える。

次の実プレイ価値のある機能は、基本シューターの照準・インク回復・命中時演出の「表示上のわかりやすさ/操作感」を真人間操作で比較し、原作ステージの未接続自然対戦をHOLDのまま、武器の独自研究パラメータと任天堂原作実測を分離すること。原作の未確認床/経路/得点は追加しない。


## B356 — 照準付近のจริง実塗装 vs 発射確認を分離
新規ルート・原作ステージ・弾・資源処理は変更せず、既存B23実`PaintCoordinator`による`humanChangedImpactCount`と`lastImpactChangedCells`および実`shotsFired`だけを表示に利用する。照準付近（視界中央の少し下）の小さな通知は、実弾発射のみなら `SHOT FIRED · PAINT UNCONFIRMED`、本当の原作ownerGrid変更なら `REAL SOURCE INK +N · NOT CPU HIT`。照準線B243の登録面までの予測を真正着弾・CPUダメージと取り違えない。SOURCE 180s PLAYER限定手動オプトイン `t21W10B356=realImpactReticle`。原作境界25/17/26/0、0 Scoreable、4v4/HOLD、ART HOLD、production不可。真正B349 Chromiumに独立物理Exit/ownerGrid/DOM監査を統合。見えるパルスをキャプチャできなければ検証はHOLDと明示し、偽のCPU命中表示を出さない。新HEAD CIの結果で限定判定。

## B357 — 真正射撃中のSOURCE照準と実インクの同期記録
前のB356 [CI 41081279142](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41081279142)は確認時点でGitHub Actions Queued。B356終盤の単発DOM読み出しだけでは、実SOURCEのImpactから27物理Tickで消える画面表示を取り逃す。B357は既存B344の6つのCDP frame読取で、同じ`Runtime.evaluate`にネイティブSOURCEのshot/impact/ownershipと実DOM reticleを同梱。追加スクリーンショット/人工時計/架空弾/HP/CPU座標なし。独立監査は単調増加イベント、物理Paintable衝突、SOURCE impact tick/個数/セルと画面の値が一致した場合のみ技術限定PASS、観測漏れはHOLD。原作25/17/26/0、自然対岸経路0/12、ART・敵命中・公式4v4・production HOLDは維持。新HEADの真正CI実測を要確認。
