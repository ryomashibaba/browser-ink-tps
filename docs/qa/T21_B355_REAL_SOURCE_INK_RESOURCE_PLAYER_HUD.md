# B355 — SOURCE原作上の本物の射撃 → インク消費 → 自然回復 → PLAYER HUD

**真正Chromium実測完了：2026-10-31 JST**。開発ブランチ `dev/t21-f4e103w-qa-infra`、検証対象SHA `bb315a220a4a7b8486001dcd064c471f9d942921`。全ゲームの認証ではなく限定技術認証。

## 実装

既存 `UndertowF3PlayableHud` にSOURCE専用インク表示を統合。以前から実装済みの `PlayerResources` と `B76HumanSourceCoach` の真正値を再利用し、回復ロック、通常HUMAN回復、実際のSQUID_OWN回復、低インク、実空撃ちを分離。新しい独立ロジック `B355OriginalSourceInkReadout` は read-only、原作SOURCE 25/17/26/0＋180秒QA＋ `t21W10B355=realInkHud` の明示opt-inのみ。回復・発射・弾薬・被弾や弾丸のゲームロジックには変更なし。QAパネルの既存B76表示と矛盾しない。

## 一次実測（GitHub Actions）

[修正後の真正CI #41078648178](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41078648178) = **SUCCESS**、B349とB353/B354/B355独立監査まで同一真正Chromiumで成功。

| 検証 | 実測 |
| --- | --- |
| インク・発射終了直後 | 90.5（100を上限とする資源） |
| 自然回復後 | 98.5 |
| 経過真正Tick | 66 |
| 回復中の人間ショット増加 | 0（10→10） |
| PLAYER read-only 表示 | `HUMAN_REFILL` |
| 現実の物理発射とExit | 10／10 |
| B354地上・空中 | 4／6 |
| W実移動 | 2.6477m |
| 原作Paintable着弾 | 10 |
| 人間の真正塗装変化イベント | 449 |
| 真正敵CPU HP減少 / 追加命中エフェクト | 0／0（HOLD） |

B355独立監査: `PASS_NATIVE_CONSUMPTION_STOPPED_SHOOTER_REFILL_AND_HUD`。これらは公式インク倍率/回復スピードの原作値検証ではなく、今ある独自調整をもとにした実ゲーム物理・HUDの一致を意味する。

## 失敗と修正

初回HEAD `4b61d6f` の各CIで型検査TS2322失敗。偽Scoreable値を投入して拒否動作を試すテストに、TypeScriptが型リテラル0に1を代入することを禁止していた。修正 `bb315a2` で**負のテスト内だけ**入力を明示キャスト。Scoreableを増やしたり型の本番契約を弱めたりしていない。B349修正後の全検証はSUCCESS。

原作にない敵・床・NavLink、偽のインク・HP・弾・時計・スコアは追加していない。対岸自然敵経路0/12／Scoreable 0／ART／原作のブキ一致／正式4v4／本番公開はHOLD。
