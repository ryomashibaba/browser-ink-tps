# W10-B133 — B132 native-browser evidence guard correction

Date: 2026-10-23 JST. QA branch only.

B132 real Chrome CI #39956783046 failed BEFORE Chromium during the pure
Node audit: negative test proved an untrusted source-authority sample could
be included in matched evidence even though overall verdict was FAIL.
2/3 tests passed, one failed; no actual original edge HUD live evidence
has yet been produced or verified at this SHA.

B133 changes per-sample evidence classification: each admitted witness
MUST have original authority [25,17,26,0], production=false, unlimited
4v4 certified=false and native stop=null as well as actual KCC grounding,
original Rapier support and aligned native in-browser HUD. A corrupt
sample continues to reject the entire run even when an earlier sample is
valid. Negative and regression tests now verify source lists and matches.

This edit only updates the source/DOM evidence gate and tests. It reruns
B132 native WebGL2 + real keyboard source movement by the existing workflow.
Visual PASS requires real native JSON and complete CI success, not this
commit or pure tests. No source geometry / Rapier / player movement / CPU /
NavLink / Turf score or original gameplay authorization altered.
