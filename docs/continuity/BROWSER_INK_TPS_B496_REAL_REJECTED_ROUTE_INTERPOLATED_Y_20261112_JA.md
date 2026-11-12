# B496 — B450真正拒否60経路の「直線補間Y」とRecast再投影Yの差

前提：B495 CI #43151167332 により、元のRecast経路が約0.25〜0.29m上方にずれた着地点の最初の拒否箇所を、Recast最近傍床へ投影するとRapier床との差約0.10mに戻ることを確認。ただしB495ではルート全長を評価していなかった。

今回は真正Chromium #43140584988 のB450証拠（B2/B4各30件、合計60拒否）に記録された実足・候補目標から、同じ25/17/26/0で実際の `RecastStageNavigation.auditPath` を再実行し、B450FirstSourceDenialの最初の拒否原因・点・区間が一致するか検査。全ルートの0.30m間隔の補間点について、その生Yと `auditNavMeshProjection` の最近傍Recast点を比較。

診断では、投影点のX/Z距離<=0.03m、側の範囲、2.5〜5.5mのY、元の登録済みRapier床との上下距離<=0.25mをすべて満たすものだけ「投影後のRay支持候補」と数える。ただし、この仮定はゲームに反映しない。各連続区間の実サイズKCC移動・他CPU衝突・元の経路のNavMeshポリゴン連結性・原作Ver7.2.0衝突意味の完全な独立証明ではない。

**予測で結論を確定しない**。投影後に60経路すべて支持されるか、一部だけかをCIのRAWで判定し、真の床欠落と経路点Y補間だけの拒否を区別する。旧ゲート `hasSourceSupportedRoute` と閾値0.25m、元の25/17/26/0やmain、PR、正式QAは不変。正式敵味方横断0/16、正式4v4・得点・勝敗・ART・公開HOLD。

軽量CI `[p0-radar-build-only] [b496-route-reprojection]` のみ使用。真正Chromiumや180秒試験は再起動しない。結果 `b496-source-recast-route-y-reprojection` に保存。
