# T21 Undertow — Phase12P 原本OBJ接合・距離分布の独立証拠ゲート

## 目的と厳格な境界

Phase12OのWebGL2左右拡大比較は、原本RIM/BANDの視覚的な存在を確認しただけであり、実物理接続の証拠ではない。Phase12Pは元OBJの Face ID / 頂点ID / XYZ に基づき、見た目の接触と**原本頂点ID共有**を区別する、ゲーム非干渉の診断である。三角形、OBJ頂点、Stage、Render-root、paint/collision/nav/CPU/scoringの**追加・変更は一切しない**。

- 原本: `Vss_Temple01.obj`、43,263,289バイト、SHA256 `a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046`。
- pin: Phase12Jの44候補/972元source triangles + 独立42-point-XZ QA、および I/K/L/M の byte-exact packed source data。
- 現在 opt-in: I6+K4+L4+M8 = 22 original components / 488 original source triangles。通常124 source displayと64 source-walk、frozen 42-point XZ は変更しない。
- Phase12Jで未表示28候補（616原本三角形）はHOLD。Phase12Pの接触判定で表示承認しない。
- PR #5はDraft/unmergedを維持。本番はT20 `inkworks-junction`、T21 `activationReady=false`、Visual Freeze未承認。

## 独立QAの演算内容

`scripts/UndertowSpillwayPhase12POriginalContactQa.test.ts` は同じ側のMの各rim/band(8部品)からI/K/L/Mに対する80組（自己比較・反対側は除外）を評価する。原本メッシュは一切変更せず、各組について次を記録する。

1. **同一 original OBJ vertex ID** の共有数。三角形の同一OBJ ID 2点による**原本共有辺**の数を別記する。位置が一致するだけではID共有とみなさない。
2. 真の3D最近接三角形距離：全頂点→相手三角形、全辺のsegment→segment、線分による三角形面内交差を評価する。XZ平面の見かけ距離を代用しない。最短の元Face IDペア、法線のなす角、最接近原本頂点間距離を残す。
3. `SHARED_ORIGINAL_OBJ_EDGE` / `SHARED_ORIGINAL_OBJ_VERTEX_ONLY` / `GEOMETRIC_CONTACT_UNWELDED_ORIGINAL_IDS` / `SEPARATED_SOURCE_SURFACES` に分類する。**いずれも物理weldの認定ではない**。
4. 同一IDの座標整合、488原本Face ID重複なし、Phase12J 44候補JSONからK/L/M 16部品のFace ID/OBJ ID/**IEEE754 Float64完全一致**、T20/T21/64/42 freezeを検証する。

事前オフライン照合（引継ぎZIP内Phase12J同一原本JSON、M対K/L/Mの56組）では、**共有OBJ頂点ID 0組・原本共有辺0組・幾何学的距離約0の組が28組**。ただしIの6柱はPhase12Jの候補JSONには含まれず、GitHub QAで新たにその6部品を対象に追加する。上記の28件は**物理接続・床・実際の衝突の証明ではない**。CI実測の数値が揃うまで、追加24組の結果は未確定。

## CI成果物と判定

PR用のbuildワークフロー内で、Phase12J源JSONの生成と独立QAの後にPhase12Pを実行する。
`T21_PHASE12P_REPORT=/tmp/t21-phase12p-original-contact-audit.json` に80組全記録を出力し、GitHub Actions artifact `t21-undertow-phase12p-source-only-original-contact-audit` として保存する。型検査/全Unit/従来本物WebGL2通常5方向とPhase12O拡大比較は従来どおり実施。

ただし、**CI SUCCESSもStageの物理weld・可歩行床・collider・nav・paint・runtimeの許可ではない**。今回追加はsource-only「原本接触状況の計測」だけ。今後そのようなゲーム内権限を追加するには、新しい独立根拠と別ゲートが必要。
