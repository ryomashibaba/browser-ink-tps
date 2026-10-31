# B382 — 180秒SOURCE戦闘で、選択した本物のサブウェポンを使用する

2026-10-31 JST。正本: `ryomashibaba/browser-ink-tps`、QAブランチ `dev/t21-f4e103w-qa-infra`。本番と原作形状は不変更。

## 確認された問題
前工程B378で12種類の既存物理武器を選択でき、B381の真正Chromium実証では `twin-comets` をユーザー選択、右クリックによる**実Rapier水平1.66476m**、本物の左クリック6射撃がPASSした。一方、通常の `t21QaDrive=source` は既存B38研究フラグがないと `F` でサブ投擲できず、フル180秒の人間戦闘モードでも研究フラグが必須だった。選択武器のサブ装備は定義済みであり、これが実際に使えないのはゲーム体験として不整合だった。

## 実際の改修
- 原作SOURCE、実ユーザー選択 `t21W10B203=fullRound` かつ `t21W10B192=humanCombat`、非deterministic入力に限り、既存 `SubWeaponSystem` のFキー投擲を利用可能にする。真正B343固定シューター検証、deterministic研究、通常の非戦闘プレビュー、凍結T20と本番の許可境界は変更しない。既存のB38明示オプトインとA1 coopの挙動は保持。
- 射撃・使用残インク・HP・終了時間・実Pointer Lock・Rapier判定、投擲物理・弾道・接地・爆発・塗装とCPUへの本物のヒット処理はすべて既存の実装だけを使用。無料インク・自動発射・新しいダメージ・自動命中や架空の敵は増やさない。
- 選んだ武器キットのサブ名を、READY/時計の**既存1行HUD**で表示。武器選択直後に `playerSubWeaponName` の古いデフォルトラベルも更新する。モデルは原作性能一致を認証していないので研究用表記を維持する。
- 既存Vitestに真のSOURCE user mode/不正境界/全12キット表記の試験。**既存B15の真正Chromium**に続けて、本物のFキーによりTwin CometsのSnap Bombを投擲し、実SUB投擲回数と実爆発増加を検証。専用CIは作らない。
- B381が独立にPASS済みであることとB382の新しいCIを混同しない。B382の実爆発・実ラスタは**新しいCI完了まで未認証**。

原作物理25 solids、17 PaintSurface、26 source NavLinks、Scoreable0、自然相手陣ルート0/12、正式4v4/得点/勝敗/production HOLD。main・公開Pages・元OBJ・Draft PR #5不変更。
