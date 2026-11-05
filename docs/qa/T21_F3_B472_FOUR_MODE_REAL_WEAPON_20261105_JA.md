# T21 F3 B472 — 全4 SOURCEモードの真人間12武器選択（2026-11-05）

## 位置づけと固定方針
F1→F5 / Fast Trackの既定方針を変更しない。今回の変更は、既存のB471プレイ前武器選択を「12武器SOURCEサーキット」だけでなく、原作SOURCE上の通常戦闘、A1協力、任意B441/B448 CPU前線研究でも一貫して選択可能にするプレイヤー向けUX機能。追加地形、ナビリンク、Actor移動、偽CPU/命中/HP、公式スコア・勝敗、時計/ペイント/インクの書き換えを行わない。原作SOURCEは25 Rapier solids / 17 PaintSurfaces / 26 native links / 0 Scoreableのまま。

## 完了実装
- [コードHEAD `88867be1`](https://github.com/ryomashibaba/browser-ink-tps/commit/88867be1e132f3a2a3345cbd64e485355776b049) を研究ブランチに隔離保存（main・PR #5を未変更）。
- `src/app/B389NativeSourceRoundReplay.ts`：既存のB384サーキット選択判定は変更せず、残る3 SOURCEモードは既定パラメータの**完全一致**・既存12武器IDのみの初期選択を許可。未知キー/二重キー/QAフラグ/不一致を拒否。
- `src/app/SourcePlayPortal.ts`：ゲーム用の4つの既存SOURCE URLを安全に再構築し、非既定武器時だけ既存B389初期武器IDを付加。空欄や標準武器は従来URLを不変更。
- `src/source-play-main.ts`：選択した武器を4モード全部のボタンに反映。B471のローカル武器選択保存と不正ID排除は継承。
- `play-source.html`：選択が4モード共通であることを表示。
- `src/app/SourcePlayPortal.test.ts`：既存12武器×4モード、既定URL完全一致、悪意のあるQA/重複キー/不整合の拒否を回帰試験。
- `scripts/t21-b440-short-native-original-foot.mjs`：同じ真正ChromiumでCDPマウス・キーボード選択 → B384実ネイティブ武器 → 画面再訪 → 全4 URL維持 → B441/B448実ネイティブ武器を照合。プレイヤー/CPU/インク/時計/公式得点へのスクリプト書込なし。

## 真正CI結果（同一B472 HEAD）
- [B440 #42038865662](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865662) completed / **SUCCESS**。RAWログ `B440_TRUE_SOURCE_NATIVE_HUMAN_WALK` で `PASS_FRESH_SOURCE_REAL_HUMAN_KEYW_AND_ORIGINAL_FOOT_NOT_REPLAY`。実CDP武器選択 `Ink Saber`、B384実PlayCanvas `b361NativePlayerWeapon.id=ink-saber`、現実のブラウザlocalStorage保存、再訪後の4リンクの同一武器、任意前線モードの本物 `STAGING` の武器IDも `ink-saber` を検証。実7CPU・原作足の0.1517m KeyW移動を確認。
- [B441 #42038865792](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865792) completed / **SUCCESS**。SourcePlayPortal単体とビルド、B440 7CPU実走行、B450/B452/B454独立原作SOURCE足・Recast監査を通過。
- [B448 #42038865783](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42038865783) completed / **SUCCESS**。同じB472 HEADの真正7CPU A3研究実走行を通過。
- 通常戦闘とA1協力については**厳格URLとネイティブ受入判定の回帰試験のみ**。B440が本物の武器起動を証明したのはB384サーキットとB441/B448前線研究の2モードであり、他の2モードも実走行済みとは主張しない。

## B413独立監査・次の本質的障害
- B413旧HEAD `11d03c70` の実2×180秒 [#42025456079](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42025456079) はSUCCESS。原作下段→坂→上段、1試合目実17発、OWNイカ回復 +13.88、実再射撃14発、2試合ともTIME_UPまでの独立証拠あり。
- B470統合HEAD `617f4158` の長時間試験 [#42034952341](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/42034952341) は2026-11-05 22時台（JST）確認時点で進行中。B472の最新HEADに対する2×180秒のSUCCESSと混同しない。
- F4原作衝突・床面とRecastの権限/FloorLine00の物理連続証拠は未確定。自然対岸経路0/12、正式4v4・対戦敵命中・公式Scoreable0/公式勝者NONEのHOLDを維持する。
- 次工程はコードの小さなQA連発ではなく、まず既存RAWから真正自然対敵・原作経路で必要な外部権限や具体的な物理不一致を確定させること。ただし未認証の経路を架空登録したり原作書換で合格にしてはならない。

## 安全
main、原作SOURCE、T19C/T20、Pages、正式QA、Draft PR #5を保持。Work / Computer Useは事前承認制、追加課金0。元の原作床・CPU7・インク経済・物理・180秒・公式スコア0を変更しない。
