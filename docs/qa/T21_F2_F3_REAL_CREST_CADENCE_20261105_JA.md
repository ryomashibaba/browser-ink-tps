# T21 — 原作坂頂点KCCの実CDP短パルス開始位置修正（2026-11-05）

原本F1〜F5/Fast TrackのF2/F3。研究branchのみ。

- [B413 Run #41950597184](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41950597184) FAILUREと[RAW #13380308657](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41950597184/artifacts/13380308657)を直接照合。SOURCE原作坂の実KCCは進行率 .6874319565→.7668967229（本物KeyW 2tick指示・6 native tick経過）→.8825227374（本物KeyW 2tick・10 native tick経過）→.9749939322（KeyW 1tick・6 native tick経過、原作正規上段床へ本物の接触）。
- 独立B322の要件は真の坂支持3区間以上・原作坂v>=.90・元初期足から上昇>=.32m・独立した原作上段床接触。3区間目は原本坂でもv=.8825、高さ増加.3130m、閾値未達。4区間目は上段床を正規接触していたが、前のcrest証拠がないためFAILは正しい。
- 旧v>=.78からfine KeyW(1tick指示/8ms観測)へ移行する条件ではv=.7669で粗い入力が続き、一度にnative10 tick動いた。原作Rapier/17 PaintSurface/KCC/非書換を確認した実坂上だけ**v>=.74**から細かい入力に移ることで、中間の本物の坂頂点を採録しやすくする。元の3区間/高さ/.90/上段床という独立監査はそのまま。早めの入力観測は原作道路・Collider/CPU/ownerGrid/時計に書かない。
- 既存B322 NodeテストにRAW実vと偽証拠を拒否する条件を追加。追加CIレーンなし。現HEADの真正B413結果が終わるまで2試合180秒/自然4v4/ART/本番はHOLD。
- main・T19C/T20・原本/正式QA・Draft PR #5・Pages保護、Work/Computer Use事前承認、追加有料APIなし。
