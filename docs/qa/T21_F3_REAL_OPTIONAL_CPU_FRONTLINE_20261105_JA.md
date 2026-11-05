# T21 F3 — SOURCE PLAYにCPU原本前線移動研究を任意追加（2026-11-05）

固定F1〜F5/Fast Trackを維持。原作25 solids/17 PaintSurfaces/26 NavLinks/0 Scoreable、対岸自然経路0/12、公式Winner NONE、T21 activationReady=false、正式4v4/Art/production HOLD。

## 既存実機能力を実プレイへ
- [B441真正Chromium #41968288158](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41968288158) SUCCESS。CPU前線ゴールは本当の原作Rapier/Recast連続支持経路を毎回検査し、不許可時は元FIXED巡回へfallback。A3向け別試験 [B448 #41968288079](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41968288079) SUCCESS。ただしどちらも自然な対岸突破・実HP命中や正式勝敗は未証明。
- SOURCE PLAYの既存3モードのURL・ボタンは保持し、既存の「戦闘研究モード」カード内に別の明示的な**CPU前線行動を試す**リンクを追加。選択は本物のユーザー操作で新規同一origin世界を起動する。
- 追加研究URLは従来B207 combat+full180sのまま、既存 strict `t21W10B441=sourceFrontline`, `t21W10B448=realA3Front` の2個だけを加える。デフォルト巡回やCPU・原本・経路審査のコードは変更しない。原本A1と敵陣の間をワープ/架空橋で結ぶことはない。
- SOURCE URLは `SourcePlayPortal.ts` が同一origin・SOURCE fullRound・Scoreable0前提・攻撃/QA入力の注入なしを保障。通常3モードは完全不変更。既存SourcePlayPortal.unitとB441真正ChromiumのSOURCEポータルに新リンクを含めて検証する。
- オプションを押した本物のSOURCE 180秒対CPUプレイ自体は新たな実Chromium証拠が出るまで未認証。B441/B448既存研究試験のPASSを正式交戦PASSと混同しない。

main、T19C/T20、正式QA、Draft PR#5、Pages、原作資料を保護。Work/Computer Use・追加有料APIなし。新規CIなし。

## 追加の本物Chrome検査
既存B441で1600×900の4リンクを実DOMで視認し、SOURCE PLAYからCPU前線任意ボタンを本物のCDPクリック。新WebGL2ゲームのREADYへ到達したら、原本25/17/26/0・実CPU7・非得点・B192 Human Combat・B441厳格FRONT・B448実A3原本足再監査フラグを取得する。**この起動が成功しても180秒の自然敵命中と公式4v4は主張しない**。直後に別新世界で元B441 720tick CPU/足物理を独立検証。新規CIなし。
