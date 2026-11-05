# Browser Ink TPS — B470巡回＋B471実CキーA1＋B472四モード統合 / 正式RAW照合
**2026-11-05 ／既存F1〜F5・Fast Track不変更。研究専用、ART／公式ゲーム未完成。**

## 統合成果と固定HEAD
研究branch：`research/t21-integrated-a1-c-patrol-four-mode-20261105`。
真正ゲーム統合コミット：[`c14809d875e5`](https://github.com/ryomashibaba/browser-ink-tps/commit/c14809d875e5ee2af50939206f546f520cc87239)。親は正規研究 `3a601c4da00ae2314cfa137eb84467838e618b05` とB471 ready `27cfca2adfa2dfdfeeae9ad1c625fa4ec4bf56b5` の2本。これによりB470真の同側CPU巡回、B471真のプレイヤーCキーからA1元SOURCE塗装Goal指示、B472 12武器選択の4 SOURCEモード共有、従前の原作Ink/Shot/KCC/Replayを**同一ゲームコード**へ統合。主ブランチの未完了長時間CIをキャンセルしないため隔離branchへ非force保存した。

## 同一ゲームSHAでの真正Chromium / RAW
1. [B441 #42044631548](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42044631548) **SUCCESS**、Artifact `13424420845` / `b441-true-native-source-frontline-short`。実CDP選択`ink-saber`、実PlayCanvas STAGINGのNative Player Weapon一致、選択Local保持、4つの既存SOURCEモードリンクすべてに同じ選択を反映、任意CPU前線クリック起動、実CPU7。Native 720 tickでB470同側の**追加厳格原作Goal 2件**、実OwnerGrid順位監査2件、**異なる実native Goal要求3件**（A2/B1/B3）、既存真正SOURCE足・原作Recast/Rapier保持。これは自然対岸0/12を解除せず、統合SHAの全A2/A3/B1/B3目標や長時間2試合全領域認証ではない。
2. [B162 #42044631755](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42044631755) **SUCCESS**、Artifact `13425045197` / `w10b162-actual-original-human-A1-ally-sync`。RAW `b471-real-player-c-original-a1.json`：**ACTUAL_CHROMIUM_CDP_KEYC=1、厳格原作Goal承認1、実Crowd Goal要求1、拒否0**、C入力tick1177→観測tick1189、`MOVING`。RAW `w10b162-real-ally-sync-practice.json`：**B162_NATIVE_60HZ_GENUINE_COOPERATIVE_CLEAR**、人間実変化808セル、A1真の弾着による実変化47セル、実接地移動35.72m、A1原作Shot/Impact 2件、公式Winner NONE、元SOURCE 25/17/26/0。true C入力後の本物画面には`ARRIVED`表示があるが、直後の注文RAWでは`actualOriginalArrivals=0`のため**到着カウンタ及び全tick全身カプセル連続移動は独立未認証**。A1協力CLEARは真正認証。
3. 新規ワークフローは作らず、既存B441と既存B162の**隔離branch triggerのみ**追加。B162では別件B200キーボード再戦TIMEOUTを混在させないため、この隔離CI限定で`T21_B200_REAL_REPLAY=0`、C指示検査をON。正式B200や正規ワークフロー定義に改変なし。

## 旧研究SHAにのみ帰属する長時間試合
[B413 #42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341) は`617f415841147ec2c76619eaf0a70ee4d9590d88`で**SUCCESS**。RAW Artifact `13423213798`。2本の別PlayCanvas/Rapier世界で各実180秒TIME_UP tick11860、native CPU7、最初の実射撃17発/消費16.15、SQUID OWN自然回復+12.75、再射撃14発/消費13.30。B430二試合PASS、B438二試合目真W物理足PASS、B463非公式前回比較UI有。**統合ゲーム `c14809d875e5` の2×180秒認証には流用不可。** B433 1試合目の自然敵間は最短でも人間→B4約94.51m、A1→B2約96.85m（標本1290件）、敵への自然HP命中0。B470局所同側活動を正式対敵戦闘とは呼ばない。

## 画面の批判的評価
統合B162の実1600×900 PNGはA1/Human実塗装色・操作HUD・REPLAY実ボタン・A1協力CLEAR/ARRIVED表示あり。実ステージの形状・高低差・遠方敵は依然見分けづらく、簡素な仮アバターと高密度HUDでF5 ART/操作品質は未承認。CI Ubuntu Chromiumの日本語は一部□表示で、Windows実画面の文字品質までは判定不可。技術PASSを世界品質ART認定としない。

## 不変条件と次の1工程
F1〜F5 / Fast Track、SOURCE **25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable**、自然対岸認証**0/12**、正式4v4・公式得点・公式勝者・ART・本番公開すべてHOLD。7.2.0版の個別FloorLine00ゲーム衝突フラグ、元CPU半径0.30m連続通路、対岸ナビは不明。架空床/橋/リンク、半径0、Actorワープ、偽敵/命中/HP/Scoreは禁止。main、T19C/T20、正式QA、原作非公開資料、Pages、Draft PR #5 OPEN/DRAFT/UNMERGEDは変更しない。追加課金0、Work/Computer Use不使用、ユーザー操作0。
次は**自然敵との真の接近を妨げる原作経路・物理・射線の因果障害を1個だけSource-authority付きで減らすか、許可済み領域内で実人間入力→命中→HP減→撃破→150tick復帰の一連CHAINを本物RAWで証明する機能バッチ**。原作権限不足を検出した場合はF4を局所HOLDし、既存プレイの視認性やB200再戦導線をまとめ改善。細かいQA番号追加/重複長時間CIは禁止。

**ゲームコード認証SHAは`c14809d875e5ee2af50939206f546f520cc87239`で固定。** この文書保存のみの後続HEADは未再試験ゲーム変更を含まない。
## 2026-11-06 継続：実再戦入力・B200隔離監査（ゲーム完了と混同禁止）
- B470/B471/B472統合の真正PASSは上記 `c14809d` (B441/B162) に固定。その後、Rキーによる**実協力CLEAR後の新世界再戦**と「選択済み人間武器だけの安全引き継ぎ」を `e23c493a` で実装。元Rapier/Recast/Actor/CpuAgent/Ink/Clock/Stage/Scoreには変更なし。関連TypeScript/Vitest/Build PASS。
- [B441真正 #42048776202](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42048776202) は `e23c493a` で **SUCCESS**。実7CPU・B470原作Goal・既存武器選択に退行なし。
- [B162/B200 #42048776153](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42048776153) は **FAIL**：実C原作Goal認証1、協力CLEAR（人間808、A1実38）後、Rキーで新世界認証できずWAIT_TIMEOUT。Rキー機能PASSではない。
- [B162/B200 #42050906465](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42050906465) も **FAIL**。実C原作Goal1、協力CLEAR（人間808、A1実30）後、Esc解除・実CLEAR・原作25/17/26/0・ミッションカード再戦可能なのにRキー後同一世界でWAIT_TIMEOUT。原因は当該RAW時点で未確定。B200の過去カード/HUDクリック成功も実Rキーの代替PASSではない。
- [B162/B200 #42053297053](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42053297053) は **FAIL**。実Cキー原作Goalは1件成功したが、`playB162GenuineAllySync` のB201 Esc/paused確認でタイムアウト。協力CLEARにもR入力にも到達していない。**このFAILをR処理再失敗と誤認しない**。Artifact `13427159711` はB471 Goalと未完走B162を証明。
- 本ゲームコード `d6f7f96b` はR入力から導いた決定（`NOT_RECEIVED` / `BLOCK` / `NAVIGATE_FRESH_COOP_CLEAR`等）を**read-only DOM dataset**に記録し、安全な再戦UIが拒否した場合の可視メッセージを追加。物理・正式ゲームロジックの閾値緩和なし。
- B201/B202独立PAUSE/RESUMEは過去RAWで限定成功しているため、**この隔離ブランチだけ**、既存B162ワークフローのB200実機再戦を検証するときは `T21_B201_REAL_PAUSE_RESUME=0`、`T21_B202_REAL_CONTROLS=0`。これは**B201/B202の包括PASSではなく、検証段階の分離**。B162の実A1/Cキー/本物のMouse+Keyboard/7CPU/原作権限/新世界ゲートは維持。
- 新たな同一ゲームSHA `d6f7f96b14d9ff9522edd8ec07849552d0b29595` の既存 B441 [#42110441874](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42110441874) と B162/B200 [#42110442130](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42110442130) を実行。**本正本追記時点では最終結論を未確認とする**。完了後の同SHAの結果のみ採用し、過去のRAWから類推しない。
- F4についてNintendo公式Ver 7.2.0注記はマテガイ放水路の**全モードでの地形変更**を裏付けるが、FloorLine00個別Faceの公式衝突・KCC体支持・同版Turf物理を認証しない。 https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Game-Updates/Splatoon-3-Update-History-2358763.html 既存`T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md` のHOLDを維持。
- 今後、R実機ゲートが再び失敗した場合はKeyR受信の有無・DOM判定・ブラウザ新世界遷移を分けて原因修正。**同条件の無意味な長時間再実行を増やさず**、止まれば実プレイ本線の完成に貢献する別機能へ。原作25/17/26/0、自然対岸0/12、正式4v4・公式得点・公式勝敗・ART・Pages公開HOLD不変。main、T19C/T20、正式QA、原本、Draft PR #5未変更、追加課金0、Work不使用。
