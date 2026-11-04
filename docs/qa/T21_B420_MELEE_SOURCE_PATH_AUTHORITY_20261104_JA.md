# B420 F3 CPU武器別直接追跡のSOURCE経路迂回防止

固定F1〜F5。既存F3 native SOURCE CPUは、`CpuAgentSystem`の移動tickで`SourceTraffic.chooseSourceGoal`の本物Rapier足元・完全Recastパス認証を通してからCrowdに目標を送る。しかし武器処理`updateCpuRoller`と`updateCpuBrush`が距離6m以内の戦闘targetを直接`closestPoint`→`requestMoveTarget`へ設定していた。これでは原作の根拠がない短距離横断や床の狭い隙間へ別経路で引き寄せられ得る。旧Splatanaには局所修正済みだがローラー・フデは未対応だった。

## 実コード

`B420SourceMeleePursuitAuthority.ts`の純粋な距離ポリシーに3武器を統合。SOURCEモードでsourceGoalAuthorityが存在する場合、3武器の**武器処理からの直接移動先指定のみ禁止**する。CPUは通常tickのoriginal source Rapier/Recast経路で引き続き移動し、各武器の攻撃・飛翔弾・HP・インク量・命中判定は全て既存実装のまま。T20のローラー<=6m、フデ1.15m超〜6m、ワイパー1.05m超〜5.2mという原仕様は変更しない。

VitestはSOURCE全3クラス近距離をREJECT、T20旧上下限をPASS、非有限距離をREJECT。改修の新SHA真正Chromium/B419と旧原作SOURCE25/17/26/0独立監査の結果はActionsが完了して初めて確定。自然な対岸0/12、敵HP撃破/150tick復活、公式得点/勝敗、正式4v4・ART・本番HOLD。main/正式QA/PR5/Pagesを変更しない。