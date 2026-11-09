# Browser Ink TPS / T21 — V23 原作ステージ再建・完全批判的引き継ぎ（2026-11-10 JST）

> **本人の明示依頼による一度だけの統合引き継ぎ**。ゲーム本体の進歩ではない。旧V22を破棄せず継承し、固定F1〜F5/Fast Track/永続決定は不変更。V24などの継続的な文書増殖は禁止。事実は新チャットでライブHEADと照合。

## 0. 現行の本人実機事実・結論
- ユーザーは2026-11-10 JST、既存Windowsローカル `C:\Users\ryoma\Downloads\T21_fixed` で新実装を更新し、`PLAY_ORIGINAL_STAGE_WINDOWS.cmd` から127.0.0.1:4174の**原作高精細レビュー画面**を実際に表示した。プレビューには高精細な建築と大きな灰色の簡素な物理床が同時に映る。
- 1回目はモデル全体と物理床の視覚的乖離が大きかった。原作モデル座標を物理の「プロジェクト座標」に移すreview-onlyの試みを加えた2回目で、ユーザーは**「自陣だけ重なってる」**と報告。画像でも手前の自陣床周辺はかなり一致する一方、中央側は大きく不整合に見える。
- これは**レビュー画面STAGING（3:00、CPU 2/7など再合流途中）**の画像であって、同SHAでの180秒真正試合、全域の床接地、正式ART、全CPU物理失敗を証明しない。見た目の床は歩行できると限らない。
- **最も重要な方向転換（上位仕様変更ではない）**：警告/エラーハンドラ/HUD増殖を中断し、**モデルと物理床の同じ世界座標での意味論・位置/高さ照合と、原作根拠のある連続床の再建**へ工程の中心を移す。
- ユーザーの「良いビジュアルの部分を全部衝突にすればいい」は有力な着想だが、「全ポリゴンを床にする」のは否定。原作から原作の床・斜面・垂直面・ガラス・グレーチング・装飾・未配置Actorを分離して試す。

