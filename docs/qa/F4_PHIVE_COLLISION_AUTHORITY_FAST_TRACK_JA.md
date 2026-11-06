# Browser Ink TPS — F4 Phive原作衝突権限の実物照合経路（2026-11-06）

## この工程の目的

最重要の遮断要因は、A/Bが同じ原作ステージ上で真正な射撃・HP・撃破・復活を経験できる**自然な通行経路が未認証**であること。B488真正RAWは `25/17/26/0`、16件の敵味方経路照合で承認0、原作対岸に必要な8つの局所ギャップも未解決。過去の負傷CPU退避・HUD・A1の小改善をここで繰り返しても、この根本条件は変わらない。

## 重要な新しい原本の候補

- 任天堂のVer.7.2.0更新履歴は、**マテガイ放水路の全モードで地形変更**を明記（https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Game-Updates/Splatoon-3-Update-History-2358763.html）。バージョン・ルール違いのファイルで通行を承認しない。
- `nvnprogram/PhiveConverter` (https://github.com/nvnprogram/PhiveConverter) はSplatoon 3の `.bphsh` 衝突ファイルから `.obj` 衝突メッシュと `.json` マテリアル情報を出力でき、`col_disable_flags` も保存する。先代FiveX自身がPhiveConverterへの移行を案内している（https://github.com/nvnprogram/FiveX）。**古いSplatoon 1のKCL説明をSplatoon 3の正式衝突根拠として流用しない。**
- **未取得・未認証**：本プロジェクトが検証すべきVer.7.2.0ナワバリ版`Fld_Temple01`に対応する原作ゲーム衝突バイナリ、データ取得時点とモード、ゲーム内での当該Faceの衝突レイヤー権限。`Vss_Temple01.obj`表示モデルの正しいSHAだけでは証明できない。

## 本バッチの具体的実装

`scripts/f4_phive_original_collision_probe.py` は、既存B239の**原本SHA256固定・左右各2枚のFloorLine00候補**と、*別途正当に入手・版を検証できた場合のみ*、PhiveConverterから得られる衝突OBJおよびマテリアルJSONを比較する。可視原本/衝突原本のバイナリはリポジトリにアップロードしない。

- B239正本のハッシュ・Face番号・4三角形・25/17/26/0を厳格確認する。少しでも違えば停止。
- B238の既存座標変換とその逆の両座標を別々に評価し、同じ場所にある「候補床衝突三角形」について原本面の内側4点の高さを照合する。**座標変換一致がゲーム内衝突権限ではない。**
- 衝突マテリアルの`mat_flags`と`col_disable_flags`を**生の情報として保存**するだけで、プレイヤー衝突可・歩行可とは自動判定しない。`NoHit`/`Ground`などの意味の誤読を避ける。
- どの結果でも `runtimePromotionAuthorized=false`、`officialScoreable=0`、`naturalCrossTeamRoutesCertified=0`、判定HOLD。**偽の床、NavLink、ワープ、Actor/HP/得点の追加・変更はない**。これは閲覧/解析専用。

## 運用・無駄の削減

初期の既存B239データのみでは本スクリプトを呼び出す意味はない。新しい正本衝突データなしに、同条件の探索や長いChromium CIを何度も繰り返さない。データが手に入るまでF4「SOURCE_COLLISION_AUTHORITY_HOLD」を維持し、独立した実プレイ工程だけを進める。対象コマンドは次（現時点では**実行条件の入力ファイルが未取得**）：

```bash
python scripts/f4_phive_original_collision_probe.py \
  --b239 PRIVATE_B239_NUMERIC_REPORT.json \
  --phive-obj PRIVATE_V720_TURF_COLLISION_EXPORTED.obj \
  --phive-materials PRIVATE_V720_TURF_COLLISION_EXPORTED.json \
  --output PRIVATE_F4_PHIVE_REPORT.json
```

**安全な承認のために別途必要な根拠**：Ver.7.2.0ナワバリ・同一Stageデータ出典確定 → 実際のPlayer/CPU衝突フラグ確認 → 原作0.30m CPU半径RecastとRapier全身連続接地 → 同じ真正CPU/人間の相手陣営への到達と射撃・HP実測。**短い局所衝突候補の一致では4v4を完成認定しない。**

main・T19C/T20・原本・Pages・Draft PR #5・正式QAは不変更。F1〜F5とFast Trackは固定。Work/Computer Use・追加課金なし。
