# Contrast baseline before the polish pass (2026-11-14)

Output of node scripts/dashboards-check.mjs on main 9136aab. 25 of 38 pass; these 13 fail only on low contrast. Fix every line during the polish pass.

```
✖ veil-rooms
  [1440 /dashboards/veil-rooms/] low contrast 3.66:1 (needs 4.5) "Front door" 12px, text rgb(91, 156, 240) on ~rgb(48, 65, 91) at x794 y555
  [1440 /dashboards/veil-rooms/] low contrast 3.34:1 (needs 4.5) "Temp" 12px, text rgb(126, 134, 148) on ~rgb(49, 53, 64) at x1152 y240
  [1440 /dashboards/veil-rooms/] low contrast 3.34:1 (needs 4.5) "Bright" 12px, text rgb(126, 134, 148) on ~rgb(49, 53, 64) at x1152 y314
  [1440 /dashboards/veil-rooms/] low contrast 3.64:1 (needs 4.5) "Temp" 12px, text rgb(126, 134, 148) on ~rgb(44, 47, 57) at x1300 y240
  [1440 /dashboards/veil-rooms/] low contrast 3.64:1 (needs 4.5) "Bright" 12px, text rgb(126, 134, 148) on ~rgb(44, 47, 57) at x1300 y314
  [375 /dashboards/veil-rooms/] low contrast 3.67:1 (needs 4.5) "Front door" 12px, text rgb(91, 156, 240) on ~rgb(48, 65, 91) at x41 y1477
  [375 /dashboards/veil-rooms/] low contrast 3.34:1 (needs 4.5) "Temp" 12px, text rgb(126, 134, 148) on ~rgb(49, 53, 64) at x31 y1875
  [375 /dashboards/veil-rooms/] low contrast 3.34:1 (needs 4.5) "Bright" 12px, text rgb(126, 134, 148) on ~rgb(49, 53, 64) at x31 y1949
  [375 /dashboards/veil-rooms/] low contrast 3.64:1 (needs 4.5) "Temp" 12px, text rgb(126, 134, 148) on ~rgb(44, 47, 57) at x31 y2171
  [375 /dashboards/veil-rooms/] low contrast 3.64:1 (needs 4.5) "Bright" 12px, text rgb(126, 134, 148) on ~rgb(44, 47, 57) at x31 y2245
  [1440 /dashboards/veil-rooms/?variant=mist] low contrast 3.77:1 (needs 4.5) "Front door" 12px, text rgb(106, 168, 239) on ~rgb(52, 72, 96) at x794 y555
  [1440 /dashboards/veil-rooms/?variant=mist] low contrast 3.21:1 (needs 4.5) "Temp" 12px, text rgb(126, 140, 156) on ~rgb(49, 61, 77) at x1152 y240
  [1440 /dashboards/veil-rooms/?variant=mist] low contrast 3.21:1 (needs 4.5) "Bright" 12px, text rgb(126, 140, 156) on ~rgb(49, 61, 77) at x1152 y314
  [1440 /dashboards/veil-rooms/?variant=mist] low contrast 3.52:1 (needs 4.5) "Temp" 12px, text rgb(126, 140, 156) on ~rgb(44, 55, 69) at x1300 y240
  [1440 /dashboards/veil-rooms/?variant=mist] low contrast 3.52:1 (needs 4.5) "Bright" 12px, text rgb(126, 140, 156) on ~rgb(44, 55, 69) at x1300 y314
✖ atrium-living
  [1440 /dashboards/atrium-living/] low contrast 1.21:1 (needs 4.5) "Atrium Living" 12px, text rgb(63, 81, 92) on ~rgb(41, 100, 96) at x96 y22
  [1440 /dashboards/atrium-living/] low contrast 2.55:1 (large, needs 3) "Living Room" 28px, text rgb(15, 28, 36) on ~rgb(41, 100, 96) at x96 y45
  [1440 /dashboards/atrium-living/] low contrast 3.10:1 (needs 4.5) "Online" 13px, text rgb(31, 107, 58) on ~rgb(158, 184, 183) at x1353 y123
  [1440 /dashboards/atrium-living/] low contrast 3.90:1 (needs 4.5) "Locked" 13px, text rgb(63, 81, 92) on ~rgb(156, 184, 178) at x1350 y607
  [1440 /dashboards/atrium-living/] low contrast 1.26:1 (needs 4.5) "Sample data · fictional" 12px, text rgb(74, 92, 102) on ~rgb(141, 96, 53) at x693 y1157
  [375 /dashboards/atrium-living/] low contrast 1.11:1 (needs 4.5) "Atrium Living" 12px, text rgb(63, 81, 92) on ~rgb(39, 97, 93) at x12 y80
  [375 /dashboards/atrium-living/] low contrast 2.44:1 (large, needs 3) "Living Room" 24px, text rgb(15, 28, 36) on ~rgb(41, 100, 96) at x12 y103
  [375 /dashboards/atrium-living/] low contrast 1.18:1 (needs 4.5) "Courtyard" 14px, text rgb(63, 81, 92) on ~rgb(158, 185, 183) at x334 y171
  [375 /dashboards/atrium-living/] low contrast 3.10:1 (needs 4.5) "Online" 13px, text rgb(31, 107, 58) on ~rgb(158, 184, 182) at x304 y1196
  [375 /dashboards/atrium-living/] low contrast 1.22:1 (needs 4.5) "Sample data · fictional" 12px, text rgb(74, 92, 102) on ~rgb(136, 95, 52) at x127 y3204
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 1.52:1 (needs 4.5) "Atrium Living" 12px, text rgb(62, 48, 40) on ~rgb(66, 80, 88) at x96 y22
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 2.18:1 (large, needs 3) "Living Room" 28px, text rgb(28, 20, 15) on ~rgb(66, 80, 88) at x96 y45
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 3.72:1 (needs 4.5) "AN" 12px, text rgb(26, 14, 6) on ~rgb(143, 115, 93) at x127 y560
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 3.73:1 (needs 4.5) "JR" 12px, text rgb(26, 14, 6) on ~rgb(141, 114, 93) at x160 y560
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 3.71:1 (needs 4.5) "MK" 12px, text rgb(26, 14, 6) on ~rgb(143, 115, 93) at x190 y560
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 3.75:1 (needs 4.5) "SL" 12px, text rgb(26, 14, 6) on ~rgb(143, 115, 93) at x224 y560
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 3.29:1 (needs 4.5) "Online" 13px, text rgb(42, 90, 52) on ~rgb(166, 167, 165) at x1353 y123
  [1440 /dashboards/atrium-living/?variant=dusk] low contrast 1.46:1 (needs 4.5) "Sample data · fictional" 12px, text rgb(78, 62, 52) on ~rgb(119, 84, 48) at x693 y1157
✖ glacier-ops
  [1440 /dashboards/glacier-ops/] low contrast 1.02:1 (large, needs 3) "1842" 28px, text rgb(215, 244, 255) on ~rgb(150, 197, 219) at x692 y512
  [1440 /dashboards/glacier-ops/] low contrast 2.23:1 (needs 4.5) "m ASL" 12px, text rgb(215, 244, 255) on ~rgb(108, 163, 190) at x700 y547
  [375 /dashboards/glacier-ops/] low contrast 1.00:1 (large, needs 3) "1842" 28px, text rgb(215, 244, 255) on ~rgb(158, 202, 223) at x166 y353
  [375 /dashboards/glacier-ops/] low contrast 2.26:1 (needs 4.5) "m ASL" 12px, text rgb(215, 244, 255) on ~rgb(54, 105, 135) at x172 y380
  [1440 /dashboards/glacier-ops/?variant=cobalt] low contrast 1.00:1 (large, needs 3) "1842" 28px, text rgb(224, 232, 255) on ~rgb(150, 166, 215) at x692 y512
  [1440 /dashboards/glacier-ops/?variant=cobalt] low contrast 2.11:1 (needs 4.5) "m ASL" 12px, text rgb(224, 232, 255) on ~rgb(121, 140, 197) at x700 y547
  [1440 /dashboards/glacier-ops/?variant=night] low contrast 1.00:1 (large, needs 3) "1842" 28px, text rgb(216, 255, 242) on ~rgb(146, 204, 184) at x692 y512
  [1440 /dashboards/glacier-ops/?variant=night] low contrast 2.12:1 (needs 4.5) "m ASL" 12px, text rgb(216, 255, 242) on ~rgb(114, 180, 159) at x700 y547
✖ citadel-wall
  [1440 /dashboards/citadel-wall/] low contrast 3.89:1 (needs 4.5) "Orbital cargo" 12px, text rgb(90, 132, 158) on ~rgb(4, 37, 59) at x732 y738
  [1440 /dashboards/citadel-wall/?variant=ocean] low contrast 3.72:1 (needs 4.5) "Orbital cargo" 12px, text rgb(84, 142, 136) on ~rgb(10, 49, 55) at x732 y738
  [1440 /dashboards/citadel-wall/?variant=ocean] low contrast 3.81:1 (needs 4.5) "Sector lock" 12px, text rgb(84, 142, 136) on ~rgb(9, 46, 54) at x732 y762
  [1440 /dashboards/citadel-wall/?variant=amber] low contrast 3.88:1 (needs 4.5) "Drone latency" 12px, text rgb(154, 120, 80) on ~rgb(42, 27, 7) at x500 y738
  [1440 /dashboards/citadel-wall/?variant=amber] low contrast 3.70:1 (needs 4.5) "Orbital cargo" 12px, text rgb(154, 120, 80) on ~rgb(54, 34, 9) at x732 y738
  [1440 /dashboards/citadel-wall/?variant=amber] low contrast 3.77:1 (needs 4.5) "Sector lock" 12px, text rgb(154, 120, 80) on ~rgb(52, 33, 8) at x732 y762
✖ aether-pane
  [1440 /dashboards/aether-pane/?variant=daylight] low contrast 2.82:1 (needs 4.5) "Sample data · fictional" 12px, text rgb(42, 68, 80) on ~rgb(123, 142, 151) at x660 y812
✖ zest-health
  [375 /dashboards/zest-health/] low contrast 1.02:1 (needs 4.5) "Dec" 12px, text rgba(242, 245, 240, 0.75) on ~rgb(211, 229, 168) at x364 y2129
✖ mauve-ledger
  [1440 /dashboards/mauve-ledger/] low contrast 1.47:1 (needs 4.5) "JO" 12px, text rgb(255, 255, 255) on ~rgb(215, 209, 243) at x1281 y39
  [1440 /dashboards/mauve-ledger/] low contrast 3.71:1 (needs 4.5) "Here’s your ledger for" 15px, text rgb(110, 104, 144) on ~rgb(236, 210, 237) at x104 y152
  [1440 /dashboards/mauve-ledger/] low contrast 3.70:1 (needs 4.5) "Saturday, November 14" 15px, text rgb(110, 104, 144) on ~rgb(239, 210, 237) at x262 y152
  [1440 /dashboards/mauve-ledger/] low contrast 3.70:1 (needs 4.5) "-11%" 12px, text rgb(220, 38, 38) on ~rgb(248, 218, 225) at x272 y385
  [1440 /dashboards/mauve-ledger/] low contrast 2.57:1 (needs 4.5) "+6%" 12px, text rgb(22, 163, 74) on ~rgb(214, 231, 225) at x492 y385
  [1440 /dashboards/mauve-ledger/] low contrast 1.10:1 (needs 4.5) "In progress" 14px, text rgb(255, 255, 255) on ~rgb(243, 244, 253) at x1035 y346
  [1440 /dashboards/mauve-ledger/] low contrast 2.56:1 (needs 4.5) "+5%" 12px, text rgb(22, 163, 74) on ~rgb(212, 231, 225) at x1166 y723
  [1440 /dashboards/mauve-ledger/] low contrast 3.20:1 (needs 4.5) "People" 12px, text rgb(139, 133, 168) on ~rgb(246, 244, 252) at x1035 y832
  [1440 /dashboards/mauve-ledger/] low contrast 3.20:1 (needs 4.5) "New users" 12px, text rgb(139, 133, 168) on ~rgb(246, 244, 252) at x1257 y832
  [1440 /dashboards/mauve-ledger/] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1166 y1106
  [1440 /dashboards/mauve-ledger/] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1174 y1254
  [1440 /dashboards/mauve-ledger/] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1162 y1328
  [1440 /dashboards/mauve-ledger/] low contrast 2.15:1 (needs 4.5) "Sample data · fictional company " 12px, text rgb(139, 133, 168) on ~rgb(211, 202, 245) at x600 y1406
  [375 /dashboards/mauve-ledger/] low contrast 3.69:1 (needs 4.5) "HR and payroll" 13px, text rgb(110, 104, 144) on ~rgb(242, 244, 253) at x307 y88
  [375 /dashboards/mauve-ledger/] low contrast 1.47:1 (needs 4.5) "JO" 12px, text rgb(255, 255, 255) on ~rgb(215, 209, 243) at x306 y26
  [375 /dashboards/mauve-ledger/] low contrast 3.70:1 (needs 4.5) "Here’s your ledger for" 15px, text rgb(110, 104, 144) on ~rgb(232, 211, 239) at x14 y190
  [375 /dashboards/mauve-ledger/] low contrast 3.66:1 (needs 4.5) "Saturday, November 14" 15px, text rgb(110, 104, 144) on ~rgb(216, 215, 245) at x172 y190
  [375 /dashboards/mauve-ledger/] low contrast 3.69:1 (needs 4.5) "-11%" 12px, text rgb(220, 38, 38) on ~rgb(243, 219, 226) at x182 y789
  [375 /dashboards/mauve-ledger/] low contrast 2.56:1 (needs 4.5) "+6%" 12px, text rgb(22, 163, 74) on ~rgb(212, 231, 225) at x189 y832
  [375 /dashboards/mauve-ledger/] low contrast 1.09:1 (needs 4.5) "In progress" 14px, text rgb(255, 255, 255) on ~rgb(246, 244, 252) at x33 y1183
  [375 /dashboards/mauve-ledger/] low contrast 2.48:1 (needs 4.5) "+5%" 12px, text rgb(22, 163, 74) on ~rgb(209, 227, 227) at x177 y1560
  [375 /dashboards/mauve-ledger/] low contrast 3.18:1 (needs 4.5) "People" 12px, text rgb(139, 133, 168) on ~rgb(246, 243, 252) at x33 y1669
  [375 /dashboards/mauve-ledger/] low contrast 3.16:1 (needs 4.5) "New users" 12px, text rgb(139, 133, 168) on ~rgb(245, 243, 252) at x282 y1669
  [375 /dashboards/mauve-ledger/] low contrast 2.22:1 (needs 4.5) "Sample data · fictional company " 12px, text rgb(139, 133, 168) on ~rgb(211, 201, 244) at x67 y2243
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 1.58:1 (needs 4.5) "JO" 12px, text rgb(255, 255, 255) on ~rgb(229, 197, 217) at x1281 y39
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.72:1 (needs 4.5) "Here’s your ledger for" 15px, text rgb(110, 104, 144) on ~rgb(249, 209, 218) at x104 y152
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.74:1 (needs 4.5) "Saturday, November 14" 15px, text rgb(110, 104, 144) on ~rgb(248, 209, 220) at x262 y152
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.71:1 (needs 4.5) "-11%" 12px, text rgb(220, 38, 38) on ~rgb(250, 218, 220) at x272 y385
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 2.58:1 (needs 4.5) "+6%" 12px, text rgb(22, 163, 74) on ~rgb(218, 231, 221) at x492 y385
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 1.08:1 (needs 4.5) "In progress" 14px, text rgb(255, 255, 255) on ~rgb(251, 244, 250) at x1035 y346
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 2.58:1 (needs 4.5) "+5%" 12px, text rgb(22, 163, 74) on ~rgb(217, 231, 222) at x1166 y723
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.23:1 (needs 4.5) "People" 12px, text rgb(139, 133, 168) on ~rgb(252, 244, 248) at x1035 y832
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.23:1 (needs 4.5) "New users" 12px, text rgb(139, 133, 168) on ~rgb(252, 244, 248) at x1257 y832
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1166 y1106
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1174 y1254
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 3.36:1 (needs 4.5) "Pending" 14px, text rgb(139, 133, 168) on ~rgb(251, 250, 255) at x1162 y1328
  [1440 /dashboards/mauve-ledger/?variant=blush] low contrast 2.22:1 (needs 4.5) "Sample data · fictional company " 12px, text rgb(139, 133, 168) on ~rgb(244, 195, 220) at x600 y1406
  [1440 /dashboards/mauve-ledger/?variant=slate] low contrast 1.53:1 (needs 4.5) "JO" 12px, text rgb(255, 255, 255) on ~rgb(206, 206, 242) at x1281 y39
  [1440 /dashboards/mauve-ledger/?variant=slate] low contrast 3.88:1 (needs 4.5) "Here’s your ledger for" 15px, text rgb(92, 102, 133) on ~rgb(204, 212, 248) at x104 y152
  [1440 /dashboards/mauve-ledger/?variant=slate] low contrast 3.89:1 (needs 4.5) "Saturday, November 14" 15px, text rgb(92, 102, 133) on ~rgb(205, 213, 246) at x262 y152
✖ tidebath-showroom
  [1440 /dashboards/tidebath-showroom/] low contrast 3.83:1 (needs 4.5) "Look closer" 12px, text rgb(44, 51, 61) on ~rgb(254, 254, 254) at x661 y342
  [1440 /dashboards/tidebath-showroom/] low contrast 3.89:1 (needs 4.5) "Download PDF" 14px, text rgb(47, 111, 237) on ~rgb(237, 239, 242) at x427 y836
  [1440 /dashboards/tidebath-showroom/?variant=mist] low contrast 3.60:1 (needs 4.5) "showroom" 12px, text rgb(116, 136, 132) on ~rgb(248, 251, 250) at x684 y87
  [1440 /dashboards/tidebath-showroom/?variant=mist] low contrast 3.23:1 (needs 4.5) "Find us on" 12px, text rgb(116, 136, 132) on ~rgb(231, 241, 239) at x116 y781
  [1440 /dashboards/tidebath-showroom/?variant=mist] low contrast 3.19:1 (needs 4.5) "Sample data · fictional brand an" 12px, text rgb(116, 136, 132) on ~rgb(229, 240, 238) at x610 y1063
  [1440 /dashboards/tidebath-showroom/?variant=dusk] low contrast 3.64:1 (needs 4.5) "Find us on" 12px, text rgb(134, 117, 100) on ~rgb(240, 232, 224) at x116 y781
  [1440 /dashboards/tidebath-showroom/?variant=dusk] low contrast 3.58:1 (needs 4.5) "Sample data · fictional brand an" 12px, text rgb(134, 117, 100) on ~rgb(239, 231, 221) at x610 y1063
✖ copper-radar
  [1440 /dashboards/copper-radar/] low contrast 3.64:1 (needs 4.5) "1" 14px, text rgb(220, 38, 38) on ~rgb(249, 216, 216) at x82 y362
  [1440 /dashboards/copper-radar/] low contrast 2.14:1 (needs 4.5) "CobaltGate" 12px, text rgb(28, 35, 43) on ~rgb(255, 255, 255) at x431 y352
  [1440 /dashboards/copper-radar/] low contrast 3.09:1 (needs 4.5) "M" 12px, text rgb(28, 35, 43) on ~rgb(253, 232, 214) at x582 y318
  [1440 /dashboards/copper-radar/] low contrast 2.28:1 (needs 4.5) "MapleDNS" 12px, text rgb(28, 35, 43) on ~rgb(255, 255, 255) at x605 y318
  [1440 /dashboards/copper-radar/] low contrast 2.39:1 (needs 4.5) "HarborMesh" 12px, text rgb(28, 35, 43) on ~rgb(201, 203, 205) at x785 y275
  [1440 /dashboards/copper-radar/] low contrast 2.95:1 (needs 4.5) "QuillAuth" 12px, text rgb(28, 35, 43) on ~rgb(170, 173, 176) at x831 y410
  [1440 /dashboards/copper-radar/] low contrast 3.43:1 (needs 4.5) "View Timeline" 14px, text rgb(255, 255, 255) on ~rgb(202, 100, 30) at x1242 y965
  [375 /dashboards/copper-radar/] low contrast 3.64:1 (needs 4.5) "1" 14px, text rgb(220, 38, 38) on ~rgb(249, 216, 216) at x52 y414
  [375 /dashboards/copper-radar/] low contrast 1.93:1 (needs 4.5) "N" 12px, text rgb(28, 35, 43) on ~rgb(139, 59, 13) at x118 y889
  [375 /dashboards/copper-radar/] low contrast 2.06:1 (needs 4.5) "NimbusID" 12px, text rgb(28, 35, 43) on ~rgb(140, 59, 13) at x127 y889
  [375 /dashboards/copper-radar/] low contrast 3.53:1 (needs 4.5) "RidgeHost" 12px, text rgb(28, 35, 43) on ~rgb(255, 255, 255) at x92 y824
  [375 /dashboards/copper-radar/] low contrast 3.28:1 (needs 4.5) "C" 12px, text rgb(28, 35, 43) on ~rgb(230, 197, 174) at x76 y725
  [375 /dashboards/copper-radar/] low contrast 3.47:1 (needs 4.5) "CobaltGate" 12px, text rgb(28, 35, 43) on ~rgb(215, 216, 217) at x85 y725
  [375 /dashboards/copper-radar/] low contrast 3.26:1 (needs 4.5) "MapleDNS" 12px, text rgb(28, 35, 43) on ~rgb(255, 255, 255) at x154 y711
  [375 /dashboards/copper-radar/] low contrast 3.33:1 (needs 4.5) "H" 12px, text rgb(28, 35, 43) on ~rgb(213, 170, 142) at x216 y694
  [375 /dashboards/copper-radar/] low contrast 3.46:1 (needs 4.5) "HarborMesh" 12px, text rgb(28, 35, 43) on ~rgb(181, 183, 186) at x225 y694
  [375 /dashboards/copper-radar/] low contrast 2.83:1 (needs 4.5) "QuillAuth" 12px, text rgb(28, 35, 43) on ~rgb(226, 227, 228) at x243 y748
  [375 /dashboards/copper-radar/] low contrast 3.71:1 (needs 4.5) "View Timeline" 14px, text rgb(255, 255, 255) on ~rgb(207, 106, 35) at x128 y2494
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 3.64:1 (needs 4.5) "1" 14px, text rgb(220, 38, 38) on ~rgb(249, 216, 216) at x82 y362
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 2.59:1 (needs 4.5) "C" 12px, text rgb(23, 32, 51) on ~rgb(217, 228, 242) at x409 y352
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.34:1 (needs 4.5) "CobaltGate" 12px, text rgb(23, 32, 51) on ~rgb(255, 255, 255) at x431 y352
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.42:1 (needs 4.5) "M" 12px, text rgb(23, 32, 51) on ~rgb(217, 228, 242) at x582 y318
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.09:1 (needs 4.5) "MapleDNS" 12px, text rgb(23, 32, 51) on ~rgb(255, 255, 255) at x605 y318
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.42:1 (needs 4.5) "H" 12px, text rgb(23, 32, 51) on ~rgb(217, 228, 242) at x762 y275
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.25:1 (needs 4.5) "HarborMesh" 12px, text rgb(23, 32, 51) on ~rgb(255, 255, 255) at x785 y275
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 1.42:1 (needs 4.5) "Q" 12px, text rgb(23, 32, 51) on ~rgb(217, 228, 242) at x808 y410
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 2.04:1 (needs 4.5) "QuillAuth" 12px, text rgb(23, 32, 51) on ~rgb(255, 255, 255) at x831 y410
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 2.30:1 (needs 4.5) "M" 12px, text rgb(23, 32, 51) on ~rgb(255, 255, 255) at x723 y297
  [1440 /dashboards/copper-radar/?variant=slate] low contrast 3.25:1 (needs 4.5) "C" 12px, text rgb(23, 32, 51) on ~rgb(249, 250, 251) at x862 y309
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 3.64:1 (needs 4.5) "1" 14px, text rgb(220, 38, 38) on ~rgb(249, 216, 216) at x82 y362
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 2.78:1 (needs 4.5) "C" 12px, text rgb(42, 24, 20) on ~rgb(250, 222, 222) at x409 y352
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.33:1 (needs 4.5) "CobaltGate" 12px, text rgb(42, 24, 20) on ~rgb(255, 255, 255) at x431 y352
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.69:1 (needs 4.5) "M" 12px, text rgb(42, 24, 20) on ~rgb(250, 222, 222) at x582 y318
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.09:1 (needs 4.5) "MapleDNS" 12px, text rgb(42, 24, 20) on ~rgb(255, 255, 255) at x605 y318
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.69:1 (needs 4.5) "H" 12px, text rgb(42, 24, 20) on ~rgb(250, 222, 222) at x762 y275
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.24:1 (needs 4.5) "HarborMesh" 12px, text rgb(42, 24, 20) on ~rgb(255, 255, 255) at x785 y275
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 1.69:1 (needs 4.5) "Q" 12px, text rgb(42, 24, 20) on ~rgb(250, 222, 222) at x808 y410
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 2.04:1 (needs 4.5) "QuillAuth" 12px, text rgb(42, 24, 20) on ~rgb(255, 255, 255) at x831 y410
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 2.62:1 (needs 4.5) "M" 12px, text rgb(42, 24, 20) on ~rgb(255, 255, 255) at x723 y297
  [1440 /dashboards/copper-radar/?variant=ember] low contrast 3.25:1 (needs 4.5) "C" 12px, text rgb(42, 24, 20) on ~rgb(253, 247, 247) at x862 y309
✖ orbit-clay
  [1440 /dashboards/orbit-clay/] low contrast 2.18:1 (needs 4.5) "Sample data · fictional · Orbit " 12px, text rgb(92, 116, 104) on ~rgb(31, 57, 45) at x631 y873
  [375 /dashboards/orbit-clay/] low contrast 2.13:1 (needs 4.5) "Sample data · fictional · Orbit " 12px, text rgb(92, 116, 104) on ~rgb(194, 166, 128) at x98 y1592
  [1440 /dashboards/orbit-clay/?variant=moss] low contrast 2.27:1 (needs 4.5) "Sample data · fictional · Orbit " 12px, text rgb(81, 104, 92) on ~rgb(168, 184, 154) at x631 y873
✖ saffron-dusk
  [1440 /dashboards/saffron-dusk/] low contrast 3.10:1 (needs 4.5) "Today" 12px, text rgb(196, 120, 58) on ~rgb(240, 245, 241) at x360 y812
  [1440 /dashboards/saffron-dusk/] low contrast 1.65:1 (needs 4.5) "We" 12px, text color(srgb 0.101961 0.0784314 0.0470588 / 0.8) on ~rgb(199, 124, 60) at x1098 y544
  [375 /dashboards/saffron-dusk/] low contrast 3.12:1 (needs 4.5) "Today" 12px, text rgb(196, 120, 58) on ~rgb(240, 245, 241) at x53 y822
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 1.67:1 (needs 4.5) "Iftar at Cedar House" 16px, text rgb(244, 255, 252) on ~rgb(219, 182, 140) at x344 y695
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 1.52:1 (needs 4.5) "6:00 PM" 13px, text color(srgb 0.956863 1 0.988235 / 0.78) on ~rgb(224, 191, 151) at x344 y723
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 3.22:1 (needs 4.5) "MN" 14px, text rgb(244, 255, 252) on ~rgb(146, 140, 100) at x631 y708
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 3.29:1 (needs 4.5) "NE" 16px, text rgb(244, 255, 252) on ~rgb(130, 136, 101) at x792 y228
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.50:1 (needs 4.5) "Daily progress" 13px, text rgb(244, 255, 252) on ~rgb(206, 153, 89) at x820 y430
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.29:1 (needs 4.5) "Th" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(197, 143, 79) at x789 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.36:1 (needs 4.5) "Fr" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(194, 140, 76) at x842 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.44:1 (needs 4.5) "Sa" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(191, 137, 73) at x893 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.53:1 (needs 4.5) "Su" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(188, 134, 70) at x945 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.61:1 (needs 4.5) "Mo" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(185, 130, 66) at x995 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.72:1 (needs 4.5) "Tu" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(181, 126, 62) at x1049 y544
  [1440 /dashboards/saffron-dusk/?variant=dawn] low contrast 2.82:1 (needs 4.5) "We" 12px, text color(srgb 0.956863 1 0.988235 / 0.8) on ~rgb(178, 122, 58) at x1098 y544
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.32:1 (needs 4.5) "8" 15px, text rgb(194, 184, 168) on ~rgb(112, 120, 115) at x347 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.29:1 (needs 4.5) "10" 15px, text rgb(194, 184, 168) on ~rgb(112, 120, 115) at x448 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.26:1 (needs 4.5) "11" 15px, text rgb(194, 184, 168) on ~rgb(113, 122, 117) at x502 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.21:1 (needs 4.5) "12" 15px, text rgb(194, 184, 168) on ~rgb(113, 123, 118) at x553 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.21:1 (needs 4.5) "13" 15px, text rgb(194, 184, 168) on ~rgb(113, 124, 119) at x604 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 2.21:1 (needs 4.5) "14" 15px, text rgb(194, 184, 168) on ~rgb(113, 124, 119) at x656 y215
  [1440 /dashboards/saffron-dusk/?variant=night] low contrast 1.02:1 (needs 4.5) "We" 12px, text color(srgb 0.101961 0.0784314 0.0470588 / 0.8) on ~rgb(198, 123, 60) at x1098 y544
✖ clima-pane
  [1440 /dashboards/clima-pane/] low contrast 2.70:1 (needs 4.5) "NV" 13px, text rgb(255, 255, 255) on ~rgb(171, 151, 144) at x1387 y33
  [375 /dashboards/clima-pane/] low contrast 2.87:1 (needs 4.5) "NV" 13px, text rgb(255, 255, 255) on ~rgb(175, 147, 133) at x330 y104
  [1440 /dashboards/clima-pane/?variant=sky] low contrast 3.62:1 (needs 4.5) "Climate Control" 13px, text rgb(74, 92, 104) on ~rgb(140, 193, 234) at x152 y48
  [1440 /dashboards/clima-pane/?variant=sky] low contrast 2.72:1 (needs 4.5) "NV" 13px, text rgb(255, 255, 255) on ~rgb(71, 161, 207) at x1387 y33
  [1440 /dashboards/clima-pane/?variant=dusk] low contrast 3.65:1 (needs 4.5) "NV" 13px, text rgb(255, 255, 255) on ~rgb(167, 122, 114) at x1387 y33
✖ cortex-well
  [1440 /dashboards/cortex-well/] low contrast 2.95:1 (needs 4.5) "AV" 13px, text rgb(255, 255, 255) on ~rgb(181, 126, 185) at x1381 y36
  [1440 /dashboards/cortex-well/] low contrast 3.12:1 (needs 4.5) "Rising" 12px, text rgb(42, 143, 122) on ~rgb(213, 232, 235) at x395 y245
  [1440 /dashboards/cortex-well/] low contrast 3.47:1 (needs 4.5) "Sample data · fictional · not me" 12px, text rgb(125, 115, 140) on ~rgb(232, 223, 245) at x632 y863
  [375 /dashboards/cortex-well/] low contrast 2.99:1 (needs 4.5) "AV" 13px, text rgb(255, 255, 255) on ~rgb(182, 127, 186) at x328 y153
  [375 /dashboards/cortex-well/] low contrast 3.07:1 (needs 4.5) "Rising" 12px, text rgb(42, 143, 122) on ~rgb(216, 230, 232) at x295 y751
  [375 /dashboards/cortex-well/] low contrast 3.47:1 (needs 4.5) "Sample data · fictional · not me" 12px, text rgb(125, 115, 140) on ~rgb(232, 223, 245) at x67 y2032
  [1440 /dashboards/cortex-well/?variant=rose] low contrast 2.82:1 (needs 4.5) "AV" 13px, text rgb(255, 255, 255) on ~rgb(213, 122, 157) at x1381 y36
  [1440 /dashboards/cortex-well/?variant=rose] low contrast 2.98:1 (needs 4.5) "Rising" 12px, text rgb(42, 143, 122) on ~rgb(216, 226, 227) at x395 y245
  [1440 /dashboards/cortex-well/?variant=rose] low contrast 3.45:1 (needs 4.5) "Sample data · fictional · not me" 12px, text rgb(125, 115, 140) on ~rgb(243, 220, 232) at x632 y863
```
