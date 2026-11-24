# T21 V28 — 720武器実装用の独立準備物（2026-11-24）
Windows最新版へのパッチではない。ゲーム本体を変更しない受け渡し専用。reference720.json は版固定データから選んだ生値で、正式な武器対応や世界スケールを認定しない。

次バッチ：Metro Roller / Dash Brush。スプラローラーは横12+1、縦1+2+2、パブロは2+1。横振りは横方向と手前の異速グループ、縦振りは奥・中・手前の異なる軌道。足元飛沫・壁落下・時間減衰を単一地面ファンで置き換えない。パブロは交互の振りと連打/長押し移行を別にする。raw SwingFrame と実連射間隔は同一とは限らない。省略された初期値は別途既存資料で照合。

contactSweep.ts は純粋な接地候補サンプリングの補助実装。実KCC移動・物理接触の証拠は呼出側必須。probe は各候補に対しRapier支持・遮蔽・武器接触幅・実登録セルを判定し、失敗はnullを返す。F4で既存の塗装ラスタを使い、許可セルだけへ反映すること。返却点を無条件の大きな楕円に変換してはいけない。現行APIの方が適切なら既存関数へ同じ考え方を適用し、ファイルを無理に追加しない。サンプル上限を超える場合は分割するか当該処理を安全に拒否。インクの消費補間は原作内部式の証明ではなく候補。塗り接触幅のスケールは既存F4校正と比較して決定。

旧GitHub研究版では ProjectileSystem.updateRoller / rollerFlick / updateBrush / executeCpuRollerFlick / executeCpuRollerRoll / executeCpuBrushSwipe と CpuAgentSystem の行動選択・PlayerController の実KCC補正後移動が主な接続点。最新版はWindowsで確認すること。既存PaintCoordinator・GameplayInk/GPUを維持し、正式SOURCE 25/17/26/0を変更しない。

テストはリポジトリ外の隔離ディレクトリで実施。tsc --strict --target ES2022 --module commonjs --outDir build contactSweep.ts && node --test contactSweep.test.cjs。純粋関数の試験のみ。実機結果を示すものではない。

Windows正本は別途ユーザーのWork指示で指定する。GitHub研究ブランチをcheckout、pull、mergeしてWindows正本を上書きしない。受け渡しディレクトリだけを読み取り取得する。5武器の既存F4改良とCPU戦闘、地形・塗装改善を保全する。既存Vitest失敗8件はベースラインとして照合。原本、PRIVATE素材、正式QA、main、stable、PR、Pagesの変更禁止。今回の受け渡しはゲーム本体進捗0。

参照: https://github.com/Leanny/splat3/tree/main/data/parameter/720/weapon ; https://wikiwiki.jp/splatoon3mix/システム詳細仕様 ; https://wikiwiki.jp/splatoon3mix/ブキ/スプラローラー ; https://wikiwiki.jp/splatoon3mix/ブキ/パブロ ; https://voidbits.ink/voiddocs/docs/==%20Reference%20==/Internal%20Weapon%20Names/
