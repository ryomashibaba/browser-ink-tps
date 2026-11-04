# T21 F3 — 正式得点ではない実SOURCE塗装バランスHUD (2026-11-05)

固定F1–F5とFast Trackの「180秒を遊べるゲーム」の通常PLAYER表示改善。研究ブランチのみ。

- 既存B401が本物の17 SOURCE OwnerGridを120 native ticks単位で監査した結果だけを通常F3 HUDのA/B/NEUTRAL三色帯に表示。B417協力プレイ限定パネルとは別で、通常の180秒試合でも見える。
- 独立のインク集計、仮想敵、仮想得点・勝敗・CPU/Actor/衝突/カメラ/時間/塗装書込みはゼロ。既存B401のサンプルを再利用、30fps/60fpsで二重計測しない。
- 25/17/26/0・17面・元native tick・合計一致・SOURCE-only・officialTurfScore=false・winner NONEを検査。不正/未認証/終了/SAFE STOPなら非表示。バランスはREGISTERED SOURCE PAINT / UNSCOREDと明記。勝者表示に使わない。
- 実装は通常PLAYER HUDのread-only子要素。F3局所プレイの視認性改善であり、公式Turf scoreable0、自然敵対岸0/12、敵HP真正交戦、正式4v4、ART、F4完全接続、公開の認証ではない。
- 独立Vitestと既存B441真正7CPU Chrome workflowを同SHAで確認する。新ワークフローなし。実際の人間プレイによる読みやすさ・美術は別HOLD。

main / 正式QA / 原本SOURCE / T19C・T20 / Draft PR #5 / Pagesは非変更。Work/Computer Useは開始しない。
