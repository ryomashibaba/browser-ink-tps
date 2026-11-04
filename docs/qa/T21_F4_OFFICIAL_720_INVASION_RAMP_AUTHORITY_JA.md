# T21 F4 — 原作の侵入用スロープ：Ver.2.0.0追加とVer.7.2.0全面改修を区別

**2026-11-04 JST・公式一次資料を再照合し訂正。** 旧版の本資料は敵陣侵入ランプ追加をVer.7.2.0に誤帰属していた。公式ページの版見出しまで照合し、正しくは **Ver.2.0.0（2022年11月30日）** と確認した。旧記述を撤回する。

## 任天堂公式に書かれた正しい版の違い

- **Ver.2.0.0（2022-11-30）**：マテガイ放水路の **Turf War / ナワバリバトル** 地形の一部を変更。開始地点から見た右側の地形一部を撤去し、敵陣へ侵入するスロープを追加した。
- **Ver.7.2.0（2024-04-18）**：マテガイ放水路の **全ルール** で地形を改修した。公式7.2.0節は侵入用ランプの新規追加を明記していない。
- 正式一次情報：[Nintendo UK Splatoon 3 Update History](https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Game-Updates/Splatoon-3-Update-History-2358763.html)。同ページの見出し『Ver.2.0.0』と『Ver.7.2.0』を必ず独立に読むこと。

## SOURCEの既存事実と未認証事項

- 版別SceneInfoの720版で『Vss_Temple01 / Model/Fld_Temple01.bfres』が改修後のマテガイ放水路Versusシーン名と確認済み。ただしKiTrixのOBJが7.2.0 Turfの元データそのものであるという原本幾何／モード／ゲーム衝突の証明はない。詳細：[版と衝突権限の監査](T21_F4_TEMPLE_SOURCE_VERSION_AND_COLLISION_AUTHORITY_JA.md)。
- src/stage/undertow/UndertowSpillwayRouteRampGeometry.ts の FloorConcrete03 右低地スロープは原作メッシュ由来・鏡像ソース三角形／塗装根拠がある。ただし2.0.0で追加された敵陣侵入用スロープと同じFaceとは未認証。自動的に正式4v4経路として扱わない。
- src/stage/undertow/UndertowSpillwayUnderpassRouteGeometry.ts の元OBJ由来5要素/片側の試行でも約31.716mのendpoint gapが残った。架空の橋やNavLinkで埋めない。
- B441研究用のSOURCE前線巡回は登録済み原作右低地の内側を候補とし、RapierとRecastが支持・経路を確認した場合のみ目標にする。**敵陣横断、新規スロープ導入、正式4v4の解禁ではない。** [真正短時間 #41829596416](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41829596416) で原作目標6件・実native要求28件・7CPU前進を確認、詳細は [B441真正結果](T21_B441_REAL_CPU_FRONTLINE_RESULT_20261104_JA.md)。ただし7.2.0横断・自然交戦はHOLD。

## 次の承認ゲート

1. 同じナワバリルールで2.0.0前後の追加侵入地点を特定し、7.2.0改修後にその経路がどこに位置するかを正規モデル・Face・Actorへ対応づける。
2. 正規レンダーメッシュとは別に、衝突メッシュ／衝突有効フラグをバージョンと面ID付きで確認する。出典不明のままでは不明・HOLD。
3. 既存CPU半径0.30m、物理カプセル、全経路の連続Rapier接地とRecast/Crowd到達を実測する。
4. 正規証拠と追加承認が揃うまで、SOURCE 25 solids / 17 PaintSurfaces / 26 NavLinks / 0 scoreable、公式winner NONE、自然敵陣横断 0/12、ART/production/正式4v4 HOLDを厳守する。

人工床、透明足場、仮設NavLink、敵や本人のActorワープ、偽の時計やスコアや勝者は作らない。B438の連続2試合180秒・再戦後本人移動の真正PASSは独立した実績として保存する。
