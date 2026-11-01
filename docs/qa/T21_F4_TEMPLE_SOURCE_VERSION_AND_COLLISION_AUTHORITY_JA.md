# T21 F4 — Vss_Temple01 原作ステージ対応・7.2.0版・ゲーム衝突権限の独立ゲート

**調査日 2026-11-01 JST**。本記録は原作 SOURCE_AUTHORITY の誤認を防ぐもの。原作地形変更や正式4v4解禁ではない。

## 1. ステージ表示名の矛盾を整理

- KiTrix `KiTrix/SceneKit/StageLoader.swift` の `stageNameMap` は Undertow Spillway -> `Vss_Nagasaki03`、Camp Triggerfish -> `Vss_Temple01` と記載。これは**KiTrixのビューア内で使われるローカル表示名テーブル**であり、任天堂のゲームステージ識別・衝突面一覧を保証するものではない。コード: https://github.com/kirakira-dev/KiTrix/blob/main/KiTrix/SceneKit/StageLoader.swift
- 独立のInkipediaは **Undertow Spillway（マテガイ放水路）の内部名「Temple」** と **Camp Triggerfish（モンガラキャンプ場）の内部名「Athletic」** を別々に記録。資料: https://splatoonwiki.org/wiki/Undertow_Spillway#Internal_names ・ https://splatoonwiki.org/wiki/Camp_Triggerfish#Internal_names
- 以上により「`Vss_Temple01`という文字列が存在するからモンガラキャンプ場の地形だ」と判断して、本T21の元OBJ・25 registered solidsを破棄／別OBJで置換するのは**不適切**。今回の矛盾はKiTrixのビューア表示名テーブルの信頼性が低い証拠であり、形状そのものが違うステージだという証拠ではない。`Nagasaki03`の実際のステージ名は**この調査だけでは未認証**。

## 2. 7.2.0ナワバリの**版**と**ゲーム内衝突**は別問題

- 原作 Ver.7.2.0 はマテガイ放水路の全モードで地形を変更し、中央壁の一部撤去、狙撃場所の下側トンネル追加、右降下のガラス、上り坂などが追加・変更された（https://splatoonwiki.org/wiki/Undertow_Spillway#Version_7.2.0_onwards）。旧版・他モードのOBJを7.2.0ナワバリとして利用してはいけない。
- 現行B238〜B370はKiTrix `stages/Vss_Temple01/Vss_Temple01.obj` 全体の **43,263,289 bytes** / SHA-256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046` を真正DL照合し、個別FloorLine00原作FaceとRapierの**QA条件付き歩行**を証明した。ただし、SHAとFace一致だけでは**元抽出時点のゲームバージョン・ルール別地形・任天堂公式の衝突有効フラグ**は導出不能。
- KiTrix当該OBJ・`StageLoader.swift` のGitHub履歴は共に `2026-04-04` の初期投入のみ。これは**レポジトリへ収録した日付**であって、元のゲームデータのVer.7.2.0との一致証明にはならない。コミット参照: https://github.com/kirakira-dev/KiTrix/commit/7b5a393766c5551aee063256ede95df44da9183e
- KiTrix `StageCollider.swift` はロードされたSceneKitの表示用stageノードへ `hitTestWithSegment` を行う汎用**ビューア内ヒットテスト**であり、任天堂の公式衝突対象フラグやマッチ用Rapier登録権限を示す原作データではない。コード: https://github.com/kirakira-dev/KiTrix/blob/main/KiTrix/SceneKit/StageCollider.swift

## 3. 承認禁止条件と次の最短実証

**まだ分からないこと：** (a) このOBJが7.2.0レギュラーマッチの地形版と一致するか、(b) `Fld_Temple01_FloorLine00`がゲーム本体で実際に当たり判定ありの通行面か、(c) 本物のCPU半径0.30m・カプセルで全区間が連続支持・接敵できるか。

**最短の証拠：** 当該OBJの抽出時バージョン／modeと、7.2.0ナワバリ版の元ソースを同じ座標系で照合し、特に中央壁欠け・トンネル・ガラス・右低地の元Faceを原作由来と証明する。次に原作の衝突フラグと実CPU同一Body/実Recast安全幅を独立に証明。原作物理25/17/26/0は検証中に変更せず、QA31-solidのFloorLine00は昇格しない。

無理な地形補完、架空NavLink、半径0 Recast、Player/CPUワープ、版が不明のOBJによる置換、形式上のスコア・勝者付与は禁止。実F3人間＋CPU7の180秒SOURCEプレイは並行継続。**自然対岸経路0/12、公式得点・ART・正式4v4・本番公開HOLD**。

## 検証の意味

本書は**資料比較の結論**であり、OBJの版を確認した検査PASSでも、CPU航行経路の物理認定でもない。KiTrix上の名前の矛盾を解消しても、7.2.0版と当たり判定の検証は未解決のまま。
