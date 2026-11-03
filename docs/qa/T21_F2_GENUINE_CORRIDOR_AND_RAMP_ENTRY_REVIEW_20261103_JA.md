# F2 実Chromium 2026-11-03 の限定証拠、B316 standalone改善（隔離研究）

QA HEAD: `8c104658a1842218bdfeff07792b3ab35576a0c4`。全ジョブSUCCESSと個別原作物理PASSは別。

- [B312 #41571706814](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706814)：実Humanの元SOURCE2面目以降への原作着弾。B315の3独立面も限定PASS。
- [B316 standalone #41571706735](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706735)：**HOLD_NO_PHYSICAL_ORIGINAL_RAMP_WALK**。原作B271の最寄りセル狙い、KeyW4実入力、最終支持なし。CI成功はこの結果をPASSにしない。
- [B318 #41571706726](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706726)：原作4頂点ランプ内側を狙った真正CDP短押し、ランプ実足元到達、水平1.486m。**GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS**。
- [B322 #41571706674](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706674)：B316約1.562m、B320上り約0.214m、B321高所上り約0.546m、B322原作右上段出口 `UndertowT21D:right-low-team-a` 到達、B324原作上段2.080m、B326追加3.120m、合計約5.200m**局所連続原作KCC PASS**。対岸までの接続ではない。
- [B162 #41571706724](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706724)：本物のALLY_SYNC 2試行CLEAR。1回目716native ticks / Human ink 808 cells / A1 tagged ink40、2回目642tick / Human ink613 / A1 tagged ink56。
- [B328 #41571706714](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706714)：**HOLD**、実A1物理接近歩行 `realSupportedCloserSteps:0`、開始ギャップ約2.118m。
- [B139 #41571706707](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41571706707)：今回確認時点でPending、実際のPASSなし。

新しいB316研究変更：B316 standaloneの実CDP向け幾何ガイドを、成功したB318/B322と同じ**不変の4頂点原作SOURCE ramp内点**へ統一（推測床ではない）。旧500ms間隔の実キー保持は狭い足元を踏み外すため、既存の真正native短KeyW（35ms監視、要求4tick）に変更。既存の厳格 `auditB316RealMovement` を変更せず、実Rapier支持なしの入力はHOLD。B318独自認証は別ゲート。研究だけで真正再実行未実施。

変更禁止：原作25 solids/17 paint/26 links/0 scoreable、自然敵陣0/12、main/T20/QA HEAD/Draft PR#5/Pages、ART/正式4v4/production HOLD。原作未認証幾何・HP・Tick・得点の追加禁止。