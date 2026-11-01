# T21 B394 — サブ爆発と原作塗装セルの本当の変化を区別したプレイヤーHUD

2026-11-01 JST。F1–F5 Fast Track、原作25 solid /17 PaintSurface /26 navlink /0 scoreable、自然対岸0/12。正式得点・敵命中・4v4・ART・本番公開HOLD維持。

B392は本物の投擲と爆発を示す。B394はその次の大切なユーザー体験：「サブで本当に原作塗装セルが変わったか」を既存B41真正PaintCoordinator後のデータから表示する。

- NEW_CELLS は実際の人間bomb由来の原作PaintSurface新規変更セル数を表示。NOT TURF SCOREを明記。
- STAMP_ZERO_CHANGE は原作面にスタンプはしたが新規セル変化0と表示し、敵Missや操作失敗と断定しない。
- NO_CERTIFIED_STAMP は原作登録面へのスタンプがないと表示し、物理未爆発・弾消失や敵Missとは混同しない。
- MULTIPLE_UNRESOLVED は同一tickの複数爆発で個別帰属不能と表示し、塗装セルを特定ボムへ誤帰属しない。
- 判定はB41真正human bomb native tick・本物のexplosionカウンタ増加・原作source provenance・非scoreable・通常PLAYER・PLAYING・HP>0・停止なしでゲート。初回過去累積、QA/F8、死亡、pause、timeout、counter/tick逆行、元Face不一致は非表示。実イベントは最大120 native ticks可視。
- HUDは読み取りのみ。投擲物理・弾道・インク経済・塗装結果・AI・KCC・スコア・Actor・時計・原作25/17/26/0は変更しない。

既存B393本物Chrome #41282785196で2発実爆発、自然インク回復、180秒試合PASS。ただしその実爆発の原作塗装面への着弾/変化はB393では認証していない。B394新HUDも新HEADのCIと可視実測を確認するまで未認証。

## 2026-11-01 — B395 180秒SOURCE試合の実サブ成績を終了画面に表示

通常B58源泉活動・B59結果画面へ人間の実サブ爆発回数／元sourceスタンプ数／
新規変更したsourceセル数／スタンプ済み0変更数を区別して表示。
既存B41後段の実`b23HumanInkFeedback`のみを読み、
出典`REAL_HUMAN_ORIGINAL_PAINT_EVENT`、原作のみ、Scoreable=0と整合性を検査する。
データ不明は「実測0」と推測せず表示しない。公式得点・CPU HP命中と混同しない。
ゲーム本体の塗装/物理/カメラ/AI/得点/時計や原作25/17/26/0は変えない。
既存B210統合CIおよびB58単体テストで実装検査する（CI結論前は実ブラウザPASS未認証）。
正式4v4、自然対岸0/12、ART・公開・mergeはHOLD維持。

## 2026-11-01 — B394真正Chromium表示・原作セル実測確定（PASS範囲限定）

既存B385/B390実WebGL2/PlayCanvas/Rapier/Recast統合CI
[Actions #41286556600](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41286556600)
（対象SHA `823dfd7e30a524a99b660bb5bc40c787231b21fe`）はSUCCESS。
事前TypeScript/Vite、B394を含む単体5ファイル/96テスト、実CDP入力と真正180秒SOURCE再試合に成功。

同Runログ `B394_REAL_NATIVE_BOMB_SOURCE_PAINT_HUD`：
native tick1507時点で人間サブ爆発2件、最後のB41 native outcome tick1500、
原作human Bombスタンプ7件、**新規変更セル0件**、outcome
`STAMP_ZERO_CHANGE`。実DOMも可視で
`BOMB SOURCE STAMP · 0 NEW CELLS · NOT A MISS`、
kind/tick/stamps/cells=STAMP_ZERO_CHANGE/1500/7/0の完全一致。
DOM source専用 `gameplayWrites=0` / `scoreable=0` / `cpuHitCertified=false`。
証拠画像 `b394-real-native-bomb-source-paint.png` を既存artifactに保存。

同じ真正ラウンドでTIME_UP tick11859、実人間主射撃94発／
impact変更388セル、CPU605 source shots／13308変更セル、
7/7 CPU実復帰、本人実復活0、公式勝者NONE、Scoreable0、
同武器新世界再開成功。0変更はすでに同色で塗装済みの可能性があるが
**原因未認証**。爆発失敗、敵miss、無効物理、正式得点と同義ではない。
新しい未塗装面への実サブ新規変化成功や実CPUへのBombダメージは未認証。

B395は別の実装：`36968c0ce5f00bed94241a41612831eefaecfa2c`で
B58/B59の読み取り専用実サブ累積を追加し、TypeScript/Vite、
関連VitestとNode scriptチェックがPASS。
B210真正180秒終了画面のB395実DOMは
[Actions #41287579025](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41287579025)
の最終結論を確認するまで未認証。

## B395実画面の最終照合ゲート（B390既存CIに接続）

B210の180秒試合は実サブ投擲が発生しなくても正常終了しうる。
そのためB395のサブ内訳実証は、実CDP `F`2回・実サブ2爆発、
本物のB41 `humanBomb...` 出典がある既存B385→B390の
同一SOURCE180秒試合に接続する。
新たなQAワークフローは作成しない。

`B395_REAL_180S_HUMAN_SUB_RESULT` は本物のTIME_UPで
native B41累積の爆発/原作面スタンプ/変更セル/0変更イベントを読み、
B59の実DOM属性 `t21B395BombExplosions` /
`t21B395BombStamps` / `t21B395BombCells` と
画面テキストの完全一致を検証する。
changedCells=0でも照合はPASS対象であり、正のセル変化・敵命中・
正式Turf得点とは主張しない。元25/17/26/0、敵陣0/12、
正式4v4・公開HOLDは不変。新CIの実行結果取得前は検証未認証。

## B396 — サブ塗装0セルの原因を本物のラスタ計算結果から判定（2026-11-01）

前工程B394では本物のサブ爆発2回／原作スタンプ7件／変化セル0件を実証したが、
「同色のインクで覆われていた」と「スタンプ内に有効な塗装セルがなかった」
を区別できなかった。B396はゲーム本体の既存`GameplayInkSystem.apply()`の
**同じラスタループ**で、セル所有権の変更に加えて、
(a) 塗装楕円内でFootprintが有効なセル数、
(b) 既に要求チームが所有するセル数、を読み取り専用で返す。
塗装範囲、射程、物理、コリジョン、Actor、score、時計は変更しない。

この実値を任意の`PaintCoordinator` observer経由でF3 B41へ受け渡し、
爆発と同じnative tickにおける真の0変化スタンプだけを分類：
`ALREADY_TEAM_INK`（全有効セルが同色）／
`NO_ACTIVE_PAINT_CELLS`（有効セル自体0）／
`MIXED_ZERO_STAMPS`（両方）／
`UNKNOWN`（証拠不足）。
実プレイB394の従来テキストは変更せず、
プレイヤーHUDの`data-t21-b396-zero-cause`とツールチップで
分類結果を参照できる。前回の爆発が同色だったという事後推測はしない。
単体QAは初塗装→再塗装→無効領域の同一ラスタ結果、
混合・ソース不明を確認する。

**限定判定：** B396の最新実ブラウザPASSは別途必要。
25 Rapier solids、17 PaintSurfaces、26 NavLinks、0 Scoreable、
自然敵陣0/12、正式4v4、ART・公開・merge HOLDは不変。
