# Browser Ink TPS — 永続決定・失敗教訓（固定方針）

**更新頻度は毎日ではなく方針が本当に変更されたときだけ。** 各工程の生データはQAブランチの `docs/qa/`、ソース・Actions・保存JSONが正本。未承認の政策変更は禁止。

## ゴールと優先順位

『スプラトゥーン3』Ver.7.2.0のマテガイ放水路（Undertow Spillway）の**通常ナワバリ**をできる限り原作どおりのブラウザ3D TPSで再現する。Big Run、トリカラ、別バージョンのステージを混ぜない。人間1＋CPU7で自然な180秒の試合が**遊べること**が完成条件。原作忠実度＞遊べる品質＞実移動とCPU判断＞回帰防止＞開発速度・節約。テスト数・コミット数・研究モードの塗装セル数は完成ではない。

## 守る境界

- 開発対象はQA `dev/t21-f4e103w-qa-infra`。`main`、Stable T19C、T20、Draft PR #5、公開Pages、Windows原本、非公開原作証拠は無承認変更・公開禁止。
- 正式原作の認証数は **25 Rapier solids、17 PaintSurface、26 source NavLinks、0 Scoreable**。相手陣の自然ルート **0/12**。`activationReady` / `productionAuthorized` / `unrestricted4v4Certified` はいずれも `false`。明示承認と原作根拠がなければ昇格しない。
- 原作のない床・透明な救済足場・坂・NavLink、水位、落下条件、得点面、Actorスポーンを推測追加しない。Actorワープ、衝突無視、偽物理Tick、実キー入力なしでの「実走行」、位置閾値の不当緩和は禁止。
- 非公開OBJ・Face・Actor・画像・動画・抽出結果はGitHub/外部CI等へ無断転送しない。QAスポーンと原作Actor、研究用塗装と得点面、合成シミュレーションと本物のChromium/Rapierを明確に区別する。

## 技術方針

TypeScript + Vite、PlayCanvas 2、Rapier KCC、Recast Navigation/Crowd、固定60Hz、ProjectileSystem、GameplayInkSystem/PaintCoordinatorの単一PaintEvent経路を守る。`CURRENT_CANONICAL.md`のT19C凍結システムは無承認で置換しない。人間実物理のKCCとCPU判断用の8人目「非物理Recast HUMAN代理」は別である。

## 過去の反省と証拠（重要）

- **B81:** FIXED対SWEEPの180秒研究でCPU塗装変化3,615→11,779、射撃112→491。ただし人間入力にも差があり同条件の厳密比較ではない。**正式CPUはFIXED維持、SWEEPは研究用opt-in**。
- **B93–105:** CPU7/7復帰はA3本人の迂回成功とは別。実物理接触後に直接復帰するのは自然なこともある。Rapier所有者文字列だけで衝突相手が人間とは言い切れない。
- **B106–111:** 110Tick幅の拒否記録は連続110Tick衝突とは限らない。要求KeyA/KeyD/W Tick数は実適用Tickとずれ得る。解放後の慣性がある。数cm単位の終わりなき校正はHOLDで終えてF1–F5へ戻る。
- **B112–115:** 実CDPキー、原作5方向レイ、Rapier KCCの真の接地を区別。原作床がレイに見えてもカプセル接地を保証しない。正常な自由落下を床穴と断定しない。
- **B116–118:** 人間足元とNavMesh投影の正常なずれは許容する。B118の1Tick約108.178m移動は**非物理Recast HUMAN代理**の問題で、実プレイヤーの瞬間ワープではない。Recast内部原因は未確定。
- **B119–123:** 原作登録済みの着地点・坂の一部だけで受動HUMAN代理を局所除外。原作床、KCC、7CPU位置はそのために変更しない。**該当区間の対CPU回避はまだ未認証**。ポリゴン外への転落と床内の穴は別。
- **B120–126:** 実キーで高台→下段→原作坂→Team A右上段床→狭い通路を限定PASS。B126 [Actions #39934149377](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/39934149377) は11実キー段階の左0.823m・追加前進0.563m（同じ床）。**中央/対岸までつながる保証でも4対4認証でもない**。
- **B124:** D90を名目Tickで判定し失敗した。真の原作上段接地イベントで早期終了するので**実キー開始・終了Tickの証拠**で評価する。FAILを隠すための閾値緩和は禁止。

## 未解決・優先ロードマップ

過去ユーザーが報告した自陣/中央の床落ち、中央/対岸への0/12自然ルート、8人目代理の根本原因、CPU対人回避と戦闘、原作Actor配置、正式Scoreable=0、塗装得点/勝敗、180秒の試合、操作・映像・性能の統合は未完成。

[T21_FAST_TRACK_ROADMAP](../../T21_FAST_TRACK_ROADMAP.md) の **F1→F5** を基本とし、微視的QAを終わりなく増殖させない。既存のランナーとActionsを再利用し、無駄なワークフローや工程の分割、ZIP解凍・Windowsユーザー作業を抑える。実CI終了やJSON実測前にSUCCESSと書かず、限定PASS / HOLD / 未実施を厳格に分ける。

**新しいユーザーの明示承認なしに、この方針は引き継ぎチャットで変更しない。**

