# B388 真正SOURCE PLAYERの床警告を現在の物理状態に統合

2026-11-01 JST。B387真正Chromium #41266517150 の実画像を精査。原作右上段の本物のRapier床に接地しSOURCE局所3/3を達成した後も、B112の歴史的suspicionCountが残るため画面中央に「POSSIBLE UNSUPPORTED DESCENT」が表示され続けた。さらに、元RampのXZ四角形外でも実の原作右上段に接地できているのに、「VERIFY ACTUAL FLOOR」が重複していた。

改良：B384/PLAYERでは実KCC未接地、元sourceSolid支持なし、連続未支持8 native ticks以上、最後の真正落下疑義から90 native ticks以内に限り中央警告。実KCC接地後には歴史的疑義から警告を再表示しない。B209 ADJACENT_TO_ORIGINAL_RAMPの表示は、元Team A右上段の登録済みRapier床に真のKCC接地がありB186真正3/3成立済みのときのみ省略する。B129/実際の近端警告、B209 CRITICAL/NEAR警告、F8 QA累積証拠、原作床・Actor・native時計・HP・インク・勝敗の動作は一切変更しない。

単体試験はPLAYER接地/現在落下/QA過去証拠を分離し、既存のB385真正Chromiumで原作実3/3後のPLAYER画面を実DOM照合する。新CI前はB388真正PASS未認証。原作25/17/26/0、自然敵経路0/12、正式4v4・ART・公開本番HOLDは継続。main、凍結T19C/T20、PR #5、Pagesは変更しない。
