# T21 F4 — 任天堂公式7.2.0ナワバリ侵入用スロープとSOURCEの対応ゲート

**調査日：2026-11-04。これは原作地形の承認ではなく、一次資料に基づく調査対象の優先順位です。**

## 任天堂の一次資料が明記していること

任天堂公式 [英国版 Splatoon 3 Update History](https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Game-Updates/Splatoon-3-Update-History-2358763.html) の Ver.7.2.0（2024-04-18）には、Undertow Spillway（マテガイ放水路）で全モードの地形が変更され、さらに **Turf War（ナワバリバトル）では開始位置から見た右側の地形の一部を除去し、敵側に侵入できるようスロープを追加した**と明記されている。米任天堂 [Ver.7.2.0更新履歴](https://en-americas-support.nintendo.com/app/answers/detail/a_id/61257/) も全モードの地形変更を明記。

このため「現行の左右陣営に原作通行可能な道がなくて当然」「唯一の道は中央アンダーパスである」という仮説は**公式のTurf版仕様と整合しない可能性がある**。ただし公式文面に座標や衝突面IDはなく、上記スロープと現行プロジェクトのどの面が一致するかは未認証。

## 既存の確定物との峻別

- [版別SceneInfoの公知情報](T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)：720以降の改修ステージIDは `Vss_Temple01` / `Model/Fld_Temple01.bfres`。ただしKiTrix `Vss_Temple01.obj` が当該モデルから同一モードで抽出されたことや衝突データ一致は未認証。
- `src/stage/undertow/UndertowSpillwayRouteRampGeometry.ts`： `Fld_Temple01_pCube21569_1__FloorConcrete03` の二組の鏡像原作2三角形スロープを元OBJとTurf図面から確認済み。既存の**右低地の段差**であり、少なくとも表示上は横断する敵陣侵入路とは未同定。これを任天堂の追加スロープと同一視しない。
- `src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry.ts` の5 source components/片側はCI #691試験でも endpoint error **31.716m**、真Recast到達FAIL。これを架空リンクで接続しない。

## 次の最短の実装判定

1. Ver.7.2.0 **Turf War** の場面（右側変更点・追加スロープ・中央壁・ガラス）を元OBJの物体名・面/座標へ対応させ、**旧版や他モードの混入を排除**。
2. 見た目のBFRES/OBJとは独立した**ゲーム本体の衝突メッシュ/通行属性**を合法的・検証可能な出典から確認し、どの面が歩行・イカ移動をサポートするか特定。
3. その面だけで、既存の半径0.30m CPUカプセルに安全な幅、原作Rapier連続接地、実Recast/Crowd到達、全8人間/CPU Actorを単一の真正時計で実証。初めて試験目的のSOURCE登録変更を別途判断。
4. 認証が揃うまでは正式4v4 / 0 scoreable / winner NONE / NATURAL CROSS-TEAM 0/12 を維持。

**この文書はSOURCEの solids 25 / paint 17 / links 26 / scoreable 0 の変更を許可しない。** 人工床、透明橋、仮設NavLink、Actor位置書込み、反則的な得点・勝者の合成は禁止。B430で認証された2回の真正180秒PASSは別の実績として維持する。

## 待たずに進める別系統のF3実装

B440はB419再戦後と同じSOURCEクエリで**新規の真正Chromium**を起動し、7CPUの物理合流→本人CDP KeyW→元SOURCEの本物のKCC足と位置変化を照合する最大15分の**短い検査**。これで失敗箇所を切り分けた後に、B438の真の連続2試合へ反映する。B440の単独PASSは再戦ボタン押下や2回180秒を証明しない。