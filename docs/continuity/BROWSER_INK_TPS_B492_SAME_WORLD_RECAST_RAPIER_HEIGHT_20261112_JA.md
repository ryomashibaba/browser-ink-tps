# B492 — 同一真正Chromium世界：Recast高さとRapier接地の相違（読み取り専用）

- 対象：GitHub Actions #43140584988、SHA `05c7938a05eb9e67d0e08183c2d00adec42e5c9d` の証拠ZIP。元のSOURCE構成 25/17/26/0。脚色したCPU座標・当たり判定・追加地形なし。
- B450でB2/B4それぞれ30件、計60件の候補経路が最初に `NATIVE_PATH_RAPIER_HEIGHT_MISMATCH` で停止。**60件すべてで既存の `first-drop-landing-negative-z` が実Rapierの最初の接地床**。B2の隙間 0.253846～0.285714m、B4は0.251899～0.287500m。
- B454の実60Hz記録：各768フレーム、全て登録済みRapier接地面あり。各764フレームが静的0.25m条件内、各4フレームだけ右低ルート坂上端で0.25m超。
- 拒否されたRecastサンプルのXZから実CPUの足までB2=0.029336m、B4=0.009640m。実CPUの床との差はいずれも0.100m、Recast側はそれぞれ0.266667m、0.253061m。**同一ブラウザ世界だが、同じnative tickで同じ経路を通過したという証明ではない**。
- 現段階の結論：少なくともローカルの一部は「原作床が存在しない」と断定できず、Recastの経路Yと実Rapier/KCC足元の不一致が具体的に存在する。中央部を横断できるとは証明しない。
- **依然HOLD**：相手側への16経路は0/16。原作7.2.0の面単位衝突フラグ、連続したカプセル掃引、中央の実通路、得点、勝敗、ART、公開は未承認。
- 次の有効作業：既存のB2/B4の本物の60Hz足経路に沿って、局所的なlanding→rampのフルサイズカプセル・Recast経路Y・Rapier支持面を三者照合する。ルート認証の閾値0.25mは変更しない。無根拠なオフメッシュリンクや歩行床を追加しない。

独立計算：`node scripts/t21-b492-source-height-isolation.mjs <evidence_directory> <output_json>`。必要RAWは B450、B454フルレート、B454独立監査、B487、B488。`node --test scripts/t21-b492-source-height-isolation.test.mjs` で安全条件を検査。
