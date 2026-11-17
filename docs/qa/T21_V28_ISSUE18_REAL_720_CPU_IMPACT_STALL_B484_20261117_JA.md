# Browser Ink TPS T21 V28 — Issue #18 / QA 実プレイLot 2

**基点SOURCE HEAD:** `b817c7eae70038a1b83da77fc8f517b08ea9c0ea`（司令塔指定）
**担当:** 独立QAのみ。main/正式QA/Pages/研究統合本線・原作StageDefinitionを変更しない。原作SOURCE = **25 solids / 17 PaintSurfaces / 26 NavLinks / scoreable 0**、F4 HOLD、正式4v4 HOLD。

## 本ロットの新たな真正Chromium事実

- **1回限り** [Actions #44030233150](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44030233150) 実行（既存SOURCE B440、追加のフル180秒なし、720tick設定）。
- [原本RAW/真正スクリーンショット一式 Artifact #14305955171](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44030233150/artifacts/14305955171)。ZIP SHA256: `04462aec5e9ef19446fc4541cde7a6022b8a6c4457ce4f26f3271f072b550b0c`。
- 本体CI buildはPASS、独立QA 8/8 PASS。**総合RunはFAIL**。最後のエラーは `B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED`（表示HUDの検証条件。後述）。
- K2は同じ実ブラウザ `performance.timeOrigin=1794896360366.9` のまま `firstTick=1068` → `lastTick=1793`、**725 native ticks** の実進行を確認。600tick閾値超過。別世界へ移動した捏造カウントではない。
- 真正SOURCE 7CPU全員が物理rejoin。CPU 7体全員で **実Source Turf射撃要求とPaintCoordinatorが受理したインパクト塗装** が記録された。RAW `k2PerActorNativeShotAndInk.verdict=PASS_SEVEN_REAL_CPU_PROJECTILE_INK` は **CPU塗装に限定したPASS**。人間相手・敵への命中や公式得点ではない。
- 合計CPU射撃要求 **156**、塗装インパクトによる **延べ7,205セルのownership変化**、全CPUイベントの延べPaintChanged **8,001セル**。同一セルを再塗装した可能性があるためユニーク面積ではない。
- `b178SourceInkRecovery`: OWN接触tick **2,127**、実OWNインク回復量 **98.47**、回復tick **287**。敵色床HP損失は **0**、敵色床接触は **0**。
- 人間実CDPマウス射撃 **6発**、SOURCE床インパクト **90 changed cells**。人間→CPU HP命中は未認証。

| 本物のCPU | 射撃要求 | 実着弾塗装セル変化 | 衝突面に塗装が届いたか |
|---|---:|---:|---|
| A1 | 14 | 558 | 限定PASS |
| A2 | 14 | 560 | 限定PASS |
| A3 | 14 | 1,579 | 限定PASS |
| B1 | 14 | 1,276 | 限定PASS |
| B2 | 14 | 1,506 | 限定PASS |
| B3 | 14 | 548 | 限定PASS |
| B4 | 72 | 1,178 | 限定PASS |

※ `impactChangedCells` は原作登録塗装面の実セル変化であり、**敵のHP命中、敵撃破、自然接触、正式スコアではない**。

## 物理床の連続観測：移動が止まるCPU

[Artifact内 `b454-native-b2-b4-physical-60hz.json`] の実WebGL/60HzネイティブCPU足元を単一世界で照合。

- B2: **737/737 native tick**で登録済み原作Rapier床支持、時刻1057〜1793。長いほぼ静止連続区間 **511tick（8.52秒）**。初期位置〜最終位置のXZ正味移動 **10.172m**。
- B4: **737/737 native tick**で登録済み原作Rapier床支持、時刻1057〜1793。長いほぼ静止連続区間 **582tick（9.70秒）**（足元の連続変位0.005m以下で判定）。XZ正味移動 **7.994m**。
- このRAWはCPUが空中に落ちたため停止したという説明を支持しない。原作床支持は継続している。ただし **連続KCC経路の完成、停止原因がAI/Crowd単独、元の経路の認証** までは証明しない。
- 既存 `CpuSourceCrowdStallRecovery` の再試行安全ゲート（5秒静止、最近の物理ブロックから300tick）と突き合わせる優先材料。無根拠なCrowd/KCC移動強制、床増設、NavLink緩和は禁止。

## A1実Cキー2回とB484表示検証の切り分け

`b484-real-source-a1-foot-60hz.json` は **642tick連続**。原作Rapier支持 `642/642`。実人間Cキー要求2回、独立B471の原作到達カウンタ2、二番目の原作目標への観測中最接近 **約0.675m**、二番目の指示区間で観測された実足移動 **約9.749m**。`commandCausedAllMovementCertified=false`、`originalCapsuleRouteCertified=false` のまま。

真のRunはこのB484実ネイティブ成果をRAWに保存した**後**、`B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED` で停止した。

- `scripts/t21-b440-short-native-original-foot.mjs` のB484段階は PLAYER表示に対し `A1 C ORDER 2 ·`、`verified arrivals total`、`this order closest` など **QA詳細表示の文面**を要求する。
- しかし `src/app/UndertowF3PlayablePreviewApp.ts` の実PLAYING描画は `isHumanPlayerView ? b141PlayerAllyHudLine(...) : fullAllyQaText` を採用している。PLAYER用 `b141PlayerAllyHudLine` は意図的に短く `C ORDER · ...` と表示し、上記の詳細文面を含まない。
- **QAランナーの詳細文言要求とプレイヤー用短縮HUDの期待値が不整合**であるとコードレベルで確認。旧ランナーは失敗フレームの `textContent` をRAWに保存していないため、当該時刻の実DOM文字列そのもの・唯一の根本原因は未特定。初期B25クリック不達の再発ではない。
- ユーザー操作可能な短縮PLAYERを詳細表示に戻すのではなく、**QAランナー側でPLAYER短縮表示とF8 QA詳細表示を別々に検証**するのが妥当。ただし本QA担当は他担当アプリ/共通ランナーを書き換えていない。

## 先に改善すべき実プレイ問題

**第一：原作床に支持されたB2/B4の8〜10秒級停滞を解消すること。** 入力（人間の6発）、7CPUの塗装/OWN回復は成立したのに、人間と敵が自然に遭遇してHP0→150tick復活へ至る**本物の同試合証拠は依然ない**。F4/原作経路未認証を偽の連結で解消してはならない。

次段階の所有者：CPU担当はB2/B4で既存安全ゲートが再目標を認めたか、ブロックtick履歴と元Crowd/KCCの有界リフレッシュ条件を照合。HUD/QAランナー担当はB484 PLAYER/QA別文言の誤判定を修正し、その後にのみ本人確認済み実ゲームの次のステップを評価する。**今回の真正720tickは二重実行しない。**

## 独立QA実装と検証結果

1. `scripts/t21-v28-qa-real-source-acceptance.mjs`：真正B440 RAWから人間実入力、K2同じtimeOriginと実測tick差、7CPUごとのショット要求/セル変化、全CPUのサンプル物理移動を読み取り専用で監査。HP・撃破・150tick・正式4v4は誤認証しない。
2. `scripts/t21-v28-qa-native-foot-a1.mjs`：B454とB484の真正60Hz保存RAWを独立監査し、原作支持されたCPUの長時間停滞・二番目の人間Cキー後A1原作足の連続証拠を分類。
3. 専用の限定Chromium one-shot workflow（**実行済み1回**、RAW+PNG失敗時保存）と軽量offline workflow。
4. [軽量CI #44031724857](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44031724857)：2本のread-only QAスクリプト構文検査PASS、**14/14 tests PASS**、真正Chromeを再起動していない。

SOURCE Stage、Rapier collider、Recast/NavLinks、CPU動作、HP、Projectiles、Ink ownership、scoreable、正式QA、main、Pagesは全て**本PRでは不変**。研究本線への統合は司令塔の判断。
