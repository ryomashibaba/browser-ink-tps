# B495 — Recast床高度と原作SOURCE面・Rapier床の局所比較

対象は真正Chromium Actions #43140584988 由来のB450初回拒否点60件とB454のB2/B4各768 tick。B492〜B494で確認した『B2・B4が原作着地点→坂→低地を実サイズKCCで動けるが、Recastの床高さが一部ずれる』原因を追う。

本体は不変更。元のNavMesh（25 solids/26 links）と原作の着地点・FloorConcrete03坂・右低地の登録済み3 solidsだけから作った診断用NavMesh（3 solids/0 links）を、それぞれ**同じRecast設定**で構築する。オリジナルRapier 25 solidsの実床を原作支持ID・実測Yと照合し、Exact SOURCE Solidの上面または既存triangleの具体的な面Yを二重チェックする。

全154? 件ではなく、B2/B4各768行とB450 60件すべての実測座標を検査。Recast最近傍点のX/Zスナップ距離と、Rapier床とのY差を各原作床IDで集計する。**RecastのclosestPointはNavMeshポリゴンIDを返す公開保証がないため、この段階では特定のポリゴンIDを認証しない**。厳密に特定できるのは原作ソースの面IDと、Recastが出した現在の最近傍点（座標）まで。

判断：局所3-solidでも同じ差が残れば重複周辺地形説は弱くなり、Recastボクセル化・境界丸め・初期Yを重点調査。局所だけ差が消えれば周辺の別レイヤーとの干渉を優先。いずれも結果を見てから決めること。NavMesh・原作床・衝突閾値0.25m・Links・AI許可・正式QAは変更しない。

個別承認を要する180秒真正試験は行わず、GitHub Actionsの `[p0-radar-build-only] [b495-nav-y-isolation]` で1回の軽量CIを使う。正式敵味方横断0/16、正式4v4・勝敗・ART・公開HOLDを維持。
