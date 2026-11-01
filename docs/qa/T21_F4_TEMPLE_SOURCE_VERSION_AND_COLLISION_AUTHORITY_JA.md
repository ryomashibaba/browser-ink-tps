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

さらに `stages/Vss_Temple01/Vss_Temple01.obj` の公開Git LFS pointerを直接確認したところ、`oid sha256:a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046` / `size 43263289` と一致する。既存B239の外部元OBJ SHA/sizeの同一性は**独立のGitオブジェクト指紋でも裏付けられる**が、LFS pointerには抽出時のゲーム版・モード・個別Faceの衝突フラグはない（https://github.com/kirakira-dev/KiTrix/blob/main/stages/Vss_Temple01/Vss_Temple01.obj）。

## 3. 承認禁止条件と次の最短実証

**まだ分からないこと：** (a) このOBJが7.2.0レギュラーマッチの地形版と一致するか、(b) `Fld_Temple01_FloorLine00`がゲーム本体で実際に当たり判定ありの通行面か、(c) 本物のCPU半径0.30m・カプセルで全区間が連続支持・接敵できるか。

**最短の証拠：** 当該OBJの抽出時バージョン／modeと、7.2.0ナワバリ版の元ソースを同じ座標系で照合し、特に中央壁欠け・トンネル・ガラス・右低地の元Faceを原作由来と証明する。次に原作の衝突フラグと実CPU同一Body/実Recast安全幅を独立に証明。原作物理25/17/26/0は検証中に変更せず、QA31-solidのFloorLine00は昇格しない。

無理な地形補完、架空NavLink、半径0 Recast、Player/CPUワープ、版が不明のOBJによる置換、形式上のスコア・勝者付与は禁止。実F3人間＋CPU7の180秒SOURCEプレイは並行継続。**自然対岸経路0/12、公式得点・ART・正式4v4・本番公開HOLD**。

## 検証の意味

本書は**資料比較の結論**であり、OBJの版を確認した検査PASSでも、CPU航行経路の物理認定でもない。KiTrix上の名前の矛盾を解消しても、7.2.0版と当たり判定の検証は未解決のまま。


## 4. バージョン別SceneInfoで改修ステージIDを独立照合（2026-11-01）

GitHub公開データ [Leanny/splat3](https://github.com/Leanny/splat3) の
`data/mush/<version>/SceneInfo.json` をバージョン別に読み、単なるファンWikiの内部名ではなく
`__RowId` と `PreloadResources` を比較した。

| 資料版 | Versus行の原文Label / __RowId / PreloadResources | 読めること |
| --- | --- | --- |
| 700 | マテガイ放水路 / `Vss_Temple00` / `Model/Fld_Temple00.bfres` | 旧版IDがある |
| 710 | マテガイ放水路 / `Vss_Temple00` / `Model/Fld_Temple00.bfres` | 旧版IDが継続 |
| 720 | マテガイ放水路（改修後） / `Vss_Temple01` / `Model/Fld_Temple01.bfres` | 改修後IDが追加 |
| 800 | マテガイ放水路（改修後） / `Vss_Temple01` / `Model/Fld_Temple01.bfres` | 改修後IDが維持 |

直接参照：
[700](https://github.com/Leanny/splat3/blob/main/data/mush/700/SceneInfo.json) /
[710](https://github.com/Leanny/splat3/blob/main/data/mush/710/SceneInfo.json) /
[720](https://github.com/Leanny/splat3/blob/main/data/mush/720/SceneInfo.json) /
[800](https://github.com/Leanny/splat3/blob/main/data/mush/800/SceneInfo.json)。

**新しく裏付けられたこと：** 公開されているバージョン別SceneInfoの720行で、
`Vss_Temple01` は明示的に「マテガイ放水路（改修後）」のVersusシーンIDである。
従来のKiTrixビューアの表示名テーブルがこれをCamp Triggerfishとする記述と衝突するが、
この版別の原文行はT21で採用しているTemple01命名を強く支持する。

**証明されていないこと：** (1) KiTrix `Vss_Temple01.obj` がSceneInfoの
`Fld_Temple01.bfres` と同じ幾何・版・モードで抽出されたこと、
(2) `FloorLine00` のゲーム内衝突有効フラグ、
(3) 0.30m CPU半径の連続Recast/Rapier移動、
(4) 25 solid/17 PaintSurface/26 NavLinks/0 Scoreableの変更権限。
SceneInfoの行が読めることと、原作メッシュ/コリジョンを認証することは異なる。

補助証拠として [Splatoon-3-Map-Editorの`Fld_Temple01` Actorクラス](https://github.com/OctoSquiddy/Splatoon-3-Map-Editor/blob/main/Plugins/SampleMapEditor/FileData/StageLayout/Common/Mu/ActorClasses/Fld_Temple01.cs)
にはBYML Actor定義および`IsEventOnly`パラメータが実装されている。
**これは特定のFloorLine00 Faceがゲーム内で支持判定を持つ証拠ではない。**
また、Splatoon初代向けKCL改造チュートリアルをSplatoon 3の実際の
衝突バイナリ形式の立証へ流用しない。

**次のF4 SOURCE_AUTHORITYゲート：**
1. 正当に入手できる同一版の改修後`Fld_Temple01`レンダーメッシュと当該OBJを頂点/面ごとに比較する。先に7.2.0 Turfのルール/ステージ選択を確定する。
2. それとは独立に、ゲーム内のcollision mesh/actor collision属性を出典・バージョン・対応Face付きで得る。`FloorLine00`視覚マテリアル名のみでは接地面に昇格させない。
3. 認証済み原作支持面についてだけ、実CPU半径0.30m、全身カプセル連続接地、Recast通路幅、実8Actor自然移動を同一世界で検証する。
4. 以上の原作証拠が揃わなければ局所的にHOLDし、別系統のF1/F3実プレイ改善を継続する。仮設床/架空NavLink/半径0/ワープ/偽スコアは作らない。

今回の更新は**版別Source IDの証拠改善のみ**で、ゲーム本体の物理、nav、描画、score、敵陣ルート0/12、正式4v4、公開/mergeの判定には一切変更を与えない。
