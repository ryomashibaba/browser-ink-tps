# T21 F3 — B470 原作同側CPU巡回拡張・真正RAWと統合判断（2026-11-05）

## 固定方針
F1→F5 / Fast Trackを保持。研究SOURCEは25登録Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreable。元ゲームの衝突権限がない床・仮設NavLink・Actorワープ・仮の敵HP/公式勝者を禁止。原作自然対岸経路0/12、正式4v4・公式勝敗・ART・本番公開・PR #5 mergeすべてHOLD。main/T19C/T20/原本/Pagesを保護。Workは事前承認。

## 実装（機能単位）
既存B441の明示的なSOURCE FRONT研究URLだけで、A2/A3/B1/B3を対象に、既存の原作右低地同側フロントライン目標の本物120 native tick到達滞在を確認してから**第三・第四の目標候補**を開く。候補の優先度は本物のGameplayInkSystem OwnerGridから取得したOTHER_TEAM/NEUTRAL/UNSAMPLED/OWN。これは単なる候補順位であり移動許可ではない。

実際のCPU Rapier現在足、元のソリッドID・既存0.75m輪郭マージン・元Recast auditPath (start/end snap <=0.20m)・全区間0.30m間隔の原作Rapier支持、元B443ロックとCrowd要求を再使用。固定原作地形・Recast半径・衝突・NavLinksは一切変更しない。B2/B4のB467→B469実績は独立に維持。原作SOURCE以外の通常モードは不変更。

変更:
- `src/app/B441OriginalSourceFrontline.ts`：B470 fail-closed native dwell scheduler
- `src/app/B441OriginalSourceFrontline.test.ts`：偽チーム・早期・4地点超・旧足・偽SOURCEの拒否テスト
- `src/app/UndertowF3SourceTraffic.ts`：同側の真正局所塗装巡回選択・RAW証拠
- `scripts/t21-b440-short-native-original-foot.mjs`：既存7CPU Chromiumの本物snapshotを証拠化

## 合格済みの同一B470コード・隔離実機
- [B441真正Chromium 900tick #42022904052](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42022904052) SUCCESS。B450/B452/B454独立監査SUCCESS。
- [B448真正Chromium 900tick #42022904083](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42022904083) SUCCESS。RAW Artifact #13413125852 (`b440-short-real-original-human-foot.json`) より以下を直接確認。
- B470追加の厳格原作目標承認 **6**、本物OwnerGridによる探索試行 **6**、異なる原作目標への真native要求 **8**。
- 真の別目標要求Actor ID: A3 tick1420/1588/1756/1924、A2 tick1571、B1 tick1588、B3 tick1639/1807。これらは実足位置・旧Goal・次Goalが元native出力に残る。
- A3は実足が tick1420 [3.37784,4.60,38.00222] → tick1588 [6.17090,4.60,37.99940] → tick1756 [4.78121,4.60,40.78637] → tick1924 [7.57967,4.60,40.77629] と異なる場所へ移動。
- B3は実足が tick1639 [-24.26521,4.60,-44.14048] → tick1807 [-27.17864,4.60,-45.71433] と実移動。
- B467/B469は追加第三・第四の承認を別途維持。公式得点面昇格0、対岸経路認証false。
- 本物のGoal requestと実足変位は検証したが、各連続tickの全身カプセル経路・敵陣接近・自然対敵HP命中・正式4v4は検証していない。Native tickを飛ばした標本を完全連続証拠に読み替えない。

## B412並行修正との統合状態
B470本体は `776389fc60f4aebcdc428b8b68e236b3b89d61ca`、旧統合候補 `195eda6eee48531db924d602a2fd5e96698ea24e`。その後本線に入ったB412実OWN安定回復修正 `11d03c70e53681163a01a4a843f79b8623fe1f0c` と4ファイル非競合で統合候補 `e6a560d5ffa6a2924defcca594f0c696927dc2c3` を準備。隔離 `research/t21-b470-integrated-qa-20261105` では既存B441/B448/fast gateだけを再使用し、現行B413をキャンセルしない。新runの結果を確認するまで本線統合をPASS扱いしない。既存ワークフロー設定の変更は隔離ブランチ専用。

## F4で引き続き必要な外部根拠
[版・衝突権限](T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)、[B369物理接触](T21_B369_NATIVE_FLOORLINE_CAPSULE_COLLISION_PROVENANCE.md)のとおり、元7.2.0 Turf原作の衝突属性とFloorLine00同一Face対応は未認証。FloorLine00元Face幅約0.311mはCPU直径0.60mより狭く、既存CPU半径でのRecast完全接続はB240 FAIL。B369で中心ray欠損7/8フレームのうち同tick上方KCC接触4/5、残り各3フレームは不明。現状でF4へ衝突面追加・自然対岸0/12→12/12変更をしてはならない。真の版・物理権限が取得されるまでは今できる局所プレイ改善を優先する。

## 追補：B412修正と同居する統合候補の真正検証
- 統合候補 `e6a560d5ffa6a2924defcca594f0c696927dc2c3` を隔離で本物の既存B441/B448/fastに通した。[fast #42028613023](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42028613023) SUCCESS。[B448 #42028612732](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42028612732) SUCCESS・RAW #13414739380を直接検査。
- 同RAW：B470追加厳格承認6・OwnerGrid順位探索6・異なる実Goal要求8、A3=4件/A2=1件/B1=1件/B3=2件。試合時計/Actor/Score書換0、公式勝者NONE。B2/B4 B454 60Hz RAWも別添。
- [B441 #42028612604](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42028612604) と本線[B413 #42025456079](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42025456079)は本追記時点の最終結論未確認。B413途中キャンセル防止のため本線のHEAD更新はまだ行わない。
