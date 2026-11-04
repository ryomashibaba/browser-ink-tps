# Browser Ink TPS — B441 実CPU SOURCE前線移動：真正Chromium判定（2026-11-04）

## 結果の区分

**研究オプトインの実前線目標とCPU物理移動：PASS**。公式4v4、原作の敵陣侵入スロープ、対岸横断、自然な敵への命中、HP撃破/復活、得点と勝敗はすべて **HOLD**。

- 実行：[GitHub Actions #41829596416](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829596416) — SUCCESS。コードSHA bd8d735c7c8f2498c2dc5de197960846f8f0dbc7。
- 実証：[Artifact 13321497794](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829596416/artifacts/13321497794) の b440-short-real-original-human-foot.json 内 b441NativeEvidence。
- 原本 authority 25 physical source solids / 17 paint / 26 links / 0 scoreable。7 physical CPUが本当のnative世界で合流後、真の人間CDP KeyWで0.151695m移動（tick1056→1062）。
- B441研究対象：原本 right-low-team-a / -b の**床原本Footprint継承**から、実際に固体内側の候補を抽出。原作Rapier足・B130原本床境界 >=0.75m・実Recast全経路の原本足を監査。原本床もNavLinkも変更していない。

## 実証された数値

| 事項 | 実測 |
| --- | ---: |
| SOURCE接地＋全経路検証済みのCPU前線目標数 | 6件 |
| 実native CPUによる前線目標要求数 | 28件 |
| 最も中央に近い承認目標 abs(Z) | 43.5925066881m |
| 未認証／届かない候補の拒否数 | 160件 |
| read-only native試験tick | 1062→1303（241tick） |
| CPU物理合流 | 7/7 |
| Actor/原本床/Navigation/clock/scoreへの書込み | 0 |

### 241tick前後の真正CPU足の始点→終点（水平変位）

| CPU | 最初のZ | 最後のZ | 始終点水平変位 |
| --- | ---: | ---: | ---: |
| A1（研究対象から除外・既存協調ルート） | +53.438 | +50.903 | 3.064m |
| A2 | +54.538 | +47.429 | 16.272m |
| A3 | +53.451 | +49.755 | 4.025m |
| B1 | -52.592 | -46.996 | 15.455m |
| B2 | -53.842 | -48.627 | 13.990m |
| B3 | -53.443 | -47.920 | 14.061m |
| B4 | -52.797 | -48.992 | 14.183m |

注：**始終点水平変位は経路上の総歩行距離ではない**。真native snapshotの2点の距離であり、原本全経路の横断や公式4v4達成とは解釈しない。最も前線に近い承認目標 |Z|=43.5925mへ特定のCPUが到達したとの主張もしていない。

## 機能と安全

- 新機能のコード：[研究コミット dc849a69](https://github.com/ryomashibaba/browser-ink-tps/commit/dc849a69d6f87fe2877ced34746885538f1490b8)、本来の床マスク継承修正：[826d16c](https://github.com/ryomashibaba/browser-ink-tps/commit/826d16cd41a6fe37e96e6160be9fc68626505c9e)。
- 実体化するのは対象CPUの**既存Recast Crowdへのゴール**のみ。Actorの位置をセットしない。独立のRapier KCC、原本ステージと原本UIは未改変。
- 有効化は t21Play=preview / t21QaDrive=source / t21W10B203=fullRound に加え研究フラグ t21W10B441=sourceFrontline の場合に限る。これ以外は従来の巡回とA1/HUMAN協調ルートがそのまま。
- オリジナル固体の実Footprintに属さず、NavMesh最短路・中間地面支持・足半径に不確実性がある目標は不許可。採用不可なら従来巡回に戻す。
- 新テスト：[B441純粋候補生成・build CI #41829224308](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829224308) SUCCESS、[本人+7CPU通常B440短時間回帰 #41829596288](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829596288) SUCCESS。

## 未解決の原作SOURCE 7.2.0真正侵入路

任天堂公式スロープ追加は **Ver.2.0.0（2022-11-30）** のTurf版、Ver.7.2.0（2024-04-18）には全モード再改修。元Face/Collision対応は依然不明。詳細は [版区分訂正文書](T21_F4_OFFICIAL_720_INVASION_RAMP_AUTHORITY_JA.md) を参照。研究B441の目標承認を、この正式7.2.0横断ルートの認証へ流用しない。

本番・main・正式QA・Draft PR#5・Pages・Work・追加課金を変更しない。次の実装工程は、実目標経路でCPUがどこまで自然に前進できるかの同一world時系列追跡と、7.2.0 Turfの正規原本衝突データの対応づけ。
