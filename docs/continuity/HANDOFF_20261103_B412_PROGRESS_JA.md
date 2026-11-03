# Browser Ink TPS — 2026-11-03 B411 真正PASS／B412 nativeイカ泳ぎ統合

## 固定の引き継ぎ
リポジトリ `ryomashibaba/browser-ink-tps`。研究ブランチ `research/t21-b406-single-session-real-enemy-range-audit-20261103`。先に `START_HERE.md`、B406完全統合正本、`DECISIONS_JA.md`、`FAST_TRACK_EXECUTION_JA.md`、`T21_FAST_TRACK_ROADMAP.md` (F1〜F5)、`CURRENT_CANONICAL.md` を確認。研究のSOURCE限定成功を正式4v4に昇格させない。実装はChat+GitHub、Workは承認制。

## 真正成功実績
[B411本物Chrome試合 #41630809201](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41630809201)、実コードSHA `bee39cd1310c77a18d081b3e4cd5af4ceba920c8`、artifact `13229516996`、全ステップ・独立監査SUCCESS。CPU7体と同一原作sourceの180秒 TIME_UP tick11855。人間84 shots／1,130 original ownerGrid changed cells、CPU source shot requests145／実塗装12,258 cells、真正4つの原作PaintSurfaceへの人間射撃。元の高所→初着地→上り坂→右上段を本物Rapier KCCで移動。後半120/60/30秒の本物CDP 24 shots／追加197 cells／合計8.740654452743925mの4方向実移動。B411では実試合中に大きな練習CLEAR/カード/再戦を画面から除去し左上コンパクト表示、真のTIME_UP後に元の再戦復帰が独立真正PASS。**B405〜B411同様の実成果を繰り返し開発しない。**

## 新B412 — 原作SOURCEインクで実イカ泳ぎ
- 新研究専用 `T21_B412_REAL_ORIGINAL_SQUID_SWIM=1` は既存B411＋B410真正ルートの使用を必須にし、原作右上段の本物の120秒塗装targetを、90秒チェックポイントで再利用。実ShiftLeft・W短入力でPlayerControllerがネイティブHUMAN→SQUIDとなり、原作ownerGrid `OWN` と `SWIM_GROUND`、Rapier原作右上段支持・実移動を全部同時証明する。実S入力で元の位置近傍に物理的に戻り、Shift解除でHUMAN。カメラ位置/Actor/Stage/Ink/Shot/tickへ直接代入しない。
- 既存の一つの180秒Chrome CIを再利用し、B315/B316/B322/B324/B326/B409/B410/B411の元RAWと合わせてB412の独立監査を実行する。上段から落ちる、OWNのインク泳ぎが存在しない、イカ中勝手に弾が出る、ヒトに戻れない、次の残り60/30秒実射撃・180秒完走を妨げた場合は真正B412 HOLD。原作未確定の道を追加せず、同一ソースの実結果から次の安全な物理操作を判断。
- **B412は同SHAの本物GitHub Actionsが成功して初めてPASS。Nodeユニットテストや文書のみでは成功としない。**

## 凍結条件
ゲーム原作Ver.7.2.0マテガイ放水路の通常ナワバリ。25 Rapier solids / 17 PaintSurfaces / 26 NavLinks / 0 Scoreable、対岸自然Recast 0/12、activationReady=false、元の公式得点/勝敗NONE、enemy HP hit/splat/150tick respawn 未立証・実HP命中0。正式フル4v4/ART/本番はHOLD。架空床・リンク・Actorワープ・速度不自然補正・原作衝突権限偽装・偽のインク/Hp/時間禁止。main、正式QA、T20、Draft PR#5、Pages書換禁止。PC操作なしでGitHub Actionsの原本証拠を見る方針。

## B412真正初回FAIL → 原作物理を保った微小帰路入力・RAW計測を追加

- [B412原作イカ統合#41635951998](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41635951998) at `d264c16fba9d34608c92b46366073bae7429288d` は **FAIL**。真のChromeで高所→原作坂・右上段までB322成功、120秒で人間本物のショット9発・原作右上段インク変化92セル、B411のAFTER_ROUTEと90秒コンパクトUI成功。90秒から原作イカShift＋Wで前進し、コード上はOWN `SWIM_GROUND`を認めて帰路に入ったが、最初の実KeySの原作支持・状態・KCCチェックでHOLD。安全なヒト復帰/実TIME_UPは認証されていない。Artifact `13230988016` は途中までの元SOURCE/Chrome証拠を保存。**B412をPASSと言わない。**
- 原本B412は途中のイカKCC測定JSONをFAIL時に残していなかったため帰路原因の厳密判定不能。今後は`onEvidence`で**各native実レグとHOLD時のプレイヤー座標・モード・inkRelation・足元solid/gap・CPU/shot/pointerlock**を同じGitHub Actions artifactに逐次保存する。イカ帰還KeySのみ3native tick要求に短縮し、Rapier原作支持・OWN泳ぎ・本物のShot非増加を緩めず再検証。予断で速度/位置/床/Inkを補正しない。
- 他の既認証B405〜B411は維持し、新しいB412のみHOLD。次の新SHAのActions結果をまず照合し、何が不成立かを生証拠で見て必要なら安全なコース修正。F1-F5と原作25/17/26/0・0/12・正式4v4/ART/HOLD、保護ブランチとDraft PR#5を維持。

## 2026-11-03 B412最終：真正Chromium SOURCE泳ぎ＋同一180秒試合 PASS

- 成功した真正Chrome [Actions #41638475997](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41638475997)、実コードSHA `7d31501c702b725dda730047cc47db379523a400`、生証拠 artifact **13233112543**。事前単体テスト、ビルド、真正ブラウザ実走、原作B315/B322/B324/B326/B409/B410/B411/B412の独立検証、PNG原本アップロード**全ジョブSUCCESS**。
- ネイティブtick **6496**で本物の右上段HUMAN開始、**6502**でCDP ShiftLeft→本物のSQUID形態。実KeyW・KeyS合計**9区間、5.204981025377377m**の原作Rapier KCC連続移動。**3区間**が本物のCPU ownerGrid `OWN`かつネイティブPlayerController `SWIM_GROUND`。イカ中の人間shot数増加なし、原作右上段solid `UndertowT21D:right-low-team-a`支持維持・CPU7体維持。
- KeySの短い3native tick入力と本物の慣性で減速・反転し、HUMANに戻ったtick **6574**の実位置は初期位置から水平約**0.461562m**。人工テレポート・インク所有変更・任意座標代入なし。スクリーンショット `B412_REAL_ORIGINAL_UPPER_OWN_INK_SWIM.png` と `b412-original-upper-real-own-ink-swim.json` が生証拠。
- 同じソース180秒試合で原作4面の人間実射撃・塗装、7CPU、本物のB411 HUDとTIME_UP後再戦復帰、残り120/60/30秒の実入力もすべて独立PASS。**TIME_UP tick11856**、人間shot**85**発・原作ownerGrid変化**1025**セル、CPU実SOURCE shot要求**147**・実原作塗装変化**11846**セル。B410後半3実射撃区間は合計**25発**・追加実塗装**121**セル・上段KCC合計**9.51126067830809m**。値はこの成功runのものであり、過去のB410/B411成功runとは数字が異なるのが正常。
- **限定範囲の重要な区別：** B412は原作右上段の実`OWN`インクで泳いだことを証明したが、事前に照準した**特定の120秒セル [12.8131,4.502,50.5300] そのものを踏んだ証明ではない**。W前進のOWN泳ぎはおよそ [13.38,5.40,45.49] などの既存原作OWNパッチで成立している。最近塗ったセルまで正しく誘導できたという主張は禁止。次の機能は実カメラ・原作インク所有の両方に基づく自然な移動／インク補給・射撃の一連の本物の操作を優先し、単なる距離QAの連発は避ける。
- 先行 [B412初回FAIL #41635951998](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41635951998) とその再現原因（長い帰路KeyS操作で真の原作足元/状態ゲートHOLD）は**当該SHAの失敗履歴として保存**し、今回のPASSを過去実行に遡及させない。

**未成立の重要項目：** 人間→CPUの実HP命中/撃破、真の150tick復活、自然対岸Recast到達（0/12）、公式Scoreable0のためナワバリ得点/勝敗NONE、原作Ver.7.2.0 FloorLine00衝突フラグ、正式4v4/ART/production。保護main・正式QA・Draft PR#5・Pagesは不変。次はロードマップF3の**人間による実射撃→本物のインク消費／OWN床での補給→人間の実射撃復帰を一つの可操作な試合で統合**する方向を優先候補とし、HP自然遭遇が成立するならそちらを優先。B412と同じChromeを毎回無駄に再試験しない。
