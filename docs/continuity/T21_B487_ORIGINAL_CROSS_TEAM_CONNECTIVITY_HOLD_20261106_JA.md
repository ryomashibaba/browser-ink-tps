# T21 B487 原作SOURCE・敵陣到達の真正阻害要因（2026-11-06 JST）

> **継続のための研究記録。既存のF1〜F5、Fast Track、START_HERE、完全統合引き継ぎ正本より上位ではない。新企画・正式採用宣言ではない。**

## 実施済み・変更権限

- リポジトリ：`ryomashibaba/browser-ink-tps`
- 保護研究ブランチ：`research/t21-integrated-a1-c-patrol-four-mode-20261105`
- B487実装・型修正：`da8cbe3265a89ef8f28428f1333a5b867f767e92` → `9f3177ca1e440a3eb103502cd3e4f2717bcf389e`。
- 成功した真正Chromium：<https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42182192843>
  - 29件のテストスイート成功、ビルド成功、720tick超の真正ブラウザー実走行成功。
  - 7体CPUが実際に物理合流。プレイヤーの実操作・元の巡回・2回のA1指示は変更・偽造していない。
- SOURCE原本：25 solids / 17 paint surfaces / 26 navigation links / **0 scoreable**。
- `main`・Draft PR #5・原作SOURCE・正式QA・本番は変更禁止。Work・追加課金・mainマージは事前承認。
- B487は**既存の本物のRecastへ現在のCPU足から照会する、読み取り専用**の独立検証。新しいリンク・床・Bot位置・得点・命中を作らない。

## B486 → B487 の同一物理世界の結果

| 観測 | 真正値／判定 |
| --- | --- |
| B486、人間の実物理足↔Bチーム | 最短 104.586172m、3m以内 0 tick |
| B486、AチームCPU↔BチームCPU | 最短 78.613657m、3m以内 0 tick |
| B487、A側3CPU×B側4CPUのRecast | 到達経路 0/12 |
| B487、人間×B側4CPUのRecast | 到達経路 0/4 |
| B487、現在のRecastによる到達経路 | **合計 0/16** |
| 元のオフメッシュリンク | 12 first-drop + 14 right-small-drop、合計26本、**すべて同じ陣地内の一方通行降下** |
| 中央を明示的に結ぶリンク | 0本 |
| 物理カプセルでの中央連続通行 | **未認証** |
| 自然な敵遭遇・HPヒット・正式4v4・勝敗 | **未認証／HOLD** |

B487の照会の原本は成功CIのArtifact内 `b487-real-original-16-cross-team-route-audit.json`。B486の足位置証拠は `b486-original-human-7cpu-enemy-distance-60hz.json`。ここに示す「0/16」は**今回のSOURCEの現在のナビメッシュと、当該tickの本物の足位置**についての結果。将来の別ステージの不可能性を証明するものではない。リンク0本だけから通常の歩行床が絶対に未接続と結論するのも誤りで、**独立の実Recast照会0/16と組み合わせて評価**する。

## 既存のB450/B452/B454と交差検証

同じ真正SOURCEのB450初期監査では、B2/B4がそれぞれ検査した既存ゴール32個に対し、Rapier/原作境界での拒否2件、Recast経路の中間サンプルでの物理支持拒否30件。後者はすべて `NATIVE_PATH_RAPIER_HEIGHT_MISMATCH`。拒否例 0.28055558m は安全上限0.25mを超える。

B454の60Hzでは、拒否されたRecast点の平面近傍（B2 0.029m、B4 0.0096m）を、**本物のCPU足**が原作床上で通った事例はある。しかしRecast座標と物理床の高さの乖離は存在する。これは「その位置に床があった」という証拠であり、**元のRecast全経路・中央カプセル通行の認証ではない**。

さらに `src/stage/undertow/UndertowSpillwayConnectivityQa.ts` の**2026-09-30の保存済み監査**は、右低床→アンダーパスへの局所ギャップが各陣地4件、合計8件、明確に除外されたFloorLine/FloorFenceの表示オーバーレイを取り除くと厳格なブリッジ候補0件と報告している。これは過去の静的資料であり、今回の新しいライブ成功証拠と混同しない。

## 次工程 B488 — 研究候補の根拠確定が先、Stage改造は後

1. **まず既存正本から、左右各4件の中央ギャップを原作測定座標・メッシュID・独立の衝突資料にひも付ける。** 除外されたFloorLine/FloorFenceの表示面を通行床にしてはならない。データ不足は `HOLD_REFERENCE_REQUIRED`。
2. 既存25/17/26/0とは別の、隔離された**非採用研究候補**だけで、資料により確定した元メッシュの連続接続を検証する。確証のない形状を自動補完しない。原本や正式PRを触らない。
3. 候補には原作床→NavMesh→全中間点0.30mごとの厳格Rapier支持→本物のKCCカプセル連続通過→元のCPU7体・人間→真正射撃・HP/撃破・復活という、独立した実走行の順序を要求する。**0.25m物理高さ上限、0.20m始終点snapを「通るためだけ」に緩めない。**
4. 原本で中央経路がHOLDなのに敵配置テレポート、透明橋、架空のオフメッシュリンク、得点面の強制採用、合成の命中や「正式4v4 PASS」をしない。
5. 証拠が足りなければ他の真正操作・原作塗装・A1協力を保全して停止し、無意味な小HUD修正や同一条件の反復試行へ戻らない。

**結論：B487はTECH/QA PASS、原作SOURCEの中央経路と正式4v4はART/SOURCE AUTHORITY HOLD。** 次の主工程は中央の原作資料に裏付けられた安全なステージ完成であり、同じ局所CPUゴールだけを量産しない。

