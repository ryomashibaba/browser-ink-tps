# Browser Ink TPS T21 V28 — QA Issue #18 / B484→B488 native gate, post-CPU baseline

2026-11-17 日本時間。基点研究本線 `5edbc2d07d40d812e3b92fb5122d8f9b4ca5ca2c`。QA以外のゲーム本体ファイルは変更していない。

## 1. 唯一の真正Chromium検証

- [Actions #44035240101](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44035240101)：**総合SUCCESS**。前回のB484不適切HOLDから進み、既存B486・B487・B488の真正native証拠まで到達。
- [Artifact #14306494291（RAW・実画面PNG）](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44035240101/artifacts/14306494291)、ZIP SHA256 `c7bac7e86824706efabb3cc98b104a5fdcdde3567f2fa7f38cbbfb364e88e74d`。
- 実行は一度だけ。`T21_B441_SOURCE_FRONTLINE=1`, `T21_B441_NATIVE_OBSERVE_TICKS=720`, 原作SOURCE `25 solids / 17 paint / 26 navigation links / scoreable 0`。本線CPU PR #36統合後の初回該当QA。
- `proof.verdict=PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING`, `stage=TRUE_NATIVE_WALK_SUCCESS`。**このPASSはフル180秒・自然4v4・相手HP/撃破/復活を意味しない**。

## 2. 実プレイヤーへの改善：B484の偽HOLDを解除

- 統合前の旧ランナーは `PLAYER` の短縮HUDに対してF8 `QA` 詳細表示 `A1 C ORDER 2 · ...` を要求し、真正ゲームをB484で停止させた。
- 新ランナーは F8を勝手に切り替えず、`#ui-root.dataset.t21B245Presentation` と実DOM、native B471/B484カウンタを **同一ブラウザJSタスクで読み取って**厳密検査する。
- 今回の実PLAYER DOM: `A1 ALLY · 16.9m · 4.4m BELOW · ROUTE UNVERIFIED` / `C ORDER · RETRY READY`。**PLAYER限定PASS** `PASS_LIMITED_REAL_PLAYER_COMPACT_HUD`、到達カウンタ2/2、Cキー指示2回。F8詳細の真正Chromium切替は実行しておらず、F8はオフライン契約テストのみ。
- 実DOM・presentation・text・native tick・native arrival counter・判定理由を `b484-real-original-player-hud-dom.json` とB440総合RAWへ**失敗前に保存**。実ゲームの表示文言やクリック処理は変更していない。
- A1 original-source 641/641tick支持、二番目の原作目標への最接近0.560m、native foot移動9.857m、`originalCapsuleRouteCertified=false` を維持。

## 3. 本物のCPU射撃と未認証HP・復活

- K2同一ブラウザ `firstTick=1068`, `lastTick=1788`、**720 real native ticks**、performance.timeOrigin不変。
- CPU7体すべての実Turf射撃要求合計156、実Projectile→PaintCoordinator影響の延べ7,261所有セル変化。これは**実弾の登録面塗装の限定PASS**であり、相手のHP命中とは異なる。
- 実CPU OWN ink回復82.363333（237 native recovery ticks）、実自色足元tick 1,658、敵色足元tick 0。
- プレイヤー実マウス6射撃、実塗装90セル。敵CPUに対する **B367 実HPイベント0件**、`humanCpuDirectHits=0`、CPU `cpuSplats=0`、`cpuRespawns=0`。0 HPイベントは、HPの処理系が壊れていることの証明ではない。
- `qa-issue18-real-native-hp-splat-raw.json` は本物のB367ダメージイベントとnative CPU個別life状態・累計撃破/復活を保存。撃破0・150tick復活未観測、**偽のHP0→撃破→復活PASSは付与しない**。

## 4. 中央の敵味方接近が実現していない決定的データ

- B486の連続732tick、実Human→敵最短3D **112.298m**、実A味方→B敵最短3D **86.793m**。双方の距離3m以下のサンプル **0件**。
- B487の原作Recast 3×4 CPU敵味方12組＋Human対敵4組（合計16組）の真正問い合せで、**native reported path 0/16、credible endpoint 0/16**。原作26 one-way links、explicit cross-side links 0。
- B488：既存資料で未解決の原作接続8組（各側4組）、個別faceの衝突フラグと完全Rapier capsule traversalが未認証。判定 `HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING`。
- **結論：自然HP/撃破/150tick復活が出ない大きなボトルネックは「敵が原作上で接近できていないこと」。** ただしこの一回の試験だけでHP処理自体の故障を断定できない。
- 原作F4実床・衝突・NavMeshの証拠なしに通路追加や0/16の経路偽装をしてはならない。

## 5. CPU PR #36後の8〜10秒停止改善は見られない

旧真正run [#44030233150](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44030233150)、新真正run #44035240101 の原本 `b454-native-b2-b4-physical-60hz.json` を、**同じnative tickに正確に整列**して比較。

| 実CPU | 修正後原作Rapier支持 | 修正後ほぼ連続静止 | 共通時刻1057〜1788の旧・新XYZ座標 |
|---|---|---|---|
| B2 | 732/732tick | 506tick / 8.43秒 | 732/732完全一致、最大XYZ差0m |
| B4 | 732/732tick | 577tick / 9.62秒 | 732/732完全一致、最大XYZ差0m |

- 旧runは1793tickまで取得していたため、旧報告の511/582tickと新506/577tickとの差5tickは**観測終了tickの違い**だけ。改善の証拠ではない。
- 新実試合ではCPU PR #36の既存の限定操舵回復が、B2/B4の真物理足元を**この区間では変えていない**。安全ゲートのどれが作用したか、チャージ/guard/経路拒否/無効目標のどれが原因かは**UNKNOWN**。
- CPU Issue #14に観測結果を返す。ゲームコードの修正はCPU担当へ委譲。Rapier KCC/原作地形・Recast判定を緩める作業はQAでは行わない。

## 6. 実装と検証

- `scripts/t21-b440-short-native-original-foot.mjs`：B484モード別native HUD検査、RAW保存、失敗時理由、B367実HP証拠の事前保存。実際のゲームフローを誤って遮るQA契約の不整合を修正。
- `scripts/t21-v28-qa-b484-hud-gate.mjs`：PLAYER短縮とF8 QA詳細を分離して判定。ゲームのテキストや視覚配置は維持。
- `scripts/t21-v28-qa-real-hp-witness.mjs`：本物のB367 native Projectile HPイベントのみ限定承認。Actor life/splat/150tick再参加は実因果がなければHOLD。
- `scripts/t21-v28-qa-real-b2b4-diff.mjs`：2つの真正60Hz RAWを原作床・無改変のprovenanceを満たすときだけ比較。全732tick足元一致を `HOLD_NO_OBSERVED_B2_B4_PHYSICAL_MOBILITY_CHANGE` として扱う。軌跡が異なるだけでは「ゲーム品質改善PASS」にしない。
- [軽量CI #44036234037](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/44036234037)：**20/20 Node回帰PASS**、B440既存ランナーと独立3モジュール構文PASS。真正Chromium再実行なし。
- 新実機検証は **1回のみ**。本PRではmain・正式QA・Pages・本線・StageDefinition・CPU・弾・HP・Ink・scoreableのゲームコードは未変更。F4、正式4v4、180秒、自然敵命中/撃破/復活は依然HOLD。

## 次の担当別の工程

- **CPU担当（Issue #14）**：本物の支持足元でB2 506tick・B4 577tickの停止に対するKCC拒否、最後の有効Recast目標、1.2秒回復ゲートの発動・guard/charge抑制の因果を狭く調査。追加の実機チェックはQAと統合し再実行を連発しない。
- **STAGE担当（Issue #13）**：F4接続は既存参照に一致する本物の原作面・衝突フラグ・隣接性が得られるまでHOLD。未知の床・NavLinkを補うことは不可。
- **COMBAT担当（Issue #15）**：実HP0・撃破・150tick復活は敵味方接近が成立した後に真正イベントで証明。0件の理由をダメージロジック単独に帰責しない。
- **QA（Issue #18）**：PLAYER/F8契約とnative RAW witnessを保護し、重い試験は新しい意味のある改善が統合された後に限定実行。統合は司令塔が行う。
