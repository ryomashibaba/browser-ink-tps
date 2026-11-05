# T21 F3 — 原作OWNインク真回復100%時の実証（2026-11-05）

[B413 Run #41986047285](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41986047285) FAILUREの[原本RAW #13396636729](https://github.com/ryomashibaba/browser-ink-tps/actions/runs/41986047285/artifacts/13396636729)を直接取得・検査。

原作上段 `right-low-team-a` に本物のSquidがSHIFT_ONLYで接地し、実インク量はtick6652→6658→6664→6670→6676に **88.95→92.35→95.75→99.15→100**。全サンプルSOURCE原本足Gap≈.025m・OWN/SQUID_OWN、7CPUでno actor writes。更に12 native tick静止し、インク100を維持（真の物理上限）。旧B412は最後の12tickでさらに0.25以上増えることを要求して誤HOLD。B312原本三面・B322登頂・実上段射撃はPASS。

今回B412は通常の未満タン増分条件を保持。唯一満タン状態のときのみ、以前の真のSHIFT_ONLY連続OWN/SQUID_OWN実時刻・原作同一footの支持・無書換・CPU7・元shot数・インク増加から100への到達・12tickの継続を厳密に検査する。無履歴の100、原作未登録・偽所有・インク書換は必ず拒否する。独立B413の真正OWN連続サンプル増分条件は不変更。新SHAの真正Chromiumで完走するまでB412正式PASS未認証。

同一コミットで、ユーザー可視B464のVitest TypeScript型だけ修正（stopReason型とnoUncheckedIndexedAccess）。F1〜F5維持、source25/17/26/0、自然対岸0/12、公式Winner NONE、正式4v4/ART/production HOLD、main・QA/T19C/T20/Pages・PR#5保護、Work/Computer Use事前承認。