## 2026-11-06 17時台 JST追補 — B488同一Chromium原作ギャップ判断 / RAW形式の独立確認
- 保護研究branch: `research/t21-integrated-a1-c-patrol-four-mode-20261105`。新B488読取専用ゲートは `84d5100bd7a300fce022a1da617ea3dc9415ad6b` で [既存B441真正Chrome #42187486215](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42187486215) **SUCCESS**。TypeScript/Vitest/build、実7CPU・Recast/Rapier、B450/B452/B454独立物理監査は同runで成功。
- 真正Artifact `13488422870` 内 `b488-real-original-f4-gap-authority-hold.json` を独立にJSON.parse確認：実native tick **1782**、人間/CPU現在位置からの原作Recast **0/16**、元26リンクは全て同側一方通行、実人間↔敵最短 **104.586172m**、味方CPU↔敵最短 **78.852567m**。過去2026-09-30監査との一致は **8局所ギャップ（各陣地4）**、独立に衝突認証されたgap Face **0**。判定 `HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING`。**これは自然な中央経路完成、相手HPヒット、原作Collision権限、正式4v4のPASSではない**。
- 同Artifactの `b486-original-human-7cpu-enemy-distance-60hz.json` だけ、末尾にリテラル `\\n` が追加されJSON.parseが失敗した。実距離測定自体・ブラウザー試験結果を否定するものではないが、そのまま機械可読なRAWと呼ばない。今回の後続候補でB486出力を正しい改行に修正し、既存B441にJSONパーサー独立検証を追加。**修正後の真正CI結果が出るまでは、この修正をPASSとしない**。
- 원本の25 Rapier solids /17 PaintSurfaces /26 NavLinks /0 Scoreableを変えない。個別8箇所のVer7.2.0 Turf collision/mesh Face認証と全身0.30m CPUカプセル経路は未入手。B488はread-only証拠レーンの結果として完了し、同じ8件を小監査で繰り返さず、**次の主バッチは許可済みSOURCEでのF3本物プレイ機能（実射撃・Ink・A1協力、必要時だけ敵HP自然交戦）へ戻す**。main/T19C/T20/原本/Pages/正式QA/Draft PR #5/本番/ART全て保護。

## 2026-11-12 B499追補 — 8組の原作三角面と実Rapier/Recastの独立照会

- **コードHEAD**：`f69351a6823df812574f83ad58d266c6275d67c8`、軽量CI [#43156897600](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/43156897600) **SUCCESS（1回）**。実ゲームに書き込まず、25 solid／17 paint／26 navigation link／0 scoreableを保持。真正Chromium再起動なし。
- **対象が異なる「8」への注意**：旧Pass18の「左右各4件の局所ギャップ」は歩行候補グラフの集約値。一方、B218の8件はCI688原作OBJ由来5つのSOURCE床・坂部品を隣り合わせた4組×左右。**旧Pass18の8局所ギャップとB218の8三角面対とのID対応は未認証**。同じ8だからといって同一位置や完全な中央欠損リストと解釈しない。
- B218の原作正本：`FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01` → `Fld_Temple01_pCube21595_1__FloorConcrete01` → `Fld_Temple01_pCube21000_1__FloorSlope00`（外側）→ `Fld_Temple01_pCube20989_1__FloorConcrete02` → `Fld_Temple01_pCube21000_1__FloorSlope00`（内側）。左右を含め**10 SOURCE部品／合計42原作三角面**。原作三角形同士の幾何学的な最短距離は各側 **0.170000m／2.074235m／0.518559m／0.518559m**。同じOBJ由来であることは、Ver7.2.0 Turfで衝突有効との認証ではない。
- **B499の実Rapier/Recast観測**：現在の元の25固体へこれら10部品を登録したSolid IDは **0/10**。42原作三角形中心での、Recastの0.35m以内の近傍点照会は **0/42**、既存Rapierステージから上下1.2mの範囲内での床ヒットは **0/42**。原作隣接8組の現行Recast経路問い合わせも **0/8**。16個の選択した三角形中心からの追加Ray／Recast投影照会も床支持認証0。これは**現ゲームの局所的な地形登録欠損を示す**が、全ての面の全領域に床がないという形式的証明ではない。
- **過去の反証も維持**：CI #691の非採用試験ではSOURCE由来の5部品×左右を一時的にRecastへ追加したが右低地→アンダーパスの目的地へ到達せず、元の終端誤差31.716227m、2点の不完全経路のままだった。今回の「未登録」を解消しただけで経路が開通するとは断定できない。
- **結論**：ゲーム本体の「原作中央部8箇所のGap」を、今回のCI688原作面8組と完全同一視しない。10部品を即ゲーム用のCollision/Nav/Scoreableに昇格させない。原作Ver7.2.0の面単位衝突・必要な追加隣接SOURCE面、正しいナビレイヤーと実CPUカプセルの連続経路が揃うまで **HOLD**。原作25/17/26/0、自然な敵味方経路0/16、正式4v4、得点、ART、公開HOLDを維持する。
- **次の工程で最も効果的な調査**：原作OBJの外側床（右低地）から上記10部品へ入る「最初の未登録接続」と、内側の原作通路へ出る「最後の接続」を、SOURCEの顔ID・原作衝突属性と既存床の接地高さで独立照合すること。再び単に同じ5部品を追加するCI試験を繰り返さない。新しい床・リンク・テレポート・Scoreableを作らない。

**証拠**：Actions #43156897600 artifact `b499-genuine-original-eight-source-face-seams`（8原作面対のOBJ名、厳格な3D分離、Recast経路・16端点投影、42原作三角形中心のRecast/Rapier照会JSON）。テスト：`src/app/B499OriginalEightSeamsLiveRapierRecast.test.ts`。
