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
