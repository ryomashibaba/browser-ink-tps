# T21 B414：真正Chromium SOURCE 180秒・HUD CSSOM誤判定修正とRAW独立再実行（2026-11-04）

## 固定境界・判定

- 対象: `ryomashibaba/browser-ink-tps` 研究 branch `research/t21-b406-single-session-real-enemy-range-audit-20261103`。main/正式QA/T19C/T20/Draft PR #5/Pages保護。原作 **25 solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable**、自然対岸0/12。敵HP/撃破/復活、正式4v4、公式得点/勝敗、ART/productionは**HOLD**。
- [真正Chromium #41725404578](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41725404578) のコードSHA `20ebfaddbd90fd65cbefaf5b0a02d195b53efcd8`。Actions全体は**FAIL**。ただし**実180秒ゲームと既存B409–B413独立監査はPASS**。失敗は追加B414独立監査最初の `ORIGINAL_VISIBLE_BEFORE_SQUID_BEFORE`。このFAILを履歴から消さない。
- [真正artifact #13274792229](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41725404578/artifacts/13274792229) ZIP SHA256 `57d62fd89375a9f8c8be4c79319106e198e406235e508b46f3657fa712db52f6`。実スクリーンショット、native HUD DOM、ゲーム本体値・既存B409–B413判定を含む。
- 原因：元監査が CSS `element.style.width` の戻り値を `ink.toFixed(2)+'%'` に厳密比較していた。実Chromiumは `100.00%`→`100%`、`82.90%`→`82.9%` と**CSSOM正規化**するため、資源・バーが一致していても誤ってFAIL。
- 修正コードSHA `25632c076cbd27ea383798f564790e10b09d68c2`。修正はB414独立監査・そのユニットテストのみ：`x.width===Number(x.hudInk.toFixed(2))+'%'` に変更。正常なCSSOM表記だけを通し、値の虚偽・改ざんを許容しない。加えて元native tankとHUDの差を `<0.25`、native mode/recoveryとHUDの完全一致を要求（判定を強化）。
- 修正後のJavaScript監査実体を上記ZIPから抽出した元RAW 4ファイルに**読み取り専用で再実行**。ローカルJSファイル `git hash-object = 09841912fec2b0050bc726e79cb0cb044ce30e13` と、GitHub実際の修正監査ファイルblob SHA **完全一致**。B414 `PASS_VISIBLE_REAL_SHOT_OWN_REFILL_RESHOT_IN_ONE_180S`。ユニットテスト正常系3件/偽データ拒否10条件PASS。
- ただし**このRAW replayのPASSは新SHAの真正ゲーム再実行PASSではない**。新コードSHAに対する [Actions #41728078065](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41728078065) の同SHA・同試合ゲーム/独立監査結果が確定するまで、B414正式SOURCE限定認証はHOLD。

## 実RAW・ゲームとHUDの一致

| 段階 | 真正tick | native ink | Chromium表示幅 | 実DOM mode/recovery |
|---|---:|---:|---|---|
| 射撃前 | 6508 | 100.00 | 100% | HUMAN / HUMAN |
| 射撃後 | 6588 | 82.90 | 82.9% | HUMAN / LOCKED |
| OWNイカ補給1 | 6619 | 86.30 | 86.3% | SQUID / SQUID_OWN |
| OWNイカ補給2 | 6649 | 90.83 | 90.83% | SQUID / SQUID_OWN |
| OWNイカ補給3 | 6655 | 94.23 | 94.23% | SQUID / SQUID_OWN |
| ヒト復帰 | 6667 | 96.37 | 96.37% | HUMAN / HUMAN |
| 再射撃前 | 6679 | 98.37 | 98.37% | HUMAN / HUMAN |
| 再射撃後 | 6733 | 85.23 | 85.23% | HUMAN / LOCKED |

- 残り90秒からの本物の原作上段射撃は18発・実消費17.10、本物のイカOWN回復はB413独立監査で3.40以上、本物の再射撃14発・実消費13.13。本物TIME_UP tick11859。7CPU、元4 PaintSurfacesでの人間原作塗装。B415プレイヤー目標 `COMPLETE` / `PRACTICE INK LOOP CLEAR · UNSCORED` はRAWで実測。**本物の敵命中0、公式スコア/勝敗0**で、完成4v4の根拠にはならない。
- 実DOM表示・ネイティブ残量は各8サンプルで数値一致（値の補正やmock無し）。試合終了時にはコンパクトHUDは `visible=false`。
- 間違いを繰り返さないため、次工程は #41728078065 の**同SHA最終Actions・native RAW・独立B414 PASS確認を最優先**。CLI/unitだけの成功で認証しない。成功したらF1–F5固定ロードマップへ戻り、インクHUD周辺のマイクロQAを無制限に追加しない。

## 変更・保存の範囲

研究 branch のB414監査プログラム、ユニットテスト、引き継ぎ資料のみ。物理・原作源データ、PlayerResources、CPU、所有インク、時計、正式得点、main・正式QA・PR #5・Pagesに**書き込みなし**。