## 1. GitHub正本／保護
- repo `ryomashibaba/browser-ink-tps`。唯一の書込可: `research/t21-integrated-a1-c-patrol-four-mode-20261105`。**本書作成前HEAD** `fed50358c8fec4bef069ecf7852bfcbada0634b7`、[軽量CI #42642849202](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42642849202) SUCCESS（Node 5/5、Vitest 58/58、TypeScript＋Vite build、重い native 180s **SKIPPED**）。新HEADは本書のdocs-only保存分だけ進むため、開始時にAPIで再確認。
- 2026-11-10確認: `main` `fbd922cea900df8e1a139f21b3c61ed927b3fdd9`。Draft PR #5 open/draft/unmerged、head `8cfc95756ef0b56e2c33dc9f89a9041126daa272`。main、PR#5、Pages、T19C/T20、正式QA、PRIVATE/原本、固定ロードマップ、本人Windows設定・ローカル原本は書込禁止。
- 順に読む: `START_HERE.md`最上段→**本V23全文**→`docs/continuity/BROWSER_INK_TPS_V22_AFTER_K3_CRITICAL_COMPLETE_HANDOFF_20261109_JA.md`→必要時V21/FAST_TRACK/DECISIONS→実装コード/根拠RUN。旧文書中の「最新」「次」は歴史的スナップショット。
- 研究の更新は直前HEADと `expected_sha` でCAS、単親commit、`force:false`のみ。競合なら停止。外部原作OBJ・MTL・PNG・未承認派生メッシュをリポジトリやCI artifactに無断公開・転送しない。

## 2. 凍結ゴール・進捗の断面
- 対象は『Splatoon 3』Ver.7.2.0以降の**マテガイ放水路 通常ナワバリ**。Big Run/トリカラ/旧版混同禁止。原作にできる限り忠実で、1人＋7実CPUの自然な4v4、180秒、実移動/接地/照準/射撃/塗装/インク/サブ/イカ回復、HP/敵との実交戦/撃破/150tick復活、正式Scoreable・公式勝敗・再戦、実プレイのART/操作/性能を完成させる。
- 固定 F1=原作登録8人 setup、F2=連続本物KCC/Recast移動、F3=遊べる縦切り試合、F4=原作ソース全域/衝突/原作得点、F5=人間試遊/ART/公開ゲート。F1〜F5は順番を勝手に書き換えない。**F4のボトルネックをF2/F3の進行と並行して改善する作業順の最適化**に限る。
- 凍結された研究SOURCEは 25 Rapier solids、17 PaintSurfaces、26 NavLinks、**0 Scoreable**。自然敵味方間経路 **0/16**、中央8ギャップVer.7.2.0原本Face/flags権限0。official Winner NONE、`activationReady=false`、`productionAuthorized=false`、`unrestricted4v4Certified=false`、正式4v4/ART/公開HOLD。
- 局所実績: K1真正WASDで既存坂接地 [#42493927363](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42493927363)、K2全CPUの本物の塗装 [#42523962398](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42523962398)、K3同一世界180秒＋再戦 [#42540893238](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42540893238) は**それぞれ該当SHA限定PASS**。真の敵HP/自然経路/公式得点や新HEAD全部の180秒成功を意味しない。再実行の必要がなければ既存RAW再利用。
- F3G/F3L: 10/19頃から原作由来の **57,578 static三角形、54マテリアル、最大19枚の原作テクスチャ**を検証した専用光学モデルあり。ローカルにハッシュ照合して表示する `PLAY_ORIGINAL_STAGE_WINDOWS.cmd` を `edf1bb13` で追加。`fed50358` まででreview-only位置合わせ。これらは**原作ゲーム衝突属性を含まない**。
- Windows floor trace: `T21_W10B113_ORIGINAL_FLOOR_TRACE_TICK_1498.json` の記録で床支持喪失・落下。下段の登録床のほぼ境界から離脱し、後続の同じ高さの原作登録床/限定光学F3Eなし。**すべてが物理床内部の貫通とは断定できない**。既存F4床端検査は登録済みF3Eのみであり、フルF3L原本すべての不存在証明ではない。

## 3. 主な根本原因と過去計画への反証
1. **局所変換を全域解決と誤用**：`UndertowSpillwayRemodelGeometryAudit.ts`はmodel→project XZをrotation 26.116°/scale 0.964211などで定義、Y=modelY−3。F3Lは元OBJの生座標で描画されていたため研究reviewで同変換を光学Rootに適用（`fed50358`）。元の登録調査の外周p95残差10.242mは**局所登録が全域で安全でないという警告**だが、ゲーム全体の床ずれ値そのものではない。自陣での一致は中央・対岸を保証しない。
2. **物理と見た目のソースが違う**：真Rapierは25登録solid/簡略化footprint由来。美しいF3Lは57,578 static OBJ三角形＋UV由来。視覚だけで現在25個を全域原作と認定できない。`FldObj_`など元OBJの静的個別モデルの未配置/版違いも未解決。
3. **原作の版/衝突属性未確定**：OBJ SHAの一致は純正Ver7.2.0通常ナワバリのcollision flags/Actor行列/ゲーム中の通行規則とは別。屋根/壁/ガラス/側面/グレーチング/装飾を「床」にして全衝突登録すると誤衝突、二重床、貫通・偽接続が起こりうる。推測NavLink・透明橋・Actorテレポート・閾値緩和は禁止。
4. **周辺コードの過剰生産**：SAFE STOP対策、警告、HUD、可視化、診断/小CI、B番号を毎工程作ったが、本質の全域物理床不一致は残った。初期新Visual pose変更 `1df97c` では未定義変数でCI failure、`e4887b`では追加テスト型でfailure、`fed50358`まで3コミット要した。**push前ローカル相当検証と関連変更バッチ化を優先**。
5. **真正の結果のスコープ越え**：CI build successはWindowsプレビューの視界/物理/ART成功を意味しない。実機画像STAGINGのCPU 2/7はまだ全CPU失敗の証明にならない。過去K3の成功は実本人通常遊びや現HEADの正式4v4を保証しない。
6. **新たな反対仮説への批判**：「物理全体を生OBJ座標へ移せばよい」は人間スポーン・原本25solid・Recast・Ink・CPU・カメラ全系統を広域再配置する危険があり、Freeze境界と衝突する。無承認では採用しない。「登録床を捨てて全OBJを衝突化」は版/flagsがないため不可。「自陣が合ったなら中心も合う」は画像と原台帳に反する。

## 4. 最適化した今後の実工程（F1〜F5に従属）
**バッチA — 原作モデル×物理床の差を数値と同視点で確定（次に行う）**：
- 現HEADと既存のローカルパック生成/変換コード/レンダリング/既存SOURCE floor inspector/保存RAWを再利用。新しいHUDや大量ログを作らない。
- **同一真ワールド座標**で、実際の25 Rapier top/triangle colliderと原本F3L/F3G表面（表示用登録変換つき）を自陣→1段落下→右低所→坂→中央入口、可能なら反対側まで**代表6〜10の原作識別済みアンカー**で比較。局所一致と不一致をそれぞれ実数・高さ・正常/異常/UNKNOWNで表示。角度/全体モデルを勘で追加校正しない。
- **版と意味論のゲート**：対象F3L原本が7.2.0通常Turfに対応するか（版/OBJ Face ID/オブジェクト意味）、Actor配置の要否、地面と屋根等の衝突属性、上下法線、厚み、二重交差、Recast侵食幅を分離。原作本体に衝突フラグ情報がない場合は「不明」と記録。
- このAの成果は「差が出た真の原作面と理由」**1件以上の再現可能な根拠**。新しい体感改善なしをPASSと見せない。自陣の再測定だけで終了しない。

**バッチB — 原作根拠のある実床を限定・隔離Rapierで再建**：
- Aで原作版・同一座標・床意味論・通行可能性が**独立に認証された1連続経路**のみ対象（最初は本人落下点に近い高所→低所→正規坂）。原作三角形をそのまま利用可能なら元頂点/面ID/UVは不変、レンダのみ変更して偽通路を作らない。
- 別の隔離研究ステージにRapier trimesh候補を生成。床・坂と壁/ガラス/柵/装飾を分離し、旧登録solidとの二重衝突を検査。**この時点では25/17/26/0の本体・通常PLAYERは一切変えない**。
- Human実KCCで足元support ID、段差/坂/落下、カプセル上下左右、非貫通、原作通行を連続テストし、独立Recast/Crowdで7CPUの物理的接続を確認。人間だけの成功で正式通路としない。版/flags不足なら本体昇格HOLD、他の既知原作床の遊びを改善。
- 原作根拠/差分が確証され、固定正式ゲート・ユーザーの適切な明示承認が得られる場合だけ、**変更可能な研究ランタイムの限定箇所**として別途昇格案。元25solid/正式SOURCE直接上書きは禁止。

**バッチC — 経路とゲーム本体**：
- A/Bが合理的な範囲で進んだ後、独立証明された原作床で一連の人間移動＋本物CPU7/相手対峙を実プレイ検証。自然0/16が残るならそれを正直に保持。Recast用の仮想広域NavLinkとActorワープ禁止。
- K3の180秒とOWN・サブ・再戦実績を流用しつつ、実際の敵HP/撃破/復活/公式Scoreable/勝敗を必要な原作権限が確保された順に統合。Art/UX/性能はF5で本人が短い通常プレイをして決定。ART HOLD中は美しさの改善≠正式ART認証。
- 途中で正式F4 Face/flagsが得られなければ、その範囲はHOLD、F1〜F3の合法SOURCE内で体験を改善。偽装して全域を埋めない。

**受入指標（件数やCI緑以外）**：
(1) 再現した不整合位置の物理/原作座標・Face由来・不確かさの減少、
(2) 同じ経路で見た目と接地の誤差と重なり（実測可能な範囲）、
(3) 人間実KCCの連続支持/非貫通、
(4) 本物CPU7 Recastの連続行動・自然敵経路、
(5) 本人普通の操作/カメラ/射撃/180秒、
(6) 公式権限と人間最終承認。
不明にゼロやPASSを割り当てない。

## 5. 行動契約・費用・ユーザー負担
- チャット＋接続GitHubでまず必要なコード/証拠を収集。ユーザーに再び同じスクショ/JSON/旧ZIP/複雑なPowerShellを要求しない。以前`T21_fixed`をZIP展開するとWindowsパス長0x80010135だったため**Git clone checkout更新経路を維持**。本人PC操作は個別明示承認なしで行わない。
- 1まとまりの実改善→必要最小の軽量Unit/tsc/Vite→**実挙動が変わる場合だけ**真正Chromium1系統→実証とSHA対応→研究ブランチCAS非force保存。同条件重複RUN、無関係CIの一括再実行、Docs/HUD/ワークフロー/テスト件数量産、無意味な数mm校正は禁止。
- 重負荷・Work/Computer Use・原本/本人Windows・PRIVATE・本番/public/正式QAの既存個別許可境界は厳守。追加課金0円原則。MAB/Strata/DECEMBER_2026等へ越境しない。
- 本人の試遊がどうしても必要なときのみ、新しく**実際の床挙動が変わった後**に1回の起動・1件の代表画像/必要なら既存JSONを依頼。それ以外は操作0回。
- 報告は「今回の実ゲーム価値／認証済み根拠SHA・CI／Windows・F4・正式4v4の未認証／次の唯一の工程／本人操作要否」を短く。**次チャットに引き継ぎ文書の再制作をさせず、直ちにバッチAの実作業へ**。

## 6. 新チャット向け最短指示
> Browser Ink TPS / T21 Undertow Spillwayの既存開発を継続。新企画・上位F1〜F5変更ではありません。まずGitHub `ryomashibaba/browser-ink-tps` 研究ブランチ `research/t21-integrated-a1-c-patrol-four-mode-20261105` の `START_HERE.md` 最上段から **V23** `docs/continuity/BROWSER_INK_TPS_V23_ORIGINAL_STAGE_CRITICAL_REBUILD_HANDOFF_20261110_JA.md` を全文読み、V22/固定F1〜F5/Fast Track/DECISIONSを継承、現HEAD/CI/PRを実照合。最新の本人Windows画像では高精細原作F3LとRapier床は自陣でだけ部分一致、中央から先はずれる。前基準SHA `fed50358`、軽量 #42642849202 は63件＋ビルドPASS、真正全域/180秒ではない。モデル全衝突化/偽床/閾値緩和は禁止。今すぐV23バッチAの原作版・座標・Face/床属性の実証と、次の物理改善へつながる実コード/根拠生成に進む。本人操作0回、追加課金0円、main/PR#5/Pages/原本/正式QA/PRIVATE保護、研究ブランチ expected_sha付き非force CASのみ。25/17/26/0・自然0/16・Scoreable0・正式4v4/ART/公開HOLD。ドキュメントやCIの増殖で止まらず、本人が次に実際遊べる改善を優先してください。

**V23は引き継ぎ書保存だけでゲームコードは変更していない。**
