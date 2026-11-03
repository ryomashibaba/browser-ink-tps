# Browser Ink TPS — B413 1本の本物SOURCE試合で「撃つ→インクを消費→イカでOWN補給→再び撃つ」

基準日 2026-11-03 JST。F3・操作可能な本物のゲーム体験を優先。既存の原作25 Rapier solids/17 PaintSurfaces/26 NavLinks/0 ScoreableとF1～F5・保護方針は完全維持。

## 今回B413で新しく作るもの

- [B412の真正PASS #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)（コードSHA `7d31501c702b725dda730047cc47db379523a400`、証拠artifact `13233112543`）を前提とする。B412では元の原作右上段で実イカ形態・実OWN塗装・SWIM_GROUND・原作支持KCC・ヒト復帰、真の180秒試合と人間4面実塗装、CPU7、B411 HUDが同一runで成立済み。
- `T21_B413_REAL_SOURCE_INK_LOOP=1`は**B412+B411+B410全て有効時のみ**。既存同一ネイティブChromiumルート試合の残り90秒で、元B408成功した原作右上段のCDP狙い位置を使い、本物のCDPマウス押下を約78 native ticks保持。元の本物のPlayerResourcesから、SHOT数が5以上増え、インクが4以上実際に減り、同じ原作右上段のProjectile/PaintSurface impactイベントが届いたことを記録・検証。テスト用にタンクや命中を直接変更しない。
- 続くB412実Shift＋W/Sイカ移動を本物の原作OWN塗装で行う間、`window.__t21F3.snapshot()`の`player.ink`、`playerInkRecoveryState`、`player.mode`、`player.inkRelation`、native tickを**観測のみ**で時系列記録。少なくとも2サンプルで**イカ状態＋OWN＋SQUID_OWN**が実際に観測され、同じOWN連続観測でタンクが増えていること（>0.25）を要求する。これでヒト形態での待機補給と区別する。
- 元の実KeyS帰路で同じ原作床にヒト形態で戻った後、本物CDPマウス射撃を約54 tick続け、原作着弾、追加5 shots以上、追加4以上のインク消費を測る。そのまま既存の残り60秒・30秒の原作4面source shot、7CPU、180秒TIME_UPと正式再戦UI復帰まで成功させる。
- `b413-real-original-ink-fire-refill-fire.json`にnativeの実インク残量・OWN補給・実shotを保存し、`b413-independent-original-ink-economy-verdict.json`で既存B409/B410/B411/B412の**同一runの厳格な独立PASS**と照合する。

## 失敗時の扱い

本物の原作着弾がなかった、インク消費/OWN補給が測れなかった、原作右上段支持が崩れた、追加射撃でB412移動が変わり本物の復帰ができない、タイムアップ前にTIME_UP/安全停止した、または独立監査がFAILなら**B413のみHOLD**。本物の実ログ・保存JSONで根拠を調べ、原作のスコアや物理を偽装してPASSにしない。B412までのPASSを取り消さない。

## 永続HOLD

原作Ver.7.2.0・元25/17/26/0・natural cross-team Recast0/12、activationReady=false。人間→CPUの実HP命中・撃破・自然150tick復活、正式得点・勝敗、正式4v4、ART、本番公開は認証未了。main/T20/正式QA/Draft PR#5/Pages保護、Workは事前承認制。Chat+GitHub、ユーザーPC操作不要。これは仕様の変更ではなく**本物の可操作F3機能の統合**である。
